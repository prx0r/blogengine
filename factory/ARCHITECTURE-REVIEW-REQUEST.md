# Architecture Review Request

Please review the Platinum Factory architecture below and advise on:

1. **Data flows** — are the stage transitions clean? Where does state leak?
2. **Agent handovers** — how should Visual Director → Shot Designers → Zeus pass context?
3. **Audit trail** — does the D1 schema capture enough for improvement over time?
4. **Extensibility** — how would you add a new art source (e.g. Blender renders) without changing the stage machine?
5. **Clean data** — what should we capture per run to enable self-improvement?

---

## Git Repo

https://github.com/prx0r/blogengine

## Key Files

| File | Purpose |
|------|---------|
| [`factory/controllers/platinum_controller.py`](https://github.com/prx0r/blogengine/blob/main/factory/controllers/platinum_controller.py) | 13-stage state machine with validators |
| [`factory/template/storyboard.json`](https://github.com/prx0r/blogengine/blob/main/factory/template/storyboard.json) | Canonical shot schema with visual_audio_alignment |
| [`factory/template/visual_program.json`](https://github.com/prx0r/blogengine/blob/main/factory/template/visual_program.json) | Thesis, palette, systems |
| [`factory/registry/gold-pack-registry.json`](https://github.com/prx0r/blogengine/blob/main/factory/registry/gold-pack-registry.json) | 31 gold packs indexed |
| [`factory/cloudflare/db/schema.sql`](https://github.com/prx0r/blogengine/blob/main/factory/cloudflare/db/schema.sql) | D1 database: jobs, shots, assets, QC, rules |
| [`factory/cloudflare/src/controller.ts`](https://github.com/prx0r/blogengine/blob/main/factory/cloudflare/src/controller.ts) | Deployed Cloudflare Worker API |
| [`factory/process/THE-PLATINUM-PROCESS.md`](https://github.com/prx0r/blogengine/blob/main/factory/process/THE-PLATINUM-PROCESS.md) | The platinum process flow |
| [`factory/spec/ECOSYSTEM-VISION.md`](https://github.com/prx0r/blogengine/blob/main/factory/spec/ECOSYSTEM-VISION.md) | Full agent ecosystem |
| [`factory/spec/CLOUDFLARE-VIDEO-ARCHITECTURE.md`](https://github.com/prx0r/blogengine/blob/main/factory/spec/CLOUDFLARE-VIDEO-ARCHITECTURE.md) | Cloudflare architecture spec |
| [`hermes/skills/platinum-designer/SKILL.md`](https://github.com/prx0r/blogengine/blob/main/hermes/skills/platinum-designer/SKILL.md) | PASS 1: planning/storyboarding skill |
| [`hermes/skills/platinum-renderer/SKILL.md`](https://github.com/prx0r/blogengine/blob/main/hermes/skills/platinum-renderer/SKILL.md) | PASS 2: Zeus review/render skill |

---

## Architecture Summary

```
User → POST /jobs → Cloudflare Worker (D1) → Controller (13 stages)
                                                    │
                          ┌──────────────────────────┼──────────────────────────┐
                          ▼                          ▼                          ▼
                    VISUAL DIRECTOR           SHOT DESIGNERS               ZEUS
                    (LLM, 1 call)            (LLM, per chapter)          (LLM, 1 call)
                          │                          │                          │
                          └──────────────────────────┼──────────────────────────┘
                                                     ▼
                                              PILLOW RENDERER
                                              (VPS or Container)
                                                     ▼
                                              QC (Workers AI Vision)
                                                     ▼
                                              FINAL PACK → R2
```

## Current State

- **Controller**: 13-stage state machine with hard validation gates (timing, motif manufacturability ≥12/16, visual_audio_alignment ≥50 chars). Direct LLM API calls (no hermes -z subprocess). Working on essay 33.
- **Cloudflare**: Worker deployed at `https://platinum-factory.tradesprior.workers.dev`. D1 database with 9 tables. All endpoints tested.
- **Gold Registry**: 31 gold packs indexed. 61 total packs deduplicated.
- **Pack Template**: Canonical format with storyboard, visual_program, AGENT_KNOWLEDGE_DOSSIER, STYLE_EVOLUTION, PRODUCTION_BLUEPRINT.
- **Validators**: Timing gate (avg 5-8s, max 20s, shot count from audio duration), motif manufacturability (≥12/16), visual_audio_alignment (≥50 chars).

## Specific Questions

### 1. Stage transitions and data flow
The controller currently passes all prior artifacts as context to each stage. Is this the right pattern? Should we use a shared "job context" document that stages append to, or pass specific artifacts per stage?

### 2. Agent handovers
Visual Director produces the thesis. Shot Designers produce per-chapter storyboards. Zeus reviews the whole. How should context flow between them? Currently each stage prompt includes relevant prior artifacts. Is there a better pattern?

### 3. Self-improvement data
We have a `production_rules` table in D1. What should we capture per job/run to enable the system to improve over time? Which metrics actually matter for quality improvement vs noise?

### 4. Multi-source art
Currently PIL-only. The trifecta vision adds historical images (from R2 Vectorize) and AI-generated images (via Workers AI). How should the medium selection gate work? Where does the decision happen in the stage sequence?

### 5. Blender integration
We have 12 Blender/Manim gold packs in R2 at `goldfiles/`. How would you add a "blender" medium that sends shot specs to a render farm and collects the results? What queue/event pattern?

### 6. Audit trail
The D1 schema tracks stage history, QC results, and render outputs. What else should we track for a useful audit trail? What would help debug why a particular shot failed?

---

## Running the Factory

```bash
# Create a job
python3 factory/controllers/platinum_controller.py new \
  --slug my-essay \
  --essay scripts/expansion-essayXX.md \
  --output content/publishing/renders/my-essay/v1

# Advance through stages
python3 factory/controllers/platinum_controller.py advance --slug my-essay

# Or via Cloudflare API
curl -X POST https://platinum-factory.tradesprior.workers.dev/jobs \
  -H "Content-Type: application/json" \
  -d '{"slug":"my-essay","essay_path":"scripts/expansion-essayXX.md"}'
```

## API Endpoints (Live)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Service health + stages list |
| GET | `/jobs` | List all jobs |
| POST | `/jobs` | Create new job |
| GET | `/jobs/:slug` | Get job status |
