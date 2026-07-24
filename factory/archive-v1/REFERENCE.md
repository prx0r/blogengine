# Factory Reference

**Complete system documentation for a new agent.**
Read this first. Then `HEADER.md` for the pipeline. Then `SYSTEM-SPEC.md` for the Cloudflare architecture.

---

## Project Identity

A research laboratory disguised as a media company. We produce documentary videos about Tantra, Kashmir Shaivism, esoteric philosophy, and consciousness studies across 5 channels. The factory is the automated production pipeline.

**5 Channels:**
| Channel | Vibe | Color |
|---------|------|-------|
| Tantra Files | Warm, scholarly awe | Saffron/gold |
| Ochema | Technical occult | Dark/cyan |
| Angeliz | Poetic, imaginal | Crimson/cream |
| Pramāṇa | Minimal logic | White/charcoal |
| Intelligent Others | Science frontier | Cosmic green |

---

## Where Everything Lives

| Area | Path | Purpose |
|------|------|---------|
| **Factory** | `factory/` | Self-contained video production module |
| Factory header | `factory/HEADER.md` | Entry point — pipeline stages, commands |
| Factory reference | `factory/REFERENCE.md` | **This file** — full system reference |
| Cloudflare spec | `factory/CLOUDFLARE-BUILD.md` | Cloudflare deployment instructions |
| System spec | `factory/SYSTEM-SPEC.md` | Full architecture + improvement loop theory |
| Factory Worker | `factory/src/worker.tsx` | Cloudflare Worker (API backend) |
| D1 schema | `factory/src/d1/schema.sql` | Database tables |
| Cloudflare config | `factory/wrangler.jsonc` | Worker bindings config |
| **Expansion essays** | `scripts/expansion-essay1.md` → `51.md` | 51 source essays |
| **Storyboards** | `content/publishing/storyboards/` | EDLs from visual-director |
| **Beat maps** | `content/publishing/scripts/` | Timed production plans |
| **Renders** | `content/publishing/renders/` | Rendered MP4 outputs |
| **Voiceover** | `content/publishing/voiceover/` | Edge TTS MP3 segments |
| **PIL render engine** | `scripts/renderer/renderer.py` | Core renderer (713 lines) |
| **Scene packs** | `scripts/renderer/p*.py` | 9 packs, 67 scene functions |
| **Visual library** | `visual-library/` | 20 packs, 172 scene functions |
| **Scene catalog** | `scene-system/catalog/scenes.json` | 198 indexed scenes |
| **Scene system** | `scene-system/` | 263 concepts, 12 template families |
| **Visual language** | `operations/visuallanguage.md` | Visionary Engine spec (752 lines) |
| **Video creation spec** | `operations/video-creation-spec.md` | Bronze/Silver/Gold validation |
| **Gold standards** | `video-templates/gold-standards/` | Captured pacing templates |
| **Animation packs** | R2 `uploads/goldfiles/` | 12 Blender/Manim reference packs |
| **Templates** | `video-templates/biography.json` | 12-segment video template |
| **Exemplars** | `exemplars/gold-standards/` | Reference MP4s (Alan Watts, etc.) |
| **Dashboard (Flask)** | `dashboard/server.py` | Legacy Python backend |
| **Final tab data** | `data/final/` | Production pipeline state |
| **Cloudflare infra doc** | `cloudflare-infra.md` | Original Cloudflare architecture |
| **Cloudflare dashboard doc** | `cloudflaredashboard.md` | Dashboard reference |
| **R2 datasets** | `pipelines/r2-dataset-reference.md` | All R2 research datasets |
| **Hermes Army** | `pipelines/hermes-army/hermescloudflare.md` | Hermes Cloudflare architecture |

---

## Cloudflare Infrastructure (Live)

### Factory Worker
```
URL:    https://factory-worker.tradesprior.workers.dev
Name:   factory-worker
Status: ✅ Live
```

### Bindings

| Binding | Resource | Purpose |
|---------|----------|---------|
| `DB` | `factory-db` (D1) | Jobs, shots, feedback, scenes, gold standards |
| `ASSETS` | `factory-assets` (R2) | Rendered MP4s, voiceover files |
| `SOURCES` | `atlas-sources` (R2) | Existing art library (read-only) |
| `GOLDS` | `blog-video-assets` (R2) | Reference MP4 renders |
| `UPLOADS` | `uploads` (R2) | Gold files at `goldfiles/` prefix |
| `RENDER_QUEUE` | `factory-render` (Queue) | Job dispatch to render workers |
| `AI` | Workers AI | FLUX, LLaVA, BGE, Llama models |

### Databases

| Database | ID | Tables |
|----------|----|--------|
| `factory-db` | `9bc3df37-63f5-474a-881f-7f5dfe1fad9e` | jobs, shots, feedback, gold_standards, scenes |

### Other R2 Buckets

| Bucket | Contents | Access |
|--------|----------|--------|
| `atlas-sources` | Art library, research assets | `SOURCES` binding |
| `factory-assets` | Video outputs | `ASSETS` binding |
| `blog-video-assets` | Reference renders at `renders/` | `GOLDS` binding |
| `uploads` | Gold files at `goldfiles/` | `UPLOADS` binding |
| `research-datasets` | 55GB of research data | S3 API |
| `sacred-art` | 15K+ art images | S3 API |

### API Endpoints

```
GET  /                              — Health check
GET  /api/factory/jobs              — List all jobs
POST /api/factory/jobs              — Create job { essay_id, title, shots[] }
GET  /api/factory/jobs/:id          — Job detail (shots + feedback)
PUT  /api/factory/jobs/:id          — Update job status/version/mp4_key
POST /api/factory/jobs/:id/render   — Enqueue render job
PUT  /api/factory/jobs/:id/shots/:sid — Update shot status
POST /api/factory/jobs/:id/feedback — Episode feedback
POST /api/factory/jobs/:id/shots/:sid/feedback — Per-shot feedback
GET  /api/factory/gold              — List gold standards
POST /api/factory/gold              — Register gold standard
GET  /api/factory/gold/files        — List 12 animation pack references
GET  /api/factory/scenes            — List scene catalog
GET  /api/factory/scenes/search?q=  — Search scenes
GET  /api/factory/assets/:key       — Serve file from factory-assets R2
POST /api/factory/render/callback   — Webhook from render worker
```

### Credentials (set fresh each session)

```
CLOUDFLARE_API_TOKEN=CF_API_TOKEN_PLACEHOLDER
R2_ACCESS_KEY_ID=87335c47538971cc698270f84559ed7d
R2_SECRET_ACCESS_KEY=efd1968d867661f0cd09ce47bee4af8c6ad3e1f8b0f1e434b8a084bdcec7c4f0
R2_ENDPOINT=https://954612afb5a97bb15dddcdc70176813d.r2.cloudflarestorage.com
ACCOUNT_ID=954612afb5a97bb15dddcdc70176813d
```

---

## Gold Files (12 Animation Packs)

Stored in R2 bucket `uploads` at `goldfiles/` prefix. These are Blender/Manim animation packs to use as reference for visual style, pacing, and composition.

| Pack | Size | Topic |
|------|------|-------|
| `Amrtasiddhi_Lunar_Drop_Motion_Pack.zip` | 6.4 MB | Amrtasiddhi lunar drop |
| `Khecarividya_Inner_Sky_Rebuilt_Draft_Pack.zip` | 0.8 MB | Khecarividya inner sky (draft) |
| `Khecarividya_Inner_Sky_Rebuilt_FullHD.zip` | 11.7 MB | Khecarividya inner sky (Full HD) |
| `Khecarividya_Moon_Key_Motion_Pack.zip` | 8.2 MB | Khecarividya moon key |
| `iamblichus_manim_pilot_pack.zip` | 0.3 MB | Iamblichus manim pilot |
| `iamblichus_theurgy_pack.zip` | 0.6 MB | Iamblichus theurgy v1 |
| `iamblichus_theurgy_pack_v2.zip` | 1.1 MB | Iamblichus theurgy v2 |
| `kabbalah_tree_of_life_pack.zip` | 63.0 MB | Kabbalah tree of life |
| `kalicakra_12_kalis_pack.zip` | 48.4 MB | Kalicakra 12 Kalis |
| `laya_yoga_subtle_body_pack.zip` | 2.0 MB | Laya yoga subtle body |
| `matrika_sound_matrix_pack.zip` | 28.7 MB | Matrika sound matrix |
| `proclus_elements_of_theology_pack.zip` | 0.9 MB | Proclus elements |

### Additional Gold Standards (from exemplar analysis)

| Name | Source | Shots | Avg Shot | BPM | Location |
|------|--------|-------|----------|-----|----------|
| `alan-watts-gold` | Alan Watts | 105 | 7.1s | 112 | `video-templates/gold-standards/alan-watts-gold.json` |
| `abhinavagupta-v1` | Abhinavagupta | — | — | — | `video-templates/gold-standards/` |

---

## The Improvement Loop (Theory)

### Core Insight

Every video goes through iterations: **generate → review → improve → finalize**. Each iteration produces feedback data. That data is the most valuable asset — it trains the system to produce better videos without human intervention.

### Data Flow

```
1. LLM generates scene + metadata
   → Stored in D1 (jobs + shots tables)

2. PIL/Blender renders MP4
   → Stored in R2 (factory-assets)
   → D1 updated: mp4_key, status=review

3. Human reviews per-shot:
   - Rates: composition, pacing, clarity, aesthetic, accuracy (1-5)
   - Comments: free text
   → D1 stores in feedback table
   → AI Search indexes for future retrieval
   → .md log written for portability

4. Next generation:
   LLM queries AI Search:
   - "find scenes similar to this concept that scored 4+"
   - "what feedback patterns exist for this visual treatment?"
   - "what pacing range worked for this rhetorical function?"
   → Generates with past knowledge baked in
   → Better output, fewer iterations

5. Over 10+ iterations:
   - The system learns which treatments work for which functions
   - Common issues stop recurring
   - New gold standards emerge from top-rated scenes
   - The scene catalog grows with proven entries
```

### Metrics Dashboard

| Metric | Source | Signals |
|--------|--------|---------|
| Iterations to approval | D1: version count per job | How fast the LLM learns |
| Per-dimension ratings | feedback.rating by dimension | Which aspect needs work |
| Time from draft → final | created_at → updated_at | Pipeline throughput |
| Rating over versions | avg rating per version | Is the LLM improving? |
| Common issue patterns | AI Search over feedback text | What keeps going wrong |
| Best-rated concept combos | feedback × shots × scenes | Winning formulas |

### When It Converges

A video is "done" when:
- All shots rated 4+ on their primary dimension
- Episode rating 4+ overall
- No "revision" loop triggered in 2+ review cycles

At that point, the system:
- Captures a new gold standard from the approved shots
- Updates the scene catalog with proven scene metadata
- The LLM now has one more successful example to learn from

---

## Subscription

**Free tier is sufficient to start. No purchase needed.**

| Service | Free Limit | Our Usage | Upgrade If |
|---------|-----------|-----------|------------|
| Workers | 100k req/day | ~100 req/day | >100k req/day |
| D1 | 5GB | ~1MB | >5GB |
| R2 | 10GB | ~500MB | >10GB |
| Workers AI | 10k neurons/day | ~100/day | >10k/day |
| Queues | 1M ops/month | ~100/month | >1M/month |
| AI Search | 20k queries/month (beta) | 0 (not set up yet) | >20k/month |
| AI Gateway | Free tier | 0 (not set up yet) | Heavy external LLM use |

Upgrade to Workers Paid ($5/mo) only if exceeding free limits.

---

## Quick Reference

### Create a Production Job

```bash
WORKER="https://factory-worker.tradesprior.workers.dev"

# From an existing storyboard
curl -X POST "$WORKER/api/factory/jobs" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "expansion-essay1",
    "essay_id": "expansion-essay1.md",
    "title": "The Engine of Consciousness",
    "channel": "Tantra Files",
    "shots": [
      {"label": "Hook", "rhetorical_function": "hook", "duration_seconds": 11.5},
      {"label": "Wheel of Powers", "rhetorical_function": "establish", "duration_seconds": 16.0}
    ]
  }'
```

### Enqueue a Render

```bash
curl -X POST "$WORKER/api/factory/jobs/expansion-essay1/render"
```

### Submit Feedback

```bash
# Episode-level
curl -X POST "$WORKER/api/factory/jobs/expansion-essay1/feedback" \
  -H "Content-Type: application/json" \
  -d '{"author":"Thomas","rating":4,"dimension":"pacing","comment":"Good pacing overall, but scene-03 drags"}'

# Per-shot
curl -X POST "$WORKER/api/factory/jobs/expansion-essay1/shots/scene-03/feedback" \
  -H "Content-Type: application/json" \
  -d '{"rating":3,"dimension":"pacing","comment":"Too slow, reduce ring count from 7 to 4"}'
```

### Update Job Status

```bash
curl -X PUT "$WORKER/api/factory/jobs/expansion-essay1" \
  -H "Content-Type: application/json" \
  -d '{"status":"final","version":3,"mp4_key":"expansion-essay1/v3/final.mp4","duration_seconds":137}'
```

### Approve a Shot

```bash
curl -X PUT "$WORKER/api/factory/jobs/expansion-essay1/shots/scene-03" \
  -H "Content-Type: application/json" \
  -d '{"status":"approved"}'
```

### View Gold Files

```bash
curl -s "$WORKER/api/factory/gold/files" | python3 -m json.tool
```

### Redeploy Worker

```bash
cd /root/projects/blog/factory
export CLOUDFLARE_API_TOKEN="CF_API_TOKEN_PLACEHOLDER"
npx wrangler deploy
```

---

## Entity Relationships

```
jobs (id, essay_id, title, channel, status, version, mp4_key, duration_seconds, created_at, updated_at)
  │
  ├── shots (id, job_id, sort_order, label, rhetorical_function, visual_treatment, 
  │          duration_seconds, mp4_key, status, narration_text, feedback_count)
  │
  └── feedback (id, job_id, shot_id*, author, rating, dimension, comment, created_at)
       * NULL = episode-level feedback

gold_standards (id, name, source_job_id, shot_count, avg_shot_duration, bpm, created_at)

scenes (id, pack, title, rhetorical_functions, visual_treatment, duration_seconds, 
        concepts, primitives, render_capabilities, status, thumbnail_key)
```

---

## Key Design Decisions

1. **D1 for state, R2 for blobs** — Jobs/shots/feedback in queryable SQLite. MP4s/voiceover/art in cheap object storage.

2. **Queue-driven rendering** — The Worker enqueues jobs, external render workers consume. Decouples API from GPU work.

3. **Feedback dimensions** — 6 dimensions (composition, pacing, clarity, aesthetic, accuracy, narration) plus "overall". Covers visual, temporal, and content quality.

4. **Dual-level feedback** — Per-shot catches specific issues. Episode-level catches holistic problems. Both needed.

5. **AI Search for RAG** — Don't make the LLM guess. Give it retrieved examples of what worked and what didn't.

6. **Status lifecycle** — draft → rendering → review → revision → final. Clear progression with no ambiguity.

7. **Version tracking** — Every render is a new version. Never overwrite. Enables regression comparison.

8. **Immutable feedback logs** — Every comment is also written to a markdown file. Human-readable history even without the database.

---

## What to Do Next

1. **Seed the scene catalog** — `curl POST /api/factory/scenes` with the 198 scenes from `scene-system/catalog/scenes.json`
2. **Set up AI Search instances** — `npx wrangler ai-search create factory-scenes` etc.
3. **Build the dashboard SPA** — deploy `dashboard/static/index.html` to Cloudflare Pages
4. **Wire the render queue consumer** — script on VPS or vast.ai polls the queue, runs PIL renderer, uploads to R2, calls back
5. **Start producing** — pick expansion-essay1, run through the pipeline, review, iterate
