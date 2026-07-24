# Platinum Creative System v1 — Simplified

## The Core Insight

> "Stop treating the 12 stages as 12 creative decisions."

Only **5 creative calls** are needed:
1. Beat Architect
2. Visual Director
3. Storyboard Designer
4. PIL Scene Writer
5. Zeus Amplifier

Everything else is deterministic (essay ingestion, audio estimate, shot-count, JSON validation, ffmpeg, contact sheets, R2).

---

## The Five Prompts

### Prompt 1 — Beat Architect
Identifies every transformation that must become visible. Not summary, not style, not visuals. Just: what exists before, what operation occurs, what exists after, what remains continuous. Hard validator: incomplete source coverage, vague operators, implausible total duration.

### Prompt 2 — Visual Director
Designs one coherent world from specific materials, surfaces, spaces. Uses the Gold Creative Bible. Rejects: LED, fog machine, neon, hologram, generic glowing orb, vague energy, abstract system names. Three candidates → human picks one.

### Prompt 3 — Storyboard Designer (per chapter)
Converts logical transformations into visible physical events. Every shot has: before-state, visible operation, after-state, continuity handoff, concrete motif, translation ladder. Hard checks: shot count, narration coverage, composition repetition, first-five diversity, continuity handoffs, drawable parts, animation phases.

### Prompt 4 — PIL Scene Writer
Generates only scene functions (not ffmpeg, not frame loops, not infrastructure). Receives runtime API reference. Each function: 15-40 lines, three+ temporal phases, visibly differs at u=0.15/0.50/0.85, mature frame at u=0.72 is display-worthy. Batches of 4-6, compile-checked, motion-verified.

### Prompt 5 — Zeus Amplifier
Receives actual rendered frames and motion strips. Answers: does the visual enact the claim? Is the motif concrete? Is the mature frame publishable? Does transformation read without narration? Rewrites weak scenes.

---

## What Makes a Strong Shot

```
spoken claim → logical relation → physical process → concrete material
→ visible operation → resolved image → continuity handoff
```

Example: "Two surfaces sharing one seam" — not "glowing sphere representing consciousness."

---

## What to Build Tomorrow

1. `GOLD-CREATIVE-BIBLE.json` — material grammar, spatial grammar, motion grammar, continuity patterns, quality tests
2. Stable `pil_runtime.py` — ✅ Done
3. Five prompt templates above
4. One 60-second gold-minute run — ✅ Done

## The Final Test

> "Does shot three make someone say, 'that is exactly what this concept looks like'?"
