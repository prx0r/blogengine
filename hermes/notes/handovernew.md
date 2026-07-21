# Handover — 2026-07-12 Session

## What Happened This Session
Full essay page redesign, R2 storage migration, book OCR pipeline, tradition organization. See:
- **`hermes/notes/session10.md`** — comprehensive session notes
- **`hermes/notes/bookformat.md`** — book formatting gold standard

## Key Changes
- **Essays page redesigned** — 4 tradition cards (Sufism, Platonism, Occult, Other) with author grid, continue-reading, scroll progress
- **R2 storage live** — all 102 audio files + all source PDFs migrated from `public/` to R2 bucket `atlas-sources`
- **109 essays** curated (was 89) — added Corbin publication essays, Greg Shaw papers
- **Type system formalised** — `publication` (Type B, pure source, male voice) vs `condensed_source` (Type A, Hermes commentary, alternating voices)
- **Premium design** — stone-50 backgrounds, EB Garamond serif, chapter navigation, prayer formatting
- **Book format standard** — `hermes/notes/bookformat.md` defines rules for OCR'd book essays
- **Scroll position saving** — `localStorage("essay-progress")`, "Continue Reading" on essays page

## Critical Issues
1. **Cloudflare API token invalidated** — token leaked via git push (GitHub secret scanning). Generate new token at dash.cloudflare.com > API Tokens. Add to .gitignore immediately.
2. **Illumination book** — bilingual (English+Arabic) PDF, embedded Arabic garbage in OCR text. Needs proper OCR or text-based version.
3. **Disk space** — 38 GB fills up during builds. Remove generated `audio/` files from `public/` after R2 upload.
4. **Audio generation** — only `mundus-imaginalis-corbin` and `suhrawardi_s_creed_of_the_sages` still need audio. Run `node scripts/generate-audio.mjs <id>` after getting new Cloudflare token.

## Files Referenced
- `hermes/notes/session10.md` — full session documentation
- `hermes/notes/bookformat.md` — book essay formatting standard
- `scripts/clean-essays.mjs` — OCR cleanup and validation
- `scripts/upload-to-r2.mjs` — R2 batch upload
- `src/lib/essays.ts` — TRADITION_MAP and essay library
- `src/app/essays/page.tsx` — redesigned essays landing
- `src/app/essays/[tradition]/page.tsx` — tradition sub-pages
- `src/app/essay/[slug]/page.tsx` — premium essay reader with scroll saver

---

# Handover — 2026-07-11 Session

## What Happened This Session
Major publication and acquisition pipeline run. See full documentation at:
**`hermes/notes/hermesnotes.md`** — comprehensive session notes with counts, infrastructure issues, file locations, and pipeline status.

## Key Changes
- **267 essay JSONs** (was 86) — ~110 with audio
- **Two essay types formalised:** Type A (Hermes Essay, I write) vs Type B (Straight Publication, author's text only)
- **14 Michael Levin papers** acquired from arXiv
- **Ficino Letters chunked** into 9 parts with audio
- **Pipeline scripts created:** phase10-search.py, batch-publish-v2.py, t2-acquire-phases.py, acquire-levin.py, chunk-ficino.py
- **Bridge science search** across 5 domains found 14 papers from PubMed

## Critical Issues (Unresolved)
1. **Cloudflare 10 MB code limit** hit — last deploy blocked. Previous version still live.
2. **Cloudflare 25 MB asset limit** — 4 audio files blocked
3. **VPS IP blocked** by journal publishers — can't download most journal PDFs
4. **Disk space** — 38 GB fills up during builds
5. **Cron job** `t2-acquisition-goal` still active — check if needed

## Files Referenced From This Session
- `hermes/notes/publication-notes.md` — pipeline tracking
- `hermes/notes/t2-acquisition-log.md` — acquisition progress
- `hermes/notes/hermesnotes.md` — comprehensive session notes
- `/root/source_atlas_papers.md` — 14 bridge science paper reviews
