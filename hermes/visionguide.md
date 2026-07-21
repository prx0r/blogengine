# Vision Guide — Master Navigation for Building Hermes

> This document is written for the agent building this system. It organizes every doc we've created, explains what each contains, why it matters, and how to build the initial POC and iterate.

---

## The One-Sentence North Star

> **Build a versioned, living scholarly literature where every new source improves enduring research objects rather than producing disposable answers.**

Hermes is the librarian, not the author. Every paragraph in every Research Object is `kind: "source"`. The system compiles, links, voices, deploys, and improves — but never creates original scholarly claims.

---

## What We're Building

A self-sustaining scholarly compilation pipeline running on a VPS via Hermes Agent. The user sends a paper title/DOI/URL on Telegram. Hermes acquires it, checks which existing Research Objects it affects, proposes updates via knowledge pull requests, merges on approval, lint+tests the result, and publishes updated essays/audio to Cloudflare. All of this runs autonomously via cron, with the user only reviewing proposals and approving merges.

### The Hierarchy

```
Raw Sources (uploaded PDFs, acquired papers)
    ↓ Tier 1: Ingestion
Works (content/works/) — metadata + provenance + tier (1=source, 2=commentary)
    ↓ Tier 2: Compilation
Research Objects (content/research-objects/) — one bounded question, versioned, source-tracked
    ↓ Tier 3: Collection
Collections — groups of ROs on a theme
    ↓ Tier 4: Publication
Books — structured sequence of collections
    ↓ Tier 5: Guided Experience
Journeys — personalized learning paths
    ↓ Tier 6: Structured Education
Courses — journeys with assessments
```

### The 15 Research Object Families

Every scholarly question maps to one:

| Family | Pattern | Example | Router Regex |
|---|---|---|---|
| 1 Thinker on Topic | "{T} on {X}" | Ficino on the Daimon | `(.+) on (.+)` |
| 2 Topic Across Thinkers | "{X} across {list}" | Daimon across Platonists | `(.+) across (.+)` |
| 3 Thinker on Thinker | "{A} on {B}" | Ficino on Plato | `(.+) on (.+)` (disambiguated) |
| 4 Concept Evolution | "evolution of {X}" | Daimon Plato→Ficino | `evolution of (.+)` |
| 5 Comparative | "{A} vs {B}" | Corbin vs Jung | `(.+) vs (.+) on? (.+)` |
| 6 Reception | "reception of {work}" | Reception of Timaeus | `reception of (.+)` |
| 7 Tradition | "what is {X}" | What is Theurgy | `what is (.+)` |
| 8 Theme | "everything on {X}" | Everything on Beauty | `everything on (.+)` |
| 9 Practice | "{T} on {practice}" | Ficino on Prayer | `(.+) on (.+)` (disambiguated) |
| 10 Historical Question | "how did {X}" | How astrology survived | `how did (.+)` |
| 11 Debate | "arguments for/against {X}" | Is imagination ontological? | `arguments? for and against (.+)` |
| 12 Research Map | "map {domain}" | Map everything on Spiritus | `map everything on (.+)` |
| 13 Reading Companion | "reading companion for {book}" | Three Books on Life | `reading companion for (.+)` |
| 14 Sourcebook | "primary sources on {X}" | Primary Sources on Daimon | `primary sources? on (.+)` |
| 15 Research Question | "investigate: {Q}" | Did Ficino identify Genius with Daimon? | `investigate:? (.+)` |

---

## Document Map — What Every Doc Contains and Why It Matters

### Core Vision Docs (Read First)

| Doc | What It Contains | Why It Matters |
|---|---|---|
| `visionary.md` | 5 visions (Learning Loop, Personal ROs, Dreaming Mind, Comparative Engine, Mature Ecosystem) + 15 RO families + question router + hierarchy of composition | The complete product vision. Read this to understand what we're ultimately building. |
| `visionarynotes.md` | Karpathy LLM Wiki convergence, immutable vs living artifacts, append-only timeline, recursive composition, issues-over-kanban, research backlog | The philosophical justification. Read this to understand WHY this approach is correct. |
| `visionbuild.md` | Gap analysis, current state, engineering pipeline (6 stages), state machine, version pipeline, cron orchestra, error recovery, paper-derived mechanisms, concrete algorithms (index-time compilation loop, query-time traversal, Error Book format) | **The build plan.** Read this to know what to build and in what order. |
| `daimon.md` | Research Object concept, grounded walkthrough (Day 1→3), emergent effects (video, podcast, journey, chat, dashboard), file map | The core product design. Read this to understand what a Research Object actually is. |
| `currentresearchdocs.md` | Three-tier taxonomy (Source → Commentary → Compilation), factory pipeline, concept essays, Kanban flow, git versioning, upload→extract flow | The content architecture. Read this to understand how content is categorized. |

### Build Reference Docs (Read When Implementing)

| Doc | What It Contains | Why It Matters |
|---|---|---|
| `buildreferences.md` | 9 papers analyzed (core contribution, what to implement, what to avoid, pipeline mapping) + 6-phase combined roadmap | The academic grounding. Read this when implementing each pipeline stage to know which paper's mechanism to use. |
| `hermes/docs/papers/retrieval-as-reasoning.md` | Full paper summary: LLM-Wiki system design, Error Book, traversal strategies, results, weak spots | **The most important paper.** Read this before building Stages 2-5. Provides the index-time compilation loop and query-time traversal loop we're implementing. |
| `hermes/docs/papers/wicer.md` | CEGAR-inspired compile→evaluate→refine loop, diagnostic probes, 53-60% catastrophic failure rate for blind compilation | Read before building Stage 5 (Lint+Test). The diagnostic test approach is critical — blind compilation fails more than half the time. |
| `hermes/docs/papers/karpathy-llm-wiki-gist.md` | Original Karpathy pattern: raw/wiki/schema, ingest/query/lint | The conceptual seed. Read for philosophy; implement from the LLM-Wiki paper. |
| `hermes/docs/papers/hipporag2.md` | Personalized PageRank over KG for multi-hop retrieval | Reference for Stage 5 if we add graph-based "related ROs" recommendations. |
| `hermes/docs/papers/lightrag.md` | Dual-level entity/relation retrieval | Reference for the question router's broad-vs-specific routing. |
| `hermes/docs/papers/bright-benchmark.md` | The problem statement: dense retrievers fail on multi-step inference | The empirical justification for why we need ROs instead of raw retrieval. |

### Implementation Docs (Read During Build)

| Doc | What It Contains | Why It Matters |
|---|---|---|
| `hermes/AGENTS.md` | Project context: site URLs, Telegram details, API endpoints, skills reference, repo structure | Read on every Hermes startup. Defines the environment. |
| `hermes/SOUL.md` | Daimonic personality: curious, methodical, honest about gaps. 11 orientation docs to read on startup. | The character Hermes should embody. Enforces the "never write" rule. |
| `hermes/notes/hermesspec1.md` | Integrated build specification, system architecture diagram, division of responsibility, build status, key files | The architectural overview. Read to understand how VPS + Cloudflare + Hermes fit together. |
| `hermes/notes/researcharm.md` | Verified API capabilities (OpenAlex, Unpaywall, HAL, Zenodo), source classifier, default retrieval pathway | Read before building Stage 1 (Acquisition). Contains the exact API endpoints and response formats. |
| `hermes/notes/targets.md` | Paper acquisition targets by corpus (Ficino, Corbin, Nanananda), verified status, repository structure | The acquisition queue. Read to know what to acquire next. |
| `hermes/notes/retrieval-guide.md` | Working retrieval methods, what each API can/can't do, download validation steps, Hermes tool chain | Read before building Stage 1. Contains the practical lessons from testing each API. |
| `hermes/notes/writing/essay/CLAUDE4.md` | 4-pass essay writing protocol, tic catalog, smuggle test, verification checklist | Read when building Type A essay output. The quality standard for Hermes-written essays. |
| `hermes/notes/writing/essay/CLAUDE5.md` | Essay JSON format, TTS rules, required fields, voice config | Read when building Stage 6 (Publish). Defines the output format. |
| `hermes/notes/handover.md` | Core principles, architecture overview, fragile parts | Master orientation for the astrology engine. Read if modifying the astrology code. |
| `hermes/notes/handover2.md` | Codebase context, bugs fixed, roadmap | Supplementary orientation. Read after handover.md. |

### Ideas & Future

| Doc | What It Contains | Why It Matters |
|---|---|---|
| `ideas.md` | 13 architectural ideas (ROs as central artifact, 3-tier taxonomy, knowledge PRs, semantic versioning, impact detection, Error Book, diagnostic tests, personal ROs, recursive composition, dreaming cycle, Karpathy convergence, skill-based learning) | The seedling garden. Read when looking for the next thing to build after the MVP. |
| `hermes/notes/publication-notes.md` | Pipeline session log, Type A vs Type B distinction, PDF extractability status | Historical record. Read to understand what's been tried and what failed. |
| `hermes/notes/acquisition-process-notes.md` | What worked and what didn't in acquisition runs, Wayback Machine fix, Semantic Scholar fallback | Lessons learned. Read before modifying the acquisition script. |

---

## Initial MVP / POC — What to Build First

### MVP Goal

One working Research Object created manually, deployed as an essay with audio, proving the format end-to-end. Then automate the creation.

### Phase 0: Foundation (Days 1-2)

**Objective:** Prove the RO format works end-to-end.

1. **Create the RO directory structure:**
   ```
   content/research-objects/
     ficino-on-the-daimon/
       object.json
       sources.json
       issues.json
   ```

2. **Build one RO manually** — "Ficino on the Daimon" (Family 1: Thinker on Topic) from the 2 Ficino works we already have. Every block `kind: "source"`. Per-paragraph provenance. Coverage map. Version set to `1.0.0`.

3. **Deploy as essay** via the existing `/publish-paper` pipeline. Generate audio. Essay at `/essay/ficino-on-the-daimon`. Verify it works.

4. **Create the Error Book** at `content/research-objects/error-book.json`. Seed with one real error from the acquisition process notes.

**Success criteria:** A Research Object exists as JSON, deploys as an essay with audio, and the Error Book has one entry.

### Phase 1: The State Machine (Days 3-5)

**Objective:** Hermes can track RO states and bump versions.

1. **Build `ro-state.py`** — a Python script that:
   - Creates ROs with initial state `idea`
   - Transitions between states: `idea → collecting → draft → review → published → stale → improving`
   - Logs every transition to `timeline[]`
   - Bumps semantic version: PATCH (citation fix), MINOR (new source), MAJOR (reorg)
   - Validates that transitions are legal

2. **Implement the 8-state machine** from visionbuild.md. Each state has:
   - Valid entry transitions
   - Valid exit transitions
   - Required data at each state
   - Error handling for illegal transitions

3. **Write a changelog** — append to `changelog.md` in the RO directory on every transition.

**Success criteria:** `ro-state.py create`, `transition`, `log`, `bump` all work. Can walk `ro:ficino-daimon` through idea→collecting→draft→review→published.

### Phase 2: Impact Detection (Days 5-7)

**Objective:** When a new work arrives, Hermes can tell which ROs it matters for.

1. **Implement `search_objects(query)`** — search RO index by name, alias, tag, concept. Returns matching RO IDs and relevance scores.

2. **Implement materiality scoring** — deterministic first version:
   ```
   materiality = shared_concept_count × source_quality × gap_coverage
   ```
   No model needed. Simple arithmetic on existing metadata fields.

3. **Wire into acquisition pipeline** — when `acquisition.py` finishes, call impact analysis on the new work. Generate report: "ro:ficino-daimon: +12% coverage, 3 new paragraphs."

4. **Telegram notification** — send the impact report with [Accept] [Reject] buttons.

5. **Error if no ROs affected** — log and stop. Don't spam the user.

**Success criteria:** Acquire a new Ficino paper → get a Telegram notification saying it affects `ro:ficino-daimon` with a coverage estimate.

### Phase 3: Knowledge PRs (Days 7-10)

**Objective:** Accept impact → create PR → review → merge → version bump.

1. **Implement the PR workflow:**
   - `git checkout -b ro/ficino-daimon/add-source`
   - Generate proposed changes (which sections, which passages)
   - Present diff on Telegram
   - On approval: merge, bump version, update changelog
   - On reject: close branch, log decision

2. **Three proposal types** from DeepRefine:
   - `EXPAND` — new coverage (MINOR bump)
   - `CORRECT` — fix errors (PATCH bump)
   - `REORGANIZE` — restructure (MAJOR bump)

3. **Source-contribution manifest** — each RO tracks which sources contributed which sections and when they were last reviewed.

**Success criteria:** User accepts impact notification → PR created → approved → merged → RO version bumps → changelog updated.

### Phase 4: Lint + Test (Days 10-12)

**Objective:** Every merge triggers automatic quality checks.

1. **Create diagnostic test format:**
   ```yaml
   tests:
     - question: "What terms does Ficino use for the daimon?"
       required_sources: ["work:ficino-letters", "work:ficino-platonic-theology"]
     - question: "How is daimon related to astrology?"
       expected_coverage: ["natal configuration", "planetary mediation"]
   ```

2. **Implement compile→test→refine loop** (from WiCER):
   - After merge, run tests
   - If tests fail, identify missing coverage
   - Pin missing facts, recompile
   - Run tests again
   - Max 2 iterations (recovers 80% of lost quality per WiCER)

3. **Error Book integration**:
   - Lint failures → Error Book entry
   - Error Book constraints injected into next compilation
   - Deterministic auto-fix for structural errors (29-64% of cases)
   - LLM fix for semantic errors (remaining cases)

4. **Two-tier lint**:
   - Structural: broken citations, missing sources, dangling links (deterministic)
   - Semantic: unsupported facts, contradictions (LLM-based, weekly cron)

**Success criteria:** Merge → automatic lint+test → test failures found → fixes applied → tests pass. Error Book accumulates constraints.

### POC Complete

After Phase 4, the system can:
- Acquire a paper
- Detect which ROs it affects
- Propose an update via knowledge PR
- Merge on approval
- Lint+test the result
- Accumulate constraints in the Error Book

The user's role is: send papers, review impact notifications, approve/merge PRs. Everything else is autonomous.

---

## Iteration Path (After POC)

### Phase 5: Autonomous Operation (Week 3)

- Wire all 5 daily/weekly cron jobs from visionbuild.md
- Impact detection cron runs daily at 6am
- Lint runs Monday 9am
- Test runs Monday 10am
- Dreaming cycle runs Sunday 2am
- Monthly digest on the 1st

### Phase 6: Output Generation (Week 4)

- Auto-publish ROs as essays on `PUBLISHED` state
- Auto-generate audio on publish
- Version pin outputs to RO version
- Drift detection: weekly check if outputs are stale vs. their RO

### Phase 7: The Learning Loop (Month 2)

- RO self-review: compare RO body against source texts
- Gap score calculation
- Hermes writes improvement skills via `skill_manage`
- Skill-linked version tracking
- Human feedback incorporation

### Phase 8: Emergence (Month 2+)

- Comparative ROs auto-generated from overlapping ROs
- Dreaming cycle proposing new RO ideas
- Personal ROs from diary entries
- Coverage dashboard
- Weekly ecosystem digest

---

## Key Decisions That Must Not Be Violated

1. **Every paragraph in every RO is `kind: "source"`.** Hermes never writes original claims. This is the one rule that binds everything.

2. **Sources are immutable.** Never edit a work JSON after creation. Only add new versions.

3. **The Error Book is a living document.** Errors are not deleted — they are verified, closed, and retained as history. Constraints accumulate.

4. **Impact notifications require user approval.** Never auto-merge. The user reviews every PR.

5. **Lint+test before publish.** Blind compilation fails 53-60% of the time (WiCER finding). Tests are mandatory, not optional.

6. **Version pins on everything.** Every output records which RO version it was built from. Drift is detected, not assumed.

7. **Private and public are separate.** Personal notes link to RO versions without altering canon. Private experience never silently changes scholarship.

---

## Quick Reference: Reading Order for New Agents

1. `handover.md` + `handover2.md` — project orientation (30 min)
2. `daimon.md` — what a Research Object is (20 min)
3. `visionary.md` — the 5 visions + 15 families (30 min)
4. `visionbuild.md` — the build plan + pipeline spec (30 min)
5. `currentresearchdocs.md` — three-tier taxonomy (15 min)
6. `buildreferences.md` — paper mechanisms (20 min)
7. `hermes/AGENTS.md` + `hermes/SOUL.md` — environment + character (10 min)
8. `hermes/docs/papers/retrieval-as-reasoning.md` — key paper (20 min)

Total: ~3 hours to full context.
