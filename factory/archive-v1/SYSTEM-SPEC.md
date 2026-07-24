# Factory System — Complete Cloudflare Architecture

## Overview

A fully managed Cloudflare stack for video production. Each video goes through a **generate → review → improve → finalize** loop, with every iteration logged and learnable.

## Stack

```
┌──────────────────────────────────────────────────────────────────┐
│                      USER / AGENT (MCP)                          │
│  Hermes / LLM talks to the factory through its MCP endpoint      │
└──────────────────────────┬───────────────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────────────┐
│                   FACTORY WORKER (TypeScript)                     │
│  https://factory-worker.tradesprior.workers.dev                   │
│                                                                  │
│  Routes:                                                         │
│  - /api/factory/jobs/*        — CRUD for production jobs         │
│  - /api/factory/feedback/*    — Per-shot + episode feedback      │
│  - /api/factory/scenes/*      — Scene catalog                    │
│  - /api/factory/gold/*        — Gold standards + animation packs │
│  - /api/factory/assets/*      — Serve MP4s from R2               │
│  - /api/factory/render/*      — Queue-based render dispatch      │
│  - /api/factory/search/*      — AI Search for scene/feedback RAG │
└──────┬───────┬───────┬───────┬───────┬───────┬───────┬───────────┘
       │       │       │       │       │       │       │
┌──────▼──┐┌──▼────┐┌─▼──────┐┌─▼────┐┌▼──────┐┌▼─────┐┌▼─────────┐
│  D1     ││  R2   ││Queues  ││AI    ││AI     ││Vector││Workers   │
│ factory ││factory││factory ││Search││Gateway││ize   ││AI        │
│   -db   ││assets ││-render ││      ││       ││atlas ││FLUX/LLaVA│
│         ││       ││        ││scene ││cost   ││-globl││BGE/Llama │
│ Jobs    ││ MP4s  ││Dispatch││catalo││control││      ││Whisper   │
│ Shots   ││ Art   ││to GPU  ││g +   ││cache  ││scene ││MeloTTS   │
│ Feedback││Voice  ││workers ││feedbk││logging││search││toMdwn()  │
│ Golds   ││Templts││        ││RAG   ││       ││      ││          │
└─────────┘└───────┘└────────┘└──────┘└───────┘└──────┘└──────────┘
```

## AI Search — The Missing Piece

AI Search is a managed RAG pipeline. It's Vectorize + chunking + embedding + retrieval + reranking + generation, all pre-built.

### What to Index

| Content | AI Search Instance | Why |
|---------|-------------------|-----|
| Scene catalog (198 scenes) | `factory-scenes` | LLM queries "find a scene about emanation" → gets ranked results |
| Feedback history | `factory-feedback` | "what pacing issues did users report?" → patterns emerge |
| Gold standards | `factory-golds` | "show me shots that scored 4+ stars" → learn winning patterns |
| Animation pack descriptions | `factory-packs` | "find packs with slow camera push" → reference materials |
| Factory docs + specs | `factory-docs` | LLM reads HEADER.md, SYSTEM-SPEC.md via RAG |

### How It Improves Videos Over Time

```
Iteration 1: LLM generates scene from scratch
  → human: "pacing too slow, composition cluttered"
  → feedback logged in D1 + AI Search

Iteration 2: LLM generates scene + queries AI Search for:
  "what feedback was given about pacing on similar scenes?"
  → retrieves past feedback → avoids same mistakes
  → human: "better, but text too small"
  → feedback logged again

Iteration 3: LLM generates scene + queries:
  "what did the 4-star shots look like?"
  → retrieves gold standard examples → matches style
  → human: "looks good" → marked final

Over 20+ iterations: The system learns:
  - Which visual treatments work for which rhetorical functions
  - What duration ranges users prefer
  - Which color palettes rate highest
  - What pacing works for Tantra Files vs Ochema
```

### Setup

```bash
# Create AI Search instances
npx wrangler ai-search create factory-scenes --description "Scene catalog for video factory"
npx wrangler ai-search create factory-feedback --description "User feedback history"
npx wrangler ai-search create factory-docs --description "Factory documentation"

# Index the scene catalog (from existing JSON)
python3 -c "
import json, requests
scenes = json.load(open('scene-system/catalog/scenes.json'))
for s in scenes['scenes']:
    doc = f'# {s[\"title\"]}\\n\\n'
    doc += f'Pack: {s.get(\"source\",{}).get(\"pack\",\"\")}\\n'
    doc += f'Duration: {s.get(\"timing\",{}).get(\"default_duration\",0)}s\\n'
    doc += f'Primitives: {s.get(\"visual\",{}).get(\"primitives\",[])}\\n'
    doc += f'Meaning: {s.get(\"meaning\",{})}\\n'
    requests.post(
        'https://api.cloudflare.com/client/v4/accounts/954612.../ai-search/instances/factory-scenes/items',
        json={'content': doc, 'metadata': {'id': s['id'], 'pack': s.get('source',{}).get('pack','')}},
        headers={'Authorization': 'Bearer \$CLOUDFLARE_API_TOKEN'}
    )
"

# Bind to Worker
# Add to wrangler.jsonc:
# \"ai_search\": {
#   \"factory_scenes\": \"factory-scenes\",
#   \"factory_feedback\": \"factory-feedback\"
# }
```

### Worker Usage

```typescript
// LLM wants to create a scene about "emanation"
// First, search the scene catalog for similar scenes
const similar = await env.AI.search("factory-scenes", {
  query: "emanation outward propagation source",
  mode: "hybrid",
  topK: 5,
});

// Then, check what feedback patterns exist
const feedback = await env.AI.search("factory-feedback", {
  query: "composition issues emanation scenes",
  mode: "vector",
  topK: 3,
});

// Now the LLM has: 5 reference scenes + 3 feedback warnings
// Much less likely to repeat past mistakes
```

## The Improvement Loop (Detailed)

### Per-Iteration Flow

```
1. CREATE JOB
   POST /api/factory/jobs { essay_id, shots[] }
   → D1 stores job + shots
   → Status: draft

2. GENERATE (LLM + PIL)
   LLM reads:
   - Essay text
   - Scene catalog via AI Search ("find scenes about this concept")
   - Feedback history via AI Search ("what went wrong before")
   - Gold standards via AI Search ("what scored well")
   
   LLM writes scene functions matching the rhetorical beats
   PIL renders each shot → MP4 → uploaded to R2
   → D1 updated: mp4_key, status=review

3. REVIEW (Human)
   Dashboard at factory-worker.tradesprior.workers.dev
   - Watch video
   - Rate each shot: composition/pacing/clarity/aesthetic/accuracy
   - Rate episode: overall/narration/visuals
   - Free-text comment
   
   POST /api/factory/jobs/:id/shots/:sid/feedback
   POST /api/factory/jobs/:id/feedback
   → D1 stores feedback
   → AI Search indexes feedback for future retrieval
   → .md log written to R2 for portability

4. IMPROVE (LLM regenerates)
   LLM reads feedback:
   "shot-03: pacing too slow, composition cluttered"
   
   LLM queries AI Search:
   "how did I fix pacing complaints before?"
   "what does an uncluttered composition look like?"
   
   LLM modifies scene parameters:
   - Reduce ring count from 7 → 4
   - Increase reveal speed
   - Adjust color contrast
   
   Re-render → upload → new version
   → D1: version++, status=review

5. CONVERGE
   When user marks shot as approved:
   PUT /api/factory/jobs/:id/shots/:sid { status: "approved" }
   
   When all shots approved + episode rated 4+:
   PUT /api/factory/jobs/:id { status: "final" }
   
   → Gold standard captured from approved shots
   → Scene catalog updated with new proven scene
```

### Metrics That Drive Improvement

| Metric | Tracked Where | Tells Us |
|--------|--------------|----------|
| Shots to approval | D1: version count per job | How many iterations needed |
| Per-dimension ratings | D1: feedback.rating by dimension | Which aspect needs most work |
| Time to final | D1: created_at → updated_at | Pipeline throughput |
| Rating trend | D1: avg rating over versions | Is the LLM learning? |
| Common issues | AI Search over feedback | Recurring problems |
| Best-rated scenes | AI Search over feedback with filter dimension=composition | Winning patterns |

## Workers AI Models for Each Task

| Task | Model | Why This One |
|------|-------|-------------|
| **Scene concept art** | `@cf/black-forest-labs/flux-1-schnell` | Fast (4 steps), good quality, free tier |
| **Frame critique** | `@cf/meta/llama-3.2-11b-vision-instruct` | Vision + text, can analyze rendered frames |
| **Scene descriptions** | `@cf/llava-hf/llava-1.5-7b-hf` | Detailed image-to-text |
| **Embeddings for search** | `@cf/baai/bge-base-en-v1.5` | 768-dim, fast, free |
| **Feedback analysis** | `@cf/meta/llama-3.3-70b-instruct-fp8-fast` | Patterns in feedback text |
| **Scene planning (LLM)** | `@cf/meta/llama-4-scout-17b-16e-instruct` | Vision + text, latest model |
| **TTS (alternative)** | `@cf/myshell-ai/melotts` | Multi-lingual TTS |
| **Transcription** | `@cf/openai/whisper-large-v3-turbo` | Voiceover quality check |
| **Document conversion** | `env.AI.toMarkdown()` | Convert specs/scenes to markdown for RAG |

## AI Gateway — Cost Control

Route all external LLM calls (OpenAI, Anthropic) through AI Gateway:
- **Cache identical prompts** — same scene descriptions don't hit the API twice
- **Rate limit** — prevent runaway costs from the factory pipeline
- **Log all usage** — per-job, per-model cost breakdown
- **Fallback** — if OpenAI is down, auto-failover to Workers AI models

```bash
# Create gateway
npx wrangler ai-gateway create factory-gateway
# → gateway ID used in env vars
```

```typescript
// Worker routes LLM calls through gateway
const response = await fetch(
  `https://gateway.ai.cloudflare.com/v1/${accountId}/factory-gateway/openai/v1/chat/completions`,
  { headers: { Authorization: `Bearer ${OPENAI_KEY}` }, body: ... }
);
```

## Subscription

**Free tier is enough to start:**
- Workers: 100k req/day ✓
- D1: 5GB ✓
- R2: 10GB ✓
- Workers AI: 10k neurons/day ✓
- Queues: 1M ops/month ✓
- AI Search: 20k queries/month in beta ✓
- AI Gateway: Free tier ✓

**Upgrade to Workers Paid ($5/mo) when:**
- >100k API requests/day
- >20k AI Search queries/month
- Need faster Workers AI inference
- Need unlimited Queues ops

No need to purchase anything now. Everything runs on Free tier.

## Gold Files

The 12 animation packs at `blog-video-assets/uploads/goldfiles/` are accessible through:
- Dashboard: `https://factory-worker.tradesprior.workers.dev/` → Gold tab
- API: `GET /api/factory/gold/files`
- Worker binding: `env.GOLDS.list({ prefix: "uploads/goldfiles/" })`

These packs are reference materials. To use them:
1. Download the ZIP from R2 via the Worker proxy
2. Extract and review the rendered animations
3. Capture pacing/composition patterns as gold standard templates
4. Feed insights into the LLM when generating new scenes

## Deployed URLs

| Service | URL | Status |
|---------|-----|--------|
| Factory Control Hub | `https://factory-worker.tradesprior.workers.dev/` | ✅ Live |
| API | `https://factory-worker.tradesprior.workers.dev/api/factory/` | ✅ Live |
| Custom Domain | `https://factory.tantrafiles.xyz/*` | 🟡 Needs DNS CNAME |
| Flask (legacy) | `https://studio.tantrafiles.xyz` | ⏳ Deprecating |

## Build Order

```
Week 1: ✅ Worker + D1 + R2 + Queues (DONE)
Week 2: 🔄 AI Search instances + seed data + Worker bindings
Week 3: 🎯 Render queue consumer (poll from VPS or vast.ai)
Week 4: 📊 Dashboard improvements (shot review, feedback charts)
Week 5: 🤖 Feed AI Search results into LLM scene generation
Week 6: 🔁 Close the loop: auto-improve based on feedback patterns
```
