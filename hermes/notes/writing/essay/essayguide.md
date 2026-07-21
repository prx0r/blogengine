# Essay Generation Guide

## Overview

This directory documents the full pipeline for turning source material (PDFs, text files) into condensed essays with multi-voice audio. It covers what worked, what didn't, and the exact method for producing a perfect essay.

## Quick Start (The Correct Way)

```bash
# 1. Extract text from PDF
pdftotext content/glossary/sources/essays/<source>.pdf /tmp/source.txt

# 2. Read the source, find the author's own structure (look for "first... second... third...")
# 3. Write the essay JSON directly using a Python script (see perfectessay.md for method)
python3 build_essay.py

# 4. Generate audio (multi-voice: Ryan for source, Aria for ai/summary)
npm run generate:audio -- <essay-id>

# 5. Deploy
node scripts/generate-graph-json.mjs
npm run cf:deploy
```

**Do not use the DeepSeek API to generate essays.** It's a reasoning model that silently burns all tokens on chain-of-thought and produces empty responses. The only reliable method is writing the JSON directly.

## Directory Contents

| File | What it is |
|------|------------|
| `essayguide.md` | **This file** — the full guide |
| `perfectessay.md` | Method A: Structured block-based essay (source/ai/summary) with multi-voice audio |
| _(deleted — voice guidance now inline below)_ | |
| `essayprocess.md` | The original spec — data model, block kinds, concept rules |
| `essaywriter.md` | **Deprecated** — AI prompt for DeepSeek API. Do not use. Kept for reference |
| `issuesessay.md` | Complete issues log: API failures, TS errors, build pain points |
| `mundus_handcrafted_feedback.md` | The feedback that turned v1 into v2 |

## The Essay Pipeline

### 1. Source Material

Source PDFs live in `content/glossary/sources/books/` and `content/glossary/sources/essays/`. Text-only sources (`.txt`) go in the same directories.

A source metadata JSON should be created alongside it:
```json
{
  "title": "Mundus Imaginalis or the Imaginary and the Imaginal",
  "author": "Henry Corbin",
  "type": "pdf",
  "tradition": ["Islamic mysticism", "Iranian philosophy", "Sufism"]
}
```

### 2. The Essay JSON

The essay body is an array of blocks. Each block has:
- `"kind"`: one of `"source"`, `"ai"`, `"summary"`
- `"text"`: the content

**Block rules (from perfectessay.md):**
- Source blocks: author's own words, keep long (400-900 chars)
- AI blocks: explain why the source matters, not what it says (200-600 chars)
- Summary blocks: compress low-signal material (citations, footnotes, repetitions)

**Rhythm:**
```
AI → Source → AI → Source → Summary → Source → AI → Source → AI → Source
```

**3 concepts max.** The triad: central entity, perceiving faculty, anchoring term.

### 3. Audio Generation

`scripts/generate-audio.mjs` handles multi-voice audio:

| Block kind | Voice |
|------------|-------|
| `source` | Ryan (en-GB-RyanNeural) — British male, author's voice |
| `ai` | Aria (en-US-AriaNeural) — American female, guide's voice |
| `summary` | Aria (en-US-AriaNeural) — same as guide |

The script processes each block individually, caches per-voice per-chunk (cache key includes voice name), then concatenates all chunks with ffmpeg. The cache is at `data/tts-cache/`.

To generate audio:
```bash
npm run generate:audio -- <essay-id>
```

### 4. Deployment

```bash
node scripts/generate-graph-json.mjs   # regenerates lookup data for Workers
npm run cf:deploy                       # builds + deploys to Cloudflare
```

The essay page is at `/essay/<essay-id>`. The global audio player at the bottom of the page persists across navigation.

## What NOT To Do (From Experience)

### Don't use the DeepSeek API for essay generation

**Why:** The model (`deepseek-v4-flash`) is a reasoning model. It always outputs chain-of-thought in `reasoning_content` before producing the final answer in `content`. With long source texts (30K+ chars), the reasoning step consumes all available tokens, leaving nothing for the actual output. The API returns HTTP 200 with empty content.

**Evidence from testing (16 attempts, ~60% failure rate):**
- With 1K source + 100 max_tokens: fails (reasoning uses all tokens)
- With 1K source + 32768 max_tokens: works (reasoning: 338 chars, content: 5 chars)
- With 30K source + 32768 max_tokens: works (reasoning: 32K chars, content: 7K chars)
- With 66K source + 32768 max_tokens: fails (reasoning eats everything)

**Chunked approach works but is slow:** Splitting 66K into 4 chunks of 20K each works but takes 2-3 minutes of API calls and produces mediocre results (42 concepts instead of 3, 0 ai blocks, cut-off endings).

**Verdict:** Writing the JSON directly takes 15 minutes and produces a better essay. The API is not worth the overhead.

### Don't use pdf-parse npm package

The v2.4.5 package exports `PDFParse` as a class constructor with no documented `.text` property. Use `pdftotext` CLI instead (poppler-utils, available on the server).

### Don't rely on TypeScript with mixed essay types

The old `Essay` and `Source` interfaces have all fields required. Glossary essays have a different shape. Merging them into the same arrays causes cascading TS errors. Use `// @ts-nocheck` on affected files until a proper discriminated union is defined.

### Don't let concepts explode

The API-generated essays produced 42 concepts for a single source. The correct number is 3. Concepts should be the central entity, the perceiving faculty, and the anchoring term — nothing more.

## Writing Voice (Stolen from the Best)

The format is always Method A (body blocks + multi-voice audio). But how you write within that format matters. Key techniques:

- **Open with time, place, person.** "al-Harith ibn Asad al-Muhasibi wrote that in Baghdad twelve hundred years ago." Immediate anchor.
- **Use fragments for emphasis.** "Forever." One word paragraph. It lands.
- **Embed quotes in a narrative voice.** Don't just drop a block quote. Introduce it: "He gives a test for it, and the test is exact. The way to know whether your self is telling you the truth is to set it a task it cannot profit from." Then the quote lands as evidence for the claim, not as a wall of text.
- **Concrete details over abstractions.** Not "he was extremely disciplined" but "a vein in his finger would stir when food of doubtful origin came near his hand."
- **End by circling back.** "He called himself the one who calls himself to account. The least we can do, twelve hundred years on, is learn his name and try the thing he taught."
- **The writer has a personality.** Don't be a robot curator. Be a guide with opinions.

## The Reference Essay (Method A)

`mundus_handcrafted_v2` is the reference implementation:
- 22 blocks (10 source, 9 ai, 3 summary)
- 10,713 chars
- 3 concepts: Imaginal World, Active Imagination, Eighth Climate
- Multi-voice audio (Ryan for source, Aria for ai/summary)
- Structure follows Corbin's own stated plan

The feedback that shaped v2 is in `mundus_handcrafted_feedback.md`. The key lessons:
- Cut redundancy (two quotes saying the same thing)
- No unsupported claims (intersubjectivity without evidence)
- Labels need payoff (eighth climate named early, explained later)
- Proportionality (Swedenborg = 1 quote, not 2)
- Transitions should flow from logic, not announce sections

## Poor Examples

| Essay | Problem |
|-------|---------|
| `mundus_long` | API-generated. 42 concepts, 0 ai blocks, cut-off ending. Chunked approach produced barely usable output |
| `mundus_1` (faithful) | Too short (5K chars), decent structure but felt like notes |
| `mundus_2` (nanavira) | Too short (3.3K chars), dense but underdeveloped |
| `source_001_mundus_imaginalis` | First-pass API attempt. Only 3.3K chars, no hook, no conclusion |
| `mundus_handcrafted` (v1) | Good structure but had redundancy, weak transitions, second-order Swedenborg quote, eighth climate never explained |

## Complete File Map

```
content/glossary/
├── sources/
│   ├── books/           # Full-length PDFs/texts
│   ├── essays/          # Shorter PDFs/texts (papers, articles)
│   └── *.json           # Source metadata
├── essays/
│   └── *.json           # Essay JSON with body blocks
└── concepts/
    └── *.json           # Concept definitions with synonyms, wikipedia refs

essaygen/
├── essayguide.md            # This file
├── perfectessay.md          # The perfect method
├── essayprocess.md          # The spec
├── essaywriter.md           # (deprecated) AI prompt
├── issuesessay.md           # Issues log
└── mundus_handcrafted_feedback.md  # Feedback that fixed v1

scripts/
├── generate-audio.mjs       # Multi-voice TTS generation
├── generate-graph-json.mjs  # Build-time data generation
├── import-art.mjs           # Import art with image download
├── generate-long-essay.mjs  # (deprecated) Chunked API approach
└── process-source.mjs       # (deprecated) Single-pass API approach
```

## Art System

The art layer sits alongside essays and concepts. The schema is at `src/glossary/types.ts` (GlossaryArt interface).

### Data model (minimal)

```json
{
  "id": "art_001",
  "title": "Rosarium Philosophorum Plate",
  "artist": "",
  "date": "",
  "source_url": "",
  "image_url": "",
  "local_file": "/art/art_001.jpg",
  "license": "Public Domain",
  "description": "",
  "concepts": ["Conjunction", "Sun and Moon"],
  "visual_motifs": ["king", "queen", "sun", "moon"],
  "style": ["engraving", "alchemy"],
  "used_in": [],
  "motion_notes": [],
  "notes": ""
}
```

### How art links to essays

Two ways:

1. **Essay-level `art` field** — list of art IDs in the essay JSON. These appear as a "Related Art" gallery at the bottom of the essay page.

2. **Body block `kind: "art"`** — embed art inline in the essay body:
   ```json
   { "kind": "art", "art_id": "art_001", "caption": "The conjunction of opposites." }
   ```

### How art links to concepts

The `concepts` field on each art entry matches concept names. When a concept is viewed on the glossary page, related art shows as thumbnail tiles. When art is viewed on the `/art` page, its concept labels are displayed.

### Inserting art into essays

Art appears inline in the essay body as right-floated images. Add an art block at any position:

```json
{ "kind": "art", "art_id": "art_ouroboros", "caption": "The serpent eating its tail." }
```

Aim for 8-10 art blocks per essay, placed after key conceptual passages. The art should illustrate or complement the point being made.

### How to find and add art

1. Check `content/glossary/art/` for existing art that matches your essay's concepts.
2. Browse `/art` on the live site to see what's available.
3. For new art, create a JSON file in `content/glossary/art/` with:
   - `id`: unique ID
   - `title`: descriptive title
   - `concepts`: what the image means (1-5 concept names)
   - `visual_motifs`: what's visibly in it (sun, serpent, angel, etc.)
   - `license`: must be verifiable (Public Domain preferred)
   - `image_url`: source URL for download
4. Use Wikimedia Commons `Special:FilePath/` redirect to find actual image URLs, or download from the Wellcome Collection IIIF API.
5. If automated download fails, save the image manually to `public/art/` and set `local_file`.
6. Run `node scripts/generate-graph-json.mjs` to register.

### Art sourcing guidelines

Use these sources for high-quality public domain images:

- **Alchemical engravings**: Adam McLean's alchemy website (`alchemywebsite.com`), Public Domain Review alchemical collections
- **Religious/mystical art**: Wikimedia Commons, Wellcome Collection, Rijksmuseum
- **Manuscript illuminations**: British Library manuscripts, Bodleian Library
- **Sufi/Islamic art**: Metropolitan Museum of Art, Walters Art Museum

Each art entry must have:
- `concepts` (what the image means in the glossary, 1-5)
- `visual_motifs` (what is visibly in the image, e.g., "sun", "serpent", "angel")
- `license` (must be verifiable)

Do not turn visual motifs into concepts. "Sun" is a motif; "Conjunction" is a concept.
```
