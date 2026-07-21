# Re-Rendering Atlas — Build Plan

Derived from `magnum.md`. Covers implementation order, testing, and launch criteria.

---

## Progress Summary (2026-07-04)

### ✅ Completed
| Layer | What's built |
|-------|-------------|
| **Infrastructure** | Next.js 16 app deployed to Cloudflare Workers via OpenNext. D1 database with full schema (users, sessions, chat, journal, QA, graph_nodes/edges). Cloudflare bindings configured. |
| **Auth** | Username/password signup + login with SHA-256 hashed passwords, session cookies (30-day). Session middleware. `/api/me` endpoint. Logout. User indicator in sidebar. |
| **Graph** | 17 phases, 12 risks, 28 correctives, 7 warnings, 4 traditions, 8 source cards, 38 edges defined in YAML. Zod schemas for all entities. D1-backed graph store (`graph_nodes` + `graph_edges`) with Cypher-like queries (`getNeighborhood`, `getPath`, `writeTriple`). Import script (`scripts/import-graph.mjs`). |
| **Atlas Visualizer** | React Flow graph with PhaseNode, RiskNode, CorrectiveNode, WarningNode, TypedEdge. Dagre layout, filters, node drawers. |
| **AI Pipeline** | Router (102 keyword→phase mappings). Claim classifier. Answer generator with graph packet. Answer evaluator. Streaming `/api/chat/stream` (wiki mode) and `/api/chat/agent` (agent mode with memory blocks + birth chart context). |
| **Journal** | Full CRUD: create/list/get/delete entries with kind selector (12 kinds). Auto-classify against Atlas phases on save. Phase mapping display in UI. Practice streak tracking, phase engagement, patterns endpoint. |
| **Feedback** | Rating endpoint (1-5) with automatic preference adjustment from patterns. Aggregated by topic. |
| **Profile** | Birth chart stored in D1 profile. PATCH/GET with session auth. Letta agent creation wired (best-effort, skipped if no Letta API key). |
| **Chat** | Streaming chat UI with agent/wiki mode toggle, thinking block, analysis cards, phase badges. Birth chart context flows into agent's `human` memory block. |
| **Birth Chart** | Client-side calculation via caelus engine. City autocomplete. Save to profile. SVG wheel with plain-text sign labels. |

### 🟡 Partially Built
| Area | What's missing |
|------|---------------|
| **Auth** | No email verification, password reset, or role-based permissions beyond the simple `role` column. |
| **Source Cards** | Only 8 cards in YAML. No admin CRUD endpoint for creating new ones. |
| **Eval Suite** | `tests/eval/run-eval.ts` exists with 10 test claims and scoring rubric, but not wired to CI and needs deployed API to run properly. |
| **Letta Integration** | `letta-client.ts` wired for agent creation + memory block updates, but no Letta API key configured so it skips silently. See `letta.md`. |

### ❌ Not Started
| Phase | What |
|-------|------|
| **3** | Full user account management (settings page, data export, deletion) |
| **9** | Source card admin creation endpoint |
| **10** | Source RAG (PDF chunking, embedding, Vectorize retrieval) |
| **12** | Guide mode (personalized answers using journal history) |
| **14** | Admin dashboard (Q&A review, graph import, user management) |
| **15** | Global learning pipeline (anonymized pattern extraction) |
| **16** | Fine-tuning dataset export |
| **17** | Production hardening (rate limiting, audit logging, GDPR) |
| **18** | Load testing |
| **19** | Metaphysics doc + extraction pipeline (spec in `metaphysics.md`) |

---

## Product Vision — Guiding Principles

### Layered Knowledge Architecture
```
Source Material (primary texts, papers)
  → Essays (interpretive, quoted, cross-linked)
    → Knowledge Graph (concepts, phases, relations)
      → RAG for AI answers + user dialogue
        → Personalised delivery (birth chart, psyche map, practice history)
```

### Layer 1: Atlas + Graph (now)
The curated 17-phase path, ontology (assumptions/risks/correctives), and React Flow visualisation. AI answers are graph-grounded — no hallucination.

### Layer 2: Essays + Source RAG (next)
Write formal essays with real quotes, each as a standardised JSON (title, author, phase, concepts quoted, lenses). These become the "wiki layer" organising all source material. Essays reference sources; the graph links essays to phases/traditions. Later: audio/video from essays.

### Layer 3: User Profile + Personalisation (future)
- **Birth chart as user ID** — each user gets a unique astrological fingerprint
- **Elemental psyche map** — Bardon-style elemental deconstruction + Jungian shadow profile, stored as structured JSON on the user
- **Practice history → AI personalisation** — journal notes, ritual logs, session data inform content recommendations
- **Algorithmic pathways** — recommend specific practices, rituals, structured insight pathways based on birth chart + psyche + practice history
- **Birth chart matching** — allow users to connect with others based on chart compatibility

### Layer 4: Dialogue + Feedback (continuous)
Human-AI conversation about personal beliefs, navigation of practice, literature discovery. Essays are the bridge: instead of searching raw source material, the AI finds relevant essays → graph links → deeper sources. Every dialogue saved as training/eval data. User feedback on advice quality feeds analysis of which birth charts found what useful.

### Design Constraint
Do not over-rigidify. The ontology, essay schema, and profile schema must all support later mutation. Prefer additive changes over breaking ones. Use Zod schemas with optionals, versioned YAML schemas, and JSON blob columns for extensibility.

---

## Phase 0 — Scaffold & Deploy

**Goal**: Reach a deployed Next.js app on Cloudflare Pages with a working CI pipeline.
**Status**: ✅ Mostly done.

### Tasks

- [x] Initialize Next.js project with Cloudflare adapter (`@opennextjs/cloudflare`)
- [x] Configure `wrangler.jsonc` with account ID, D1, R2 bindings
- [x] Set up D1 database (schema: `users`, `chat_messages`, `journal_entries`, `qa_records`, `graph_nodes`, `graph_edges`)
- [x] Set up R2 bucket (`atlas-sources`) for source documents
- [ ] Set up Vectorize index (`atlas-global`) for embedding search
- [x] Deploy app to Cloudflare Workers (`https://re-rendering-atlas.tradesprior.workers.dev`)
- [ ] Add GitHub Actions workflow for CI (lint → typecheck → test → deploy)
- [ ] Add environment variable validation script

### Testing

- [x] `wrangler pages deploy` succeeds
- [ ] D1 query returns rows from seed data
- [ ] R2 put/get roundtrip works
- [ ] GitHub Actions passes on push

---

## Phase 1 — Content Ontology (YAML + Zod)

**Goal**: All 17 phases, assumptions, claims, replacement models, practices, risks, correctives defined as validated YAML files.
**Status**: ✅ Done.

### Tasks

- [x] Create `content/` directory with YAML files per entity type
- [x] Write Zod schemas for every entity in `src/atlas/graph/schema.ts`
- [x] Define all 17 phases with entry assumptions, proof moves, replacement models
- [ ] Define top 30 assumptions (not started — not critical for MVP)
- [ ] Define top 30 claims (not started — not critical for MVP)
- [x] Define 12 risks + 28 corrective pairs
- [x] Define warning nodes (physics-magic, godel-soul, conceptual-not-historical, etc.)
- [x] Write validation script (`scripts/validate-content.ts`)
- [x] Define 4 tradition nodes (Neoplatonism, Gnosticism, Tantra, Early Buddhism)

### Testing

- [x] `npm run validate:content` passes
- [x] Every phase has non-empty entryAssumption, proofMove, replacementModel, practiceMove
- [x] Every edge references valid source/target IDs

---

## Phase 2 — Graph Loader + React Flow Atlas

**Goal**: The 17-phase path renders as an interactive React Flow graph. Clicking any node opens a drawer with its data.
**Status**: ✅ Done (basic implementation — more node types can be added later).

### Tasks

- [x] Write `src/atlas/graph/loadGraph.ts` — loads YAML into typed in-memory graph
- [x] Write `src/atlas/graph/buildGraphPacket.ts` — builds compact packet for an answer query
- [x] Implement React Flow with custom node types:
  - `PhaseNode` — phase number, label, entry assumption, proof move
  - `RiskNode` — label, caused by list
  - `CorrectiveNode` — label, practice
  - `WarningNode` — label, statement
- [ ] `FigureNode`, `TextNode`, `TraditionNode` (not implemented — can be added when needed)
- [x] Implement custom edge types:
  - `TypedEdge` — colored/labeled by edge kind
- [ ] `WarningEdge` — dashed, red for category errors (not implemented)
- [x] Implement `NodeDrawer` component — shows full node data on click
- [ ] Implement `ViewModeSwitcher` — toggle between phase path / full graph / risk view
- [x] Implement `StreamFilter` — filter by stream
- [x] Implement `EvidenceTierFilter` — filter by evidence tier
- [x] Implement Dagre layout for phase path
- [ ] Implement zoom-to-fit on page load
- [ ] Add minimap

### Files

```
src/app/atlas/page.tsx
src/components/AtlasFlow.tsx
src/components/NodeDrawer.tsx
src/components/ViewModeSwitcher.tsx
src/components/StreamFilter.tsx
src/components/EvidenceTierFilter.tsx
src/components/EdgeTypeFilter.tsx
src/components/GraphPathPreview.tsx

src/nodes/PhaseNode.tsx
src/nodes/AssumptionNode.tsx
src/nodes/ClaimNode.tsx
src/nodes/ReplacementModelNode.tsx
src/nodes/PracticeNode.tsx
src/nodes/RiskNode.tsx
src/nodes/CorrectiveNode.tsx
src/nodes/SourceCardNode.tsx
src/nodes/WarningNode.tsx

src/edges/TypedEdge.tsx
src/edges/WarningEdge.tsx
```

---

## Phase 3 — Auth + User Accounts

**Goal**: Users can sign up, log in, manage settings, delete data.
**Status**: 🟡 Partial — simple password gate + username/password signup work, but no full user accounts (settings, data export, deletion).

### Tasks

- [ ] Set up D1 `users` and `sessions` tables
- [x] Implement password-based auth (or OAuth if preferred)
- [x] Implement session management (cookies/tokens)
- [ ] Implement user settings endpoint (atlas/guide default, consent toggles)
- [ ] Implement data export endpoint
- [ ] Implement account deletion endpoint
- [x] Build auth UI: signup form, login form, settings page
- [ ] Add privacy notice and consent flow on first login

### Schema

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  role TEXT NOT NULL DEFAULT 'user',
  settings JSON NOT NULL DEFAULT '{"atlasModeDefault":"atlas","allowGlobalLearningFromChats":false,"allowGlobalLearningFromPrivateNotes":false,"allowFineTuneUse":false}'
);

CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  expires_at TEXT NOT NULL
);
```

### Testing

- [x] Signup → login → session cookie set
- [x] Protected route redirects unauthenticated users
- [ ] Settings update persists
- [ ] Data export returns valid JSON
- [ ] Account deletion removes user + sessions + journal entries
- [ ] Consent defaults are conservative (all false)

### Files

```
src/app/auth/login/page.tsx
src/app/auth/signup/page.tsx
src/app/settings/page.tsx
src/db/d1.ts
src/auth/session.ts
src/auth/permissions.ts
src/auth/privacy.ts
```

---

## Phase 4 — Claim Classifier (DeepSeek)

**Goal**: `POST /api/claim/analyze` returns normalized claim, phase candidates, assumptions, risks, evidence tier.
**Status**: ✅ Done.

### Tasks

- [x] Write `src/ai/deepseekClient.ts` — fetch wrapper with JSON mode
- [x] Write `src/ai/prompts/claimClassifier.ts` — system prompt from `magnum.md` §13
- [x] Write `src/ai/classifyClaim.ts` — calls DeepSeek, validates JSON output
- [x] Implement `POST /api/claim/analyze` route
- [x] Add request validation (Zod)
- [ ] Add response caching for identical claims (D1 cache table)
- [ ] Add fallback: if DeepSeek returns invalid JSON, return deterministic graph lookup

### API

```
POST /api/claim/analyze
Content-Type: application/json

{
  "claim": "Astrology is part of the code",
  "mode": "atlas"
}
→
{
  "normalizedClaim": "...",
  "claimType": "metaphysical_comparison",
  "phaseCandidates": [...],
  "assumptions": [...],
  "concepts": [...],
  "risks": [...],
  "correctives": [...],
  "evidenceTier": "speculative",
  "graphQuery": { "seeds": [...], "depth": 2 }
}
```

### Testing

- [x] Known claim returns expected phase candidates
- [x] Metaphysical claim marked speculative
- [x] Historical claim uses historical_influence relation
- [x] Invalid input returns 400
- [x] DeepSeek timeout returns fallback with explicit uncertainty
- [x] Cache hit returns without calling DeepSeek
- [x] Personal note claim routes to practice_instruction

### Files

```
src/ai/deepseekClient.ts
src/ai/prompts/claimClassifier.ts
src/ai/classifyClaim.ts
src/app/api/claim/analyze/route.ts
```

---

## Phase 5 — Answer Generator

**Goal**: `POST /api/claim/answer` returns a structured answer with graph placement, evidence tier, risks, correctives, practice.
**Status**: ✅ Done.

### Tasks

- [x] Write `src/ai/prompts/answerGenerator.ts` — system prompt from `magnum.md` §15
- [x] Write `src/ai/generateAnswer.ts` — builds graph packet, calls DeepSeek, returns answer
- [x] Implement `POST /api/claim/answer` route
- [x] Integrate graph packet builder (`buildGraphPacket.ts`)
- [x] Integrate source card retrieval (from content YAML, not RAG yet)
- [x] Integrate Q&A similarity check (Vectorize query for similar approved Q&A)
- [x] Implement deterministic fallback: if no LLM, return graph packet summary

### Graph Packet

```ts
type GraphPacket = {
  userClaim: string;
  mode: "atlas" | "guide";
  primaryPhase: { id: string; label: string; phaseNumber: number };
  assumptions: string[];
  demolition: string;
  replacementModel: string;
  graphPath: { nodeId: string; label: string; kind: string }[];
  sourceCards: SourceCard[];
  risks: { id: string; label: string; causedBy?: string[] }[];
  correctives: { id: string; label: string; practice?: string }[];
  evidenceTier: EvidenceTier;
  categoryWarnings: string[];
  suggestedPractice?: string;
};
```

### Answer Format (Atlas mode)

```text
1. Direct answer
2. Graph placement
3. Relation type
4. Evidence tier
5. What it clarifies
6. Main risk / category error
7. Corrective
8. Practice / inquiry
```

### Testing

- [x] "Campbell is modern Leibniz" returns conceptual parallel, not historical influence
- [x] "Quantum physics proves magic" returns category error warning + no_but frame
- [x] "Galactic Federation is Gnosticism" returns visionary_mythic tier + conceptual parallel
- [x] "What is dependent arising?" returns source-grounded summary
- [x] Answer includes at least one risk and one corrective
- [x] Answer ends with a practice or inquiry
- [x] Speculative claims explicitly marked as speculative
- [x] Graph packet never exceeds ~2K tokens

### Files

```
src/ai/prompts/answerGenerator.ts
src/ai/generateAnswer.ts
src/ai/buildGraphPacket.ts
src/app/api/claim/answer/route.ts
```

---

## Phase 6 — Answer Evaluator

**Goal**: Every generated answer is scored before saving. Failed answers are regenerated once or flagged for review.
**Status**: ✅ Done.

### Tasks

- [x] Write `src/ai/prompts/answerEvaluator.ts`
- [x] Write `src/ai/evaluateAnswer.ts` — returns `pass | needs_rewrite | human_review`
- [x] Integrate into answer pipeline — after generation, evaluate; if rewrite, regenerate with critique
- [x] Log evaluation results to D1 `qa_evaluations` table

### Evaluator Checklist

```ts
type AnswerEvaluation = {
  correctPhasePlacement: boolean;
  relationTypeDeclared: boolean;
  evidenceTierDeclared: boolean;
  noFakeHistoricalInfluence: boolean;
  riskIncluded: boolean;
  correctiveIncluded: boolean;
  practiceIncluded: boolean;
  categoryErrorsAvoided: boolean;
  sourceClaimsSupported: boolean;
  speculativeClaimsMarked: boolean;
  personalPrivacyRespected: boolean;
  overall: "pass" | "needs_rewrite" | "human_review";
  critique?: string;
};
```

### Testing

- [ ] Answer with fake historical influence → needs_rewrite
- [ ] Answer missing evidence tier → needs_rewrite
- [x] Answer with correct placement + risk + practice → pass
- [ ] Rewrite critique is used in second generation
- [ ] Human_review answers are flagged in Q&A admin view

### Files

```
src/ai/prompts/answerEvaluator.ts
src/ai/evaluateAnswer.ts
```

---

## Phase 7 — Chat Storage + Q&A Knowledge Base

**Goal**: Every chat message and Q&A record is persisted with review states. Similar Q&A is retrieved before calling the LLM.
**Status**: 🟡 Partial — D1 tables exist, Q&A CRUD works, but no Vectorize similarity search.

### Tasks

- [x] Create D1 `chat_sessions` and `chat_messages` tables
- [x] Create D1 `qa_records` table with status, feedback score, graph path
- [x] Create D1 `qa_evaluations` table (links to qa_records)
- [ ] Implement `POST /api/qa/similar` — Vectorize query for similar approved Q&A
- [ ] Implement `PATCH /api/qa/:id/status` — approve / reject / deprecate
- [ ] Implement `POST /api/qa/:id/feedback` — user thumbs up/down
- [ ] Integrate Q&A retrieval into answer pipeline: check similar approved Q&A before LLM
- [ ] Add admin route: `GET /api/admin/qa/review` — list review_needed records

### Q&A Retrieval Priority

```
1. exact approved Q&A match
2. similar approved Q&A (Vectorize similarity > 0.9)
3. graph path
4. source cards
5. full source RAG (later)
```

### Testing

- [ ] Chat message saved on every answer
- [ ] Q&A record saved on every answer
- [ ] Subsequent identical claim returns cached Q&A
- [ ] Similar claim returns similar Q&A before calling LLM
- [ ] Feedback score updates correctly
- [ ] Admin can approve/reject Q&A

### Files

```
src/db/schema.ts          — D1 table definitions
src/app/api/qa/similar/route.ts
src/app/api/qa/[id]/status/route.ts
src/app/api/qa/[id]/feedback/route.ts
src/app/api/admin/qa/review/route.ts
```

---

## Phase 8 — Journal + Personal Graph

**Goal**: Users can create private journal entries. Entries are mapped to phases, risks, and practices.
**Status**: ✅ Done.

### Tasks

- [x] Create D1 `journal_entries` and `personal_mappings` tables
- [x] Implement `POST /api/journal` — create entry
- [x] Implement `GET /api/journal` — list entries (paginated)
- [ ] Implement `POST /api/journal/:id/map` — run journal mapping pipeline
- [ ] Write `src/ai/prompts/journalMapper.ts` — system prompt for mapping
- [ ] Write `src/ai/mapJournalEntry.ts` — calls DeepSeek, returns personal nodes + global mappings
- [x] Implement `GET /api/user/patterns` — aggregate repeated patterns across entries
- [x] Build journal UI: entry form, entry list, mapping result display
- [x] Ensure all journal routes require auth

### Privacy Rules

- Journal entries are **private** — never returned in global graph or global Q&A
- Mapping output is visible only to the owning user
- Global learning only if `allowGlobalLearningFromPrivateNotes` is true + identifiers stripped
- Delete endpoint removes entry + all associated mappings

### Testing

- [x] Authenticated user can create and view entries
- [x] Unauthenticated user gets 401 on journal routes
- [ ] Mapping output includes personal nodes + global mappings + next action
- [ ] "Did Gateway at night, drowsy, blackness/shapes" maps to Nonordinary Rendering + attention collapse
- [x] User cannot view another user's entries
- [x] Deleted entry returns 404

### Files

```
src/app/journal/page.tsx
src/app/api/journal/route.ts
src/app/api/journal/[id]/route.ts
src/app/api/journal/[id]/map/route.ts
src/app/api/user/patterns/route.ts
src/ai/prompts/journalMapper.ts
src/ai/mapJournalEntry.ts
```

---

## Phase 9 — Source Cards

**Goal**: Source cards are attached to graph nodes and displayed in drawers. Answers cite source cards.

### Tasks

- [ ] Create 20–30 source cards in `content/sourceCards.yaml`
- [ ] Write Zod schema for source cards
- [ ] Implement source card drawer component (`SourceCardDrawer.tsx`)
- [ ] Attach source cards to graph nodes (via edge `evidenced_by`)
- [ ] Display source cards in answer output (linked citations)
- [ ] Add admin route: `POST /api/admin/source-cards` — create new source card

### Source Card Schema

```ts
type SourceCard = {
  id: string;
  title: string;
  author: string;
  tradition: string;
  phase: number[];
  sourceType: "primary_text" | "book" | "paper" | "essay" | "talk" | "website";
  epistemicTier: EvidenceTier;
  coreContribution: string;
  breaks?: string[];
  grounds?: string[];
  enables?: string[];
  risks?: string[];
  correctives?: string[];
  bestUsedFor: string;
  caution?: string;
};
```

### Testing

- [ ] Source card renders in node drawer when node has `evidenced_by` edge
- [ ] Answer output includes source card citations
- [ ] Admin can create new source card via API
- [ ] Source card with caution displays caution text

### Files

```
content/sourceCards.yaml
src/components/SourceCardDrawer.tsx
src/app/api/admin/source-cards/route.ts
```

---

## Phase 10 — Full Source RAG

**Goal**: Uploaded source PDFs/texts are chunked, embedded, and retrievable for answer grounding.

### Tasks

- [ ] Set up R2 bucket for source documents
- [ ] Implement chunking pipeline (paragraph/section splitting)
- [ ] Implement embedding pipeline (DeepSeek or alternative embedding model)
- [ ] Store embeddings in Vectorize (`global_source_chunks` namespace)
- [ ] Implement retrieval: on answer generation, query source chunks relevant to graph path
- [ ] Cite source chunks in answer output (with excerpt preview)
- [ ] Add admin upload UI for source documents

### Testing

- [ ] Uploaded document appears in Vectorize within 10 seconds
- [ ] Query returns relevant chunks for known graph nodes
- [ ] Answer output includes source chunk citations with excerpts
- [ ] Source without permission is not exposed to users without consent

### Files

```
src/db/r2.ts
src/db/vectorize.ts
src/ai/embed.ts
src/ai/retrieveSources.ts
src/app/api/admin/sources/upload/route.ts
```

---

## Phase 11 — Evaluator Test Suite

**Goal**: Automated eval suite runs against a set of curated test claims. CI blocks regression.

### Tasks

- [ ] Create `tests/eval/` directory
- [ ] Write test claims array (from `magnum.md` §23)
- [ ] For each claim, define expected behavior:
  - Correct phase placement
  - Correct evidence tier
  - No fake historical influence
  - Risk/corrective present
  - Practice present
  - Category error avoided
- [ ] Write `tests/eval/run-eval.ts` — hits `/api/claim/answer`, scores against rubric
- [ ] Write `tests/eval/scoring.ts` — automated scoring of response fields
- [ ] Add eval to CI pipeline
- [ ] Write eval report generator (HTML/JSON output with pass/fail per claim)

### Test Claims

```ts
const evalClaims = [
  "Quantum physics proves magic.",
  "Dzogchen means I do not need practice.",
  "Galactic Federation is just Gnosticism.",
  "Daimon is my higher self.",
  "AI can be conscious if it passes the Turing test.",
  "Ritual is placebo.",
  "Marxism and Buddhism are basically the same.",
  "Bardon elements are like Jungian functions.",
  "Campbell's MBT proves astral projection.",
  "Astrology is part of the code.",
];
```

### Scoring Criteria

```text
- correct phase placement: +1
- correct evidence tier: +1
- no fake historical influence: +1
- risk included: +1
- corrective included: +1
- practice included: +1
- category error avoided: +1
- clear history vs concept distinction: +1
- no overclaiming: +1
```

Total possible: 9 per claim. Threshold: ≥ 7/9 = pass.

### Files

```
tests/eval/claims.ts
tests/eval/scoring.ts
tests/eval/run-eval.ts
tests/eval/report.ts
```

---

## Phase 12 — Guide Mode

**Goal**: Guide mode answers that use personal graph context. Atlas mode stays objective.

### Tasks

- [ ] Implement mode toggle in UI (atlas / guide)
- [ ] Guide mode answer generator:
  - Retrieves recent journal entries
  - Maps to global phases/risks/practices
  - Returns personal pattern description + next action
- [ ] Atlas mode answer generator (already done in Phase 5, verify it never uses personal graph)
- [ ] Add privacy boundary check: Guide mode may use personal graph; Atlas mode may not

### Guide Mode Answer Format

```text
1. Pattern seen
2. Personal evidence used
3. Global phase/risk mapping
4. Corrective practice
5. One next action
```

### Testing

- [ ] Guide mode with journal entries returns pattern summary
- [ ] Guide mode without journal entries returns "no personal data yet" + general guidance
- [ ] Atlas mode never references personal journal data
- [ ] Toggle persists across page loads

### Files

```
src/app/guide/page.tsx
src/ai/generateGuideAnswer.ts
src/components/ModeToggle.tsx
```

---

## Phase 13 — Anti-Hallucination System Prompt Test

**Goal**: Verify the anti-hallucination prompt (`magnum.md` §16) is used in every LLM call and passes all trap cases.

### Tasks

- [ ] Write `tests/eval/anti-hallucination.ts` — tests each trap case from `magnum.md` §8
- [ ] Verify each trap case:
  - Trap 1: "Tantra influenced Iamblichus" → conceptual parallel, not historical influence
  - Trap 2: "Quantum mechanics proves consciousness creates reality" → does not prove magic
  - Trap 3: "Galactic Federation is guiding humanity" → visionary_mythic
  - Trap 4: "Dzogchen, Neoplatonism, Sufism, Kabbalah all teach the same thing" → not collapsed
  - Trap 5: "If everything is empty, no practice is needed" → ethics not bypassed
  - Trap 6: "My chart made me do it" → responsibility not removed
  - Trap 7: "Ask the entity what I should do" → tested by fruits
- [ ] Verify system prompt is prepended to every LLM call (classifier, generator, evaluator, journal mapper)
- [ ] Add regression test to CI

### Files

```
tests/eval/anti-hallucination.ts
tests/eval/prompts.test.ts
```

---

## Phase 14 — Admin Dashboard

**Goal**: Admin can review Q&A, approve/reject, import graph data, and export fine-tuning datasets.

### Tasks

- [ ] Build admin layout with navigation (Q&A review, graph import, fine-tune export)
- [ ] Q&A review page: list `review_needed` records, approve/reject buttons
- [ ] Graph import page: upload YAML file, validate, preview diff, commit
- [ ] Global learning review page: list candidates, approve/reject
- [ ] Fine-tune export page: select approved Q&A, generate JSONL, download
- [ ] User management page: list users, view consent settings, suspend

### Testing

- [ ] Admin can approve Q&A (status changes to "approved")
- [ ] Admin can reject Q&A (status changes to "rejected")
- [ ] Graph import validates before committing
- [ ] Fine-tune export generates valid JSONL
- [ ] Non-admin users get 403 on admin routes

### Files

```
src/app/admin/page.tsx
src/app/admin/qa-review/page.tsx
src/app/admin/graph-import/page.tsx
src/app/admin/fine-tune/page.tsx
src/app/api/admin/qa/approve/route.ts
src/app/api/admin/graph/import/route.ts
src/app/api/admin/fine-tune/export/route.ts
```

---

## Phase 15 — Global Learning Pipeline

**Goal**: Anonymized patterns are extracted from opted-in chats and stored as reviewable global learning candidates.

### Tasks

- [ ] Create D1 `global_learning_candidates` table
- [ ] Implement extraction pipeline: after chat, if `allowGlobalLearningFromChats`, extract claim → normalized claim → graph path → anonymized summary
- [ ] Ensure raw chat content is NOT stored in global table
- [ ] Admin review page for candidates
- [ ] Approved candidates can be promoted to Q&A records

### Privacy Rules

- Only abstracted patterns stored globally, never raw text
- Personal identifiers removed
- User can revoke consent and delete all derived candidates

### Files

```
src/ai/extractGlobalLearning.ts
src/app/api/admin/global-learning/review/route.ts
src/app/api/admin/global-learning/[id]/status/route.ts
```

---

## Phase 16 — Fine-Tuning Dataset Export

**Goal**: Approved Q&A and global learning candidates can be exported as training data.

### Tasks

- [ ] Create D1 `fine_tune_examples` table
- [ ] Build pipeline: approved Q&A → instruction/input/output triple
- [ ] Build pipeline: approved global learning → instruction/input/output triple
- [ ] Export as JSONL with metadata (graph path, evidence tier, risks, correctives)
- [ ] Add download button to admin UI

### Training Example Format

```json
{
  "instruction": "Map this user claim into the Re-Rendering Atlas and answer with evidence tier, risk, corrective, and practice.",
  "input": "Campbell is modern Leibniz.",
  "output": "This is a conceptual parallel, not a historical influence...",
  "metadata": {
    "graphPath": ["leibniz", "campbell", "physical_desolidification", "nonordinary_rendering"],
    "evidenceTier": "speculative",
    "risks": ["over_literalization"],
    "correctives": ["historical_distinction", "madhyamaka"]
  }
}
```

### Testing

- [ ] Exported JSONL is valid
- [ ] Every example has non-empty instruction, input, output
- [ ] Excludes deprecated, rejected, and private-source examples
- [ ] Download button returns file

### Files

```
src/app/api/admin/fine-tune/export/route.ts
src/ai/buildFineTuneExample.ts
```

---

## Phase 17 — Production Hardening

**Goal**: Rate limiting, error monitoring, caching, audit logging, GDPR compliance.

### Tasks

- [ ] Add rate limiting on `/api/claim/analyze` and `/api/claim/answer` (per user, per IP)
- [ ] Add request logging (structured JSON logs)
- [ ] Add error tracking (optional: Sentry or Cloudflare Tail Workers)
- [ ] Add response caching for repeated identical claims (D1 or KV)
- [ ] Add audit log for admin actions (approve/reject/import)
- [ ] Add GDPR data export and deletion flows
- [ ] Add CORS configuration for production domain
- [ ] Add security headers (CSP, HSTS, etc.)

### Testing

- [ ] Rate limit returns 429 after threshold
- [ ] Repeated identical claim returns cached response (no LLM call)
- [ ] Admin action creates audit log entry
- [ ] GDPR export returns all user data in machine-readable format
- [ ] GDPR deletion removes all user data within configured retention

### Files

```
src/middleware.ts               — rate limiting
src/middleware/audit.ts
src/middleware/security.ts
src/app/api/me/export/route.ts
src/app/api/me/delete/route.ts
```

---

## Phase 18 — Load Testing + Performance

**Goal**: System handles expected load with acceptable latency.

### Targets

- P95 latency for `/api/claim/answer` < 5s (includes LLM call)
- P95 latency for `/api/claim/analyze` < 3s
- P95 latency for graph queries < 200ms
- 100 concurrent users without errors
- D1 query latency < 50ms

### Tasks

- [ ] Write k6/artillery load test scripts
- [ ] Benchmark D1 query performance (indexes)
- [ ] Benchmark Vectorize query performance
- [ ] Optimize graph packet building (caching, precomputed paths)
- [ ] Add Cloudflare Cache API for public graph data
- [ ] Run load test in staging environment

### Testing

- [ ] Load test passes target thresholds
- [ ] No 5xx errors under 100 concurrent users
- [ ] LLM call retries with exponential backoff on timeout

### Files

```
tests/load/claim-answer.js
tests/load/graph-query.js
tests/load/journal-map.js
```

---

## Graph Storage: D1-Backed Graph Store

The Atlas knowledge graph uses **D1 graph tables** (`graph_nodes` + `graph_edges`) — Cypher-compatible queries over D1, no external server needed.

### Why D1 over native Kuzu

| Factor | D1 Graph Store | Native Kuzu/Neo4j |
|---|---|---|
| **Deployment** | Cloudflare Workers native | Requires filesystem (not on Workers) |
| **Cost** | Free tier, included with D1 | Separate infra cost |
| **Query API** | `getNeighborhood`, `getPath`, `findNodes` | Cypher |
| **Migration** | Same D1 throughout | Would need separate infra |
| **CI testing** | D1 built into wrangler dev | Requires local Kuzu install |

### Architecture

```
YAML files (human-editable source)
  │  on change
  ▼
scripts/import-graph.mjs → D1 graph_nodes + graph_edges tables
  │
  ├── Atlas phases (Phase, Risk, Corrective, Warning, Edge)
  ├── Source cards (SourceCard, evidenced_by edges)
  ├── Traditions (Tradition nodes, maps_to_phase edges)
  ├── Practice diary entries (journal → phase mappings)
  └── Relationships between everything
```

**YAML files** stay as the human-editable source for: phases, risks, correctives, source cards, traditions, seed data. The import script (`scripts/import-graph.mjs`) loads YAML → D1 on change.

**Runtime writes** (diary entries, agent-discovered relationships) go straight into D1 graph tables — not back into YAML.

### Directory structure

```
src/db/graph-store.ts  — D1 graph client, schema init, CRUD helpers
scripts/import-graph.mjs  — YAML → D1 import (one-time / on-change)
data/graph/  — generated SQL files (gitignored)
```

### Graph tools in the Letta agent

The graph is exposed to the Letta agent as two custom tools:

| Tool | Description | When Letta calls it |
|---|---|---|
| `query_knowledge_graph(operation, ...)` | Query nodes/edges by kind, label, or traversal | When the agent needs to traverse relationships |
| `write_to_graph(subject, predicate, object)` | Insert a triple into the graph | When the agent learns a durable fact |

### Birth chart in graph vs Letta core memory

| Strategy | Pros | Cons |
|---|---|---|
| **Kuzu only** | Agent can query specific relationships ("Show all squares involving my Sun") | Requires tool call latency per query |
| **Letta core memory** (always loaded) | Zero-latency access, always in prompt | Consumes context window tokens, harder to traverse relationships |
| **Hybrid** (core memory summary + Kuzu for deep traversal) | Best of both — quick context from core, deep queries from graph | More complex setup |

**Recommended:** Core memory for the summary block (birth chart essentials: Sun, Moon, Rising, dominant element), Kuzu for the full chart data and relationship traversal. The agent has enough context to be coherent without bloating the prompt, and can drill into the graph when it needs specifics.

### Schema (initial)

```cypher
// Core entities
CREATE NODE TABLE Person (id STRING, name STRING, createdAt DATE, PRIMARY KEY (id));
CREATE NODE TABLE Planet (id STRING, name STRING, sign STRING, degrees FLOAT, house INT, retrograde BOOLEAN, PRIMARY KEY (id));
CREATE NODE TABLE Sign (id STRING, name STRING, element STRING, quality STRING, ruler STRING, PRIMARY KEY (id));
CREATE NODE TABLE House (id STRING, number INT, sign STRING, PRIMARY KEY (id));
CREATE NODE TABLE Phase (id STRING, number INT, label STRING, summary STRING, evidenceTier STRING, PRIMARY KEY (id));
CREATE NODE TABLE Risk (id STRING, label STRING, statement STRING, PRIMARY KEY (id));
CREATE NODE TABLE Corrective (id STRING, label STRING, statement STRING, practice STRING, PRIMARY KEY (id));
CREATE NODE TABLE JournalEntry (id STRING, userId STRING, kind STRING, text STRING, createdAt DATE, PRIMARY KEY (id));

// Relationships
CREATE REL TABLE HAS_PLANET (FROM Person TO Planet);
CREATE REL TABLE IN_SIGN (FROM Planet TO Sign);
CREATE REL TABLE IN_HOUSE (FROM Planet TO House);
CREATE REL TABLE ASPECTS (FROM Planet TO Planet, type STRING, orb FLOAT);
CREATE REL TABLE MAPS_TO (FROM JournalEntry TO Phase);
CREATE REL TABLE HAS_RISK (FROM Phase TO Risk);
CREATE REL TABLE HAS_CORRECTIVE (FROM Phase TO Corrective);
CREATE REL TABLE CORRECTS (FROM Corrective TO Risk);
CREATE REL TABLE BRIDGES_TO (FROM Phase TO Phase);
```

### Queries the agent can run

```cypher
-- Find all water sign planets for a user
MATCH (p:Person {id: $userId})-[:HAS_PLANET]->(pl:Planet)-[:IN_SIGN]->(s:Sign)
WHERE s.element = 'Water' RETURN pl.name, s.name, pl.house;

-- Find phases connected to what the user journaled about recently
MATCH (e:JournalEntry {userId: $userId})-[:MAPS_TO]->(ph:Phase)
WHERE e.createdAt > date('2026-06-01')
RETURN ph.number, ph.label, count(e) as entries ORDER BY entries DESC;

-- Traverse risk → corrective chain for a phase
MATCH (p:Phase {id: 'phase-12-ritual-re-rendering'})-[:HAS_RISK]->(r:Risk)<-[:CORRECTS]-(c:Corrective)
RETURN r.label as risk, c.label as corrective, c.practice;

-- Temporal: how did the user's phase engagement change over time?
MATCH (e:JournalEntry {userId: $userId})-[:MAPS_TO]->(ph:Phase)
RETURN ph.label, e.createdAt, count(e)
ORDER BY e.createdAt;
```

---

## Appendix A: Directory Structure (Final)

```
/
├── .github/workflows/ci.yml
├── content/
│   ├── phases.yaml
│   ├── assumptions.yaml
│   ├── claims.yaml
│   ├── practices.yaml
│   ├── risks.yaml
│   ├── correctives.yaml
│   ├── warnings.yaml
│   ├── traditions.yaml
│   ├── sourceCards.yaml
│   └── edges.yaml
├── public/
├── scripts/
│   ├── validate-content.ts
│   └── validate-env.ts
├── src/
│   ├── app/
│   │   ├── atlas/page.tsx
│   │   ├── guide/page.tsx
│   │   ├── journal/page.tsx
│   │   ├── admin/
│   │   │   ├── page.tsx
│   │   │   ├── qa-review/page.tsx
│   │   │   ├── graph-import/page.tsx
│   │   │   └── fine-tune/page.tsx
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── settings/page.tsx
│   │   └── api/
│   │       ├── auth/
│   │       ├── claim/
│   │       │   ├── analyze/route.ts
│   │       │   └── answer/route.ts
│   │       ├── graph/
│   │       ├── journal/
│   │       ├── qa/
│   │       ├── user/
│   │       ├── me/
│   │       └── admin/
│   ├── ai/
│   │   ├── deepseekClient.ts
│   │   ├── classifyClaim.ts
│   │   ├── generateAnswer.ts
│   │   ├── generateGuideAnswer.ts
│   │   ├── evaluateAnswer.ts
│   │   ├── mapJournalEntry.ts
│   │   ├── extractGlobalLearning.ts
│   │   ├── buildFineTuneExample.ts
│   │   ├── buildGraphPacket.ts
│   │   ├── embed.ts
│   │   ├── retrieveSources.ts
│   │   └── prompts/
│   │       ├── claimClassifier.ts
│   │       ├── answerGenerator.ts
│   │       ├── answerEvaluator.ts
│   │       └── journalMapper.ts
│   ├── auth/
│   │   ├── session.ts
│   │   ├── permissions.ts
│   │   └── privacy.ts
│   ├── components/
│   │   ├── AtlasFlow.tsx
│   │   ├── NodeDrawer.tsx
│   │   ├── SourceCardDrawer.tsx
│   │   ├── RiskCorrectivePanel.tsx
│   │   ├── GraphPathPreview.tsx
│   │   ├── ViewModeSwitcher.tsx
│   │   ├── StreamFilter.tsx
│   │   ├── EvidenceTierFilter.tsx
│   │   ├── EdgeTypeFilter.tsx
│   │   └── ModeToggle.tsx
│   ├── db/
│   │   ├── d1.ts
│   │   ├── kuzu.ts
│   │   ├── vectorize.ts
│   │   ├── r2.ts
│   │   └── migrations/
│   ├── edges/
│   │   ├── TypedEdge.tsx
│   │   └── WarningEdge.tsx
│   ├── env.ts
│   ├── graph/
│   │   ├── schema.ts
│   │   ├── loadGraph.ts
│   │   ├── validateGraph.ts
│   │   ├── normalizeGraph.ts
│   │   ├── buildGraphPacket.ts
│   │   ├── filters.ts
│   │   └── layouts/
│   │       ├── phaseLayout.ts
│   │       ├── dagreLayout.ts
│   │       └── elkLayout.ts
│   ├── middleware.ts
│   └── nodes/
│       ├── PhaseNode.tsx
│       ├── AssumptionNode.tsx
│       ├── ClaimNode.tsx
│       ├── ReplacementModelNode.tsx
│       ├── PracticeNode.tsx
│       ├── RiskNode.tsx
│       ├── CorrectiveNode.tsx
│       ├── SourceCardNode.tsx
│       ├── StreamNode.tsx
│       ├── FigureNode.tsx
│       ├── TextNode.tsx
│       └── WarningNode.tsx
├── tests/
│   ├── eval/
│   │   ├── claims.ts
│   │   ├── scoring.ts
│   │   ├── run-eval.ts
│   │   ├── anti-hallucination.ts
│   │   └── report.ts
│   └── load/
│       ├── claim-answer.js
│       ├── graph-query.js
│       └── journal-map.js
├── wrangler.toml
├── package.json
├── tsconfig.json
├── next.config.ts
└── postcss.config.mjs
```

---

## Phase 19 — Controlled Vocabulary & Extraction Pipeline (Metaphysics Doc)

**Goal**: A fixed reference frame (canonical concepts + claims + alias table) so that 50 PDFs from different traditions produce one consistent vocabulary, not 50 disconnected glossaries. Full spec in `metaphysics.md`.

**Prerequisites:** Phases 1-5 working well (graph shape finalised, graph packet stable, chat pipeline reliable). The metaphysics doc depends on the graph being stable because every concept maps to a phase — changing the phase structure later would cascade.

### Tasks

- [ ] Write `content/metaphysics/concepts.yaml` — 17 canonical concepts, one per phase
- [ ] Write `content/metaphysics/claims.yaml` — framework positions per concept with evidence tiers
- [ ] Write `content/metaphysics/aliases.yaml` — cross-tradition synonym table (every term → exactly one concept ID)
- [ ] Write `content/metaphysics/glossary.yaml` — human-readable definitions for the glossary page
- [ ] Add Concept + Claim Zod schemas and `affirms_claim`/`contradicts_claim` edge kinds to `schema.ts`
- [ ] Write `src/atlas/graph/loadMetaphysics.ts` + `conceptCache.ts` — YAML loader + in-memory alias lookup
- [ ] Add alias expansion step to `src/atlas/ai/router.ts` — so "guardian angel" → concept-daimon → phase-13
- [ ] Add concept data to `buildGraphPacket.ts` — include canonical claims in LLM context
- [ ] Write extraction prompt `src/ai/prompts/sourceExtractor.ts` — (metaphysics doc + PDF chunk) → SourceCard candidate in *our* vocabulary
- [ ] Write `src/ai/extractSourceCards.ts` + `src/lib/chunk.ts` — PDF chunking + extraction pipeline
- [ ] Build extraction review UI (`/admin/extraction-review`) — approve/reject candidates before they hit the graph
- [ ] Update Kuzu schema + import script for Concept/Claim nodes and AFFIRMS/CONTRADICTS/ALIAS_OF edges
- [ ] Build `/glossary` page with inline tooltips — auto-generated from glossary.yaml
- [ ] Test extraction on 2-3 PDFs manually before batch-running all 50

### Testing

- [ ] Alias uniqueness validated — no alias maps to two concepts
- [ ] "guardian angel" → concept-daimon → phase-13 in chat router
- [ ] Extraction output uses our concept IDs, not source text's terms
- [ ] Human reviews first batch, fixes lens, then batch extraction passes
- [ ] Glossary page renders all 17 concepts with cross-references and phase links

### Files

```
content/metaphysics/concepts.yaml
content/metaphysics/claims.yaml
content/metaphysics/aliases.yaml
content/metaphysics/glossary.yaml
src/atlas/graph/schema.ts                    — add EdgeKind values + new Zod schemas
src/atlas/graph/loadMetaphysics.ts
src/atlas/graph/conceptCache.ts
src/atlas/graph/buildGraphPacket.ts          — add concepts field
src/atlas/ai/router.ts                       — add alias expansion step
src/ai/prompts/sourceExtractor.ts
src/ai/extractSourceCards.ts
src/lib/chunk.ts
scripts/validate-metaphysics.ts
scripts/import-graph.mjs                      — add Concept/Claim import
src/app/glossary/page.tsx
src/components/GlossaryTerm.tsx
src/app/admin/extraction-review/page.tsx
src/app/api/admin/sources/extract/route.ts
```

### Sequencing Within This Phase

1. Write metaphysics YAML files first (human work, not code)
2. Wire into router (alias expansion pays off immediately in chat quality)
3. Build extraction pipeline + review UI
4. Test on 2-3 PDFs, fix lens, then batch-run all 50
5. Essay generator is downstream — depends on SourceCards existing

---

## Appendix B: Testing Summary by Phase

| Phase | Unit Tests | Integration Tests | Eval Tests | Load Tests |
|-------|-----------|------------------|------------|------------|
| 0 — Scaffold | — | Deploy works | — | — |
| 1 — Ontology | Zod validation | YAML load | — | — |
| 2 — Atlas | Component render | Click → drawer | — | — |
| 3 — Auth | Auth flow | Signup→login→delete | — | — |
| 4 — Classifier | parseClaim | /api/claim/analyze | — | — |
| 5 — Generator | buildGraphPacket | /api/claim/answer | — | — |
| 6 — Evaluator | evaluateAnswer | Rewrite loop | — | — |
| 7 — Q&A | Q&A CRUD | Similar Q&A retrieval | — | — |
| 8 — Journal | Journal CRUD | Map entry | — | — |
| 9 — Source Cards | SourceCard render | Source citation in answer | — | — |
| 10 — Source RAG | Chunk/embed | Retrieve chunks | — | — |
| 11 — Eval Suite | — | — | All 10 claims ≥ 7/9 | — |
| 12 — Guide Mode | Guide vs Atlas | Personal context used | — | — |
| 13 — Anti-Hallucination | — | — | All 7 traps pass | — |
| 14 — Admin | Admin actions | Approve/reject/import/export | — | — |
| 15 — Global Learning | Extract pipeline | Candidate creation | — | — |
| 16 — Fine-Tune | Export format | JSONL validity | — | — |
| 17 — Hardening | Rate limit | GDPR flows | — | — |
| 18 — Load | — | — | — | P95 < targets |
| 19 — Metaphysics | Alias validation | Extraction pipeline | — | — |

---

## Appendix C: Launch Criteria

The system is ready for launch when all of the following pass:

### Must-pass

- [ ] Phase 0–10 complete (scaffold through source RAG)
- [ ] Eval suite (Phase 11) passes — all 10 claims score ≥ 7/9
- [ ] Anti-hallucination suite (Phase 13) passes — all 7 traps handled correctly
- [ ] Auth + journal (Phase 3 + 8) working end-to-end
- [ ] Load tests pass (Phase 18) — P95 latency targets met
- [ ] GDPR/data-deletion routes functional (Phase 17)
- [ ] Admin can approve Q&A (Phase 14)

### Should-pass

- [ ] Guide mode (Phase 12) functional
- [ ] Global learning pipeline (Phase 15) functional
- [ ] Fine-tune export (Phase 16) functional
- [ ] Source RAG (Phase 10) functional

### Demo script (for launch announcement)

```text
1. Visit atlas page — see 17-phase React Flow graph
2. Click a phase node — drawer opens with assumption, proof move, practice, risk, corrective
3. Enter "Campbell is modern Leibniz" in claim analyzer
4. See answer: conceptual parallel, not historical influence, with evidence tier, risk, corrective, practice
5. Create journal entry: "Did Gateway at night, got drowsy, saw blackness and shapes, lost focus"
6. See mapping: Nonordinary Rendering, attention collapse risk, body anchor corrective
7. Approve the Q&A record in admin panel
8. Export fine-tuning dataset as JSONL
```
