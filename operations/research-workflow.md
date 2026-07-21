# Standardized Research Workflow

How to run a research experiment from start to documented conclusion. Every experiment produces a JSON report in `data/research/{dataset}/` with gates, interpretation, and actions.

## The Pattern (Apply to Every Experiment)

```
1. STATE THE ASSUMPTION
   "X predicts Y under Z conditions."
   What specifically would falsify it?

2. RUN A PILOT (small n)
   If result is unclear:
     a. Suspect sample size — scale up
     b. Suspect test design — is the test measuring the right thing?
     c. Suspect data merge — are the keys actually connecting?
   If still unclear after all three probes:
     d. Accept that the question can't be answered with available data
        Document why and move on.

3. SCALE UP
   Run at larger n. If the result changes, you haven't converged.
   Only trust a result that stabilizes across at least two sample sizes.

4. DOCUMENT
   Write to data/research/{dataset}/ with:
   - Experiment name and timestamp
   - Sample size and source data
   - Raw results
   - Gate status (PASS/FAIL/INFORMATIVE)
   - Interpretation notes
   - Suggested actions

5. DECIDE
   Update the pipeline spec if the result changes a decision.
   If the result is null (Wikipedia r=0.027), document and move on.
   A null result is still a result — it tells you what NOT to build.
```

## Dataset Status

| Dataset | In R2? | Pipeline Written? | Has Been Queried? | What's Needed |
|---------|--------|-------------------|-------------------|---------------|
| YouNiverse | ✅ | `scripts/layer1-youniverse-test.py` | ✅ A1-A3 complete | Nothing — ready for further analysis |
| YTCommentVerse (10.8 GB SQLite) | ✅ | ❌ | ❌ | Pipeline to query comment intent taxonomy |
| Global Trending (26.4 GB tarball) | ✅ | ❌ | ❌ | Extract tarball + pipeline for cross-country diffusion |
| Regional Audit | ❌ (author request) | N/A | N/A | Contact authors |

## What to Run Next

### Priority 1: YTCommentVerse Comment Taxonomy

**Assumption:** Comment intent types (question, correction, source request, skepticism, personal testimony) can be reliably classified and clustered.

**Pilot:** Query 10,000 comments from the SQLite DB. Manually classify 100 into intent types. Check: are they clusterable? If yes, scale to full dataset.

**Files to create:** `scripts/layer3-comment-taxonomy.py`, `data/research/layer3/`

### Priority 2: Global Trending Cross-Country Diffusion

**Assumption:** Indian educational/religious content that appears in IN trending also appears in US/UK trending with a measurable time lag.

**Pilot:** Extract one month of data from the tarball (26.4 GB → needs extraction). Filter for IN-origin videos. Check: do any appear in US/UK? If yes, measure lag.

**Files to create:** `scripts/layer3-cross-country.py`, `data/research/layer3/`

### Priority 3: Own Production (Layer 3)

**Assumption:** High gap score + high replication = high video performance on our channel.

**This is the expensive one.** Requires: farm Worker deployed, research pipeline running, 10 videos produced. Cannot be tested with pre-existing datasets.

## Troubleshooting Logic

When a result doesn't make sense, follow this checklist:

```
IS THE SAMPLE TOO SMALL?
  → A1 at n=100: 16% diff
  → A1 at n=500: 44% diff
  → Result changed → hadn't converged yet
  → Fix: scale up

IS THE TEST DESIGN WRONG?
  → A2 within-channel: 0 channels tested (channels don't change category)
  → A2 pooled across channels: delta R² = 0.017
  → Fix: match test design to variable's structure

IS THE DATA MERGE BROKEN?
  → A3 showed 0% flips → was the time series actually connected?
  → Checked: 28,245 records from 196 channels loaded. Merge keys matched. Regression produced near-zero slope.
  → Result was real — mature channels don't have enough growth variance.
  → Fix: document the null result, don't force a finding.

IS THE THRESHOLD ARBITRARY?
  → A1 threshold was <80% overlap. We got 56%.
  → PASS — but what if threshold was 70%? Still PASS.
  → Thresholds should be set before running, not adjusted after.
  → If a result is right at the threshold, report the sensitivity.
```

## Output Standard

Every experiment writes to `data/research/{dataset}/{experiment}-{timestamp}.json`:

```json
{
  "experiment": "unique-name",
  "dataset": "youniverse",
  "timestamp": "20260721_120000",
  "sample": { "channels": 500, "videos": 14432 },
  "assumptions": {
    "A1_ols_vs_raw": { "pct_different": 44, "gate": "PASS" }
  },
  "gates": {
    "A1": { "status": "PASS", "detail": "56% overlap (below 80% threshold)" }
  },
  "all_pass": true,
  "interpretation": {
    "notes": ["A1: 44% label difference — signal is meaningful"],
    "actions": ["Use OLS residual as primary metric"]
  },
  "open_questions": ["Does the 44% hold at n=1000?"]
}
```
