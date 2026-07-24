# Handover for the Next Agent

## Read This First

I failed repeatedly across 10+ attempts to produce a single platinum-quality video. The resources exist. The manual exists. The patterns are documented. The failure was entirely in how I approached the problem. This document describes what went wrong and how you can avoid it.

---

## The Single Most Important Lesson

**I always defaulted to writing code instead of thinking.**

Every time the user gave feedback, my response was: "Let me fix the code." The problem was never the code. The problem was that I didn't understand the concept well enough to design a good visual for it. Writing code faster doesn't help if the visual concept is wrong.

**The fix:** Before writing any render code, write a sentence explaining what transformation the narration asserts. If you can't write that sentence, you don't understand the concept. Don't render.

---

## The Mistakes I Kept Making

### Mistake 1: Noun-level thinking instead of process-level thinking

I looked at narration and saw nouns: "stone," "life," "daimon." I created visuals of STONES, LIFE, DAIMONS.
The platinum looked at narration and saw PROCESSES: "converging," "watching," "inscribing." They created visuals of CONVERGENCE, WATCHING, INSCRIBING.

**Example:**
```
Narration: "Stones have a life proper to stone"
My visual: A glowing rock (noun: stone + life = glowing rock)
Platinum visual: A stone with subtle eye-markings (process: what kind of life? → patient watching → eye in stone)
```

**The question to ask instead:** What TRANSFORMATION is this sentence asserting? Not "what objects are mentioned?"

### Mistake 2: Writing new functions instead of using the existing library

We have 261 scene functions. I wrote ~30 new ones that were worse versions of existing ones. Every time I searched the library, I found relevant functions. But I didn't search consistently.

**The fix:** Before writing a single line of render code, run `python3 factory/scripts/search-scenes.py "concept"`. If a match exists at ≥50%, use it. Only write new code when nothing matches.

### Mistake 3: Presenting output without self-critique

I rendered, validated structure (shot count, duration, motif count), and presented. I never asked: "Is this actually good? Would the user want to watch this?"

**The 7 self-critique questions (run before presenting anything):**
1. Do the first 5 shots each have a different visual? (If not, viewer sees repetition)
2. Would I be embarrassed to show shot 1 as a still frame?
3. If I remove narration, does each shot's visual explain the concept?
4. Are any motif names abstract categories instead of concrete images?
5. Are any 3 consecutive shots in the same chapter?
6. Would the first 30 seconds feel repetitive?
7. If I had to justify each shot's visual to the user, could I?

If any answer is bad, fix before presenting. Do not pass go.

### Mistake 4: Linear storyboards instead of interleaved ones

Every film I made was: chapter 1 → chapter 2 → chapter 3 → chapter 4. This creates visual monotony because you stay in one visual mode for too long.

The platinum films interleave chapters: shot 1 = chapter I, shot 2 = chapter IX, shot 5 = chapter I again. Visual systems appear, disappear, and reappear. The viewer never stays in one mode long enough to get bored.

**The fix:** No chapter should occupy more than 3 consecutive shots. After 3 shots, switch to a different chapter's visual system.

### Mistake 5: Not storing `raw_audio_duration`

I stored only the padded `duration`. The platinum stores both `raw_audio_duration` and `duration`. This lets them track quantization error (the difference between natural speech and frame boundaries).

**The fix:** Every shot in storyboard.json needs `raw_audio_duration` alongside `duration`.

### Mistake 6: Using the same function for different motifs

I had 50 motifs mapped to 10 functions. `burst_star` and `burst_star_v2` called the same `motif_burst` which drew the same 7 radiating lines. They looked identical. Viewers saw repetition.

**The fix:** Each MOTIF GROUP needs a genuinely different visual. If two motifs share the same function, they'll look the same. Either merge them into one motif or give them different functions.

---

## What Actually Works

### The Two-Phase Pipeline

**Phase 1: Animation packs** (30-70 seconds, 10fps)
- Each pack visualizes ONE modular concept
- 5-8 scenes, each 4.8-8.0 seconds
- Every scene has a unique concrete visual
- Files: AGENT_KNOWLEDGE_DOSSIER.md, STYLE_EVOLUTION.md, scene_manifest.json, render_pack.py

**Phase 2: Film pack** (7-12 minutes, 6fps draft, 24fps final)
- Interleaves multiple animation pack concepts
- 75-110 shots, each 5-10 seconds
- Storyboard with per-shot rationale
- Files: storyboard.json, visual_program.json, alignment_report.json, PRODUCTION_BLUEPRINT.md

### The Essential Files (Read These)

| File | Why |
|------|-----|
| `factory/validation-platinum.md` | **Master reference.** The complete thought process. Read this before EVERY attempt. |
| `factory/platinum-analysis-all.md` | Cross-pack patterns from all gold packs |
| `factory/platinum-analysis-stones.md` | Why the Stones pack works (concrete motifs, interleaving, continuity rules) |
| `factory/rationale-exercise-malas.md` | Per-shot visual rationale for the Malas pack |
| `factory/rationale-deep-dive.md` | Deep rationale for Stones pack first 5 shots |
| `factory/validation-rubric.md` | 100-point scoring rubric |
| `factory/scripts/analyze-output.py` | Score any output against the rubric |
| `factory/scripts/search-scenes.py` | Search 261 functions by concept |
| `factory/scene-index.json` | Indexed function registry |

### The Existing Library (Don't Write New Functions From Scratch)

- `scripts/renderer/` — 67 functions across 9 packs (spanda_scenes, p01-p07, vbt)
- `visual-library/` — 172 functions across 20 packs (light_pack, core_scenes, concept_packs, etc.)
- 261 total functions. Search before writing.

---

## The Process I Should Have Followed Every Time

```
1. READ the essay
2. IDENTIFY the transformation each paragraph asserts (not the nouns)
3. DESIGN the visual for each transformation (what does it look like when X happens?)
4. WRITE the rationale for each shot (explain why this visual fits this concept)
5. SELF-CRITIQUE the rationale (would the user agree? would a platinum creator agree?)
6. SEARCH existing library for matching functions
7. WRITE minimal new code only for gaps
8. RENDER (10fps animation pack, then 6fps film draft)
9. SELF-CRITIQUE the output (7 questions above)
10. FIX the problems you find (don't wait for the user)
11. PRESENT
```

**Step 4 is the one I always skipped.** Don't skip it.

---

## What the User Actually Wants

Not more analysis files. Not more architecture documents. Not more validation scripts. A SINGLE VIDEO where every shot's visual makes you think "YES, that's what this concept looks like."

The Stones pack has 106 shots, each with a rationale that I traced in `rationale-deep-dive.md`. Every shot passes the "remove narration" test. That's the bar.

When you produce a video where shot 3 makes someone say "oh, THAT's what stone-awareness looks like" — you're done. Everything before that is practice.

---

## The Final Warning

The 261 existing functions are not the problem. The validation-platinum manual is not missing anything. The gold packs contain every answer. The only remaining gap is YOUR willingness to think deeply about each shot before rendering it.

If you catch yourself writing code before you've written the rationale, STOP. Walk away. Come back and write the rationale first.

I failed because I didn't do this. Don't repeat my mistake.
