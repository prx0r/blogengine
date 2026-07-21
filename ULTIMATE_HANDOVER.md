# Ultimate Handover — Re-Rendering Atlas

## Project Identity

A **research laboratory disguised as a media company**. The goal: systematically identify intellectually underserved topics (esoteric philosophy, consciousness studies, Tantra, Western esotericism) and produce documentaries about them. Everything is automated except human voiceover recording (~2 hrs/week — that is the bottleneck).

This is NOT a content farm. It is a **decision system** for allocating scarce human recording time across competing topic hypotheses under uncertainty.

---

## Quick Start for New Agents

Read these files in order:

| Order | File | Why |
|-------|------|-----|
| 1 | `ULTIMATE_HANDOVER.md` | This file — orientation |
| 2 | `HANDOVER.md` (303 lines) | Full project handover from previous session |
| 3 | `buildthreads.md` (151 lines) | 7 strategic directions, which are critical vs nice-to-have |
| 4 | `operations/agent-guide.md` | Unwritten rules, mistakes to avoid |
| 5 | `session-2026-07-21-reference.md` (386 lines) | Comprehensive log of last session's work |
| 6 | `pipelines/control-plane-design.md` | Current 3-system architecture |
| 7 | `farm-template/docs/01-SETUP.md` | Deployable farm worker — the thing that actually runs |
| 8 | `operations/research-schema.md` | How to run an experiment properly |
| 9 | `operations/vision-hermes-engine.md` | Master vision document (v3, 13 critical fixes applied) |
| 10 | `pipelines/hermes-operations-manual.md` | All 10 engines (E1-E10) with build phases |

---

## Resource Constraints

- **RAM**: 4 GB total
- **CPU**: 2 cores
- **Disk**: 75 GB main (20 GB free), 50 GB Hetzner volume (46 GB free, for Docker)
- **Keep operations resource-light**: no parallel builds, no heavy inference, no large dependency installs without checking. Prefer sequential lightweight operations.

---

## Three-System Architecture

```
YOU (record HOST lines, approve gates)
  │
HERMES (cognitive controller — Telegram gateway, systemd service, 325MB RAM)
  │
  ├── Farm Worker (Cloudflare) — cron research, gap maps, video treatments
  ├── Control Plane (Cloudflare) — production gates, approval inbox, signed commands
  └── TryPost (self-hosted Docker, AGPL) — cross-platform publish via MCP
```

**Key design decisions:**
- Hermes stays on VPS (persistent memory needed — Workers don't have it)
- Farm Workers answer narrow questions, Hermes orchestrates
- No n8n — farm-to-TryPost handoff is a single event-driven POST
- Per-farm scoped R2 tokens (read-only global + read-write own bucket)
- Never auto-publish historical/religious claims (permanent rule)

---

## Content Object System

### Entity Hierarchy

| Object | ID Format | Count | Status | Description |
|--------|-----------|-------|--------|-------------|
| **Work** | `work:{slug}` | 1,917 | Live | Acquired papers/sources. Tier 1 = primary, Tier 2 = commentary |
| **RO** (Research Object) | `ro:{slug}` | 173 | Live | Compiled knowledge on one question with full provenance. 1,268 passages |
| **Essay** | `{slug}.json` | 1,795 | Live | Published output (126 with audio) |
| **CO** (Comparison Object) | `co:{slug}` | 2 | Live | Cross-RO synthesis. `parents[]` references ROs. `kind: "synthesis"` |
| **PO** (Philosopher Object) | `po:{slug}` | 1 | Live | Philosopher profile. Links to ROs via `source_ro`. Only `po:abhinavagupta` |
| **HO** (Hypothesis Object) | — | 0 | Not built | Planned but not implemented |

### Pipeline Flow

```
Raw Source PDFs → Works (JSON) → ROs (compilation) → Essays → Audio → Video
                                                      ↕
                                                COs / POs (synthesis)
```

### RO Schema Structure
- `ro_id`, `schema_version`, `title`, `family` (thinker-topic, theme, tradition, etc.)
- `status` (stub/draft/published/idea/collecting/stale), `current_version` (semver)
- `sources[]` — manifest of works with tier, label, passages_used, status
- `body[]` — passages with `kind: "source"` only (author's own words), `source_id`, `page_ref`, `status`
- `coverage{}` — per-section tracking (substantial/partial/minimal/missing)
- `versions[]`, `dependencies[]`, `issues[]`, `outputs[]`, `timeline[]`

### Key Directories

| Directory | Path | Content |
|-----------|------|---------|
| Content data model | `content/schemas/complete-data-model.md` | Full entity hierarchy and relationships |
| RO schema | `hermes/docs/ro-schema-spec.md` | RO field specs |
| Factory index | `content/_factory-index.json` | Inventory manifest (counts, paths, pipeline ratios) |
| Pipeline queue | `content/_pipeline-queue.json` | Tiered priorities, pipeline actions, gaps |
| Content library | `content/research-objects/` | 173 ROs |
| Works | `content/works/` | 1,917 work JSONs |
| Essays | `content/glossary/essays/` | 1,795 essays |
| Sources | `content/glossary/sources/` | 2,035 source records |
| Art | `content/glossary/art/` | 30+ art metadata records |

---

## Research Pipeline — 41 Experiments

### Status Overview

| Status | Count |
|--------|-------|
| Completed | 7 |
| In Progress | 1 (daily search collection, cron at 00:05 UTC, 14-day cycle) |
| Not Started | ~33 |

### Key Findings (What We Know)

| Finding | Result | File |
|---------|--------|------|
| YouNiverse A1-A3: breakout metric | 44% label difference at n=500 (PASS) — **differentiated, not validated** | `data/research/youniverse/research-report-a1-a3.md` |
| YouTube gap score | 16/30 queries >= 0.30 — pattern confirmed | `data/reports/underserved-claim-test-2026-07-21.json` |
| Wikipedia | r=0.027 — zero signal, SKIPPED permanently | `data/research/layer2/wikipedia-validation.json` |
| Upworthy title analysis | 52.54% holdout (FAIL at 0.55 gate) — strong priors | `data/research/upworthy/README.md` |
| Reddit Proposal 2 (questions) | 101 clusters from 37,108 submissions | `data/research/reddit/proposal2-results-...json` |
| Reddit Proposal 7 (language drift) | 0 transitions across 9 subreddits | `data/research/reddit/` |

### Upworthy Title Priors (Use These)

| Feature | Lift | Rule |
|---------|------|------|
| "Actually" | +29.4% | USE |
| "Never" | +15.7% | USE |
| Imperative verb opening | +16.4% | USE |
| "This" | +10.9% | USE |
| Numbers | +8.1% | USE |
| Questions | -22.6% | AVOID |
| "Why" opening | -18.2% | AVOID |
| Exclamation marks | -22.0% | AVOID |
| Colons | -15.3% | AVOID |
| "Your" | -11.1% | AVOID |

### 8 Formal Proposals (P1-P8)

All in `pipelines/proposals/`:

| # | Name | Dataset | Status | Priority |
|---|------|---------|--------|----------|
| P1 | YouNiverse Breakout v2 | YouNiverse (3.2 GB) | Needs redo | HIGH |
| P2 | Global Trending Diffusion | Global Trending (26.4 GB) | Not started | MED |
| P3 | YTCommentVerse Intent | YTCommentVerse (10.1 GB) | Not started | LOW |
| P4 | Wikipedia Velocity | Wikipedia API | DONE (r=0.027) | HIGH |
| P5 | Stack Exchange Mining | Stack Exchange (337 MB) | Not started | — |
| P6 | Sanskrit Retrieval | SARIT/Muktabodha/GRETIL | Not started | — |
| P7 | Met Museum Visual | Met Museum (303 MB) | Not started | — |
| P8 | Decision Ledger | Pipeline outcomes | Not built | — |

---

## 10 Engines (E1-E10)

From `pipelines/hermes-operations-manual.md`:

| Engine | Dataset | Status | Validation Level |
|--------|---------|--------|-----------------|
| E1: Headline | Upworthy | ✅ Built: `scripts/engines/headline_score.py` | Soft priors only — 52.5% ceiling |
| E2: Gap | YouTube API | Pattern confirmed (16/30) | Topic-level reliable, channel-level noisy |
| E3: Question | Reddit | BROKEN — cluster collapsed, needs rebuild | — |
| E4: Controversy | Reddit comments | Blocked — no comments data | — |
| E5: Gateway | Clickstream | Not started | — |
| E6: Trend | Google Trends | Partial | — |
| E7: Breakout | YouNiverse | A1-A3 done, needs Tier 1 redo | Differentiated, not validated |
| E8: Visual | Met Museum | Not started | — |
| E9: Source | Sanskrit corpora | Loaded | — |
| E10: Decision Ledger | Pipeline outcomes | Not built | — |

See `refinement.md` for live validation probe protocol.

---

## R2 Datasets Available

Bucket: `research-datasets` (S3-compatible)

| Dataset | Size | Contents |
|---------|------|----------|
| `reddit/` | 81.4 GiB | Submissions (282 batches, 30 subreddits, 2005-2023) + Comments (large batches, ~80 GB) + samples + processed |
| `global-trending/` | 26.4 GiB | YouTube trending per country (104 countries, 2022-2025) |
| `ytcommentverse/` | 10.1 GiB | 32M multilingual YouTube comments in SQLite |
| `blueprint/` | 7.9 GiB | Upworthy, Clickstream, Met Museum, SARIT, StackExchange, Muktabodha, GRETIL, translation datasets |
| `youniverse/` | 3.2 GiB | 136K channels, 72M videos (2005-2019) |
| `youtube-hindi-subtitles/` | 3.0 GiB | ASR transcripts from 50+ Hindi YouTube channels |
| `sanskrit-text-corpus/` | 630 MiB | Large Sanskrit text corpus (~500 files) |
| `sanskrit-gretil/` | 381 MiB | GRETIL Sanskrit dataset (HF format) |
| `youtube-trending-kaggle/` | 514 MiB | Kaggle trending dataset (CA, DE, FR, GB, IN, JP, KR, MX, RU, US) |
| `google-trends/` | 24 MiB | Google Trends data |
| `hindi-transcripts/` | 2.2 GiB | Hindi YouTube transcripts |

**Other R2 buckets:** `atlas-sources` (audio files for essays), `bookstore-assets`, `molts-prod-videos`, `moltslive-*` (various MOLTS Live assets), `personal-intelligence-data`, `sauron1`, `chaincraft-*`, `egoic-media`

---

## Reddit Intelligence System

Designed in `pipelines/reddit-intelligence/`. Docs:

| File | Content |
|------|---------|
| `README.md` | Pipeline overview, 30 subreddits, extraction procedure |
| `reddit-engine-design.md` | Farm-agnostic intelligence layer (808 lines) |
| `reddit-signal-taxonomy.md` | 4 signal layers |
| `reddit-research-proposals.md` | 7 Reddit proposals |
| `signal-quick-ref.md` | Signal to content decision lookup |

**Extraction completed** — 81.4 GB in R2:
- 30 subreddits across specialist/practitioner/mass/narrative layers
- Pushshift archive (2005 - April 2023)
- Submissions: 282 Parquet batches
- Comments: large batch files (need schema inspection)

**Next steps:** Analyze comments, build query endpoints, run remaining 5 proposals.

---

## Currently Running Processes

| Process | Schedule | Status |
|---------|----------|--------|
| Daily search collection | 00:05 UTC cron | Running (48 calls/day, ~11 days remaining) |
| Hermes gateway | systemd service | Running (v0.18.2, Telegram, 325MB RAM) |
| FableCut MCP server | systemd service | Running |
| Market scan (75 channels) | Daily | Running |

---

## Critical Path to First Published Video

1. **Write YouTube API client** (`lib/youtube.ts`) — biggest blocker
2. **Deploy farm-template Worker** with real API client
3. **Run daily research** → first topic selection
4. **Produce first video** (storyboard → voiceover → FableCut → export)
5. **After video 5:** Build decision ledger (prevents feedback loops)
6. **After video 10:** Validate gap score as predictor

---

## Rules for Agents

### DO
- Read `operations/agent-guide.md` first — it documents mistakes we've already made
- Put credentials in session env vars, NEVER in files
- Every claim needs a falsification condition
- Document null results — they're as valuable as positive ones
- When stuck, run an experiment (faster than architecture debates)
- Prefer finding over building; one clear finding > ten architecture documents
- Read the session reference (`session-2026-07-21-reference.md`) for context

### DON'T
- Don't write credentials to files (API keys, tokens, secrets)
- Don't commit credentials to git
- Don't assume ROs are "skeletons" — 152/159 have real text (check first)
- Don't assume the data is better than it is — YouNiverse is 2019 data
- Don't use weighted-sum formulas with clamp (manufactures evidence from zeros)
- Don't conflate evidence types (Upworthy ≠ historical claim support)
- Don't build before understanding (we have 50+ spec files but only ~7 validated claims)

### Key File Locations

| What | Where |
|------|-------|
| Hermes context | `hermes/AGENTS.md` |
| Hermes personality | `hermes/SOUL.md` |
| RO schema | `hermes/docs/ro-schema-spec.md` |
| Complete data model | `content/schemas/complete-data-model.md` |
| Factory index | `content/_factory-index.json` |
| Pipeline queue | `content/_pipeline-queue.json` |
| Factory pipeline SKILL | `hermes/skills/core/factory-pipeline/SKILL.md` |
| Video pipeline SKILL | `hermes/skills/video/publish-video-fablecut/SKILL.md` |
| Vision document | `operations/vision-hermes-engine.md` |
| Research inventory | `operations/research-inventory.md` |
| Research protocol | `operations/research-schema.md` |
| Experiment workflow | `operations/research-workflow.md` |
| Hermes operations manual | `pipelines/hermes-operations-manual.md` |
| Blueprint datasets | `operations/blueprint-datasets-download.md` |
| Reddit extraction | `operations/reddit-extraction-guide.md` |
| API references | `docs/api-ref/` (YouTube), `docs/cloudflare-ref/` |
| Farm template | `farm-template/` (Worker, schema, scripts, docs) |
| Videos pipeline | `videos.md`, `fablevid.md`, `storyboardnotes.md` |
| Session reference | `session-2026-07-21-reference.md` |
| This file | `ULTIMATE_HANDOVER.md` |

---

## Open Threads (Unresolved Questions)

| Question | When It Resolves | What's at Stake |
|----------|-----------------|-----------------|
| Does gap score predict video performance? | After 10+ published videos | The entire opportunity formula |
| Does co-host format retain viewers? | After first published video | Recording format |
| Is one voiceover session/week realistic? | After first month of production | Scaling model |
| Should research packs become full ROs? | Around video 10-15 | Knowledge management |
| Is the 8-beat format flexible enough? | After audience retention data | Content structure |
| Does daily vs weekly gap computation matter? | ~11 days remaining on collection | Research cadence |

---

*This document is a living reference. Add to it throughout the session as new context emerges.*
