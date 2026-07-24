# Blender Pipeline — Future Reference

## Core Principle

> PIL proves the idea. Coldtype constructs precise graphic forms. Blender gives those forms material, light, depth and camera movement.

**Shared scene spec** — all engines read the same semantic composition. Never reverse-engineer flat pixels into 3D.

## Corrected Execution Order

The previous version framed Coldtype as the existential gate. It's not. **The gate is whether the existing Visual Program IR can preserve semantic continuity while supporting a Blender keyframe compiler.** Coldtype just determines whether typography reaches Blender through a live bridge (`b3d`) or explicit interchange (SVG/path JSON). Both routes work; the latter is just more work.

**Design both behind one interface from the start:**

```python
class VectorProvider:
    def build(self, spec) -> VectorArtifact: ...

class ColdtypeB3DProvider(VectorProvider): ...
class ColdtypeSVGProvider(VectorProvider): ...
class NativeBlenderCurveProvider(VectorProvider): ...
```

## Final Stack (target)

```
ESSAY / SOURCE TEXT
  → Doctrine + relationship graph
  → Scene invention agent
  → Renderer-neutral scene specification
  → PIL contact-sheet draft
  → Visual critic + composition revision
  → Coldtype vector + typography compilation
  → Blender 2.5D scene compilation (Eevee)
  → Vision critique + parameter patches
  → Eevee / Cycles final render
  → Reusable scene library + FableCut manifest
```

## Tools Evaluated

| Tool | Verdict | Role |
|------|---------|------|
| **Blender** | ✅ Primary | Final renderer: geometry, materials, camera, lighting, particles, headless GPU rendering |
| **Coldtype** | ✅ Core | Vector/typography compiler. `b3d` bridge preferred; SVG/path JSON fallback always available |
| **nodebpy** | ✅ Test first | Pythonic Geometry Nodes + shader nodes |
| **NodeToPython** | ✅ Essential | Convert hand-designed node graphs → reusable Python code |
| **djeada/blender-mcp-server** | ✅ Control plane | `blender_python_exec`, `blender_render_still`, `blender_job_status` |
| Godot | ❌ Skip now | Useful later for interactive, not offline rendering |
| Babylon.js | ❌ Skip | Browser-first, needs Chromium/Playwright for server-side |
| BlenderProc | 📖 Reference | Worker architecture patterns only |

## Architecture

```
visual-engine/
├── schemas/
│   ├── semantic_scene.schema.json
│   ├── composition.schema.json
│   └── render_plan.schema.json
├── compiler/
│   ├── essay_to_beats.py
│   ├── doctrine_to_scene.py
│   ├── resolve_layout.py
│   ├── compile_timeline.py
│   └── route_renderer.py
├── draft/
│   ├── pillow_renderer.py
│   └── contact_sheet.py
├── coldtype/
│   ├── typography.py / glyph_paths.py / symbols.py / ornaments.py
│   ├── b3d_bridge.py
│   ├── svg_exporter.py
│   └── provider.py           # VectorProvider interface
├── blender/
│   ├── compiler.py / scene_builder.py / animation.py / camera.py / qc.py
│   ├── primitives/ (curves, arches, vessels, mosaics, bodies, cosmograms, particles)
│   ├── nodes/ (geometry/, shaders/, compositor/)
│   ├── materials/ (parchment, porphyry, lapis, tarnished_gold, engraved_marble, crimson_emissive)
│   ├── templates/ (late_antique.blend, tantric_manuscript.blend, alchemical_workshop.blend, imaginal_landscape.blend)
│   └── vector_importer.py    # consumes SVG/path JSON if b3d not viable
├── registry/ (motifs, relations, materials, compositions, retired_cliches)
├── mcp/ (inspect_scene, render_preview, execute_compiled_scene, patch_parameters, render_final)
└── workers/
    ├── Dockerfile.blender
    ├── render_job.py / resume_frames.py / verify_output.py / package_pack.py
```

## Vast.ai Worker Protocol

```
VPS (orchestrator)                      vast.ai instance (GPU)
  ├── job.json                                │
  ├── scene.json                              │
  ├── visual_program.json                     │
  ├── render_plan.json                        │
  ├── template.blend                          │
  ├── generated_scene.py                      │
  └── texture_manifest.json (R2 presigned)    │
       │                                      │
       └── dispatch via SSH ──────────────────┤
                                              │
         blender --background template.blend  │
           --python generated_scene.py        │
           --render-output /output/           │
           --frame-start N --frame-end M      │
           --render-anim                      │
                                              │
         ffmpeg encode → final.mp4            │
                                              │
         direct R2 S3 upload ◄────────────────┘
                                              │
         VPS polls R2 for completion ─────────┘
                                              │
         verify checksum, duration           │
         ingest into scene catalog           │
         terminate worker                    │
```

**Key constraint:** Upload directly to R2 from the worker. Don't route frames through the VPS. Use pre-signed S3 URLs.

## Two Compilation Stages (architecturally critical)

**Do NOT make Blender consume frame-expanded timelines.** The current compiler produces frame-by-frame event lists — appropriate for PIL, wrong for Blender.

Keep two stages:

```
Visual Program IR
        ↓
Event/track timeline
        ├── PIL frame compiler
        ├── Skia frame compiler
        └── Blender keyframe compiler
```

The shared timeline retains:

```json
{
  "target": "presence",
  "operator": "descend",
  "start": 0.30,
  "end": 0.72,
  "easing": "ceremonial_slow"
}
```

Only PIL expands this to every frame. Blender translates it into object keyframes, material F-curves, Geometry Nodes parameters, camera keyframes.

## Architectural Inconsistency to Fix Before Blender Work

The current ontology runtime partially violates its own principle ("semantic layer never contains renderer instructions"):

- `ARCHETYPE_COMPONENTS` maps concepts directly to concrete PIL primitives (circle, line, grid, concentric fields)
- `CAMERA_MODES` is explicitly tied to Skia backend

**Refactor `resolve_scene()` into:**

```python
normalize_scene()
validate_semantics()
resolve_visual_program()
compile_backend_plan()
```

Semantic output should say:

```json
{
  "entity": "divine_presence",
  "archetype": "descending_current",
  "role": "superior_cause",
  "continuity_id": "presence-01"
}
```

The PIL adapter interprets that as translucent polygons. The Blender adapter interprets it as bevelled curves, emissive material, volume and light.

## Data Plane Priority

| Asset | Origin | Storage | Notes |
|-------|--------|---------|-------|
| Scene spec JSON | VPS compiler | Inline in job | ~50 KB |
| .blend template | VPS | R2 | ~2 MB |
| Vector assets | Coldtype | Inline or R2 | SVG/JSON |
| Art textures | sacred-art bucket | R2 presigned | |
| Final MP4 | Worker | R2 directly | ~2 GB for 20min |
| Checkpoint frames | Worker | R2 directly | For resumability |

**Signed URLs in jobs, not persistent scenes.** The catalog stores logical references (`r2://sacred-art/textures/parchment_03.png?sha256=...`). The orchestrator generates temporary pre-signed URLs per job. Never persist expiring URLs.

## Cost Model

| Stage | Infrastructure | Time | Cost |
|-------|---------------|------|------|
| PIL draft | VPS (free) | Minutes | $0 |
| Coldtype | VPS (free) | Minutes | $0 |
| Blender Eevee | RTX 4090 on vast (~$0.50/hr) | ~3s/frame | ~$15 per 20min video |
| Blender Cycles (hero only) | RTX 4090 | ~30s+/frame | ~$150+ per scene |

**The correct unit is scenes, not documentaries.** Most Blender outputs should be 4-12 second clips assembled in FableCut. A 20min video uses only a few minutes of 3D.

## Shared Scene Spec — Extend the Existing IR

**Do not create a parallel "Blender scene schema."** `operations/visuallanguage.md` (752 lines) already defines:
- 10 rhetorical functions
- 8 visual operators
- Entity continuity (70% reuse target, limited new entities, explicit handoffs)
- Timing phases
- Constrained visual grammar (model chooses transformations, runtime controls aesthetics)

### 1. Semantic Program (renderer-independent)

```json
{
  "subject": "divine presence",
  "operator": "descends_into",
  "object": "prepared vessel",
  "invariants": ["source remains superior", "vessel becomes illuminated"]
}
```

### 2. Visual Program (renderer-neutral events)

```json
{
  "entities": ["oculus", "presence", "vessel", "chamber"],
  "events": [
    {"op": "construct", "target": "chamber", "range": [0.0, 0.25]},
    {"op": "reveal", "target": "oculus", "range": [0.15, 0.35]},
    {"op": "descend", "target": "presence", "range": [0.30, 0.72]},
    {"op": "illuminate", "target": "vessel", "range": [0.58, 0.86]}
  ]
}
```

### 3. Backend Interpretation (engine-specific)

Each engine decides how to realize events — PIL draws paths, Coldtype shapes inscriptions, Blender creates geometry + keyframes.

## Revised Parallel Plan (48 hours)

### Track A — Coldtype transfer spike (hours 0-6)

Test **both routes:**

**A1. Native b3d:**
```
Coldtype glyph → Blender persistent curve → extrusion → material
→ animation → save → close → reload → rerender
```

**A2. SVG/path JSON fallback:**
```
Coldtype glyph → SVG or path JSON → custom Blender importer
→ curve → extrusion → material → animation → save/reload
```

Compare: fidelity, setup complexity, headless compat, persistence, determinism, Sanskrit shaping, Python version fragility.

Record versions explicitly:
```bash
blender --background --python-expr \
  "import bpy, sys; print(bpy.app.version_string); print(sys.version)"
```

### Track B — Vast worker proof (hours 0-6, parallel)

```
launch instance → detect Blender → detect GPU → render Eevee frame range
→ encode locally → upload directly to R2 → verify remotely → terminate
```

Test: Eevee Next, Cycles/OptiX, PNG sequence, FFmpeg encode, multipart R2 upload, interrupted resume, auto-shutdown.

### Track C — IR validation against existing catalog (hours 0-6, parallel)

Select **stratified sample** of 20 scenes from the 198 in `scene-system/catalog/scenes.json`:
- 4 body/axis scenes
- 4 radial/cosmogram scenes
- 4 architecture/vessel scenes
- 4 transformation/continuity scenes
- 4 typography/symbol scenes

For each, produce:
```json
{
  "scene_id": "...",
  "maps_cleanly": [],
  "missing_fields": [],
  "legacy_fields_unused": [],
  "backend_specific_fields": [],
  "continuity_issues": [],
  "recommended_ir_extension": []
}
```

Categorize every candidate field as:
```
SEMANTIC_CORE | VISUAL_PROGRAM | BACKEND_HINT | LEGACY_ONLY | DERIVED_FIELD
```

Output: `schema-gap-report.md` + `schema-gap-report.json`

### Integration block (hours 6-18)

Build **Descent of Presence** using existing IR + minimal experimental extension:

```json
{
  "schema_version": "2.0-experimental.1",
  "extensions": {
    "backend_hints": {},
    "material_roles": {},
    "camera_cues": {},
    "vector_assets": {}
  }
}
```

Deliver: semantic scene, visual program, PIL draft, Coldtype artifact, Blender Python, .blend file, Eevee preview, final MP4, FableCut import test, benchmark.

### Extraction block (hours 18-26)

Derive schema changes from the scene — what was genuinely renderer-neutral, what belonged to Coldtype, what belonged only to Blender. Run revised schema against the 20-scene sample.

### Automation block (hours 26-48)

Wire: VPS job creation → signed R2 inputs → Vast worker → heartbeat → frame checkpoints → Blender render → local encode → R2 upload → verification → catalog update → FableCut ingestion → shutdown.

## FableCut Integration

Blender is a new **asset producer** for the existing pipeline. `build-from-blueprint.py` already downloads assets, generates voiceover, creates FableCut timelines. The downstream structure:

```
Blender worker → scene MP4 in R2 → local/cache resolver → FableCut media → blueprint timeline
```

A catalog scene gains:

```json
{
  "render_capabilities": {
    "pillow": "proven",
    "coldtype": "candidate",
    "blender": "proven"
  },
  "preferred_asset": {
    "type": "generated_animation",
    "uri": "r2://visual-scenes/ia13/final.mp4"
  }
}
```

FableCut should not care whether the MP4 came from PIL, Blender, archival media, or a camera.

## One Existing Pipeline Bug

In `scripts/pipeline/build-from-blueprint.py`, add parentheses for correct operator precedence:

```python
if m and (
    "wikimedia" in m.group(0).lower()
    or "metmuseum" in m.group(0).lower()
):
```

The current version can evaluate `metmuseum` when `m` is `None`.

## What to Do Before Returning

1. ✅ Ship Kapala video (prove pipeline end-to-end)
2. ✅ Automate voiceover (Edge TTS or Eleven Labs)
3. ✅ Solve LLM constraint problem with proven few-shot examples
4. ✅ Publish 5+ videos and get audience feedback
5. ✅ Then: revisit this spec, start with Track C (IR validation), then Tracks A+B, then integration
