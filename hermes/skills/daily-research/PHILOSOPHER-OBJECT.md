# Philosopher Object (PO) System

## Core Insight

Every philosopher is a bundle of structured data. Once structured, comparisons become mechanical. The content is just the output of transforming that data into narrative.

```
Data: PO_abhinavagupta + PO_iamblichus
  → compare metaphysics → find tension
  → apply to scenario → "Who wins in an earthquake?"
  → output: battle video script
```

## PO Schema

Stored in `content/philosophers/po-{slug}.json`:

```json
{
  "id": "po:abhinavagupta",
  "name": "Abhinavagupta",
  "era": "950-1020 CE",
  "tradition": "Kashmir Shaivism",
  "traditions": ["kashmir_shaivism", "trika", "tantra"],
  
  "metaphysics": {
    "summary": "All reality is the self-luminous consciousness (prakāśa) vibrating as self-awareness (vimarśa). The world is real because it is consciousness appearing as form, not because it is material.",
    "key_terms": {
      "prakāśa": "self-luminous consciousness, the light of awareness",
      "vimarśa": "self-awareness, the dynamic reflective power of consciousness",
      "spanda": "the universal vibration that is the pulse of consciousness",
      "anuttara": "the supreme, the unexcelled ground of all"
    },
    "ontology": "nondual_idealism",
    "epistemology": "recognition (pratyabhijñā) — you don't attain enlightenment, you recognize what you already are",
    "core_claim": "Consciousness is not a property of the world. The world is a property of consciousness.",
    "structure": {
      "type": "emanation_plus_return",
      "levels": ["śiva", "śakti", "sadāśiva", "īśvara", "sadvidyā", "māyā", "puruṣa", "prakṛti", "guṇas", "elements"],
      "count_tattvas": 36,
      "path": "upāya_system",
      "upāyas": ["āṇavopāya", "śāktopāya", "śāmbhavopāya"]
    }
  },
  
  "signature_ideas": [
    {"idea": "The universe is a theophany — God appearing as world", "source_ro": "ro:tantraloka-cosmology"},
    {"idea": "Recognition (pratyabhijñā) is the path, not attainment", "source_ro": "ro:tantraloka-three-means"},
    {"idea": "The body is a sacred text — the 36 tattvas are written on it", "source_ro": "ro:tantraloka-vol4"},
    {"idea": "Pleasure and pain are both pathways to the absolute", "source_ro": "ro:tantraloka-matter-of-wonder"}
  ],
  
  "assets": {
    "art": [
      {"id": "art_alchemy_e270", "caption": "Descent of light", "use": "emanation segments"},
      {"id": "art_alchemy_e001", "caption": "Astrologer consulting heavens", "use": "cosmology segments"},
      {"id": "art_astrological_bowl", "caption": "Cosmic order", "use": "tattva segments"}
    ],
    "quotes": [
      {"text": "Consciousness is not in the body. The body is in consciousness.", "source_ro": "ro:tantraloka-cosmology", "passage": "p_001"},
      {"text": "The supreme Lord freely creates the universe out of His own will, like a lover playing.", "source_ro": "ro:tantraloka-vol7", "passage": "p_003"}
    ],
    "primary_sources": [
      {"work": "Tantrāloka", "volumes": "1-10", "ro": "ro:tantraloka-vol4"},
      {"work": "Parātrīśikā Vivaraṇa", "ro": "ro:tantraloka-paratrisika-vivarana"},
      {"work": "Īśvara Pratyabhijñā Kārikā", "note": "not yet an RO"}
    ]
  },
  
  "affinities": [
    {"type": "influenced_by", "target": "po:somānanda", "note": "Śiva Dṛṣṭi"},
    {"type": "influenced_by", "target": "po:utpala", "note": "Pratyabhijñā tradition"},
    {"type": "parallel_to", "target": "po:plotinus", "note": "Emanation cosmology, though Abhinavagupta is nondual realist, Plotinus is emanationist"},
    {"type": "contrast_with", "target": "po:śaṅkara", "note": "World is real (Abhinavagupta) vs world is illusion (Śaṅkara)"},
    {"type": "contrast_with", "target": "po:iamblichus", "note": "Theurgy vs Recognition — ritual vs recognition as path"}
  ],
  
  "scenarios": [
    {
      "scenario": "Who would be more useful in an earthquake?",
      "response": "Abhinavagupta. His framework treats catastrophe as śakti's fierce expression — the shaking is spanda becoming visible. He would say: 'The earth trembles because consciousness is alive, not because matter breaks.' Iamblichus would need three days of purification rites before addressing the situation.",
      "tone": "playful_respectful",
      "publishable": true
    }
  ],
  
  "pipeline_ready": true
}
```

## Battle Format

A battle is just: PO_x + PO_y + scenario → compare → script.

```json
{
  "id": "battle:abhinavagupta-vs-iamblichus",
  "title": "Abhinavagupta vs Iamblichus: Who Wins in an Earthquake?",
  "format": "battle",
  "philosophers": [
    {"po": "po:abhinavagupta", "role": "nondual_idealist"},
    {"po": "po:iamblichus", "role": "theurgic_ritualist"}
  ],
  "scenario": "An earthquake destroys the temple. Both philosophers must respond.",
  "rounds": [
    {
      "name": "Diagnosis",
      "abhinavagupta": "The shaking is spanda — consciousness vibrating as itself. No catastrophe, just revelation.",
      "iamblichus": "The earthquake is a sign. The gods are communicating through the disruption of matter."
    },
    {
      "name": "Response",
      "abhinavagupta": "Recognize: the shaking and the shaken are one consciousness. Sit in the recognition.",
      "iamblichus": "Perform theurgic rites to restore cosmic harmony. The temple must be rebuilt ritually."
    },
    {
      "name": "Who Wins?",
      "result": "Abhinavagupta is more useful in the moment (response is immediate, no ritual required). Iamblichus builds a more resilient community (ritual structure outlasts the individual).",
      "punchline": "Abhinavagupta gets you through the earthquake. Iamblichus rebuilds the temple."
    }
  ],
  "hooks": [
    "Two of history's greatest philosophers walk into a temple. It collapses.",
    "Who would you want next to you when the ground shakes — a tantric master or a theurgic priest?"
  ]
}
```

## Battle as Content Pipeline

```
PO_abhinavagupta + PO_iamblichus
  → Hermes reads both POs
  → Picks scenario from either PO (or generates one)
  → Writes battle script (3-pass)
  → Pulls art from each PO's assets
  → Generates storyboard → voiceover → FableCut → YouTube
  
PO_abhinavagupta + PO_plotinus
  → Different comparison, same pipeline
  → Art assets change, quote pool changes
  → But the battle format stays the same
```

## The Factory Integration

| Object | What It Stores | Used For |
|--------|---------------|----------|
| RO | Passages from source texts | Essays, deep dives |
| CO | Comparison of 2 ROs | Comparative content |
| PO | Philosopher data + assets | Battles, shorts, series |
| HO | Market hypothesis | Prioritisation |

A PO is a higher-level abstraction over ROs. An RO says "here's what this source says about this topic." A PO says "here's the philosopher — their ideas, their art, their quotes, their relationships, their use in scenarios." It's the philosopher as a reusable asset library.

## What It Enables

1. **Battles as a series format** — the structure is the same every time, only the philosophers change
2. **Shorts from assets** — each PO's quotes are pre-vetted. Pick one, pair with pre-cleared art, generate a 60s short.
3. **Scenario engine** — "Who would be more useful in X?" is a template. X can be anything: an earthquake, a pandemic, a relationship crisis. Each scenario is a new video.
4. **Philosopher onboarding** — Yogi Watch is just POs for lesser-known figures. Life → key teaching → one quote → done.
5. **Cross-reference mapping** — affinities show which philosophers relate. This becomes a graph Hermes can traverse.

## Immediate: Create POs for First 3 Battles

| PO | Source ROs | Art Assets | Priority |
|----|-----------|------------|----------|
| Abhinavagupta | 17 tantraloka ROs | Fludd, alchemical engravings | HIGH — first mover advantage |
| Iamblichus | 3 theurgy ROs | Angel Gabriel, Surush | HIGH — battle opponent |
| Plotinus | 2 ROs | Renaissance engravings | MEDIUM — natural parallel to Abhinavagupta |
