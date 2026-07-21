# Session Log — Audio, Glossary, Cloudflare Fixes

## Kokoro → Edge-TTS

Kokoro Docker container kept OOM-crashing (exit 137) during long essay generation because the CPU model consumed too much memory per request. Replaced with `edge-tts` — a Python CLI that calls Microsoft Edge's free online TTS API. No Docker, no GPU, no server process. Zero CPU/memory load on the host.

**Script:** `scripts/generate-audio.mjs`

Usage: `npm run generate:audio -- <essay-id>`

Voice default set via `EDGE_TTS_VOICE` env var. Current: `en-US-AriaNeural`.

Voices used so far:
- `en-IE-EmilyNeural` — Irish female (user didn't like it)
- `en-GB-RyanNeural` — British male (user didn't specify preference)
- `en-US-AriaNeural` — American female (current, preferred by user)

## Global Audio Player

Added persistent audio player at the bottom of every page. Uses React context (`src/lib/audio-context.tsx`) so audio keeps playing across navigation. Includes seekable progress bar, time display, play/pause, and close button.

**Components:**
- `src/lib/audio-context.tsx` — AudioProvider + useAudio hook
- `src/components/GlobalPlayer.tsx` — Fixed bottom bar
- `src/components/AudioButton.tsx` — Updated to use context instead of local `<audio>` element

## Cloudflare Workers Fix — Essays Page Blank

The `/essays` page was blank after Cloudflare deployment because `src/lib/essays.ts` used `fs.readdirSync`/`fs.readFileSync` at runtime — not available in Workers (no filesystem).

**Fix:** At build time, read all essay/source JSON files and generate `generated-essays-data.ts` (bundled into the worker). Modified `scripts/generate-graph-json.mjs` to also generate essay data. Same pattern as the existing graph data.

## Glossary System (New)

Separate lightweight system alongside Atlas. Data model in `src/glossary/types.ts`:

- **Source Material** — uploaded/linked documents (PDF, paper, transcript, etc.)
- **Essay** — with body blocks (`source`/`ai`/`summary` kinds) instead of plain text
- **Concept** — glossary nodes with definition, synonyms, related_to

Essays go in `content/glossary/essays/`, sources in `content/glossary/sources/`, concepts in `content/glossary/concepts/`. Data is generated at build time into `src/glossary/generated-data.ts`.

Essay detail page renders body blocks with distinct styling (source = indented italic, ai = normal, summary = muted small text).

Audio generation script now handles both old format (plain text `body`) and new format (array of body blocks), and checks both `content/essays/` and `content/glossary/essays/`.

## Deployment

`npm run cf:deploy` builds + deploys to:
https://re-rendering-atlas.tradesprior.workers.dev
