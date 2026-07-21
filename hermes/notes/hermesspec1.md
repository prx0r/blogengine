# HermesSpec v1 — Integrated Build Specification

## System Architecture

```
                    VPS (Hermes Agent)
┌──────────────────────────────────────────────────────────┐
│  Telegram ←→ Hermes Gateway (systemd)                    │
│               │                                          │
│         ┌─────┴─────┐                                    │
│         │  Skills   │  /academic-research                 │
│         │           │  /write-and-publish                 │
│         │           │  /essay-companion                   │
│         │           │  /research-mapping                  │
│         └─────┬─────┘                                    │
│               │                                          │
│         ┌─────┴─────┐                                    │
│         │  Tools    │  terminal, web_search, web_extract  │
│         │           │  browser, execute_code, journal     │
│         └─────┬─────┘                                    │
│               │                                          │
│         ┌─────┴─────┐                                    │
│         │  Cron     │  daily-daimon, monthly-digest       │
│         └─────┬─────┘                                    │
│               │                                          │
│         ┌─────┴─────┐                                    │
│         │  Memory   │  MEMORY.md, USER.md, session_search │
│         └───────────┘                                    │
│  Local storage:                                           │
│    papers.db (SQLite FTS5) — fast paper search index      │
│    research-notes.db — research note journal              │
│    ~/.hermes/state.db — Hermes internal state             │
│    Downloaded PDFs (ephemeral cache)                      │
└──────────────────────┬───────────────────────────────────┘
                       │ HTTPS
                       ▼
              Cloudflare Workers
┌──────────────────────────────────────────────────────────┐
│  Site API routes:                                        │
│    POST /api/astrology/today                             │
│    GET  /api/astrology/graph                             │
│    POST /api/journal                                     │
│    POST /api/astrology/snapshot                          │
│                                                          │
│  D1 Database:                                            │
│    users, journal_entries, chat_sessions,                │
│    works, recommendation_events, reading_state           │
│                                                          │
│  R2 Storage:                                             │
│    papers/{work_id}/original.pdf                         │
│    papers/{work_id}/extracted.md                         │
│    audio/, art/, video/                                  │
│                                                          │
│  Vectorize:                                              │
│    semantic index over paper sections                    │
│                                                          │
│  Static site (Next.js):                                  │
│    /essays/* — published essays with audio               │
│    /concepts/* — glossary concept pages                  │
│    /astrology — astrology engine UI                      │
└──────────────────────────────────────────────────────────┘
```

## Division of Responsibility

| Layer | Location | What |
|---|---|---|
| **Deterministic Engine** | Cloudflare (Next.js) | caelus → ActivationPacket → DailySphereReading |
| **Astrology Knowledge Graph** | Cloudflare (in-memory) | 1024 nodes, 2102 edges for astrology/spellbook |
| **Hermes Agent** | VPS | Skills, cron, memory, multi-source research |
| **Research Arm** | VPS | OpenAlex→Unpaywall→HAL→Zenodo paper pipeline |
| **Paper Storage** | JSON files + VPS SQLite + Cloudflare D1/R2 | Three-layer storage (see below) |
| **Essay Pipeline** | VPS → Cloudflare | Research → write → audio → art → deploy |
| **Telegram** | VPS (Hermes gateway) | Messaging, cron delivery, slash commands |

---

## Build Status

### Phase 0 — Foundation (COMPLETE)

| Component | Status | Details |
|---|---|---|
| Hermes installation | ✅ | v0.18.2 at `/usr/local/lib/hermes-agent/` |
| LLM provider | ✅ | opencode-go / deepseek-v4-flash |
| Telegram gateway | ✅ | Running as `hermes-gateway.service` (systemd, linger enabled) |
| `hermes/AGENTS.md` | ✅ | Telegram details, skills, endpoints documented |
| `hermes/SOUL.md` | ✅ | Daimonic companion personality |
| External skills dir | ✅ | Points to `/root/projects/blog/hermes/skills/` |
| Hermes full docs | ✅ | 66K lines saved to `/tmp/hermes-docs-full.txt` |

### Phase 1 — Research Arm (IN PROGRESS)

| Component | Status | Details |
|---|---|---|
| `researcharm.md` | ✅ | Full spec with verified API capabilities |
| `/academic-research` skill | ✅ | Installed, available on Telegram |
| `handover0.md` | ✅ | Session documentation |
| API keys | 🔲 | OpenAlex, CORE, Unpaywall email not yet registered |
| Paper storage schema | 🔲 | SQLite + JSON structure not yet built |
| Paper index script | 🔲 | Script to index scholars/ into DB |
| Cron monthly digest | 🔲 | Not yet scheduled |

### Phase 2 — Essay Pipeline (SPEC EXISTS)

| Component | Status | Details |
|---|---|---|
| `/write-and-publish` skill | ✅ | 8-phase pipeline from source to deploy |
| `/essay-companion` skill | ✅ | Alternative essay skill |
| `/research-mapping` skill | ✅ | Domain bridge mapping |
| `/generate-audio` skill | ✅ | TTS generation |
| `/fetch-art` skill | ✅ | Museum API art search |
| Research→essay integration | 🔲 | Not yet wired (academic-research feeds into write-and-publish) |

### Phase 3 — Knowledge Graph & Automation (FUTURE)

| Component | Status |
|---|---|
| Paper knowledge graph (claims, tensions) | Not built |
| ArXiv direct API integration | Not built |
| PMC/PubMed full-text integration | Not built |
| Subagent parallelization | Not built |
| Auth layer for API endpoints | Not built |
| Cache layer for astrology API | Not built |

---

## Research Arm — Retrieval Pathways

### Default PATH A: OpenAlex (Primary)

```
1. GET https://api.openalex.org/works?search={query}&per_page=10
   &select=id,doi,title,authorships,open_access,best_oa_location,locations,concepts,referenced_works,cited_by_count

2. Check best_oa_location.pdf_url:
   ├── YES → curl -L "{pdf_url}" -o paper.pdf
   └── NO  → Check locations[].pdf_url entries

3. Use concepts[].display_name for topic classification
4. Use referenced_works for citation graph expansion
```

### PATH B: Unpaywall (DOI Resolution)

```
1. GET https://api.unpaywall.org/v2/{doi}?email=your@email.com
2. Check oa_locations array:
   - host_type: "repository" entries often have url_for_pdf
   - publisher entries usually lack direct PDF
3. curl -L "{url_for_pdf}" -o paper.pdf
```

### PATH C: Specialized Repositories

```
French/European   → HAL:   filter submitType_s:file, fileMain_s = direct PDF
Recent deposit    → Zenodo: files[].links.self = direct download
Old/public domain → Internet Archive: check rights, download _djvu.txt
Thesis            → CORE:  requires API key for full text
Philosophy paper  → web_search site:philarchive.org {title}
```

### Verified API Capabilities

| Source | Full Text? | Auth | Verified Behavior |
|---|---|---|---|
| **HAL** | ✅ Direct PDF | None | `fileMain_s` = downloadable URL. No redirect. |
| **Zenodo** | ✅ Direct download | None | `files[].links.self` = downloadable. Max 100/page. |
| **Internet Archive** | ✅ Full text | None | `_djvu.txt` for raw text, PDF via `/download/`. Check rights. |
| **OpenAlex** | 🔗 OA URLs | Free key ($1/day) | `best_oa_location.pdf_url` tells WHERE, not a download service. |
| **Unpaywall** | 🔗 DOI→OA | Email | `oa_locations[].url_for_pdf` for repository copies (PMC, etc.) |
| **Crossref** | 📋 Metadata | None | DOI, title, authors, year. No abstract. No full text. |
| **CORE** | 🔒 Gated | Free key needed | Public: `"fullText": "Not available for public API users."` |
| **PhilPapers** | 🚫 Blocked | Cloudflare | All endpoints blocked. Use `web_search` instead. |

---

## Storage Architecture — Three-Layer Design

### Layer 1: JSON Source Records (Project Files)

Canonical scholarly record. Version-controlled, portable, human-readable.

```
content/
  works/
    work_corbin_imaginal.json
    work_voss_becoming_angel.json
    ...

  authors/
    author_henry_corbin.json
    author_angela_voss.json
    ...

  concepts/
    concept_mundus_imaginalis.json
    concept_spiritus.json
    concept_daimon.json
    ...

  commentaries/
    commentary_corbin_imaginal_medium.json
    ...

  schemas/
    work.schema.json
    concept.schema.json
    relation.schema.json

  indexes/
    papers.db              # Generated SQLite FTS5 search index
```

**Paper JSON format:**
```json
{
  "work_id": "work_corbin_imaginal",
  "schema_version": 1,
  "title": "Mundus Imaginalis",
  "authors": [{ "name": "Henry Corbin", "author_id": "author_henry_corbin" }],
  "publication": { "year": 1964, "type": "essay", "language": "en" },
  "identifiers": { "doi": null, "openalex_id": null },
  "topics": ["mundus_imaginalis", "active_imagination", "angelology"],
  "relations": [
    { "predicate": "discusses", "target_id": "concept_mundus_imaginalis" },
    { "predicate": "related_to", "target_id": "concept_active_imagination" }
  ],
  "assets": {
    "pdf_r2_key": "papers/work_corbin_imaginal/original.pdf",
    "text_r2_key": "papers/work_corbin_imaginal/extracted.md"
  },
  "sections": [],
  "analysis": {
    "summary": "...",
    "argument": "...",
    "quality_score": 0.91
  }
}
```

**What goes here:** canonical metadata, extracted arguments, concepts, source manifests, chunk structure, citations, provenance, graph-export records, editorial corrections.

### Layer 2: VPS Local SQLite (Hermes Runtime Index)

```
~/.hermes/papers.db
  └── papers_fts (FTS5 full-text index over titles, abstracts, summaries)
  └── works (id, title, authors_json, year, topics_json, openalex_id, doi)
  └── topics (id, label, parent_id)
  └── work_topics (work_id, topic_id)
  └── relations (subject_id, predicate, object_id, confidence, provenance_json)
```

Generated from the JSON files by a build script. Rebuildable, disposable. Used by Hermes for fast local keyword search and filtering.

### Layer 3: Cloudflare D1 + R2 + Vectorize (Site Runtime)

**D1 operational tables:**
```sql
works             — indexed copy of paper metadata
recommendation_events  — what was recommended, when, outcome
reading_state     — per-user progress through a paper
annotations       — user highlights and notes
ingestion_jobs    — pipeline tracking
feedback_events   — likes, skips, shares
```

**R2 storage:**
```
papers/{work_id}/original.pdf
papers/{work_id}/extracted.md
audio/, art/, video/
JSON analysis bundles
```

**Vectorize index:** semantic embeddings over paper sections, referenced by `work_id` + `segment_id`.

### What Goes Where

```
JSON:        What is this work? (canonical, portable)
VPS SQLite:  How do I search for works? (fast, local)
D1:          What has happened with this work? (user state, events)
R2:          Where are its files? (large assets)
Vectorize:   What is semantically similar? (embeddings)
```

### ID Convention (Following Existing Pattern)

Following the existing `prefix:entity` convention from the astrology graph:

| Entity | ID Format | Example |
|---|---|---|
| Work | `work:{slug}` | `work:corbin-imaginal` |
| Author | `author:{slug}` | `author:henry-corbin` |
| Concept | `concept:{slug}` | `concept:mundus-imaginalis` |
| Scholar | `scholar:{slug}` | `scholar:ficino` |
| Field | `field:{slug}` | `field:neoplatonism` |
| Source | `source:{id}` | `source:corbin-pdf-001` |
| Commentary | `commentary:{slug}` | `commentary:corbin-medium` |

---

## Hermes Skills Inventory

### Installed Skills (Available on Telegram)

| Skill | Command | Purpose |
|---|---|---|
| `academic-research` | `/academic-research` | Multi-source research pipeline (OpenAlex→HAL→Zenodo) |
| `research-mapping` | `/research-mapping` | Map esoteric concepts to science domains (arxiv) |
| `write-and-publish` | `/write-and-publish` | 8-phase essay pipeline: source→blueprint→JSON→audio→deploy |
| `essay-companion` | `/essay-companion` | Alternative essay pipeline |
| `generate-audio` | `/generate-audio` | TTS for essay JSON files |
| `fetch-art` | `/fetch-art` | Museum API art search for concept matching |
| `recommend-practice` | `/recommend-practice` | Practice recommendation (astrology) |
| `daily-reading` | `/daily-reading` | Daily daimonic insight (blueprint, cron 6am) |
| `weekly-review` | `/weekly-review` | Weekly aggregation (blueprint, cron Sunday) |
| `advanced-analysis` | `/advanced-analysis` | LLM analysis of astrology packet |
| `schedule-ritual` | `/schedule-ritual` | Find optimal planetary hour for practice |
| `pgm-extraction` | `/pgm-extraction` | Extract SpellEntry objects from PGM text |

### Skill Bundle (Planned)

```yaml
name: essay-full-pipeline
description: Academic research → essay writing → audio → deploy
skills:
  - academic-research
  - write-and-publish
  - fetch-art
instruction: |
  Always start by running academic-research on the topic.
  Then proceed to write-and-publish.
  If tensions found in research, flag them in the essay.
```

---

## Essay Pipeline Flow

```
┌────────────────────────────────────────────────────────────┐
│  1. RESEARCH (Hermes / VPS)                                │
│                                                             │
│  /academic-research "Ficino spiritus interoception"         │
│    → OpenAlex search + citation graph                      │
│    → Unpaywall DOI resolution                              │
│    → HAL / Zenodo / Internet Archive full-text download    │
│    → Friston schema classification                        │
│    → Tension detection vs existing essays                  │
│    → ResearchNote saved to journal                         │
└──────────────────────┬─────────────────────────────────────┘
                       │
                       ▼
┌────────────────────────────────────────────────────────────┐
│  2. WRITE (Hermes / VPS)                                   │
│                                                             │
│  /write-and-publish "Ficino Spiritus and Predictive..."    │
│    Phase 1: Classify source (type, structure)              │
│    Phase 2: Extract passages (define/argue/image/contrast)  │
│    Phase 3: Convert to Essay JSON (source/ai/summary blocks)│
│    Phase 4: Glossary integration (link concepts)           │
│    Phase 5: Art matching (museum APIs)                     │
│    Phase 6: Audio generation (edge-tts)                    │
│    Phase 7: Regenerate build data                          │
└──────────────────────┬─────────────────────────────────────┘
                       │
                       ▼
┌────────────────────────────────────────────────────────────┐
│  3. DEPLOY (Hermes / VPS → Cloudflare)                     │
│                                                             │
│  Phase 8: npm run cf:build && npm run cf:deploy            │
│    → Builds Next.js with new essay JSON                    │
│    → Deploys to Cloudflare Pages                           │
│    → Verify at /essays/{essay-id}                          │
└────────────────────────────────────────────────────────────┘
```

---

## Key Files Reference

| File | Purpose |
|---|---|
| `hermesspec1.md` | This file — integrated build specification |
| `researcharm.md` | Full research pipeline spec with verified API capabilities |
| `handover.md` | Core principles, architecture overview, fragile parts |
| `handover2.md` | Codebase context, bugs, roadmap |
| `handover0.md` | This session: Telegram integration, research arm progress |
| `hermes-architecture.md` | API specs, plugin structure, Phase 1-3 build order |
| `hermes-visionary-spec.md` | Vision for the daimonic agent on Hermes |
| `hermes/AGENTS.md` | Project context for Hermes (Telegram, skills, endpoints) |
| `hermes/SOUL.md` | Daimonic companion personality |
| `hermes/skills/` | All SKILL.md files for installed skills |
| `hermes/plugins/atlas-astrology/` | Python plugin tools for site API |
| `essayprocess.md` | Source Atlas spec — essay format and processing flow |
| `essay-automation-loop.md` | Essay automation workflow |
| `~/.hermes/.env` | Secrets (Telegram token, OpenCode API key) |
| `~/.hermes/config.yaml` | Hermes configuration |
| `~/.hermes/state.db` | Hermes internal state (sessions, messages with FTS5) |
| `/tmp/hermes-docs-full.txt` | Full Hermes documentation (66K lines) |

---

## Key Commands

```bash
# Gateway
hermes gateway status
hermes gateway start
hermes gateway stop
journalctl --user -u hermes-gateway -f   # logs

# Skills
hermes skills list
hermes skills inspect academic-research

# Research test
# On Telegram: /academic-research "Henry Corbin mundus imaginalis"

# Build and deploy
npm run cf:build
npm run cf:deploy

# Update skill after editing project files
cp hermes/skills/analysis/research-pipeline/SKILL.md ~/.hermes/skills/academic-research/SKILL.md
```

## Telegram Details

- Bot username: set via @BotFather
- Token: `~/.hermes/.env` → `TELEGRAM_BOT_TOKEN`
- Allowed users: `TELEGRAM_ALLOWED_USERS=8799078300`
- Home channel: `TELEGRAM_HOME_CHANNEL=8799078300`
- Gateway: systemd user service (linger enabled, survives logout)
- Bot responds to slash commands: `/academic-research`, `/write-and-publish`, etc.
- Cron deliveries go to the DM home channel

## Next Build Steps

### Immediate (Next Session)

1. Register for API keys: OpenAlex ($1/day free tier), CORE (free), set Unpaywall email
2. Design and create the paper JSON schema (`content/schemas/work.schema.json`)
3. Write Hermes tool/script to index `scholars/` papers into the SQLite FTS5 database
4. Create `content/works/` directory and migrate first paper from `scholars/`
5. Build the Hermes plugin tool for paper CRUD (create/read/update from Hermes chat)

### Short Term

6. Wire `/academic-research` → `/write-and-publish` integration
7. Set up monthly cron for research digest per domain mapping
8. Download full texts for top-priority papers from `scholars/`
9. Extract concepts from papers and add to `content/concepts/`

### Medium Term

10. Build paper knowledge graph (claims, tensions, evidence tiers)
11. Implement subagent parallelization for multi-source searches
12. Add ArXiv and PMC/PubMed direct API integration
13. Set up Vectorize index on Cloudflare for semantic paper search
14. Build recommendation system: "papers you haven't seen on topic X"

### Long Term

15. Auth layer for astrology API endpoints
16. Caching layer for astrology computations
17. Video pipeline (essay → storyboard → render → YouTube)
18. Prospective validation log (D1 storage of daily snapshots)
