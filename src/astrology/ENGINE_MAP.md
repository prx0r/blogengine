# Complete Engine Map — Astrology to Practice

## The Full Chain

```
BIRTH DATA + CURRENT TIME
         ↓
┌────────────────────────────────────────────────────────────┐
│                    COMPUTATION (caelus)                     │
│  Ephemeris, chart computation, aspects, lots               │
│  → Raw planetary positions                                 │
└────────────────────────────────┬───────────────────────────┘
                                 ↓
┌────────────────────────────────────────────────────────────┐
│               ENGINE (16 deterministic layers)              │
│                                                             │
│  activation_engine.ts    — timing + scoring + confidence    │
│  valens_combinations.ts  — 21 pair rules                    │
│  oikodespotes.ts         — personal daimon                  │
│  daimonic_houses.ts      — 5/6/11/12 house tagging         │
│  antiscia.ts             — hidden connections               │
│  bonification.ts         — striking, enclosure, reception   │
│  aspect_patterns.ts      — grand trine, t-square, etc.     │
│  natal_promise.ts        — stellium, element, modality      │
│                                                             │
│  → ActivationPacket (pure signals, no interpretation)       │
└────────────────────────────────┬───────────────────────────┘
                                 ↓
┌────────────────────────────────────────────────────────────┐
│              MACRO TRANSLATION (aggregator.ts)              │
│                                                             │
│  Takes ActivationPacket → PlanetMacroContext[]              │
│  Each context preserves:                                    │
│    planet · sign · house · nature · element · modality     │
│    ruler · dignity · retrograde · angularity · confidence  │
│    timingSources · alKhayyatRule · valensPairs · isDaimon  │
│                                                             │
│  Also: timescales (year/month/week/day as structured data) │
│                                                             │
│  → MacroTranslation (structured, never summarized away)    │
└────────────────────────────────┬───────────────────────────┘
                                 ↓
┌────────────────────────────────────────────────────────────┐
│              INTERPRETERS (5 systems)                       │
│                                                             │
│  al-Khayyāt (9th C)  → lookup table, 84 rules              │
│  Valens (2nd C)      → pair matching, 21 combinations      │
│  Ficino (Renaissance)→ practice profiles                   │
│  Greenbaum (modern)  → daimon/fortune ontology             │
│  Demetra George      → generative 6-step method            │
│                                                             │
│  → InterpretedReading (structured perspectives)            │
└────────────────────────────────┬───────────────────────────┘
                                 ↓
┌────────────────────────────────────────────────────────────┐
│            CONVERGENCE DETECTION                            │
│                                                             │
│  Planets flagged by 3+ systems → HIGH confidence theme     │
│  Practice advice converging across systems → recommend     │
│                                                             │
│  → { planets: string[], themes: string[], advice: [] }     │
└────────────────────────────────┬───────────────────────────┘
                                 ↓
┌────────────────────────────────────────────────────────────┐
│              PRACTICE RECOMMENDER (spellbook)               │
│                                                             │
│  Takes convergence + macro → builds trigger vector          │
│  → trigger:active:mars, trigger:daimon:mercury, etc.       │
│  → Queries SpellEntry[] by matching triggers                │
│  → Returns: rituals, prayers, meditations, talismans       │
│                                                             │
│  Each SpellEntry has:                                       │
│    triggers: string[]      ← engine state → spell matching │
│    planets: string[]       ← shared entity IDs             │
│    procedure: string[]     ← step-by-step (universal)      │
│    incantation?: string    ← prayer text (optional)        │
│    timing, materials, safety                               │
└────────────────────────────────┬───────────────────────────┘
                                 ↓
┌────────────────────────────────────────────────────────────┐
│              KNOWLEDGE GRAPH (knowledge_graph.ts)           │
│                                                             │
│  One graph, shared entity IDs, connects EVERYTHING:        │
│                                                             │
│  planet:mars ──has_condition──→ condition:mars_detriment   │
│  planet:mars ──interpreted_by──→ al-khayyat:mars_in_10    │
│  planet:mars ──practice_for──→ spell:picatrix:mars:001    │
│  planet:mars ──corresponds_to──→ corr:herb:basil          │
│  planet:mars ──corresponds_to──→ corr:metal:iron          │
│  planet:mars ──corresponds_to──→ corr:colour:red          │
│                                                             │
│  traverse("planet:mars") → ALL connected data              │
│  clusterByPlanet("mars") → ALL in one traversal            │
│                                                             │
│  → Complete context for any entity                         │
└────────────────────────────────────────────────────────────┘
```

## Data Flow — Example for Thomas Prior, Today

```
1. BIRTH CHART (1999-05-16, 14:37, Ascot)
   → caelus computes: Sun Taurus 25° H8, Moon Gemini 11° H9, etc.
   
2. ENGINE
   → Saturn active as annual profection lord + firdaria lord
   → Jupiter active as ZR Fortune lord + transit
   → Mercury active as daimon + firdaria
   → Confidence: high (3+ timing sources)
   
3. MACRO TRANSLATION
   → Year: H4 (Capricorn/Saturn) — foundations, family, home
   → Month: H11 — friends, community
   → Day: Jupiter (high), Saturn (high), Mercury (medium)
   → Saturn in Taurus H8, retrograde, year lord
   
4. INTERPRETERS
   → al-Khayyāt: "Saturn in H8 = inheritances, death of relatives, long mourning"
   → Valens: "Jupiter+Mercury = wise speech, expansive thought"
   → Ficino: "Saturn → strengthen with warming practices"
   → Greenbaum: "Mixed mode — both circumstance and intention active"
   → Demetra: "Saturn in Taurus (fixed earth): patient, persistent, productive"
   
5. CONVERGENCE
   → Planets: saturn, jupiter, mercury (3+ systems)
   → Advice: patient building, philosophical communication
   
6. PRACTICE RECOMMENDER
   → Triggers: ["trigger:active:saturn", "trigger:active:jupiter", 
                "trigger:year_lord:saturn", "trigger:daimon:mercury"]
   → Matches: Warming Saturn Practice, Saturnian Structure, Jupiterian Wisdom
   
7. KNOWLEDGE GRAPH
   → traverse("planet:saturn") → conditions, interpretations, 
     correspondences (herb:myrrh, metal:lead, colour:black), spells
```

## Data Categories (Complete Inventory)

| Layer | Files | Lines | Structured? | Source |
|---|---|---|---|---|
| **Engine** | `activation_engine.ts`, `activation_packet.ts`, etc. | ~3,000 | ✅ Deterministic | — |
| **Macro Translation** | `interpreters/aggregator.ts` | ~305 | ✅ PlanetMacroContext[] | All sources combined |
| **Interpreters** | `interpretation_schema.ts`, `interpreters/*.ts` | ~600 | ✅ | 5 distinct traditions |
| **Knowledge Graph** | `knowledge_graph.ts` | ~180 | ✅ typed Map | Shared entity IDs |
| **Source Rules** | `source_rules.ts` | ~250 | ✅ 117 rules | Valens + al-Khayyāt |
| **Correspondences** | `spellbook/correspondences.ts` | ~150 | ✅ 69 entries | Agrippa, Picatrix, 777 |
| **Spellbook** | `spellbook/spellbook.ts` | ~370 | ✅ 13 entries | Ficino, Orphic, Picatrix, Agrippa, PGM |
| **Ritual References** | `ritual_references.ts` | ~236 | ✅ 28 references | Ficino, Orphic, Picatrix, PGM, Agrippa |
| **Planet Profiles** | `planet_profiles.ts` | ~127 | ✅ 7 profiles | Valens/Ficino |
| **Picatrix (raw)** | `/tmp/picatrix_b1b2.txt` + `_b3b4.txt` | 26,665 | ❌ Unparsed | PDF → text |
| **Agrippa (raw)** | `blueprints/source_texts/agrippa-*.txt` | ~970K | ❌ Unparsed | Plain text |
| **PGM (raw)** | `content/glossary/sources/books/pgm.txt` | 1.2M | ❌ Unparsed | Plain text |
| **Skinner (ref)** | `StephenSkinner-*.pdf` | 22MB | ❌ Needs readable file | PDF (corrupted text) |

## What Connects to What

```
Engine → MacroTranslation:  deterministic, always preserves all data
                             ↓
MacroTranslation → Interpreters:  each reads the same structured data
                                   ↓
Interpreters → Convergence:  counts agreement across systems
                              ↓
Convergence → PracticeRecommender:  builds trigger vector from macro + convergence
                                     ↓
PracticeRecommender → Spellbook:  queries SpellEntry[] by triggers
                                   ↓
Spellbook → Knowledge Graph:  registered with shared entity IDs
                               ↓
Knowledge Graph ← Correspondences:  also registered, same IDs
                                   ↓
All queryable via clusterByPlanet("mars") → computation + interpretation + practice + correspondences
```

## Key Principle

**Nothing is lost between layers.** The engine produces pure signals. The macro translation preserves every signal as structured data (never summarized into text). Interpreters read the same structured data. The practice recommender builds triggers from the structured convergence. The knowledge graph indexes everything with shared IDs. Every layer can be queried independently, and every layer connects through shared entity IDs.

The Skinner PDF (22MB) has corrupted text extraction — we can read the title "The Complete Magician's Tables" but the internal tables aren't extractable in the current file. All other source material is accessible.
