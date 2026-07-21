# Codebase Review — Astrology Engine & Application

*Generated from reading all core engine files, interpreters, knowledge graph, spellbook/correspondences, synthesis, gold standard, UI page, and handover documentation.*

---

## 1. Architecture Summary

**Stack:** Next.js + Cloudflare Pages/Workers + caelus (ephemeris) + in-memory knowledge graph (module singleton)

### Data Flow (7 stages)

```
Birth Data → caelus → NormalizedChart
  → activation_engine.ts (deterministic scoring)
    → ActivationPacket (pure signals, no interpretation)
      → daily_sphere_reader.ts (adds profiles/rituals)
        → interpretation_schema.ts (5 interpreters + convergence)
          → knowledge_graph.ts (graph push + query)
            → page.tsx (renders everything)
```

### Core Engine Files

| File | What It Does |
|---|---|
| `types.ts` (308 lines) | All shared types: `PlanetId`, `ActivationPacket`, `SignalScore`, `PlanetConditionPacket`, `DailySphereReading` |
| `activation_engine.ts` (670 lines) | Deterministic engine. Activations from transits, profections, ZR, firdaria, natal prominence. Orb bonuses, aspect modifiers, house overlap scoring. Confidence: 3+ sources + 2+ timescales = high |
| `activation_packet.ts` (214 lines) | Pure signal packet builder. No interpretation. Adds firdaria, valens combinations, antiscia, bonification, aspect patterns, natal promise, graph trace |
| `knowledge_graph.ts` (390 lines) | Typed in-memory graph with shared entity IDs. 5 layers: computation, interpretation, static, practice, correspondence. `traverse()`, `clusterByPlanet()`, `getCorrespondences()` |
| `oikodespotes.ts` (99 lines) | Personal daimon via Porphyry's almuten over 5 points (ASC, Fortune, Spirit, Sun, Moon) |
| `source_rules.ts` (254 lines) | 21 Valens pairs + 84 al-Khayyāt house rules + 12 Fortune-in-house rules. Every claim traces to a rule ID |

### Interpretation Layer

| File | What It Does |
|---|---|
| `interpretation_schema.ts` (268 lines) | Orchestrates 5 interpreters. Convergence detection: tags in 3+ systems |
| `interpreters/demetra.ts` (132 lines) | Generative 6-step sentence structure (planet + sign + house + condition) |
| `interpreters/aggregator.ts` (340 lines) | Macro translation — preserves ALL engine data. Integrated timescape analysis: temperament, dominant house/element/modality, tensions/eases, year-month-day interaction |
| `synthesis.ts` (410 lines) | Full daily reading builder. 5-axis practice ranking (safety × prestige × purpose-match × rarity × type-aspect) |

### Correspondences & Spellbook

| File | What It Does |
|---|---|
| `correspondences.ts` (332 lines) | 200+ entries: herbs (22), metals (8), stones (43+), incenses (37+), colours (14), animals (19), numbers (8), days (7), archangels (10), spirits (14), body parts (14), musical notes (7), senses (5), divine names (13) |
| `spellbook.ts` (768 lines) | 30+ practices from Ficino, Orphic, Picatrix, Agrippa, PGM, Llewellyn. Query by triggers. Also loads Cunningham 421 herbs, PGM 140 spells, Picatrix catalog |

### UI (page.tsx)

14 major sections: birth form → timescapes → convergence banner → 5-interpreter grid → activation metrics → daimon → chart echoes → daimonic houses → planet conditions → Fortune/Spirit → alignment → daimonic chat → raw data → antiscia/bonification/trace.

---

## 2. Critical Issues

### 2.1 Hardcoded Age in Macro Translation

**File:** `src/astrology/interpreters/aggregator.ts:322`

```ts
year: {
  age: 27,  // <-- HARDCODED
```

The age passed to the macro translation is always 27 regardless of the actual birth chart. This means the year-daily interaction text always describes the wrong profection house for everything except 27-year-olds. The actual computed age from `computeActivations()` in `activation_engine.ts` is never forwarded to the aggregator.

### 2.2 `compute()` and `computeFromProfile()` Are Duplicated

**File:** `src/app/astrology/page.tsx`

Two ~90-line functions that do the exact same pipeline (chart computation → packet → interpretation → graph push → recommendations). Any change to one must be manually replicated in the other. This has already likely diverged.

### 2.3 Graph Is a Module-Level Singleton, Not in React State

**File:** `src/astrology/knowledge_graph.ts:377-386`

```ts
let instance: KnowledgeGraph | null = null;
export function getGraph(): KnowledgeGraph {
  if (!instance) { instance = new KnowledgeGraph(); ... }
  return instance;
}
```

This means:
- Graph mutations (`pushActivationToGraph`, `clearSession`) are imperative side effects, not React state
- React doesn't know when the graph changes — UI reads are manual
- SSR/HMR can create orphaned instances
- No serialization/deserialization for persistence

### 2.4 Sky Aspects Computed Twice

**File:** `src/astrology/activation_engine.ts`

Lines 301-316 compute sky aspects and store them in a local `skyAspects` array that is never used. Lines 527-535 push the same computation again into `allActivations`. The first computation is dead code. Additionally, `findSkyAspects()` in the same file (line 148) is an exported duplicate — `daily_sphere_reader.ts` does NOT use it via the `currentSkyAspects` input, but `page.tsx` computes `currentSkyAspects` separately and passes them in as `PacketInput.currentSkyAspects`. There's a confusion between transiting sky aspects (computed in the engine) and the ones passed from outside.

### 2.5 `require()` Calls Break Tree-Shaking and Type Safety

**Files:**
- `src/astrology/knowledge_graph.ts:222` — `require("./source_rules")`
- `src/astrology/knowledge_graph.ts:240` — `require("./planet_profiles")`
- `src/astrology/spellbook/spellbook.ts:706,721,733` — `require("../../../content/glossary/*.json")`

These are runtime `require()` calls inside functions, not top-level imports. If the JSON files change format or the source files are refactored, these silently fail (wrapped in try/catch). They also prevent tree-shaking and make the dependency graph invisible to the compiler.

### 2.6 Zero Latitude for Planetary Hours

**File:** `src/astrology/synthesis.ts:373`

```ts
const hours = planetaryHours(new Date(), 0);  // lat = 0
```

Planetary hours are computed using latitude 0 (equator) regardless of the user's actual location. Real planetary hours require sunrise/sunset times at the user's latitude. The `planetaryHours()` function itself (line 72) doesn't even use the lat parameter — it just divides the day into equal 24 Chaldean hours.

### 2.7 Yesterday Comparison Never Wired

**File:** `src/astrology/interpreters/aggregator.ts:282-284`

```ts
const changesFromYesterday: string[] = [];
```

The `yesterday?: DayComparison` parameter exists on `synthesizeDaily()` in synthesis.ts but is never called with data. No infrastructure stores or retrieves yesterday's `ActivationPacket` for comparison. The UI displays "Changes from yesterday" as an empty section.

### 2.8 Duplicate Correspondence Entries

**File:** `src/astrology/spellbook/correspondences.ts`

- `corr:day:sunday` appears at line 87 AND line 151 (different citations: "Valens/Agrippa" vs just "Agrippa")
- `corr:day:monday` through `corr:day:saturday` all duplicated
- `corr:number:one` (line 96) and `corr:number:1` (line 160) — different IDs but same planet mapping for numbers 1-7 with different citations

When these get registered in the graph, the duplicates silently overwrite each other (the graph's `registerNode` uses `Map.set` which replaces).

---

## 3. Gold Standard Gaps

The gold standard (`content/astrology/GOLD_STANDARD.md`) demonstrates features the engine does NOT yet compute:

| Gold Standard Feature | Engine Status |
|---|---|
| **Dispositorship chain** (Mercury→Venus→Moon→Mercury loop) | Not implemented |
| **Temperament diagnosis** (melancholic-sanguine) | Not implemented |
| **Natal aspects with exact orbs** (Sun trine Fortune 0°02') | Aspects exist in chart data but are not included in LLM prompt or synthesis |
| **Egyptian bounds/terms** as minor dignity (not just domicile/exaltation/detriment/fall) | `termRuler()` is called in condition but the term ruler isn't surfaced in the reading text |
| **Under the sun's beams / cazimi** at arcminute threshold | Not implemented |
| **Solar return overlay** | Not implemented |
| **ZR sub-period levels** (L1/L2 in gold standard) | Engine uses only the top-level lord |
| **Year divided into chapters** with activation windows | Not implemented |
| **Prospective validation log** | Not implemented |
| **Weekly planetary cadence** | Partially (day-of-week ruler mapped) but no full week projection |

---

## 4. Architectural Concerns

### 4.1 LLM Has No Graph Access

The "generate deep analysis" button (daimonic chat) sends only the macro translation text to the LLM. The knowledge graph, spellbook, correspondences, and all practice data are UI-only. The handover mentions "two-pass LLM pipeline (Advanced → Ficino reads pass 1)" but the code shows a single `/api/chat` call with no pass structure.

### 4.2 No Caching Layer

Every birth chart recomputation runs the full 700-line pipeline from scratch. No memoization by input hash. Running the same chart twice triggers two identical caelus computations, two identical packet builds, two identical interpretation runs. The UI doesn't use `useMemo` for any derived data.

### 4.3 Chat History Grows Unbounded

**File:** `src/app/astrology/page.tsx`

The `chatMessages` array appends every message — user and assistant — with no limit, truncation, or summarization. After extended use, this will consume significant memory and send ever-larger payloads to the LLM API (the full history is sent with every request).

### 4.4 No Error Boundaries

If caelus throws, a JSON file fails to load, or any step in the pipeline crashes, the entire page collapses. The `try/catch` blocks are inconsistent — some functions have them (almuten, termRuler, faceRuler) while others don't.

### 4.5 The Demetra Interpreter Is a Template, Not Real Demetra Method

The real Demetra George method (Ancient Astrology in Theory and Practice, Vol 2) specifies:
- Sect-based conditioning
- Egyptian bounds as primary dignity
- Specific 6-step delineation structure
- Bonification/maltreatment analysis

The current implementation is a generic generative template (planet + sign qualities + house topics + condition) that doesn't match Demetra George's actual system. It would work for any Hellenistic interpreter.

### 4.6 Confidence Logic Edge Case

**File:** `src/astrology/activation_engine.ts:499-502`

```ts
if (onlyTransit) confidence = "low";
else if (uniqueSources >= 3 && uniqueTimescales >= 2 && (hasTimeLord || hasNatalProminence)) confidence = "high";
else if (uniqueSources >= 2) confidence = "medium";
else if (hasTimeLord) confidence = "medium";  // catch for monthly lord
```

A signal with exactly 1 source that is a timeLord (e.g., monthly profection only) gets `"medium"`. But a signal with 2 sources where one is transit and one is timeLord also gets `"medium"` — these are the same confidence for very different activation profiles. The comment says "monthly lord now gets medium" but this should track the actual source count.

---

## 5. Minor Issues

### 5.1 `bodyLabel` Recreated Every Render

**File:** `src/app/astrology/page.tsx`

The `bodyLabel` string literal is reconstructed on every render cycle. Should use `useMemo`.

### 5.2 PGM Catalog Venus Dominance

From the handover: PGM catalog has Venus=38 spells, Sun=9, Moon=7, Mercury=2. This means the graph has a massive Venus skew in `practice_for` edges. Combined with the existing correspondence Venus bias (17 entries), the practice recommender will disproportionately recommend Venusian practices.

### 5.3 No Validation Pipeline for JSON Catalogs

The PGM catalog (140 spells), Picatrix catalog (35 ops), and Cunningham catalog (421 herbs) are loaded with `require()` and try/catch, but there's no validation script like `spellbook/validate.ts` for them. If the JSON format changes, they silently fail.

### 5.4 `computeOikodespotes` Doesn't Include Oikodespotes in Signal Scoring

In `activation_engine.ts`, the oikodespotes is computed (line 325) and pushed as an activation (line 336-344), but the oikodespotes planet's signal scoring doesn't get a special boost beyond the `+3` weight. The gold standard treats the daimon as the organizing principle of the entire reading.

### 5.5 Interpreter Tags Aren't Normalized

Demetra tags use lowercase (`"mars"`), al-Khayyāt uses lowercase, but Ficino uses lowercase, Greenbaum uses `"daimon"` — convergence detection works because tags are case-sensitive strings. If a tag is `"Mars"` vs `"mars"`, it won't converge.

---

## 6. Recommendations (Priority Order)

### P0 — Fix Within Session
1. **Hardcoded age** — forward actual computed age from `computeActivations()` to `buildMacroTranslation()`
2. **Deduplicate `compute()` and `computeFromProfile()`** — extract shared pipeline into a single `runPipeline()` function

### P1 — Week 1
3. **Wire yesterday comparison** — store the previous day's `ActivationPacket` in localStorage or D1
4. **Fix duplicate correspondence entries** — deduplicate days and numbers in `correspondences.ts`
5. **Fix planetary hours** — accept real lat/lon and compute sunrise/sunset-based division
6. **Remove duplicate sky aspect computation** — clean up dead code in `activation_engine.ts`

### P2 — Week 2-3
7. **Replace `require()` with proper imports** — convert JSON catalogs to TypeScript imports
8. **Add dispositorship chain computation** — small engine change, big impact on reading quality
9. **Add Egyptian bounds/terms to reading output** — already computed internally, surface it
10. **Add chat history truncation** — limit to last 20 messages or summarize old context

### P3 — Month 1
11. **Implement caching** — memoize by chart input hash, invalidate on new dates
12. **Add error boundary component** — graceful degradation per UI section
13. **Surface natal aspects with orbs in LLM prompt** — data exists, include it
14. **Normalize interpreter tags** — case-insensitive convergence

### P4 — Month 2+
15. **Implement solar return overlay**
16. **Temperament diagnosis** (element/modality balance → humoral temperament)
17. **Year phases/chapters** — forward projection engine with activation windows
18. **Prospective validation log** — D1 storage of daily snapshots
19. **Two-pass LLM pipeline** — wire the sequential pass architecture described in handover
20. **Graph persistence** — serialize to D1 or IndexedDB for session continuity

---

## 7. Files Read

| File | Lines |
|---|---|
| `src/astrology/types.ts` | 308 |
| `src/astrology/activation_engine.ts` | 670 |
| `src/astrology/activation_packet.ts` | 214 |
| `src/astrology/knowledge_graph.ts` | 390 |
| `src/astrology/oikodespotes.ts` | 99 |
| `src/astrology/source_rules.ts` | 254 |
| `src/astrology/daily_sphere_reader.ts` | 141 |
| `src/astrology/synthesis.ts` | 410 |
| `src/astrology/interpretation_schema.ts` | 268 |
| `src/astrology/interpreters/aggregator.ts` | 340 |
| `src/astrology/interpreters/demetra.ts` | 132 |
| `src/astrology/spellbook/spellbook.ts` | 768 |
| `src/astrology/spellbook/correspondences.ts` | 332 |
| `src/astrology/spellbook/validate.ts` | ~70 (grep) |
| `src/astrology/natal_promise.ts` | ~90 (grep) |
| `src/astrology/containment.ts` | ~10 (grep) |
| `src/astrology/spellbook/types.ts` | (referenced) |
| `src/astrology/planet_profiles.ts` | (referenced via require) |
| `src/astrology/ritual_references.ts` | (referenced via import) |
| `src/astrology/antiscia.ts` | (referenced) |
| `src/astrology/bonification.ts` | (referenced) |
| `src/astrology/aspect_patterns.ts` | (referenced) |
| `src/astrology/daimonic_houses.ts` | (referenced) |
| `src/astrology/valens_combinations.ts` | (referenced) |
| `src/app/astrology/page.tsx` | ~900+ (task summary) |
| `content/astrology/GOLD_STANDARD.md` | 22 |
| `content/astrology/GOLD_STANDARD_ANALYSIS.md` | 17 |
| `handover.md` | 734 |
