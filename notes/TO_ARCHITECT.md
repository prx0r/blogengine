# To the Architecture Agent

## Context: What We Have

Full repo at **https://github.com/prx0r/blogengine.git**

We've proven a single end-to-end video: **"The Engine of Consciousness — Spanda"** — 352s, 1920x1080, 30fps, with voiceover audio, exported from FableCut. The MP4 lives at `/root/projects/FableCut/media/spanda-doc-final.mp4` (not in git — it's a 6MB binary). The FableCut project is live at localhost:7777 with 34 clips across 21 media items (ambient drone bed + 10 visual segments + 10 voiceover MP3s).

**What's in git:**

| Component | Path | Status |
|-----------|------|--------|
| Render engine | `scripts/renderer/renderer.py` | PIL Film class + 8 drawing primitives + 5 essay packs (rasa, imaginal, alchemy, emptiness, dante) + Spanda |
| Spanda scenes | `scripts/renderer/spanda_scenes.py` | 10 scene functions `(t,u,idx) → Image` at 2fps, 1280x720 |
| VBT scenes | `scripts/renderer/vbt_magnum.py` | 20 VBT scenes scripted, 90 more in `add_one_vbt.py` |
| Scene packs | `scripts/renderer/p01-p07_*.py` | Reflection, Sound, Upayas, Kalis, Spanda2, Abhinavagupta, Mantra Breath |
| Visual library | `visual-library/` | 21 Python pack files, ~68 scene functions, light_pack, lsystem_collection, consciousness_states, vijnana_bhairava, spanda_karika, minimal_forms, concept_packs, complexity_pack |
| Scene catalog | `visual-library/catalog/scenes.json` | 198 scenes across 24 packs, indexed |
| Scene instances | `visual-library/instances/` | 140 per-scene JSON files with schema |
| Formal scene system | `scene-system/` | Concepts (262), templates (11 families), primitives (8), packs, instances |
| Visual Director | `scripts/visual-director.py` | Essay → scene manifest parser with 9 rhetorical functions (hook, establish, define, analogy, quotation, chain, climax, closing) |
| Gold standards | `video-templates/gold-standards/` | Alan Watts (7.1s avg, 112 BPM), Anandamayi Ma (8.75s), Abhinavagupta v1 |
| Video modules | `video-templates/modules/` | 12 FableCut module templates (detail-zoom, full-bleed-art, lower-third, quote-card, portrait-focus, side-by-side, etc.) |
| Storyboards | `content/publishing/storyboards/` | engine-of-consciousness, abhinavagupta-life, tbp-034, the-world-between-worlds, nanavira, expansion-essay1-edl |
| Voiceover | `content/publishing/voiceover/` | 14 directories with MP3s (engine-of-consciousness: 10 segs, tbp-034: 10 segs, the-world-between-worlds: 8 segs, plus 11 single-narration) |
| Voiceover generator | `scripts/generate-voiceover.mjs` | Edge TTS, dual voice (AriaNeural female main, RyanNeural male quotes) |
| Art matching | `scripts/match-images-to-storyboard.py` | Proper noun exact match / concept match / vision label fallback |
| Pipeline scripts | `scripts/pipeline/build-from-blueprint.py` | Blueprint → Tor asset download → voiceover → FableCut project |
| Validation | `scripts/validate-video.mjs` | 24 weighted checks, 85% pass threshold |
| FableCut docs | `FABLECUT_DOCS.md` | 522 lines, full API, MCP tools, recipe library |
| Data layer | `scripts/engines/` | XGBoost predictor (0.747 AUC), headline engine, topic taxonomy, niche deep dive, hermes knowledge |
| Channel research | `data/research/layer2/` | 149 channels, ~19K videos, breakout analysis, thumbnail Vision API |
| Review HITL | `dashboard/` | Flask API + SPA, video/scene commenting, 65 MP4s in queue |
| Scene review | `dashboard/server.py` (scene review endpoints) | Per-scene commenting on 140 instances |
| THESIS | `THESIS.md` | Our full response to your architecture |
| Handovers | `handovervideo.md`, `FABLECUT_DOCS.md`, `operations/`, `archive/handovers/` | Complete history of attempts and failures |

**Notable directories NOT in git** (on disk only): `visionary-renderer/` (Skia GPU), `video-templates/animation-references/` (90 MP4s), `video-templates/gold-standards/` (reference MP4s), `visual-library/` (Python packs), `data/tts-cache/` (MP3 cache).

## What We Need Technical Advice On

### 1. Visual Language — How to Guarantee an LLM Uses It Well

Our visual language is defined across multiple layers:
- **Primitives**: dot, ring, arrow, silhouette, flower, line, text, card (in `renderer.py`)
- **Template families**: concentric_center, radial_relation, bilateral_relation, body_axis, wave_field, vertical_sequence, aperture, grid_dissolution, vessel_reception, knot_release, quote_card (in `scene-system/templates/`)
- **Rhetorical functions**: hook, establish, define, analogy, quotation, chain, climax, closing (in `visual-director.py`)
- **Operators**: reveal, oscillate, align, mirror, radiate, descend, ascend, dissolve (detected in scene functions)
- **Concept tags**: 262 semantic tags mapped to scenes (in `scene-system/concepts/`)
- **Color palette**: DARK, INK, GOLD, CRIMSON, MUTED, WHITE, PARCHMENT, BLUE, GREEN (in `renderer.py`)
- **Animation**: smoothstep/lerp/sin-based motion, t=seconds u=progress 0→1

**The problem:** An LLM given the task "create a scene about emanation" has too many degrees of freedom. It could pick any template family, any primitives, any colors, any duration — and most combinations will look bad. The Spanda video worked because a human wrote the scene functions by hand, iterating on each one.

**How do we constrain the LLM's creative choices so the output is guaranteed to look good?**

Specific questions:
- Should we define a **scene type grammar** (e.g., "explanation scenes use bilateral_relation + text + line, climax scenes use concentric_center + dot + ring") that maps rhetorical functions to concrete visual recipes?
- Should the LLM select from **pre-approved scene templates** (parameterized versions of known-good scenes) rather than writing new scene functions?
- Should we build a **compositional constraint system** — e.g., "if you use silhouette, you must also use dot (for bindu) and it must be positioned at the center"?
- Can we use the **198 existing scenes in the catalog** as few-shot examples for the LLM, retrieving the N most similar scenes by concept tag overlap?
- What about **retrieval-augmented generation** — when the LLM says "create a scene about light", we retrieve `light_pack.py` scene functions, `scene-system/concepts/light.json` mappings, and `visual-library/instances/` JSONs as context?
- How do we validate that the LLM's scene function will actually render without visual defects, text overflow, or color clash before rendering?

### 2. HITL Quality Validation — How to Stop Being Lucky

The Spanda video worked in one shot, but we have no guarantee why. We can't answer:
- Would a different essay with different scene functions also work?
- If we change one parameter (palette, duration, transition), does quality degrade predictably?
- When the user says "the pacing feels off" — how does that map to a concrete parameter change?

**The HITL system needs to move from "user says thing, I hand-edit code" to "user says thing → system infers parameter adjustment → re-renders → user confirms."**

Specific questions:
- **Feedback decomposition**: The current system has free-text comments. How do we reliably decompose "the wheel scene feels too busy" into atomic issues (primitive density too high, motion amplitude too large, transition too fast)? Should we use an LLM to parse and tag each comment against our dimension taxonomy?
- **Parameter inference**: Given an atomic issue like "primitive density too high in scene 5", how do we map that to a specific parameter change (reduce number of rings from 7 to 4, increase spacing from 30px to 50px)? Should we maintain a **parameter → dimension effect matrix** (e.g., "ring_count → visual_density, confidence 0.8; amplitude → motion_energy, confidence 0.7")?
- **Regression prevention**: If we fix scene 5's density, how do we prevent introducing a regression in scene 3? The architecture says parent-child comparison, but how do we operationalize that — frame-by-frame SSIM? Manifest comparison? Human re-rating of all scenes?
- **Confidence accumulation**: After 5 fixes that the user accepts, the system should be more confident about the next similar fix. How do we model this? The current architecture says Bayesian, but what's the simplest implementable version given 4GB RAM and 2 cores?
- **Validation gates**: The existing `validate-video.mjs` has 24 deterministic checks (duration, asset presence, text overflow, etc.). How do we extend this to semantic checks — "does the visual composition match the rhetorical intent of this scene"? Could we use the scene catalog as a validator (compare new scene against similar scenes in the catalog and flag outliers)?
- **Early stopping**: How do we know when to stop iterating? The architecture says "when no candidate wins, predicted gain below threshold, protected preference regresses." But how do we set these thresholds empirically rather than arbitrarily?
- **Guarantee vs. guidance**: What's the minimum viable set of constraints that guarantees an LLM-generated scene function will be visually acceptable (no crashes, no text overflow, reasonable composition) — even if not beautiful?

### 3. The Pipeline Gap

The proven path (Spanda) was:
```
essay → hand-written scene functions → PIL render → FableCut assembly → manual export
```

The desired path is:
```
essay → [LLM] → scene manifest → [parameter selection from style profile] → [auto-render (PIL/Skia)] → [auto-feedback] → [iterate]
```

The gap is: **the LLM currently has no guidance on what scene functions look like, how they compose, or what makes a good one.** It has to invent everything from scratch.

We think the solution is:
- A **scene template library** with parameterized, known-good scenes
- An LLM that **retrieves examples** from the 198-scene catalog rather than generating from scratch
- A **validator** that checks the generated scene function against rendering constraints before actually rendering
- A **feedback decomposer** that turns "this feels wrong" into dimension-tagged atomic issues

**Is this the right approach? What are we missing?**

## What We Want From You

1. Review the repo at `github.com/prx0r/blogengine.git` — especially `scripts/renderer/renderer.py`, `visual-library/`, `scene-system/`, `dashboard/server.py`, and `scripts/renderer/spanda_scenes.py`
2. Tell us specifically how to constrain the LLM's visual language choices — concrete schema, retrieval strategy, validation approach
3. Design the feedback → parameter inference mapping — how do we turn "scene 5 pacing too slow" into a parameter delta
4. Tell us the simplest V1 that moves us from "lucky one-shot" to "systematically reproducible"

We have the architecture. We have the data. We have the scene catalog. We need you to tell us how to wire them together so the LLM stops guessing and starts engineering.
