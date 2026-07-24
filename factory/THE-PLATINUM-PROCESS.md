# The Platinum Process — Hermes & Zeus Creative Pipeline

## Role

**Hermes is not a pipeline. Hermes is a visual designer.**

Zeus is not a validator. Zeus is an amplifier who has studied every gold pack and can elevate any scene to match them.

There are no scripts here. No dispatch tables. No motif pools. The gold packs are hand-crafted PIL code — each scene function 15-40 lines, written for that specific concept. That is the only approach that works.

---

## Phase 0: Hermes Studies Gold & Platinum

Before touching the essay, Hermes must study what makes the gold packs good.

### Gold Packs to Study

| Pack | Location | What It Teaches |
|------|----------|-----------------|
| Stones Are Watching | `content/publishing/renders/gold-analysis/stones_analysis/stones_are_watching_film_pack/` | Concrete motif names, interleaved chapters, 5 continuity rules, raw_audio_duration |
| You Existed Before Earth | `content/publishing/renders/you_existed_before_earth/you_existed_before_earth_film_pack/` | Full film pack format, 75 shots, interleaved chapters |
| Malas Three Veils | `content/publishing/renders/gold-analysis/malas_three_veils_pack/` | Animation pack format, AGENT_KNOWLEDGE_DOSSIER, filters not substances |
| Dvadasanta Axis | `content/publishing/renders/gold-analysis/dvadasanta_axis_pack/` | 12 unique visual metaphors, no generic circles |
| Amnayas Four Streams | `content/publishing/renders/gold-analysis/amnayas_four_streams_pack/` | Directional color semantics, center-holds-periphery-moves |

### What Hermes Looks For In Each Pack

For each gold pack, Hermes asks:

1. **Motif names** — Are they concrete or abstract? (bishop_codex vs "body_surface")
2. **Chapter interleaving** — How do they mix chapters to avoid visual monotony?
3. **Continuity** — What objects/elements carry from shot to shot?
4. **Visual thesis** — What is the material world? Spatial world? Motion verbs?
5. **Color semantics** — What does each color MEAN, not just look like?
6. **The no-narration test** — Would each shot's visual explain the concept without words?
7. **Forbidden clichés** — What do they explicitly avoid?
8. **Scene function structure** — How does the PIL code enact the concept? What primitives? What motion?

---

## Phase 1: Hermes Reads the Essay (Processes, Not Nouns)

Read the entire essay. For each passage, identify:

**What transformation does this sentence assert?**

Not: "What objects are mentioned?"
But: "What is changing? What causes the change? What remains continuous?"

Extract:
- **Processes** (verbs that describe transformations: crystallize, petrify, coagulate, reveal, engrave, converge)
- **Relations** (how things connect: correspondence, identity, causation, emanation, participation, recognition)
- **Entities** (what is being transformed: stone, seed, knowledge, elements, celestial forces)

---

## Phase 2: Design the Visual Thesis

Before writing a single line of PIL code, design:

### 2a. Material World
One sentence: "This essay feels made of _____ and _____."
(e.g., "stone and parchment" or "silver and fire" or "earth and water")

### 2b. Spatial World
Where does the action take place?
(e.g., "a medieval scriptorium that dissolves into a geological cross-section")

### 2c. Motion Verbs
List 5-8 verbs that dominate. These become the visual operators.
(e.g., crystallize, petrify, coagulate, reveal, engrave, converge, descend)

### 2d. Recurring Systems
4-7 systems. Each one is an EVOLVING VISUAL ARGUMENT — the same basic concept that changes across the film. Each system has:
- A name (concrete: "The Watching Stone", not abstract: "Awareness System")
- A visual description (what does it look like?)
- An evolution arc (how does it change from first appearance to final?)

### 2e. Color Semantics
Every color needs a JOB. Not just a hex code.

```
void: #1A1D23 — background, unformed matter (70% of frame)
gold: #D4A574 — celestial causality, formative power (15%)
crimson: #8D2C39 — life, attention, observation (8%)
lapis: #3B5998 — structure, order, fixed form (5%)
silver: #B8B8B8 — intermediary, reflection, the unfixed (2%)
```

Rule: 70-85% neutral/background. 10-20% secondary. 3-8% accent.

### 2f. Forbidden Clichés
List ≥5 things you will NOT do. Be specific to this essay.

---

## Phase 3: Build the Storyboard (with Visual Rationale)

For EVERY shot, write:

```json
{
  "shot_id": 1,
  "spoken_passage": "The exact sentence from the essay.",
  "chapter": "I. The Patient Life of Stone",
  
  "transformation": {
    "subject": "X",
    "operator": "the verb that describes what happens",
    "object": "Y",
    "through": ["intermediate steps"]
  },
  
  "visual_translation_ladder": {
    "proposition": "What the sentence asserts at the level of meaning",
    "relation": "What logical relation this enacts (causation? identity? correspondence?)",
    "process": "The actual transformation in abstract terms",
    "material_metaphor": "What physical/material process embodies this transformation",
    "motion": "What motion makes the relationship intuitively legible",
    "resolved_image": "What the viewer literally sees at the end of this shot"
  },
  
  "visual_design": {
    "motif_name": "bishop_codex",
    "what_viewer_sees": "An open medieval book with mineral illustrations emerging from the pages, the text transforming into stone diagrams before the viewer's eyes",
    "why_this_visual": "The bishop wrote a book. This IS a book. But we're not illustrating 'book' — we're showing knowledge becoming visible form, which is exactly what the essay's first sentence asserts: that a system of classification brought mineral knowledge into structured being.",
    "continuity_in": "what enters from the previous shot",
    "continuity_out": "what survives into the next shot",
    "primary_operator": "reveal",
    "forbidden": ["showing a medieval monk reading", "showing the book as static prop"]
  },
  
  "bad_first_visual": "What a lazy illustrator would make",
  "rejected_because": "Why that lazy visual is wrong",
  
  "no_narration_test": "Would a viewer understand the concept without hearing the words?"
}
```

### The Critical Field: `why_this_visual`

This is the entry box that forces Hermes to connect the visual to the words. If you can't write a compelling answer here, you don't understand the concept well enough to render it. Do not proceed.

---

## Phase 4: Write Custom PIL Scene Functions

No dispatch. No libraries. Every motif gets its own function.

### Function Template

```python
def scene_bishop_codex(t, u, idx):
    """[CONCEPT NAME] — [one-line description of what this visual enacts]
    
    What the viewer understands WITHOUT narration:
    - This is a book
    - The book is alive with mineral knowledge
    - Knowledge is taking visible form
    """
    im = canvas(DARK)
    d = ImageDraw.Draw(im)
    # Your drawing code here — every line has meaning
    return im
```

### Rules
- No dispatch tables. Call functions by name.
- No shared `render_for_motif()`. Each function IS the concept.
- 15-40 lines per function. If it's shorter, you haven't thought enough.
- Every line has a calculated position (yantra geometry).
- The function must pass the no-narration test: mute the audio, does the visual communicate?

### Shared Helpers (These Are OK)
From `scripts/renderer/renderer.py`:
- `canvas(bg)` — create a new frame with background color
- `dot(d, x, y, r, color)` — draw a dot
- `ring(d, x, y, r, color, width)` — draw a ring
- Colors from the palette defined in the visual thesis

These are shared infrastructure, not design. Everything else is hand-crafted per essay.

---

## Phase 5: The Pipeline (Production Only)

The pipeline does NOT design. It handles:
1. Edge TTS audio generation for each shot
2. Frame rendering (calling the hand-written functions from Phase 4)
3. MP4 assembly (ffmpeg concat)
4. Audio muxing
5. Platinum pack metadata (storyboard.json, visual_program.json, alignment_report.json, contact_sheet)
6. R2 upload
7. Factory worker API registration

The pipeline is at `scripts/renderer/renderer.py` + ffmpeg calls. It has no opinion about visual design.

---

## Phase 6: Zeus Amplifies

Zeus receives:
- The gold pack render scripts (from Phase 0 study)
- Hermes's new render script + essay
- The storyboard with rationales

Zeus does NOT run checklists. Zeus:
1. Reads each gold pack scene function and identifies what makes it beautiful
2. Reads Hermes's scene functions and compares
3. For EACH scene, asks: "Does this visual enact the concept? How could it be more precise, more beautiful, more semantically rich?"
4. REWRITES weak functions to gold standard
5. Outputs elevated render_pack.py

### Zeus's Challenge Questions (Per Scene)

1. **The first-5 test**: Do the first 5 shots each have a DIFFERENT visual mode? Would the viewer see variety or repetition?
2. **The still-frame test**: Would I be ashamed to show shot 1 as a still image at 72% of its duration?
3. **The no-narration test**: If I mute the audio, does this shot's visual explain the concept? Not just decorate it — EXPLAIN it.
4. **The concrete-names test**: Is the motif name a concrete image (bishop_codex, watching_stones) or an abstract category (body_surface, consciousness_state)?
5. **The consecutive test**: Are any 3+ consecutive shots in the same chapter?
6. **The first-30s test**: Would the first 30 seconds feel repetitive?
7. **The rationale test**: For each shot, does the `why_this_visual` field genuinely connect the visual to the transformation? Or is it post-hoc justification?

---

## The Complete Flow

```
HERMES:
  Phase 0: Study gold/platinum packs → internalize what makes them good
  Phase 1: Read essay → extract processes, relations, entities
  Phase 2: Design visual thesis → material world, spatial world, 
            motion verbs, 4-7 systems, color semantics, forbidden clichés
  Phase 3: Build storyboard → every shot has translation ladder + why_this_visual
  Phase 4: Write custom PIL functions → each function IS the concept
  Phase 5: Run pipeline → audio, render, assemble, metadata, upload

ZEUS:
  Phase 6: Study Hermes's output → compare against gold packs
           → critique each scene → rewrite weak ones → amplify to gold

OUTPUT:
  - render_pack.py (hand-crafted PIL functions)
  - storyboard.json (with rationales)
  - visual_program.json (thesis, palette, systems)
  - final.mp4 (with audio)
  - alignment_report.json
  - contact_sheet.jpg
  - AGENT_KNOWLEDGE_DOSSIER.md (per animation pack)
  - PRODUCTION_BLUEPRINT.md
  - README.md
```

---

## The Test

After Phase 4, before running the pipeline:

1. Read the `why_this_visual` for every shot. If any answer is unconvincing, redesign that shot.
2. Read every scene function. Does it pass the no-narration test? If you can't tell what concept it enacts without reading the docstring, rewrite it.
3. Show the first 5 shots to someone. Do they say "oh, THAT's what stone-awareness looks like"? If not, keep working.

The goal is not to produce a video. The goal is to produce a video where shot 3 makes someone say "that's exactly what this concept looks like." Everything before that is practice.
