---
name: headline-engine
description: Score video titles against Upworthy-derived causal priors
version: 0.1.0
metadata:
  hermes:
    tags: [engine, title, headline, upworthy]
    requires_tools: [execute_python]
---

# Headline Engine (E1)

Scores titles using causal A/B test data from 32k Upworthy experiments. Returns per-feature breakdown, overall score, confidence band.

## Usage

```
/headline-score "Your Title Here"
/headline-score --batch titles.txt
```

## Rules

1. Use as soft priors only — surface features hit 52.5% ceiling
2. "Actually" (+29%) and "Never" (+16%) are strong but low-n (n<300)
3. Questions lose on average, but "What" questions win (+0.29 coefficient)
4. Imperative openings win (+16%)
5. Exclamation marks and colons lose
6. "Why" openings are the worst (-0.37 coefficient)

## Live Validation

When generating titles for a video, produce 3 variants and score all 3. The highest-scoring title is the default; the others are backups. After publishing, record which title was used and its performance — this builds our own causal dataset.

## Files

- `scripts/engines/headline_score.py` — scoring function
- `data/research/upworthy/README.md` — full analysis
