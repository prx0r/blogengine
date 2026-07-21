# Hermes Session Notes — 2026-07-11

## Session Overview
Massive publication and acquisition pipeline run. Started with 86 essay JSONs, ended with **267 essay JSONs** (~110 with audio). All deployed to Cloudflare (previous version still live — latest deploy blocked by 10 MB worker code limit).

---

## Two Essay Types — Critical Distinction

### Type A: Hermes Essay (`/write-and-publish`)
- I *write* original essay text from source passages
- Blocks: `kind: "ai"` (my commentary) + `kind: "source"` (author's words) + `kind: "summary"`
- Ratio: 60% source, 25% framing, 15% analysis
- Dual-voice audio: AriaNeural (female, American) for commentary, RyanNeural (male, British) for quotes
- Example: `corbin_imago_templi_v6.json`

### Type B: Straight Publication (`/publish-paper`)
- Take an existing scholarly paper's text as-is
- ALL blocks are `kind: "source"` — NO writing, NO commentary, NO summary
- Single-voice audio: RyanNeural (male, British) reads entire paper
- Example: `t2-henry-angelology-2.json`, `t2-levin-tame.json`

---

## Pipeline State

### What was published (Type B, 49 new essays)
| Batch | Source | Format | Files |
|-------|--------|--------|-------|
| Curated dirs (Corbin, Ficino, Voss, Shaw, etc.) | library/ | JSON + audio | 19 essays |
| HAL/Zenodo relevant (Plethon, Iamblichus, Ibn Arabi, etc.) | HAL search | JSON only | 10 essays |
| OA relevant (astrology, Ficino, Iamblichus, Buddhism, etc.) | OpenAlex OA | JSON only | 20 essays |

### Chunked Ficino Letters
Original: `t2-the-letters-of-marsilio-ficino...json` — 292 blocks, 485K chars, terrible OCR quality
Chunked into: `t2-ficino-part-1` through `t2-ficino-part-9` (32-52 blocks each)
Audio: Parts 1-8 deployed ✅, Part 9 (34 MB) blocked by 25 MB limit

### Michael Levin Papers (14 essays)
All from arXiv. Work JSONs + Type B essay JSONs.
Key papers: TAME, Modeling somatic computation, Closing the Loop on Morphogenesis, Bootstrapping Life-Inspired Machine Intelligence, Causally Emergent Alignment, Oncomorphic neural agents

### Bridge Science Papers (14 papers identified, not downloaded)
Found via PubMed Central search across 5 domains:
1. Spiritus/Interoception (3 papers — Pyasik, Nagai, Gou)
2. Imagination/Mental Imagery (3 papers — Dijkstra, Wadia, Cabbai)
3. Ritual/Theurgy (3 papers — Rai, Khalil, Chung)
4. Daimons/Voices (2 papers — Corona-Hernández, Storchak)
5. Correspondences/Synchronicity (3 papers — Rominger ×2, Parra)
**Status:** All journal publisher PDFs blocked by VPS IP. Need user-assisted download.

### Smart Acquisition Search Results
HAL search across 10 topics found **22 relevant papers** — also VPS blocked for download.
PubMed search for Phase 10 (Imaginal) found ~15 high-signal papers.

---

## Infrastructure Issues

### 1. Cloudflare Workers 10 MB Code Limit ❌
- The OpenNext server bundle (handler.mjs) is 38 MB — exceeds Cloudflare's 10 MB limit
- Previous deploy still live at re-rendering-atlas.tradesprior.workers.dev
- **Cause:** 267+ essay routes inflate the server bundle
- **Options:**
  - Trim noisy arXiv acquisitions (~100 low-quality papers)
  - Switch to static export (GitHub Pages)
  - Upgrade Cloudflare ($5/mo for larger workers)

### 2. Cloudflare Workers 25 MB Asset Limit ❌
4 audio files exceed this:
- `t2-hakayal-al-nur-ny-shihabuddin-yahya-al-suhrawardi.mp3` (40 MB)
- `t2-taking-the-shape-of-the-gods-a-theurgic.mp3` (38 MB)
- `t2-music-and-magic.mp3` (28 MB)
- `t2-ficino-part-9.mp3` (34 MB)
- **Fix:** Host on R2 bucket (`atlas-sources`) and reference from essay JSONs

### 3. VPS IP Blocked by Publishers ❌
The VPS IP is blocked by most journal publishers:
- HAL: Returns HTML at document endpoints
- PMC: Returns HTML instead of PDF
- SAGE, Elsevier, Royal Society, Taylor & Francis: 403 Forbidden
- **Fix:** User-assisted download (send links to Thomas on Telegram)

### 4. Disk Space (38 GB) ❌
- .next/ build cache takes 3.7 GB
- .open-next/ bundle takes 3.7 GB
- library/ PDFs take 834 MB
- **Fix:** Clear caches between builds, keep library lean

### 5. GitHub 100 MB File Limit ❌
- 2 PDFs exceeded this (`library/hal/9b926bc1b705.pdf` 111MB, `library/zenodo/bed2a46a0f2e.pdf` 95MB)
- **Fix:** Removed from tracking, work JSONs preserved

---

## Cron Jobs Created
- `t2-acquisition-heartbeat` — every 10m (REMOVED)
- `t2-acquisition-goal` — every 15m (STILL ACTIVE — check if still needed)

---

## Key File Locations
| File | Path |
|------|------|
| Publication notes | `/root/projects/blog/hermes/notes/publication-notes.md` |
| T2 acquisition log | `/root/projects/blog/hermes/notes/t2-acquisition-log.md` |
| Bridge science papers (full report) | `/root/source_atlas_papers.md` |
| Phase 10 search script | `/root/projects/blog/hermes/scripts/phase10-search.py` |
| Batch publish (v2 with text cleaning) | `/tmp/batch-publish-v2.py` |
| Phase-by-phase arXiv acquisition | `/tmp/t2-acquire-phases.py` |
| Levin paper acquisition | `/tmp/acquire-levin.py` |
| Chunk ficino letters | `/tmp/chunk-ficino.py` |

## Skills Structure
| Skill | Location | Type |
|-------|----------|------|
| publish (Type B) | `/root/.hermes/skills/publish/SKILL.md` | Straight publication |
| acquire | `/root/.hermes/skills/acquire/SKILL.md` | Paper acquisition |
| deploy | `/root/.hermes/skills/deploy/SKILL.md` | Cloudflare deploy |
