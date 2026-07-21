# Hermes Agent Architecture — Site Operations Center

## Overview

Hermes Agent (v0.18.2, running on VPS) is the central orchestrator for the entire site.
The Next.js/Cloudflare site serves the UI and runs the deterministic astrology engine.
Hermes adds the intelligent layer: reading, interpreting, scheduling, remembering, and acting.

## Division of Responsibility

| Layer | Where | What |
|---|---|---|
| **Deterministic Engine** | Cloudflare (Next.js) | caelus → ActivationPacket → DailySphereReading. Pure computation, no LLM. |
| **Knowledge Graph** | Cloudflare (in-memory) | 1024 nodes, 2102 edges. Entities, correspondences, practices, rules. |
| **API Layer** | Cloudflare (API routes) | `/api/astrology/today`, `/api/astrology/graph`, `/api/journal`, `/api/astrology/snapshot` |
| **Hermes Agent** | VPS | Tools + Skills + Cron + Memory. Reads API, interprets, stores, sends. |
| **Hermes Memory** | VPS (`~/.hermes/memories/`) | MEMORY.md (agent notes), USER.md (user profile), session search |
| **Hermes Cron** | VPS (`~/.hermes/cron/`) | Scheduled jobs: daily reading, weekly review, monthly report |
| **D1 Database** | Cloudflare | Users, journal entries, daily snapshots, chat sessions |

## Data Flow

```
Birth Data (stored in D1 or sent to API)
  → /api/astrology/today (Next.js, server-side caelus)
    → Returns: chart, signals, oikodespotes, interpretation, macro, graph data

Hermes Plugin Tool calls /api/astrology/today
  → Gets structured JSON
  → Stores in Hermes memory for comparison
  → Runs skill-specific processing (Ficino lens, Valens timing, etc.)
  → Optionally writes to /api/journal or /api/astrology/snapshot
  → Sends via Telegram (or other platform)

Cron: daily-daimon (6am)
  → Hermes calls /api/astrology/today with user's birth data
  → Applies daimonic lens
  → Sends morning insight
  → Saves snapshot for history
```

## API Endpoints (Built)

| Endpoint | Method | Purpose | Status |
|---|---|---|---|
| `/api/astrology/today` | POST | Compute today's reading from birth data | ✅ Built |
| `/api/astrology/graph` | GET | Traverse knowledge graph | ✅ Built |
| `/api/astrology/snapshot` | POST/GET | Save/load daily snapshots to D1 | ✅ Built |
| `/api/journal` | GET/POST | Create/read journal entries | ✅ Existing |
| `/api/chat` | POST | LLM proxy to opencode API | ✅ Existing |

### `/api/astrology/today` Input

```json
{
  "year": 1999, "month": 5, "day": 16,
  "hour": 14, "minute": 37,
  "lat": 51.41082, "lon": -0.6748,
  "name": "Thomas Prior",
  "timezone": 0
}
```

### `/api/astrology/today` Output

```json
{
  "date": "2026-07-10",
  "age": 27,
  "name": "Thomas Prior",
  "chart": {
    "ascendant": "Libra 1°",
    "mc": "Cancer 2°",
    "fortune": "Taurus H2",
    "spirit": "Scorpio H8",
    "planets": { "sun": { "sign": "Taurus", "degree": 25, "house": 2, ... }, ... }
  },
  "oikodespotes": { "planet": "saturn", "name": "Saturn", "score": 17, "interpretation": "...", "soulChoice": "..." },
  "signals": [{ "planet": "jupiter", "score": 17.8, "confidence": "high", "timing_sources": ["natal_prominence","zr_fortune_lord","transit_to_planet"], ... }],
  "dominant_mode": "fortune",
  "interpretation": {
    "convergence": { "planets": ["jupiter","saturn","venus","mars"], "themes": [] },
    "macro": { "prevailing_temperament": "...", "dominant_house": {...}, "tensions": [...], "eases": [...] },
    "interpreters": {
      "al_khayyat": [{ "title": "Jupiter in House 4", "body": "Usefulness from the earth...", "planet": "jupiter" }],
      "valens": [{ "title": "Jupiter + Saturn", ... }],
      "ficino": [{ "title": "Jupiter", "body": "Qualities: expansion...", "practices": ["..."] }],
      "greenbaum": [{ "title": "Daimon Active...", ... }],
      "demetra": [{ "title": "Jupiter in Capricorn...", ... }]
    }
  },
  "graph": {
    "jupiter": {
      "nodeCount": 105,
      "edgeCount": 112,
      "correspondences": ["corr:herb:cedar", "corr:metal:tin", ...],
      "edges": [{ "practice": "spell:agrippa:jupiter:001", "label": "Jupiterian Wisdom Practice" }]
    }
  }
}
```

### `/api/astrology/graph` Query

```
GET /api/astrology/graph?id=planet:mars
GET /api/astrology/graph?planet=mars
GET /api/astrology/graph?type=all
GET /api/astrology/graph?type=correspondences&planet=mars
```

## Hermes Plugin Structure

Hermes plugins live in `~/.hermes/plugins/`. The plugin for this project is `atlas-astrology`:

```
~/.hermes/plugins/atlas-astrology/
├── plugin.yaml           # Manifest
├── __init__.py           # register() — wires all tools
├── tools/
│   ├── astrology.py      # /api/astrology/today wrapper
│   ├── graph.py          # /api/astrology/graph wrapper
│   ├── journal.py        # /api/journal wrapper
│   └── snapshot.py       # /api/astrology/snapshot wrapper
└── schemas.py            # Shared schemas
```

Each tool:
- Takes structured params from the LLM
- Calls the relevant API endpoint
- Returns JSON string
- Has a `check_fn` that verifies the site is reachable

## Skills Structure

Skills live in `~/.hermes/skills/` (or `skills/` for bundled):

```
~/.hermes/skills/
├── daily-daimon/
│   └── SKILL.md           # Blueprint with cron schedule
├── ficino-interpreter/
│   └── SKILL.md           # Ficinian lens on packet
├── valens-timing/
│   └── SKILL.md           # Timing analysis
├── graph-explorer/
│   └── SKILL.md           # Traverse graph for research
└── life-review/
    └── SKILL.md           # Weekly/monthly aggregation
```

### Skill: daily-daimon (Blueprint)

```yaml
metadata:
  hermes:
    blueprint:
      schedule: "0 6 * * *"    # 6am daily
      deliver: telegram
      prompt: "Fetch today's astrology reading and write a daimonic insight."
```

The skill calls:
1. `astrology_today` tool → gets packet
2. Reads Hermes memory for context (what was daimon yesterday, patterns)
3. Writes a personalized insight
4. Saves snapshot to `/api/astrology/snapshot`
5. Sends via Telegram

## Memory Integration

Hermes' built-in memory (`~/.hermes/memories/`) stores two files:

**MEMORY.md** (agent's notes, 2200 chars):
- Site base URL for API calls
- Birth data for the user
- Recently observed patterns ("Mars active 3 days this week")
- Skill usage notes

**USER.md** (user profile, 1375 chars):
- Communication preferences
- Daimon observations
- Goals (from futureresearch.md goals system)

The agent updates memory after each daily reading:
- "Today's daimon: Saturn. User's mood rating: 4. Wrote 500 words."
- Over time, Hermes can answer: "When Mercury is active, you write more."

Additionally, Hermes `session_search` tool searches SQLite of past sessions.
And `/api/astrology/snapshot` provides structured historical data.

## Hermes Cron Jobs

```bash
# Daily daimon — 6am every day
hermes cron create \
  --skill daily-daimon \
  --schedule "0 6 * * *" \
  --deliver telegram

# Weekly review — Sunday 9am
hermes cron create \
  --skill life-review \
  --schedule "0 9 * * 0" \
  --deliver telegram

# Pattern check — every 6 hours, check for new activations
hermes cron create \
  --skill pattern-check \
  --schedule "0 */6 * * *"
```

## SOUL.md Updates

SOUL.md (`~/.hermes/SOUL.md`) needs updating to include the astrology operations:

```
You have access to the following tools:
- astrology_today: Compute today's astrological reading from birth data
- astrology_graph: Traverse the knowledge graph (correspondences, practices, entities)
- journal_write: Save a diary/journal entry
- snapshot_save: Save a daily snapshot for historical comparison
- snapshot_list: Retrieve past snapshots

You use these tools to:
1. Generate daily daimonic insights
2. Research correspondences and practices via the graph
3. Track patterns over time using snapshots
4. Write journal entries tagged with the day's activation
```

## Current Flaws & Technical Debt

Issues discovered during codebase review (July 2026) that affect the Hermes API layer and should be fixed before or alongside Phase 1.

### Critical (Blocks Hermes Reliability)

| # | Issue | Location | Impact |
|---|---|---|---|
| 1 | **Hardcoded `age: 27` in macro translation** | `aggregator.ts:322` | `/api/astrology/today` returns wrong profection house for non-27-year-olds. Age is computed correctly in the route (line 86) but `buildMacroTranslation()` never receives it — the JSON response includes correct `age` at top level, but `interpretation.macro.timescales.year.age` is always 27. **Fix**: pass age as parameter to `buildMacroTranslation()`. |
| 2 | **`require()` calls silently fail on Workers** | `knowledge_graph.ts:222,240`, `spellbook.ts:706,721,733` | The `registerSourceRulesInGraph()`, `registerPlanetProfilesInGraph()`, and JSON catalog loading all use runtime `require()` wrapped in try/catch. On Cloudflare Workers, these fail silently — source rules, planet profiles, and the PGM/Picatrix/Cunningham catalogs never register in the graph. The `/api/astrology/today` route calls these, so the graph data returned is **incomplete** on Workers. **Fix**: convert to top-level static imports. |
| 3 | **Sky aspects missing from route** | `today/route.ts:70` | `currentSkyAspects: []` is passed to the engine. The engine recomputes sky aspects internally (dead code duplicate at `activation_engine.ts:301-316` and live at `527-535`), so some sky aspects DO appear — but they're not orb-weighted into scoring. The client-side path passes real sky aspects via `findSkyAspects()`; the API route gets the degraded path. **Fix**: compute sky aspects server-side and pass them, or remove the dead code and make the parameter work. |
| 4 | **Graph is a module-level singleton** | `knowledge_graph.ts:377-386` | `let instance: KnowledgeGraph | null = null` means the graph is shared across all requests in the same Worker isolate. `pushActivationToGraph()` mutates the singleton — concurrent requests corrupt each other's data. `clearSession()` is only called inside `pushActivationToGraph()`, not between requests. **Fix**: make the graph request-scoped or add proper isolation. |

### High (Degrades Output Quality)

| # | Issue | Location | Impact |
|---|---|---|---|
| 5 | **Age never forwarded to macro** | `today/route.ts:84-86` | Route computes age (line 86) and includes it in the top-level JSON response, but never passes it to `buildMacroTranslation(packet, oikodespotes?.planet)` — the function internally hardcodes `age: 27`. The `interpretation.macro.timescales.year.age` field is always wrong. |
| 6 | **Planetary hours hardcoded at lat=0** | `synthesis.ts:373` | `planetaryHours(new Date(), 0)` ignores user latitude. The route receives lat/lon from the request but this is never forwarded to synthesis. Not currently called by the API route (synthesis.ts is client-side only), but relevant for Hermes if it requests synthesis. |
| 7 | **Yesterday comparison never wired** | `aggregator.ts:282-284`, `synthesis.ts` | The `yesterday` parameter exists on `synthesizeDaily()` but is never populated. No infrastructure stores or retrieves the previous day's `ActivationPacket`. The Hermes `snapshot` route could support this (historical snapshots), but no delta computation exists. |
| 8 | **No auth on any astrology endpoint** | `today/route.ts`, `graph/route.ts`, `snapshot/route.ts` | Any caller can hit these endpoints. For a public Hermes deployment, this is an abuse vector. The `/api/journal` route likely has the same issue. **Fix**: add API key check or session auth. |

### Medium (Architecture)

| # | Issue | Location | Impact |
|---|---|---|---|
| 9 | **Sky aspects computed twice** | `activation_engine.ts:301-316, 527-535` | Lines 301-316 compute sky aspects into a local `skyAspects` array that is never read. Lines 527-535 recompute the same aspects and push them as activations. Dead code adds ~30 lines of noise. |
| 10 | **`as any` casts for caelus types** | `today/route.ts:76-78` | ZR results are cast with `(zrSpirit as any).l1` — if caelus API changes, this silently breaks. |
| 11 | **No fixedStars in packet input** | `today/route.ts:67-79` | `PacketInput.fixedStars` is never populated. Minor — fixed stars are a small boost to reading quality. |
| 12 | **No caching** | entire route | Every `/api/astrology/today` call recomputes the full 700-line pipeline. Same birth data + same date = same result, but no cache layer. High-frequency Hermes polling would be wasteful. |

### Low (Cosmetic / Future)

| # | Issue | Location | Impact |
|---|---|---|---|
| 13 | **Duplicate correspondence entries** | `correspondences.ts:87-93, 151-157` | Days-of-week (sunday-saturday) and numbers (1-7) duplicated with different citations. Graph overwrites silently. |
| 14 | **PGM Venus skew in practice graph** | PGM catalog | 38 Venus spells vs 2 Mercury spells. Practice recommender biases toward Venus. |
| 15 | **Demetra interpreter is a generic template** | `interpreters/demetra.ts` | Doesn't match Demetra George's actual 6-step method. Would work for any Hellenistic interpreter — generic, not specific. |

## Build Order

### Phase 1 — Foundation (this session)
1. ✅ API endpoints on Next.js (`/api/astrology/today`, `/api/astrology/graph`, `/api/astrology/snapshot`)
2. 🔲 **Fix critical bugs**: hardcoded age, `require()`→static imports, sky aspect dead code
3. 🔲 Hermes plugin (`atlas-astrology`) with all tools
4. 🔲 Test each tool against the API
5. 🔲 First skill: `daily-daimon` (blueprint with cron)

### Phase 2 — Daily Operations (next)
6. Wire Telegram delivery
7. Add memory integration (store observations after each reading)
8. Create `ficino-interpreter` skill
9. Create `life-review` skill (weekly aggregation)
10. Fix planetary hours (lat/lon-based)
11. Wire yesterday comparison from D1 snapshots

### Phase 3 — Advanced (future)
12. LangGraph subgraphs on Workers (per futureresearch.md)
13. Pattern detection across snapshots
14. Proactive alerts (convergence events)
15. Essay pipeline integration
16. Auth layer for API endpoints
17. Caching layer (memoize by birth data hash + date)

## Testing Strategy

Each tool is tested independently:

```bash
# Test astrology_today
python3 -c "from plugins.atlas-astrology.tools.astrology import astrology_tool; print(astrology_tool(1999, 5, 16, 14, 37, 51.4, -0.67))"

# Test graph traversal
python3 -c "from plugins.atlas-astrology.tools.graph import graph_traverse; print(graph_traverse('planet:mars'))"

# Test journal
python3 -c "from plugins.atlas-astrology.tools.journal import journal_write; print(journal_write('test entry', 'journal_entry'))"
```

## Data Layer Boundaries

The astrology data has clean layers. Hermes should consume them at the appropriate level:

| Layer | Endpoint | What | Consumer |
|---|---|---|---|
| L1: Raw positions | (caelus, not exposed) | Planetary longitudes, aspects | Engine only |
| L2: ActivationPacket | `/api/astrology/packet` (future) | Pure signals, no interpretation | Power users, debugging |
| L3: Full reading | `/api/astrology/today` | Packet + interpretations + macro + graph | Hermes daily skill |
| L4: Graph entities | `/api/astrology/graph` | Nodes, edges, correspondences, practices | Hermes research skill |
| L5: DailySnapshot | `/api/astrology/snapshot` | L3 + user data + history | Hermes life-review skill |

Hermes' daily-daimon skill consumes **L3** (full reading) and optionally **L4** (graph) for extra context.
Hermes' life-review skill consumes **L5** (historical snapshots).
Hermes' research skill consumes **L4** (graph traversal) for correspondences and practices.
