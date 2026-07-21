#!/usr/bin/env python3
"""Extract practical patterns from YouNiverse for Hermes decision datapoints."""

import json, os, sys, tempfile, subprocess, time
from datetime import datetime
from pathlib import Path
from collections import defaultdict

import numpy as np
import pandas as pd
import pyarrow as pa
import pyarrow.ipc as ipc
import pyarrow.compute as pc

S3_ENDPOINT = os.environ.get("S3_ENDPOINT")
AWS_KEY = os.environ.get("AWS_ACCESS_KEY_ID")
AWS_SECRET = os.environ.get("AWS_SECRET_ACCESS_KEY")
BUCKET = "research-datasets"
TIMESTAMP = datetime.now().strftime("%Y%m%d_%H%M%S")
OUTPUT_DIR = Path("data/research/youniverse")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def log(msg):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")


def s3_cp(src, dst):
    subprocess.run(["aws", "s3", "cp", src, dst, "--endpoint-url", S3_ENDPOINT],
                   check=True, capture_output=True)


def main():
    # Step 1: Load channels
    log("Loading channels...")
    with tempfile.NamedTemporaryFile(suffix=".tsv.gz", delete=False) as f:
        ch_tmp = f.name
    try:
        s3_cp(f"s3://{BUCKET}/youniverse/df_channels_en.tsv.gz", ch_tmp)
        channels = pd.read_csv(ch_tmp, sep="\t", compression="gzip", low_memory=False)
        log(f"  {len(channels)} channels loaded")
    finally:
        if os.path.exists(ch_tmp):
            os.unlink(ch_tmp)

    # Step 2: Scan feather in batches
    log("Scanning video metadata (batch by batch)...")
    with tempfile.NamedTemporaryFile(suffix=".feather", delete=False) as f:
        feather_tmp = f.name
    try:
        s3_cp(f"s3://{BUCKET}/youniverse/yt_metadata_helper.feather", feather_tmp)
        reader = ipc.open_file(feather_tmp)

        cols = ["channel_id", "view_count", "duration", "upload_date", "categories", "like_count"]
        indices = [reader.schema.get_field_index(c) for c in cols]

        # Aggregators: per-channel rolling stats
        ch_video_count = defaultdict(int)
        ch_view_sums = defaultdict(float)
        ch_durations = defaultdict(list)
        ch_dates = defaultdict(list)
        ch_likes = defaultdict(float)
        cat_view_sums = defaultdict(float)
        cat_view_counts = defaultdict(int)
        dur_breakout_hits = defaultdict(list)  # duration bucket -> breakout?
        dur_top_hits = defaultdict(list)

        total_scanned = 0
        for i in range(reader.num_record_batches):
            batch = reader.get_record_batch(i).select(indices)
            df = batch.to_pandas()
            total_scanned += len(df)

            # Per-channel stats
            for _, row in df.iterrows():
                ch = row["channel_id"]
                vc = row["view_count"]
                dur = row["duration"]
                cat = row["categories"]

                if pd.notna(vc) and vc > 0:
                    ch_video_count[ch] += 1
                    ch_view_sums[ch] += vc
                    if pd.notna(dur) and dur > 0:
                        ch_durations[ch].append(dur)
                    if pd.notna(vc):
                        ch_likes[ch] += vc

                if pd.notna(cat) and pd.notna(vc):
                    cat_view_sums[cat] += vc
                    cat_view_counts[cat] += 1

                # Duration breakout: top 10% of views in sample
                if pd.notna(dur) and pd.notna(vc) and dur > 0 and vc > 0:
                    bucket = int(dur // 60)  # minute bucket
                    dur_breakout_hits[bucket].append(vc)

            if i % 200 == 0:
                log(f"  Scanned batch {i} ({total_scanned:,} rows)")

    finally:
        if os.path.exists(feather_tmp):
            os.unlink(feather_tmp)

    log(f"Total scanned: {total_scanned:,} rows")

    # Step 3: Compute patterns
    log("Computing patterns...")
    patterns = {}

    # P1: Video length vs performance
    log("  P1: Optimal video length by minute bucket...")
    dur_stats = {}
    for bucket, views in dur_breakout_hits.items():
        if len(views) < 100:
            continue
        arr = np.array(views)
        p90 = np.percentile(arr, 90)
        dur_stats[bucket] = {
            "count": len(arr),
            "mean_views": float(np.mean(arr)),
            "median_views": float(np.median(arr)),
            "p90_views": float(p90),
            "minutes": bucket,
        }
    top_dur = sorted(dur_stats.values(), key=lambda x: -x["median_views"])[:15]
    patterns["optimal_duration_minutes"] = [
        {"range": f"{d['minutes']}-{d['minutes']+1}min", "median_views": int(d["median_views"]),
         "count": d["count"], "p90": int(d["p90_views"])} for d in top_dur
    ]

    # P2: Category performance
    log("  P2: Category breakout density...")
    cat_stats = {}
    for cat, vsum in cat_view_sums.items():
        cnt = cat_view_counts[cat]
        if cnt < 1000:
            continue
        cat_stats[cat] = {"count": cnt, "total_views": int(vsum), "avg_views": int(vsum / cnt)}
    patterns["category_performance"] = sorted(
        [{"category": k, **v} for k, v in cat_stats.items()],
        key=lambda x: -x["avg_views"]
    )[:20]

    # P3: Channel archetypes
    log("  P3: Channel archetypes...")
    archetypes = []
    for ch, vc in ch_video_count.items():
        if vc < 5:
            continue
        avg_views = ch_view_sums[ch] / vc
        durations = ch_durations.get(ch, [])
        avg_dur = float(np.mean(durations)) if durations else 0
        archetypes.append({
            "channel": ch,
            "videos": vc,
            "avg_views": int(avg_views),
            "avg_duration": int(avg_dur),
        })
    archetypes.sort(key=lambda x: -x["avg_views"])

    # View quartiles
    view_avgs = np.array([a["avg_views"] for a in archetypes])
    med_av = float(np.median(view_avgs))
    p75_av = float(np.percentile(view_avgs, 75))
    patterns["channel_archetypes"] = {
        "median_avg_views_per_channel": int(med_av),
        "p75_avg_views": int(p75_av),
        "num_channels_analyzed": len(archetypes),
        "top_channel_video_count": archetypes[0]["videos"] if archetypes else 0,
    }

    # P4: Duration vs views by 5-min bucket
    log("  P4: Duration vs views (5-min buckets)...")
    buckets_5min = defaultdict(list)
    for bucket, views in dur_breakout_hits.items():
        b5 = bucket // 5 * 5
        buckets_5min[b5].extend(views)
    dur_buckets_clean = []
    for b5, views in buckets_5min.items():
        if len(views) < 500 or b5 > 120:
            continue
        arr = np.array(views)
        dur_buckets_clean.append({
            "bucket_min": f"{b5}-{b5+5}min",
            "count": len(arr),
            "median_views": int(np.median(arr)),
            "mean_views": int(np.mean(arr)),
        })
    dur_buckets_clean.sort(key=lambda x: x["bucket_min"])
    patterns["views_by_duration_bucket"] = dur_buckets_clean

    # P5: Age vs views (is the R²=0.12 real?)
    log("  P5: Age vs views correlation...")
    with tempfile.NamedTemporaryFile(suffix=".feather", delete=False) as f:
        feather_tmp2 = f.name
    try:
        s3_cp(f"s3://{BUCKET}/youniverse/yt_metadata_helper.feather", feather_tmp2)
        reader2 = ipc.open_file(feather_tmp2)
        # Sample 10 batches for age correlation
        age_views_pairs = []
        for i in range(10):
            if i >= reader2.num_record_batches:
                break
            batch = reader2.get_record_batch(i).select([
                reader2.schema.get_field_index("view_count"),
                reader2.schema.get_field_index("upload_date"),
            ])
            df = batch.to_pandas()
            for _, row in df.iterrows():
                v = row["view_count"]
                d = row["upload_date"]
                if pd.notna(v) and pd.notna(d) and v > 0:
                    age = (pd.Timestamp.now() - pd.Timestamp(d)).days
                    if age > 0:
                        age_views_pairs.append((age, v))
    finally:
        if os.path.exists(feather_tmp2):
            os.unlink(feather_tmp2)

    if age_views_pairs:
        ages = np.array([p[0] for p in age_views_pairs])
        views = np.array([p[1] for p in age_views_pairs])
        log_age = np.log1p(ages)
        log_views = np.log1p(views)
        from scipy import stats
        slope, intercept, r_val, p_val, std_err = stats.linregress(log_age, log_views)
        patterns["age_vs_views"] = {
            "r_squared": round(r_val ** 2, 4),
            "slope": round(slope, 4),
            "p_value": round(p_val, 10),
            "n_samples": len(age_views_pairs),
            "interpretation": f"Age explains {r_val**2:.1%} of view variance. Age slope={slope:.4f} (log-log)."
        }
    else:
        patterns["age_vs_views"] = {"error": "no data"}

    # P6: Upload frequency distribution
    log("  P6: Upload frequency...")
    freq = [a["videos"] for a in archetypes]
    patterns["upload_frequency"] = {
        "median_videos_per_channel": int(np.median(freq)),
        "mean_videos": int(np.mean(freq)),
        "p90": int(np.percentile(freq, 90)),
        "max": max(freq),
    }

    # P7: Duration summary
    all_durs = []
    for ch, durs in ch_durations.items():
        if durs:
            all_durs.extend(durs)
    if all_durs:
        dur_arr = np.array(all_durs)
        patterns["duration_summary_seconds"] = {
            "median": int(np.median(dur_arr)),
            "mean": int(np.mean(dur_arr)),
            "p10": int(np.percentile(dur_arr, 10)),
            "p90": int(np.percentile(dur_arr, 90)),
            "n_samples": len(dur_arr),
        }
        patterns["duration_summary_minutes"] = {
            k: int(v / 60) for k, v in patterns["duration_summary_seconds"].items() if k != "n_samples"
        }

    patterns["timestamp"] = TIMESTAMP
    patterns["n_channels"] = len(ch_video_count)
    patterns["n_videos"] = total_scanned

    out_path = OUTPUT_DIR / f"youniverse-patterns-{TIMESTAMP}.json"
    with open(out_path, "w") as f:
        json.dump(patterns, f, indent=2, default=str)

    log(f"\nSaved to {out_path}")
    for k in patterns:
        if k in ("timestamp", "n_channels", "n_videos"):
            continue
        log(f"\n--- {k} ---")
        val = patterns[k]
        if isinstance(val, dict):
            for sk, sv in val.items():
                log(f"  {sk}: {sv}")
        elif isinstance(val, list):
            for item in val[:5]:
                log(f"  {item}")
            if len(val) > 5:
                log(f"  ... and {len(val)-5} more")


if __name__ == "__main__":
    main()
