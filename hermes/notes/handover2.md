# Handover 2 — Full Codebase Context for Hermes Integration

This document records the complete journey of understanding the astrology engine, the Hermes agent integration plan, critical bugs found and fixed, and what comes next.

Every future agent MUST read this entire document before modifying any code. This is the master orientation.

---

## 1. How to Understand This Codebase (Required Reading Order)

The astrology engine has 32 files (~7,000 LOC). DO NOT read them all at once. Read in this order:

### Step 1: Architecture Overview

Start with these docs (they cover the same ground at different detail levels):

| Document | What it covers | Read first? |
|---|---|---|
| `handover.md` | Core principles, architecture overview, key files, fragile parts | ✅ YES — start here |
| `handover2.md` (this file) | Hermes integration context, bugs found, roadmap | ✅ YES — read second |
| `hermes-architecture.md` | API specs, plugin structure, Phase 1-3 build order | ✅ YES — read third |
| `astrologyref.md` | Complete reference: every file, timing weights, source texts | ✅ When you need specifics |
| `review.md` | Codebase audit: 8 critical issues, 20 recommendations | ✅ When you need to know what's broken |
| `src/astrology/ENGINE_SPEC.md` | Quantitative engine spec: graph model, scoring formulas | ✅ When you need to understand the math |

### Step 2: The Engine Layers (Read in this exact order)

```
Layer 1: types.ts          → All shared types (308 lines)
Layer 2: caelus_adapter.ts → Chart normalization (161 lines)
Layer 3: activation_engine.ts → Timing + scoring + conditions (670 lines) — **core logic, read carefully**
Layer 4: activation_packet.ts → Pure signal packet (214 lines) — **the contract between layers**
Layer 5: oikodespotes.ts   → Personal daimon (99 lines)
Layer 6: daily_sphere_reader.ts → Full reading assembler (141 lines)
Layer 7: synthesis.ts      → Narrative synthesis (410 lines)
```

### Step 3: Interpretation & Knowledge Layers

```
interpretation_schema.ts → 5-interpreter orchestration + convergence (268 lines)
interpreters/aggregator.ts → Macro translation — preserves ALL engine data (340 lines)
interpreters/demetra.ts → Demetra George generative interpreter (132 lines)
knowledge_graph.ts → In-memory graph with shared entity IDs (390 lines)
```

### Step 4: Spellbook & Correspondences

```
spellbook/spellbook.ts → 30+ practices + query engine + graph registration (768 lines)
spellbook/correspondences.ts → All planetary correspondence tables (332 lines)
spellbook/types.ts → SpellEntry, SpellbookQuery types (116 lines)
spellbook/validate.ts → Validation script for spell entries (116 lines)
```

### Step 5: Source Data & References

```
source_rules.ts → 117 rules from Valens + al-Khayyāt (254 lines)
planet_profiles.ts → 7 planet profiles (127 lines)
ritual_references.ts → 28 ritual references (236 lines)
```

### Step 6: LLM Layer

```
llm-synthesis.ts → LLM prompt builder + multi-endpoint API calling (286 lines)
ficino-synthesis.ts → Ficinian depth pass (161 lines)
```

### Step 7: The API Routes (the bridge to Hermes)

```
src/app/api/astrology/today/route.ts → POST /api/astrology/today (194 lines)
src/app/api/astrology/graph/route.ts → GET /api/astrology/graph (58 lines)
src/app/api/astrology/snapshot/route.ts → POST/GET /api/astrology/snapshot (77 lines)
```

---

## 2. Architecture Summary (7-Layer Pipeline)

```
BIRTH DATA + TIME
  ↓ L1: caelus → NormalizedChart
  ↓ L2: activation_engine.ts → ActivationResult (timing, scoring, conditions, confidence)
  ↓ L3: activation_packet.ts → ActivationPacket (pure signals, NO interpretation)
  ↓ L4: daily_sphere_reader.ts → DailySphereReading (adds profiles, rituals, alignment)
  ↓ L5: interpretation_schema.ts → InterpretedReading (5 interpreters + convergence)
  ↓ L6: knowledge_graph.ts → pushActivationToGraph + clusterByPlanet + graphRecommend
  ↓ L7: synthesis.ts → DailySynthesis (narrative text)
```

### Core Principles (DO NOT VIOLATE)

1. **Deterministic Engine Core**: Same input → same output. NO LLM, NO randomness in `activation_engine.ts`, `activation_packet.ts`, or `daily_sphere_reader.ts`.
2. **Packet Before Prose**: `ActivationPacket` is complete BEFORE any interpretation or LLM. The packet is the product. Prose is just a renderer.
3. **Engine ↔ Interpretation Separation**: Engine produces pure signals. Interpretation reads those signals. Engine NEVER imports interpretation data.
4. **Shared Entity IDs**: Every entity uses `planet:mars`, `sign:leo`, `house:1` format. NEVER use `"mars"` in one file and `"planet:mars"` in another.
5. **Nothing Is Lost Between Layers**: Macro translation preserves EVERY field. Never summarize structured data.
6. **Pipeline Isolation**: `src/pipeline/` imports from engine, but engine never imports from pipeline. The pipeline is excluded from TypeScript config.

---

## 3. The 3 API Routes (Built, Uncommitted as of July 2026)

These are in `src/app/api/astrology/` — currently untracked files that need to be committed.

### `POST /api/astrology/today`

**Input:** `{ year, month, day, hour, minute, lat, lon, name?, timezone? }`

**What it does:**
1. Creates `Engine` from caelus, computes chart via `normalizeChart()`
2. Computes planet conditions, oikodespotes, firdaria, profections, ZR
3. Builds `ActivationPacket` → `DailySphereReading` → interpretation (5 interpreters) → macro translation
4. Queries knowledge graph for correspondences/practices per planet
5. Returns JSON: chart, oikodespotes, signals, interpretation (all 5 systems + convergence + macro), graph data, stats

**Critical: The `currentSkyAspects` are now properly computed via `findSkyAspects()` and passed to the engine. The `age` is now correctly forwarded to `buildMacroTranslation()`. Both were broken before the July 2026 fixes.**

### `GET /api/astrology/graph`

**Query params:** `?id=planet:mars` | `?planet=mars` | `?type=all` | `?type=layers` | `?type=correspondences&planet=mars`

**What it does:** Traverses the in-memory knowledge graph. Returns nodes + edges for the query.

### `POST/GET /api/astrology/snapshot`

**POST:** Saves a daily reading snapshot to D1 `astrology_snapshots` table. Requires Cloudflare D1 binding. Graceful fallback in dev mode.

**GET:** Retrieves snapshots by `?user_id=` with optional `?days=` lookback (default 7, max 90).

---

## 4. Critical Issues Found and Fixed

These were discovered during the July 2026 codebase audit. All have been fixed.

| # | Issue | File | Fix Applied |
|---|---|---|---|
| 1 | **Hardcoded `age: 27`** | `aggregator.ts:322` | Added `age?: number` parameter to `buildMacroTranslation()`. Route now computes actual age and passes it. |
| 2 | **`require()` calls instead of static imports** | `knowledge_graph.ts:222,240` | Converted to top-level static imports for `source_rules` and `planet_profiles`. These TS modules were silently failing on Cloudflare Workers. |
| 3 | **`require()` calls swallow errors** | `spellbook.ts:706,721,733` | JSON catalog loading keeps `require()` but now logs warnings on failure instead of silently swallowing. |
| 4 | **Sky aspects scored after signals** | `activation_engine.ts:527-535` | Moved sky aspect push to BEFORE signal scoring so they contribute to signal scores. |
| 5 | **`currentSkyAspects: []` in API route** | `today/route.ts:70` | Route now computes real sky aspects via `findSkyAspects()` and passes them to the engine. |

### Issues Still Open (P1 — Fix Before Production)

| # | Issue | Location | Impact |
|---|---|---|---|
| 1 | **Graph is module-level singleton** | `knowledge_graph.ts:377-386` | Shared across all requests in same Worker isolate. Concurrent requests corrupt each other's data. Need request-scoped graph or proper isolation. |
| 2 | **Duplicate correspondence entries** | `correspondences.ts:87-93, 151-157` | Days-of-week and numbers duplicated with different citations. Graph overwrites silently. |
| 3 | **Planetary hours hardcoded at lat=0** | `synthesis.ts:373` | Ignores user latitude. Not currently called by API route (client-side only), but Hermes might need it. |
| 4 | **Yesterday comparison never wired** | `aggregator.ts:282-284` | Parameter exists but never populated. The snapshot route provides historical data but no delta computation exists. |
| 5 | **No auth on astrology endpoints** | Three API routes | No authentication. Any caller can hit these endpoints. Need API key or session auth for public deployment. |

---

## 5. What Is Hermes Agent?

Hermes Agent (Nous Research, MIT license, v0.18.2+) is an open-source autonomous agent runtime. It is NOT part of the Cloudflare site — it runs on a separate VPS (or Modal, or locally) and talks to the site via HTTP API.

### Key Architecture Points

| Component | Location | Purpose |
|---|---|---|
| Hermes Core | VPS (`/usr/local/bin/hermes`) | Agent runtime with LLM, memory, cron, tools |
| Skills | `~/.hermes/skills/` | Instructions + shell commands + existing tools. Created as SKILL.md files. |
| Plugins | `~/.hermes/plugins/` | Python code for custom tool integrations (API key mgmt, auth flows, etc.) |
| Blueprints | Skill with `blueprint:` frontmatter | Skills that are also cron automations (scheduled, deliverable) |
| Memory | `~/.hermes/memories/` | MEMORY.md (agent notes), USER.md (user profile), session_search |
| Cron | `~/.hermes/cron/` | Scheduled jobs that run blueprints |

### Skills vs Tools When to Use

From the official docs:

**Make it a SKILL when:**
- The capability can be expressed as instructions + shell commands + existing tools
- It wraps an external CLI or API
- It doesn't need custom Python integration or API key management
- Example: "Call /api/astrology/today, parse the JSON, format as daimonic insight"

**Make it a TOOL when:**
- It requires end-to-end API key/auth flow integration
- It needs custom processing logic precise every time
- It handles binary data, streaming, or real-time events

### Blueprint Format

A skill becomes a cron-able automation by adding `metadata.hermes.blueprint`:

```yaml
metadata:
  hermes:
    tags: [blueprint, astrology]
    blueprint:
      schedule: "0 6 * * *"    # cron expr
      deliver: telegram          # where output goes
      prompt: "Fetch today's astrology reading and write a daimonic insight."
```

---

## 6. The Hermes Integration Plan

### Phase 1 — Foundation (Current)

**Status:** ✅ API routes built. 🔲 Everything else unstarted.

```
1. ✅ API endpoints (today, graph, snapshot)
2. 🔲 Fix critical bugs (DONE — see section 4)
3. 🔲 Hermes plugin (atlas-astrology) with 4 tools:
   - astrology.py → wraps POST /api/astrology/today
   - graph.py → wraps GET /api/astrology/graph
   - journal.py → wraps GET/POST /api/journal
   - snapshot.py → wraps POST/GET /api/astrology/snapshot
4. 🔲 Test each tool against the API
5. 🔲 First skill: daily-daimon (SKILL.md with blueprint)
```

**The skills we need to build:**

| Skill | Trigger | What it does | Output target |
|---|---|---|---|
| `daily-daimon` | Cron 6am | Calls `/api/astrology/today`, extracts daimon planet, writes paragraph | Telegram |
| `ficino-interpreter` | Manual | Calls `/api/astrology/today`, applies Ficinian lens to the packet | Chat |
| `advanced-analysis` | Manual | Calls `/api/astrology/today`, uses gold-standard-level LLM analysis | Chat/essay |
| `valens-timing` | Manual | Timing analysis from packet signals | Chat |
| `graph-explorer` | Manual | Traverse graph for correspondences/practices | Chat |
| `life-review` | Cron weekly | Aggregates historical snapshots into weekly review | Telegram |

### Phase 2 — Daily Operations

```
6. Wire Telegram delivery
7. Memory integration (store observations after each reading)
8. Build ficino-interpreter skill
9. Build life-review skill (weekly aggregation)
10. Fix planetary hours (lat/lon-based sunrise computation)
11. Wire yesterday comparison from D1 snapshots
```

### Phase 3 — Advanced Operations

```
12. LangGraph subgraphs on Workers
13. Pattern detection across snapshots
14. Proactive alerts (convergence events)
15. Essay pipeline integration
16. Auth layer for API endpoints
17. Caching layer (memoize by birth data hash + date)
```

---

## 7. Gold Standard Target Quality

The file `content/astrology/GOLD_STANDARD.md` defines the target quality for Hermes output. Key techniques the deterministic engine does NOT yet compute:

| Technique | Status | Needed for gold standard? |
|---|---|---|
| Dispositorship chain | Not implemented | ✅ High impact |
| Temperament diagnosis | Not implemented | ✅ Moderate |
| Natal aspects with exact orbs | Data exists, not surfaced | ✅ High impact |
| Egyptian bounds/terms surfaced | Computed internally, not exposed | ✅ Low effort |
| Solar return overlay | Not implemented | ❌ Future |
| ZR sub-period levels (L1/L2) | Only top-level lord used | ✅ Moderate |
| Year divided into chapters | Not implemented | ❌ Future |

The LLM synthesis (`llm-synthesis.ts`) already has a system prompt adapted from the "Advanced Astrological Forecasting Guide" and "Ficinian Astrology Operating System" docs. The two-pass architecture (Pass 1: Advanced Forecasting → Pass 2: Ficinian Depth) exists in the code but the LLM endpoint needs the `DEEPSEEK_API_KEY` configured.

Hermes can skip the "Generate Deep Analysis" button pattern and instead call the LLM directly with the packet data. The `llm-synthesis.ts` module shows the exact packet format the LLM expects.

---

## 8. Deployment Architecture

```
User's Browser                Cloudflare Workers                VPS (Hermes)
┌──────────────┐              ┌─────────────────────┐          ┌──────────────┐
│ caelus engine │  client-side │ POST /api/astrology/today │ ←→ │ astrology.py │
│ (JS bundle)   │  computation │ GET /api/astrology/graph  │ ←→ │ graph.py     │
│ page.tsx      │              │ POST /api/astrology/snapshot│←→ │ snapshot.py  │
│              │              │ POST /api/journal          │ ←→ │ journal.py   │
└──────────────┘              │ D1 Database                │          │
                              └─────────────────────┘          │ Skills:     │
                                                               │ daily-daimon│
                                                               │ ficino-int  │
                                                               │ telegram    │
                                                               └──────────────┘
```

The deterministic engine runs on Cloudflare Workers (server-side via the API routes). The UI page at `/astrology` runs the engine client-side — these are two separate paths that produce the same output. The API routes exist specifically for Hermes to consume.

Hermes does NOT need the client-side UI. It ONLY calls the API endpoints. The skills are instructions telling Hermes which endpoints to call and how to process the JSON response.

---

## 9. Complete Hermes Skill Inventory

All skills have been created as SKILL.md files in the `hermes/` directory of this project.

### Plugin: `hermes/plugins/atlas-astrology/`

| File | Tool | API Endpoint |
|---|---|---|
| `plugin.yaml` | Manifest | — |
| `__init__.py` | Tool registration | — |
| `schemas.py` | Shared types | — |
| `tools/astrology.py` | `astrology_tool()` | POST `/api/astrology/today` |
| `tools/graph.py` | `graph_traverse()` | GET `/api/astrology/graph` |
| `tools/journal.py` | `journal_write()` | POST `/api/journal` |
| `tools/snapshot.py` | `snapshot_save()`, `snapshot_list()` | POST/GET `/api/astrology/snapshot` |

### Skills: `hermes/skills/`

**Daimon (daily companion)**
| Skill | Type | Trigger | File |
|---|---|---|---|
| `daily-reading` | Blueprint (cron 6am, deliver telegram) | Scheduled + manual | `hermes/skills/daimon/daily-reading/SKILL.md` |
| `weekly-review` | Blueprint (cron Sunday 9am, deliver telegram) | Scheduled + manual | `hermes/skills/daimon/weekly-review/SKILL.md` |

**Essay pipeline**
| Skill | Type | Trigger | File |
|---|---|---|---|
| `write-and-publish` | Workflow (8 phases) | Manual | `hermes/skills/essay/write-and-publish/SKILL.md` |
| `generate-audio` | Utility | Manual | `hermes/skills/essay/generate-audio/SKILL.md` |
| `fetch-art` | Research | Manual | `hermes/skills/essay/fetch-art/SKILL.md` |

**Practice**
| Skill | Type | Trigger | File |
|---|---|---|---|
| `recommend-practice` | Analysis | Manual | `hermes/skills/practice/recommend-practice/SKILL.md` |
| `schedule-ritual` | Blueprint (cron 8pm) | Scheduled + manual | `hermes/skills/practice/schedule-ritual/SKILL.md` |

**Analysis**
| Skill | Type | Trigger | File |
|---|---|---|---|
| `advanced-analysis` | LLM synthesis | Manual | `hermes/skills/analysis/advanced-analysis/SKILL.md` |
| `research-mapping` | Research | Manual | `hermes/skills/analysis/research-mapping/SKILL.md` |

### Templates: `hermes/`

| File | Purpose |
|---|---|
| `SOUL.md` | Daimonic agent personality — installed to `~/.hermes/SOUL.md` |
| `AGENTS.md` | Project context — installed to `~/.hermes/AGENTS.md` |

## 10. For Future Agents: How to Proceed

### If you're continuing the Hermes Phase 1 build:

1. Read `handover.md` (core principles)
2. Read `hermes-architecture.md` (API specs + build order)
3. Read this file (handover2.md) for context on bugs and fixes
4. Read `src/app/api/astrology/today/route.ts` (the main API endpoint)
5. Install Hermes on a VPS: `curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash`
6. Copy SOUL.md and AGENTS.md to `~/.hermes/`
7. Install the plugin: `hermes plugins install hermes/plugins/atlas-astrology`
8. Install skills: `hermes skills install hermes/skills/daimon/daily-reading` (repeat for each)
9. Set up Telegram gateway: `hermes gateway install`
10. Test each skill manually
11. Accept the cron blueprints via `/suggestions`

### If you're fixing remaining issues:

1. Fix the graph singleton (`knowledge_graph.ts:377-386`) — make it request-scoped
2. Deduplicate `compute()` and `computeFromProfile()` in `page.tsx`
3. Add auth middleware to the astrology API routes
4. Wire yesterday comparison via snapshot D1 data

### If you're adding a new skill:

1. Create `hermes/skills/<category>/<name>/SKILL.md`
2. The SKILL.md format is: frontmatter (name, description, tags, optional blueprint) → body (instructions with step-by-step procedure)
3. Use `${HERMES_SKILL_DIR}` to reference bundled scripts
4. Reference the API endpoint URLs from `hermes-architecture.md`
5. Test with `hermes chat --toolsets skills -q "Use skill X to do Y"`

### Key files you will modify:

| Task | Files |
|---|---|
| Add API endpoint | `src/app/api/astrology/<name>/route.ts` |
| Add D1 table | `src/atlas/db/schema.sql` |
| Add engine feature | `src/astrology/activation_engine.ts` or new file |
| Add interpreter | `src/astrology/interpreters/<name>.ts` + register in `interpretation_schema.ts` |
| Add practice/spell | `src/astrology/spellbook/spellbook.ts` |
| Add correspondence | `src/astrology/spellbook/correspondences.ts` |
| Add source rules | `src/astrology/source_rules.ts` |
| Create Hermes skill | `hermes/skills/<category>/<name>/SKILL.md` |
| Create Hermes plugin tool | `hermes/plugins/atlas-astrology/tools/<name>.py` |

### Before committing, ALWAYS run:

```bash
npx tsc --noEmit                    # TypeScript typecheck
npx tsx src/astrology/spellbook/validate.ts  # Validate spell entries
npm run cf:build                     # Cloudflare build test (if deploying)
```
