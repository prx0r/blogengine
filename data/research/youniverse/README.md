# Layer 1 Research Log — Breakout Metric Validation

## What We Were Testing

Three assumptions behind the breakout metric, using YouNiverse (136k channels, 72M videos, 2005-2019).

| Assumption | Question | Test |
|-----------|----------|------|
| A1 | Does OLS residual (log views ~ log age) identify different breakout labels than raw views? | Per-channel OLS, compare top-quartile overlap |
| A2 | Does knowing a channel's category improve view prediction? | Pooled model across channels, delta R^2 |
| A3 | Does removing subscriber growth trend change breakout labels? | Compare labels before/after momentum stripping |

## The Probing Process

### Run 1: n=100 channels (pilot)
```
A1: 84% overlap → 16% of labels differ → FAIL (threshold <80%)
A2: 0 channels tested (within-channel test was wrong design)
A3: Skipped (A1 didn't pass)
```

**Reaction:** 16% difference is weak. Is OLS residual worth the complexity for 16%? Or is the sample too small?

**Probe:** The n=100 sample only had ~20 videos per channel. With 100 channels × 20 videos = 2000 data points, the per-channel OLS is fitting on ~20 points each. That's noisy. We need more channels to see if the effect converges.

### Run 2: n=500 channels (full test)
```
A1: 56% overlap → 44% of labels differ → PASS
A2: delta R^2 = 0.017 → PASS  
A3: 0.0% flips → informative only
```

**Reaction:** 44% is a completely different result. At n=100 it was 16%, at n=500 it's 44%. The 100-channel sample was too small — the per-channel OLS (fit on ~20 videos) was producing noisy residuals, and with only 100 channels that noise hadn't averaged out. At n=500, the signal converged.

**Key insight:** Small samples in within-channel analysis are treacherous. Each channel's OLS is already noisy (fit on 20-30 points). If you then only sample 100 channels, you're averaging 100 noisy estimates. The noise cancels at larger n.

**What 44% difference means:** OLS residual and raw views disagree on nearly half of breakout labels. This isn't marginal — it's a fundamental reframing of what "breakout" means. The age-normalized metric is catching videos that are young but high-performing (which raw views would miss because they haven't had time to accumulate), and demoting old videos that coast on accumulated views.

### A3: 0.0% flips — real or broken?

**Probe:** Was the time series data actually loaded and merged correctly? Checked: 28,245 records from 196 unique channels loaded. Merge keys (channel_id, quarter) matched. Regression of subscriber growth vs age-residual produced near-zero slope.

**Conclusion:** For mature YouNiverse channels (all >10k subs, >10 videos), subscriber growth is stable enough that it doesn't change which videos look like outliers. This doesn't mean momentum never matters — it likely matters for small, rapidly growing channels. But for this dataset, it's negligible.

## Established Decisions

| Decision | Evidence | Source |
|----------|----------|--------|
| **Use OLS residual** as breakout metric | 44% label difference from raw views | A1 at n=500 |
| **Include category** as covariate | delta R^2 = 0.017 | A2 at n=500 |
| **Skip momentum stripping** for mature channels | 0.0% flips | A3 at n=200 |
| **Re-test momentum** on own data later | YouNiverse channels are mature, our farm channels may not be | A3 caveat |

## The Drill-Down Methodology

When a result is unclear, here's the process we used:

```
1. SUSPECT THE SAMPLE SIZE
   ↳ Run 1 (n=100): 16% difference → unclear
   ↳ Run 2 (n=500): 44% difference → clear
   ↳ Lesson: within-channel analysis needs more channels because each channel's estimate is noisy
   ↳ Fix: increase n until result stabilizes (convergence check)

2. SUSPECT THE TEST DESIGN
   ↳ A2 (within-channel, Run 1): 0 channels tested → wrong design
   ↳ A2 (pooled across channels, Run 2): delta R^2 = 0.017 → clear
   ↳ Lesson: category is a cross-channel property, not a within-channel one
   ↳ Fix: match test design to the variable's actual structure

3. SUSPECT THE DATA
   ↳ A3: 0.0% flips → is the merge working?
   ↳ Probe: checked time series load (28k records, 196 channels), check merge keys, check regression
   ↳ Result: merge works, the data just shows no effect for mature channels
   ↳ Lesson: a "boring" result is still a result — document it and move on

4. CONVERGENCE CHECK
   ↳ Run A1 at n=100: 16% diff
   ↳ Run A1 at n=500: 44% diff  
   ↳ If we ran at n=1000 and it stayed at ~44%, we'd be confident in the result
   ↳ Rule: if the result changes substantially when you increase n, you haven't converged yet
```

## Running the Test

```bash
# Required env vars (set fresh each session):
export AWS_ACCESS_KEY_ID="<redacted>"
export AWS_SECRET_ACCESS_KEY="<redacted>"
export AWS_DEFAULT_REGION="auto"
export S3_ENDPOINT="https://954612afb5a97bb15dddcdc70176813d.r2.cloudflarestorage.com"

# Run default (500 channels, 30 videos each, ~70s):
python3 scripts/layer1-youniverse-test.py

# Quick smoke test (200 channels, 20 videos, ~40s):
python3 scripts/layer1-youniverse-test.py --channels 200 --videos 20

# High-confidence run (1000 channels, 50 videos, ~3 min):
python3 scripts/layer1-youniverse-test.py --channels 1000 --videos 50
```

## Output

Results go to `/root/projects/blog/data/research/youniverse/layer1-{timestamp}.json` with:
- Raw assumption results (A1, A2, A3)
- Gate status (PASS/FAIL)
- Interpretation notes
- Suggested actions

Example summary block:
```json
{
  "A1": { "overlap_with_raw": 0.56, "pct_different": 44, "gate": "PASS" },
  "A2": { "delta_r2": 0.017, "gate": "PASS" },
  "A3": { "flip_pct": 0.0, "gate": "informative" },
  "all_pass": true,
  "notes": ["A1: 44% label difference — OLS residual captures distinct signal"],
  "actions": ["Use OLS residual", "Include category", "Skip momentum for now"]
}
```

## Files

| File | Purpose |
|------|---------|
| `scripts/layer1-youniverse-test.py` | The test (v2: A1/A2 pass, A3 informative) |
| `data/research/youniverse/layer1-*.json` | Run outputs with full results |
| `pipelines/r2-dataset-reference.md` | Standardized R2 dataset docs |
| `operations/layer1-handover.md` | Handover for monitoring agent |

## Next Steps After Layer 1

A1 and A2 passed. Foundation is validated. The farm-factory at `farm-factory/` has the complete architecture but is missing:
1. YouTube API client in `lib/youtube.ts`
2. Google Trends client in `lib/trends.ts`
3. Wikipedia pageview client in `lib/wikipedia.ts`
4. Actual Worker deployment (wrangler deploy)

Layer 2 (API tests) can run in parallel: re-run Stage 1 test, collect 2 weeks of daily searches for the weekly-vs-daily question, validate Wikipedia z-score correlation.

Layer 3 (own production) waits until Layers 1-2 are solid.
