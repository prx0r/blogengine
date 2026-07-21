# Algorithm V6 — Complete Essay Generation Protocol

A self-contained algorithm that transforms any source material or draft outline into a v6 essay. No prior knowledge required. This document contains everything needed: why the protocol exists, what the enemy patterns look like, and how to transmute base material into a work of art through staged passes.

---

## Preamble: Why This Algorithm Exists

The version history of a single essay ("Becoming an Angel") proves that one-pass generation cannot produce beautiful prose:

| Version | Change | New Problem Introduced |
|---------|--------|----------------------|
| v1 | — | Narrritivitis in every block |
| v2 | Fixed narration | Negat-assert-itis (every claim corrects first) |
| v3 | Fixed negation | Paraphrase-itis (repeats source, no pulse) |
| v4 | Added interpretation | Self-narration disguised ("The paper opens...") |
| v5 | Fixed paraphrase | Cliché infiltration ("power of now") |
| v6 | One cosmetic change | Ending still unrevised after 5 versions |
| v7 | First real change | Rule-dodging 4-item lists, disguised NEG staging |
| v8 | Fixed enumeration + texture | Clean |

**Core truth:** The detection pass and the generation pass must be separate. You cannot see your own patterns while generating them. The same circuit that produces the text also approves it — and it doesn't notice the patterns it just wrote.

**The only fix:** Write → detect → repair → texture in separate passes. Each pass has a single job. Never combine them.

---

## Axioms: The Pattern Universe

The 7 patterns that make AI prose feel like AI prose. Each is defined with: what it is, why it's bad, examples from real essays, disguised forms, and the fix.

---

### Axiom 1: Narrritivitis (NARR)

**What it is:** The sentence narrates what the text or author does instead of stating the idea directly.

**Why it's bad:** The reader came for the content, not for a tour guide. "X opens with..." tells the reader what they're about to read instead of letting them read it. It creates a layer of glass between the reader and the idea.

**Examples:**
- "The paper opens with alchemy, and the choice is deliberate because alchemy provides the controlling metaphor..."
- "Voss opens with a distinction between Aristotelian and Platonic modes of knowing..."
- "This section examines the role of the active Imagination..."
- "What follows is an analysis of Corbin's concept of ta'wil..."
- "We now turn to the question of how symbols participate in divine order..."

**5 disguised forms:**
```
SELF-NARRATION:   "The paper opens with..."
AUTHOR-NARRATION: "X introduces..."
SECTION-NARR:     "This section examines..."
COLLECTIVE-NARR:  "We now turn to..."
PREVIEW-NARR:     "What follows is..."
```

**Fix:** Delete the narration clause. State the idea directly.

- BAD: "The paper opens with alchemy, and the choice is deliberate because alchemy provides the controlling metaphor for everything that follows."
- GOOD: "Alchemy is the controlling metaphor for everything that follows."

**Test:** If you can delete the first clause and the sentence still works, delete it.

**Exception:** The first AI block of an essay may position the author as a thinker ("Plotinus begins with inward turning") — this is permitted once per essay.

---

### Axiom 2: Negat-Assert-Itis (NEG)

**What it is:** The sentence clears ground by negating a wrong view before asserting the right one. "Not X, but Y."

**Why it's bad:** The reader intuits "here comes a correction" before they reach the content. The negation is scaffolding, not meaning. Every "not" delays the positive assertion, and the reader learns to skip the first half of every sentence. Over time, the essay feels defensive rather than confident.

**Examples from real essays:**
- "Not conceptual analysis, but participatory knowledge."
- "Not projections of the psyche, but presences encountered in a realm."
- "Not decoration, but a form of spiritual transmission."
- "The spiritual path does not begin by escaping matter. It begins by perceiving matter as generated and held."

**9 disguised forms (the Smuggle Test):**
```
FRAGMENT:     "Not X. Y."
CLAUSE:       "X, not Y"
IMPERATIVE:   "Forget X. Y."
CONDITION:    "Without X, Y."
SUBSTITUTION: "Instead of X, Y"
LACK:         "What X lacks is Y"
INSUFFICIENCY:"X alone cannot Y"
COMPARISON:   "The difference between X and Y..."
STAGING:      "Wrong idea. Right idea." (two sentences)
```

**All 9 forms are the same move.** They all negate before asserting. Zero tolerance.

**Fix:** Replace with a flat assertion. Do not name the wrong view.

- BAD: "Not a creative one, but a spiritual discipline."
- GOOD: "A spiritual discipline — a different category entirely."

**⚠ The Semantic Inversion Danger:** Removing "not" can invert meaning. After every NEG fix, verify the new sentence means the same thing.

- Original: "The eye is not a passive receiver"
- Wrong fix: "The eye is a passive receiver" (OPPOSITE)
- Correct fix: "The eye participates in what it sees" (positive assertion of equal force)

This error occurred 12 times during algorithm testing on 8 goethe essays. It is the most dangerous bug in the protocol.

---

### Axiom 3: Three-Item List-Itis (3LIST)

**What it is:** Three grammatically parallel items in sequence. "gods, angels, and daimons."

**Why it's bad:** The reader's brain recognizes the pattern before reaching the third item. The items blur together because nothing distinguishes them — no weight, no emphasis, no individual development. The list becomes a cadence without content.

**Examples:**
- "gods, angels, and daimons"
- "a journey to the underworld, a fight with the dragon, a nigredo"
- "action, character, and intellect"
- "endurance, order, and beauty"

**Disguised forms:**
```
4 evenly-spaced items:   "Descent, combat, dissolution, reformation" (same cadence)
Flat lineage chain:      "From Plotinus through Iamblichus to Jung and Hillman"
```

**Fix:** Pick one item and develop it. Or absorb one item into sentence structure. The goal is WEIGHT, not count.

- BAD: "gods, angels, and daimons"
- GOOD: "gods, angels, daimons — each with its own gravity"

---

### Axiom 4: Paraphrase-Itis (PARA)

**What it is:** The AI block restates what the source just said, in different words, same structure, same claims.

**Why it's bad:** The reader has already read the source. Repeating it wastes their time. Every AI block must add what the source doesn't say — the "so what" that the reader is silently asking.

**Test:** If you can remove the AI block and the reader still understands everything, delete it.

- BAD: "Ta'wil refers to the process of interiorisation, of restoring the true meaning of a text through transmuting the world into symbols."
- GOOD: "Ta'wil makes integration possible — it trains the soul to pare through surfaces, each layer a skin of habitual seeing stripped back."

The first just rephrases. The second adds a mechanism (trains, pare, stripped) and an image (skin) that the source didn't provide.

---

### Axiom 5: Museum-Guide Neutrality (FLAT)

**What it is:** Every sentence 20-35 words. No fragments. No short sentences. No rhythmic variety.

**Why it's bad:** Uniform sentence length produces a drone. The reader's eye glides across the surface without anything catching. Prose needs pulse — short beats for emphasis, long arcs for complexity, fragments for landing.

**Examples from real essays:**
- "The distinction between Aristotelian and Platonic modes of knowing is essential here because Corbin's project depends on the Platonic conviction that one must participate in a reality in order to know it."
- All sentences in this block are 25-35 words. No variation.

**Fix:** Add one sentence under 8 words. Add one fragment. Read aloud.

- BAD: [all long sentences]
- GOOD: Add "Corbin never seriously entertained the first." — a short sentence break that changes rhythm.

---

### Axiom 6: Cliché Infiltration (CLICHÉ)

**What it is:** Self-help language dropped into a premodern context without irony.

**Why it's bad:** "The power of now" or "living your truth" or "being present" are modern therapeutic idioms. They have no place in essays about 12th-century Sufi metaphysics or Renaissance Neoplatonism. They break the historical register and make the essay feel like a TED talk in costume.

**Fix:** Delete it. If it's in the source, footnote the mismatch.

---

### Axiom 7: The Dead Ending (SAME-ENDING)

**What it is:** The last AI block shares key words, structure, or phrasing with the last source passage.

**Why it's bad:** The source passage is the author's final word. If the AI echoes it, the essay ends on the author's voice, not the commentator's. The reader feels a fade-out instead of a landing.

**Fix:** Rewrite the ending FIRST, not last. Close the file. Re-open and rewrite only the ending. Repeat three times. The ending needs more passes than any other paragraph.

---

### The Cross-Essay Axiom: Voice Distinctiveness

**What it is:** All essays in a series sounding the same — same sentence structures, same opening patterns, same register.

**Why it's bad:** A reader finishing 6 essays should feel 6 different experiences. Ficino on Theurgy should feel different from Ficino on Spiritus. If all essays share the same calm expository register, the series is a single long essay cut into pieces.

**The specific pattern identified from the ficino peer review:**
- "Ficino" (or the topic author's name) starts ~40% of AI blocks
- This makes every essay feel like a summary of what Ficino thought
- Fix: no more than 2 AI blocks per essay should begin with the topic name

---

## Phase 0: Source Decomposition

### 0.1 Parse the Source

```
AUTHOR_STRUCTURE = [
    "What is the author's stated plan?",
    "What are the 2-3 key ideas everything else supports?",
    "Where does the author repeat themselves?",
    "What is the emotional payoff at the end?"
]
```

**Self-prompt:** *"Read the source until you can explain its structure in 3 sentences without looking. If you can't, read again."*

### 0.2 Extract the Concept Triad

```
CONCEPT_1 = "Central entity"     (the world, principle, or being)
CONCEPT_2 = "Perceiving faculty" (mode of knowing or accessing it)
CONCEPT_3 = "Anchoring term"     (specific practice, place, or name)
```

**Constraint:** Exactly 3 concepts. No more, no fewer.

### 0.3 Identify Source Passages

```
SOURCE_PASSAGES = 3-5 passages of 400-900 chars each, each a complete thought unit
```

**Ratio:** Combined source length should be 1.5-2× combined AI commentary length.

---

## Phase 1: Voice Targeting

### 1.1 Set the Dominant Metaphor

```
DOMINANT_METAPHOR = one physical process the essay's subject resembles
                    (fire, sculpture, body, architecture, flight, weaving, cooking, etc.)
```

**Self-prompt:** *"What physical thing does this feel like? Does it burn, carve, grow, build, fly? Pick ONE. Use its vocabulary throughout."*

### 1.2 Set the Register

```
REGISTER according to subject:
  cosmic or vast       → cosmic, literary, sacramental
  precise or abstract  → precise, austere, structural
  intense or ecstatic  → volatile, wild, oracular
  embodied or practical→ material, operative, architectural
  inward or contemplative→ spare, subtractive, silent
```

### 1.3 Choose the Anchoring Concrete Word

```
ANCHOR_WORD = one concrete noun
  Cosmic:    thread, chain, lamp, bell, seam
  Austere:   pare, strip, carve, dust, lime
  Wild:      scorch, flint, flame, surge, volatile
  Operative: seal, wax, vessel, hinge, threshold
  Spare:     silt, grain, salt, bone, ash
```

**Self-prompt:** *"The anchoring word must appear in at least 2 AI blocks. It seeds the essay's sensory vocabulary. If you haven't used it by Block 3, force it in."*

### 1.4 Set the Differentiator (Series Only)

```
DIFFERENTIATOR = "This essay differs from others in the series because..."
```

**Self-prompt:** *"Read the other essays' first AI blocks. If any could be swapped with this one without detection, the voice is not distinct enough. Change the dominant metaphor until it is."*

---

## Phase 2: Block Generation

### 2.1 Write the Essay Body

Minimum 10 AI blocks. Essays under 10 AI blocks are notes, not essays. Expand with additional source passages and commentary or merge with a companion essay.

```
AI(0): opens with ANCHOR_WORD, sets the problem
Source(0): author's first key passage
AI(1): why this passage matters
AI(2): deepens the claim before next source
Source(1): author's second passage
Art(0): image 1, caption tied to essay's specific claim
AI(3): commentary — adds what source doesn't say
AI(4): bridge or deepening before next source
Source(2): author's third passage
Art(1): image 2
AI(5): commentary
AI(6): second bridge or deepening
Source(3): author's fourth passage (minimum 4 source passages required)
Art(2): image 3
AI(7): commentary
AI(8): begins transition to ending
AI(9): closing — circles back to opening claim TRANSFORMED
AI(10): (optional) final reframe
```

**Block length constraints:**
```
AI blocks:     100-400 chars (sweet spot: 180-300)
Source blocks: 300-900 chars (sweet spot: 400-700)
Art captions:  20-80 chars
```

**Ending rule:** The body must end with 1-2 AI blocks. Never a Source block.

**AI-to-Source ratio:**
- Every essay (10-18 AI): AI:Source ≈ 1:0.8
- No condensed (<10 AI) category exists. All essays are full essays.

### 2.5 Source Block Rule

Every source block must be:
- A verbatim quote from the source author, ≥200 characters
- NOT a paraphrase, summary, or secondary description
- NOT a single sentence used as an epigraph

The source block IS the author speaking. If the source block is a paraphrase, the AI commentary has nothing real to bounce off. After writing the essay, read ONLY the source blocks. If they sound like they were written by the same voice as the AI blocks, one of them is wrong.

### 2.2 Sentence Architecture — The 20-60-20 Distribution

Each AI block's sentences must pass this distribution:

| Length | Target | Function |
|--------|--------|----------|
| < 30 chars | ~20% | Fragments, thrusts, one-beat lines |
| 30-100 chars | ~60% | The body of the commentary |
| > 100 chars | ~20% | Dash constructions, cascading clauses |

### 2.3 Punctuation Signature

- **≥40% of AI sentences must use an em-dash** — the structural move: state, then pivot
- Pattern: `[ASSERTION] — [PIVOT]`
- Example: "Allegory is rational — it takes what is already known and dresses it in different clothes."
- Colons: 1 per 2 AI blocks (announcement of explanation)
- Questions: 0-1 per entire essay (direct address, used sparingly)

**Why the em-dash rule exists:** The dash fuses two thoughts into one rhythmic unit. Without it, you get two flat declarative sentences. The dash creates pulse by forcing a relationship between the two halves.

### 2.4 First-Word Variation

```
FIRST_WORD_POOL = ["The", "A", "[author]", "This", fragment, verb, "It", "What", "Where", "How"]
```

**Rule:** No more than 40% of AI blocks should start with "The". After the first 2 blocks, if the last 3 started with "The", force a different opening.

**Self-prompt:** *"Write the opening sentence. Now delete the first word. Replace it with a different word. If the sentence still works, keep it. If not, try a fragment."*

---

## Phase 3: Pattern Elimination (Pass 2 — Cold Read)

STOP. Do not edit yet. Read the body as if someone else wrote it.

### 3.1 Cold Read Protocol

```
1. Close the file
2. Count to 10
3. Open the file — read it in a different context (sideways, on a phone, in a different font)
4. Read ONLY the AI blocks — skip source and art
5. Mark every sentence with a pattern tag from the axioms above
6. Count: NEG + 3LIST + NARR + PARA + FLAT + CLICHÉ + SAME-ENDING
```

**Self-prompt:** *"You are a reviewer, not the author. Mark every pattern. Do not make excuses for any sentence. If it looks like a pattern, it is a pattern."*

### 3.2 Run the Smuggle Test

After marking obvious patterns, check every sentence for **disguised versions**:

```
NEG DISGUISES (9 forms):
  Fragment: "Not X. Y."
  Clause: "X, not Y"
  Imperative: "Forget X. Y."
  Condition: "Without X, Y."
  Substitution: "Instead of X, Y"
  Lack: "What X lacks is Y"
  Insufficiency: "X alone cannot Y"
  Comparison: "The difference between X and Y..."
  Staging: "Wrong idea. Right idea."

NARR DISGUISES (5 forms):
  Self-narration: "The paper opens with..."
  Author-narration: "X introduces..."
  Section-narration: "This section examines..."
  Collective-narration: "We now turn to..."
  Preview-narration: "What follows is..."

3LIST DISGUISES:
  4 evenly-spaced items (same cadence problem)
  Flat lineage chain ("from A through B to C and D")
```

### 3.3 Pattern Count Threshold

```
IF total patterns > 5:
    → RETURN TO PHASE 2 — rewrite the blocks with the most tags
IF ≤ 5:
    → Fix each pattern one at a time
    → After each fix, verify the meaning didn't change (semantic inversion check)
    → Re-read surrounding context to ensure fix didn't create a new pattern
```

### 3.4 Semantic Inversion Check

After every NEG fix where "not" was removed:

1. Read the FIXED sentence in isolation.
2. Ask: "Does this sentence mean what the ORIGINAL intended?"
3. If unsure, read the original sentence with "not" restored. Compare.

This is the most dangerous error in the protocol. Algorithm testing on 8 goethe essays found 12 semantic inversions — sentences that accidentally said the opposite of what was intended because "not" was dropped during NEG avoidance.

⚠ If the subject inherently corrects wrong views (theurgy, Goethe's epistemology, Steiner's higher knowledge, any essay about correcting a modern misconception), the FULL workshop protocol is mandatory over the algorithm shortcut. The algorithm's NEG-avoidance rule is too blunt for subjects where negation is baked into the core claim.

### 3.5 The One-Sentence-at-a-Time Rule

```
1. Change ONE sentence
2. Close the file
3. Re-read the surrounding 2-3 blocks
4. Did the fix introduce a new pattern?
   → Yes → undo and try a different approach
   → No → move to the next violation
```

---

## Phase 4: Texture Injection (Pass 3 — Pulse)

This pass adds what pattern elimination cannot produce: surprise, commitment, and the sense that a person wrote this.

### 4.1 Concrete Noun Replacement

Scan every abstract noun. Replace where possible:

```
ABSTRACT           → CONCRETE
"quality"          → "colour, grain, texture"
"capacity"         → "reach, range"
"the world"        → "terrain, landscape, ground"
"understanding"    → "sight, touch, grip"
"transformation"   → "unfolding, ripening, burning"
"connection"       → "thread, bridge, hinge"
"perception"       → "eye, ear, skin"
"knowledge"        → "light, taste, scent"
```

**Constraint:** Every AI block must contain at least one unexpected concrete noun.

### 4.2 Sentence Rhythm Adjustment

```
IF all sentences 50-70 chars:
    → Add one fragment (<25 chars) at position 2
    → Expand one sentence to >90 chars with an em-dash

IF all >80 chars:
    → Split one into two shorter ones

IF all <40 chars:
    → Combine two into a single dash-construction
```

**The pulse formula:** A healthy block has a sequence like `15-80-40-120-25`. Max should be ≥ 4× min.

### 4.3 Em-Dash Restructure

For each block with <40% dash constructions:

```
REWRITE one flat sentence as:
    [Subject] [verb] [object] — [qualification or inversion]
```

**Example:**
- Flat: "Allegory is rational. It takes what is already known."
- Dashed: "Allegory is rational — it takes what is already known and dresses it in different clothes."

### 4.4 Unexpected Word Placement

Select 1 word per AI block from:

```
thrum, whet, flint, salt, gravid, lattice, silt, tendril, sheen,
incandescent, striate, scored, seam, whetted, scorch, flake, seal,
thread, hinge, spill, woven, gravid, incandescent
```

**Placement rule:** The word should feel slightly out of register for academic writing — more like poetry or craft — but precisely right for the imaginal context.

### 4.5 Fix Overcorrections from Phase 3

If a sentence follows all rules but has no pulse, it's an overcorrection. Add one concrete noun or vivid verb to restore life.

- DEAD: "The observer is entangled with what is observed — participation is the condition of perception."
- ALIVE: "The observer is entangled with what he beholds — participation is the condition of perception."

One word difference ("beholds" instead of "is observed") changes the entire feel.

### 4.6 Rumi Sprinkle (Final Texture Layer)

After all Phase 4 steps pass, before verification. This is the LAST pass — do not restructure, add claims, or change the argument.

Read `essaygen/rumiengine.md` for the full technique reference. Apply only these six checks:

1. **Register shift at 2/3 point.** Read the essay as a single movement. If the register is uniform, add a shift at the 2/3 mark — from analysis to image, from imperative to invitation, from abstract to concrete.

2. **One abstract noun → physical tether per block.** Replace one abstract noun per AI block with a concrete image from the source material. Not "transformation" but "rot before it can fruit."

3. **One fragment per block.** Check for a sentence that could land harder as a fragment without a verb.

4. **One paradox if entirely consistent.** If the essay never contradicts itself, add one place where two incompatible truths are held together.

5. **Sound check.** Read aloud. If any sentence is predictable in shape before you reach the end of it, rewrite.

6. **Ending isolation.** Read only the last 2 AI blocks. If they could end any essay in the series, rewrite. The ending must be specific to THIS essay and open outward.

### 4.7 The Ending Rewrite

```
1. Identify opening block's core claim (3 words)
2. Write a closing sentence using those 3 words in a NEW way
3. DELETE the closing sentence
4. Write a new closing that says the same thing WITHOUT the 3 words
5. Verify: closing shares 0 key content words with the last source passage's ending
```

**Self-prompt:** *"Does this ending circle back to the opening or does it tagline? If it sums up, it's dead. A good ending opens the essay back into the world. A tagline closes it."*

### 4.7 Texture Placement

Texture words must appear at STRUCTURAL PIVOT POINTS, not scattered arbitrarily:
- At least one texture word in the opening line of the first AI block
- At least one texture word immediately after an em-dash (the pivot)
- At least one texture word in the closing line of the final AI block

A texture word at a pivot point does 10× the work of one buried mid-sentence.

### 4.8 Rumi Sprinkle (Final Texture Layer)

After all Phase 4 steps pass, before verification. This is the LAST pass — do not restructure, add claims, or change the argument.

Read `essaygen/rumiengine.md` for the full technique reference. Apply only these six checks:

1. **Register shift at 2/3 point.** Read the essay as a single movement. If the register is uniform, add a shift at the 2/3 mark — from analysis to image, from imperative to invitation, from abstract to concrete.

2. **One abstract noun → physical tether per block.** Replace one abstract noun per AI block with a concrete image from the source material. Not "transformation" but "rot before it can fruit."

3. **One fragment per block.** Check for a sentence that could land harder as a fragment without a verb.

4. **One paradox if entirely consistent.** If the essay never contradicts itself, add one place where two incompatible truths are held together.

5. **Sound check.** Read aloud. If any sentence is predictable in shape before you reach the end of it, rewrite.

6. **Ending isolation.** Read only the last 2 AI blocks. If they could end any essay in the series, rewrite. The ending must be specific to THIS essay and open outward.

---

## Phase 4.9: Holistic Texture — The Essence Layer

Stop counting. Stop checking. Read the essay as a single movement — a piece of music, not a checklist.

This pass is not about correctness. The essay is already correct. This is about letting the unique life of each essay emerge through minimal, intuitive adjustments.

### 4.9.1 Read the Whole Essay as One Breath

Read every AI block in sequence, without stopping. Feel the arc:

```
Does it rise, crest, and land?
Or does it stay flat the whole way through?

Where does it breathe? (pause, fragment, silence)
Where does it press? (longer sentence, accumulating clauses, intensity)
Where does it surprise? (unexpected word, rhythm shift, turn)
```

**Self-prompt:** *"Read the essay from first AI to last as if you were listening to someone speak. Where does the voice grab you? Where does it fade into background noise? Mark only those two spots — the peak and the lull. The rest is already fine."*

### 4.9.2 Find the One Word That Wants Replacing

For each AI block, identify exactly one word that is:
- Correct but colourless ("thing" → "texture")
- Abstract when it could be physical ("transformation" → "ripening")
- Academic when it could be sensory ("perception" → "touch")

Change ONLY that word. Do not touch the sentence structure. Do not add new clauses. A single word replacement can change the temperature of the whole block.

**Self-prompt:** *"In each AI block, find the most forgettable word. Replace it with a word that has weight — a word that would feel wrong in any other essay. One word per block. No more."*

### 4.9.3 Listen for the Dominant Metaphor

Read the whole essay. Does the dominant metaphor from Phase 1.1 appear naturally, or was it forced?

```
IF the metaphor appears only once:
    → Strengthen one existing sentence with metaphor vocabulary
    
IF the metaphor appears in every block:
    → The voice is consistent. Leave it.

IF the metaphor never appears:
    → The voice target was forgotten. Add one metaphorical word to the block
      where the essay's central claim is stated.
```

**Self-prompt:** *"What physical thing does this essay feel like? Read each AI block and ask: 'If this block were a texture, would it be stone, water, fire, or air?' If all four blocks feel like the same texture, the voice is working. If each feels different, the voice is scattered."*

### 4.9.4 Test the Cadence with Your Finger

Tap your finger as you read each AI block aloud. A tap per stressed syllable. Feel where the rhythm is: even (lecture), jagged (life), or loping (meditation).

```
EVEN (────): All sentences same length. Add one fragment.
JAGGED (▄▄▄ ▄ ▄▄▄▄▄ ▄ ▄): Already alive. Leave it.
LOPING (▄▄▄ ▄▄▄ ▄▄ ▄▄ ▄): Too many medium-length sentences. Need one short + one long.
```

**Self-prompt:** *"Read the essay tapping your finger. If the taps are evenly spaced, the rhythm is dead. If they cluster and scatter — short beat, long beat, pause, three quick beats — the essay is breathing. If the rhythm is dead, replace one medium sentence with a fragment and one with a dash-construction. Nothing else."*

### 4.9.5 The Friction Check

Read the essay one final time. Do not look for patterns. Look for friction — places where your attention snags:

```
Friction = a word that doesn't belong in this essay's register
Friction = a sentence that is too long for what it says
Friction = a metaphor that contradicts the dominant one
Friction = a rhythm that breaks the flow (not on purpose)
```

If you find friction, smooth it with a single word change or a comma. Do not rewrite the sentence.

**Self-prompt:** *"Read the essay as if you're running your hand over a piece of wood. Where does it catch? Sand that spot — one word change, one comma, one syllable. Then stop."*

### 4.9.6 The Essence Question

After all adjustments, sit with the essay and ask:

```
Does this essay feel like it had to be written?
Or does it feel like it could have been written by anyone about anything?

If it feels interchangeable with any other essay in the series:
    → The voice target was not strong enough. Revisit Phase 1.1.

If it feels like THIS essay — like the subject demanded exactly these words:
    → The essence has emerged. The essay is complete.
```

**Self-prompt:** *"Close your eyes. Summarise the essay in one sentence. If that sentence could describe any essay in this series, start over. If it could only describe this one, you're done."*

### Limits

This phase has hard boundaries:

| Do | Do Not |
|----|--------|
| Change 1 word per block | Rewrite entire sentences |
| Adjust one comma or dash | Restructure paragraphs |
| Replace one abstract noun | Add new clauses or claims |
| Read aloud and feel the rhythm | Count anything |
| Trust your intuition | Run a checklist |

**If you find yourself rewriting whole passages, you have left Phase 4.7 and returned to Phase 2. Stop. Close the file. Re-read this section.**

---

## Phase 5: Verification + Checksum

### 5.1 Structural Checksum

```
___/__ Structural
  Body ends with AI (never Source)              YES/NO
  AI blocks: 10-18                               ___
  Source passages: 4-6                           ___
  AI block lengths: 100-400 chars                YES/NO
  Source block lengths: 300-900 chars (each ≥200 verbatim author quote)
  Art blocks: ≥3                                YES/NO
```

### 5.2 Pattern Checksum

```
___/__ Pattern Elimination
  NEG count (all 9 disguised forms):             ___
  3LIST count (including 4-item and chains):     ___
  NARR count:                                    ___
  Sentences starting with "Not":                 ___
  PARA count (removable AI blocks):              ___
  CLICHÉ count:                                  ___
  FLAT count (blocks without rhythm variety):    ___
  
  NEG_3LIST_NARR_RATE = (NEG + 3LIST + NARR) / total_AI_sentences
  
  IF rate > 0.05 (5%): FAIL. Return to Phase 3.
  IF ANY individual count > 0: FAIL. Return to Phase 3.
```

### 5.3 Voice Checksum

```
___/__ Voice
  Dominant metaphor consistent across all AI:    YES/NO
  Concrete noun in every AI block:               YES/NO
  "The" first-word rate ≤40%:                    YES/NO
  Em-dash in ≥40% of AI sentences:               YES/NO
  Sentence length ratio (max/min) ≥ 3×:          YES/NO
  ≥1 genuinely alive line:                       YES/NO
  
IF ANY FAILS: Return to Phase 4.
```

### 5.4 Ending Checksum

```
___/__ Ending
  Circles back to opening TRANSFORMED (not restated):  YES/NO
  Zero key words shared with source ending:            YES/NO
  Uses essay-specific concrete image:                  YES/NO
  
IF ANY FAILS: Return to Phase 4.6.
```

### 5.4.1 Ending Cold Read (mandatory separate pass)

After passing 5.4, close the file. Wait 30 seconds. Open ONLY the last 1-2 AI blocks. Do not read anything else.

1. Could this ending end any essay in the series? If yes → FAIL. Rewrite.
2. Does it sum up rather than open outward? If yes → FAIL. Rewrite.
3. Does it share key content words with the last source passage? If yes → FAIL. Rewrite.
4. Does it circle back to the opening image TRANSFORMED (not just restated)? If NO → FAIL. Rewrite.

The ending MUST be verified in isolation because the surrounding context masks its weaknesses.

### 5.5 Cross-Essay Checksum (Series Only)

```
___/__ Cross-Essay
  First AI block structure differs from others:  YES/NO
  Topic name starts ≤2 AI blocks:                YES/NO
  Metaphor distinct from other series essays:    YES/NO
  
IF ANY FAILS: Return to Phase 1.
```

### 5.6 Interchangeability Test

Take the opening AI block of this essay and the opening AI block of another essay in the same series. Swap them. Ask:

- Would a reader notice the swap?
- Could the swapped opening lead naturally into the other essay's source block?

If "no" to both (the swap is undetectable), the essays do not have distinct voices. Return to Phase 1.1 and set a stronger voice target — a more specific, sourced physical metaphor.

This is the single best diagnostic for voice distinctiveness. Most Tier 2 essays fail this test because their openings follow the [Author][verb][abstract claim] pattern.

### 5.7 The Magic Test

```
READ each AI block aloud.

For each sentence, ask:
    "Did I know this sentence was coming before I read it?"

IF YES (predictable): → Mark as DEAD. Return to Phase 4 for this block.
IF NO (surprising):   → Mark as ALIVE.
```

**Alive indicators:**
- Unexpected concrete noun ("a brushwood fire to the senses")
- Rhythm change mid-block ("Broken. Imperative. Symbolic.")
- A fragment that lands hard ("Integration costs something.")
- A sentence that ends differently than it began

**Threshold:** At least 2 ALIVE lines in the entire essay. If 0, return to Phase 4.

---

## Phase 6: Output

### 6.1 Write the JSON

Minimum 10 AI blocks. Minimum 4 source passages. Minimum 3 art blocks.

```json
{
  "id": "kebab_case_slug",
  "title": "Title — Subtitle",
  "type": "condensed_source",
  "source_ids": ["source_id"],
  "author": "Author Name",
  "concepts": ["Concept1", "Concept2", "Concept3"],
  "body": [
    {"kind": "ai", "text": "..."},
    {"kind": "source", "text": "..."},
    {"kind": "art", "art_id": "art_name", "caption": "..."}
  ],
  "art": ["art_id1", "art_id2", "art_id3"]
}
```

### 6.2 Art ID Selection

Match existing art IDs to essay concepts. Caption must describe what the image illustrates in relation to the essay's **specific claim**, not just what the image depicts.

**Bad:** "A Renaissance diagram of the cosmos."
**Good:** "The macrocosm as continuous production — the world held in divine power at every level."

### 6.3 Deploy

```bash
cp essaygen/workshop/{name}_v6.json content/glossary/essays/
node scripts/generate-graph-json.mjs
npm run generate:audio -- {essay-id}
npm run cf:deploy
```

---

## Quick Reference Card

### The 7 Patterns

| Tag | Pattern | Looks Like | Why It's Bad | Fix |
|-----|---------|-----------|-------------|-----|
| NARR | Narration | "X opens with..." | Reader came for ideas, not tour guide | Delete first clause |
| NEG | Neg-assert | "Not X, but Y" | Reader intuits correction before content | Assert directly |
| 3LIST | Three-list | "A, B, and C" | Items blur, no weight | Pick one, develop it |
| PARA | Paraphrase | AI restates source | Wastes reader's time | Add new info or delete |
| FLAT | Uniform length | All 25-35 words | Prose drones | Add fragment + long dash |
| CLICHÉ | Self-help | "Power of now" | Breaks historical register | Delete |
| SAME-ENDING | Echoes source | Final words match | Ends on author, not commentator | Rewrite entirely |

### The 9 NEG Disguises

```
Fragment: "Not X. Y."
Clause: "X, not Y"
Imperative: "Forget X. Y."
Condition: "Without X, Y."
Substitution: "Instead of X, Y"
Lack: "What X lacks is Y"
Insufficiency: "X alone cannot Y"
Comparison: "The difference between X and Y..."
Staging: "Wrong idea. Right idea."
```

### The 5 NARR Disguises

```
"The paper opens with..."       (self-narration)
"X introduces..."               (author-narration)
"This section examines..."      (section-narration)
"We now turn to..."             (collective-narration)
"What follows is..."            (preview-narration)
```

### The Semantic Inversion Warning

```
REMOVING "NOT" CAN REVERSE MEANING.
After every NEG fix, ask: "Does my new sentence mean what I intended?"

BAD:  "The eye is a passive receiver" (removed "not" — said OPPOSITE)
GOOD: "The eye participates in what it sees" (positive assertion)
```

### The Ending Algorithm

```
1. Identify opening's core claim (3 words)
2. Write closing using those 3 words in a NEW way
3. DELETE the closing
4. Write new closing WITHOUT the 3 words
5. Verify: 0 key words shared with source ending
```

### The Magic Test

```
Read aloud. If you can predict the next sentence's shape, it's dead.
```

---

## Version History

| v | Change | Date |
|---|--------|------|
| 1.0 | Initial synthesis: 10-stage protocol + axioms + pattern catalog | July 2026 |
| 1.1 | Added semantic inversion warning from algorithm testing | July 2026 |
| 2.0 | Minimum 10 AI blocks. Removed "condensed" category. Added Source Block Rule (verbatim ≥200 chars), Texture Placement Check, Semantic Inversion Check, Interchangeability Test, Ending Cold Read pass. Reweighted grading: C1 20→10%, C7 15→25%, C6 10→15%, new C8 Source Integrity 5%. | July 2026 |
