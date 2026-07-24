# Creative Video Process

## Core Principle

**The visual IS the argument. The narration is overlay.**

Every shot must answer: "Would this communicate the concept without audio?" If the answer is no, the visual design has failed.

## The Process (Derived from Platinum Gold Packs)

### 1. Read the Essay for Process, Not Nouns

Read the essay three times:
- First: tone and material world
- Second: map every passage to its underlying PROCESS (not its nouns)
- Third: identify the visual VOCABULARY the essay itself suggests

**Example — "The Universe Has Two Assembly Lines":**
- "Nothing arrives finished" → EMPTINESS (not "cup, body, self")
- "A protein carries history" → CARRYING (not "protein, ritual")
- "Assembly index measures joins" → INDEXING (not "molecule, complexity")
- "The six paths" → PAIRING + TRIADING (not "varna, mantra, pada")

The process is the meaning. The noun is just the example.

### 2. Design the Visual Thesis First

Before writing any scene, define:

| Element | What | Example |
|---------|------|---------|
| Material world | What does the essay feel made of? | Parchment, ink, manuscript page |
| Spatial world | What space does it inhabit? | Two facing columns, codex gutter |
| Motion verbs | What kinds of motion dominate? | assemble, weave, compress, trace, split, converge |
| Recurring systems | 4-7 visual arguments that evolve | Two Streams, The Join, Six Paths, Compression, Reverse Engineering, The Witness |
| Color semantics | Fixed roles for each color | 70-85% neutral field, 10-20% secondary, 3-8% accent |
| Forbidden clichés | Explicit prohibitions | No galaxies, no particles, no mandalas, no decorative motion |

The visual thesis is the constraint system. Every shot must obey it.

### 3. Map Each Shot Through the Visual Translation Ladder

```
spoken words → proposition → relation → process → material metaphor → motion → resolved image
```

**Example:**
> Words: "Meaning is compressed assembly"
> Proposition: the finished object hides its construction
> Relation: expanded → compressed
> Process: branching structure folds inward
> Material metaphor: a manuscript map folding into itself
> Motion: fold, contract, concentrate
> Resolved: a dense point that was previously a tree

### 4. Write Custom Scene Functions — No Dispatch

Each shot gets its own function. No motif pools, no dispatch tables, no template matching.

**Gold pack pattern:**
```python
def sc01(t, u, idx):
    """Empty field — nothing arrives finished."""
    im = canvas()
    d = ImageDraw.Draw(im)
    # ... custom code for THIS SPECIFIC scene
    return im
```

**Key rules:**
- Each function is 15-40 lines of custom PIL code
- Every element has a reason — nothing is decorative
- The motion enacts the concept (folding = compression, appearing = emergence)
- Colors follow the thesis palette
- The composition changes per scene — no repeated layouts

### 5. Build a Custom Visual Vocabulary Per Essay

Each gold pack defines its OWN primitives. "A thing is not a dot" defines `symbol_o()` and `symbol_x()` — they only make sense for that essay.

**Our essay 1 vocabulary:**
- `dot(d, x, y, r, col)` — a material particle or mark
- `ring(d, x, y, r, col, w)` — a containment field
- `line(d, p1, p2, col, w, a)` — a connection or stream
- `glyph(d, x, y, type_id, scale, a)` — a semantic character
- `particle(d, x, y, r, col, a)` — a joining element

These are defined PER ESSAY, not shared across all essays.

### 6. Yantra-Inspired Geometry

From the yantra tradition (Hindu Tantric diagrams):
- Every line has a precise calculated position
- Circles, triangles, and petals are built through exact proportions
- The construction IS the ritual — the drawing process matters
- Intersection points are meaningful, not accidental

Apply this to the scene functions: place elements deliberately. A line should be exactly where it needs to be, not approximately. The geometry should feel inevitable.

### 7. Scene Design Checklist (from Gold Pack Analysis)

Each scene must:
- [ ] Enact one specific process from the essay
- [ ] Pass the no-narration test (communicate without audio)
- [ ] Use the thesis palette (70% neutral, 20% secondary, 10% accent)
- [ ] Have at least 3 visual elements (not sparse)
- [ ] Change significantly over its duration (not static)
- [ ] Flow from previous scene's final state
- [ ] Leave a state for the next scene to inherit

### 8. Iteration Loop

```
write scene → render frames → review contact sheet → 
check no-narration test → enrich sparse shots → 
compare to gold pack complexity → iterate
```

A shot that's 30K is probably too sparse. Gold pack shots average 100-600K. Target: 80K minimum per shot MP4.

### 9. File Structure (Gold Format)

Every finished pack must contain:

```
render_pack.py           # Hand-written scene functions
scene_manifest.json      # Per-scene metadata (title, duration, mode)
scene_catalog.json       # Cross-pack searchable scene index
AGENT_KNOWLEDGE_DOSSIER.md  # Visual rules and constraints
STYLE_EVOLUTION.md       # Visual inheritance from previous packs
validation.json          # FFprobe output (streams, duration)
contact_sheet.jpg        # Grid of all shot mid-frames
PRODUCTION_BLUEPRINT.md  # Production plan and visual thesis
visual_program.json      # Shape semantics and continuity rules
shots/*.mp4              # Per-shot video clips
```

The pipeline handles audio, assembly, and upload. The creative work is the render_pack.py.
