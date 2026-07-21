# P2: Global Trending Cross-Country Diffusion

**Layer:** Signal — Topic timing and market selection
**Engine:** Trend Engine (E6)
**Dataset:** Global YouTube Trending — 26.4 GB, 104 countries, 3 years
**R2 path:** `s3://research-datasets/global-trending/youtube_trends.tar.bz2`
**Status:** Not started

## Research Question

Do topics from Indian YouTube channels diffuse into Western trending feeds with a measurable lag, and can we predict that lag to time content production?

## Hypothesis

Tantra/spirituality topics that appear in Indian trending feeds will appear in US/UK trending feeds 2-6 weeks later. Topics with shorter IN→US lag represent stronger cross-cultural demand and should be prioritized.

**Falsification:** Zero topics from the tantra/spirituality category appear in both IN and US trending feeds within any 12-week window. The dataset simply doesn't contain our niche.

## Methodology

1. Extract tarball to filtered Parquet (filter by category = "Education" / "Entertainment" / category_cc containing tantra-adjacent terms)
2. For each unique video, track first appearance in each country
3. Compute lag: first_IN_date → first_US_date, first_IN_date → first_GB_date
4. Cluster topics by cross-country diffusion pattern:
   - IN→US lag ≤ 14 days: high transfer potential
   - IN→US lag 15-42 days: moderate transfer
   - IN-only: low transfer (audience may be language-bound)
5. Check if IN-only trending videos later appear in US feeds via re-upload by different channels

## Output Schema

```json
{
  "experiment": "P2-global-trending-diffusion",
  "timestamp": "YYYYMMDD_HHMMSS",
  "total_videos_scanned": 1000000,
  "in_us_overlap_videos": 500,
  "diffusion_patterns": [
    {
      "topic": "kundalini",
      "in_peak_date": "2025-03-01",
      "us_peak_date": "2025-03-22",
      "lag_days": 21,
      "cross_category": "Education",
      "re_uploaded": true
    }
  ],
  "gates": {
    "sufficient_overlap_for_analysis": true
  },
  "next_step": "Correlate with Google Trends to confirm demand follows trending",
  "limitations": ["Trending data is not search data — popularity ≠ search demand"]
}
```

## Engine Integration

```
trend_engine.diffusion(topic) → {
    origin_region: string,
    current_regions: [string],
    lag_days: int,
    diffusion_speed: float  // categories: fast, moderate, slow, none
}
```

Used in Stage 2 topic validation: topics with fast IN→US diffusion signal cross-cultural readiness.

## Gotcha

Illinois Data Bank blocks Hetzner IPs. Use `download_link` API with `Referer` header to get a fresh URL (documented in `pipelines/r2-dataset-reference.md`).
