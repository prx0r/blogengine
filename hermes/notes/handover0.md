# Handover 0 — Research Arm & Hermes Telegram Integration

## Context

This handover documents the session of July 11, 2026, where we shifted focus from the deterministic astrology engine to building the **research arm** — an academic paper acquisition pipeline — and integrated Hermes Agent with Telegram for the essay pipeline.

## What Was Done

### 1. Hermes Telegram Gateway (Live)

Telegram is connected and running as a systemd service:

| Detail | Value |
|---|---|
| Hermes version | v0.18.2 |
| Provider | opencode-go / deepseek-v4-flash |
| Telegram bot | Live (token in `~/.hermes/.env`) |
| User ID | 8799078300 |
| Gateway | `hermes-gateway.service` (systemd user service) |
| Status check | `hermes gateway status` |
| Logs | `journalctl --user -u hermes-gateway -f` |
| Skills | Available as slash commands in Telegram DM |

The gateway survived logout (linger enabled). Skills installed from the project's `hermes/skills/` directory are available as Telegram slash commands. The project `hermes/` directory is registered as an external skills directory in Hermes config.

### 2. `researcharm.md` — Full Research Pipeline Spec

Created at `/root/projects/blog/researcharm.md` (672 lines). Contains:

**Verified API Capabilities (tested with live API calls):**

| Source | Full Text? | How | Auth |
|---|---|---|---|
| OpenAlex | 🔗 OA location URLs | `best_oa_location.pdf_url` + `locations[].pdf_url` | Free tier ($1/day with key) |
| HAL | ✅ Direct PDF | `fileMain_s` field | None |
| Zenodo | ✅ Direct download | `files[].links.self` | None |
| Internet Archive | ✅ Full text | `_djvu.txt` + PDF | None (check rights) |
| Unpaywall | 🔗 DOI→OA URLs | `oa_locations[].url_for_pdf` | Email (real) |
| Crossref | 📋 Metadata only | DOI, title, authors | None |
| CORE | 🔒 Gated | Requires API key for full text | Free key needed |
| PhilPapers | 🚫 Blocked | Cloudflare blocks API | Use web_search instead |

**Default Retrieval Pathway:**
- **PATH A: OpenAlex** (primary) — search + get PDF URLs + citation graph in one call
- **PATH B: Unpaywall** (fallback) — resolve DOI to OA locations
- **PATH C: Specialized repos** (last resort) — HAL / Zenodo / Internet Archive / CORE

**Expansion Pathways:**
- References, citing works, same-author works, related topics — all via OpenAlex

**Hermes Tool Mapping for Execution:**
- `terminal` + `curl -L` for direct PDF downloads
- `web_search` for Cloudflare-blocked sites (PhilPapers, PhilArchive)
- `web_extract` for parsing publisher landing pages
- `browser` as absolute last resort
- `execute_code` for Python classification
- Subagents for parallelized multi-source search

### 3. `/academic-research` Skill

Created at `hermes/skills/analysis/research-pipeline/SKILL.md` (293 lines). Installed in Hermes as `/academic-research`. Contains:
- Source capability classifier with verified capabilities
- Default pathway (OpenAlex → Unpaywall → specialized repos)
- Hermes tool mapping table
- Friston schema classification
- Tension detection against existing essays
- ResearchNote journal format

### 4. Hermes Documentation Fully Downloaded

Full Hermes docs (66K lines, 1.8MB) saved to `/tmp/hermes-docs-full.txt` from `https://hermes-agent.nousresearch.com/docs/llms-full.txt`. This can be used by future agents for reference without needing to fetch the web.

### 5. `AGENTS.md` Updated

`hermes/AGENTS.md` now includes Telegram connection details, skills reference, and development notes.

## The Research Arm Vision

### What We're Building

A multi-source academic paper acquisition pipeline for Hermes that:

1. **Discovers** papers via OpenAlex (citation graph, author networks, topic expansion)
2. **Acquires** full texts via a layered fallback: OpenAlex→Unpaywall→HAL→Zenodo→Internet Archive→CORE
3. **Classifies** papers per the Friston schema (framework, predictions, relationships, evidence)
4. **Detects tensions** between scientific papers and existing esoteric essay claims
5. **Stores** results as structured ResearchNotes via Hermes journal

### Domain Mappings (Esoteric → Science Bridge)

| Esoteric Domain | Science Domain |
|---|---|
| Ficino spiritus | Interoception, predictive processing |
| Corbin imaginal | Mental imagery, hallucination models |
| Goethe perception | Active inference, enactive cognition |
| Iamblichus ritual | Contemplative neuroscience |
| Plotinus beauty | Neuroaesthetics |
| Swedenborg correspondences | Predictive processing, Bayesian brain |

### Integration with Essay Pipeline

The `/academic-research` skill feeds into `/write-and-publish`:
1. Before writing an essay, run `/academic-research` on the topic
2. Incorporate research findings into the essay blueprint
3. If tensions found between scientific papers and existing essays, those become essay topics

### Future Work (Not Yet Built)

- **API keys**: Need to register for OpenAlex API key, CORE API key, and Unpaywall email
- **Automated cron**: Monthly research digest per domain mapping
- **Knowledge graph**: The "graph of claims" from handover.md (loading HXRMXS syntheses, detecting contradictions) — not yet implemented
- **ArXiv integration**: Direct arXiv API search for computer science papers
- **PMC/PubMed**: Direct full-text access via PMC API for biomedical literature
- **Subagent parallelization**: Spawn subagents to search OpenAlex + HAL + Zenodo simultaneously

### 6. Vision Docs Created

Created the full vision architecture for Hermes as a scholarly compilation system:

| Doc | Location | Purpose |
|---|---|---|
| `daimon.md` | `hermes/notes/` | Research Objects — living scholarly compilations as the core product |
| `visionary.md` | `hermes/notes/` | Five visions: Learning Loop, Personal ROs, Dreaming Mind, Comparative Engine, Mature Ecosystem |
| `visionarynotes.md` | `hermes/notes/` | Karpathy LLM Wiki convergence analysis — Hermes as living scholarly literature |
| `visionbuild.md` | `hermes/notes/` | Gap analysis, build plan, Karpathy landscape analysis of 3 GitHub implementations |
| `currentresearchdocs.md` | `hermes/notes/` | Three-tier content taxonomy (Source → Commentary → Compilation) |
| `targets.md` | `hermes/notes/` | Paper acquisition targets with verified status |
| `retrieval-guide.md` | `hermes/notes/` | Verified retrieval methods for academic APIs |
| `acquisition-process-notes.md` | `hermes/notes/` | What worked and what didn't in acquisition runs |
| `publication-notes.md` | `hermes/notes/` | Pipeline tracking, session log, Type A vs Type B distinction |
| `visionarynotes.md` | `hermes/notes/` | Karpathy convergence, research object lifecycle, source-contribution manifests |

### 7. The 15 Research Object Families

Defined in `visionary.md` — every scholarly question maps to one:

| Family | Pattern | Example |
|---|---|---|
| Thinker on Topic | "{thinker} on {topic}" | Ficino on the Daimon |
| Topic Across Thinkers | "{topic} across {list}" | Daimon across Platonists |
| Thinker on Thinker | "{A} on {B}" | Ficino on Plato |
| Concept Evolution | "evolution of {concept}" | Daimon Plato→Ficino |
| Comparative | "{A} vs {B}" | Corbin vs Jung |
| Reception | "reception of {work}" | Reception of Timaeus |
| Tradition | "what is {tradition}" | What is Theurgy |
| Theme | "everything on {theme}" | Everything on Beauty |
| Practice | "{thinker} on {practice}" | Ficino on Prayer |
| Historical Question | "how did {history}" | How astrology survived Christianity |
| Debate | "arguments for/against {X}" | Is imagination ontological? |
| Research Map | "map everything on {domain}" | Map everything on Spiritus |
| Reading Companion | "reading companion for {book}" | Three Books on Life |
| Sourcebook | "primary sources on {topic}" | Primary Sources on the Daimon |
| Research Question | "investigate: {question}" | Did Ficino identify Genius with Daimon? |

### 8. Karpathy LLM Wiki Landscape Analysis

Explored the entire LLM Wiki ecosystem to position Hermes:

| Project | Stars | Innovation | What Hermes Borrows |
|---|---|---|---|
| karpathy-llm-wiki (Astro-Han) | 1.5k | SKILL.md pattern, ingest/query/lint | Three-command architecture, lint approach |
| llmwiki (lucasastorian) | 1.3k | MCP access, Chrome clipper, nightly routines | MCP tools, scheduled maintenance, source backlinks |
| AutoSci (skyllwt) | 1.5k | Full research lifecycle, 30+ skills, prefills | Foundations layer, error book, diagnostic tests |

**No existing project does Hermes's exact thing:** versioned, topic-specific scholarly compilations with source-level change tracking. Hermes sits in the gap between LLM Wikis, systematic review tools, and knowledge graphs.

### 9. Content Reorganization

Complete audit and reorganization of the project:

| What | Action | Status |
|---|---|---|
| 71 work records | Tiered (1=source, 2=commentary) | ✅ |
| 62 library PDFs | Moved from scholars/ into library/{author}/ | ✅ |
| 20 Anna's Archive PDFs | Moved into source-texts/{author}/ (14 dirs) | ✅ |
| Vision docs | Moved from root to hermes/notes/ | ✅ |
| Process docs (CLAUDE4/5, v6 algorithm, slop review) | Copied into hermes/notes/writing/essay/ | ✅ |
| Thesis docs | Copied into hermes/notes/writing/thesis/ | ✅ |
| Old .txt notes | Moved into notes/ | ✅ |
| Empty dirs (agents/, blueprints/) | Removed | ✅ |
| Root .md files | 35 system docs remain at root (astrology specs, architecture) | ✅ |

### 10. Key Architectural Decisions

1. **Research Objects over generic wiki pages** — Hermes's unit is the bounded scholarly question ("Ficino on the Daimon"), not a generic page
2. **Per-paragraph provenance** — every paragraph traces to its source
3. **Semantic versioning for scholarship** — PATCH (citation fix), MINOR (new source), MAJOR (reorganization)
4. **Knowledge pull requests** — source-aware change proposals with git branches + Telegram approvals
5. **Source-contribution manifests** — each RO tracks which sources contributed which sections
6. **Diagnostic tests after every compilation** — "unit tests for essays"
7. **Error Book** — persistent correction record that generates maintenance rules
8. **Recursive composition** — ROs built from ROs without touching raw PDFs

## Key Files

| File | Purpose |
|---|---|
| `hermesspec1.md` | **Integrated build specification** — synthesizes all Hermes work into one cohesive document |
| `researcharm.md` | Full research pipeline spec with verified API capabilities |
| `handover.md` | Core principles, architecture overview, fragile parts |
| `handover2.md` | Codebase context, bugs, roadmap |
| `hermes-architecture.md` | API specs, plugin structure, Phase 1-3 build order |
| `hermes-visionary-spec.md` | Vision for the daimonic agent on Hermes |
| `daimon.md` | Research Objects — living scholarly compilations |
| `visionary.md` | Five visions + 15 RO families |
| `visionarynotes.md` | Karpathy LLM Wiki convergence |
| `visionbuild.md` | Gap analysis, build plan, Karpathy landscape |
| `currentresearchdocs.md` | Three-tier content taxonomy |
| `targets.md` | Paper acquisition targets |
| `retrieval-guide.md` | Verified API retrieval methods |
| `acquisition-process-notes.md` | What worked in acquisition runs |
| `publication-notes.md` | Pipeline tracking and session log |
| `hermes/AGENTS.md` | Project context for Hermes (Telegram, skills, endpoints) |
| `hermes/SOUL.md` | Daimonic companion personality |
| `~/.hermes/.env` | Secrets (Telegram token, OpenCode API key) |
| `~/.hermes/config.yaml` | Hermes config (provider, external skills dirs) |
| `/tmp/hermes-docs-full.txt` | Full Hermes documentation (66K lines) |

## Key Commands

```bash
# Gateway
hermes gateway status
hermes gateway start
hermes gateway stop
journalctl --user -u hermes-gateway -f  # logs

# Skills
hermes skills list
hermes skills show academic-research

# Test on Telegram
# /publish-paper — Type B: existing paper → JSON → audio → deploy (NO writing)
# /write-and-publish — Type A: write essay with commentary → audio → deploy
# /acquisition — download and catalog papers
# /academic-research — multi-source research pipeline
# /deploy-site — git push → Cloudflare deploy
```

## Telegram Details

- Bot username: set via @BotFather (document in BotFather settings, not in code)
- Bot token: `~/.hermes/.env` → `TELEGRAM_BOT_TOKEN`
- Allowed users: `TELEGRAM_ALLOWED_USERS=8799078300`
- Home channel: `TELEGRAM_HOME_CHANNEL=8799078300`
- The `.env` file also contains `OPENCODE_GO_API_KEY` for the LLM provider
- Gateway auto-starts with systemd user service (linger enabled)
- If the bot stops responding: `hermes gateway restart` or `journalctl --user -u hermes-gateway -f | tail -50`
