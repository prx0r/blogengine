# Re-Rendering Atlas — Agent Handoff

## Project Structure (Source Factory)

```
/content/
  _factory-index.json       ← unified inventory of ALL source material
  _pipeline-queue.json      ← processing queue with tiered priorities
  sources/                  ← 2,035 files organized by tradition
  works/                    ← 1,917 structured work JSONs
  research-objects/         ← 173 ROs (compiled from works)
  glossary/essays/          ← 1,795 essay JSONs
  glossary/art/             ← 904 art metadata records
  video-objects/            ← 56 planned videos + visual assignments
  publishing/               ← generated storyboards, voiceovers, subtitles

/hermes/skills/
  publish-video-fablecut/   ← SKILL.md: video pipeline procedure
  writing/write/            ← SKILL.md: Type A essay writing (8 phases)
  core/acquire/             ← SKILL.md: paper acquisition
  core/publish/             ← SKILL.md: publication pipeline

Cron job: video-pipeline (every 6h) — processes one stage per cycle
```

## Pipeline Priority
1. Tier 1: Tantra, Kashmir Shaivism, Corbin (our core differentiators)
2. Tier 2: Western esoteric (alchemy, hermetic, theurgy)
3. Tier 3: Comparative (death, dreams, consciousness)
4. Tier 4: Scholarly (platonism, science bridges)
5. Tier 5: Literature (mythical narratives)

## Quick Links
- **Live site**: https://re-rendering-atlas.tradesprior.workers.dev
- **Factory index**: `content/_factory-index.json`
- **Pipeline queue**: `content/_pipeline-queue.json`
- **Video index**: `content/video-objects/_index.json`
- **FableVid docs**: `fablevid.md`
- **Storyboard notes**: `storyboardnotes.md`

---

## What's Built (Current State)

### Core Infrastructure
- Next.js 16 app deployed to Cloudflare Workers via OpenNext
- D1 database with full schema: users, sessions, chat_sessions/messages, journal_entries, personal_mappings, qa_records/evaluations, graph_nodes/edges, global_learning_candidates, fine_tune_examples
- Auth: username/password signup/login, session cookies (30-day), password hashing (SHA-256)
- Middleware: password gate + session cookie check on protected routes

### Graph System
- 17 phases, 12 risks, ~28 correctives, 7 warnings, 4 traditions, 8 source cards, 38 edges defined in YAML under `content/`
- Zod schemas in `src/atlas/graph/schema.ts`
- In-memory phase cache at `src/atlas/graph/phaseCache.ts`
- D1-backed graph store at `src/db/graph-store.ts` — `graph_nodes` + `graph_edges` tables with `getNeighborhood()`, `getPath()`, `writeTriple()`, `findNodes()`, `findEdges()`
- Import script: `scripts/import-graph.mjs` (generates SQL for D1)

### Atlas Visualizer
- React Flow graph at `/atlas` with PhaseNode, RiskNode, CorrectiveNode, WarningNode, TypedEdge
- Dagre layout, stream/evidence tier filters, node drawers

### AI Pipeline
| Component | File | Status |
|-----------|------|--------|
| Router (102 keyword→phase mappings) | `src/atlas/ai/router.ts` | ✅ Working |
| Claim classifier (LLM) | `src/atlas/ai/classifyClaim.ts` | ✅ Working |
| Answer generator (graph packet + LLM) | `src/atlas/ai/generateAnswer.ts` | ✅ Working |
| Answer evaluator | `src/atlas/ai/evaluateAnswer.ts` | ✅ Working, wired |
| Answer evaluator prompt | `src/atlas/ai/prompts/answerEvaluator.ts` | ✅ |
| Claim classifier prompt | `src/atlas/ai/prompts/claimClassifier.ts` | ✅ |
| DeepSeek client | `src/atlas/ai/deepseekClient.ts` | ✅ |

### Chat Endpoints
| Endpoint | What | D1 Writes |
|----------|------|-----------|
| `POST /api/chat/agent` | **Agent mode** — streaming DeepSeek with memory blocks, birth chart context, graph tool calling | ✅ Saves to `chat_messages`, `chat_sessions` |
| `POST /api/chat/stream` | **Wiki mode** — returns phase data or streams LLM, no tool calling | ❌ Does NOT save anything |
| `POST /api/chat/agent/tool` | Tool execution endpoint (can be called separately) | ✅ |

### Tool Calling (NEW — just wired)
The agent route now makes non-streaming requests with tool definitions. When the LLM returns `tool_calls`, they're executed against D1 graph store, results fed back, then final answer streamed. Max 5 tool calls per turn. Tools available:
- `query_knowledge_graph` — find_nodes, get_node, get_neighborhood, find_path, get_edges
- `write_to_graph` — insert subject-predicate-object triples

### Journal System
| Endpoint | What |
|----------|------|
| `POST /api/journal` | Create entry with kind selector + auto-classify against phases (text search) |
| `GET /api/journal` | List entries (paginated, by kind filter) |
| `GET /api/journal/[id]` | Single entry with phase mappings |
| `DELETE /api/journal/[id]` | Delete entry + cascade mappings |
| `GET /api/journal/[id]/map` | Fetch phase mappings |
| `POST /api/journal/[id]/map` | Re-classify entry |

### Birth Chart
- Client-side computation via caelus engine at `/birth-chart`
- City autocomplete via Open-Meteo geocoding
- Save to profile: stores raw time/location + computed planet positions (bodies with sign, house, retrograde) + angles (ASC, MC)
- Agent reads birth chart from `profile.birthChart.bodies` in human block

### Profile & User
| Endpoint | What |
|----------|------|
| `GET /api/profile` | Get profile (session auth) |
| `PATCH /api/profile` | Update profile (birth chart, preferences) |
| `GET /api/me` | Get current user info from session |
| `POST /api/auth/signup` | Create account |
| `POST /api/auth/login` | Log in, set session cookie |
| `POST /api/auth/logout` | Clear session cookie |
| `POST /api/settings/password` | Change password |
| `GET /api/account/export` | Export all data as JSON |
| `POST /api/account/delete` | Permanently delete account |
| `POST /api/feedback` | Rate responses (1-5), auto-adjust preferences |
| `GET /api/user/patterns` | Streak tracking, phase engagement, journal stats |

### Claim Pipeline
`POST /api/claim/answer` does:
1. Classify claim via LLM
2. Build graph packet from phase cache
3. Generate answer via LLM
4. **Evaluate answer** via LLM evaluator (NEW)
5. **Save to `qa_records` + `qa_evaluations`** (NEW — finally populates knowledge base)
6. Return result

---

## 🔴 Critical Things Still Not Built

### Gaps in magnum.md enforcement
The core anti-hallucination document has rules that are only in system prompts, not enforced in code:
1. **No tradition registry checking** — 4 traditions in YAML but no code checks if a tradition exists before the LLM references it
2. **No category-error warning checking** — 7 warnings loaded but never evaluated against claims
3. **No reasoning trace generation** — `ReasoningTrace` type defined in schema but never produced
4. **No source-card validation** — no check that cited source cards actually exist

### Missing API Routes (from mbuild.md)
| Route | Purpose |
|-------|---------|
| `POST /api/admin/source-cards` | Admin create source cards |
| `POST /api/qa/similar` | Vectorize similarity search (requires Vectorize setup) |
| `PATCH /api/qa/:id/status` | Approve/reject Q&A |
| `GET /api/admin/qa/review` | Admin review queue |

### Stream/wiki route doesn't save
`POST /api/chat/stream` avoids D1 entirely — wiki mode conversations vanish.

### Journal uses text search, not AI
Auto-classify in journal uses `searchPhases()` (keyword text match), not the LLM classifier (`classifyClaim.ts`). The `journalMapper.ts` / `mapJournalEntry.ts` files referenced in mbuild.md don't exist.

### No admin dashboard
No UI for reviewing Q&A, managing users, or importing graph data.

---

## 📋 Recommended Next Steps (Ordered)

### 1. Wire wiki mode to save conversations
Fix `src/app/api/chat/stream/route.ts` to save to `chat_messages` — currently the only chat endpoint that discards everything.

### 2. Wire tradition registry checking into agent
Before the LLM answers about a tradition, check if the tradition exists in the YAML cache and is `status: "approved"`. The tradition data is already loaded — just needs a lookup function.

### 3. Wire category-error warnings into claim pipeline
After classifying a claim, check the 7 warning rules against it (e.g., "physics proves magic" → warning-physics-magic). Include matched warnings in the graph packet.

### 4. Build admin dashboard
At minimum: `/admin/qa-review` to approve/reject Q&A records, `/admin/source-cards` to create new source cards.

### 5. Journal AI mapping
Replace `searchPhases()` text matching with LLM-based `classifyClaim()` for journal auto-classification. Build `src/ai/prompts/journalMapper.ts` + `src/ai/mapJournalEntry.ts`.

### 6. Phase 19 — Metaphysics doc + extraction
Once the graph shape is stable and chat works well, build the controlled vocabulary + extraction pipeline. Full spec in `metaphysics.md`.

### 7. Source RAG
PDF chunking → embedding → Vectorize retrieval for answer grounding.

### 8. Guide mode
Personalized answers using journal history + birth chart.

---

## Code Review Tips for Next Agent

### Key Files to Read First
| File | Why |
|------|-----|
| `mbuild.md` | Build plan with all phases |
| `src/app/api/chat/agent/route.ts` | Main agent loop — tool calling, memory blocks, streaming |
| `src/atlas/ai/router.ts` | Keyword→phase router |
| `src/atlas/graph/phaseCache.ts` | In-memory graph cache with linked risks/correctives |
| `src/atlas/graph/schema.ts` | All Zod schemas and types |
| `src/atlas/graph/buildGraphPacket.ts` | Builds context for LLM |
| `src/db/graph-store.ts` | D1 graph abstraction |
| `src/atlas/db/graph-tools.ts` | Tool definitions + OpenAI format + execution |
| `src/app/api/claim/answer/route.ts` | Full claim pipeline with eval + QA save |
| `src/middleware.ts` | Auth middleware |
| `src/atlas/db/d1.ts` | D1 profile client |
| `src/atlas/db/schema.sql` | Full D1 schema |

### Pattern to Follow
- All routes use `getCloudflareContext()` for D1 bindings
- Auth via session cookie (`request.cookies.get("session_id")`)
- Graph queries through `src/db/graph-store.ts`
- Phase cache through `src/atlas/graph/phaseCache.ts`
- New YAML data goes in `content/` with Zod schema in `src/atlas/graph/schema.ts`

### Deployment
```bash
export CLOUDFLARE_API_TOKEN="[token from cloudflare.md]"
npm run cf:deploy
```

### D1 Schema Updates
After changing `src/atlas/db/schema.sql`, run:
```bash
wrangler d1 execute atlas-db --file=src/atlas/db/schema.sql
```
