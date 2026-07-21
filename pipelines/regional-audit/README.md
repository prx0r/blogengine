# Regional Geolocation Audit Pipeline

## Source

- **Paper:** arXiv:2409.10168 (ICWSM 2025)
- **Authors:** Hayoung Jung, Prerna Juneja, Tanushree Mitra
- **License:** CC BY

## Dataset Contents

915,000 YouTube search results collected via geolocated browser bots across US and South Africa.

### Collection Method

- 6 locations (3 US, 3 South Africa)
- 48 search queries
- 4 search filters (relevance, date, view count, rating)
- 10 days of repeated collection
- Sock-puppet browser agents with controlled IPs

### Schema (derived from paper methods)

Each result:

| Field | Type | Description |
|-------|------|-------------|
| query | string | Search query used |
| location | string | Geolocated city/region |
| country | string | US or ZA |
| search_filter | string | relevance / date / viewCount / rating |
| day | int | Collection day (1-10) |
| rank | int | Position in search results |
| video_id | string | YouTube video ID |
| title | string | Video title |
| channel_id | string | Channel ID |
| channel_name | string | Channel display name |
| published_at | datetime | Upload date |
| view_count | int | Views at collection |
| is_misinformation | boolean | Flagged as COVID-19 misinformation |
| domain_category | string | Source domain type (news, government, entertainment, etc.) |

The dataset was designed to compare misinformative content exposure between Global North and Global South. For our purposes, it is a **regional search similarity benchmark**.

## Access

Contact authors via paper for data access. The methodology is reproducible and the overlap metrics can be applied to any region pair including IN vs US.

## Research Questions

| # | Question | Method | Output |
|---|----------|--------|--------|
| 1 | What is the expected Jaccard overlap between two countries for identical queries? | Compute Jaccard(Top-10 results in US, Top-10 results in ZA) across all 48 queries. | "Mean Jaccard = 0.23. Range: 0.02 - 0.61." |
| 2 | How does rank-biased overlap differ from Jaccard? | Compute RBO for same query pairs. Compare distributions. | "RBO correlates with Jaccard at r=0.85 but penalizes rank differences differently." |
| 3 | Does top-10 or top-20 give more stable similarity estimates? | Compare overlap at k=5, 10, 15, 20. Variance across repeated daily measurements. | "k=15 gives optimal stability-vs-noise tradeoff." |
| 4 | Do subject categories affect overlap? | Compute per-category overlap (news, health, general). Report differences. | "Health queries: lower overlap than general queries." |
| 5 | How much does day-to-day variance affect regional comparisons? | Compute overlap for same query on day 1 vs day 2 vs day 10. Variance across days. | "Within-region day-to-day variance = 0.12. Cross-region = 0.31. The gap is real." |
| 6 | What similarity metric should we use for IN vs US gap detection? | Compare Jaccard, RBO, Top-10 overlap, Channel overlap, Exposure-weighted overlap on this benchmark. Recommend best metric. | "Exposure-weighted overlap best discriminates regional differences." |

## Application to Our Use Case

The regional audit dataset tells us what **expected** search overlap looks like between countries. This is our null hypothesis for the IN vs US gap test.

If IN vs US overlap for tantra queries is significantly lower than the US vs ZA benchmark (controlling for query type), then the gap is real and unusually large.

If IN vs US overlap is similar to US vs ZA overlap for comparable topics, then our Stage 1 results are just normal cross-country search variation, not evidence of a tantra-specific gap.

## Pipeline Steps

```
1. Obtain dataset from authors (or reproduce method for IN vs US with ~20 queries)
2. Compute overlap metrics: Jaccard, RBO, top-10, top-20, channel overlap
3. Compute for each query, then aggregate by category
4. Compare US-ZA baseline to our IN-US tantra overlap
5. If IN-US overlap << US-ZA benchmark: tantra-specific gap confirmed
6. If IN-US overlap ≈ US-ZA benchmark: normal cross-country variation
7. Recommend best similarity metric for ongoing gap tracking
```

## Output

- `pipelines/regional-audit/output/overlap-baselines.json` — Jaccard, RBO, channel overlap per query type
- `pipelines/regional-audit/output/recommended-metric.md` — which overlap metric to use for gap detection
- `pipelines/regional-audit/output/in-us-gap-context.json` — how our Stage 1 results compare to these baselines
