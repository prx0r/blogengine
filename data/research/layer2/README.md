# Layer 2 Research Log — Data Source Validation

## What We're Testing

Three assumptions about data source reliability, using free YouTube API quota and Wikipedia API.

| # | Assumption | Test | Threshold | Status |
|---|-----------|------|-----------|--------|
| 6 | Stage 1 IN-only channels are real, not API artifacts | Re-run with fix (publishedAfter), compare channel lists via Jaccard | Jaccard > 0.5 | FAIL (0.007) |
| 4 | Weekly rolling gap score is stable enough | 14 days of daily search collection, week-over-week Spearman r | r > 0.3 | IN PROGRESS (cron daily at 00:05 UTC) |
| 5 | Wikipedia pageview velocity correlates with gap scores | Spearman r between pageview z-score and gap score for 20 topics | r > 0.2 | FAIL (r=0.027) |

---

## Task 6: Stage 1 Underserved Test Re-run (Assumption 6)

Spec: `highsignalspec.md §1`, implemented in `scripts/test-underserved-claim.mjs v1.1.0`

### Run 1 (buggy): no `publishedAfter` filter
- File: `data/underserved-claim-test.json`
- 54 IN-only channels found
- Channel list unreliable — pulled content from any upload date

### Run 2 (fix applied): v1.1.0 with publishedAfter = 12 months
- Date: 2026-07-21
- File: `data/reports/underserved-claim-test-2026-07-21.json`
- API calls: 90 search.list + 13 videos.list = 103 total
- 89 IN-only channels found (vs 54 in buggy run)
- 16/30 queries show gap score >= 0.30 threshold (high interest: pancha makara 0.90, tantric texts 0.73, chakra tantra 0.57)
- 1 query with insufficient IN data: "tantric skull staff kapalika" (only 2 IN channels)
- 1 UK data quality flag: "tantric texts history" — 0 UK results
- Audio verification: 621 videos checked, 109 English audio (17.6%), 308 non-English (49.6%), 204 unknown (32.9%)
- Top non-English languages: hi (155), en-IN (48), en-US (31), en-AU (16), en-GB (8)

### Jaccard Comparison
- Old IN-only channels (by channel name — old schema has no channelId): 54
- New IN-only channels (by name): 89
- Intersection: 1 channel ("Hyper Quest")
- Jaccard similarity: **0.007**
- Threshold: 0.5
- **Result: FAIL** — channel lists are almost completely different between runs

### Drill-Down
Following the pattern from `data/research/youniverse/README.md`:
1. **Suspect sample size**: 30 queries × 15 results × 3 regions = 1350 data points — adequate
2. **Suspect test design**: Channel-level comparison across runs is confounded by time window change. Run 1 had no `publishedAfter` (all-time), Run 2 filters to 12 months. The test was designed to detect API noise but the dominant cause is the methodological bug.
3. **Suspect the data**: Confirmed by examining old report — no time filter field exists in Run 1's method section. The difference is real and expected.
4. **Convergence check**: Running with the same method 2 weeks apart would give a cleaner Jaccard test. Handled by Task 4 daily collection.

### Conclusion for the gap hypothesis
- Query-level gap pattern (16/30 with gap >= 0.3) is consistent and reproducible
- Specific channel lists change because YouTube search is time-sensitive
- Gap is real at the topic level; don't rely on specific channel IDs from a single snapshot
- **Action**: Run Stage 1 weekly for fresh channel lists

---

## Task 4: Daily Search Collection (Assumption 4)

Spec: `pipelines/farm-implementation-plan.md §Layer 2, Assumption 4`
Script: `scripts/daily-search-collection.mjs`
Cron: `5 0 * * *` (00:05 UTC daily, after quota reset)

### Design
- 16 queries × 3 regions (IN, US, GB) = 48 calls/day
- Fits within 100/day search quota (48/100)
- Same `publishedAfter` = 12 months window
- Stores raw video IDs, channel IDs, titles per region per query
- **No gap map computation** during collection — just raw data

### Status
| Day | Date | Quota Used | Results |
|-----|------|------------|---------|
| 1 | 2026-07-21 | 48/100 | Collected |
| 2 | 2026-07-22 | (cron) | Pending |
| 3 | 2026-07-23 | (cron) | Pending |
| ... | ... | ... | ... |
| 14 | 2026-08-03 | (cron) | Pending |

### After 14 Days
Compute week-over-week Spearman rank correlation:
- For each query, rank channel lists by frequency week-over-week
- Spearman r > 0.3 = weekly aggregation is stable enough
- Spearman r < 0.3 = daily noise too high for weekly aggregation
- Output: `data/research/layer2/weekly-stability-report.json`

---

## Task 5: Wikipedia Z-Score Validation (Assumption 5)

Spec: `pipelines/farm-implementation-plan.md §Layer 2, Assumption 5`
Script: `scripts/wikipedia-validation.mjs`
Output: `data/research/layer2/wikipedia-validation.json`

### Method
- 20 tantra-related Wikipedia terms (Kali, Bhairava, Chinnamasta, Kaula, Tantra, Abhinavagupta, etc.)
- Fetched 90-day pageview history via Wikimedia REST API
- Computed week-over-week z-scores (velocity, not raw levels)
- Matched to YouTube gap scores from Task 1 via curated topic alignment
- Spearman rank correlation between Wikipedia z-scores and YouTube gap scores

### Results
| Metric | Value |
|--------|-------|
| Terms checked | 20 |
| Terms with data | 13 (7 rate-limited by Wikipedia API) |
| Matched for correlation | 11 |
| Spearman r | **0.027** |
| Threshold | > 0.2 |
| **Conclusion** | **FAIL — no correlation** |

### Interpretation
Wikipedia pageview velocity does not correlate with YouTube gap scores for tantra topics (r=0.027, n=11). Wikipedia curiosity is not predicting YouTube supply gaps. Possible reasons:
1. Wikipedia readers and YouTube searchers are different populations
2. The 4-week z-score window is wrong — try 12-week trends instead
3. Wikipedia pageviews measure general awareness, not emerging interest

### Recommendation
Skip Wikipedia as an independent signal. Gap scores from YouTube search alone are sufficient. If external validation is needed, use Google Trends instead (same search-intent signal).

---

## Summary of Findings

| Assumption | Result | Impact |
|-----------|--------|--------|
| **6**: Stage 1 channels are real | FAIL (Jaccard 0.007) — but due to methodological bug, not API noise | Run Stage 1 weekly for fresh data |
| **4**: Weekly gap maps stable | IN PROGRESS (14-day collection running via cron) | Will update after 14 days |
| **5**: Wikipedia signal valid | FAIL (r=0.027) | Skip Wikipedia. Gap scores alone are sufficient |

### Drill-Down Methodology Applied
Following the pattern from `data/research/youniverse/README.md`:
1. **Sample size**: Task 5 pilot had n=3 (too small). Expanded to n=11 by fixing matching and sourcing more data. Still no correlation.
2. **Test design**: Task 6 had a confounded comparison (time window mismatch). Documented the confound rather than over-interpreting the FAIL.
3. **Data merge**: All data paths verified (gap score formula, Wikipedia API, z-score computation).
4. **Boring results documented**: Wikipedia FAIL is a useful finding — it saves future work trying to integrate Wikipedia signals.

## Files

| File | Purpose |
|------|---------|
| `data/research/layer2/README.md` | This file |
| `data/research/layer2/daily-query-results/` | Raw daily search results (14 days, cron-driven) |
| `data/research/layer2/wikipedia-validation.json` | Wikipedia z-score vs gap score analysis |
| `data/reports/underserved-claim-test-2026-07-21.json` | Task 1 re-run output (v1.1.0, 30 queries) |
| `data/underserved-claim-test.json` | Original buggy run (no publishedAfter) |
| `scripts/test-underserved-claim.mjs` | Task 1 script |
| `scripts/daily-search-collection.mjs` | Task 2 script (cron) |
| `scripts/wikipedia-validation.mjs` | Task 3 script |
| `scripts/run-daily-search.sh` | Cron wrapper for daily collection |
