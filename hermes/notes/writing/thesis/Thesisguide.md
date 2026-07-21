# Thesis Guide — Process for Building a Blueprint-Based Essay Sequence

This document records the exact process used to build a companion essay sequence for Marsilio Ficino's *Three Books on Life*, starting from raw source uploads through to per-essay drafting folders. Another agent can follow these steps to arrive at the same point for any source text.

---

## Phase 0: Project Orientation

### Read the Core Identity and Protocol Docs

Before any source work, read these two files in order. They define the project's essay engine identity and the writing protocol that every essay must follow.

1. **`CLAUDE3.md`** — The essay engine identity. Core principles: no API calls for generation (write JSONs directly), Method A body blocks (source/ai/summary), 3 concepts max per essay, art indexed by concept. Audio system (Ryan for source, Aria for AI). Technical architecture (Source → Essay → Concept → Art pipeline, Cloudflare Workers). The "constitution" of the project.

2. **`CLAUDE4.md`** — How to write a perfect essay: the definitive workflow. Core problem (detection and generation use the same circuit — you cannot see your own slop while writing it). The 4-pass protocol (Write → Identify → Repair → Texture). The 9 documented tics (NARR, NEG, 3LIST, PARA, FLAT, CLICHÉ, SAME-ENDING). The Smuggle Test (9 NEG disguises, 5 NARR disguises). One-sentence-at-a-time editing. The ending is the hardest part — rewrite it first.

Internalise these before touching any source material. Every essay produced by this system must pass the pattern checks in CLAUDE4.md.

### Read the Workshop Guide

3. **`essayglobal/essaygen/workshop/workshopguide.md`** — The operational playbook for turning outlines into v6 essays. 10 stages: Source Verification → Concepts → Write + Voice Target → Identify → Repair → Texture → Art Matching → Verify → Peer Review → Deploy Prep.

---

## Phase 1: Source Acquisition

### 1.1 Check GitHub for Scholar Uploads

Check GitHub for recently uploaded source materials by a specific scholar:

```bash
git log --all --oneline --grep="SCHOLAR_NAME" -i
git log --all --name-only --oneline -5
```

Look for commits that batch-upload multiple files by a single author. These are often titled "Add files via upload" or "SCHOLAR NAME".

Pull the latest changes:

```bash
git pull origin main
```

### 1.2 Identify All Files by That Scholar

List the files from the relevant commits. Filter for `.pdf` and `.md` files. Group them by author.

For Angela Voss, the commit `6d4a6ef "Angela Voss"` contained 18 PDFs. A subsequent commit added a markdown extraction of one of the PDFs.

### 1.3 Create the Scholar Folder

```bash
mkdir -p scholars/SCHOLAR_NAME
git mv FILE1.pdf FILE2.pdf ... scholars/SCHOLAR_NAME/
```

Keep both PDF originals and any extracted `.md` versions together. The PDFs are the canonical source; the markdown versions are for text search and extraction.

---

## Phase 2: File Organisation

### 2.1 Create essayglobal/ Structure

The project root had become cluttered with essay-generation files, blueprints, and source materials. Create a top-level `essayglobal/` folder to hold everything related to essay production:

```
essayglobal/
├── essaygen/          # The essay generation engine (moved from root)
│   ├── workshop/      # Workshop protocol, v6 analysis, ficino feedback
│   ├── v6algorithm.md # The self-contained algorithmic prompt
│   ├── rumiengine.md  # Rumi's poetic techniques for the final texture pass
│   ├── antislop.md    # 15 rules from earlier failures
│   └── ...            # All other essaygen docs
└── blueprints/        # Full-source blueprints by author
    ├── SCHOLAR_NAME/  # Each scholar's blueprint directory
    │   ├── blueprint.md         # (optional) original source blueprint
    │   ├── voss-papers/         # (optional) secondary scholarship copies
    │   └── ...
    └── ...
```

Move files with `mv` then `git add -A` so git detects the renames.

### 2.2 Move Stray Files

Clean up the root. Stray `.pdf` files, blueprint files, and draft documents belong in `scholars/` or `essayglobal/blueprints/`.

---

## Phase 3: Blueprint Analysis

### 3.1 Read the Source Blueprint

For Ficino, the blueprint was at `essayglobal/blueprints/Ficino - Three Books on Life/ficino blueprint.md`. This was a v0.4 drafting blueprint containing:

- Essay sequence covering all chapters of *Three Books on Life*
- For each essay: core question, thesis, rough structure, passage-pack targets, concepts introduced, writing warnings, overlap boundaries
- Final coverage matrix mapping chapters to essays
- Passage tiers (what must be extracted next)
- Length tiers (major / medium-major / medium / short orientation)

Read the entire blueprint before doing any writing. Understand the arc of the whole sequence before working on any single essay.

### 3.2 Read Any Existing Draft

A draft essay may exist alongside the blueprint (e.g., `draftessay.md`). Compare it to the blueprint — the draft is often a condensed version. The blueprint has the full detail.

### 3.3 Read the Scholar's Own Thesis (Quality Reference)

Find the scholar's own major work on the subject. For Voss, this was her 1992 PhD thesis *"Magic, astrology and music: the background to Marsilio Ficino's astrological music therapy and his role as a Renaissance magus"* — a ~900KB, 20,000-line markdown extraction.

Read the introduction and first chapter to absorb the quality bar. Voss-level writing is:
- Deep primary source engagement (Plato, Plotinus, Ficino's own letters)
- Argument-driven, not descriptive (she takes on other scholars directly)
- Personal stake (the author is invested in the subject)
- Scholarly apparatus (Latin anchors, footnoting, critical dialogue)
- Alive, committed prose — not dry academic summary

This is the quality level every essay in the sequence should aim for.

---

## Phase 4: Thesis Document Creation

### 4.1 Create 3booksthesis.md

Rename the draft essay to `3booksthesis.md` (or equivalent for your source text). This becomes the master document containing all essay plans.

The thesis document should contain for each essay:

1. **Core Question** — A single question the essay answers
2. **Thesis** — The essay's central claim, stated as an argument
3. **Structure** — Section-by-section breakdown with chapter references
4. **Key Passages Table** — Source location, content summary, essay use
5. **Overlap Boundaries** — What this essay owns and what it does not
6. **Length Tier** — Word count target
7. **Unique Job** — What only this essay does in the sequence

### 4.2 Revise the Sequence

As you work through the material, you may discover that:
- Some essays should be merged (e.g., if they overlap on the same material)
- An introductory essay is needed (e.g., "Orientation: Ficino's World" — introducing spiritus, the scholar as test case, astrology as non-fatalistic, how to read the remedies)
- Some essays need to be longer or shorter based on their importance
- Some framing needs adjustment (e.g., softening "technical, not symbolic" → "not merely symbolic; it is technical, medical, and operational")

Document all revisions in the thesis file. The final coverage matrix should reflect the actual structure, not the original plan.

### 4.3 Incorporate User Feedback

The user will give specific notes on each essay. For example, from our session:
- Essay 0 needed as orientation (concepts: spiritus, Ficino's identities, astrology as non-fatalistic, how to read remedies)
- Essays 2 and 3 merged (constitutional wound + daily enemies)
- Essay 3 (Medicine Cabinet) needs a warning frame: historical medicine as metaphysical evidence, not practical advice
- Essay 5 (Food/Putrefaction/Gold) should emphasise preservation, incorruptibility, vital transfer
- Essay 8 (Lunar Medicine): soften "technical, not symbolic"
- Essay 10 (Talismans): add imagination/phantasia as part of the circuit
- Essay 12 (Genius/Vocation): make longest, add extensive notes on why it matters
- Essay 13 (Apology): reveal the theological limit, not just defensive

Apply these notes to the thesis document before creating essay folders.

---

## Phase 5: Per-Essay Folder Creation

### 5.1 Create Numbered Folders

For each essay in the final sequence, create a numbered folder:

```bash
for d in \
  "00-orientation-ficinos-world" \
  "01-why-medicine-for-philosophers" \
  "02-the-melancholic-scholar" \
  "03-medicine-cabinet-of-the-soul" \
  "04-why-long-life-matters" \
  "05-food-putrefaction-gold-milk-blood" \
  "06-planetary-old-age" \
  "07-turn-to-the-living-world" \
  "08-lunar-medicine" \
  "09-the-celestial-catalogue" \
  "10-rays-figures-talismanic-image" \
  "11-song-words-dance-seven-steps" \
  "12-genius-vocation-place" \
  "13-the-apology" \
  "14-why-three-books"; do
    mkdir -p "$d"
    touch "$d/sourcematerial.md" "$d/draft.md"
  done
```

### 5.2 Create Two Files Per Essay

Each folder gets two blank markdown files:

- **`sourcematerial.md`** — The source passage extraction for this essay. Contains:
  - Exact quotes from Ficino (Latin anchor + English)
  - Chapter references and source locations
  - Plain-English paraphrase of what each passage says
  - Analysis of why it matters for this specific essay
  - Cross-references to Voss papers and secondary scholarship
  - Any overlap boundary notes specific to this essay's source material

- **`draft.md`** — The working draft of the essay. Starts empty. Follows the structure defined in `3booksthesis.md` for this essay. Goes through the 4-pass protocol from CLAUDE4.md:
  - Pass 1: Write (accept slop — get structure down)
  - Pass 2: Identify (cold read — tag every sentence with pattern markers)
  - Pass 3: Repair (one sentence at a time — fix ending first, run Smuggle Test)
  - Pass 4: Texture (replace abstract nouns, add unexpected words, fix overcorrections)

### 5.3 Renumber if Structure Changes

If the essay sequence changes (essays added, merged, or reordered), update the folder numbers to match the final sequence in `3booksthesis.md`.

---

## Phase 6: Drafting Protocol (Future Work)

### 6.1 For Each Essay, Follow This Workflow

1. **Open sourcematerial.md** — Pull the exact Ficino passages for this essay. Verify chapter references against the Kaske/Clark edition or available PDF.

2. **Read Voss papers** — Check `voss-papers/` for secondary scholarship that illuminates this essay's topic. Note relevant arguments and disagreements.

3. **Write the first draft** in `draft.md` following the structure from `3booksthesis.md`. Do not try to be good — get structure down.

4. **Apply the 4-pass protocol** from CLAUDE4.md:
   - Pass 1: Write (accept slop)
   - Pass 2: Identify (read cold, tag patterns: NARR, NEG, 3LIST, PARA, FLAT, CLICHÉ, SAME-ENDING)
   - Pass 3: Repair (one sentence at a time, ending first, Smuggle Test after)
   - Pass 4: Texture (concrete nouns, unexpected words, fix overcorrections, read aloud)

5. **Run the Verification Checklist** from CLAUDE4.md before marking the essay complete.

### 6.2 Quality Reference

Before drafting each essay, re-read the corresponding section of Voss's thesis. Ask: would Voss recognise this as serious scholarship? Is the prose alive or dead? Does it add something the source doesn't say? Does it commit to a stance?

### 6.3 Cross-Essay Consistency

After all essays are drafted, run the interchangeability test from `perspective.md`: swap the opening paragraphs of any two essays. If a reader wouldn't notice, the voices aren't distinct enough. Each essay must have its own dominant metaphor, register, and argumentative posture.

---

## Summary: The Complete Workflow

```
Phase 0: Read CLAUDE3.md → CLAUDE4.md → workshopguide.md
    ↓
Phase 1: Check GitHub → pull scholar uploads → identify files
    ↓
Phase 2: Create scholars/{author}/ → create essayglobal/ → move files
    ↓
Phase 3: Read blueprint → read draft → read scholar's thesis (quality bar)
    ↓
Phase 4: Create 3booksthesis.md → revise sequence → apply feedback
    ↓
Phase 5: Create per-essay folders → populate sourcematerial.md + draft.md
    ↓
Phase 6: Write each essay via 4-pass protocol → verify → cross-check
```

This process turns raw source uploads into a structured, Voss-quality companion essay sequence ready for deployment.
