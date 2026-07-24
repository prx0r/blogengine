# Progress — Factory Build Session

## What Was Built (17 files, 3 essays, 4 skills, 1 cron)

### Core Factory
| File | Purpose |
|------|---------|
| `factory-manual.md` | Source truth — object hierarchy (RO/CO/SO/Essay/Concept), relationships, rules |
| `factory-spec.md` | Formal binary validation rules for all 5 pipeline stages (W01-W10, R01-R23, E01-E13, S01-S10, V01-V07) |
| `factory-analytics.md` | Analytics feedback loop — retention data → queue reprioritisation |
| `factory-template.md` | Replicable factory pattern for any domain (e.g., neuroscience) |
| `factory-cleanup.md` | Gap analysis — what's still broken and how to fix it |
| `cloudflare-infra.md` | Cloudflare deployment — Workers AI, D1, Vectorize, Queues, Cron |
| `organise.md` | Codebase audit — factory vs site separation |
| `fullintegrated.md` | Consolidated master document (1,699 lines) |

### Pipeline Scripts
| Script | Purpose |
|--------|---------|
| `scripts/factory-audit.py` | Binary validation for all stages (RO, essay, storyboard, video) |
| `scripts/monitor-ros.py` | RO queue generator — finds ROs ready for essay expansion |
| `scripts/register-essay.py` | Essay → RO registration with dedup check |
| `scripts/validate-essay-pass.py` | Blocking pass validation — exit code 0/1 per pass |
| `scripts/tag-art.py` | Vision tagging for untagged art (CF Workers AI) |
| `scripts/upload-youtube.mjs` | YouTube upload with metadata, thumbnails, playlists |
| `scripts/generate-subtitles.mjs` | .ass + .srt subtitle generation |
| `scripts/generate-quote-card.py` | Pillow-generated black-page quote card PNGs |

### Writing System
| File | Purpose |
|------|---------|
| `hermes/notes/writing/3-pass-architecture.md` | 3-pass writing with binary per-pass validation |
| `hermes/skills/writing/write/SKILL.md` | Updated — references 3-pass architecture with Ralph Loop enforcement |

### Hermes Skills Organized
```
factory/: acquire, audio, cron-acquire, factory-pipeline, publish,
          publish-video-fablecut, search, source-to-essay, synth, write
site/:    art, astrology, daimon, ops, practice
```

### Working Essays Written
| Essay | From | Blocks | Status |
|-------|------|--------|--------|
| `corbin-mundus-imaginalis` | ro:corbin-imaginal (18 passages) | 40 | Published (audio+concepts) |
| `you-died-already` | ro:death-systems-convergence (13 passages) | 17 | Final draft (needs audio) |
| `laya-daimon-test` | ro:laya-daimon-contact (13 passages) | 22 | Pass 2 passed, Pass 3 interrupted |

### Live Infrastructure
| Service | Status |
|---------|--------|
| Cron `video-pipeline` (every 6h) | Active — processes one stage per cycle |
| FableCut editor (port 7777) | Running — browser video editor |
| Thumbnail server (port 8765) | Running — art gallery + assigner |
| Essay registry | Populated — 4 ROs, 144 works, 194 total links |
| Factory index | Created — tracks all object types |
| CO directory | Created — 2 comparison objects |

## What Still Needs Doing

### High Priority
| Task | Files Affected | Notes |
|------|--------------|-------|
| **Cloudflare Workers AI auth** | `.dev.vars` | Token needs `workers-ai` permission. Currently can't use CF vision models. |
| **Tag remaining 563 untagged art** | `content/glossary/art/*.json` | ~3s per image via Llama 3.2 Vision = ~30 min total once CF auth works |
| **Populate 11 ROs with placeholder passages** | `content/research-objects/ro-*/ro.json` | 6 full ROs + 5 dissolved still have `[Passage to be extracted]` |
| **Fix essay → RO traceability** | `hermes/skills/writing/write/SKILL.md` | E09 gate exists in spec but not enforced — need blocking `ro_passage_id` check |

### Medium Priority
| Task | Notes |
|------|-------|
| **Register 27 unregistered content essays** | Essays exist, just not in the registry |
| **Move 36 root PDFs to `library/pdfs/`** | Tantraloka volumes, Nagarjuna, Steiner, etc. at root level |
| **Populate concept → art links** | 76 concepts exist, only 15 link to art |
| **Backfill `ro_passage_id` on existing essays** | 220 content essays, 0 have passage-level traceability |
| **Add E09/E10 validation to validate-essay-pass.py** | Currently only checks P1-P3, not structural essay validation |

### Low Priority (Nice to Have)
| Task | Notes |
|------|-------|
| `synthesis-essays/` → `content/works/` | 146 raw essays in root that should be structured works |
| `blueprints/source_texts/` → `content/works/` | 19 source texts not in the pipeline |
| `essayglobal/` → `content/works/` or archive | ~500 files from old system |
| `tetrahermes*/` → archive | Dead project artifacts |

## Lessons Learned

1. **Hermes writes to CX-Train, not blog** — CLI doesn't inherit workdir. Cron does. Always use cron for autonomous runs.

2. **Gates must be blocking, not advisory** — "validate then retry" doesn't work. "validate → exit code 0/1 → DELETE file on failure → retry" does.

3. **3-pass writing works** — Pass 1 (dump) + Pass 2 (texture) + Pass 3 (arc) with per-pass gates catches real quality issues. NARR and NEG patterns are the most common failures.

4. **Registry prevents duplicates** — `register-essay.py --check` before writing stops Hermes from producing redundant content.

5. **ROs should be single-topic** — ROs mixing traditions (death-systems, laya-daimon, steiner-tantraloka) should be COs or SOs. 5 ROs were dissolved/converted this session.
