# Handover for New Agent

You're joining the Platinum Factory project. Read these in order.

---

## 1. First: What Are We Building?

A deterministic video essay factory. Takes philosophical essays (Tantra, Neoplatonism, Kabbalah) and produces 7-12 minute visual essays with procedurally generated PIL graphics, narration-synced timing, and hard quality gates.

**The vision:** A multi-medium studio where PIL handles conceptual transformations, historical art provides evidence, and AI generation handles visionary scenes — all orchestrated by a Cloudflare state machine with parallel agent workers.

**The gold standard:** 30+ reference packs (Stones Are Watching, Kabbalah Tree of Life, Malas Three Veils) that prove hand-crafted PIL scene functions produce beautiful, philosophically precise videos. We're building the factory that makes producing these systematic.

---

## 2. Read These Files (In Order)

### Start Here — The Manual
| File | Why | Issues |
|------|-----|--------|
| `factory/MANUAL.md` | Complete operating manual. Glossary, architecture, agent roles, data flow, quick start. | None — this is the single source of truth for how the system works. |
| `factory/README.md` | Quick links to everything. | Points to MANUAL.md. Read first. |

### The Creative Process
| File | Why | Issues |
|------|-----|--------|
| `factory/process/THE-PLATINUM-PROCESS.md` | The 5-pass creative process. How Hermes should think about visual design. | Aspirational — the actual implementation doesn't match this perfectly yet. |
| `factory/process/ZEUS-AMPLIFIER.md` | Zeus challenge questions per shot. The no-narration test methodology. | Not yet automated — requires manual application. |
| `factory/process/PLATINUM-ADVICE.md` | 20-point production protocol from an expert. Chapter batching, JSONL, retry strategy. | **Critical** — this contains the solutions to our current blockers. |
| `factory/process/trifectavision.md` | Multi-medium studio vision (PIL + historical + AI). Evidence roles for each shot. | Forward-looking — not yet implemented but the design is solid. |
| `factory/process/storyboard-template.json` | The canonical shot schema with visual_audio_alignment. | The template is good but the controller's prompts need to match it exactly. |

### The Gold Reference
| File | Why | Issues |
|------|-----|--------|
| `factory/registry/gold-pack-registry.json` | 31 gold packs indexed with paths. | Some packs have null scene counts — need updating. |
| `content/publishing/renders/gold-analysis/` | Actual gold pack files. Study `stones_analysis`, `malas_three_veils_pack`, `dvadasanta_axis_pack`. | Some are zipped. Extract and read the render scripts, storyboards, and dossiers. |
| `content/publishing/imports/packs/unpacked/kabbalah_tree_of_life/` | Best animation pack example. Read the render_pack.py, AGENT_KNOWLEDGE_DOSSIER.md, STYLE_EVOLUTION.md. | This is the gold standard for animation pack quality. |

### The Architecture
| File | Why | Issues |
|------|-----|--------|
| `factory/spec/architecture-review.md` | External architecture review. Identifies the Worker-is-not-a-controller gap, recommends immutable artifacts. | **Critical reading** — most of the findings are still relevant. |
| `factory/spec/ECOSYSTEM-VISION.md` | Full agent ecosystem: Visual Director → Chapter Shot Designers → Zeus. | Not implemented — the controller still does stages sequentially. |
| `factory/spec/CLOUDFLARE-VIDEO-ARCHITECTURE.md` | Queue design, parallel rendering, Durable Objects. | Forward-looking — queues not wired yet. |
| `factory/spec/build-comparison.md` | Comparison of Python controller vs Cloudflare Worker approaches. | The Worker is now the correct system. Python controller is dev-only. |
| `factory/spec/llm-experiments.md` | PIL bake-off experiments, model comparisons. | Not yet run. Could be useful for model selection. |

### The Analysis & Logs
| File | Why | Issues |
|------|-----|--------|
| `factory/analysis/loganalysis1.md` | Analysis of benchmark run. Storyboard stage fails, 46% retry waste. | **Critical** — identifies the exact problems to fix. |
| `factory/analysis/platinum-master-response.md` | Expert response to the analysis. Chapter batching, JSONL, compact context, retry strategy. | **Critical** — this is our action plan. |
| `factory/analysis/brainstorm-solutions.md` | 5 problems with multiple solution options each. | Chapter batching was the top priority. Not yet implemented. |
| `factory/runs/log1-essay33.md` | Raw log from benchmark A (329 lines). | Shows the actual failure pattern. |

### The Code
| File | Why | Issues |
|------|-----|--------|
| `factory/cloudflare/src/controller.js` | **The correct system.** Cloudflare Worker with D1 state, advance endpoint, LLM calls. | Prompts are still placeholders — need to port from Python controller. |
| `factory/controllers/platinum_controller.py` | **The dev-only system.** Python controller with full prompts, validators, stage logic. | Works for local dev but bypasses all Cloudflare infrastructure. Use for prompt prototyping only. |
| `factory/cloudflare/src/mcp-server.py` | MCP server with 11 tools for external agents. | Not used by the automated pipeline. For interactive operators only. |
| `factory/stages.json` | Shared stage definitions. Single source of truth. | Both Python and Worker should read from this. The Worker currently hardcodes the stage list. |
| `factory/template/` | Canonical pack format (6 files). | Read these to understand the expected output format. |

---

## 3. Process Map

```
USER / EXTERNAL AGENT (ChatGPT, Claude)
        │
        ▼
┌──────────────────────────────────────────────┐
│      CLOUDFLARE WORKER (controller.js)        │  ← CORRECT SYSTEM
│  POST /jobs — create job in D1                │
│  POST /advance — run stage, call LLM, save    │
│  GET /jobs — list jobs                        │
│  GET /jobs/:slug — job status                 │
│  GET / — health + stages list                 │
└──────────────────────┬───────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────┐
│      D1 DATABASE (platinum-factory-db)        │
│  9 tables: jobs, stage_history, shots,        │
│  assets, gold_signatures, render_outputs,     │
│  qc_results, production_rules, asset_tags     │
└──────────────────────┬───────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────┐
│      LLM (deepseek-v4-flash or Workers AI)    │
│  Called by Worker's advance endpoint           │
│  Stages: gold_study → rhetorical_map →        │
│  visual_thesis → motif_lint → storyboard →    │
│  storyboard_review → pack_composition →       │
│  render_plan → code_review → draft_render →   │
│  visual_qc → final_render                     │
└──────────────────────┬───────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────┐
│      R2 STORAGE (factory-assets bucket)       │
│  renders/ — all video outputs (1.4GB)         │
│  exemplars/ — reference videos (643MB)        │
│  goldfiles/ — Blender/Manim reference packs   │
└──────────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────┐
│      MCP SERVER (for external agents only)    │
│  11 tools: create_job, advance, call_llm,     │
│  list_gold_packs, read_essay, etc.            │
│  NOT used by automated pipeline               │
└──────────────────────────────────────────────┘
```

---

## 4. What Works vs What's Broken

### ✅ Working
- Worker creates jobs in D1
- Worker advances stages (calls LLM, saves, updates D1)
- Python controller works for local dev (all 13 stages, but storyboard fails)
- Gold pack registry (31 packs indexed)
- Canonical pack template (6 files)
- R2 storage (1.4GB of renders, accessible via S3 API)
- MCP server (11 tools, registered with Hermes gateway)

### ❌ Broken / Placeholder
- **Worker prompts are placeholders** — the advance endpoint uses a generic "You are in stage X" prompt. The real prompts are in the Python controller and need porting.
- **Storyboard still monolithic** — needs chapter batching (8-12 shots per call, JSONL format). This is the #1 blocker.
- **No retry strategy** — Worker doesn't handle failures. Need the retry matrix from platinum-master-response.md.
- **No medium selection** — shots are PIL-only. Need evidence_role → medium mapping.
- **No visual QC** — silent-film test, repetition check not implemented.
- **No dashboard** — studio.tantrafiles.xyz exists but isn't wired to the factory.
- **Python controller bypasses Worker** — it uses local .jobs/*.json instead of D1.

---

## 5. The Fix Priorities (From Platinum Master)

1. **Port prompts from Python controller to Worker** — all the stage-specific prompts, validators, and file-saving logic already exist in Python. Port to JS in the Worker.
2. **Replace monolithic storyboard with chapter fan-out** — the Python controller's storyboard prompt asks for 35+ shots in one call and always times out. Split into chapter calls (8-12 shots each, JSONL output).
3. **Add proper retry handling** — never repeat the same failed request. Use the retry matrix from platinum-master-response.md.
4. **Add medium selection** — deterministic rules based on evidence_role.
5. **Wire the dashboard** — connect studio.tantrafiles.xyz to the Worker API.

---

## 6. Key Architecture Decisions

**Direct API calls are correct for automation.** The MCP server is for interactive operators. The Worker calls the LLM directly via Workers AI or opencode API. This is fine.

**D1 for state, R2 for artifacts.** Job state (current_stage, shots, scores) lives in D1. Generated files (storyboards, render scripts, videos) live in R2. Never store artifacts in D1.

**Chapter batching, not monolithic.** One LLM call per chapter (8-12 shots). JSONL output for partial recovery. Continuity ledger tracks system states across chapters.

**Two skill roles, not one.** `platinum-designer` handles planning and storyboarding. `platinum-renderer` (Zeus) handles review and rendering. This split forces the right behavior.

**No dispatch tables for scene functions.** Each shot gets its own custom PIL function. No `render_for_motif()` dispatch. The function IS the concept.

---

## 7. Quick Start

```bash
# Check the Worker is alive
curl https://platinum-factory.tradesprior.workers.dev/

# Create a job
curl -X POST https://platinum-factory.tradesprior.workers.dev/jobs \
  -H "Content-Type: application/json" \
  -d '{"slug":"my-essay"}'

# Advance (note: prompts are placeholder — needs porting)
curl -X POST https://platinum-factory.tradesprior.workers.dev/advance \
  -H "Content-Type: application/json" \
  -d '{"slug":"my-essay"}'

# For local dev with proper prompts:
python3 factory/controllers/platinum_controller.py new \
  --slug my-essay \
  --essay scripts/expansion-essay33.md \
  --output content/publishing/renders/my-essay/v1
python3 factory/controllers/platinum_controller.py advance --slug my-essay
```

## 8. Gold Packs to Study (Most Instructive)

1. **Kabbalah Tree of Life** — `content/publishing/imports/packs/unpacked/kabbalah_tree_of_life/` — Best animation pack. Read render_pack.py, AGENT_KNOWLEDGE_DOSSIER.md, STYLE_EVOLUTION.md.
2. **Stones Are Watching** — `content/publishing/renders/gold-analysis/stones_analysis/` — Best film pack. 106 shots, concrete motif names, chapter interleaving.
3. **Malas Three Veils** — `content/publishing/renders/gold-analysis/malas_three_veils_pack/` — Compact animation pack. AGENT_KNOWLEDGE_DOSSIER with guardrails.
4. **You Existed Before Earth** — `content/publishing/renders/you_existed_before_earth/` — Film pack format. 75 shots, interleaved chapters.
5. **A Thing Is Not a Dot** — `content/publishing/imports/packs/unpacked/thing_not_dot/` — Full film pack with qc_report, process_graph, storyboard_4x4.

---

## 9. Current Build Status (as of 2026-07-24)

### What's Been Built & Works

| Component | Status | Details |
|-----------|--------|---------|
| **Cloudflare Worker** (controller.js) | ✅ Deployed | POST /jobs, GET /jobs, GET /jobs/:slug, POST /advance. 225 lines. |
| **Stage Prompts** | ✅ Ported from Python | All 13 stages have prompt templates. System message + user message with actual content. |
| **Source Ingestion** | ✅ Fixed | Full essay stored in R2 at job creation. Loaded into prompts from R2. |
| **API Key Security** | ✅ Fixed | Hardcoded key removed from 3 files. Stored as `wrangler secret put OPENCODE_API_KEY`. |
| **Model Routing** | ✅ Added | Per-stage model policy: qwen3-30b for cheap stages, llama-3.3-70b for creative, deepseek as fallback. |
| **Validation** | ⚠️ Basic | Non-empty check before advancing. Stages 11-13 marked as execution (not LLM). |
| **D1 Database** | ✅ Deployed | 9 tables. Stage history, artifact tracking. |
| **MCP Server** | ✅ Registered | 11 tools, reads key from .env.local. |
| **Gold Pack Registry** | ✅ Indexed | 31 gold packs. |
| **R2 Storage** | ✅ Populated | 1.4GB of renders, exemplars, gold files. |

### Still Needs Work

| Issue | Priority | What's Needed |
|-------|----------|---------------|
| Storyboard chapter fan-out | High | Currently one LLM call. Needs per-chapter parallel calls with JSONL output. |
| Full validation pipeline | High | Need timing, motif score, alignment length gates ported from Python. |
| Stages 11-13 (render) | Medium | Currently return placeholder. Need VPS/Container dispatch. |
| Shared stage definitions | Medium | Worker hardcodes stage list instead of reading from stages.json. |
| Visual QC automation | Medium | Silent-film test needs vision model (llama-3.2-11b-vision). |
| Dashboard integration | Low | studio.tantrafiles.xyz not wired to Worker API. |

### Architecture

```
Cloudflare Worker (controller.js) ← THE CORRECT SYSTEM
  ├── POST /jobs → stores essay in R2, creates D1 record
  ├── POST /advance → loads R2 artifacts, calls LLM, validates, advances
  ├── GET /jobs → lists jobs
  └── GET /jobs/:slug → job status

Python Controller (platinum_controller.py) ← DEV ONLY, will be deprecated
  └── All the validators live here. Need porting to JS.

MCP Server (mcp-server.py) ← FOR EXTERNAL AGENTS
  └── 11 tools: create_job, advance, call_llm, list_gold_packs, etc.
```

### Quick Test

```bash
curl -X POST https://platinum-factory.tradesprior.workers.dev/jobs \
  -H "Content-Type: application/json" \
  -d '{"slug":"test-1","essay_text":"Light is visible by itself. Consciousness is self-showing."}'

curl -X POST https://platinum-factory.tradesprior.workers.dev/advance \
  -H "Content-Type: application/json" \
  -d '{"slug":"test-1"}'
```

### The Two Things That Would Unblock Everything

1. **Fix `llmResponse.trim is not a function`** — Workers AI response format varies. Need to handle both string and object responses. (This is the current runtime error.)
2. **Port Python validators to JavaScript** — The timing gate, motif score threshold, and alignment length checks all exist in `platinum_controller.py` but not in the Worker.
