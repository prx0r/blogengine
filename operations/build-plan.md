# Build Plan — From Spec to Running System

## The Dependency Chain

```
Global R2 content-genome (foundation)
  → Farm Workers (core compute)
    → Control plane D1 (metadata)
      → Dashboard Worker (UI)
        → First farm deployed (tantra)
          → First video produced (full pipeline)
            → Feedback loops begin
```

Everything depends on the Global R2 existing first. It's the simplest build and the most foundational.

---

## Sprint 1: Global R2 + Farm Workers (this week)

### 1a. Create the content-genome bucket

| Task | File | Action |
|------|------|--------|
| Create R2 bucket | Cloudflare dashboard | One click: `content-genome` |
| Upload art library | `scripts/upload-global-library.sh` | Copy existing public/art/ to R2 with asset manifest |
| Upload genome stubs | `content-genome/genome/patterns.json` | Write initial empty pattern registry (genome types without data) |
| Upload research corpus | Script TBD | YouNiverse validation results, gap test reports, Layer 1 outputs |
| Upload hook taxonomy | `content-genome/genome/hook-taxonomy.json` | Empty taxonomy ready for data |
| Create asset manifest | `content-genome/manifest.json` | sha256, license, attribution for every uploaded asset |

### 1b. Write the three missing API clients

| File | Purpose | What It Does |
|------|---------|-------------|
| `farm-factory/farm-template/src/lib/youtube.ts` | YouTube Data API v3 | search.list, videos.list, channels.list, playlistItems.list, commentThreads.list |
| `farm-factory/farm-template/src/lib/trends.ts` | Google Trends | interest_over_time for topic terms, geo-filtered to US+GB |
| `farm-factory/farm-template/src/lib/wikipedia.ts` | Wikipedia pageviews | pageview velocity z-score for deity/text/figure names |

These are the last code gaps. Once they exist, the farm Worker can execute the full research pipeline.

### 1c. Build the farm Worker

| Task | File | Action |
|------|------|--------|
| Implement daily research cron | `farm-factory/farm-template/src/cron/daily-research.ts` | Channel harvest → breakout scores → thumbnail cascade → hook classification → push opportunities |
| Implement research pack stage | `farm-factory/farm-template/src/factory/stage-2-research-pack.ts` | Claim extraction, source verification, fact-check gates |
| Implement script stage | `farm-factory/farm-template/src/content/script.ts` | HOST/AI-COHOST tagged dialogue generation with validation |
| Implement co-host interleave | `farm-factory/farm-template/src/content/audio.ts` | Split HOST recording + AI TTS → merge into timeline |
| Wire up wrangler.jsonc | `farm-factory/farm-template/wrangler.jsonc` | D1, R2, Queue, AI, Cron bindings |

---

## Sprint 2: Control Plane + Dashboard (parallel with Sprint 1)

### 2a. Create control plane D1

```sql
-- Run once, referenced from farm Worker on every stage transition
wrangler d1 create farm-control-plane
wrangler d1 execute farm-control-plane --file=control-plane/schema.sql
```

Schema already designed in `farm-factory/dashboard/dashboard-spec.md` — farms, pipeline_stages, approvals, topic_opportunities, cross_farm_metrics, control_commands, health_incidents.

### 2b. Implement farm status ingest endpoint

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `POST /api/farm/status` | Farm → Control | Report pipeline stage transition |
| `POST /api/farm/approval` | Farm → Control | New approval item created |
| `PUT /api/farm/command` | Control → Farm | Send signed command back |

### 2c. Build the dashboard Worker

```typescript
// Single Worker, serves HTML + JavaScript UI
// Reads from control plane D1
// Writes approval decisions back
// Protected by Cloudflare Access
// Endpoints:
//   GET  /                     → Dashboard UI
//   GET  /api/approvals        → Pending approvals across all farms
//   POST /api/approvals/:id    → Approve/reject
//   GET  /api/farms            → Farm grid with status
//   POST /api/farms/:id/command → Send control command
```

---

## Sprint 3: First Farm Deployment

### 3a. Provision tantra farm

```bash
# This script doesn't exist yet. Build it:
./scripts/create-farm.sh tantra

# Manual steps until the script works:
# 1. Create D1 database + apply schema
npx wrangler d1 create farm-tantra-db
npx wrangler d1 execute farm-tantra-db --file=farm-template/src/d1/schema.sql

# 2. Create R2 bucket + scoped tokens
npx wrangler r2 bucket create farm-tantra-assets
# (create token in Cloudflare dashboard: read+write on farm-tantra-assets)

# 3. Create Queues
npx wrangler queues create farm-tantra-pipeline
npx wrangler queues create farm-tantra-render

# 4. Deploy Worker
cd farm-tantra && npx wrangler deploy
```

### 3b. Populate farm-specific data

| Data | Source | How |
|------|--------|-----|
| CHANNEL_IDS | Stage 1 test results | Insert into D1 channels table |
| TOPIC_CLUSTERS | `brainstormcontent.md` | Insert into config |
| EVIDENCE_STANDARDS | Tantra-specific | Set in farm-manifest.yaml |
| FORBIDDEN_FRAMINGS | Tantra-specific | Set in farm-manifest.yaml |

### 3c. Verify research pipeline runs

```bash
# Trigger daily research (Cron equivalent):
curl -X POST https://farm-tantra.workers.dev/__cron/daily-research
# Expected output: channels scanned, breakout scores computed, gap map updated, opportunities pushed to queue
```

---

## Sprint 4: First Video Production

### 4a. Pipeline stages in order

```
1. Opportunity detected → treatment generated → sent to dashboard
2. You review treatment → approve
3. Research pack built → fact-check gates run
4. Script written (HOST/AI-COHOST) → validation gates run
5. Script appears in dashboard "record" view with your HOST lines highlighted
6. You record HOST lines → upload to farm R2
7. AI-COHOST lines generated via Deepgram Aura 2 TTS
8. Audio interleaved → render sent to FFmpeg
9. You review render → approve publish
10. Uploaded to YouTube
11. "Altered or synthetic" checkbox checked
```

### 4b. The dashboard recording view

The dashboard needs one new view: "Record → Script ID" shows only your HOST lines with gaps where the AI-COHOST responses will go. Upload your recorded audio. The system aligns it to the script timing and generates the AI lines to fill the gaps.

---

## Sprint 5: RO/PO Integration (runs alongside)

ROs and POs don't block the first video. They're a parallel track that enriches later videos:

| Phase | What | Maps To |
|-------|------|---------|
| Phase 1 (first 5 videos) | Research pack = simple source list + claims | Flat JSON, no versioning |
| Phase 2 (videos 6-10) | Research pack → RO (versioned, source-tracked) | Import Hermes RO schema |
| Phase 3 (videos 11+) | Philosopher profiles → PO asset library | Import Hermes PO schema |

The first videos don't need the full RO versioning machinery. They just need a research pack that says "this claim comes from this source." The RO/PO system gets layered in once the pipeline is producing real output and version tracking matters.

---

## Sprint 6: Docker + Local Infra

Once the Worker pipeline is producing real videos, containerize:

```dockerfile
# Dockerfile — hermes-base image
FROM node:22-slim
COPY hermes-agent /usr/local/bin/hermes-agent
COPY farm-factory /farm-factory
COPY entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
```

```yaml
# docker-compose.yml — one service per farm
services:
  farm-tantra:
    image: hermes-base
    env_file: ./farm-tantra/.env
    volumes:
      - /data/farms/tantra:/farm
```

---

## Summary

| Sprint | What Gets Built | Depends On | Duration |
|--------|----------------|------------|----------|
| 1 | Global R2 + API clients + farm Worker | Nothing | 1 week |
| 2 | Control plane D1 + dashboard | Sprint 1 | Parallel |
| 3 | First farm deployed (tantra) | Sprint 1 | 1 day |
| 4 | First video produced | Sprint 3 | 1 week |
| 5 | RO/PO integration | Sprint 4 | Ongoing |
| 6 | Docker infrastructure | Sprint 4 | 2 days |

The critical path is Sprint 1 → Sprint 3 → Sprint 4. That's the shortest path to a running system producing real output. Everything else (dashboard, control plane, RO/PO, Docker) can be built in parallel or after.
