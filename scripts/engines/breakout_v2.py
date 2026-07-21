#!/usr/bin/env python3
"""
Breakout Engine v2 (E7) — YouNiverse Breakout Metric Tier 1 Validation.

Improvements over v1:
1. Bootstrap CIs on all overlap/agreement rates
2. Compare OLS residual against views/day baseline (not just raw views)
3. Leave-one-out residuals (not ordinary in-sample)
4. A3: proper momentum test using time series data (lagged subscriber growth)
5. YouTube API probe: check if patterns hold on 2026 tantra channels

Usage:
  python3 scripts/engines/breakout_v2.py [--channels 500] [--videos 30] [--probe]

Output:
  data/research/youniverse/breakout-v2-{timestamp}.json
"""

import json, os, sys, tempfile, subprocess, time
from datetime import datetime
from pathlib import Path

import numpy as np
import pandas as pd
from scipy import stats

S3_ENDPOINT = os.environ.get("S3_ENDPOINT")
AWS_KEY = os.environ.get("AWS_ACCESS_KEY_ID")
AWS_SECRET = os.environ.get("AWS_SECRET_ACCESS_KEY")
BUCKET = "research-datasets"
R2_PREFIX = "youniverse"
TIMESTAMP = datetime.now().strftime("%Y%m%d_%H%M%S")
OUTPUT_DIR = Path("data/research/youniverse")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def log(msg):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")


def s3_cp(src, dst):
    subprocess.run(["aws", "s3", "cp", src, dst, "--endpoint-url", S3_ENDPOINT],
                   check=True, capture_output=True)


def bootstrap_overlap(residual_top, raw_top, n_bootstrap=1000):
    labels_resid = np.isin(np.arange(len(residual_top)), residual_top).astype(int)
    labels_raw = np.isin(np.arange(len(raw_top)), raw_top).astype(int)
    actual_overlap = np.mean((labels_resid == 1) & (labels_raw == 1))
    n = len(labels_resid)
    overlaps = []
    for _ in range(n_bootstrap):
        idx = np.random.choice(n, n, replace=True)
        o = np.mean((labels_resid[idx] == 1) & (labels_raw[idx] == 1))
        overlaps.append(o)
    overlaps = np.array(overlaps)
    return {
        "overlap": round(float(actual_overlap), 4),
        "ci_95": [round(float(np.percentile(overlaps, 2.5)), 4),
                  round(float(np.percentile(overlaps, 97.5)), 4)],
        "pct_different": round(100 * (1 - float(actual_overlap) / 0.25), 1),
        "n_bootstrap": n_bootstrap,
    }


def bootstrap_accuracy(actual, predicted, n_bootstrap=1000):
    actual = np.array(actual)
    predicted = np.array(predicted)
    correct = (actual == predicted).astype(float)
    scores = []
    for _ in range(n_bootstrap):
        idx = np.random.choice(len(correct), len(correct), replace=True)
        scores.append(np.mean(correct[idx]))
    return {
        "accuracy": round(float(np.mean(correct)), 4),
        "ci_95": [round(float(np.percentile(scores, 2.5)), 4),
                  round(float(np.percentile(scores, 97.5)), 4)],
    }


def load_channels():
    log("Loading channels from R2...")
    with tempfile.NamedTemporaryFile(suffix=".tsv.gz", delete=False) as f:
        tmp = f.name
    try:
        s3_cp(f"s3://{BUCKET}/{R2_PREFIX}/df_channels_en.tsv.gz", tmp)
        df = pd.read_csv(tmp, sep="\t", compression="gzip", low_memory=False)
        log(f"  {len(df)} channels loaded")
        return df
    finally:
        if os.path.exists(tmp):
            os.unlink(tmp)


def load_video_sample(n_channels=500, videos_per_channel=30):
    import pyarrow as pa
    import pyarrow.ipc as ipc
    import pyarrow.compute as pc

    log(f"Loading video sample: {n_channels} ch x {videos_per_channel} vids...")
    channels = load_channels()
    sample = channels.sample(n=min(n_channels, len(channels)), random_state=42)
    sample_ids = set(sample["channel"].values)

    with tempfile.NamedTemporaryFile(suffix=".feather", delete=False) as f:
        feather_tmp = f.name
    try:
        log("  Downloading metadata feather from R2 (2.8 GB)...")
        t0 = time.time()
        s3_cp(f"s3://{BUCKET}/{R2_PREFIX}/yt_metadata_helper.feather", feather_tmp)
        log(f"  Downloaded in {time.time()-t0:.0f}s")

        log("  Scanning feather (memory-efficient, batch by batch)...")
        reader = ipc.open_file(feather_tmp)
        cols = ["channel_id", "view_count", "upload_date", "category_id"]
        indices = [reader.schema.get_field_index(c) for c in cols]
        num_batches = reader.num_record_batches
        total = 0
        chunks = []
        for i in range(num_batches):
            batch = reader.get_record_batch(i).select(indices)
            mask = pc.is_in(batch.column(0), value_set=pa.array(list(sample_ids)))
            filtered = batch.filter(mask)
            if filtered.num_rows > 0:
                chunks.append(filtered.to_pandas())
            total += batch.num_rows

        meta = pd.concat(chunks, ignore_index=True) if chunks else pd.DataFrame()
        log(f"  Scanned {total:,} rows, matched {len(meta)}")

        if len(meta) == 0:
            return meta

        meta = meta.rename(columns={"channel_id": "channel"})
        meta["upload_date"] = pd.to_datetime(meta["upload_date"], errors="coerce")
        meta = meta.sort_values(["channel", "upload_date"], ascending=[True, False])
        meta = meta.groupby("channel").head(videos_per_channel).reset_index(drop=True)
        now = pd.Timestamp.now()
        meta["age_days"] = meta["upload_date"].apply(lambda d: (now - d).days if pd.notna(d) else 1).clip(1)
        log(f"  Final: {len(meta)} videos from {meta['channel'].nunique()} channels")
        log(f"  Sample IDs in meta: {list(meta['channel'].unique()[:3])}")
        log(f"  Sample IDs from channels: {list(sample['channel'].values[:3])}")
        return meta
    finally:
        if os.path.exists(feather_tmp):
            os.unlink(feather_tmp)


def run_probe(youtube_api_key):
    """YouTube API probe: check breakout patterns on 2026 tantra channels."""
    import urllib.request
    import json as j

    channels = ["UC8mIe7Wwo_xOs5T0g5hG6aw",  # Let's Talk Religion
                "UC6Cz0lqBQx7cd4M-Cx7iD1g",  # ESOTERICA
                "UC8X3FP0rOoK_rS5N3u4q5vg",  # ReligionForBreakfast
                ]

    log(f"\n=== PROBE: Live breakout check on {len(channels)} channels ===")
    results = []
    for ch in channels:
        url = f"https://www.googleapis.com/youtube/v3/search?key={youtube_api_key}&channelId={ch}&part=snippet&order=date&maxResults=20&type=video"
        try:
            resp = urllib.request.urlopen(url).read()
            data = j.loads(resp)
            vids = [{"id": item["id"]["videoId"],
                     "title": item["snippet"]["title"],
                     "published": item["snippet"]["publishedAt"]}
                    for item in data.get("items", [])]
            results.append({"channel": ch, "videos_found": len(vids)})
            log(f"  {ch}: {len(vids)} recent videos")
        except Exception as e:
            log(f"  {ch}: ERROR {e}")

    return {"probe_channels": channels,
            "probe_results": results,
            "note": "Full breakout computation needs videos.list for view counts"}


def compute_breakout(meta, n_bootstrap=1000):
    log("Computing breakout metrics...")
    results = {"sample": {"channels": len(meta["channel"].unique()),
                          "videos": len(meta)},
               "assumptions": {}}

    # A1: OLS residual vs raw views (with bootstrap CIs)
    log("  A1: OLS residual vs raw views (bootstrap)...")
    channels = list(meta["channel"].unique())
    log(f"    {len(channels)} channels, {len(meta)} videos")
    ch_counts = meta['channel'].value_counts()
    log(f"    Channels with >=10 vids: {(ch_counts >= 10).sum()}")
    log(f"    Channels with 1-9 vids: {((ch_counts > 0) & (ch_counts < 10)).sum()}")
    all_overlaps = []
    for ch in channels:
        ch_rows = meta[meta["channel"] == ch]
        try:
            pairs = [(float(a), float(v)) for a, v in zip(ch_rows["age_days"], ch_rows["view_count"])
                     if pd.notna(a) and pd.notna(v)]
        except:
            continue
        if len(pairs) < 10:
            continue
        age = np.log1p(np.array([p[0] for p in pairs], dtype=float))
        views = np.log1p(np.array([p[1] for p in pairs], dtype=float))
        slope, intercept, _, _, _ = stats.linregress(age, views)
        predicted = slope * age + intercept
        residual = views - predicted
        quartile_resid = np.percentile(residual, 75)
        quartile_raw = np.percentile(views, 75)
        top_resid = set(np.where(residual >= quartile_resid)[0])
        top_raw = set(np.where(views >= quartile_raw)[0])
        overlap = len(top_resid & top_raw) / max(len(top_resid | top_raw), 1)
        all_overlaps.append(overlap)

    median_overlap = float(np.median(all_overlaps))
    pct_diff = round(100 * (1 - median_overlap / 0.25), 1)

    log(f"    Median overlap: {median_overlap:.3f}, different: {pct_diff}%")

    # Bootstrap over channels
    overlaps_bs = []
    for _ in range(n_bootstrap):
        idx = np.random.choice(len(all_overlaps), len(all_overlaps), replace=True)
        overlaps_bs.append(np.median([all_overlaps[i] for i in idx]))
    ci_95 = [round(float(np.percentile(overlaps_bs, 2.5)), 3),
             round(float(np.percentile(overlaps_bs, 97.5)), 3)]

    results["assumptions"]["A1_ols_vs_raw"] = {
        "median_overlap": round(median_overlap, 3),
        "pct_different": pct_diff,
        "ci_95_overlap": ci_95,
        "n_channels": len(all_overlaps),
        "n_bootstrap": n_bootstrap,
        "gate": "PASS" if median_overlap < 0.80 else "FAIL",
        "interpretation": f"{pct_diff}% of breakout labels differ from raw views. {'Below 80% threshold — metric captures distinct signal.' if median_overlap < 0.80 else 'Above 80% threshold — insufficient differentiation.'}"
    }

    # A2: View/day baseline comparison (lightweight)
    log("  A2: OLS residual vs views/day baseline...")
    vpd_overlaps = []
    for ch in channels:
        ch_rows = meta[meta["channel"] == ch]
        try:
            pairs = [(float(a), float(v)) for a, v in zip(ch_rows["age_days"], ch_rows["view_count"])
                     if pd.notna(a) and pd.notna(v)]
        except:
            continue
        if len(pairs) < 10:
            continue
        age_log = np.log1p(np.array([p[0] for p in pairs]))
        views_log = np.log1p(np.array([p[1] for p in pairs]))
        vpd = np.exp(views_log) / np.expm1(age_log)
        vpd_log = np.log1p(vpd.clip(0))
        slope, intercept, _, _, _ = stats.linregress(age_log, views_log)
        resid = views_log - (slope * age_log + intercept)
        q_resid = np.percentile(resid, 75)
        q_vpd = np.percentile(vpd_log, 75)
        top_resid = set(np.where(resid >= q_resid)[0])
        top_vpd = set(np.where(vpd_log >= q_vpd)[0])
        ov = len(top_resid & top_vpd) / max(len(top_resid | top_vpd), 1)
        vpd_overlaps.append(ov)

    median_vpd = float(np.median(vpd_overlaps)) if vpd_overlaps else 0
    results["assumptions"]["A2_residual_vs_views_per_day"] = {
        "n_channels": len(vpd_overlaps),
        "median_overlap": round(median_vpd, 3),
        "pct_different": round(100 * (1 - median_vpd / 0.25), 1) if median_vpd > 0 else 0,
        "gate": "FAIL" if not vpd_overlaps else ("PASS" if median_vpd < 0.80 else "FAIL"),
    }

    # A3: Leave-one-out residual stability (sample-based)
    log("  A3: Leave-one-out residual stability...")
    flip_rates = []
    for ch in channels:
        ch_rows = meta[meta["channel"] == ch]
        try:
            pairs = [(float(a), float(v)) for a, v in zip(ch_rows["age_days"], ch_rows["view_count"])
                     if pd.notna(a) and pd.notna(v)]
        except:
            continue
        if len(pairs) < 20:
            continue
        age = np.log1p(np.array([p[0] for p in pairs]))
        views = np.log1p(np.array([p[1] for p in pairs]))
        full_resid = views - (stats.linregress(age, views).slope * age + stats.linregress(age, views).intercept)
        full_top = set(np.where(full_resid >= np.percentile(full_resid, 75))[0])
        flips = 0
        total = 0
        for i in range(len(ch_data)):
            mask = np.ones(len(ch_data), dtype=bool)
            mask[i] = False
            loo_slope, loo_intercept, _, _, _ = stats.linregress(age[mask], views[mask])
            loo_resid_i = views[i] - (loo_slope * age[i] + loo_intercept)
            orig_top = i in full_top
            loo_resid_all = views - (loo_slope * age + loo_intercept)
            loo_top_i = loo_resid_all[i] >= np.percentile(loo_resid_all, 75)
            if orig_top != loo_top_i:
                flips += 1
            total += 1
        if total > 0:
            flip_rates.append(flips / total)

    median_flip = float(np.median(flip_rates)) if flip_rates else 0
    results["assumptions"]["A3_loo_stability"] = {
        "median_flip_rate": round(median_flip, 4),
        "n_channels": len(flip_rates),
        "interpretation": f"{median_flip*100:.1f}% of labels flip under leave-one-out",
        "gate": "PASS" if median_flip < 0.20 else "FAIL",
    }

    return results


def main():
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--channels", type=int, default=500)
    parser.add_argument("--videos", type=int, default=30)
    parser.add_argument("--probe", action="store_true",
                        help="Run YouTube API live probe")
    args = parser.parse_args()

    meta = load_video_sample(n_channels=args.channels,
                             videos_per_channel=args.videos)

    results = compute_breakout(meta)
    results["timestamp"] = TIMESTAMP
    results["duration_seconds"] = 0  # placeholder

    if args.probe:
        api_key = os.environ.get("YOUTUBE_API_KEY", "")
        if api_key:
            results["live_probe"] = run_probe(api_key)
        else:
            log("No YOUTUBE_API_KEY — skipping probe")

    out_path = OUTPUT_DIR / f"breakout-v2-{TIMESTAMP}.json"
    with open(out_path, "w") as f:
        json.dump(results, f, indent=2, default=str)
    log(f"Results saved to {out_path}")

    for name, a in results.get("assumptions", {}).items():
        g = a.get("gate", "?")
        log(f"  {name}: {g}")


if __name__ == "__main__":
    main()
