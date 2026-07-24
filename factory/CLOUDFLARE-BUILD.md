# Cloudflare Factory Build Spec

## Overview

Replace the Flask VPS dashboard with a Cloudflare Workers API + D1 + R2 + Queues + Workers AI stack. The dashboard SPA stays as static HTML served by Cloudflare Pages.

## Architecture

```
User Browser (studio.tantrafiles.xyz)
       │
       ▼ Cloudflare Tunnel ──► VPS (Flask — temporary, being replaced)
       │
       ▼ Cloudflare Workers (factory-worker) — NEW
  │
  ├── D1 (factory-db) ── Job state, shots, feedback, scene catalog
  ├── R2 (factory-assets) ── MP4s, voiceover, art, gold standards
  ├── R2 (atlas-sources) ── Existing art library, research datasets
  ├── Queues (factory-render) ── Job dispatch to render workers
  ├── Workers AI ── FLUX, LLaVA, BGE embeddings, Llama
  ├── AI Gateway ── Proxy to external LLMs (OpenAI, Anthropic)
  └── Vectorize (atlas-global) ── Existing scene/art similarity
       │
       ▼ Render Workers (vast.ai or external GPU)
           Poll Queues → render → upload to R2 → update D1
```

## Phase 1: Factory Worker

### `factory/wrangler.jsonc`

```jsonc
{
  "name": "factory-worker",
  "main": "src/worker.ts",
  "compatibility_date": "2026-07-01",
  "compatibility_flags": ["nodejs_compat"],
  "account_id": "954612afb5a97bb15dddcdc70176813d",
  "d1_databases": [{
    "binding": "DB",
    "database_name": "factory-db",
    "database_id": "" // set after `npx wrangler d1 create factory-db`
  }],
  "r2_buckets": [
    { "binding": "ASSETS", "bucket_name": "factory-assets" },     // video outputs
    { "binding": "SOURCES", "bucket_name": "atlas-sources" },      // existing art
    { "binding": "GOLDS", "bucket_name": "blog-video-assets" }     // gold files
  ],
  "queues": {
    "producers": [
      { "binding": "RENDER_QUEUE", "queue": "factory-render" }
    ],
    "consumers": [
      { "queue": "factory-render", "max_batch_size": 1, "max_retries": 3 }
    ]
  },
  "ai": { "binding": "AI" },
  "vectorize_indexes": [{
    "binding": "VECTORIZE",
    "index_name": "atlas-global"
  }],
  "vars": {
    "ENVIRONMENT": "production"
  }
}
```

### D1 Schema: `factory/src/d1/schema.sql`

```sql
-- Factory pipeline state
CREATE TABLE jobs (
  id TEXT PRIMARY KEY,
  essay_id TEXT NOT NULL,
  title TEXT,
  channel TEXT DEFAULT 'Tantra Files',
  status TEXT DEFAULT 'draft',         -- draft | review | revision | final
  version INTEGER DEFAULT 1,
  mp4_key TEXT,                        -- R2 key for final MP4
  duration_seconds REAL DEFAULT 0,
  essay_path TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE shots (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  label TEXT NOT NULL,
  rhetorical_function TEXT,
  visual_treatment TEXT,
  duration_seconds REAL DEFAULT 0,
  mp4_key TEXT,                        -- R2 key for per-shot clip
  status TEXT DEFAULT 'pending',       -- pending | rendered | approved | rejected
  narration_text TEXT,
  feedback_count INTEGER DEFAULT 0,
  FOREIGN KEY (job_id) REFERENCES jobs(id)
);

CREATE TABLE feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id TEXT NOT NULL,
  shot_id TEXT,                        -- NULL for episode-level feedback
  author TEXT DEFAULT 'Thomas',
  rating INTEGER,                      -- 1-5 stars
  dimension TEXT,                      -- composition | pacing | clarity | aesthetic | accuracy | narration | overall
  comment TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (job_id) REFERENCES jobs(id),
  FOREIGN KEY (shot_id) REFERENCES shots(id)
);

-- Render queue tracking
CREATE TABLE render_jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id TEXT NOT NULL,
  status TEXT DEFAULT 'queued',        -- queued | running | done | failed
  worker_id TEXT,
  frame_start INTEGER,
  frame_end INTEGER,
  engine TEXT DEFAULT 'pil',           -- pil | blender | coldtype
  r2_output_key TEXT,
  started_at TEXT,
  completed_at TEXT,
  error_log TEXT,
  FOREIGN KEY (job_id) REFERENCES jobs(id)
);

-- Scene catalog (from existing 198 scenes)
CREATE TABLE scenes (
  id TEXT PRIMARY KEY,
  pack TEXT,
  title TEXT,
  rhetorical_functions TEXT,           -- JSON array
  visual_treatment TEXT,
  duration_seconds REAL,
  concepts TEXT,                       -- JSON array
  primitives TEXT,                     -- JSON array
  render_capabilities TEXT,            -- JSON: ["pillow", "coldtype", "blender"]
  status TEXT DEFAULT 'unreviewed',    -- unreviewed | approved | deprecated
  thumbnail_key TEXT                   -- R2 key for representative frame
);
```

### Worker Routes: `factory/src/worker.ts`

```
GET  /api/factory/jobs              — List all jobs
POST /api/factory/jobs              — Create new job (from essay)
GET  /api/factory/jobs/:id          — Job detail with shots + feedback
PUT  /api/factory/jobs/:id          — Update job (status, version)
POST /api/factory/jobs/:id/render   — Enqueue render job

GET  /api/factory/jobs/:id/shots              — List shots
PUT  /api/factory/jobs/:id/shots/:sid         — Update shot status

POST /api/factory/jobs/:id/feedback           — Episode feedback
POST /api/factory/jobs/:id/shots/:sid/feedback — Per-shot feedback

GET  /api/factory/scenes             — Scene catalog
GET  /api/factory/scenes/search      — Search scenes by concept

GET  /api/factory/assets/:key        — Serve MP4 from R2 (signed URL)

POST /api/factory/gold/register      — Register gold standard from job
GET  /api/factory/gold               — List gold standards

POST /api/factory/render/callback    — Webhook from render worker
```

## Phase 2: Render Queue

### Job Flow

```
1. User/LLM creates job: POST /api/factory/jobs { essay_id, title, shots }
   → D1: INSERT into jobs, shots
   → Enqueue: RENDER_QUEUE.send({ job_id, action: "voiceover" })

2. Render worker picks up queue message
   → Generates voiceover via Edge TTS or Workers AI
   → Renders PIL scenes
   → Uploads MP4 to R2
   → Updates D1: job.status, shot.status, mp4_key
   → Worker may send follow-up queue messages for next stage

3. User reviews in dashboard
   → Posts feedback per-shot + per-episode
   → If revision: re-enqueue with new parameters

4. On approval: status = final
   → Gold standard captured
   → Scene registered in catalog
```

### Render Worker (vast.ai)

```bash
# Worker polls queue or receives webhook
# It has access to:
#   - R2 (read templates, upload outputs)
#   - D1 (update job status)

export CLOUDFLARE_API_TOKEN="..."
export R2_ENDPOINT="https://954612afb5a97bb15dddcdc70176813d.r2.cloudflarestorage.com"

# Worker script:
python3 -c "
import boto3, json, subprocess

# Check queue for jobs
# Download scene spec from R2
# Run PIL renderer
# Upload MP4 to R2
# Update D1 via Worker API
"
```

## Phase 3: Workers AI Integration

### Image Generation (Storyboard Concepts)

```typescript
// Generate concept art for a shot
async function generateConceptArt(env: Env, shot: Shot): Promise<string> {
  const response = await env.AI.run(
    "@cf/black-forest-labs/flux-1-schnell",
    {
      prompt: `Tantric documentary scene: ${shot.label}. 
               Dark background, gold accents, geometric forms.
               ${shot.narration_text?.slice(0, 200)}`,
      steps: 4,
    }
  );
  // Upload to R2, return key
  const key = `concepts/${shot.job_id}/${shot.id}.png`;
  await env.ASSETS.put(key, response);
  return key;
}
```

### Vision Analysis (Frame Critique)

```typescript
// Analyze a rendered frame
async function analyzeFrame(env: Env, frameKey: string): Promise<Analysis> {
  const image = await env.ASSETS.get(frameKey);
  const response = await env.AI.run(
    "@cf/llava-hf/llava-1.5-7b-hf",
    {
      prompt: [
        { role: "system", content: "Describe this frame's composition, lighting, and text legibility. Rate 1-10." },
        { role: "user", content: [image.arrayBuffer()] }
      ],
      max_tokens: 200,
    }
  );
  return JSON.parse(response);
}
```

### Embeddings (Scene Similarity)

```typescript
// Embed a scene description for similarity search
async function embedScene(env: Env, description: string): Promise<number[]> {
  const response = await env.AI.run(
    "@cf/baai/bge-base-en-v1.5",
    { text: [description] }
  );
  return response.data[0];
}

// Search similar scenes
async function searchScenes(env: Env, vector: number[], limit = 10) {
  return await env.VECTORIZE.query(vector, {
    topK: limit,
    returnValues: true,
    returnMetadata: true,
  });
}
```

## Phase 4: Deployment

### Step-by-step

```bash
cd /root/projects/blog/factory

# 1. Create D1 database
npx wrangler d1 create factory-db
# → database_id: <uuid>

# 2. Create R2 bucket
npx wrangler r2 bucket create factory-assets

# 3. Create Queue
npx wrangler queues create factory-render

# 4. Set the database ID in wrangler.jsonc

# 5. Run schema migration
npx wrangler d1 execute factory-db --file=src/d1/schema.sql

# 6. Create Vectorize index (one-time)
npx wrangler vectorize create factory-scenes --dimensions 768 --metric cosine

# 7. Deploy worker
npx wrangler deploy

# 8. Get gold files from existing R2 bucket
python3 scripts/download-golds.py
# Downloads from blog-video-assets/uploads/goldfiles/ → local gold-standards/

# 9. Migrate existing data from data/final/index.json to D1
python3 scripts/migrate-final-to-d1.py
```

### Auth Token (current working one)

From `.env.local`:
```
CLOUDFLARE_API_TOKEN="cfat_309y30W1HmOKdlsTc7HuhVM87LxR6IOIZVrCToTf835eb229"
```

This one is different from the leaked token and appears to be valid.

## Phase 5: Migration from Flask

### Parallel run period

```text
Week 1-2: Run Flask AND Worker side-by-side
  - Flask at studio.tantrafiles.xyz (tunnel → VPS)
  - Worker at factory.prx0r.workers.dev

Week 2-3: Migrate dashboard SPA to Pages
  - SPA served by Cloudflare Pages
  - API calls go to Worker
  - Flask becomes fallback only

Week 3+: Decommission Flask
  - Tunnel points to Worker instead of VPS
  - VPS only runs FableCut + Hermes
```

### SPA on Pages

The existing `dashboard/static/index.html` deploys directly to Pages:

```bash
npx wrangler pages deploy dashboard/static/ --project-name=factory-dashboard
```

## Directory Structure

```
factory/
├── wrangler.jsonc
├── package.json
├── tsconfig.json
├── src/
│   ├── worker.ts              — Main Worker (routes + handlers)
│   ├── d1/
│   │   ├── schema.sql         — D1 schema
│   │   ├── jobs.ts            — Job queries
│   │   ├── shots.ts           — Shot queries
│   │   └── feedback.ts        — Feedback queries
│   ├── r2/
│   │   └── assets.ts          — R2 helpers (signed URLs, upload)
│   ├── ai/
│   │   ├── images.ts          — FLUX image generation
│   │   ├── vision.ts          — LLaVA frame analysis
│   │   ├── embeddings.ts      — BGE embeddings
│   │   └── llm.ts             — Llama scene planning
│   ├── queue/
│   │   ├── producer.ts        — Enqueue render jobs
│   │   └── consumer.ts        — Handle callbacks
│   └── routes/
│       ├── jobs.ts
│       ├── feedback.ts
│       ├── scenes.ts
│       ├── assets.ts
│       └── gold.ts
├── scripts/
│   ├── download-golds.py      — Download gold files from R2
│   ├── migrate-final-to-d1.py — Migrate data/final/* → D1
│   └── seed-scenes.py         — Seed scene catalog from JSON
└── dashboard/                 — Static SPA (deployed to Pages)
    └── index.html
```

## Gold Files

The 12 animation packs are at `blog-video-assets/uploads/goldfiles/` in the `blog-video-assets` R2 bucket.

Access through the Worker:
```
GET /api/factory/gold/files              — List gold files
GET /api/factory/gold/download/:name     — Download specific pack
```

Or via R2 binding in the Worker:
```typescript
const golds = await env.GOLDS.list({ prefix: "uploads/goldfiles/" });
// List and serve files
```

## Key Decisions

1. **New D1 database** (`factory-db`) rather than reusing `atlas-db` — clean separation of concerns. Atlas DB is for the Next.js app / research data. Factory DB is for video production pipeline.

2. **New R2 bucket** (`factory-assets`) for video outputs. Existing `atlas-sources` stays for art library. `blog-video-assets` accessed read-only for gold files.

3. **Queue-driven rendering** — Worker enqueues jobs, render workers poll/consume. This decouples the API from the GPU-intensive work.

4. **Workers AI for pre-vis, not final render** — FLUX for concept art, LLaVA for critique, BGE for search. Actual video rendering stays on PIL (VPS) or Blender (vast.ai).

5. **Pages for SPA** — The dashboard HTML/CSS/JS deploys to Cloudflare Pages, API calls go to the Worker. No VPS needed for the web UI.

## Cost

| Service | Usage | Cost |
|---------|-------|------|
| Workers | 100k req/day free | $0 |
| D1 | 5GB free | $0 |
| R2 (factory-assets) | ~10GB | ~$0.15/mo |
| Workers AI | 10k neurons/day free | $0 |
| Queues | 1M ops/mo free | $0 |
| Pages | Unlimited free | $0 |
| Vectorize | 5M vectors free | $0 |
| **Total** | | **~$0.15/mo** |
