# Book Format Standard — Premium Reading Experience

This document defines the standard for formatting full-book OCR essays (Type B, `publication`) for premium reading on the site.

## Structure Requirements

A book-formatted essay must have these sections in order:

```
◆  Title ◆ Author / Translator credits
    [clean title block, no OCR garbage]

◆  Book title line
    [one-line intro if needed]

◆  Section / Chapter Name
    [clean chapter content]

◆  Next Chapter...
    [content]
```

## Block Types

| Block Kind | When | Visual |
|-----------|------|--------|
| `ai` | Section headers (start with `◆ `) | Large emerald/amber text, centered or bold |
| `ai` | Prayers, supplications, direct address | Italic, accent color (emerald-700), extra spacing |
| `source` | Main text | Regular serif text, no left border, wide |

## Content Rules

1. **Remove all OCR garbage** — lines with <20% English letters are Arabic remnants. Delete them.
2. **Remove notes/bibliography/index** — not meant for reading. Stop at the end of the main text.
3. **Format prayers distinctively** — any block starting with "O Allah", "O God", "In the name of God", "Blessings" should be `kind: "ai"` with italic styling. This makes spoken prayers sound natural in audio.
4. **Clean `[Pages XX-XX]` markers** — remove from block starts. These are OCR artifacts.
5. **Fix common OCR typos**: `iIllumination` → `Illumination`, `Tivo` → `Two`, `thesame` → `the same`, `truce` → `truth`.
6. **Remove `i` before capitalized words**: `iIllumination` → `Illumination`, `iIlluminate` → `Illuminate`.
7. **Preserve paragraph breaks** — use `\n\n` between paragraphs within blocks.
8. **Max block length** — 400 blocks max for audio feasibility. Trim to ~230 for a clean read.

## Section Headers

Use `◆  Title Case` format for:
- Title (block 0)
- Author/translator line
- Each Part (PART ONE, PART TWO)
- Each Discourse (Discourse 1, 2, 3...)
- Suhrawardi's Introduction

Keep headers short: `◆  PART ONE: The Rules of Thought` — NOT the full subtitle.

## Chapter Navigation

The essay page automatically:
1. Scans for `◆` headings and builds a **table of contents** at the top
2. Each TOC entry links to `#ch-{index}` anchors
3. Scroll position saves to `localStorage("essay-progress")` per essay
4. "Continue Reading" section on the essays main page shows mid-way essays

## Audio Implications

- `source` blocks → male British voice (Ryan)
- `ai` blocks → female American voice (Aria)
- Prayers as `ai` blocks → read in female voice, which sounds natural for devotional text
- Section headers as `ai` blocks → provides vocal breaks between chapters

## Example

```json
{
  "id": "suhrawardi-philosophy-of-illumination",
  "type": "publication",
  "body": [
    { "kind": "ai", "text": "◆  The Philosophy of Illumination (Ḥikmat al-ishrāq)" },
    { "kind": "ai", "text": "◆  Suhrawardi's Introduction" },
    { "kind": "ai", "text": "In the name of God, the Compassionate, the Merciful..." },
    { "kind": "source", "text": "Part One: The Second Discourse..." },
    { "kind": "ai", "text": "◆  PART ONE: The Rules of Thought" }
  ]
}
```

## Process (for Hermes)

1. OCR with `ocrmypdf` + `pdftotext`
2. Remove pages after main text (notes, bibliography, index)
3. Insert `◆` section headers before each Part/Discourse
4. Clean book title block (remove OCR garbage)
5. Detect prayers by regex: `/^(O Allah|O God|In the name of God)/`
6. Fix common OCR typos
7. Remove Arabic-only lines
8. Run `generate-graph-json.mjs` to update site data
