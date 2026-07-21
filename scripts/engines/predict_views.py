#!/usr/bin/env python3
"""
Pattern score for a title (+ optional thumbnail).
Trained on 94 channels. Reports training-set pattern score (NOT validated prediction).

Usage:
  python3 predict_views.py "What is Kashmir Shaivism?"
  python3 predict_views.py --batch titles.txt

NOTE: This scores titles against patterns in training data. It has NOT passed
out-of-sample validation. Do not treat scores as true breakout probabilities.
"""

import json, sys, os, re, numpy as np, urllib.request, io, warnings
from pathlib import Path
from sklearn.model_selection import train_test_split

warnings.filterwarnings("ignore")

DATA_DIR = Path(__file__).parent.parent.parent / "data" / "research" / "layer2"

class ViewsPredictor:
    def __init__(self):
        self.model = None
        self.feature_names = None
        self.baseline_rate = 0.25
        self.holdout_auc = None
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
        f["log_subs"] = np.log10(max(v.get("_subs", 1000), 1000))
        # Thumbnail features: null when unanalyzed
        f["thumb_analyzed"] = 1 if v.get("has_text") is not None else 0
        f["has_thumb_text"] = v.get("has_text") if v.get("has_text") is not None else -1
        f["thumb_face_count"] = v.get("face_count") if v.get("face_count") is not None else -1
        return f

    def _train(self):
        from xgboost import XGBClassifier
        from sklearn.metrics import roc_auc_score
        videos = self._load_data()
        print(f"Training on {len(videos)} videos...", file=sys.stderr)

        X, y = [], []
        for v in videos:
            X.append(self._extract_features(v))
            y.append(1 if v.get("is_breakout") else 0)

        self.feature_names = list(X[0].keys())
        X_arr = np.array([[x[k] for k in self.feature_names] for x in X])
        y_arr = np.array(y)
        self.baseline_rate = float(y_arr.mean())

        # Train/test split for reporting
        X_tr, X_te, y_tr, y_te = train_test_split(X_arr, y_arr, test_size=0.2, random_state=42)
        self.model = XGBClassifier(n_estimators=200, max_depth=4, learning_rate=0.1, random_state=42, eval_metric="logloss")
        self.model.fit(X_tr, y_tr)
        preds = self.model.predict_proba(X_te)[:, 1]
        self.holdout_auc = round(float(roc_auc_score(y_te, preds)), 3)
        print(f"Baseline: {self.baseline_rate:.0%} | Holdout AUC: {self.holdout_auc}", file=sys.stderr)

    def predict(self, title):
        f = self._extract_features({"title": title, "duration_min": 20, "_subs": 100000})
        X = np.array([[f[k] for k in self.feature_names]])
        prob = float(self.model.predict_proba(X)[0][1])
        return {
            "title": title,
            "pattern_score": round(prob, 3),
            "baseline_rate": self.baseline_rate,
            "holdout_auc": self.holdout_auc,
            "note": "Training-set pattern score. Not validated on held-out channels. See AUDIT-FLAWS.md.",
        }


def main():
    predictor = ViewsPredictor()
    if len(sys.argv) < 2:
        print("Usage: predict_views.py <title> [--batch file]")
        sys.exit(1)

    if sys.argv[1] == "--batch":
        path = sys.argv[2]
        titles = Path(path).read_text().splitlines()
        titles = [t.strip() for t in titles if t.strip()]
        results = [predictor.predict(t) for t in titles]
    else:
        title = " ".join(a for a in sys.argv[1:] if not a.startswith("--"))
        results = [predictor.predict(title)]

    print(json.dumps(results, indent=2))


if __name__ == "__main__":
    main()
