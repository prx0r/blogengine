# Formatting Requirements for Essays & Audio

## Essay JSON Format

Every essay lives in `content/glossary/essays/<id>.json` with this structure:

```json
{
  "id": "unique_essay_id",
  "title": "Full Essay Title",
  "type": "condensed_source",
  "source_ids": ["source_id"],
  "author": "Author Name",
  "concepts": ["Concept1", "Concept2"],
  "prerequisites": [],
  "body": [
    { "kind": "ai", "text": "Commentary paragraph..." },
    { "kind": "source", "text": "Blockquote from source text..." },
    { "kind": "art", "art_id": "art_id", "caption": "Caption text" }
  ]
}
```

### Body Block Kinds

| kind | Voice | Description |
|------|-------|-------------|
| `ai` | en-US-AriaNeural (American female) | Commentary, analysis, narrative |
| `source` | en-GB-RyanNeural (British male) | Direct quotes from source text |
| `summary` | en-US-AriaNeural | Summary sections (rare) |
| `art` | (no audio) | Art image references, skipped during TTS |

### Rules for TTS Readiness

1. **No Markdown in body text** — text is plain. No `*italic*`, `**bold**`, `[links]()`, or `# headings`. The `##` subheadings are converted to plain text during blueprint-to-JSON conversion.

2. **No `>` blockquote markers** — these are stripped during conversion. The `kind` field determines voice, not markdown syntax.

3. **Paragraph breaks are preserved** as `\n\n` within a block. Each block is read as continuous text by the TTS.

4. **Block size**: Blocks are auto-chunked at 900 chars (configurable via `TTS_CHUNK_CHARS`). Blocks should be whole paragraphs, not individual sentences. The TTS engine preserves natural breaks at paragraph boundaries.

5. **Greek/Arabic terms**: Can be included in Latin script with transliteration e.g. `*Nous*` → keep as italic markers in text (they read fine). Terms like `Ἑρμῆς` should be accompanied by transliteration.

6. **Source attribution**: Each essay must have `source_ids` referencing a valid source in `content/glossary/sources/<id>.json`.

7. **audioUrl**: Added automatically by the audio generation script. Set to `/audio/<essay_id>.mp3`.

## Book (Album) JSON Format

Books live in `content/glossary/books/<id>.json`:

```json
{
  "id": "book_id",
  "title": "Book Title",
  "author": "Author Name",
  "description": "Brief description",
  "coverImage": "/images/books/placeholder.jpg",
  "essays": [
    { "id": "essay_id", "title": "Essay Title", "audioUrl": "/audio/essay_id.mp3" }
  ]
}
```

- `audioUrl` in the album entry points to the same file as the essay's own `audioUrl`.
- No separate audio generation is needed for books — they reference essay audio files.

## Audio Generation

### Single Essay
```bash
npm run generate:audio -- <essay-id>
```

### All Essays (batch)
```bash
node scripts/generate-all-audio.mjs
```

### Pipeline
1. Script reads essay JSON from `content/glossary/essays/<id>.json`
2. For each body block:
   - Skips `art` blocks
   - Maps `source` → Ryan voice, `ai`/`summary` → Aria voice
   - Chunks text at paragraph boundaries, max 900 chars
3. Each chunk is synthesized via `edge-tts` CLI (Microsoft Edge TTS)
4. Audio cached in `data/tts-cache/` by SHA1 hash of (voice + text)
5. All chunks concatenated with `ffmpeg`
6. Post-processing: highpass filter + EQ + reverb applied via ffmpeg
7. Final MP3 written to `public/audio/<id>.mp3`
8. `audioUrl` field written back to essay JSON

### Server Constraints
- 4GB RAM, 2-core CPU
- Process ONE essay at a time (sequential)
- Between essays: 2-second delay
- Cache prevents re-downloading unchanged chunks
- ffmpeg concat is lightweight (copies data, doesn't re-encode)

## Blueprint to JSON Conversion

Run `node scripts/convert-blueprint-essays.mjs` to convert markdown blueprints:

**Input**: `essayglobal/blueprints/<Author - Book>/NN-name/essay.md`
**Output**: `content/glossary/essays/<id>.json` + `content/glossary/books/<id>.json`

### Conversion Rules
- `# Title` (line 1) → essay title, skipped in body
- `## Subheading` → `ai` block with subheading text
- `> blockquote` → `source` block
- Regular paragraphs → `ai` blocks (paragraph breaks split blocks)
- `---` → section break (ignored, just splits paragraphs)
- All markdown formatting stripped — plain text only
- Source attribution and author set by blueprint config
