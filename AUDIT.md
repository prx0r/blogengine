# Factory Audit — Complete System State

## Root Directory (Clean)

21 active files, 30 directories. Zero orphaned files.

```
Root .md files (21):     factory docs, style guides, project context
Root PDFs:               0 (36 moved to library/pdfs/)
Root EPUBs/MOBIs:        0 (5 moved to library/ebooks/)
Root unrecognized:       0 (all renamed/filed)
```

---

## Content Directory (`content/`)

| Path | Count | Status |
|------|-------|--------|
| `content/works/` | 1,917 | Works (acquired papers) |
| `content/research-objects/` | 153 | ROs (after 8 deleted, 3 dissolved, 2 converted) |
| `content/comparison-objects/` | 2 | COs (newly created) |
| `content/synthesis-objects/` | 0 | SOs (not yet created) |
| `content/glossary/essays/` | 1,796 | Essays (220 content, 1,576 bridge) |
| `content/glossary/art/` | 904 | Art metadata (341 tagged, 563 untagged) |
| `content/glossary/concepts/` | 76 | Concepts (23 linked to ROs, 15 to art) |
| `content/glossary/sources/` | 13 | Source references |
| `content/sources/` | 2,035+ | Source material by tradition |
| `content/publishing/` | 363 | Storyboards, voiceovers, subtitles |
| `content/video-objects/` | 133 | Video metadata + seed images |
| `content/factory/` | 8 files | Factory index, queue, registry, classification |
| `content/astrology/` | 8 | Astrology references |
| `content/commentaries/` | 741 | Commentary system |

---

## Research Objects (153 Total)

### By Family
| Family | Count | Notes |
|--------|-------|-------|
| tradition | 72 | Tantraloka, layayoga, alchemy |
| topic-across-thinkers | 19 | Death, daimon, consciousness |
| thinker-topic | 19 | Corbin, Ficino, Proclus, Suhrawardi |
| literature | 27 | Divine Comedy, Odyssey, Parzival |
| theme | 13 | Alchemy series, daimon variants |
| channeled-text | 3 | Law of One, Seth, Cassiopaean |

### By Quality
| Status | Count | Criteria |
|--------|-------|----------|
| Ready for essay (score ≥ 4) | 43 | ≥10 passages, v0.2.0+, sources linked |
| Needs work (score < 4) | 110 | Thin passages, early version |
| Stub | 34 | <5 passages, marked skip |
| Dissolved/converted/deleted | 13 | Placeholder content removed |

### Top 10 Ready ROs
```
1. ro:layayoga-absorption (12 passages, score 6)
2. ro:layayoga-kundalini (13 passages, score 6)
3. ro:layayoga-mantra-science (11 passages, score 6)
4. ro:layayoga-subtle-body (13 passages, score 6)
5. ro:nanananda-papanca (13 passages, score 6)
6. ro:steiner-tantraloka-parallels (10 passages, score 6)
7. ro:synesius-dream-daimon (13 passages, score 6)
8. ro:tantraloka-consciousness-states (10 passages, score 6)
9. ro:tantraloka-cosmology (13 passages, score 6)
10. ro:death-systems-convergence (13 passages — reclassified as CO)
```

---

## Comparison Objects (2 New)

| CO | Parents | Passages | Source |
|----|---------|----------|--------|
| `co:daimon-guidance` | ro:daimon-platonist, ro:daimon-theurgic, ro:daimon-hga | 8 | Converted from RO |
| `co:laya-daimon-contact` | ro:layayoga-absorption, ro:daimon-platonist, ro:path-pgm | 13 | Converted from RO |

---

## Essays (220 Content + 1,576 Bridge)

### Content Essays by Status
| Status | Count | Criteria |
|--------|-------|----------|
| Published | 35 | Audio + concepts + 15+ blocks + RO trace |
| Final draft | 102 | 15+ blocks, substantial, may lack audio |
| First draft | 56 | 5-14 blocks, structurally complete |
| Concept | 27 | <5 blocks or <1500 chars |
| **Total content** | **220** | (1,576 bridge papers excluded) |

### Essays Written from ROs (3)
| Essay | RO | Blocks | Audio | Status |
|-------|----|--------|-------|--------|
| `corbin-mundus-imaginalis` | ro:corbin-imaginal | 40 | ✅ | Published |
| `you-died-already` | ro:death-systems-convergence | 17 | ❌ | Final draft |
| `laya-daimon-test` | ro:laya-daimon-contact | 22 | ❌ | Pass 2 passed |

### Essay → Source Linkage
| Registry | Entries |
|----------|---------|
| RO → essay | 4 ROs, 18 essays |
| Work → essay | 144 works, 176 essays |
| CO → essay | 0 so far (new system) |
| **Total links** | **194** |

---

## Art Library (904 Entries)

| Tagging Status | Count | Notes |
|----------------|-------|-------|
| Tagged (with concepts) | 341 | Mostly alchemy emblems + curated |
| Untagged | 563 | Mostly Met Museum + Commons imports |
| With image files | 140 | In `public/art/` |
| With alchemy paths | 320 | In `content/sources/occult/alchemy/emblems/` |
| Concept → art backlinks | 15 of 76 concepts | Need population |

---

## Video Pipeline

| Stage | Status | Details |
|-------|--------|---------|
| Thumbnails | ✅ 12 generated | All 56 planned have artwork assigned |
| Storyboard | ✅ 1 complete | The World Between Worlds (8 segments) |
| Voiceover | ✅ 1 complete | 5.3 min, edge-tts, en-US-AriaNeural |
| Visual assignment | ✅ 1 complete | Artwork matched per segment |
| Subtitles | ✅ 1 complete | .ass + .srt generated |
| FableCut timeline | 🟡 1 built | Needs review in browser |
| YouTube upload | ❌ | Needs OAuth setup |
| Analytics | ❌ | Needs YouTube API + 7 days of data |

---

## Hermes Factory Skills

```
factory/ (10 skills)
  acquire          — Paper acquisition pipeline
  audio            — TTS generation
  cron-acquire     — Scheduled paper acquisition
  factory-pipeline — Master controller (7 stages)
  publish          — Publication pipeline
  publish-video-fablecut — Video pipeline (storyboard→FableCut→export)
  search           — Search tools
  source-to-essay  — Source extraction → essay conversion
  synth            — Synthesis
  write            — 3-pass essay writing with blocking gates

site/ (5 skills)
  art              — Art curation
  astrology        — Astrology engine
  daimon           — Daimon companion
  ops              — DevOps/deploy
  practice         — Practice recommendations
```

---

## Object Hierarchy

```
RO (Research Object)     — One topic, one tradition. 153 exist.
CO (Comparison Object)   — Compares exactly 2 ROs. 2 exist.
SO (Synthesis Object)    — Combines 3+ ROs/COs. 0 exist.
Essay                    — Product. Draws from RO/CO/SO. 220 content.
Concept                  — Stub <5 blocks. 27 exist.
```

---

## Services Running

| Service | Port | Status |
|---------|------|--------|
| Hermes Gateway | systemd | ✅ Active (Telegram) |
| FableCut Editor | 7777 | ✅ Running |
| Thumbnail Server | 8765 | ✅ Running |
| Cron: video-pipeline | every 6h | ✅ Active |
| Cron: cron-acquire | daily | ✅ Active |

---

## Pipeline Throughput

| Metric | Value |
|--------|-------|
| ROs ready for essay | 43 |
| Time per RO (cron, 1 stage/cycle) | ~10 days |
| Time per RO (manual prompt) | ~3 min |
| Essays written to date | 3 |
| Essays needed for 56 planned videos | 56 |
| Art tagged | 341/904 (38%) |
| Art needing vision tagging | 563 (62%) |

---

## Immediate Action Items

1. **Fix Cloudflare Workers AI token** — needs `workers-ai` permission to tag 563 untagged art images (~30 min total)
2. **Write essays from 43 ready ROs** — biggest bottleneck. Cron does 1 stage/6h. Manual prompting does 1 essay/3min.
3. **Populate concept → art links** — 15 of 76 concepts linked. Script exists but not run.
4. **Enforce E09/E10 on write skill** — `ro_passage_id` required on every source block. Currently documented but not blocking.
5. **Backfill ro_passage_id on existing essays** — 220 content essays, 0 have passage-level traceability.

---

## Files Created This Session

```
factory-manual.md         — Source truth for object hierarchy
factory-spec.md           — Formal validation rules (W01-V07)
factory-analytics.md      — Analytics feedback loop
factory-template.md       — Replicable domain template
factory-cleanup.md        — Gap analysis
cloudflare-infra.md       — Cloudflare deployment plan
fullintegrated.md         — Master document (1,699 lines)
organise.md               — Codebase audit
progress.md               — Session progress
AUDIT.md                  — This file

scripts/factory-audit.py  — Binary validation
scripts/monitor-ros.py    — RO queue generator
scripts/register-essay.py — Essay→RO registration
scripts/validate-essay-pass.py — Blocking pass validation
scripts/tag-art.py        — Vision tagging (needs CF auth)
scripts/upload-youtube.mjs — YouTube upload

hermes/notes/writing/3-pass-architecture.md — 3-pass writing system
hermes/skills/factory/ — 10 factory skills organized
hermes/skills/site/    — 5 site skills organized

content/comparison-objects/ — 2 COs created
content/factory/           — 8 tracking files
library/pdfs/              — 36 PDFs organized by topic
library/astrology/         — 17 astrology docs
library/ebooks/            — 5 ebooks
archive/tetrahermes/       — Dead project files
archive/handovers/         — Old agent handovers
```
