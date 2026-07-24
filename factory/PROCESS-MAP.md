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

## Per-Stage Process

| Stage | Executor | Storage | Model | Cost |
|-------|----------|---------|-------|------|
| **pack_setup** | Worker | D1 | qwen3-30b | $0.051/M |
| **gold_study** | Worker | R2 + D1 | qwen3-30b | $0.051/M |
| **rhetorical_map** | Worker | R2 + D1 | llama-3.3-70b | $0.293/M |
| **visual_thesis** | Worker | R2 + D1 | llama-3.3-70b | $0.293/M |
| **motif_lint** | Worker | R2 + D1 | qwen3-30b | $0.051/M |
| **storyboard** | Worker (→Queue) | R2 + D1 | qwen3-30b per chapter | $0.051/M |
| **storyboard_review** | Worker | R2 + D1 | qwen3-30b | $0.051/M |
| **pack_composition** | Worker | R2 + D1 | qwen3-30b | $0.051/M |
| **render_plan** | Worker | R2 + D1 | qwen3-30b | $0.051/M |
| **code_review** | Worker | R2 + D1 | qwen3-30b | $0.051/M |
| **draft_render** | VPS/Container | R2 | ffmpeg + PIL | $0 |
| **visual_qc** | Vision model | R2 | llama-3.2-11b-vision | $0.049/M |
| **final_render** | VPS/Container | R2 | ffmpeg + PIL + Edge TTS | $0 |

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
