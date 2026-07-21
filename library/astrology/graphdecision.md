# Knowledge Graph Decision

## The Vision (from ENGINE_MAP.md)

```
clusterByPlanet("mars") returns EVERYTHING connected to Mars:
  ├── engine conditions (retrograde, detriment, angular)
  ├── interpretation themes (al-Khayyāt, Valens, Ficino, etc.)
  ├── correspondences (herbs, metals, colours, stones)
  ├── practices (spells, rituals, prayers)
  └── user diary (past moods, notes, what worked)
```

One call gets the full context for any planet. The shared entity ID (`planet:mars`) is the key that links all layers.

## Current Reality

The knowledge graph at `src/astrology/knowledge_graph.ts` has 397 nodes and 436 edges, but:

- **`registerSpellbookInGraph()` is never called** — the graph is populated by nobody
- **No consumer ever queries the graph** — `getGraph()`, `clusterByPlanet()`, and `traverse()` are called by nobody
- **The practice recommender** works directly on the 30-element SPELLBOOK array via trigger string matching, not through the graph
- **Missing static data:** signs, houses, elements, modalities, source rules (al-Khayyāt, Valens pairs) are never registered as nodes
- **Missing dynamic data:** engine signals, conditions, and interpretation themes from today's chart are never pushed into the graph
- **Missing user data:** diary entries, mood, practice history — nowhere in the graph

The graph is correct in *design* but completely disconnected from the runtime.

## Three Options

### A. Wire the graph (the ENGINE_MAP.md vision)

Three changes:

**1. Add missing static nodes** — signs, houses, elements, source rules registered at init:

```
planet:mars ──ruled_by──→ sign:scorpio
sign:scorpio ──has_element──→ element:water
al-khayyat:mars_h10 ──interprets──→ planet:mars
```

**2. Push dynamic data per chart computation** — after `buildActivationPacket()` runs:

```
pushActivationToGraph(packet) adds for each active planet:
  planet:mars ──has_condition──→ condition:mars_retrograde
  planet:mars ──has_timing──→ timing:annual_profection
  planet:mars ──interpreted_by──→ al-khayyat:mars_h10
  planet:mars ──converged_at──→ convergence:high
```

These are temporary — cleared before the next computation.

**3. Wire recommender to graph** — `recommendPractices()` calls `clusterByPlanet()` instead of filtering the SPELLBOOK array:

```typescript
function recommendViaGraph(packet) {
  clearGraphSession()        // remove last computation's temp nodes
  pushActivationToGraph(packet)  // add today's data
  const cluster = clusterByPlanet("mars")
  // cluster now has: conditions + interpretations + correspondences + practices
  return scoreAndSort(cluster, packet)
}
```

**Result:** `clusterByPlanet("mars")` returns the full context — engine state, what the interpreters said, what practices are available, what correspondences to use.

**Cost:** ~2-3 hours to implement. The graph already exists, just needs wiring.

**Risk:** The graph is in-memory only. Regenerated on every page load. No persistence across sessions. User diary data would need a separate storage mechanism.

### B. Multiple purpose-built indexes (pragmatic)

Keep the trigger-based array filter for practice recommendations (it's 30 items — a hash lookup is already O(1)), then add targeted indexes for the cross-referencing that matters:

- **materialIndex:** `Map<materialId, SpellEntry[]>` — what practices use rose?
- **purposeIndex:** `Map<purpose, SpellEntry[]>` — what practices are for protection?
- **diaryStore:** SQLite in D1 — per-user diary entries linked to DailySnapshots by date

The graph becomes a reference diagram showing how entities relate, not the runtime query engine.

**Cost:** ~1 hour for indexes. SQLite schema already partially designed (DailySnapshot → D1).

**Trade-off:** No single `clusterByPlanet("mars")` call that returns everything. Instead, multiple lookups (index + diary + interpretations) stitched together in the app layer.

### C. Let it be — fix the immediate bugs

The graph is already there as documentation. Just call `registerSpellbookInGraph()` somewhere so the 397 nodes are actually populated. Fix the prefix validation warnings. The practice recommender stays as-is (it works).

**Cost:** 15 minutes.

**Trade-off:** The graph exists but nobody uses it. The recommender never benefits from interpretation context or user history.

## What the User Wants (from conversation)

1. "Cluster by planet and see all spells, correspondences, interpretations linked to daily/weekly timescales"
2. "Ritual schedule — recommend spells based on interpretation + chart analysis"
3. "Notice themes from diary notes and suggest spells"
4. "Interactive grimoire with TTS + timers at planetary hours"

These all require the graph to be active OR a set of targeted indexes. Option A or B.

## Open Questions

- Where does `registerSpellbookInGraph()` get called? (App init? Page load?)
- How does user diary data flow? (Client-side SQLite? D1? LocalStorage?)
- Should the graph be persisted between sessions? (Currently in-memory only — lost on every page load.)
- Interpretation themes: register ALL al-Khayyāt rules as static nodes, or only the ones that match today's chart?
