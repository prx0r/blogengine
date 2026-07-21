# Farm Implementation Plan — Master Document

## Abstract

Cloudflare-native intelligence and content pipeline for English-language tantra documentary channels. Validates topics through open research datasets, generates gap maps via structured YouTube API queries, produces video treatments through AI Workflows, and publishes to YouTube — all for ~$14/month. Parameterized as a "farm template" cloneable for any niche.

## Research Hypothesis

Indian creators and audiences validate subjects, figures, and narratives poorly translated into Western documentary conventions. The opportunity is identifying culturally proven subjects and repackaging them around universal curiosity.

### Three Gap Types

| Gap | Description | Detection |
|-----|-------------|-----------|
| Language | Hindi/Bengali video, no English equivalent | regionCode=IN + defaultAudioLanguage check |
| Format | Info exists only as lectures/podcasts/satsangs | Classify results by format type |
| Framing | Nobody searches technical terms, clicks universal narratives | Title archetype: technical vs transferable |

### Rejected Alternative

"YouTube deliberately suppresses Indian channels" — cannot prove with available tools (Search API is unsuitable per arXiv:2506.11727, regionCode does not simulate personalized feeds).

## Methodology

### Within-Channel Breakout Analysis

Comparing across channels measures audience size, not content. Within-channel isolates the variable: what made THIS video hit vs that channel's own misses.

### Breakout Metric

```
# Age-band normalized (recommended)
age_band = floor(age_days / 30)
band_median = median(views for same-band videos, same channel)
outlier_score = log2((views + 100) / (band_median + 100))
```

Labels (ordinal): top 10% extreme, 75-90% strong, 25-75% normal, bottom 25% weak. Do not discard middle 25%.

### Sampling

All uploads from last 12 months per channel (full population). If >100 in window, random sample of 100. Never top 100 by views — selects on outcome.

### Why Not Regex Title Features as Primary

Multimodal features (arXiv:1807.05959) outperform individual classes. Model should test:

```
Outlier ~ topic + channel_baseline + channel_momentum + duration + title_semantics + thumbnail_semantics
```

Not: `Outlier ~ question_mark + colon + power_words`

Title analysis should use semantic axes: known entity, universal problem, mystery, conflict, prohibition, technical density, epistemic posture.

## Data Sources

### Primary: YouTube Data API v3

| Endpoint | Cost | Daily Limit | Use |
|----------|------|-------------|-----|
| search.list | 1 call | 100 (separate bucket) | Discovery, gap measurement |
| videos.list | 1 per 50 | 10,000 general | Stats, audio language |
| channels.list | 1 per 50 | 10,000 general | Channel metadata |
| playlistItems.list | 1 per call | 10,000 general | Upload harvest |
| commentThreads.list | 1 per call | 10,000 general | Comment mining |

### Secondary: Open Research Datasets

| Dataset | Size | What It Validates |
|---------|------|-------------------|
| YouNiverse | 3.4 GB | Breakout metric selection, channel size effects, title signal |
| Global Trending | 26.4 GB | Cross-country diffusion, IN-to-US lag, title archetypes |
| YTCommentVerse | 10.8 GB | Comment intent taxonomy, language-as-geography proxy |

### Tertiary: Academic Signal Stack

Crossref (publication volume), OpenCitations (citation graph), Semantic Scholar (abstracts/embeddings), arXiv (emerging science). Replaces OpenAlex.

## Architecture

### Component Rationale

| Need | Choice | Why |
|------|--------|-----|
| Compute | Workers ($5/mo) | Cheaper than Cloud Functions for volume |
| Storage | R2 ($0.015/GB) | No egress fees, GCP charges egress |
| Database | D1 ($0.75/GB) | Cloud SQL minimum $10/mo |
| AI inference | Workers AI ($0.011/1k neurons) | Vertex AI ~$0.05/call |
| LLM gateway | AI Gateway (included) | Caching, fallback, cost tracking |
| Analytics warehouse | BigQuery ($5/TB) | Cloudflare has no equivalent |
| Container hosting | Cloud Run (free 2M req) | Cloudflare has no equivalent |

Cloudflare core stack: ~$14/mo. GCP credit ($300) reserved for BigQuery + Cloud Run + optional Vertex AI training.

### Hermes as Cognitive Controller

Hermes chooses topics and requests approval. Workflows own the durable state machine. Not the reverse.

```
Hermes: "Produce topic X using packet Y"
  -> Video Workflow: durable execution (retries, state, persistence)
    -> Cloudflare tasks + External compute (VPS render)
```

### Queue Topology (2 Queues)

```
research_ingest   <- Research cron pushes opportunities
external_jobs     <- VPS render worker pulls FFmpeg jobs
dead_letter       <- Failed messages for manual review
```

Workflows handle state within Cloudflare. Queues only needed across compute boundaries.

### Why Not FLUX for Thumbnails

Brand edge is authentic historical artwork + crisp typography. AI thumbnails undermine credibility. FLUX only for backgrounds/concepts. Thumbnails composed deterministically from public domain art, safe typography, single focal object.

## Pipeline Stages

### Stage 0: Dataset Validation (one-time, in progress)

Download YouNiverse, YTCommentVerse, Global Trending to R2. Run nested regressions to validate breakout metric before building production pipeline.

### Stage 1: Daily Research (Cron 6am)

```
1. playlistItems.list + videos.list -> new uploads from CHANNEL_IDS
2. Compute breakout scores (age-band normalized)
3. Thumbnail cascade: all -> cheap features (DETR), top 20% -> LLaVA
4. Hook classification on top 5 breakouts
5. Gap map: 48 searches + 12 velocity searches
6. Push high-opportunity topics to Queue
```

API budget: 60 search calls, ~300 general units.

### Stage 2: Topic Opportunity Detection

```
topic_opportunity = gap_score x language_lag_score x breakout_rate x western_demand / (1 + english_supply)
academic_signal = 0.40 x publication_growth + 0.25 x citation_growth + 0.20 x author_diversity + 0.15 x recent_influential_work
opportunity_score = topic_opportunity + 0.2 x academic_signal
```

### Stage 3: Content Production (Workflows)

```
Step 1: research_gap(topic_id) -> D1 query
Step 2: generate_treatment -> AI Gateway ($0.02)
Step 3: WAIT_FOR_APPROVAL (human gate)
Step 4: write_script -> AI Gateway + validation gates ($0.05)
Step 5: generate_audio -> Deepgram Aura 2 ($0.40 per 15 min)
Step 6: create_thumbnail -> deterministic composition ($0)
Step 7: push_render_job -> Queue -> VPS FFmpeg -> R2
Step 8: WAIT_FOR_RENDER
Step 9: publish -> YouTube API (1,600 quota), requires approval
```

Each step is idempotent: video_id + step_name + input_hash + version.

### Stage 4: Publication Gate

rendered -> qa_passed -> WAITING_FOR_PUBLISH_APPROVAL -> published. Never auto-publish historical/religious claims.

### Stage 5: Post-Release Learning

Fixed-age metrics at 24h, 7d, 28d, 90d. Diagnostic trees for common metric patterns. Hypothesis falsification: requires >=5 tests per hypothesis.

## Content Strategy

Positioning: "Not how to practise dark tantra. Not everything is fake. But what these traditions claimed, why people believed them, and what history can verify."

Repeatable format (8 beats):
1. Frightening claim
2. Strongest image or story
3. What earliest text says
4. What later folklore added
5. Why practice made philosophical sense
6. What historians can verify
7. What modern channels get wrong
8. Why subject still matters

### Lane Priorities

Tier 1 (build identity): Cremation-ground religion, Forbidden goddesses, Investigations of famous claims.
Tier 2 (after identity set): Black magic history, Tantric objects, Dark temples.
Tier 3 (reach, not identity): Tantra/sex/taboo, Possession/exorcism.

## Verification System

Every stage has binary gates. All gates must pass before advancing.

| Stage | Gates | Examples |
|-------|-------|----------|
| Stage 1 | V01-V05 | All queries returned results, gap_score computed, API usage logged |
| Stage 2 | V06-V10 | Channels pass criteria, 20-40 count, metadata fetched |
| Stage 3 | V11-V15 | Uploads fetched, breakout_score computed, full sample |
| Stage 4 | V16-V19 | Title features extracted, LLM agreement >=80% |
| Stage 5 | V20-V24 | Model trained, gap map published, API tracked |

LLM validation: 50 hand-checked samples before trusting. >=80% agreement required.

## Cost Summary

| Component | Monthly |
|-----------|---------|
| Workers Paid | $5.00 |
| R2 (40GB datasets) | $0.60 |
| Workers AI (research) | ~$3.00 |
| AI Gateway | Included |
| D1, Queues | Included |
| Stream (optional) | ~$0.10 |
| Browser Rendering | ~$5.00 |
| **Total** | **~$13.70** |

Per-video production: ~$0.25 + YouTube quota. At 1 video/week: ~$1/month + base = ~$14.70/month.

GCP credit ($300) separate: BigQuery for dataset analysis, Cloud Run for FFmpeg render, optional Vertex AI training.

## Farm Template

The entire system is parameterized by FARM_ID. Cloning for a new niche:

1. Set CHANNEL_IDS (20-40 channels)
2. Set TOPIC_CLUSTERS (niche-specific taxonomy)
3. Set FARM_ID
4. Deploy

```
farm-template/
├── wrangler.jsonc       <- D1, R2, Queue, AI bindings parameterized by FARM_ID
├── src/
│   ├── cron/daily-research.ts
│   ├── workflows/produce-video.ts
│   ├── workers/api.ts
│   └── d1/schema.sql
└── package.json
```

Cost per additional farm: ~$2/month for storage (D1 + R2). Workers Paid plan covers unlimited farms.
