# Daimonic Astrology Analysis Engine — V2 Build Spec

## Core Insight

This spec re-grounds the V1 spec on what we actually have and what's actually needed.

**What we have:**
- `caelus` engine — already computes charts, lots, profections, Zodiacal Releasing, essential dignities, aspects
- Open 777 — full Crowley correspondence tables as structured JSON/CSV (https://github.com/adamblvck/open_777)
- Valens — systematic combinatorics across all 21 planetary pairs and 35 triples
- Greenbaum — daimon/fortune ontology as layered structural system
- No structured Picatrix or Agrippa data exists anywhere — we'd build it

**What we actually need to build:**
- Graph adapter that wraps caelus output into a queryable node-edge structure
- Rule engine that matches Valens/Dorotheus/Paulus patterns against chart subgraphs
- Multi-timescale convergence detector (daily → weekly → monthly → yearly)
- Correspondence graph layer (777 → Picatrix → Agrippa → Ficino)
- Constrained LLM renderers that cannot hallucinate astrology
- Daily cron infra for current-sky computation

---

## Architecture: Layered Graph System

```
┌──────────────────────────────────────────────────────────┐
│                    RENDERER LAYER                        │
│  technical_Hellenistic │ daimonic │ ficinian │ picatrix  │
│  Template-based        │ LLM with containment validation │
└───────────────────────┬──────────────────────────────────┘
                        │ reads from
┌───────────────────────▼──────────────────────────────────┐
│              ACTIVATION GRAPH LAYER                      │
│  SynthesisPacket = deterministic snapshot of what's on   │
│  (which planets, houses, lots, topics, at what confidence)│
├──────────────────────────────────────────────────────────┤
│  SignalWeightingEngine  │  FortuneSpiritEngine           │
│  Convergence across     │  material vs daimonic split    │
│  timescales + systems   │                                │
├──────────────────────────────────────────────────────────┤
│  TimeActivationEngine                                      │
│  profections │ ZR │ transits │ returns │ progressions    │
└───────────────────────┬──────────────────────────────────┘
                        │ reads from
┌───────────────────────▼──────────────────────────────────┐
│              CHART GRAPH LAYER                           │
│  In-memory Kùzu graph (or typed graph) of natal chart    │
│  Nodes: planets, signs, houses, lots, angles             │
│  Edges: positioned_in, aspects, rules, dignifies,        │
│         trinity_lord, bound_lord, etc.                   │
├──────────────────────────────────────────────────────────┤
│  NatalStructureEngine  │  ValensCombinationEngine        │
│  wraps caelus dignity   │  pair/triple rule matching     │
│  + condition scoring    │  weighted by chart context     │
└───────────────────────┬──────────────────────────────────┘
                        │ reads from
┌───────────────────────▼──────────────────────────────────┐
│           COMPUTATION LAYER (caelus)                     │
│  Engine.chart() │ lots() │ profection() │ zrAt()        │
│  dignityScore() │ aspects │ returns │ etc.              │
└───────────────────────┬──────────────────────────────────┘
                        │ wrapped by
┌───────────────────────▼──────────────────────────────────┐
│         CORRESPONDENCE GRAPH (separate, joinable)        │
│  777 · Picatrix · Agrippa · Ficino · herbs · metals ·   │
│  colors · sounds · spirits · stones · planets · signs    │
│  Nodes: planets, signs, elements, sephiroth, paths,     │
│         herbs, metals, stones, colors, sounds, spirits   │
│  Edges: corresponds_to, rules, governs, resonates_with   │
└──────────────────────────────────────────────────────────┘
```

---

## Layer 0: Computation (caelus wrapper)

No build needed for core computation. caelus already provides:

```ts
// These already work:
const chart = engine.chart(y, m, d, h, mi, s, lat, lon, "whole_sign");
const lots = engine.lots(chart);          // all 7 Hermetic lots
const prof = profectionAt(engine, natalJd, targetJd, lat, lon);
const zr = zrAt(engine, natalJd, targetJd, lat, lon, "spirit");
const aspects = chart.aspects;            // all aspects
const dignities = dignityScore("mars", 15.3, "day"); // essential dignity
const returns = solarReturn(engine, natalJd, startJd, endJd);
```

### Build: Chart → standardized JSON adapter

caelus returns `Chart` objects. We need a `NormalizedChart` that matches the spec's `ChartInput` contract:

```ts
interface NormalizedChart {
  native_id: string;
  birth_data: { date, time, timezone, location };
  natal: {
    ascendant: ZodiacPosition;
    mc: ZodiacPosition;
    planets: Record<PlanetName, PlanetPosition>;
    houses_whole_sign: House[];
    aspects: Aspect[];
    lots: {
      fortune: ZodiacPosition;
      spirit: ZodiacPosition;
      // caelus provides all 7 Hermetic lots
      eros: ZodiacPosition;
      necessity: ZodiacPosition;
      courage: ZodiacPosition;
      victory: ZodiacPosition;
      nemesis: ZodiacPosition;
    };
    dignity_scores: Record<PlanetName, DignityScore>;
    triplicity_lords: TriplicityLordAssignment;
    // from caelus dignity-score.ts
  };
}
```

**One-time build:** ~100 lines of adapter code.

### caelus Workers verification

caelus's data is embedded JSON (VSOP87 coefficients). It should work in Cloudflare Workers since there's no native dependency or WASM required. **Must verify with a smoke test before building on it.**

---

## Layer 1: Chart Graph

Instead of loose JSON objects, the natal chart becomes a **typed in-memory graph**.

### Node types

```
PLANET:     { id: "mars", lon: 182.4, speed: 0.68, retrograde: false }
SIGN:       { id: "libra", index: 6, element: "air", modality: "cardinal" }
HOUSE:      { id: "house_7", number: 7, topics: ["marriage", "partnership"] }
LOT:        { id: "lot_fortune", lon: 45.2 }
ANGLE:      { id: "asc", lon: 183.7 }
DIGNITY:    { id: "mars_detriment", planet: "mars", type: "detriment" }
```

### Edge types

```
POSITIONED_IN:   (planet) ──→ (sign)
IN_HOUSE:        (planet) ──→ (house)
ASPECTS:         (planet) ──{ type: "square", orb: 2.1 }──→ (planet)
RULES:           (planet) ──→ (sign)        // domicile rulership
EXALTS_IN:       (planet) ──→ (sign)
DETRIMENT_IN:    (planet) ──→ (sign)
FALL_IN:         (planet) ──→ (sign)
HAS_DIGNITY:     (planet) ──→ (dignity)
LOT_OF:          (lot)    ──{ type: "fortune" }──→ (native)
LORD_OF:         (planet) ──→ (house)       // house rulership
TRIPLICITY_LORD: (planet) ──{ sect: "day" }──→ (sign)
BOUND_LORD:      (planet) ──→ (sign)
```

### Build approach

Use **Kùzu** (already in project as `personal Kuzu instance` per graphstructure.md) or a simple in-memory typed graph if Kùzu is overkill for MVP.

```ts
class ChartGraph {
  addPlanet(id, data): PlanetNode;
  addEdge(type, from, to, props): Edge;
  
  // Query helpers
  planetsInHouse(n: number): PlanetNode[];
  aspectsBetween(a: string, b: string): AspectEdge[];
  rulersOfHouse(n: number): PlanetNode[];
  activatedPlanets(timeActivations): PlanetNode[];
}
```

**Build:** ~300 lines.

---

## Layer 2: Rule Engine (Valens combinatorics)

This is the **anti-hallucination layer**. Every technical claim must trace to a specific rule.

### Rule structure

```ts
interface AncientRule {
  id: string;                    // "valens:pair:mars+mercury"
  source: "Valens" | "Dorotheus" | "Paulus" | "Rhetorius";
  type: "pair" | "triple" | "house_topic" | "lot_meaning";
  planets?: [string, string] | [string, string, string];
  conditions: RuleCondition[];   // optional: e.g. "if in angular house"
  themes: string[];              // e.g. ["speech", "argument", "craft"]
  opportunities: string[];
  pressures: string[];
  confidence: "low" | "medium" | "high";
  citation?: string;
}
```

### Pair rules (all 21 from Valens Book 1.21)

Saturn combinations (5): S+J, S+Mars, S+Venus, S+Mercury, S+Moon
Jupiter combinations (4): J+Mars, J+Venus, J+Mercury, J+Moon
Mars combinations (3): Mars+Venus, Mars+Mercury, Mars+Moon
Venus combinations (2): Venus+Mercury, Venus+Moon
Mercury combinations (1): Mercury+Moon

Each pair has a base meaning that gets **weighted** by:
- Which houses the planets occupy
- The dignities of each planet
- Whether the pair involves Fortune or Spirit lots
- Whether the pair is activated by current timing systems

### Triple rules (built from pairs)

Per spec: triples are **generated** from pairs, not independently authored.

```ts
function generateTriple(p1, p2, p3): TripleRule {
  return {
    id: `valens:triple:${p1}+${p2}+${p3}`,
    planets: [p1, p2, p3],
    composed_of: [
      `valens:pair:${p1}+${p2}`,
      `valens:pair:${p1}+${p3}`,
      `valens:pair:${p2}+${p3}`
    ],
    themes: mergeThemes(p1+p2, p1+p3, p2+p3),
    conditions: [...]
  };
}
```

### Rule matching

```ts
function matchRules(graph: ChartGraph, activated: PlanetNode[]): MatchedRule[] {
  const pairs = allPairs(activated);
  return pairs.map(([a, b]) => {
    const rule = RULE_DB[`valens:pair:${a.id}+${b.id}`];
    if (!rule) return null;
    return {
      rule,
      weight: computeWeight(a, b, graph),
      house_context: housesInvolved(a, b, graph),
      lot_context: lotsInvolved(a, b, graph)
    };
  }).filter(Boolean);
}
```

### Seed rule database

Start with Valens pair rules (~21 entries with themes). Derive triples algorithmically. Add Dorotheus house rules (~12). Add Paulus lot definitions (~7). Total initial: **~50 rules**, not 300.

**Build:** ~400 lines for rule engine + ~200 lines for rule data.

---

## Layer 3: Timing + Activation Graph

### Multi-timescale convergence

The key innovation: **the same planetary node can be activated by multiple timing systems simultaneously.** That convergence is how we score confidence.

```ts
interface Activation {
  source: "annual_profection" | "monthly_profection" | "zr_spirit" | 
          "zr_fortune" | "transit" | "return" | "progression";
  planet: string;         // the lord/ruler of this timing system
  house?: number;         // activated house
  lot?: "fortune" | "spirit";
  weight: number;         // 1-5 per spec
  timescale: "daily" | "weekly" | "monthly" | "yearly";
}

function computeActivations(chart: NormalizedChart, targetDate: Date): Activation[] {
  const age = computeAge(chart.birth_data.date, targetDate);
  return [
    { source: "annual_profection", planet: annualLord, house: annualHouse, weight: 5, timescale: "yearly" },
    { source: "monthly_profection", planet: monthlyLord, house: monthlyHouse, weight: 2, timescale: "monthly" },
    ...zrActivation(chart, targetDate, "spirit").map(z => ({...z, weight: 5, timescale: "yearly"})),
    ...zrActivation(chart, targetDate, "fortune").map(z => ({...z, weight: 4, timescale: "yearly"})),
    ...transitActivations(chart, targetDate).map(t => ({...t, timescale: "daily"})),
  ];
}
```

### Daily atmosphere = sum of all active threads

```
DAILY:
  transits to activated planets
  Moon sign/phase
  current planetary hour

WEEKLY:
  Moon ingress into signs
  applying aspects this week

MONTHLY:
  profection month lord
  solar month ingress
  progressed Moon sign

YEARLY:
  annual profection lord & house
  ZR Spirit period
  ZR Fortune period
  solar return theme

CONVERGENCE:
  If Mercury appears in all 4 timescales → high confidence Mercury activation
  If only in daily transit → low confidence, suppress in output
```

### Fortune/Spirt daily atmosphere

```
Daily Spirit index:
  current transit lord → does it aspect Lot of Spirit?
  is annual lord also Spirit lord?
  is ZR Spirit active?
  
Daily Fortune index:
  Moon phase → material mood
  current transit lord → does it aspect Lot of Fortune?
  is annual lord also Fortune lord?
  is ZR Fortune active?
  
Dominant mode:
  spirit_score > fortune_score × 1.5 → "spirit_led"
  fortune_score > spirit_score × 1.5 → "fortune_led"
  else → "mixed"
```

**Build:** ~300 lines for convergence engine.

---

## Layer 4: Signal Weighting (what to pay attention to)

### Scoring function

```ts
function scoreActivation(planet: string, activations: Activation[]): SignalScore {
  const sources = new Set(activations.map(a => a.source));
  const timescales = new Set(activations.map(a => a.timescale));
  const totalWeight = activations.reduce((s, a) => s + a.weight, 0);
  
  return {
    planet,
    repetition_count: sources.size,
    timescale_count: timescales.size,
    score: totalWeight,
    confidence: sources.size >= 3 && timescales.size >= 2 ? "high"
              : sources.size >= 2 ? "medium"
              : "low",
    sources: [...sources],
    timescales: [...timescales]
  };
}
```

### Suppression rules

```
- If score < 3: exclude from output entirely
- If score < 5: mark as noise
- If only "transit" activation with no natal prominence: boost only if transit applies to activated lord
- Daily Moon transits: excluded unless they aspect an already-activated planet
```

**Build:** ~150 lines.

---

## Layer 5: Correspondence Graph (777 → Picatrix → Agrippa → Ficino)

This is a **separate, joinable graph** that maps planets/signs to everything else.

### Data sources

| Layer | Source | Status |
|-------|--------|--------|
| 777 | Open 777 JSON (Crowley) | ✅ Ready — 98% complete |
| Picatrix | Not structured anywhere | ❌ Must build from text |
| Agrippa | Not structured anywhere | ❌ Must build from text |
| Ficino | Our essays + books | Partial — in repo |
| Herbs | Picatrix + Agrippa + 777 | Must build |
| Metals | 777 + Agrippa | Partial from 777 |
| Colors | 777 + Agrippa | ✅ From 777 |
| Sounds/Music | Ficino + 777 | Partial |
| Stones | 777 + Agrippa | Partial from 777 |

### Graph schema

```
Node: CorrespondenceEntity
  id: string      // "herb:rosemary"
  type: "herb" | "metal" | "color" | "stone" | "sound" | "spirit" | "deity"
  label: string
  source: "777" | "picatrix" | "agrippa" | "ficino"

Edge: CORRESPONDS_TO
  source: CorrespondenceEntity
  target: CorrespondenceEntity  // e.g. (planet:mars) ──→ (metal:iron)
  strength: number              // 0-1
  source_ref: string            // citation
  tradition: string             // "picatrix" | "agrippa" | "777" | "ficino"
```

### Open 777 integration

The Open 777 data (`open_777/liber_777.js`) has correspondence columns + rows. We import and convert to graph edges:

```ts
// Example: Mars corresponds to Mars in 777
import { LIBER_777 } from 'open_777';

function import777() {
  for (const row of LIBER_777) {
    // row: { "0": "Mars", "1": "Jupiter", planet: "Mars", god_name: "Ares", ... }
    addNode({ id: `777:planet:${row.planet}`, type: "planet", label: row.planet, source: "777" });
    addNode({ id: `777:god:${row.god_name}`, type: "deity", label: row.god_name, source: "777" });
    addEdge("CORRESPONDS_TO", `777:planet:${row.planet}`, `777:god:${row.god_name}`, { strength: 1.0 });
  }
}
```

### Picatrix/Agrippa extraction strategy

Since no structured data exists for these, we take a **phased approach**:

1. **Phase 1**: Extract planetary correspondence tables from the source texts (PDFs in repo)
2. **Phase 2**: Manually curate ~50 high-signal correspondences per text
3. **Phase 3**: User-facing tool to add/extend correspondences at runtime

Given the `src/data/picatrix.json` already exists with structured chapter content, we can do:
```ts
// Extract planetary correspondences from picatrix.json
function extractPicatrixCorrespondences(picatrixData) {
  // Pattern: search chapter content for "Mars corresponds to", "planet of", etc.
  // Return: CorrespondenceEntity[]
}
```

**Build:** ~400 lines for graph layer. Open 777 import is minimal (~50 lines). Picatrix/Agrippa extraction is iterative.

---

## Layer 6: SynthesisPacket (daily atmosphere)

### The daily atmosphere object

```ts
interface DailyAtmosphere {
  date: string;
  native_id: string;
  
  // Convergence across timescales
  daily: TimescaleSlice;   // transits, Moon
  weekly: TimescaleSlice;  // Moon ingress, applying aspects
  monthly: TimescaleSlice; // profection month
  yearly: TimescaleSlice;  // annual profection, ZR
  
  // Which planets are activated and at what confidence
  signals: SignalScore[];
  
  // Fortune vs Spirit split
  dominant_mode: "fortune" | "spirit" | "mixed";
  fortune_signature: FortuneSpiritSlice;
  spirit_signature: FortuneSpiritSlice;
  
  // Technical basis
  technical_basis: {
    annual_profection: { house, sign, lord };
    zr_spirit: ZrPeriod | null;
    zr_fortune: ZrPeriod | null;
    active_combinations: PlanetCombination[];
    activated_lots: string[];
  };
  
  // For renderers
  renderer_payload: {
    primary_planets: string[];
    primary_topics: string[];
    active_houses: number[];
    active_lots: string[];
    tone_hints: string[];
  };
}
```

### Fortune + Spirit daily slices

```ts
interface FortuneSpiritSlice {
  active: boolean;
  confidence: "low" | "medium" | "high";
  summary: string;      // computed deterministically
  
  activations: Activation[];
  lot: {
    sign: string;
    house: number;
    lord: string;
    lord_condition: DignityScore;
  };
  
  // What this means for daily life
  material_mood?: string;     // fortune
  daimonic_call?: string;     // spirit
}
```

---

## Layer 7: Renderers

### Template renderer (for technical_Hellenistic)

No LLM needed. Template interpolation from the packet:

```ts
function renderTechnical(packet: DailyAtmosphere): string {
  return `
Current chapter (${packet.date}):
${packet.yearly.profection_desc}

Technical basis:
- Annual profection activates house ${packet.technical_basis.annual_profection.house}, lord ${packet.technical_basis.annual_profection.lord}
- ZR from ${packet.technical_basis.zr_active_lot}: sign ${packet.technical_basis.zr_sign}
- ${packet.technical_basis.active_combinations.length} active combinations

Fortune layer:
${packet.fortune_signature.material_mood}

Spirit/Daimon layer:
${packet.spirit_signature.daimonic_call}

Active planets (ranked):
${packet.signals.map(s => `  ${s.planet}: ${s.confidence} (score ${s.score})`).join('\n')}
  `.trim();
}
```

### LLM renderers (daimonic, ficinian, picatrix)

Strict prompt template:

```
You are rendering a precomputed astrology synthesis packet.
DO NOT add planets, houses, lots, aspects, or timing systems not in the packet.
DO NOT change confidence levels.
DO NOT make deterministic predictions.

PACKET DATA:
{JSON.stringify(packet)}

STYLE: {renderer_type}

Rendered output:
```

**Post-processing validation** — automated regex/parse check:

```ts
function validatePacketFidelity(rendered: string, packet: DailyAtmosphere): boolean {
  // Extract any planet names mentioned in the rendered output
  const mentionedPlanets = extractPlanets(rendered);
  const packetPlanets = new Set(packet.signals.map(s => s.planet));
  
  // Fail if LLM introduced a planet not in the packet
  const introduced = mentionedPlanets.filter(p => !packetPlanets.has(p));
  if (introduced.length > 0) {
    console.error(`LLM hallucinated planets: ${introduced}`);
    return false;
  }
  return true;
}
```

---

## Development Plan

### Phase 0: Verification (1 day)

```
[ ] Verify caelus runs in Cloudflare Workers
[ ] Export sample chart from caelus, verify all required fields
[ ] Confirm whole_sign house system output
[ ] Check caelus lots() includes Spirit
```

### Phase 1: Chart Graph + NormalizedChart (2 days)

```
[ ] Build NormalizedChart type + adapter from caelus Chart
[ ] Build ChartGraph class with node/edge types
[ ] Add query helpers (planetsInHouse, rulersOf, aspectsBetween)
[ ] Test with 3 sample charts
```

### Phase 2: Rule Engine + Rule Database (3 days)

```
[ ] Define AncientRule type structure
[ ] Code all 21 Valens pair rules with themes
[ ] Implement triple generation from pairs
[ ] Implement rule matcher (pattern → chart subgraph)
[ ] Add Dorotheus house rules (12)
[ ] Add Paulus lot definitions (7)
[ ] Test: given Mars+Mercury in 3rd/10th, engine returns correct rule
```

### Phase 3: Timing + Activation Engine (2 days)

```
[ ] Implement multi-timescale activation (daily/weekly/monthly/yearly)
[ ] Integrate with caelus profection() and zrAt()
[ ] Implement transit computation (current planets vs natal)
[ ] Build Fortune/Spirit split logic
[ ] Build convergence scoring
[ ] Test: same planet activated by 3 systems → high confidence
```

### Phase 4: Correspondence Graph (3 days)

```
[ ] Import Open 777 data as graph nodes + edges
[ ] Build CorrespondenceEntity type and graph schema
[ ] Extract Ficino planetary correspondences from repo texts
[ ] Start Picatrix entity extraction (from src/data/picatrix.json)
[ ] Start Agrippa entity extraction (from repo PDFs)
[ ] Test: query "mars" returns all correspondences across all layers
```

### Phase 5: SynthesisPacket + Daily Atmosphere (2 days)

```
[ ] Build DailyAtmosphere type
[ ] Implement packet builder (combines all engines)
[ ] Build Fortune/Spirit daily slices
[ ] Implement signal suppression (low confidence filtering)
[ ] Test: same chart + same date → identical packet
```

### Phase 6: Renderers (3 days)

```
[ ] Build technical_Hellenistic template renderer
[ ] Build daimonic LLM renderer with strict prompt
[ ] Build ficinian_practice LLM renderer
[ ] Build correspondence renderer (show 777/Picatrix/Agrippa links)
[ ] Implement post-processing validation
[ ] Test: renderer invariance (same packet → same planets/houses/lots)
```

### Phase 7: API + Daily Cron (2 days)

```
[ ] Build GET /analysis/:native_id/current
[ ] Build POST /analysis/:native_id/render
[ ] Build GET /sky/current
[ ] Implement daily cron (00:10 UTC) via Cloudflare Cron Triggers
[ ] Store current_sky_snapshot in D1
[ ] Test: daily packet stable across date changes, updates on new date
```

**Total: ~18 days full-time for MVP.**

---

## Testing Strategy

### Determinism tests (critical)

```
Given chart C and date D:
  Engine always produces identical packet P.
  
Given chart C, date D, renderer R:
  Template renderer produces identical output.
  LLM renderer may vary in language but must pass packet fidelity check.
```

### Combinatoric coverage

```
Every Valens pair rule: tested with a synthetic chart containing both planets.
Every triple: generated from pairs, verified structure.
Every house rule from Dorotheus: tested with planet in that house.
Every lot definition from Paulus: verified against formula.
```

### Anti-hallucination tests

```
- Renderer fidelity check fails if LLM adds "Uranus" to a packet with only traditional planets.
- Renderer fidelity check fails if LLM changes "low confidence" to "high confidence".
- Rule engine returns empty for non-existent planet combinations.
- Signal weighting returns empty for chart with no activations.
```

### Integration smoke test

```
End-to-end daily atmosphere:
  1. Compute natal chart (whole_sign)
  2. Compute daily sky (current positions)
  3. Compute annual profection
  4. Compute ZR Spirit + Fortune
  5. Compute transits to activated planets
  6. Compute signal scores
  7. Build DailyAtmosphere
  8. Render technical_Hellenistic
  9. Render daimonic
  
  Expected:
  - Packet has 1+ active signals
  - Fortune/Spirit mode is not "neither"
  - Template renderer produces readable output
  - LLM renderer passes fidelity check
```

---

## Key Solutions to V1 Build Issues

| V1 Issue | V2 Solution |
|----------|-------------|
| caelus does most engine work | Wrap caelus as Layer 0, build only orchestration above it |
| Whole sign vs Placidus | Support both as config parameter; graph adapter handles either |
| caelus client-side only | Verify Workers compatibility; embedded JSON data likely works |
| Profile schema lacks lots | Lots = pure arithmetic (Asc + Moon - Sun); compute server-side |
| No daily cron infra | Cloudflare Cron Triggers; one Worker per day |
| Source rules = data entry | Start with 21 Valens pairs (systematic combinatorics), not 300 |
| Valens combinations complex | Pair meanings weighted by house/dignity context, not free-form |
| Python tools in TS stack | Open 777 = JS/JSON; caelus = TS; Python tools are references only |
| LLM hallucination in renderers | Template renderer for technical layer; strict prompts + post-hoc validation for LLM |
| D1 storage at scale | Compute on demand from sky snapshot + chart; don't cache per-user packets |

---

## Greenbaum's structural insight (applied)

From her "multi-layered circle" method:

```
Layer 0: The twelve places — fixed chart grid
Layer 1: The Lots — Fortune/Spirit as mirror-image computed points
Layer 2: The Fortune-Daimon-Ascendant isosceles triangle — geometric relationship
Layer 3: Recursive lots (Eros/Necessity from Fortune/Daimon)
Layer 4: Attribution networks (Sun→Daimon, Moon→Fortune semantic mapping)
Layer 5: Time-lord activation (lots as aphetic points)
```

This maps directly to our graph layers. The isosceles triangle (Fortune-Daimon-Ascendant) becomes a **graph motif** we can detect and analyze:

```ts
function detectDaimonicTriangle(chart: NormalizedGraph): Triangle | null {
  // Fortune, Daimon, and Ascendant form an isosceles triangle
  // when connected through their lords and aspect relationships
  const aspectEdges = chart.findEdges({ type: "ASPECTS" });
  // ... geometric analysis
}
```

---

## Future Extensions (post-MVP)

```
- Full Picatrix correspondence graph (spirits, talismans, planetary hours)
- Full Agrippa correspondence graph (four elements, microcosm/macrocosm)
- Ficinian practice renderer (music therapy, spiritus attunement, planetary oils)
- Crowley 777 as searchable correspondence browser
- Herb/metal/stone/color recommendations per activated planet
- Audio/sound/music correspondences (Ficino's Orphic singing)
- Talisman design from Picatrix (planetary images, materials, timing)
- Electional layer (choose best time based on desired activation)
- Horary layer (answer questions from chart graph patterns)
- Theurgic ascent pathway (Porphyry's personal daimon detection)
```

---

## Daily Atmosphere Example Output

```
10 July 2026 — Spirit-led Mars/Saturn activation

TECHNICAL BASIS:
  Annual profection: 36 → 1st house (Aries), lord Mars
  ZR from Spirit: L1 Leo / L2 Sagittarius, lord Jupiter → Jupiter
  ZR from Fortune: L1 Taurus / L2 Capricorn, lord Saturn
  Transit: Mars (24° Leo) square natal Saturn (24° Scorpio)
  Convergence: Mars appears in 3 systems → HIGH confidence

FORTUNE LAYER:
  Material circumstances tightening. Saturn-ruled period slows 
  resources. Existing structures demand maintenance before expansion.

SPIRIT/DAIMON LAYER:
  Mars-led year demands initiative, but Saturn-bound release says: 
  build foundation first. The tension is productive if directed.

DOMINANT COMBINATION:
  Mars + Saturn: discipline, endurance, strategic pressure, 
  delayed reward. The wall you hit is the wall you build.

CORRESPONDENCES:
  Mars: iron, cinnamon, cedar, Aries, red, Tuesday
  Saturn: lead, myrrh, cypress, Capricorn, black, Saturday
  Combined: iron tools + cypress = surgical precision in 
  permanent work. Cut what no longer belongs.

FICINIAN PRACTICE:
  Saturn needs warming — cinnamon suffumigation, solar exposure,
  moderate exercise. Mars needs cooling — avoid red, avoid conflict,
  channel into precise craftwork. Sing Jupiter hymns at dawn.
```

---

## Repository Structure

```
src/astrology/
├── engine/
│   ├── index.ts              # orchestration entry
│   ├── chart-graph.ts        # Layer 1: chart graph builder
│   ├── rule-engine.ts        # Layer 2: Valens/Dorotheus rule matcher
│   ├── rules.valens.ts       # 21 pair rules + triple generator
│   ├── rules.dorotheus.ts    # 12 house topic rules
│   ├── rules.paulus.ts       # 7 lot definition rules
│   ├── timing.ts             # Layer 3: multi-timescale activation
│   ├── signal-weighting.ts   # Layer 4: convergence scoring
│   ├── fortune-spirit.ts     # Fortune/Spirit split logic
│   ├── synthesis.ts          # Layer 5: DailyAtmosphere builder
│   └── correspondences.ts    # Layer 6: 777/Picatrix/Agrippa graph
├── renderers/
│   ├── technical.ts          # template-based Hellenistic renderer
│   ├── daimonic.ts           # LLM Greenbaum-style renderer
│   ├── ficinian.ts           # LLM Ficino practice renderer
│   └── validator.ts          # post-hoc packet fidelity check
├── correspondence/
│   ├── open-777.ts           # Open 777 import adapter
│   ├── picatrix.ts           # Picatrix corpus extractor
│   ├── agrippa.ts            # Agrippa corpus extractor
│   └── ficino.ts             # Ficino planetary practices
├── api/
│   ├── analysis.ts           # GET/POST analysis endpoints
│   ├── sky.ts                # GET /sky/current
│   └── cron.ts               # Daily sky update Worker
├── types.ts                  # All shared types
└── test/
    ├── determinism.test.ts   # Same input → same output
    ├── combinatorics.test.ts # All pairs/triples matchable
    ├── fidelity.test.ts      # No LLM hallucination
    └── fixtures/
        └── charts.ts         # 5+ synthetic test charts
```
