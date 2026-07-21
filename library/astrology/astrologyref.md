# Astrology Engine — Complete Reference

## Project Structure

```
src/astrology/               ← Core engine (deterministic, zero external deps)
  types.ts                   ← All shared types
  caelus_adapter.ts          ← Wraps caelus Chart → NormalizedChart
  activation_engine.ts       ← Timing + scoring + conditions
  activation_packet.ts       ← Pure ActivationPacket (signals only, no interpretation)
  daily_sphere_reader.ts     ← Assembles full reading (signals + interpretation)
  planet_profiles.ts         ← 7 Valens-grounded profiles
  valens_combinations.ts     ← 21 pair rules + triple generator
  ritual_references.ts       ← 28 curated historical references
  source_rules.ts            ← 117 structured rules from Valens + al-Khayyāt
  oikodespotes.ts            ← Personal daimon computation
  daimonic_houses.ts         ← 5/6/11/12 house tagging
  antiscia.ts                ← Hidden solstice-axis connections
  bonification.ts            ← Striking, enclosure, adherence, reception
  aspect_patterns.ts         ← Grand trine, T-square, grand cross, yod
  knowledge_graph.ts         ← Typed in-memory graph with shared entity IDs
  containment.ts             ← LLM output validation (anti-hallucination)
  natal_promise.ts           ← Baseline chart patterns (stellium, element, etc.)
  personal_report.ts         ← Personal daimonic report generator
  diary_integration.ts       ← Daily snapshot + journal entry types

src/pipeline/               ← Training & validation (separate from engine)
  types.ts                   ← Pipeline-specific types
  fetch.ts                   ← Wikidata SPARQL queries
  fetch_ogdb.ts             ← Open Gauquelin Database download
  geocode.ts                ← Open-Meteo geocoding
  store.ts                   ← SQLite/JSON storage (separate from app DB)
  compute.ts                ← Batch chart computation
  experiment_daimon.ts      ← Chi-square test for daimon-vocation
  experiment_death.ts       ← Death date timing test
  chart_similarity.ts       ← Cosine similarity nearest neighbor search
  report.ts                 ← Markdown report generator

src/app/astrology/page.tsx   ← UI at /astrology (macro view, interpretations, daimonic chat)
src/app/birth-chart/page.tsx ← UI at /birth-chart

src/astrology/interpretation_schema.ts  ← 5-system interpretation framework
src/astrology/interpreters/
  aggregator.ts    ← Macro translation (canonical layer, preserves all engine data)
  demetra.ts       ← Demetra George generative 6-step interpreter
  macro_view.ts    ← (merged into aggregator.ts)

src/astrology/spellbook/
  types.ts              ← SpellEntry, SpellbookQuery types with trigger-based matching
  spellbook.ts          ← 13 entries + query engine + practice recommender
  correspondences.ts    ← 69 entries across 9 types, all with chapter-level citations
  validate.ts           ← Validation script
  ARCHITECTURE.md       ← Spellbook architecture doc
  EXTRACTION_SPEC.md    ← Extraction priorities and source inventory
```

## Architecture

```
BIRTH DATA + TIME → COMPUTATION (caelus) → ENGINE (ActivationPacket) → MACRO TRANSLATION (aggregator)
                                                                              ↓
                                                    ┌──────────────────────────────────────┐
                                                    │          5 INTERPRETERS              │
                                                    │  al-Khayyāt · Valens · Ficino       │
                                                    │  Greenbaum · Demetra George         │
                                                    └──────────────────┬───────────────────┘
                                                                       ↓
                                                              CONVERGENCE DETECTION
                                                                       ↓
                                                          PRACTICE RECOMMENDER (spellbook)
                                                                       ↓
                                                          KNOWLEDGE GRAPH (entity IDs)
```

**Six layers, all connected through shared entity IDs (planet:mars, sign:leo):**

| Layer | What it does | File |
|---|---|---|
| **Engine** | Pure signal detection. Timing, scoring, confidence, conditions. | `activation_packet.ts`, `activation_engine.ts` |
| **Macro Translation** | Preserves ALL engine data as structured PlanetMacroContext[]. Never summarized. | `interpreters/aggregator.ts` |
| **Interpreters** | 5 systems read the same packet and output structured perspectives. | `interpretation_schema.ts`, `interpreters/*.ts` |
| **Convergence** | Counts agreement across interpreters. Planets flagged by 3+ systems = high confidence. | (built into interpretation_schema.ts) |
| **Practice** | Spellbook with trigger-based matching. Queries by engine state. | `spellbook/spellbook.ts`, `spellbook/types.ts` |
| **Correspondence** | Standalone tables (herbs, metals, colours, stones, incenses) with chapter citations. | `spellbook/correspondences.ts` |
| **Knowledge Graph** | One graph, shared IDs. `clusterByPlanet("mars")` returns everything. | `knowledge_graph.ts` |

## What The Engine Does

Takes birth date + current time → produces `DailySphereReading`:

```ts
{
  date: "2026-07-09",
  natal_activation: { activated_planets, houses, lots, topics, confidence },
  planet_conditions: [{ planet, sign, house, angularity, dignities, retrograde, ... }],
  daimonic_interpretation: { mode, life_activity, opportunity, pressure, distortion },
  atmosphere: { daily, weekly, monthly, yearly timeline slices },
  oikodespotes: { planet, interpretation, soul_choice },
  fortune_layer: { active, lot_house, topics, confidence },
  spirit_layer: { active, lot_house, topics, confidence },
  daimonic_houses: { good_fortune, bad_fortune, good_daimon, bad_daimon },
  antiscia: AntisciaConnection[],
  bonification: BonificationCondition[],
  aspect_patterns: AspectPattern[],
  alignment: [{ planet, mode, music, colour, scent, activity }],
  ritual_references: RitualReference[],
  graph_trace: { why_this_planet, source_edges }
}
```

## Timing Systems (Weighted)

| System | Weight | Timescale | Source |
|---|---|---|---|
| Annual profection | +5 | yearly | Brennan ch.17 |
| ZR Spirit lord | +5 | yearly | Valens, Brennan ch.18 |
| ZR Fortune lord | +4 | yearly | Valens, Brennan ch.18 |
| Firdaria lord | +4 | yearly | Persian tradition, caelus |
| Monthly profection | +2 | monthly | Brennan ch.17 |
| Transit to lot | +2 | daily | Valens |
| Transit to natal planet | +1 | daily | — |
| Transit to angle | +1 | daily | — |
| Sky aspect (planet-planet) | +1 | daily | — |
| Natal prominence | +1-2 | natal | Angularity, dignity, retrograde |
| Oikodespotes | +3 | natal | Porphyry, Greenbaum ch.7 |

**Confidence rules:**
- **High**: 3+ independent sources, 2+ timescales AND a time-lord source
- **Medium**: 2+ sources
- **Low**: Single transit only (suppressed unless multiple transits converge)

## Source Texts Ingested

| Text | Author | Lines | Key content used |
|---|---|---|---|
| Hellenistic Astrology | Chris Brennan (2017) | 30,574 | House system, sect, profections, ZR, bonification (ch.14), triplicity lords (ch.15) |
| The Daimon in Hellenistic Astrology | Dorian Greenbaum (2016) | 26,951 | Fortune/Spirit ontology, daimonic houses (ch.2,4), oikodespotes/personal daimon (ch.7), lots (ch.8-10) |
| Ancient Astrology Vol 2 | Demetra George (2022) | ~12,000 | House classification, planetary condition scoring, angularity |
| Matheseos Libri VIII | Firmicus Maternus (c. 334 CE) | 17,386 | Cardines/angles, antiscia, decans, terms |
| Anthologiae | Vettius Valens (c. 175 CE) | 28,427 | 21 planetary pairs (I.21), lots, firdaria |
| On the Judgments of Nativities | al-Khayyāt (c. 850 CE) | (in PN1) | 84 planet-in-house rules (ch.47), 84 planet-in-sign rules (ch.39-45), Lot of Fortune in houses (ch.49) |
| Persian Nativities Vol I | Māshā'allāh (c. 800 CE) | 17,465 | Hyleg/kadukhudhah, life span, profession judgments |
| The Great Introduction | Abu Ma'shar (c. 850 CE) | 29,947 | Planetary conditions (Bk V), lots (Bk VIII), triplicities |
| Introduction to the Tetrabiblos | Porphyry (c. 270 CE) | (via Greenbaum) | Oikodespotes as personal daimon, 5-point method |
| Three Books on Life | Marsilio Ficino (1489) | (via profiles) | Planetary attunement, music therapy, spiritus |
| Picatrix (Liber Atratus) | Greer & Warnock tr. | (via JSON) | Ritual correspondences |
| Three Books of Occult Philosophy | Agrippa (1533) | (via refs) | Planetary correspondences, sephiroth, archangels |
| Orphic Hymns | Various | (via refs) | 7 planetary hymns |
| Harmonices Mundi | Johannes Kepler (1619) | 3,892 | Planetary voice assignments (bass/tenor/alto/soprano), angular distance → interval |
| Astrological Magic | Dykes & Gibson (2012) | 9,367 | Golden Dawn planetary rituals, meditations |

## Experiments & Results

### Daimon Validation (OGDB, n=2,516 with real birth times)

**Result**: χ² = 31.64, df = 30, p > 0.05. NOT significant.

**Key finding**: Mercury dominates the almuten calculation across ALL domains (~28%). This base rate bias drowns out domain-specific signals. The almuten scoring from caelus needs calibration.

**Directional signals found**:
| Domain | Expected | Observed | Baseline | Signal |
|---|---|---|---|---|
| Musician | Venus | 20.3% | 14.2% | +43% relative |
| Writer | Mercury | 29.0% | 27.4% | +6% relative (drowned by bias) |
| Athlete | Mars | 14.0% | 13.9% | None — Gauquelin's effect was about angular houses, not almuten |

**Lesson**: The oikodespotes → vocation test is flawed because: (a) one planet → multiple vocations (Mercury = writer OR philosopher), (b) occupation ≠ daimon expression, (c) almuten has systematic bias. The Gauquelin angularity test (Mars in angular houses for athletes) is a better experiment but wasn't run.

### Nearest Neighbor Search (3,425 OGDB charts)

**Thomas Prior (May 16, 1999, Ascot)** top clusters:
- Artists (7/40) — Sun Taurus + Moon Gemini = creative but grounded
- Scientists (7/40) — Mercury oikodespotes = analytical
- Writers (5/40) — Mercurial communication
- Athletes (5/40) — Mars angular in H1

**Interpretation**: The chart structure is genuinely ambiguous between artistic and analytical domains. This matches the Taurus+Gemini+Mercury combination — the daimon calls toward bridging creative and analytical worlds.

### OGDB Dataset Analysis

| Metric | Value |
|---|---|
| Total records with birth times | 24,539 |
| Top occupations | military (3,807), physician (3,740), politician (1,987), painter (1,911), actor (1,793) |
| Birth time quality | All 24,539 have hour+minute |
| Geographic coverage | Mostly European (France, Germany, Italy, UK) |
| Access | Free CSV at https://opengauquelin.org/downloads |

## Known Issues & Biases

| Issue | Impact | Status |
|---|---|---|
| Mercury almuten bias | Mercury wins ~28% across all domains | Unresolved. Needs dignity weight calibration |
| Noon birth time default | Incorrect houses for almuten calculation | Mitigated: OGDB has real birth times |
| Occupation label noise | "Scientist" includes physicians, researchers, etc. | Mitigated: domain grouping helps |
| European geographic bias | OGDB is mostly French/German/Italian | Acceptable for pilot |
| Control group systematic bias | Noon + fixed lat = Saturn dominates | Avoided: chi-square test doesn't need control group |

## Key Architectural Decisions

1. **Packet before prose**: `ActivationPacket` is complete before any LLM rendering. Renderers are interchangeable.
2. **Anti-hallucination**: LLM prompts have strict "DO NOT" rules. Post-hoc validation checks every planet/house/rule ID in the output.
3. **Engine ↔ Interpretation separation**: `activation_packet.ts` produces pure signals. `daily_sphere_reader.ts` layers interpretation on top. The engine never imports interpretation data.
4. **Pipeline isolation**: `src/pipeline/` imports from the engine, but the engine never imports from pipeline. Pipeline excluded from main tsconfig.
5. **Knowledge graph**: Typed in-memory Map with shared entity IDs (`planet:mars`, `sign:leo`). No Kùzu/Neo4j. Plain TypeScript.

## What's Actually Useful (Not What's Academic)

The engine's real value isn't proving astrology statistically — it's providing a **personal daimonic navigation system**:

1. **Daily ActivationPacket** → tells you what energies are active today
2. **Chart Echoes** → shows you people with similar charts and what they did
3. **Life Chapter Tracking** → shows the macro pattern of your years (profections)
4. **Personal Diary Integration** → records YOUR experience against the engine's signals
5. **Personalized Weights** → learns which timing systems matter for YOU over time

## Thomas Prior — Personal Reference

**Born**: May 16, 1999, 14:37, Ascot, England (51.41°N, 0.67°W)

| Planet | Sign | House | Dignity | Notes |
|---|---|---|---|---|
| Sun | Taurus 25° | H8 | Peregrine | Material-spiritual transformation |
| Moon | Gemini 11° | H9 | Peregrine | Quick, curious mind in philosophy |
| Mercury | Taurus 15° | H8 | Peregrine | **Oikodespotes** — daimon |
| Venus | Cancer 9° | H10 | Peregrine | Angular — career through harmony |
| Mars | Libra 27° Rx | H1 | **Detriment** | Angular — Rx assertion in H1 |
| Jupiter | Aries 22° | H7 | Peregrine | — |
| Saturn | Taurus 9° | H8 | Peregrine | Three planets in H8 = stellium |

**ASC**: Libra 2° | **Fortune**: Virgo H12 | **Spirit**: Libra H1
**Oikodespotes**: Mercury (score 17)
**Soul choice**: "The soul chose Mercurial incarnation. Mercury in Taurus in the 8th house — speech and thought as instruments of becoming."
**Current chapter (age 27)**: Profection H4 (Saturn), Firdaria Mercury, ZR Spirit Libra, ZR Fortune Jupiter. Mixed mode.
**Full chain test (today)**: Year H4 (Saturn) → Month H4 (Saturn) → Day signals: Jupiter (high), Mercury (med), Venus (high), Saturn (high), Mars (med) → Convergence: 5 planets → Practices: Warming Saturn, Mercurial Study, Venusian Harmony, Orphic Hymn to Hermes

## Build Status

| Component | Status | Notes |
|---|---|---|
| Engine core (16 layers) | ✅ Complete | 54/54 passing |
| Macro Translation | ✅ Complete | `aggregator.ts` — preserves all engine data |
| 5 Interpreters | ✅ Complete | al-Khayyāt, Valens, Ficino, Greenbaum, Demetra George |
| Convergence Detection | ✅ Complete | Planets flagged by 3+ systems |
| Daimonic Chat (LLM) | ✅ Complete | Conversational interface at `/astrology` |
| Knowledge Graph | ✅ Complete | `clusterByPlanet()` returns everything |
| Source Rules (117) | ✅ Complete | Valens + al-Khayyāt |
| LLM Containment | ✅ Complete | Post-hoc validation |
| UI Page | ✅ Complete | `/astrology` with macro view, interpretations, chat |
| Spellbook (13 entries) | ✅ Complete | Trigger-based matching, validated |
| Correspondences (69) | ✅ Complete | 9 types, chapter-level citations |
| Skinner Reference | ✅ Complete | 81K lines for cross-verification |
| Chart Similarity | ✅ Complete | Nearest neighbor search |
| Personal Report | ✅ Complete | CLI tool |
| OGDB Integration | ✅ Complete | 24K records with real birth times |
| Daimon Experiment | ✅ Complete | χ² = 31.64, p > 0.05 |
| Daily Diary Recording | ⬜ Not built | Spec in `diary_integration.ts` |
| Life Path DB (27 years) | ⬜ Not built | Track yearly astrology retroactively |
| Personalized Weights | ⬜ Not built | Needs diary data |

## Recommended Next Steps

| Priority | What | Why | Effort |
|---|---|---|---|
| **1** | Extract spell entries from Agrippa text (970K) | Largest source of planetary operations. Text is fully readable. | 4h |
| **2** | Extract spell entries from Picatrix text (26K lines) | Planetary images, suffumigations, prayers from 4 sages per planet | 3h |
| **3** | Extract spell entries from PGM text (1.2M) | ~100 spell formulae via regex | 3h |
| **4** | Wire practice recommender into UI | Show recommended practices below convergence in `/astrology` | 1h |
| **5** | Daily diary recording | Log ActivationPacket + user notes to D1. Enables personalized weights later. | 2h |
| **6** | Skinner cross-verification | Validate our 69 correspondence entries against Skinner's 81K tables | 2h |
| **7** | Life path DB | Compute yearly astrology for all past years, track against life events | 3h |
