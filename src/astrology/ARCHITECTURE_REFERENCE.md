# Astrology Engine — Architecture Reference

## Data Flow (7-Layer Pipeline)

```
BIRTH DATA + CURRENT TIME
         │
         ▼
┌──────────────────────────────────────────────────────────┐
│ LAYER 0: COMPUTATION  (caelus)                           │
│  Ephemeris, chart, aspects, lots, dignities              │
│  → Raw Chart object                                      │
└────────────────────────────────┬─────────────────────────┘
                                 │ normalizeChart()
                                 ▼
┌──────────────────────────────────────────────────────────┐
│ LAYER 1: ADAPTER  (caelus_adapter.ts)                    │
│  Chart → NormalizedChart (typed, planet/house/lot map)   │
│  → NormalizedChart                                       │
└────────────────────────────────┬─────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────┐
│ LAYER 2: ENGINE  (activation_engine.ts + sub-modules)    │
│                                                           │
│  Timing systems: profections, ZR, firdaria, transits     │
│  Scoring: signal weight × source count → confidence      │
│  Conditions: dignity, angularity, sect, triplicity       │
│  Sub-modules:                                             │
│    valens_combinations.ts  — 21 planetary pair rules     │
│    oikodespotes.ts         — personal daimon (Porphyry)  │
│    daimonic_houses.ts      — 5/6/11/12 house tagging     │
│    antiscia.ts             — solstice-axis mirror bonds  │
│    bonification.ts         — striking/enclosure/recept.  │
│    aspect_patterns.ts      — grand trine, t-square, yod  │
│    natal_promise.ts        — stellium, element, modality │
│                                                           │
│  → ActivationResult (signals + conditions + sub-outputs) │
└────────────────────────────────┬─────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────┐
│ LAYER 3: PACKET  (activation_packet.ts)                  │
│  Wraps ActivationResult → structured pure-signal packet  │
│  Filters low-confidence signals, computes aggregation    │
│  → ActivationPacket                                      │
└────────────────────────────────┬─────────────────────────┘
                                 │
                  ┌──────────────┼──────────────┐
                  │              │              │
                  ▼              ▼              ▼
┌─────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ LAYER 4: MACRO  │  │ LAYER 5: 5 INTER-│  │ LAYER 6: PRACTICE│
│ (aggregator.ts)  │  │ PRETERS          │  │ (spellbook/)     │
│                  │  │                  │  │                  │
│ ActivationPacket │  │ al-Khayyāt       │  │ SpellEntry[]     │
│ → PlanetMacro-   │  │ Valens           │  │ matched by       │
│   Context[]      │  │ Ficino           │  │ trigger or       │
│ preserving ALL   │  │ Greenbaum        │  │ planet           │
│ engine data      │  │ Demetra George   │  │                  │
│                  │  │                  │  │                  │
│ → MacroTranslate │  │ → Interpretation │  │ → SpellEntry[]   │
│   ion            │  │   Theme[] x5     │  │                  │
└─────────────────┘  └────────┬─────────┘  └──────────────────┘
                              │
                              ▼
                   ┌──────────────────────┐
                   │ CONVERGENCE DETECTION │
                   │                      │
                   │ Tags appearing in    │
                   │ 3+ systems → high    │
                   │ confidence theme     │
                   │                      │
                   │ → { planets, themes, │
                   │   advice }           │
                   └──────────────────────┘

                              │
                              ▼
┌──────────────────────────────────────────────────────────┐
│ LAYER 7: KNOWLEDGE GRAPH  (knowledge_graph.ts)           │
│                                                           │
│ Shared entity IDs: planet:mars, sign:leo, corr:herb:basil│
│ Traverse: clusterByPlanet("mars") → ALL connected data   │
│                                                           │
│ Everything connected: planets → conditions → interpret-  │
│ ations → correspondences → practices → materials         │
└──────────────────────────────────────────────────────────┘
```

---

## Layer 0: Computation (caelus)

**File:** External library (`caelus`, `caelus-birth`, `caelus-wheel`)

**What:** Ephemeris computation — given birth time/place, compute planetary longitudes, signs, houses, aspects, and lots.

**Why:** Everything downstream depends on accurate planetary positions. This is the raw material.

**How:**
```
toUT({year, month, day, hour, minute, lat, lon})
  → UTC time object
engine.chart(year, month, day, hour, minute, sec, lat, lon, house_system)
  → Chart {
      bodies: { sun: { lon, sign, house, retrograde, dignities, ... }, ... },
      angles: { asc, mc },
      aspects: [{ a, b, aspect, orb, strength, phase }],
      jdUt: number
    }
```

**Key exports used:**
- `Engine` — wraps the Swiss Ephemeris
- `embeddedData` — pre-compiled ephemeris data
- `toUT` — local time to Universal Time
- `profectionAt` — annual/monthly profection calculation
- `zrAt` — Zodiacal Releasing periods
- `signRuler`, `SIGNS` — sign-ruler lookup
- `dignityScore`, `termRuler`, `faceRuler` — essential dignity calculation
- `firdariaAt` — Firdaria periods
- `almuten` — almuten (dominant planet at a degree)
- `fmtLon` — format longitude as degrees°minutes'
- `ChartWheel` — SVG chart wheel React component

---

## Layer 1: Adapter (caelus_adapter.ts)

**File:** `src/astrology/caelus_adapter.ts`

**What:** Transforms the raw caelus `Chart` into a typed `NormalizedChart` that the rest of the engine can consume.

**Why:** caelus's `Chart` format is generic (any body, any house system). The engine needs a predictable, typed interface with normalized planets, houses, lots, and aspects.

**How:**
```
normalizeChart(chart, nativeId) → NormalizedChart
```

- Maps `chart.bodies` → `NormalizedChart.natal.planets` (only 7 traditional planets, typed as `PlanetId`)
- Computes Hermetic Lots (Fortune, Spirit, Eros, Necessity, Courage, Victory, Nemesis) using day/night formulas
- Builds whole-sign houses from the Ascendant degree
- Determines day chart (Sun above/below horizon)
- Extracts aspects with typed `PlanetId` references

**Key output:**
```typescript
interface NormalizedChart {
  native_id: string;
  natal: {
    jdUt: number;
    ascendant: ZodiacPosition;
    mc: ZodiacPosition;
    planets: Record<PlanetId, PlanetPosition>;
    houses_whole_sign: HouseData[];
    aspects: AspectData[];
    lots: Record<LotName, ZodiacPosition & { house: number }>;
    day_chart: boolean;
  };
}
```

---

## Layer 2: Engine (activation_engine.ts)

**File:** `src/astrology/activation_engine.ts`

**What:** The core deterministic engine. Computes timing activations (profections, transits, ZR, firdaria), scores signals by planet, determines confidence levels, and evaluates planetary conditions.

**Why:** This is the layer that decides WHICH planets are active today, WHY they're active, and HOW strong the activation is. Every downstream layer depends on these signals.

**How:**

### Timing Systems

| System | Source | Timescale | Weight |
|---|---|---|---|
| Annual Profection | caelus `profectionAt` | yearly | 5 |
| Monthly Profection | caelus `profectionAt` | monthly | 2 |
| ZR Spirit Lord | caelus `zrAt(..., "spirit")` | yearly | 5 |
| ZR Fortune Lord | caelus `zrAt(..., "fortune")` | yearly | 4 |
| Firdaria | caelus `firdariaAt` | yearly | 4 |
| Transit to Planet | aspect between current sky and natal | daily | 1 |
| Transit to Lot | current planet conjunct natal lot | daily | 2 |
| Transit to Angle | current planet conjunct ASC/MC | daily | 1 |
| Natal Prominence | angularity, dignity, retrograde | yearly | 1-2 |
| Oikodespotes | computed daimon | yearly | 3 |

### Signal Scoring

Each activation adds weight to a planet's signal map:

```
signalMap[planet] = {
  score: sum of all activation weights,
  sources: unique timing systems triggering this planet,
  timescales: unique timescales involved,
  houses: activated house numbers,
  lots: activated lot names
}
```

### Confidence Determination

```typescript
const onlyTransit = sources.size === 1 && sources.has("transit_to_planet")
if (onlyTransit) confidence = "low"
else if (sources >= 3 && timescales >= 2 && hasTimeLord) confidence = "high"
else if (sources >= 2) confidence = "medium"
else confidence = "low"  // default
```

### Planet Conditions

For each planet, computes:
- **Sign, House** — position in chart
- **Angularity** — angular (1/4/7/10), succedent (2/5/8/11), cadent (rest)
- **Sect Status** — in_sect/out_of_sect/neutral based on day/night chart
- **Essential Dignity** — domicile, exaltation, detriment, fall, peregrine (from caelus `dignityScore`)
- **Triplicity Rulers** — Dorothean triplicity system
- **Term Ruler, Face Ruler** — from caelus
- **Retrograde** — from chart
- **Strength Score, Difficulty Score** — composite of angularity + dignity + sect + retrograde

### Key Exports

```typescript
computeActivations(input: ActivationInput) → ActivationResult
computePlanetConditions(chart) → PlanetConditionPacket[]
computeFirdaria(eng, natalJd, targetJd, lat, lon) → { lord }
determineFortuneSpiritMode(signals, chart) → { mode, fortuneScore, spiritScore, fortune, spirit }
findSkyAspects(currentSkyPlanets) → Aspect[]
```

---

## Layer 2b: Engine Sub-modules

### valens_combinations.ts

**File:** `src/astrology/valens_combinations.ts`

**What:** 21 planetary pair rules from Valens' Anthologiae Book I.21, plus generated triple combinations.

**Why:** Planetary pairs (e.g., Jupiter+Mercury = "wise speech, expansive thought") are the oldest stratum of Hellenistic astrology. They capture qualitative interactions that single-planet analysis misses.

**How:**
- 21 hardcoded `RAW_PAIRS` (all 21 Ptolemaic pairs: Saturn×Jupiter, Saturn×Mars, …, Moon×Sun)
- Each pair has: themes, opportunities, pressures
- `getPairRule(a, b)` → sorted lookup in `PAIR_RULES` map
- `generateTriple(a, b, c)` → unifies themes/opportunities/pressures from 3 component pairs
- `matchCombinations(activatedPlanets)` → returns all pairs and triples present among active planets
- Also exports `getHouseTopics(n)` → topics for each house (1-12)

### oikodespotes.ts

**File:** `src/astrology/oikodespotes.ts`

**What:** Computes the Oikodespotes ("house-master" or personal daimon) using Porphyry's method.

**Why:** The daimon is the guiding spirit of the incarnation — the planet with the most authority over the chart's key points. Per Greenbaum ch.7 and Porphyry ch.30.

**How:**
1. Find the almuten (planet with greatest essential dignity) at 5 key points:
   - Ascendant
   - Lot of Fortune
   - Lot of Spirit
   - Sun
   - Moon
2. Sum the almuten scores per planet
3. The planet with the highest total score is the Oikodespotes
4. Generate interpretation + soul choice narrative based on the planet's sign/house

### daimonic_houses.ts

**File:** `src/astrology/daimonic_houses.ts`

**What:** Tags the 4 Hellenistic daimonic houses and reports which planets occupy them.

**Why:** Per Paulus Alexandrinus and Firmicus Maternus, houses 5/6/11/12 have special daimonic significance:

| House | Tag | Meaning |
|---|---|---|
| 5 | Good Fortune (Agathe Tyche) | pleasure, children, creative expression |
| 6 | Bad Fortune (Kake Tyche) | illness, servitude, necessary labor |
| 11 | Good Daimon (Agathos Daimon) | friends, allies, hopes, guidance |
| 12 | Bad Daimon (Kakos Daimon) | enemies, suffering, hidden limitation |

**How:** `classifyDaimonicHouses(conditions)` → filters planet conditions by house number.

### antiscia.ts

**File:** `src/astrology/antiscia.ts`

**What:** Computes antiscia — planetary pairs that are symmetric across the solstice axis (0° Cancer/Capricorn).

**Why:** Per Firmicus Maternus (Mathesis), antiscia create invisible bonds between planets — activating one activates the hidden support or obstruction of the other. When a transiting planet aspects one, it also activates the antiscion partner.

**How:**
- Formula: `antiscion_degree = 30 - degree_in_sign` in the opposite-sign pair
- Sign pairs: Aries↔Virgo, Taurus↔Leo, Gemini↔Cancer, Libra↔Pisces, Scorpio↔Aquarius, Sagittarius↔Capricorn
- For each planet pair, compute A's antiscion and check if B is within 3° orb

### bonification.ts

**File:** `src/astrology/bonification.ts`

**What:** Computes Hellenistic bonification and maltreatment — five ways planets affect each other through aspect geometry.

**Why:** Per Brennan ch.14, Valens, and Antiochus: planets don't just sit in signs — they interact. These interactions qualify whether a planet is helped or harmed by its neighbors.

**Types implemented:**

| Type | Detection | Beneficial |
|---|---|---|
| Striking with a ray | Malefic (Mars/Saturn) in square/opposition within 3° orb | Never |
| Adherence | Two planets within 3° conjunction | Usually (if both benefic) |
| Enclosure | A planet between two malefics, each within 8° | Never |
| Reception | A planet in another's domicile (checks all 7 × 7 pairs) | If receiver is benefic |

### aspect_patterns.ts

**File:** `src/astrology/aspect_patterns.ts`

**What:** Detects 4 major aspect patterns in the natal chart.

**Why:** These patterns (grand trine, t-square, grand cross, yod) qualitatively transform how the planets involved express. A grand trine is harmonious flow; a t-square is dynamic tension.

**How:** Builds adjacency map of planet→planet aspects (orb ≤ 3°), then checks combinatorial patterns:

| Pattern | Condition | Planets |
|---|---|---|
| Grand Trine | 3 planets, all pairwise trine | 3 |
| T-Square | 2 oppose, both square a 3rd | 3 |
| Grand Cross | 2 oppositions, perpendicular | 4 |
| Yod | 2 sextile, both quincunx a 3rd | 3 |

### natal_promise.ts

**File:** `src/astrology/natal_promise.ts`

**What:** The baseline chart story — what the native is fundamentally, independent of timing.

**Why:** Some chart features (stellium, element predominance, unaspected planets) are structural, not temporal. They answer "what is the native's nature, what are they here to work on?"

**How:**

| Feature | Computation |
|---|---|
| Strongest planet | Highest `strength_score` across conditions |
| Most afflicted | Highest `difficulty_score` across conditions |
| Stellium | Any house with 3+ planets |
| Element predominance | Count planets per element, normalize to % |
| Modality predominance | Count planets per modality, normalize to % |
| Unaspected planets | Planets with no aspect ≤ 6° orb |
| Chart ruler | Planet that rules the most houses |
| Most aspected | Planet with the most aspects ≤ 6° orb |

---

## Layer 3: Packet (activation_packet.ts)

**File:** `src/astrology/activation_packet.ts`

**What:** Wraps the engine's `ActivationResult` into a clean, structured `ActivationPacket` — pure signals with no interpretation or practice overlay.

**Why:** This is the contractual boundary between computation and interpretation. Interpreters read the packet, not the engine directly. This ensures:
- Interpreters get exactly the same data regardless of engine changes
- All engine data is preserved (never summarized or dropped in the packet)
- The packet is serializable (JSON-compatible) for API transport

**What it adds on top of `ActivationResult`:**
1. Filters out `low` confidence signals (unless they're `natal_prominence` or `oikodespotes`)
2. Injects firdaria into signal scores if provided
3. Computes Fortune/Spirit mode from signals
4. Aggregates activated_planets, activated_houses, activated_lots, activated_topics
5. Runs all sub-modules: valens combinations, daimonic houses, antiscia, bonification, aspect patterns, natal promise
6. Builds graph_trace (why_this_planet, source_edges)

**Key types:**
```typescript
interface ActivationPacket {
  date: string;
  native_id: string;
  atmosphere: { daily, weekly, monthly, yearly: TimescaleSlice };
  signals: { planet, score, confidence, timing_sources, timescales, activated_houses, activated_lots, condition }[];
  activated_planets: PlanetId[];
  activated_houses: number[];
  activated_lots: LotName[];
  activated_topics: string[];
  fortune_score: number;
  spirit_score: number;
  dominant_mode: "fortune" | "spirit" | "mixed";
  planet_conditions: PlanetConditionPacket[];
  daimonic_houses: { good_fortune, bad_fortune, good_daimon, bad_daimon };
  oikodespotes?: OikodespotesResult;
  antiscia: AntisciaConnection[];
  bonification: BonificationCondition[];
  fixed_stars: StarConjunction[];
  aspect_patterns: AspectPattern[];
  valens_combinations: PlanetCombination[];
  natal_promise: NatalPromise;
  graph_trace: { why_this_planet: string[]; source_edges: string[] };
}
```

---

## Layer 4: Macro Translation (interpreters/aggregator.ts)

**File:** `src/astrology/interpreters/aggregator.ts`

**What:** Transforms the ActivationPacket into `PlanetMacroContext[]` — one structured context per active planet that preserves ALL engine data in a canonical, never-summarized format.

**Why:** This is the "single source of truth" for all downstream interpreters. Rather than each interpreter re-parsing the packet, they read a standardized macro context. This ensures every interpreter sees the same planet data (sign, house, dignity, timing, pairs, daimon status) without duplication or loss.

**How:**
1. For each signal, build a `PlanetMacroContext`:
   - Planet nature (from Valens I.1)
   - Sign, element, modality
   - House + house topics
   - Dignity + angularity + retrograde
   - Timing sources (in human-readable form)
   - Valens pairs involving this planet
   - al-Khayyāt rule if one matches
   - Is this the daimon?
2. Extract timescales (year/month/week/day) from timing signals
3. Generate `readings` — interpretive text from the macro context (nature + sign + house + dignity + timing)
4. Generate `practices` — macro-level practice recommendations (e.g., "Saturn year practice", "Daimon active practice")

**Key principle:** "Nothing is lost." Every data field from the engine is carried through in `PlanetMacroContext`. The macro translation is a lossless transform.

---

## Layer 5: Interpreters (interpretation_schema.ts + interpreters/)

**File:** `src/astrology/interpretation_schema.ts` (orchestrator)
**Files:** `interpreters/demetra.ts`, plus inline interpreters in `interpretation_schema.ts`

**What:** 5 interpretive systems reading the same ActivationPacket, each producing structured `InterpretationTheme[]` from a different tradition.

**Why:** Multiple traditions provide complementary perspectives. Convergence (agreement across 3+ systems) gives high-confidence guidance. No single system is authoritative — wisdom emerges from the pattern across traditions.

### Interpreter 1: al-Khayyāt (9th C, Arabic)

**Source:** "On the Judgments of Nativities" Ch.47

**Method:** Fixed lookup table. 84 rules (7 planets × 12 houses). Each is a direct quote from the source text.

**Example:** `{ planet: "saturn", house: 1, delineation: "Difficulty in all works, death from a catastrophe of the land or on account of debt." }`

**Why:** Concrete life outcomes — career, health, relationships, wealth. No abstraction, just direct traditional judgment.

### Interpreter 2: Valens (2nd C, Hellenistic)

**Source:** Anthologiae Book I.21

**Method:** Pair matching. For each pair of active planets, checks the Valens pair rules and returns themes, opportunities, and pressures.

**Example:** `Jupiter + Mercury → "wise speech, expansive thought, teaching"`

**Why:** Planetary pairs capture interaction dynamics that single-planet analysis misses.

### Interpreter 3: Ficino (15th C, Renaissance)

**Source:** De Vita (Three Books on Life)

**Method:** Planet profile lookup. Each active planet is matched to its Ficinian profile (qualities, healthy/distorted expression, practices, sensory correspondences).

**Why:** Ficino focuses on WHAT TO DO — practice, attunement, and sensory alignment. His system is the most actionable.

### Interpreter 4: Greenbaum (modern daimon ontology)

**Source:** "The Daimon in Hellenistic Astrology"

**Method:** Two determinations:
1. Daimon active: if the oikodespotes planet has a signal, it's a daimonic period
2. Fortune vs Spirit mode: from the packet's dominant mode

**Why:** The daimon framework distinguishes between what happens TO you (Fortune) and what you DO (Spirit). It's the only system that provides this ontological distinction.

### Interpreter 5: Demetra George (2022, modern traditional)

**Source:** "Ancient Astrology in Theory and Practice" Vol 2

**Method:** Generative 6-step sentence structure. Each planet gets a 6-sentence delineation:
1. The planet signifies [nature]
2. It is in [sign] which is [gender] [modality] [element]
3. Therefore it expresses [expression]
4. It is in the [ordinal] house of [topics]
5. Its condition is [strong/moderate/challenged] [dignity note] [retrograde note]
6. Therefore the native's [signification] is expressed through [domain] with [effectiveness]

**Why:** Unlike al-Khayyāt's fixed lookup, Demetra's method dynamically generates interpretations for any planet in any sign/house/condition. It doesn't require exact rule matches.

### Convergence Detection

After all 5 interpreters run, the orchestrator:
1. Collects all `tags` from all interpretation themes
2. Counts how many unique systems each tag appears in
3. Tags appearing in 3+ systems → convergence:
   - If tag is a planet name → `convergence.planets[]`
   - Otherwise → `convergence.themes[]`
   - Shared practices → `convergence.advice[]`

**Why:** Convergence across independent traditions is more reliable than any single system. If al-Khayyāt, Valens, and Ficino all highlight Saturn, Saturn is genuinely important today.

---

## Layer 6: Practice Recommender (spellbook/)

**Files:**
- `spellbook/types.ts` — `SpellEntry` interface
- `spellbook/spellbook.ts` — spell data + graph registration
- `spellbook/correspondences.ts` — correspondence data + graph registration
- `ritual_references.ts` — Ficino/Orphic/Picatrix/Agrippa/PGM ritual references

**What:** The practice layer — concrete rituals, prayers, meditations, talismans, and actions matched to the current activation state.

**Why:** Analysis without practice is sterile. The spellbook connects "what's active" to "what to DO about it."

### SpellEntry Format

```typescript
interface SpellEntry {
  id: string;                    // e.g. "ficino:solar:001"
  source: SpellSource;           // Ficino | Orphic | Picatrix | Agrippa | PGM | GoldenDawn
  type: "ritual" | "prayer" | "meditation" | "talisman" | "music" | "action";
  triggers: string[];            // e.g. ["trigger:active:sun"]
  planets: string[];             // shared entity IDs: ["planet:sun"]
  purpose: string[];             // ["vitality", "leadership"]
  title: string;
  summary: string;
  procedure: string[];
  incantation?: string;
  timing?: SpellTiming;          // planetary day/hour, moon phase
  materials?: SpellMaterials;    // herbs, metals, colours, stones
  safety: SafetyClass;           // safe_symbolic | historical_reference | restricted
  safeAdaptations: string[];
}
```

### Registration in Graph

`registerSpellbookInGraph()` does three things:
1. Registers each `SpellEntry` as a graph node with layer `"practice"`
2. Creates edges: `spell:<id> --practice_for--> planet:<name>`
3. Registers materials as edges: `spell:<id> --uses_material--> corr:herb:basil`

### Correspondences

`correspondences.ts` contains ~250 `CorrespondenceEntry` objects across 15 types (herb, metal, colour, stone, incense, animal, day, number, archangel, divine_name, musical_note, body_part, sense, spirit). Each links to a planet via shared IDs.

### Ritual References

`ritual_references.ts` contains 28 curated references from Ficino, Orphic Hymns, Picatrix, Agrippa, and PGM — one per planet per source. Each has a safety classification and symbolic adaptations. These are displayed in the analysis tab and used by the chat daimon.

---

## Layer 7: Knowledge Graph (knowledge_graph.ts)

**File:** `src/astrology/knowledge_graph.ts`

**What:** An in-memory graph database with shared entity IDs. Every node across all layers uses the same ID format — `planet:mars`, `sign:leo`, `house:1`, `corr:herb:basil`.

**Why:** The graph is the connective tissue of the entire system. It enables:
- `clusterByPlanet("mars")` → get ALL related data in one traversal
- Cross-layer queries: conditions + interpretations + correspondences + practices
- Dynamic session data layered on top of static entities
- The LLM can query "what's connected to Mars?" and get the full picture

**How:**

### Node Registration

| Layer | Examples | Registered By |
|---|---|---|
| Static | `planet:sun`, `sign:aries`, `house:1`, `element:fire` | `registerStaticEntities()`, `registerStandardCorrespondences()` |
| Interpretation | `rule:valens:pair:jupiter+mercury`, `profile:mars` | `registerSourceRulesInGraph()`, `registerPlanetProfilesInGraph()` |
| Practice | `spell:picatrix:mars:001`, `corr:herb:basil` | `registerSpellbookInGraph()` |
| Computation | `condition:mars_detriment`, `theme:sun_ficino_...` | `pushActivationToGraph()` |

### Edge Types

| Predicate | Direction | Example |
|---|---|---|
| `ruled_by` | sign → planet | `sign:aries --ruled_by--> planet:mars` |
| `has_element` | sign → element | `sign:aries --has_element--> element:fire` |
| `has_quality` | planet → quality | `planet:mars --has_quality--> quality:courageous` |
| `corresponds_to` | correspondence → planet | `corr:herb:basil --corresponds_to--> planet:mars` |
| `practice_for` | spell → planet | `spell:picatrix:mars:001 --practice_for--> planet:mars` |
| `interpreted_by` | planet → interpretation | `planet:mars --interpreted_by--> theme:mars_al-khayyat_...` |
| `has_condition` | planet → condition | `planet:mars --has_condition--> condition:mars_detriment` |
| `is_daimon` | planet → daimon | `planet:mercury --is_daimon--> daimon:mercury` |

### Key Query: `clusterByPlanet`

```typescript
clusterByPlanet("mars") → {
  nodes: [
    { id: "planet:mars", layer: "correspondence", ... },
    { id: "condition:mars_detriment", layer: "computation", ... },
    { id: "corr:herb:basil", layer: "correspondence", ... },
    { id: "spell:picatrix:mars:001", layer: "practice", ... },
    ...
  ],
  edges: [
    { subject: "planet:mars", predicate: "has_condition", object: "condition:mars_detriment" },
    { subject: "corr:herb:basil", predicate: "corresponds_to", object: "planet:mars" },
    { subject: "spell:picatrix:mars:001", predicate: "practice_for", object: "planet:mars" },
    ...
  ]
}
```

### Session Management

`clearSessionData()` removes nodes in `computation` and `interpretation` layers but preserves `static`, `correspondence`, and `practice` layers. This allows fresh computation without re-registering the entire graph.

---

## Assembly Layer: Daily Sphere Reader (daily_sphere_reader.ts)

**File:** `src/astrology/daily_sphere_reader.ts`

**What:** Assembles the final `DailySphereReading` by layering interpretation data (planet profiles, alignment, daimonic interpretation) on top of the pure ActivationPacket.

**Why:** The packet is pure signal. The reader adds the human-facing layer — alignment advice, daimonic interpretation categories, ritual references. This is what the UI renders.

**How:**
1. Build the ActivationPacket via `buildActivationPacket(input)`
2. Push activation into knowledge graph via `pushActivationToGraph()`
3. For top 4 activated planets: determine alignment mode from PlanetProfile (strengthen/balance/cool/stabilize/discipline)
4. Get ritual references for top 3 planets
5. Build daimonic interpretation categories: life_activity, opportunity, pressure, distortion
6. Assemble into `DailySphereReading`

**Key types:**
```typescript
interface DailySphereReading {
  date: string;
  native_id: string;
  atmosphere: { daily, weekly, monthly, yearly };
  natal_activation: { activated_planets, houses, lots, topics, confidence };
  daimonic_houses: { good_fortune, bad_fortune, good_daimon, bad_daimon };
  daimonic_interpretation: { mode, life_activity, opportunity, pressure, distortion };
  alignment: { planet, mode, ficinian_advice, music, colour, scent, activity }[];
  ritual_references: RitualReference[];
  planet_conditions: PlanetConditionPacket[];
  fortune_layer: { active, lot_house, topics, confidence };
  spirit_layer: { active, lot_house, topics, confidence };
  oikodespotes?: OikodespotesResult;
  antiscia: AntisciaConnection[];
  fixed_stars: StarConjunction[];
  bonification: BonificationCondition[];
  aspect_patterns: AspectPattern[];
  graph_trace: { why_this_planet, why_this_advice, source_edges };
}
```

---

## Assembly Layer: Build Snapshot (build_snapshot.ts)

**File:** `src/astrology/build_snapshot.ts`

**What:** Transforms engine + interpreters + spellbook into a `DailySnapshot` — the maximally granular output object that an LLM (or API consumer) can render from.

**Why:** The `DailySphereReading` is optimized for UI rendering. The `DailySnapshot` is optimized for LLM consumption — it groups engine data, interpretations, practices, and correspondences into one flat structure that the LLM can render without additional tool calls.

**How:**
- Extracts engine signals, planet conditions, aspect patterns, antiscia, bonification, valens combinations
- Carries macro timescapes directly
- Carries 5-system interpretations directly
- Carries convergence
- Joins practices with their source text (Orphic hymns, Picatrix incantations) via `SOURCE_TEXTS` map
- Groups correspondences by type (herbs, metals, colours, stones)

---

## File Index

| File | Layer | Purpose | Lines |
|---|---|---|---|
| `caelus_adapter.ts` | 1 | Chart → NormalizedChart | 159 |
| `activation_engine.ts` | 2 | Timing, scoring, confidence, conditions | 593 |
| `valens_combinations.ts` | 2b | 21 planetary pair rules | 155 |
| `oikodespotes.ts` | 2b | Personal daimon (Porphyry) | 99 |
| `daimonic_houses.ts` | 2b | 5/6/11/12 house tagging | 51 |
| `antiscia.ts` | 2b | Solstice-axis mirror bonds | 59 |
| `bonification.ts` | 2b | Striking, enclosure, reception | 125 |
| `aspect_patterns.ts` | 2b | Grand trine, t-square, yod | 116 |
| `natal_promise.ts` | 2b | Baseline chart story | 133 |
| `activation_packet.ts` | 3 | Pure signal packet | 214 |
| `interpreters/aggregator.ts` | 4 | Macro translation | 305 |
| `interpretation_schema.ts` | 5 | 5-system orchestrator + convergence | 268 |
| `interpreters/demetra.ts` | 5 | Demetra 6-step generator | 132 |
| `planet_profiles.ts` | 5 | Ficinian planet profiles | 127 |
| `source_rules.ts` | 5 | al-Khayyāt + Valens + Fortune rules | 254 |
| `spellbook/types.ts` | 6 | SpellEntry interface | 105 |
| `spellbook/spellbook.ts` | 6 | Spell data + graph registration | ~730 |
| `spellbook/correspondences.ts` | 6 | Correspondence data | ~150 |
| `spellbook/validate.ts` | 6 | Validation script | — |
| `ritual_references.ts` | 6 | Ficino/Orphic/Picatrix/Agrippa/PGM refs | 236 |
| `knowledge_graph.ts` | 7 | In-memory graph with shared IDs | 341 |
| `daily_sphere_reader.ts` | Assembly | DailySphereReading assembly | 141 |
| `build_snapshot.ts` | Assembly | LLM-ready DailySnapshot | 114 |
| `types.ts` | — | All shared types | 308 |
| `ENGINE_MAP.md` | — | Architecture diagram | 180 |
| `daily_snapshot.ts` | — | DailySnapshot type | — |
