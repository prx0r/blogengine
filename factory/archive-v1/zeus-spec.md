# Zeus — Bulletproof Platinum Validator

## Core Principle

Zeus does not check whether a video EXISTS. It checks whether a video is WORTHY of the platinum label by comparing against known-good packs at every layer: files, structure, semantics, visuals, and code.

---

## Phase 1: Pack Structure Match (does the output look like a platinum pack?)

Zeus compares the output directory's file list against the platinum reference packs. Any deviation — missing file, extra file, wrong naming — is flagged.

### Platinum pack must-haves:

| File | Purpose | Required? |
|------|---------|-----------|
| `storyboard.json` | Per-shot data with EXACT platinum field names | ✅ HARD |
| `visual_program.json` | Continuity systems, entities, operators, palette | ✅ HARD |
| `PRODUCTION_BLUEPRINT.md` | Constraints, chapters, format specs | ✅ HARD |
| `narration_script.txt` | Clean narration | ✅ HARD |
| `source_essay.md` | Original essay | ✅ HARD |
| `alignment_report.json` | Per-shot AV sync | ✅ HARD |
| `render_*.py` or `render_pack.py` | The actual render code | ✅ HARD |
| `scenes/*.mp4` | Individual per-shot clips | ✅ HARD |
| `contact_sheet.jpg` | Sampled frames | ✅ HARD |
| Shots in `scenes/` match storyboard | Every shot in storyboard has a matching MP4 | ✅ HARD |

**Check:** `diff <(ls scenes/*.mp4 | sed 's/.mp4//') <(jq '.[].shot_id' storyboard.json)`

---

## Phase 2: Storyboard Field Validation (exact platinum format match)

Zeus reads `storyboard.json` and checks that every shot has ALL the fields from the platinum format. No extra fields. No missing fields.

### Required fields per shot (from platinum example):

```json
{
  "shot_id": 1,
  "start": 0.0,
  "end": 5.15,
  "duration": 5.15,
  "raw_audio_duration": 3.889,
  "spoken_passage": "...",
  "chapter": "I. Chapter Name",
  "visual_mode": "concrete_noun_phrase",
  "visual_mechanism": "What the viewer literally sees — one complete sentence",
  "continuity_object": "What persists from previous shot",
  "transition": "motif-preserving dissolve or motion handoff",
  "caption_restriction": "Rule about captions",
  "first_in_chapter": true
}
```

**Check:** Every shot has all fields. No field is empty. `visual_mechanism` is a full sentence (≥5 words), not just the mode name repeated.

---

## Phase 3: Visual Breakdown — The YES/NO Test (MOST IMPORTANT)

For every shot, Zeus classifies the visual as YES (genuinely represents the concept) or NO (merely decorates the narration).

### YES criteria:
- The visual is a CONCEPT DIAGRAM — it shows the RELATIONSHIP or TRANSFORMATION the narration describes
- The visual would make sense WITHOUT the narration (you could guess the topic from the image alone)
- The motif name is a CONCRETE NOUN (bishop_codex, watching_stones, earth_water)
- The `visual_mechanism` describes what the viewer literally sees, not an abstract concept

### NO criteria:
- The visual is a GENERIC SHAPE (dot, circle, ring, abstract glow) with no semantic connection
- The motif name is an ABSTRACT CATEGORY (consciousness_systems, body_surface, witness_center)
- You would need the narration to understand what the visual means
- The visual could be swapped into a different essay without changing anything

### How Zeus decides:

```python
# Hard NO keywords in motif names (abstract categories, not concrete images)
ABSTRACT_KEYWORDS = [
    "system", "concept", "process", "center", "surface", "thought",
    "witness", "consciousness", "awareness", "experience", "state",
    "level", "stage", "phase", "aspect", "dimension", "nature",
    "essence", "quality", "capacity", "power", "principle"
]

# Concrete NOUN patterns (you can picture these)
CONCRETE_PATTERNS = [
    "door", "wheel", "eye", "hand", "face", "star", "stone", "seed",
    "flower", "ladder", "bridge", "door", "window", "gate", "thread",
    "rope", "knot", "net", "web", "veil", "mask", "crown", "throne",
    "sword", "shield", "cup", "vessel", "forge", "anvil", "bell",
    "drum", "mirror", "lamp", "candle", "flame", "river", "wave",
    "ocean", "stone", "crystal", "gem", "lapis", "gold", "silver",
    "copper", "iron", "salt", "sulphur", "mercury", "codex", "scroll",
    "page", "book", "seal", "compass", "axis", "sphere", "cube"
]
```

**Check:** For every shot: motif name is in CONCRETE_PATTERNS OR has a concrete noun? If neither, FAIL with "Abstract motif name — cannot picture this."

---

## Phase 4: PIL Code Inspection (what does the renderer ACTUALLY draw?)

Zeus reads the `render_*.py` file and analyzes the actual PIL drawing code for each motif. It checks whether the code matches the storyboard's `visual_mechanism` description.

### What Zeus looks for:

```python
# For a motif named "threshold_door" with mechanism "A vertical aperture opens between dark and light"
# Zeus checks that the PIL function contains:
# - A rectangular or arched shape (the door/aperture)
# - Two distinct color regions (dark below, light above)
# - Some animation over time (the opening)

# If instead the function just draws:
d.ellipse((cx-6, cy-6, cx+6, cy+6), fill=GOLD)
# Zeus says: FAIL — PIL code doesn't implement a door. It draws a dot.
```

### Drawing primitive audit:

| Primitive | What it CAN represent | What it CANNOT represent alone |
|-----------|----------------------|-------------------------------|
| `dot()` | A point, seed, star, bindu | A door, a wheel, a face, a ladder |
| `ring()` | A field, boundary, circle | A door, a bridge, an axis, a figure |
| `line()` | An axis, connection, division | A vessel, a face, a door, a flower |
| `ellipse()` | An eye, a face, a vessel, a seed | A wheel with spokes, a cascade, a lattice |
| `rectangle()` | A door, a page, a frame | A mandala, a wave, a flow |
| `polygon()` | A crystal, a prism, a star | A spiral, a pulse, a breathing form |
| `arc()` | An aperture, a bridge, an eye | A tetrahedron, a network, a seed |

**Check:** Each motif's PIL function must use primitives that CAN represent what the storyboard claims. A "wheel" that only uses `dot()` is FAIL. A "wheel" that uses `line()` for spokes + `ring()` for rim is PASS.

---

## Phase 5: Visual-Only Comprehension Test (can you understand without words?)

Zeus simulates a "mute test" — it reads ONLY the motif names and visual_mechanism descriptions (no narration text) and tries to understand what the film is about.

```
Storyboard without narration:
  shot_001: bishop_codex — "A robed figure writing in an illuminated manuscript"
  shot_002: inner_lattice — "A translucent crystal lattice inside a stone outline"
  shot_003: watching_stones — "Stone forms with eye-like markings"
  shot_004: earth_water — "Two elemental fields converging at a boundary"

Zeus asks: "What is this film about?"
Expected answer: "Something about stones, medieval knowledge, and elemental formation"
Actual from our outputs:
  shot_001: pulse_center — "Dot with pulsing rings"
  shot_002: pulse_field — "Dots in a field"  
  shot_003: six_fold — "Six names radiating"
  
Zeus asks: "What is this film about?"
Answer: "I have no idea — it's dots and rings"
→ FAIL
```

**Check:** Zeus reads the first 10 `visual_mechanism` descriptions and tries to infer the essay topic. If it can't, the shots lack explanatory power.

---

## Phase 6: Gold Standard Benchmarking (comparison against known-good packs)

Zeus maintains a registry of approved gold outputs and their metrics:

| Metric | Stones | Earth | Corbin | Path | Ours | Verdict |
|--------|--------|-------|--------|------|------|---------|
| Shots | 106 | 75 | 102 | 109 | 52 | 🔴 Below all golds |
| Avg shot | 6.6s | 6.1s | 6.3s | 6.1s | 7.0s | 🟡 Acceptable |
| Motif count | 36 | 45 | 43 | 41 | 4 | 🔴 Far below |
| Chapter interleaving | ✅ | ✅ | ✅ | ✅ | ❌ | 🔴 Not done |
| Continuity % | 100% | 100% | 100% | 100% | 0% | 🔴 Missing |
| Shot range tightness | 5.2-9.4 | 5.2-9.4 | 5.2-9.4 | 5.2-9.4 | 4.0-16.6 | 🔴 Too loose |

**Check:** Zeus compares output metrics against the gold registry. If the output is outside the range of ALL known gold packs, it's a FAIL.

---

## Phase 7: LLM Semantic Critique (the 7 questions, properly prompted)

Zeus constructs a prompt for each of the 7 self-critique questions and sends it to an LLM (or Hermes itself):

```
Q1: "Here are the first 5 shot visual_mechanism descriptions from a video:
[mechanism_1]
[mechanism_2]
[mechanism_3]
[mechanism_4]
[mechanism_5]

Do these 5 shots each present a visually different concept, or do any two
look like they'd produce the same or similar visual? Answer ONLY 'PASS' if
all 5 are distinctly different, or 'FAIL' with the shot numbers that are similar."
```

```
Q3 (no-narration test):
"Here are the motif names and visual_mechanism descriptions for the first 10 shots
of a film. WITHOUT knowing the narration text, can you tell what this film is about?
If yes, summarize. If no, say 'INDISTINGUISHABLE'."

[shot data without spoken_passage]
```

This catches semantic issues that deterministic checks can't.

---

## Phase 8: Cross-Pack Inheritance Check

Zeus checks that the new pack learns from previous ones. If the new pack has the same motiff as a previously analyzed pack, Zeus checks whether the NEW pack's implementation is better.

```
Previous pack (you-are-made-of-light): motif "pulse_center" → just a gold dot
Current pack (hermes-platinum-v2): motif "pulse_center" → still just a gold dot
Zeus: "FAIL — no improvement over previous pack. The motif 'pulse_center' was already 
criticized as generic in the previous output and hasn't been improved."
```

This prevents Hermes from making the same mistakes across iterations.

---

## Zeus Scoring System

| Phase | What | Weight | Passing Score |
|-------|------|--------|---------------|
| 1 | Pack Structure | HARD | Must pass |
| 2 | Storyboard Fields | HARD | Must pass |
| 3 | YES/NO Visual Test | 30% | ≥70% YES |
| 4 | PIL Code Inspection | 20% | ≥80% match |
| 5 | Visual-Only Comprehension | 15% | Can infer topic |
| 6 | Gold Benchmarking | 15% | Within gold range |
| 7 | LLM Self-Critique | 10% | 7/7 PASS |
| 8 | Cross-Pack Improvement | 10% | Better than last |

**Overall:**
- GOLD: ≥85%
- SILVER: ≥65%
- BRONZE: ≥45%
- FAIL: <45% OR any HARD gate fails

---

## What Zeus Does NOT Check (delegated to Hermes)

Zeus doesn't validate color semantics, font choices, or animation easing curves. Those are style decisions that vary by essay. Zeus validates STRUCTURE, SEMANTICS, and COMPREHENSION — the things that make a video platinum vs mediocre.

---

## Implementation Priority

1. **Phase 1-2: Pack structure + field validation** — straightforward, high impact ✅ (done in v1)
2. **Phase 3: YES/NO visual test** — the most important check, catches the core problem
3. **Phase 6: Gold benchmarking** — compare metrics against known-good packs
4. **Phase 4: PIL code inspection** — checks that code matches storyboard claims
5. **Phase 7: LLM critique** — the 7 questions as LLM prompts
6. **Phase 5: Visual-only comprehension** — can the storyboard speak for itself?
7. **Phase 8: Cross-pack improvement** — prevents stagnation

---

## Usage

```bash
# Full judgment
hermes -z "Call mcp__zeus__zeus_judge with output_dir='...'"

# Visual-only test (Phase 3+5 only, fast)
hermes -z "Call mcp__zeus__zeus_visual_test with output_dir='...'"

# Compare against gold packs
hermes -z "Call mcp__zeus__zeus_benchmark with output_dir='...'"

# Track improvement over previous version
hermes -z "Call mcp__zeus__zeus_track with output_dir='...' previous_dir='...'"
```
