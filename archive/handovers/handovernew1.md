# Handover — Session 2026-07-13

**Prerequisite:** Read `handovernew.md` first for project orientation.
Then read `visionguide.md` for the full architecture.
This doc covers only what was built this session.

## Key Documents Created This Session

| Document | Location | What it is |
|----------|----------|-----------|
| `handovernew.md` | root | Original project orientation (read this first) |
| `visionguide.md` | root | Updated with daimon session notes + next steps |
| `daimonhandover.md` | `content/sources/occult/daimon/` | Essay on daimon contact theory (all traditions synthesized) |
| `practice-path.md` | `content/sources/occult/daimon/` | The middle path — Liber 8 + Invoking Pentagrams + LVJK |
| `daimoncontact.md` | `content/sources/occult/daimon/` | Full cross-tradition synthesis (15 sections) |
| `books-to-get.md` | `content/sources/occult/daimon/` | Texts to source |
| `content/research-objects/` | `ro-daimon-*` (14 ROs) | All daimon research objects |
| `content/sources/` | tradition folders | Organized source materials across 12 traditions |
| `/daimon` page | `src/app/daimon/page.tsx` | Live at workers.dev/daimon |

## Daimon Contact System (Complete)

- Created `content/sources/` tradition-based organization:
  - `platonism/` (neoplatonism/theurgy/proclus, ficino, orphic, chaldean, dionysius)
  - `sufism/` (illuminationist, ibn-arabi, rumi)
  - `occult/` (daimon, grimoires, scrying, alchemy)
  - `astrology/` (hellenistic, classical, renaissance)
  - `hermetica/`
  - `modern/` (steiner, jung)
  - `science/` (neuroscience)
  - `tantra/` (classical)
  - `tools/` (spreadsheets)
- `daimoncontact.md` — 12-section synthesis of Abramelin, Liber Samekh, Frater Acher, Corbin, Proclus, Plotinus, Psellus
- Daimon name calculator wired into birth chart page (Agrippa method)
- `/synth` skill updated to search content/sources/ with pdftotext for PDFs

## Alchemy Website Archive

- 147 spiritual/hermetic/Rosicrucian texts downloaded from alchemywebsite.com
- 430 images with metadata (320 emblems + 110 site images)
- Pipeline scripts saved for re-download

## Code Changes

- **Birth chart page**: 
  - Daimon name calculation (Agrippa Genius Name) with 5 hylegical places + divine suffix
  - Analysis now shows thinking trace with activity steps (Pass 1 → Pass 2)
  - Auto-saves to localStorage (survives page reload)
  - Fixed Math.round → Math.floor for letter indexing
- **API route** (`/api/chat`): Fixed reasoning_content → content mapping for model responses
- **Build script** (`generate-graph-json.mjs`): Graceful handling of missing content/essays dir

## Cloudflare Deploy Issue

The Cloudflare deploy (`npm run cf:deploy`) fails on this VPS due to disk space:
- OpenNext's `copyTracedFiles` copies the entire project into the bundle
- Project has ~2.4GB of reference PDFs (library/, source-texts/)
- VPS is 38GB, not enough room for source + build simultaneously

**Workaround:** 
```bash
mv library /tmp/ && mv source-texts /tmp/ && npm run cf:deploy && mv /tmp/library ./ && mv /tmp/source-texts ./
```

**Proper fix:** GitHub Actions workflow at `.github/workflows/cloudflare.yml` — builds on GitHub servers. Needs `CLOUDFLARE_API_TOKEN` as a GitHub secret (already set). There's a remaining build issue with `pg` module and API routes — the build needs to either install `pg` or handle the server-only paths like `build.mjs` does.

## Cloudflare Deploy — What Finally Worked

The Cloudflare build (`npm run cf:deploy`) kept failing for two reasons:

1. **Disk space.** OpenNext's `copyTracedFiles` copies the entire project into the bundle.
   Fix: `mv library /tmp/ && mv source-texts /tmp/ && mv content/sources /tmp/` before building,
   then restore after. Frees ~3GB.

2. **Broken essay JSONs.** The essay page (`/essay/[slug]`) has `generateStaticParams()` that reads
   from `content/glossary/essays/`. 26 essays were missing the `id` field, and some had null fields
   that crashed `startsWith()` during prerendering. 
   Fix: Remove `generateStaticParams()` entirely — Cloudflare Workers handles dynamic routes natively.
   GitHub Pages isn't used, so static generation isn't needed.

3. **Client-side only code in `useEffect`.** The `/daimon` page accessed `localStorage` directly in
   JSX (not in useEffect). This crashed the SSR/prerender step. 
   Fix: Guard all `localStorage` calls with `typeof window !== 'undefined'` or move them into
   `useEffect`. The `day` state variable was also missing from the component — was accidentally
   deleted during edits.

**Current state:** Daimon page live at `/daimon`. All broken essays re-enabled (need fixing later).
Library/source-texts/sources restored locally. The GitHub Actions workflow still needs the
CLOUDFLARE_API_TOKEN secret (already set) and doesn't remove heavy dirs before building —
the CI build will likely fail on GitHub runners for the same disk space reason until the workflow
is updated to `rm -rf library source-texts content/sources` before building.

## Reading Order for Next Agent

1. `handovernew.md` — project orientation (10 min)
2. `visionguide.md` — full architecture + daimon section at end (20 min)
3. `handovernew1.md` — this session's work (10 min)
4. `daimonhandover.md` — daimon contact theory essay (15 min)
5. `content/sources/occult/daimon/practice-path.md` — the middle path (5 min)
6. `content/research-objects/ro-daimon-guidance/` — meta-RO with scholarly appendix (10 min)
7. `content/sources/occult/daimon/daimoncontact.md` — full 15-section synthesis (30 min)

## Key Files Not Yet Referenced in visionguide.md

- `content/sources/occult/daimon/daimonhandover.md` — extensive expertise essay
- `content/sources/occult/daimon/books-to-get.md` — texts still to source
- `content/sources/occult/daimon/spells/calculating-your-daimon-name.md` — Agrippa method
- `content/sources/occult/daimon/spells/agathos-daimon-liturgy.md` — full ritual
- `content/research-objects/ro-path-*/` — 6 path ROs (abramelin, samekh, liber8, acher, pgm, reddit)

## Other Findings

- The `/api/chat` route (server-side) only works on Cloudflare Workers, NOT on GitHub Pages static export
- GitHub Pages: analysis button shows but API calls fail silently
- Cloudflare: analysis works if the build succeeds
- All files in `content/sources/` are reference/organization only — NOT part of the site build
