# Notes 6 — Distillery App Build Notes

Date: 2026-07-03

## Summary

This session added Gateway Tapes, interactive Tree of Life, Birth Chart calculator, DeepSeek/Mem0 AI integration, Spells chat interface with Picatrix PDFs, and a local proxy server. Deployed to GitHub Pages via Actions workflow.

---

## Gateway Tapes Section

Added a collapsible "Gateway Tapes" section to the sidebar, mirroring the "Personal" pattern.

**Files:**
- `src/lib/gateway.ts` — Tape entries (Orientation, Focus 10, Focus 10 Advance)
- Modified `src/components/sidebar.tsx`

Routes: `/gateway/orientation`, `/gateway/focus-10`, `/gateway/focus-10-advance`

---

## Interactive Tree of Life

Full SVG-based interactive Tree of Life with Hermetic Qabalah correspondences.

**Architecture:**
- Data‑driven: 10 sephiroth + Da'ath + 22 paths defined in `src/lib/tree-of-life.ts`
- Each sephirah: number, name, Hebrew, meaning, symbol (alchemical glyph), x/y, pillar, plane, color, divine name, archangel, angelic order, planet, magical image, description
- Interactive SVG component renders circles at exact geometric positions, 22 path lines connecting them
- Click → side panel shows all correspondences + notes (via existing journal system)
- Hover → highlights connected sephiroth + paths, tooltip with Hebrew letter / Tarot card / element
- Numbers displayed above circles, alchemical symbols inside

**Files:**
- `src/lib/tree-of-life.ts` — Data (10 sephiroth + Da'ath + 22 paths)
- `src/components/TreeOfLifeSVG.tsx` — SVG renderer with hover/click
- `src/components/SephirahPanel.tsx` — Detail + notes panel
- `src/app/tree-of-life/page.tsx` — Wrapper page

**Sidebar:** "Tree of Life" link added under Journal.

---

## Birth Chart Page

Client-side natal chart calculator using the **caelus** ecosystem (pure TypeScript, MIT, no native deps).

**Libraries installed:**
- `caelus` — Ephemeris engine (97 KB gzipped, VSOP87 embedded)
- `caelus-birth` — Local time → UTC with IANA timezone resolution
- `caelus-wheel` — React SVG chart wheel (zodiac, houses, planets, aspect lines)

**Features:**
- Form: Name, birth date (year/month/day), time (hour/minute), lat/lon
- ChartWheel: sign glyphs, house cusps (AC/MC/DC/IC), planet positions with degree labels, ℞ retrograde marks, colored aspect lines
- Planet table: 13 bodies (Sun → Chiron, nodes) with sign, position, house, dignities
- Aspect table: conjunction, sextile, square, trine, opposition with orb and phase
- Saved charts persisted to localStorage (`birth-charts-v1`)
- All computation client-side, no data sent to any server

**Files:**
- `src/app/birth-chart/page.tsx` — Full page with form + chart + grids + save

**Sidebar:** "Birth Chart" link added.

---

## AI Integration

### DeepSeek Client (`src/lib/ai.ts`)

OpenAI-compatible wrapper for DeepSeek V4 Flash, using OpenCode Go endpoint.

Key features:
- Works server-side (env var `DEEPSEEK_API_KEY`) and client-side (localStorage `deepseek_api_key`)
- Exports: `ask()`, `chat()`, `streamChat()`
- Default system prompt: occult scholar persona
- Hardcoded fallback key for OpenCode Go

### Mem0 Memory System (`src/lib/memory.ts`)

Persistent memory layer using **Mem0** (60k ★, Apache 2.0).

**Setup:**
```bash
# Get free API key (5 seconds, no email)
npx @mem0/cli init --agent --agent-caller opencode
```

**Functions:**
- `addMemory(text, userId, metadata)` — store
- `searchMemories(query, userId, topK)` — semantic search
- `getContext(query, userId)` — formatted context for AI prompts
- `summarizeAndStore(text, userId, metadata)` — DeepSeek-summarizes then stores

**Content Indexer** (`scripts/index-content.mjs`):
- Crawls all site content (data.ts, diary.ts, tree-of-life.ts, ritual pages, meditation guide)
- ~50 content items extracted with tags and metadata
- Dry run: `npm run index-content -- --dry-run`
- Run: `MEM0_API_KEY=m0-... npm run index-content`
- Can be integrated into build pipeline

---

## Spells Page (Picatrix Chat)

Chat interface with the Picatrix (Liber Atratus, Books I–IV, tr. Greer & Warnock).

### Architecture

```
PDFs → pdftotext → chunk by chapter → JSON (59 chunks) → browser
```

- Two PDFs (~3.2 MB total) extracted at build time via `scripts/extract-picatrix.mjs`
- 59 structured chunks stored in `src/data/picatrix.json`
- Keyword search with synonym expansion (money → wealth, gold, fortune, etc.) finds top 3 relevant chunks
- DeepSeek V4 Flash reformats into structured output

### Data Format

```json
{
  "book": 3,
  "chapter": 7,
  "title": "Chapter Seven Attracting the virtues of the planets",
  "content": "..."
}
```

### Synonym Categories

| Category | Trigger words |
|---|---|
| money | money, wealth, riches, fortune, gold, treasure, gain, affluence |
| love | love, desire, lust, attraction, affection, beauty, romance, marriage, sex |
| protection | protection, defense, shield, safety, guard, ward, banish, bind |
| health | health, heal, cure, sickness, disease, body, medicine, life |
| wisdom | wisdom, knowledge, truth, vision, insight, prophecy, dream, divination |
| power | power, strength, authority, victory, honor, glory, dominion, influence |

### Prompt Format

Each response structured with:
- **Spell Name**
- **Desired Outcome**
- **Source** (Book + Chapter)
- **Planet & Astrological Timing**
- **Materials Needed**
- **Procedure** (step-by-step)
- **Incantation / Prayer**
- **Warnings**

### Output Formatting

The response is rendered with bold labels and clean spacing via the `renderMessage()` function which parses `**Label** content` pairs.

### API Notes

DeepSeek V4 Flash uses extensive reasoning (chain-of-thought). To get usable output:
- `max_tokens: 8192` — allows ~3000 reasoning + ~5000 content tokens
- Prompt includes "Answer directly" to suppress visible reasoning
- `temperature: 0.2` for consistent, factual output
- Context trimmed to top 3 chunks × 1000 chars each

---

## Proxy Server

Since the OpenCode Go API doesn't set CORS headers, browser requests are blocked. Two solutions:

### Option 1: Local Proxy (Hetzner)

```bash
# On your server
PORT=3456 npm run proxy

# In browser on Spells page:
localStorage.setItem("proxy_url", "http://YOUR_IP:3456/api/chat")
```

**File:** `server/proxy.mjs`
- Tiny Node.js HTTP server
- Adds CORS headers (`Access-Control-Allow-Origin: *`)
- Forwards POST to OpenCode Go API
- Configurable port via `PORT` env var
- Configurable origin via `ORIGIN` env var

### Option 2: Vercel Deployment

```bash
npx vercel --prod
```

The `/api/chat` route (`src/app/api/chat/route.ts`) works on Vercel as a serverless function, proxying to OpenCode Go. Same origin = no CORS issue.

### Fallback Order

The Spells page tries endpoints in order:
1. Custom proxy URL (from `localStorage.proxy_url`)
2. `/api/chat` (Vercel)
3. Error with deploy instructions

---

## API Key

Using OpenCode Go API key (NOT a direct DeepSeek key):

```
sk-7dtUVBKJrJcglO9WzdLQZJXwNuz1MucUrDQCZxJjJaH29Q8CqT357DSeFyHV4B75
```

**Endpoint:** `https://opencode.ai/zen/go/v1/chat/completions`
**Model:** `deepseek-v4-flash`

The key is hardcoded as fallback in:
- `src/lib/ai.ts` — `HARDCODED_KEY`
- `src/app/spells/page.tsx` — initial state
- `src/app/api/chat/route.ts` — proxy key
- `server/proxy.mjs` — proxy key

Hardcoded in a static site = exposed in page source. User was aware.

---

## Deployment

### GitHub Pages (static)

```bash
git push origin main
```

Triggers `.github/workflows/pages.yml`:
1. Install poppler-utils (for PDF extraction)
2. `npm install --legacy-peer-deps`
3. `node scripts/build.mjs`
   - Extract Picatrix PDFs → JSON chunks
   - Disable server-only paths
   - `next build` with `GITHUB_PAGES=true`
   - Copy `out/` → `docs/`
   - Restore server paths

### Vercel (API proxy)

```bash
npx vercel --prod
```

The `next.config.ts` conditionally sets `output: "export"` only when `GITHUB_PAGES=true`. On Vercel, the full Next.js server runs including API routes.

**`vercel.json`:** Uses `npm install --legacy-peer-deps` for install command.

---

## Files Changed

### New Files
| File | Purpose |
|---|---|
| `src/lib/gateway.ts` | Gateway Tapes data |
| `src/lib/tree-of-life.ts` | Sephiroth + Paths data |
| `src/lib/ai.ts` | DeepSeek client |
| `src/lib/memory.ts` | Mem0 memory wrapper |
| `src/components/TreeOfLifeSVG.tsx` | SVG tree renderer |
| `src/components/SephirahPanel.tsx` | Sephiroth detail panel |
| `src/app/tree-of-life/page.tsx` | Tree of Life page |
| `src/app/birth-chart/page.tsx` | Birth chart calculator |
| `src/app/spells/page.tsx` | Picatrix chat interface |
| `src/app/api/chat/route.ts` | Vercel API proxy |
| `src/data/picatrix.json` | Extracted spell chunks (59) |
| `scripts/extract-picatrix.mjs` | PDF extraction script |
| `scripts/index-content.mjs` | Mem0 content indexer |
| `server/proxy.mjs` | Local CORS proxy |
| `occult.md` | Project documentation |
| `deploy.md` | Deployment instructions |

### Modified Files
| File | Changes |
|---|---|
| `src/components/sidebar.tsx` | Added Gateway Tapes, Tree of Life, Birth Chart, Spells links |
| `src/lib/journal.ts` | Added tree-of-life/* tags |
| `next.config.ts` | Conditional static export for GitHub Pages |
| `package.json` | Scripts: build:pages, index-content, extract-picatrix, proxy |
| `.github/workflows/pages.yml` | Install poppler-utils, `--legacy-peer-deps`, Node 24 force |
| `vercel.json` | Install command override |
| `scripts/build.mjs` | Picatrix extraction step |
| `.gitignore` | Picatrix PDF files excluded |

### Lint Notes

Pre-existing lint errors in restored API route files (`entry/[id]/page.tsx`, `page.tsx`, `sources/page.tsx`) — React 19 `set-state-in-effect` warnings. These are in files restored from the remote during rebase. The notes4.md documents the same issue; fix with `window.setTimeout(..., 0)` wrappers.

### GitHub Pages Deploy Notes

The `actions/deploy-pages@v4` step has intermittent failures ("Deployment failed, try again later"). Rerunning the workflow usually resolves it. The `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true` env var is set in the workflow.
