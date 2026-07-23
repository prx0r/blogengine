# ADR 0006: Visual Grammar Layer

## Status

Accepted.

## Context

The ontology outputs metaphysical operators (recognize, emanate, conceal, contract). The renderer draws pixels. Between them there was no layer that translates "what does recognition look like?" into concrete visual rules.

The 20-second spike proved the gap: the ontology said "Spanda → pulse" and the renderer drew a pulsing circle. The Visual Director should have said "Spanda is self-renewing awareness, not mechanical oscillation" but even that is direction, not specification.

What's missing is **Visual Grammar**: a set of rules that map each ontological operator to specific visual behaviors, independent of the renderer.

## Decision

Insert a Visual Grammar layer between the Visual Director and the Scene Graph:

```
Ontology (metaphysical operators)
    ↓
Visual Grammar (visual rules per operator)
    ↓
Scene Graph (concrete rendering)
```

## Example: Recognition

| Layer | Output |
|-------|--------|
| **Ontology** | `operator: recognize` |
| **Visual Grammar** | Center persists. Outer forms align. Noise decreases. Symmetry increases. Camera stabilizes. |
| **Scene Graph** | bindu opacity=1, orbiting elements decelerate, mirror symmetry t→1, contrast ratio increases |

## What the Visual Grammar contains

Per operator, a set of rules that describe the visual behavior in renderer-neutral terms:

```
recognize:
  center: persist
  periphery: align
  noise: decrease
  symmetry: increase
  camera: stabilize
  color_contrast: increase
  motion_blur: decrease
  
emanate:
  source: still
  new_forms: emerge_from_center
  direction: radial
  speed: decelerating
  opacity: fade_in
  camera: pull_back_slowly

conceal:
  subject: remain
  surface: grow_opaque
  detail: reduce
  edges: soften
  camera: remain_still

contract:
  boundary: move_inward
  interior: condense
  surface: thicken
  light: dim
  camera: zoom_in

repair:
  fragments: gather
  gaps: close
  surface: smooth
  symmetry: restore
  camera: hold
```

## Why this fixes the "pulse" bug

The old pipeline:
```
Spanda → pulse → draw pulsing circle (wrong)
```

The corrected pipeline:
```
Spanda → self-renewing awareness (ontology)
       → field coherence, subtle expansion, center persists, periphery breathes (grammar)
       → bindu steady, surrounding field modulates at 0.2Hz, no oscillation waveform (scene graph)
       → render
```

The grammar explicitly forbids "waveforms, oscilloscope, heartbeat, ripples" — which is what the renderer would have drawn without guidance.

## How it compiles

The Visual Grammar is a JSON map. The Visual Director selects operators, the grammar expands them into visual rules, the scene graph compiler resolves those rules into concrete parameters:

```yaml
operator: recognize
grammar_rules:
  - center.persist: true
  - periphery.align: 0.7
  - noise.decrease: 0.3
  - symmetry.increase: 0.8
  - camera.stabilize: true
```

The scene compiler then decides: bindu opacity stays 1, orbiting elements decelerate over 2s, mirror plane activates, contrast ratio shifts.

## Relationship to renderer capabilities

The grammar is renderer-agnostic but can be influenced by what the renderer supports. A 2D grammar may differ from a 3D grammar for the same operator:

```
recognize:
  2d:
    center: persist
    periphery: align_to_center
    symmetry: mirror
  3d:
    center: persist
    periphery: orbit_into_alignment
    depth: flatten
    symmetry: axial
```

The Visual Director chooses the dimension; the grammar provides the appropriate rules.

## Full Pipeline (Final)

```
Research
    ↓
Claims
    ↓
Ontology (metaphysical operators)
    ↓
Visual Grammar (visual rules per operator)
    ↓
Visual Director (selects operators, composes sequence)
    ↓
Scene Graph (concrete parameters)
    ↓
R3F Sandbox (instant iteration)
    ↓
Export Backend (Skia / Blender / FableCut)
```
