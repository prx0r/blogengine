# Publication Notes

Tracking the end-to-end pipeline: acquisition → extraction → essay → audio → deploy.

## Session Context

- **Date:** 2026-07-11
- **Agent:** Hermes (via Hermes Agent / deepseek-v4-flash)
- **Project:** /root/projects/blog/
- **Pipeline:** publication-director skill (6-step)
- **Goal:** Publish multiple essays from available PDFs, all with audio, on Cloudflare

---

## Inventory — Available Source Material

### PDFs in library/ (ready to work with)

| # | Paper | Corpus | Size | Language | Essay Status |
|---|-------|--------|------|----------|--------------|
| 1 | Ñāṇananda — *Concept and Reality in Early Buddhist Thought* | nanananda | 36 MB | English | ❌ None |
| 2 | Corbin — *Temple and Contemplation* | corbin | 6.9 MB | English | ❌ None |
| 3 | Ficino — *O Daemon Socrático de Ficino* (Portuguese) | ficino | ? | Portuguese | ❌ None |
| 4 | Corbin — *History of Islamic Philosophy* Part 1 | corbin | ? | English | ❌ None |
| 5 | Corbin — *History of Islamic Philosophy* Part 2 | corbin | ? | English | ❌ None |
| 6 | Kiosoglou — *Marsilio Ficino and the Soul* | ficino | ? | English | ❌ None |

### Work JSONs without PDFs (stubs — paywalled)

- Corrias — *From Daemonic Reason to Daemonic Imagination* (T&F, closed)
- Garner — *The Imaginal World* (Chicago, closed)
- Shariat — *Henry Corbin and the Imaginal* (Sage, closed)
- Wolfson — *Mundus Imaginalis and the Test of the Veil* (Springer, closed)
- Evans — *Ñāṇananda's Concept and Reality: An Assessment* (Equinox, closed)
- Dhammadinnā — *Reply to Stephen Evans* (Equinox, closed)

These are recorded as `access_status: paywalled_or_request_only` — no acquisition attempted.

### Already published essays (not needing rework)

- Corbin *Mundus Imaginalis* → `mundus_handcrafted_v6.json` (essay + audio exist)
- Corbin *Imagination and the Mundus Imaginalis* (Spring 2007) — the same essay, used above

---

## Pipeline Order (Revised)

Ñāṇananda skipped — only scanned copy exists, no text layer, no alternative OA source found.

Revised order:

1. **Corbin — Temple and Contemplation** ✅ Text extracted (15,980 lines)
   - Why first: Clean extraction, rich content, expands existing Corbin essays
   - Core hook: Temple as imaginal space, visionary geography, inner senses
   
2. **Corbin — History of Islamic Philosophy** (Part 1 → Part 2)
   - Massive work, may need 2 essays
   
3. **Kiosoglou — Marsilio Ficino and the Soul**
   - Renaissance psychology, soul's vehicle, fits Ficino corpus

4. **Ficino daemon Socratico** (Portuguese)
   - Requires translation, last in queue

---

## Infrastructure Checks

- [ ] Audio generation script works (`scripts/generate-audio.mjs`)
- [ ] Edge TTS fallback available
- [ ] Build pipeline works (`npm run cf:build`)
- [ ] Deploy works (`npm run cf:deploy`)
- [ ] Site accessible at re-rendering-atlas.tradesprior.workers.dev

---

## Known Risks

1. **Audio generation failure** — Kokoro often OOMs on this hardware (4GB RAM). Fallback: `--model edge-tts`
2. **Build failure** — TypeScript errors, missing imports. Fix with `npx tsc --noEmit` first
3. **Deploy timeout** — Cloudflare Workers free tier has CPU limits. Complex builds may timeout
4. **RAM constraints** — 4 GB total. No parallel operations. Sequential only
5. **PDF extraction quality** — pdftotext may produce messy output from scanned/photocopied books
6. **Portuguese paper** — needs translation assistance for extraction

---

## 🚨 Critical Distinction: Two Separate Skills

There are TWO different pipelines. They are now separate skills:

### Type A: `/write-and-publish` (Hermes Essay)
- You write original essay text from source passages
- Uses `kind: "ai"` (your commentary) + `kind: "source"` (author's words) + `kind: "summary"`
- 60/25/10 ratio: 60% source text, 25% framing, 15% analysis
- Dual-voice audio: female (commentary) + male (quotes)
- Example: `corbin_imago_templi_v6.json`

### Type B: `/publish-paper` (Straight Publication)
- Take an existing scholarly paper's text
- Format as JSON — ALL blocks are `kind: "source"` (the paper's own words)
- Single-voice audio: male voice reads the entire paper
- Deploy to Cloudflare
- NO writing, NO commentary, NO interpretation

### Which skill to use
| User says | Use |
|---|---|
| "Write an essay about X" | `/write-and-publish` (Type A) |
| "Publish this paper" | `/publish-paper` (Type B) |
| "Add X to the collection with audio" | `/publish-paper` (Type B) |
| "Write something original on X" | `/write-and-publish` (Type A) |

These were stated explicitly during the pipeline and must not be violated:

1. **No OCR ever.** If a PDF has no extractable text layer, do NOT run OCR on it. Skip or find a text-based version.
2. **Find a better source instead.** If the acquired PDF is a scan (no text), search for a proper text-based PDF from a different source.
3. **Document all decisions, failures, and process notes** to this file as you go.

## PDF Extractability Status

| Source | Size | Text Extractable? | Notes |
|--------|------|-------------------|-------|
| Ñāṇananda — *Concept and Reality* | 36 MB | ❌ Scanned (Adobe Acrobat 7.1 Image Conversion) | Need text-based version |
| Corbin — *Temple and Contemplation* | 6.9 MB | ✅ 15,980 lines, ~1 MB text | Clean extraction |
| Corbin — *History of Islamic Philosophy* Pt 1 | 128 KB | ✅ 1,063 lines (some XRef errors but readable) | |
| Corbin — *History of Islamic Philosophy* Pt 2 | 703 KB | ✅ 5,659 lines | Clean extraction |
| Kiosoglou — *Ficino and the Soul* | 327 KB | ✅ 857 lines | Clean extraction |
| Ficino — *Daemon Socratico* (Portuguese) | 753 KB | ✅ 1,036 lines | Portuguese text, English title |

## Failures

### Ñāṇananda PDF — Scanned, No Text Layer
- Downloaded from `ahandfulofleaves.files.wordpress.com` — the only freely available copy
- Created by "Adobe Acrobat 7.1 Image Conversion Plug-in" — scanned images only
- pdftotext, pdfminer all return only form-feed characters (165 bytes, one per page)
- OpenAlex search: 3 results, all closed (Philosophy East and West review, Open Library entry, BPS ebook — none OA)
- BPS website returns 404 for search
- Archive.org: 0 results
- **Decision:** Skipped. No text-based OA copy exists. Only scanned version available.
- **Lesson:** The Ñāṇananda work JSON should have `access_status: scanned_only` or similar. The acquisition script recorded it as `open`/`bronze` which was misleading — the URL worked but produced a scan, not a usable PDF.

---

## Session Log

### 2026-07-11 — Mass Publication Run (Autonomous)

**Objective:** Publish every relevant PDF in the library as a Type B essay.

**Results:**

| Batch | PDFs | Format | Status |
|-------|------|--------|--------|
| Curated dirs (corbin, ficino, voss, shaw, etc.) | 19 | JSON + Audio (10 with audio, 3 oversized excluded) | ✅ Live |
| HAL/Zenodo relevant | 10 | JSON only (no audio) | ✅ Live |
| OA relevant | 20 | JSON only (no audio) | ✅ Live |
| **Total new essays** | **49** | | |
| **Running total** | **135 essays** | | **Live** |

**Infrastructure issues:**
- **Cloudflare 25 MB asset limit** — 3 audio files exceed this (hakayal 40 MB, theurgic-shape 38 MB, music-and-magic 28 MB), plus ficino-letters (292 blocks, will be huge). Solution: host on R2 bucket (`atlas-sources`) and reference via URL instead of asset upload.
- **GitHub 100 MB file limit** — 2 oversized PDFs blocked push. Removed from tracking (work JSONs preserved).
- **Text cleaning** — v2 cleaner written that handles OCR artifacts more aggressively. Used for oa/ batch.
- **ficino-letters audio** — started at ~15:06, still running at 132/292 blocks as of ~15:50. Will finish after session.

**What's left:**
- Ficino letters audio → deploy via R2
- Oversized audio files → move to R2
- Acquisition search results → process new papers found
- Remaining oa/ PDFs that are borderline relevance

**Source:** Temple and Contemplation, Chapter 5 (lines 12900-13400 of extracted text)
**Essay ID:** `corbin_imago_templi_v6`
**Process:**
1. ✅ Extracted text from PDF (pdftotext — 15,980 lines clean)
2. ✅ Identified Chapter 5 as richest for standalone essay
3. ✅ Extracted 8 passage packs covering: destruction/rebuilding dialectic, Angel's reply, imaginal world, active imagination vs passive, tautegorical symbols, world as crypt, three modes of seeing, discontinuous time, keys of the Temple
4. ✅ Wrote 24-block essay (13 ai + 10 source + 1 summary) in 60/25/15 ratio
5. ✅ Created concept `imago_templi` linked to essay
6. ❌ Ñāṇananda skipped (scanned PDF, no text layer, no alternative OA source found)
|7. ✅ Audio generated — 11:20 min, 2660 KB, dual-voice (RyanNeural source, AriaNeural commentary)
|8. ✅ Cloudflare build — succeeded
|9. ✅ Cloudflare deploy — **LIVE at https://re-rendering-atlas.tradesprior.workers.dev/essay/corbin_imago_templi_v6**

✅ **Full pipeline completed for Essay 1.**

**Flaws noted during process:**
- Ñāṇananda PDF was scanned (no text layer) — no alternative OA source found. **Lesson:** acquisition script needs a "text layer present" validation step. The URL returned a valid PDF but it was unusable for extraction.
- OCR artifacts in Corbin PDF (spaces within words like "c entre", "T he") — had to manually clean each source passage
- `cf:deploy` includes the build step, causing unnecessary rebuild. Better: run `cf:build` then `opennextjs-cloudflare deploy` separately
- 4 GB RAM makes builds slow (~60s for Next.js build, ~30s for OpenNext bundle)

**Hardware note:** Audio generation uses `edge-tts` (not Kokoro), so no OOM risk on 4GB RAM. Script found at `scripts/generate-audio.mjs`.

- Publication director skill loaded
- Inventory completed: 6 PDFs available, 6 paywalled stubs
- Publication notes created
- Starting with Ñāṇananda — *Concept and Reality in Early Buddhist Thought*

---

### 2026-07-11 — Type B: Corbin — The Imago Templi (Straight Publication)

**What happened:**
- The Hermes essay (`corbin_imago_templi_v6`) was Type A — I wrote it, interleaving my commentary with Corbin's passages
- The user clarified they wanted Type B — just the paper's own text, no commentary, with audio
- Extracted 11 pure-Corbin source passages (6,468 chars) from the same chapter
- Created `corbin_imago_templi_type_b.json` — all blocks `kind: "source"`, no `ai` or `summary`
- Audio will use en-GB-RyanNeural (British male) for all blocks

**The two essay types formalised:**
| Type | Name | Who writes? | Voice(s) | Example |
|------|------|-------------|----------|---------|
| A | Hermes Essay | I write from source passages | Dual (Aria + Ryan) | `corbin_imago_templi_v6` |
| B | Straight Publication | Author's text only, stored as-is | Single (Ryan — author voice) | `corbin_imago_templi_type_b` |

**Pipeline:** ✅ Type B JSON written → ✅ Audio generated (6:08 min, 1.4 MB, single voice RyanNeural) → ✅ Deployed LIVE at https://re-rendering-atlas.tradesprior.workers.dev/essay/corbin_imago_templi_type_b

### 2026-07-11 — Gateway Restart Recovery

Session interrupted by gateway restart mid-build. Recovery steps:
- Verified git commits intact (Type A `defc704` + Type B `1e06691` + skill reorg `8e5cd3d`)
- Audio file already existed (1.4 MB)
- Re-ran `npm run cf:build` → `npx opennextjs-cloudflare deploy`
- Both Type A and Type B essays now live and verified
- Publication notes were moved to `hermes/notes/` during reorg

**Lesson:** Builds don't survive gateway restarts. Git commits are ground truth. Always commit before deploying.
