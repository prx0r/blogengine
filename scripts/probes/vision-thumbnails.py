#!/usr/bin/env python3
"""Batch analyze all thumbnails via Google Cloud Vision API.

Requests per image: labels, OCR text, dominant colors, faces, objects, safe search.
Cross-references with performance data (views, breakout status).

Usage: VISION_API_KEY=... python3 vision-thumbnails.py
"""

import json, os, urllib.request, time
from pathlib import Path
from collections import defaultdict

API_KEY = os.environ.get("VISION_API_KEY", "AIzaSyA7-ZK5BGBxDwGCGx1Wiro0fB7NfX68KIc")
DATA_DIR = Path("/root/projects/blog/data/research/layer2")
OUT_PATH = DATA_DIR / "thumbnails-analysis.json"

def fetch_videos():
    videos = []
    for f in sorted(DATA_DIR.glob("analysis_*.json")):
        with open(f) as fh:
            d = json.load(fh)
        channel = d["channel"]
        for v in d["videos"]:
            if v.get("video_id"):
                videos.append({
                    "video_id": v["video_id"],
                    "channel": channel,
                    "title": v["title"],
                    "views": v["views"],
                    "is_breakout": v["is_breakout"],
                    "duration_min": v.get("duration_min", 0),
                })
    return videos

def call_vision(image_url, features, retries=2):
    body = {
        "requests": [{
            "image": {"source": {"imageUri": image_url}},
            "features": [{"type": f, "maxResults": 10} for f in features],
        }]
    }
    url = f"https://vision.googleapis.com/v1/images:annotate?key={API_KEY}"
    data = json.dumps(body).encode()
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    for attempt in range(retries):
        try:
            resp = urllib.request.urlopen(req, timeout=15)
            result = json.loads(resp.read())
            return result.get("responses", [{}])[0]
        except Exception as e:
            if attempt < retries - 1:
                time.sleep(1)
            else:
                return {"error": str(e)}

def extract_thumbnail_data(video_id):
    url = f"https://img.youtube.com/vi/{video_id}/maxresdefault.jpg"
    features = ["LABEL_DETECTION", "TEXT_DETECTION", "IMAGE_PROPERTIES",
                 "FACE_DETECTION", "OBJECT_LOCALIZATION", "SAFE_SEARCH_DETECTION",
                 "WEB_DETECTION"]
    return call_vision(url, features)

def parse_result(video, result):
    entry = {"video_id": video["video_id"], "channel": video["channel"],
             "title": video["title"], "views": video["views"],
             "is_breakout": video["is_breakout"]}

    if "error" in result:
        entry["error"] = result["error"]
        return entry

    # Labels
    labels = result.get("labelAnnotations", [])
    entry["labels"] = [{"label": l["description"], "score": round(l["score"], 3)} for l in labels[:10]]

    # Text / OCR
    text_data = result.get("textAnnotations", [])
    if text_data:
        entry["has_text"] = True
        entry["text_detected"] = text_data[0].get("description", "")[:200]
        # Word count on thumbnail
        entry["thumbnail_word_count"] = len(text_data[0].get("description", "").split())
    else:
        entry["has_text"] = False
        entry["text_detected"] = ""
        entry["thumbnail_word_count"] = 0

    # Dominant colors
    colors = result.get("imagePropertiesAnnotation", {}).get("dominantColors", {}).get("colors", [])
    entry["dominant_colors"] = [{
        "hex": f"#{c['color'].get('red',0):02x}{c['color'].get('green',0):02x}{c['color'].get('blue',0):02x}",
        "score": round(c.get("score", 0), 3),
        "pixel_fraction": round(c.get("pixelFraction", 0), 3),
    } for c in colors[:5]]

    # Faces
    faces = result.get("faceAnnotations", [])
    entry["face_count"] = len(faces)
    if faces:
        emotions = []
        for f in faces:
            emotions.append({
                "joy": f.get("joyLikelihood", ""),
                "sorrow": f.get("sorrowLikelihood", ""),
                "anger": f.get("angerLikelihood", ""),
                "surprise": f.get("surpriseLikelihood", ""),
                "headwear": f.get("headwearLikelihood", ""),
            })
        entry["faces"] = emotions

    # Objects
    objects = result.get("localizedObjectAnnotations", [])
    entry["objects"] = [{"name": o["name"], "score": round(o["score"], 3)} for o in objects[:8]]

    # Safe search
    safe = result.get("safeSearchAnnotation", {})
    entry["safe_search"] = {k: v for k, v in safe.items() if k in ("adult", "violence", "racy", "spoof", "medical")}

    # Web entities
    web = result.get("webDetection", {})
    web_entities = web.get("webEntities", [])
    entry["web_entities"] = [{"entity": e.get("description", ""), "score": round(e.get("score", 0), 3)}
                              for e in web_entities[:8] if e.get("description")]
    best_guess = web.get("bestGuessLabels", [])
    entry["web_best_guess"] = best_guess[0].get("label", "") if best_guess else ""

    return entry

def main():
    videos = fetch_videos()
    print(f"Total videos: {len(videos)}")

    # Load existing results if any
    results = []
    processed_ids = set()
    if OUT_PATH.exists():
        with open(OUT_PATH) as f:
            existing = json.load(f)
        results = existing.get("results", [])
        processed_ids = {r["video_id"] for r in results}
        print(f"Loaded {len(results)} existing results ({len(processed_ids)} unique videos)")

    pending = [v for v in videos if v["video_id"] not in processed_ids]
    print(f"Pending: {len(pending)}")

    for i, video in enumerate(pending):
        result = extract_thumbnail_data(video["video_id"])
        entry = parse_result(video, result)
        results.append(entry)

        if (i + 1) % 10 == 0 or i == 0:
            print(f"  [{i+1}/{len(pending)}] {video['video_id']} — labels={len(entry.get('labels',[]))} text={entry.get('has_text')} faces={entry.get('face_count')}")

        if (i + 1) % 16 == 0:
            time.sleep(0.5)
            # Save progress periodically
            with open(OUT_PATH, "w") as f:
                json.dump({"total": len(results), "results": results}, f, indent=2)

    # Final save
    with open(OUT_PATH, "w") as f:
        json.dump({"total": len(results), "results": results}, f, indent=2)

    # Quick summary
    breakout = [r for r in results if r["is_breakout"]]
    normal = [r for r in results if not r["is_breakout"]]
    print(f"\n=== QUICK SUMMARY ===")
    print(f"Total: {len(results)} | Breakout: {len(breakout)} | Normal: {len(normal)}")

    # Compare label frequencies
    def top_labels(video_list, n=10):
        counts = defaultdict(int)
        for v in video_list:
            for l in v.get("labels", []):
                counts[l["label"]] += 1
        return sorted(counts.items(), key=lambda x: -x[1])[:n]

    print(f"\nTop labels — Breakout videos:")
    for label, count in top_labels(breakout):
        print(f"  {label}: {count}")
    print(f"\nTop labels — Normal videos:")
    for label, count in top_labels(normal):
        print(f"  {label}: {count}")

    # Text presence comparison
    def text_rate(video_list):
        return sum(1 for v in video_list if v.get("has_text")) / len(video_list) * 100 if video_list else 0

    print(f"\nText on thumbnail: Breakout={text_rate(breakout):.0f}% | Normal={text_rate(normal):.0f}%")

    # Face presence
    def face_rate(video_list):
        return sum(1 for v in video_list if v.get("face_count", 0) > 0) / len(video_list) * 100 if video_list else 0

    print(f"Faces in thumbnail: Breakout={face_rate(breakout):.0f}% | Normal={face_rate(normal):.0f}%")

    print(f"\nFull results saved to {OUT_PATH}")

if __name__ == "__main__":
    main()
