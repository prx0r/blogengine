# Platinum Process — Compiled Production Protocol

> *Quality is currently advisory. Hermes can violate the process and still reach the renderer.*
>
> *Do not ask Hermes to behave like a disciplined studio. Build a studio around Hermes in which undisciplined work cannot advance.*

---

## 1. Replace skills with a state machine

Do not let Hermes decide which step comes next.

Create a controller that owns the sequence:

```
GOLD_STUDY
→ RHETORICAL_MAP
→ VISUAL_THESIS
→ MOTIF_MANUFACTURABILITY
→ STORYBOARD
→ STORYBOARD_REVIEW
→ RENDER_PLAN
→ CODE_REVIEW
→ DRAFT_RENDER
→ VISUAL_QC
→ FINAL_RENDER
```

Hermes may only write the artifact required by the current state.

The controller, not the agent, advances the job.

```python
class Stage(str, Enum):
    GOLD_STUDY = "gold_study"
    RHETORICAL_MAP = "rhetorical_map"
    VISUAL_THESIS = "visual_thesis"
    MOTIF_MANUFACTURABILITY = "motif_manufacturability"
    STORYBOARD = "storyboard"
    STORYBOARD_REVIEW = "storyboard_review"
    RENDER_PLAN = "render_plan"
    CODE_REVIEW = "code_review"
    DRAFT_RENDER = "draft_render"
    VISUAL_QC = "visual_qc"
    FINAL_RENDER = "final_render"
```

Each stage has:
- required inputs
- permitted outputs
- schema validator
- semantic validator
- minimum score
- explicit retry instructions

Hermes cannot create `render.py` while the job is in `VISUAL_THESIS`.

---

## 2. Make every artifact machine-rejectable

JSON schema checking that a field exists is insufficient. Structural and semantic gates are needed.

Storyboard validation should fail when:
- `visual_audio_alignment` is absent or vague
- motif names are abstract rather than drawable
- adjacent shots reuse the same composition
- more than 15% of shots rely on explanatory text
- a visual changes without enacting the narrated transformation
- scene complexity is implausible for 15-40 lines of PIL
- the same gold-pack scene structure has been copied

### Required shot schema

```json
{
  "shot_id": "s034",
  "spoken_text": "...",
  "duration_seconds": 5.4,

  "rhetorical_function": "demonstrate causal containment",
  "conceptual_transformation": {
    "before": "independent fragments",
    "operation": "bind into one dependency field",
    "after": "one coherent causal system"
  },

  "visual_audio_alignment": {
    "visual_event": "six fragments move under one enclosing contour",
    "word_or_phrase_trigger": "one causal system",
    "why_it_matches": "the visual performs unification rather than symbolising unity"
  },

  "concrete_motif": {
    "name": "porphyry hinge-array",
    "materials": ["porphyry", "gold wire", "vellum"],
    "drawable_parts": ["six plates", "central hinge", "radial wire"],
    "motion_verbs": ["separate", "pivot", "lock"],
    "estimated_scene_lines": 31
  },

  "composition": {
    "layout": "asymmetric radial",
    "dominant_region": "upper-left",
    "camera_behavior": "fixed",
    "negative_space_ratio": 0.46
  },

  "continuity": {
    "inherits": ["gold wire"],
    "transforms": "wire becomes enclosing contour",
    "hands_off": ["porphyry plate"]
  },

  "bad_first_visual": "six glowing circles joining",
  "rejected_because": "generic abstraction; does not distinguish causal containment from mere proximity",

  "no_narration_test": "The viewer sees separate plates becoming one articulated machine.",
  "text_required": false
}
```

A shot that says `"concrete_motif": "conversation-that-is-one"` must fail.

---

## 3. Add a manufacturability compiler before storyboard approval

Create a `motif_linter.py` that scores every motif 0-2 on:

1. **Concrete nouns** — can the motif be named as visible objects?
2. **Part inventory** — does it contain 2-8 drawable components?
3. **Motion verbs** — are there precise transformations?
4. **Material or rendering treatment** — ink, vellum, glass, smoke, etc.
5. **Spatial organisation** — radial, axial, nested, diagonal, etc.
6. **PIL feasibility** — can it be rendered with PIL primitives?
7. **Concept specificity** — would this motif be wrong for a different passage?
8. **No-text intelligibility** — does the transformation remain legible muted?

Minimum score: **12/16**.

---

## 4. Separate inspiration retrieval from structural copying

Hermes copies gold packs because you ask it to "study examples" but do not constrain what can be transferred.

Instead, first extract each gold pack into a `gold_signature.json` containing reusable principles but not scene sequences.

```json
{
  "pack": "Kabbalah Tree of Life",
  "transferable_principles": [
    "multi-phase easing",
    "material palette bound to metaphysical levels",
    "bezier paths reveal dependency",
    "foreground/background compositing",
    "asymmetry followed by axial resolution"
  ],
  "forbidden_to_copy": [
    "scene order",
    "motif names",
    "shot count",
    "chapter interleaving sequence",
    "exact palette",
    "transition order"
  ]
}
```

Full gold packs remain available only to the comparative critic, plagiarism detection, and the renderer's technique study.

---

## 5. Add structural plagiarism detection

**Shot-sequence similarity:** Represent every storyboard as a sequence of abstract shot labels. Compare against every gold pack using normalized edit distance.

**Motif overlap:** Embed motif names and descriptions. Reject when >25% of motifs nearest to one gold pack (warning) or >40% (fail).

**Chapter skeleton overlap:** Compare chapter count, shots per chapter, interleaving pattern, continuity-object sequence, opening/closing transformations.

---

## 6. Force visual thesis divergence before storyboarding

The designer should produce **three competing visual worlds**, not one.

Each proposal specifies material world, spatial world, motion grammar, dominant metaphor, limitations, clichés it risks, and why it fits this essay better than the others.

A critic selects or hybridizes them. This prevents the first plausible idea from becoming the whole film.

---

## 7. Replace motif-count metrics with transformation diversity

Track visual operations: reveal, occlude, bind, sever, fold, invert, pour, crystallise, branch, compress, rotate, recurse, dissolve, align, fracture, exchange, pulse, refract.

Target: 20+ distinct transformation verbs, no verb used in >12% of shots, no 3 consecutive shots with the same compositional grammar.

---

## 8. Require multi-phase animation plans

Every shot should include animation phases:

```json
{
  "animation_phases": [
    {"range": [0.00, 0.18], "action": "establish six disconnected plates", "easing": "ease_out_cubic"},
    {"range": [0.14, 0.52], "action": "gold hinges extend toward centre", "easing": "ease_in_out_sine", "stagger": 0.06},
    {"range": [0.46, 0.79], "action": "plates rotate into one articulated ring", "easing": "ease_out_back"},
    {"range": [0.76, 0.92], "action": "secondary filigree resolves", "easing": "ease_out_quart"},
    {"range": [0.90, 1.00], "action": "hold completed invariant", "easing": "linear"}
  ]
}
```

A shared easing library is infrastructure, not a prohibited template system.

---

## 9. Treat "no dispatch tables" precisely

Forbid: `MOTIF_RENDERERS[motif_name](...)` — encourages generic substitution.

Allow: shared geometry primitives, easing functions, compositing utilities, Bezier helpers, masking, glow approximations, texture generators, typography helpers, palette utilities.

Reusable craft primitives: good. Reusable semantic scenes: bad.

---

## 10. Add a renderer preflight before code generation

Zeus should first produce a `render_plan.json` listing function per shot, expected line count, PIL primitives, masks/layers, animation phases, semantic risk, reference technique, and text use. A static validator checks coverage, line estimates, layer diversity, and PIL operation variety before code generation begins.

---

## 11. Use adversarial agents, not self-review

- **Designer:** Goal — originality and conceptual fidelity
- **Manufacturability critic:** Goal — reject vague or impossible scenes
- **Gold-comparison critic:** Goal — find craft deficits and copied structures
- **Silent-film critic:** Goal — determine whether visuals communicate without narration
- **Zeus:** Goal — implement the approved design exactly
- **QC auditor:** Goal — fail the rendered output (prompted to locate violations, not provide balanced feedback)

---

## 12. Automate the no-narration test

Generate midpoint frame + 4-frame temporal strip + silent GIF for every shot. Give to a vision-capable critic WITHOUT narration text. Ask for inferred event, confidence, before/operation/after states. Compare inferred event with expected transformation.

A shot fails when: critic cannot identify before/operation/after, inferred event contradicts planned event, text is required, shot looks static, adjacent shots appear nearly identical.

---

## 13. Add image-similarity QC for repetition

Compute perceptual hash, edge-map similarity, dominant-layout descriptors, optical-flow magnitude for representative frames per shot.

Fail conditions: 3 consecutive shots with pHash similarity > 0.88, 5-shot window with mean edge-layout similarity > 0.82, motion magnitude below minimum in >20% of shots, same centroid/layout category repeated 4 times consecutively.

---

## 14. Add code-level sophistication metrics

Track per scene: layers, phases, easing calls, masks, alpha compositing, curved paths, texture operations, blur passes, coordinate-derived geometry, repeated literal constants, text calls.

Minimums for high-complexity scenes: 3+ animation phases, 3+ composited layers, 1+ mask/clipping operation, 1+ non-linear path, coordinates derived from scene dimensions, ≤1 explanatory text element.

---

## 15. Self-luminosity rendering technique

Pillow can represent self-luminosity through: dark surround, object-colored core, several blurred alpha layers, screen-like additive approximation, nearby forms lit by the source, absence of directional external shadows, delayed emergence of visible contours.

Animate the environment's visibility as dependent on the emitted field. That visually means: this object is the condition under which nearby forms become manifest.

---

## 16. Introduce a novelty budget

- Familiar continuity systems: 30%
- Transformed continuity systems: 40%
- One-off conceptual inventions: 30%

This prevents both chaos and repetitive motif reuse.

---

## 17. Require chapter-level visual evolution

Each chapter should change the visual world. The `agentvision.md` should contain a style-evolution table mapping each chapter to its spatial model, material emphasis, motion grammar, and complexity level.

---

## 18. Change the designer prompt from "create scenes" to "solve visual problems"

For each passage, the designer must answer:

- What changes conceptually?
- What must the viewer distinguish?
- What false interpretation must be prevented?
- What physical process has the same relational structure?
- What visible before-state corresponds to the prior belief?
- What operation destroys or transforms it?
- What visible after-state corresponds to the insight?
- What continuity object can carry into the next shot?

Sequence: argument → transformation → physical analogy → composition → motif. Never: argument → motif name.

---

## 19. Make retries local

Store approval at shot level. Only failed shots return to the designer. This reduces drift and prevents good work from being lost.

---

## 20. The production controller

```python
def run_platinum_job(job_id: str) -> None:
    job = load_job(job_id)

    enforce_stage(job, Stage.GOLD_STUDY)
    validate_gold_signatures(job)
    advance(job)

    enforce_stage(job, Stage.RHETORICAL_MAP)
    validate_rhetorical_map(job)
    advance(job)

    enforce_stage(job, Stage.VISUAL_THESIS)
    validate_candidate_worlds(job)
    validate_style_evolution(job)
    advance(job)

    enforce_stage(job, Stage.MOTIF_MANUFACTURABILITY)
    validate_all_motifs(job, minimum_score=12)
    advance(job)

    enforce_stage(job, Stage.STORYBOARD)
    validate_storyboard_schema(job)
    validate_transformation_diversity(job)
    validate_text_usage(job)
    detect_gold_copying(job)
    advance(job)

    enforce_stage(job, Stage.STORYBOARD_REVIEW)
    run_adversarial_critics(job)
    require_all_shots_approved(job)
    advance(job)

    enforce_stage(job, Stage.RENDER_PLAN)
    validate_render_plan(job)
    advance(job)

    enforce_stage(job, Stage.CODE_REVIEW)
    inspect_scene_functions(job)
    detect_dispatch_tables(job)
    validate_animation_phase_count(job)
    advance(job)

    enforce_stage(job, Stage.DRAFT_RENDER)
    render_low_resolution_preview(job)
    advance(job)

    enforce_stage(job, Stage.VISUAL_QC)
    run_similarity_qc(job)
    run_silent_film_qc(job)
    run_motion_qc(job)
    require_qc_pass(job)
    advance(job)

    enforce_stage(job, Stage.FINAL_RENDER)
    render_final(job)
```

## Priority order

1. External state machine so Hermes cannot skip stages
2. Manufacturability gate before storyboard approval
3. Gold signatures instead of raw gold storyboards during design
4. Plagiarism detection across shot sequence, motifs, and chapter skeleton
5. Multi-phase animation plan per shot
6. Adversarial silent-film and repetition QC on rendered previews
7. Local retry system for only the failed shots
8. Shared craft primitives, but no shared semantic scene renderers

> *Do not ask Hermes to behave like a disciplined studio. Build a studio around Hermes in which undisciplined work cannot advance.*
>
> *Your two-agent split is correct. The missing layer is a deterministic producer and quality-control system above both agents.*
