# Farm Critique — Gap Analysis

Comparing the critique (2026-07-21) against our current `farm-factory/` and `farm-implementation-plan.md`.

## Already Have (ahead)

| Critique Point | Our Status | Location |
|----------------|------------|----------|
| Within-channel comparison | ✅ Core principle | farm-implementation-plan.md §Methodology |
| OLS residual metric | ✅ Adopted | farm-implementation-plan.md §Fix 1 |
| Momentum stripping | ✅ Two-stage residual | farm-implementation-plan.md §Fix 2 |
| Weighted sum with clamp | ✅ Replaced multiplicative | farm-implementation-plan.md §Fix 4 |
| Wikipedia pageview signal | ✅ Replaced academic | farm-implementation-plan.md §Fix 5 |
| Separate authority score | ✅ `research_authority_score` independent | farm-implementation-plan.md §Fix 5 |
| Full-population harvesting | ✅ 12-month window | farm-implementation-plan.md §Methodology |
| Daily channel harvest / weekly gap / monthly rebuild | ✅ Cron schedule | farm-factory/docs/PIPELINE.md |
| Human publishing gate | ✅ `WAITING_FOR_PUBLISH_APPROVAL` | farm-implementation-plan.md §Stage 4 |
| Fixed-age post-release snapshots | ✅ 24h/7d/28d/90d | farm-implementation-plan.md §Stage 5 |
| Fact-check gate | ✅ Before Stage 3 | farm-implementation-plan.md §Fix 7 |
| Hook backfill then maintain | ✅ One-time + ongoing | farm-implementation-plan.md §Fix 6 |

## Needs Updating (gaps)

### 1. Three Channel Populations

We have `competitor_type` (direct/audience/format) but the critique splits differently:

**Current:** direct / audience / format
**Should be:** source (Indian content providers) / authority (academic-style) / narrative (documentary craft)

Our "direct" mixes Indian source channels and academic channels. Split them.

### 2. Format-Matched Breakout Comparison

We use age-band or OLS residual but don't compare videos of the same format class. A 90-min lecture and a 12-min documentary have different accumulation curves.

**Fix:** Add format_class (short, clip, long-form, podcast, lecture, livestream, documentary) as a covariate in the OLS, or stratify comparators by format.

### 3. Hard Viability Gates Before Opportunity Scoring

We go straight to weighted sum. Need pre-gates:

- source_depth >= minimum
- visual_depth >= minimum
- central_mystery exists
- safe editorial treatment possible
- English improvement is materially possible

If any fail, topic doesn't get scored.

### 4. Replicated Topic Proof (3+ channels)

Our `breakout_rate` doesn't require multiple independent channels. A single BeerBiceps episode can score high.

**Fix:** Add `independent_channel_count` and `celebrity_dependence_penalty` to the opportunity formula.

### 5. Western Adjacent Narrative Mapping

We mention this conceptually but don't have a formal mapping table:

| Technical subject | Western proof category |
|-------------------|----------------------|
| Cremation-ground sadhana | Death rituals, extreme asceticism |
| Bagalamukhi | Dangerous speech, curses |
| Yogini temples | Lost temples, sacred architecture |
| etc. | |

### 6. Stratified Thumbnail Analysis (Not Top-20%-Only)

We cascade: all → cheap, top 20% → LLaVA. This means LLaVA never sees misses.

**Fix:** 25% extreme/strong, 25% normal, 25% weak, 25% random/uncertain.

### 7. Stronger LLM Validation

We require 80% agreement. Critique points out a model can achieve 80% by predicting majority class.

**Fix:** macro F1 >= 0.75, kappa >= 0.65, no important class recall < 0.60. 100-200 stratified examples instead of 50.

### 8. Narrative Beats Over Fixed 8-Beat Structure

Our 8-beat structure is good as a checklist but risks same-formula-every-time.

**Fix:** Required narrative functions (HOOK, ORIENTATION, HYPOTHESIS, EVIDENCE, CONTRADICTION, REVERSAL, SYNTHESIS, RETURN) whose order can vary. Each beat stores `question_opened` / `answer_delivered` / `new_question_created`.

### 9. Five Output Objects

We produce: HO (hypothesis object), treatment, script, video. Critique suggests:

1. **Candidate Opportunity Packet** (auto-generated from signals)
2. **Research Pack** (deep research, claim ledger, source ledger)
3. **Episode Blueprint** (mystery, hypotheses, beats, reversals, assets)
4. **Asset Manifest** (licenses, URLs, attributions)
5. **Post-Release Record** (hypotheses, outcomes, updated priors)

### 10. Hypothesis State Machine

We have: pending / confirmed / rejected
Critique: untested / early_signal / mixed / provisionally_supported / provisionally_weakened / retired

### 11. Farm Parameterization (> FARM_ID)

We parameterize: FARM_ID, CHANNEL_IDS, TOPIC_CLUSTERS
Critique suggests 20+ parameters including AUDIENCE_PROMISE, FORBIDDEN_FRAMINGS, SAFETY_RULES, SCORING_WEIGHTS, BLUEPRINT_PROMPT, etc.

### 12. Reduced Daily Search

We spec 60 daily searches. Critique says this produces data churn. Daily = harvest known channels only. Weekly = search + inspect. Monthly = expand.

### 13. Forum Research as Structured Input

We have comment mining from YouTube but no structured forum research (Reddit, etc.) feeding the signal system.

## Action Items

| # | Change | Priority | Effort |
|---|--------|----------|--------|
| 1 | Split channel populations (source/authority/narrative) | High | Small |
| 2 | Add format class to breakout OLS | High | Small |
| 3 | Add hard viability gates before scoring | High | Small |
| 4 | Add replicated topic proof (3+ channels, celebrity penalty) | High | Small |
| 5 | Formalize Western adjacent narrative mapping table | Medium | Medium |
| 6 | Stratify thumbnail analysis (25% each) | Medium | Small |
| 7 | Upgrade LLM validation gate (macro F1, kappa) | Medium | Small |
| 8 | Replace fixed 8-beat with flexible narrative functions | Medium | Medium |
| 9 | Formalize 5 output objects | Medium | Large |
| 10 | Add hypothesis state machine | Low | Small |
| 11 | Expand farm parameterization | Low | Large |
| 12 | Reduce daily search, add weekly/monthly cadence | Medium | Small |
| 13 | Add forum research as structured input | Low | Medium |
