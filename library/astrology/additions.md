# Astrology Engine — Additions Evaluation

**Note on `azziz` (added after initial review):** This is the same Ibn Azziz academic paper already evaluated below — about the mathematics of computing planetary aspects ("projection of rays") using 14th-century numerical tables for the latitude of Fez. It contains no astrological interpretation rules. Same verdict: NOT WORTH BUILDING.

## Texts Ingested

| Text | Lines | Access | Signal |
|---|---|---|---|
| Persian Nativities Vol I (al-Khayyāt + Māshā'allāh) | 17,465 | ✅ Full text | **HIGH** |
| Abu Ma'shar — Great Introduction | 29,947 | ✅ Full text | MEDIUM |
| Hephaistion of Thebes — Apotelesmatics Book III | 9,201 | ✅ Full text | LOW |
| Dykes & Gibson — Astrological Magic | 9,367 | ✅ Full text | LOW |
| Al-Istiji — Epistle on Tasyir | 8,139 | ✅ Academic paper | LOW |
| Ibn Azzuz — Planetary Aspect Tables | 7,934 | ✅ Academic paper | LOW |
| Al-Biruni — Book of Instruction on the Elements | ~22 MB PDF | ❌ Password protected | (unknown) |

## Per-Text Analysis

### Persian Nativities Vol I — HIGH SIGNAL

**What it contains (al-Khayyāt, "On the Judgments of Nativities"):**

84 planet-in-house rules:
```
Saturn in 1st → "difficulty in all works, death from catastrophe"
Jupiter in 1st → "honor, reverence, prudence, good end"
Mars in 1st → "anger, war, contentions"
... × 12 houses × 7 planets
```

84 planet-in-sign rules (Ch.39-45):
```
Saturn in Capricorn (own) → "friendship of nobles, accumulation of substance"
Saturn in Aries (Mars domicile) → "heart of stone, little pity, abundance of anger"
Jupiter in Capricorn (Saturn domicile) → "heaviness, narrowness of heart, multitude of sorrow"
... × 12 signs × 7 planets
```

12 Lot of Fortune in house rules (Ch.49):
```
Fortune in 1st → "greatest fortune in acquiring resources, prosperous successes"
Fortune in 8th → "loss, buy nothing, sell nothing, gamble nothing"
... × 12 houses
```

12 North/South Node in house rules (Ch.48)

**How it contributes to analysis:**

Currently our engine says: "Mars is activated in the 10th house, confidence high."

With these rules it would say: "Mars is activated in the 10th house — al-Khayyāt says this signifies 'sorrow and captivity by powerful people, scarcity, wars, adversities.' The native should expect career friction, but the mode is 'cool' — channel Martial energy into disciplined craft rather than confrontation."

The engine moves from *detection* ("what is on?") to *delineation* ("what does this mean concretely?").

**Effort to build:**
- 168 rules extracted as structured JSON (~200 lines of data)
- One `delineation_engine.ts` module (~100 lines) that looks up house + planet → returns delineation text
- Add `delineation` field to `PlanetConditionPacket`
- Add `delineations: string[]` to `DailySphereReading`

**Verdict: WORTH BUILDING.** Fills the biggest gap: moving from "planet X is active" to "planet X in house Y means Z for the native's concrete life."

---

### Abu Ma'shar — Great Introduction — MEDIUM SIGNAL

**What it contains:**
- Book V: Shares (dignities), triplicities, faces, terms, bounds — **mostly redundant with caelus**
- Book VI: Sign classifications, aspects — **interesting but not actionable for our engine**
- Book VII: Elemental combinations in conjunctions — **too abstract for structured rules**
- Book VIII: Complete lot system — ~50 lots with formulas and interpretations for each

**How it contributes:**
We currently compute 7 Hermetic lots but only interpret Fortune and Spirit semantically. Abu Ma'shar gives interpretations for specialized lots (Lot of Father, Lot of Siblings, Lot of Profession, Lot of Marriage, etc.) that would deepen each house's analysis. But these lots are mostly used in horary, not natal.

**Effort to build:**
- Add ~50 lot formulas (most are variations of ASC + PlanetA - PlanetB)
- Interpretations for each in each sign
- Significant code + data for marginal natal gain

**Verdict: NOT WORTH BUILDING for natal engine.** The specialized lots are mostly for horary. Our existing 7 Hermetic lots plus the Fortune/Spirit semantic split cover natal needs. Would revisit if we add horary.

---

### Hephaistion Book III — LOW SIGNAL

**What it contains:**
- Inception/electional rules for specific activities (marriage, farming, building, travel, surgery)
- "Thought-interpretation" — divining the client's question before they ask
- Event chart analysis
- Prototype horary techniques

**Why it's low signal:**
The entire book is about *inception charts* (elections) and *event charts* — different branches of astrology. The "victor" method (finding the primary significator) is interesting but Hephaistion's version is aimed at horary questions, not natal analysis.

**Verdict: NOT WORTH BUILDING.** Different branch of astrology. Would revisit if we add electional or horary.

---

### Dykes & Gibson — Astrological Magic — MEDIUM SIGNAL (for practice layer)

**What it contains:**
- 7 complete planetary rituals with step-by-step procedures
- Planetary significations (7 dense pages per planet)
- Astrological election rules for ritual timing (planetary hours, days)
- Consecration procedures for each planet (candle, incense, color, Tarot)
- Zodiacal invocation rituals (12 signs)
- Alternative pantheon tables (Egyptian, Greek, Qabalistic divine names)

**Why it was undervalued:**
I dismissed this as "just a Golden Dawn ritual manual" — but it actually contains the most structured, ready-to-use planetary practice material of any text we have. Our current 28 ritual references are 2-3 sentence summaries for 7 planets. This text gives full ritual procedures that the LLM could reference when rendering alignment advice.

**How it contributes:**
It doesn't change the deterministic engine (planet activation, confidence scoring, Fortune/Spirit split all stay the same). But it dramatically enriches the **alignment recommendations** — currently our alignment cards say "use green and rose" for Venus; this text gives a complete Venus ritual with timing, materials, invocations, and meditations.

**The distinction matters:**
- Changes the analytical engine? ❌ No
- Enriches the LLM-rendered output? ✅ Yes, significantly
- Would it improve the DailySphereReading JSON structure? ❌ No (same fields, richer content)

**Effort to build:**
- Extract planetary significations as structured descriptions (~50 lines per planet, ~350 total)
- Add to `PlanetaryAlignmentProfile` as new optional fields: `ritual_procedure`, `prayer_text`, `election_rules`
- Add planetary hour computation (caelus doesn't compute this)
- ~500 lines of data, ~100 lines of code

**Verdict: WORTH BUILDING if we prioritize LLM output quality over analytical depth.** Low priority compared to al-Khayyāt's delineation rules, but high value for the user-facing reading quality.

---

### Al-Istiji — Epistle on Tasyir — MEDIUM SIGNAL (points to unused caelus features)

**What it contains:**
- An 11th-century academic paper on primary directions (tasyir) mathematics
- Discussion of different methods for projecting rays (computing aspects)
- Historical survey of computational techniques

**Why I was wrong to call it LOW:**
The paper itself doesn't contain runnable algorithms — it's scholarly commentary. **But it points to a major gap:** caelus already has a `directions` module with `primaryDirections()` that computes when a planet will reach a specific point by primary direction. We never call it. This is a completely different time-lord system from profections and ZR.

Primary directions would add a **yearly timing layer** that answers: "When will this natal promise activate?" rather than just "What is active right now?"

**Computational features we should build (not from the text, but triggered by reading it):**

| Feature | caelus module | What it adds |
|---|---|---|
| Primary directions | `directions.ts` → `primaryDirections()` | When a planet will reach ASC/MC by primary motion — a major predictive technique |
| Mundane directions | `directions.ts` → `mundaneDirections()` | Timing through house-based motion |
| Firdaria | `firdaria.ts` → `firdariaAt()` | Persian 7-planet time-lord system — each planet rules a period of years |
| Planetary hours | Not in caelus — must build | The planetary hour and day for any time — refines alignment timing |

**These are the computational features from the Persian/Arabic tradition that we're genuinely missing.** Not because the texts teach us new algorithms, but because caelus already has the engines and we never wired them in.

**Verdict: WORTH BUILDING (the caelus modules, not the text itself).** Primary directions and firdaria would add two new independent timing layers. A planet activated by a primary direction AND profection AND ZR would be the strongest possible signal.

### Ibn Azzuz — Planetary Aspect Tables — LOW SIGNAL (redundant)

The paper discusses different methods for computing aspects (projection of rays). caelus already computes aspects using standard ecliptic longitude differences. The "Single Hour Line" method is a historical curiosity — less accurate than modern computation. No actionable content for our engine.

**Verdict: NOT WORTH BUILDING.**

---

### Al-Biruni — Book of Instruction — INACCESSIBLE

22 MB PDF with password protection. Based on known content (al-Biruni's "Book of Instruction in the Elements of the Art of Astrology"), this would contain:
- Complete house-by-house delineation system
- Lots and their interpretations
- Planetary condition doctrine
- Conjunctions and aspects

**Verdict: WOULD BUILD if we can access it.** This is a comprehensive manual that would complement al-Khayyāt's rules.

---

## Projected Build Spec (Only High Signal)

### Module: `delineation_engine.ts` — 1-2 days

```ts
// Data: 84 planet-in-house rules as typed array
interface PlanetInHouseRule {
  planet: PlanetId;
  house: number;
  delineation: string;       // primary meaning
  nuance?: string;           // refined by sign/dignity
  source: string;            // "al-Khayyāt Ch.47" | "Māshā'allāh III.2"
}

// Data: 84 planet-in-sign rules as typed array
interface PlanetInSignRule {
  planet: PlanetId;
  sign: string;              // or sign_index
  day_delineation: string;
  night_delineation?: string;
  source: string;
}

// Data: 12 Fortune-house rules
interface LotInHouseRule {
  house: number;
  delineation: string;
  caution?: string;
}

// Function:
function getPlanetInHouseDelineation(planet: PlanetId, house: number, day: boolean): string
function getPlanetInSignDelineation(planet: PlanetId, signIndex: number, day: boolean): string
function getFortuneInHouseDelineation(house: number): string
```

**Integration points:**
- `PlanetConditionPacket` gets new field: `delineation: string`
- `fortune_layer` gets new field: `delineation: string`
- `daimonic_interpretation` gets new field: `house_delineations: string[]`
- Activated planets in their houses get looked up and appended to `why_this_planet` in graph trace

**What the output change looks like:**

Before:
```json
{
  "natal_activation": {
    "activated_planets": ["mars"],
    "activated_houses": [10]
  }
}
```

After:
```json
{
  "natal_activation": {
    "activated_planets": ["mars"],
    "activated_houses": [10]
  },
  "planet_conditions": [{
    "planet": "mars",
    "house": 10,
    "delineation": "Sorrow and captivity by powerful people, scarcity, wars, adversities (al-Khayyāt Ch.47)"
  }]
}
```

### Cost/Benefit Summary

| Addition | Lines to write | Analytical improvement | Worth it? |
|---|---|---|---|
| Planet-in-house rules (84) | ~300 | **Critical.** Transforms "planet active" → "this means X for the native's life" | ✅ YES |
| Planet-in-sign rules (84) | ~300 | **Strong secondary.** Modifies house meaning by sign | ✅ YES |
| Fortune-in-house rules (12) | ~50 | **Useful.** Gives concrete meaning to the fortune layer | ✅ YES |
| Node-in-house rules (12) | ~50 | **Minor.** Strengths the daimonic houses layer | ⬜ maybe |
| Abu Ma'shar lots (50) | ~500 | Marginal for natal. Mostly horary | ❌ NO |
| Hephaistion victor | ~200 | Different branch (elections) | ❌ NO |
| Astrological Magic rituals | ~200 | Our ref layer is already sufficient | ❌ NO |
| Tasyir directions | ~300 | caelus already has directions module | ❌ NO |
| Al-Biruni book | — | Can't access (password) | ❌ BLOCKED |

### Build Order

**Phase 1: Delineation Engine (adds meaning to what's active)**
1. `delineation_engine.ts` — structured if-then rules from al-Khayyāt Ch.47 + Ch.39-45 + Ch.49
2. Integrate into `PlanetConditionPacket.delineation`
3. Integrate into `fortune_layer.delineation`
4. Update `daily_sphere_reader.ts` to pipe delineations into graph trace
5. Add test: verify Mars in 10th returns "sorrow and captivity by powerful people"
6. Add test: verify Fortune in 8th returns "loss, buy nothing, sell nothing"

**Phase 2: New Timing Layers (adds more activation sources)**
7. Wire caelus `firdariaAt()` into activation engine as yearly time-lord (weight = 4)
8. Wire caelus `primaryDirections()` as yearly time-lord for planets approaching angles (weight = 3)
9. Build planetary hour computation for daily alignment timing recommendation
10. Add test: firdaria lord gets same confidence boost as annual profection lord

**Phase 3: Practice Layer Enrichment (improves LLM output)**
11. Extract Astrological Magic planetary procedures into rich `PlanetaryAlignmentProfile` data
12. Add planetary hour to alignment recommendations
13. Add ritual procedure text to ritual_references
