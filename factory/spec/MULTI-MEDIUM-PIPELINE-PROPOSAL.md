# Multi-Medium Pipeline Proposal

## The Vision

Not just PIL videos. A deterministic state machine that selects the right medium for each shot:

```
HISTORICAL IMAGE  → for periods, figures, manuscripts
PROCEDURAL PIL    → for concepts, transformations, relationships 
AI GENERATED      → for technical diagrams, illustrations
SLIDESHOW (FableCut) → for archive-heavy passages
VIDEO GEN         → for atmospheric transitions, establishing shots
```

All orchestrated by the same state machine controller.

---

## How It Works

### The Controller Already Exists

`factory/platinum_controller.py` manages stages as a state machine. Hermes can only produce the artifact required by the current stage. The controller validates and advances.

### Extend: Medium Selection Per Shot

```python
class RenderMedium(str, enum.Enum):
    PIL = "pil"           # Procedural PIL — concepts, transformations
    HISTORICAL = "historical"  # Existing art from our repo
    AI_IMAGE = "ai_image"     # Flux/Stable Diffusion generation
    FABLECUT = "fablecut"     # Slideshow template
    VIDEO = "video"           # Text-to-video (Hailuo/Veo/Seedance)
```

The storyboard already has `concrete_motif.drawable_parts` and `motion_verbs`. Extend with `render_medium`:

```json
{
  "shot_id": "s007",
  "spoken_passage": "Albertus Magnus walked through the mines of Germany...",
  "render_medium": "historical",
  "source_image": "content/sources/tantra/images/albertus_magnus_mining.jpg",
  "animation": "ken_burns_slow_zoom",
  "visual_audio_alignment": {
    "why_it_matches": "This is a real historical figure doing real fieldwork — an authentic image grounds the abstract philosophy in material reality."
  }
}
```

```json
{
  "shot_id": "s012",
  "spoken_passage": "The mineralizing power is the same kind of force that shapes a living body...",
  "render_medium": "pil",
  "concrete_motif": {
    "name": "earth_water_convergence_seed",
    "drawable_parts": ["earth field", "water field", "convergence zone", "seed point"],
    "estimated_scene_lines": 28
  }
}
```

```json
{
  "shot_id": "s034",
  "spoken_passage": "The 36 tattvas arranged in a descending hierarchy...",
  "render_medium": "ai_image",
  "prompt": "technical diagram of 36 tattvas as concentric colored spheres arranged vertically, clean schematic, dark background, gold and lapis colors, numbered levels",
  "model": "flux-1-schnell",
  "animation": "reveal_from_top"
}
```

---

## What Each Medium Costs

### Historical Images — FREE
We already have 341 tagged art images + 563 untagged in the repo. FableCut has a slideshow template. Cost: $0.

### Procedural PIL — FREE (just compute time)
Our existing pipeline. 15-40 lines per scene function. Cost: $0.

### AI Image Generation — NEGLIGIBLE
- flux-1-schnell: $0.0000528/tile + $0.0001056/step
- Example: 10 technical diagrams/day = ~$0.001
- Free tier covers ~33,000 images/day

### FableCut Slideshow — FREE
Existing FableCut MCP server with timeline templates. Cost: $0.

### Video Generation — CHEAP via third-party
- hh1.1-t2v: third-party pricing
- seedance-2.0-mini: cheap, high-volume
- Use sparingly — only for establishing shots or transitions

---

## Integration Into the State Machine

```
STAGES (extended):
  GOLD_STUDY → RHETORICAL_MAP → VISUAL_THESIS → 
  MOTIF_MANUFACTURABILITY → MEDIUM_SELECTION →    ← NEW
  STORYBOARD → STORYBOARD_REVIEW → RENDER_PLAN →
  CODE_REVIEW → DRAFT_RENDER → VISUAL_QC → FINAL_RENDER
```

### New Stage: MEDIUM_SELECTION

After motifs pass manufacturability, the designer assigns a render medium to each shot:

```
Historical images     → for empirically grounded passages (fieldwork, real people)
Procedural PIL        → for conceptual transformations (mineralizing power, consciousness)
AI generated          → for technical diagrams, schematic illustrations
FableCut slideshow    → for archive-heavy or list-like passages
Video generation      → for atmospheric establishing shots, transitions
```

Rules:
- ≥40% of shots must be PIL (maintains the visual language identity)
- Historical images must exist in our repo (no fabricating)
- AI images must have a specific prompt, not just "make something cool"
- FableCut slides are for passages where the content is the image itself

### Why This Works With the Controller

The controller already has the structure. Each stage:
1. Validates inputs (checking for required artifacts)
2. Calls Hermes with a stage-specific prompt
3. Validates outputs (schema checks, semantic checks)
4. Advances or retries

Adding `MEDIUM_SELECTION` is just adding another Stage enum entry with its own config, inputs, outputs, and validator.

---

## Bootstrapping From Gold Packs

The gold packs are essentially labeled examples for each medium:

| Pack | Medium | Teaches |
|------|--------|---------|
| Stones Are Watching | PIL film pack | Concrete motif naming, interleaving |
| Kabbalah Tree of Life | PIL animation pack | Multi-phase easing, layer compositing |
| You Existed Before Earth | PIL film pack | Full film pack format |
| Our art repo | Historical images | 341+ tagged images |
| FableCut templates | Slideshow | Timeline composition |

Each pack → `gold_signature.json` with transferable_principles[] and forbidden_to_copy[].

The controller already reads these. No new infrastructure needed.

---

## What To Build

### 1. Add MEDIUM_SELECTION to controller
```python
class Stage(str, enum.Enum):
    ...
    MEDIUM_SELECTION = "medium_selection"
```
With config: output → `medium_map.json` (mapping shot_id → render_medium + params)

### 2. Create medium dispatchers
- `render_pil.py` — existing, calls scene functions
- `render_historical.py` — loads image from repo, applies Ken Burns animation
- `render_ai_image.py` — calls CF Workers AI (flux-1-schnell), composites into scene
- `render_fablecut.py` — sends to FableCut MCP server
- `render_video.py` — calls CF AI Gateway for third-party video models

### 3. Add CHECK_ART_EXISTENCE validator to MEDIUM_SELECTION
If shot uses "historical", the source_image must exist in the repo.

### 4. Add medium-specific QC to VISUAL_QC
- PIL scenes → check for repetition, no-narration pass
- Historical scenes → check image quality, crop, timing
- AI scenes → check for artifacts, prompt adherence
- FableCut → check timeline integrity

---

## Cost Projection (Per Video)

| Component | Cost |
|-----------|------|
| PIL rendering (25-106 shots) | $0 (compute only) |
| Historical images (if used) | $0 |
| AI images (5-10 per video) | ~$0.001-0.01 |
| TTS voiceover (7-12 min) | ~$0.001 (melotts) |
| Video gen (1-2 establishing shots) | ~$0.05-0.20 (third-party) |
| **Total per video** | **~$0.05-0.25** |

---

## Summary

The controller already solves the quality enforcement problem. Adding medium selection lets us:
- Use historical art where authentic (no cost)
- Use PIL for concepts (our strength, no cost)
- Use AI for technical diagrams (negligible cost)
- Use video gen for atmosphere (cheap)
- Use FableCut for slideshow passages (no cost)

The gold pack signatures bootstrap everything — the principles, the naming conventions, the quality bar.
