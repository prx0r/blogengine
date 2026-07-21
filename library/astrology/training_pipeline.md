# Training & Validation Pipeline — Complete Spec

## Overview

The pipeline has three purposes:
1. **Validate** the engine's core claims (daimon, timing, dignity scoring)
2. **Calibrate** weights empirically from data
3. **Record** every run for future fine-tuning

---

## 1. Data Ingestion — Wikidata SPARQL

### Schema

```sparql
SELECT ?person ?personLabel ?birthDate ?deathDate ?occupation ?occupationLabel ?birthPlace ?birthPlaceLabel ?country WHERE {
  ?person wdt:P31 wd:Q5 .                              # instance of human
  ?person wdt:P569 ?birthDate .                         # date of birth
  ?person wdt:P106 ?occupation .                        # occupation
  ?person wdt:P19 ?birthPlace .                         # place of birth
  ?birthPlace wdt:P17 ?country .                        # country
  FILTER(?birthDate >= "1850-01-01"^^xsd:dateTime)      # modern era
  FILTER(?birthDate <= "2000-01-01"^^xsd:dateTime)
  OPTIONAL { ?person wdt:P570 ?deathDate . }            # date of death (optional)
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
```

### Domain-specific occupation filters

| Domain | Wikidata occupation IDs | Label filter |
|---|---|---|
| Athletes | wd:Q20661331 (athlete), wd:Q11513337 (sportsperson) | — |
| Artists | wd:Q483501 (artist), wd:Q3391743 (painter), wd:Q1774391 (sculptor) | — |
| Writers | wd:Q36180 (writer), wd:Q6625963 (poet), wd:Q125191 (playwright) | — |
| Musicians | wd:Q639669 (musician), wd:Q36834 (composer), wd:Q177220 (singer) | — |
| Scientists | wd:Q901 (scientist), wd:Q169470 (physicist), wd:Q2374149 (chemist) | — |
| Leaders | wd:Q5 (head of state type), wd:Q11696 (CEO) | filter: Q82955 (politician) |
| Philosophers | wd:Q4964182 (philosopher), wd:Q209375 (theologian) | — |

### Available Datasets

| Dataset | Birth times | Occupations | Size | Cost | Format | Priority |
|---|---|---|---|---|---|---|
| **Open Gauquelin Database** | ✅ YES (24,542 records) | ✅ 70+ categories | ~25K | Free | CSV / PostgreSQL | **HIGHEST** |
| Wikidata SPARQL | ❌ Rare (date only) | ✅ P106 property | ~10M | Free | SPARQL | Medium |
| AstroDataBank | ✅ Yes | ✅ Tags | ~65K | Free per-entry | HTML | Medium (scraping needed) |
| Castille (France) | ❌ No | ❌ No | ~2M dates | Free | CSV | Control group only |

### Primary: Open Gauquelin Database

**Access**: https://opengauquelin.org/downloads (direct CSV download)
**Format**: CSV with semicolon separator, ISO 8601 dates, timezone offsets
**Key fields**: `name`, `birth_date`, `birth_time`, `birth_tz`, `birth_place`, `latitude`, `longitude`, `occupation`, `eminence_group`, `wikidata_id`

**Occupation categories available**: sportspersons, physicians, politicians, writers, actors, researchers, military, musicians, painters, scientists, journalists, and more. Each with eminence scores (Ertel's eminence ratings for athletes).

**Why this is better than Wikidata**: Birth times are the single most important variable for accurate chart computation. OGDB has 24,542 records with verified birth times — noon approximation introduces significant noise in house placement and almuten calculation.

### Data cleaning rules

1. Remove entries where `birthDate` has year-only (no month/day) — insufficient precision
2. Remove entries where birth place lat/lon can't be resolved (need coordinates for house system)
3. For OGDB data: use actual birth time directly (available in the dataset)
4. For Wikidata data: use noon (12:00 local time) as default fallback
5. For death dates: exact date only (time not needed for daily activation comparison)

### Data storage (D1 table)

```sql
CREATE TABLE IF NOT EXISTS training_subjects (
  id TEXT PRIMARY KEY,              -- Wikidata Q ID
  label TEXT NOT NULL,              -- Display name
  birth_date TEXT NOT NULL,         -- ISO 8601 date
  birth_lat REAL,                   -- Birth place latitude
  birth_lon REAL,                   -- Birth place longitude
  birth_place_name TEXT,
  death_date TEXT,                  -- ISO 8601 date (nullable)
  occupations TEXT NOT NULL,        -- JSON array of occupation Q IDs
  domain TEXT NOT NULL,             -- "athlete" | "artist" | "writer" | ...
  chart_json TEXT,                  -- Computed NormalizedChart (nullable, cached)
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS training_activation_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subject_id TEXT NOT NULL REFERENCES training_subjects(id),
  target_date TEXT NOT NULL,        -- Date this activation was computed for
  date_type TEXT NOT NULL,          -- "death" | "control" | "prime_age" | "random"
  packet_json TEXT NOT NULL,        -- Full ActivationPacket JSON
  oikodespotes_planet TEXT,         -- Cached for fast querying
  oikodespotes_score REAL,
  dominant_mode TEXT,
  fortune_score REAL,
  spirit_score REAL,
  signals_json TEXT,                -- Just the signals array for fast querying
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_tar_subject ON training_activation_records(subject_id);
CREATE INDEX idx_tar_domain ON training_subjects(domain);
CREATE INDEX idx_tar_oikodespotes ON training_activation_records(oikodespotes_planet);
```

---

## 2. Pipeline Architecture

```
┌──────────────────────┐     ┌──────────────────────┐     ┌──────────────────────┐
│   STEP 1: FETCH      │     │   STEP 2: MATCH      │     │   STEP 3: COMPUTE    │
│                      │     │                      │     │                      │
│  Wikidata SPARQL     │──→  │  Resolve birth place │──→  │  For each subject:   │
│  → 20K subjects     │     │  → lat/lon           │     │  caelus.chart(noon)  │
│  → Domain labels    │     │  → store in DB       │     │  → NormalizedChart   │
│  → DOB + DOD        │     │                      │     │  → cache in DB       │
└──────────────────────┘     └──────────────────────┘     └──────────────────────┘
                                                                  │
                                                                  ▼
┌──────────────────────┐     ┌──────────────────────┐     ┌──────────────────────┐
│   STEP 6: ANALYZE   │     │   STEP 5: EXPERIMENTS│     │   STEP 4: ACTIVATE   │
│                      │     │                      │     │                      │
│  Statistical tests   │←──  │  1. Daimon validation│←──  │  For each subject:   │
│  → Effect sizes     │     │  2. Death timing      │     │  buildActivationPacket│
│  → p-values         │     │  3. Vocation mapping  │     │  → 1 for nata chart  │
│  → Learned weights  │     │  4. Weight learning   │     │  → target dates      │
│  → Charts + reports │     │  5. Element/modality  │     │  → store in DB       │
└──────────────────────┘     └──────────────────────┘     └──────────────────────┘
```

---

## 3. Statistical Framework

All three experiments use the same statistical approach:

| Element | Definition |
|---|---|
| **Null hypothesis (H₀)** | The engine produces results indistinguishable from random |
| **Alternative (H₁)** | The engine detects real structure (daimon-vocation correlation, death timing, etc.) |
| **Significance threshold** | α = 0.01 (Bonferroni-corrected for multiple comparisons) |
| **Power** | β = 0.80 (80% chance of detecting a real effect) |
| **Test type** | Binomial test (binary outcomes) + Chi-square (multi-category) |

### Multiple Testing Correction

We test 7 domains against 7 planets = 49 comparisons. Naive α = 0.05 would produce ~2.5 false positives by chance alone.

**Correction**: Bonferroni. Adjusted threshold α' = 0.01 / 49 ≈ 0.0002.

**Interpretation**: A p-value of 0.0002 means there's a 1 in 5,000 chance of seeing this result if H₀ is true. We'll only call a result "significant" if p < 0.0002.

**Exception**: The death date experiment tests 1 hypothesis (Saturn is elevated on death dates), single comparison → α = 0.01.

### Statistical Power & Sample Size

How many subjects do we need to detect a real effect?

| Effect size | Description | Subjects needed (per domain) |
|---|---|---|
| Large (e.g., 28% vs 14%) | Mars in 28% of athletes vs 14% baseline | 200 |
| Medium (e.g., 21% vs 14%) | Mars in 21% of athletes vs 14% baseline | 600 |
| Small (e.g., 17% vs 14%) | Mars in 17% of athletes vs 14% baseline | 4,000 |

Our target is 1,000 per domain. This gives us 80% power to detect a medium effect (21% vs 14%, p < 0.0002). If the real effect is smaller than that, we won't detect it — and we'll need to decide whether a 3% above-baseline effect is practically meaningful even if statistically significant.

### Confounders & Potential Flaws

| Flaw | Effect | Mitigation |
|---|---|---|
| **No birth time** (using noon) | Noon may produce incorrect house placements, shifting oikodespotes calculation. The almuten() depends on degree-level accuracy. | 1. Run sensitivity analysis: compare noon vs random time on a subset with known birth times. 2. If sensitivity is high, restrict to people with known birth times only (AA-rated charts) |
| **Domain misclassification** | A person with multiple occupations (e.g., philosopher AND athlete) dilutes the signal. | 1. Only include subjects where ≥ 80% of their occupations fall in ONE domain. 2. If unclear, assign to most common domain. 3. Report results with and without ambiguous subjects. |
| **Cultural bias** | Eminent people are not uniformly distributed across cultures. Athletes might cluster in certain birth months for sociological reasons (e.g., school cutoff dates), not astrological ones. | 1. Check birth month distribution against general population. 2. If athletes cluster in certain months (known: soccer players cluster in Q1), control for birth month. |
| **Oikodespotes ties** | If two planets have equal almuten scores, we pick the first by planet order. This could introduce systematic bias. | 1. Report how many ties occur. 2. If > 5% of cases have ties, use a tie-breaking rule and report sensitivity. 3. Better: use fractional scoring (weighted) instead of winner-take-all. |
| **Survivorship bias** (death dates) | We only have death dates for people who died. If the engine is better at predicting certain causes of death (e.g., violent vs natural), results may not generalize. | 1. Report breakdown by cause of death if available. 2. Compare sudden death vs prolonged illness separately. |
| **Control date selection** | If control dates are too close to death date, transits may be autocorrelated (planets move slowly). | 1. Select control dates from the SAME YEAR as death (to control for age-related effects), but at least 30 days apart from death date. 2. Select from sibling years (± 5 years) as a robustness check. |
| **Geographic bias** | Eminent people cluster in certain birth places (Europe, North America). The house system depends on latitude (extreme latitudes cause house issues). | 1. Exclude subjects born above 66° or below -66° latitude. 2. Check if results hold when restricting to mid-latitudes only. |
| **Publisher effect** | Wikidata's "eminent people" are not a random sample — they're notable enough for Wikipedia. This is actually INTENTIONAL (we want eminent people who have found their daimon), but means results may not generalize to non-eminent populations. | Acknowledge as a feature, not a bug. The hypothesis specifically concerns people who have actualized their daimon. |

---

## 4. Experiments — Detailed Specs

### Experiment 1: Daimon Validation (Highest Priority)

**Question**: Does the oikodespotes predict vocation?

**Critical flaw in naive approach**: Testing each domain against 1/7 assumes all planets are equally likely across all domains. But the oikodespotes distribution has inherent biases (some planets consistently win almuten more often), and one planet can rule multiple vocations (Mercury → writer, philosopher, scientist). A writer with Jupiter isn't necessarily a "miss" — they may write philosophical or legal content.

**Null hypothesis (H₀)**: The 7×7 contingency table (domain × oikodespotes planet) has no structure. The distribution of oikodespotes planets is the SAME across all domains. Writers and athletes draw from the same probability distribution.

**Alternative (H₁)**: The distribution differs between domains. Some planets appear more often in some domains than in others.

**Primary test**: Chi-square test of independence on the full 7×7 contingency table (7 domains × 7 planets). This tests whether the planet distribution varies by domain WITHOUT assuming which planets go with which domains.

**Secondary test**: For each domain, compare its oikodespotes distribution against ALL OTHER DOMAINS combined (Fisher's exact test or z-test for proportions). Example: "Is Mars more common in athletes than in non-athletes?" This controls for the base rate of each planet.

**Tertiary test**: For each planet, rank the domains by how often that planet appears. The domain ranked highest should match the traditional association. Example: If Mercury is most common in writers, second in philosophers, third in scientists — that's supporting evidence even if the absolute rate is low.

**Why this is smarter**:
- Doesn't assume uniform 1/7 base rate (which is false — our pilot shows Mercury dominates at ~26%, Saturn at ~6%)
- Accounts for one planet → multiple vocations (Mercury → writer OR philosopher)
- Accounts for multiple planets → one vocation (writer could be Mercury-ruled OR Jupiter-ruled)
- The control group isn't needed — each domain is its own control against the others

**Planned analysis**:
```
For each domain:
  observed_rate = count(oikodespotes == expected_planet) / N
  expected_rate = 1/7 ≈ 0.143
  p = binomial_test(observed, N, expected_rate)
  If p < 0.0002: significant
  
Full table:
  contingency = 7×7 matrix [domain][planet]
  χ² = chi_square_test(contingency)
  If χ² p < 0.01: domain and oikodespotes are associated
```

**
What the results mean**:

| Outcome | Interpretation | Action |
|---|---|---|
| 4+ domains show p < 0.0002 for expected planet | Daimon theory strongly validated, dignity scoring works | Publish. Use results to calibrate almuten weighting if needed |
| 2-3 domains show p < 0.0002 | Partial validation. Some domains have real signal, others don't | Investigate which domains failed and why. Maybe the planet-domain mapping is wrong for those |
| χ² significant but no single domain passes Bonferroni | Weak signal spread across domains. Real effect but too small for our sample size | Increase N from 1K to 5K per domain. Try aggregating related domains (e.g., athletes + soldiers for Mars) |
| No test significant | Either: (a) noon birth times introduce too much noise, (b) oikodespotes doesn't predict vocation, (c) almuten scoring is wrong, (d) planet-domain mapping is wrong | Run sensitivity analysis with known birth times. If that fails too, the daimon hypothesis as tested is not supported |
| One planet dominates ALL domains | Likely a calculation bug (e.g., Sun always wins almuten because exaltation in Aries gives it points at ASC) | Investigate almuten() logic. Add debug output for a sample of charts |

### Experiment 2: Death Date Timing

**Question**: Does the engine assign higher confidence to Saturn / 8th-house-related planets on actual death dates than on random dates?

**Null hypothesis (H₀)**: Saturn confidence on death dates is drawn from the same distribution as on control dates. The probability that death-date Saturn ranks in the top 5% of all dates for a given person is exactly 5%.

**Alternative (H₁)**: Death-date Saturn confidence is systematically higher. The probability of ranking in the top 5% is > 5%.

**Method**:
```
For each of 10,000 subjects with known DOD:
  control_dates = 20 random dates (± 10 years from death, not within 30 days of death)
  all_dates = [death_date, ...control_dates]
  
  For each date:
    sky = compute current sky positions (e.g., year 2000 positions for all dates to 
          isolate natal promise from transit effects — or use real sky for full timing test)
    packet = buildActivationPacket(chart, sky, date)
    extract: saturn_confidence, saturn_score
  
  Rank death_date saturn_confidence among all 21 dates
  binary = 1 if rank == 1 (top ~5%), else 0
```

**Two versions**:
1. **Natal only**: Use fixed sky (year 2000 positions) for all dates. This tests whether the natal chart ALONE (profections, ZR, firdaria) predicts death timing without transits.
2. **Full timing**: Use actual historical sky for each date. Tests the full engine including transits.

**Statistical test**:
```
N = 10,000 subjects
observed_top1 = count(binary == 1)
expected_top1 = N / 21 ≈ 476 (4.76% by chance)

p = binomial_test(observed_top1, N, 1/21)
If p < 0.01: Saturn confidence is elevated on death dates
```

**Robustness checks**:
1. Repeat with Mars instead of Saturn (negative control — Mars should NOT predict death)
2. Repeat with random planets shuffled (should show no effect = sanity check)
3. Split by cause of death (sudden vs prolonged — Saturn should predict prolonged better)
4. Repeat with different number of control dates (10, 20, 50 — should be stable)

### Experiment 3: Weight Learning

**Question**: What are the optimal timing system weights?

**Method**: Logistic regression on death date labels.

```
Features (per person per date):
  x1 = 1 if annual profection lord is the same planet as the 8th house ruler
  x2 = 1 if ZR Spirit lord is the 8th house ruler
  x3 = 1 if ZR Fortune lord is the 8th house ruler
  x4 = 1 if Firdaria lord is the 8th house ruler
  x5 = 1 if a transiting malefic (Mars/Saturn) aspects natal 8th house ruler
  x6 = 1 if a transiting malefic aspects natal ASC

Label: y = 1 if this is a death date, 0 if control

Model: P(death) = sigmoid(w0 + w1*x1 + w2*x2 + ... + w6*x6)
```

**What weights mean in terms of the engine**:
- w₁/w₂/... represent the log-odds contribution of each timing system
- exp(wⱼ) = odds ratio: how many times more likely death is when system j is active
- If wⱼ ≈ 0 → system j doesn't predict death → we can remove it from the engine or reduce its weight
- If wⱼ > 0 → system j predicts death → its weight in the engine is justified

**Comparison to current weights**:
```
Current engine weights (hardcoded):
  annual_profection: 5
  zr_spirit: 5
  zr_fortune: 4
  firdaria: 4
  transit_to_malefic: 1

Learned from data:
  Learned weights may differ in relative magnitude.
  If firdaria learns w₄ ≈ 0 but current weight is 4 → firdaria is overvalued.
  If transit_to_malefic learns w₅ > transit_to_any → only malefics matter for death.
```

**Training protocol**:
1. Split data: 70% train, 15% validate, 15% test
2. Train logistic regression with L2 regularization
3. Evaluate on held-out test set: AUC-ROC, precision-recall at various thresholds
4. Report weights with 95% confidence intervals
5. Compare: does learned weighting outperform uniform weighting on held-out death prediction?

**Potential flaw**: Death dates are a narrow label. The learned weights may only be optimal for predicting death, not for general life events. A marriage-validation dataset would be ideal but we don't have one. Weight learning from death dates is a STARTING POINT, not the final calibrated system.

**Question**: What are the optimal timing system weights?

**Method**: Logistic regression using death dates as labels.

```
Features (per person per date):
  x1 = profection lord is active (0/1)
  x2 = ZR Spirit lord is active (0/1)
  x3 = ZR Fortune lord is active (0/1)
  x4 = Firdaria lord is active (0/1)
  x5 = Transit to natal Saturn exists (0/1)
  x6 = Transit to 8th house lord exists (0/1)
  
Label: y = 1 if this is a death date, 0 if control

Model: P(death) = sigmoid(w0 + w1*x1 + w2*x2 + ... + w6*x6)
Fit on 70% of data
Test on 30%
```

**What weights mean**:

| Weight | If high (+) | If near 0 | If negative (-) |
|---|---|---|---|
| w1 (profection) | Profection lord predicts death | Profection doesn't track death | Something is wrong |
| w2 (ZR Spirit) | ZR Spirit lord predicts death | ZR doesn't track death | — |
| w3 (ZR Fortune) | ZR Fortune lord predicts death | — | — |
| w4 (Firdaria) | Firdaria lord predicts death | Firdaria not useful | — |
| w5 (Saturn transit) | Transit Saturn aspecting natal predicts death | Transits don't predict death | — |

**Implementation**:
```ts
import { regression } from "ml-regression";  // or similar

const X = trainingRecords.map(r => [
  r.x1_profection, r.x2_zr_spirit, r.x3_zr_fortune,
  r.x4_firdaria, r.x5_saturn_transit, r.x6_8th_transit
]);
const y = trainingRecords.map(r => r.is_death_date ? 1 : 0);

const model = new LogisticRegression({ numSteps: 1000, learningRate: 0.01 });
model.train(X, y);
console.log("Learned weights:", model.weights);
// → [0.3, 2.1, 0.8, 1.5, 0.2, 0.6]
// Current: [5, 5, 4, 4, 1, 1]
```

**After learning**, the engine's scoring would use `LEARNED_WEIGHTS` instead of hardcoded values. A softmax or normalization step ensures the weights are in a comparable range.

---

## 4. Recording Pipeline — Logging Every Run

Every time the engine runs in production (via the astrology page), log the following:

```ts
interface RunRecord {
  run_id: string;                    // uuid
  timestamp: string;                 // ISO 8601
  subject: {
    id: string;                      // "anon" or user ID
    birth_date: string;
    birth_lat: number;
    birth_lon: number;
    chart: NormalizedChart;          // full computed chart
  };
  current_sky: Record<string, number>;  // planet → longitude
  input: PacketInput;                // what was passed to buildActivationPacket
  packet: ActivationPacket;          // the full output (signals + conditions + oikodespotes)
  // User feedback (optional, collected from UI)
  feedback?: {
    session_id: string;
    rating: number;                  // 1-5 thumbs
    notes?: string;                  // free text
    reported_event?: string;         // user reports a coincident event
  };
}
```

**Storage**: Batch-write to D1 table `training_activation_records`. ~3KB per record. 1,000 runs = ~3MB. Negligible storage.

**Privacy**: birth_date and location are stored. No names or emails without explicit consent. Hash user IDs.

---

## 5. Results Interpretation — What Each Outcome Means

### Oikodespotes validation outcomes

```
Scenario A: Clear signal (p < 0.01 for 3+ domains)
  → The daimon concept is empirically supported
  → Our dignity scoring and almuten() are correct
  → Publish paper

Scenario B: Weak signal (p < 0.05 for 1-2 domains)
  → Possible but inconclusive
  → Need more data (increase from 1K to 5K per domain)
  → Check if birth time noise is drowning signal
  → Try with birth time approximation: sunrise instead of noon

Scenario C: One planet dominates all domains
  → Likely a calculation bug (e.g., Sun always wins almuten)
  → Check: does almuten() return the same planet for everyone?
  → Check: are the 5 oikodespotes points correct?

Scenario D: No signal (p > 0.05 for all domains)
  → Either:
     (a) The oikodespotes concept is invalid (unlikely — Porphyry's method
         is specific and tested by astrologers for centuries)
     (b) Birth time noise drowns the signal (probable — noon is inaccurate)
     (c) Domain mapping is wrong (e.g., scientists aren't Jupiter-ruled)
     (d) The almuten scoring from caelus is incorrect for this purpose
```

### Death date timing outcomes

```
Scenario A: Saturn confident on death dates (p < 0.01)
  → Timing system validated
  → Current weights are in the right ballpark

Scenario B: No correlation
  → Timing system needs fundamental review
  → Try: does ANY timing system predict death?
  → Test each timing system individually before testing combinations
```

### Weight learning outcomes

```
Scenario A: Learned weights ≈ current weights
  → Our intuition was correct → keep hardcoded weights
  → Use learned weights for confidence intervals

Scenario B: Learned weights differ significantly
  → Replace hardcoded weights
  → Check: is the difference stable across train/test splits?
  → Example: if firdaria weight = 0, remove firdaria from engine
```

---

## 6. Build Plan

| # | Module | Description | Files | Time |
|---|---|---|---|---|
| 1 | `pipeline/fetch.ts` | Wikidata SPARQL query, parse results, handle pagination | New | 4h |
| 2 | `pipeline/geocode.ts` | Resolve birth place → lat/lon via Open-Meteo geocoding API | New | 2h |
| 3 | `pipeline/store.ts` | D1 schema creation, insert/query helpers | New | 2h |
| 4 | `pipeline/compute.ts` | For each subject: chart → activation → store in DB | New | 4h |
| 5 | `pipeline/experiment_daimon.ts` | Oikodespotes → domain → binomial test → report | New | 3h |
| 6 | `pipeline/experiment_death.ts` | Death date timing → per-person ranks → binomial test | New | 3h |
| 7 | `pipeline/experiment_weights.ts` | Logistic regression → learned weights → comparison | New | 3h |
| 8 | `pipeline/report.ts` | Generate markdown report with all results, charts, interpretation | New | 2h |
| 9 | Training record logging | Add `logRun()` call in astrology page after each computation | Modify page.tsx | 1h |
| 10 | Integration test | Run pipeline on 100 subjects → verify outputs | New | 2h |

**Total**: ~26 hours for initial implementation.
**Data collection**: ~2 days for SPARQL + geocode. ~1 day for computation (20K charts @ ~2s each ≈ 11 hours parallelized).

---

## 7. Quick Start — Running the Validation

```bash
# Fetch data
npx tsx src/pipeline/fetch.ts --domain athlete --limit 1000
npx tsx src/pipeline/fetch.ts --domain artist --limit 1000
# ... 5 more domains
npx tsx src/pipeline/fetch.ts --domain control --limit 3000

# Compute charts
npx tsx src/pipeline/compute.ts --batch 1

# Run experiments
npx tsx src/pipeline/experiment_daimon.ts    # → daimon_report.md
npx tsx src/pipeline/experiment_death.ts     # → death_report.md
npx tsx src/pipeline/experiment_weights.ts   # → weights_report.md
```
