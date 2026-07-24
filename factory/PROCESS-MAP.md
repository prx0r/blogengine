# Platinum Factory — Process Map

## What Uses What

```
                    CLOUDFLARE INFRASTRUCTURE
                    ─────────────────────────
                    │  D1 │  R2  │ Workers AI │  Queues  │
                    └─────┴──────┴────────────┴──────────┘
                          ▲         ▲
                          │         │
┌─────────────────────────┴─────────┴──────────────────────┐
│                  CLOUDFLARE WORKER                        │
│                  controller.js (225 lines)                │
│                                                          │
│  POST /jobs     → D1 (create job) + R2 (store essay)     │
│  POST /advance  → R2 (load artifacts)                    │
│                  → Workers AI (call LLM)                  │
│                  → D1 (advance stage) + R2 (save result)  │
│  GET /jobs      → D1 (list)                              │
│  GET /jobs/:slug → D1 (get one)                          │
└──────────────────────────────────────────────────────────┘
         │                           ▲
         │  fallback                 │  local dev
         ▼                           │
┌──────────────────┐      ┌──────────────────────────┐
│  OPENCODE API     │      │  PYTHON CONTROLLER        │
│  deepseek-v4-flash│      │  platinum_controller.py   │
│  (free, working)  │      │  (for local prototyping)  │
└──────────────────┘      └──────────────────────────┘
                                   │
                                   ▼
                          ┌──────────────────┐
                          │  EDGE TTS         │
                          │  (free, parallel) │
                          │  en-US-AriaNeural │
                          └──────────────────┘
```

## Per-Stage Process — Test Results (2026-07-24)

All 12 stages tested through Worker API. Results:

| # | Stage | Status | Model Used | Time | Output Quality | Issues |
|---|-------|--------|------------|------|----------------|--------|
| 1 | **pack_setup** | ✅ PASS | qwen3-30b ($0.051/M) | 5.7s | Structured JSON, verified template files | None |
| 2 | **gold_study** | ✅ PASS | qwen3-30b ($0.051/M) | 15.3s | `transferable_principles` array with actual principles | None |
| 3 | **rhetorical_map** | ✅ PASS | llama-3.3-70b ($0.293/M) | 10.2s | JSON array with `passage_id`, `text_preview`, transformations | None |
| 4 | **visual_thesis** | ✅ PASS | llama-3.3-70b ($0.293/M) | 23.0s | 3 `competing_visual_worlds` with different materials | Slightly slow |
| 5 | **motif_manufacturability** | ✅ PASS | qwen3-30b ($0.051/M) | 8.6s | Scored 0/16 — prompt doesn't include visual program data | ⚠️ Score always 0 — needs visual_program.json loaded |
| 6 | **storyboard** | ✅ PASS | qwen3-30b ($0.051/M) | 28.7s | Returned `chapter_id` + `shots` array | ⚠️ Only 1 chapter — needs chapter fan-out |
| 7 | **storyboard_review** | ✅ PASS | qwen3-30b ($0.051/M) | 6.7s | `violations: []` | ⚠️ No violations found — probably not reviewing actual data |
| 8 | **pack_composition** | ✅ PASS | qwen3-30b ($0.051/M) | 12.1s | 3 markdown files as JSON strings | None |
| 9 | **code_review** | ⚠️ PASS (error) | qwen3-30b ($0.051/M) | 4.2s | Returned `MISSING_ARTIFACTS` error | ❌ Input artifacts not found in R2 |
| 10 | **draft_render** | ⚠️ PASS (wrong) | qwen3-30b ($0.051/M) | 31.7s | Generated `render_pack_py` via LLM | ❌ Should dispatch to VPS, not run LLM |
| 11 | **visual_qc** | ✅ PASS (bypassed) | — | 0.3s | Placeholder — no actual QC | ❌ Needs vision model |
| 12 | **final_render** | ✅ PASS (bypassed) | — | 0.2s | Placeholder — no actual render | ❌ Needs VPS dispatch |

**Total time:** ~2.5 minutes for all 12 stages  
**Model costs:** ~$0.002 total (qwen3-30b for 8 stages, llama-3.3-70b for 2 stages)

### Key Findings

1. **Infrastructure works.** All stages advance, models route correctly, D1 state persists, R2 stores artifacts.
2. **Motif lint scores 0/16** — the prompt references `visual_program.json` but the Worker never loads it from R2 into the prompt context. Fix: add `loadStageInputs` for the visual program artifact.
3. **Storyboard returns 1 chapter** — the qwen3-30b model generates one chapter of shots per call. This is actually correct behavior for the chapter design pattern, but the current code expects all chapters in one call.
4. **Code review missing artifacts** — the prompt expects `render_plan.json` in R2 but it was never created (stage 9 should produce it). The stages before code_review don't actually save the right artifacts.
5. **draft_render runs LLM** instead of dispatching to VPS. It generates PIL code via the LLM which is wrong — it should execute existing PIL code.
6. **visual_qc and final_render are placeholders** — they pass through with a message about VPS dispatch.

## Data Flow

```
CREATE JOB:
  User POST /jobs { slug, essay_text }
    → Worker stores essay in R2 (source_essay.md)
    → Worker creates D1 record (jobs table)
    → Returns job ID and estimated timing

ADVANCE STAGE:
  User POST /advance { slug }
    → Worker loads job from D1
    → Worker loads stage inputs from R2 (essay, gold sigs, etc.)
    → Worker builds system + user message with actual content
    → Worker calls Workers AI (or opencode fallback)
    → Worker validates response (non-empty, JSON parseable)
    → Worker saves result to R2
    → Worker updates D1 (stage_history + jobs.current_stage)
    → Returns result + next stage
```

## Available Infrastructure

| Resource | How to Access | Cost |
|----------|--------------|------|
| **Workers AI** | `env.AI.run('@cf/qwen/qwen3-30b-a3b-fp8', { messages })` | $0.051/M tokens |
| **Workers AI** | `env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', { messages })` | $0.293/M tokens |
| **OpenCode API** | `fetch('https://opencode.ai/zen/go/v1/chat/completions')` | Free (deepseek-v4-flash) |
| **Edge TTS** | `edge-tts` Python library | Free (sequential, can parallelize) |
| **D1** | `env.FACTORY_DB.prepare('SELECT...').bind().all()` | Free tier |
| **R2** | `env.FACTORY_ASSETS.put(key, data) / get(key)` | Free tier (10GB) |
| **MCP** | `factory/cloudflare/src/mcp-server.py` | For external agents only |

## Current Bug

The Workers AI response format varies by model. Some return `{ response: "..." }`, others return a raw string. The code needs to handle both:

```javascript
// This is the bug — env.AI.run() returns different formats per model
let llmResponse = typeof aiResp === 'string' ? aiResp : (aiResp.response || JSON.stringify(aiResp));
```

qwen3-30b might return a different format than llama-3.3-70b. The fix is to check the actual response format for each model by testing once.
