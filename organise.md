# Organisation Audit — Re-Rendering Atlas

## The Problem

Everything lives in `/root/projects/blog/`. 332 top-level entries. The Next.js site, the astrology engine, the content factory, the video pipeline, Hermes skills, FableCut, thumbnails, source PDFs — all mixed in one directory. Skills are scattered across `hermes/skills/` and `~/.hermes/skills/`. Hermes has no clear boundary between "site content tasks" and "factory pipeline tasks."

---

## Current Inventory

### Site (Next.js + Cloudflare)
| Path | Purpose | Factory? |
|------|---------|----------|
| `src/` | Next.js app (pages, API routes, components) | NO |
| `workers/` | Cloudflare Workers (YouTube proxy) | NO |
| `server/` | Dev proxy | NO |
| `wrangler.jsonc`, `wrangler.toml`, `next.config.ts` | Config | NO |
| `content/glossary/` | Essays, art, concepts, sources FOR THE SITE | PARTIAL |
| `content/commentaries/` | Uno commentaries (site feature) | NO |

### Hermes Agent System
| Path | Purpose | Factory? |
|------|---------|----------|
| `hermes/skills/` | All factory + site skills (mixed) | MIXED |
| `hermes/notes/` | Specs, handovers, architecture | YES |
| `hermes/docs/` | Documentation | YES |
| `hermes/plugins/` | Astrology plugin | NO |
| `hermes/agents/` | Agent configs | PARTIAL |

### Content Factory
| Path | Purpose | Factory? |
|------|---------|----------|
| `content/works/` | Structured work JSONs | YES |
| `content/research-objects/` | ROs with passages | YES |
| `content/sources/` | Source material by tradition | YES |
| `content/video-objects/` | Video index, visual assignments | YES |
| `content/publishing/` | Storyboards, voiceovers, subtitles | YES |
| `content/_factory-index.json` | Factory inventory | YES |
| `content/_pipeline-queue.json` | Processing queue | YES |
| `factory-spec.md` | Formal rules | YES |
| `scripts/factory-audit.py` | Validation | YES |
| `scripts/generate-storyboard.mjs` | Storyboard gen | YES |
| `scripts/generate-voiceover.mjs` | Voiceover gen | YES |
| `scripts/generate-subtitles.mjs` | Subtitle gen | YES |
| `scripts/generate-quote-card.py` | Quote card gen | YES |
| `scripts/generate-audio.mjs` | TTS gen | YES |
| `scripts/thumbnail_render.py` | Thumbnail renderer | YES |
| `scripts/thumbnail_server.py` | Thumbnail server | YES |
| `fablevid.md` | Pipeline docs | YES |
| `storyboardnotes.md` | Pipeline notes | YES |

### Astrology Engine (Site Feature)
| Path | Purpose | Factory? |
|------|---------|----------|
| `workers/` | Astrology API workers | NO |
| `content/astrology/` | Astrology data | NO |
| `hermes/plugins/atlas-astrology/` | Astrology plugin | NO |
| `hermes/skills/astrology/` | Astrology skills | NO |

### Root-Level Mess
| Path | Count | Purpose |
|------|-------|---------|
| Root PDFs | 36 | Tantraloka, Nagarjuna, Steiner, etc. — should be in library/ |
| Root .md files | ~200 | Mix of specs, notes, essays, plans |
| `synthesis-essays/` | 146 | Pre-factory essays — should be ROs or works |
| `blueprints/` | 19 | Source texts — should be works |
| `essayglobal/` | ~500 | Old essay system |
| `library/` | 257 | Science papers + source texts |
| `hypothetical/` | 7 | Design docs |
| `hypothetical-integrated/` | 9 | More design docs |
| `tetrahermes*/` | Various | Old project artifacts |
| `gowan-papers/` | 122 | Raw papers |
| `agents/` | 1 | Agent configs (legacy) |
| `notes/` | 30 | Root-level notes |
| `scholars/` | 69 | Scholar content |

---

## The Organisation Plan

### Separation: Two Concerns

```
FACTORY PIPELINE                    SITE + ASTROLOGY ENGINE
(source → RO → essay → video)      (Next.js, API, astrology, graph, chat)
                                   
content/works/                      src/ (Next.js)
content/research-objects/           content/glossary/ (site-facing essays, art)
content/sources/                    content/commentaries/
content/video-objects/              content/astrology/
content/publishing/                 workers/ (Cloudflare)
content/_factory-*                  hermes/plugins/atlas-astrology/
factory-spec.md                     hermes/skills/astrology/
scripts/factory-audit.py            
scripts/generate-*.mjs/py           HERMES SYSTEM
scripts/thumbnail_*.py              (shared — controls both)
fablevid.md                         
storyboardnotes.md                  hermes/skils/factory-pipeline/
                                    hermes/skils/publish-video-fablecut/
                                    hermes/skils/acquire/
                                    hermes/skils/write/
                                    hermes/skils/publish/
```

### What Is Factory vs Site

| Domain | Factory | Site | Notes |
|--------|---------|------|-------|
| **Works** | ✅ Source material structured | ❌ | Factory consumes, site doesn't |
| **ROs** | ✅ Compilation manifests | ❌ | Internal — site reads essays, not ROs |
| **Essays** | ✅ Products the factory produces | ✅ Site displays them | Shared — factory writes, site serves |
| **Art** | ✅ Used in video pipeline | ✅ Site gallery | Shared |
| **Sources** | ✅ Raw material for extraction | ❌ | Factory internal |
| **Video objects** | ✅ Pipeline tracking | ❌ | Factory internal |
| **Astrology** | ❌ | ✅ Site feature | Not factory |
| **Commentaries** | ❌ | ✅ Site feature | Not factory |
| **Graph data** | ❌ | ✅ Site feature | Not factory |
| **Hermes skills** | ✅ Pipeline skills | ✅ Site skills | Separate directories |

### Skill Reorganisation

Current (mixed):
```
hermes/skills/
  astrology/       ← site
  core/            ← factory (acquire, publish, etc.)
  daimon/          ← site
  ops/             ← site
  practice/        ← site
  source-to-essay/ ← factory
  video/           ← factory
  writing/         ← factory
```

Proposed:
```
hermes/skills/
  factory/                     ← Pipeline skills
    factory-pipeline/           Master controller
    publish-video-fablecut/     Video pipeline
    acquire/                    Paper acquisition (moved from core/)
    publish/                    Publication (moved from core/)
    write/                      Essay writing (moved from writing/)
    source-to-essay/            Source extraction (moved from source-to-essay/)
    
  site/                        ← Site operations
    astrology/                  Astrology skills
    daimon/                     Daimon companion
    practice/                   Practice recommendations
    ops/                        DevOps (deploy, etc.)
    art/                        Art curation
    audio/                      Audio generation for site essays
```

### File Reorganisation

Move root-level mess into structured directories:
```
library/
  source-texts/     ← blueprints/source_texts/ moved here
  science/          ← already here
  pdfs/             ← root PDFs moved here

content/
  factory/          ← Factory-specific (new)
    _index.json       → from _factory-index.json
    _queue.json       → from _pipeline-queue.json
  works/            ← stays
  research-objects/ ← stays
  video-objects/    ← stays
  publishing/       ← stays
  sources/          ← stays
  glossary/         ← stays (shared with site)
  astrology/        ← stays (site)
  commentaries/     ← stays (site)
```

---

## Action Items

### Immediate (sorted by impact)

1. **Move skills** — `core/acquire` → `factory/acquire`, `writing/write` → `factory/write`, etc. Update `~/.hermes/skills/` copies. Restart gateway.

2. **Update cron skill** — change `video-pipeline` cron to load `factory-pipeline` skill instead of `publish-video-fablecut`. Remove the old prompt confusion.

3. **Separate factory index** — move `_factory-index.json` and `_pipeline-queue.json` to `content/factory/`. Update AGENTS.md references.

4. **Prune root** — move 36 root PDFs to `library/pdfs/`, archive old root markdown docs to `archive/` or delete.

### Medium-term

5. **Collapse synthesis-essays/ into content/works/** — those 146 essays are source material, not factory output. Convert them to Work JSONs.

6. **Collapse blueprints/source_texts/ into content/works/** — same logic, 19 source texts need Work JSONs.

7. **Remove essayglobal/ and tetrahermes*/ and gowan-papers/** — either integrate into content/works/ or archive.

8. **Separate skill repo** — optional: move `hermes/` skills to `/root/projects/hermes-factory-skills/` so the factory pipeline doesn't need the site repo.

### Never

- Don't move `content/glossary/essays/` — the site serves them, the factory writes them. Shared boundary is fine.
- Don't move `content/glossary/art/` — same reasoning, shared between site gallery and video pipeline.
