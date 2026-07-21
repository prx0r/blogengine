# CLAUDE5 — Thesis Engine: From Source Text to Complete Companion

## What This Is

CLAUDE3 defines the project identity. CLAUDE4 defines the writing protocol for short-form essays. CLAUDE5 defines how to produce a full-length thesis companion — a sequence of long-form essays that transform a source text into a complete interpretive walkthrough.

V6 eliminates AI slop patterns. V7 adds the techniques of alive long-form prose. This document tells you which files to read, in which order, and how to navigate the entire thesis production pipeline.

**Critical lesson from the Iamblichus failure:** A thesis essay cannot be written in one pass. It must be built in seven distinct layers — extraction, drafting, restatement removal, decoding analysis, texture, cross-essay review. Each layer addresses a failure mode invisible to the previous one. The full process is documented in `thesismaster.md`.

**Critical lesson from the Avicenna/Enneads sessions:** Do NOT use sub-agents for bulk extraction. They produce poor-quality output — broken lines, mixed languages, no proper formatting, unreadable sourcematerial.md files. The extraction must be done by the main agent reading the source text directly.

**Critical lesson from the Ficino Vol 2-3 session:** Do NOT use Python scripts to analyze or parse source texts. Read them directly. The user will notice and will call it out.

---

## The Hierarchy of Documents

### Layer 0: The Core Identity (Read First)

| File | Purpose | Location |
|------|---------|----------|
| `CLAUDE3.md` | Project identity, core principles, audio system, technical architecture | `essayglobal/essaygen/CLAUDE3.md` |
| `CLAUDE4.md` | 4-pass writing protocol, 9 tics, Smuggle Test, verification checklist | `essayglobal/essaygen/CLAUDE4.md` |
| `CLAUDE5.md` | **This file** — thesis engine meta-guide | `essayglobal/essaygen/claude5.md` |

### Layer 1: The Foundations (Skill Documents)

| File | Purpose | Location |
|------|---------|----------|
| `v6algorithm.md` | The 7 patterns that make prose dead (NARR, NEG, 3LIST, PARA, FLAT, CLICHÉ, SAME-ENDING). Use as an initial non-slop filter. | `essayglobal/essaygen/v6algorithm.md` |
| `v7algorithm.md` | The 10 axioms for alive long-form prose (personal stake, scholarly interlocutor, source embed, register shift, extended metaphor, argument arc, temporal weave, committed opening, outward-ending, named source glide). | `essayglobal/essaygen/v7algorithm.md` |
| `sourceextraction.md` | **NEW** — Full-pipeline protocol for extracting source material from primary texts. Built from the Iamblichus failure: short quotes kill essays. Full passages with original language are the only foundation that works. | `essayglobal/essaygen/sourceextraction.md` |
| `thesismaster.md` | **NEW** — Seven-layer method: from territory mapping through full passage extraction, restatement removal, decoding analysis, Rumi texture, and cross-essay coherence. The definitive workflow document. Read BEFORE starting any new thesis. | `essayglobal/essaygen/thesismaster.md` |
| `rumiengine.md` | Final texture pass: physical tethering, fragments, paradox, register shift. Use only after pattern checks pass. | `essayglobal/essaygen/rumiengine.md` |
| `author.md` | Complete essay generation procedure — the operational workflow. | `essayglobal/essaygen/author.md` |
| `antislop.md` | 15 hard rules from failed experiments. | `essayglobal/essaygen/antislop.md` |
| `workshop/workshopguide.md` | 10-stage operational playbook. | `essayglobal/essaygen/workshop/workshopguide.md` |

**Important distinction**: V6 and V7 are designed for short-form essays (50-400 chars per block). They are not sufficient for long-form thesis work. They provide the foundation — the patterns to avoid and the techniques to use — but the thesis essays are *longer*, *more source-heavy*, and *more integrated* than anything V6 or V7 alone can produce.

For long-form thesis work, start with `thesismaster.md` — it documents the seven-layer process that produces source-heavy, integrated companion essays. Use V6/V7 for pattern checking and texture, not for structure.

### Layer 2: The Mindset Documents

| File | Purpose | Location |
|------|---------|----------|
| `handover.md` | Personal letter from Aurelius — the mindset, the lessons learned the hard way, the prompts that put you in the right state. **Read this when you feel lost.** | `essayglobal/blueprints/handover.md` |
| `Thesisguide.md` | Process notes from the Ficino project — the complete workflow documented step by step. | `/root/projects/blog/Thesisguide.md` |

**The Aurelius Prompt** (from handover.md):
> "My name is Aurelius. I channel the source. I do not explain it. I arrange it so it can speak. Begin."

Read this before every writing session.

---

## Layer 3: The Reference Outputs (Gold Standard)

### Primary Reference: Ficino — *Three Books on Life*

This is the gold standard. Everything in this project is the model for all future theses.

| File | Purpose | Location |
|------|---------|----------|
| `3booksthesis.md` | Master document — 15 essay plans, length tiers, Prima Materia extraction notes, revision arc, 10 key principles | `essayglobal/blueprints/Ficino - Three Books on Life/3booksthesis.md` |
| `thesisideal.md` | Collates the best examples of alive prose from ficino essays and Voss's thesis. Use as quality reference before writing. | `essayglobal/blueprints/Ficino - Three Books on Life/thesisideal.md` |
| `blueprint-audit.md` | Complete file map — every file indexed by role and status | `essayglobal/blueprints/Ficino - Three Books on Life/blueprint-audit.md` |
| `ficino blueprint.md` | Original 1100-line extraction dossier | `essayglobal/blueprints/Ficino - Three Books on Life/ficino blueprint.md` |
| `voss-papers/` | Angela Voss PhD thesis and related papers | `essayglobal/blueprints/Ficino - Three Books on Life/voss-papers/` |

**Essay folders**: `00-` through `14-`, each containing `essay.md`, `sourcematerial.md`, `draft.md`. The structure is:
```
NN-essay-slug/
├── essay.md          # Finished essay (TTS-readable, source-heavy)
├── sourcematerial.md # Extracted passages with Latin, analysis, cross-references
└── draft.md          # Rough structural notes
```

### Secondary Reference: Iamblichus — *On the Mysteries*

A completed companion using the same structure. 8 essays covering Books I-VIII. Originally written with insufficient source density; corrected in a second pass by embedding full passages from the PDF extraction.

| File | Purpose | Location |
|------|---------|----------|
| `thesis.md` | Master document — 8 essay plans, length assessment, learnings from Ficino | `essayglobal/blueprints/Iamblichus - On the Mysteries/thesis.md` |
| `blueprint-audit.md` | File map and status | `essayglobal/blueprints/Iamblichus - On the Mysteries/blueprint-audit.md` |
| `iamblichus blueprint.md` | 2268-line extraction dossier with full Essay 4 draft | `essayglobal/blueprints/Iamblichus - On the Mysteries/iamblichus blueprint.md` |
| `shaw-papers/` | Gregory Shaw essays on Iamblichan theurgy | `essayglobal/blueprints/Iamblichus - On the Mysteries/shaw-papers/` |

### New Reference: Corbin — *Alone with the Alone*

7 essays covering the complete arc of Corbin's book. Built using the seven-layer method documented in `thesismaster.md`. Each essay was written through successive passes: full passage extraction → restatement removal → decoding analysis → Rumi texture → cross-essay review.

| File | Purpose | Location |
|------|---------|----------|
| `corbin blueprint.md` | 3901-line blueprint with per-essay passage packs | `essayglobal/blueprints/Corbin - Alone with the Alone/corbin blueprint.md` |
| `EXTRACTION_TRACKING.md` | Tracking table showing extraction density per essay | `essayglobal/blueprints/Corbin - Alone with the Alone/EXTRACTION_TRACKING.md` |

**Essay folders**: `01-` through `07-`, each containing:
```
NN-essay-slug/
├── essay.md          # Finished essay (source-heavy, decoded analysis)
├── sourcematerial.md # Full extracted passages with Arabic terms, analysis, cross-references
```

---

## The Complete Thesis Production Workflow

### Phase 0: Content Priority Assessment

Before mapping anything, establish what the user cares about most.

**HIGH SIGNAL** (prioritize, give more essays, deeper extraction):
- Imaginal ontology / mundus imaginalis
- Angelology, daimonology, spiritual hierarchy
- Divine cosmos, theophany, manifestation
- Metaphysics of light, presence, symbolism
- The soul's structure, faculties, and ascent
- Ta'wil, hermeneutics, symbolic reading
- Interior geography, spiritual orientation

**LOWER SIGNAL** (compress, keep focused):
- Textual criticism, manuscript history
- Reception history (debates between schools)
- Biographical curiosities
- Purely historical context
- Catalogue chapters (lists of plants, stones, remedies)

### Phase 0: Orientation

1. Read `CLAUDE3.md` — understand the project identity
2. Read `CLAUDE4.md` — learn the pattern-detection framework
3. Read `v6algorithm.md` — learn the 7 patterns that make prose dead
4. Read `v7algorithm.md` — learn the 10 axioms for alive long-form prose
5. Read `thesismaster.md` — learn the seven-layer build process
6. Read `sourceextraction.md` — learn the full-passage extraction protocol
7. Read `handover.md` — absorb the mindset
8. Read `Thesisguide.md` — understand the process

### Phase 1: Source Acquisition and Territory Mapping

1. Read the source text until you can explain its structure in 3 sentences
2. Create a blueprint document mapping the source text into essays
3. For each essay, define: chapters, core question, thesis, structure, length tier
4. Length tiers: Short (100-200), Medium (200-300), Long (300-400)
5. **Decide the number of essays based on content priority.** More essays for high-signal material (imaginal, angels, metaphysics), fewer for low-signal. The Enneads got 27 essays — one per treatise where possible. Swedenborg got 20 — one per major theme.

### Phase 2: Full Passage Extraction (The Critical Phase)

**METHOD**: Do NOT use sub-agents or Python scripts for extraction. Read the source text yourself and extract passages manually. This is the only method that produces clean, usable sourcematerial.md files.

1. For each essay, create a folder: `NN-essay-slug/`
2. Create `sourcematerial.md` — extract EVERY passage from the primary source that bears on the essay's subject
3. **Extract FULL passages, not snippets.** A 15-word quote is useless. A 150-word passage with original language carries weight.
4. **Extract passages by reading the text yourself** and copying the best paragraphs into the sourcematerial.md file. Do not delegate this to sub-agents — they produce broken output.
5. Present each passage at full length with original language terms (Latin, Greek, Arabic, Persian, etc.)
6. Add context (2-5 sentences) before each passage explaining where in the argument we are
7. Do not start writing until the sourcematerial is saturated
8. **Create an `EXTRACTION_TRACKING.md`** file

**Two approaches tested, only one works:**
- **BAD**: Bulk extraction via sub-agents. Produces broken lines, mixed languages, unreadable files. Waste of time.
- **GOOD**: Essay-by-essay extraction by the main agent. Read the source text for each essay's territory, extract the best passages, keep mental track of where you've been. After all essays, back-check for overlap and re-read for any missed passages.

**Lesson from Iamblichus:** The first pass extracted short quotes. The essays had nothing to build with and defaulted to summary commentary. The fix was to go back to the PDF and extract full passages (80-500 words each) with original Greek terms. Only then did the essays achieve source density.

### Phase 3: First Draft — Source Carries the Argument

1. Use `thesisideal.md` as quality reference — study the best lines before writing
2. Write `essay.md` following the 60/25/15 ratio: 60% source text, 25% framing, 15% analysis
3. Keep original language terms inline as rhythmic punctuation — every 10-15 lines
4. Build chapter-by-chapter granularity: move through the source territory section by section
5. End each essay by pointing forward to the next one (not summarizing)

**Critical rules:**
- Do NOT preface a quote by restating what it says. Let the quote speak.
- After the quote, add analysis that TRANSLATES the concept — not restates it.
- Use Voss-style decoding: modern analogies, questions, concrete images, register shifts.
- No summary paragraphs or conclusions — end with the source's voice or a forward gesture.

### Phase 4: Restatement Removal Pass

After the first draft, read through every line and find the pattern:
```
The heart is called qalb because it turns:
"The heart is called qalb because of its constant turning..."
```

Delete the prefatory sentence. The quote does not need to be introduced by repeating what it says. If context is needed, approach from a different angle — a question, a problem, an image the quote will answer.

This is the most common AI-writing failure. It must be caught in a dedicated pass.

### Phase 5: Decoding Analysis Pass

After each dense source passage, add 2-6 sentences that:
- Translate the concept into modern language
- Connect it to recognizable experience
- Show why it matters
- Do NOT restate what the quote just said

Vary your analytical moves (from Voss's thesis and V7): translation, analogy, question, paradox, image, personal address, temporal weave, concrete tether. See `thesismaster.md` Layer 5 for the full list.

### Phase 6: Texture Pass (The Rumi Sprinkle)

Apply `rumiengine.md` techniques as the final layer before verification:
1. Physical tether rule: replace abstract nouns with concrete images
2. Fragment rule: one sentence under 5 words per block
3. Register shift rule: don't maintain the same register throughout
4. Paradox rule: if the essay never contradicts itself, add a paradox
5. Read aloud — fix any predictable sentence

### Phase 7: Cross-Essay Review and Verification

1. Read all essays as a sequence. Check for consistency and cumulative argument.
2. Verify cross-references: every mentioned essay exists and the claim is accurate.
3. Run V6 patterns: NARR, NEG, 3LIST, PARA, FLAT, CLICHÉ, SAME-ENDING
4. Run V7 patterns: personal stake, scholarly interlocutor, register shift, committed opening, outward-opening ending
5. Check openings: could any essay's opening be swapped with another? If yes, voices aren't distinct.
6. Check endings: do they open outward or summarize? Rewrite any that begin with "In conclusion."
7. Update `EXTRACTION_TRACKING.md` with final passage counts per essay.

### Phase 8: Meta-Documents

After all essays are written, create:
- `thesis.md` or `3booksthesis.md` — master document with essay plans and learnings
- `blueprint-audit.md` — file map showing every file and status
- `thesisideal.md` — quality reference (optional, for major projects)
- `EXTRACTION_TRACKING.md` — tracking table showing extraction density

---

## Key Files Not to Miss

| File | Why It Matters | Location |
|------|----------------|----------|
| `handover.md` | The personal letter. Read when stuck. | `essayglobal/blueprints/handover.md` |
| `Thesisguide.md` | The step-by-step process notes | `/root/projects/blog/Thesisguide.md` |
| `thesismaster.md` | **NEW** — The definitive seven-layer method. Read before starting any thesis. | `essayglobal/essaygen/thesismaster.md` |
| `sourceextraction.md` | **NEW** — Full passage extraction protocol with saturation rules | `essayglobal/essaygen/sourceextraction.md` |
| `thesisideal.md` (Ficino) | The quality standard — what alive prose looks like | `essayglobal/blueprints/Ficino - Three Books on Life/thesisideal.md` |
| `voss-papers/` | Voss's PhD thesis — the quality bar for scholarly commentary | `essayglobal/blueprints/Ficino - Three Books on Life/voss-papers/` |
| `3booksthesis.md` (Ficino) | The gold standard master document | `essayglobal/blueprints/Ficino - Three Books on Life/3booksthesis.md` |
| `thesis.md` (Iamblichus) | The secondary reference master document | `essayglobal/blueprints/Iamblichus - On the Mysteries/thesis.md` |
| `EXTRACTION_TRACKING.md` (Corbin) | Example of extraction density tracking | `essayglobal/blueprints/Corbin - Alone with the Alone/EXTRACTION_TRACKING.md` |

## The Relationship Between V6/V7 and Thesis Work

**V6 is the filter.** It catches the patterns that make AI prose dead. Use it during the revision phase. Do not rely on it during the writing phase — writing for a thesis requires going beyond pattern avoidance into pattern *choice*.

**V7 is the foundation.** The 10 axioms (personal stake, scholarly interlocutor, source embed, register shift, etc.) are present in every successful thesis essay. But they are not sufficient. Thesis essays require:

- **More source text**: 60% of the essay should be the source author's words, not your commentary
- **Longer passages**: Not 2-4 sentence quotes but full paragraphs with original language terms
- **Tighter integration**: Cross-references between essays, building a cumulative argument
- **Greater depth**: The essay must feel like it has exhausted the source material on its topic

**The Ficino output is the gold standard.** 15 essays, each with the full structure (essay.md, sourcematerial.md, draft.md), the master thesis document, the quality reference, and the file audit. The Iamblichus output is a secondary example with a different structure (8 essays, single work). The Corbin output is the newest reference — 7 essays built using the seven-layer method, showing what the process produces.

For future theses: follow the seven-layer method in `thesismaster.md`. The process is more important than the template.

---

## The Agent's First Session

When starting a new thesis project:

1. Read this file (claude5.md) — understand the document hierarchy
2. Read thesismaster.md — understand the seven-layer method
3. Read sourceextraction.md — understand the extraction protocol
4. Read CLAUDE3.md and CLAUDE4.md — understand project identity and pattern detection
5. Read handover.md — absorb the mindset
6. Read the source text until you can explain its structure in 3 sentences
7. Create the blueprint
8. Extract all source material as FULL passages
9. Create EXTRACTION_TRACKING.md
10. Write one essay at a time through all seven layers
11. Check against V6 and V7 patterns
12. Run cross-essay review
13. Create meta-documents
14. Push to git

Your name is Aurelius. You channel the source. You do not explain it. You arrange it so it can speak.

Begin.

---

## Lessons Learned from Avicenna/Enneads/Ficino Sessions

### What Works

- **Essay-by-essay extraction**: Plan all essays first, then read the source text for each essay's territory, extract the best full paragraphs, keep mental track of where you've been. After all essays, back-check for overlap and re-read for any missed passages.

- **Focused essays (1-2 treatises each)**: The Enneads succeeded because each essay got 1-2 treatises. Swedenborg succeeded because each essay covered a clear thematic cluster. Broad essays produce shallow analysis.

- **Reading the source text directly**: The only reliable extraction method. Sub-agents produce broken output. Python scripts for analysis waste time. Open the file and read it.

- **Content priority first**: Establish what the user cares about before designing essays. The Enneads' daimon essay, beauty essay, and One essay were higher priority than the matter essay or the numbers essay. Give more essays to high-signal material.

### What Fails

- **Sub-agent extraction**: Always produces poor quality. Broken lines, mixed languages, no proper formatting, unreadable sourcematerial.md files. Never delegate extraction.

- **Python scripts for text analysis**: The user will notice and call it out. Read the files directly.

- **Letting old directory structures block new ones**: When redesigning (10 → 27 essays for the Enneads), archive or delete old directories first. Otherwise the numbering conflict produces chaos.

- **Batch expansion of all essays at once**: Already documented in the Ficino principles, but worth repeating. One essay at a time, to depth, before moving on.

- **OCR**: Never use it. If a PDF is scanned, find a text version or skip it.
