# Daimonic Astrology Analysis Engine — Build Notes

## Repository

`src/astrology/` — 7 engine modules, 2 test files, 54 tests.
`src/app/astrology/page.tsx` — UI page at `/astrology`.

## Source Hierarchy

The engine is structured around five layers of source authority, per the V1 spec:

| Layer | Source | What they define |
|---|---|---|
| Core technique | Valens, Dorotheus, Paulus, Rhetorius | Planetary combinations, house topics, lots, timing |
| Implementation map | Chris Brennan (2017) | Whole sign houses, sect, profections, ZR, timing hierarchy |
| Daimonic ontology | Dorian Greenbaum (2016) | Fortune/Spirit split, daimon as soul/intention, lots as destiny functions |
| Practice | Marsilio Ficino | Planetary attunement, music, spiritus, soul-care |
| Historical reference | Picatrix, Agrippa, PGM, Orphic Hymns | Ritual correspondences with safety classification |

## Module Architecture

```
caelus (ephemeris engine)
  → caelus_adapter.ts (wrap Chart → NormalizedChart)
    → activation_engine.ts (multi-timescale scoring)
      → valens_combinations.ts (21 pair rules + triple gen)
      → planet_profiles.ts (7 profiles)
      → ritual_references.ts (28 refs)
        → daily_sphere_reader.ts (orchestrator → DailySphereReading)
          → astrology/page.tsx (UI)
```

## What Has Been Built

### Completed (MVP)

- **Birth chart calculator**: caelus (npm) computes charts client-side with embedded VSOP87 data
- **Normalized chart adapter**: wraps caelus Chart → `NormalizedChart` with whole-sign houses, all 7 Hermetic lots, day/night detection
- **Planet profiles**: 7 Valens-grounded profiles with daimonic function, healthy/distorted expression, colours, scents, music, activities, hymns
- **Valens combinations**: all 21 Book I.21 pair rules with themes/opportunities/pressures, plus triple generator from pairs
- **Multi-timescale activation engine**: yearly (annual profection +5, ZR Spirit +5, ZR Fortune +4), monthly (+2), daily transits (+1), natal prominence (+1-2)
- **Natal prominence scoring**: angular houses, domicile/exaltation, retrograde, detriment/fall all contribute baseline activation
- **Planet condition packets**: essential dignity, sect status, angularity, retrograde tracked per planet
- **Fortune/Spirit layer separation**: lot house + topics + confidence for both Fortune and Spirit, with semantic activation via lot lord tagging
- **Alignment mode selection**: now uses distorted_expression from planet profiles → correctly assigns cool/mars, strengthen/saturn, balance/jupiter, discipline default
- **Ritual references**: 28 curated entries from Ficino (7), Orphic Hymns (7), Picatrix (7), PGM (2), Agrippa (5), all with safety classification and safe adaptations
- **Determinism guarantee**: identical input always produces identical JSON output
- **UI page**: `/astrology` with birth form, D1 profile save/load, activation cards, timescale breakdown, daimonic interpretation, alignment cards, LLM renderer, raw packet toggle, ritual references, graph trace
- **D1 integration**: birth chart saved to `users.profile.birthChart` via `PATCH /api/profile`, auto-loaded on page mount via `GET /api/profile`

### Test Coverage (54 tests, all passing)

| Test file | Tests | What it covers |
|---|---|---|
| `mvp.test.ts` | 19 | Determinism, activation scoring, Fortune/Spirit split, Valens pairs/triples, planet profiles completeness, alignment mode selection, ritual references integrity, house topics, full smoke tests for day+night |
| `coherence.test.ts` | 35 | Real caelus engine integration (chart + normalize), 10 Valens pair theme matches against Book I.21, triple pair composition, Greenbaum Fortune/Spirit semantics (Paulus ch.23, Valens I.1), Dorotheus/Paulus house topic definitions all 12, dignityScore from caelus, Ficino cooling Mars, Picatrix classification, Orphic Hymn safety, real chart end-to-end with Brennan natal, determinism verification |

## Fixes Applied After Initial Review

### Issue 1: Missing planetary condition
**Problem**: Engine computed activation scoring but had no structured dignities/angularity/sect/retrograde data in the output.
**Fix**: Added `PlanetConditionPacket` type with `sect_status`, `angularity`, `essential_dignity`, `dignity_total`, `peregrine`, `retrograde`, `strength_score`, `difficulty_score`. Integrated into both `ActivationResult` and `DailySphereReading` as `planet_conditions[]`. UI now shows condition cards per planet.
**Verification**: Venus shows "detriment Rx", Saturn shows "out_of_sect Rx", Mercury shows "neutral cadent".

### Issue 2: No natal prominence scoring
**Problem**: The engine only scored current activation (transits + time-lords). The Sun+Moon conjunction in the 8th house — the most prominent natal feature — was invisible to the analysis.
**Fix**: Added `"natal_prominence"` activation source. For each planet, baseline weight is assigned: +2 for domicile/exaltation, +1 for angular house, +1 for detriment/fall (natal), +1 for retrograde. This feeds into the signal scoring so natal prominence contributes to confidence.
**Verification**: Jupiter (angular H7) now shows in activated planets even with no time-lord activation. Saturn (angular H4, retrograde) gets higher baseline score.

### Issue 3: Empty activated_lots
**Problem**: `activated_lots` was always empty because only transit conjunctions to lot degrees were checked. ZR Spirit/Fortune lord activation should also tag the lot semantically.
**Fix**: Added `lot: "spirit"` to ZR Spirit activations and `lot: "fortune"` to ZR Fortune activations in `activation_engine.ts`. Now when ZR activates a lord, the corresponding lot is tagged.
**Verification**: `activated_lots` now shows `spirit, fortune` when ZR is active.

### Issue 4: All alignment modes = "discipline"
**Problem**: `chooseAlignmentMode` received `signal.why` (strings like "Annual profection activates house 6") as input, which never contains the keyword triggers ("agitation", "melancholy", "scatter", etc.). Always fell through to default "discipline".
**Fix**: Changed to pass `profile.distorted_expression` instead of `signal.why`. Mars's `"aggression"` → triggers "cool". Saturn's `"melancholy"` → triggers "strengthen". Jupiter's `"overindulgence"` → triggers "balance".
**Verification**: mars → cool, saturn → strengthen, jupiter → balance, venus → discipline (default, no strong keyword match).

### Issue 5: Transit-only activations over-weighted
**Problem**: Transit-to-natal was weight 2, same as monthly profection. A single transit could push a planet to "medium" confidence.
**Fix**: Reduced transit-to-natal to weight 1, transit-to-lot to weight 2, transit-to-angle to weight 1. Also added: if a planet's ONLY source is a single transit, confidence is forced to "low" regardless of score.
**Verification**: Moon (only hit by Sun trine transit) gets low confidence and is filtered out of activated planets list if no other activation hits it.

### Issue 6: No Fortune/Spirit lot house semantics
**Problem**: The engine never reported which house the Fortune and Spirit lots occupied, or what topics those houses represent.
**Fix**: `determineFortuneSpiritMode` now returns structured `fortune` and `spirit` objects with `lot_house`, `lot_house_topics`, `active`, and `confidence`. These are rendered in the UI as two side-by-side cards below the planetary condition section.
**Verification**: Fortune in house 2 (wealth/resources), Spirit in house 1 (life/vitality/body).

## What Still Needs Work

### 1. Life activity ranking is crude
The current approach gives top planet 2 healthy expressions, second planet 1, third+ planet 1. This is better than before (flat 8-item list) but still doesn't weight by actual signal score delta. A planet with score 14 + 5 (barely over threshold) shouldn't dominate.

### 2. Condition source edges not propagating to graph trace
The `daily_sphere_reader.ts` has logic to push `condition:planet_detriment` etc. to `source_edges` but the conditions array in the `relevantSignals` may not always contain the expected values. Need to verify the data flow from `sig.condition` through to the edges.

### 3. No overdetermination threshold for transit-only
Currently, any transit-only planet gets "low". But what about a planet hit by 3 different transits simultaneously (e.g., Sun trine, Moon conjunct, Mars square)? That should be medium, not low. The current logic uses `sig.sources.size === 1 && sig.sources.has("transit_to_planet")` which catches all transit-only cases.

### 4. Sect interpretation unused in daimonic mode
The engine computes `sect_status` but never uses it to modify interpretations. An out-of-sect malefic (Saturn in day chart) should modify the tone of the Saturn interpretation. This is Greenbaum's point about the daimon being "mediated through sect."

### 5. No Zodiacal Releasing Fortune in the test output
ZR Spirit is piped through but ZR Fortune is optional. The integration test for Chris Brennan chart doesn't include ZR Fortune, only ZR Spirit. Should add it.

### 6. Picatrix correspondence extraction not automated
The `picatrix.json` file has structured chapter content. An extractor could find "X corresponds to Y" patterns per planet and generate `RitualReference[]` entries automatically. Currently all 28 references are hand-curated.

### 7. Open 777 not imported
The `content/glossary/sources/books/Liber 777 Revised.pdf` exists but no parser extracts it. Would add ~200+ correspondences (planets → gods → herbs → metals → colors → stones).

## Source Texts Ingested

| Text | Author | Key content used |
|---|---|---|
| Hellenistic Astrology | Chris Brennan (2017) | House system, sect, profections, ZR, timing hierarchy |
| The Daimon in Hellenistic Astrology | Dorian Greenbaum (2016) | Fortune/Spirit ontology, lots, Plutarch-Valens connections, daimon as soul/intention |
| Ancient Astrology Vol 2 | Demetra George (2022) | House classification, planetary condition scoring, angularity |
| Anthologiae (Book I.21) | Vettius Valens (c. 175 CE) | 21 planetary pair combinations |
| Three Books on Life | Marsilio Ficino (1489) | Planetary attunement, music therapy, spiritus |
| Picatrix (Liber Atratus) | Greer & Warnock tr. | Ritual correspondences, planetary operations |
| Three Books of Occult Philosophy | Henry Cornelius Agrippa | Planetary correspondences, sephiroth, archangels |
| Orphic Hymns | Various | 7 planetary hymns |
| Greek Magical Papyri | Various | Hermetic/planetary invocation |

## Key Design Decisions

**Deterministic core before LLM**: All technical conclusions are computed in pure TypeScript. The LLM only renders the packet and is forbidden from adding new planets, houses, lots, or changing confidence levels.

**Packet is the product**: `DailySphereReading` JSON must be complete before any prose is generated. Renderers are interchangeable.

**Anti-hallucination**: LLM prompts include strict "DO NOT" rules. Post-hoc validation planned (check that every planet mentioned exists in the packet).

**Safety-first ritual references**: Every reference has a `safety_class` attribute. Picatrix/Agrippa material is `historical_reference` with safe symbolic adaptations. No hazardous or coercive operations are recommended.

**Weighted timescale convergence**: A planet must appear in 2+ independent timing systems for "medium" confidence and 3+ for "high". Transit-only never exceeds "low" unless multiple transits converge.

---

## Layer Reference — All 16 Structural Layers (commit 4fd7c2d)

| # | Layer | Module | Source | What it computes |
|---|---|---|---|---|
| 1 | Birth Chart | `caelus` (npm) | — | Ephemeris, 7 planets, angles, whole sign houses, aspects |
| 2 | Normalized Chart | `caelus_adapter.ts` | — | 7 Hermetic lots, day/night sect, house topics |
| 3 | Planet Condition | `activation_engine.ts` | Valens, Demetra George | Angularity, sect status, essential dignity, retrograde |
| 4 | **Full Dignity Scoring** | `activation_engine.ts` | **Valens, Ptolemy, caelus** | **triplicity_rulers, term_ruler, face_ruler per planet** |
| 5 | Natal Prominence | `activation_engine.ts` | — | Baseline activation from angular houses, dignities, retrograde |
| 6 | Annual Profection | `activation_engine.ts` | Brennan ch.17 | Yearly time-lord, house + lord |
| 7 | Monthly Profection | `activation_engine.ts` | Brennan ch.17 | Monthly time-lord within the year |
| 8 | Zodiacal Releasing | caelus `zrAt()` | Valens, Brennan ch.18 | L1-L4 periods from Spirit and Fortune lots |
| 9 | Current Transits | `activation_engine.ts` | — | Aspect-based transit detection to planets, lots, angles |
| 10 | Fortune/Spirit Layers | `activation_engine.ts` | Greenbaum, Paulus ch.23 | Semantic split: body/circumstance vs soul/vocation |
| 11 | **Daimonic Houses** | `daimonic_houses.ts` | **Greenbaum ch.2 & 4** | **5=Good Fortune, 6=Bad Fortune, 11=Good Daimon, 12=Bad Daimon** |
| 12 | **Oikodespotes** | `oikodespotes.ts` | **Porphyry/Greenbaum ch.7** | **Personal daimon via almuten() at 5 key points** |
| 13 | **Antiscia** | `antiscia.ts` | **Firmicus Maternus** | **Hidden solstice-axis connections** |
| 14 | **Bonification/Maltreatment** | `bonification.ts` | **Brennan ch.14, Antiochus** | **Striking with ray, enclosure, adherence, reception** |
| 15 | **Fixed Stars** | caelus `starConjunctions()` | **caelus catalog** | **Royal stars (Regulus, Aldebaran, etc.) at 1° orb** |
| 16 | Valens Combinations | `valens_combinations.ts` | Valens I.21 | 21 pair rules + triple generation |

## Files Created

```
src/astrology/
├── types.ts                # All shared types (16-layer DailySphereReading)
├── caelus_adapter.ts       # Wraps caelus Chart → NormalizedChart
├── activation_engine.ts    # Scoring, conditions, oikodespotes, antiscia, bonification
├── daimonic_houses.ts      # 5/6/11/12 house tagging (NEW)
├── oikodespotes.ts         # Personal daimon via almuten (NEW)
├── antiscia.ts             # Solstice-axis connections (NEW)
├── bonification.ts         # Striking, enclosure, adherence, reception (NEW)
├── planet_profiles.ts      # 7 Valens-grounded planetary profiles
├── valens_combinations.ts  # 21 pair rules + triple generator
├── ritual_references.ts    # 28 curated historical references
├── daily_sphere_reader.ts  # Orchestrator → DailySphereReading
└── tests/
    ├── fixtures.ts         # Synthetic day/night charts
    ├── mvp.test.ts         # 19 structural tests
    └── coherence.test.ts   # 35 textual coherence tests

src/app/astrology/
└── page.tsx                # UI at /astrology with all 16 layers displayed
```

## All Source Texts Ingested for This Build

| Text | Author | Lines | What was extracted |
|---|---|---|---|
| Hellenistic Astrology | Chris Brennan (2017) | 30,574 | Whole sign houses, sect, profections, ZR, bonification/maltreatment (ch.14), triplicity lords (ch.15), timing hierarchy |
| The Daimon in Hellenistic Astrology | Dorian Greenbaum (2016) | 26,951 | Fortune/Spirit ontology, daimonic houses (ch.2, 4), oikodespotes/personal daimon (ch.7), lots as destiny functions (ch.8-10), Plutarch-Valens connections |
| Ancient Astrology Vol 2 | Demetra George (2022) | ~12,000 | House classification, planetary condition scoring, angularity, 5 rulers of the nativity |
| Matheseos Libri VIII | Firmicus Maternus (c. 334 CE) | 17,386 | Cardines/angles, antiscia, decans, terms, planet-in-sign delineations, Sphaera Barbarica |
| Anthologiae (Books I-IX) | Vettius Valens (c. 175 CE) | 28,427 | 21 planetary pair combinations (I.21), casting out method from lots, planetary years, oikodespotes |
| Introduction to the Tetrabiblos | Porphyry (c. 270 CE) | (via Greenbaum) | Oikodespotes as personal daimon, 5-point method |
| Three Books on Life | Marsilio Ficino (1489) | (via profiles) | Planetary attunement, music therapy, spiritus |
| Picatrix (Liber Atratus) | Greer & Warnock tr. | (via JSON) | Ritual correspondences, planetary operations |
| Three Books of Occult Philosophy | Cornelius Agrippa (1533) | (via refs) | Planetary correspondences, sephiroth, archangels |
| Orphic Hymns | Various | (via refs) | 7 planetary hymns |
| Greek Magical Papyri | Various | (via refs) | Hermetic/planetary invocation |

## Structural Elements Still Missing

| Element | Source | Priority | Why |
|---|---|---|---|
| Joys of the planets in houses | Brennan ch.10 | Medium | 1=Mercury, 3=Moon, 5=Venus, 6=Mars, 9=Sun, 10=Jupiter, 12=Saturn |
| Recursive lots (Eros/Necessity from Fortune/Daimon) | Greenbaum ch.10 | Medium | Geometric relationship between the four main lots |
| Fortune-Daimon-Ascendant isosceles triangle | Greenbaum | Medium | All three points are equidistant — structural motif |
| Lot of Basis | Greenbaum | Low | Midpoint between Fortune and Spirit |
| Derived houses from Fortune | Valens, Manilius | Low | Using Fortune as ascendant for material topics |
| Firdaria (Persian time-lord) | caelus `firdariaAt()` | Medium | 7-planet alternating period system |
| Planetary periods (Valens minor years) | Valens | Low | Saturn 30yr, Jupiter 12yr, Mars 7.5yr, etc. |
| Primary directions | Ptolemy, caelus | Low | Advanced timing for length of life |
| Five rulers of the nativity | Demetra ch.90-94 | Low | Predominator, oikodespotes, kurios, etc. |
| LLM post-hoc validation | — | High | Regex check that LLM output only references packet planets |
