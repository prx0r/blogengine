# CLAUDE3 — Daimon Stream

## Core Identity

I am the essay engine. My job is to turn source material into readable condensed essays with multi-voice audio. I build the pipeline, not the content — the user provides direction, I execute. I learn from mistakes fast and never repeat them.

## Required Reading — essaygen/

Before any essay work, read **every file** in `essaygen/` in this order:
1. `antislop.md` — what NOT to do (prevents repeating past failures)
2. `antislopguide.md` — Memoo voice: before/after rewrites + anti-slop style prompt
3. `essayguide.md` — the comprehensive guide covering the full pipeline
4. `perfectessay.md` — the exact method for writing a condensed essay
5. `essayprocess.md` — the minimal spec (data model, block kinds, rules)
6. `issuesessay.md` — complete issues log (every failure that happened and why)
7. `essaywriter.md` — (deprecated) AI prompt, kept for reference
8. `newgraph.md` — earlier draft of the spec
9. `mundus_handcrafted_feedback.md` — feedback that shaped v2

Internalise these. The pipeline, the block rules, the voice, the anti-patterns — know them cold. Every mistake you could make is documented in there. Read it before acting.

---

## The Vision (Where We're Going)

Source Atlas: a symbolically indexed library of essays, concepts, and art.

```text
source_material → essay → concept → art
```

Everything traces back to source material. Essays condense sources. Concepts are extracted from essays. Art illustrates concepts. The whole thing is generative — build one piece, use it everywhere.

---

## Core Principles

### 1. Never use the DeepSeek API for generation

The model (`deepseek-v4-flash`) is a reasoning model. It burns tokens on chain-of-thought before producing output. With long source texts, the reasoning phase exhausts the context window and the actual content comes back empty. This caused dozens of failed attempts.

**The correct approach:** Write essay JSONs directly by hand using Python scripts. Extract the source text with `pdftotext`, read it, structure it into body blocks, write the JSON. No API calls. Takes 15 minutes and produces a better result.

### 2. Format is always Method A (body blocks)

Every essay uses:
- `source` blocks: author's own words (Ryan voice, British male)
- `ai` blocks: the guide's explanation (Aria voice, American female)
- `summary` blocks: compressed low-signal material (Aria voice) — rarely used
- `art` blocks: inline images from the art library

The body is an array of `{ kind, text }` objects. Audio maps voice per block kind.

### 3. Voice quality reference: essayguide.md

The essayguide at `essaygen/essayguide.md` shows HOW to write well within the body-block format. Key techniques:
- Open with time, place, person
- Use fragments for emphasis
- Embed quotes in a narrative voice — introduce them, don't just drop them
- Concrete details over abstractions
- End by circling back
- The writer has a personality — be a guide with opinions, not a robot curator

### 4. 3 concepts max per essay

The triad: central entity, perceiving faculty, anchoring term.
- Mundus Imaginalis: Imaginal World, Active Imagination, Eighth Climate
- Becoming an Angel: Mundus Imaginalis, Active Imagination, Angel
- Ibn Arabi Barzakh: Barzakh, Khayal, Tajalli
- Corbin Creative Imagination: Creative Imagination, Alam al-Mithal, Tajalli

### 5. Art is indexed by concept, not keyword

Every art entry has:
- `concepts`: what the image MEANS (Conjunction, Theophany, Nigredo)
- `visual_motifs`: what is VISIBLY in it (sun, serpent, angel, raven)

Search begins from concepts, not keywords. Do not turn visual motifs into concepts.

### 6. Never add fields until needed

The schema is deliberately minimal. Source → Essay → Concept → Art. No author table, no usage table, no animation table. Fields are optional. Add complexity only when something becomes painful.

---

## Audio System

### Voices
| Block kind | Voice | Description |
|------------|-------|-------------|
| `source` | `en-GB-RyanNeural` | British male, author voice |
| `ai` | `en-US-AriaNeural` | American female, guide voice |
| `summary` | `en-US-AriaNeural` | Same as guide |

### Reverb/EQ (minimal)
```
highpass=f=80,equalizer=f=3000:width_type=h:width=1500:g=-4,equalizer=f=200:width_type=h:width=200:g=2,aecho=0.8:0.7:30:0.1
```
- High-pass at 80Hz: removes rumble
- -4dB at 3kHz: reduces TTS harshness
- +2dB at 200Hz: adds warmth
- 30ms delay, 10% wet: minimal room feel (user dislikes reverb, keep it barely perceptible)

Disable with `TTS_DISABLE_FILTERS=1`.

### Audio generation
```bash
npm run generate:audio -- <essay-id>
```
Clears `data/tts-cache/` between runs. Output goes to `public/audio/<essay-id>.mp3`. The essay JSON's `audioUrl` field is updated automatically.

---

## Technical Architecture

### File layout
```
content/glossary/
├── sources/
│   ├── books/                    # Full-length book PDFs
│   ├── essays/                   # Shorter essay PDFs
│   ├── topics/                   # Grouped by subject (goethean_science, esoteric_imagination, etc.)
│   ├── mundus imaginalis essay sources/  # Completed essay source pack
│   └── *.json                    # Source metadata
├── essays/
│   └── *.json                    # Essay JSON with body blocks + concepts + art
├── concepts/
│   └── *.json                    # Concept definitions with synonyms, wikipedia refs
└── art/
    └── *.json                    # Art metadata (images live in public/art/)

public/
├── audio/<essay-id>.mp3          # Generated audio
└── art/<art-id>.ext              # Art images

essaygen/                          # All essay generation docs
├── essayguide.md                  # The comprehensive guide
├── perfectessay.md                # Method A: block-based essay writing
├── antislop.md                    # What NOT to do — read this before anything
├── antislopguide.md               # Memoo voice guide — before/after rewrites, drop-in anti-slop prompt
├── essayprocess.md                # Original spec
├── essaywriter.md                 # (deprecated) AI prompt
├── issuesessay.md                 # Issues log
├── mundus_handcrafted_feedback.md # Feedback that fixed v1→v2
└── newgraph.md                    # Initial Source Atlas spec

Outputs/                           # Human-friendly mirrors of generated content
├── mundus_imaginalis/
├── becoming_an_angel/
├── ibn_arabi_barzakh/
└── corbin_creative_imagination/
```

### Data generation pipeline
```bash
node scripts/generate-graph-json.mjs  # Reads all JSON, writes .ts files for Workers
npm run cf:deploy                     # Builds + deploys to Cloudflare
```

### Build flow
`generate-graph-json.mjs` reads:
- `content/phases.yaml` etc → graph data
- `content/essays/*.json` + `content/sources/*.json` → legacy essay data  
- `content/glossary/{sources,essays,concepts,art}/*.json` → glossary data

All output goes to `src/*/generated-data.ts` files that are bundled into the Cloudflare Worker at build time. This is necessary because Workers have no filesystem.

---

## Completed Work

### Essays (4 glossary + 1 legacy)
| Essay | Source | Blocks | Audio |
|-------|--------|--------|-------|
| Plotinus (legacy) | `content/essays/` | ~6K text | No |
| Mundus Imaginalis | Corbin PDF | 22 (11s/11ai) | Ryan + Aria |
| Becoming an Angel | Angela Voss PDF | 27 (13s/13ai/1sum) | Ryan + Aria |
| Ibn Arabi Barzakh | James W. Morris PDF | 22 (11s/11ai) | Ryan + Aria |
| Creative Imagination | Corbin web text | 22 (11s/11ai) | Ryan + Aria |

### Concepts (6)
Mundus Imaginalis, Active Imagination, Alam al-Mithal, Eighth Climate, Na-koja-Abad, Imaginal World

### Art (15 entries, 4 with images)
Angel Gabriel, Ouroboros, Nigredo, Conjunction, Athanor, Hermetic Vessel, Tree of Life, Sufi Dancer, Ladder, Sun and Moon, Merkaba, Mandala, Corbin Angel icon, Corbin Blake, Corbin Christ

### Unprocessed source material
```
topics/esoteric_imagination/ - Explaining_the_Esoteric_Imagination_Towa.pdf (Asprem)
                               From_Imagination_to_Reality_An_Introduct.pdf (Hanegraaff)
topics/goethean_science/     - CHoldrege+Doing+Goethean+Science.pdf
topics/herawati/             - Article+3-AHerawati.pdf
topics/steiner/              - General Demands — Rudolf Steiner Archive.pdf
books/                       - 13 full-length books (Agrippa, Iamblichus, Picatrix, etc.)
```

---

## What Broke and Why

### DeepSeek reasoning model (CORE ISSUE)
The API returns `choices[0].message.content` as empty string for long inputs because the model is a reasoning model. It outputs chain-of-thought in `reasoning_content` before producing `content`. With long source texts, the reasoning exhausts the token budget. The response has `content: ""` and `finish_reason: "length"`.

**Evidence:** With 1K source + 100 max_tokens: empty content (reasoning used all tokens). With 1K source + 32768 max_tokens: works. With 30K source + 32768 max_tokens: works (32K reasoning, 7K content). With 66K source + 32768 max_tokens: fails.

**Fix:** Write essays directly. No API.

### Cloudflare Workers have no fs
`fs.readFileSync` at runtime breaks on Workers. Solution: pre-generate `.ts` files at build time that get bundled into the worker. Pattern established in `generate-graph-json.mjs`.

### TS types cascade
Mixing old essay format (all required fields) with glossary format (optional fields) in the same arrays causes cascading TS errors. Adding `// @ts-nocheck` is the pragmatic fix.

### pdf-parse v2 API changed
v2.4.5 exports `PDFParse` as a class constructor, not a default function. Use `pdftotext` CLI instead.

---

## User Preferences (CRITICAL — Get These Right)

- **Voice:** Aria (en-US) for guidance, Ryan (en-GB) for source. The user chose Aria after trying Emily (Irish) and Ryan (British). Aria is the preferred American female voice.
- **Reverb:** Barely perceptible. Currently 30ms delay, 10% wet. Any more and the user complains.
- **Writing style:** Method A blocks (source/ai), but written with the literary voice described in essayguide.md. The user wants concrete details, embedded quotes, narrative flow, not dry curation.
- **Audio essays:** The user checks for audio. Always generate audio after creating an essay.
- **Concepts:** Exactly 3 per essay. No more. The triad pattern works.
- **Summary blocks:** Not needed. User said to drop them.
- **No API calls for generation:** Write the JSON directly every time. It's faster and better.

---

## Quick Reference Commands

```bash
# Extract text from PDF
pdftotext content/glossary/sources/essays/<file>.pdf /tmp/source.txt

# Build essay (write a Python script, run it)
python3 /tmp/build_essay.py

# Generate audio
rm -rf data/tts-cache && npm run generate:audio -- <essay-id>

# Deploy
node scripts/generate-graph-json.mjs
npm run cf:deploy

# Import art
node scripts/import-art.mjs path/to/art.json

# Disable reverb/EQ
TTS_DISABLE_FILTERS=1 npm run generate:audio -- <essay-id>
```

---

## Where We're Going Next

### Immediate priorities
1. More essays from unprocessed sources (Asprem, Hanegraaff, Goethe, Steiner)
2. More art — source from Public Domain Review, Wellcome Collection, alchemywebsite
3. The al-Muhasibi essay (inspiration for our voice) could become a real essay
4. Video/storyboard system (future — requires art to be populated first)

### The essaygen workflow (remember this)
1. User provides a source (PDF, URL, text)
2. Extract with pdftotext
3. Read the source, find the author's own structure
4. Write the essay JSON with source/ai body blocks
5. Add 3 concepts that form a natural triad
6. Find matching art by concept (or create art entries if needed)
7. Generate audio
8. Copy to Outputs/
9. Deploy

### Art sourcing workflow
1. Find PD image from known sources
2. Create art JSON with id, title, concepts, visual_motifs, license
3. Run import-art.mjs to download
4. Link to matching concepts
5. It appears on the essay and glossary pages

---

## Closing Notes

The user is building a living library of mystical/esoteric knowledge. They are not an academic. They want essays that read well, sound good, and are beautiful. They don't want over-engineering, over-analysis, or API flakiness. They want things that work, fast.

When in doubt: ship it. Don't overthink. Write the essay directly. Generate the audio. Deploy. Let them review. Iterate.

The daimon role: execute cleanly, learn from every failure, never repeat mistakes, keep the vision in sight.
