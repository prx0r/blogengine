# Proposed Research Schema — Making Our Results Solid

## The Problem

We've run ~7 experiments across 41 designed. Most produced useful directional signals. Some produced misleading numbers. The difference between a useful result and a misleading one wasn't the data — it was the methodology: small samples, wrong test designs, overclaimed interpretations.

This schema formalizes what we learned so that every future experiment avoids the same traps.

---

## Core Principle: Distinguish "Different" From "Better"

Our most common mistake was calling a result "validated" when we'd only shown it was "different." A1 showed the OLS residual differs from raw views — that's useful to know. It did NOT show the residual is better at identifying breakouts. Those are different claims requiring different evidence.

**Rule:** Every experiment report must answer:
1. What does this test actually measure? (Design)
2. What could produce this result other than our hypothesis? (Rival explanations)
3. What would we need to see to be convinced the result is real? (External outcome)
4. What does this NOT tell us? (Limitations)

---

## Pre-Experiment Checklist

Before writing any code:

```
☐ What is the null hypothesis?
    "X has no relationship to Y." What specifically would falsify it?

☐ What is the minimum detectable effect?
    If the true effect is X%, what sample size do we need to detect it?
    (Run a power analysis or bootstrap simulation from existing data)

☐ Is the test design matched to the variable's structure?
    Within-channel variables → within-channel tests
    Cross-channel variables → cross-channel tests
    Time-varying variables → time-series tests
    (A2 failed this: category doesn't vary within a channel)

☐ What is the external outcome?
    If we're claiming X predicts Y, what is the actual Y?
    Future views? Human rating? Channel performance?
    (A1 failed this: we claimed "breakout" with no external breakout definition)

☐ What are the rival explanations?
    At least 3 alternative ways this result could occur:
    - Sampling noise (too small n)
    - Confounded variable (Z causes both X and Y)
    - Data artifact (merge failure, temporal misalignment)
    - Leaky predictor (outcome data in predictor)

☐ What thresholds are pre-registered?
    Every threshold set BEFORE running the test. Not adjusted after.
    (A1 threshold was pre-set at 80% overlap — correct)
    (A3's 15% flip threshold was pre-set — correct, but the zero result was suspicious)

☐ What continuous version of the metric exists alongside the binary?
    If you're labeling things as breakout/not-breakout, also track the continuous score.
    Binary labels lose information. (A1's top-quartile forced 25% breakout rate)
```

---

## Experiment Report Template

Every experiment writes to `data/research/{dataset}/{experiment}-{timestamp}.json` with this structure:

```json
{
  "experiment": "unique-name",
  "status": "exploratory | provisional | validated | rejected",
  "dataset": "youniverse",
  "timestamp": "20260721_120000",
  
  "design": {
    "population": "500 channels from YouNiverse, >=20 videos each",
    "test_type": "per-channel OLS regression",
    "null_hypothesis": "OLS residual and raw views rank videos identically",
    "minimum_detectable_effect": "10% label difference at n=200 (from bootstrap)",
    "external_outcome": "none — this test can only establish difference, not validity"
  },
  
  "results": {
    "primary_metric": { "name": "overlap", "value": 0.56, "ci_95": "[0.52, 0.60]" },
    "secondary_metrics": [
      { "name": "jaccard", "value": 0.39 },
      { "name": "kappa", "value": 0.31 },
      { "name": "total_label_agreement", "value": 0.78 }
    ],
    "continuous_version": { 
      "spearman_r_residual_vs_raw": 0.71,
      "mean_abs_rank_change": 12.3 
    }
  },
  
  "gates": {
    "A1_overlap_below_80pct": { "status": "PASS", "threshold": "< 0.80", "value": 0.56 },
    "A1_jaccard_above_030": { "status": "PASS", "threshold": "> 0.30", "value": 0.39 }
  },
  
  "rival_explanations": [
    { "explanation": "Sample too small at n=100", "ruled_out_by": "Result changed at n=500 — hadn't converged yet. Still not ruled out for n=500." },
    { "explanation": "OLS residual captures noise, not signal", "ruled_out_by": "Not ruled out. Need external outcome to distinguish." }
  ],
  
  "limitations": [
    "No external outcome measure — can only establish difference, not validity",
    "YouNiverse ends 2019 — may not generalize to current YouTube",
    "English channels only, >10k subs — does not apply to small or non-English channels"
  ],
  
  "interpretation": {
    "what_it_means": "The OLS residual produces materially different rankings from raw views across 44% of top-quartile selections.",
    "what_it_does_NOT_mean": "The residual is better at identifying breakouts, or predicts future performance.",
    "provisional_decision": "Use OLS residual alongside views/day baseline. Do not lock as primary metric until validated against future outcomes."
  },
  
  "next_step": "Compare OLS residual against views/day and age-bin percentile on held-out channels. Design external outcome test."
}
```

---

## Research Tier System

Not every question deserves the same level of rigor. Classify experiments by what decision they inform:

### Tier 1: Structural (pipeline-blocking)

These determine whether the pipeline works at all. They deserve full peer-review-level rigor.

**Examples:** Breakout metric selection, gap score formula, opportunity scoring method.

**Requirements:**
- External outcome measure
- Bootstrap uncertainty intervals
- Comparison against at least 2 baselines
- Pre-registered thresholds
- Documented rival explanations
- Minimum sample established via repeated subsampling

**Our A1-A3 should have been Tier 1 but were run as Tier 2.**

### Tier 2: Calibration (parameter-setting)

These set weights, thresholds, and cadence within a working pipeline.

**Examples:** Weekly vs daily gap computation, weighted sum coefficients, LLM validation thresholds.

**Requirements:**
- Pilot + scale convergence check
- Sensitivity analysis around threshold
- Drill-down on ambiguous results
- Documented limitations

**Layer 2 tasks (Wikipedia, daily search, Stage 1 re-run) were correctly Tier 2.**

### Tier 3: Exploratory (discovery)

These generate hypotheses for Tier 1/2 testing. They can be lightweight and fast.

**Examples:** Title feature correlation scan, duration vs performance scatter, forum question clustering.

**Requirements:**
- Clear statement that result is exploratory
- No pipeline decisions based on exploratory results
- At least one rival explanation considered
- Documented for potential Tier 1/2 follow-up

---

## Rival Explanations Checklist

When a result doesn't make sense, or when it makes too much sense, check:

| Rival Explanation | How to Detect | Example |
|------------------|---------------|---------|
| **Sample too small** | Result changes at larger n | A1: 16% at n=100 → 44% at n=500 |
| **Test design mismatch** | Variable structure doesn't match test structure | A2: within-channel test of between-channel variable |
| **Data merge failure** | Key counts don't match; join produces unexpected filter | A3: 0 flips may indicate merge failure |
| **Leaky predictor** | Predictor includes future information | A3: concurrent subscriber growth caused by the video itself |
| **Outcome definition artifact** | Binary threshold creates artificial result | A1: top-quartile forces 25% breakout rate |
| **Confounded variable** | Z causes both X and Y | See any cross-channel comparison |
| **Temporal misalignment** | Data from different time periods compared | Task 6: no time filter in run 1 vs time filter in run 2 |
| **Population mismatch** | Sample doesn't represent target population | Wikipedia readers ≠ YouTube searchers (r=0.027) |
| **Regression to the mean** | Extreme values move toward average on retest | Common in breakout/performance metrics |
| **Multiple comparison problem** | Running many tests inflates false positives | If testing 20 title features, expect 1 "significant" by chance |

---

## Applying This Going Forward

### Example: Title Association Ranking (Experiment 3 from intelligence-pipeline)

**Old approach:** Compute Spearman correlation for 15 title features vs views_per_day. Report which features have r > 0.1 as "significant."

**Problems:** Multiple comparison (15 tests), no external outcome, no baseline comparison, features may correlate with each other.

**New approach (Tier 2):**
1. Pre-register: "We will test 15 title features against breakout_score. We expect 2-3 to show Spearman |r| > 0.1 by chance alone. We will only flag features where |r| > 0.2 AND r exceeds the r of a shuffled-title control."
2. Bootstrap channels to get confidence intervals on each r
3. Compare against shuffled titles (same distribution, no semantic content)
4. Report: "question_marks r=0.15 [0.08, 0.22], shuffled_control r=0.02 — question_marks exceeds control at 95% CI"
5. Explicitly label as exploratory (Tier 2) — no pipeline decision until replicated on own production

### Example: Comment Intent Taxonomy (YTCommentVerse)

**Old approach:** LLM-classify 500 comments, compare to hand-coded 100, report 80% agreement.

**Problems:** 80% agreement can be met by majority-class predictor. 50-100 samples insufficient for per-class evaluation.

**New approach (Tier 2):**
1. Stratified sample: 50 high-upvote, 50 low-upvote, 50 random, 50 from known-relevant videos
2. Hand-code all 200 into 8 intent types (by 2 raters, compute inter-rater kappa)
3. LLM-classify same 200, compute macro F1, per-class precision/recall, Cohen's kappa
4. Gate: macro F1 ≥ 0.75, kappa ≥ 0.65, no class recall < 0.60
5. If gate passes: deploy taxonomy. If fails: revise prompt, retest, or abandon.

### Example: Within-Channel Breakout Metric (Redo, Tier 1)

If we were to redo A1-A3 properly as Tier 1:

1. **External outcome:** Use YouNiverse time series (channel-level weekly views) to approximate video-level growth. Videos published in week W with above-median view growth in weeks W+1 to W+4 are "true breakouts." Compare OLS residual vs raw views vs views/day vs age-bin percentile on their ability to predict this.
2. **Bootstrap channels:** 1000 resamples of 500 channels each, report overlap with 95% CI.
3. **Compare against baselines:** Views/day, age-bin percentile, raw views. Report which metric best predicts the external outcome.
4. **Continuous score:** Don't use quartiles. Use Spearman correlation between metric score and future growth.
5. **Held-out validation:** Fit on channels 1-400, evaluate on channels 401-500.

This would actually answer the question "which metric is better?" instead of "are they different?"

---

## Summary: How Each Experiment Tier Works

| | Tier 1: Structural | Tier 2: Calibration | Tier 3: Exploratory |
|---|---|---|---|
| **Decides** | Whether pipeline works | Parameter values | What to investigate next |
| **External outcome** | Required | Recommended | Not required |
| **Bootstrap uncertainty** | Required | Recommended | Not required |
| **Baseline comparison** | ≥2 baselines | ≥1 baseline | Not required |
| **Pre-registered thresholds** | Required | Required | Recommended |
| **Rival explanations** | All documented | Top 3 documented | Top 1 considered |
| **Sample size** | Empirically established | Convergence checked | Pilot OK |
| **Continuous + binary** | Both reported | Both recommended | Either OK |
| **Pipeline decision** | Locks component | Sets parameter | Generates hypothesis |
