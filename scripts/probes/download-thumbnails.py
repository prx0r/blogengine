#!/usr/bin/env python3
"""Download all thumbnails from analyzed channels and upload to R2."""

import json, os, subprocess, time, sys
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

R2_BUCKET = "atlas-sources"
R2_PREFIX = "thumbnails"
S3_ENDPOINT = os.environ.get("S3_ENDPOINT")
AWS_KEY = os.environ.get("AWS_ACCESS_KEY_ID")
AWS_SECRET = os.environ.get("AWS_SECRET_ACCESS_KEY")

DATA_DIR = Path("/root/projects/blog/data/research/layer2")
LOCAL_CACHE = Path("/tmp/yt-thumbnails")
LOCAL_CACHE.mkdir(parents=True, exist_ok=True)

def upload_to_r2(local_path, r2_key):
    subprocess.run([
        "aws", "s3", "cp", str(local_path),
        f"s3://{R2_BUCKET}/{r2_key}",
        "--endpoint-url", S3_ENDPOINT
    ], capture_output=True, check=False)

def download_thumbnail(video_id, channel_name, idx, total):
    url = f"https://img.youtube.com/vi/{video_id}/maxresdefault.jpg"
    local_path = LOCAL_CACHE / f"{video_id}.jpg"
    r2_key = f"{R2_PREFIX}/{channel_name}/{video_id}.jpg"

    # Skip if already in R2
    result = subprocess.run([
        "aws", "s3api", "head-object",
        "--bucket", R2_BUCKET, "--key", r2_key,
        "--endpoint-url", S3_ENDPOINT
    ], capture_output=True, check=False)
    if result.returncode == 0:
        return f"  [{idx}/{total}] {channel_name}/{video_id} — already in R2"

    # Download
    try:
        subprocess.run(["curl", "-s", "-o", str(local_path), url],
                       capture_output=True, timeout=10, check=True)
    except:
        # Fallback to hqdefault if maxresdefault fails
        url = f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg"
        try:
            subprocess.run(["curl", "-s", "-o", str(local_path), url],
                           capture_output=True, timeout=10, check=True)
        except:
            return f"  [{idx}/{total}] {video_id} — FAILED"

    if os.path.getsize(local_path) < 1000:
        os.remove(local_path)
        return f"  [{idx}/{total}] {video_id} — TOO SMALL"

    upload_to_r2(local_path, r2_key)
    os.remove(local_path)
    return f"  [{idx}/{total}] {channel_name}/{video_id} — OK"

def main():
    analysis_files = sorted(DATA_DIR.glob("analysis_*.json"))
    all_videos = []

    for f in analysis_files:
        with open(f) as fh:
            d = json.load(fh)
        channel_name = d["channel"].lower().replace(" ", "_").replace("'","")[:20]
        for v in d["videos"]:
            if v.get("video_id"):
                all_videos.append((v["video_id"], channel_name))

    print(f"Total thumbnails to process: {len(all_videos)}")

    with ThreadPoolExecutor(max_workers=4) as pool:
        futures = []
        for idx, (vid, ch) in enumerate(all_videos, 1):
            futures.append(pool.submit(download_thumbnail, vid, ch, idx, len(all_videos)))
            if idx % 50 == 0:
                # Small delay between batches to avoid hammering YouTube
                time.sleep(0.5)

        for future in as_completed(futures):
            result = future.result()
            if "OK" in result or "already" in result:
                sys.stdout.write(f"\r{result[:60]}")

    print(f"\nDone. Check R2 at s3://{R2_BUCKET}/{R2_PREFIX}/")

if __name__ == "__main__":
    main()
