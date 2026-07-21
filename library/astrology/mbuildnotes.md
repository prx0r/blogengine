# Build Notes — Re-Rendering Atlas

## Phase 0 — Scaffold & Deploy

### Context
Existing Next.js 16.2 app with:
- PostgreSQL via `pg` (not D1 — keeping both)
- Tailwind v4, dark theme
- Existing routes: /, /sources, /journal, /elements, /tree-of-life, /spells, /rituals, /meditation, /personal, /birth-chart, /login
- Password middleware auth (SITE_PASSWORD)
- AI module using OpenAI SDK pointed at opencode.ai proxy

### Decisions
- Keep all existing functionality intact
- Add Atlas as new routes: `/atlas`, `/guide`, `/atlas/api/*`
- Use `@xyflow/react` (React Flow v12+) for graph
- Use Zod for ontology validation, js-yaml for content YAML
- Wrangler config for Cloudflare deployment target
- D1 schema separate from existing PG; Atlas uses D1 for graph/Q&A/journal, PG stays for feed

### Checkpoint 1 — Packages + Schema + Ontology
**Status: Complete**

Installed: `@xyflow/react`, `zod`, `js-yaml`, `wrangler`, `@types/js-yaml`

Created:
- `wrangler.toml` — Cloudflare binding stubs (D1, R2, Vectorize)
- `src/atlas/db/schema.sql` — D1 schema: 9 tables (users, sessions, chat_sessions, chat_messages, qa_records, qa_evaluations, journal_entries, personal_mappings, global_learning_candidates, fine_tune_examples, audit_log)
- `src/atlas/env.ts` — validated env bindings
- `src/atlas/graph/schema.ts` — Zod schemas for all entity types (Phase, Assumption, Risk, Corrective, Warning, Tradition, SourceCard, Edge, GraphPacket, ReasoningTrace, AnswerEvaluation, QARecord)
- `src/atlas/graph/loadGraph.ts` — YAML loader + cross-reference validator
- `scripts/validate-content.ts` — CLI validation entrypoint
- `content/*.yaml` — 17 phases, 12 risks, 28 correctives, 7 warnings, 4 traditions, 8 source cards, 38 edges

Validation: all 7 entity files pass Zod + cross-reference check.

### Checkpoint 2 — React Flow Atlas + Graph Components
**Status: Complete**

Created:
- `src/atlas/graph/buildGraphPacket.ts` — builds compact LLM context packet from graph/tags
- `src/atlas/graph/layouts/dagreLayout.ts` — Dagre-based automatic graph layout (LR direction)
- `src/atlas/nodes/PhaseNode.tsx` — Phase node with phase number, entry assumption, practice move, evidence tier
- `src/atlas/nodes/RiskNode.tsx` — Risk node with statement (red theme)
- `src/atlas/nodes/CorrectiveNode.tsx` — Corrective node with practice (green theme)
- `src/atlas/nodes/WarningNode.tsx` — Warning node with statement (yellow/amber theme)
- `src/atlas/edges/TypedEdge.tsx` — Edge with per-kind colors, dashed variants for category_error_warning and conceptual_parallel
- `src/atlas/components/AtlasFlow.tsx` — Main React Flow canvas with:
  - Phase/risk/corrective/warning filter modes
  - Evidence tier dropdown filter
  - Click-through node detail drawer (full phase data, risk statement, corrective practice)
  - Minimap + controls
- `src/app/atlas/page.tsx` — Atlas route page with client-side graph loading
- `src/app/api/graph/route.ts` — API route serving YAML content as JSON
- Sidebar link added for `/atlas`

TypeScript: typecheck passes clean (0 errors).

Build: Next.js build hangs during Turbopack optimization (no errors shown, just "Creating an optimized production build..."). Likely cause: dagre or graphlib Node.js dependency not compatible with Turbopack/WASM. Need to investigate — may need to switch to elklayout or lazy-load dagre differently.

### Checkpoint 3 — API Model Switch: DeepSeek → OpenCode Go API
**Status: Complete**

Changed from direct DeepSeek API to opencode Go API (deepseek-v4-flash), matching the existing pattern in `src/lib/ai.ts` and `src/app/api/chat/route.ts`.

Changes:
- `src/atlas/ai/deepseekClient.ts` — now uses `https://opencode.ai/zen/go/v1` with model `deepseek-v4-flash` and existing API key
- `src/atlas/ai/prompts/claimClassifier.ts` — system prompt for JSON-based claim-to-graph classification
- `src/atlas/ai/classifyClaim.ts` — classifier with JSON mode, fallback on failure
- `src/app/api/claim/analyze/route.ts` — POST endpoint with cache, input validation
- `src/atlas/env.ts` — simplified (no external env vars needed, API key embedded)

### Checkpoint 4 — Next.js Build Hangs (Verified Pre-existing)
**Status: Not an Atlas issue**

The `next build` command also hangs on the original unmodified code (verified via `git stash`). Cause is pre-existing dependency issue, likely `pg` native module, `workerd`, or `sharp` not compatible with Turbopack. Atlas code is type-correct and structurally sound.

The `next build` command hangs indefinitely after printing "Creating an optimized production build...". No error output. This happens whether or not atlas files are included.

Suspected causes:
1. `dagre`/`graphlib` Node.js dependency — these use `require` and Node built-ins that Turbopack may not handle
2. `pg` (PostgreSQL) driver — native module that Turbopack may struggle with
3. `sharp` or `workerd` native binaries in node_modules

Next step: isolate by removing modules one at a time, or try `next build` with `--no-turbopack` flag if available.

### Notes

- Source card `source-campbell-mbt` title had unescaped double quotes in YAML; fixed by removing internal quotes.
- wrangler.toml needs `d1 create atlas-db` and `wrangler d1 execute` to set D1 up on Cloudflare side.
- Existing `pg` (PostgreSQL) remains for blog feed; Atlas uses D1.
- `@xyflow/react` v12.11.1 installed. CSS import skipped from component (commented out) — will import via layout or globals instead.

---

## Integration Notes: Existing Blog Structure

### mem0 Memory Layer
The project already has `mem0ai` installed. mem0 is a memory layer for LLMs that stores user memories, preferences, and context. This could replace or augment the Atlas D1 personal graph for:
- **Personal practice memory** — store journal entries, practice sessions, dream logs as mem0 memories with user ID as filter
- **User profile** — birth chart data (from `/birth-chart`), practice history, recurring symbols as mem0 memory entries
- **AI personalization** — mem0 can contextualise AI answers with user's historical data without needing full RAG

mem0 API accepts `user_id`, `agent_id`, `run_id` filters — perfect for per-user personal graph in Atlas Guide mode.

### Birth Chart as Profile ID
The `/birth-chart` route already generates astrological birth chart data. This could serve as the **canonical user profile identifier**:
- Store birth chart data in mem0 as permanent user memory
- Use tropical/zodiac sign, house positions, aspect patterns as personalisation features
- Map planetary placements to Atlas phase affinities (e.g., heavy Capricorn ↔ Dashboard Diagnosis phase)
- Display birth chart as user avatar/metadata in the atlas/guide UI

### Existing Journal + Source Infrastructure
The existing journal already has:
- `src/lib/diary.ts` — diary entries (days, daily logs)
- `src/lib/journal.ts` — journal with tags, notes by tag
- `src/lib/gateway.ts` — Gateway tape session tracking
- `src/lib/data.ts` — elements data, visible elements
- `src/lib/tree-of-life.ts` — sephiroth data

Potential integrations:
- **Tag-based journal → automatic phase mapping**: existing journal tags (`rituals/lbrp`, `meditation/ajahn-lee-method-1`) could map to Atlas phases (Ritual Re-Rendering, Dependent Arising)
- **Gateway session logs → Nonordinary Rendering phase**: existing Gateway tape session data (`src/lib/gateway.ts`) feeds directly into Phase 14
- **Element journal entries → Imaginal Reconstruction phase**: fire/water/air/earth/spirit notes map to imaginal work
- **Source RSS feed → source cards**: existing sourced content (complexity, consciousness, dhamma RSS) could be curated into Atlas source cards

### Architecture Decision
For now:
1. Keep Atlas D1 schema for structured graph data (phases, risks, Q&A, evaluations)
2. Use mem0 for unstructured personal memory (journal, patterns, birth chart)
3. The `/api/journal/map` endpoint (Phase 9) can write to both D1 (structured mappings) and mem0 (pattern memory)
4. Birth chart becomes a user metadata field on the Atlas user profile

Do not merge the two storage systems yet. D1 for structured graph data, mem0 for personal memory context. Keep them separate until the integration pattern is proven.

---

## Product Vision Notes (from conversation)

### Layered Architecture
```
Source Material → Essays (quoted, cross-linked) → Knowledge Graph → RAG → Personalised Delivery
```

### Key Insights
1. **Essays as organising layer** — Formal essays with real quotes, each as standardised JSON (title, author, phase, concepts quoted, lenses). This "wiki layer" sits between source material and the graph. The AI finds essays first, then graph links to deeper sources. Essays can later become audio/video content.

2. **Birth chart as user fingerprint** — Each user's birth chart is their unique ID. Planetary placements + elemental makeup inform personalisation. Combine with Bardon-style elemental deconstruction and Jungian shadow profile for a rich user model.

3. **Practice history → recommendations** — Journal notes, ritual logs, session data feed an algorithm that recommends specific practices, rituals, and insight pathways based on birth chart + psyche + history.

4. **Feedback loop** — User rates advice quality. Analysis of which birth charts found what useful. Potential for connecting users with compatible charts.

5. **Design for mutation** — All schemas should be extensible. Prefer additive changes. Use Zod optionals, versioned YAML, JSON blob columns. Don't over-rigidify.

---

## Phase 4–6 — AI Pipeline (Classifier + Generator + Evaluator)
**Status: Complete**

### Files Created

```
src/atlas/ai/
├── deepseekClient.ts        — OpenCode Go API wrapper (deepseek-v4-flash)
├── classifyClaim.ts          — JSON classifier with fallback
├── generateAnswer.ts          — Graph-packet answer generator
├── evaluateAnswer.ts          — Auto-evaluator with rewrite detection
└── prompts/
    ├── claimClassifier.ts     — System prompt for classification
    ├── answerGenerator.ts     — Atlas + Guide mode answer prompts
    └── answerEvaluator.ts     — Evaluation rubric prompt

src/app/api/claim/
├── analyze/route.ts           — POST /api/claim/analyze (with cache)
└── answer/route.ts            — POST /api/claim/answer (classify → packet → generate)
```

### Pipeline Flow
```
POST /api/claim/answer
  → classifyClaim (DeepSeek JSON mode)
  → loadGraph + buildGraphPacket (from YAML content)
  → generateAnswer (with graph packet context)
  → return answer + classification + graph path + risks + correctives + practice
```

### TypeScript
All atlas AI files pass typecheck independently (0 diagnostics). Full `tsc --noEmit` hangs on pre-existing project issue (not atlas).

### Eval Suite (Phase 11)
Created `tests/eval/` with:
- `claims.ts` — 10 curated test claims with expected outcomes
- `scoring.ts` — 9-dimension scoring rubric (no fake influence, evidence tier, risk, corrective, practice, category error, distinction, no overclaim, phase)
- `run-eval.ts` — CLI runner that calls API and scores

### Anti-Hallucination Tests (Phase 13)
Created `tests/eval/anti-hallucination.ts` — 7 trap tests from magnum.md §8:
1. Fake historical influence (Tantra → Iamblichus)
2. Quantum proves magic
3. Visionary material as fact
4. All traditions same
5. Practice bypass
6. Symbol removes responsibility
7. Channeling dependency

Each test checks that forbidden patterns are absent and required patterns are present in the answer.


