# P1: YouNiverse Breakout Validation v2

**Layer:** Signal — What to produce (the core question of the entire pipeline)
**Engine:** Breakout Engine (E7)
**Dataset:** YouNiverse — 3.2 GB, 136K channels, 72M videos, 2005-2019
**R2 path:** `s3://research-datasets/youniverse/`
**Status:** A1-A3 done (44% label diff) — needs redo as Tier 1
**Dependencies:** Python + DuckDB on VPS (all data on R2)

---

## The Core Question

**Does the OLS residual breakout score predict future video performance?**

This is the single most important question for the entire pipeline. The gap score tells us what topics are underserved. The breakout score tells us what topics *perform* when produced. Without validation, we're picking topics by supply scarcity alone — and scarcity doesn't guarantee demand.

A1-A3 proved the breakout metric is *different* from raw views (44% label difference). This proposal proves whether it's *useful* — does it predict what happens next?

---

## Current State: What A1-A3 Actually Proved

| Test | Result | What It Means |
|------|--------|---------------|
| A1: Label difference | 44% of top-quartile labels change when switching from raw views to OLS residual | OLS captures different signal. A video that looks like a hit by raw views may be merely average by OLS. |
| A2: Delta R² from format_class | 0.017 | Video format (tutorial, documentary, vlog) explains ~2% of breakout variance. Small but consistent. |
| A3: Convergence at n=500 | Yes — label distribution stabilizes | The 44% difference is not noise; it's a real property of the metric. |

**What A1-A3 do NOT prove:**
- That high-breakout videos outperform low-breakout videos in weeks 5-8
- That the breakout signal generalizes beyond the 2005-2019 YouNiverse window
- That breakout is topic-dependent vs channel-dependent

---

## Phase 1: Tier 1 Validation (Primary)

This is the experiment that decides whether the entire opportunity formula is viable.

### Design

Use YouNiverse's time series data (`df_timeseries_en.tsv.gz`, 18.8M weekly channel stats) to construct a predictive test:

1. **Cohort construction** — For each channel with ≥30 videos and ≥12 months of history:
   - Split each video's life into two windows: **observation** (weeks 1-4 post-upload) and **outcome** (weeks 5-8 post-upload)
   - Only include videos uploaded at least 8 weeks before YouNiverse data ends (Oct 2019) — so both windows have data

2. **Breakout score computation** (observation window, weeks 1-4):
   - Per-channel OLS: `log(views_at_week_4) ~ log(age_days_at_week_4)`
   - This is the *within-channel baseline* — what views should a video of this age have, for THIS channel?
   - `breakout_score = residual = log(actual) - log(predicted)`
   - Alternative (if no weekly breakdown): use `delta_views` from the weekly stats. Computed as `delta_views` in first 4 weeks minus predicted `delta_views` given channel average.

3. **Future performance** (outcome window, weeks 5-8):
   - `future_views = sum(delta_views for weeks 5-8)`
   - Normalize by channel: `future_performance = future_views / channel_median_future_views`

4. **Prediction test:**
   - Spearman r between `breakout_score` (weeks 1-4) and `future_performance` (weeks 5-8)
   - Precision@20: of the top-20 breakout videos, how many are in the top-20 for future views?
   - Binned analysis: group videos by breakout quintile, plot mean future performance per quintile

### Sample Size

YouNiverse has 18.8M weekly rows. Filtering for:
- Channels with ≥30 videos: ~15,000 channels
- Videos uploaded ≥8 weeks before Oct 2019: ~120,000 videos
- After removing channels with ≤5 videos in the valid window: ~100,000 videos

n ≈ 100,000. More than enough for stable estimates.

### Validation Gates

```
Gate 1: Spearman r ≥ 0.2 between breakout_score and future_performance
  → The metric has predictive power (even weak)
  → If THIS fails, the entire opportunity formula is built on noise

Gate 2: Monotonic relationship across quintiles
  → Q5 (top breakout) > Q4 > Q3 > Q2 > Q1 in mean future performance
  → If high-breakout videos perform WORSE than low-breakout, the metric is inverted

Gate 3: Within-channel consistency
  → For channels with ≥2 videos in the top breakout quintile,
    the second high-breakout video also outperforms channel median in weeks 5-8
  → If breakout is mostly channel-specific (some channels just make hit videos),
    the signal is not topic-dependent
```

### Falsification

All three gates fail. Breakout score does not predict future performance within the YouNiverse window. The metric is differentiated but not useful — we cannot use it for topic selection.

**Contingency:** If Gates 1-2 pass but Gate 3 fails, the signal is channel-specific, not topic-specific. We pivot to using breakout for channel-level health monitoring (is THIS channel improving?) rather than topic selection.

---

## Phase 2: Momentum-Stripping Validation

A1-A3 flagged a concern: channel momentum (a channel growing from 1K to 10K subs over the observation window) will make later videos look like breakouts even if they're not better.

### Two-Stage Residual Test

```python
# Stage 1: Age-normalized (existing)
residual_1 = log(views) - f(log(age_days))

# Stage 2: Strip calendar-time trend
# For each channel, fit: residual_1 ~ g(calendar_week)
residual_2 = residual_1 - g(calendar_week)
```

**Test:** Compare breakout label assignments before and after momentum stripping. If ≥15% of labels change after adding Stage 2, momentum is a significant confound and Stage 2 is mandatory.

```
Gate: <15% of labels change after adding Stage 2
  → Momentum is not a significant confound for this dataset
  → The single-stage OLS is sufficient

If FAIL: Two-stage residual becomes mandatory for production
```

---

## Phase 3: YouTube API Extension (Current Data)

YouNiverse ends in October 2019. The YouTube ecosystem has changed significantly since then. This phase tests whether the 2019 findings hold in 2026.

### Cross-Validation with Current YouTube API

1. Use our Gap Engine's daily search collection (already running, 13 days remaining) — we have 30 queries × 3 regions running daily
2. For each query, identify the top-10 channels from search results
3. For each channel, fetch their last 20 videos via `channels.list` + `playlistItems.list` + `videos.list`
4. Compute breakout scores for these 2026 videos using the same OLS method
5. Compare: are the 2026 breakout distributions similar to YouNiverse's 2019 distributions?
   - Same mean OLS R²?
   - Same proportion of "extreme breakout" videos (~10%)?
   - Same label difference between OLS and raw views (~44%)?

### YouTube API Cost

10 queries × 10 channels × 20 videos = 200 videos.
- `channels.list`: 10 calls
- `playlistItems.list`: 10 calls
- `videos.list`: 4 calls (200/50)
Total: ~24 calls from general pool (10K/day). Negligible.

### Gate

```
Gate: 2026 breakout distributions match 2019 YouNiverse distributions within ±20%
  → The metric is stable across time and the 7-year gap doesn't invalidate it

If FAIL (e.g., 2026 shows no breakout variance):
  → The YouTube algorithm or creator behavior has fundamentally changed
  → We need a new breakout methodology for current data
```

---

## Phase 4: Topic Decomposition

If the breakout metric validates, the next question is: **is breakout topic-dependent?**

A video on Kundalini might have high breakout while the same channel's video on Mantra has average breakout. Or breakout might be mostly channel-specific (some creators consistently overperform).

### Method

1. Cluster channels by topic mix (using their video titles/descriptions)
2. For each channel-topic pair, compute breakout score
3. ANOVA: what fraction of breakout variance is explained by:
   - Channel identity (some channels are better)
   - Topic (some topics perform better for any channel)
   - Channel × Topic interaction (specific channels are especially good at specific topics)

### Use Case

If topic explains ≥10% of breakout variance: the breakout signal is topic-dependent and can guide WHAT to produce.
If channel explains ≥80%: breakout is about the creator, not the topic — topic selection matters less than building a good channel.

```
Gate: topic explains ≥10% of breakout variance (η² ≥ 0.10)
  → Topic selection is a meaningful lever
  → The opportunity formula (which selects topics) has a real effect

If FAIL:
  → "What" matters less than "who"
  → Focus on channel development, not topic optimization
```

---

## Output Schema

```json
{
  "experiment": "P1-youniverse-breakout-v2",
  "timestamp": "20260721_153000",
  "phase_1_tier_1_validation": {
    "n_videos": 100000,
    "n_channels": 15000,
    "spearman_r": 0.28,
    "spearman_p": "3e-12",
    "precision_at_20": 0.35,
    "quintile_means": {
      "q1_lowest": { "mean_future_performance": 0.72, "n": 20000 },
      "q2": { "mean_future_performance": 0.88, "n": 20000 },
      "q3": { "mean_future_performance": 1.01, "n": 20000 },
      "q4": { "mean_future_performance": 1.15, "n": 20000 },
      "q5_highest": { "mean_future_performance": 1.34, "n": 20000 }
    },
    "gates": {
      "gate_1_spearman_r_above_02": true,
      "gate_2_monotonic_quintiles": true,
      "gate_3_within_channel_consistency": true
    }
  },
  "phase_2_momentum_stripping": {
    "label_flip_rate": 0.12,
    "gate_under_015": true
  },
  "phase_3_youtube_api_extension": {
    "n_2026_videos": 200,
    "outlier_proportion_2026": 0.11,
    "ols_r2_2026": 0.45,
    "label_difference_2026": 0.41,
    "gate_distributions_match": true
  },
  "phase_4_topic_decomposition": {
    "variance_explained_by_topic": 0.14,
    "variance_explained_by_channel": 0.62,
    "variance_explained_by_interaction": 0.08,
    "gate_topic_explains_above_010": true
  },
  "interpretation": {
    "what_it_means": "Breakout score predicts future views. Topic explains 14% of variance — topic selection is a real lever.",
    "what_it_does_NOT_mean": "High breakout guarantees success. The effect is modest (r=0.28) and topic is one of many factors."
  },
  "next_step": "Integrate into Breakout Engine: breakout_engine.validate(topic) returns breakout_probability"
}
```

---

## Engine Integration

```
breakout_engine.validate(topic_description, channel_baseline) → {
    breakout_probability: float,        // predicted percentile (0-1)
    confidence_interval: [float, float],
    category_breakout_rate: float,      // how similar topics performed historically
    channel_fit_score: float,            // does this channel have breakout history in similar topics?
    similar_topic_examples: [{          // analogous topics from YouNiverse
        topic: string,
        breakout_score: float,
        channel_count: int
    }]
}
```

---

## Quick Reference

| Phase | What | Data Source | API Cost | Time | Gate |
|-------|------|-------------|----------|------|------|
| 1 | Tier 1 validation | YouNiverse R2 | $0 | 2 hours | r ≥ 0.2 |
| 2 | Momentum stripping | Same data | $0 | 30 min | <15% label flip |
| 3 | 2026 cross-validation | YouTube API | 24 calls | 1 hour | Distributions match |
| 4 | Topic decomposition | Same data | $0 | 1 hour | Topic η² ≥ 0.10 |

**Run Phase 1 first.** Everything else expands on it. If Phase 1 fails (r < 0.2), the other phases don't matter — the breakout metric doesn't predict the future and shouldn't guide topic selection.
