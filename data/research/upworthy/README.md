# Upworthy Title Analysis — Causal Title Prior

## What We Were Testing

Single question: **Do headline semantic features predict click-through in a causally identified setting?**

Upworthy ran 32k A/B tests (2013-2015) where the same content (eyecatcher) was paired with multiple headlines. Winner = headline with highest CTR. This gives us causal-validated feature effects, not just observational correlations.

| Assumption | Question | Test |
|-----------|----------|------|
| U1 | Do individual headline features (questions, exclamation, length, etc.) have reliable win/lose effects? | Per-feature win rate comparison using within-test pairs |
| U2 | Can a multivariate model predict pairwise winners above chance? | Logistic regression on feature differences, validated on held-out tests |

---

## Method

**Data:** Upworthy Research Archive confirmatory dataset (105k rows, 5,385 valid tests with ≥2 variants and a winner)

**Filtering:** Only tests with ≥100 impressions per variant. Tests without a clear winner excluded.

**Features (23):** Word/char count, question/exclamation/colon presence, numbers, 2nd person, negation, curiosity gap, urgency, specificity, imperative opening, question-word opening, uppercase ratio.

**Modeling:**
1. Per-feature win rate: when feature A > feature B in a pairwise comparison, how often does A win?
2. Logistic regression on feature difference vectors (winner minus loser features), L2 regularization, 80/20 test-level split.

---

## Results

### Experiment 1: Per-Feature Win Rates

Strongest individual signals (n ≥ 200 comparisons):

| Feature | Present Wins | Absent Wins | Lift | Direction |
|---------|-------------|-------------|------|-----------|
| has_actually | 64.7% | 35.3% | +29.4% | ✅ Use |
| has_question | 38.7% | 61.3% | -22.6% | ❌ Avoid |
| has_exclamation | 39.0% | 61.0% | -22.0% | ❌ Avoid |
| has_why | 40.9% | 59.1% | -18.2% | ❌ Avoid |
| first_word_is_verb | 58.2% | 41.8% | +16.4% | ✅ Use |
| has_never | 57.9% | 42.1% | +15.7% | ✅ Use |
| has_colon | 42.4% | 57.6% | -15.3% | ❌ Avoid |
| curiosity_gap | 43.1% | 56.9% | -13.7% | ❌ Avoid |
| has_your | 44.5% | 55.5% | -11.1% | ❌ Avoid |
| has_this | 55.4% | 44.6% | +10.9% | ✅ Use |
| word_count (longer) | 54.5% | 45.5% | +9.0% | ✅ Use |
| has_number | 54.1% | 45.9% | +8.1% | ✅ Use |

### Experiment 2: Logistic Regression

| Metric | Value |
|--------|-------|
| Training accuracy | 52.23% |
| **Holdout accuracy** | **52.54%** |
| Training AUC | 0.540 |
| **Holdout AUC** | **0.545** |
| Baseline (random) | 50.0% |
| **Gate (0.55)** | **FAIL** |

Top coefficients (direction + magnitude):
```
never:          +0.49  (strongest positive)
actually:       +0.48  (strong positive)
first_verb:     +0.29  (imperative opening)
what:           +0.29  ("what" questions > other question types)
why:            -0.37  (strongest negative — "why" is a loser)
q (question):   -0.27  (question marks lose, consistent with "why" but "what" is positive)
excl:           -0.26  (exclamation marks lose)
your:           -0.22  (second-person possessive loses)
```

---

## The Drill-Down

### U1: Per-feature win rates — consistent and interpretable

The simple pairwise comparison (when feature A > feature B, how often does A win?) produced clean, internally consistent signals. Questions lose, imperatives win, "actually" and "never" are the surprise winners. **No probe needed** — the signals were clear at full n.

### U2: Logistic regression — above chance, below the gate

The model adds ~2.5% over random baseline on held-out tests. This is real but small.

**Probe 1: Is the signal ceiling caused by features or the model?** The 23 surface features are crude (binary presence of words like "actually," word count, punctuation). They can't capture semantic nuance — the difference between "Why X Matters" and "What X Means" is encoded as a single binary "why vs not-why" feature. An embedding-based model with LLM semantic features (concreteness, epistemic posture, narrative frame) would almost certainly perform better.

**Probe 2: Are the directions trustworthy despite the weak overall model?** Yes — Upworthy's experiment design is a genuine A/B test (random assignment of headlines to content). Each coefficient is identified from thousands of independent comparisons. The directions are causally valid within the Upworthy domain.

**Probe 3: Do these transfer to YouTube documentary titles?** Unknown. The data is 2013-2015 Upworthy (list-style clickbait). A "Why" question that bombs in a Facebook feed may perform differently as a YouTube documentary title. These priors should be tested against our own channel's A/B data once available.

---

## Established Decisions

| Decision | Evidence | Source |
|----------|----------|--------|
| **Use as soft priors** for title generation | 5,385 causally identified experiments | U1 per-feature win rates |
| **Do not use as a hard pairwise ranker** | 52.5% holdout accuracy (below 0.55 gate) | U2 logistic regression |
| **Questions in headlines** are likely net-negative | −22.6% lift across 1,882 comparisons | U1 |
| **"Why" is worse than "What"** for headline openings | "Why" coefficient −0.37 vs "What" +0.29 | U2 |
| **"Actually" and "Never"** are strong positive signals | +29% and +16% lift respectively | U1 |
| **Imperative verb openings** (Watch, Learn, See) outperform | +16.4% lift | U1 |
| **Surface features alone cannot reach production ranker accuracy** | Ceiling at ~52.5% | U2 |
| **Test with embeddings before abandoning the approach** | 52.5% >> 50% baseline — signal exists, model is weak | U2 probe |

---

## What This Does NOT Mean

- **Not:** "Questions are always bad." In some contexts, a well-framed question performs. The average effect is negative, which means default to statements unless there's a specific reason to use a question.
- **Not:** "Upworthy priors apply to YouTube documentaries." Domain transfer is unvalidated. Use these as a starting point, test against own data.
- **Not:** "The title problem is solved." A 52.5% ceiling means most of the signal is in features we didn't capture (semantic nuance, audience targeting, thumbnail interaction).
- **Not:** "'Never' and 'Actually' are magic words." Their positive signal may reflect the type of content they introduce, not the words themselves. Use them to frame counterintuitive claims, not as generic boosters.

---

## Limitations

| Limitation | Impact |
|-----------|--------|
| Upworthy headlines are 2013-2015 clickbait (list-style, share-oriented) | Domain mismatch with YouTube documentary titles |
| Only 23 surface-level features tested | Misses semantic nuance, narrative structure, audience targeting |
| Simple binary feature encoding loses intensity/position information | "REALLY big" vs "really interesting" treated identically |
| No thumbnail interaction tested | CTR depends on headline+thumbnail together, not headline alone |
| No YouTube-specific features (watch time, retention) | Platform-specific dynamics not captured |
| Only confirmatory dataset analyzed | Holdout and exploratory datasets unused |
| No temporal validation | Causal within 2013-2015 but may not hold in 2026 |

---

## Files

| File | Purpose |
|------|---------|
| `scripts/upworthy-title-analysis.py` | Experiment script (data loading, feature extraction, models) |
| `data/research/upworthy/upworthy-title-analysis-*.json` | Per-feature win rates (simple voting model) |
| `data/research/upworthy/upworthy-logistic-*.json` | Logistic regression results with coefficients |
| `data/research/upworthy/README.md` | This file |

## Next Steps

1. **Test on holdout dataset** (`upworthy-archive-holdout-packages-03.12.2020.csv`) — same features, see if accuracy holds
2. **Add embedding-based semantic features** — use LLM to extract concreteness, epistemic posture, narrative frame from headlines
3. **Test transfer on own channel data** — once first videos are published, run native A/B tests on titles and compare coefficient directions
4. **Replace surface features with LLM embeddings** — if embedding model adds >5% to holdout accuracy, deploy as a title ranker
5. **Cross with thumbnail features** — the Upworthy dataset includes eyecatcher_id; can model headline×thumbnail interactions
