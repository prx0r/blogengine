# Hermes Army — Full Architecture Spec

Hermes is the **cognitive controller**. Cloudflare Workflows own the durable state machine. The system has 4 deployable Workers + 1 external render service.

---

## 0. Storage Strategy — Moving Off Disk

### What moves where

| Location | Size | Moves To | Cost |
|----------|------|----------|------|
| `library/` (PDFs) | 1.3 GB | R2 `assets/library/` | ~$0.02/month |
| `content/sources/` | 1.3 GB | R2 `assets/sources/` | ~$0.02/month |
| `public/art/` | ~200 MB | R2 (originals) + Images (transformations, free tier: 5k transformations) | ~$0 |
| `public/audio/` | ~50 MB | R2 direct (not Stream — Stream is $5/1000 min stored) | ~$0 |
| `scholars/`, `science/` | ~280 MB | R2 `assets/papers/` | ~$0 |
| Research datasets | ~40 GB | R2 `research-datasets/` | ~$0.45/month |

**Total reclaimed: ~4.5 GB disk. Total R2 cost: ~$0.50/month.**

### Asset Manifest

Every asset tracked in D1:

```sql
CREATE TABLE assets (
  asset_id TEXT PRIMARY KEY,
  r2_key TEXT NOT NULL,
  sha256 TEXT NOT NULL,
  media_type TEXT NOT NULL,
  source_url TEXT,
  license TEXT,
  attribution TEXT,
  rights_status TEXT,
  derived_from TEXT,
  created_at TEXT NOT NULL
);
```

### Audio Delivery

Serve from R2 directly via Workers with HTTP range support. Not Stream. Stream is for full video hosting at $5/1000 min stored — inappropriate for narration files.

### Image Strategy

Store originals only in R2. Use Cloudflare Images transformations for delivery (free tier: 5k transformations/month). Do not duplicate into Cloudflare Images storage.

---

## 1. Available AI Models on Workers AI

### Vision (Thumbnail Analysis)

| Model | Cost | Use |
|-------|------|-----|
| LLaVA 1.5 7B | ~500 neurons/image | Full VLM analysis (use sparingly) |
| DETR ResNet-50 | ~100 neurons/image | Object/face counting |
| ResNet-50 | ~50 neurons/image | Broad classification |

**Cascade approach (do not run LLaVA on everything):**

```
All thumbnails → cheap metrics (dimensions, brightness, contrast, OCR, face count)
     │
     ▼
Top opportunities or uncertain → LLaVA VLM analysis
```

900 LLaVA analyses × 500 neurons = 450,000 neurons. At $0.011/1k = **$4.95**, not $0.005. The cascade cuts this by ~80%.

### Image Generation (Thumbnails)

**Do not generate full thumbnails with FLUX.** Your brand edge is authentic historical artwork + deterministic typography. Use FLUX only for:

- Missing backgrounds
- Concept sketches  
- Texture extensions
- Optional hero reconstructions

Then compose the actual thumbnail with code or a template system. Image models are unreliable at typography and undermine historical credibility.

| Model | Cost | Use |
|-------|------|-----|
| FLUX.1 Schnell | 4.8 neurons/512×512 tile | Background/concept only |
| SDXL Base 1.0 | Variable | Style transfer |

### Audio (Narration)

| Model | Cost | Use |
|-------|------|-----|
| Deepgram Aura 2 | $0.03/1000 chars | Narration with emotional range |

A 15-min script (~13,500 chars) costs **~$0.405**, not $0.01/min. Four videos/week = ~$1.60/month.

### Video Generation (Clips)

Third-party models via AI Gateway, NOT Workers AI neurons.

| Model | Billing | Use |
|-------|---------|-----|
| MiniMax Hailuo 2.3 | Provider price + 5% Unified Billing fee | Hero clips only |
| Google Veo 3 | Provider price | Higher quality |

**Budget rule:**
```
MAX_GENERATED_CLIPS=5
MAX_VIDEO_GENERATION_COST_USD=3.00
```

For a 15-min video: 3-6 hero clips + 20-40 public domain images + diagrams + cropped manuscript details. Not 30 generated clips — that increases cost, visual inconsistency, and makes the channel look like an AI slideshow.

---

## 2. AI Gateway — LLM Cost Control

| Feature | Benefit |
|---------|---------|
| Cache | Deterministic requests (thumbnail classification, hook taxonomy) cache with TTL. Script generation does NOT cache. |
| Fallback | DeepSeek → Workers AI Llama 4 |
| BYOK | DeepSeek key in Secrets Store |
| Cost tracking | Per-pipeline-stage attribution |

Cache key:
```
sha256(model_version + taxonomy_version + prompt_version + input_asset_hash)
```

---

## 3. Workflows — Durable Execution (Not Hermes)

Hermes is the **cognitive controller**, not the durable state machine.

```
Hermes: "Produce topic X using packet Y"
                │
                ▼
Video Workflow: durable execution (owns state, retries, persistence)
                │
       ┌────────┴────────┐
       ▼                 ▼
Cloudflare tasks    External compute (VPS)
```

Hermes: chooses topics, interprets research, requests approval, updates priors.
Workflows: persist completed steps, retry failures, wait for human approval, track idempotency.

### Workflow Steps

Each step uses an idempotency key:
```
video_id + step_name + input_hash + version
```

```
Step 1:  research_gap → gap_data (D1 query, ~0 neurons)
Step 2:  generate_treatment → treatment (AI Gateway → DeepSeek)
Step 3:  WAIT_FOR_APPROVAL (treatment review)
Step 4:  write_script → script (AI Gateway → DeepSeek, gate-validated)
Step 5:  generate_audio → audio_url (Workers AI: Deepgram Aura 2)
Step 6:  create_thumbnail → thumbnail_url (deterministic composition, optional FLUX for backgrounds)
Step 7:  push_render_job → job_id (to external_jobs Queue)
Step 8:  WAIT_FOR_RENDER (poll queue or webhook)
Step 9:  publish → youtube_id (YouTube Data API, requires approval)
```

### Limits

- Step CPU: 5 min max (configured upward)
- Step result size: 1 MiB max (return R2 references, not media data)
- Steps may be retried → must be idempotent

---

## 4. Queues — Simplified

**Two queues, not five.**

```
research_ingest  ← Research cron pushes new opportunities
external_jobs    ← VPS render worker pulls jobs
dead_letter      ← Failed messages for human review
```

Queues are only needed across compute boundaries (Cloudflare → VPS). Within Cloudflare, Workflows handle state.

```
research_ingest
  → Workflow: produce_video
    → pushes to external_jobs (only when VPS FFmpeg render needed)
    → external render → uploads back to R2
    → Workflow continues → publish
```

### Queue Config

- Retention: 4 days (default paid)
- At-least-once delivery → consumers must deduplicate
- Dead Letter Queue: 3 retries then manual review

---

## 5. R2 + Data Catalog + R2 SQL

### Research Dataset Storage

```
research-datasets/
├── youniverse/
│   ├── df_channels_en.tsv.gz
│   ├── df_timeseries_en.csv.gz
│   └── yt_metadata_helper.feather
├── global-trending/
├── comments/
├── crossref/
├── citations/
└── derived/
```

### Partition Strategy

Partition by: dataset > year > month > country > category

Daily jobs read only recent partitions. Full historical rebuilds run weekly/monthly.

### R2 SQL Budget

R2 SQL: 10 GB scanned free/month, then $0.0025/compressed GB scanned. A full 40 GB scan daily would be ~$3/month. Wasteful. Partition and scan only what's needed.

### Start Without Data Catalog

Upload as ordinary partitioned Parquet + DuckDB. Add R2 Data Catalog only when you need table evolution, SQL sharing, or multiple engines. DuckDB reads Parquet from R2 directly.

---

## 6. Deployable Components

Only 4 Workers + 1 external service:

### 1. Control Worker
- Hermes API endpoints
- Routes commands to correct farm
- Human approval gates
- Cross-farm analytics

### 2. Research Worker
- Daily channel harvest (Cron trigger)
- Breakout score computation
- Thumbnail cascade analysis
- Gap map updates

### 3. Video Workflow
- Full production pipeline (8-step Workflow)
- Durable execution with idempotency
- Media asset management

### 4. Analytics Worker
- Daily YouTube snapshot (views, likes, comments)
- Hypothesis table updates
- Pattern database maintenance

### 5. External Render Service (VPS)
- FFmpeg video compilation
- FableCut render API calls
- Reads assets from R2, writes output back
- Pulls jobs from `external_jobs` Queue

---

## 7. Browser Run — QA Only, Not Rendering

Browser Run (10 hours free/month on Workers Paid) is for:

- Opening FableCut editor
- Taking screenshots of timeline
- Running UI tests
- Previewing keyframes
- Human intervention

**Not** for final video rendering. Client-side FFmpeg/WebCodecs may hit browser limits. Use:

```
Browser Run: populate timeline, capture preview frames, UI validation
VPS Render: FFmpeg compilation, FableCut render
```

### Gold Standard QA

Do not ask "are these frames the same scene" (different videos = different scenes).

Evaluate a style rubric:

- Caption readable at mobile size
- Subject not cropped
- Safe margins respected
- Visual matches narration
- No visible generation defects
- No unsupported factual reconstruction
- Historical/artistic consistency
- Limited focal competition

Use deterministic checks for: black frames, clipping, resolution, caption safe area, audio silence, loudness, missing assets, duration mismatch.

Use vision models for semantic QA only after passing all deterministic checks.

---

## 8. Publishing

### YouTube Upload Cost

`videos.insert` costs **1,600 units** (not 100). With 10,000/day quota = ~6 uploads/day. Log every call.

### A/B Testing

No public API for native Test & Compare. Treat A/B test initiation as a YouTube Studio manual step unless Google exposes an endpoint. The API supports single-video metadata updates and thumbnail setting.

### Publish Gate

```
rendered → qa_passed → WAITING_FOR_PUBLISH_APPROVAL → published
```

Never auto-publish without human review, especially historical/religious claims.

### Exposed Endpoints

Domain operations, not generic D1/R2:

```
GET  /topics/:id/evidence
POST /videos/:id/commission
POST /videos/:id/approve-script
POST /videos/:id/approve-publish
GET  /jobs/:id
```

Use Worker service bindings internally (not public HTTP).

---

## 9. Revised Cost

### Stable Control Plane (monthly)

| Service | Cost |
|---------|------|
| Workers Paid | $5.00 |
| R2 (~40 GB) | ~$0.45 |
| Images (5k transforms) | $0 (free tier) |
| D1, Queues, Vectorize | Included in Workers Paid |
| Browser Run (10 hrs) | $0 (included) |
| Workers AI (research inference) | ~$1.50 (cascade reduces from $5 to ~$1) |
| **Base platform** | **~$6.95/month** |

### Per-Video Production

| Task | Cost |
|------|------|
| Script/treatment LLM | ~$0.05 (DeepSeek via AI Gateway) |
| Aura 2 narration (15 min) | ~$0.40 |
| Thumbnail composition | ~$0 (deterministic code) |
| Optional FLUX background | ~$0.0001 |
| VPS render time | ~$0 (existing Hetzner) |
| Generated video clips | **Unknown — provider priced** |
| **Per video (no clips)** | **~$0.45** |
| **Per video (with 5 clips)** | **~$0.45 + provider cost** |

### Total Honest Budget

> **$7–$11/month without extensive generated video, plus separately capped video-generation budget (~$3/video max).**

Previous estimate of $13.70 is accidentally close to the right number, but allocated to wrong things: Browser Run and Stream were overestimated, TTS and third-party video were underestimated.

---

## 10. Farm Template

```bash
# One command to clone a farm
./scripts/create-farm.sh tantra2

# Creates:
# - farms/tantra2/ from template
# - D1 databases: tantra2-fs, tantra2-gaps
# - R2 buckets: tantra2-assets, tantra2-outputs
# - Queue: tantra2-pipeline
# - Deploys with wrangler
```

Each farm is parameterized by `FARM_ID`. Workers Paid plan covers all farms — only storage scales.

### Cost Per Additional Farm

| Service | Cost |
|---------|------|
| D1 (5 GB) | $0 (included) |
| R2 (10 GB) | $0 (free tier) |
| Queues | $0 |
| **Per farm** | **~$0 + proportional compute** |
