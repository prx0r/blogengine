# ADR 0004: The Visual Director Layer

## Status

Accepted. Supersedes the implicit assumption that the ontology compiler outputs renderer instructions.

## Context

The project spent months trying to build a renderer — Skia, Revideo, Motion Canvas, pycairo — believing the renderer was the product. A 20-second spike of a pulsing circle with "not your heartbeat" exposed the category error: the renderer had nothing interesting to draw because **no layer above it made creative decisions**.

The renderer is the camera operator. Pixar's renderer doesn't create *Finding Nemo*. Everything interesting happens before rendering.

## Decision

Introduce a **Visual Director** layer between the ontology compiler and the renderer. The full pipeline becomes:

```
Research
    ↓
Claim graph (ADR 0002)
    ↓
Ontology / Metaphysical Compiler
    ↓
Narrative beats
    ↓
Visual Director        <── NEW
    ↓
Scene graph
    ↓
Animation / timing
    ↓
Renderer (Skia / Three.js / etc.)
    ↓
FableCut assembly
```

### What the Visual Director does

The Visual Director is an AI film director. It receives narrative beats and produces **cinematography**, not animation code. It answers:

- Should this be shown through **space**? (diagram, geometry, position)
- Through **light**? (illumination, obscurity, revelation)
- Through **comparison**? (side-by-side, analogy, metaphor)
- Through **topology**? (containment, hierarchy, network)
- Through **typography**? (Sanskrit, emphasis text, quotation)
- Through **artwork**? (full-bleed painting, detail crop, gallery wall)
- Through **archive**? (photograph, manuscript, footage)
- Through **transition**? (wipe to next, pause, cut on action)

These are artistic decisions, not rendering decisions.

### Example

Narration: *"Spanda is not movement through space. It is the dynamism by which consciousness continually renews itself."*

The Visual Director produces:

```
Beat 17

Purpose:
  Destroy misconception of physical vibration.

Visual argument:
  Start: single bindu
  Action: very slight breathing of surrounding field
  Do NOT: waveforms, oscilloscope, heartbeat, ripples
  Camera: slow push
  Reveal: black geometry unfolds, center never moves
  Timing: 6.2 seconds
  Emotion: stillness, certainty, recognition

Subtitle: "The center never moved."
```

The renderer never receives the narration. It receives resolved scene state.

### What the Visual Director does NOT do

- It does not write renderer code.
- It does not position pixels.
- It does not generate SVG paths or Three.js meshes.
- It does not compute frame-by-frame interpolation.

Those belong to the renderer and animator.

### What the ontology compiler should output

The ontology compiler (Metaphysical Compiler) outputs cinematography, not animation:

```
Beat 12

Claim:
  Spanda is not vibration.

Misconception:
  Mechanical oscillation.

Strategy:
  Contrast.

Visual:
  Start: oscilloscope line
  Cross out.
  Fade.
  Hold empty white.
  Tiny bindu.
  Camera waits.
  Five seconds of almost nothing.
  Tiny crimson breath.
  Geometry unfolds.
  Subtitle: "The center never moved."
  Cut.
```

Notice: almost no rendering. Almost everything is directing.

### Relationship to FableCut

A documentary is mixed media, not a single rendered scene:

```
Quote → Artwork → Diagram → Transition → Portrait → Map
→ Animation → Archive → Diagram → Text → Close-up → Diagram
```

The ontology renderer may generate only 20-30% of a finished documentary — the animated philosophical diagrams. The rest is artwork, typography, archive footage, quotation cards, and transitions assembled in FableCut. This is not a limitation; it is a correct understanding of the documentary form.

## Consequences

- The renderer is now **commodity**. Skia, Three.js, Blender, or future AI video models — the Visual Director's output remains valid across all of them.
- The **Visual Director is the intellectual property**, not the renderer.
- The scene spec (Visual Director output) is the product. The renderer merely executes it.
- The ontology engine is renamed to **Metaphysical Compiler** to reflect what it actually does: compile metaphysical claims into cinematographic direction.
- The renderer must never invent. It receives fully resolved scene state and draws pixels.

## Related

- ADR 0001: Semantic-first (operators are canonical, renderer is implementation detail)
- ADR 0002: Claim graph above ontology (provenance back to primary texts)
- ADR 0003: Renderer-agnostic architecture (Skia is first backend)
