# Peer Review: Upworthy Title Analysis

**Reviewer:** automated
**Date:** 2026-07-21
**Experiment:** Upworthy Title Analysis — Causal Title Prior

---

## A. Methodology

### Soundness: Moderate

The core design (A/B test data from Upworthy, within-test pairwise comparisons, test-level train/holdout split) is causally identified and appropriate for the question. This is the strongest available observational design for headline effects.

### Falsification Conditions: Partially specified

The README states "Holdout accuracy <= 0.55" as the falsification condition. This is present in both JSON outputs' `"falsification"` field. However, the formal schema requires:
- A structured `null_hypothesis` field (schema §Experiment Manifest) — the current implementation uses a free-text string instead of `claim.statement` + `claim.null_hypothesis`
- Pre-registered thresholds, not just post-hoc ones — there is no preregistration commit pinning this threshold before analysis

### Data Source: Appropriate but incomplete

Upworthy Research Archive is well-documented and CC0-licensed. However:
- **Only confirmatory dataset used.** The holdout dataset (`upworthy-archive-holdout-packages`) exists and was never analyzed. The schema requires dataset snapshots pinned by commit or hash — the JSON only records a filename string.
- **No lineage tracking.** No formula hashes, no dataset snapshot IDs, no code commit pins. The schema's lineage tracking (§Lineage Tracking) is completely absent.
- **Domain drift acknowledged but not mitigated.** 2013-2015 Upworthy clickbait → 2026 YouTube documentaries is a major transfer gap. The analysis correctly flags this but takes no steps to quantify it (e.g., testing on modern headline data, comparing effect directions across eras).

### Confounding Factors: Several unaddressed

1. **Pairwise construction inflates effective sample size.** Lines 178-203 generate N winner-vs-loser pairs for every winner in a multi-variant test. A single headline can appear in dozens of pairs. The test-level split prevents cross-test leakage, but within-test the pairs are non-independent. The reported n values (e.g., `n_present: 238` for "actually") count comparisons, not unique headlines. The actual number of unique headlines containing "actually" that won is much smaller. This does not bias coefficients but does inflate the apparent evidence base.

2. **No multiple testing correction.** 23 features are evaluated simultaneously. The README presents the top features sorted by effect size. No Bonferroni, FDR, or any correction is applied. The schema's rival_explanations requirement (§Manifest Validation Rules) implicitly demands this.

3. **Ad-hoc feature definitions.** `curiosity_gap = has_why OR has_how OR has_question OR has_what` is defined without external validation. `urgency` and `specificity` similarly compound multiple sub-features, creating collinearity with their constituents. The logistic regression (which includes both the compound feature and its components) suffers from multicollinearity.

4. **No thumbnail or eyecatcher controls.** The dataset contains `eyecatcher_id` which identifies the visual paired with each headline. CTR depends on headline + thumbnail jointly. If certain headline styles are systematically paired with more/less effective thumbnails, the estimated feature effects are confounded. The experiment does not control for this.

5. **No temporal validation.** The Upworthy data spans ~2 years. Headline effectiveness likely changes over time (seasonal effects, platform algorithm changes, audience fatigue with specific formats). No year-over-year or month-over-month stability check is performed.

6. **No null control comparison.** The schema (§Null Controls for Title/Feature Experiments) requires multiple controls (within_channel_shuffle, within_topic_shuffle, synthetic_matched, permute_target). The Upworthy data does not map perfectly to YouTube's channel structure, but a permutation test (shuffling winner labels and re-running the analysis) would establish whether the observed feature effects exceed what random noise produces. This is not done.

---

## B. Format Compliance

### Missing from standard output format

| Required Field | Status |
|----------------|--------|
| `preregistration_commit` | Missing (no pinning at all) |
| `analysis_code_commit` | Missing |
| `result_commit` | Missing |
| `data.collection_period` | Missing |
| `data.missing_data_rate` | Missing |
| `data.merge_retention` | Missing |
| `results.primary.value` | Present |
| `results.primary.ci_95` | **MISSING** in both outputs — schema requires CIs for Tier 2 thresholds |
| `results.primary.threshold` | Missing (threshold buried in `falsification` string, not a structured field) |
| `rival_explanations` | Missing from both JSON outputs (present in README but not in the machine-validatable result) |
| `limitations` | Present in JSON-1 (per-feature), present in JSON-2 (logistic) — but free-text arrays, not structured |
| `interpretation.what_it_does_NOT_mean` | Present in both ✓ |
| `evidence_state.external_population_validated` | Missing from both (only 4 of 6 fields) |
| `operational_status` | Present as `"shadow"` in both ✓ |

The JSON outputs are a reasonable approximation of the schema format but are missing ~40% of the required fields. The `internal_validation_passed` field is literally set to `None` in the script (line 388) — this should be `true` or `false`, not null.

### No manifest.yaml

The experiment has no formal manifest, no preregistration, no lifecycle tracking. Per the schema (§Experiment Lifecycle), it is currently in an undocumented state — it has data and results but no pinned preregistration, no amendment protocol, no tier classification. It cannot be validated against CI because no manifest exists.

---

## C. Claims vs Evidence

### Claim 1: "Questions have −22.6% lift" — Supported, but qualified

n=1,882 comparisons. Reasonable sample size. However:
- **"What" questions contradict the headline claim.** The logistic regression shows "what" with +0.29 coefficient (second strongest positive). The README acknowledges this nuance but the summary table's "❌ Avoid Questions" label over-simplifies. One specific question type (What) is positive; others (Why, overall question marks) are negative.
- **No confidence interval.** With n=1,882 and a win rate of 38.7%, the 95% CI is approximately [36.5%, 40.9%]. This is wide enough that the true effect could be −18% or −27%. Not reported.

### Claim 2: "'Actually' has +29.4% lift" — Weakly supported

n=238 comparisons is small. This is the **smallest sample in the top 10 features**. The script itself uses n ≥ 1,000 as its threshold for "top features" (line 313), yet "actually" with n=238 is listed first in the summary. No confidence interval is reported. With 238 comparisons and a 64.7% win rate, the 95% CI spans approximately [58.3%, 70.7%] — the lift could be as low as +17% or as high as +41%. Extremely noisy.

### Claim 3: "Logistic regression achieves 52.5% holdout accuracy" — Suspicious pattern

Training accuracy: 52.23%, Holdout accuracy: 52.54%. **Training accuracy is lower than holdout accuracy.** For a properly regularized model, training accuracy should equal or exceed holdout accuracy. This inverted pattern is unusual and suggests:
- Possible data leakage in the split (unlikely given test-level split)
- The regularization penalty (L2) may be too strong, suppressing training accuracy below its natural level
- The random seed (42) may have produced a lucky holdout split — no repeated cross-validation or confidence interval around the 52.5% estimate
- Or the train/holdout test counts differ between the two output files (28,556/7,156 in logistic vs 28,698/7,014 in simple model), suggesting slightly different filtering

This crossover should be investigated before the model accuracy is taken at face value.

### Claim 4: Per-feature directions are "causally valid within the Upworthy domain" — True, but

This claim (in the logistic JSON interpretation) is correct: Upworthy's random assignment of headlines to eyecatcher groups means within-experiment comparisons identify causal effects. However, the feature differences across experiments could still be confounded by:
- **Eyecatcher-thumbnail interaction** (noted above)
- **Sequential confounding** — if Upworthy tested headline A in week 1 and headline B in week 2, temporal effects in audience composition could bias results
- **Publishing platform effects** — Upworthy content appeared on Facebook, which had different algorithmic dynamics in 2013-2015

### Null Results: Properly documented

Both experiments FAIL the 0.55 gate. The README correctly frames this: "above chance, below the gate." The "what it does NOT mean" sections are well-written and appropriately deflationary.

### Confidence Intervals: Completely absent

This is the single most consequential gap. No CI is reported for:
- Per-feature win rates (any feature)
- Logistic regression accuracy
- Logistic regression AUC
- Coefficient estimates

The schema (§Result Validation) requires CI presence for Tier 2 thresholds. The experiment does not meet this requirement.

---

## D. Actionability

### Established Decisions: Mixed — reasonable as directionals, over-certain as decisions

The "Established Decisions" table in the README appropriately qualifies most entries ("Use as soft priors," "Do not use as a hard pairwise ranker"). These are well-calibrated.

However, the following are problematic:

1. **"'Actually' and 'Never' are strong positive signals"** — These are the two smallest-sample findings (n=238 and n=280). Calling them "strong positive signals" in the decisions table without CIs or replication is premature. They are *promising signals worth investigating further*.

2. **"Questions in headlines are likely net-negative"** — True on average, but misleading without the "What is good" caveat. A writer following this rule would avoid "What X Means About Y" headlines, which the data suggests are effective.

3. **"Imperative verb openings outperform"** — Supported (n=464, +16.4% lift), but the imperative verb list is only 16 verbs hardcoded in the script (lines 76-80). This is not validated against a linguistic taxonomy. The finding may be specific to the exact verbs Upworthy used ("See," "Watch," "Learn" are fitting for listicles) and may not generalize to YouTube imperatives ("Subscribe," "Join" were not tested).

4. **"Avoid exclamation marks"** — n=318, lift −22.0%, but no CI. The effect direction is consistent with multiple studies but the magnitude is uncertain.

### Would I act on these priors?

For title generation: Yes, as directional priors weighted by sample size. I would heavily weight the features with n > 1,000 (questions, curiosity_gap, word_count, "this," "you") and lightly weight those with n < 500 ("actually," "never," "every," imperative verbs). The README's established decisions do not communicate this sample-size gradient to the reader — all decisions appear equally supported.

For a pairwise ranker: No. The 52.5% ceiling is real and neither model beats 0.55. The claim that "deeper NLP may perform significantly better" is speculation — the data shows surface features hit a ceiling, but there is no evidence that embeddings would break through it.

---

## E. Gaps

### What I Would Flag as Reviewer

| # | Gap | Severity | Recommendation |
|---|-----|----------|----------------|
| 1 | **No confidence intervals anywhere** | Critical | Re-run with bootstrapped CIs on all metrics. Report 95% CI for every accuracy, lift, and coefficient. |
| 2 | **No preregistration/manifest** | High | Create a manifest.yaml with the formal schema fields. Pin dataset and code versions. |
| 3 | **Training accuracy < holdout accuracy (logistic)** | High | Investigate with repeated cross-validation (k=10, 5 repeats). Report mean ± std, not single seed. |
| 4 | **No null control / permutation test** | High | Shuffle winner labels 1,000 times, re-fit logistic regression, compare real coefficients to null distribution. |
| 5 | **No temporal validation** | High | Split data by year (2013, 2014, 2015). Check if coefficient directions and magnitudes are stable across years. |
| 6 | **No multiple testing correction** | Medium | Report which features survive Bonferroni or FDR correction. |
| 7 | **Small-sample features presented as strong signals** | Medium | Tag each established decision with sample size band. Require n ≥ 1,000 for "use" recommendations. |
| 8 | **No thumbnail/eyecatcher control** | Medium | Run a mixed-effects model with eyecatcher_id as random intercept. Check if feature effects change. |
| 9 | **Holdout dataset not used** | Medium | The separate Upworthy holdout package exists. Running the same analysis on it would provide an independent replication within the same domain. |
| 10 | **Feature interactions not explored** | Low | Add interaction terms for the top 5 features (why × exclamation, actually × never, etc.) to see if combinations have non-additive effects. |

### What Should Be Done Differently Next Time

1. **Preregister the manifest** before touching the data. Pin dataset version, feature list, and threshold.

2. **Report CIs as a condition of acceptance.** No result without uncertainty quantification.

3. **Separate "discovery" from "established decisions."** Features with n < 500 should be in a separate "exploratory findings" section, not mixed with the main results table.

4. **Add a follow-up: holdout dataset replication.** Running the same pipeline on Upworthy's separate holdout package would be the cheapest possible independent replication. The fact that this wasn't done before writing conclusions is the biggest missed opportunity.

5. **Test the "training < holdout" anomaly** before publishing results. Run 10 random seeds, report mean ± std. If the anomaly persists, investigate the split logic.

---

## Summary

The Upworthy Title Analysis is a **well-motivated, causally grounded experiment with honest null reporting**. The decision to FAIL both models at the 0.55 gate is correct and well-documented. The "what it does NOT mean" sections set a good example for the project's research culture.

However, it falls short of the project's research schema in several enforceable ways: no confidence intervals, no preregistration, no null controls, no temporal validation, no lineage tracking, and no formal manifest. The sample-size gradient across features is not communicated clearly, creating an impression of uniform support where it does not exist.

**Bottom line:** Use as soft priors with sample-size weighting. Do not promote to production without replication on the holdout dataset and CIs on all estimates. The schema violations should be fixed before this is considered "shadow" ready — currently it is better described as "exploratory."
