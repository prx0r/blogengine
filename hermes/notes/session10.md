# Session 10 — July 12, 2026

## Summary
Essay page redesign, OCR pipeline, tradition organization, book formatting, R2 storage migration, and Cloudflare infrastructure setup.

## Key Changes

### 1. Essays Page Redesign
- **4 tradition cards** (Sufism, Platonism, Occult, Other) on main `/essays` page — large gradient cards with icons
- **Tradition sub-pages** (`/essays/sufism`, `/essays/platonism`, etc.) with author grid (3 columns)
- Authors sorted by essay count descending
- Click author card to see essay titles, click essay to read

### 2. Premium Essay Design
- Sufism essays: stone-50 background, white cards, serif font (EB Garamond)
- Green left border removed from source blocks (wider text area)
- Section headers with `◆` markers, chapter navigation table of contents
- Prayer formatting: italic, accent color, extra spacing
- Reading progress bar at top
- Scroll position saves to `localStorage("essay-progress")` per essay
- "Continue Reading" section on essays page shows last 5 mid-way essays

### 3. Type System
- **`publication`** (Type B): pure source text, all `source` blocks, single male voice
- **`condensed_source`** (Type A): Hermes commentary mixed with source, alternating male/female voice
- `TRADITION_MAP` in `essays.ts` assigns every essay to a tradition
- Goethe/Steiner/Jung/Hillman/Blake moved to "Other" (user request)

### 4. Corbin Publication Essays (new)
- `mundus-imaginalis-corbin` — Clean text (66K chars), Corbin's actual essay
- `man-of-light-in-iranian-sufism` — 656 blocks, Corbin's book (garbled front matter trimmed)
- Both `type: "publication"`, no Hermes commentary

### 5. Greg Shaw Essays (added)
- 3 additional essays rescued from `t2-` prefix filtering:
  - `demon-est-deus-inversus-honoring-the-dae`
  - `containing-ecstasy-the-strategies-of-iam`
  - `eros-and-arithmos`

### 6. R2 Storage Migration
- Bucket `atlas-sources` made publicly accessible at `pub-8f77709efb2043fbbd8e88677347249a.r2.dev`
- All 102 audio files uploaded to R2 (`audio/`)
- All source PDFs uploaded to R2 (`sources/{tradition}/{topic}/`)
- Sufism-related PDFs in `pdfs/` directory
- `generate-audio.mjs` now uploads to R2 and sets `audioUrl` to R2 public URL

### 7. Book Format Pipeline
- `hermes/notes/bookformat.md` — defines gold standard for formatting full-book OCR essays
- Chapter headings with `◆` markers for navigation
- Remove notes/bibliography/index from readable content
- Arabic line filtering at raw OCR level

### 8. 2011 Suhrawardi Realm of the Imaginal
- Added to Sufism TRADITION_MAP
- Publication type, author Roxanne D. Marcotte

## API Token Security
**CRITICAL: The Cloudflare API token was invalidated during this session.**

Root cause: The token `cfat_...` was stored in `cloudflare.md` which, while not committed to git, was:
1. Present in a git-tracked working directory
2. Used in shell commands visible in process lists and shell history
3. GitHub secret scanning detected it via the `git push` and auto-revoked it

**Rules to prevent recurrence:**
- NEVER store API tokens in files within git repositories (even untracked)
- Use environment variables only: `export CLOUDFLARE_API_TOKEN="..."` in `~/.bashrc` or a `.env` file NOT in the repo
- Use `wrangler login` (OAuth) for wrangler operations — it stores credentials in `~/.wrangler/` outside git
- If a token must be in a file, add that file to `.gitignore` immediately AND run `git rm --cached` if it was ever tracked
- Before pushing, run `git diff --cached` to check for secrets
- Use `gh secret set` for GitHub Actions tokens

## Current State
- 109 essays live (was 89)
- Sufism has 47+ essays (Corbin, Ibn Arabi, Rumi, Suhrawardi, Voss, Chittick)
- Platonism has 30+ essays (Ficino 21, Iamblichus 8, Theurgy 6, Shaw 4)
- Illumination book (bilingual) has embedded Arabic garbage — needs proper OCR or text version
- Man of Light and Avicenna PDFs available but need text layer work
