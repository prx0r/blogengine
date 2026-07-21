# VisionBuild — Gap Analysis & Build Plan

> A honest look at where we are vs. where the vision goes, and what to build next.

---

## Where We Are

A working VPS with Hermes, a Telegram bot, 7 PDFs in the library, 13 cataloged paper records, a deploy pipeline to Cloudflare, and one published essay with audio. We have:

- **Hermes v0.18.2** running as a systemd service with Telegram gateway
- **Acquisition pipeline** that resolves DOIs via Crossref/OpenAlex/Unpaywall and downloads OA copies
- **Publishing pipeline** that formats text as JSON, generates audio (male/female dual voice), and deploys to Cloudflare
- **7 PDFs** in `library/` (3 Corbin, 2 Ficino, 1 Nanananda, 1 Kiosoglou)
- **13 work records** in `content/works/` (7 with PDFs, 6 stub records for paywalled papers)
- **2 author records** in `content/authors/` (Corbin, Nanananda)
- **One live essay** at `https://re-rendering-atlas.tradesprior.workers.dev/essay/corbin_imago_templi_v6` with 11:20 audio
- **Skills**: `/publish-paper` (Type B, no writing), `/write-and-publish` (Type A, with writing), `/acquisition`, `/deploy-site`
- **Git tracking** for everything, Cloudflare deploy via `npm run cf:deploy`
- **Hermes documentation** fully downloaded (66K lines)

---

## Where the Vision Goes

A self-sustaining scholarly compilation factory where Hermes ingests papers, extracts passages, compiles them into 15 types of Research Object, detects disagreements across traditions, learns from its mistakes by writing skills, dreams up new connections weekly, generates audio/video/journeys/courses from the same source material, and never writes a single original word.

The hierarchy:
```
Raw Sources → Works → ROs → Collections → Books → Journeys → Courses
```

The one rule: every paragraph in every RO is `kind: "source"`. Hermes never writes.

---

## The Gap

### What Exists vs. What Doesn't

| Component | Where | Status |
|---|---|---|
| Hermes + Telegram gateway | VPS systemd service | ✅ Running |
| Acquisition pipeline | `hermes/skills/research/acquisition/` | ✅ Working |
| Publishing pipeline | `hermes/skills/publishing/publish-paper/` | ✅ Working |
| Cloudflare deploy | `hermes/skills/devops/deploy-site/` | ✅ Working |
| Library of PDFs | `library/` | ✅ 7 PDFs |
| Work records | `content/works/` | ✅ 13 records |
| Author records | `content/authors/` | ✅ 2 records |
| Concept definitions | `content/glossary/concepts/` | ✅ 50+ concepts |
| Essay JSONs | `content/glossary/essays/` | ✅ 60+ essays |
| Audio generation | `scripts/generate-audio.mjs` | ✅ Working |
| **Research Objects** | `content/research-objects/` | ❌ Doesn't exist |
| **RO creation pipeline** | Hermes skill + script | ❌ Doesn't exist |
| **15-family question router** | `router.py` | ❌ Doesn't exist |
| **Passage extraction + concept tagging** | Enhanced pipeline | ❌ Doesn't exist |
| **Impact detection cron** | Cron + notification | ❌ Doesn't exist |
| **Learning loop (review → skill write)** | Cron + `skill_manage` | ❌ Doesn't exist |
| **Dreaming cycle** | Cron + dream log | ❌ Doesn't exist |
| **Comparative/disagreement engine** | Script to diff ROs | ❌ Doesn't exist |
| **Version-as-PR workflow** | Git + Telegram approvals | ❌ Doesn't exist |
| **Personal ROs** | Diary → RO pipeline | ❌ Doesn't exist |
| **User onboarding / Journeys** | Site feature | ❌ Doesn't exist |
| **Scholar submission** | Site feature | ❌ Doesn't exist |
| **Weekly digest / dashboard** | Cron + notification | ❌ Doesn't exist |

### What Requires New Code vs. What's Just Skills

Almost none of the missing pieces require writing new application code. They require **SKILL.md files** — instructions that tell Hermes how to orchestrate its existing tools.

**Actually needs new code (small):**
- 15-family question router (~200 lines of Python pattern matching)
- Contradiction detection logic (~100 lines in acquisition script)

**Everything else is just skills + JSON schemas + cron configs:**
- RO creation → Hermes skill using terminal, git, web_search
- Impact detection → cron job with notification template
- Learning loop → cron + `skill_manage` (Hermes writes its own skills)
- Dreaming cycle → cron + journal_write
- Version PR workflow → git branch + Telegram approval buttons
- Personal ROs → journal query + RO creation skill
- Weekly digest → cron + notification
- Dashboard → site frontend reads RO JSONs directly

---

## Build Plan

### Phase 1: The Research Object (This Week)

**Goal:** Prove the RO format works end-to-end.

1. Create `content/research-objects/` directory
2. Manually create one RO from a paper we already have (Kiosoglou on Ficino — family 1: Thinker on Topic)
3. Deploy it as an essay at `/essay/kiosoglou-ficino-soul`
4. Verify the format: every block `kind: "source"`, per-paragraph provenance, coverage map, version tracking

### Phase 2: The Automation (Next Week)

**Goal:** Hermes can create ROs from its existing library.

1. Build the RO creation skill — Hermes reads a work JSON + its PDF, extracts passages, tags concepts, creates the RO JSON
2. Build the 15-family question router — regex pattern matching on user questions
3. Run Hermes on the remaining 6 papers with text layers
4. First Thinker-on-Topic ROs for: Ficino (daemon socratico), Corbin (temple + history of islamic philosophy), Kiosoglou

### Phase 3: The Factory (Week 3)

**Goal:** New papers trigger automatic RO updates.

1. Impact detection: when a new work is acquired, check which ROs it affects
2. Coverage calculation: for each RO, what % of topics have sources
3. Research TODO generation: for missing topics, search OpenAlex
4. Notification to Telegram: "New paper affects ro:ficino-daimon (+12%)"

### Phase 4: The Loop (Week 4)

**Goal:** Hermes improves its own compilation quality.

1. Self-review skill: Hermes compares RO against its source papers
2. Gap score calculation
3. Skill writing: Hermes uses `skill_manage` to create improvement skills
4. Version tracking: each RO version stores the skill that produced it

### Phase 5: The Emergence (Month 2)

**Goal:** Cross-RO patterns, disagreements, meta-compilations.

1. Dreaming cycle cron
2. Comparative/disagreement engine
3. Auto-generated meta-ROs (Concept Evolution, Topic Across Thinkers)
4. Personal ROs from diary entries
5. Weekly digest

### Phase 6: The Ecosystem (Month 3+)

**Goal:** Self-sustaining scholarly platform.

1. New user onboarding via Journeys
2. Scholar submission flow
3. Everything dashboard
4. Coverage trends, skill evolution tracking

---

## The Karpathy Convergence — LLM Wiki Landscape Analysis

### The Core Insight

Something close exists in pieces, but no existing project does Hermes's exact thing: **versioned, topic-specific scholarly compilations that become reusable living research objects with source-level change tracking.**

Karpathy's LLM Wiki gives the philosophy. A few repos give ingestion, Markdown maintenance, linting, Git history, and citations. Scholarly tools give reproducible manuscripts, literature-review workflows, and structured comparisons. **Hermes sits in the gap between them.**

### What Karpathy Actually Proposed

Karpathy's original contribution is a short architectural pattern, not software. His model has three layers:

```text
raw/       ← immutable source documents
wiki/      ← LLM-maintained Markdown syntheses
schema/    ← instructions governing structure and maintenance (CLAUDE.md)
```

His core loop:

```text
INGEST  → source summary → update relevant pages → update index → log
QUERY   → search maintained wiki → answer from compiled pages
LINT    → find contradictions, broken links, stale summaries, orphans
```

The important difference from RAG: synthesis occurs during **ingestion and maintenance**, not reconstructed from raw chunks per query. The wiki is a persistent artifact whose contradictions, cross-references, and evolving synthesis have already been compiled.

### The Gap: Where Existing Projects Fall Short

Current systems fall into four groups:

| Approach | Examples | Strengths | Missing for Hermes |
|---|---|---|---|
| **LLM Wiki projects** | karpathy-llm-wiki, llmwiki | Maintained Markdown, ingest/query/lint | Generic page ontology, no research-object lifecycle |
| **RAG / research assistants** | ChatGPT, NotebookLM | Answers and summaries | No durable accumulation |
| **Systematic review tools** | CoLRev | Rigorous source workflow | Not living conceptual essays |
| **Knowledge graphs** | Wikibase, ORKG | Structured claims | Poor long-form scholarly objects |

Hermes's opportunity: combine the strongest part of each without taking on all their complexity.

### Project 1: karpathy-llm-wiki (Astro-Han)

**What it is:** A single SKILL.md file that packages Karpathy's pattern as an installable Agent Skill. Three operations: ingest, query, lint.

**Structure:**
```text
raw/topic/source.md    ← immutable sources
wiki/topic/page.md     ← LLM-compiled pages
wiki/index.md          ← table of contents
wiki/log.md            ← append-only operation log
```

**Innovations to borrow:**
- A single explicit skill specification — three commands before anything ambitious
- Markdown as the inspectable artifact
- A dedicated lint operation
- Citations from the compiled page back to sources
- Raw sources and maintained syntheses as separate layers

**What it lacks for Hermes:**
- Research-object lifecycle (no semantic versioning, no version history)
- Source contribution tracking per revision
- Topic-specific source inventories
- Distinction between source-only montage and AI-authored prose
- Impact detection ("this new source affects these existing objects")
- Pull-request workflow for updates
- Downstream artifact generation (audio, video, journeys)

**How to use:**
- Borrow the SKILL.md pattern and INGEST/QUERY/LINT architecture
- Use its lint approach (citation resolution, broken links, orphans) as a template for RO-level linting
- Do NOT copy its page ontology — Hermes's unit is the Research Object (one bounded question), not the generic wiki page

### Project 2: AutoSci (skyllwt)

**What it is:** A full research lifecycle platform with 30+ agent skills across paper discovery, ingestion, idea development, experiments, manuscript production, review, and rebuttal. Built by Peking University's DAIR Lab.

**Key innovations:**
- **Prefill:** seeds `wiki/foundations/` with canonical background BEFORE ingesting papers, preventing duplicate concept pages for textbook material
- **Separate discovery from ingestion:** `/discover` builds a ranked shortlist without ingesting; user approves before ingest
- **Agent skills organized by research phase:** Knowledge Base → Ideation & Experiments → Writing & Dissemination
- **Error Book:** persistent record of corrections, contradictions, and maintenance rules
- **Diagnostic tests after compilation:** each object has small test set that runs after every revision

**What to borrow:**
- Foundation layer for canonical thinkers, works, and traditions (prevent duplicate foundational concepts)
- Ranked candidate lists — don't auto-ingest every search result
- Explicit editing tools organized by phase
- Error Book — persistent correction record with rules added to prevent recurrence
- Diagnostic tests — "unit tests for essays" that run after every compilation

**What to avoid:**
- Its full scientific lifecycle is much larger than Hermes needs
- Only need its first phase: discover → approve → ingest → compile → revise

### Project 3: llmwiki (lucasastorian)

**What it is:** A full web app with MCP integration, Chrome extension, PDF clipper, highlights and margin notes, Next.js interface, source backlinks, graph visualization. 1.3k stars.

**Key innovations:**
- **MCP access:** Claude connects via MCP tools (search, read, create, edit, append, delete, lint) — not hardwired to one model
- **Chrome extension with highlights + margin notes:** captures not just what you read but what you thought about it
- **Source backlinks:** every wiki page cites back to source files
- **Nightly Claude Routine:** scheduled autonomous maintenance
- **Three-tier architecture:** local mode (SQLite + filesystem) / hosted mode (Postgres + S3) — same operations work identically

**What to borrow:**
- MCP or tool-based access rather than hardwiring one model
- Browser/PDF clipping with highlight and margin-note ingestion
- Exact source backlinks from every paragraph
- Scheduled autonomous maintenance (Claude Routine pattern)
- "View the synthesis, then inspect the underlying source" UX pattern

**What it lacks:**
- Still a personal Wikipedia, not a research-object system
- No source-impact analysis
- No versioned scholarly compilations
- No distinction between source montage and AI prose

### Adjacent Scholarly Tools

**CoLRev** — open-source collaborative literature review environment with Git collaboration, deduplication, and source workflow statuses (discovered → screened → included → excluded → processed → synthesized). Borrow: formal source workflow statuses.

**Manubot** — Markdown manuscripts with Git versioning, automatic citation resolution, multi-format publication (HTML, PDF, DOCX), and pull-request review. Borrow: Markdown publication flow, automatic citations, multi-format outputs.

**Wikibase / ORKG** — structured knowledge graphs with provenance, qualifiers, and SPARQL. Borrow: every assertion may have qualifiers and provenance; comparisons as persistent scholarly objects. Do not borrow yet: full RDF modelling, SPARQL as primary interface.

**WiCER (arXiv 2605.07068)** — iterative compilation with diagnostic tests: compile → test → locate missing facts → refine → test again. Blind compilation had high failure rates; targeted diagnosis recovered quality in 1-2 refinement cycles. Borrow: diagnostic tests after every compilation.

**Retrieval as Reasoning (arXiv 2605.25480)** — treats knowledge as a compilable, self-evolving wiki with bidirectional links and an Error Book for persistent correction. Borrow: the Error Book concept.

### What Hermes Should Do Differently

| Dimension | LLM Wiki projects | Hermes |
|---|---|---|
| Unit of knowledge | Generic wiki page | Research Object (one bounded scholarly question) |
| Source tracking | Full document | Per-paragraph provenance |
| Versioning | Git history | Semantic versioning + scholarly changelog |
| Updates | Manual or cron re-ingest | Impact detection + knowledge pull requests |
| Outputs | Markdown pages | Essay + Audio + Video + Journey + Course |
| Recursion | No | ROs compose into higher-order ROs |
| Gap tracking | Lint reports | Issues + research todos + coverage map |
| Authorial voice | LLM-written | Source-only montage (Tier 3) vs. Hermes essay (Type A) |

### The Architecture to Build

```text
content/
  research/
    sources/           ← immutable source manifests (work JSONs)
    objects/           ← living Research Objects with versions
      ficino-on-the-daimon/
        object.json
        sources.json
        changelog.md
        issues.json
        tests.yaml
        versions/
          v1.0.json
          v1.1.json
    outputs/           ← generated artifacts
      essays/
      audio/
    schema/
      RESEARCH_OBJECT.md
      INGEST.md
      UPDATE.md
      LINT.md
```

### Source-Contribution Manifest

Every RO needs a manifest tracking which sources contributed what:

```json
{
  "object_id": "ro:ficino-daimon",
  "current_version": "1.2.0",
  "sources": [
    {
      "source_id": "work:voss-becoming-angel",
      "first_added_in": "1.0.0",
      "last_reviewed_in": "1.2.0",
      "contribution": ["Ficinian ascent", "daimon and vocation"],
      "sections_affected": ["ontology", "astrology"],
      "status": "included"
    }
  ]
}
```

### Knowledge Pull Requests

An update becomes a source-aware change proposal:

```json
{
  "proposal_id": "rp:0041",
  "object_id": "ro:ficino-daimon",
  "new_source_id": "work:walker-spiritual-magic",
  "proposed_changes": [
    {"section": "astrology", "operation": "expand", "reason": "Adds historical treatment of planetary spirits"},
    {"section": "terminology", "operation": "qualify", "reason": "Challenges equivalence of genius and daimon"}
  ]
}
```

### Semantic Versioning for Research Objects

| Bump | When | Example |
|---|---|---|
| PATCH (1.0.0 → 1.0.1) | Citation correction, wording fix, metadata fix | Fixed citation date |
| MINOR (1.0.0 → 1.1.0) | New source, added subsection, strengthened coverage | Added Walker's interpretation |
| MAJOR (1.0.0 → 2.0.0) | Changed scope, reorganized thesis, materially revised interpretation | Restructured from chronological to thematic |

Each output pins its object versions so Hermes can report dependency drift:
```json
{
  "output_id": "essay:daimon-across-neoplatonism",
  "dependencies": [
    {"object_id": "ro:ficino-daimon", "version": "1.2.0"},
    {"object_id": "ro:proclus-daimon", "version": "0.8.0"}
  ]
}
```

---

## Engineering Pipeline Specification

### How This Maps to vision.md

The five visions in `visionary.md` map to specific pipeline stages and paper-derived mechanisms:

| Vision | Pipeline Stage | Key Paper Mechanism |
|---|---|---|
| 1: Learning Loop | Stage 5 (Lint+Test) → Stage 3 (Proposal) | **WiCER**: compile → evaluate → refine loop. After each compilation, run diagnostic probes, identify dropped facts, pin them, recompile. 1-2 iterations recover 80% of lost quality. |
| 2: Personal ROs | Stage 1 (Acquisition) + Stage 6 (Publish) with `visibility: private` | **Companion Knowledge**: mirror/compensate principle. Private layer links to public objects without altering canon. `user_note → references → object version`. |
| 3: Dreaming Mind | Weekly cron (cross-RO analysis) | **Retrieval as Reasoning**: browse-first traversal for open-ended queries. Error Book constraint accumulation across objects. **Materiality**: `ϕt(k,n)` scoring to detect which entities have drifted enough to warrant attention. |
| 4: Comparative Engine | Stage 2 (Impact) + Family 5 (Comparative ROs) | **ORKG FAIR Surveys**: comparison as persistent artifact with explicit dimensions. **Retrieval as Reasoning**: bridge queries (A→B→answer) via link traversal. |
| 5: Mature Ecosystem | All stages at scale | **Materiality**: regret-bound analysis (`O(√T log K)`) as evaluation metric instead of absolute QA scores. **DeepRefine**: GBD reward for measuring refinement quality. |

### The Paper-Derived Mechanisms That Enable Autonomous Operation

The five visions can't run autonomously without specific mechanisms from the papers. Here's what each paper contributes:

**From Retrieval as Reasoning (2605.25480):**
- **Three principles** that every pipeline stage must satisfy: Compilability (sources → structured ROs), Composability (atomic search/read/traverse operations), Evolvability (self-correction via Error Book)
- **wiki_search / wiki_read tools** — the exact tool interface for Stage 2 (Impact). `search_objects(query)` by page name, alias, tag, concept. `read_object(id, version)` for full content with embedded links.
- **Two traversal strategies** — search-first (entity-anchored queries, "what did Ficino think about the daimon?") vs browse-first (open-ended queries, "what's in this tradition?"). Routes the user's question to the right retrieval strategy.
- **Error Book with constraint accumulation** — errors are not just logged, they become reusable constraints that prevent recurrence. Each error entry: `{description, affected_objects, rule, status}`.

**From WiCER (2605.07068):**
- **The compilation gap** — blind compilation has 53-60% catastrophic failure rate. This is the core problem our lint+test stage solves.
- **Diagnostic probes** — targeted questions that check whether critical facts survived compilation. Each RO gets a small test suite. Ablation shows targeted diagnosis (+0.95) is 6x more effective than generic pinning (+0.16).
- **CEGAR-inspired loop** — compile → evaluate → diagnose → pin → recompile. 1-2 iterations recover 80% of lost quality.
- **Natural probe set** — in deployed systems, the real query stream acts as a free, continuously updated probe set. FAQ = tests.

**From Materiality Scoring (2606.09877):**
- **ϕt(k,n) scoring function** — materiality = relevance × novelty × source quality × contradiction strength × coverage gap. Scores document n for entity k at time t.
- **Proactive vs reactive pinning** — don't wait for a query to fail. Score incoming sources and proactively pin high-materiality facts before gaps are exposed.
- **Regret-bound evaluation** — `O(√T log K)` regret bound. Not absolute QA scores (which have LLM-as-judge confounds), but cumulative regret against an oracle. This is how we evaluate whether the pipeline is improving.
- **Four-step loop**: Mine → Score → Pin → Compile. Maps to our Stage 1→2→3→4.

**From DeepRefine (2605.10488):**
- **Three-step refinement reasoning**: Answerability Judgement (can the current RO answer the question?) → Error Abduction (where is the defect?) → Refinement Actions (what to change).
- **Four refinement action types**: EXPAND (new coverage), CORRECT (fix errors), REORGANIZE (restructure), DEPRECATE (remove stale material). Each maps to a proposal_type in our knowledge PRs.
- **GBD (Gain Beyond Draft) reward** — measures the gain in answer quality from refined vs. draft knowledge base. Used to evaluate whether a PR actually improved the RO.
- **Fine-grained operations**: `replace_node()`, `add_edge()`, `remove_edge()` operate at the level of single passages and citations, not whole pages.

**From Companion Knowledge Systems (2604.12034):**
- **Mirror vs compensate principle** — mirror the user on operational dimensions (what they read, how they organize), compensate on epistemic failure modes (entrenchment, drift, monoculture).
- **Three governance layers**: interaction/workflow (collect, annotate, organize, revisit), representation/retrieval (storage format, object types, retrieval index), retention/governance (decay, consolidation, audit).
- **Personal companion guardrails** — private notes link to public RO versions without altering canon. `user_note → references → object version`. Private experience never silently alters canonical scholarship.
- **Three correction timescales**: within-agent consolidation cycles (daily/weekly cron), cross-agent federation (comparing ROs across users), base-model evolution (LLM improvements).

### Overview

The system is an event-driven pipeline where sources flow through stages, each stage triggers the next, and Hermes runs the whole thing autonomously via cron + skills + git. The pipeline has six stages, each with a state machine, error recovery, and clear data contracts between stages.

### Pipeline Diagram

```
                                          ┌───────────────────┐
                                          │  User (Telegram)  │
                                          │  sends title/DOI  │
                                          └────────┬──────────┘
                                                   │
                                                   ▼
┌────────────────────────────────────────────────────────────────────────────┐
│  STAGE 1: ACQUISITION                                                      │
│  Trigger: user message / cron weekly sweep                                 │
│  Skill: /acquisition                                                        │
│  Output: content/works/work_{slug}.json  +  library/{corpus}/{slug}.pdf   │
│  Error: if 403 → user-assisted download prompt; if paywalled → stub record │
└──────────────────────────┬─────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────────────────────────┐
│  STAGE 2: IMPACT ANALYSIS                                                   │
│  Trigger: new work.json appears in content/works/                          │
│  Skill: /research-objects impact                                           │
│  Action: check work's concepts against all existing ROs                     │
│  Output: impact report: "ro:ficino-daimon: +12% coverage, 3 new paras"    │
│  Deliver: Telegram notification with [Accept] [Reject] [View Diff]         │
│  Error: no ROs affected → log and stop                                     │
└──────────────────────────┬─────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────────────────────────┐
│  STAGE 3: PROPOSAL                                                          │
│  Trigger: user accepts impact notification                                 │
│  Skill: /research-objects propose                                          │
│  Action: create git branch, generate diff of proposed changes              │
│  Output: git branch + proposal.json + Telegram PR notification             │
│  Deliver: "PR #41: ro:ficino-daimon — add Kiosoglou (3 paras, 2 cites)"   │
│  Error: merge conflict → notify user with details                          │
└──────────────────────────┬─────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────────────────────────┐
│  STAGE 4: MERGE                                                             │
│  Trigger: user approves PR                                                 │
│  Skill: /research-objects merge                                            │
│  Action: merge branch → bump version → update changelog → git push         │
│  Output: RO updated, version bumped, changelog appended                   │
│  Version bumps: PATCH (citation), MINOR (new source), MAJOR (reorg)       │
│  Error: merge conflict → abort → notify user                               │
└──────────────────────────┬─────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────────────────────────┐
│  STAGE 5: LINT + TEST                                                      │
│  Trigger: merge complete (post-commit hook or cron poll)                   │
│  Skill: /research-objects lint + /research-objects test                    │
│  Action: check citations, duplicates, broken links, coverage gaps          │
│  Action: run diagnostic questions against RO                              │
│  Output: lint report + test results                                        │
│  Deliver: Telegram if failures found                                       │
│  Error: lint failures → auto-create issues in RO's issues.json            │
└──────────────────────────┬─────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────────────────────────┐
│  STAGE 6: PUBLISH                                                          │
│  Trigger: lint + test pass / user publishes manually                       │
│  Skill: /publish-paper (for Type B) or /write-and-publish (for Type A)    │
│  Action: generate essay JSON, audio, deploy to Cloudflare                  │
│  Output: essay at /essay/{slug}, audio at /audio/{slug}.mp3               │
│  Version pin: output records which RO version it was built from           │
│  Error: build fail → log, notify user, don't deploy stale version         │
└────────────────────────────────────────────────────────────────────────────┘
```

### Research Object State Machine

Each RO moves through these states. Transitions are logged in the RO's `timeline[]`.

```
                    ┌──────────┐
                    │  IDEA    │  User says "create RO on X" or Hermes proposes one
                    └────┬─────┘
                         │
                         ▼
                    ┌──────────┐
                    │COLLECTING│  Hermes is gathering sources from the library
                    └────┬─────┘
                         │
                         ▼
                    ┌──────────┐
                    │  DRAFT   │  First compilation assembled, not yet reviewed
                    └────┬─────┘
                         │
                    ┌────┴────┐
                    │         │
                    ▼         ▼
              ┌────────┐ ┌────────┐
              │ REVIEW │ │EXPANDING│  User reviewing or Hermes adding more sources
              └────┬───┘ └────┬───┘
                   │          │
                   └────┬─────┘
                        │
                        ▼
                   ┌──────────┐
                   │PUBLISHED │  Deployed as essay + audio
                   └────┬─────┘
                        │
                   ┌────┴────┐
                   │         │
                   ▼         ▼
             ┌─────────┐ ┌─────────┐
             │ STALE   │ │IMPROVING│  Outdated vs. sources or actively being updated
             └─────────┘ └─────────┘
```

**State transition rules:**
- `IDEA → COLLECTING`: Hermes finds 1+ relevant source in the library
- `COLLECTING → DRAFT`: First passage extraction complete, RO JSON created
- `DRAFT → REVIEW`: RO has ≥3 sources and ≥1 section complete
- `REVIEW → EXPANDING`: User requests more coverage or Hermes detects gaps
- `REVIEW → PUBLISHED`: User approves, lint passes, tests pass
- `PUBLISHED → STALE`: New sources acquired that affect this RO but haven't been merged
- `STALE → IMPROVING`: User accepts impact notification, PR created
- `IMPROVING → REVIEW`: PR ready for review
- `PUBLISHED → IMPROVING`: Direct user request for update

### Version Pipeline

```
Source versioning:          RO versioning:           Output versioning:
                                                                                
content/works/              content/research-objects/  content/glossary/essays/
work_kiosoglou_v1.json      ro:ficino-daimon v1.0.0    ficino-daimon v1 (essay)
    │                               │                         │
    │  New source acquired          │                         │
    │                               │                         │
    ▼                               │                         │
work_kiosoglou_v2.json      ←──────┤                         │
(updated metadata)                  │                         │
                                    ▼                         │
                            ro:ficino-daimon v1.1.0           │
                            (added Kiosoglou passages)         │
                                    │                         │
                                    ▼                         │
                            ro:ficino-daimon v1.1.0           │
                                    │                         │
                                    └─────────────────────────┤
                                                              ▼
                                              ficino-daimon v2 (essay)
                                              (rebuilt from RO v1.1.0)
```

**Rules:**
1. Sources are immutable — never edit a work JSON after creation, only add new versions
2. RO version bumps are automatic on merge (script detects PATCH/MINOR/MAJOR from change type)
3. Outputs pin their RO dependency version — Hermes checks for drift on cron
4. When RO version bumps, all downstream outputs are flagged as potentially stale

### Autonomous Operation (Cron Orchestration)

These cron jobs run continuously. They are the autonomous nervous system of the pipeline.

```yaml
# ─── DAILY ─────────────────────────────────────────────────────

cron: "0 6 * * *"   # Daily 6am: Discovery sweep
skill: acquisition
prompt: |
  Search OpenAlex for new papers matching existing ROs' missing topics.
  For each RO with open research_todos, search for sources that would fill those gaps.
  Report: "Found 3 new papers that could fill gaps in ro:ficino-daimon"

cron: "0 7 * * *"   # Daily 7am: Impact check
skill: research-objects
prompt: |
  Check content/works/ for any works added in the last 24 hours.
  For each new work, check which ROs it affects.
  Generate impact estimates.
  Deliver pending notifications to Telegram inbox.

# ─── WEEKLY ────────────────────────────────────────────────────

cron: "0 9 * * 1"   # Monday 9am: Lint all ROs
skill: research-objects
prompt: |
  Lint every RO in content/research-objects/.
  Check: broken citations, duplicate passages, coverage gaps,
  stale sources (sources updated but RO not), orphan sources.
  Report: "Lint complete: 3 ROs have issues, 1 has stale sources"

cron: "0 10 * * 1"  # Monday 10am: Test all ROs
skill: research-objects
prompt: |
  Run diagnostic tests for every RO that has tests defined.
  Report failures with specific paragraphs and expected vs actual.

cron: "0 2 * * 0"   # Sunday 2am: Dreaming cycle
skill: research-objects
prompt: |
  Review ALL ROs for cross-domain patterns.
  Which ROs discuss the same concept from different traditions?
  Where are disagreements that could become Comparative ROs?
  Which new RO proposals emerge from the current corpus?
  Append to hermes/notes/dream-log.md.

# ─── MONTHLY ────────────────────────────────────────────────────

cron: "0 12 1 * *"  # 1st of month: Ecosystem digest
skill: research-objects
prompt: |
  Generate monthly digest:
  - New sources acquired: N
  - ROs updated: N
  - New ROs created: N
  - Average coverage change: +N%
  - Research todos completed: N
  - Skills written: N
  - Pending impact notifications: N
  Deliver to Telegram.
```

### Concrete Algorithms to Implement

These are the actual process pseudocode from the papers, adapted for our pipeline.

#### Index-Time Compilation Loop (from LLM-Wiki paper §3.1)

```
for each new work work_x in acquisition batch:
    S ← SelectPages(work_x, Index)                 # which existing ROs does this touch?
    U ← CompileROUpdates(work_x, S, Constraints)    # generate passage/section/link updates
    E_s ← StructuralValidate(U, ROs)                # dangling links, malformed refs, missing sources
    E_c ← ContentValidate(U, ROs, Sources)           # unsupported facts, contradictions via source grounding
    if E_s ∪ E_c ≠ ∅:
        B ← UpdateErrorBook(B, E)                   # log root cause → description, object, rule, status
        C ← ActiveConstraints(B)                     # pull open constraints into next prompt
        U ← CodeAutoFix(U, E_s)                     # deterministic patch for structural errors
    ROs ← ApplyUpdates(ROs, U)
every N batches: ROs ← LLMPeriodicFix(ROs, B); B ← VerifyAndClose(B, ROs)
```

**Key trick:** Constraints are injected as plain natural-language instructions into future compilation prompts — e.g. "NEVER conflate genius and daimon without explicit source evidence." No fine-tuning, no architecture change. Constraint accumulation compounds across ingestion batches. Cost them 3.4-4.0 F1 to remove (Error Book ablation).

**For Hermes, this maps to:**
- `SelectPages(work_x, Index)` = Stage 2 (Impact Analysis)
- `CompileROUpdates` = Stage 3 (Proposal)
- `StructuralValidate` = Stage 5 lint (broken citations, missing sources)
- `ContentValidate` = Stage 5 test (diagnostic questions)
- `UpdateErrorBook` = `content/research-objects/error-book.json`
- `CodeAutoFix` = deterministic lint patches
- `LLMPeriodicFix` = fortnightly cron for semantic repair

#### Query-Time Traversal Loop (from LLM-Wiki paper §3.2)

```
while not terminated:
    strategy ← SelectStrategy(query, context)       # direct / bridge / browse
    if strategy == direct:
        results ← wiki_read(entity_page)
    elif strategy == bridge:
        page ← wiki_read(current_entity)
        links ← extract_links(page)
        next_entity ← select_link(links, query)
        results ← wiki_read(next_entity)
    elif strategy == browse:
        index ← wiki_read(directory_index)
        results ← wiki_read(select_from_index(index, query))
    context ← update_context(context, results)
    if reasoning_chain_traced: stop
    if tool_calls >= T_max(15): stop
    if consecutive_empty_searches >= P(3): stop
```

**For Hermes, this maps to:**
- `wiki_search` = `search_objects(query)` — search RO index by name, alias, tag, concept
- `wiki_read` = `read_object(id, version)` — return RO body with embedded links to sources and related ROs
- Direct access = Family 1 (Thinker on Topic) — known entity, read directly
- Bridge traversal = Family 3 (Thinker on Thinker) — follow links from A to B
- Browse-first = Family 7 (Tradition) — read directory index, explore

#### Wiki Page Schema (adapt directly from LLM-Wiki)

```yaml
---
type: thinker_on_topic        # RO family
created: 2026-07-11
version: 1.2.0
aliases: [ficino-on-the-daimon, ficino-daimon]
tags: [ficino, daimon, neoplatonism, renaissance]
sources: [work:voss-becoming-angel, work:kiosoglou-ficino-soul]
coverage: {ontology: 0.8, astrology: 0.6, prayer: 0.0}
---
# Ficino on the Daimon
> One-line summary of what this RO covers.

## Section 1: Ontology
[source passages with inline citations]

## Section 2: Astrology
[source passages with inline citations]

## Related ROs
- [[ro:plotinus-daimon]] -- Plotinus's treatment, precursor
- [[ro:daimon-across-platonists]] -- broader survey

## Related Sources
- [[work:voss-becoming-angel]]
- [[work:kiosoglou-ficino-soul]]
```

#### Error Book Format (from LLM-Wiki paper + adaptation)

```json
{
  "errors": [
    {
      "id": "error:genius-daemon-collapse",
      "description": "Genius and daimon were treated as interchangeable across 3 paragraphs",
      "affected_objects": ["ro:ficino-daimon"],
      "root_cause": "LLM assumed synonymy from overlapping semantic fields",
      "rule": "NEVER conflate genius and daimon without explicit source evidence equating them",
      "rule_type": "semantic",
      "status": "active",
      "created": "2026-07-11",
      "verified_closed": null
    }
  ]
}
```

Constraints from active errors are injected into every compilation prompt. When verified closed, the rule remains in the Error Book as history but is no longer injected.

#### Deterministic vs LLM Repair Split (from LLM-Wiki findings)

| Error Type | % of Errors | Fix Method | Implementation |
|---|---|---|---|
| Dangling links | 29-64% | `CodeAutoFix` | grep for `[[page]]` where page doesn't exist → remove or flag |
| Missing index entries | Included above | `CodeAutoFix` | Rebuild index from directory listing |
| Unsupported facts | Remaining | `LLMPeriodicFix` | Fortnightly: scan RO, verify each claim against sources |
| Cross-page contradictions | Remaining | `LLMPeriodicFix` | Fortnightly: compare ROs that share sources, flag contradictions |

#### Termination Conditions (borrow directly from LLM-Wiki)

For any query-time traversal:
1. Reasoning chain fully traced → stop and answer
2. `T_max = 15` tool calls exhausted → stop and answer with what you have
3. `P = 3` consecutive empty searches → stop and admit gap

For Hermes's question router, these same conditions apply: if the router can't find relevant ROs after 3 searches, it should admit ignorance rather than fabricating.

### Error and Recovery Flows

| Failure | Detection | Recovery |
|---|---|---|
| Acquisition 403 (publisher blocks VPS) | curl returns 403 | Try alternative OpenAlex locations[] → if all fail → user-assisted download prompt on Telegram |
| Acquisition: paywalled (no OA exists) | Unpaywall + OpenAlex both return closed | Create stub record with `access_status: paywalled_or_request_only` |
| PDF has no text layer (scanned) | pdftotext returns only form-feeds | Skip. Add to RO's research_todos: "Find text-based version of {paper}" |
| Impact analysis: no ROs affected | All concept checks return empty | Log to acquisition record. No further action. |
| Merge conflict on PR | git merge fails | Abort merge. Notify user on Telegram with conflict details. Offer to resolve or discard. |
| Lint: broken citation | RO references a source that no longer exists | Auto-flag in RO's issues.json. Notify user. |
| Test: diagnostic fails | RO can't answer its own test questions | Flag in issues.json. Block publish until resolved. |
| Deploy fails | `npm run cf:deploy` returns non-zero | Log build output. Notify user. Do NOT deploy stale version. |
| Version drift: output older than RO | Cron detects dependency mismatch | Notify: "Essay ficino-daimon v1 uses RO v1.0.0, current RO is v1.2.0" |

### Data Contracts Between Stages

Each stage reads from and writes to known paths:

```
Stage 1 → writes:   content/works/work_{slug}.json
                    library/{corpus}/{slug}.pdf

Stage 2 → reads:    content/works/work_{slug}.json (just written)
                    content/research-objects/ro-*.json (all existing)
            writes: hermes/goals/research-inbox.json (impact notification)

Stage 3 → reads:    hermes/goals/research-inbox.json (accepted notification)
                    content/works/work_{slug}.json (source passages)
                    content/research-objects/ro-*.json (current RO state)
            writes: content/research-objects/ro-{slug}.json (updated)
                    git branch

Stage 4 → reads:    git branch (proposed changes)
            writes: content/research-objects/ro-{slug}.json (merged)
                    git log (version bump commit)

Stage 5 → reads:    content/research-objects/ro-*.json
            writes: ro-{slug}/issues.json (lint findings)
                    hermes/notes/lint-log.md

Stage 6 → reads:    content/research-objects/ro-{slug}.json
            writes: content/glossary/essays/{slug}.json
                    public/audio/{slug}.mp3
                    Cloudflare deploy
```

### Skill Chain Specification

The Hermes skills chain together in sequence:

```yaml
# /research-objects — the master orchestrator skill
# Sub-commands dispatch to specific pipeline stages:

research-objects create "Ficino on the Daimon"
  → router.py detects family 1 (thinker-topic)
  → Stage 1 (acquisition) if sources missing
  → Stage 2 (impact) on existing ROs
  → Stage 3 (proposal) to create new RO
  → Stage 4 (merge) to finalize
  → Stage 5 (lint+test) to verify
  → Stage 6 (publish) if requested

research-objects status ficino-daimon
  → Read RO JSON, show: version, sources, coverage, issues, pending PRs

research-objects expand ficino-daimon
  → Check research_todos, search OpenAlex, acquire, create PR

research-objects lint
  → Run Stage 5 on all ROs

research-objects publish ficino-daimon
  → Stage 6: output as essay + audio + deploy
```

### What to Build First (Revised)

Phase 1 should not be "build the RO format" — it should be **build the state machine**.

1. **State machine shell** — a Python script that manages RO states. `ro-state.py create ro:ficino-daimon`, `ro-state.py transition ro:ficino-daimon draft→review`, `ro-state.py log ro:ficino-daimon`
2. **One manual RO** at `content/research-objects/ro-ficino-daimon.json` with the state machine tracking its transitions
3. **Version bump script** — reads RO, determines PATCH/MINOR/MAJOR from changes, bumps semver, updates changelog
4. **Impact detection cron** — the simplest autonomous loop: "new work → check ROs → notify Telegram"
5. **Knowledge PR workflow** — git branch + Telegram approve/merge
6. **Lint + test shell** — standalone checks before we wire them into the pipeline
7. **Error Book** — JSON file at `content/research-objects/error-book.json`

---

## The One Rule

> Every paragraph in every RO is `kind: "source"`. Hermes never writes. It compiles, links, voices, deploys, and improves — but never creates original claims.

This rule makes the system honest, verifiable, improvable, composable, durable, and trustworthy. Everything else is downstream of it.
