# CLAUDE4 — How to Write a Perfect Essay: The Definitive Workflow

## The Core Problem

**This model cannot detect its own patterns in the same pass that generates them.** Every rewrite cycle fixes one tic and reveals another. The detection pass and the generation pass must be separate operations — and the model cannot do both at once.

6 versions of the same essay proved this. Each full rewrite fixed one pattern and introduced another. The generator is blind to its own output.

**The only fix is conscious, phrase-level editing with a separate verification pass.** Not rewriting. Editing one sentence at a time against a written checklist.

---

## Required Reading (In Order)

1. `essayworkflow.md` — The full journey v1→v8 with specific failures per version. Read this first to understand WHY the protocol exists.
2. `slopreview.md` — The 4-pass editing protocol. This is the operational handbook. Pattern catalog, Smuggle Test, Pass 4 texture guide, verification checklist.
3. `slopnotes.md` — Per-essay audits from the original versions. Shows the same patterns across all essays.
4. `stopslop.md` — Quick-reference pattern discipline guide.
5. `essayglobal/essaygen/antislop.md` — 15 rules from earlier failures.
6. `essayglobal/essaygen/workshop/workshopguide.md` — The operational playbook for turning outlines into v6 essays. Combines all prior protocols into a single 7-stage workflow with checklists.
7. `essayglobal/essaygen/workshop/v6ficinoanalysis.md` — Worked example: analysis of 6 ficino essays against becoming_an_angel_v6 with pattern counts, texture density comparison, and repair priorities.
8. `perspective.md` — External critique of the v6 algorithm and all 33 v6 final essays. Identifies blind spots the algorithm doesn't catch (texture placement vs counting, the 5-block problem, semantic inversions from NEG avoidance, the interchangeability test). Read this after internalising the protocol to see where the system is blind to itself.
9. `essayglobal/essaygen/rumiengine.md` — Reverse-engineering of Rumi's poetic technique for the FINAL TEXTURE PASS ONLY. Use after all pattern checks pass. Replaces one abstract noun per block with a physical tether. Adds one fragment, one register shift, one paradox. Read aloud check. Do NOT use during the writing or repair phases.
10. `essayglobal/essaygen/essaygenaudit.md` — Complete file map and reading order. Every `.md` file indexed by role with purpose, status, and reading priority. Use this to navigate the file system and ensure you haven't missed a relevant document.

---

## The 4-Pass Protocol (Summary)

### Pass 1: Write (Accept Slop)
Get structure down. Do not try to be good. The first pass is scaffolding; the real work is in passes 2–4.

### Pass 2: Identify (Read Cold)
Read the essay as if you've never seen it. Mark every sentence with a pattern tag. Do not edit.
- `[NARR]` — narrates what the text or author does
- `[NEG]` — any negate-then-assert move (including all 9+ disguised forms)
- `[3LIST]` — 3 or 4 evenly-spaced parallel items, including lineage chains
- `[PARA]` — paraphrases the source without adding
- `[FLAT]` — uniform sentence length, no pulse, no fragments
- `[CLICHÉ]` — self-help language, greeting-card profundity, fake punch
- `[SAME-ENDING]` — final paragraph shares wording with source

### Pass 3: Repair (One Sentence at a Time)
1. **Rewrite the ending FIRST.** It is the most resistant to change and will need the most passes. Close the file. Rewrite only the ending. Repeat three times.
2. For each marked sentence: change ONE sentence. Close the file. Re-read context. Verify the fix didn't create a new pattern.
3. **Run the Smuggle Test** after all repairs. Every pattern has many faces:
   - NEG disguises: fragment, clause, imperative, condition, substitution, lack, insufficiency, comparison, staging (two-sentence)
   - NARR disguises: self-narration, author-narration, section-narration, preview-narration
   - 3LIST disguises: 4-item lists, flat lineage chains
4. Re-read the ending cold. If it shares key words with the source's ending, rewrite it again.

### Pass 4: Texture (Sprinkle Joy)
Replace abstract nouns with concrete ones. Add one unexpected word per block (thrum, whet, flint, gravid, lattice, silt, incandescent). Fix overcorrections from Pass 3 — if a sentence is correct but dead, restore its pulse. Read aloud: if it sounds like a university lecture, rewrite.

### Verify
Run the full checklist and Smuggle Test one final time.

---

## The Complete Tic Catalog (9 Documented)

| # | Tic | Test | Fix |
|---|-----|------|-----|
| 1 | **Narrritivitis** | Does the sentence narrate what the author does? | Delete the narration clause. State the idea directly. |
| 2 | **Negat-assert-itis** | Does the sentence clear ground before building? | Assert without negating. If you catch yourself denying a wrong view, skip the denial. |
| 3 | **Self-narration disguised** | Does "the paper" or "this section" or "the essay" act as the sentence subject? | Same fix as narrritivitis. The subject must be the IDEA, not the structural container. |
| 4 | **Paraphrase-itis** | If you remove this AI block, does the reader lose anything? | If no, delete it. Every AI block must ADD something the source doesn't say. |
| 5 | **Museum-guide neutrality** | Are all sentences 20-35 words with no rhythmic variation? | Add a sentence under 8 words. Add a fragment. Read aloud. |
| 6 | **The Dead Ending** | Does the last AI block share key words with the source's last block? | Rewrite the ending first. Never end on the same phrase the source uses. |
| 7 | **Three-item lists** | Are there exactly 3 grammatically parallel items? | Expand to 4, or reduce to 2, or pick ONE and develop it. |
| 8 | **Performance-itis** | Does the line try to be engaging? | Trust the material. A line that tries to be alive is already dead. |
| 9 | **Cliché infiltration** | Is there a modern self-help phrase in a premodern context? | Delete it. If it's in the source, flag the mismatch. |

---

## The Smuggle Test (Check This After Every Pass)

After fixing the obvious pattern violations, scan for **disguised versions**:

**NEG disguises:**
- "Not X. Y." → fragment form
- "X, not Y" → clause form
- "Forget X. Y." → imperative form
- "Without X, Y." → condition form
- "Instead of X, Y" → substitution form
- "What X lacks is Y" → lack form
- "X alone cannot Y" → insufficiency form
- "The difference between X and Y..." → comparison form
- "Wrong idea. Correct idea." → staging form (two sentences)

**NARR disguises:**
- "The paper opens with..." → self-narration
- "Voss introduces..." → author-narration
- "This section examines..." → section-narration
- "We now turn to..." → collective-narration
- "What follows is..." → preview-narration

**3LIST disguises:**
- 4 evenly-spaced parallel items (same problem)
- "from A through B to C and D" (flat lineage chain)

---

## Verification Checklist

| Check | Target |
|-------|--------|
| Sentences starting with "Not" | 0 |
| "not X, but Y" constructions (any form) | ≤2 |
| Structural narration ("paper opens", "X introduces") | 0 |
| Three/four-item lists (including chains) | 0 |
| Sentences all same length (±5 words) | 0 |
| Self-help clichés | 0 |
| Ending shares key words with source | 0 |
| AI block removable without loss | 0 |
| Lines genuinely alive | ≥1 |
| Every block has an unexpected word | ≥1 |
| Sounds like a person, not a committee | yes |

---

## The Version History (Why This Exists)

| Version | Change | Problem Introduced |
|---------|--------|-------------------|
| v1 (original) | — | Narrritivitis in every block |
| v2 (memoo) | Fixed narration | Negat-assert-itis (every claim corrects first) |
| v3 (beautiful) | Fixed negation scaffolds | Paraphrase-itis (repeats source, no pulse) |
| v4 (beautiful v2) | Added interpretive claims | Self-narration disguised ("The paper opens with...") |
| v5 (beautiful v3) | Fixed paraphrase | Cliché infiltration ("power of now") |
| v6 (beautiful v4) | One cosmetic change | Ending still unrevised for 5 versions |
| v7 (v5) | First real change: narration fixed, ending rewritten, rhythm added | Rule-dodging four-item lists, disguised NEG staging, flat lineage chain |
| v8 (v6) | Fixed enumeration, staging, lineage; Pass 4 texture added | None so far |

**Lesson:** Full rewrites cannot produce beautiful prose. Only conscious, phrase-level editing with a separate verification pass can eliminate patterns permanently.

---

## Deployment

Cloudflare Workers caches aggressively. Always create a new file with a new ID:

```bash
cp essay_previous.json essay_v{NEW}.json
# Edit id and title in new file
node scripts/generate-graph-json.mjs
npm run cf:deploy
```

---

## The Fundamental Limitation

This model cannot produce beautiful prose in a single pass. It can produce **rule-checked, textured prose** through conscious, phrase-level editing in 4 passes with a separate verification step.

Beautiful prose — with pulse, surprise, and commitment — requires a different architecture: a cheap model to draft, a linter to detect violations, and a stronger model to revise with awareness of the violation report. If you want James Blake-level poetic commentary, build that pipeline.

**Do not rewrite. Edit.**

---

## External Perspective — `perspective.md`

A fresh-eye audit of the entire v6 system by an external reviewer. Located at `/root/projects/blog/perspective.md`.

**When to read it:** After producing a first draft, before the final verification pass. Also consult `scholars/` for the author's original source PDFs and extracts — these are the definitive reference for source block selection and verification. The critique identifies things the algorithm's own criteria don't catch:
- The interchangeability test (can your essay's opening be swapped with another in the same series?)
- Texture placement vs texture counting (where the texture word lands matters more than how many there are)
- The 5-block problem (essays under 8 AI blocks cannot develop an argument)
- Semantic inversions from NEG avoidance (sentences that accidentally say the opposite of what was meant)

**How to reference it:** When doing peer review, check each essay against the essay-by-essay review in `perspective.md` sections "Full Essay-by-Essay Review Against the Reference" and "Essays to Cut or Expand." The review scores every v6 final essay and identifies specific problems.

**How to reference in CLAUDE files:** Add a line in CLAUDE3.md's Required Reading section: `8. perspective.md — External critique of the v6 system. Read during peer review to catch blind spots.`

---

## Algorithm V6 — `essayglobal/essaygen/v6algorithm.md`

A self-contained algorithmic prompt that condenses all 10 stages into a single document. Use when you need to produce a v6 essay from any source material without referencing the other docs.

**How to use:**
1. Open `essaygen/v6algorithm.md`
2. Read the Axioms section — defines all 7 patterns with WHY, examples, and disguised forms
3. Follow Phase 0-5 in order — each phase has self-prompting instructions
4. Run the Verification + Checksum (Phase 5) — all checks must pass
5. If any check fails, return to the relevant phase

**When to use Algorithm vs Full Protocol:**
| Situation | Method | Reason |
|-----------|--------|--------|
| New subject matter | Full 10-stage protocol | Need to discover patterns |
| Same series as previous work | Algorithm + cold read | Patterns already known |
| Time-constrained | Algorithm + cold read | ~75% faster |
| Quality-critical | Full protocol | More passes catch more |
| Subject corrects wrong view | Full protocol mandatory | NEG inherent to subject |

**Algorithm testing results** (documented in `workshopalgorithm.md`):
- Produces ~60% fewer first-pass NEG patterns than raw writing
- Requires 1 cold-read fix pass for semantic inversions (removing "not" can flip meaning)
- Dash target for condensed essays (5-6 AI): ≥28%, for full essays (12-15 AI): ≥32%
- First-word "The" rate target: ≤40%
- Short sentence target: ≥10% of all sentences

## Workshop Protocol — `essaygen/workshop/`

The workshop is where raw outlines become v6 essays. The full detailed protocol is at `essaygen/workshop/workshopguide.md` — read it before starting any essay work.

### Core Rules
1. **Nothing leaves the workshop until validated.** Every essay must pass the full checklist and Smuggle Test before it can be deployed.
2. **No shortcuts.** Every essay goes through all 4 passes. Pass 2 (Identify) and the Smuggle Test are mandatory. Pass 4 (Texture) is what separates v6 from v5.
3. **One sentence at a time.** Never rewrite a whole block. Change one sentence, verify, move on.
4. **The ending first.** The closing AI block is the most resistant to change. Rewrite it before touching anything else.

### Workshop Structure
- `workshopguide.md` — The definitive operational playbook (10 stages: Source Verification → Concepts → Write + Voice Target → Identify → Repair → Texture + Magic Test + Cross-Essay Check → Art Matching → Verify → Peer Review → Deploy Prep)
- `v6ficinoanalysis.md` — Worked analysis of 6 ficino essays against becoming_an_angel_v6
- `v6ficinofeedback.md` — Worked example of Stage 9 (Peer Review) applied to the ficino series
- `ficino_*.json` — Ficino essay series (6 essays, all v6-clean)
- `ficino_essays` — Raw outlines for the ficino series
- `theurgy_essays` — Raw outlines for the theurgy series (7 outlines)
- `corbin_essays` — Raw outlines for the Corbin/Attar/Jung/Blake series (5 outlines)
- `goethe_essays` — Raw outlines for the Goethe/Steiner series (5+ outlines)
- `imaginal_essays` — Reference links collection

### Current Status
| Series | Outlines | V6 Essays | Concepts Created |
|--------|----------|-----------|------------------|
| Ficino | 6 | 6 | 18 |
| Theurgy | 6 | 6 | 0 |
| Corbin | 8 | 2 | 0 |
| Goethe | 8 | 8 | 0 |

### Key Docs
- `essayglobal/essaygen/v6algorithm.md` — Self-contained algorithmic prompt for producing v6 essays
- `essayglobal/essaygen/workshop/workshopguide.md` — 10-stage operational playbook
- `essayglobal/essaygen/workshop/v6ficinoanalysis.md` — Comparative analysis of ficino essays
- `essayglobal/essaygen/workshop/v6ficinofeedback.md` — Peer review with 35 exact rephrasing suggestions
- `essayglobal/essaygen/workshop/workshopprocess.md` — Full chain-of-thought documentation of the theurgy process
- `essayglobal/essaygen/workshop/workshopalgorithm.md` — Comparative analysis of algorithm vs multi-step approach

### Workflow (Quick Reference)
```bash
# Full protocol (10 stages):
# 1. Read essayglobal/essaygen/workshop/workshopguide.md
# 2. Select an outline from essayglobal/essaygen/workshop/*_essays files
# 3. Verify source texts — check scholars/{author}/ for source PDFs
# 4. Write essay JSON → essayglobal/essaygen/workshop/<name>_v6.json
# 5. Apply 4-pass protocol
# 6. Run Smuggle Test on every AI sentence
# 7. Verify against checklist
# 8. Create concept JSONs → content/glossary/concepts/
# 9. Copy to content/glossary/essays/
# 10. Generate audio and deploy

# Algorithm shortcut (for familiar subjects):
# 1. Read essayglobal/essaygen/v6algorithm.md axioms + phases
# 2. Follow Phase 0-5 as self-prompting
# 3. Run Phase 5 verification
# 4. If fail, return to Phase 3
# 5. Deploy

---

## File Organisation

The project was reorganised to keep source materials and the essay engine separate:

### `scholars/` — Author Source Materials
One folder per scholar. Contains their original PDFs and extracted markdown texts. Use these for source block selection and citation verification during Stage 1 (Source Verification) of the workshop protocol.

Current scholars:
- `voss/` — 20 Angela Voss PDFs + 1 extracted markdown (Ficino, astrology, theurgy, imagination, divination)

As new scholar source packs are uploaded, they go here. This is the canonical reference library for source block author quotes.

### `essayglobal/` — Essay Engine
- `essaygen/` — All essay generation docs (protocols, v6 algorithm, workshop)
- `blueprints/` — Full-source blueprints for major authors (Corbin, Ficino, Iamblichus) with chapter breakdowns and draft essays

When writing an essay: check `scholars/{author}/` first for the source PDF, use `essayglobal/blueprints/{author}/` for the structural breakdown, then follow the workshop protocol in `essayglobal/essaygen/workshop/`.
```
