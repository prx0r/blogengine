# Daimonic Astrology Engine — Layered Architecture

## The Core Insight

Every domain in this project (astrology, correspondences, rituals, interpretation) shares the same fundamental entities: **7 planets, 12 signs, 12 houses, 7 lots**. The difference between domains is what they *do* with those entities. The architecture should reflect this: one shared entity graph, separate layers for each domain's operations.

## Layer Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                            │
│  Reads from all layers below. Not a layer itself — just the UI.  │
└──────────────────────────┬───────────────────────────────────────┘
                           │ queries across layers
┌──────────────────────────▼───────────────────────────────────────┐
│                     KNOWLEDGE GRAPH                              │
│  The index. Typed nodes + edges across all layers.               │
│  One query: "get all nodes connected to mars" →                  │
│    astrology: mars_in_aries, practice: mars_ritual,              │
│    correspondence: mars_colour_red, interpretation: mars_delineation  │
│                                                                  │
│  Node = { id: string, layer: string, type: string, data: any }  │
│  Edge = { subject: string, predicate: string, object: string }  │
└──────────┬──────────┬──────────┬──────────┬──────────────────────┘
           │          │          │          │
┌──────────▼──┐ ┌─────▼──────┐ ┌─▼─────────▼─┐ ┌──────────────────┐
│ COMPUTATION │ │   ENGINE   │ │INTERPRETATION│ │   PRACTICE       │
│   LAYER     │ │   LAYER    │ │   LAYER     │ │   LAYER          │
│ (caelus)    │ │(activation)│ │(delineation)│ │(spells, rituals) │
├─────────────┤ ├────────────┤ ├─────────────┤ ├──────────────────┤
│ Positions   │ │ Timing     │ │ Planet-in-  │ │ Ficino practices │
│ Houses      │ │ Scoring    │ │  house rules│ │ Orphic hymns     │
│ Aspects     │ │ Confidence │ │ Planet-in-  │ │ Picatrix ops     │
│ Lots        │ │ Conditions │ │  sign rules │ │ Golden Dawn rit. │
│ Dignities   │ │ Valens     │ │ Fortune-in- │ │ Spellbook        │
│ Directions  │ │  pairs     │ │  house rules│ │ (structured)     │
│ Firdaria    │ │ Fortune/   │ │ Daimonic    │ │                  │
│             │ │  Spirit    │ │  semantics  │ │                  │
└─────────────┘ └────────────┘ └─────────────┘ └──────────────────┘
```

## Entity IDs (shared across all layers)

```ts
// Every entity in every layer uses these IDs:
planets: "planet:sun" | "planet:moon" | "planet:mercury" | "planet:venus" | "planet:mars" | "planet:jupiter" | "planet:saturn"
signs: "sign:aries" | "sign:taurus" | ... | "sign:pisces"
houses: "house:1" | "house:2" | ... | "house:12"
lots: "lot:fortune" | "lot:spirit" | "lot:eros" | "lot:necessity" | "lot:courage" | "lot:victory" | "lot:nemesis"
angles: "angle:asc" | "angle:mc" | "angle:dsc" | "angle:ic"
elements: "element:fire" | "element:earth" | "element:air" | "element:water"
modalities: "modality:cardinal" | "modality:fixed" | "modality:mutable"
```

## Each Layer in Detail

### Layer 1: Computation (caelus)

Already done. Computes raw data.

**Nodes produced**: planet positions, house cusps, angles, lots, aspects.

### Layer 2: Engine (what we've been building)

The deterministic core. Takes Computation Layer output + current time → produces `ActivationPacket`.

**The ActivationPacket should be PURE SIGNALS — no interpretation:**
```ts
interface ActivationPacket {
  date: string;
  native_id: string;
  signals: {
    planet: string;        // "planet:mars"
    confidence: "low" | "medium" | "high";
    score: number;
    timing_sources: string[];  // ["annual_profection", "zr_spirit", "firdaria"]
    timescales: string[];      // ["yearly", "monthly"]
    activated_houses: number[];
    activated_lots: string[];
    condition: {
      dignity: string[];       // ["detriment"]
      angularity: "angular" | "succedent" | "cadent";
      sect: "in_sect" | "out_of_sect" | "neutral";
      retrograde: boolean;
      house: number;
      sign: string;
    };
  }[];
  activated_houses: number[];
  activated_lots: string[];
  activated_topics: string[];
  fortune_score: number;
  spirit_score: number;
  dominant_mode: "fortune" | "spirit" | "mixed";
  timing: {
    yearly: ActivationSlice;   // profection + ZR + firdaria
    monthly: ActivationSlice;  // monthly profection
    daily: ActivationSlice;    // transits
  };
}
```

**Receives (NOT in engine):**
- Planet profiles (healthy/distorted expression)
- Ritual references
- Alignment advice
- Colours, scents, music
- Delineation text

These are Interpretation and Practice layer concerns.

### Layer 3: Interpretation

Maps engine signals to structured meaning.

```ts
// Source: al-Khayyāt, Abu Ma'shar, Valens
interface PlanetInHouseRule {
  planet: string;           // "planet:mars"
  house: number;            // 10
  delineation: string;      // "sorrow and captivity by powerful people"
  source: string;           // "al-Khayyāt Ch.47"
  nuance?: string;          // refined by condition
}

// Source: Valens Book I.21
interface PairRule {
  planets: [string, string]; // ["planet:mars", "planet:venus"]
  themes: string[];
  opportunities: string[];
  pressures: string[];
}

// Source: Greenbaum, Paulus
interface FortuneSpiritSemantics {
  lot: "fortune" | "spirit";
  house: number;
  meaning: string;
  body_part: string;
}

// Source: Brennan Ch.14, Antiochus
interface BonificationRule {
  type: string;
  description: string;
  beneficial: boolean;
}
```

### Layer 4: Practice (spells, rituals)

Structured spellbook data. Every entry has the same schema so we can cluster by planet, sign, or purpose.

```ts
interface SpellbookEntry {
  id: string;                          // "ficino:mars:001"
  planet: string;                      // "planet:mars"
  sign?: string;                       // optional, "sign:aries"
  phase?: string;                      // optional, "waxing_moon"
  purpose: string[];                   // ["courage", "protection"]
  tradition: "Ficino" | "Picatrix" | "Orphic" | "GoldenDawn" | "Agrippa";
  
  // Structured fields — same schema for every entry
  timing: {
    day?: string;                      // "tuesday"
    hour?: string;                     // "mars_hour"
    moon_phase?: string;               // "waxing"
  };
  materials: {
    herb?: string[];
    metal?: string[];
    colour?: string[];
    stone?: string[];
    incense?: string[];
    other?: string[];
  };
  procedure: string[];                // step-by-step
  invocation?: string;                // prayer text
  safety: "safe_symbolic" | "historical_reference" | "restricted";
  
  // For graph clustering
  corresponds_to: string[];           // ["herb:basil", "metal:iron", "colour:red"]
}
```

### Layer 5: Knowledge Graph

The index. Not a separate database — just the shared entity IDs that let you traverse across layers.

```ts
// The query interface:
interface KnowledgeGraph {
  // Get everything related to a planet across ALL layers
  traverse(id: string): {
    entities: LayerEntity[];
    edges: LayerEdge[];
  };
  
  // Cluster by planet — get all practice entries for Mars
  clusterByPlanet(planet: string): SpellbookEntry[];
  
  // Cluster by purpose — get all entries for "protection"
  clusterByPurpose(purpose: string): SpellbookEntry[];
  
  // Cross-layer query — what herbs correspond to the currently activated planet?
  getCorrespondences(planet: string, domain: "herb" | "metal" | "colour"): string[];
}
```

The graph is just a Map. No Kùzu, no Neo4j. Plain in-memory typed Map.

### Clustering Example

```
ActivationPacket says: mars is active (score 14, confidence high)

KnowledgeGraph.query("planet:mars") returns:
  Computation:  mars_in_taurus_house_10, mars_opposition_pluto
  Interpretation: mars_in_10th_delineation, mars+saturn_pair_rule
  Practice:      ficino_mars_ritual, orphic_hymn_to_ares, picatrix_mars_operation
  Correspondence: mars→red, mars→iron, mars→basil, mars→tuesday, mars→cedar

// Cluster by planet = one graph query with shared entity ID
const cluster = graph.traverse("planet:mars");
// Returns everything across all layers
```

## The Three Chains

The application flows through three distinct chains, each a separate layer:

```
1. ENGINE:  "What is active?"
   Input: birth chart + current time
   Output: ActivationPacket (pure signals)
   → planet mars is active, house 10, confidence high

2. INTERPRETATION: "What does it mean?"  
   Input: ActivationPacket
   Output: enriched packet with delineations, themes, semantics
   → mars in house 10 = "sorrow and captivity by powerful people"
   → mars+saturn active = "disciplined force, strategic pressure"

3. PRACTICE: "What do I do?"
   Input: enriched packet
   Output: structured practices, spells, correspondences
   → mars ritual on tuesday during mars hour
   → use red, iron, basil
   → recite Orphic Hymn to Ares
```

Each chain is independent. You could run just the engine and stop there (pure analysis). You could add interpretation on top (meaning). You could add practice on top (action). This matches V1's insight that "the packet is the product" — the engine produces the packet, the interpretation and practice layers just enrich it.

## The Query Flow

```
User opens page
  → Computation Layer computes chart + current sky
  → Engine Layer produces ActivationPacket
    → signal: mars is active, confidence high, house 10, condition: detriment
      → Interpretation Layer: mars in house 10 → "sorrow and captivity"
      → Practice Layer: mars active → retrieve mars rituals from spellbook
      → Knowledge Graph: mars corresponds_to red, iron, basil, tuesday
  → All assembled into DailySphereReading
  → LLM renders with containment: LLM can only reference what the packet says
```

## What Changes vs Current Architecture

| Current | New |
|---|---|
| `activation_engine.ts` does timing + scoring + conditions fused | Engine Layer: pure `ActivationPacket` |
| `daily_sphere_reader.ts` assembles engine + profiles + rituals + alignment | Split: `buildActivationPacket()` → Interpretation Layer queries |
| `planet_profiles.ts` with healthy/distorted expression | Interpretation Layer: separated from engine |
| `ritual_references.ts` with 28 entries | Practice Layer: structured spellbook schema |
| No graph — everything is function calls | Knowledge Graph: typed nodes + edges across layers |
| Entity IDs are implicit | All entities use shared IDs (planet:mars, sign:leo) |

## The Build Order (No Overengineering)

**Step 1: Refactor Engine** (30 min)
- Extract `buildActivationPacket()` from `daily_sphere_reader.ts`
- Pure signals only — no profiles, no rituals, no alignment
- Result: `ActivationPacket` type

**Step 2: Add Firdaria** (20 min)
- Wire `firdariaAt()` into activation engine
- New timing source in the packet

**Step 3: Add Aspect Patterns** (30 min)
- Grand trine, T-square, grand cross, yod detection
- Add to natal prominence in the packet

**Step 4: Build Knowledge Graph** (1 hr)
- Typed node/edge system with shared entity IDs
- Register computation, interpretation, practice data
- `traverse()`, `clusterByPlanet()`, `getCorrespondences()` methods

**Step 5: SourceRuleEngine** (1 hr)
- Structured `AncientSourceRule[]` from Valens pairs + al-Khayyāt rules
- Each rule has id, source_author, condition_pattern, themes, citation
- LLM must reference rule IDs in output

**Step 6: LLM Containment** (30 min)
- Post-hoc validation: parse LLM output for planet names, check against packet
- Reject output if it introduces new entities

**Step 7: Spellbook** (when ready)
- Structured `SpellbookEntry[]` with shared schema
- Clusters by planet, purpose, tradition
- Registers in Knowledge Graph automatically
