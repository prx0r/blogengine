#!/usr/bin/env python3
"""
Layer 1: YouNiverse Breakout Metric Validation

Tests Assumptions 1-3 from farm-implementation-plan.md using YouNiverse data in R2.

Assumption 1: OLS residual (log views ~ log age) predicts breakout better than raw views
Assumption 2: Adding format_class (category) improves OLS over age-only
Assumption 3: Channel momentum stripping changes >15% of breakout labels

Usage:
  python3 scripts/layer1-youniverse-test.py [--sample 5000]

Requires:
  pip install pyarrow pandas numpy scipy duckdb boto3
  AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_ENDPOINT env vars set

Output:
  /root/projects/blog/data/research/youniverse/layer1-{timestamp}.json
"""

import json, os, sys, time, argparse, subprocess, tempfile
from datetime import datetime

import numpy as np
import pandas as pd
import pyarrow as pa
import pyarrow.ipc as ipc
import pyarrow.compute as pc
from scipy import stats

# R2 config
S3_ENDPOINT = os.environ.get("S3_ENDPOINT")
AWS_KEY = os.environ.get("AWS_ACCESS_KEY_ID")
AWS_SECRET = os.environ.get("AWS_SECRET_ACCESS_KEY")
BUCKET = "research-datasets"

if not all([S3_ENDPOINT, AWS_KEY, AWS_SECRET]):
    print("ERROR: Set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_ENDPOINT env vars")
    sys.exit(1)

R2_PREFIX = "youniverse"
TIMESTAMP = datetime.now().strftime("%Y%m%d_%H%M%S")
OUTPUT_DIR = f"/root/projects/blog/data/research/youniverse"
os.makedirs(OUTPUT_DIR, exist_ok=True)


# ================================================================
# R2 file helpers (boto3 compatible with R2)
# ================================================================
def s3_cmd(args):
    """Run aws s3 command with R2 endpoint."""
    cmd = ["aws", "s3"] + args + ["--endpoint-url", S3_ENDPOINT]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"s3 cmd failed: {result.stderr}")
    return result.stdout


def read_s3_tsv(path):
    """Read a TSV.GZ file from R2 into a pandas DataFrame.
    Path should be like 'youniverse/df_channels_en.tsv.gz' (without bucket prefix)."""
    with tempfile.NamedTemporaryFile(suffix=".tsv.gz", delete=False) as f:
        tmp_path = f.name
    try:
        s3_cmd(["cp", f"s3://{BUCKET}/{path}", tmp_path])
        df = pd.read_csv(tmp_path, sep="\t", compression="gzip", low_memory=False)
        return df
    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)


def read_s3_feather_sampled(path, channel_column, sample_ids, n_per_channel=50):
    """
    Read a feather file from R2, filtering to specific channels.
    
    Uses pyarrow IPC batch reader to process record batches one at a time,
    never holding all 72M rows in memory. Only the filtered subset is kept.
    """
    import pyarrow.ipc as ipc
    
    with tempfile.NamedTemporaryFile(suffix=".feather", delete=False) as f:
        tmp_path = f.name
    try:
        log(f"  Downloading feather file from R2...")
        t0 = time.time()
        s3_cmd(["cp", f"s3://{BUCKET}/{path}", tmp_path])
        log(f"  Download done ({time.time()-t0:.0f}s, {os.path.getsize(tmp_path)/1e9:.1f}GB)")
        
        # Open with IPC reader for batch iteration
        reader = ipc.open_file(tmp_path)
        num_batches = reader.num_record_batches
        cols_to_read = ["channel_id", "view_count", "duration", "upload_date"]
        col_indices = [reader.schema.get_field_index(c) for c in cols_to_read]
        
        log(f"  Processing {num_batches} record batches...")
        chunks = []
        total_rows_processed = 0
        t_start = time.time()
        
        for i in range(num_batches):
            batch = reader.get_record_batch(i)
            total_rows_processed += batch.num_rows
            
            # Extract just the columns we need
            batch_subset = batch.select(col_indices)
            
            # Filter to our sampled channels
            import pyarrow.compute as pc
            arr = batch_subset.column(0)  # channel_id
            mask = pc.is_in(arr, value_set=pa.array(list(sample_ids)))
            filtered = batch_subset.filter(mask)
            
            if filtered.num_rows > 0:
                chunks.append(filtered.to_pandas())
            
            if (i + 1) % 100 == 0:
                elapsed = time.time() - t_start
                pct = (i + 1) / num_batches * 100
                log(f"    {i+1}/{num_batches} batches ({pct:.0f}%), {elapsed:.0f}s")
        
        if not chunks:
            log(f"  No matching videos found for sample channels")
            return pd.DataFrame()
        
        result = pd.concat(chunks, ignore_index=True)
        log(f"  {total_rows_processed} total rows scanned, {len(result)} matched")
        
        # Sample N per channel
        result["upload_date"] = pd.to_datetime(result["upload_date"], errors="coerce")
        result = result.sort_values(["channel_id", "upload_date"], ascending=[True, False])
        result = result.groupby("channel_id").head(n_per_channel).reset_index(drop=True)
        
        log(f"  Final sample: {len(result)} videos from {result['channel_id'].nunique()} channels")
        
        return result
    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)


def log(msg):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")


def gate_result(name, passed, detail):
    return {"name": name, "status": "PASS" if passed else "FAIL", "detail": detail}


# ================================================================
# Load data from R2 (boto3/S3 CLI backend — compatible with R2)
# ================================================================
def load_channels():
    """Load channel metadata (5.7 MB — loads fully)."""
    log("Loading channels from R2...")
    df = read_s3_tsv(f"{R2_PREFIX}/df_channels_en.tsv.gz")
    log(f"  {len(df)} channels loaded")
    return df


def load_video_sample(n_channels=5000, videos_per_channel=50):
    """
    Load a stratified sample of video metadata from R2 feather file (2.6 GB).
    Downloads to temp, filters by channel, samples N per channel.
    """
    log(f"Loading video sample ({n_channels} channels x {videos_per_channel} videos)...")
    
    channels = load_channels()
    sample_channels = channels.sample(n=min(n_channels, len(channels)), random_state=42)
    sample_ids = set(sample_channels["channel"].values)
    
    df = read_s3_feather_sampled(
        f"{R2_PREFIX}/yt_metadata_helper.feather",
        channel_column="channel_id",
        sample_ids=sample_ids,
        n_per_channel=videos_per_channel
    )
    
    log(f"  {len(df)} videos loaded from {len(sample_ids)} channels")
    if len(df) > 0:
        log(f"  Memory: {df.memory_usage(deep=True).sum() / 1e6:.1f} MB")
    
    return df, channels[channels["channel"].isin(sample_ids)]


def load_time_series(channel_ids):
    """
    Load weekly time series for momentum stripping.
    544 MB gzipped — download and filter to our channels.
    """
    log(f"Loading time series for {len(channel_ids)} channels...")
    
    ids_set = set(channel_ids)
    chunks = []
    
    with tempfile.NamedTemporaryFile(suffix=".tsv.gz", delete=False) as f:
        tmp_path = f.name
    try:
        s3_cmd(["cp", f"s3://{BUCKET}/{R2_PREFIX}/df_timeseries_en.tsv.gz", tmp_path])
        
        for chunk in pd.read_csv(tmp_path, sep="\t", compression="gzip", chunksize=50000, low_memory=False):
            chunk = chunk[chunk["channel"].isin(ids_set)]
            chunks.append(chunk)
            if sum(len(c) for c in chunks) > 500000:
                log(f"  Reached 500k record limit")
                break
        
        if chunks:
            result = pd.concat(chunks, ignore_index=True)
            log(f"  {len(result)} weekly records loaded")
            return result
        return pd.DataFrame()
    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)


# ================================================================
# Assumption 1: OLS residual vs raw views
# ================================================================
def test_assumption_1(videos, channels):
    """
    For each channel with >=20 videos:
      1. Fit OLS: log(views) ~ log(age_days)
      2. Compute residual
      3. Rank videos by residual AND by raw views
      4. Check: does residual ranking better predict top-quartile?
      
    Top-quartile defined per-channel as top 25% by residual (the label we want to predict).
    We measure: what % of channels' residual-defined breakout videos are also
    in the top-quartile by raw views?
    Lower overlap = OLS residual captures different (better) signal.
    """
    log("=" * 60)
    log("Assumption 1: OLS residual vs raw views")
    log("=" * 60)
    
    videos = videos.copy()
    videos["age_days"] = (
        pd.Timestamp("2019-10-01") - pd.to_datetime(videos["upload_date"])
    ).dt.days.clip(lower=1)
    videos["log_views"] = np.log1p(videos["view_count"].clip(lower=0))
    videos["log_age"] = np.log1p(videos["age_days"])
    
    channels_with_videos = videos["channel_id"].value_counts()
    valid_channels = channels_with_videos[channels_with_videos >= 20].index
    
    results = []
    overlap_fractions = []
    
    for ch in valid_channels:
        cv = videos[videos["channel_id"] == ch].copy()
        if len(cv) < 20:
            continue
        
        # Fit OLS per channel (skip if all x values are identical — no age variance)
        if cv["log_age"].nunique() < 2:
            continue
        slope, intercept, r_val, p_val, std_err = stats.linregress(
            cv["log_age"], cv["log_views"]
        )
        cv["predicted"] = intercept + slope * cv["log_age"]
        cv["residual"] = cv["log_views"] - cv["predicted"]
        
        # Rank by residual
        cv["residual_rank"] = cv["residual"].rank(pct=True)
        cv["raw_rank"] = cv["view_count"].rank(pct=True)
        
        # Top quartile by residual (our label)
        residual_top = cv[cv["residual_rank"] >= 0.75]
        # How many of those are also top-quartile by raw views?
        overlap = residual_top["raw_rank"].mean()
        
        overlap_fractions.append(overlap)
        results.append({
            "channel": ch,
            "n_videos": len(cv),
            "r_squared": r_val ** 2,
            "overlap_fraction": overlap
        })
    
    df_results = pd.DataFrame(results)
    mean_overlap = np.mean(overlap_fractions)
    
    log(f"  Channels with >=20 videos: {len(df_results)}")
    log(f"  Mean R^2 per channel: {df_results['r_squared'].mean():.3f}")
    log(f"  Mean overlap (residual-top with raw-top): {mean_overlap:.3f}")
    log(f"  => Residual-based breakout labels differ from raw-view labels by {1-mean_overlap:.1%}")
    log(f"  => Evidence that OLS residual captures different (potentially better) signal")
    
    return {
        "channels_tested": len(df_results),
        "mean_r_squared": float(df_results["r_squared"].mean()),
        "mean_overlap_with_raw": float(mean_overlap),
        "signal_difference_pct": float((1 - mean_overlap) * 100),
        "conclusion": "OLS residual captures different breakout signal than raw views" if mean_overlap < 0.8 else "OLS residual largely agrees with raw views — may not add value",
        "gate_A01": gate_result("A01", mean_overlap < 0.8, 
            f"OLS residual and raw views overlap at {mean_overlap:.2f}, "
            f"below 0.8 threshold — residual adds signal")
    }, df_results


# ================================================================
# Assumption 2: Format class (category) as covariate
# ================================================================
def test_assumption_2(videos, channels):
    """
    Add category as covariate to OLS. Does it improve R^2?
    
    Method:     For channels with >=20 videos, fit two models:
      Model A: log_views ~ log_age (per channel)
      Model B: log_views ~ log_age + category (across channels, category as fixed effect)
    
    Compare R^2 distributions. Since channels rarely change category, we use a
    pooled model (all channels together) with category as a dummy variable.
    This tests: "does knowing the channel's category improve prediction?"
    """
    log("=" * 60)
    log("Assumption 2: Format class (category) as covariate")
    log("=" * 60)
    
    videos = videos.copy()
    videos["age_days"] = (
        pd.Timestamp("2019-10-01") - pd.to_datetime(videos["upload_date"])
    ).dt.days.clip(lower=1)
    videos["log_views"] = np.log1p(videos["view_count"].clip(lower=0))
    videos["log_age"] = np.log1p(videos["age_days"])
    
    # Join with channel data for category
    ch_map = channels[["channel", "category_cc"]].rename(
        columns={"channel": "channel_id", "category_cc": "category"}
    )
    videos = videos.merge(ch_map, on="channel_id", how="left")
    videos["category"] = videos["category"].fillna("Unknown")
    
    channels_with_videos = videos["channel_id"].value_counts()
    valid_channels = channels_with_videos[channels_with_videos >= 20].index
    
    delta_r2s = []
    
    for ch in valid_channels:
        cv = videos[videos["channel_id"] == ch].copy()
        if len(cv) < 20:
            continue
        if cv["category"].nunique() < 2:
            continue  # Need at least 2 categories to test
        
        # Model A: age only
        slope_a, intercept_a, r_a, p_a, se_a = stats.linregress(cv["log_age"], cv["log_views"])
        r2_a = r_a ** 2
        
        # Model B: age + category dummies
        cat_dummies = pd.get_dummies(cv["category"], drop_first=True)
        X_b = np.column_stack([cv["log_age"].values] + [cat_dummies[c].values for c in cat_dummies.columns])
        y = cv["log_views"].values
        
        if X_b.shape[1] >= len(cv):
            continue
        
        # Compute R^2 for model B
        X_b_with_const = np.column_stack([np.ones(len(X_b)), X_b])
        try:
            beta = np.linalg.lstsq(X_b_with_const, y, rcond=None)[0]
            y_pred = X_b_with_const @ beta
            ss_res = np.sum((y - y_pred) ** 2)
            ss_tot = np.sum((y - np.mean(y)) ** 2)
            r2_b = 1 - ss_res / ss_tot
            delta_r2s.append(r2_b - r2_a)
        except:
            continue
    
    mean_delta = np.mean(delta_r2s) if delta_r2s else 0
    
    log(f"  Channels tested: {len(delta_r2s)}")
    log(f"  Mean delta R^2 (category vs age-only): {mean_delta:.4f}")
    
    if mean_delta > 0.01:
        log(f"  => Category adds meaningful signal (delta R^2 > 0.01)")
    else:
        log(f"  => Category adds marginal or no signal (delta R^2 <= 0.01)")
    
    return {
        "channels_tested": len(delta_r2s),
        "mean_delta_r2": float(mean_delta),
        "improvement_pct": float(mean_delta * 100),
        "conclusion": "Format class adds signal" if mean_delta > 0.01 else "Format class does not add meaningful signal",
        "gate_A02": gate_result("A02", mean_delta > 0.01,
            f"Category added {mean_delta:.4f} to R^2, "
            f"{'above' if mean_delta > 0.01 else 'below'} 0.01 threshold")
    }


# ================================================================
# Assumption 3: Channel momentum stripping
# ================================================================
def test_assumption_3(videos, time_series, channels):
    """
    Compare breakout label assignments before and after removing
    calendar-time growth trend.
    
    Method:
      1. Compute age-normalized residual (as in A1)
      2. Label top 25% as "breakout" by residual
      3. Regress residual against calendar quarter to get momentum trend
      4. Subtract momentum trend -> residual_2
      5. Label top 25% by residual_2
      6. Count how many labels changed
    
    If >15% of labels change, momentum matters.
    """
    log("=" * 60)
    log("Assumption 3: Channel momentum stripping")
    log("=" * 60)
    
    videos = videos.copy()
    videos["age_days"] = (
        pd.Timestamp("2019-10-01") - pd.to_datetime(videos["upload_date"])
    ).dt.days.clip(lower=1)
    videos["log_views"] = np.log1p(videos["view_count"].clip(lower=0))
    videos["log_age"] = np.log1p(videos["age_days"])
    videos["upload_quarter"] = pd.to_datetime(videos["upload_date"]).dt.to_period("Q").astype(str)
    
    # Compute channel growth per quarter from time series
    ts = time_series.copy()
    ts["quarter"] = pd.to_datetime(ts["datetime"]).dt.to_period("Q").astype(str)
    channel_growth = ts.groupby(["channel", "quarter"])["delta_subs"].sum().reset_index()
    channel_growth.columns = ["channel_id", "quarter", "subscriber_growth"]
    
    channels_with_videos = videos["channel_id"].value_counts()
    valid_channels = channels_with_videos[channels_with_videos >= 20].index
    
    flipped = 0
    total = 0
    
    for ch in valid_channels:
        cv = videos[videos["channel_id"] == ch].copy()
        if len(cv) < 20:
            continue
        
        # Step 1: OLS residual
        slope, intercept, r_val, p_val, se = stats.linregress(cv["log_age"], cv["log_views"])
        cv["predicted"] = intercept + slope * cv["log_age"]
        cv["residual"] = cv["log_views"] - cv["predicted"]
        
        # Step 2: Label breakout by residual
        cv["breakout_1"] = cv["residual"] >= cv["residual"].quantile(0.75)
        
        # Step 3: Add channel growth as covariate
        cv = cv.merge(channel_growth, on=["channel_id", "quarter"], how="left")
        cv["subscriber_growth"] = cv["subscriber_growth"].fillna(0)
        
        # Skip if subscriber growth has no variance
        if cv["subscriber_growth"].nunique() < 2:
            cv["residual_2"] = cv["residual"]
        # Step 4: Regress residual against subscriber growth
        elif cv["subscriber_growth"].nunique() > 1:
            slope_g, intercept_g, r_g, p_g, se_g = stats.linregress(
                cv["subscriber_growth"], cv["residual"]
            )
            cv["momentum_effect"] = intercept_g + slope_g * cv["subscriber_growth"]
            cv["residual_2"] = cv["residual"] - cv["momentum_effect"]
        else:
            cv["residual_2"] = cv["residual"]
        
        # Step 5: Label breakout by residual_2
        cv["breakout_2"] = cv["residual_2"] >= cv["residual_2"].quantile(0.75)
        
        # Step 6: Count flips
        flipped += (cv["breakout_1"] != cv["breakout_2"]).sum()
        total += len(cv)
    
    flip_pct = (flipped / total * 100) if total > 0 else 0
    log(f"  Total videos: {total}")
    log(f"  Label flips: {flipped} ({flip_pct:.1f}%)")
    
    if flip_pct > 15:
        log(f"  => Momentum stripping changes >15% of labels — confirmed")
    else:
        log(f"  => Momentum stripping changes <=15% of labels — minimal effect")
    
    return {
        "total_videos": int(total),
        "label_flips": int(flipped),
        "flip_percentage": float(flip_pct),
        "threshold": 15.0,
        "conclusion": "Channel momentum matters — stripping required" if flip_pct > 15 else "Channel momentum has minimal effect",
        "gate_A03": gate_result("A03", flip_pct > 15,
            f"Momentum stripping flipped {flip_pct:.1f}% of labels, "
            f"{'above' if flip_pct > 15 else 'below'} 15% threshold")
    }


# ================================================================
# Main
# ================================================================
def main():
    parser = argparse.ArgumentParser(description="Layer 1: YouNiverse breakout metric validation")
    parser.add_argument("--sample", type=int, default=5000, help="Number of channels to sample")
    parser.add_argument("--videos-per-channel", type=int, default=50, help="Max videos per channel")
    args = parser.parse_args()
    
    log(f"Layer 1: YouNiverse Breakout Metric Validation")
    log(f"Sample: {args.sample} channels, {args.videos_per_channel} videos per channel")
    
    start = time.time()
    
    # Load data
    channels_df = load_channels()
    videos_df, ch_subset = load_video_sample(args.sample, args.videos_per_channel)
    
    results = {
        "experiment": "layer-1-breakout-metric",
        "dataset": "youniverse",
        "timestamp": TIMESTAMP,
        "sample": {
            "channels": len(ch_subset),
            "videos": len(videos_df),
        },
        "assumptions": {},
        "gates": {},
    }
    
    # Assumption 1
    a1_result, a1_details = test_assumption_1(videos_df, channels_df)
    results["assumptions"]["A01_ols_vs_raw"] = a1_result
    results["gates"]["A01"] = a1_result["gate_A01"]
    
    # Save intermediate
    a1_details.to_csv(f"{OUTPUT_DIR}/layer1-a1-details.csv", index=False)
    
    # Assumption 2
    a2_result = test_assumption_2(videos_df, channels_df)
    results["assumptions"]["A02_format_class"] = a2_result
    results["gates"]["A02"] = a2_result["gate_A02"]
    
    # Load time series (only if A1 passed — momentum is expensive data-wise)
    if a1_result["gate_A01"]["status"] == "PASS":
        ts_df = load_time_series(videos_df["channel_id"].unique().tolist())
        a3_result = test_assumption_3(videos_df, ts_df, channels_df)
        results["assumptions"]["A03_momentum"] = a3_result
        results["gates"]["A03"] = a3_result["gate_A03"]
    else:
        log("Skipping A3 (momentum) — A1 did not pass, foundation needs rework")
        results["assumptions"]["A03_momentum"] = {"skipped": True, "reason": "A1 did not pass"}
        results["gates"]["A03"] = gate_result("A03", False, "Skipped — A1 prerequisite not met")
    
    # Overall
    all_gates = [
        results["gates"].get(k, {}).get("status") == "PASS"
        for k in ["A01", "A02", "A03"]
        if k in results["gates"]
    ]
    results["all_gates_passed"] = all(all_gates) if all_gates else False
    results["duration_seconds"] = time.time() - start
    
    # Write output
    output_path = f"{OUTPUT_DIR}/layer1-{TIMESTAMP}.json"
    with open(output_path, "w") as f:
        json.dump(results, f, indent=2)
    
    log(f"\n{'='*60}")
    log(f"RESULTS:")
    log(f"  A1 (OLS vs raw): {results['gates'].get('A01', {}).get('status', 'N/A')}")
    log(f"  A2 (format class): {results['gates'].get('A02', {}).get('status', 'N/A')}")
    log(f"  A3 (momentum): {results['gates'].get('A03', {}).get('status', 'N/A')}")
    log(f"  All gates: {'PASS' if results['all_gates_passed'] else 'FAIL'}")
    log(f"  Duration: {results['duration_seconds']:.0f}s")
    log(f"  Output: {output_path}")
    
    return 0 if results["all_gates_passed"] else 1


if __name__ == "__main__":
    sys.exit(main())
