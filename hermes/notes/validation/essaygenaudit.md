# EssayGen Audit — Complete File Map & Purpose

Every `.md` file related to essay generation, indexed by role. Files are grouped by function, not location.

---

## Category 1: Identity & Overview

These files define what the essay system is and why it exists.

| File | Purpose | Read First? |
|------|---------|-------------|
| `CLAUDE3.md` | **Daimon Stream** — The essay engine identity. Core principles (no API, Method A blocks, 3 concepts, art indexed by concept), audio system, technical architecture, unprocessed source inventory, and quick-reference commands. The "constitution" of the project. | Yes — before any work |
| `CLAUDE.md` | **Agent Handoff** — Project overview with links to build plan, architecture, metaphysics spec, and core rules. Not essay-specific but useful for orientation. | Optional |
| `essay.md` | **Essay Layer Guiding Principle** — The full vision for the essay layer as part of the Source Atlas stack. Covers data model, rendering, graph integration, and frontend design (665 lines). More architectural than operational. | Reference |
| `idealessay.md` | **The al-Muhasibi Reference** — A worked example of the ideal essay voice (al-Muhasibi's muraqaba). Shows what the voice should feel like: concrete, narrative, embedded quotes, fragments, circling back. The standard to measure against. | Yes |

---

## Category 2: The Core Protocol

These are the mandatory reading for anyone producing essays. They document the 4-pass method, the pattern catalog, and the version history that proves why the protocol exists.

| File | Purpose | Read First? |
|------|---------|-------------|
| `CLAUDE4.md` | **How to Write a Perfect Essay** — The definitive workflow. Core problem, required reading list, 4-pass protocol summary, 9-tic catalog, Smuggle Test, verification checklist, version history, workshop protocol. This is the master document. | **Yes — read first of all protocol docs** |
| `essayworkflow.md` | **Full Journey v1→v8** — Traces every version of "Becoming an Angel" across 2 models and 2 approaches. Documents exactly what broke at each stage and why conscious editing beats rewriting. Required by CLAUDE4 as first reading. | Yes — before slopreview |
| `slopreview.md` | **The 4-Pass Editing Protocol** — The operational handbook. Pattern catalog with before/after examples, Smuggle Test with all disguise forms, Pass 4 texture guide, verification checklist, version history table. Required by CLAUDE4 as second reading. | Yes — the manual |
| `slopnotes.md` | **Per-Essay Audits** — Line-by-line pattern analysis of all original essays (mundus, becoming_an_angel, ibn_arabi_barzakh, corbin_creative_imagination). Shows the same patterns across every essay. Also contains the full v5 rewrite session log. Required by CLAUDE4. | Yes — to internalise patterns |
| `stopslop.md` | **Pattern Discipline Quick Reference** — Shorter than slopreview. Tool chest of 5 replacement moves (flat assertion, forget X, question-answer, fragment, concrete image), frequency rules, self-check procedure, per-essay pattern counts, v3→v4 audit results. Good for quick consultation during editing. | Reference — use during Pass 3 |

---

## Category 3: Essay Generation Guides (essaygen/)

These live in `essaygen/` and cover the practical how-to of building essays from source material.

| File | Purpose | Read First? |
|------|---------|-------------|
| `essaygen/essayguide.md` | **The Comprehensive Guide** — Full pipeline from source material to deployed essay. Block rules, audio generation, deployment, writing voice, art system, complete file map. The reference implementation (mundus_handcrafted_v2). | Yes |
| `essaygen/perfectessay.md` | **Method A: Block-Based Essay** — How to write a perfect condensed essay. Extract source → follow author's structure → write body blocks directly as JSON → block rules → rhythm → avoid mistakes → choose concepts → final pass. The specific method for constructing body JSON. | Yes |
| `essaygen/essayprocess.md` | **Original Spec v0.1** — The data model and minimal schema. Source material, essay, body block kinds, concept rules, tagging, condensing rule, graph. Less operational than perfectessay.md but useful for understanding the data structures. | Yes — data model reference |
| `essaygen/v6algorithm.md` | **The Algorithm (v2.0)** — Complete algorithmic protocol: 7 axioms, Phase 0-6 (source decomposition → voice targeting → block generation → pattern elimination → texture injection → verification → output), all quantitative checksums. Updated with 10-block minimum, source block rule, semantic inversion check, interchangeability test, ending cold read, Rumi sprinkle. | Yes — the technical process |
| `essaygen/author.md` | **Complete Procedure** — Meta-document that orchestrates all other files. 10-stage workflow with required reading per layer, quality tiers, v1→v6 learning arc, review procedure, quick reference. Any AI model can follow this. | **Yes — read after V6 algorithm** |
| `essaygen/antislop.md` | **15 Rules from Earlier Failures** — What NOT to do. Never use DeepSeek API, never use Kokoro Docker, never let concepts explode past 3, never write flat transitions, never include redundant quotes, never write like a robot curator. Quick list, each rule with a concrete reason. | Yes — after protocol docs |
| `essaygen/antislopguide.md` | **Memoo Voice Guide** — Full before/after rewrites showing the voice transformation. Drop-in prompt block for style. Diagnostic test ("read aloud, if you can predict the next shape it's slop"). Useful for understanding voice even though the Memoo approach was superseded. | Yes — for voice |
| `essaygen/issuesessay.md` | **Issues Log** — Complete record of every failure: Kokoro OOM, Cloudflare no-filesystem, DeepSeek reasoning model token exhaustion, TS type cascade, pdf-parse API breakage. Includes detailed evidence (token counts per test, API response dumps). Read to avoid repeating history. | Yes — before attempting API calls |
| `essaygen/newgraph.md` | **Initial Source Atlas Spec** — Earlier draft of the minimal spec. Largely superseded by essayprocess.md but kept for reference. Same core structure. | Optional |

---

## Category 4: Quality & Voice Analysis

These files analyze what makes prose alive or dead. Use during the final texture and review phases.

| File | Purpose | Read First? |
|------|---------|-------------|
| `goodprose.md` | **What Makes Commentary Prose Alive** — Texture kit (unexpected nouns, fragments, concrete images, em-dash pivots, openings), voice registers by subject, four enemies, 10 alive lines with analysis, Smuggle Test for self-review. | Yes — after protocol docs |
| `perspective.md` | **External Critique of V6 System** — Fresh-eye review of all 33 v6 essays and the algorithm. Identifies blind spots: texture placement vs counting, interchangeability, 5-block problem, semantic inversions, source block paraphrasing. Includes full essay-by-essay review with scores. | Yes — before starting new work |
| `essaygen/rumiengine.md` | **Rumi's Poetic Mechanics** — Reverse-engineering of Rumi's technique for Phase 4 (final texture sprinkle only). Register shift, physical tethering, fragments, paradox, sound check, ending isolation. 12 engines analyzed with examples. | Yes — for the final pass only |
| `essaygen/algorithm-upgrade.md` | **V2.0 Upgrade Proposals** — Solutions to problems from perspective.md: block minimum 10, 4 specific essay merges (Blake+Hillman, Swedenborg+Corbin, Attar+Barzakh, Steiner+Plotinus), additional algorithm fixes and grading reweight. Reference for future development. | Reference |

---

## Category 5: Workshop & Current Work

These live in `essaygen/workshop/` and are the active working files.

| File | Purpose | Status |
|------|---------|--------|
| `essaygen/workshop/workshopguide.md` | **Operational Playbook** — The 7-stage pipeline for turning outlines into v6 essays. Source verification, concept triad, body construction, 4-pass protocol, art matching, final verification. Combines all prior protocols into one step-by-step workflow with checklists. | **Active** — read before starting any new essay |
| `essaygen/workshop/v6ficinoanalysis.md` | **Worked Example** — Full analysis of 6 ficino essays against becoming_an_angel_v6. Pattern counts per essay, texture density comparison, repair priorities, key differences. Shows exactly what "v6 quality" means in practice. | **Active** — reference for quality bar |
| `essaygen/workshop/v6ficinofeedback.md` | **Peer Review** — 35+ line-by-line rephrasing suggestions. Voice scores, alive vs dead analysis, cross-essay issues. Shows the difference at word level. | **Active** — reference for review |
| `essaygen/workshop/workshopprocess.md` | **Full Chain-of-Thought** — Complete documentation of the theurgy 6-essay process. Pattern counts per essay, repair strategies, voice target decisions, Magic Test results, surprises. Shows real discovery in action. | **Active** — learning reference |
| `essaygen/workshop/workshopalgorithm.md` | **Algorithm vs Multi-Step** — Comparative analysis: single-pass algorithm vs full workshop protocol. 12 semantic inversions found. When to use which method. | **Active** — method selection |
| `essaygen/workshop/v6_final/gradingsystem.md` | **Scoring Rubric (v2.0)** — 8 criteria with weights. Updated: C1 10%, C2 15%, C3 15%, C4 10%, C5 15%, C6 15%, C7 25%, C8 5%. Includes ranked order of corbin series essays and key findings. | **Active** — grading reference |
| `essaygen/workshop/v6_final/becoming_an_angel_v6.json` | **Reference Essay** — 15 AI blocks, 9 texture words, zero patterns. The benchmark all other essays are measured against. | **Reference** — study before writing |
| `essaygen/workshop/v6_final/corbin_*.json` | **Corbin Series** — 10 final v6 essays (becoming_an_angel, attar, avicenna, blake, creative_imagination, hillman, jung, plotinus_beauty, steiner, swedenborg). Various quality tiers. | **Active** — some need expansion or merge |
| `essaygen/workshop/v6_final/ficino_*.json` | **Ficino Series** — 6 v6 essays (world_living_book, sunlike_eye, ladder_of_desire, divine_madness, theurgy, spiritus). All under 10 AI blocks — need expansion. | **Needs work** — expand to 10+ AI |
| `essaygen/workshop/v6_final/goethe_*.json` | **Goethe Series** — 8 v6 essays. Produced via algorithm shortcut. 12 semantic inversions documented. | **Needs work** — semantic inversion fix |
| `essaygen/workshop/v6_final/theurgy_*.json` | **Theurgy Series** — 6 v6 essays. Produced via full workshop protocol. Best of the series: Chaldean. | **Active** |
| `essaygen/workshop/v6_final/mundus_handcrafted_v6.json` | **Mundus Imaginalis** — Deployed reference essay. | **Complete** |
| `essaygen/workshop/v6_final/ibn_arabi_barzakh_v6.json` | **Ibn Arabi Barzakh** — Deployed reference essay. | **Complete** |
| `essaygen/workshop/v6_final/corbin_creative_imagination_v6.json` | **Creative Imagination** — Deployed reference essay. | **Complete** |
| `essaygen/workshop/ficino_essays` | **Ficino Raw Outlines** — 6 essay outlines. Source for the v6 JSONs. | Consumed |
| `essaygen/workshop/theurgy_essays` | **Theurgy Raw Outlines** — 6 essay outlines. | Consumed |
| `essaygen/workshop/corbin_essays` | **Corbin Raw Outlines** — 5 essay outlines. | Consumed |
| `essaygen/workshop/goethe_essays` | **Goethe/Steiner Raw Outlines** — 5+ essay outlines. | Consumed |
| `essaygen/workshop/imaginal_essays` | **Reference Links** — Research link collection. | Reference |

---

## Category 6: Deprecated / Superseded

These files are kept for reference but should not be used for new work.

| File | Purpose | Status |
|------|---------|--------|
| `essaygen/essaywriter.md` | **AI Prompt for DeepSeek API** — The old prompt for generating essays via API. Documented because the API approach failed repeatedly (reasoning model eats all tokens). | **Deprecated** — Do not use. Write JSON directly. |
| `essaygen/generate-long-essay.mjs` | **Chunked API Script** — Split source into 20K chunks, process separately. Produced 42 concepts, 0 AI blocks, cut-off endings. | **Deprecated** — Do not use. |
| `essaygen/process-source.mjs` | **Single-Pass API Script** — First failed attempt at API-based generation. | **Deprecated** — Do not use. |
| `antislopguide.md` (root) | Duplicate of `essaygen/antislopguide.md` | Duplicate |
| `essayprocess.md` (root) | Duplicate of `essaygen/essayprocess.md` | Duplicate |
| `essaywriter.md` (root) | Duplicate of `essaygen/essaywriter.md` | Duplicate |
| `issuesessay.md` (root) | Duplicate of `essaygen/issuesessay.md` | Duplicate |

---

## Category 7: Supporting / Peripheral

These files are not about the essay generation method but inform the project context.

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Agent handoff document — links to build plan, architecture, metaphysics spec |
| `claude2.md` | Session log — Kokoro → Edge-TTS migration, glossary fixes, Cloudflare fixes |
| `AGENTS.md` | Next.js version warning — this project uses a non-standard Next.js |
| `graphstructure.md` | Atlas graph data model — YAML → Zod → generated-data.ts pipeline |
| `art.md` | Art curation system — seed batch format, sourcing rules, rights metadata |
| `cloudflare.md` | Cloudflare Workers deployment notes |
| `deploy.md` | Deployment instructions |
| `mbuild.md` | Master build plan — all phases with progress tracking |
| `mbuildnotes.md` | Additional build notes |
| `magnum.md` | Anti-hallucination guide |
| `metaphysics.md` | Controlled vocabulary + extraction pipeline spec |
| `letta.md` | Memory block pattern design |
| `notes2.md`, `notes4.md`, `notes6.md`, `notes7.md` | Various project notes |
| `ideas.md` | Project ideas |
| `occult.md` | Occult/esoteric notes |
| `README.md` | Project readme |

---

## Reading Order (Condensed)

If you are new and need to produce essays, read in this exact order:

1. `CLAUDE3.md` — identity, principles, architecture
2. `CLAUDE4.md` — core problem, protocol summary, tic catalog, Smuggle Test, checklist
3. `essayworkflow.md` — version history (why the protocol exists)
4. `slopreview.md` — the 4-pass manual (pattern catalog, repair techniques, texture)
5. `essaygen/antislop.md` — 15 rules (what not to do)
6. `essaygen/antislopguide.md` — voice reference (before/after, Memoo prompt)
7. `essaygen/perfectessay.md` — how to construct body JSON
8. `essaygen/essayprocess.md` — data model reference
9. `essaygen/v6algorithm.md` — the technical algorithm
10. `essaygen/author.md` — the complete procedure
11. `essaygen/workshop/workshopguide.md` — the operational playbook
12. `essaygen/workshop/v6ficinoanalysis.md` — worked example
13. `goodprose.md` — what makes prose alive
14. `perspective.md` — external critique (blind spots)
15. `essaygen/rumiengine.md` — final texture sprinkle (Phase 4 only)

Then: `stopslop.md` for quick reference during editing, `slopnotes.md` to internalise patterns, `essaygen/workshop/v6ficinofeedback.md` for peer review reference.

---

## File Relationship Diagram

```
CLAUDE3.md ──→ Identity + Architecture
    │
    ├── essaygen/antislop.md ─────── 15 rules
    ├── essaygen/antislopguide.md ─── Memoo voice
    ├── essaygen/essayguide.md ────── comprehensive guide
    ├── essaygen/perfectessay.md ──── Method A construction
    ├── essaygen/essayprocess.md ──── data model
    └── essaygen/issuesessay.md ───── failures log

CLAUDE4.md ──→ Protocol + Tic Catalog
    │
    ├── essayworkflow.md ──────────── v1→v8 version history
    ├── slopreview.md ─────────────── 4-pass protocol (the manual)
    ├── slopnotes.md ──────────────── per-essay audits
    ├── stopslop.md ───────────────── quick reference
    ├── essaygen/v6algorithm.md ───── the algorithm
    ├── essaygen/author.md ────────── complete procedure
    ├── goodprose.md ──────────────── texture analysis
    ├── perspective.md ────────────── external critique
    ├── essaygen/rumiengine.md ────── final sprinkle layer
    ├── essaygen/essaygenaudit.md ─── this file
    └── essaygen/workshop/ ────────── active work
         ├── workshopguide.md ─────── 7-stage pipeline
         ├── v6ficinoanalysis.md ──── worked example
         ├── v6ficinofeedback.md ──── peer review
         ├── v6_final/ ────────────── all final v6 essays
         └── gradingsystem.md ─────── scoring rubric
```

---

## Status Summary

| Area | Files | Status |
|------|-------|--------|
| Core identity | CLAUDE3.md | Complete, stable |
| Protocol (master) | CLAUDE4.md | Updated with required reading |
| Protocol (manual) | slopreview.md, essayworkflow.md, stopslop.md, slopnotes.md | Complete, stable |
| Algorithm | v6algorithm.md, author.md | Updated to v2.0 |
| Quality analysis | goodprose.md, perspective.md, rumiengine.md | Complete |
| Essay gen guides | essaygen/*.md | Complete |
| Workshop guide | workshopguide.md | Complete |
| Ficino essays | 6 v6 JSONs | Need expansion to 10+ AI |
| Corbin essays | 10 v6 JSONs | 4 complete, 6 need expansion/merge |
| Theurgy essays | 6 v6 JSONs | Active |
| Goethe essays | 8 v6 JSONs | Need semantic inversion fix |
| Reference essays | becoming_an_angel, mundus, barzakh, creative_imagination | Complete, deployed |
