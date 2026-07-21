# Source Extraction Protocol — From Source Text to Thesis Essay

## Why This Exists

The Iamblichus essays failed because the source material was extracted as *short quotes* rather than *full passages*. The essays were then written as commentary *about* the source rather than as arrangements of the source speaking. The ratio inverted from the required 60/25/15 (source/framing/analysis) to roughly 10/30/60.

This document codifies the correct process so no future thesis project repeats that failure.

---

## Phase 0: Reference the Gold Standard

Before extracting a single passage, read the Ficino essays at:
`essayglobal/blueprints/Ficino - Three Books on Life/`

Study especially:
- `00-orientation-ficinos-world/essay.md` — 175 lines, ~18 source passages with Latin
- `05-food-putrefaction-gold-milk-blood/essay.md` — 103 lines, ~12 passages with Latin
- `12-genius-vocation-place/essay.md` — 303 lines, ~25+ passages with Latin/Plato/Plotinus

**The Ficino ratio is the target.** Every essay should feel like the source author is carrying the argument, with commentary as connective tissue.

---

## Phase 1: Map the Source Text

### 1.1 Identify the source document

The source is a primary text (PDF, markdown extraction, or book). It has chapters, sections, or natural divisions.

### 1.2 Map the territory

Create a chapter-by-chapter index of the source text. For each chapter, note:
- What it covers
- What key terms/names appear
- What passages are self-contained thought-units (paragraphs or groups of paragraphs)

### 1.3 Align with the blueprint

The blueprint tells you which source chapters feed which essay. For example:
- Essay 1 ← Introduction §§1-3
- Essay 2 ← Part One, Ch. I
- Essay 3 ← Part One, Ch. II
- etc.

Do NOT deviate from the blueprint's territory assignments. Each essay owns its source territory.

---

## Phase 2: Extract Full Passages (The Critical Phase)

### 2.1 Extract EVERY passage, not short quotes

For each natural thought-unit in the source that bears on the essay's subject:

1. Copy the **full paragraph or passage** — not a sentence, not a summary. If the passage is 40 lines, copy all 40 lines.
2. Keep the exact wording from the source. Do not paraphrase, condense, or modernize.
3. Preserve all original language terms (Latin, Greek, Arabic, Persian, etc.) inline with translation.
4. Add the source reference (chapter/section/page).

**Bad** (what we did with Iamblichus the first time):
```markdown
**Iamblichus' own words**: "An innate knowledge of the Gods is coexistent with our very essence... prior to reason and demonstration."
```

**Good** (what the Ficino essays do):
```markdown
"In the first place, therefore, you say, 'it must be granted that there are Gods.' Thus to speak, however, is not right on this subject. For an innate knowledge of the Gods is coexistent with our very essence; and this knowledge is superior to all judgment and deliberate choice, and subsists prior to reason and demonstration. It is also counited from the beginning with its proper cause, and is consubsistent with the essential tendency of the soul to the good."
```

### 2.2 Flag all original-language terms

For every key term in the original language:
- Extract it with diacritics
- Provide a gloss or translation
- Note any terms that have multiple meanings crucial to the argument

**Format**: `Ἔμφυτος γνῶσις (emphyton gnōsis — innate knowledge)`

### 2.3 Write analysis for each passage

For each extracted passage, write:
1. **Context** — What the reader needs to know before encountering the passage (2-5 sentences)
2. **Analysis** — What the passage means and why it matters for the essay (3-7 sentences)
3. **Cross-references** — How this passage connects to other essays in the series

The analysis should be equal to or longer than the passage. But in the essay, the passage should dominate.

### 2.4 Create the extraction status table

| Passage | Source Location | Original Language | Status |
|---------|-----------------|-------------------|--------|
| Hermes invocation | I.1 | Greek | Extracted |
| Method rule | I.2 | Greek | Extracted |
| Innate knowledge | I.3 | Greek | Extracted |

---

## Phase 3: Write sourcematerial.md

### 3.1 File format

```markdown
# Source Material — Essay N: Title

**Chapters covered**: Book.Chapter(s)
**Length tier**: Short (100-200) / Medium (200-300) / Long (300-400)

---

## Passage N.1 — Descriptive Title

**Source**: *Work* Book.Chapter

**Context**: [2-5 sentences]

**Full passage**:

[The complete passage from the source, preserving all original language]

**Original terms**: [key terms in original language with glosses]

**Analysis**: [3-7 sentences explaining what the passage means and why it matters]

**Cross-references**: [how this connects to other essays]
```

### 3.2 Saturation rule

Do not start writing the essay until the sourcematerial is saturated — meaning you cannot find any more passages in the assigned source territory that bear on the essay's subject.

**Test**: Read the source material aloud. If you can hear the source author's voice distinctly, the saturation is working. If all passages sound the same, you need more variety. If you're unsure whether a passage belongs, extract it — you can always cut it later.

---

## Phase 4: Write the Essay

### 4.1 The 60/25/15 ratio

- **60% source text**: The author's own words, at full length with original language
- **25% framing**: Context, orientation, connective tissue between passages
- **15% analysis**: What the passage means and why it matters

Count lines to verify. For every line of commentary, you need at least two lines of source.

**Test**: Read only the source blocks of the finished essay. They should form a coherent argument by themselves. If they don't, you haven't included enough source.

### 4.2 Insert source material at useful points

Place each full passage where it does the most work:
- Use a source passage to *make the claim*, not to *illustrate the commentary*
- The source author should be the one advancing the argument
- Commentary should set up the passage, not replace it

**Wrong**: "Iamblichus believed the soul has innate knowledge of the gods. This is shown in I.3 where he says 'An innate knowledge...'"

**Right**: Iamblichus states the principle directly:
> [Full passage from I.3]
This is the foundation on which everything else rests.

### 4.3 Embed original language throughout

Every major claim by the source author should have an original-language anchor. This is not decoration — it changes the register, provides scholarly weight, and lets the listener hear the period.

**Format**: KEY TERM FOLLOWED BY ENGLISH:
*Ἔμφυτος γνῶσις. Innate knowledge.*

Place these as rhythmic punctuation throughout the essay, not clustered in one section.

### 4.4 Build cross-references

Each essay should explicitly reference at least 2-3 other essays in the series. This creates the sense of a cumulative argument.

**Example**: "This principle prepares the discussion of sacred names in Essay 7."

---

## Phase 5: Compare Against the Gold Standard

### 5.1 The Ficino checklist

After writing each essay, compare it to the Ficino essays:

| Criterion | Ficino Target | Your Essay |
|-----------|---------------|------------|
| Source passages | ≥12 per essay | ___ |
| Original language anchors | ≥8 per essay | ___ |
| Chapters drawn from | ≥3 different chapters | ___ |
| Source-to-commentary ratio | ≥50/50 | ___ |
| Cross-references to other essays | ≥3 | ___ |
| No padding boilerplate | 0 instances | ___ |
| Ending opens outward (no summary) | Yes | ___ |
| Original language as structural device | Yes | ___ |

### 5.2 The cold read

1. Close the file
2. Wait 30 seconds
3. Open only the source passages (search for blockquote markers or original language)
4. If the source passages alone don't tell a coherent story, more source is needed
5. If the commentary could be swapped into any essay in the series, the voice is not distinct enough

---

## Phase 6: What NOT to Do (From Iamblichus Failure Post-Mortem)

### 6.1 Don't extract short quotes

A 15-word quote is useless. A 150-word passage with original language carries weight. The sourcematerial should have FULL paragraphs.

### 6.2 Don't write the essay before saturating the sourcematerial

The sourcematerial is the foundation. If it's thin, the essay will be thin. Do not start writing until you cannot find another passage that belongs.

### 6.3 Don't pad with commentary

"When the essay needs to be longer, add more source — not more analysis." (claude5.md)

If the essay is too short, go back to the source text and find MORE passages. Do not expand the commentary.

### 6.4 Don't leave meta-commentary in the essay

"This is a substantial addition to bring the essay toward its target length..." — NEVER. This is a contamination marker. Delete it immediately.

### 6.5 Don't repeat paragraphs

If you find yourself restating the same point in different words, you've stopped adding content and started padding. Delete the duplicate and find a new source passage.

### 6.6 Don't end with the same tagline across essays

"The path is open" appearing in multiple essays is SAME-ENDING. Each essay's ending must be unique and open outward.

### 6.7 Don't forget cross-references

An essay that doesn't reference other essays in the series feels like an isolated document, not part of a companion.

---

## Phase 7: Verification Pass

After the essay is written:

1. **Count the source lines**: For each 10 lines of commentary, there should be at least 15 lines of source.
2. **Count original-language anchors**: Aim for 1 per 30 lines of essay.
3. **Check the ending**: Does it open outward or summarize? If it begins with "In conclusion," rewrite it.
4. **Read aloud**: Any sentence that sounds like a footnote or list entry must be rewritten.
5. **Cross-essay check**: Read the first 3 sentences of this essay and the first 3 of another essay in the series. Could they be swapped without detection? If yes, the voice isn't distinct enough.
6. **Verify all cross-references**: Every mentioned essay should actually exist and the claim should be accurate.
