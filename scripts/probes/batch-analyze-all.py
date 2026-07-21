#!/usr/bin/env python3
"""Batch analyze all un-analyzed channels in channel-directory.json.
Runs in background. Logs to /tmp/batch-analyze.log"""
import json, os, subprocess, sys, time
from pathlib import Path

DATA_DIR = Path("/root/projects/blog/data/research/layer2")
DIR_PATH = DATA_DIR / "channel-directory.json"
SCRIPT = "/root/projects/blog/scripts/probes/asangoham-deep-dive.py"
LOG = "/tmp/batch-analyze.log"

def log(msg):
    with open(LOG, "a") as f:
        f.write(f"[{time.strftime('%H:%M:%S')}] {msg}\n")
    print(msg)

# Load directory
with open(DIR_PATH) as f:
    d = json.load(f)

# Find all channels that need analysis
to_analyze = []
for tier_name, tier in d["tiers"].items():
    for c in tier.get("channels", []):
        if not c.get("analyzed") and c.get("handle"):
            to_analyze.append((c["handle"], c["name"]))

log(f"Channels to analyze: {len(to_analyze)}")
log(f"Channels already analyzed: {d['analyzed_so_far']}")

done = 0
for handle, name in to_analyze:
    # Get channel ID via API
    api_key = "AIzaSyAoXdXRD1K3A2nIOQLVBDYgo257zqQXy3I"
    ch_url = f"https://www.googleapis.com/youtube/v3/channels?part=id&forHandle={handle}&key={api_key}"
    try:
        import urllib.request
        resp = json.loads(urllib.request.urlopen(ch_url, timeout=10).read())
        if not resp.get("items"):
            log(f"  {name} ({handle}): NO CHANNEL ID FOUND")
            continue
        ch_id = resp["items"][0]["id"]
    except Exception as e:
        log(f"  {name} ({handle}): API ERROR: {str(e)[:60]}")
        time.sleep(1)
        continue

    # Run analysis
    safe_name = name.replace(" ", "_").replace("'","").replace("é","e").replace("ä","a").replace("–","-")[:20]
    safe_name = "".join(c for c in safe_name if c.isalnum() or c in "_-")
    if not safe_name:
        safe_name = f"ch_{ch_id[:8]}"

    try:
        result = subprocess.run(
            ["python3", SCRIPT, ch_id, safe_name],
            capture_output=True, timeout=60, text=True
        )
        out_path = DATA_DIR / f"analysis_{safe_name.lower()}.json"
        if out_path.exists():
            size = os.path.getsize(out_path)
            log(f"  {name}: saved ({size//1024}KB) ✓")
            done += 1
        else:
            log(f"  {name}: script ran but no output file. stderr: {result.stderr[:200]}")
    except subprocess.TimeoutExpired:
        log(f"  {name}: TIMEOUT")
    except Exception as e:
        log(f"  {name}: ERROR: {e}")

    time.sleep(0.5)

log(f"\nDone! Analyzed {done}/{len(to_analyze)} new channels")
log(f"Total should now be: {d['analyzed_so_far'] + done}")
