# Skia Implementation — Renderer Mode 2

## The Core Insight

> "You don't recreate every PIL gold pack in Skia. You freeze a small PIL gold benchmark, reproduce it faithfully in Skia, improve only where Skia genuinely adds value, define the common render contract, register Skia as renderer mode 2, compare both backends automatically, only then add Blender."

Skia should slot in late, exactly as we suspected. The pipeline is unusually well suited because conceptual work happens before rendering.

---

## The Renderer Architecture

Not direct source conversion (PIL Python → Skia JS). That's fragile.

Instead: **shared semantics, not translated source code.**

```
storyboard → render plan → renderer-neutral scene contract → PIL OR Skia
```

### Shot Contract

```json
{
  "shot_id": "s024",
  "renderer": "skia-custom-v1",
  "duration_seconds": 6.0,
  "resolution": [1280, 720],
  "fps": 12,
  "transformation": {
    "before": "two alternating peripheral currents",
    "operation": "synchronize and converge",
    "after": "one coherent central route"
  },
  "animation_phases": [
    {"range": [0.0, 0.25], "action": "establish dual oscillation"},
    {"range": [0.25, 0.65], "action": "phase-lock currents"},
    {"range": [0.6, 1.0], "action": "open central current"}
  ],
  "acceptance_tests": [
    "dual currents visually precede central route",
    "central route is produced by convergence",
    "shot remains intelligible without labels"
  ]
}
```

PIL agent writes `scene_024.py`. Skia agent writes `scene_024.js`. Both judged against the same contract.

---

## Renderer Adapter Interface

```typescript
interface RendererAdapter {
  id: string;
  validate(spec: ShotRenderSpec): ValidationResult;
  render(task: RenderTask): Promise<RenderResult>;
  capabilities: string[];
  qcProfile: string;
}
```

Register:

```javascript
const RENDERERS = {
  "pil-custom-v1": pilRenderer,
  "skia-custom-v1": skiaRenderer,
};
```

This dispatch is fine — it selects infrastructure, not visual meaning.

All renderers must return:
- `shot.mp4`
- `hero_frame.png`
- `motion_strip.png`
- `render_manifest.json`

---

## What Skia Improves

- Curve smoothness
- High-frame-rate motion (12-24 fps)
- Text antialiasing (Devanāgarī + English)
- Bézier paths
- Gradients
- Soft light and compositing
- Scale independence

**But it does not improve the idea.** A bad scene rendered in Skia is merely a sharper bad scene.

## What Stays PIL

- Historical-image compositing
- Textured fields
- Quick bespoke visual logic
- Legacy scenes
- Low-complexity geometry

## What Moves to Skia

- Exact paths and curves
- Smooth 12-24 fps motion
- Typography
- Masks
- Complex transforms
- Clean minimal geometry
- High-resolution output

## Hybrid Shots

```json
{
  "renderer": "hybrid-pil-skia-v1",
  "base": "pil",
  "semantic_overlay": "skia"
}
```

PIL processes a manuscript crop → Skia traces and animates exact lines → ffmpeg composites them.

---

## The Migration Plan

### Phase 0 — Fix the factory truth chain first

Before touching Skia, fix the issues the benchmark exposed:
1. Stages must load actual input artifacts from R2
2. Artifact logical names must resolve consistently between stages
3. `draft_render` must dispatch a renderer rather than call an LLM

The correct chain: `render_plan.json → validate → inspect renderer field → enqueue renderer task → actual renderer executes → output manifest returned`

### Phase 1 — Establish the renderer adapter

Register PIL as `pil-custom-v1`. Register the Skia demo as `skia-custom-v1`.

### Phase 2 — Choose 5 benchmark scenes

Not 5 similar circles. One from each challenge class:
1. **Geometry-heavy** — intersecting systems, many precise paths
2. **Text-heavy** — Sanskrit/Devanāgarī plus English
3. **Mask/compositing-heavy** — veils, apertures, image reveals
4. **Historical hybrid** — manuscript image becoming live geometry
5. **Multi-phase process** — before → intervention → after

For each: PIL original → Skia faithful reproduction → Skia refined version.

### Phase 3 — Compare automatically

Capture: render time, memory, file size, edge sharpness, text quality, frame consistency, motion smoothness, human preference, code size, repair difficulty.

Make a three-column contact sheet: PIL gold | Skia faithful | Skia refined.

### Phase 4 — Declare per-shot renderer

The Visual Director should not pick "Skia" because it sounds premium. The render planner picks based on capabilities.

### Phase 5 — Build a Skia Gold Canon

12 scenes:
- 3 exact process scenes
- 2 typography scenes
- 2 historical-to-diagram transitions
- 2 recursive/nested geometry scenes
- 2 luminous compositing scenes
- 1 complete synthesis scene

---

## How Blender Follows

Once every renderer receives the same shot contract, Blender becomes:

```json
{
  "renderer": "blender-parametric-v1",
  "template": "orthographic_crystal_chamber",
  "parameters": {}
}
```

The factory doesn't need another stage. It gains another adapter: `blender-parametric-v1`.

---

## The Shared Primitive Layer

Eventually shared infrastructure:
- clamp, lerp, smoothstep, easing
- line, circle, polygon, path, text, image
- mask, layer, glow, transform

But bespoke semantic construction must remain scene-specific:
- "the descending reserve"
- "the seal that bends the current"
- "two alternating paths generating a third"

Make drawing easier. Don't create another generic motif dispatcher.

---

## Verdict

> "So yes: Skia becomes render mode two, but conversion should happen through the already-developed shot specification — not by trying to transpile arbitrary PIL code."

The example Skia pack (Amṛtasiddhi 4-scene demo) is the first concrete reference point for what that mode can look like.
