# Thesis Audio — Two-Voice Generation and the "Books" Tab

## Current Audio System

The existing engine (`scripts/generate-audio.mjs`) reads essay JSONs from `content/glossary/essays/` with a `body` array of blocks:

```json
{ "kind": "source", "text": "..." },
{ "kind": "ai", "text": "..." },
```

Voice mapping:
| Block kind | Voice | Description |
|------------|-------|-------------|
| `source` | `en-GB-RyanNeural` | British male — author's voice |
| `ai` | `en-US-AriaNeural` | American female — guide's voice |
| `summary` | `en-US-AriaNeural` | American female — rare |

This is designed for the short-form glossary essays (Mundus Imaginalis, Becoming an Angel, etc.) where blocks are 100-400 chars and alternate regularly.

## Challenge: Thesis Essays

The companion essays (Ficino 15 essays, Iamblichus 8, Corbin 7) are long-form continuous prose, not block-structured JSONs. Each essay is a single markdown file with interleaved source quotes and commentary.

### Option A: Parse Markdown into Blocks

The essays already alternate between Corbin's voice (block quotes) and commentary (plain paragraphs). We can parse each `essay.md` into the body-block format:

- **Blockquote lines** → `{ "kind": "source", "text": "..." }` → Ryan voice
- **Non-blockquote content** (commentary, analysis, narrative) → `{ "kind": "ai", "text": "..." }` → Aria voice
- **Section headers, Arabic tags** → either strip or fold into adjacent blocks

This preserves the two-voice texture: the reader hears the source author speaking in a British male voice, then the commentator explaining in an American female voice.

### Option B: Single Voice

Read the entire essay in one voice (Aria, the guide). Simpler but loses the source/commentary distinction that makes the existing audio compelling.

**Recommendation: Option A** — parse blockquotes as source, everything else as ai.

## The Two-Voice Effect in Thesis Essays

The thesis essays already have a natural alternation built in by the seven-layer method:

1. **Source block** (Ryan): Dense passage from Corbin, Ficino, or Iamblichus
2. **Decoding analysis** (Aria): Modern-language translation, analogy, question, image

This creates a pedagogical rhythm: the source speaks with authority, then the commentator translates. The listener hears the original voice and immediately gets the decoding. This is what makes the audio essays work.

## Proposed: "Books" Tab on Cloudflare Site

### Visual Design

A new tab on the navigational bar labeled **"Books"**. When clicked, it shows a grid of book covers as clickable images:

```
┌─────────────────────────────────────────────────────┐
│  Home  │  Essays  │  Concepts  │  Art  │  Books     │
├─────────────────────────────────────────────────────┤
│                                                       │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐              │
│  │         │  │         │  │         │              │
│  │  THREE  │  │    ON   │  │  ALONE  │              │
│  │ BOOKS OF│  │   THE   │  │  WITH   │              │
│  │  LIFE   │  │MYSTERIES│  │  THE    │              │
│  │         │  │         │  │  ALONE  │              │
│  │ Ficino  │  │Iamblich.│  │  Corbin  │              │
│  └─────────┘  └─────────┘  └─────────┘              │
│                                                       │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐              │
│  │  TBD    │  │  TBD    │  │  TBD    │              │
│  │         │  │         │  │         │              │
│  │ Platonic│  │  Occult │  │ Buddhist│              │
│  │ Bluepr. │  │ Bluepr. │  │ Bluepr. │              │
│  └─────────┘  └─────────┘  └─────────┘              │
└─────────────────────────────────────────────────────┘
```

### Click Behavior

Clicking a book image navigates to a book detail page showing the essay list for that companion:

```
┌─────────────────────────────────────────────────────┐
│  ← Books  ›  Three Books on Life (Ficino)            │
├─────────────────────────────────────────────────────┤
│                                                       │
│  [Cover Image]                                        │
│                                                       │
│  Track List:                                          │
│                                                       │
│  ▶ 00  Orientation: Ficino's World             3:45  │
│  ▶ 01  Why Medicine for Philosophers           4:12  │
│  ▶ 02  The Melancholic Scholar                 5:01  │
│  ...                                               │
│  ▶ 14  Why Three Books                         4:30  │
│                                                       │
│  [▶ Play All]                                         │
│                                                       │
└─────────────────────────────────────────────────────┘
```

### Auto-Play Behavior

- Each essay loads with audio auto-play enabled by default
- Player shows: current essay title, progress bar, play/pause, skip forward/back
- When one essay ends, the next in the track list auto-plays
- The voice alternates between Ryan (source) and Aria (ai) as the essay progresses

### Data Structure

Each "book" needs:
```json
{
  "id": "ficino-three-books",
  "title": "Three Books on Life",
  "author": "Marsilio Ficino",
  "coverImage": "/images/books/ficino.jpg",
  "essays": [
    { "id": "ficino-00-orientation", "title": "Orientation: Ficino's World", "audioUrl": "/audio/ficino-00.mp3" },
    { "id": "ficino-01-why-medicine", "title": "Why Medicine for Philosophers", "audioUrl": "/audio/ficino-01.mp3" }
  ]
}
```

## Implementation Notes

### Audio Generation for Thesis Essays

1. Parse each `essay.md` to extract blockquote (`>`) and non-blockquote sections
2. Create a JSON for each essay with the body-block structure
3. Run `npm run generate:audio -- <essay-id>` for each
4. Store JSONs in `content/glossary/books/` directory

### Frontend

- New route: `/books` and `/books/:bookId`
- Grid component for book covers
- Track-list component with auto-play sequence
- Audio player integration (reuse existing player component)

### Build Pipeline

- `generate-graph-json.mjs` needs updating to read the new books directory
- New `generated-data.ts` for books data
- Worker serves book data alongside existing glossary data

## Priority

The Books tab should be built after all three companions (Ficino, Iamblichus, Corbin) have their audio generated. The Ficino companion is the most complete and should be the first book deployed.

## Open Questions

1. **Cover images**: Need to source or create book cover art for each companion. Could use public domain images of the original texts.
2. **Essay order**: Within each book, essays should appear in reading order (not the numbering order — the Corbin companion has 7 essays that build on each other).
3. **Attribution**: Should the "Books" tab include secondary scholarship (Voss, Shaw) as related reading?
4. **Audio file size**: Long-form thesis essays will produce large audio files. Need to test with a single thesis essay first.
5. **Mobile UX**: Auto-play should respect mobile browser restrictions on autoplay. May need a "tap to start" screen.
