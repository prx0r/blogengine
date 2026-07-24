# Platinum Factory — Operating Manual

---

## 1. Glossary

| Term | Definition |
|------|------------|
| **Pack** | The canonical output of the factory. A directory containing storyboard.json, visual_program.json, AGENT_KNOWLEDGE_DOSSIER.md, PRODUCTION_BLUEPRINT.md, STYLE_EVOLUTION.md, render_pack.py, scenes/*.mp4, final.mp4, and alignment_report.json. Every pack follows the template in `factory/template/`. |
| **Film Pack** | A narration-locked video essay. 75-111 shots, each 5-10 seconds. Audio-driven timing. Chapters interleaved. |
| **Animation Pack** | A modular visual demonstration. 6-20 scenes, uniform 4.8s at 10fps. AGENT_KNOWLEDGE_DOSSIER with guardrails. |
| **Stage** | One step in the 13-stage production state machine. Each stage has defined inputs, outputs, validators, and max retries. |
| **Artifact** | An immutable output file from a stage attempt. Future: stored in R2 with sha256, versioned, never overwritten. |
| **visual_audio_alignment** | The key quality field in every shot. Explains WHY the visual enacts the transformation asserted by the narration. Must be ≥2 sentences. |
| **Motif** | A concrete visual element with drawable parts and motion verbs. Scored on manufacturability (min 12/16). Named with gold-style short IDs (interior_flame), not poetry. |
| **Evidence Role** | Classification of what a shot's image claims: historical_context, primary_source_image, conceptual_model, technical_diagram, reconstruction, symbolic_interpretation. |
| **Render Medium** | How a shot is produced: pil (procedural), historical (existing artwork), ai_image (generated), hybrid, fablecut, blender. |
| **No-Narration Test** | Mute the audio. Does the visual communicate the concept? Every shot must pass. |
| **Gold Pack** | A reference-quality pack used as benchmark. 31 indexed in `factory/registry/gold-pack-registry.json`. |

---

## 2. Architecture Overview

```
USER / AGENT (ChatGPT, Claude, Hermes CLI)
        │
        ▼
┌─────────────────────────────────────────────────────┐
│                   CONTROLLER                         │
│  Manages 13-stage state machine                      │
│  Validates each stage output before advancing        │
│  Calls LLM for creative stages                       │
│  Stores state in D1 (Cloudflare) or .jobs/ (local)   │
└─────────────────────┬───────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────┐
│              AGENTS (LLM-powered roles)              │
│                                                      │
│  Visual Director  → 1 call per essay                │
│    Produces: 3 visual worlds, thesis, palette       │
│                                                      │
│  Shot Designer(s) → 1 call per chapter (8-12 shots) │
│    Produces: storyboard with visual_audio_alignment │
│                                                      │
│  Zeus Critic  → 1 call per storyboard               │
│    Produces: approval or repair manifest            │
│                                                      │
│  Render Executor → deterministic (VPS/Container)    │
│    Produces: frames, MP4 clips, final film          │
└─────────────────────┬───────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────┐
│           INFRASTRUCTURE (Cloudflare)                │
│                                                      │
│  Worker API: platinum-factory.tradesprior.workers.dev│
│  D1 Database: jobs, shots, assets, QC, rules         │
│  R2 Storage: artifacts, frames, packs                │
│  MCP Server: 11 tools for any MCP-compatible LLM     │
│  AI Gateway: model routing, logging, caching         │
│  Workers AI: TTS, image gen, vision QC (future)      │
└─────────────────────────────────────────────────────┘
```

---

## 3. The 13 Stages

| # | Stage | What Happens | LLM? | Max Retries |
|---|-------|-------------|------|-------------|
| 1 | **pack_setup** | Verifies template files exist in output dir | No | 1 |
| 2 | **gold_study** | Reads 4+ gold packs, extracts transferable principles | Yes | 2 |
| 3 | **rhetorical_map** | Reads essay, extracts transformations per passage | Yes | 2 |
| 4 | **visual_thesis** | Designs 3 competing visual worlds, selects hybrid | Yes | 2 |
| 5 | **motif_manufacturability** | Scores every motif 0-16, rejects <12 | No* | 3 |
| 6 | **storyboard** | Builds per-shot storyboard with timing + alignment | Yes | 3 |
| 7 | **storyboard_review** | Adversarial review: alignment, diversity, gold-copy | Yes | 3 |
| 8 | **pack_composition** | Writes AGENT_KNOWLEDGE_DOSSIER, STYLE_EVOLUTION, BLUEPRINT | Yes | 2 |
| 9 | **render_plan** | Plans each shot's primitives, layers, phases | Yes | 2 |
| 10 | **code_review** | Writes render_pack.py, checks for dispatch tables | Yes | 2 |
| 11 | **draft_render** | Renders low-res preview (ffmpeg + PIL) | No | 2 |
| 12 | **visual_qc** | Silent-film test, similarity check, motion check | Yes* | 3 |
| 13 | **final_render** | Renders final high-res with audio, muxes, packages | No | 1 |

\* motif_manufacturability uses deterministic scoring, visual_qc uses vision-capable LLM

**Timing gate (stage 6):** Each shot must be 5-10s. Average must be 5-8s. Max 15s (documented exception), absolute max 20s. Shot count derived from audio duration / 6.5s.

---

## 4. What Actually Works Right Now

### ✅ Running in production

| Component | Status | How to access |
|-----------|--------|---------------|
| **Controller (local)** | ✅ 13-stage state machine. Creates jobs, advances stages, validates output. Calls LLM directly via API. | `python3 factory/controllers/platinum_controller.py advance --slug X` |
| **Cloudflare Worker API** | ✅ Deployed at `platinum-factory.tradesprior.workers.dev`. CRUD for jobs in D1. | `GET /jobs`, `POST /jobs`, `GET /jobs/:slug` |
| **D1 Database** | ✅ 9 tables deployed: jobs, stage_history, shots, assets, asset_tags, gold_signatures, render_outputs, qc_results, production_rules. | Managed via wrangler |
| **MCP Server** | ✅ 11 tools registered with Hermes gateway. Any MCP client can drive the factory. | `factory/cloudflare/src/mcp-server.py` |
| **Canonical Pack Template** | ✅ 6 files defining the output format. Referenced by controller and validators. | `factory/template/` |
| **Gold Pack Registry** | ✅ 31 gold packs indexed with paths and metadata. | `factory/registry/gold-pack-registry.json` |
| **Shared Stage Definition** | ✅ Single JSON source of truth for stage list. | `factory/stages.json` |

### 🚧 Placeholder / Needs Work

| Component | Status | What's missing |
|-----------|--------|----------------|
| **Wide LLM support** | ⚠️ Deepseek-v4-flash only | Can swap any OpenAI-compatible model in `call_llm_direct()` |
| **Workers AI models** | ❌ Not connected | Token has `workers-ai:run` scope now. Need to add TTS/image gen calls to the Worker. |
| **Parallel chapter design** | ❌ Sequential only | Controller advances one stage at a time. Queue fan-out not wired yet. |
| **Immutable artifacts** | ❌ Files overwritten | Need R2 artifact versioning with sha256 tracking. |
| **Visual QC automation** | ❌ Manual review | Vision model QC not implemented. |
| **Repair agent** | ❌ No local retry | Failed shots don't loop independently yet. |

### 🗑️ Deprecated / Not Used

| File | Why |
|------|-----|
| `cloudflare/src/controller.py` | Python worker stub, not used. JS version is live. |
| `cloudflare/src/controller.ts` | TypeScript version, replaced by JS. |
| `cloudflare/src/ping.py` | Test file only. |
| `archive-v1/` | All files. Old pipeline, kept for reference. |

---

## 5. The LLM Situation

| Model | Used For | How |
|-------|----------|-----|
| **deepseek-v4-flash** | All creative stages (gold_study through code_review) | Direct API call via opencode.ai. Key in `.env.local` as `VIDEO_LLM_API_KEY`. |
| **Any OpenAI-compatible model** | Swappable | Change the endpoint + key in `call_llm_direct()` in the controller. |

**Not yet connected (have token, need to wire):**

| Workers AI Model | What for | Price |
|-----------------|----------|-------|
| `@cf/meta/llama-4-scout-17b-16e-instruct` | Alternative LLM for creative stages | $0.27/M input tokens |
| `@cf/meta/llama-3.3-70b-instruct-fp8-fast` | Fast alternative | $0.293/M input tokens |
| `@cf/qwen/qwen3-30b-a3b-fp8` | Cheapest alternative | $0.051/M input tokens |
| `@cf/myshell-ai/melotts` | TTS voiceover | $0.0002/min |
| `@cf/black-forest-labs/flux-1-schnell` | AI image generation | $0.000053/tile |
| `@cf/meta/llama-3.2-11b-vision-instruct` | Visual QC (silent-film test) | $0.049/M input tokens |

The Workers AI token is valid but no code calls these models yet. The MCP server's `factory_call_llm` tool uses deepseek-v4-flash via opencode. To add Workers AI models, add a route in the Worker that calls `env.AI.run()`.

---

## 6. How Multiple Agents Work

The system is designed for multiple LLM agents with **bounded responsibilities**:

### Agent: Visual Director
- **Called by:** Controller, stage 4 (visual_thesis)
- **Receives:** Essay text + gold signatures
- **Produces:** 3 competing visual worlds, selected thesis, palette, 4-7 systems
- **Scope:** One call per essay. Does NOT design individual shots.

### Agent: Shot Designer(s)
- **Called by:** Controller, stage 6 (storyboard)
- **Receives:** One chapter contract + 8-12 timed beats + neighboring handoffs
- **Produces:** Storyboard with visual_audio_alignment per shot
- **Scope:** One call per chapter. One chapter = 8-12 shots. **Not yet parallel** — controller does chapters sequentially.

### Agent: Zeus Critic
- **Called by:** Controller, stage 7 (storyboard_review)
- **Receives:** Complete storyboard + gold signatures
- **Produces:** Approval or repair manifest
- **Scope:** One call per storyboard. Checks alignment, diversity, gold-copy, continuity.

### Agent: Render Executor
- **Called by:** Controller, stages 11-13 (draft_render through final_render)
- **Not an LLM** — deterministic. Runs PIL code, ffmpeg assembly.
- **Scope:** CPU-bound, runs on VPS or Container.

### Future: Repair Agent
- Called when QC fails on specific shots
- Receives only the failed shot + failure codes
- Repairs and re-renders just that shot

---

## 7. Data Flow Diagram

```
ESSAY
  │
  ▼
┌──────────────┐
│ gold_study   │──→ gold_signatures.json
└──────┬───────┘
       ▼
┌──────────────┐
│ rhetorical   │──→ rhetorical_map.json
│ map          │
└──────┬───────┘
       ▼
┌──────────────┐
│ visual       │──→ visual_thesis.md
│ thesis       │──→ visual_program.json
└──────┬───────┘
       ▼
┌──────────────┐
│ motif_lint   │──→ motif_lint_report.json
└──────┬───────┘
       ▼
┌──────────────┐
│ storyboard   │──→ storyboard.json
│              │    (with visual_audio_alignment)
└──────┬───────┘
       ▼
┌──────────────┐
│ storyboard   │──→ storyboard_review.json
│ review       │
└──────┬───────┘
       ▼
┌──────────────┐
│ pack         │──→ AGENT_KNOWLEDGE_DOSSIER.md
│ composition  │──→ STYLE_EVOLUTION.md
│              │──→ PRODUCTION_BLUEPRINT.md
└──────┬───────┘
       ▼
┌──────────────┐
│ render_plan  │──→ render_plan.json
└──────┬───────┘
       ▼
┌──────────────┐
│ code_review  │──→ render_pack.py
│              │──→ code_review.json
└──────┬───────┘
       ▼
┌──────────────┐
│ draft_render │──→ scenes/*.mp4
└──────┬───────┘
       ▼
┌──────────────┐
│ visual_qc    │──→ visual_qc_report.json
└──────┬───────┘
       ▼
┌──────────────┐
│ final_render │──→ final.mp4
│              │──→ alignment_report.json
│              │──→ contact_sheet.jpg
└──────────────┘
       │
       ▼
     PACK (canonical format)
```

---

## 8. Quick Start

```bash
# 1. Create a job
python3 factory/controllers/platinum_controller.py new \
  --slug my-essay \
  --essay scripts/expansion-essay33.md \
  --output content/publishing/renders/my-essay/v1

# 2. Run through all stages
python3 factory/controllers/platinum_controller.py advance --slug my-essay
python3 factory/controllers/platinum_controller.py advance --slug my-essay
# ... repeat 13 times, or use the API:

# 3. Or use the Cloudflare API
curl -X POST https://platinum-factory.tradesprior.workers.dev/jobs \
  -H "Content-Type: application/json" \
  -d '{"slug":"my-essay","essay_text":"..."}'

# 4. Or use the MCP server (from any MCP-compatible LLM)
# Connect to: python3 factory/cloudflare/src/mcp-server.py
# Tools: factory_create_job, factory_advance, factory_call_llm, etc.
```

## 9. File Reference

| Path | Purpose | Status |
|------|---------|--------|
| `controllers/platinum_controller.py` | 13-stage state machine with validators | ✅ Active |
| `cloudflare/src/controller.js` | Cloudflare Worker API (CRUD jobs in D1) | ✅ Deployed |
| `cloudflare/src/mcp-server.py` | MCP server with 11 tools for LLM agents | ✅ Registered |
| `cloudflare/db/schema.sql` | D1 schema: 9 tables | ✅ Deployed |
| `stages.json` | Shared stage definition (single source of truth) | ✅ Active |
| `template/` | Canonical pack format (6 files) | ✅ Active |
| `registry/gold-pack-registry.json` | 31 gold packs indexed | ✅ Active |
| `process/THE-PLATINUM-PROCESS.md` | The creative process | 📖 Reference |
| `process/ZEUS-AMPLIFIER.md` | Zeus review questions | 📖 Reference |
| `process/trifectavision.md` | Multi-medium studio vision | 📖 Reference |
| `spec/architecture-review.md` | External architecture review | 📖 Reference |
| `spec/ECOSYSTEM-VISION.md` | Full agent ecosystem vision | 📖 Reference |
| `cloudflare/src/controller.py` | Python worker stub | 🗑️ Not used |
| `cloudflare/src/controller.ts` | Deprecated TypeScript version | 🗑️ Not used |
| `cloudflare/src/ping.py` | Test file | 🗑️ Not used |
