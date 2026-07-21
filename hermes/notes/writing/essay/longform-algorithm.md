# Algorithm V7 — Long-Form Commentary Protocol

A modification of Algorithm V6 for writing extended scholarly essays (3,000–8,000 words). Based on analysis of Angela Voss's PhD thesis *"Magic, Astrology and Music: the background to Marsilio Ficino's astrological music therapy and his role as a Renaissance magus"* (1992) against the V6 pattern-detection framework.

---

## Why V6 Doesn't Map Directly to Long-Form

V6 was designed for short AI commentary blocks (100–400 chars) alternating with source quotes. The 7 patterns (NARR, NEG, 3LIST, PARA, FLAT, CLICHÉ, SAME-ENDING) are anti-patterns for that format. They catch the signals of automated generation.

Voss's thesis breaks every V6 rule — and that's precisely why it works. A V6-style cold read of her introduction would flag:

- **NARR**: "In this chapter I shall be exploring..." / "The first two cover..." / "I shall consider..."
- **NEG**: Entire sections built around correcting Kaske, Walker, and Garin by name
- **3LIST**: "Intellectual rigour and clarity and intuitive, mystical revelation" / "health of mind, soul and body"
- **FLAT**: Many sentences 30-50 words with academic register
- **PARA**: Extended paraphrase of Plato's Timaeus before quoting it

Yet her prose is alive, committed, and rigorous. The difference: her patterns are **chosen** where V6 patterns are **fallen into**.

### The Core Distinction

| Pattern | V6 (Short Commentary) | Voss (Long-Form Thesis) |
|---------|----------------------|------------------------|
| NARR | Crutch — writer can't assert directly | Structure — reader needs orientation across pages |
| NEG | Scaffolding — writer clears ground because nothing to build | Weapon — writer corrects specific scholarly errors with evidence |
| 3LIST | Flat enumeration — items have no weight | Accumulation — items build toward a claim |
| PARA | Wasted space — source says it better | Rare — she quotes then analyzes, doesn't restate |
| FLAT | Droning uniformity | Variable — short for emphasis, long for complexity |
| CLICHÉ | Self-help jargon | None — fully embedded in historical register |
| Personal stake | Forbidden (narrates the writer) | Structural — "this thesis has been a personal journey" |
| Scholarly dialogue | Absent | Central — engages Kaske, Walker, Garin by name |

---

## The V7 Principles: Modified for Long-Form

### Principle 1: Narration is Structural, Not a Crutch

V6 says: zero tolerance for NARR. Delete the narration clause.

V7 says: narration is necessary for extended argument. The reader needs to know where they are across 5,000 words. The test is not "does this sentence narrate?" but "is this narration doing orienting work, or is it padding?"

**Good narration** (Voss):
- "In this chapter I shall be exploring the common sources and roots of such a hypothesis..."
- "The first two cover the background to Ficino's thought, the second two present his own attitudes..."
- "We shall return to the role of daemons in the theurgy of Iamblichus later in this chapter..."

These orient without substituting for content. They tell the reader where they are in the argument without trying to be the argument.

**Bad narration** (V6 anti-pattern):
- "The paper opens with alchemy..."
- "This section examines the role..."
- "What follows is an analysis of..."

The test: does the narration clause do real orienting work across a long document, or is it a throat-clearing substitute for a direct claim?

**Rule**: One orienting sentence per 500 words maximum. The rest must be claim, evidence, or analysis.

---

### Principle 2: Negation is a Weapon, Not a Crutch

V6 says: zero tolerance for NEG. All 9 disguised forms are banned. Assert without negating.

V7 says: negation is essential when your argument CORRECTS a specific wrong view. The V6 exception in §3.4 already acknowledges this: "If the subject inherently corrects wrong views, the FULL workshop protocol is mandatory."

Voss's introduction is built on NEG — she spends pages correcting Kaske's misreading of Ficino's astrology. But her NEG is different from the V6 anti-pattern:

**Voss-style NEG** (effective):
- Specific target named by name: "Carol Kaske, who in her Introduction... mistranslates the very title"
- Evidence provided: "She assumes that Ficino shows 'two outright denials of astrology'..."
- Counter-claim stated positively: "For Ficino, intuitive vision must be a complement to rational thought-processes..."

**V6 anti-pattern NEG** (weak):
- Vague target: "Not X, but Y"
- No evidence for why X is wrong
- Negation as substitute for positive claim

**Rule**: Every NEG must have:
1. A named source or specific position (not a straw man)
2. Evidence for why it's wrong
3. A positive claim stated after the negation

If any of the three is missing, the NEG is a crutch. Rewrite.

---

### Principle 3: Lists Must Accumulate, Not Enumerate

V6 says: zero tolerance for 3LIST. Pick one item and develop it.

V7 says: lists work when they accumulate toward a claim rather than enumerating parallel items. The difference is momentum.

**Accumulation list** (Voss style):
- "metals, gems, plants, scents, foods, animals, appearances, practices, habits, light, thought, love" — each item extends the category, building a picture of totality
- "intellectual rigour and clarity and intuitive, mystical revelation" — two poles held together, not three flat items

**Enumeration list** (V6 anti-pattern):
- "gods, angels, and daimons" — three parallel items, no weight, no development

**Rule**: A list is acceptable if:
1. Items are unequal in length or weight
2. The list builds toward a claim (accumulation, not catalogue)
3. No list has exactly three grammatically parallel items

If any item could be removed without loss, the list is enumeration. Collapse it.

---

### Principle 4: Paraphrase is Preparation for Analysis

V6 says: zero tolerance for PARA. Every AI block must add what the source doesn't say.

V7 says: paraphrase is necessary when you need the reader to understand the source before you analyze it. The rule is not "no paraphrase" but "paraphrase must earn its keep by enabling analysis that wouldn't make sense without it."

Voss paraphrases Plato's Timaeus for 5 lines, then quotes it for 17 lines, then spends 15 lines analyzing it. The paraphrase sets up the quote; the quote sets up the analysis. The ratio is roughly 1:3:3 (paraphrase : quote : analysis).

**Rule**: For every line of paraphrase, provide at least two lines of analysis that depends on it. If you can cut the paraphrase and the analysis still works, cut the paraphrase.

---

### Principle 5: Flatness is a Register, Not a Failure

V6 says: FLAT is uniform sentence length. Add fragments.

V7 says: academic prose has a different baseline rhythm than commentary prose. Long sentences of 30-50 words are expected in scholarly writing. The problem is not length but predictability.

Voss's sentences range from 10 words ("We cannot discount the possibility...") to 60+ words (complex clauses with semicolons). But they're structured — she varies rhythm deliberately.

**Rule**: Check not for length but for predictability. Read a paragraph aloud. If you can predict the next sentence's shape, rewrite. The fix is not "add fragments" but "vary the structural pattern": declarative → question → complex → short → pivot.

**Rhythm targets for long-form**:
- Every paragraph needs at least one sentence under 15 words
- Every paragraph needs at least one sentence over 45 words
- Sentence openings must vary (not "Ficino" / "He" / "This" on repeat)

---

### Principle 6: Personal Stake is the Engine

V6 says: no meta-narration. The writer should not appear.

V7 says: the writer's stake is what makes scholarship alive. Voss opens: "The writing of this thesis has, in many ways, been a personal journey of deepening experience and psychological integration. Over the past seven years (a cycle of Saturn) Marsilio Ficino has assumed the role of a daimon..."

This is not self-indulgence. It's a claim about the kind of knowing required to understand Ficino — participatory, symbolic, embodied. The personal stake IS the methodology.

**Rule**: Each essay needs a "why this matters to me" moment. One paragraph maximum, placed early. It must serve the argument, not replace it. If you can remove it and the argument survives, it's not doing its job.

---

### Principle 7: Scholarly Dialogue Gives the Argument Edge

V6 has no category for scholarly dialogue. The commentary exists in a vacuum.

V7 adds: every essay must engage at least one secondary source by name. Not "some scholars argue" — a named source with a specific position. Agree or disagree, but engage.

This does three things:
1. Positions your argument in an existing conversation
2. Prevents vague straw-man NEG
3. Gives the reader a sense of real stakes

**Rule**: Each essay needs at least one named scholarly interlocutor. If you agree with them, extend their argument. If you disagree, cite their specific claim and state your counter-evidence. No vague "some have said" framing.

---

### Principle 8: The Ending Opens Outward

V6 says: ending must not echo the source. Circle back to the opening, transformed.

V7 keeps this but adds: for long-form commentary, the ending should open into a wider implication. Voss ends her introduction not with a summary but with a challenge — the reader is now prepared to see Ficino differently. The ending should make the reader feel the essay continues after they stop reading.

**Rule**: The final paragraph should:
1. Not summarize (the reader was paying attention)
2. Point to something beyond the essay's scope
3. Change the register slightly — from analysis to invitation, from evidence to implication

---

## The V7 Workflow

### Phase 0: Source Immersion

Read the primary source until you can explain its structure in 3 sentences without looking. Read the key secondary scholarship (at least one named source). Know whose reading you're correcting or extending.

### Phase 1: Argument Mapping

Before writing, map the essay's argument arc:

```
OPENING: hook + stake + thesis
SETUP: what the reader needs to know
CLAIM 1: evidence → analysis → implication
CLAIM 2: evidence → analysis → implication
CLAIM 3: evidence → analysis → implication
COUNTER: named interlocutor → their claim → your response
RESOLUTION: synthesis + wider opening
```

Each claim block should follow: primary source quote (1 part) → your analysis (2 parts) → implication for the argument (1 part).

### Phase 2: Write (Accept Slop)

Write the full essay in one pass. Do not try to be good. Get the argument down. Long-form writing needs the whole arc visible before refinement makes sense — otherwise you polish a paragraph that gets cut.

### Phase 3: Identify (Cold Read)

Read the essay as if someone else wrote it. Mark:

**V6 patterns to eliminate** (zero tolerance as in V6):
- 3LIST: exactly three parallel items without development
- CLICHÉ: modern self-help language in premodern context
- PARA: paraphrase without analysis (if cut, nothing lost)
- SAME-ENDING: closing echoes the source's final words

**V7 patterns to evaluate** (not zero tolerance — check for purpose):
- NARR: is each narration doing orienting work? Max one per 500 words.
- NEG: does each negation have a named target + evidence + positive claim?
- FLAT: read aloud. Predictable rhythm? Add a short sentence, a long one, a pivot.
- Personal stake: does it serve the argument or is it decoration?
- Scholarly dialogue: named source with specific engagement?

### Phase 4: Repair (One Sentence at a Time)

Follow V6's one-sentence-at-a-time rule. Fix the ending FIRST. Then proceed through the V7 evaluation checklist above.

After each fix, verify: did the fix create a new pattern? Undo if yes.

### Phase 5: Texture

V6's texture pass (concrete nouns, unexpected words, overcorrection fixes) applies directly. Additionally:

- Check for dead metaphors: replace academic deadwood ("it is important to note") with something alive
- Read aloud for rhythm: mark where your ear catches and where it glides
- One unexpected word per paragraph (not per block — long-form has paragraphs, not blocks)

### Phase 6: Verification

Run these checks:

| Check | Target |
|-------|--------|
| Named scholarly interlocutor | ≥1 |
| Personal stake moment | ≤1 paragraph, early |
| Ending opens outward (no summary) | yes |
| NEG with named target + evidence | all NEG instances |
| Predictable rhythm when read aloud | 0 |
| Dead metaphors | 0 |
| Source-to-analysis ratio | ≤1:2 (1 part source, 2+ parts analysis) |
| Interchangeability with other essays | fail = rewrite opening |
| Lines genuinely alive | ≥3 |

---

## Summary: What Changes from V6

| Dimension | V6 | V7 |
|-----------|----|----|
| Format | Short blocks (100-400 chars) | Extended paragraphs (500-2000 words) |
| NARR | Zero tolerance | Orienting narration permitted (≤1 per 500 words) |
| NEG | Zero tolerance | Permitted with named target + evidence + positive claim |
| 3LIST | Zero tolerance | Accumulation lists permitted (must build, not enumerate) |
| PARA | Zero tolerance | Permitted if ≤1:2 ratio with dependent analysis |
| FLAT | Add fragments | Add structural variation (short/long/pivot) |
| Personal stake | Forbidden | Required (1 paragraph, must serve argument) |
| Scholarly dialogue | Absent | Required (≥1 named source) |
| Source embedding | Short quotes (300-900 chars) | Long quotes (up to 20 lines) with analysis |
| Ending | No echo source | Opens outward, no summary |
| Rhythm | Block-level (20-60-20) | Paragraph-level (variable, read aloud) |
