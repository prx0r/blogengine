#!/usr/bin/env python3
"""
Headline Engine (E1) — Title scoring from Upworthy's 32k causal A/B tests.

Returns per-feature breakdown + overall score + confidence bands.
Use as soft priors for title generation. NOT a hard ranker (52.5% ceiling).

Call:  python3 headline_score.py "Your Title Here"
       python3 headline_score.py --batch titles.txt
"""

import json, re, sys, math
from pathlib import Path

# Coefficients from YouTube documentary channel analysis (1,400+ videos, 8 channels)
# These replace Upworthy's Facebook clickbait priors which DON'T transfer
# Source: XGBoost breakout predictor trained on channel data
PRIORS = {
    "has_number":         (-0.094, 1400, -0.15, -0.04),
    "has_colon":          (-0.025, 1400, -0.08, 0.03),
    "has_question":       (0.089, 1400, 0.03, 0.14),
    "starts_what":        (0.052, 1400, 0.01, 0.10),
    "starts_how":         (0.033, 1400, -0.02, 0.08),
    "starts_the":         (0.042, 1400, -0.01, 0.09),
    "first_word_is_verb": (0.040, 1400, -0.02, 0.10),
}

IMPERATIVE_VERBS = {"watch", "learn", "see", "try", "get", "find", "make",
                    "discover", "start", "stop", "how", "why", "what"}

QUESTION_WORDS = {"why", "what", "how", "does", "is", "are", "can", "do", "will", "should", "have", "has", "did", "could", "would"}

def extract_features(title):
    h = title.strip()
    lower = h.lower()
    words = h.split()
    features = {
        "has_question": 1 if "?" in h else 0,
        "has_colon": 1 if ":" in h else 0,
        "has_exclamation": 1 if "!" in h else 0,
        "has_quotes": 1 if '"' in h or "'" in h else 0,
        "has_number": 1 if bool(re.search(r'\d', h)) else 0,
        "has_actually": 1 if "actually" in lower else 0,
        "has_never": 1 if " never " in f" {lower} " or lower.startswith("never ") else 0,
        "has_this": 1 if " this " in f" {lower} " else 0,
        "has_your": 1 if " your " in f" {lower} " else 0,
        "has_why": 1 if lower.startswith("why") else 0,
        "has_you": 1 if " you " in f" {lower} " else 0,
        "word_count": len(words),
        "char_count": len(h),
    }
    first_word = words[0].lower().strip('"\'-\u2018\u2019') if words else ""
    features["first_word_is_verb"] = 1 if first_word in IMPERATIVE_VERBS else 0
    features["first_word_is_question"] = 1 if first_word in QUESTION_WORDS else 0
    features["starts_what"] = 1 if lower.startswith("what") else 0
    features["starts_how"] = 1 if lower.startswith("how") else 0
    features["starts_the"] = 1 if lower.startswith("the ") else 0
    features["word_count_above_median"] = 1 if features["word_count"] > 10 else 0
    has_how = 1 if " how " in f" {lower} " or lower.startswith("how ") else 0
    has_what = 1 if " what " in f" {lower} " or lower.startswith("what ") else 0
    features["curiosity_gap"] = 1 if (features["has_why"] or has_how or features["has_question"] or has_what) else 0

    return features

def score_title(title):
    features = extract_features(title)
    score = 0.0
    total_weight = 0
    breakdown = []

    for feat, (lift, n, ci_lo, ci_hi) in PRIORS.items():
        if features.get(feat):
            weight = min(n / 500, 3.0)  # cap weight at n=1500
            score += lift * weight
            total_weight += weight
            breakdown.append({
                "feature": feat,
                "lift": round(lift, 3),
                "weight": round(weight, 2),
                "ci_95": [round(ci_lo, 3), round(ci_hi, 3)],
                "n_comparisons": n,
            })

    if total_weight > 0:
        score /= total_weight
    else:
        breakdown.append({"feature": "no_priors_detected", "lift": 0, "weight": 0})

    # Confidence based on total evidence
    total_n = sum(b["n_comparisons"] for b in breakdown)
    if total_n < 500:
        confidence = "low"
    elif total_n < 2000:
        confidence = "medium"
    else:
        confidence = "high"

    return {
        "title": title,
        "score": round(score, 3),
        "confidence": confidence,
        "total_evidence_n": total_n,
        "features_detected": len(breakdown),
        "breakdown": breakdown,
    }

def batch_score(titles):
    return [score_title(t) for t in titles]

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: headline_score.py <title> | --batch <file>")
        sys.exit(1)

    if sys.argv[1] == "--batch":
        path = sys.argv[2]
        titles = Path(path).read_text().splitlines()
        titles = [t.strip() for t in titles if t.strip()]
        results = batch_score(titles)
    else:
        title = " ".join(sys.argv[1:])
        results = [score_title(title)]

    print(json.dumps(results, indent=2))
