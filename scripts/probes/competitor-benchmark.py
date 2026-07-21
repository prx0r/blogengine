#!/usr/bin/env python3
"""Competitor benchmark deep dive via YouTube API."""

import urllib.request, json, numpy as np, re, sys, os
from collections import defaultdict

API_KEY = os.environ.get("YT_API_KEY", "AIzaSyAoXdXRD1K3A2nIOQLVBDYgo257zqQXy3I")

channels = {
    "Tantra Talks": "UC-Hg6aMJ44d4FkDoGi_OEOQ",
    "ESOTERICA": "UCoydhtfFSk1fZXNRnkGnneQ",
    "Let's Talk Religion": "UC9dRb4fbJQIbQ3KHJZF_z0g",
    "ReligionForBreakfast": "UCct9aR7HC79Cv2g-9oDOTLw",
    "Gnostic Informant": "UCtdweFMJ5DGj7_q5IcpQhPQ",
    "John Vervaeke's Lectern": "UCpqDUjTsof-kTNpnyWper_Q",
    "Vimarsha Foundation": "UC4wAYkt8_U1TJOfXkfpjAsw",
}

def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    r = urllib.request.urlopen(req)
    return json.loads(r.read())

def parse_duration(dur):
    m = re.search(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?', dur)
    if not m: return 0
    h = int(m.group(1)) if m.group(1) else 0
    mn = int(m.group(2)) if m.group(2) else 0
    s = int(m.group(3)) if m.group(3) else 0
    return h*60 + mn + s/60

print("=" * 80)
print("COMPETITOR BENCHMARK DEEP DIVE")
print("=" * 80)

all_data = {}
for name, ch_id in channels.items():
    try:
        print(f"\n--- {name} ---")
        ch_url = f"https://www.googleapis.com/youtube/v3/channels?key={API_KEY}&id={ch_id}&part=statistics,contentDetails"
        ch_data = fetch(ch_url)
        if not ch_data.get("items"):
            print(f"  Could not find channel")
            continue
        item = ch_data["items"][0]
        subs = int(item["statistics"]["subscriberCount"])
        total_vids = int(item["statistics"]["videoCount"])
        total_views_ch = int(item["statistics"]["viewCount"])

        print(f"  Subs: {subs:,}")
        print(f"  Total videos: {total_vids:,}")
        print(f"  Total views: {total_views_ch:,}")
        print(f"  Avg views/video: {total_views_ch//max(total_vids,1):,}")
        print(f"  Views/sub ratio: {total_views_ch//max(subs,1):.1f}x")

        uploads = item["contentDetails"]["relatedPlaylists"]["uploads"]
        pl_url = f"https://www.googleapis.com/youtube/v3/playlistItems?key={API_KEY}&playlistId={uploads}&part=snippet&maxResults=50"
        pl_data = fetch(pl_url)
        video_ids = [i["snippet"]["resourceId"]["videoId"] for i in pl_data.get("items", [])]

        if not video_ids:
            print("  No videos found")
            continue

        all_views = []
        all_likes = []
        all_durs = []
        all_titles = []

        for i in range(0, len(video_ids), 50):
            chunk = video_ids[i:i+50]
            ids = ",".join(chunk)
            vid_url = f"https://www.googleapis.com/youtube/v3/videos?key={API_KEY}&id={ids}&part=statistics,contentDetails"
            vid_data = fetch(vid_url)
            for vi in vid_data.get("items", []):
                s = vi["statistics"]
                v = int(s.get("viewCount", 0))
                all_views.append(v)
                all_likes.append(int(s.get("likeCount", 0)))
                all_durs.append(parse_duration(vi["contentDetails"]["duration"]))
                all_titles.append(vi.get("snippet", {}).get("title", ""))

        if not all_views:
            print("  No video stats")
            continue

        median_views = int(np.median(all_views))
        mean_views = int(np.mean(all_views))
        p90_views = int(np.percentile(all_views, 90))
        max_views = max(all_views)
        breakout_threshold = median_views * 2
        breakouts = sum(1 for v in all_views if v > breakout_threshold)
        median_dur = float(np.median(all_durs))
        like_ratios = [l/max(v,1) for l,v in zip(all_likes, all_views)]
        median_like_ratio = float(np.median(like_ratios)) * 100
        q_count = sum(1 for t in all_titles if "?" in t)
        colon_count = sum(1 for t in all_titles if ":" in t)
        ex_count = sum(1 for t in all_titles if "!" in t)

        print(f"\n  === Last 50 Videos Stats ===")
        print(f"  Median views: {median_views:,}")
        print(f"  Mean views: {mean_views:,}")
        print(f"  P90 views: {p90_views:,}")
        print(f"  Median duration: {median_dur:.1f} min")
        print(f"  Median like ratio: {median_like_ratio:.1f}%")
        print(f"  Breakouts: {breakouts}/{len(all_views)} ({breakouts/len(all_views)*100:.0f}%)")
        print(f"  Title questions: {q_count}/{len(all_titles)} ({q_count/len(all_titles)*100:.0f}%)")
        print(f"  Title colons: {colon_count}/{len(all_titles)} ({colon_count/len(all_titles)*100:.0f}%)")
        if all_titles and max_views > 0:
            best_idx = all_views.index(max_views)
            print(f"  Best video: {all_titles[best_idx][:80]} ({max_views:,} views)")

        all_data[name] = {
            "subs": subs, "total_videos": total_vids, "total_views": total_views_ch,
            "median_views": median_views, "mean_views": mean_views, "p90": p90_views,
            "median_duration_min": round(median_dur, 1),
            "breakout_rate": round(breakouts/len(all_views), 2),
            "question_rate": round(q_count/len(all_titles), 2),
            "colon_rate": round(colon_count/len(all_titles), 2),
            "like_ratio": round(median_like_ratio, 1),
            "top_title": all_titles[all_views.index(max_views)][:80] if all_titles else "",
        }

    except Exception as e:
        print(f"  ERROR: {e}")

print("\n" + "=" * 80)
print("RANKED TABLE")
print("=" * 80)
header = f"{'Channel':30s} {'Subs':>8s} {'MedView':>10s} {'Dur':>6s} {'Brk%':>6s} {'Like%':>6s} {'Q%':>5s} {'Col%':>5s}"
print(header)
print("-" * 85)
for name, d in sorted(all_data.items(), key=lambda x: -x[1]["median_views"]):
    print(f"{name:30s} {d['subs']:>8,} {d['median_views']:>10,} {d['median_duration_min']:>5.1f} {d['breakout_rate']:>5.0%} {d['like_ratio']:>5.1f}% {d['question_rate']:>4.0%} {d['colon_rate']:>4.0%}")

# Save
import json
path = "/root/projects/blog/data/research/layer2/competitor-benchmark.json"
with open(path, "w") as f:
    json.dump(all_data, f, indent=2)
print(f"\nSaved to {path}")
