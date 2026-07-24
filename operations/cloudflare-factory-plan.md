# Cloudflare Factory Architecture

## Current VPS Stack → Cloudflare Equivalent

| VPS Service | Cloudflare Replacement | Why |
|-------------|----------------------|-----|
| Flask dashboard (port 8766) | **Workers** + Pages | Static SPA served by Pages, API routes as Workers |
| FableCut (port 7777) | Stays on VPS | Node editor needs localhost — tunnel through Cloudflare |
| `data/review/index.json` | **D1** | SQLite at edge, structured queries for job state |
| `data/final/index.json` | **D1** | Production pipeline state, shot feedback |
| `data/final/feedback-logs/*.md` | **D1** + R2 | Structured in D1, raw logs in R2 |
| Local MP4 serving | **R2** | Zero egress, signed URLs, already have it |
| File-based art library | **R2** + **Vectorize** | Art images in R2, semantic search via Vectorize |
| Hermes Telegram bot | **Workers** + Queues | Webhook receiver + async dispatch |
| Cron jobs (factory-audit etc.) | **Workers Cron Triggers** | Built-in schedule |
| Tor proxy for downloads | **Workers** | Workers have clean IPs, no Tor needed |
| `scene-system/catalog/*.json` | **D1** + **Vectorize** | Scene metadata in D1, concept search via Vectorize |
| `session-notes/*.md` | **R2** | Static storage |

## Architecture

```
User / Dashboard (Cloudflare Pages SPA)
       │
       ▼
Workers (API Gateway + Auth)
  │
  ├── D1 ─────────── Factory state, job queue, feedback, scene metadata
  ├── R2 ─────────── Art library, rendered videos, voiceover, templates
  ├── Vectorize ──── Scene similarity, art matching, semantic search
  ├── KV ─────────── Cache, config, feature flags
  ├── Queues ─────── Job dispatch to render workers
  ├── Workers AI ─── Image gen (FLUX), vision (LLaVA), embeddings (BGE), LLM (Llama)
  └── AI Gateway ─── Proxy to OpenAI/Anthropic/Replicate with caching + cost tracking
       │
       ▼
External Render Farm (vast.ai / your GPUs)
  └── Polls Queues → renders → uploads to R2 → updates D1
```

## Recommended Build Order

### Phase 1: Move the Dashboard (this week)
```
Current: Flask static/index.html on VPS
Target:  Cloudflare Pages SPA + Workers API

What to do:
1. Take dashboard/static/index.html → deploy as Pages site
2. Rewrite server.py endpoints as Workers (JS/TS)
3. D1 for job state + feedback (replaces data/final/*.json)
4. R2 for serving MP4s directly (signed URLs instead of Flask proxy)
```

### Phase 2: Job Queue (next week)
```
Current: Direct SSH dispatch to vast.ai
Target:  Workers → Queues → vast workers → R2 → D1 completion

Flow:
  POST /api/factory/jobs  →  Worker creates D1 record  →  Queues message
  → vast worker polls queue  →  renders  →  uploads to R2  →  updates D1
  → User sees status in dashboard
```

### Phase 3: AI Integration (ongoing)
```
Workers AI:
  - FLUX for storyboard concept art
  - LLaVA/Qwen-VL for rendered frame critique
  - BGE embeddings → Vectorize for scene similarity
  - Llama 3 for prompt engineering / scene description

AI Gateway:
  - Route all external LLM calls through gateway
  - Cache identical prompts (save costs)
  - Log all usage for cost tracking
```

## Useful Workers AI Models

| Task | Model | Why |
|------|-------|-----|
| Image generation | `@cf/black-forest-labs/flux-1-schnell` | Fast, good quality, free tier |
| Image analysis | `@cf/openai/clip-vit-base-patch32` | Scene tagging, art matching |
| | `@cf/llava-hf/llava-1.5-7b-hf` | Detailed scene description |
| Embeddings | `@cf/baai/bge-base-en-v1.5` | 768-dim, fast, good for Vectorize |
| | `@cf/intfloat/multilingual-e5-large` | Better for Sanskrit/mixed language |
| LLM | `@cf/meta/llama-3.2-11b-vision-instruct` | Vision + text, scene planning |
| | `@cf/meta/llama-3.3-70b-instruct-fp8-fast` | Heavier but better quality |
| Speech | `@cf/openai/whisper-large-v3-turbo` | Transcribe voiceover |
| TTS | `@cf/myshell-ai/melotts` | Text-to-speech (alternative to Edge TTS) |

## D1 Schema Draft

```sql
-- Factory pipeline
CREATE TABLE jobs (
  id TEXT PRIMARY KEY,
  essay_id TEXT,
  status TEXT DEFAULT 'pending',  -- pending/running/done/failed
  version INTEGER DEFAULT 1,
  mp4_key TEXT,
  duration_seconds REAL,
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE shots (
  id TEXT PRIMARY KEY,
  job_id TEXT,
  label TEXT,
  duration REAL,
  status TEXT DEFAULT 'pending',
  FOREIGN KEY (job_id) REFERENCES jobs(id)
);

CREATE TABLE feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id TEXT,
  shot_id TEXT,  -- NULL for episode-level
  author TEXT DEFAULT 'Thomas',
  rating INTEGER,
  dimension TEXT,
  comment TEXT,
  created_at TEXT,
  FOREIGN KEY (job_id) REFERENCES jobs(id)
);

-- Scene catalog
CREATE TABLE scenes (
  id TEXT PRIMARY KEY,
  pack TEXT,
  title TEXT,
  rhetorical_functions TEXT,  -- JSON array
  visual_treatment TEXT,
  duration REAL,
  concepts TEXT,  -- JSON array
  primitives TEXT,  -- JSON array
  status TEXT DEFAULT 'unreviewed'
);
```

## Cost Estimate

| Service | Estimated Monthly |
|---------|------------------|
| Pages (free) | $0 |
| Workers (free tier: 100k req/day) | $0 |
| D1 (free tier: 5GB) | $0 |
| R2 (~50GB existing + renders) | ~$1-2/mo |
| Vectorize (5M vectors free) | $0 |
| Workers AI (free: 10k neurons/day) | $0 |
| AI Gateway (free tier) | $0 |
| Queues (free: 1M ops/mo) | $0 |
| **Total** | **~$2/mo** |

All well within free tiers for our scale.

## Credentials

```
Account ID:    954612afb5a97bb15dddcdc70176813d
S3 Endpoint:   https://954612afb5a97bb15dddcdc70176813d.r2.cloudflarestorage.com
Access Key:    <redacted>
Secret Key:    <redacted>
API Token:     <redacted>  (may be expired)
DNS Token:     <redacted>
```

## What Stays on VPS

- **FableCut** (Node.js editor, needs localhost for browser-based editing)
- **Hermes Gateway** (Telegram bot, MCP host — could move but not high priority)
- **PIL render engine** (Python scripts, runs scenes)
- **Heavy inference / training** (anything beyond Workers AI 30s limit)
- **Blender rendering** (GPU needed → vast.ai, not VPS)

## Animation Packs Access

The `uploads` bucket contains 12 animation packs (Blender/Manim reference materials). The S3 credentials don't have access to this bucket. Options:
1. Make the bucket publicly readable
2. Generate a new API token with `uploads` bucket access
3. Use the Cloudflare dashboard to download them manually

Current packs:
- Amrtasiddhi_Lunar_Drop_Motion_Pack.zip (6.74 MB)
- Khecarividya_Inner_Sky_Rebuilt_*.zip (12.3 MB + 796 KB + 8.62 MB)
- iamblichus_*_pack.zip (3 variants, 267 KB - 1.2 MB)
- kabbalah_tree_of_life_pack.zip (66.11 MB)
- kalicakra_12_kalis_pack.zip (50.79 MB)
- laya_yoga_subtle_body_pack.zip (2.09 MB)
- matrika_sound_matrix_pack.zip (30.06 MB)
- proclus_elements_of_theology_pack.zip (980 KB)
