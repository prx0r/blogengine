Here is the **final narrowed build spec**. The key decision: since you already have the birth-chart calculator, the new work should be **analysis-engine only**: deterministic activation packets, source rules, confidence scoring, and then daimonic renderers.

## Best external tools/projects to use or inspect

Use these as references, not necessarily dependencies:

| Project                               | Use                                                                                                                                                                                                                             |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **pyswisseph**                        | Swiss Ephemeris Python wrapper; safest core if you need raw ephemeris access. Swiss Ephemeris is described as a high-precision ephemeris based on NASA JPL DE431 and widely used for astrological calculations. ([GitHub][1])   |
| **Kerykeion**                         | Good structured Python astrology project for birth, transit, synastry, composite charts, and SVG output. Useful to inspect JSON/data-model patterns. ([GitHub][2])                                                              |
| **Astrologer API / Kerykeion API**    | Hosted or self-hostable API powered by Kerykeion; supports natal charts, synastry, transits, composites, returns, and moon phases as SVG + JSON. ([GitHub][3])                                                                  |
| **flatlib**                           | Traditional astrology Python library; uses Swiss Ephemeris through pyswisseph. Useful for traditional concepts and object design. ([GitHub][4])                                                                                 |
| **immanuel-python**                   | Produces human-readable and JSON-formatted chart data based on Swiss Ephemeris and astro.com. Useful if you want JSON output patterns. ([GitHub][5])                                                                            |
| **Stellium**                          | Modern Python computational astrology library built on Swiss Ephemeris; useful to inspect composable architecture ideas. ([GitHub][6])                                                                                          |
| **JPL Horizons API**                  | Scientific ephemeris verification source; useful for spot-checking planetary positions independently of astrology libraries. ([CNEOS API][7])                                                                                   |
| **FreeAstroAPI**                      | Managed API option with natal charts, ephemeris date ranges, transits, transit timelines, solar returns, and more. Useful for prototyping if you do not want to run your own ephemeris job. ([FreeAstroAPI][8])                 |
| **AstrologyAPI daily natal transits** | Commercial API endpoint for daily natal transits, including transit date, ascendant, transit relations, aspect type, retrograde status, signs, and houses. Useful as a fallback feed, not the core engine. ([Astrology API][9]) |

Important licensing note: Swiss Ephemeris is powerful, but if the project becomes commercial and you do not want to release under GPL-compatible terms, check Astrodienst's professional license requirements early. Astrodienst's page says the professional license requires purchasing/signing a license contract, and the current listed unlimited professional license is 700 CHF. ([Astrodienst][10])

---

# Daimonic Astrology Analysis Engine — Final Agent Build Spec

## Mission

Build a deterministic astrology analysis engine that sits on top of an existing birth-chart calculator.

The calculator already produces chart facts. This engine must interpret chart facts against current sky activity and timing systems, then produce a structured analysis packet.

The engine is not a horoscope generator.

The engine should answer:

* What part of the natal chart is activated now?
* Which planets, houses, lots, and topics are involved?
* Is this primarily Fortune/body/circumstance or Spirit/Daimon/action/vocation?
* Which signals are high confidence because multiple systems converge?
* Which signals are low-confidence noise?
* What daimonic advice follows?
* Which interpretation layer should render the packet: technical Hellenistic, Greenbaum-style daimonic, Ficinian practice, psychological, or Imaginarium mythic?

The LLM must not perform astrology calculation. The LLM only renders the deterministic packet.

---

# 1. Core design principle

The system must produce this object before prose:

```ts
SynthesisPacket
```

The packet is the product.

The reading is only a renderer.

Core pipeline:

```txt
birth_chart_json
+ current_sky_json
+ time_activation
+ lot_analysis
+ planetary_condition
+ Valens_combinations
+ signal_weighting
+ source_rules
→ deterministic_synthesis_packet
→ renderer
```

Hard rule:

```txt
Same packet = same technical conclusions, even if rendered in different writing styles.
```

---

# 2. Source hierarchy

## Core technical substrate

Use these as the main ancient/traditional basis:

```txt
1. Valens
   - planetary combinations
   - lots
   - timing
   - case-based symbolic reasoning

2. Dorotheus
   - life topics
   - house-topic judgment
   - topic-specific testimony

3. Paulus / Rhetorius
   - definitions
   - lots
   - doctrine stabilization
   - crosschecks
```

## Modern implementation layer

```txt
Chris Brennan
- use as implementation map
- clarify Hellenistic techniques
- whole sign houses
- sect
- profections
- Zodiacal Releasing
- lots
- timing hierarchy
```

Brennan should not override ancient sources. He clarifies implementation.

## Daimonic ontology layer

```txt
Dorian Greenbaum
- Daimon / Spirit
- Fortune
- fate vs agency
- lots as personal destiny functions
- philosophical background of Hellenistic astrology
```

Greenbaum does not decide which planet is activated. She defines what it means when Fortune or Spirit is activated.

## Practice layer

```txt
Ficino
- planetary attunement
- music
- mood
- spiritus
- soul-care
- study practices
- ritualized attention
```

Ficino is not the calculation engine. Ficino renders practice after diagnosis.

---

# 3. Layered architecture

## Layer 0 — Input contracts

The existing birth-chart calculator must output a normalized JSON object.

Required fields:

```ts
type PlanetName =
  | "Sun"
  | "Moon"
  | "Mercury"
  | "Venus"
  | "Mars"
  | "Jupiter"
  | "Saturn";

type ChartInput = {
  native_id: string;
  birth_data: {
    date: string;
    time: string;
    timezone: string;
    location: {
      name: string;
      lat: number;
      lon: number;
    };
  };
  natal: {
    ascendant: ZodiacPosition;
    mc: ZodiacPosition;
    planets: Record<PlanetName, PlanetPosition>;
    houses_whole_sign: House[];
    aspects: Aspect[];
    lots: {
      fortune: ZodiacPosition;
      spirit: ZodiacPosition;
    };
  };
};

type ZodiacPosition = {
  sign: string;
  sign_index: number; // Aries = 0
  degree_absolute: number; // 0-360
  degree_in_sign: number; // 0-30
};

type PlanetPosition = ZodiacPosition & {
  speed?: number;
  retrograde?: boolean;
  visible?: boolean;
};

type House = {
  number: number;
  sign: string;
  sign_index: number;
  topic: string[];
};

type Aspect = {
  planet_a: PlanetName;
  planet_b: PlanetName;
  aspect: "conjunction" | "sextile" | "square" | "trine" | "opposition";
  orb: number;
  applying?: boolean;
};
```

---

# 4. Engine modules

## 4.1 NatalStructureEngine

Purpose:

Calculate the natal promise and planet condition.

Inputs:

```txt
natal chart JSON
```

Outputs:

```ts
PlanetConditionPacket[]
```

Each packet:

```ts
type PlanetConditionPacket = {
  planet: PlanetName;
  sign: string;
  house: number;
  house_topics: string[];

  sect_status: "in_sect" | "out_of_sect" | "neutral";
  angularity: "angular" | "succedent" | "cadent";
  essential_dignity: {
    domicile: boolean;
    exaltation: boolean;
    triplicity?: boolean;
    term?: boolean;
    face?: boolean;
    detriment: boolean;
    fall: boolean;
  };

  visibility: {
    retrograde?: boolean;
    under_beams?: boolean;
    combust?: boolean;
    morning_star?: boolean;
    evening_star?: boolean;
  };

  configured_to: {
    benefics: PlanetName[];
    malefics: PlanetName[];
    luminaries: PlanetName[];
  };

  ruler_condition?: {
    ruler: PlanetName;
    ruler_strength_score: number;
    ruler_difficulty_score: number;
  };

  strength_score: number; // 0-10
  difficulty_score: number; // 0-10
  explanation_factors: string[];
};
```

Scoring should be deterministic and explainable.

Example scoring starter:

```txt
Angular: +2 strength
Succedent: +1 strength
Cadent: -1 strength

In sect: +1 strength
Out of sect malefic: +1 difficulty
Out of sect benefic: -1 effectiveness

Domicile: +3 strength
Exaltation: +2 strength
Detriment: +2 difficulty
Fall: +2 difficulty

Combust: +2 difficulty
Under beams: +1 difficulty
Retrograde: +1 difficulty

Benefic trine/sextile/conjunction: -1 difficulty, +1 support
Malefic square/opposition/conjunction: +1-2 difficulty

Ruler strong: +1 strength
Ruler troubled: +1 difficulty
```

Keep numbers configurable.

Do not pretend these are universal truth. They are operational heuristics.

---

## 4.2 FortuneSpiritEngine

Purpose:

Separate material circumstance from daimonic agency.

Inputs:

```txt
Lot of Fortune
Lot of Spirit
planet conditions
aspects
current activations
```

Outputs:

```ts
type FortuneSpiritPacket = {
  fortune: LotPacket;
  spirit: LotPacket;
  dominant_mode: "fortune" | "spirit" | "mixed" | "neither";
  interpretation_basis: string[];
};

type LotPacket = {
  lot: "fortune" | "spirit";
  sign: string;
  house: number;
  lord: PlanetName;
  lord_condition: PlanetConditionPacket;
  aspects_to_lot: Aspect[];
  activated_by: ActivationSource[];
  activation_score: number;
  confidence: "low" | "medium" | "high";
};
```

Meanings:

```txt
Fortune:
- body
- circumstance
- material conditions
- incarnation field
- what happens to/through the native

Spirit / Daimon:
- action
- intention
- authorship
- vocation
- directed intelligence
- what the native does with circumstance
```

---

## 4.3 TimeActivationEngine

Purpose:

Identify the current chapter.

MVP timing systems:

```txt
1. Annual profection
2. Monthly profection
3. Zodiacal Releasing from Spirit
4. Zodiacal Releasing from Fortune
5. Major transits to activated planets/lots/angles
```

Do not let daily transits dominate.

Outputs:

```ts
type TimeActivationPacket = {
  date_range: {
    start: string;
    end: string;
  };

  annual_profection: {
    age: number;
    activated_house: number;
    activated_sign: string;
    lord: PlanetName;
  };

  monthly_profection?: {
    activated_house: number;
    activated_sign: string;
    lord: PlanetName;
  };

  zodiacal_releasing_spirit?: ZRPeriod;
  zodiacal_releasing_fortune?: ZRPeriod;

  major_transits: TransitActivation[];
};

type ZRPeriod = {
  lot: "spirit" | "fortune";
  level: 1 | 2 | 3 | 4;
  sign: string;
  lord: PlanetName;
  start_date: string;
  end_date: string;
  peak?: boolean;
  loosing_of_bond?: boolean;
};

type TransitActivation = {
  transit_planet: PlanetName;
  natal_target_type: "planet" | "lot" | "angle";
  natal_target: string;
  aspect: string;
  exact_date?: string;
  orb: number;
  applying?: boolean;
  weight: number;
};
```

Timing hierarchy:

```txt
Annual profection: high
ZR Spirit: high
ZR Fortune: high
Monthly profection: medium
Transit to activated lord: medium-high
Transit to Lot of Spirit/Fortune: medium-high
Random transit with no timing support: low
Daily Moon: exclude from MVP
```

---

## 4.4 ValensCombinationEngine

Purpose:

Detect activated symbolic combinations.

Inputs:

```txt
activated planets
planet conditions
aspects
house topics
lot involvement
time activation
```

Outputs:

```ts
type CombinationPacket = {
  combinations: PlanetCombination[];
};

type PlanetCombination = {
  planets: PlanetName[];
  combination_type: "pair" | "triple";
  activation_sources: ActivationSource[];
  house_context: number[];
  topic_context: string[];
  lot_context: ("fortune" | "spirit")[];
  dominant_theme: string[];
  opportunity_theme: string[];
  pressure_theme: string[];
  confidence: "low" | "medium" | "high";
  source_rule_ids: string[];
};
```

Core rule:

```txt
Triple combinations must be built from pairwise combinations.
```

Example:

```txt
Mars + Venus + Mercury
= Mars/Venus
+ Mars/Mercury
+ Venus/Mercury
+ condition of all three planets
+ house topics
+ lot involvement
+ time activation
```

Do not ask the LLM to invent the triple meaning.

---

## 4.5 SignalWeightingEngine

Purpose:

Rank what matters.

Inputs:

```txt
natal condition
time activations
lots
transits
combinations
source rules
```

Outputs:

```ts
type RankedSignature = {
  id: string;
  planet?: PlanetName;
  house?: number;
  topic?: string;
  lot?: "fortune" | "spirit";
  combination?: PlanetName[];
  activated_by: ActivationSource[];
  repetition_count: number;
  score: number;
  confidence: "low" | "medium" | "high";
  why: string[];
};

type ActivationSource =
  | "natal_prominence"
  | "annual_profection_lord"
  | "monthly_profection_lord"
  | "zr_spirit_lord"
  | "zr_fortune_lord"
  | "transit_to_activated_planet"
  | "transit_to_lot"
  | "transit_to_angle"
  | "source_rule_match";
```

Starter scoring:

```txt
Natal planet condition high relevance: +2
Annual profection lord: +5
Monthly profection lord: +2
ZR Spirit lord: +5
ZR Fortune lord: +4
Lot ruler activated: +4
Transit to active lord: +2
Transit to Lot of Spirit/Fortune: +3
Transit to angle: +2
Same planet repeated across systems: +4
Same house/topic repeated: +4
Same lot repeated: +4
Random transit only: +0.5
```

Confidence rules:

```txt
High confidence:
- 3+ independent activation sources
- includes at least one major timing system

Medium confidence:
- 2 activation sources
- or 1 major timing system plus natal relevance

Low confidence:
- isolated transit
- weak natal relevance
- no timing support
```

---

## 4.6 SourceRuleEngine

Purpose:

Retrieve structured rules. Do not let the LLM invent tradition.

Create separate object types:

```ts
type AncientSourceRule = {
  id: string;
  source_author: "Valens" | "Dorotheus" | "Paulus" | "Rhetorius";
  work: string;
  technique: string;
  condition_pattern: Record<string, unknown>;
  themes: string[];
  modifiers: Record<string, string>;
  citation?: string;
  quote_excerpt?: string;
  confidence: "low" | "medium" | "high";
};

type CommentaryNote = {
  id: string;
  modern_author: "Chris Brennan";
  applies_to: string;
  implementation_note: string;
  citation?: string;
};

type OntologyNote = {
  id: string;
  modern_author: "Dorian Greenbaum";
  concept: "fortune" | "spirit" | "daimon" | "fate" | "agency" | "lot";
  meaning: string;
  applies_to: string[];
  citation?: string;
};

type PracticeRule = {
  id: string;
  author: "Ficino";
  planet: PlanetName;
  condition?: string;
  practice_mode: string[];
  warning?: string;
  citation?: string;
};
```

Start with 100-300 hand-curated rules.

Do not bulk-ingest entire books at first.

Minimum initial rule categories:

```txt
Valens:
- planet-alone significations
- planetary pairs
- planetary triples generated from pairs
- Fortune/Spirit timing
- basic time-lord activation

Dorotheus:
- house topics
- topic-specific testimony
- practical life area mapping

Paulus/Rhetorius:
- definitions
- lots
- sect
- houses
- planetary joys

Brennan:
- implementation notes for profections/ZR/whole sign/sect/lots

Greenbaum:
- Daimon/Spirit
- Fortune
- fate and agency
- lots as destiny functions

Ficino:
- planetary attunement
- music/mood/study/practice
```

---

## 4.7 SynthesisPacketBuilder

Purpose:

Build the final deterministic analysis object.

Output:

```ts
type SynthesisPacket = {
  native_id: string;
  date_range: {
    start: string;
    end: string;
  };

  current_chapter: {
    title: string;
    summary: string;
    confidence: "low" | "medium" | "high";
  };

  technical_basis: {
    natal_promises: RankedSignature[];
    time_activations: TimeActivationPacket;
    fortune_spirit: FortuneSpiritPacket;
    dominant_combinations: PlanetCombination[];
  };

  ranked_signatures: RankedSignature[];

  fortune_layer: {
    summary: string;
    active: boolean;
    signatures: RankedSignature[];
  };

  spirit_daimon_layer: {
    summary: string;
    active: boolean;
    signatures: RankedSignature[];
  };

  opportunities: string[];
  pressures: string[];
  distortions_to_watch: string[];

  source_support: {
    ancient_rules: AncientSourceRule[];
    commentary_notes: CommentaryNote[];
    ontology_notes: OntologyNote[];
    practice_rules: PracticeRule[];
  };

  renderer_hints: {
    primary_planets: PlanetName[];
    primary_topics: string[];
    tone_modes: string[];
    recommended_practices: string[];
  };

  low_confidence_noise: RankedSignature[];
};
```

---

# 5. Renderers

The renderer receives the packet and must not change technical conclusions.

Implement these renderers:

```txt
1. technical_hellenistic
2. daimonic_greenbaum
3. ficinian_practice
4. psychological_plain_english
5. imaginarium_mythic
```

Every renderer must preserve:

```txt
- active planets
- active houses
- active lots
- confidence
- timing basis
- Fortune vs Spirit distinction
```

Example renderer instruction:

```txt
You are rendering a precomputed astrology synthesis packet.
Do not add new technical claims.
Do not introduce planets, houses, lots, or timing systems not present in the packet.
Explain the packet in the requested style.
Keep uncertainty visible.
Do not make deterministic predictions.
```

---

# 6. Daily current-sky update system

Since the birth chart calculator already exists, build a daily sky cache.

## Recommended approach

Use your own daily job from ephemeris math, not a horoscope API.

Daily cron:

```txt
00:10 UTC every day:
1. Calculate current planetary positions at 00:00 UTC.
2. Calculate sign, degree, speed, retrograde.
3. Calculate major aspects between transiting planets.
4. Store current_sky_snapshot.
5. For each user, compute transits to natal planets, lots, and angles.
6. Re-run TimeActivationEngine for date.
7. Update SynthesisPacket cache.
```

Data table:

```sql
CREATE TABLE current_sky_snapshots (
  id UUID PRIMARY KEY,
  snapshot_date DATE NOT NULL,
  timezone_basis TEXT DEFAULT 'UTC',
  planets JSONB NOT NULL,
  aspects JSONB NOT NULL,
  moon_phase JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_daily_activation_packets (
  id UUID PRIMARY KEY,
  native_id UUID NOT NULL,
  snapshot_date DATE NOT NULL,
  synthesis_packet JSONB NOT NULL,
  top_signature_score NUMERIC,
  confidence TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

For clean daily data, use one of three paths:

```txt
Best:
- own Swiss Ephemeris / pyswisseph daily job

Good:
- Kerykeion or Astrologer API JSON

Prototype/fallback:
- FreeAstroAPI or AstrologyAPI daily natal transits
```

Kerykeion supports transit charts and structured astrology calculations in Python, and the Astrologer API repo exposes natal, transit, composite, return, and moon-phase data as JSON/SVG. ([GitHub][3])

FreeAstroAPI explicitly offers ephemeris date ranges, transits, transit timelines, solar returns, and other endpoints; AstrologyAPI has a daily natal transits endpoint with transit relations and aspect data. ([FreeAstroAPI][8])

Use third-party APIs only as fallback or verification. The core project should own the deterministic packet logic.

---

# 7. API endpoints

Build these endpoints:

```txt
GET /analysis/:native_id/current
Returns latest cached SynthesisPacket.

POST /analysis/:native_id/range
Body: { start_date, end_date }
Returns period-level packet.

POST /analysis/:native_id/render
Body: { packet_id, renderer: "technical_hellenistic" | "daimonic_greenbaum" | "ficinian_practice" | "psychological_plain_english" | "imaginarium_mythic" }
Returns rendered prose.

POST /analysis/recompute/:native_id
Recomputes packet from chart + current sky.

GET /sky/current
Returns latest current_sky_snapshot.

GET /rules/search
Searches source rules by planet/topic/lot/technique.
```

---

# 8. Testing procedures

## 8.1 Calculation integrity tests

Even though chart calculation exists, test the interface.

Tests:

```txt
- All seven traditional planets exist.
- All longitudes are 0 <= x < 360.
- Every planet has sign_index 0-11.
- Every planet has degree_in_sign 0-30.
- Ascendant exists.
- MC exists.
- Lot of Fortune exists.
- Lot of Spirit exists.
- Whole sign houses exist and contain 12 houses.
```

Expected:

```txt
No missing planet data.
No invalid degrees.
No duplicate house numbers.
```

---

## 8.2 Lot formula tests

Create fixed test charts and verify Fortune/Spirit formulas.

Day chart formulas:

```txt
Fortune = ASC + Moon - Sun
Spirit = ASC + Sun - Moon
```

Night chart formulas usually reverse.

Test cases:

```txt
- day chart
- night chart
- wraparound above 360
- wraparound below 0
```

Expected:

```txt
All lots normalize to 0-360.
Lot sign and house are correctly derived from absolute degree.
```

---

## 8.3 Profection tests

Annual profection:

```txt
activated_house = (age % 12) + 1
```

If age 0, activate 1st house.

Test cases:

```txt
age 0 → 1st
age 1 → 2nd
age 11 → 12th
age 12 → 1st
age 27 → 4th
```

Expected:

```txt
Correct activated house, sign, and lord from whole-sign chart.
```

---

## 8.4 Planet condition tests

Create synthetic charts with known conditions.

Test examples:

```txt
Mars in Aries angular day chart
Venus in Pisces angular night chart
Mercury combust
Saturn cadent out of sect
Jupiter angular in domicile
```

Expected:

```txt
Domicile/exaltation planets score higher.
Combust/cadent planets receive difficulty.
Out-of-sect malefic receives increased difficulty.
Benefic support reduces difficulty.
```

Snapshot-test the full PlanetConditionPacket.

---

## 8.5 Activation weighting tests

Feed controlled activation sources.

Example:

```json
{
  "planet": "Mercury",
  "activated_by": [
    "annual_profection_lord",
    "zr_spirit_lord",
    "transit_to_activated_planet"
  ]
}
```

Expected:

```txt
Mercury score is high.
Confidence = high.
Repetition count >= 3.
```

Control case:

```json
{
  "planet": "Venus",
  "activated_by": ["random_transit_only"]
}
```

Expected:

```txt
Venus score is low.
Confidence = low.
```

---

## 8.6 Fortune/Spirit distinction tests

Create cases:

```txt
Case A:
Annual lord = Spirit lord
ZR Spirit active
Transit to Lot of Spirit

Expected:
dominant_mode = spirit

Case B:
Annual lord = Fortune lord
ZR Fortune active
Transit to Lot of Fortune

Expected:
dominant_mode = fortune

Case C:
Both active

Expected:
dominant_mode = mixed
```

---

## 8.7 Combination engine tests

Pair test:

```txt
Input:
Mercury and Mars both activated.

Expected:
CombinationPacket includes Mercury/Mars.
Themes include speech, strategy, argument, technical craft, cutting analysis.
```

Triple test:

```txt
Input:
Mercury, Mars, Venus all activated.

Expected:
Triple is generated from:
- Mercury/Mars
- Mercury/Venus
- Mars/Venus

The triple must cite pairwise source rule IDs.
```

Failure condition:

```txt
The engine invents a triple without pair basis.
```

---

## 8.8 Source-rule tests

Tests:

```txt
- Every source rule has ID.
- Every ancient rule has source_author.
- Every rule has condition_pattern.
- Every rule has themes.
- No renderer can cite a rule ID not present in the packet.
```

Expected:

```txt
No ghost citations.
No invented Valens/Brennan/Greenbaum/Ficino claims.
```

---

## 8.9 Renderer invariance tests

Take one packet and render it five ways:

```txt
technical_hellenistic
daimonic_greenbaum
ficinian_practice
psychological_plain_english
imaginarium_mythic
```

Expected:

```txt
All renderers preserve:
- same active planets
- same houses
- same lots
- same timing basis
- same confidence
```

They may differ only in language and advice style.

---

## 8.10 Daily update tests

For the daily cron:

```txt
- Run daily sky job for fixed date.
- Verify current_sky_snapshot created.
- Verify user_daily_activation_packet created.
- Verify packet changes when date changes.
- Verify random daily Moon/transits do not override annual/ZR signatures.
```

Expected:

```txt
Major timing signatures remain stable.
Transit triggers update daily.
Current chapter does not flip randomly every day.
```

---

# 9. Acceptance criteria

The engine is working when:

```txt
1. It produces deterministic SynthesisPacket JSON before prose.
2. It identifies activated planets/topics/lots without LLM judgment.
3. It separates natal promise from current activation.
4. It separates Fortune from Spirit.
5. It ranks signals by convergence.
6. It suppresses low-confidence random transits.
7. It retrieves source rules without hallucination.
8. It can render the same packet in multiple styles.
9. It updates daily using clean current-sky data.
10. It produces practical daimonic advice that follows from the packet.
```

---

# 10. Minimal first milestone

Build only this first:

```txt
Input:
- existing natal chart JSON
- target date or date range

Compute:
- annual profection
- monthly profection
- Lot of Fortune activation
- Lot of Spirit activation
- current transits to activated lord/lots/angles
- ranked signatures
- Fortune/Spirit split
- top 3 combinations
- deterministic SynthesisPacket

Render:
- technical Hellenistic summary
- daimonic advice summary
```

Do not build:

```txt
- horary
- elections
- fixed stars
- decans
- Picatrix
- Agrippa
- outer planets
- asteroids
- daily Moon-driven reports
- full medieval dignity engine
```

---

# 11. First output target

The first useful output should look like this:

```txt
Current chapter:
Spirit-led Mercury/Mars activation in 9th/10th-house topics.

Technical basis:
- Annual profection activates X house and its lord Mercury.
- ZR from Spirit activates Y sign, also ruled by Mercury.
- Lot of Spirit ruler is configured to Mars.
- Current transits trigger the same Mercury/Mars complex.
- Repetition count: 4.
- Confidence: high.

Fortune layer:
Material circumstances are pushing study, movement, work, and technical adaptation.

Spirit/Daimon layer:
The call is toward articulation, system-building, speech, writing, analysis, and strategic craft.

Dominant combination:
Mercury + Mars:
speech, argument, precision, technique, cutting analysis, craft under pressure.

Opportunity:
Write, build, classify, teach, debug, and make invisible structures explicit.

Pressure:
Agitation, nervous over-analysis, sharp speech, scattered execution.

Daimonic advice:
Turn the active planet into deliberate practice. Do not experience it passively as mood.

Ficinian attunement:
Mercury/Mars should be cooled into disciplined craft: clean writing, breath, technical study, precise speech, and martial clarity without aggression.
```

---

# 12. Final agent instruction

Build the analysis engine as a deterministic symbolic compiler.

The existing calculator provides the sky. Your job is to compile the chart and current sky into an activated daimonic structure.

The central object is:

```txt
ActivatedDaimonicStructure
```

Meaning:

```txt
Which part of the natal soul-map is switched on now,
through which planets,
in which topics,
under Fortune or Spirit,
with what opportunity,
with what distortion,
and with what practice response?
```

Do not build a chatbot.

Build the engine that tells the chatbot what is true.

## Practical daily-data recommendation

For the actual app, I'd do this:

**Best setup:** run your own daily job using the same ephemeris/calculator stack you already use. Store daily sky snapshots and per-user activation packets. This keeps the symbolic engine yours.

**Fast prototype:** compare your outputs against Kerykeion/Astrologer API or FreeAstroAPI. Kerykeion and its API are especially useful because they expose structured chart/transit data, while FreeAstroAPI already has ephemeris and transit timeline endpoints. ([GitHub][3])

**Commercial fallback:** AstrologyAPI has a daily natal transits endpoint, but I would use it for verification/prototyping, not as your spiritual engine. ([Astrology API][9])

The cleanest architecture is still:

```txt
your calculator
→ your daily sky cache
→ your deterministic analysis engine
→ renderer
```

Not:

```txt
third-party horoscope API
→ vibes
```

[1]: https://github.com/astrorigin/pyswisseph "astrorigin/pyswisseph: Python extension to the Swiss ..."
[2]: https://github.com/g-battaglia/kerykeion "g-battaglia/kerykeion: Data-Driven Astrology ..."
[3]: https://github.com/g-battaglia/Astrologer-API "g-battaglia/Astrologer-API: High-precision ..."
[4]: https://github.com/flatangle/flatlib "flatlib - flatangle"
[5]: https://github.com/theriftlab/immanuel-python "theriftlab/immanuel-python: Quickly produce both human- ..."
[6]: https://github.com/katelouie/stellium "katelouie/stellium"
[7]: https://ssd-api.jpl.nasa.gov/doc/horizons.html "Horizon API - jpl ssd/cneos api"
[8]: https://www.freeastroapi.com/docs "FreeAstroAPI Documentation | Astrology API Reference"
[9]: https://www.astrologyapi.com/western-api-docs/api-ref/200/natal_transits/daily "Astrology API Json Documentation | Natal Transits"
[10]: https://www.astro.com/swisseph/swephinfo_f.htm "Swiss Ephemeris - for 8000 years and more"
