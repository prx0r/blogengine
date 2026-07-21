# Occult — Distillery Project Documentation

## Overview

Next.js 16 static blog/magickal journal at **https://prx0r.github.io/blogengine/**.  
Repo: `prx0r/blogengine` — GitHub Pages via Actions workflow.

## Quick Start

```bash
npm install                  # install deps
npm run dev                  # local dev server
npm run build:pages          # static export → docs/ for Pages
npm run lint                 # eslint
```

To push & deploy:

```bash
git add -A && git commit -m "message"
git push origin main          # triggers .github/workflows/pages.yml
```

Live: `https://prx0r.github.io/blogengine/`

## AI Integration

DeepSeek v4 Flash is available across the site via `src/lib/ai.ts`.

### Setup

API key in `.env.local` (not committed — `.env*` gitignored):

```
DEEPSEEK_API_KEY=sk-...
```

The key is also stored as a **GitHub Actions secret** (`DEEPSEEK_API_KEY`) for
the build workflow. Update it on GitHub when rotating.

### Usage

```ts
import { ask, chat, streamChat } from "@/lib/ai";

// Simple one-shot
const answer = await ask("Describe the sephirah Kether.");

// Multi-turn with system prompt override
const response = await chat([
  { role: "user", content: "What planet rules Netzach?" },
], {
  system: "You are an Hermetic Qabalah tutor. Be concise.",
  temperature: 0.5,
});

// Streaming (client-side React)
const stream = await streamChat([
  { role: "user", content: "Explain the 22 paths." },
]);
for await (const chunk of stream) {
  console.log(chunk.choices[0]?.delta?.content || "");
}
```

### Client-side usage (browser)

`ai.ts` uses `dangerouslyAllowBrowser: true` so it can run in the browser.
For client-side use, store the key in localStorage:

```ts
localStorage.setItem("deepseek_api_key", "sk-...");
```

Then import from `@/lib/ai` normally. Prefer server-side / build-time calls
when possible to avoid exposing the key.

### Existing server-side usage

`src/app/api/cron/poll/route.ts` already uses DeepSeek v4 Flash to summarize
RSS feed entries. The build workflow passes the secret via env.

## Memory System (Mem0)

Persistent, searchable memory across all site content using **Mem0** (60k ★,
Apache 2.0). Stores user preferences, conversation history, and indexed site
content with semantic search.

### Setup

```bash
# Sign up for a free API key (5 seconds, no email needed):
npx @mem0/cli init --agent --agent-caller opencode

# Or get a key at https://app.mem0.ai
```

Set env var or store in localStorage:

```bash
# .env.local
MEM0_API_KEY=m0-...
MEM0_BASE_URL=https://api.mem0.ai  # optional, for self-hosted
```

### Usage

```ts
import { addMemory, searchMemories, getContext } from "@/lib/memory";

// Store a memory
await addMemory(
  "User prefers dark mode and is studying Hermetic Qabalah",
  "user-alice",
  { source: "chat", tags: ["preference", "qabalah"] },
);

// Search memories
const results = await searchMemories("What does Alice prefer?", "user-alice");

// Get context for an AI prompt
const context = await getContext("Tell me about Tiphareth", "user-alice");
// Returns: "[memory] The user studied Tiphareth as the solar sephirah..."
```

### Client-side (browser)

```ts
localStorage.setItem("mem0_api_key", "m0-...");
```

Then import from `@/lib/memory` normally.

### Content Indexing

All ~50+ content items from the site can be indexed into Mem0 for semantic
retrieval:

```bash
# Preview what will be indexed (no API calls)
npm run index-content -- --dry-run

# Index everything into Mem0
MEM0_API_KEY=m0-... npm run index-content
```

This indexes content from:
- **Elemental Soul Mirror** (`src/lib/data.ts`) — element profiles, archetypes,
  scenes, vows (~15k+ words)
- **Personal Diary** (`src/lib/diary.ts`) — Day 1-6 philosophical entries (~8.5k words)
- **Tree of Life** (`src/lib/tree-of-life.ts`) — 10 sephiroth + 22 paths with
  correspondences (~3k words)
- **Scrying Guide** (`src/app/rituals/scrying/page.tsx`) — comprehensive 15k-word
  tutorial
- **LBRP** (`src/app/rituals/lbrp/page.tsx`) — full ritual instructions (~4k words)
- **Kabbalistic Cross** (`src/app/rituals/kabbalistic-cross/page.tsx`)
- **Ajahn Lee Method 1** (`src/app/meditation/ajahn-lee-method-1/page.tsx`)
- **Notes system** (`src/lib/journal.ts`) — user-generated notes by tag
- **Gateway Tapes** (`src/lib/gateway.ts`)
- **Birth charts** (`birth-charts-v1` in localStorage)

Each content item is stored with metadata (source, tags, title) for filtered
retrieval.

### Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────┐
│  Next.js Site   │────▶│  src/lib/memory.ts│────▶│  Mem0 Cloud  │
│  (static page)  │     │  (TS SDK wrapper) │     │  or Docker   │
└─────────────────┘     └──────────────────┘     └──────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │  src/lib/ai.ts   │
                        │  (DeepSeek for   │
                        │   summarization) │
                        └──────────────────┘
```

- **Browser** → talks to Mem0 API directly via the TS SDK
- **Build time** → `scripts/index-content.mjs` crawls all source files and
  pushes content to Mem0
- **AI integration** → DeepSeek v4 Flash summarizes + processes memories
  via `summarizeAndStore()`

## Architecture

### Static export

The site runs as a **static export** on GitHub Pages. The build script
(`scripts/build.mjs`) temporarily disables server-only paths (API routes,
middleware, DB) before running `next build` with `GITHUB_PAGES=true`, then
copies `out/` → `docs/` and restores the disabled paths.

### Key directories

```
src/
├── app/                          # Next.js App Router pages
│   ├── birth-chart/page.tsx      # Natal chart calculator + wheel
│   ├── elements/                 # Elemental Inventory (Fire, Water, Air, Earth, Spirit)
│   ├── gateway/                  # Gateway Tapes pages
│   ├── journal/page.tsx          # Journal with notes from all sections
│   ├── meditation/               # Meditation practices
│   ├── personal/                 # Personal diary entries (Day 1-6)
│   ├── rituals/                  # Rituals (Kabbalistic Cross, LBRP, Scrying)
│   ├── tree-of-life/page.tsx     # Interactive Tree of Life SVG
│   └── layout.tsx                # Root layout with Sidebar
├── components/                   # React components
│   ├── sidebar.tsx               # Main navigation sidebar
│   ├── TreeOfLifeSVG.tsx         # SVG Tree of Life renderer
│   └── SephirahPanel.tsx         # Sephirah detail + notes panel
├── lib/                          # Data & utilities
│   ├── ai.ts                     # DeepSeek v4 Flash client
│   ├── data.ts                   # Element data
│   ├── diary.ts                  # Personal diary entries
│   ├── gateway.ts                # Gateway Tapes entries
│   ├── journal.ts                # Notes system (localStorage)
│   ├── memory.ts                 # Mem0 memory system wrapper
│   ├── tree-of-life.ts           # Sephiroth + Paths data
│   └── types.ts                  # Shared TypeScript types
```

## Pages

| Route | Description | Type |
|---|---|---|
| `/` | Feed — aggregated content | Static |
| `/sources` | RSS source management | Static |
| `/journal` | Notes journal (all tags) | Static (client JS) |
| `/tree-of-life` | Interactive Qabalistic Tree of Life with clickable sephiroth + notes | Static (client JS) |
| `/birth-chart` | Natal chart calculator — enter birth data, see wheel + planets + aspects | Static (client JS) |
| `/elements` | Elemental Inventory (Fire, Water, Air, Earth, Spirit) with soul mirror | Static |
| `/elements/[id]` | Individual element pages with archetypes, scenes, vows | SSG |
| `/rituals` | Ritual library index | Static |
| `/rituals/*` | Individual ritual pages (Kabbalistic Cross, LBRP, Scrying) | Static |
| `/meditation` | Meditation index | Static |
| `/meditation/ajahn-lee-method-1` | Ajahn Lee Method 1 | Static |
| `/personal/day-[1-6]` | Personal diary entries | SSG |
| `/login` | Login page (static shell) | Static |
| `/gateway/*` | Gateway Tapes pages | Static |

## Data Structures

### Tree of Life (`src/lib/tree-of-life.ts`)

10 sephiroth + Da'ath + 22 paths. Each sephirah has:
`name, hebrew, meaning, symbol (alchemical), x, y, pillar, plane, color, divineName, archangel, angelicOrder, planet, magicalImage, description, tag`

Paths correspond to Hebrew letters, Tarot cards, and elements. Each path
connects two sephiroth by number.

### Notes System (`src/lib/journal.ts`)

All notes stored in `localStorage` under key `notes-v1`. Interface:

```ts
interface Note {
  id: string; title: string; date: string;
  body: string; tag: string; tagLabel: string;
  createdAt: string;
}
```

Tags follow the pattern: `rituals/lbrp`, `elements/fire`, `tree-of-life/kether`, etc.
Functions: `getNotesByTag(tag)`, `addNote(title, body, tag, tagLabel)`,
`deleteNote(id)`. Also supports GitHub Gist sync for cross-device backup.

### Birth Chart (`src/app/birth-chart/page.tsx`)

Uses the **caelus** ecosystem (MIT, pure TypeScript):
- `caelus` — ephemeris engine, computes chart from UTC datetime + lat/lon
- `caelus-birth` — local time → UTC conversion with IANA timezone resolution
- `caelus-wheel` — React SVG chart wheel component

Chart computed entirely client-side. No data sent to any server.
Saved charts persist in localStorage under `birth-charts-v1`.

### Elements (`src/lib/data.ts`)

Fire, Water, Air, Earth, Spirit — each with scenes, archetypes,
compound elements, and vows. Used in the Elemental Inventory section.

## Dependencies

Key external packages:
- `next` 16.2.10 — React framework
- `react` 19.2.4
- `caelus` / `caelus-birth` / `caelus-wheel` — astrology engine + chart wheel
- `openai` — DeepSeek API client (OpenAI-compatible)
- `tailwindcss` 4 — styling
- `pg` — Postgres (used in API routes, not in static export)
- `rss-parser` — feed parsing (API routes)
- `cheerio` — HTML parsing (API routes)

## Deployment

The `.github/workflows/pages.yml` workflow:

1. Checks out code, sets up Node 20, installs deps
2. Runs `node scripts/build.mjs`
3. Configure Pages, upload `docs/` as artifact, deploy

The build script temporarily moves server-only paths aside,
builds with `GITHUB_PAGES=true`, copies to `docs/`, then restores.

### Notes

- `.env*` files are gitignored (includes `.env.local`)
- `data/`, `scripts/` directories may contain local development files
- API routes (`src/app/api/`) and DB (`src/lib/db.ts`) are excluded from
  the static Pages build — they work in dev mode
- The site also has `vercel.json` for Vercel cron deployment with API
