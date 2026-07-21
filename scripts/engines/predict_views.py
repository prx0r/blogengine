#!/usr/bin/env python3
"""
Predict breakout probability for a title (+ optional thumbnail).
Trains on our 27 analyzed channels (~4,200+ videos).

Usage:
  python3 predict_views.py "What is Kashmir Shaivism?"
  python3 predict_views.py "The Secret Teachings Of Tantra" --thumbnail https://...
  python3 predict_views.py --batch titles.txt
"""

import json, sys, os, re, numpy as np, urllib.request, io, warnings
from pathlib import Path

warnings.filterwarnings("ignore")

DATA_DIR = Path(__file__).parent.parent.parent / "data" / "research" / "layer2"
API_KEY = "AIzaSyA7-ZK5BGBxDwGCGx1Wiro0fB7NfX68KIc"

class ViewsPredictor:
    def __init__(self):
        self.model = None
        self.feature_names = None
        self.clip_model = None
        self.clip_processor = None
        self._train()

    def _load_data(self):
        videos = []
        for f in sorted(DATA_DIR.glob("analysis_*.json")):
            with open(f) as fh:
                ch = json.load(fh)
            for v in ch["videos"]:
                videos.append({**v, "_subs": ch["subs"]})
        return videos

    def _extract_features(self, v):
        t = v.get("title", "").lower()
        f = {}
        f["title_word_count"] = len(t.split())
        f["has_question"] = 1 if "?" in t else 0
        f["has_colon"] = 1 if ":" in t else 0
        f["has_number"] = 1 if any(c.isdigit() for c in t) else 0
        f["starts_the"] = 1 if t.startswith("the ") else 0
        f["starts_what"] = 1 if t.startswith("what") else 0
        f["starts_how"] = 1 if t.startswith("how") else 0
        f["starts_why"] = 1 if t.startswith("why") else 0
        f["duration_min"] = v.get("duration_min", 20)
        f["channel_subs"] = np.log10(max(v.get("_subs", 100000), 1000))
        f["has_thumb_text"] = v.get("has_text", 0)
        f["thumb_face_count"] = v.get("face_count", 0)
        f["thumb_is_graphic"] = 1 if any(l in str(v.get("labels", [])) for l in ["Graphics", "Symbol", "Animation"]) else 0
        return f

    def _train(self):
        from xgboost import XGBClassifier
        videos = self._load_data()
        print(f"Training on {len(videos)} videos...", file=sys.stderr)

        X, y = [], []
        for v in videos:
            X.append(self._extract_features(v))
            y.append(1 if v.get("is_breakout") else 0)

        self.feature_names = list(X[0].keys())
        X_arr = np.array([[x[k] for k in self.feature_names] for x in X])
        y_arr = np.array(y)

        self.model = XGBClassifier(n_estimators=200, max_depth=4, learning_rate=0.1, random_state=42, eval_metric="logloss")
        self.model.fit(X_arr, y_arr)
        self.baseline_rate = y_arr.mean()

        # Train CLIP once if possible
        try:
            PYTHONPATH = os.environ.get("PYTHONPATH", "")
            if "/mnt/HC_Volume_106427611/pythonlibs" in PYTHONPATH:
                from transformers import CLIPProcessor, CLIPModel
                self.clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
                self.clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
        except:
            pass

        print(f"Baseline breakout rate: {self.baseline_rate:.0%}", file=sys.stderr)
        print(f"Features: {self.feature_names}", file=sys.stderr)

    def predict_title(self, title):
        f = self._extract_features({"title": title, "duration_min": 20, "_subs": 100000})
        X = np.array([[f[k] for k in self.feature_names]])
        prob = float(self.model.predict_proba(X)[0][1])

        # Feature contributions (direction-aware from known deltas)
        DIRECTIONS = {"has_number": -1, "has_colon": -1, "has_question": 1, "starts_what": 1,
                      "starts_how": 1, "starts_the": 1, "has_thumb_text": 1, "thumb_is_graphic": 1}
        importances = self.model.feature_importances_.tolist()
        contribs = []
        for name, val in f.items():
            if name in ("channel_subs", "duration_min", "title_word_count"):
                continue
            idx = self.feature_names.index(name)
            if val == 0:
                continue
            direction = DIRECTIONS.get(name, 1)
            impact = direction * float(importances[idx]) * 10
            contribs.append({"feature": name, "present": bool(val), "impact": round(impact, 3)})
        contribs.sort(key=lambda x: -abs(x["impact"]))

        return {
            "title": title,
            "breakout_probability": round(prob, 3),
            "baseline_rate": round(self.baseline_rate, 3),
            "verdict": "ABOVE BASELINE" if prob > self.baseline_rate else "BELOW BASELINE",
            "confidence": "medium" if abs(prob - self.baseline_rate) > 0.05 else "low",
            "feature_contributions": contribs,
        }

    def predict_with_thumbnail(self, title, thumbnail_url):
        result = self.predict_title(title)
        if self.clip_model is None:
            result["clip_note"] = "CLIP not available. Set PYTHONPATH=/mnt/HC_Volume_106427611/pythonlibs"
            return result

        try:
            resp = urllib.request.urlopen(thumbnail_url, timeout=5)
            from PIL import Image
            img = Image.open(io.BytesIO(resp.read()))
            inputs = self.clip_processor(text=[title], images=img, return_tensors="pt", padding=True, truncation=True)
            import torch
            inputs = {k: v.to("cpu") for k, v in inputs.items()}
            with torch.no_grad():
                outputs = self.clip_model(**inputs)
            sim = float(outputs.logits_per_image[0][0].item())
            result["clip_title_thumbnail_alignment"] = round(sim, 1)
            if sim > 30:
                result["clip_note"] = "Good alignment — title and thumbnail match well"
            elif sim > 25:
                result["clip_note"] = "Moderate alignment"
            else:
                result["clip_note"] = "Low alignment — thumbnail may not match title"
        except Exception as e:
            result["clip_note"] = f"Thumbnail error: {e}"

        return result


def main():
    predictor = ViewsPredictor()

    if len(sys.argv) < 2:
        print("Usage: predict_views.py <title> [--thumbnail URL] [--batch file]")
        sys.exit(1)

    if sys.argv[1] == "--batch":
        path = sys.argv[2]
        titles = Path(path).read_text().splitlines()
        titles = [t.strip() for t in titles if t.strip()]
        results = [predictor.predict_title(t) for t in titles]
    else:
        title = " ".join(a for a in sys.argv[1:] if not a.startswith("--"))
        if "--thumbnail" in sys.argv:
            idx = sys.argv.index("--thumbnail")
            url = sys.argv[idx + 1]
            results = [predictor.predict_with_thumbnail(title, url)]
        else:
            results = [predictor.predict_title(title)]

    print(json.dumps(results, indent=2))


if __name__ == "__main__":
    main()
