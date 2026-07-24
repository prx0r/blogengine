# Cross-Pack Platinum Analysis

## Two Distinct Pack Types

### Type 1: Film Packs (full-length documentaries)
| Pack | Shots | Duration | Concept |
|------|-------|----------|---------|
| You Existed Before the Earth | 75 | 7.6 min | Consciousness imagining itself into form |
| The Stones Are Watching You | 106 | 11.6 min | Patient intelligence of mineral life |
| The Path Chose You | ~85+ | ~10 min | Choice and destiny |

**Structure:** `storyboard.json`, `visual_program.json`, `PRODUCTION_BLUEPRINT.md`, `alignment_report.json`, `render_*.py`, `shots/*.mp4`, `narration_script.txt`, `source_essay.md`

### Type 2: Animation Packs (focused modules)
| Pack | Duration | Concept |
|------|----------|---------|
| Dvādaśānta Axis | 67s | 12-stage breath-energy ascent |
| Three Mālas | 38s | Three veils of consciousness |
| Cakrodaya Mantra Cycles | ~40s | Mantra cycles |
| Pramātṛ Taxonomy | ~50s | Categories of consciousness |

**Structure:** `scene_manifest.json`, `scene_catalog.json`, `render_pack.py`, `AGENT_KNOWLEDGE_DOSSIER.md`, `STYLE_EVOLUTION.md`, `validation.json`, `*_animation.mp4`, `contact_sheet.jpg`

---

## Key File: AGENT_KNOWLEDGE_DOSSIER.md (I Need This)

This is the file I'm missing. Every animation pack has one. It contains:

| Section | Example (Dvādaśānta) |
|---------|---------------------|
| **Aim** | "Visualizes the 12-stage movement of breath-energy" |
| **Textual orientation** | "Follows the user-supplied Chapter 6 map" |
| **Visual rules** | "Each node must have a distinct visual metaphor rather than repeating a generic chakra circle" |
| **Style family** | "Warm pale field, gold fullness-source, crimson contraction" |

This is a direct instruction set for an autonomous agent. It tells the agent:
- WHAT to visualize (the concept)
- WHY it matters (textual basis)
- HOW to visualize it (concrete visual rules)
- What CONSTRAINTS to obey (don't repeat generic circles)

When I built "You Are Made of Light," I had no equivalent of this file. I defined a visual thesis but didn't constrain myself with rules like "each node must have a distinct visual metaphor."

## Key File: STYLE_EVOLUTION.md (I Need This)

Documents the CHAIN of visual inheritance:

```
Previous pack → visual inheritance → new motifs added → differentiation
```

Example from Dvādaśānta:
```
Inherits: clean breath-oriented clarity from Prāṇavicāra
Differentiates: turns horizontal respiratory swing into vertical body-to-space migration
New motifs: heart lotus, throat tuning fork, palate gate, eyebrow lens
```

This means the visual language EVOLVES across packs. Each pack doesn't start from scratch. It inherits proven visual motifs and adds new ones specific to its concept.

## Key File: validation.json (FFprobe Output)

Simple but essential — verifies the output is valid:
```json
{
  "streams": [{"width": 1280, "height": 720, "r_frame_rate": "10/1"}],
  "format": {"duration": "67.200000", "size": "21857956"}
}
```

## Cross-Pack Patterns

### 1. Modular Composition
Animation packs (30-70s) are building blocks. Film packs (7-12 min) compose multiple animation concepts into a narrative. The production process is:
```
Essay → identify modular concepts → build animation pack per concept
→ compose animation packs into film pack → validate → publish
```

### 2. Frame Rate Progression
- Animation packs: **10 fps** (smoother)
- Film packs (draft): **6 fps**
- Film packs (final): **24 fps**

### 3. Naming Convention
Animation scenes: `dv01`, `dv02`, `ml01`, `ml02` (pack prefix + number)
Film shots: `shot_001`, `shot_002` (sequential)

### 4. Contact Sheet Always Included
Every pack has `contact_sheet.jpg` — a grid of sampled frames for visual review.

## What I Must Add To My Workflow

| File | Purpose | Status |
|------|---------|--------|
| `AGENT_KNOWLEDGE_DOSSIER.md` | Tell the agent what to visualize and how | ❌ Missing |
| `STYLE_EVOLUTION.md` | Track visual inheritance across packs | ❌ Missing |
| `scene_manifest.json` | Catalog individual scenes for reuse | ❌ Missing |
| `scene_catalog.json` | Cross-pack scene search | ❌ Missing |
| `validation.json` | FFprobe output verification | ❌ Missing |

## The Production Pipeline (Revised)

```
1. READ essay → identify 1-3 modular concepts
2. For each concept: BUILD animation pack (30-70s)
   → AGENT_KNOWLEDGE_DOSSIER.md (aim, visual rules, constraints)
   → render_pack.py (scene functions)
   → scene_manifest.json (scene metadata)
   → STYLE_EVOLUTION.md (inheritance chain)
   → Render → validate → contact sheet
3. COMPOSE animation packs into film (7-12 min)
   → storyboard.json (interleave chapters from multiple packs)
   → visual_program.json (continuity systems across packs)
   → narration_script.txt (full essay text)
   → per-shot WAVs → measure → render → align
4. PACKAGE
   → All files from both pack types
   → validation.json (FFprobe)
   → contact_sheet.jpg
```
