# Problem Statement: Automated Platinum-Quality Philosophical Video Essays

## Overview
We produce philosophical video essays (Tantra, Suhrawardi, Corbin, Kabbalah, Neoplatonism) for YouTube. Each essay is ~7-12 minutes, 720p, with narration-synced procedural visuals rendered in Python PIL. The gold standard is hand-crafted — every scene function is custom PIL code designed for that specific concept. No templates, no dispatch tables, no pre-made motif libraries.

## What We've Built

### The Stack
- **Render engine:** Python PIL (Pillow) + ffmpeg — no GPU needed, pure CPU procedural generation
- **Essays:** 51 expansion essays at `scripts/expansion-essay1.md` through `expansion-essay51.md`
- **Output:** 1280x720 MP4, 6-24fps, per-shot audio from Edge TTS (en-US-AriaNeural)
- **Deployment:** Cloudflare Workers + D1 + R2 + Vectorize
- **Dashboard:** `studio.tantrafiles.xyz` (Flask + Cloudflare Tunnel) / `factory-worker.tradesprior.workers.dev`

### The Gold Packs (What "Good" Looks Like)
We have ~30 gold/animation packs that ARE the quality bar:

| Pack | Type | Scenes | What It Teaches |
|------|------|--------|-----------------|
| **Stones Are Watching** | Film pack | 106 shots | Concrete motif naming, chapter interleaving, continuity objects. Same essay as essay 46. |
| **You Existed Before Earth** | Film pack | 75 shots | Full film pack format, interleaved chapters, audio alignment |
| **Kabbalah Tree of Life** | Animation pack | 20 scenes, 96s | Rich palette (vellum, lapis, porphyry), multi-phase easing, bezier curves, layer compositing, precise yantra geometry |
| **Malas Three Veils** | Animation pack | 8 scenes, 38.4s | AGENT_KNOWLEDGE_DOSSIER format, filters-not-substances philosophy |
| **Dvadasanta Axis** | Animation pack | 14 scenes, 67.2s | Each node gets a UNIQUE visual metaphor — no generic circles |
| **Amnayas Four Streams** | Animation pack | 6 scenes, 28.8s | Directional color semantics, center-holds-periphery-moves |
| **A Thing Is Not a Dot** | Film pack | 79 shots | Philosophy of perception, full film pack with qc_report |
| **Amrtasiddhi** | Animation pack | 20 scenes, 90s | Alchemical body transformation visual language |

### The Two-Agent System (Hermes + Zeus)

**Skill 1: `platinum-designer`** — Planning only. No code, no render.
- Studies 5+ gold packs before touching the essay
- Reads essay → extracts transformations from each passage (rhetorical map)
- Designs visual thesis: material world, spatial world, motion verbs, 4-7 recurring systems, color semantics, forbidden clichés
- Creates `agentvision.md` — design brief with PIL techniques from gold packs, color rationale, reusable patterns
- Builds storyboard with `visual_audio_alignment` field per shot: WHY the visual matches the words
- Every shot includes `bad_first_visual` + `rejected_because` — enforces thinking
- Output: storyboard.json, visual_program.json, visual_thesis.md, rhetorical_map.json, agentvision.md

**Skill 2: `platinum-renderer` (Zeus)** — Review + Render.
- Takes completed planning pack from designer
- Produces `zeus-comparative-analysis.md` — comparative analysis vs 3+ gold packs
- Reviews each shot: does the visual enact the transformation?
- Writes custom PIL scene functions (25-106 per pack)
- Renders: Edge TTS audio → frames → MP4 → mux → metadata

### The Hermes Agent
- CLI tool at `/usr/local/bin/hermes` — an LLM agent with tool-calling
- Skills are `SKILL.md` files in `hermes/skills/` directory
- Has MCP servers for factory production (archived — we took the design out of the pipeline)
- Gateway runs as systemd service

### The Visual Library (Archived — Not Used in New Approach)
- `scripts/renderer/motif_renderers.py` — 60 pre-made motif functions (dispatch table approach — ARCHIVED)
- `scripts/renderer/visual_templates.py` — 12 templates (ARCHIVED)
- `visual-library/` — 172+ scene functions across 20 files (available as reference, not for dispatch)

## What We've Tried

### Attempt 1: Automated Pipeline (factory_produce_video)
Built a monolithic MCP server that auto-generated everything: read essay → auto-generate thesis → auto-assign motifs → render. 
**Result:** Produced generic output with 4 abstract shape names (circle, aperture, vessel, point). Every shot looked identical. Zeus caught it: "10/10 consecutive shots nearly identical." Motif count: 4 vs gold's 36-45.

### Attempt 2: Hermes Run 1 (produce-platinum-video skill, monolithic 5-pass)
Loaded the existing 1123-line skill that defines 5 passes (concept analysis → shot segmentation → animation packs → film composition → quality gate).
**Result:** Hermes skipped Pass 0 (study gold), skipped Pass 2 (per-shot semantic design), and jumped directly to Pass 4 (render). The storyboard was a verbatim copy of the gold pack's storyboard (106 shots, 36 motifs, all identical). The render script (1321 lines) was original PIL code but the DESIGN was copied. No `visual_audio_alignment` field. No rationale connecting visuals to audio.

### Attempt 3: Split into Two Skills (platinum-designer + platinum-renderer)
Created separate skills for planning and rendering to force proper separation of concerns.
**Result:** The designer skill worked well — it studied 5 gold packs, created `agentvision.md`, `rhetorical_map.json`, `visual_thesis.md`, `visual_program.json`, and a 60-shot storyboard with `visual_audio_alignment` fields on every shot. 47 unique concrete motifs. The renderer produced a 1073-line render script with 25 scene functions and rendered successfully. However:

### Persistent Problems
1. **Hermes copies gold pack structure** instead of generating original designs — the first run copied the Stones pack's storyboard verbatim
2. **Skipping the thinking step** — both the pipeline and the first Hermes run jumped straight to code without per-shot rationale
3. **No hard enforcement** — the skill is a suggestion, not a gate. Nothing prevents Hermes from skipping steps
4. **Motif naming quality** — the second run's motifs are 35% unmanufacturable ("conversation-that-is-one" vs "lapis basin")
5. **PIL sophistication gap** — our scene functions use simpler easing (one phase) vs Kabbalah pack's multi-phase cascaded easing
6. **Text crutch** — our scenes rely more on on-screen text to explain meaning, gold packs use pure visuals
7. **Self-luminosity claim vs Pillow capability** — essay demands "light with no external source" but Pillow can only approximate emission with screen blending

## What Works
- The two-skill separation (designer vs renderer) forces the right behavior
- `visual_audio_alignment` field enforces thinking about visual-audio connection
- `bad_first_visual` + `rejected_because` catches lazy visual instincts
- `agentvision.md` as a design brief bridges gold study and storyboard creation
- The render pipeline works end-to-end (PIL → frames → MP4 → audio mux → metadata)
- Gold packs exist as templates for what good looks like

## The Core Question
How do we make Hermes consistently produce planning packs and render scripts that match the gold pack quality bar — without copying, without skipping steps, with genuine per-shot thinking?

## Key Constraints
- Pure PIL + ffmpeg — no GPU, no WebGL, no Blender for production
- 15-40 lines per scene function — yantra geometry, every coordinate calculated
- No dispatch tables — each scene function is custom code
- Must pass the no-narration test — mute audio, does the visual explain the concept?
- Cloudflare Workers for API/deployment, Python on VPS for rendering
- ~30 gold packs available as reference material

## Files Referenced
- Skills: `hermes/skills/platinum-designer/SKILL.md`, `hermes/skills/platinum-renderer/SKILL.md`, `hermes/skills/produce-platinum-video/SKILL.md`
- Gold packs: `content/publishing/renders/gold-analysis/`, `content/publishing/imports/packs/unpacked/`
- Archive of old approach: `archive/v1-pipeline/`
- Process docs: `factory/THE-PLATINUM-PROCESS.md`, `factory/ZEUS-AMPLIFIER.md`, `factory/storyboard-template.json`
- Hermes agent: `/usr/local/bin/hermes`, config at `/root/.hermes/config.yaml`

## Cloudflare Infrastructure
- Worker: `re-rendering-atlas` at `tradesprior.workers.dev`
- D1: `atlas-db` — factory state, essay registry
- R2: `factory-assets` — video/audio storage, `uploads` bucket with `goldfiles/` prefix for Blender/Manim references
- Vectorize: `atlas-global` — semantic search
- Dashboard URLs: `studio.tantrafiles.xyz` (Flask tunnel), `dashboard.tantrafiles.xyz` (Pages)
