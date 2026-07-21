# Factory Template — Replicable Structure for Any Domain

The factory pipeline is domain-agnostic. The same 5-stage process works for esoteric philosophy, experimental neuroscience, consciousness studies, or any other knowledge domain. Only the source material and content changes.

---

## The Factory Pattern

```
DOMAIN LAYER          (what you're producing content about)
  Source material → Works → ROs → Essays → Videos

INFRASTRUCTURE LAYER  (the machinery, shared across all domains)
  Hermes skills, validation rules, audit scripts, cron, YouTube upload, analytics

INDEX LAYER           (tracking what exists across all domains)
  factory/index.json, factory/queue.json, video-objects/_index.json
```

---

## What Changes Per Domain

| Component | Esoteric | Neuroscience | Notes |
|-----------|----------|-------------|-------|
| **Source material** | blueprints/, content/sources/ | PubMed, arXiv, library/science/ | Different acquisition pipelines |
| **Work schema** | Same | Same | work.schema.json is universal |
| **RO taxonomy** | thinker-topic, tradition, theme | topic, mechanism, evidence, debate | Section taxonomy adapts |
| **Essay style** | Contemplative, poetic | Explanatory, evidence-focused | Writing tone, not structure |
| **Art library** | Alchemical engravings, Renaissance | Brain scans, microscopy, diagrams | Domain-specific visuals |
| **YouTube category** | 27 (Education) | 27 (Education) or 22 (Science) | Same |
| **Tags/metadata** | "tantra, corbin, esoteric" | "neuroscience, consciousness, EEG" | Keywords change |
| **Analytics signals** | Retention by tradition | Retention by mechanism | Topic families differ |

## What Stays The Same

```
Factory pipeline skill     → hermes/skills/factory/factory-pipeline/
Video pipeline skill       → hermes/skills/factory/publish-video-fablecut/
Validation rules           → scripts/factory-audit.py
Upload script              → scripts/upload-youtube.mjs
Analytics feedback         → scripts/ingest-youtube-analytics.mjs (to be built)
Index structure            → content/factory/index.json
Queue structure            → content/factory/queue.json
Video index                → content/video-objects/_index.json
```

---

## Adding a New Domain: Neuroscience Example

### Step 1: Define the Domain

```json
// content/factory/domains/neuroscience.json
{
  "domain": "neuroscience",
  "label": "Experimental Neuroscience & Consciousness",
  "acquisition": {
    "primary": "PubMed (via cron-acquire)",
    "secondary": "arXiv q-bio.NC, bioRxiv neuroscience",
    "queries": [
      "consciousness neural correlates",
      "predictive processing",
      "global workspace theory",
      "integrated information theory",
      "default mode network meditation",
      "brain connectivity consciousness",
      "neural oscillation awareness",
      "altered states fMRI",
      "psychedelic neuroscience",
      "meditation neuroplasticity"
    ]
  },
  "art_sources": ["brain imaging", "neural diagrams", "scientific illustrations"],
  "youtube_metadata": {
    "category": "27",
    "tags": ["neuroscience", "consciousness", "brain", "science"],
    "description_template": "An exploration of {topic} in experimental neuroscience and consciousness studies."
  },
  "tradition_tags": ["neuroscience", "consciousness_studies", "cognitive_science"]
}
```

### Step 2: Run Acquisition

The cron-acquire script already supports PubMed queries. Add the neuroscience queries:

```bash
# Already running: cron-acquire looks at content/works/ for gaps
# New queries go into the phase system:
# Phase 6: Predictive processing, causal inference
# Phase 7: Meditation, DMN, consciousness
# Phase 8: Spontaneous thought, creativity
```

Neuroscience papers are already being acquired:
- 800+ PMC works (t2-pmc-*)
- 700+ PubMed works (t2-pubmed-*)
- 34 Levin works (basal cognition, morphospace)
- Bridge works (EEG, neural networks, consciousness)

### Step 3: Build ROs

Same RO structure, different section taxonomy:

```
neuroscience topic ROs:
  mechanism    — how it works
  evidence     — key studies
  debates      — controversies
  implications — what it means for consciousness studies
  bridges      — connections to esoteric traditions (optional)
```

### Step 4: Art Adaptation

Neuroscience needs different visuals:
- Brain imaging (fMRI, EEG) — public domain from scientific papers
- Neural diagrams — created with Manim or sourced from open databases
- Scientific illustrations — Wellcome Collection has extensive biomedical art

The existing art pipeline's search APIs already support neuroscience queries.

### Step 5: Cross-Domain Bridges

The most valuable content lives at the intersection:

```
esoteric concept     ↔  neuroscience mechanism
meditation states    ↔  default mode network
nonduality           ↔  predictive processing
subtle body          ↔  interoceptive pathways
kundalini            ↔  thalamocortical loops
imaginal realm       ↔  imagination networks
```

These bridge ROs (many already exist: ro:nanavira, ro:levin, ro:penrose) are the factory's highest-value output — content that no other channel produces.

---

## Trending Neuroscience Topics (Last 2 Years)

Based on publication volume and citation velocity:

| Topic | Trend | Relevance to Factory |
|-------|-------|---------------------|
| **Default Mode Network & meditation** | ↑↑↑ | Direct bridge to tantra/buddhist ROs |
| **Predictive processing / active inference** | ↑↑↑ | Bridges to Vijnana Bhairava, nonduality |
| **Psychedelic neuroscience** | ↑↑↑ | Bridges to imaginal, visionary experience |
| **Neurophenomenology** | ↑↑ | Bridges to first-person contemplative science |
| **4E cognition (embodied, embedded, enactive, extended)** | ↑↑ | Bridges to tantra subtle body, yoga |
| **Consciousness integration (IIT, GNW, HOT)** | ↑ | Theoretical — bridges to Advaita, Shaivism |
| **Brain connectivity / connectomics** | ↑ | Lower direct bridge value |
| **Neuroaesthetics** | ↑ | Bridges to rasa theory, beauty |
| **Sleep & dreaming neuroscience** | ↑ | Bridges to dream yoga, lucid dreaming |
| **Metacognition / self-awareness** | ↑ | Bridges to atma-vichara, self-inquiry |

**Highest-value targets for bridge content:**
1. Default mode network + meditation ←→ tantra/buddhist emptiness
2. Predictive processing ←→ Vijnana Bhairava, nondual awareness
3. Psychedelic neuroscience ←→ Corbin's imaginal, visionary states
4. Neurophenomenology ←→ contemplative science, first-person methods

---

## Running Multiple Domains

The factory queue handles multiple domains natively. Each domain is a separate entry in the queue's priority tiers:

```json
{
  "domains": {
    "esoteric": { "tier": 1, "label": "Core — Esoteric Philosophy" },
    "neuroscience": { "tier": 2, "label": "Bridging — Consciousness Science" }
  },
  "priority_tiers": [
    {
      "domain": "esoteric",
      "tier": 1,
      "topics": ["tantraloka cosmology", "corbin imaginal", ...]
    },
    {
      "domain": "neuroscience",
      "tier": 2,
      "topics": ["DMN meditation", "predictive processing", ...]
    }
  ]
}
```

The cron alternates: process one esoteric item → process one neuroscience item → repeat. This ensures both domains progress.
