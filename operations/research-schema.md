# Research Schema — Machine-Enforceable Protocol

## Core Principle

This is not a Markdown guideline. It is a machine-verifiable contract. Every experiment produces a YAML manifest that is validated before execution, checked during analysis, and locked after publication.

---

## Experiment Lifecycle

```
IDEA
  ↓
PREREGISTERED  ← manifest validated, commit pinned, timestamped
  ↓
DATA_COLLECTION  ← data-quality gates checked
  ↓
ANALYSIS  ← immutable result, code pinned
  ↓
PEER_REVIEW  ← human or automated review
  ↓
SHADOW_DEPLOYMENT  ← running alongside production, collecting prospective data
  ↓
PROMOTED / REVISED / REJECTED
```

Each transition is irreversible. A PROMOTED experiment cannot go back to PREREGISTERED. A REJECTED experiment can be resubmitted as a new experiment with amendments.

---

## Experiment Manifest (YAML, Validated by CI)

Every experiment starts with a `manifest.yaml` in `experiments/{name}/`:

```yaml
# experiments/gap-score-stability-v1/manifest.yaml
experiment:
  id: "gap-score-stability-v1"
  tier: 2
  status: preregistered
  created: "2026-07-21"
  preregistration_commit: "abc123def"   # git commit SHA — immutable
  analysis_code_commit: null             # set after analysis code is frozen
  dataset_snapshots:                     # exact dataset versions used
    - "youtube-search-20260721"

claim:
  type: stability
  statement: "Weekly aggregated gap scores maintain consistent rank ordering week-over-week."
  null_hypothesis: "rho <= 0"

design:
  unit_of_analysis: "query_week"
  population: "tantra_queries"
  predictor_measured_at: "t0"            # when the predictor is measured
  outcome_measured_at: "t_plus_7_days"   # when the outcome is measured
  outcome_definition: "gap_score computed from query result set"

baselines:
  - "raw_search_count"
  - "google_trends_velocity"

analysis:
  primary_metric: "spearman_r"
  secondary_metrics:
    - "top5_jaccard"
    - "rank_biased_overlap"
    - "score_intraclass_correlation"
    - "selection_churn_rate"
  resampling: "block_bootstrap(query)"
  threshold: 0.30   # primary metric must exceed this

decision:
  pass_action: "adopt_weekly_cadence"
  fail_action: "investigate_daily_with_rolling_window"
  pipeline_lock_allowed: false

evidence_state:
  design_complete: false
  data_quality_passed: false
  internal_validation_passed: false
  temporal_validation_passed: false
  replicated: false

operational_status: "shadow"   # shadow | candidate | production | deprecated
```

### Manifest Validation Rules (CI-Enforced)

Before an experiment can move to DATA_COLLECTION, CI must pass:

**Tier 1 requirements:**
- [ ] External outcome defined (not just a proxy — actual future metric)
- [ ] ≥2 baselines specified
- [ ] Bootstrap resampling unit declared
- [ ] Pre-registered thresholds for all primary metrics
- [ ] ≥3 rival explanations documented
- [ ] Dataset snapshots pinned by commit or hash
- [ ] Analysis environment locked (requirements.txt or equivalent)

**Tier 2 requirements:**
- [ ] ≥1 baseline specified
- [ ] Convergence check planned (2+ sample sizes)
- [ ] Sensitivity analysis planned for thresholds
- [ ] Rival explanations documented (top 3)

**Tier 3 requirements:**
- [ ] Exploratory label in result
- [ ] At least 1 rival explanation considered

Fail any requirement → experiment cannot start data collection.

### Amendment Protocol

If thresholds, hypotheses, or metrics change after DATA_COLLECTION starts, an amendment must be filed:

```yaml
amendment:
  number: 1
  made_after_data_access: true
  reason: "Primary outcome unavailable for 38% of channels due to API errors"
  original_plan:
    primary_metric: "spearman_r"
    threshold: 0.30
  revised_plan:
    primary_metric: "top5_jaccard"
    threshold: 0.50
  classification: "exploratory_deviation"   # design_fix | exploratory_deviation | preregistered
```

Amendments are attached to the experiment record. A change classified as "exploratory_deviation" automatically downgrades the experiment to Tier 3.

---

## Experiment Result (Immutable After Analysis)

```yaml
# experiments/gap-score-stability-v1/result.yaml
experiment_id: "gap-score-stability-v1"
preregistration_commit: "abc123def"
analysis_code_commit: "def456ghi"
result_commit: "ghi789jkl"

data:
  collection_period: "2026-07-21 to 2026-08-04"
  total_observations: 1344  # 48 queries × 7 days × 4 weeks
  missing_data_rate: 0.03
  merge_retention: 0.97

results:
  primary:
    metric: "spearman_r"
    value: 0.52
    ci_95: "[0.44, 0.59]"
    threshold: 0.30
    pass: true

  secondary:
    - metric: "top5_jaccard"
      value: 0.67
    - metric: "rank_biased_overlap"
      value: 0.71
    - metric: "selection_churn_rate"
      value: 0.12
    - metric: "score_intraclass_correlation"
      value: 0.48

evidence_state:
  design_complete: true
  data_quality_passed: true
  internal_validation_passed: true
  temporal_validation_passed: false   # only 2 weeks of data — not enough
  replicated: false
  external_population_validated: false

operational_status: "shadow"   # running alongside old system, not replacing it

rival_explanations:
  - explanation: "Search API noise produces stable but meaningless rankings"
    status: "not_ruled_out"
    evidence: "Spearman r=0.52 but API audit (arXiv:2506.11727) found temporal decay"
  - explanation: "Only top-5 decisions are stable; lower ranks are volatile"
    status: "partially_ruled_out"
    evidence: "Top-5 Jaccard=0.67, selection churn=12% — moderate stability"

limitations:
  - "Only 2 weeks of data — temporal stability not established"
  - "YouTube Search API results may not reflect Browse/Recommended feeds"
  - "Only tantra queries tested — may not generalize to other niches"

interpretation:
  what_it_means: "Weekly gap scores show moderate rank stability (r=0.52, top-5 Jaccard=0.67)."
  what_it_does_NOT_mean: "Gap scores are accurate. Stability ≠ validity."
  provisional_decision: "Use weekly cadence in shadow mode. Compare against daily in production for 4 more weeks."

next_step: "Extend collection to 8 weeks. Compute decision stability for actual topic selection."
```

### Result Validation (CI-Enforced)

Before a result can be committed:

- [ ] Continuous metric reported alongside any binary label
- [ ] Confidence intervals present for Tier 1
- [ ] Confidence intervals present for Tier 2 thresholds
- [ ] Rival explanations documented (not left implicit)
- [ ] Limitations section present
- [ ] "What it does NOT mean" section present
- [ ] Dataset lineage included (snapshot IDs, formula hashes)
- [ ] Operational link back to preregistration commit

---

## Evidence State (Replaces Single "Validated" Label)

The old statuses (exploratory/provisional/validated/rejected) are too coarse and hide too much. Replace with two independent fields:

### evidence_state

```yaml
evidence_state:
  design_complete: true           # Was the experiment correctly designed?
  data_quality_passed: true       # Did the data pass quality gates?
  internal_validation_passed: true  # Does it work on the development sample?
  temporal_validation_passed: false # Does it work on later time periods?
  external_population_validated: false  # Does it work on a different population?
  replicated: false               # Has an independent team/experiment confirmed it?
```

### operational_status

```yaml
operational_status: "shadow"  # shadow | candidate | production | deprecated
```

- **shadow**: Running alongside existing system, collecting data, not driving decisions
- **candidate**: Passed shadow evaluation, being considered for promotion
- **production**: Actively driving pipeline decisions
- **deprecated**: Replaced by a newer version, retained for reproducibility

Example: A metric could be *internally validated* but only in *shadow* mode because temporal validation hasn't completed. That's more informative than calling it "provisional."

---

## Tier Escalation Rules (Enforced)

A finding cannot move from Tier 3 → Tier 2 → Tier 1 without explicit promotion.

```
Tier 3 (exploratory observation)
  ↓ Must replicate in independent sample
Tier 2 (calibration candidate)
  ↓ Must demonstrate operational lift over baseline in shadow mode
Tier 1 (structural) 
  ↓ Must pass held-out external validation with prospective data
Production component
```

**Rule:** Any exploratory feature that changes ranking, allocation, topic selection, publishing cadence, or resource expenditure becomes Tier 2 or Tier 1 before activation.

This prevents an exploratory title feature from quietly entering the opportunity score because it "seems useful."

---

## Null Controls for Title/Feature Experiments

The single shuffled-title control is insufficient. It may break semantic alignment while preserving structural confounds. Use multiple controls:

```yaml
null_controls:
  - type: "within_channel_shuffle"
    description: "Shuffle titles among videos within the same channel"
    breaks: "title-video semantic link"
    preserves: "channel style, era, format"
  
  - type: "within_topic_shuffle"
    description: "Shuffle titles among videos within the same topic cluster"
    breaks: "title-video semantic link"
    preserves: "topic distribution"
  
  - type: "synthetic_matched"
    description: "Generate synthetic titles matching length and punctuation distribution"
    breaks: "all semantic content"
    preserves: "length, punctuation frequency"
  
  - type: "permute_target"
    description: "Permute breakout label within channel"
    breaks: "title-outcome link"
    preserves: "channel baseline breakout rate"
```

Primary test: ΔR²_CV (incremental out-of-sample R² over a base model containing only channel and age controls).

Secondary check: Does any feature's ρ exceed the maximum ρ from all null controls? If a feature's correlation with the outcome is lower than the best null control's correlation, that feature carries no signal distinguishable from measurement noise.

---

## Comment Validation: Dual Evaluation Sets

The current design uses a single 200-comment stratified sample. This can overestimate production performance because it deliberately balances classes.

Use two separate sets:

### Set 1: Diagnostic Balanced (for prompt iteration)

- 200 comments: 50 high-upvote, 50 low-upvote, 50 random, 50 known-relevant
- Used for: finding weak classes, prompt iteration, testing rare intents
- NOT used for: reporting final accuracy

### Set 2: Natural-Prevalence Frozen (for reporting)

- 500 comments sampled WITHOUT stratification — reflects actual class distribution
- FROZEN before any prompt refinement — never iterated against
- Used for: production accuracy estimate, precision, recall, macro F1
- Gated: macro F1 ≥ 0.75, κ ≥ 0.65, no class recall < 0.60

The test set is frozen before the first prompt is written. No peeking.

---

## Inter-Rater Design

```
1. Write annotation codebook with class definitions and examples
2. Two raters independently code the full 200-comment diagnostic set (blinded)
3. Compute: raw agreement, Cohen's κ, per-class agreement
4. Adjudicate disagreements via third-party review or consensus discussion
5. PRESERVE pre-adjudication labels (not just the final)
6. Report: κ, per-class disagreements, class prevalence, confusion matrix
```

Cohen's κ alone is insufficient — it behaves strangely under high class prevalence. Report raw agreement and per-class disagreement alongside κ.

---

## Decision Stability (Replaces Simple Correlation)

The pipeline cares about multiple distinct stability properties. Spearman correlation of channel rankings is only one. Report at least:

```yaml
stability_metrics:
  video_recurrence: "Jaccard(videos_week1, videos_week2)"        # Do the same videos appear?
  channel_recurrence: "Jaccard(channels_week1, channels_week2)"   # Do the same channels appear?
  score_stability: "Spearman(gap_scores_week1, gap_scores_week2)" # Are the scores ordered similarly?
  topic_decision_stability: "Top5 Jaccard(topics_week1, topics_week2)"  # Would we pick the same topics?
  threshold_crossing: "P(score crosses operational threshold)"    # Does the recommended set change?
  selection_churn: "fraction of recommended topics that change"    # How much churn in the output?
```

The most operationally relevant metric is `topic_decision_stability`: given the gap scores, would the pipeline recommend the same 5 topics next week? A moderate Spearman r can coexist with perfectly stable top-5 decisions — or extreme churn.

---

## Lineage Tracking

Every derived metric carries its provenance:

```json
{
  "metric": "gap_score",
  "version": "2.1.0",
  "formula": "(in_only_channel_count / total_in_channel_count)",
  "formula_hash": "sha256:abc...",
  "source_snapshot_ids": ["youtube-search-20260721"],
  "code_commit": "abc123def",
  "parameters": {
    "published_after_days": 365,
    "min_results": 5,
    "regions": ["IN", "US", "GB"]
  }
}
```

This prevents comparing two "gap scores" generated by different formulas or search windows without realizing it. Every derived field in `data/research/` should reference its source snapshot and formula version.

---

## Implementation Status

**The CI-enforced manifest validation described below does not exist yet.** It's the target architecture. Currently, experiments are documented in Markdown and validated manually. The YAML manifest format, schema validation, and CI gates are designed but not built. Until they are, agents should follow the pre-experiment checklist manually and document results in the standardized format.

## Summary: What Changes

| Before | After | Enforced By |
|--------|-------|-------------|
| Markdown guidelines | Machine-validatable YAML manifests | CI (not yet implemented — aspirational) |
| Single "validated" status | Multi-dimensional evidence_state + operational_status | Manifest schema (not yet implemented) |
| Agent remembers to check things | CI rejects without required fields | CI gates (not yet implemented) |
| Preregistration is a timestamp | Preregistration is a commit SHA + pinned dataset | Git |
| Thresholds can shift post-hoc | Amendments require classification | CI |
| Shuffled-title control | 4 null controls + ΔR² CV | Analysis template |
| One evaluation set | Diagnostic balanced + natural-prevalence frozen | Manifest |
| κ alone | κ + raw agreement + per-class + confusion matrix | Analysis output |
| Spearman r for stability | Jaccard, RBO, ICC, selection churn, threshold-crossing | Analysis template |
| "Wikipedia refuted" | "Pilot found no evidence; resource-allocation decision" | Limitations field |
