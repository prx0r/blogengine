# CLAUDE5.md — Essay & Thesis Writing Rules

## Essay JSON Format

All essays must live in `content/glossary/essays/<id>.json` with type `"condensed_source"`.

### Body Blocks

Each body block has a `kind` and `text`. Three kinds:

- **`ai`** — Commentary, analysis, narrative. Read in American female voice (Aria).
- **`source`** — Direct quotes from source texts. Read in British male voice (Ryan).
- **`art`** — Art references (skipped by TTS). Has `art_id` and optional `caption`.

### Writing Rules for TTS

1. **Plain text only** — no markdown formatting in block text. No `*italic*`, `**bold**`, `[links]()`, `# headings`.
2. **Paragraph breaks** use `\n\n` within a block. Each block should be 1-4 paragraphs.
3. **Blocks are voice-switch points** — alternate `ai` and `source` for two-voice effect.
4. **Source quotes** should be substantial passages (80-500 words), not single sentences.
5. **No `>` markers** — the `kind` field determines source vs commentary, not syntax.
6. **Book/essay titles** in text: wrap in quotes, not italics.

### Required Fields

```json
{
  "id": "unique_id",
  "title": "Title",
  "type": "condensed_source",
  "source_ids": ["source_id"],
  "author": "Author Name",
  "concepts": [],
  "prerequisites": [],
  "body": []
}
```

## Blueprint Conversion

When converting from markdown blueprints in `essayglobal/blueprints/`:

1. Run `node scripts/convert-blueprint-essays.mjs`
2. This reads `essay.md` files, creates JSON essays and album JSON
3. Conversion: `# Title` → skipped, `## Heading` → ai block, `> quote` → source block, paragraphs → ai blocks
4. After conversion, add `audioUrl` by running the batch audio script

## Audio Generation

```bash
# Single essay
npm run generate:audio -- <essay-id>

# All essays (sequential, one at a time)
node scripts/generate-all-audio.mjs
```

- Source blocks → en-GB-RyanNeural (British male)
- AI/summary blocks → en-US-AriaNeural (American female)
- Chunks at 900 chars, cached by SHA1 hash
- Sequential processing only (4GB RAM, 2 cores — no parallel)

## Cross-References

- `formattingrequirements.md` — full format spec
- `scripts/generate-audio.mjs` — audio engine
- `scripts/convert-blueprint-essays.mjs` — markdown → JSON converter
