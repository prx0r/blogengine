# Workshop Guide — Turning Outlines into V6 Essays

## Overview

This guide documents the exact procedure for taking a raw essay outline (from `essaygen/workshop/`) and producing a v6-quality essay JSON. It synthesises the methods from `CLAUDE3.md`, `CLAUDE4.md`, `essayworkflow.md`, `slopreview.md`, `stopslop.md`, `perfectessay.md`, `essayguide.md`, and `v6ficinofeedback.md` into a single operational workflow.

The process has 10 stages. Each stage must be completed before the next begins. No skipping.

---

## Stage 1: Source Verification

**Before writing a single word, verify every source passage the outline references.**

1. Fetch the source text from the referenced URL (Wikisource, Sacred Texts, Project Gutenberg, Archive.org)
2. Find the exact passage using the start/end words given in the outline's Source Text blocks
3. Copy the passage verbatim
4. If the source is in an archaic translation (e.g., Everard's 1650 Hermes), decide whether to modernise spelling. Preference: lightly modernise OCR-era typos ("onely" → "only", "whilist" → "whilst") but preserve period flavour
5. Create a `source_ids` entry — the outline may not have one; you must name it

**Checklist:**
- [ ] Passage confirmed in source
- [ ] No OCR artifacts remain
- [ ] Passage length appropriate (400-900 chars for source blocks)
- [ ] Source ID assigned

---

## Stage 2: Concept Triad Selection

**Each essay needs exactly 3 concepts.** The triad pattern from CLAUDE3:

1. **Central entity** — the world, principle, or being the essay is about
2. **Perceiving faculty** — the mode of knowing or accessing it
3. **Anchoring term** — the specific practice, place, or name that grounds it

Examples from existing v6 essays:
- Mundus Imaginalis / Active Imagination / Eighth Climate
- Barzakh / Khayal / Tajalli
- Divine Order / Piety as Cognition / Celestial Medicine
- Eros / Daimon / Ladder of Love

Extract these from the outline's Metadata section (key concepts).

**Create a concept JSON file for each** in `content/glossary/concepts/` following the existing format:
```json
{
  "id": "kebab_case_id",
  "name": "Title Case Name",
  "definition": "1-3 sentence definition placing it in its tradition",
  "tradition": ["Tradition1", "Tradition2"],
  "synonyms": ["Synonym1", "Synonym2"],
  "related_to": ["Related Concept"],
  "essays": [],
  "source_material": []
}
```

---

## Stage 3: Body Block Construction (Pass 1 — Accept Slop)

**Write the essay JSON. Do not try to be good. Get the structure down.**

### Set the voice target first
Before writing a single block, define this essay's distinct voice:

- What is the **dominant metaphor**? (reading, sculpture, climbing, flight, ritual, atmosphere)
- What **register** should it speak in? (cosmic, austere, erotic, wild, operative, atmospheric)
- How is this essay **different** from others in the same series? (Ficino essays must not all sound the same)
- What **unexpected word** will anchor the opening? (choose it now — let it seed the rest)

Write the voice target at the top of the working file. Refer back to it during Passes 3 and 4.

### Block types
| Kind | Meaning | Voice | Length |
|------|---------|-------|--------|
| `source` | Author's own words | en-GB-RyanNeural (British male) | 400-900 chars |
| `ai` | Why source matters | en-US-AriaNeural (American female) | 100-300 chars |
| `art` | Inline image | (no audio) | caption only |

### Rhythm
The natural rhythm from `perfectessay.md`:
```
AI → Source → AI → Source → Art → AI → Source → AI → Art → Source → AI → ...
```

Rules:
- Every source block is preceded by an AI block that sets context
- Intersperse art blocks every 2-3 source blocks
- The essay may end with 1-2 AI blocks (no source after the final AI)
- 8-12 AI blocks per essay minimum

### Source blocks
Quote directly from verified source text. Keep them intact — do not paraphrase or abridge the author's own words. A source block should be a complete thought unit.

### AI blocks
Write from the outline's Commentary sections. Adapt the prose but keep the interpretive content. Each AI must answer: "Why does this source passage matter?" It must add something the source doesn't say.

**Do not** worry about pattern violations yet. That is Pass 2's job.

### Inline art
Place art blocks after key conceptual passages. Use existing art IDs from `content/glossary/art/`. Caption should describe what the image illustrates in relation to the essay.

---

## Stage 4: Pattern Identification (Pass 2 — Read Cold)

**Read the essay as if you've never seen it. Mark every AI block. Do not edit.**

Mark each sentence with pattern tags:

| Tag | Pattern | Examples |
|-----|---------|----------|
| `[NARR]` | Narrates what text/author does | "X opens with...", "The paper introduces...", "This section examines..." |
| `[NEG]` | Negate then assert | "Not X, but Y" in any of its 9+ disguised forms |
| `[3LIST]` | Three or four evenly-spaced parallel items | "gods, angels, and daimons", "from A through B to C" |
| `[PARA]` | Paraphrases source without adding | AI block that restates the preceding source in different words |
| `[FLAT]` | Uniform sentence length (±5 words) | Every sentence 20-35 words, no fragments |
| `[CLICHÉ]` | Self-help language | "power of now", "living your truth", "being present" |
| `[SAME-ENDING]` | Ending echoes source wording | Final AI block shares key words with source's closing |

Also check:
- Sentences starting with "Not" — 0 target
- "not X, but Y" constructions — ≤2 target
- Three/four-item lists including lineage chains — 0 target

Write the tagged version to a working file. Count violations by type.

---

## Stage 5: Repair (Pass 3 — One Sentence at a Time)

**Fix one violation at a time. Close the file between edits. Verify context after each change.**

### Priority order
1. Fix the **ending FIRST** — it is the most resistant to change and needs the most passes
2. Fix [NARR] — delete the narration clause, state the idea directly
3. Fix [NEG] — replace with flat assertion, question-answer, "forget X", or a fragment
4. Fix [3LIST] — pick one item and develop it, or merge into sentence structure
5. Fix [PARA] — rewrite to add what source doesn't say, or delete
6. Fix [FLAT] — add a fragment, a sentence under 8 words, a long sentence
7. Fix [CLICHÉ] — delete or replace with concrete language
8. Fix [SAME-ENDING] — rewrite entirely; do not share key words

### The Smuggle Test
After all repairs, scan for **disguised versions** of the same patterns:

**NEG disguises** (9 forms):
- Fragment: "Not X. Y."
- Clause: "X, not Y"
- Imperative: "Forget X. Y."
- Condition: "Without X, Y."
- Substitution: "Instead of X, Y"
- Lack: "What X lacks is Y"
- Insufficiency: "X alone cannot Y"
- Comparison: "The difference between X and Y..."
- Staging: "Wrong idea. Right idea." (two sentences)

**NARR disguises** (5 forms):
- Self-narration: "The paper opens with..."
- Author-narration: "X introduces..."
- Section-narration: "This section examines..."
- Collective-narration: "We now turn to..."
- Preview-narration: "What follows is..."

**3LIST disguises:**
- 4 evenly-spaced items (same cadence problem)
- Flat lineage chain ("from A through B to C and D")

### Verify after each fix
Re-read the surrounding 2-3 blocks. Did the fix introduce a new pattern? If yes, undo and try a different approach.

---

## Stage 6: Texture (Pass 4 — Sprinkle Joy)

**This pass adds what pattern elimination cannot produce: pulse, surprise, commitment.**

### What to look for
1. **Abstract nouns → concrete nouns**
   - "the world has lost the capacity" → "the world has forgotten how to look beyond the skin of things"
   - "presences encountered in a realm" → "presences that thrum in the space between worlds"

2. **Overcorrections from Pass 3**
   - A sentence that is correct but dead — follows all rules but has no pulse
   - Fix: add a concrete noun, vivid verb, or unexpected modifier

3. **One unexpected word per AI block**
   - Words from poetry, craft, or the sensory world: thrum, whet, flint, salt, gravid, lattice, silt, tendril, sheen, incandescent, striate, scored, seam, whetted
   - Place them where they feel slightly out of register — not in academic writing but right for the imaginal

4. **Flat nouns → specific nouns**
   - "things" → "substances, textures, presences"
   - "work" → "craft, discipline, art"
   - "world" → "terrain, landscape, domain"

### Read aloud test
If it sounds like a university lecture, rewrite. The essay should sound like a person with stakes, not a committee.

### The Magic Test
Read each AI block aloud. If you can predict the next sentence's shape before it arrives, the block is dead. If it surprises you — rhythm shifts, a word lands unexpected, you feel something — it's alive.

Target: at least one genuinely alive line per essay. A line that would feel wrong in any other essay.

### Cross-essay consistency check
Check this essay's AI blocks against completed essays in the same series:

- Do any sentences share the same structure or rhythm as another essay?
- Does "Ficino" (or the subject's name) start more than 2 AI blocks? If so, vary the subject.
- Would a reader who finished 3 essays in this series confuse one for another?

If the voice isn't distinct, return to the voice target defined in Stage 3 and rework the dominant metaphor.

---

## Stage 7: Art Matching

**After the body is clean, match and insert art blocks.**

1. Check existing art in `content/glossary/art/` for IDs that match the essay's concepts and voice
2. Add art IDs to the essay's `"art": []` field (gallery at the bottom)
3. Insert inline art blocks every 2-3 source blocks using `"kind": "art"` with `"art_id"` and `"caption"`
4. Each caption should describe what the image illustrates **in relation to the essay's specific claim**, not just what it depicts
5. If needed art doesn't exist, create new art JSONs following the schema in `essayguide.md`
6. **Minimum 3 inline art blocks** per essay — the reference essay (becoming_an_angel) has 7

**Checklist:**
- [ ] At least 3 inline art blocks placed at conceptual transitions
- [ ] Captions tie image to the essay's argument, not just description
- [ ] Art IDs exist in `content/glossary/art/`
- [ ] Gallery `"art": []` matches inline art IDs

---

## Stage 8: Final Verification

Run the checklist one last time:

| Check | Target | Pass/Fail |
|-------|--------|-----------|
| Sentences starting with "Not" | 0 | |
| "not X, but Y" constructions (any form) | ≤2 | |
| Structural narration ("paper opens", "X introduces") | 0 | |
| Three/four-item lists (including chains) | 0 | |
| Sentences all same length (±5 words of each other) | 0 | |
| Self-help clichés | 0 | |
| Ending shares key words with source | 0 | |
| AI block removable without loss | 0 | |
| Lines genuinely alive | ≥1 | |
| Every block has an unexpected word | ≥1 | |
| Overcorrections (correct but dead) | 0 | |
| Sounds like a person, not a committee | yes | |

### Smuggle Test (final pass)
Re-read the whole essay looking only for disguised patterns. Check every "not", "without", "instead", "rather", "cannot", "difference", lack, and insufficiency. If any are present, return to Stage 5.

---

## Stage 9: Peer Review

**Have the essay reviewed by someone who hasn't read it before. If no reviewer is available, act as one.**

### How to peer review

Read the essay cold and check for:

**Voice distinctiveness:**
- Does this essay feel different from others in the same series?
- If you removed the title, would you still know which essay this is?
- What is the dominant metaphor? Does it carry through every AI block?

**Alive vs dead sentences:**
- Mark every AI sentence as alive, functional, or dead
- Dead: correct but no pulse — the reader's eye glides over it
- Functional: does its job but doesn't add to the voice
- Alive: surprising, rhythmic, committed — a line that would feel wrong in any other essay
- Target: ≥1 alive line, ≤1 dead line per AI block

**Repetition patterns:**
- Does the subject's name ("Ficino", "Iamblichus") start more than 2 AI blocks?
- Do any sentence structures repeat across blocks (same opening, same rhythm)?
- Do any phrases echo other essays in the series?

**Ending quality:**
- Does the final AI block circle back to the opening image or claim?
- Or does it sum up like a tagline? (taglines close; good endings open)

**Concrete vs abstract ratio:**
- Circle every abstract noun. Replace with concrete nouns where possible.
- Target: at least one concrete image per AI block

**The Magic Test (aloud):**
- Read the essay aloud. If you can predict the next sentence's shape, it's dead.

### Checklist
- [ ] Voice distinct from other essays in series
- [ ] ≥1 alive line in essay
- [ ] Subject's name starts ≤2 AI blocks
- [ ] Ending circles back, doesn't tagline
- [ ] No sentence structures repeat across blocks
- [ ] Concrete image in every AI block
- [ ] Passes Magic Test (read aloud)

### Reference
See `v6ficinofeedback.md` for a worked example of this exact peer review process applied to the ficino series.

---

## Stage 10: Deploy Prep

**Prepare the clean essay for deployment.**

1. Copy the essay JSON from `essaygen/workshop/` → `content/glossary/essays/` with the same filename
2. Create concept JSONs for each of the 3 concepts in `content/glossary/concepts/` (if not already created):
   ```json
   {
     "id": "kebab_case_id",
     "name": "Title Case Name",
     "definition": "1-3 sentence definition placing it in its tradition",
     "tradition": ["Tradition1", "Tradition2"],
     "synonyms": ["Synonym1", "Synonym2"],
     "related_to": ["Related Concept"],
     "essays": [],
     "source_material": []
   }
   ```
3. Update concept JSONs' `"essays"` array to include the new essay ID
4. Run `node scripts/generate-graph-json.mjs` to regenerate the graph
5. Generate audio: `npm run generate:audio -- <essay-id>`
6. Deploy via `npm run cf:deploy`
7. Verify the deployed essay renders correctly on the live site

**Checklist:**
- [ ] Essay JSON copied to `content/glossary/essays/`
- [ ] All 3 concept JSONs exist in `content/glossary/concepts/`
- [ ] Concept JSONs reference the essay ID
- [ ] `generate-graph-json.mjs` runs without errors
- [ ] Audio generated and present in `public/audio/`
- [ ] Deployment succeeds
- [ ] Live site renders the essay

---

## The Golden Rules

1. **Do not rewrite.** Edit one sentence at a time.
2. **The ending is the most resistant to change.** Rewrite it first, then re-read it cold three times.
3. **The Smuggle Test is the real innovation.** Patterns disguise themselves. Target the pattern, not the surface form.
4. **If you can't tell whether a sentence is alive, read it aloud.** If it sounds dead, it's dead.
5. **Every AI block must add what the source doesn't say.** If you can remove it without loss, delete it.
6. **The triad must be clean.** Exactly 3 concepts: entity, faculty, anchoring term.
7. **Nothing leaves the workshop until validated.** Each essay must pass the full checklist and Smuggle Test.

## Quick Reference

```bash
# Extract source text
pdftotext content/glossary/sources/essays/<source>.pdf /tmp/source.txt

# Generate audio after essay is clean
npm run generate:audio -- <essay-id>

# Deploy
node scripts/generate-graph-json.mjs
npm run cf:deploy
```
