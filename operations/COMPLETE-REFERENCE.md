# Complete Project Reference

## Table of Contents
1. [Project Identity](#1-project-identity)
2. [Art Library](#2-art-library)
3. [Visual Language](#3-visual-language)
4. [SVG Asset Library](#4-svg-asset-library)
5. [Video Pipeline](#5-video-pipeline)
6. [Visionary Engine](#6-visionary-engine)
7. [Current State](#7-current-state)
8. [Ontology Engine](#8-ontology-engine)
9. [Visionary Renderer](#9-visionary-renderer)
10. [Visual Director](#10-visual-director)

---

## 1. Project Identity

A research laboratory disguised as a media company. Produces documentary videos on esoteric philosophy, Tantra, consciousness, Western esotericism across 5 channels.

### Channels
- **Tantra Files** — Tantric philosophy, history, figures (saffron/gold)
- **Ochema** — Western esoteric, occult (dark/cyan)
- **Angeliz** — Angelology, apocrypha (crimson/cream)
- **Pramāṇa** — Epistemology, logic, comparative (white/charcoal)
- **Intelligent Others** — Non-human intelligence, science frontier (cosmic green)

---

## 2. Art Library

**Location:** `/mnt/HC_Volume_106427611/sacred-art/`
**R2 Bucket:** `sacred-art`

### Datasets

| Dataset | Images | Labels | Status |
|---------|--------|--------|--------|
| CIRThan thangkas | 2,154 | 3-level captions (deity, attributes, color, posture, crown, surroundings) | ✅ Captions + 179 images + 2,287 sketches |
| CIRThan sketches | 2,287 | Paired to captions | ✅ |
| WikiArt Symbolism | 9,136 | Artist, movement | ✅ |
| WikiArt Surrealism | 6,244 | Artist, movement | ✅ |
| CYTKv1 thangkas | 1,778 | Bounding boxes with deity labels | ✅ Extracted from JSON |
| HAB Alchemy | 901 | Category labels (vessels, furnaces, etc.) | ✅ |
| ArtDL | 42,479 | Iconclass categories, saints | 🔄 Partial extraction |
| Blog gallery | 1,146 | concepts, entities_depicted, mood, composition | ✅ Metadata exists |
| Met Museum | 19 | Object IDs, titles, cultures | ✅ |
| Deities-25 | 8,239 | 25 deity classes | ❌ Download stuck |

### Key Files
- `ART-AUDIT.md` — Full audit with schema, totals, action items
- `RESEARCH-SPEC.md` — Labeling research proposal
- `metadata/*.jsonl` — Unified metadata in JSONL format

---

## 3. Visual Language

**Philosophy:** White background, black ink, crimson accents, geometric minimalism. Sanskrit for sacred terms. English text only for rhetorical emphasis (2-7 words, one every 12-20s).

### Visual Rules
- Canvas: 1920×1080, #ffffff background, #111111 ink, #777777 secondary, #8b1e1e accent
- Main stroke: 4px, rounded caps, no shadows/gradients/glows
- Minimum 35% negative space
- Typography: Playfair Display (English), Noto Serif Devanagari (Sanskrit)
- Motion: arise → draw-on, contract → scale-inward, expand → scale-outward, pulse → 1-2% modulation
- No bounce, spin, glitch, or kinetic caption energy

### Transitions
1. Continuous page scroll (default, 80%)
2. White pause (after major claim, 0.3-0.6s)
3. Ink wipe (section boundary)
4. Artwork insertion (fade in/out, 6-14s, slow push 1.00→1.05)

**Document:** `operations/visuallanguage.md` — Full architecture spec

---

## 4. SVG Asset Library

**Location:** `/root/projects/FableCut/library/svg/spanda/`
**Total:** 152 SVGs (white background) + 20 rendered MP4s

### Core Categories (17, with variants)

| Category | Variants | Motion Verbs | Concepts |
|----------|----------|-------------|----------|
| pulse-field | 10 | pulse, breathe, throb | spanda, living awareness |
| aperture-breath | 5 | open, close, inhale, exhale | breath, unmeṣa, nimeṣa |
| wheel-hub | 5 | radiate, turn, center | śakti-cakra, sovereignty |
| wave-return | 10 | arise, crest, dissolve | emanation, reabsorption |
| resonance-transfer | 5 | vibrate, transmit, attune | mantra, rasa, transmission |
| branch-emanation | 10 | emanate, branch, differentiate | tattvas, one becoming many |
| braid-unification | 5 | weave, interlace, integrate | breath/mantra/pulse, body/speech/mind |
| connect-disconnect | 5 | connect, contact, separate | perception, attention, cognition |
| gather-to-center | 5 | gather, recollect, return | pratyabhijñā, meditation |
| playful-orbit | 5 | orbit, play, self-organize | krīḍā, svātantrya |
| ocean-heart | 5 | surge, return, merge | hṛdaya, ocean of consciousness |
| spanda-word | 3 | appear, name | स्पन्द — chapter title |
| recognition-word | 2 | appear, recognize | प्रत्यभिज्ञा |
| open-close-circle | 5 | expand, contract | manifestation, withdrawal |
| drum-rings | 5 | strike, radiate, resound | universe as drum |
| emphasis-underline | 5 | underline, emphasize | subtitle punctuation |
| quote-bracket | 5 | frame, hold, cite | quotation, source |
| nested-cycles | 5 | cycle, nest, contain | levels of reality, tattvas |

### Supplement Categories (5, 8 variants each)

| Category | Motion Verbs | Concepts |
|----------|-------------|----------|
| descent-invocation | descend, invoke, receive | prayer, theophany, śaktipāta |
| veil-unveiling | veil, part, uncover | revelation, concealment, darśana |
| mirror-reflection | reflect, double, recognize | self, ābhāsa, imaginal |
| ladder-ascent | ascend, climb, refine | soul journey, upāya |
| fire-transformation | ignite, consume, refine | alchemy, tapas, purification |

### Sanskrit Glyphs (8)
हृदय, प्राण, शक्ति, आनन्द, शिव, चिति, प्रकाश, विमर्श

### Catalogue
`CATALOGUE.md` in library directory — each asset with motion verbs, concepts, and essay pairing suggestions.

---

## 5. Video Pipeline

### Current Toolchain
- **Revideo** (primary animation renderer) — fork of Motion Canvas with headless `renderVideo()` API, no editor needed
- **FableCut** (finishing editor) — final assembly, music, corrections, export
- **FFmpeg** — audio generation, video encoding
- **CF Whisper** — word-level transcription for precise subtitle timing
- **Python + pycairo** (fallback/thumbnail renderer) — fast previews, CI smoke tests

### Why Revideo over Motion Canvas
Motion Canvas has no headless render API—rendering requires clicking "Render" in the editor UI. Revideo is a fork built specifically for programmable rendering with a callable `renderVideo()` function, Puppeteer-based frame capture, and FFmpeg output. No editor, no clicking.

### Revideo Project
**Location:** `/mnt/HC_Volume_106427611/ontology-renderer/`
**Node.js:** v22 (via nvm, `.nvmrc` pinned to `22`)
**Key file:** `src/render.ts` — headless render entry point
**Pattern:** One generic scene interpreter receives scene spec JSON as a variable → renders to MP4

### Ontology → Video Pipeline
```
Essay text
  ↓
CF Whisper → word timestamps
  ↓
Rhetorical parsing → semantic beats
  ↓
Ontology IR (entities, operators, relations)
  ↓
Revideo scene spec JSON
  ↓
renderVideo() → MP4 scene chunks
  ↓
FableCut assembly + music + corrections
  ↓
Export
```

### Timing Engine
`scripts/build-timed-video.py` — transcribes narration, extracts word timestamps from CF Whisper, generates frame-accurate project.json

### SVG Usage
The 152 SVGs are **design references and geometry sources**. They are ingested for their path data, not used as animated files. CSS/SMIL animations are stripped; Revideo controls all timing and parameterization via signals.

### Video Creation Flow
```
Essay text
  ↓
Transcribe + word timestamps (CF Whisper)
  ↓
Rhetorical parsing → semantic beats
  ↓
Visual planning → process selection
  ↓
Motion Canvas scene generation
  ↓
Render scene MP4s (~8 scenes per essay)
  ↓
FableCut assembly + music + corrections
  ↓
Export
```

### Modules (10 reusable visual components)
Defined in `video-templates/modules/`:
quote-card, quote-image, text-on-black, full-bleed-art, portrait-focus, detail-zoom, lower-third, map-diagram, side-by-side, timeline

### Validation Levels
- Bronze (60%) — minimum viable
- Silver (75%) — standard quality
- Gold (85%) — gold-standard match

---

## 6. Visionary Engine

**Document:** `operations/visuallanguage.md`

The Visionary Engine is a semantic compiler for visual thought. It translates essay transcripts into constrained visual programs that drive Motion Canvas scenes.

### Architecture

```
Transcript + word timestamps
  ↓
1. Rhetorical parser (claim / analogy / quotation / practice)
  ↓
2. Semantic visual planner (chooses verbs, entities, continuity)
  ↓
3. Visual Program IR (constrained JSON, schema-validated)
  ↓
4. Scene interpreter (JSON → Motion Canvas process calls)
  ↓
5. Preview + visual critic (contact sheet + low-res preview)
  ↓
6. Scene renders (6-10 scenes per 10-min essay)
  ↓
7. FableCut (final sound, art inserts, corrections)
```

### Core Principles
1. Narration carries prose. Visuals carry relation, transformation, rhythm.
2. Sanskrit names concepts. English text emphasizes rhetoric.
3. Never illustrate a noun when a process can express the claim.
4. ≥70% of beats must transform or reuse existing entities.
5. One primary visual operator per beat. Max 3 concurrent motions.
6. A scene must end with an entity that can become the next scene.

### Project Structure
```
visionary-engine/
├── content/spanda/           # Essay content, transcripts, timing
├── src/
│   ├── project.ts            # Entry point
│   ├── theme/                # Palette, typography, spacing
│   ├── grammar/              # Schema, operators, process registry, mappings
│   ├── runtime/              # VisionaryWorld, SceneInterpreter, SubtitleSystem
│   ├── processes/            # PulseField, OpenClose, WheelHub... (20 components)
│   └── scenes/               # Scene files
├── agents/                   # Agent prompts (rhetorical-parser, visual-planner, visual-critic)
├── scripts/                  # Transcribe, plan, validate, render
└── schemas/                  # JSON validation schemas
```

---

## 7. Current State

### ✅ Working
- Revideo project scaffolded at `/mnt/HC_Volume_106427611/ontology-renderer/`
- Node 22 installed via nvm, `.nvmrc` pinned to `22`
- Generic scene interpreter that receives scene spec JSON as render variable
- Basic operators: `appear`, `pulse`, `unmeṣa`
- Scene schema types (SceneSpec, EntitySpec, ActionSpec)
- FableCut project generation from storyboard
- Word-level transcription via CF Whisper
- 152 SVGs (design references) + 20 Pillow-generated MP4s (fallback)
- FableCut MCP with `fablecut_patch_project`, `fablecut_set_project`

### 🔄 In Progress
- `npm install` in ontology-renderer (Revideo packages not yet resolved)
- Headless render pipeline via `renderVideo()`
- SVG ingestion tool (extract path data, strip CSS/SMIL, split into semantic layers)
- Remaining operators: `emanate`, `nimeṣa`, `recognize`, `conceal`, `dissolve`
- Ontology compiler (rhetorical parser → IR → scene spec JSON)

### ❌ Blocked
- Motion Canvas render path deprecated (editor-bound, no headless API)
- Deities-25 download (HF API issues)

### Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Primary renderer | **Skia Canvas + FFmpeg** | Deterministic frame-pure TypeScript, no browser |
| Fallback renderer | **Python + pycairo** | Fast previews, thumbnails, CI |
| Revideo | **Abandoned** | CJS/ESM packaging bug, no fix in sight |
| Motion Canvas | **Manual experimentation only** | No headless API |
| Remotion | **Contingency fallback** | If Skia can't meet SVG/typography needs |
| SVG strategy | **Preprocessed layered SVGs + sidecar manifests** | Extract once at ingestion, never parse raw SVG at runtime |
| Scene approach | **Renderer-neutral semantic scene JSON** | Ontology → visual plan → renderer-specific compilation |
| Operators | **Metaphysical first** | `unmeṣa`, `nimeṣa`, `pratyabhijñā` → expanded into numeric tracks |
| Node version | **22** (renderer), **20** (Motion Canvas) | Separate repos, separate pins |
| FableCut role | **Assembly + music** | Final trim, ambience, corrections |
| Timing | **CF Whisper word timestamps** | Frame-accurate emphasis placement |
| Architecture | **Renderer-agnostic** | Skia is first backend; Three.js 3D pathway designed but deferred |

### Key Files Index

| File | Purpose |
|------|---------|
| `operations/COMPLETE-REFERENCE.md` | This file |
| `operations/visuallanguage.md` | Visionary Engine full spec |
| `operations/video-creation-spec.md` | Bronze/Silver/Gold validation |
| `operations/hermes-video-pipeline.md` | Hermes pipeline instructions |
| `operations/infrastructure-wishlist.md` | What would help |
| `operations/current-state-handover.md` | Handover summary |
| `video-templates/modules/` | 10 module JSONs |
| `video-templates/style-rules.md` | Gold standard style rules |
| `video-templates/gold-standards/` | Alan Watts, Anandamayi, Abhinavagupta |
| `scripts/analyze-exemplar.py` | Exemplar video analysis |
| `scripts/build-timed-video.py` | Timing engine |
| `scripts/validate-video.mjs` | Video validation runner |
| `/mnt/HC_Volume_106427611/spanda-motion/` | Motion Canvas project (prototyping only) |
| `content/ontology-engine/` | Ontology Engine (34 files, 12 packs, 3 ADRs) |
| `visionary-renderer/` | Skia Canvas production renderer (Phase 1 complete) |

---

## 8. Ontology Engine

**Location:** `content/ontology-engine/`

A **semantic compiler pipeline** that maps philosophical content through canonical relations → ontology packs → guard engine → visual planner → asset resolver → macro expander → renderer backend.

### Architecture

```
Research Object → Claim Graph → Ontology Graph → Semantic Scene → Validation → Guard Engine → Visual Planner → Asset Resolver → Operator Expansion → Renderer
```

### Files (34 total)

| Path | Contents |
|------|----------|
| `canonical/relations.json` | 22 canonical relations (≡ → ≅ ≠ !) |
| `canonical/operators.json` | 16 semantic operators (appear, pulse, recognize, contract, expand, self_manifest, procession, condition_arise, repair…) |
| `canonical/visual-archetypes.json` | 24 visual archetypes (bindu, mandala, eye, wave, mirror…) |
| `canonical/operator-expansion.yaml` | Operator → renderer macro contract |
| `canonical/camera-language.yaml` | 5 camera modes (contemplative, recognitive, dependent_network, comparative_split, atemporal_triad) |
| `ontology-packs/` | **12 tradition packs** (Trika, Plotinus, Proclus, Iamblichus, Ficino, Advaita, Buddhist, Madhyamaka, Yogacara, Lurianic, Hermetic Qabalah, Modern Bridge) |
| `mappings/direct-mappings.json` | Cross-tradition entity mappings with strength ratings |
| `mappings/non-equivalence-rules.json` | Explicit non-equivalence rules to prevent conflation |
| `schemas/scene-schema.json` | Semantic scene JSON Schema (with continuity, guards, truth_status, causal_mode) |
| `schemas/entity-schema.json` | Entity JSON Schema |
| `examples/` | 3 example scenes: spanda-triadic-pulse, tzimtzum-primal-contraction, advaita-superimposition |
| `assets/svg-manifest.json` | 15 SVG asset references mapped to archetypes |
| `prompts/templates.json` | Prompt templates for scene generation |
| `prompts/video-agent.md` | Prompt contract: planner outputs ontology only, never renderer code |
| `src/ontology_engine.py` | Runtime: load packs, compile scenes, cross-map entities |
| `docs/compiler-pipeline.yaml` | 6-pass compiler pipeline |
| `docs/asset-resolution.yaml` | Asset resolution order, scoring, fallback policy |
| `docs/future-roadmap.yaml` | Priority-ordered future tradition packs |
| `adr/0001-semantic-first.md` | ADR: semantic operators are canonical, renderer is implementation detail |
| `adr/0002-claim-graph-above-ontology.md` | ADR: Claim Graph layer for provenance back to primary texts |
| `README.md` | Pipeline overview |

### Usage

```python
from ontology_engine import OntologyEngine
eng = OntologyEngine("content/ontology-engine")
eng.list_packs()           # → 12 packs
eng.compile_scene(scene)   # → renderer-ready spec
eng.cross_map(src, ent, tgt)  # → cross-tradition mapping
```

---

## 9. Visionary Renderer (Skia Canvas)

**Location:** `visionary-renderer/`

Production renderer. Replaces Revideo. Skia Canvas is the first backend; the architecture is renderer-agnostic (see ADR 0003).

### Architecture Principle

```
Ontology engine → Semantic scene → Visual plan → Render router → Backend (Skia/Three.js/…) → FFmpeg
```

### Phase 1 — Complete ✅

| Gate | Test | Result |
|------|------|--------|
| A | Devanāgarī shaping (8 Sanskrit samples with conjuncts, repha, mātrās) | ✅ PASS |
| B | SVG layer extraction (wheel-hub-01: 7 layers, pixel-perfect recomposite) | ✅ PASS |
| C | Deterministic timeline (300 frames, SHA-256 identical across 2 runs) | ✅ PASS |
| Spike | 20-second Spanda render (bindu + SVG + Sanskrit + art + subtitle + camera + FFmpeg MP4) | ✅ DONE |

### Key Files

| File | Purpose |
|------|---------|
| `package.json` | skia-canvas v3.0.8, Node 22 |
| `.nvmrc` | Node 22 |
| `ARCHITECTURE.md` | Full renderer-agnostic architecture |
| `test-scenes/gate-a-typography.mjs` | Devanāgarī shaping test |
| `test-scenes/gate-b-svg.mjs` | SVG layer extraction + composite test |
| `test-scenes/gate-c-determinism.mjs` | Frame-pure determinism test |
| `test-scenes/spanda-20s-spike.mjs` | Integrated 20-second render |
| `renders/spanda-spike/spanda-20s-spike.mp4` | First rendered MP4 output |
| `src/` | Runtime source (compiler, evaluator, backends, primitives) |

### ADRs

| ADR | Description |
|-----|-------------|
| `content/ontology-engine/adr/0003-renderer-agnostic-architecture.md` | Skia is first backend; camera system; renderer capabilities; 3D pathway |
| `content/ontology-engine/adr/0004-visual-director-layer.md` | Visual Director is the IP; renderer is commodity |
| `content/ontology-engine/adr/0005-live-sandbox-first.md` | React Three Fiber sandbox for visual language discovery |

### Status

| Backend | Role | Status |
|---------|------|--------|
| **React Three Fiber** | Primary visual language discovery environment | 🆕 Next build |
| **Skia Canvas** | 2D export path (quote cards, diagrams, typography) | ✅ Built, role reduced |
| **FableCut** | Final documentary assembly | ✅ Running |
| **Revideo** | Former primary renderer | ❌ Abandoned (CJS/ESM bug) |
| **Motion Canvas** | Former prototype environment | ❌ Deprecated (R3F supersedes) |
| **Python/pycairo** | Former fallback | ❌ Deprecated (Skia supersedes) |
| **Remotion** | Contingency | ⏸️ On hold |
| **Three.js / Blender** | Future high-quality export | 📅 Phase 4 |

---

## 10. Visual Director

**ADR:** `content/ontology-engine/adr/0004-visual-director-layer.md`

### Core Insight

The renderer is the camera operator. Everything interesting happens before rendering.

The project spent months building renderers (Revideo, Motion Canvas, pycairo, Skia). The 20-second spike of a pulsing circle exposed the category error: the renderer had nothing interesting to draw because **no layer above it made creative decisions**.

### Correct Architecture

```
Research
    ↓
Claim graph
    ↓
Metaphysical Compiler (ontology)
    ↓
Narrative beats
    ↓
Visual Director        ← THE PRODUCT
    ↓
Scene graph
    ↓
Animation / timing
    ↓
Renderer (Skia / Three.js / Pycairo)
    ↓
FableCut assembly
```

### What it does

The Visual Director is an AI film director. It receives narrative beats and produces **cinematography**:

| Question | Decision |
|----------|----------|
| Through space? | Diagram, geometry, position |
| Through light? | Illumination, obscurity, revelation |
| Through comparison? | Side-by-side, analogy, metaphor |
| Through topology? | Containment, hierarchy, network |
| Through typography? | Sanskrit, emphasis, quotation |
| Through artwork? | Full-bleed, detail, gallery |
| Through archive? | Photograph, manuscript, footage |
| Through transition? | Wipe, pause, cut on action |

### Renderer is commodity

If the Visual Director is correct, the renderer can be Skia, Three.js, Blender, or future AI video models. The films retain their identity because the directing intelligence is in the spec, not the pixels.

The ontology renderer may generate only 20-30% of a finished documentary (the animated philosophical diagrams). The rest is artwork, typography, archive, and quotation cards assembled in FableCut.

### Key Renaming

| Old | New |
|-----|-----|
| Ontology Engine | Metaphysical Compiler |
| *(missing)* | Visual Director |
| Renderer (primary) | Commodity backend |

---

## 11. Live Sandbox (React Three Fiber)

**ADR:** `content/ontology-engine/adr/0005-live-sandbox-first.md`

### Core Insight

The visual language is unknown and must be *discovered*, not specified. A browser-based live sandbox with instant feedback is the environment for that discovery. Production renderers (Skia, Blender) are export buttons, not exploration tools.

### Stack

```
Ontology JSON → R3F components → Live viewport (instant refresh)
                                       ↓
                              Hermes modifies scene live
                                       ↓
                              Scene locked → Export to backend
```

### Why This Changes Everything

| Before | After |
|--------|-------|
| Change a prop, wait seconds/minutes for render | Change a prop, see it instantly |
| "Does this communicate the philosophy?" → guess | "Does this communicate?" → see immediately |
| Renderer is the product | Visual language discovery is the product |
| AI generates animation code | AI generates composition (scene graph as Lego) |

### Current Phase

**Phase 1** — Standalone R3F sandbox loading scene JSON, basic primitives (bindu, field, wheel, text), instant prop feedback, deploy to Cloudflare Pages. **This is the next build.**

### Full Pipeline (Updated)

```
Research
    ↓
Claim graph
    ↓
Metaphysical Compiler (ontology)
    ↓
Narrative beats
    ↓
Visual Director
    ↓
Scene graph
    ↓
┌──────────────────────┐
│  R3F Live Sandbox    │  ← Primary: discover visual language
│  (instant iteration) │
└──────────────────────┘
    ↓ (language locked)
┌──────────────────────┐
│  Export backends     │  ← Commodity: Skia 2D, Blender 3D, FableCut
└──────────────────────┘
```
