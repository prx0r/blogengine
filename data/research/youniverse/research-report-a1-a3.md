# Research Report: Breakout Metric Differentiation (A1-A3)

**Status:** Preliminary analysis — not a completed validation.
**Recommendation:** Use the residual metric provisionally alongside simpler baselines while collecting video-level data that can support a proper validation.

---

## What This Analysis Actually Tests

The question is not "which metric is better?" — we cannot answer that with this dataset. The question is: **does an age-normalized residual produce materially different rankings from raw cumulative views?** If yes, it's worth investigating further. If no, there's nothing to pursue.

---

## A1: OLS Residual vs Raw Views

### Method

For each channel with ≥20 videos, fit:

```
log(view_count) ~ log(age_days + 1)
```

Compute residual = actual - predicted. Label top quartile by residual. Compare overlap with top quartile by raw view count.

### Results

| Metric | Value |
|--------|-------|
| Channels tested | 469 |
| Mean per-channel R² (age→views) | 0.12 |
| Overlap (residual top-quartile with raw top-quartile) | 0.56 |
| Fraction of residual-selected videos NOT in raw top-quartile | 44% |
| Jaccard similarity | 0.39 |
| Total binary label agreement | 78% |
| Gate | PASS (overlap < 0.80 threshold) |

44% of videos the residual calls "breakout" are not in the raw-view top quartile. Conversely, 44% of raw-view selections are not in the residual top quartile. Because both methods label 25% of videos positive, the fraction of ALL videos that receive different labels is approximately 22%.

**Interpretation:** The age-normalized residual produces substantially different rankings from raw views. This is a measure of **difference**, not a measure of **validity**. We have not shown that either ranking identifies genuinely better breakout candidates.

### What This Does NOT Establish

- That the residual identifies "young high-velocity videos" or "old declining videos." YouNiverse has one cumulative view count per video at crawl time — we cannot measure velocity or trajectory.
- That the residual is more predictive of future performance than raw views.
- That the residual is "better" by any external criterion.

### What We Actually Know

The residual ranking is non-equivalent to the raw-view ranking. That's it. It's a promising heuristic worth testing against real outcomes (future view growth, human review, performance on our own channel).

---

## A2: Category as a Predictor

### Method

Pooled regression across all channels (not within-channel):

```
Model A: log_views ~ log_age
Model B: log_views ~ log_age + category (one-hot encoded YouTube category)
```

Compare R².

### Results

| Metric | Value |
|--------|-------|
| R² (age only) | 0.0405 |
| R² (age + category) | 0.0579 |
| Delta R² | 0.0174 |
| Categories in sample | 15 |
| Gate | PASS (delta R² > 0.01 threshold) |

### Critical Caveat

**This test is between-channel, not within-channel.** The per-channel OLS in A1 already absorbs every channel-constant characteristic (including category) into the channel-specific intercept. Adding category to a per-channel model changes nothing because category doesn't vary within a channel.

The pooled model's R² increase may reflect differences in average channel size, maturity, or audience across categories — not that category improves breakout identification.

Additionally, YouTube category is not "format class." Lecture, documentary, podcast, interview, and vlog require a separate taxonomy. This test does not answer whether format affects breakout behavior.

**Decision:** Do not add category to the within-channel breakout model based on this test. If category is to be tested, it must be in a within-channel framework using a proper format taxonomy, with channel-level fixed effects and held-out validation.

---

## A3: Channel Momentum Stripping

### Method

For each channel: compute age-normalized residual, label top quartile, regress residual against quarterly subscriber growth, subtract growth trend, re-label, count label flips.

### Results

| Metric | Value |
|--------|-------|
| Videos tested | 3,933 |
| Labels that flipped | 0 (0.0%) |

### Why This Result Is Suspicious

Zero flips across 3,933 videos is unusual. Before concluding "momentum doesn't matter," several possibilities must be excluded:

1. **Subscriber growth was constant within quartile computation units** — subtracting a channel-level constant mathematically preserves within-channel ranking.
2. **Growth values were mostly zero or missing** — the merge between video data and time series may have failed silently.
3. **Concurrent growth causes outcome leakage** — subscriber growth measured AFTER a video's publication may be partly caused by the video itself. Removing it strips away signal, not noise.
4. **The quartile boundary is arbitrary** — 0% of labels crossed the 75th percentile boundary, but continuous residuals may have moved substantially without crossing.

**Decision:** Do not conclude momentum is irrelevant. Audit the implementation, use only lagged (pre-publication) subscriber growth, and test at multiple thresholds. Retain momentum as an experimental feature until properly tested.

---

## Limitations Across All Experiments

| Limitation | Impact |
|------------|--------|
| **No external outcome measure** | We cannot say which metric is "better" — only that they differ |
| **Single cumulative view count per video** | Cannot measure velocity, trajectory, or decay |
| **YouNiverse is not representative of all YouTube** | Only English channels >10k subs, biased toward highly ranked channels, ends 2019 |
| **Small per-channel samples (~30 videos)** | OLS slopes are unstable; extreme videos can pull the regression toward themselves |
| **Top-quartile labeling forces 25% breakout rate** | Every channel gets breakouts even if all videos perform similarly |
| **Sample size convergence not established** | The 16%→44% jump between n=100 and n=500 shows instability, not convergence |
| **Category test is between-channel, not within-channel** | Does not justify adding category to a per-channel model |

---

## Current Best Interpretation

The age-normalized residual produces materially different rankings from raw cumulative views. It is **promising enough for prospective validation** — meaning: use it provisionally alongside simpler baselines (views/day, age-bin percentiles) while collecting video-level data that can support a proper validation against future outcomes.

What we need before calling this "validated":

- Comparison against an external outcome (future view growth, human-reviewed breakout examples)
- Leave-one-out residuals (not ordinary in-sample)
- Bootstrap uncertainty on overlap and flip rates
- Repeated subsampling to establish minimum sample size
- Comparison with at least views/day and age-percentile baselines
- A3 audit with lagged momentum, multiple thresholds, continuous movement
- Validation on contemporary data from the actual tantra channel population

---

## Pipeline Decision (Provisional)

| Component | Decision | Confidence |
|-----------|----------|------------|
| OLS residual | Use provisionally alongside views/day baseline | Medium — promising but unvalidated |
| Category | Do not include | Low — A2 test was confounded |
| Momentum | Retain as experimental feature | Low — A3 needs audit |
| Minimum sample | Not established | N/A |
| Breakout label | Use continuous residual score, not quartile | High — forced 25% rate is artificial |
