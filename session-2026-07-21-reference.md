# Session Reference: 2026-07-21

Comprehensive log of work, discoveries, decisions, and file changes. Use this to orient any agent continuing this session.

---

## Entry Point

Started in `/root/projects/CX-Train`, switched to `/root/projects/blog` per user request.

---

## Key Documents Read

### Entry Level (HANDOVER.md recommendations)

| File | Key Content |
|------|------------|
| `HANDOVER.md` | Master handover: 50+ spec files, 41 experiments (7 done, 33 not started), architecture diagram, open threads, decision table |
| `buildthreads.md` | 7 threads (A-G), recommendation: Thread B (Upworthy title analysis) today, Thread A (deploy farm) this week |
| `agent-guide.md` | Core principle: "If choosing between building and finding, choose finding." Mistakes to avoid, unwritten rules, what success looks like |
| `pipelines/control-plane-design.md` | 3-system architecture, 5 D1 tables, signed commands, gate resolution |
| `pipelines/dashboard-stream.md` | Operator cockpit design, 5 integrations, per-farm Hermes identity |
| `pipelines/research-stream.md` | Evidence layer, tier system, current experiment state, R2 datasets |
| `pipelines/farm-implementation-plan.md` | Full pipeline spec, 8-stage production, 3-layer assumptions, opportunity formula |
| `pipelines/the-loom.md` | Visionary architecture: discovery engine → farm foundry → genome → evolution |
| `pipelines/r2-dataset-reference.md` | All R2 datasets with schema, access methods, limitations |
| `farm-template/docs/01-SETUP.md` | Step-by-step farm deployment guide |
| `farm-template/docs/02-RESEARCH.md` | Daily/weekly/monthly research cadence |
| `farm-template/docs/03-PRODUCTION.md` | 12-stage production pipeline, co-host format |
| `operations/research-schema.md` | Machine-enforceable experiment protocol, YAML manifests |
| `operations/research-inventory.md` | 41 experiments: 7 done, 1 running, 33 not started |
| `operations/research-workflow.md` | Standardized experiment pattern (pilot → scale → document → decide) |
| `data/research/youniverse/research-report-a1-a3.md` | 44% label difference — differentiated, not validated |
| `data/research/youniverse/README.md` | Layer 1 drill-down methodology, convergence checks |
| `data/research/layer2/README.md` | Layer 2: gap confirmed, Wikipedia skipped (r=0.027) |
| `reviews/farm-critique-analysis.md` | Peer review of architecture, 13 action items |

### Upworthy-Specific

| File | Key Content |
|------|------------|
| `operations/blueprint-datasets-download.md` | Download instructions for Upworthy, Clickstream, Met Museum, etc. |
| `scripts/upworthy-title-analysis.py` | Experiment script (feature extraction, pairwise model, logistic regression) |
| `data/research/upworthy/README.md` | Full experiment documentation with drill-down |
| `data/research/upworthy/upworthy-title-analysis-*.json` | Per-feature win rates |
| `data/research/upworthy/upworthy-logistic-*.json` | Logistic regression results |
| `reviews/upworthy-title-analysis-review.md` | Peer review: 5 critical gaps identified |

### Reddit Intelligence

| File | Key Content |
|------|------------|
| `pipelines/reddit-intelligence/README.md` | Pipeline objective, 30 subreddits, 4 signal layers, object model |
| `pipelines/reddit-intelligence/reddit-signal-taxonomy.md` | 4 signal layers: submission, comment, cross-subreddit, temporal |
| `pipelines/reddit-intelligence/signal-quick-ref.md` | Signal → content decision lookup table |
| `operations/reddit-extraction-guide.md` | Extraction code, subreddit panel with roles, 10 interpretation rules |
| `pipelines/reddit-intelligence/reddit-engine-design.md` | *Created this session* — farm-agnostic audience intelligence system |

### Core Architecture

| File | Key Content |
|------|------------|
| `farm-template/src/index.ts` | Worker with cron + Workflow, all helpers are stubs |
| `operations/agent-guide.md` | Unwritten rules, mistakes, how to actually work here |
| `docs/cloudflare-ref/` | Cloudflare docs: Vectorize (10M vectors, 1536 dims), Workers AI (curated catalogue, no arbitrary ONNX), D1 (10 GB), R2 (unlimited, DuckDB queryable), R2 SQL + Data Catalog for Iceberg |
| `docs/api-ref/` | YouTube API references: search.list, videos.list, quota calculator |

### Config Files

| File | Key Content |
|------|------------|
| `wrangler.jsonc` | D1 (`atlas-db`), R2 (`atlas-sources`), Vectorize (`atlas-global`), service binding |
| `.env.local` | YouTube API key, opencode/DeepSeek API key, Cloudflare token |
| `reviews/farm-critique-analysis.md` | Peer review: 13 action items from architecture critique |

---

## Experiments Run

### Upworthy Title Analysis (v1)

**Date:** 2026-07-21
**Script:** `scripts/upworthy-title-analysis.py`
**Data source:** Upworthy Research Archive confirmatory dataset (105K rows, 5,385 valid tests)
**Models attempted:**
1. Per-feature pairwise win rates (simple voting classifier)
2. Logistic regression on feature difference vectors

**Key results:**
- Simple model: 50.76% holdout accuracy (baseline 50%)
- Logistic regression: 52.54% holdout accuracy (baseline 50%) — FAIL at 0.55 gate
- Strongest positive signals: "Never" (+0.49), "Actually" (+0.48), imperative openings (+0.29)
- Strongest negative signals: "Why" questions (-0.37), question marks (-0.27), exclamation marks (-0.26)

**Files created:**
- `scripts/upworthy-title-analysis.py`
- `data/research/upworthy/README.md`
- `data/research/upworthy/upworthy-title-analysis-20260721_123332.json`
- `data/research/upworthy/upworthy-logistic-20260721_123502.json`

**Files modified:**
- `data/research/upworthy/*.json` (interpretation added after review)

### Git Commits

```
b736ab51 Add Upworthy title analysis: per-feature win rates + logistic regression
c370a7f1 Add peer review of Upworthy title analysis
a096b79f Add vision document: Hermes Engine v1 (973 lines)
fa529c48 Major revision v2: incorporate peer review feedback
06c098a4 Major revision v3: incorporate comprehensive external review
```

---

## Vision Document Evolution

### v1 (a096b79f)

Initial vision document. 973 lines, 8 sections.

**Structure:**
- A: Hermes 8-stage end-to-end flow
- B: 9 ML models (one per dataset)
- C: Cloudflare-native ML strategy
- D: Bayesian belief engine
- E: GCP credit strategy
- F: Integration with control plane
- G: Implementation roadmap (6 phases)
- H: Open questions

**Problems identified by user:**
- One-model-per-dataset creates 9 incomparable scores
- Beta-Binomial and logistic regression conflated as one model
- GCP budget too infrastructure-heavy
- Title testing doesn't account for YouTube's actual experiment design

### v2 (fa529c48)

Responding to user feedback. Major structural changes.

**Changes:**
- Section B: one-model-per-dataset → latent variable architecture (D, S, M, T, V, F) with shared evidence object
- Section D: separated Beta-Binomial (descriptive) from Bayesian LR (predictive)
- Added evidence_quality field for experiments
- Reallocated GCP budget toward experiments
- New Section F: evidence contracts with unified response schema
- Reordered phases: evidence substrate first, models deferred until label validation
- Added EXPLORE/EXPLOIT/FOUNDATION modes

**Problems identified by external review:**
- Old Stage 3 weighted-sum formula survived the conceptual revision
- D/S/M/T/V/F are evidence dimensions, not latent variables (no measurement model)
- Beta-Binomial invalid on pair data (duplicated pairs inflate n)
- evidence_quality scalar doesn't remove confounding
- YouTube Test & Compare models wrong object (package, not title) and wrong reward (watch time, not CTR)
- System will train on data it caused — no decision ledger
- Workers AI is curated models, not arbitrary ONNX
- Security not treated as P0
- Research pack needs claim graph

### v3 (06c098a4)

Comprehensive response to external review. 13 critical fixes.

**Changes:**
1. Removed old weighted-sum formula entirely
2. Latent variables → opportunity evidence dimensions
3. Four immutable ledgers (evidence, claim/evidence, decision, outcome)
4. Title model: experiment-level cluster bootstrap, not pair-row Beta-Binomial
5. evidence_quality scalar → experimental design fields
6. YouTube: package-level (title+thumbnail), watch time outcome, manual ingestion first
7. Decision ledger with propensities for off-policy evaluation
8. Security boundaries section (read-only by default, scoped creds, egress allowlists)
9. Claim graph (SOURCE→supports→CLAIM, SOURCE→contradicts→CLAIM, CLAIM→qualifies→CLAIM)
10. Evidence contract v2 (24 fields, interval_type disambiguation)
11. Workers AI: curated catalogue, not arbitrary ONNX — use VPS sidecar instead
12. Five evidence types (factual/interpretive/audience/packaging/production) never conflated
13. Roadmap: Phase 0 = experimental protocol, Phase 1 = ledgers+security, then stats, then retrieval, THEN validate, THEN models

**Final structure:**
- A: End-to-end flow (8 stages)
- B: Opportunity evidence dimensions (D, S, M, T, V, F as rubrics, not latent variables)
- C: Evidence contracts (v2 with 24 fields)
- D: Four ledgers (evidence, claim/evidence, decision, outcome)
- E: Title engine (Model A: descriptive bootstrap, Model B: hierarchical logistic/Bradley-Terry)
- F: YouTube package experiments (watch time, not CTR; manual ingestion)
- G: Research pack + claim graph
- H: Security boundaries
- I: Cloudflare-native strategy
- J: GCP credit strategy
- K: Implementation roadmap (8 phases)
- L: Open questions

---

## Key Decisions Made

| Decision | Rationale | Reference |
|----------|-----------|-----------|
| Keep Hermes on VPS as persistent cognitive controller | Workers don't have persistent memory; Hermes assembles evidence from multiple sources | Vision doc §intro |
| Workers answer narrow questions; don't host complex logic | Hermes is the controller; Workers are stateless executors | Vision doc §A |
| No weighted-sum opportunity formula | Clamp manufactures evidence; weights are guessed, not estimated | Vision doc §B |
| Four immutable ledgers before any model training | Prevents feedback loop where system trains on data it caused | Vision doc §D |
| Title model uses experiment-level likelihood, not pair rows | Current pair construction duplicates observations (every winner vs every loser) | Vision doc §E |
| YouTube experiments model packages (title+thumbnail), not bare titles | That's what YouTube actually tests | Vision doc §F |
| Manual Test & Compare ingestion first | No confirmed API for variant-level results | Vision doc §F3 |
| Workers AI is not arbitrary ONNX hosting | Docs confirm curated model catalogue only | Vision doc §I2 |
| VPS/Cloud Run inference for custom models | Workers AI can't host custom ONNX; Worker JS for tiny tabular models | Vision doc §I2 |
| Phase 0: experimental protocol for first 10 videos | Before building anything, define how we'll measure | Vision doc §K |
| Phase 1: ledgers + security | P0 — prevents irrecoverable mistakes | Vision doc §K |
| Security: read-only by default, scoped creds, egress allowlists | P0 issue, not operational polish | Vision doc §H |
| Upworthy is packaging evidence only, not factual | Conflating evidence types is dangerous | Vision doc §G4 |
| Reddit dataset: 3-tier (Vectorize + D1 + R2 + volume) | 85 GB full dataset on volume for future farms; filtered 15 GB in R2 for fast queries | Reddit design doc |
| Channel count as uncertainty signal, not hard gate | Novel topic may have zero channels; that's the point | Vision doc §B |

---

## Data Files Created

| File | Size | Content |
|------|------|---------|
| `scripts/upworthy-title-analysis.py` | 416 lines | Experiment script with feature extraction, pairwise model, logistic regression |
| `data/research/upworthy/README.md` | 163 lines | Experiment documentation with drill-down and decisions |
| `data/research/upworthy/upworthy-title-analysis-20260721_123332.json` | 6 KB | Per-feature win rates, simple voting model |
| `data/research/upworthy/upworthy-logistic-20260721_123502.json` | 4 KB | Logistic regression results, coefficients, CIs |
| `reviews/upworthy-title-analysis-review.md` | 179 lines | Peer review: 5 critical gaps, 10 recommendations |
| `operations/vision-hermes-engine.md` | ~900 lines | Final vision document (v3, 13 critical fixes applied) |
| `pipelines/reddit-intelligence/reddit-engine-design.md` | 250 lines | Farm-agnostic Reddit audience intelligence system |
| `session-2026-07-21-reference.md` | This file | Comprehensive session log |

---

## Infrastructure State

| Resource | Status | Notes |
|----------|--------|-------|
| R2 credentials | Available, from user | Stored as session env vars only |
| Upworthy data (R2) | Analyzed | Confirmatory dataset used, holdout not yet |
| YouNiverse data (R2) | Partial analysis | A1-A3 done, 7 more questions untouched |
| YTCommentVerse (R2) | Not started | Needs pipeline script |
| Global Trending (R2) | Not started | Needs tarball extraction |
| Reddit extraction | In progress | Being downloaded by user |
| Farm template Worker | Untested | All helpers stubs, YouTube API client missing |
| Control plane | Designed only | 5 D1 tables spec'd, no Worker code |
| Daily search collection | Running | Cron at 00:05 UTC, 12 days remaining |
| git remote | `origin main` | Pushed to `prx0r/blogengine` on GitHub |

---

## Open Threads

| Thread | Status | Who Should Pick Up |
|--------|--------|-------------------|
| Reddit dataset extraction | In progress (user) | Awaiting completion |
| Upworthy holdout replication | Not started | Next session: run same pipeline on holdout dataset |
| Experiment-level title bootstrap | Not started | Fix the pair-construction issue in `upworthy-title-analysis.py` |
| Four ledgers D1 schema | Not started | Create tables: evidence_ledger, claims, claim_evidence, decision_ledger, outcome_ledger |
| Security credential setup | Not started | Scoped R2 tokens, egress allowlists, Worker secrets per farm |
| First video experimental protocol | Not started | Define measurement format for first 10 videos |
| Reddit query endpoints | Not started | Build Worker endpoints after extraction completes |
| YouNiverse breakout redo (Tier 1) | Not started | Use time series as external outcome |
| Farm template YouTube API client | Not started | Write `lib/youtube.ts` — the biggest blocker to deployment |
| Daily search collection results | ~12 days remaining | Compute week-over-week Spearman r when done |

---

## Context I Wish I Had At The Start

I spent most of this session misunderstanding the actual system. Here's what I got wrong and what's actually true.

### What I Got Wrong

| I Thought | Actually True |
|-----------|---------------|
| 173 ROs are "structural skeletons with placeholder passages" | 152/159 ROs have real extracted text (verse references, page numbers). Only 8 have brackets. 1,268 total passages. |
| 0 essays have audio | 126 of 1,797 essays have audio. It works. |
| The essays are "our content" | Most are existing scholarly works (Ficino, Iamblichus, Corbin) formatted as JSON. Hermes compiles and catalogues; it does not write original claims. |
| The system is mostly spec | Hermes gateway runs live as a systemd service. 20+ skills are loaded as Telegram slash commands. Acquisition pipeline works. Publishing pipeline (Type B) works. |
| The bottleneck is everything is broken | The bottleneck is RO→essay linkage (never built), audio batch (126/1797 done), and video production (0 published). The extraction and compilation work is largely done. |
| Vision doc is a forward plan for a system we don't have | The vision doc is one layer of a much larger existing system. Hermes already does research compilation. The vision doc extends it into YouTube content production. |

### What Actually Exists

**Live system:**
- Hermes v0.18.2 agent (systemd service, Telegram gateway, 325MB RAM)
- 20+ skills loaded as slash commands (acquisition, publishing, video, astrology, research)
- FableCut MCP server running
- Cloudflare Workers site deployed at `re-rendering-atlas.tradesprior.workers.dev`
- Astrology engine (deterministic, D1-backed)
- Market scan skill monitoring 75 YouTube channels

**Content library:**
- 1,917 works (catalogued sources)
- 180 ROs with 1,268 real body passages, 326 source references
- 9 RO families represented
- 1,797 essays (JSON), 126 with audio
- 56 video plans, 12 with thumbnails, 1 with storyboard+voiceover, 0 published
- ~2,000 source texts, 30+ art objects, 76 concepts

**Pipeline (source → Work → RO → Essay → Audio → Video):**
- Acquisition: working (DOI resolution, OA download, Work JSON creation)
- RO construction: done for 180 topics (real passages extracted)
- RO→Essay linkage: **never built** — essays are from a pre-RO blueprints pipeline
- Audio generation: script exists, 126/1797 done
- Video pipeline: 1 storyboard, 0 published

**Unbuilt new objects:**
- CO (Comparison Object): synthesises across 2+ parent ROs. 2 exist in draft.
- PO (Philosopher Object): deep profile of a thinker. 1 exists (Abhinavagupta).
- HO (Hypothesis Object): links signal detection → content production. 0 exist.

### Where To Look

| If you want... | Read |
|----------------|------|
| Hermes project context | `hermes/AGENTS.md` |
| Hermes personality/constraints | `hermes/SOUL.md` |
| Full pipeline spec | `hermes/notes/hermesspec1.md` |
| RO schema | `hermes/docs/ro-schema-spec.md` |
| Content data model | `content/schemas/complete-data-model.md` |
| Factory pipeline skill | `hermes/skills/core/factory-pipeline/SKILL.md` |
| Video pipeline skill | `hermes/skills/video/publish-video-fablecut/SKILL.md` |
| Factory state | `content/_factory-index.json` |
| Pipeline queue | `content/_pipeline-queue.json` |
| Vision architecture | `operations/vision-hermes-engine.md` |
| Reddit intelligence | `pipelines/reddit-intelligence/` (3 files) |
| Upworthy title analysis | `data/research/upworthy/` |
| Research inventory | `operations/research-inventory.md` |
| Agent unwritten rules | `operations/agent-guide.md` |

## Key Principles Established This Session

1. **Find over build** — one clear finding > ten architecture documents
2. **Null results are valuable** — Wikipedia r=0.027 saved real work
3. **When stuck, run an experiment** — don't design a system to determine X, test X directly
4. **Verify claims from agents before repeating them** — I was wrong about ROs being skeletons because I didn't check myself
5. **Separate topic value from packaging potential** — a title model doesn't change audience demand
6. **Security is P0** — read-only by default, scoped credentials, immutable logs
7. **Four ledgers before models** — prevent feedback loop, maintain organism memory
8. **Evidence types are not interchangeable** — Upworthy ≠ historical claim support
9. **Clamp is lies** — missing evidence is not weak positive evidence
10. **The experiment is the unit** — pair rows are not independent observations
11. **Domain transfer is never free** — Upworthy priors are starting guesses, not rules
12. **Reddit is a map, not a truth engine** — community-endorsed ≠ factually correct

---

## File Index by Category

### Research
- `data/research/upworthy/` — Upworthy title analysis
- `data/research/youniverse/` — Layer 1 breakout metric
- `data/research/layer2/` — Layer 2 data source validation
- `data/reports/underserved-claim-test-2026-07-21.json` — Gap score validation

### Operations
- `operations/vision-hermes-engine.md` — Master vision document (v3)
- `operations/research-schema.md` — Experiment protocol
- `operations/research-inventory.md` — All 41 experiments
- `operations/research-workflow.md` — Standardized experiment pattern
- `operations/reddit-extraction-guide.md` — Reddit extraction code
- `operations/blueprint-datasets-download.md` — Download instructions

### Pipelines
- `pipelines/control-plane-design.md` — 3-system architecture
- `pipelines/dashboard-stream.md` — Operator cockpit
- `pipelines/farm-implementation-plan.md` — Full pipeline spec
- `pipelines/the-loom.md` — Visionary architecture
- `pipelines/r2-dataset-reference.md` — Dataset docs
- `pipelines/research-stream.md` — Evidence layer
- `pipelines/reddit-intelligence/README.md` — Reddit pipeline
- `pipelines/reddit-intelligence/reddit-signal-taxonomy.md` — 4 signal layers
- `pipelines/reddit-intelligence/signal-quick-ref.md` — Signal lookup table
- `pipelines/reddit-intelligence/reddit-engine-design.md` — Farm-agnostic Reddit engine

### Reviews
- `reviews/farm-critique-analysis.md` — Architecture peer review
- `reviews/upworthy-title-analysis-review.md` — Title analysis peer review

### Core
- `HANDOVER.md` — Project handover
- `buildthreads.md` — 7 strategic threads
- `agent-guide.md` — Unwritten rules
- `session-2026-07-21-reference.md` — This file
