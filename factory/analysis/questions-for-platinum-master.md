# 5 Problems for Platinum Master

## Problem 1: Storyboard Designer Ignores Visual Director's Material Choices

The Visual Director correctly picks "manuscript page becoming world" with
vellum/ink/gold leaf from the Gold Bible. But the Storyboard Designer
ignores those choices and generates generic shots (lantern, room,
cross-section) instead.

The prompt embeds the visual thesis by reference
(artifacts['visual_thesis.json']) which is a large JSON blob. The LLM
treats it as optional context.

How do we force the Storyboard Designer to anchor on the exact
materials/spaces/verbs from the Visual Director? Should we extract a
compact "constraints" block from the thesis and concatenate it directly
into the storyboard prompt?

---

## Problem 2: PIL Scene Writer Doesn't Use the Thesis Palette

Generated PIL code uses arbitrary RGB tuples like (150,75,0) instead of
the Gold Bible hex values (#D4A574 gold, #F0E8D5 parchment).

The prompt says "Uses colors from visual thesis palette" as a bullet
point, not a hard constraint. The hex values are buried in the visual
thesis JSON that the LLM treats as secondary context.

Should we inject the exact hex values as explicit Python constants at
the top of every generated script? Or is there a better pattern to force
palette compliance?

---

## Problem 3: No Structural Shot-Count Floor for Long Essays

A 20-word essay correctly gets 10 shots (minimum floor). But a 789-word
essay (315s audio) previously got 3 shots. The hard validator catches it
but only after the LLM call — we waste $0.002 and 20s on a bad
generation.

Should we require explicit chapter grouping with minimum shots per
chapter (6-12 each), or is the flat array + hard validator sufficient?

---

## Problem 4: Zeus Amplifier Is Structurally Blind

Zeus runs as a text-only Workers AI model. It reviews storyboard JSON
and code_review JSON but cannot see rendered frames. Every verdict will
be "pass" because it has no visual information to critique.

Should Zeus be replaced with deterministic checks (shot count, palette
enforcement, function signature validation)? Or should we route to a
vision-capable model — and if so, how do we get rendered frames into the
Worker pipeline?

---

## Problem 5: No Chapter Batching in Storyboard

The prompt outputs a flat shot array. Each of the 10+ shots is generated
in one LLM call with no chapter-level structure. The shots lack
coherent thematic arcs.

Should we restore chapter batching (each /advance call generates 4-8
shots for one chapter, requiring multiple advances to complete the
storyboard)? This would require stateful stage iteration or multiple
chapter stages.
