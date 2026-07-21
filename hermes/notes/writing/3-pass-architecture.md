# 3-Pass Writing Architecture for Hermes

Collated from: `writingtips.md`, `user-style.md`, `goodprose.md`, `antislopguide.md`, `slopnotes.md`, `antislopguide.md`, `science-of-essay.md`, `companion-writing-guide.md`, `video-hooks-comparison.md`, `writing-quality-review.md`

---

## The Core Principle

Source passages ARE the content. Commentary is the frame, not the picture. The reader came for Kallata/Abhinavagupta/Corbin, not for an explanation of them. Target ratio: **60% source, 25% framing, 15% analysis**. AI blocks should average 30 words, source blocks should be 400-900 chars.

---

## Pass 1: Dump (Source-Maximal)

**Goal:** Get as much source material on the page as possible. Minimal commentary. Establish the architecture of the essay.

### Rules
- Source blocks are 400-900 chars each — complete thoughts, let them breathe
- AI blocks are short (20-40 words) — just enough to introduce the next source
- No analysis yet — just framing ("X says:" → source block)
- Ratio: 70% source, 30% AI
- Hook: one sentence that states the riddle / paradox / question
- Ending: let the last source block land, add one sentence circling back to the hook

### Anti-Patterns to Block
- Do NOT narrate the text ("X opens with...", "X introduces...", "X turns to...")
- Do NOT use NEG ("not X but Y") in any of its 9 forms
- Do NOT write summary blocks
- Do NOT paraphrase what the source just said

### Validation Gate
```
P1_A: Every AI block is ≤ 40 words
P1_B: Source/AI ratio ≥ 60/40
P1_C: Zero NARR patterns (X opens with, X introduces, X turns to, X concludes)
P1_D: Zero NEG patterns (not X but Y, not your X, through X not Y, etc.)
P1_E: Hook exists as first non-source block
P1_F: No summary blocks
```

---

## Pass 2: Refine (Slop Removal)

**Goal:** Kill every AI-slop pattern. Replace with concrete imagery, textured language, and fluid prose from our style resources.

### The Texture Kit (from `goodprose.md`)

Every AI block must have at least one of these:

1. **An unexpected noun** — a word that belongs to poetry, craft, or the sensory world, not academic discourse. Examples: thrum, whet, flint, scorch, seam, gravid, brushwood, lattice, scored, rot, fruit, pulse, flame.

2. **A concrete image replacing an abstraction** — never explain, always show:
   - "three floors to this universe" instead of "the middle realm has ontological status"
   - "a brushwood fire to the senses" instead of "a transformative experience"
   - "the stuff you can stub a toe on" instead of "the material realm"

3. **A fragment that lands** — one short punchy sentence fragment that breaks the rhythm:
   - "Not furniture. A crowd."
   - "Same phenomenon, different organ of perception."
   - "Broken. Imperative. Symbolic."

### The Anti-Slop Checklist (from `antislopguide.md`)

Check every AI block against these:

```
[ ] Does it narrate the act of writing or summarizing? ("X opens with", "this brings us to")
[ ] Does it use NEG (not/but/corrective tone)?
[ ] Does it paraphrase what the source just said?
[ ] Does it read like a neutral summarizer?
[ ] Does it start the same way as the previous AI block?
[ ] Does it contain any academic framing? ("in this essay", "it is important to note")
[ ] Is there an unexpected concrete noun?
[ ] Could this entire block be cut without losing anything? If so, cut it.
```

### Validation Gate
```
P2_A: No NEG patterns in any AI block
P2_B: No NARR patterns in any AI block
P2_C: Every AI block has ≥1 unexpected concrete noun
P2_D: No two consecutive AI blocks start with the same structure
P2_E: No block reads as neutral summarizer (must have stance: amused, unsettled, awed, skeptical)
P2_F: No flat transitions ("X now moves from A to B")
```

---

## Pass 3: Shape (Emotional Arc)

**Goal:** Give the essay a real emotional shape — hook, tension, climax, release, return.

### The Proven Pattern (from `user-style.md`)

The 200K-view ibn Arabi video proved this arc:

```
RIDDLE → METAPHOR → PRIMARY SOURCE → PARADOX → RETURN TO RIDDLE
```

### Structure Template

```
OPENING (0-15% of essay):
  - Hook: one punchy sentence, direct address ("you" or declarative claim)
  - No throat-clearing: no dates, publication history, biographical setup
  - Set up the riddle or question the essay answers

BODY (15-85%):
  - Source blocks carry the weight (60% of body)
  - AI blocks are connective tissue only
  - Each section has: metaphor → source → commentary → next
  - Build tension toward the climax
  - The SECOND HOOK appears at ~40% — a fresh angle on the same material
  - Every AI block must ADD what the source doesn't say

CLIMAX (75-85%):
  - The most powerful source passage
  - Minimal commentary — let it land
  - A pause (fragment, silence, single sentence paragraph)

ENDING (85-100%):
  - Circles back to the opening concretely (not abstractly)
  - Shares NO key words with the last source passage
  - Does NOT summarize
  - Does NOT sound like a tagline
  - Ideally: one unexpected image that reframes everything
```

### The Hook Spectrum (from `video-hooks-comparison.md`)

| Type | Example | Works For |
|------|---------|-----------|
| Direct address | "You died already" | Personal topics |
| Provocative claim | "Pain is juice" | Paradoxical topics |
| Animism/threat | "The stones are watching you" | Mystical topics |
| Reversal | "God is incomplete without you" | Theological topics |
| Capture in phrase | "One thing looking at itself" | Philosophical topics |
| Agency flip | "The path chose you" | Destiny/fate topics |

### Emotional Check

```
P3_A: Hook exists and is punchy (≤15 words, no hedging)
P3_B: Second hook exists at ~40% mark
P3_C: Climax segment identified (longest/most powerful source block)
P3_D: Ending circles back to opening concretely
P3_E: Ending shares no key words with last source block
P3_F: Zero words from the closing also appear in the last source passage
P3_G: If ending sounds like a tagline, rewrite
P3_H: Read aloud test — does it sound like a university lecture? If so, rewrite.
```

---

## Ralph Loop Integration

The three passes run as a Ralph Loop inside the write skill:

```
Phase 2 (Convert Blueprint):
  → Write Pass 1 (source-maximal dump)
  → Validate against P1 gates
  → If FAIL → retry (max 3)

Phase 2b (Refine):
  → Run Pass 2 (slop removal + texture kit)
  → Validate against P2 gates
  → If FAIL → retry (max 3)

Phase 2c (Shape):
  → Run Pass 3 (emotional arc + hooks + ending)
  → Validate against P3 gates
  → If FAIL → retry (max 3)

Phase 3 (Glossary Integration):
  → Extract concepts, write concept entries
  → Validate: all concept refs resolve
```

Each pass is a separate loop with its own validation gates. A pass cannot succeed unless all its gates pass. This prevents the common failure mode where an essay passes overall validation but reads like slop.

---

## Reference Files for Hermes

When writing, Hermes should read these files in order:

1. `hermes/notes/writing/essay/companion-writing-guide.md` — source-specific guidance
2. `user-style.md` — the author's voice
3. `writingtips.md` — 8 mistakes and verification
4. `goodprose.md` — the texture kit (unexpected nouns, fragments, concrete images)
5. `antislopguide.md` — before/after rewrites showing exactly what to fix
6. `slopnotes.md` — common violations across the library
7. `3-pass-architecture.md` — this file
