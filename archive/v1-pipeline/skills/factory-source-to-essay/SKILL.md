# Source-to-Essay Conversion Skill

Converts a raw source PDF into two JSON artifacts:
1. **Work JSON** — full metadata, tags, cleaned text (citations stripped from body, collected at end)
2. **Essay JSON** — voice-tagged body blocks (`source` / `ai`) for site display and audio generation

## Input

A source PDF in `content/sources/<tradition>/<topic>/<filename>.pdf`

## Output

1. `content/works/work_<slug>.json` — research-object ready work record
2. `content/glossary/essays/<slug>.json` — essay for site + audio

## Work JSON Format

```json
{
  "work_id": "work:<slug>",
  "schema_version": 1,
  "title": "Full Paper Title",
  "authors": [
    { "name": "Author Name", "author_id": "author:<author-slug>" }
  ],
  "publication": {
    "year": 2024,
    "type": "article",
    "language": "en"
  },
  "identifiers": {
    "doi": null,
    "openalex_id": null
  },
  "topics": ["topic1", "topic2"],
  "tradition": ["sufism"],
  "tier": 2,
  "relations": [],
  "assets": {
    "pdf_path": "library/<tradition>/<slug>.pdf",
    "source_url": null
  },
  "abstract": "Clean abstract text without citations.",
  "body_clean": "Full body text with in-text citations removed. References are collected below.",
  "references": [
    "1. Author. Title. Journal. Year;Vol:Pages.",
    "2. ..."
  ]
}
```

## Essay JSON Format

```json
{
  "id": "<slug>",
  "title": "Readable Essay Title",
  "type": "condensed_source",
  "source_ids": ["work:<slug>"],
  "author": "Author Name",
  "concepts": ["tag1", "tag2"],
  "prerequisites": [],
  "body": [
    { "kind": "ai", "text": "Commentary paragraph introducing the source passage..." },
    { "kind": "source", "text": "Direct quotation from the source (read in male voice)..." },
    { "kind": "ai", "text": "Further explanation..." },
    { "kind": "source", "text": "Another passage..." }
  ]
}
```

## Body Block Rules

| kind | Voice | Purpose |
|------|-------|---------|
| `ai` | en-US-AriaNeural (American female) | Commentary, analysis, narrative, transitions |
| `source` | en-GB-RyanNeural (British male) | Direct source quotations (80-500 words) |
| `art` | skipped by TTS | Art references with `art_id` and optional `caption` |

1. **Alternate voice blocks** — switch between `ai` and `source` for natural two-voice effect.
2. **Source blocks** must be substantial passages (80-500 words), not single sentences.
3. **No in-text citations** in body — move all `(Author, year)` and `[1]` style references to the `references` array in the Work JSON.
4. **Plain text only** — no markdown, no `*italic*`, no `**bold**`, no `# headings` in block text.
5. **Paragraph breaks** use `\n\n` within a block. 1-4 paragraphs per block.

## Validation Rules

Run `hermes validate-json <path>` to check:

### Work JSON checks
- [ ] `work_id` starts with `work:`
- [ ] `title` is non-empty string
- [ ] `authors` is non-empty array with `name` strings
- [ ] `tradition` matches one of: sufi, platonism, occult, other
- [ ] `tier` is 1 (primary source) or 2 (scholarly commentary)
- [ ] `body_clean` has no parenthesized citations like `(Author, YYYY)` or `(Author et al., YYYY)`
- [ ] `body_clean` has no bracketed citations like `[1]`, `[1,2]`, `[1-3]`
- [ ] `references` array is non-empty if source has citations
- [ ] No literal newlines in strings (use `\n`)

### Essay JSON checks
- [ ] `id` matches `[a-z0-9_-]+` pattern
- [ ] `type` is `condensed_source`
- [ ] `source_ids` array references existing work IDs
- [ ] `body` is non-empty array
- [ ] Each block has valid `kind`: `ai`, `source`, or `art`
- [ ] Source blocks > 80 characters
- [ ] No citation patterns in `text` fields: no `(Author,`, no `[digit]`, no `et al.`
- [ ] No markdown formatting in text
- [ ] Blocks alternate voice kinds (no two `source` blocks in a row)

## Usage

```bash
# Convert a single source
hermes convert-source content/sources/sufism/new-uploads/filename.pdf

# Validate a JSON
hermes validate-json content/glossary/essays/filename.json

# Batch validate all essays
hermes validate-all
```
