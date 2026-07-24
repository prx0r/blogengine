---
name: produce-platinum-video
description: 5-pass deterministic video production. Each pass has binary validation gates. Failure at any gate means redo the pass. Max 3 retries per pass.
version: 6.0.0
author: Thomas Prior
metadata:
  hermes:
    tags: [factory, video, platinum, production, pipeline]
    requires_tools: [terminal, file, python]
---

# Produce Platinum Video — v6.0

This document is designed for an agent with ZERO prior knowledge of the codebase. Every file path, command, and validation is explicitly specified. Do not skip steps.

---

## Core Principle

> Do not illustrate the words. Identify the transformation asserted by the words, then make that transformation visible.

If you cannot answer "what transformation does this sentence describe?" you do not understand the concept well enough to render it. Do not render.

---

## Codebase Navigation (Read This First)

### Directory Structure
```
/root/projects/blog/
├── scripts/
│   ├── expansion-essay1.md through expansion-essay51.md  ← SOURCE ESSAYS
│   ├── renderer/
│   │   ├── renderer.py          ← Core PIL render engine (713 lines)
│   │   ├── spanda_scenes.py     ← 10 proven scene functions
│   │   ├── p01_reflection.py    ← 5 scene functions
│   │   ... (9 pack files, 67 functions)
│   └── generate-voiceover.mjs   ← Edge TTS voiceover generator
│
├── visual-library/              ← 172 additional scene functions (20 packs)
│   ├── light_pack.py
│   ├── core_scenes.py
│   ├── concept_packs.py
│   ... (20 files)
│
├── scene-system/
│   ├── catalog/scenes.json      ← 198 indexed scenes with concepts
│   └── concepts/                ← 263 semantic concept tags
│
├── factory/
│   ├── HEADER.md                ← Pipeline overview
│   ├── REFERENCE.md             ← Complete system reference
│   ├── validation-platinum.md   ← MASTER REFERENCE (must read)
│   ├── validation-rubric.md     ← Scoring rubric
│   ├── HANDOVER-FOR-NEXT-AGENT.md ← Mistakes to avoid
│   ├── PROGRESS.md              ← Iteration history
│   ├── platinum-analysis-all.md ← Cross-pack patterns
│   ├── rationale-deep-dive.md   ← Per-shot thinking examples
│   ├── rationale-exercise-malas.md ← Visual→concept mapping
│   ├── scripts/
│   │   ├── search-scenes.py     ← Search 261 functions by concept
│   │   ├── analyze-output.py    ← Score output against rubric
│   │   └── ralph-loop.sh       ← Auto-iteration manager
│   └── scene-index.json        ← Indexed function registry
│
├── hermes/skills/factory/produce-platinum-video/SKILL.md ← THIS FILE
│
├── content/publishing/
│   ├── renders/                 ← Rendered output goes here
│   └── voiceover/               ← Generated voiceover goes here
│
├── dashboard/server.py          ← Flask dashboard (for registration)
└── wrangler.jsonc               ← Cloudflare Worker config
```

### Key Files You Must Read Before Starting

| File | Why | What to Look For |
|------|-----|------------------|
| `factory/validation-platinum.md` | Complete thought process of the platinum creator | The 9-stage workflow, quality gates, prompts |
| `factory/rationale-deep-dive.md` | Shows correct per-shot thinking | Compare "my instinct" vs "platinum's choice" |
| `factory/rationale-exercise-malas.md` | Maps each PIL render function to its concept | How `sc03` (shrinking aperture) represents "constriction" |
| `factory/HANDOVER-FOR-NEXT-AGENT.md` | All the mistakes made before you | The 6 specific failure patterns |
| `factory/platinum-analysis-all.md` | Cross-pack patterns | Animation pack vs film pack two-tier system |
| `factory/search-scenes.py` | How to find existing functions | Usage: `python3 factory/scripts/search-scenes.py "concept"` |

### Platinum Reference Packs (Study These)

| Pack | Location | What It Teaches |
|------|----------|-----------------|
| You Existed Before the Earth | `renders/you_existed_before_earth/` | Full film pack format, 75 shots, interleaved chapters |
| Stones Are Watching | `renders/gold-analysis/stones_analysis/` | 106 shots, concrete motif names, continuity rules |
| Malas Three Veils | `renders/gold-analysis/malas_analysis/` | Animation pack format, AGENT_KNOWLEDGE_DOSSIER |
| Dvadasanta Axis | `renders/gold-analysis/dvadasanta_analysis/` | 12 unique visual metaphors (no generic circles!) |

---

## Pass 1: Concept Analysis + Rhetorical Map + Visual Thesis

**Goal:** Understand the essay at the PROCESS level, not the NOUN level. Build a rhetorical map of every passage. Design the visual world with 4-7 recurring systems.

### Step 1.0: Pick an Essay

```bash
# List available expansion essays
ls /root/projects/blog/scripts/expansion-essay*.md | wc -l
# Should show 51 essays (essay1 through essay51)

# Read an essay to understand it
cat /root/projects/blog/scripts/expansion-essayN.md
# Replace N with the essay number you want to work with
```

### Step 1.1: Create Project Directory

```bash
# Choose a short slug for this project (e.g., "daimon-threshold")
SLUG="your-project-slug"

# Create the project directory structure matching platinum format
BASE="/root/projects/blog/content/publishing/renders/$SLUG"
mkdir -p "$BASE/v1/scenes"
mkdir -p "$BASE/v1/audio_segments"
mkdir -p "$BASE/v1/thumbs"

echo "Project created at $BASE/v1"
```

### Step 1.2: Script Integrity — Clean Narration

```bash
# Source essay location
ESSAY="/root/projects/blog/scripts/expansion-essayN.md"
```

Create a clean narration script. Strip only: title markers (`# ` → keep the title TEXT), section separators (`---` → remove), blockquote markers (`>` → strip marker, keep text), emphasis markers (`*...*` → remove markers, keep text). PRESERVE EVERY SUBSTANTIVE SENTENCE INCLUDING THE TITLE.

```python
#!/usr/bin/env python3
"""clean_script.py — strip markdown, preserve every sentence."""
import re, sys

def clean_script(markdown: str) -> str:
    spoken_lines = []
    for line in markdown.splitlines():
        text = line.strip()
        if not text or text == "---":
            continue
        if text.startswith("# "):
            text = text[2:].strip()  # Strip '#' marker, KEEP title text
        if text.startswith(">"):
            text = text[1:].strip()  # Remove blockquote marker
        # Remove emphasis markers
        text = re.sub(r'\*([^*]+)\*', r'\1', text)
        spoken_lines.append(text)
    return "\n\n".join(spoken_lines)

# Read, clean, save
raw = open(sys.argv[1]).read()
clean = clean_script(raw)
out_path = sys.argv[2] if len(sys.argv) > 2 else "narration_script.txt"
open(out_path, "w").write(clean)

# Integrity report
orig_sentences = len(re.split(r'(?<=[.!?])\s+', raw))
clean_sentences = len(re.split(r'(?<=[.!?])\s+', clean))
print(f"Source sentences: {orig_sentences}")
print(f"Spoken sentences: {clean_sentences}")
print(f"Match: {'PASS' if orig_sentences == clean_sentences else 'FAIL — sentences may have been lost'}")
```

**Hard validation — ALL must pass. If ANY fails, Pass 1 TERMINATES. Do not proceed to Step 1.3.**
```bash
# Detect unauthorized additions: words in narration that aren't in source
diff <(grep -oE '\w+' scripts/expansion-essayN.md | sort -u) \
     <(grep -oE '\w+' narration_script.txt | sort -u) | grep '^>' || echo "No additions found"
```
- [ ] Source sentences == spoken sentences (must match exactly — 89/89, not 89/88)
- [ ] UNAUTHORIZED ADDITIONS == 0 (literally zero — detected by diff above)
- [ ] No paraphrasing (every spoken word is from the essay)
- [ ] Title text preserved (not deleted — detect by checking if title words appear in narration)
- [ ] If ANY of these fails: DELETE narration_script.txt, re-run Step 1.2 from scratch, re-validate. Do NOT proceed to Step 1.3 until all pass.

### Step 1.3: Per-Passage Rhetorical Map

Split the clean narration into paragraphs (separated by blank lines). For EVERY paragraph, extract a rhetorical map.

```json
{
  "passage_id": "p_001",
  "text": "The exact paragraph text...",
  "rhetorical_function": "mechanism",
  "logical_relation": "formation",
  "entities": ["entity_1", "entity_2", "entity_3"],
  "process": {
    "subject": "X",
    "operator": "forms",
    "object": "Y",
    "through": ["intermediate_a"]
  },
  "claim_type": "historical_metaphysical",
  "visual_priority": 3
}
```

**`rhetorical_function` choices (pick one):**
hook | definition | historical_context | mechanism | example | catalog | analogy | contrast | quotation | synthesis | climax | transition | conclusion

**`logical_relation` choices (pick one):**
identity | causation | formation | emanation | participation | correspondence | contrast | sequence | recursion | union_with_difference | dissolution | cooperation | transmutation | recognition

**`claim_type` choices:**
historical_metaphysical | doctrinal | poetic | analogical | narrative | prescriptive

**`visual_priority`:** 1 (background) to 5 (central concept)

**Validation:** Every passage has all fields filled. `process.operator` is a VERB (not a noun like "is" or "exists"). If your operator is "is" or "are", you haven't found the transformation — look harder.

### Step 1.4: Distinguish Modular Concepts

From the rhetorical map, identify 2-5 modular concepts. Each will become an animation pack.

**How to identify a modular concept:**
- It appears in multiple passages (rhetorical map shows it recurring)
- It has a clear visual metaphor (you can picture it)
- It can stand alone (someone could understand it without the full essay)
- It's concrete, not abstract — you must be able to PICTURE it from the name alone
- **PASS example:** "watching_stones" → you picture a stone with eye-like markings
- **PASS example:** "bishop_codex" → you picture a robed figure writing in a manuscript
- **PASS example:** "earth_water" → you picture two elemental fields converging
- **FAIL example:** "consciousness_systems" → you can't picture this; what does it look like?
- **FAIL example:** "body_surface" → you picture... skin? flesh? a diagram? too vague
- **FAIL example:** "witness_center" → what is a witness center supposed to look like?
- Rule: if you can't sketch it from the name, rename it

**Example from Stones pack:**
- Modular concept: "The watching stone" (stone with eye-like markings)
- Appears in paragraphs about stone-awareness, patient observation, the bishop's observing eye
- Visual metaphor: a mineral form with a natural eye-like marking
- Can stand alone: "stones that watch" is a coherent visual concept

### Step 1.5: Film-Level Visual Thesis

Define these 6 elements. Write them down. Do not proceed until all 6 are written.

**1. Material world:** What does this essay feel MADE OF?
```
Examples: stone, water, parchment, silver, porphyry, light, smoke, glass, gold leaf, ink, void, earth
```
Write one sentence: "This essay feels made of _____ and _____."

**2. Spatial world:** Where does the action take place?
```
Examples: flat manuscript page, interior chamber, cosmic field, body-axis, laboratory, landscape, temple, geological cross-section, dark void with center point
```
Write one sentence.

**3. Motion world:** The key verbs. List 5-8.
```
Examples: crystallize, unfold, overflow, engrave, weave, descend, mirror, ignite, dissolve, coagulate, align, pulse, ascend, radiate, converge, hold
```

**4. Recurring systems:** 4-7 systems. Each must be an EVOLVING VISUAL ARGUMENT — the same basic visual that changes across the film. Example from Stones pack:
```
System: "The watching stone"
Evolution: mineral eye → bishop's observing eye → eye-like gemstone powers → natural faces in onyx → unfinished human figure
This is NOT a repeated object. It's a CONCEPT that evolves through different forms.
```

**5. Color semantics:** Every color needs a job.
```json
{
  "void": "#0D1117",   // consciousness before content (70% of frame)
  "gold": "#D4A574",   // spanda, awareness, pulse (15%)
  "crimson": "#8D2C39", // life, intensity, organic throb (8%)
  "ink": "#E6E1DC",    // structure, names, thought (5%)
  "muted": "#918D84"   // secondary form (2%)
}
```
**Rule:** 70-85% neutral/background. 10-20% secondary. 3-8% accent. The accent only has power because it's rationed.

**6. Forbidden clichés:** List ≥5 things you will NOT do.
```
Examples (from actual platinum packs):
- Generic galaxy backgrounds
- Random decorative particles
- Unmotivated mandalas
- Meditation silhouettes
- Text that duplicates narration
- Constant center composition (every shot centered)
- Decorative motion without semantic function
- "Three dark veils" stacked as identical rectangles
- Treating all malas as interchangeable darkness
- Liberation shown only as explosive destruction
```

**Critical requirement:** The FINAL IMAGE must resolve a motif introduced near the BEGINNING. If you can't describe this, you don't have a complete film. Example: "The opening is a small dot. The closing is the same dot expanded to fill the frame."

### Step 1.6: Self-Critique + Gate Chain (Binary — ALL Must Pass)

**GATE CHAIN RULE:** Step 1.2 (Script Integrity) must have passed ALL its checks BEFORE you reached this step. If Step 1.2 failed any check, you are NOT ALLOWED to proceed here — go back to Step 1.2, DELETE the corrupted narration_script.txt, and regenerate from scratch.

**Run these checks in order. If ANY fails, STOP:**

```
# Gate Chain Check (must run FIRST)
[PASS/FAIL] Step 1.2 hard validations all passed (source sentences match, unauthorized_additions = 0, title preserved)

# Pass 1 self-critique
[PASS/FAIL] script_integrity.json shows "sentence_match": "PASS" (read the file, don't guess)
[PASS/FAIL] script_integrity.json shows unauthorized_additions is EMPTY (not even minor artifacts)
[PASS/FAIL] Every paragraph has a rhetorical_function and logical_relation
[PASS/FAIL] Every process has a subject-operator-object (operator is a verb)
[PASS/FAIL] 4-7 recurring systems defined (count them)
[PASS/FAIL] Final image resolves an opening motif (write both and compare)
[PASS/FAIL] ≥5 forbidden clichés listed
[PASS/FAIL] Each modular concept name evokes a concrete image (PASS example: "watching_stones" — FAIL example: "consciousness_systems")
[PASS/FAIL] Colors have semantic roles, not just aesthetic preferences
```

**If ANY of these fails, do not proceed to Pass 2.** The failure determines the action:
- Gate Chain fails → DELETE narration_script.txt, restart Step 1.2
- Script integrity fails → fix narration, re-run integrity check
- Everything else → redo the relevant step

**Only proceed to Pass 2 once ALL pass.**

---

## Pass 2: Shot Segmentation + Audio Probe + Per-Shot Semantics

**Goal:** Split narration into shots. Audio-probe every chunk. Iterative split/merge until all shots are 5-10s. Then write per-shot semantics.

### Step 2.1: Provisional Shot Segmentation

```python
import re
# Load clean narration
narration = open("narration_script.txt").read()

# Split at sentence boundaries
sentences = re.split(r'(?<=[.!?])\s+', narration)

# Further split long sentences (>20 words) at natural clause boundaries
shots = []
for s in sentences:
    s = s.strip()
    if not s or len(s.split()) < 3:
        continue
    if len(s.split()) > 20:
        # Split at conjunctions
        parts = re.split(r'(?:;\s|,\s*(?:and|but|the|when|where|which|that|because|for|if|however)\s)', s)
        for p in parts:
            p = p.strip()
            if p and len(p.split()) > 2:
                shots.append(p)
    else:
        shots.append(s)

# Never split these (HARD RULE):
# - article from noun ("the stone" → keep together)
# - auxiliary from verb ("has been" → keep together)
# - negation from proposition ("not about" → keep together)
# - comparison before its second term ("more than" → keep together)
# - quotation attribution from quotation when attribution is necessary

print(f"Provisional shots: {len(shots)}")
```

Save this list for the next step.

### Step 2.2: Generate Per-Shot Audio (CRITICAL — Timing Depends On This)

```bash
# Install edge-tts if not available
pip install edge-tts 2>/dev/null | tail -1
```

```python
#!/usr/bin/env python3
"""Generate WAV for each provisional shot and measure actual duration."""
import wave, os, asyncio

OUT = "/root/projects/blog/content/publishing/renders/YOUR_SLUG/v1"
SHOTS = ["Your shot text here..."]  # From Step 2.1

async def generate():
    import edge_tts
    for i, text in enumerate(SHOTS):
        path = f"{OUT}/s{i+1:03d}.wav"
        if not os.path.exists(path):
            await edge_tts.Communicate(text, "en-US-AriaNeural").save(path)
            print(f"  s{i+1:03d}: {len(text.split())} words")

asyncio.run(generate())

# Measure durations
durations = []
for i in range(len(SHOTS)):
    path = f"{OUT}/s{i+1:03d}.wav"
    if os.path.exists(path):
        # IMPORTANT: Edge TTS saves as MP3 despite .wav extension
        # Use ffprobe to measure duration, not wave module
        import subprocess
        r = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration',
            '-of', 'default=noprint_wrappers=1:nokey=1', path],
            capture_output=True, text=True, timeout=5)
        dur = float(r.stdout.strip()) if r.stdout.strip() else 5.0
        durations.append(dur)
    else:
        durations.append(len(SHOTS[i].split()) / 2.8)
    print(f"  s{i+1:03d}: {durations[-1]:.2f}s")
```

### Step 2.3: Iterative Split/Merge

After measuring actual durations:
- If shot > 10.5s: SPLIT at nearest punctuation, re-synthesize both halves
- If shot < 4.0s: MERGE with neighbor, re-synthesize combined chunk
- Repeat until ALL shots are 4.0-10.5s

```python
# After measuring, check ranges
for i, dur in enumerate(durations):
    if dur > 10.5:
        print(f"NEED SPLIT: s{i+1:03d} is {dur:.1f}s (max 10.5)")
    elif dur < 4.0:
        print(f"NEED MERGE: s{i+1:03d} is {dur:.1f}s (min 4.0)")
```

**Timing handles:** For each shot, also store:
- `raw_audio_duration`: the actual WAV duration (before padding)
- `duration`: the padded duration (rounded to frame boundary)
- pre_handle: 0.25s (silence before narration)
- post_handle: 0.25s (silence after narration)

**Validation after Step 2.3:**
```
[PASS/FAIL] All shots: 4.0s - 10.5s
[PASS/FAIL] raw_audio_duration recorded for every shot
[PASS/FAIL] Timing handles documented
```

### Step 2.4: Per-Shot Semantic Design (MANDATORY — Do Not Skip)

For EVERY shot, write the following. This is the most important step in the entire process.

```json
{
  "shot_id": 1,
  "spoken_passage": "exact spoken text from this shot",
  "rhetorical_function": "from Gate 1.2 rhetorical map",
  "process": {
    "subject": "X",
    "operator": "the verb that describes the transformation",
    "object": "Y"
  },
  "visual_thesis": "WHAT SHOULD THE VIEWER UNDERSTAND AFTER SEEING THIS? One sentence.",
  "continuity_in": "what visual element enters from the previous shot",
  "continuity_out": "what visual element survives into the next shot",
  "primary_operator": "reveal|crystallize|descend|ascend|mirror|dissolve|converge|radiate|hold",
  "secondary_operator": "optional — only if two motions happen",
  "required_entities": ["list of entities that MUST be visible"],
  "forbidden": ["list of things NOT to show in this shot"],
  "bad_first_visual": "what would a lazy illustrator make for this? Be honest.",
  "rejected_because": "why that lazy visual is wrong",
  "good_visual": "what actually shows the transformation"
}
```

**The visual translation ladder (apply to every shot):**
```
spoken words → proposition → relation → process → material metaphor → motion → resolved image
```

Example (from Stones pack shot 3):
```
Spoken: "He believed stones have life — not the life of plants or animals, but a life proper to stone"
Proposition: Stones have a unique kind of life
Relation: stone-awareness differs from biological life
Process: recognizing → a different mode of being
Material metaphor: stone with subtle eye-like marking (not a heartbeat)
Motion: the eye-marking becomes slightly more visible over time (you notice it gradually)
Resolved image: a stone that you suddenly realize is looking back at you
```

**Hard validation — REJECT any shot where:**
- It only depicts a noun (shows "stone" but not "stone's awareness")
- It would require the narration to explain what's happening visually
- The motion is decorative (not expressing the transformation)
- It has no final visual resolution (what does the viewer see at the end?)
- It abandons all continuity from the previous shot
- You can't explain why this visual fits (if you hesitate, redesign)

### Step 2.5: Interleave Chapters

Take the shot list from Step 2.4. Each shot belongs to a chapter (from Pass 1 visual thesis). Arrange them so that NO chapter occupies more than 3 consecutive shots.

**Good pattern (platinum):** A, B, C, A, D, B, E, C, A, F, D...
**Bad pattern (what I did):** A, A, A, A, B, B, B, B, C, C, C, C...

```python
# Check interleaving
chapters = [shot["chapter"] for shot in shots]
for i in range(len(chapters) - 2):
    if chapters[i] == chapters[i+1] == chapters[i+2]:
        print(f"WARNING: Chapter {chapters[i]} appears 3+ times at shots {i+1}-{i+3}")
```

**Validation:**
```
[PASS/FAIL] No chapter appears 3+ consecutive times
[PASS/FAIL] Each visual system appears in at least 3 different chapters
```

---

## Pass 3: Animation Pack Production

**Goal:** Build one animation pack per modular concept. Each pack: 30-70 seconds, 5-8 scenes, 10fps.

### Step 3.1: AGENT_KNOWLEDGE_DOSSIER

Create this file for each animation pack. It tells the renderer WHAT to draw and WHY.

```markdown
# AGENT KNOWLEDGE DOSSIER — [Pack Name]

## Aim
One sentence: what does this pack visualize?

## Textual orientation
Which part of the essay does this come from? Be specific.

## Visual rules (3-5 bullets, at least 1 "do not")
- [Concrete directive about what to show]
- [How each element should feel — emotional quality]
- [Do not show X — explicit rejection]
- [Color/material constraint]

## Guardrails (1-2 bullets)
- [What interpretation to prevent]
- [What NOT to imply — prevents harmful/simplistic readings]

## Style family
- Colors with semantic roles (e.g., "gold = formative causality")
- Materials (stone, water, light, parchment, etc.)
- Composition tendencies

## New motifs introduced
- motif_name_1: one-line description
- motif_name_2: one-line description
```

**Example (from Malas pack):**
```markdown
# AGENT KNOWLEDGE DOSSIER — Three Primary Veils

## Aim
Visualize the three malas as operational filters that constrict infinite consciousness.

## Visual rules
- The malas are filters, contractions, distortions — not demonic substances.
- Āṇava should feel like narrowing and insufficiency.
- Māyīya should feel like refraction or splitting.
- Kārma should feel recursive and action-bound.
- Liberation should render filters transparent, not destroy the world.

## Guardrails
- Do not flatten all three malas into one vague "illusion."
- Preserve distinct functions of lack, division, and causal bondage.

## Style family
- warm pale field = shared contemplative world
- gold = fullness-source
- crimson = contraction
- indigo = subject-object refraction
- teal = causal structure
- translucent membranes and apertures
```

### Step 3.2: Search Existing Library FIRST

Before writing ANY render code:

```bash
# For EACH motif in your AGENT_KNOWLEDGE_DOSSIER, search the library:
python3 /root/projects/blog/factory/scripts/search-scenes.py "your_motif_concept"

# Example:
python3 /root/projects/blog/factory/scripts/search-scenes.py "threshold door aperture"
python3 /root/projects/blog/factory/scripts/search-scenes.py "rings nested constraint covering"
python3 /root/projects/blog/factory/scripts/search-scenes.py "light emergence radiance"
```

**Interpretation of results:**
- Score ≥50%: USE IT. Copy the function. Don't write a new one.
- Score <50% but a function exists with a similar concept: ADAPT IT. Don't start from scratch.
- No match: You may write a new function, but it must be:
  - A CONCRETE concept diagram (not a generic shape)
  - Documented in AGENT_KNOWLEDGE_DOSSIER
  - Added to scene-index.json for future reuse

```bash
# Check what's already indexed
cat /root/projects/blog/factory/scene-index.json | python3 -c "import json,sys; d=json.load(sys.stdin); print(f'{d[\"total\"]} scenes in index')"
```

### Step 3.3: Render at 10fps

Each scene: 4.8-8.0 seconds. Each scene must have a UNIQUE visual (no two scenes look the same).

```python
#!/usr/bin/env python3
"""render_pack.py — template for animation pack rendering."""
import sys, os, math, subprocess
sys.path.insert(0, '/root/projects/blog/scripts/renderer')
from renderer import *

FPS = 10
OUT = "/root/projects/blog/content/publishing/renders/YOUR_SLUG/v1"
os.makedirs(f"{OUT}/scenes", exist_ok=True)

# ── SCENE FUNCTIONS ──
# Each scene function takes (time, progress, variant_index) and returns an Image
# time: seconds elapsed (0 to duration)
# progress: 0.0 to 1.0 (normalized position within the scene)
# variant: scene index number (use to vary visuals between scenes)

def scene_motif_name(t, u, variant):
    """[CONCEPT NAME] — [one-line description of what this visual shows]"""
    im = canvas(DARK)
    d = ImageDraw.Draw(im)
    # Your drawing code here
    return im

# ── SCENE MANIFEST ──
SCENES = [
    {"id": "xx01", "mode": "motif_name_1", "duration": 6.0, "fn": scene_motif_name},
    {"id": "xx02", "mode": "motif_name_2", "duration": 6.0, "fn": scene_other_name},
]

def render():
    for s in SCENES:
        sid = s["id"]
        sd = f"{OUT}/scenes/{sid}"
        os.makedirs(sd, exist_ok=True)
        dur = s["duration"]
        fn = s["fn"]
        frames = int(dur * FPS)
        for fi in range(frames):
            t = fi / FPS
            u = fi / frames if frames > 1 else 1
            fn(t, u, int(sid[2:])).save(f"{sd}/frame_{fi:05d}.png")
        print(f"  {sid}: {frames} frames = {dur}s")
    
    # Assemble
    with open(f"{OUT}/c.txt", "w") as f:
        for s in SCENES:
            sid = s["id"]
            mp4 = f"{OUT}/scenes/{sid}.mp4"
            sd = f"{OUT}/scenes/{sid}"
            subprocess.run(['ffmpeg','-y','-framerate',str(FPS),'-i',
                f'{sd}/frame_%05d.png','-c:v','libx264','-pix_fmt','yuv420p',
                '-preset','ultrafast','-crf','28','-t',str(s["duration"]),mp4],
                capture_output=True)
            f.write(f"file '{mp4}'\n")
    
    combined = f"{OUT}/animation.mp4"
    subprocess.run(['ffmpeg','-y','-f','concat','-safe','0','-i',
        f'{OUT}/c.txt','-c','copy',combined], capture_output=True)
    print(f"Done: {combined}")

if __name__ == "__main__":
    render()
```

**Self-critique during render:** After rendering EACH scene, pause. Look at it. Does it look like what you imagined? If not, FIX IT before rendering the next one. Do not batch-render all scenes and check later.

### Step 3.4: Create Scene Catalog

```bash
# Generate scene_manifest.json
python3 << 'PYEOF'
import json
manifest = {
    "pack": "your-pack-name",
    "fps": 10,
    "resolution": [1280, 720],
    "scenes": [
        {"id": "xx01", "title": "Scene Title", "mode": "motif_name",
         "summary": "One-line description.", "duration_seconds": 6.0,
         "tags": ["tag1", "tag2"], "output_filename": "scenes/xx01.mp4"}
    ]
}
open("scene_manifest.json", "w").write(json.dumps(manifest, indent=2))
PYEOF

# Generate validation.json
ffprobe -v error -show_entries stream=width,height,r_frame_rate -show_entries format=duration,size \
  -of json animation.mp4 > validation.json

# Generate contact sheet
ffmpeg -y -i animation.mp4 -vf "fps=1/3,scale=320:180,tile=5x1" -frames:v 1 contact_sheet.jpg 2>/dev/null
```

**Validation after Step 3.4:**
```
[PASS/FAIL] scene_manifest.json created with all fields
[PASS/FAIL] validation.json shows correct resolution (1280x720) and FPS (10)
[PASS/FAIL] contact_sheet.jpg generated
[PASS/FAIL] Contact sheet frames are VISUALLY DISTINCT (no two look the same)
```

---

## Pass 4: Film Pack Composition

**Goal:** Compose multiple animation packs into a single film with interleaved chapters.

### Step 4.1: Build Storyboard

Combine all shots from all animation packs into a single storyboard.json. Interleave chapters.

```json
{
  "title": "Film Title",
  "source": "scripts/expansion-essay-N.md",
  "shot_count": 75,
  "runtime_seconds": 456.6,
  "shots": [
    {
      "shot_id": 1,
      "start": 0.0,
      "end": 5.15,
      "duration": 5.15,
      "raw_audio_duration": 3.889,
      "spoken_passage": "Evolution is about consciousness imagining itself into form...",
      "chapter": "I. The Spacious Present",
      "visual_mode": "attention_lens",
      "visual_mechanism": "An oval lens holds many temporal and spatial scales in one simultaneous act of attention.",
      "continuity_object": "the field of attention",
      "transition": "motif-preserving dissolve or motion handoff",
      "caption_restriction": "No full narration captions; only brief source term when conceptually necessary.",
      "first_in_chapter": true
    }
  ]
}
```

**Critical fields:**
- `raw_audio_duration`: the actual WAV sample duration (before padding to frame boundary)
- `duration`: the padded duration used for rendering
- `visual_mechanism`: one sentence describing what the viewer literally sees (not just the mode name)
- `continuity_object`: what element persists from the previous shot
- `transition`: how the shot becomes the next one

### Step 4.2: Write Visual Program

```json
{
  "schema_version": "2.0-experimental",
  "film_id": "expansion-essay-N",
  "title": "Film Title",
  "visual_thesis": "One sentence describing the film's complete visual arc.",
  "continuity_systems": [
    {
      "id": "system_name",
      "development": "How this system evolves from first appearance to final state — describe the TRANSFORMATION, not the object"
    }
  ],
  "chapters": [
    {
      "id": "chapter_id",
      "title": "I. Chapter Title",
      "visual_thesis": "One sentence: what does this chapter's visuals convey?"
    }
  ],
  "palette": {
    "color_name": "#hex"
  },
  "entities": [
    {"id": "entity_name", "archetype": "seed|field|axis|vessel|threshold|mirror|lattice", "continuity": "persistent|transforms|emerges"}
  ],
  "operators": ["reveal", "crystallize", "descend", "mirror", "dissolve", "etc"],
  "shape_semantics": {
    "point": "potential, origin, seed, attention",
    "circle": "field, containment, wholeness, recurrent life",
    "aperture": "threshold, perception, revelation, access",
    "axis": "mediation, ascent/descent, ordering principle",
    "branch": "differentiation, procession, development",
    "lattice": "form, internal law, structured relation",
    "vessel": "receptivity, prepared conditions, transformation",
    "mirror": "recognition, counterpart, recursive relation",
    "mosaic": "participation, ordered multiplicity, privation when pieces are missing"
  }
}
```

**Important:** Shape semantics must be CONSISTENT across the entire film. If a circle means "field" in chapter 1, it cannot mean "container" in chapter 4.

### Step 4.3: Generate Per-Shot Audio (Final)

For every shot in the storyboard, generate its WAV:

```python
import asyncio, os, json, subprocess

with open("storyboard.json") as f:
    shots = json.load(f)["shots"]

async def gen_all():
    import edge_tts
    for s in shots:
        sid = f"s{s['shot_id']:03d}"
        text = s["spoken_passage"]
        path = f"audio_segments/{sid}.wav"
        if not os.path.exists(path):
            await edge_tts.Communicate(text, "en-US-AriaNeural").save(path)

asyncio.run(gen_all())

# Measure actual durations — Edge TTS saves as MP3 disguised as WAV
# Use ffprobe, NOT the wave module
for s in shots:
    wav = f"audio_segments/s{s['shot_id']:03d}.wav"
    r = subprocess.run(['ffprobe','-v','error','-show_entries','format=duration',
        '-of','default=noprint_wrappers=1:nokey=1', wav],
        capture_output=True, text=True, timeout=5)
    actual = float(r.stdout.strip()) if r.stdout.strip() else 5.0
    s['raw_audio_duration'] = actual
    s['duration'] = round(actual, 1)

# Recalculate timing
current = 0.0
for s in shots:
    s['start'] = round(current, 3)
    current += s['duration']
    s['end'] = round(current, 3)

# Save updated storyboard
json.dump({"shots": shots}, open("storyboard.json","w"), indent=2)
```

### Step 4.4: Render at 6fps (Draft)

One MP4 per shot. Each shot uses its motif function from Pass 3.

```python
import subprocess, json

with open("storyboard.json") as f:
    shots = json.load(f)["shots"]

# Render each shot to MP4
for s in shots:
    sid = f"s{s['shot_id']:03d}"
    dur = s['duration']
    # Create frames for this shot using the motif function from Pass 3
    # ... (render frames) ...
    
    # Convert to MP4
    subprocess.run(['ffmpeg','-y','-framerate','6','-i',
        f'scenes/{sid}/frame_%05d.png',
        '-c:v','libx264','-pix_fmt','yuv420p','-preset','ultrafast','-crf','28',
        '-t',str(dur),f'scenes/{sid}.mp4'], capture_output=True)

# Concat all shots
with open("concat.txt","w") as f:
    for s in shots:
        f.write(f"file 'scenes/s{s['shot_id']:03d}.mp4'\n")

subprocess.run(['ffmpeg','-y','-f','concat','-safe','0','-i','concat.txt',
    '-c','copy','draft.mp4'], capture_output=True)

# Mux with audio
with open("audio_concat.txt","w") as f:
    for s in shots:
        f.write(f"file 'audio_segments/s{s['shot_id']:03d}.wav'\n")

subprocess.run(['ffmpeg','-y','-f','concat','-safe','0','-i','audio_concat.txt',
    '-c','copy','full_audio.wav'], capture_output=True)

subprocess.run(['ffmpeg','-y','-i','draft.mp4','-i','full_audio.wav',
    '-c:v','copy','-c:a','aac','-map','0:v:0','-map','1:a:0','-shortest',
    'final.mp4'], capture_output=True)
```

**Self-critique after first 10 shots:** Stop rendering. Watch the first 10 shots in sequence. Does anything feel repetitive? Do consecutive shots look too similar? If yes, fix the shot designs before continuing.

### Step 4.5: Generate Alignment Report

```python
import json, subprocess

with open("storyboard.json") as f:
    shots = json.load(f)["shots"]

report = {
    "audio_duration_seconds": 0,
    "video_duration_seconds": 0,
    "shot_clip_duration_checks": []
}

total_audio = 0
for s in shots:
    wav = f"audio_segments/s{s['shot_id']:03d}.wav"
    r = subprocess.run(['ffprobe','-v','error','-show_entries','format=duration',
        '-of','default=noprint_wrappers=1:nokey=1',wav],
        capture_output=True, text=True, timeout=5)
    actual = float(r.stdout.strip()) if r.stdout.strip() else 0
    total_audio += actual
    report["shot_clip_duration_checks"].append({
        "shot_id": s['shot_id'],
        "expected": s['duration'],
        "actual": round(actual, 3),
        "error": round(abs(s['duration'] - actual), 3)
    })

report["audio_duration_seconds"] = round(total_audio, 3)
report["video_duration_seconds"] = round(sum(s['duration'] for s in shots), 3)
report["final_av_duration_difference_seconds"] = round(
    report["audio_duration_seconds"] - report["video_duration_seconds"], 3)

json.dump(report, open("alignment_report.json","w"), indent=2)

errors = [c['error'] for c in report['shot_clip_duration_checks']]
print(f"AV drift: {report['final_av_duration_difference_seconds']}s")
print(f"Max shot error: {max(errors):.3f}s")
print(f"Avg shot error: {sum(errors)/len(errors):.3f}s")
```

**Validation:**
- AV drift < 0.10s: PASS/FAIL
- Max per-shot error < 0.12s: PASS/FAIL

---

## Pass 5: Quality Gate + Self-Critique

**Goal:** Reject your own output before presenting it. This is the most important pass.

### Step 5.1: The 7 Self-Critique Questions

Run these. Each is binary PASS/FAIL. All must pass.

```
Q1: First-5 test
Question: Do the first 5 shots each have a DIFFERENT visual mode?
Action: Look at shots 1-5. If any two use the same motif group, FAIL.
Example: bishop_codex, inner_lattice, watching_stones, watching_stones, bishop_codex = FAIL (shots 3-4 same)

Q2: Still-frame test
Question: Would I be ashamed to show shot 1 as a still image?
Action: Open shot 1's mature frame (at 72% of duration). Would you show this to the user? If you hesitate, FAIL.

Q3: No-narration test
Question: If I mute the video, does each shot's visual communicate its concept?
Action: For EVERY shot, look at the frame sequence (not just one frame). Without reading the narration, can you tell what concept this shot is about? If any shot fails, FAIL.

Q4: Concrete-names test
Question: Are any motif names abstract categories?
PASS examples: bishop_codex, watching_stones, earth_water, inner_lattice, shrinking_aperture
FAIL examples: body_surface, mind_thought, witness_center, descent_begin, pentad_align

Q5: Consecutive test
Question: Any 3+ consecutive shots in the same chapter?
Action: Scan the full storyboard chapter sequence. If A,A,A appears anywhere, FAIL.

Q6: First-30s test
Question: Would watching the first 30 seconds feel repetitive?
Action: Simulate watching: 5 shots × 6s = 30s. Would you get bored? Would the visuals feel samey? If yes, FAIL.

Q7: Rationale test
Question: For every shot, can I explain why this visual fits?
Action: Pick any 5 random shots. For each, explain the connection between the narration and the visual. If you hesitate on any, FAIL.
```

### Step 5.2: 4-Frame Sampling

Extract frames at 10%, 35%, 65%, and 85% of each shot's duration. The 65-75% frame is usually richest (the relationship has developed, the resolution hasn't dissolved).

```bash
for shot in scenes/*.mp4; do
    name=$(basename "$shot" .mp4)
    dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$shot")
    for pct in 0.10 0.35 0.65 0.85; do
        time=$(echo "$dur * $pct" | bc)
        ffmpeg -y -ss "$time" -i "$shot" -frames:v 1 -q:v 2 \
            "thumbs/${name}_$(printf "%02d" $(echo "$pct * 100" | bc)).jpg" 2>/dev/null
    done
done
```

### Step 5.3: Visual Critic Scoring

Score every shot 0-5 on 10 dimensions. Hard rejection on dimensions 1-3.

```json
{
  "shot_id": 1,
  "scores": {
    "semantic_fit": 4,       // Does the visual match the concept? (≥4, mandatory)
    "relation_legibility": 4, // Is the relationship visible? (≥4, mandatory)
    "explanatory_gain": 4,    // Does it explain more than words alone? (≥4, mandatory)
    "continuity": 3,          // Does it connect to neighbors? (≥3)
    "composition": 3,         // Is it well-composed? (≥3)
    "motion_progression": 3,  // Does the motion make sense? (≥3)
    "resolved_image": 4,      // Does it end clearly? (≥4)
    "palette_discipline": 4,  // Are colors from the palette? (≥4)
    "specificity": 3,         // Is it specific to this essay? (≥3)
    "novelty": 3              // Is it different from other shots? (≥3)
  },
  "hard_rejection": false,    // True if any mandatory dimension < 4
  "total": 35                 // Out of 50
}
```

**Hard rejection:** If `semantic_fit < 4` OR `relation_legibility < 4` OR `explanatory_gain < 4`: REJECT the shot. Redesign it.

### Step 5.4: File Creation Order (Verify All Layers Exist)

```
Layer 1 — SOURCE:     source_essay.md, narration_script.txt, script_integrity.json
Layer 2 — MEANING:    rhetorical_map.json, visual_thesis.md, motif_registry.json, palette.json
Layer 3 — TIMING:     provisional_segments.json, reference_narration.wav, shot_timing.json
Layer 4 — STORYBOARD: storyboard.json, continuity_graph.json, storyboard_validation.json
Layer 5 — PLAN:       visual_program.json, backend_plan.json
Layer 6 — DRAFT:      scenes/*.mp4, visual_reviews/*.json
Layer 7 — FINAL:      shots/*.mp4
Layer 8 — ASSEMBLY:   full_film.mp4, alignment_report.json, qc_report.json
Layer 9 — PACKAGE:    README.md, PRODUCTION_BLUEPRINT.md, pack.zip
```

**Validation:** Each file in each layer exists. Each layer depends only on layers above it.

### Step 5.5: Upload and Register

```bash
# Upload to R2
python3 -c "
import boto3, os
from botocore.config import Config
s3 = boto3.client('s3',
    endpoint_url='https://954612afb5a97bb15dddcdc70176813d.r2.cloudflarestorage.com',
    aws_access_key_id='87335c47538971cc698270f84559ed7d',
    aws_secret_access_key='efd1968d867661f0cd09ce47bee4af8c6ad3e1f8b0f1e434b8a084bdcec7c4f0',
    config=Config(signature_version='s3v4'))
with open('final.mp4', 'rb') as f:
    s3.put_object(Bucket='factory-assets', Key='YOUR_SLUG/v1/final.mp4', Body=f, ContentType='video/mp4')
print('Uploaded')
"

# Register in factory worker
curl -X PUT "https://factory-worker.tradesprior.workers.dev/api/factory/jobs/YOUR_SLUG" \
  -H "Content-Type: application/json" \
  -d '{"status":"review","version":1,"mp4_key":"YOUR_SLUG/v1/final.mp4","duration_seconds":DUR}'
```

---

## Retry Logic

| Problem | Action | Max Attempts |
|---------|--------|-------------|
| Pass 1 fails | Re-read essay, re-extract processes | 3 |
| Pass 2 fails | Re-synthesize problematic chunks, re-measure | 3 |
| Pass 3 fails | Redesign AGENT_KNOWLEDGE_DOSSIER, re-search library | 3 |
| Pass 4 fails | Rebuild storyboard with better interleaving | 3 |
| Pass 5 Q1-Q7 fail | Fix specific failure, re-run Pass 5 | 3 |
| Pass 5 shot rejected by critic | Redesign visual, re-render shot only | 3 |

After 3 failures at any pass: ESCALATE TO HUMAN. Document what blocked you.

---

## Common Failures and How to Fix Them

### "My first 5 shots look the same"
**Cause:** You assigned the same motif group to consecutive shots.
**Fix:** Interleave chapters. Use shot order: A, B, C, A, D not A, A, A, B, B.

### "My visual doesn't explain the concept"
**Cause:** You illustrated a NOUN instead of a PROCESS.
**Fix:** Go back to Gate 2.4. Identify the transformation. Redesign the visual around the verb, not the noun.

### "My durations are all 5.0s"
**Cause:** The WAV measurement failed (Edge TTS saves MP3s disguised as WAVs). Your code fell back to the default.
**Fix:** Use `ffprobe` to measure duration, not the `wave` Python module. See Step 2.2.

### "My shots are 2.2s or 19.3s"
**Cause:** You didn't run the iterative split/merge after audio probing.
**Fix:** Run Step 2.3. Split chunks > 10.5s. Merge chunks < 4.0s.

### "The user rejected my output"
**Cause:** You didn't run Pass 5 self-critique.
**Fix:** Run the 7 questions before presenting. If you had, you would have caught the problem yourself.

---

## Reference Index

| I need... | Go here... |
|-----------|-----------|
| The complete thought process | `factory/validation-platinum.md` |
| Mistakes to avoid | `factory/HANDOVER-FOR-NEXT-AGENT.md` |
| How to think per-shot | `factory/rationale-deep-dive.md` |
| How visuals map to concepts | `factory/rationale-exercise-malas.md` |
| Cross-pack patterns | `factory/platinum-analysis-all.md` |
| Existing functions to reuse | `factory/scripts/search-scenes.py` |
| How to score my output | `factory/scripts/analyze-output.py` |
| Cloudflare infrastructure | `factory/REFERENCE.md` |
| Pipeline commands | `factory/HEADER.md` |

---

## Final Warning

The 261 existing functions are not the problem. The validation-platinum manual is not missing anything. The gold packs contain every answer. The only remaining gap is YOUR willingness to think deeply about each shot before rendering it.

If you catch yourself writing code before you've written the rationale, STOP. Walk away. Come back and write the rationale first.

Previous agents failed because they didn't do this. Don't repeat their mistake.
