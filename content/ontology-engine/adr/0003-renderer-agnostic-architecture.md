# ADR 0003: Renderer-Agnostic Architecture

## Status

Accepted.

## Context

The renderer must not become the architecture. Skia Canvas is the first backend, chosen because it is the easiest reliable way to ship the current documentary style (flat 2D composition, vectors, black ink, geometric diagrams, Sanskrit typography). But the ontology engine and scene specification must remain renderer-neutral, supporting future backends (Three.js 3D, WebGPU shaders, video modules) without rewriting the semantic layer.

## Decision

The ontology engine sits above all rendering software:

```
Ontology engine
      ↓
Semantic scene
      ↓
Renderer-neutral visual plan
      ↓
┌──────────────┬──────────────┬──────────────┐
│ Skia 2D      │ Three.js 3D  │ Other backend│
│ diagrams     │ worlds       │ shaders/video│
└──────────────┴──────────────┴──────────────┘
```

### Canonical scene spec is renderer-neutral

It describes:

**Entities**: center, field, ray, veil, mirror, network, vessel, fracture, glyph, threshold

**Relationships**: contains, grounds, participates-in, reflects, conditions, limits, returns-to

**Operations**: manifest, differentiate, conceal, recognize, process, return, co-arise, repair, dissolve

**Spatial meaning**: source-centered, hierarchical, networked, cyclic, reciprocal, fractured, apophatic

**Camera intention**: approach, withdraw, orbit, descend-through-levels, ascend-through-levels, shift-perspective, whole-to-part, reveal-hidden-relation

None of these contain renderer-specific instructions.

### Camera system

Even a 2D renderer needs a camera. Objects exist in a virtual world; the camera determines which part we see.

```typescript
interface CameraState {
  position: {x: number; y: number; z: number};
  target: {x: number; y: number; z: number};
  zoom: number;
  rotation: number;
  projection: "orthographic" | "perspective";
}
```

For Skia: mostly x, y, zoom, rotation. A slow push is `zoom: 1.00 → 1.08`. A pan is `camera.x: 0 → 600`.

For Three.js: full 3D transform with perspective projection, depth of field, orbit controls.

### Renderer capabilities model

Each backend declares what it supports:

```typescript
interface RendererCapabilities {
  dimensions: "2D" | "3D";
  paths: boolean;
  text: boolean;
  svg: boolean;
  images: boolean;
  particles: boolean;
  lighting: boolean;
  shaders: boolean;
  depthOfField: boolean;
  volumetrics: boolean;
}
```

Skia: 2D, paths, text, svg, images, particles; no lighting, shaders, depthOfField, volumetrics.

Three.js: 3D, paths, text, images, particles, lighting, shaders, depthOfField, volumetrics; no svg.

### Scene backend selection

A scene states its requirements and the render router selects the backend:

```json
{
  "scene_id": "plotinian_procession",
  "render_requirements": {
    "preferred_dimensions": "3D",
    "requires_depth": true,
    "requires_volumetric_light": true,
    "requires_precise_sanskrit_text": false
  }
}
→ Three.js

{
  "scene_id": "abhinava_quote",
  "render_requirements": {
    "preferred_dimensions": "2D",
    "requires_precise_sanskrit_text": true,
    "requires_svg": true
  }
}
→ Skia
```

A finished documentary can combine backends per scene. Each backend outputs an MP4 segment or frame sequence; FFmpeg joins them.

### Hybrid scene graph (2D + 3D)

Nodes use 3D coordinates in the canonical graph. 2D renderers ignore or flatten z.

```typescript
interface SceneNode {
  id: string;
  kind: "group" | "geometry" | "text" | "image" | "field" | "light"
       | "camera" | "particle-system" | "artwork-plane";
  transform: {
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
  };
  visualRole: string;
  rendererHints?: Record<string, unknown>;
}
```

### Camera direction layer

The ontology expresses cinematic intent, not exact coordinates:

```yaml
camera_intent:
  mode: descend_through_levels
  subject: trika_tantraloka.tattva_sequence
  emotional_quality: lucid
  pacing: contemplative
  end_focus: trika_tantraloka.purusha
```

The 2D compiler might produce: vertical pan, gradual scale increase, successive labels.

The Three.js compiler might produce: camera descends through nested translucent planes with depth haze.

### Extension registries

```typescript
operatorRegistry.register("self_manifest", selfManifestCompiler);
operatorRegistry.register("condition_arise", conditionAriseCompiler);

primitiveRegistry.register("bindu", BinduPrimitive);
primitiveRegistry.register("veil", VeilPrimitive);

rendererRegistry.register("skia", skiaBackend);
rendererRegistry.register("three", threeBackend);
```

### When to use 3D

3D (Three.js/WebGPU) is worth the overhead when depth carries meaning:
- descending through the 36 tattvas
- moving through Plotinian hypostases
- entering a mandala
- layers of contraction around the finite subject
- the Kabbalistic sequence of contraction, ray, vessels, rupture, repair
- nested worlds or subtle bodies
- network of dependent relations from changing perspectives
- geometric solids and planetary correspondences
- luminous fields, particles, volumetric structures

Stick to 2D for: Sanskrit terms, diagrams, quote cards, basic labels, comparisons needing precise readable text.

## Consequences

- Skia is the first backend, not the engine. The engine is the semantic layer above it.
- Scene schema uses 3D coordinates from the start, even if Skia renders them as 2D.
- Camera intention is part of the scene spec, not hardcoded in the renderer.
- Adding a new tradition (Ibn Arabi, Suhrawardi, Daoism) means authoring an ontology pack, not rewriting the renderer.
- Adding a new visual requirement (volumetrics, portals, recursive rendering) means adding a backend or primitive, not changing the ontology.

## Related

- ADR 0001: Semantic-first (operators are canonical, renderer is implementation detail)
- ADR 0002: Claim graph above ontology (provenance back to primary texts)
