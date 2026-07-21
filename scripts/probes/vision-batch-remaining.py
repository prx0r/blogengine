#!/usr/bin/env python3
"""Batch analyze remaining thumbnails via Google Cloud Vision API."""
import json, urllib.request, time, sys
from pathlib import Path

API_KEY = "AIzaSyA7-ZK5BGBxDwGCGx1Wiro0fB7NfX68KIc"
DATA_DIR = Path("/root/projects/blog/data/research/layer2")
OUT = DATA_DIR / "thumbnails-data.json"

with open(OUT) as f:
    data = json.load(f)

all_ids = set()
for f in sorted(DATA_DIR.glob("analysis_*.json")):
    with open(f) as fh:
        d = json.load(fh)
    for v in d["videos"]:
        if v.get("video_id"):
            all_ids.add(v["video_id"])

existing = set(data["thumbnails"].keys())
pending = sorted(all_ids - existing)
total_target = len(pending) + len(existing)
print(f"Existing: {len(existing)}, Pending: {len(pending)}, Total target: {total_target}")

url = f"https://vision.googleapis.com/v1/images:annotate?key={API_KEY}"
FEATURES = [
    {"type": "LABEL_DETECTION", "maxResults": 10},
    {"type": "TEXT_DETECTION", "maxResults": 5},
    {"type": "IMAGE_PROPERTIES", "maxResults": 5},
    {"type": "FACE_DETECTION", "maxResults": 5},
    {"type": "OBJECT_LOCALIZATION", "maxResults": 8},
    {"type": "WEB_DETECTION", "maxResults": 8},
]

def parse_one(vid, result):
    entry = {"video_id": vid}
    err = result.get("error", {})
    if err:
        entry["error"] = err.get("message", "unknown")
        return entry
    labels = result.get("labelAnnotations", [])
    entry["labels"] = [{"label": l["description"], "score": round(l["score"], 3)} for l in labels[:10]]
    text_data = result.get("textAnnotations", [])
    if text_data:
        entry["has_text"] = True
        entry["text_detected"] = text_data[0].get("description", "")[:200]
        entry["thumbnail_word_count"] = len(text_data[0].get("description", "").split())
    else:
        entry["has_text"] = False
        entry["text_detected"] = ""
        entry["thumbnail_word_count"] = 0
    colors = result.get("imagePropertiesAnnotation", {}).get("dominantColors", {}).get("colors", [])
    entry["dominant_colors"] = [{
        "hex": f"#{c['color'].get('red',0):02x}{c['color'].get('green',0):02x}{c['color'].get('blue',0):02x}",
        "score": round(c.get("score", 0), 3),
        "pixel_fraction": round(c.get("pixelFraction", 0), 3),
    } for c in colors[:5]]
    faces = result.get("faceAnnotations", [])
    entry["face_count"] = len(faces)
    if faces:
        entry["faces"] = [{"joy": f.get("joyLikelihood",""), "sorrow": f.get("sorrowLikelihood",""),
                           "anger": f.get("angerLikelihood",""), "surprise": f.get("surpriseLikelihood","")} for f in faces]
    objects = result.get("localizedObjectAnnotations", [])
    entry["objects"] = [{"name": o["name"], "score": round(o["score"], 3)} for o in objects[:8]]
    web = result.get("webDetection", {})
    entities = web.get("webEntities", [])
    entry["web_entities"] = [e.get("description", "") for e in entities[:6] if e.get("description")]
    best = web.get("bestGuessLabels", [])
    entry["web_best_guess"] = best[0].get("label", "") if best else ""
    return entry

processed = len(existing)
for i in range(0, len(pending), 16):
    batch = pending[i:i+16]
    requests = [{"image": {"source": {"imageUri": f"https://img.youtube.com/vi/{v}/maxresdefault.jpg"}},
                 "features": FEATURES} for v in batch]
    try:
        body = json.dumps({"requests": requests}).encode()
        req = urllib.request.Request(url, data=body, headers={"Content-Type": "application/json"})
        resp = json.loads(urllib.request.urlopen(req, timeout=30).read())
        for vid, result in zip(batch, resp.get("responses", [])):
            data["thumbnails"][vid] = parse_one(vid, result)
            processed += 1
    except Exception as e:
        print(f"  Batch {i//16} failed: {e}")
        time.sleep(2)

    data["total_thumbnails"] = processed
    if (i // 48) % 3 == 0:
        with open(OUT, "w") as f:
            json.dump(data, f, indent=2)
        print(f"  [{processed}/{total_target}]")

    time.sleep(0.25)

with open(OUT, "w") as f:
    json.dump(data, f, indent=2)
print(f"DONE — {processed} thumbnails")
