# ADR 0005: Live Sandbox First

## Status

Accepted. Amends the implementation priority of ADR 0003 (renderer-agnostic architecture) and ADR 0004 (Visual Director layer).

## Context

The project built a Skia Canvas renderer and proved it works (deterministic frame-pure rendering, Devanāgarī shaping, SVG layer extraction, MP4 output). But a 20-second spike of a pulsing circle revealed the fundamental problem: **we were trying to discover a visual language through a production renderer**.

Blender, Skia, and Three.js (as a render target) all share the same bottleneck: you change something, wait for it to render, then decide if it works. Iteration is measured in minutes, not seconds.

The visual language itself is unknown. We need to discover:
- How should *recognition* look?
- How should *contraction* feel?
- How does *emanation* unfold?

These are design explorations. They require **instant feedback**, not production rendering.

## Decision

Build a **live browser sandbox** as the primary environment for visual language discovery. Only after the language is discovered should we productionize it via Blender or another high-quality renderer.

### The stack

```
Ontology JSON
    ↓
Semantic scene graph
    ↓
React Three Fiber components
    ↓
Live browser viewport (instant refresh)
    ↓
Hermes / AI modifies scene live
    ↓
When scene is right → Export to Blender / Skia / FableCut
```

### Why React Three Fiber

1. The scene graph becomes **React components** — Hermes composes them like Lego
2. Ontology operators become **props** on components
3. Instant hot reload via Vite — change a prop, see it in <1s
4. Three.js handles 2D and 3D in the same environment — no bifurcation
5. Orbit camera, lighting, particles, shaders are free
6. Can deploy to Cloudflare Pages for team previews
7. AI writes JSX and R3F code naturally

### Example: Ontology → Components

```yaml
# Ontology output
Recognize:
  intensity: 0.8
Conceal:
  intensity: 0.3
Manifest:
  rings: 5
```

```jsx
// R3F components
<Recognition intensity={0.8} />
<Conceal intensity={0.3} />
<Manifest rings={5} />
```

The AI is no longer generating graphics. It's generating **composition**.

### The sandbox

```
┌──────────────────────────────────────────────┐
│          Scene 23 — "Recognition"            │
├──────────────────────────────────────────────┤
│                                              │
│           (LIVE VIEWPORT)                    │
│                                              │
│                ○                             │
│             subtle pulse                     │
│                                              │
├──────────────────────────────────────────────┤
│ Entities          │ Hermes                   │
│ ✓ Bindu          │ "Make this feel less      │
│ ✓ Field          │  mechanical."             │
│ ✓ Portrait       │                          │
│ ✓ Quote          │ [Generate]                │
└──────────────────────────────────────────────┘
```

The user types: *"The center should feel like it's discovering itself rather than expanding."*

Five seconds later, the viewport changes. **That is the invention.**

### Relationship to existing work

| Asset | New Role |
|-------|----------|
| **Skia Canvas** | 2D export path / lightweight production backend for quote cards, diagrams, typography |
| **React Three Fiber** | Primary visual language discovery environment |
| **Three.js (raw)** | Fallback if R3F abstraction leaks |
| **Blender** | High-quality cinematic export button (future) |
| **FableCut** | Final documentary assembly (unchanged) |
| **Motion Canvas** | Deprecated — R3F supersedes it for exploration |
| **Python/pycairo** | Deprecated — Skia supersedes it for 2D export |

### Implementation phases

**Phase 1 (this week):** Standalone R3F sandbox that loads scene JSON, renders basic primitives (bindu, field, wheel, text), responds to prop changes via URL params or local state. Deploy to Cloudflare Pages.

**Phase 2:** Hermes integration. Chat input modifies scene props in real-time. Visual Director agent outputs component compositions.

**Phase 3:** Language discovery. Iterate on the core visual vocabulary (recognition, contraction, emanation, concealing, repair, return) until each has a canonical visual form.

**Phase 4:** Export pipeline. Once the language is stable, build Blender/Skia backends that reproduce the canonical scenes at production quality.

## Consequences

- Skia Canvas is not abandoned — it becomes the 2D export path
- The renderer is definitively commodity; the sandbox + discovered language is the IP
- No GPU rental needed during development (browser GPU is sufficient)
- The visual language evolves through experimentation, not specification
- Risk is massively reduced: validate a scene in seconds before committing to a production render

## Related

- ADR 0003: Renderer-agnostic architecture (amended — sandbox replaces Skia as primary dev environment)
- ADR 0004: Visual Director layer (the sandbox is where the Visual Director works)
- ADR 0001: Semantic-first (operators are canonical, remain unchanged)
