# Handover — YouTube Intelligence & Content Pipeline

## Project State (2026-07-21)

This project builds a YouTube market intelligence system plus an automated content factory for English-language tantra documentary channels. Research hypothesis: Indian creators validate topics that haven't been narrativized for Western audiences — the opportunity is cultural translation, not SEO gap detection.

---

## Architecture

```
Hermes (cognitive controller)
  │  chooses topics, requests approval, updates priors
  ▼
Cloudflare Workers + Workflows (durable execution)
  │
  ├── Research Pipeline → D1 feature store + gap map
  ├── Content Pipeline → R2 assets → YouTube upload
  └── Analytics Pipeline → hypothesis tracking + metrics
```

Cloudflare replaces almost all GCP services. The $300 GCP credit is best spent on BigQuery (dataset analysis) + Cloud Run (FFmpeg rendering).

---

## Key Files

### Strategy & Research

| File | Purpose |
|------|---------|
| `intelligence-pipeline.md` | Full experimental design: within-channel breakout analysis, gap maps, feature store schema |
| `highsignalspec.md` | Technical spec: breakout metrics, feature extraction, model design |
| `channel-growth-algorithm.md` | Machine-readable algorithm with 8 stages, binary verification gates, formulas |
| `youtubemaster.md` | YouTube growth guide: Reddit research synthesis, channel strategy |
| `youtubemaster2.md` | Revised thesis: cultural translation engine, open datasets, cross-language transfer |
| `brainstormcontent.md` | Dark Tantra content strategy with 8 pillars + tiered priority |
| `hermes/AGENTS.md` | Hermes agent context and project orientation |
| `hermes/SOUL.md` | Hermes personality: "the librarian, not the author" |

### Pipeline Specs

| File | Purpose |
|------|---------|
| `data/README.md` | Standardized data methodology, verification gates, API tracking |
| `pipelines/README.md` | Cross-dataset analysis overview (YouNiverse, Global Trending, YTCommentVerse, Regional Audit) + Academic signal stack |
| `pipelines/youniverse/README.md` | YouNiverse dataset spec: breakout metric validation, 8 research questions |
| `pipelines/global-trending/README.md` | Global Trending spec: cross-country diffusion, IN→US lag |
| `pipelines/yt30m-comments/README.md` | YTCommentVerse spec: comment intent taxonomy, language distribution |
| `pipelines/regional-audit/README.md` | Regional audit spec: overlap metrics baseline (dataset not publicly available) |
| `pipelines/hermes-army/hermescloudflare.md` | Full Cloudflare architecture: Workers, R2, D1, Workflows, Queues, AI Gateway, costs |

### Operations

| File | Purpose |
|------|---------|
| `operations/dataset-download.md` | Download 3 research datasets to Hetzner volume → R2. For agent execution. |

### Source Code

| File | Purpose |
|------|---------|
| `scripts/test-underserved-claim.mjs` | Stage 1: underserved claim test (v1.1.0 — fixed gap_score, publishedAfter, audio verification) |
| `scripts/validate-data-report.py` | Schema validation for standardized data reports |
| `scripts/market-landscape.ts` | YouTube market scan script (12 themes, search + channel harvest) |
| `src/lib/video-objects/youtube-data.ts` | YouTube API client with discoverMarket, channel harvest, audio verification |

### Data

| File | Purpose |
|------|---------|
| `data/reports/underserved-claim-test-2026-07-21.json` | Stage 1 report: 30 queries, 3 regions, gap scores, audio verification |
| `data/api-usage-log.csv` | Cumulative YouTube API usage tracking |
| `data/SCHEMA.json` | Schema for validating data reports |
| `data/underserved-claim-test.json` | Raw first-run data (deprecated — use reports/ for standardized) |

### Reference Docs

| Directory | Contents |
|-----------|----------|
| `docs/api-ref/` | YouTube Data API v3 — 9 endpoint references (search, videos, channels, playlistItems, commentThreads, captions, video resource, channel resource, quota) |
| `docs/cloudflare-ref/` | Cloudflare docs — R2, D1, R2 SQL, Workers, full platform index (56MB) |

---

## Current Status

### Completed

- **Stage 1 test**: 30 queries × 3 regions (IN, US, GB), 54 IN-only channels found, 24/30 queries show gap ≥0.30
- **Architecture spec**: Complete Cloudflare OS design with farm template, Hermes as orchestrator
- **Architecture review applied**: Fixed neuron math, pricing, queue topology, breakout metric, publish gates, storage strategy
- **Content strategy**: 8 pillars for dark tantra, tiered priority, repeatable format
- **Academic stack**: Replaced OpenAlex with Crossref + Semantic Scholar + OpenCitations fallback chain
- **Reference docs**: YouTube API and Cloudflare docs imported

### In Progress

- **Dataset download**: Other agent downloading YouNiverse (3.4 GB), YTCommentVerse (10.8 GB), Global Trending (26.4 GB) to R2 via Hetzner volume
- After download: breakout metric validation against YouNiverse historical data

### Not Started

- Daily research pipeline (Workers + Cron)
- Content production Workflows
- Hermes → Workers API integration
- Farm template creation
- Disk migration (R2 storage replacement)
- Google Cloud credit allocation (BigQuery + Cloud Run recommended)

---

## How to Run

```bash
# Stage 1 test (requires YouTube API quota — 100 search calls/day)
npm run data:underserved-test

# Validate output against schema
python3 scripts/validate-data-report.py data/reports/underserved-claim-test-YYYY-MM-DD.json

# Market scan (12 themes, 48 search calls)
npm run video:landscape

# Type check
npm run typecheck

# Deploy blog
npm run cf:deploy
```

## API Usage

- YouTube search.list: 100 calls/day (separate bucket)
- YouTube general pool: 10,000 units/day
- Track usage in `data/api-usage-log.csv`
- Stage 1 test uses 90 search calls + ~27 videos.list calls

## Key Decisions Made

| Decision | Rationale |
|----------|-----------|
| Cloudflare over GCP for core stack | No egress fees, Workers cheaper for serverless, AI Gateway cheaper for inference, D1 simpler than Cloud SQL. GCP only for BigQuery (data warehouse) + Cloud Run (FFmpeg). |
| Within-channel breakout analysis | Controls for channel size, audience, production style. Across-channel comparison is noisy (comparing 10k-sub channel to 5M-sub channel measures audience, not content). |
| Age-band normalized breakout | `log2((views+100)/(band_median+100))` with bands: 0-7d, 8-30d, 31-90d, 91-180d, 181-365d. Avoids linear-view-accumulation assumption. |
| Cultural translation engine > SEO gap detector | The real opportunity is narrative framing, not search keywords. Western audiences search for "Why this goddess cuts off her own head" not "Chinnamasta sadhana." |
| Hermes as cognitive controller | Hermes chooses topics and requests approval. Workflows own durable state and retries. Never auto-publish historical/religious claims without review. |
| 2 queues not 5 | Workflows handle state within Cloudflare. Queues only needed across compute boundaries (Cloudflare → VPS render). |
| Deterministic thumbnails > FLUX generation | Brand edge is authentic historical artwork + crisp typography. AI-generated thumbnails undermine credibility. FLUX only for backgrounds/concepts. |

## Contact

All work in `/root/projects/blog/`. Git remote: `https://github.com/prx0r/blogengine.git` (branch: main). Server: Hetzner Cloud VM `debz` (75GB disk, 50GB volume attached for datasets).
