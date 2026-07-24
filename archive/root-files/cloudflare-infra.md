# Cloudflare Infrastructure — The Factory Stack

## Architecture

```
VPS (Hermes Agent)                        CLOUDFLARE
┌─────────────────────┐                  ┌────────────────────────┐
│  Hermes Gateway      │                  │  Workers AI (Llama)    │
│  (systemd)           │─────HTTPS──────▶│  - Vision tagging      │
│  Skills:             │                  │  - Embeddings (BGE)    │
│  - factory-pipeline  │                  │  - Image gen (Flux)    │
│  - write             │                  │                        │
│  - publish-video     │                  │  D1 Database           │
│                      │                  │  - Factory state       │
│  Cron:               │                  │  - RO → essay registry │
│  - video-pipeline    │                  │  - Concept links       │
│  (every 6h)          │                  │  - Performance data    │
│                      │                  │                        │
│  Scripts:            │                  │  R2 Storage            │
│  - factory-audit.py  │                  │  - Art images          │
│  - monitor-ros.py    │                  │  - Generated videos    │
│  - register-essay.py │                  │  - Audio files         │
│  - tag-art.py        │                  │  - Thumbnails          │
│                      │                  │                        │
│  FableCut            │                  │  Vectorize             │
│  (browser editor)    │                  │  - Art embeddings      │
│                      │                  │  - Semantic search     │
│  Thumbnail Server    │                  │                        │
│  (Python)            │                  │  Queues                │
│                      │                  │  - Batch tagging       │
└─────────────────────┘                  │  - Video processing    │
                                         │                        │
                                         │  KV                    │
                                         │  - Cache, sessions     │
                                         │                        │
                                         │  Workers               │
                                         │  - API endpoints       │
                                         │  - Webhook receivers   │
                                         │                        │
                                         │  Cron Triggers         │
                                         │  - Daily tagging       │
                                         │  - Weekly analytics    │
                                         └────────────────────────┘
```

## Deployment Checklist

### 1. Workers AI — Vision Tagging

The `tag-art.py` script calls Cloudflare Workers AI. Needs a token with `workers-ai` permission.

```bash
# Test: tag a single image
python3 scripts/tag-art.py --image art_angel_gabriel.jpg

# Tag all untagged (563 untagged, ~3s per image via CF Workers AI)
python3 scripts/tag-art.py
```

**Cost:** Free tier (10k neurons/day). Our 563 untagged images would need ~1,700 neurons (3 per image) — well within free tier.

### 2. Vectorize — Art Embeddings for Similarity Search

```bash
# Create vector index (one-time)
npx wrangler vectorize create art-embeddings \
  --dimensions 768 \
  --metric cosine

# Generate embeddings for all art
python3 scripts/tag-art.py --embeddings

# Query: "find images similar to this alchemical engraving"
curl -X POST https://api.cloudflare.com/client/v4/accounts/{id}/ai/run/@cf/baai/bge-base-en-v1.5 \
  -H "Authorization: Bearer {token}" \
  -d '{"text": "alchemical engraving of the green lion devouring the sun"}'
```

### 3. D1 — Factory State Database

The `content/factory/` JSON files are fine for development. For production, move to D1:

```sql
-- Factory state tables
CREATE TABLE ros (
  id TEXT PRIMARY KEY,
  title TEXT, status TEXT, version TEXT,
  passage_count INTEGER, audit_score REAL,
  updated_at TEXT
);

CREATE TABLE essays (
  id TEXT PRIMARY KEY,
  ro_id TEXT REFERENCES ros(id),
  title TEXT, status TEXT, 
  blocks INTEGER, chars INTEGER,
  audio_url TEXT, youtube_id TEXT,
  retention REAL,
  created_at TEXT
);

CREATE TABLE art_tags (
  art_id TEXT PRIMARY KEY,
  concepts TEXT, -- JSON array
  moods TEXT, 
  styles TEXT,
  embedding_id TEXT REFERENCES vectorize(art-embeddings)
);
```

### 4. Queues — Background Processing

```toml
# wrangler.toml
[[queues.producers]]
  queue = "tag-art-queue"
  batch_size = 10

[[queues.consumers]]
  queue = "tag-art-queue"
  max_retries = 3
  max_batch_size = 5
```

### 5. Cron Triggers

```toml
# wrangler.toml
[triggers]
crons = ["0 */6 * * *"]  # Every 6 hours
```

## One-Command Deploy

```bash
# Deploy everything
npm run deploy

# This runs:
# 1. wrangler deploy — Workers + Cron Triggers
# 2. wrangler d1 migrations apply — D1 schema
# 3. wrangler vectorize create — Embeddings index
# 4. wrangler r2 bucket create — Art storage
```

## Point at a Topic → YouTube Video

The system is a single entry point for Hermes:

```
User: "Generate content about the daimon"
  ↓
Hermes: 
  1. Check concepts → concept:daimon exists (76 concepts)
  2. Check art → art with daimon concepts (341 tagged, 563 untagged)
  3. Tag untagged art → Workers AI vision (3s per image)
  4. Find best ROs → ro:daimon-platonist (53 daimon ROs)
  5. Pick RO → check essay-registry → has_essay? 
  6. If no essay → write (3-pass, blocking validation)
  7. Essay → storyboard → visual assignment → FableCut → export
  8. Upload to YouTube
  9. Register in factory index
  ↓
Output: YouTube video + all assets tracked in D1
```

The same pipeline works for any topic. Change the concept name, everything else stays the same.
