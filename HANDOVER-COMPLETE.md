# Platinum Factory — Complete Handover

## Quick Start

```bash
# Watch the first video
open https://platinum-factory.tradesprior.workers.dev/video/micro-d1

# Run a full microfilm
bash scripts/microfilm.sh my-test

# Or step by step
curl -X POST https://platinum-factory.tradesprior.workers.dev/jobs \
  -H "Content-Type: application/json" \
  -d '{"slug":"my-test","essay_text":"Light is self-showing. Consciousness is its own illumination."}'

curl -X POST https://platinum-factory.tradesprior.workers.dev/advance \
  -H "Content-Type: application/json" \
  -d '{"slug":"my-test"}'
```

---

## What Exists

### Live Infrastructure
| Resource | URL/Path | How to Access |
|----------|----------|---------------|
| Worker API | `platinum-factory.tradesprior.workers.dev` | Public HTTPS |
| D1 Database | `platinum-factory-db` | Via Worker bindings |
| R2 Bucket | `factory-assets` | S3-compatible API |
| MCP Server | `factory/cloudflare/src/mcp-server.py` | Hermes gateway (11 tools) |
| Smoke Test Video | `/video/micro-d1` | 4-second generated clip |
| Gold Packs | `factory/registry/gold-pack-registry.json` | 31 indexed packs |

### Code Structure (Factory Only)
```
factory/
├── controllers/platinum_controller.py  ← Python validators (dev reference)
├── cloudflare/
│   ├── src/controller.js               ← THE CORRECT SYSTEM (586 lines)
│   ├── src/mcp-server.py               ← MCP server for external agents
│   └── db/schema.sql                   ← D1 database (13 tables)
├── template/                           ← Canonical pack format
├── registry/                           ← Gold pack index, pack manifest
├── process/                            ← Creative process docs
├── spec/                               ← Architecture specs, comparisons
├── analysis/                           ← Platinum Master feedback (5 docs)
├── fixtures/pil-smoke/                 ← Deterministic smoke test
├── runs/                               ← Run logs
├── progress.md                         ← Build notes and fixed issues
├── MANUAL.md                           ← Operating manual
└── stages.json                         ← Shared stage definitions
```

### Skills
```
hermes/skills/
├── platinum-designer/         ← Planning/storyboarding skill
└── platinum-renderer/         ← Zeus review + render skill
```

---

## How It Works

### The 12-Stage Pipeline

```
1.  pack_setup            → Verify template files
2.  gold_study            → Extract principles from 31 gold packs
3.  rhetorical_map        → Transform essay passages into scene data
4.  visual_thesis         → Design 3 competing visual worlds
5.  motif_manufacturability → Score visual motifs (min 12/16)
6.  storyboard            → Generate per-shot storyboard
7.  storyboard_review     → Adversarial review of storyboard
8.  pack_composition      → Write dossier, evolution, blueprint
9.  code_review           → Generate PIL animation code
10. draft_render          → Creates render task → VPS executes
11. visual_qc             → Vision quality check (placeholder)
12. final_render          → Final film assembly (placeholder)
```

Stages 1-9 run on Cloudflare Worker via Workers AI models.
Stages 10-12 create D1 render tasks for the VPS to execute.

### Models Used
| Stage | Model | Cost/M tokens |
|-------|-------|---------------|
| pack_setup, gold_study | qwen3-30b | $0.051 |
| motif_lint, storyboard | qwen3-30b | $0.051 |
| storyboard_review, pack_composition | qwen3-30b | $0.051 |
| code_review | qwen3-30b | $0.051 |
| rhetorical_map, visual_thesis | llama-3.3-70b | $0.293 |

### Data Flow
```
Job Created → Essay stored in R2
  → Each stage loads prior artifacts from R2
  → LLM generates structured output
  → Validated (timing, motif scores, alignment)
  → Saved to R2 + D1 advanced
  → Render task created at stage 10
  → VPS claims task, runs code, uploads frames
  → Completion callback advances job
  → Video served at /video/:slug
```

---

## What Works vs What's Broken

### ✅ Works
- 9/9 LLM stages run reliably (~3 min, ~$0.002)
- Job creation with essay stored in R2
- D1 state persistence across stages
- Validators: timing, motif scores, alignment length
- Render task system: create, claim (atomic), heartbeat, complete
- Auth on render endpoints (Bearer token)
- Video serving via GET /video/:slug
- Smoke test fixture (3 deterministic shots)
- LLM generates PIL code that compiles and runs
- Artifact loading from R2 into prompts
- Markdown fence stripping for JSON parsing

### ❌ Broken / Placeholder
- **LLM generates static images, not animations** — code_review prompt updated but needs testing. The LLM produces single-frame PIL code instead of multi-frame animation with ffmpeg.
- **VPS worker not running autonomously** — needs `systemd` service or cron job
- **D1 claim endpoint SQL bug** — the conditional UPDATE with subquery doesn't work. Claim falls back to direct UPDATE via wrangler CLI.
- **No narration/audio** — all videos are silent
- **No contact sheets** — need frame extraction + tiling
- **No real film produced yet** — only smoke test and 4-image clip
- **studio.tantrafiles.xyz not wired** — video only on worker domain

---

## Key Files for a New Agent

| File | Why You Need It |
|------|-----------------|
| `factory/cloudflare/src/controller.js` | **The whole system.** 586 lines. All stages, validators, render tasks, video serving. |
| `factory/cloudflare/db/schema.sql` | D1 schema. 13 tables. Run `wrangler d1 execute` to deploy. |
| `factory/cloudflare/src/mcp-server.py` | MCP server. 11 tools. For external agents (ChatGPT, Claude). |
| `factory/template/storyboard.json` | The canonical shot schema. Every shot must match this. |
| `factory/validation-config.json` | Shared validation rules. Both JS and Python read this. |
| `factory/stages.json` | Stage definitions. Single source of truth for stage list. |
| `factory/progress.md` | 11 specific bugs fixed. Read this before changing anything. |
| `factory/MANUAL.md` | Full operating manual with glossary and architecture. |
| `scripts/microfilm.sh` | Run the full microfilm benchmark. |
| `scripts/vps-render-worker.py` | VPS render worker. Polls tasks, runs code, uploads. |
| `factory/fixtures/pil-smoke/render_pack.py` | Known-good 3-shot render script. Reference for expected output. |

---

## Platinum Master Feedback (5 Documents)

| File | Topic |
|------|-------|
| `factory/analysis/platinum-master-response.md` | Chapter batching, JSONL, compact context, retry strategy |
| `factory/analysis/platinum-master-response-2.md` | Artifact grounding, security, model routing |
| `factory/analysis/platinum-master-session3.md` | Production pipeline priorities, VPS integration |
| `factory/analysis/platinum-master-session4.md` | Bridge integration, E2E tests, microfilm benchmark |
| `factory/spec/architecture-review.md` | Full architecture review — immutable artifacts, agent handovers |
| `factory/process/PLATINUM-ADVICE.md` | 20-point production protocol |

Key recurring themes:
1. **Chapter batching** — don't generate all shots in one LLM call
2. **Artifact grounding** — load actual content into prompts, not file paths
3. **Fail closed** — validate before advancing, never mark failed stages as passed
4. **Immutable artifacts** — versioned R2 objects with sha256, never overwrite
5. **Render adapters** — one interface for PIL, Skia, Blender, etc.

---

## R2 Storage

```
Bucket: factory-assets
Endpoint: https://954612afb5a97bb15dddcdc70176813d.r2.cloudflarestorage.com
Access Key: 6c27ffefc9dee5c15ca19ca99d2ecccf
Secret: 085826a53d9c16e60e8dab3c89f575a3eef51a5e1fe8e9d2b9323adeca5d598d

Key structure:
  fixtures/pil-smoke/             ← Smoke test render script
  renders/{slug}/                 ← Per-job output (videos, frames)
  content/publishing/renders/     ← Worker stage artifacts
  goldfiles/                      ← Blender/Manim gold packs (12 files)
  exemplars/                      ← Reference videos (640MB)
```

## Immediate Next Steps (Priority Order)

1. **Fix the claim SQL** — the conditional UPDATE subquery doesn't return claimed tasks correctly. Simplify to a two-step: UPDATE with LIMIT subquery, then SELECT.
2. **Test the updated code_review prompt** — deploy the animation prompt fix and run microfilm-d2 to see if it produces proper animated video.
3. **Run the VPS worker as a systemd service** — so it polls 24/7 without manual start.
4. **Fix the Python urllib Bearer auth** — the 403 on completion endpoint is a missing `Accept` header or malformed token. Use `requests` library or curl subprocess.
5. **Produce the first real film** — run a 100-180 word essay through the full pipeline with VPS worker active.
6. **Add narration** — Edge TTS + ffmpeg mux into the assembly script.
7. **Contact sheets** — extract frames at 72% duration, tile into 4x4 grid.
8. **Wire studio.tantrafiles.xyz** — DNS/proxy to the worker domain.
