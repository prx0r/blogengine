#!/usr/bin/env python3
"""Deep analysis of Asangoham channel — title patterns, formula, what works."""

import urllib.request, json, numpy as np, re, os, sys
from datetime import datetime
from collections import defaultdict, Counter

API_KEY = os.environ.get("YT_API_KEY", "AIzaSyAoXdXRD1K3A2nIOQLVBDYgo257zqQXy3I")
CH_ID = sys.argv[1] if len(sys.argv) > 1 else "UC3OA1M34StuW8jhZFSXd2Jw"
LABEL = sys.argv[2] if len(sys.argv) > 2 else None

def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    return json.loads(urllib.request.urlopen(req).read())

def parse_duration(dur):
    m = re.search(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?', dur)
    if not m: return 0
    h = int(m.group(1)) if m.group(1) else 0
    mn = int(m.group(2)) if m.group(2) else 0
    s = int(m.group(3)) if m.group(3) else 0
    return h*60 + mn + s/60

# Get channel stats
ch = fetch(f"https://www.googleapis.com/youtube/v3/channels?key={API_KEY}&id={CH_ID}&part=statistics,contentDetails")["items"][0]
subs = int(ch["statistics"]["subscriberCount"])
total_vids = int(ch["statistics"]["videoCount"])
total_views = int(ch["statistics"]["viewCount"])
uploads = ch["contentDetails"]["relatedPlaylists"]["uploads"]

label = LABEL or f"Channel {CH_ID}"
print(f"=== {label} DEEP DIVE ===")
print(f"Subs: {subs:,}")
print(f"Total videos: {total_vids:,}")
print(f"Total views: {total_views:,}")
print(f"Avg views/video: {total_views//total_vids:,}")

# Get ALL uploads (paginate through playlist)
all_videos = []
page_token = ""
while len(all_videos) < 200:
    pt = f"&pageToken={page_token}" if page_token else ""
    pl = fetch(f"https://www.googleapis.com/youtube/v3/playlistItems?key={API_KEY}&playlistId={uploads}&part=snippet&maxResults=50{pt}")
    for item in pl.get("items", []):
        all_videos.append({
            "id": item["snippet"]["resourceId"]["videoId"],
            "title": item["snippet"]["title"],
            "published": item["snippet"]["publishedAt"][:10],
        })
    page_token = pl.get("nextPageToken", "")
    if not page_token:
        break

print(f"\nFetched {len(all_videos)} video titles")

# Get video stats in batches of 50
all_stats = {}
for i in range(0, len(all_videos), 50):
    chunk = all_videos[i:i+50]
    ids = ",".join(v["id"] for v in chunk)
    vd = fetch(f"https://www.googleapis.com/youtube/v3/videos?key={API_KEY}&id={ids}&part=statistics,contentDetails")
    for vi in vd.get("items", []):
        vid = vi["id"]
        s = vi["statistics"]
        all_stats[vid] = {
            "views": int(s.get("viewCount", 0)),
            "likes": int(s.get("likeCount", 0)),
            "comments": int(s.get("commentCount", 0)),
            "duration": parse_duration(vi["contentDetails"]["duration"]),
        }

# Merge stats with titles
for v in all_videos:
    s = all_stats.get(v["id"], {})
    v["views"] = s.get("views", 0)
    v["likes"] = s.get("likes", 0)
    v["comments"] = s.get("comments", 0)
    v["duration"] = s.get("duration", 0)
    v["like_ratio"] = round(v["likes"] / max(v["views"], 1) * 100, 1)

# Filter to videos with views
videos = [v for v in all_videos if v["views"] > 0]
print(f"Videos with stats: {len(videos)}")

# Sort by views
videos.sort(key=lambda x: -x["views"])

# Overall stats
views_arr = np.array([v["views"] for v in videos])
print(f"\n=== OVERALL STATS ===")
print(f"Median views: {int(np.median(views_arr)):,}")
print(f"Mean views: {int(np.mean(views_arr)):,}")
print(f"P90 views: {int(np.percentile(views_arr, 90)):,}")
print(f"Max views: {max(views_arr):,}")

# Duration analysis
durs = [v["duration"] for v in videos if v["duration"] > 0]
print(f"\n=== DURATION ===")
print(f"Median: {np.median(durs):.1f} min")
print(f"Mean: {np.mean(durs):.1f} min")
print(f"Range: {min(durs):.1f} - {max(durs):.1f} min")

# TOP VIDEOS
print(f"\n=== TOP 20 VIDEOS BY VIEWS ===")
for i, v in enumerate(videos[:20]):
    print(f"{i+1:2d}. [{v['views']:>8,}] {v['title'][:70]}")
    print(f"     Dur: {v['duration']:.0f}min  Like: {v['like_ratio']:.1f}%  Date: {v['published']}")

# BOTTOM 10 VIDEOS (lowest views among those with >100 views)
bottom = [v for v in videos if v["views"] > 100][-10:]
print(f"\n=== BOTTOM 10 VIDEOS (with >100 views) ===")
for i, v in enumerate(reversed(bottom)):
    print(f"{i+1:2d}. [{v['views']:>7,}] {v['title'][:70]}")
    print(f"     Dur: {v['duration']:.0f}min  Like: {v['like_ratio']:.1f}%  Date: {v['published']}")

# TITLE PATTERN ANALYSIS
print(f"\n\n=== TITLE PATTERN ANALYSIS ===")

# Breakout threshold
median_v = np.median(views_arr)
breakout_v = [v for v in videos if v["views"] > median_v * 2]
normal_v = [v for v in videos if v["views"] <= median_v * 2 and v["views"] > 100]

print(f"Breakout videos (>2x median): {len(breakout_v)}")
print(f"Normal videos: {len(normal_v)}")

# Title features comparison
def extract_title_patterns(title):
    t = title.lower()
    features = {}
    features["has_question"] = 1 if "?" in t else 0
    features["has_colon"] = 1 if ":" in t else 0
    features["has_exclamation"] = 1 if "!" in t else 0
    features["has_number"] = 1 if bool(re.search(r'\d+', t)) else 0
    features["has_dash"] = 1 if "—" in t or "--" in t or "–" in t else 0
    features["starts_what"] = 1 if t.startswith("what") else 0
    features["starts_why"] = 1 if t.startswith("why") else 0
    features["starts_how"] = 1 if t.startswith("how") else 0
    features["starts_the"] = 1 if t.startswith("the") else 0
    features["has_bracket"] = 1 if "(" in t or "[" in t else 0
    features["word_count"] = len(t.split())
    return features

def avg_features(video_list):
    if not video_list:
        return {}
    feats = [extract_title_patterns(v["title"]) for v in video_list]
    avg = {}
    for key in feats[0]:
        if key == "word_count":
            avg[key] = np.mean([f[key] for f in feats])
        else:
            avg[key] = np.mean([f[key] for f in feats])
    return avg

breakout_feats = avg_features(breakout_v)
normal_feats = avg_features(normal_v)

print(f"\n{'Feature':20s} {'Breakout':>10s} {'Normal':>10s} {'Delta':>10s}")
print("-" * 55)
for key in ["has_question", "has_colon", "has_exclamation", "has_number",
            "has_dash", "starts_what", "starts_why", "starts_how", "starts_the",
            "has_bracket", "word_count"]:
    b = breakout_feats.get(key, 0)
    n = normal_feats.get(key, 0)
    delta = b - n
    print(f"{key:20s} {b:>10.1%} {n:>10.1%} {delta:>+10.1%}")

# Find repeated title patterns (number modification)
print(f"\n=== REPEATED TITLE PATTERNS ===")
# Look for base phrases that get reused with different numbers
cleaned = [(re.sub(r'\d+', '{N}', v["title"]), v["views"], v["title"]) for v in videos]
base_counts = Counter(c[0] for c in cleaned)
repeated = [(base, count) for base, count in base_counts.most_common(30) if count > 1]
print(f"\nPhrases reused with different numbers/topics:")
for base, count in repeated[:20]:
    examples = [c for c in cleaned if c[0] == base]
    avg_views = int(np.mean([e[1] for e in examples]))
    print(f"\n  [{count}x] avg {avg_views:,} views")
    for _, views, title in examples[:3]:
        print(f"    {views:>8,} | {title[:80]}")

# Best duration bucket
print(f"\n=== VIEWS BY DURATION BUCKET ===")
buckets = defaultdict(list)
for v in videos:
    if v["duration"] > 0 and v["duration"] < 120:
        b = int(v["duration"] // 5 * 5)
        buckets[b].append(v["views"])
for b in sorted(buckets):
    vs = buckets[b]
    if len(vs) < 3:
        continue
    print(f"  {b}-{b+5}min: {len(vs):>3} videos, median={int(np.median(vs)):>8,}")

# Date analysis
print(f"\n=== PUBLISH FREQUENCY ===")
dates = sorted([v["published"] for v in videos])
if len(dates) >= 2:
    first = dates[0]
    last = dates[-1]
    days_span = (datetime.strptime(last, '%Y-%m-%d') - datetime.strptime(first, '%Y-%m-%d')).days
    print(f"  First: {first}  Last: {last}  Span: {days_span} days")
    print(f"  Avg videos/month: {len(videos)/max(days_span/30,1):.1f}")

import json, datetime as dt
save_label = label.replace(" ", "_").lower().replace("'","").replace("é","e").replace("ä","a")[:20]
outpath = f"/root/projects/blog/data/research/layer2/analysis_{save_label}.json"

# Build full video list
video_data = []
for v in sorted(videos, key=lambda x: -x["views"]):
    video_data.append({
        "video_id": v["id"],
        "title": v["title"], "views": v["views"], "likes": v["likes"],
        "comments": v["comments"], "duration_min": round(v["duration"], 1),
        "like_ratio": v["like_ratio"], "published": v["published"],
        "is_breakout": bool(v["views"] > median_v * 2),
    })

result = {
    "channel": label, "channel_id": CH_ID, "subs": subs,
    "total_videos": total_vids, "total_views": total_views,
    "analyzed_videos": len(videos),
    "median_views": int(np.median(views_arr)),
    "mean_views": int(np.mean(views_arr)),
    "p90_views": int(np.percentile(views_arr, 90)),
    "max_views": int(max(views_arr)),
    "median_duration_min": round(float(np.median(durs)), 1),
    "breakout_rate": round(len(breakout_v)/len(videos), 2),
    "output_per_month": round(len(videos)/max(days_span/30,1), 1) if len(dates) >= 2 else 0,
    "title_patterns": {
        k: {"breakout": round(breakout_feats.get(k, 0), 3),
            "normal": round(normal_feats.get(k, 0), 3),
            "delta": round(breakout_feats.get(k, 0) - normal_feats.get(k, 0), 3)}
        for k in ["has_question", "has_colon", "has_exclamation", "has_number",
                  "starts_what", "starts_why", "starts_how", "starts_the", "word_count"]
    },
    "videos": video_data,
}
with open(outpath, "w") as f:
    json.dump(result, f, indent=2)
print(f"  Saved {len(video_data)} videos to {outpath}")
