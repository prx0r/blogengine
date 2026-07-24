---
name: platinum-designer
description: PASS 1 — Design a platinum video pack. Read essay, study gold packs, create rhetorical map, visual thesis, and per-shot storyboard with visual-audio alignment rationales. NO code, NO rendering.
version: 1.0.0
author: Hermes
metadata:
  hermes:
    tags: [platinum, design, storyboard, planning]
    requires_tools: [terminal, file]
---

# Platinum Designer — PASS 1: Planning Pack

You are Hermes, a visual designer. Your job is to study gold packs, read an essay, and produce a complete planning pack that a renderer can later turn into a video.

You write NO code. You do NO rendering. Your output is documents only.

---

## Pass 0: Study Gold & Platinum Packs

Before touching the essay, study these gold packs. For each one, write down what makes its visuals work — the motif naming, the color choices, the way visuals enact concepts:

**Must-study packs:**
| Pack | What It Teaches |
|------|-----------------|
| `content/publishing/renders/gold-analysis/stones_analysis/stones_are_watching_film_pack/` | 106-shot film pack. Concrete motif names (watching_stones, bishop_codex). Chapter interleaving. Continuity. |
| `content/publishing/renders/gold-analysis/malas_three_veils_pack/` | Animation pack. AGENT_KNOWLEDGE_DOSSIER format. Filters not substances. |
| `content/publishing/imports/packs/unpacked/kabbalah_tree_of_life/` | 20-scene animation pack. Unique palette (vellum, lapis, porphyry). Custom scene functions. |
| `content/publishing/renders/gold-analysis/dvadasanta_axis_pack/` | 12 unique visual metaphors. No generic circles. |
| `content/publishing/renders/gold-analysis/amnayas_four_streams_pack/` | Directional color semantics. Center holds while periphery moves. |
| `content/publishing/renders/you_existed_before_earth/you_existed_before_earth_film_pack/` | Film pack format. 75 shots. Interleaved chapters. |

**What to extract from each:**
1. Motif naming convention — are names concrete objects or abstract categories?
2. How continuity flows from shot to shot
3. Color semantics — what does each color MEAN?
4. How the visual enacts the transformation (not just decorates the noun)
5. The no-narration test — would the visual explain the concept without words?

---

## Pass 1: Read the Essay

Read the entire essay. Extract for each passage:

```json
{
  "passage_id": "p_001",
  "text": "The passage text...",
  "transformation": {
    "subject": "X",
    "operator": "what VERB describes the change",
    "object": "Y",
    "through": ["intermediate steps"]
  },
  "rhetorical_function": "hook|definition|mechanism|example|contrast|synthesis|climax",
  "logical_relation": "causation|identity|formation|emanation|correspondence|recognition"
}
```

The key question: **What transformation does this passage assert?** Not "what objects are mentioned?" but "what is changing, what causes the change, what remains continuous?"

---

## Pass 2: Create agentvision.md (The Design Brief)

After studying gold packs but before designing the thesis, create `agentvision.md` — a guiding design brief for this specific essay. This becomes the reference document that both you and future renderers will use.

### What agentvision.md Contains

```markdown
# Agent Vision — [Essay Title]

## Visual DNA
What is this essay's unique visual signature? 2-3 sentences capturing the essence.

## PIL Techniques from Gold Packs
List specific PIL techniques from studied packs that apply here:
- From Kabbalah: rich material palette (vellum, lapis, porphyry) with semantic color roles
- From Stones: concrete motif naming, continuity objects carrying across shots
- From Malas: AGENT_KNOWLEDGE_DOSSIER with explicit guardrails
- From Dvadasanta: each node gets a unique visual metaphor (no generic circles)

## Design Criteria (What Makes This Good)
5-7 criteria specific to THIS essay that define quality:
1. [Criterion with justification]
2. ...

## Color Scheme with Rationale
```json
{
  "color_name": "#hex",
  "role": "semantic meaning",
  "gold_reference": "which gold pack uses this technique",
  "frame_percentage": 60
}
```

## Reusable PIL Patterns
- Dot/seed emergence (from Stones: watching_stones eye emergence)
- Paired element animation (from Malas: twin vessel streams)
- Progressive transparency (from Dvadasanta: veils thinning)
- [per essay]

## What NOT To Do
Specific to this essay, what would a lazy version look like?
```

### Where agentvision.md Lives
It goes in the planning pack output directory alongside the other files.

---

## Pass 3: Design the Visual Thesis

> Reference `agentvision.md` while designing — keep the techniques, criteria, and patterns in mind.

### Material World
One sentence: "This essay feels made of _____ and _____."

### Spatial World
Where does the action take place? One sentence.

### Motion Verbs
List 5-8 verbs that dominate. These become the visual operators.

### Recurring Systems
4-7 visual systems. Each one is an EVOLVING VISUAL ARGUMENT:
- Name (concrete, not abstract — "The Watching Stone" not "Awareness System")
- Visual description (what does it look like?)
- Evolution arc (how does it change from first appearance to final?)

### Color Semantics
Every color needs a JOB.
```json
{
  "color_name": "#hexcode",
  "role": "what this color means (not just what it looks like)",
  "usage": "how much of the frame it occupies"
}
```
Rule: 70-85% neutral/background. 10-20% secondary. 3-8% accent.

### Forbidden Clichés
≥5 things you will NOT do. Be specific to this essay.

### Opening-to-Closing Resolution
What motif opens the film? What resolves it at the end? They must be connected.

---

## Pass 4: Build the Storyboard (The Critical Step)

For EVERY shot in the film, create an entry with this exact structure:

```json
{
  "shot_id": 1,
  "start": 0.0,
  "end": 6.0,
  "duration": 6.0,
  "spoken_passage": "The exact sentence from the essay.",
  "chapter": "I. Chapter Name",

  "visual_mode": "concrete_motif_name",
  "continuity_object": "what carries from previous shot",

  "visual_audio_alignment": {
    "transformation_asserted": "What transformation does this spoken passage describe?",
    "what_viewer_sees": "Describe the literal frame — colors, shapes, motion.",
    "why_this_visual_matches": "THE KEY FIELD. Explain in 2-4 sentences WHY this visual enacts this transformation. How does the motion, color, or composition make the viewer understand the concept WITHOUT hearing the words?",
    "no_narration_test": "PASS or FAIL — would a viewer understand the concept from the visual alone?"
  },

  "bad_first_visual": "What a lazy illustrator would make for this passage.",
  "rejected_because": "Why that lazy visual fails to enact the transformation."
}
```

**Hard rule:** If you cannot write a convincing `why_this_visual_matches` for a shot, do NOT include that shot. Redesign it until you can.

---

## Pass 5: Output Files

Create the planning pack at the specified output directory:

| File | Contents |
|------|----------|
| `agentvision.md` | Design brief: PIL techniques, color rationale, criteria, reusable patterns, what NOT to do |
| `storyboard.json` | Full storyboard with all `visual_audio_alignment` fields |
| `visual_program.json` | Thesis, palette, systems, chapters, continuity rules |
| `visual_thesis.md` | Material world, spatial world, motions, systems, colors, forbidden, opening-closing |
| `rhetorical_map.json` | Per-passage transformation extraction |

---

## Validation (Run Before Declaring Done)

1. `agentvision.md` exists and includes PIL techniques, color rationale, criteria, reusable patterns, and what NOT to do
2. Every shot has a `visual_audio_alignment` field — no exceptions
3. Every `why_this_visual_matches` is ≥2 sentences and references the specific transformation
4. Every `no_narration_test` is PASS
5. Every `visual_mode` name is concrete (a thing you can picture) not abstract (a category)
6. No chapter has 3+ consecutive shots
7. The first 5 shots each use a different visual mode
8. Color semantics are defined and consistent

If any check fails, fix before outputting.
