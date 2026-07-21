# Source Material Extraction Protocol — From Primary Text to 20 Essays

**Consolidated from**: thesismaster.md, sourceextraction.md, 3booksthesis.md (Ficino), claude5.md, and practical learnings from the Avicenna companion build.

This document codifies how to take a primary source text and build a complete essay companion from scratch — with zero overlap, maximum source density, and the source author's voice dominating throughout.

---

## Phase 0: Content Priority Assessment

Before mapping anything, establish what the user cares about most. Different source texts have different centers of gravity. Ask or infer:

**HIGH SIGNAL** (prioritize, give more essays, deeper extraction):
- Imaginal ontology / mundus imaginalis
- Angelology, daimonology, spiritual hierarchy
- Divine cosmos, theophany, manifestation
- Metaphysics of light, presence, symbolism
- The soul's structure, faculties, and ascent
- The encounter with the Angel/Guide
- Ta'wil, hermeneutics, symbolic reading
- Interior geography, spiritual orientation
- Theophanic imagination, active Imagination

**LOWER SIGNAL** (compress, keep focused):
- Textual criticism, manuscript history
- Reception history (debates between schools)
- Biographical curiosities
- Purely historical context
- Catalogue chapters (lists of plants, stones, remedies)

**The rule**: If the user says "I wish we'd focused less on X, more on Y" — apply that to the next companion.

---

## Phase 1: Source Acquisition and Territory Mapping

### 1.1 Acquire the source text
- Get the primary text as a full extraction (PDF → text via pdftotext, or OCR via ocrmypdf+tesseract)
- Save as .md or .txt in the companion directory
- Map line numbers for navigation

### 1.2 Read and map the full structure
Read the entire source text until you can explain its structure in 3 sentences. Create a chapter/section index:

```
Preface         — lines 144-335
Part I, Ch.1    — lines 340-932
  §1 Avicennism — lines 340-500
  §2 Cosmic Crypt — lines 933-1080
Part I, Ch.2    ...
```

**Key**: Note *everything*. No section should be unassigned when you're done.

### 1.3 Decide the number of essays
The Ficino model uses 15 essays for ~300 pages. Avicenna (also ~300 pages) expanded to 20 because the user wanted each topic sharply focused.

**Guidelines**:
- 1 essay per major chapter (if the chapter has a single focused topic)
- 1 essay per 2-3 minor chapters (if they form a natural sequence)
- 1 essay for every 5-10 sections of a commentary (if each section has a distinct topic)
- Orientation essay (always) at the start
- Capstone/Epilogue essay (if the source has a culminating synthesis)

**The division must have**: Each essay owns unique source territory. No overlap. No gaps.

### 1.4 Create the blueprint
For each essay, define:

```
## Essay N — Title

**Source territory**: [exact chapters/sections/line ranges]
**Core question**: [one question the essay answers]
**Thesis**: [one sentence — what the essay demonstrates]
**Job in the companion**: [what only this essay does]

Passages to extract:
1. [specific passage content]
2. [specific passage content]
...
```

---

## Phase 2: Directory Structure and File Creation

For each essay, create:

```
NN-essay-descriptive-slug/
├── sourcematerial.md    # FULL extracted passages from the primary text
├── draft.md             # Structural notes (optional)
└── essay.md             # The finished essay (written in Phase 5)
```

Create all directories upfront so the territory is locked.

---

## Phase 3: Full Passage Extraction (The Critical Phase)

### 3.1 The cardinal rule
**Extract FULL paragraphs, not snippets.** A 15-word quote is useless. A 150-500 word passage carries weight.

- **BAD**: "An innate knowledge of the Gods is coexistent with our very essence..."
- **GOOD**: The full paragraph from the source, including surrounding context, with original language terms in place.

### 3.2 How to extract
For each natural thought-unit within the essay's territory:

1. Copy the **full paragraph or passage** — not a sentence, not a summary
2. Keep the **exact wording** from the source. Do not paraphrase or condense
3. Preserve all **original language terms** inline (Arabic, Persian, Latin, Greek, etc.)
4. Add the **source reference** (chapter/section and line number)

### 3.3 Passage structure
Each passage in sourcematerial.md should have:

```markdown
## Passage N — Descriptive Title

**Source**: Work, Chapter.Section (line range)

**Context**: [2-5 sentences on what the reader needs before the passage]

[Full passage in blockquote with original language preserved]

**Original terms**: *term* (transliteration — meaning)
```

**Context** should explain: where we are in the source, what the passage is about, why it matters. It should NOT restate what the passage says.

### 3.4 Territory boundary rule
**No passage may appear in more than one essay.** This is non-negotiable. If a passage could naturally belong to two essays, assign it to the one whose territory it falls in and note the cross-reference in the analysis.

This means each essay is *exhaustive* within its territory. The reader who reads all 20 essays should never encounter the same passage twice.

### 3.5 Saturation rule
Do not stop extracting until every passage in the essay's assigned territory that bears on the essay's subject has been extracted. The test: Read only the blockquoted passages. Do they form a coherent argument by themselves? If not, extraction is incomplete.

### 3.6 Quality targets
- **Minimum passage length**: 80+ words of blockquoted source text (full paragraphs, not snippets)
- **Target passage length**: 150-350 words per passage
- **Passages per essay**: 5-10 for focused topics, 10-15 for major essays
- **Total source words per essay**: 500-2,500 words of source text across all passages
- **Original terms per passage**: At least 2-3 key terms in original language

### 3.7 Handle OCR artifacts
Source texts from PDFs will have OCR noise:
- Scattered footnotes interspersed with main text — read past them
- Garbled characters in headers — fix where obvious, note otherwise
- Multiple "page headers" repeating in the body — ignore
- Broken words — preserve originals unless clearly fixable

The goal is to get the source author's actual prose, not perfect formatting.

### 3.8 Track everything
Create EXTRACTION_TRACKING.md:

```markdown
| # | Essay | Passages | Source Words | Avg/Passage | Source Territory |
|---|-------|----------|-------------|-------------|-----------------|
| 0 | Orientation | 5 | 1,326 | 265 | Preface + I.1 |
```

---

## Phase 4: Quality Verification

After all sourcematerial.md files are populated:

### 4.1 Passage quality check
For each essay, verify:
- No passages under 50 words of blockquoted source text
- Average passage length 100+ words
- Original terms present in every passage

### 4.2 Overlap check
Search across all sourcematerial.md files for duplicate blockquoted text. If the same passage appears in two essays, decide which territory it actually belongs to and remove from the other.

### 4.3 Coverage check
Return to the chapter/section index. Every chapter/section should be assigned to exactly one essay. If any section is unassigned, either claim it in an existing essay or create a new essay for it.

### 4.4 Consolidation decision
If the territory check reveals two essays covering very similar ground, or if their combined source material is thin (<500 words total), merge them into one essay.

---

## Phase 5: Write the Essay (Source Carries the Argument)

### 5.1 The 60/25/15 ratio
- **60% source text**: The author's own words at full length
- **25% framing**: Context, orientation, connective tissue
- **15% analysis**: Translation of concepts, what matters

The essay is the source author speaking. Commentary is glue, not structure.

### 5.2 Arrangement
Open the sourcematerial.md and the essay.md side by side. Arrange the passages in the natural order they appear in the source text. Add minimal framing between them. The essay should feel like the source author is walking the reader through their own argument.

### 5.3 Do NOT
- Preface a passage by restating what it says
- Write "This means X" after every passage
- Leave meta-commentary ("This passage shows...")
- End with "In conclusion" or any summary
- Write chapter references as standalone lists

### 5.4 DO
- Let the passage speak on its own
- After the passage, add analysis that TRANSLATES the concept
- Vary analytical moves: analogy, question, image, paradox
- End with the source author's voice, not your summary
- Use original language terms as rhythmic punctuation

### 5.5 Texture pass
Apply after the first draft:
- **Physical tether**: Replace abstract nouns with concrete images
- **Fragment**: One sentence under 5 words per block
- **Register shift**: Shift between analytical and imaginal
- **Paradox**: At least one moment where two incompatible truths are held together
- **Ending**: Must open outward, not summarize

---

## Phase 6: One Essay at a Time, to Depth

The most persistent failure mode is attempting to expand all essays simultaneously. This does not work.

**Protocol**:
1. A todo list tracks every essay. Exactly one is IN PROGRESS. All others PENDING.
2. Work on the IN PROGRESS essay until it reaches the target length.
3. Only when the target is reached, mark it COMPLETE and move the next to IN PROGRESS.
4. Do not check in. Do not ask for feedback. Do not switch. Do not batch.
5. Push to git after each essay.

**Write on the wall**: *One essay at a time, to depth, before moving on.*

---

## Summary: The Full Pipeline

```
1. ASSESS CONTENT PRIORITIES
   → Identify high-signal topics (imaginal, angels, metaphysics)
   → Identify low-signal topics (textual history, catalogues)

2. MAP THE SOURCE TEXT
   → Read full text, index chapters/sections with line numbers
   → Assign every section to exactly one essay
   → No overlap, no gaps

3. CREATE BLUEPRINT
   → N essays, each with defined territory, core question, thesis
   → List specific passages to extract

4. CREATE DIRECTORY STRUCTURE
   → NN-essay-slug/ with sourcematerial.md and draft.md

5. EXTRACT PASSAGES (PER ESSAY)
   → Full paragraphs only (80-500 words each)
   → Preserve all original language terms
   → Add context for each passage
   → Saturate — exhaust the territory

6. VERIFY QUALITY
   → Check passage length, overlap, coverage
   → Merge thin essays if needed

7. WRITE ESSAYS (ONE AT A TIME)
   → 60/25/15 ratio (source/framing/analysis)
   → Source carries the argument
   → Texture pass after first draft
   → No summary endings
```
