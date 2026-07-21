# Notes 7 — Cloudflare Deployment & Codebase Guide

Date: 2026-07-04

## Deployments

### Cloudflare Pages (primary — full API support)

Live site: https://re-rendering-atlas.tradesprior.workers.dev

Build + deploy in one step:
```bash
export CLOUDFLARE_API_TOKEN="cfat_..."  # set your token from cloudflare.md
npm run cf:deploy
```

This runs: `generate-graph-json.mjs` → `next build` → `opennextjs-cloudflare build` → `opennextjs-cloudflare deploy`

Uses `@opennextjs/cloudflare` to wrap the Next.js app into a Cloudflare Worker. API routes (ƒ) work here — they run as serverless functions on Cloudflare's edge network.

Secrets:
```bash
echo "sk-..." | npx wrangler secret put DEEPSEEK_API_KEY
```

### GitHub Pages (static export — no API routes)

Live site: https://prx0r.github.io/blogengine/

Pushes to `main` trigger `.github/workflows/pages.yml` which runs `scripts/build.mjs`.

The build script temporarily moves `src/app/api`, `src/app/entry`, `src/lib/db.ts`, `src/middleware.ts` out of the project to produce a pure static export. API routes and server-side features are disabled.

Manual build:
```bash
npm run build:pages
```

### Vercel (API proxy for Spells)

```bash
npx vercel --prod
```

Only `/api/chat` route is needed — it proxies to OpenCode Go API.

---

## OpenCode Go API — Default AI Backend

The entire site uses **OpenCode Go API** (`https://opencode.ai/zen/go/v1`) with model **`deepseek-v4-flash`**. This is NOT a direct DeepSeek key — it's an OpenCode-managed endpoint.

### API Key Resolution (src/lib/ai.ts)

```ts
function getApiKey(): string {
  if (typeof process !== "undefined" && process.env?.DEEPSEEK_API_KEY)
    return process.env.DEEPSEEK_API_KEY;    // server-side (Cloudflare secret, env var)
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("deepseek_api_key");
    if (stored) return stored;               // client-side override
  }
  return HARDCODED_KEY;                      // fallback (exposed in page source)
}
```

Hardcoded fallback key: `sk-7dtUVBKJrJcglO9WzdLQZJXwNuz1MucUrDQCZxJjJaH29Q8CqT357DSeFyHV4B75`

### API Consumers

| Module | Endpoint | Purpose |
|---|---|---|
| `src/atlas/ai/deepseekClient.ts` | OpenCode Go direct | Atlas claim classification, answer generation, evaluation |
| `src/lib/ai.ts` | OpenCode Go via OpenAI SDK | General chat (Spells, journal, etc.) |
| `src/app/api/chat/route.ts` | OpenCode Go proxy | Browser-safe proxy for Spells page |
| `workers/proxy-worker.ts` | OpenCode Go proxy | Cloudflare Worker CORS proxy for Spells (deployed separately) |
| `server/proxy.mjs` | OpenCode Go proxy | Local dev CORS proxy (Node.js) |

### Cloudflare Worker Proxy

Deployed at: https://opencode-proxy.tradesprior.workers.dev

A standalone Worker (`workers/proxy-worker.ts`) that adds CORS headers and forwards to OpenCode Go. Used by the Spells page as the primary endpoint.

---

## Atlas Architecture

### Data Flow

```
content/*.yaml  ──→  scripts/validate-content.ts  ──→  src/atlas/graph/schema.ts (Zod)
                        ↓
              scripts/generate-graph-json.mjs
                        ↓
         public/graph-data.json  ──→  src/atlas/graph/generated-data.ts
                        ↓
              src/atlas/graph/loadGraph.ts
                  (YAML on server, fallback to generated-data in browser/worker)
                        ↓
              GET /api/graph  ──→  React Flow atlas page
```

### AI Pipeline

```
POST /api/claim/answer
  → classifyClaim (DeepSeek JSON mode)
  → buildGraphPacket (from loaded graph)
  → generateAnswer (with graph packet context)
  → return { answer, classification, graphPacket }
```

### Key Files

```
src/
├── atlas/
│   ├── ai/              — DeepSeek client, classifier, generator, evaluator
│   ├── components/      — AtlasFlow (React Flow canvas), NodeDrawer
│   ├── db/schema.sql    — D1 database schema (11 tables)
│   ├── edges/           — TypedEdge component
│   ├── graph/           — Zod schemas, loadGraph, buildGraphPacket, layouts
│   └── nodes/           — PhaseNode, RiskNode, CorrectiveNode, WarningNode
├── app/
│   ├── atlas/           — Atlas page with claim input UI
│   ├── api/claim/       — analyze + answer API routes
│   ├── api/graph/       — graph data API route
│   └── spells/          — Picatrix chat interface
├── lib/
│   ├── ai.ts            — OpenAI SDK wrapper (OpenCode Go endpoint)
│   └── memory.ts        — Mem0 memory layer
tests/
└── eval/                — 10 eval claims + 7 anti-hallucination tests
```

### Graph Entity Types

- 17 Phases (Dashboard Diagnosis → Social Incarnation)
- 12 Risks (Occult Inflation, Dry Deconstruction, etc.)
- 28 Correctives (Madhyamaka, Shadow Work, etc.)
- 7 Warnings (physics-magic, gödel-soul, etc.)
- 4 Traditions (Neoplatonism, Gnosticism, Tantra, Early Buddhism)
- 8 Source Cards (Ñāṇananda, Plotinus, Iamblichus, Corbin, etc.)
- 38 Edges (bridges, grounds, risks, corrects, etc.)

---

## Cloudflare Bindings

### D1 Database: `atlas-db`

- ID: `bd6337b3-09d4-4b5b-ad1c-fe62e480386b`
- Binding: `ATLAS_DB`
- 11 tables: users, sessions, chat_sessions, chat_messages, qa_records, qa_evaluations, journal_entries, personal_mappings, global_learning_candidates, fine_tune_examples, audit_log
- Schema applied (0 tables → 11 tables)
- Currently NOT queried by any code — all AI pipeline is in-memory + direct API calls

### R2 Bucket: `atlas-sources`

- Binding: `ATLAS_R2`
- Not wired into any code yet

### Vectorize Index: `atlas-global`

- Configured in wrangler.jsonc but wrangler warns it's unexpected — not created/queried

---

## Build Notes

- `next build` works with Turbopack (no more hanging — resolved after removing problematic deps or config)
- TypeScript typechecks pass: `npx tsc --noEmit`
- Cloudflare build uses `@opennextjs/cloudflare` which bundles the Next.js app into a single Worker
- Graph data is embedded in `src/atlas/graph/generated-data.ts` (auto-generated from YAML). This is the fallback for environments without filesystem access (Cloudflare Workers, browser)
- Known warning: `pg` module is not found in Cloudflare Worker — this is expected (PostgreSQL is only used in Vercel/self-hosted; the import is try/caught)

## URL Summary

| URL | Platform | API Routes |
|---|---|---|
| https://re-rendering-atlas.tradesprior.workers.dev | Cloudflare Pages | ✅ All working |
| https://prx0r.github.io/blogengine/ | GitHub Pages | ❌ Static only |
| https://opencode-proxy.tradesprior.workers.dev | Cloudflare Worker | OpenCode Go CORS proxy |

## Mem0 Memory Layer

Mem0 is a persistent memory layer for LLMs. Already integrated in `src/lib/memory.ts`.

**API Key (Cloudflare secret):** `m0-8ey4N3moJeeaqSp8k7oGJcTsdaqwMEHk2T4pCSjC`
Set via: `echo "m0-..." | npx wrangler secret put MEM0_API_KEY`

**Claim the account (one-time):**
```bash
npx mem0 init --email your@email.com
```
This preserves all memories — without claiming, the account is unclaimed/agent-mode.

### Cool Uses with the Stack

| Use Case | How | Why it fits |
|---|---|---|
| **Cross-session chat memory** | Before responding, `searchMemories(query, userId)` retrieves relevant past conversations | Chat already sends `x-client-id` — user's past questions and feedback are searchable |
| **Journal auto-memory** | When user saves a journal entry, `summarizeAndStore()` it to mem0 with `userId` + tags | Journal entries reveal practice patterns; AI can reference "I see you've been working with LBRP..." |
| **Dream pattern detection** | Store dream logs with metadata, then search for recurring symbols/themes | The site already has dream journaling; mem0's semantic search finds connections the user might miss |
| **Practice progress** | Gateway session logs, ritual notes → mem0 with phase tags | Chat can retrieve: "You've done 4 LBRP sessions this week — that connects to Phase 12 (Ritual Re-Rendering)" |
| **Personalized recommendations** | `searchMemories(query, userId)` + birth chart profile → recommend specific Atlas phases | Combines practice history + astrological affinities + stated interests |
| **Entity scoping** | `user_id` = client UUID, `agent_id` = "atlas-chat", `run_id` = session ID | Clean separation: user's personal memories vs chat context vs individual sessions |
| **MCP server** | `https://mcp.mem0.ai/mcp/` with `Authorization: Token m0-...` | Could be used by external AI agents to read/write user memories |

### Mem0 REST API (for direct use)

Base: `https://api.mem0.ai/v1`
Auth: `Authorization: Token m0-...`

- `POST /v1/memories/` — Add memory (`{messages: [{role, content}], user_id, agent_id, metadata, output_format}`)
- `GET /v1/memories/?user_id=X&agent_id=Y` — List memories with filters
- `POST /v1/memories/search/` — Search (`{query, user_id, agent_id, top_k}`)
- `PATCH /v1/memories/:id/` — Update memory content
- `DELETE /v1/memories/:id/` — Delete a memory

### If Mem0 Isn't Viable Long-Term

D1 `journal_entries` table + Vectorize index for embedding search. The D1 schema already has `personal_mappings` for linking entries to Atlas phases. mem0 is great for rapid prototyping; for production at scale, D1+Vectorize removes the external dependency.

## Quick Commands

```bash
npm run dev              # local dev (with Cloudflare polyfills)
npm run cf:deploy        # full Cloudflare build + deploy
npm run build:pages      # GitHub Pages static export
npm run typecheck        # TypeScript check
npm run validate:content # validate YAML against Zod schemas
npm run eval:run         # run eval test suite
npx wrangler d1 execute atlas-db --remote --command="SELECT * FROM users;"
```
