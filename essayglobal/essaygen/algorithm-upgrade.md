# Algorithm Upgrade — Block Minimum, Merges, and Fixes from perspective.md

## 1. Block Minimum: 10 AI Blocks

**Change:** Replace "AI blocks: 5-15" with "AI blocks: 10-18" in Phase 5.1 Structural Checksum.

**Rationale:** A 5-block essay is a note. It can introduce a concept, illustrate it, and close, but it cannot develop an argument through transformation. The reference (becoming_an_angel) has 15 AI blocks and uses the extra room to:
- Introduce the metaphor (alchemy)
- Apply it (furnace, alembic)
- Transform it (scorches, rot before it can fruit)
- Circle back transformed ("oldest form of philosophy")

This arc requires minimum 8-10 AI blocks. Essays under 10 should either be expanded or merged.

**Update to Phase 2.1 body template:**

```
AI(0): opens with ANCHOR_WORD, sets the problem
Source(0): author's first key passage  
AI(1): why this passage matters
AI(2): deepens the claim before next source
Source(1): author's second passage
Art(0): image 1
AI(3): commentary — adds what source doesn't say
AI(4): bridge between passages
Source(2): author's third passage
Art(1): image 2
AI(5): commentary
AI(6): second bridge or deepening
Source(3): author's fourth passage (minimum 4 source passages)
Art(2): image 3
AI(7): commentary
AI(8): begins transition to ending
AI(9): closing — circles back to opening claim transformed
AI(10): (optional) final reframe
```

**Update "Condensed" classification:** Remove the "Condensed (5-6 AI)" category entirely. Every essay is a full essay. Minimum 10 AI, 4 source passages, 3 art blocks.

**Update Phase 5.1:**

```
___/__ Structural
  Body ends with AI (never Source)              YES/NO
  AI blocks: 10-18                               ___
  Source passages: 4-6                           ___
  Art blocks: ≥3                                YES/NO
  AI block lengths: 100-400 chars                YES/NO
  Source block lengths: 300-900 chars            YES/NO
```

---

## 2. Essay Merges

### Merge 1: Blake + Hillman → "The Cleansed Door and the World's Soul"

**Current:** Blake (5 AI, 8.4 grading) + Hillman (5 AI, 6.9 grading)
**Target:** 12-14 AI blocks

**Rationale:** Both are about perception — Blake says "cleanse the doors," Hillman says "the world has soul." The merge creates an arc: start with Blake's violence against dead perception (doors must be torn open), move through the practice of cleansing, then arrive at Hillman's vision (what appears when the doors are clean — a world ensouled). Hillman's essay alone is the weakest in the series (6.9) because it explains the ensouled world without making you feel it. Blake's violent cleansing gives you a method. Hillman's vision gives you the result.

**Structure:**
- AI 0-3: Blake — tearing, cleansing, the infinite already present
- Source: Blake passage
- AI 4-5: Transition — what cleansing reveals
- AI 6-9: Hillman — the ensouled world, every thing with a face
- Source: Hillman passage
- AI 10-11: Closing — the work is to see what is already there

### Merge 2: Swedenborg + Corbin → "The Geography of the Soul"

**Current:** Swedenborg (5 AI, 7.1 grading) + hints from Corbin's own geography
**Target:** 10-12 AI blocks

**Rationale:** Swedenborg's essay alone is the weakest concept-to-language match — the most interesting concept with the most generic language. Merging it with Corbin's own use of Swedenborg (already present in mundus_handcrafted_v6) creates a natural bridge. The essay starts with Swedenborg's visionary geography (space as state, distance as difference), then moves to Corbin's recognition of Swedenborg as a Western witness, then to the common principle (Na-koja-Abad, eighth climate).

**Structure:**
- AI 0-3: Swedenborg's heaven — correspondence, state as primary, affinity replaces distance
- Source: Swedenborg passage
- AI 4-6: Corbin's reading of Swedenborg — "a Western witness"
- Source: Corbin passage
- AI 7-9: The shared law — inner states produce the same landscapes across traditions
- AI 10: Closing — geography is the soul's interior made visible

### Merge 3: Attar + Ibn Arabi (Barzakh) → "The Journey Through the Isthmus"

**Current:** Attar (5 AI, 8.1 grading) + Ibn Arabi Barzakh (already longer at ~15 blocks)
**Target:** The Barzakh essay stays as-is (already long enough). Attar merges into it as a companion section.

**Rationale:** Both are about the journey to Qaf. Attar tells the story (birds seeking the Simurgh). Ibn Arabi provides the metaphysics (the Barzakh as the ontological ground of that journey). Together they form narrative + doctrine.

**Structure (add to Barzakh essay):**
- The existing Barzakh body (already ~15 blocks) stays
- Add a final section: AI 14-16 — the Attar story as practical illustration of the Barzakh in action
- Source: Attar passage — "The thirty birds arrive. Sī murgh — 'thirty birds.'"
- AI 17: Closing — the path to Qaf burns away what is false. The flock becomes a single seeing.

### Merge 4: Steiner + Plotinus Beauty → "The Eye That Must Become Capable of Light"

**Current:** Steiner (5 AI, 7.5) + Plotinus Beauty (5 AI, 8.6)
**Target:** 12-14 AI blocks

**Rationale:** Both are about the transformation of the perceiver. Plotinus says "the eye must become sunlike." Steiner says "thinking must become alive enough to perceive hidden realities." The merge creates a single arc: Plotinus provides the metaphysical law (likeness is the condition of perception), Steiner provides the method (imagination → inspiration → intuition).

**Structure:**
- AI 0-3: Plotinus — beauty, the ladder, the eye must become sunlike
- Source: Plotinus passage
- AI 4-5: Transition — what does it mean to become capable of seeing?
- AI 6-9: Steiner — imagination, inspiration, intuition as stages
- Source: Steiner passage
- AI 10-11: Closing — the living picture learns to speak. First it appears. Then it speaks. Then you become what spoke through it.

### Keep Standalone (but expand):

**Avicenna Angel** — Keep but expand from 5 to 10+ AI. The outline material on ta'wil, the Guide, and the Orient is rich enough. Add more source passages and deeper commentary on each.

---

## 3. Additional Algorithm Fixes

### Fix: Ending Separate Verification Pass

Add to Phase 5.4:

```
### 5.4.1 Ending Cold Read (additional mandatory step)

After passing 5.4, perform a separate cold read of ONLY the closing AI block(s):

1. Close the essay. Wait 30 seconds.
2. Open ONLY the last 1-2 AI blocks. Do not read anything else.
3. Ask:
   - Could this ending end any essay in the series? If yes → FAIL. Rewrite.
   - Does it sum up rather than open outward? If yes → FAIL. Rewrite.  
   - Does it share key content words with the last source passage? If yes → FAIL. Rewrite.
   - Does it circle back to the opening image TRANSFORMED (not just restated)? If NO → FAIL. Rewrite.

The ending must be verified in isolation because the surrounding context masks its weaknesses.
```

### Fix: Texture Placement Check

Add to Phase 4:

```
### 4.8 Texture Placement (new)

Texture words must appear at STRUCTURAL PIVOT POINTS, not scattered arbitrarily:

- At least one texture word in the opening line of the first AI block
- At least one texture word immediately after an em-dash (the pivot)
- At least one texture word in the closing line of the final AI block

Count where texture words land, not just how many there are. A texture word at a pivot point does 10× the work of one buried mid-sentence.
```

### Fix: Semantic Inversion Check

Add to Phase 3:

```
### 3.5 Semantic Inversion Check (new, mandatory after NEG fixes)

After every "not" removal or NEG fix:

1. Read the FIXED sentence in isolation.
2. Ask: "Does this sentence mean what the ORIGINAL meant?"
3. If unsure, read the original sentence with "not" restored. Compare.

This is the most dangerous error in the protocol. The algorithm testing on 8 goethe essays found 12 semantic inversions — sentences that accidentally said the opposite of what was intended. Every NEG fix must be verified against the original meaning.

⚠ If the subject inherently corrects wrong views (theurgy, Goethe, Steiner, any essay about correcting a modern misconception), the FULL workshop protocol is mandatory over the algorithm shortcut.
```

### Fix: Source Block Rule

Add to Phase 2:

```
### 2.5 Source Block Rule (new)

Every source block must be:
- A verbatim quote from the author, ≥200 characters
- NOT a paraphrase, summary, or secondary description
- NOT a single sentence used as an epigraph

The source block IS the author speaking. If the source block is a paraphrase, the AI commentary has nothing real to bounce off.

Test: After writing the essay, read ONLY the source blocks. If they sound like they were written by the same voice as the AI blocks, one of them is wrong.
```

### Fix: Interchangeability Test

Add to Phase 5 (new section):

```
### 5.7 Interchangeability Test (new)

Take the opening AI block of this essay and the opening AI block of another essay in the same series. Swap them. Ask:

- Would a reader notice the swap?
- Could the swapped opening lead naturally into the other essay's source block?

If the answer is "no" to both (the swap is undetectable), the essays do not have distinct voices. Return to Phase 1.1 and set a stronger voice target.

This is the single best diagnostic for voice distinctiveness.
```

---

## 4. Grading System Update

Update `essaygen/workshop/v6_final/gradingsystem.md`:

- **C1 Patterns (was 20%, now 10%):** Pattern elimination is table stakes. Dropping weight to reflect that zero violations is the entry requirement, not the achievement.
- **C7 Essence (was 15%, now 25%):** Holistic aliveness is the hardest thing to achieve and the most important for reader experience.
- **C6 Ending (was 10%, now 15%):** The ending is disproportionately important and disproportionately resistant to improvement. Higher weight reflects the separate verification passes needed.
- **New Criterion: Source Integrity:** 5% weight. Source blocks must be verbatim author quotes ≥200 chars.

| Criterion | Old Weight | New Weight |
|-----------|-----------|-----------|
| C1 Patterns | 20% | 10% |
| C2 Sentence Architecture | 15% | 15% |
| C3 Voice + Metaphor | 15% | 15% |
| C4 First Words | 10% | 10% |
| C5 Texture | 15% | 15% |
| C6 Ending | 10% | 15% |
| C7 Essence | 15% | 25% |
| (New) Source Integrity | — | 5% (offset by lowering C1) |
