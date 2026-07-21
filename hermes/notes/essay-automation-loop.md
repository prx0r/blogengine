# Essay Automation Loop — Ralph Loop Spec

A LangGraph agent that automates the full essay pipeline from source → published audio essay.

## Overview

```
Blueprints/CLAUDE5.md → Ralph Loop Agent → Published Essay on Cloudflare
```

The system is a state-machine loop with validation gates. Each phase passes/fails and loops back until criteria met.

---

## Phase 0: Intake & Classification

**Input**: Source material (book name, PDF, topic, scholar name)
**Output**: Decision: thesis_essay vs condensed_source

| Type | When | Format |
|------|------|--------|
| **thesis_essay** | Whole-book companion (Ficino, Iamblichus, Corbin) | Long-form prose, markdown in blueprints |
| **condensed_source** | Single-topic extraction from a source | Short JSON with source/ai blocks, TTS-ready |

**Validation**: Must have `source_ids` referencing an existing source in `content/glossary/sources/`.

**Loop trigger**: If no source exists → create source JSON first → re-check.

---

## Phase 1: Research & Extraction

**Input**: Source material, source JSON reference
**Output**: Passage packs, blueprint doc

**Steps**:
1. Read source text (PDF, book, article)
2. Identify key passages (80-500 words each)
3. Classify each passage as `source` (direct quote) vs commentary
4. Write structural outline (essay sequence if thesis, single essay if condensed)
5. Create blueprint in `essayglobal/blueprints/<Author - Book>/`

**Validation gates**:
- Each source passage has location/citation
- Commentary ≠ summary of source (must add value)
- No overlap with existing essays (check `content/glossary/essays/`)
- Minimum 5 passages for condensed_source, 7+ for thesis essays

**Ralph loop**: If validation fails → back to extraction with specific feedback. Max 3 retries.

---

## Phase 2: Blueprint → JSON Conversion

**Input**: `essay.md` in blueprint dir
**Output**: `content/glossary/essays/<id>.json` + `content/glossary/books/<id>.json` (if thesis)

**Conversion rules** (see `formattingrequirements.md`):
- `> blockquote` → `source` block
- Regular paragraph → `ai` block
- `##` subheading → `ai` block with subheading text
- `---` → section break (skip)
- `# Title` (line 1 only) → essay title, skip in body

**Tools**:
- `node scripts/convert-blueprint-essays.mjs` for batch (add to script first)
- Manual conversion for single essays

**Validation**:
- JSON parses without error
- Every block has `kind` and `text`
- No empty blocks
- `source_ids` references valid source
- Block count >= 5
- Total chars >= 1000

**Ralph loop**: If validation fails → fix JSON → re-validate.

---

## Phase 3: Glossary Integration

**Input**: Essay JSON
**Output**: Updated `content/glossary/sources/` and `content/glossary/concepts/`

**Steps**:
1. Extract key concepts from essay body (nouns, proper names, technical terms)
2. Check if each concept exists in `content/glossary/concepts/<id>.json`
3. If missing, create concept entry with definition
4. Add concept IDs to essay JSON's `concepts` array
5. Ensure source entry exists in `content/glossary/sources/<id>.json`

**Validation**:
- All `concepts` references resolve to existing concept JSONs
- Source JSON exists
- No dangling references

**Ralph loop**: Back to create missing concepts/sources → re-validate.

---

## Phase 4: Art Association

**Input**: Essay JSON
**Output**: `art_id` references in essay body blocks + source `art/` entries

**Steps**:
1. Scan essay body for key themes, figures, symbols
2. Match against existing art in `content/glossary/art/`
3. If match found, add `{ "kind": "art", "art_id": "art_xxx", "caption": "..." }` to relevant position in body
4. If no match, create placeholder or skip

**Validation**: All `art_id` references resolve to existing art JSONs.

**Ralph loop**: Either create art entries or skip. Not blocking.

---

## Phase 5: Audio Generation

**Input**: Essay JSON with `audioUrl` field
**Output**: `public/audio/<id>.mp3` + `audioUrl` written back to JSON

**Steps**:
1. Run `npm run generate:audio -- <essay-id>`
2. Script processes each body block:
   - `source` → en-GB-RyanNeural (British male)
   - `ai`, `summary` → en-US-AriaNeural (American female)
   - `art` → skipped
3. Chunks at TTS_CHUNK_CHARS (default 900)
4. Caches chunks in `data/tts-cache/` by SHA1 hash
5. Concatenates with ffmpeg, applies EQ/reverb filter
6. Writes `audioUrl` field into essay JSON

**Batch**: `node scripts/generate-all-audio.mjs` (sequential, 2s delay between essays)

**Validation**:
- `public/audio/<id>.mp3` exists and size > 0
- Essay JSON has `audioUrl` set
- Cache dir has entries

**Ralph loop**: Retry failed essays individually (max 3 retries). Single essay generation is fast for re-runs (cached chunks skip).

**Resource constraints**: 4GB RAM, 2 cores. Sequential only. One essay at a time. Max 5 min timeout per essay.

---

## Phase 6: Regenerate Build Data

**Input**: All updated JSONs
**Output**: Regenerated `src/lib/generated-essays-data.ts` etc.

**Steps**:
1. Run `node scripts/generate-graph-json.mjs`
2. This reads all content/ JSONs and regenerates TypeScript data files
3. Also generates public/ graph data

**Validation**:
- Generated files exist
- New essay ID appears in generated data
- Source count incremented

**Ralph loop**: If generation fails → check JSON parse errors → fix → re-run.

---

## Phase 7: Build & Deploy

**Input**: Generated data files
**Output**: Live site on Cloudflare Workers

**Steps**:
1. `npm run cf:build` (generates data + builds Next.js + bundles for Cloudflare)
2. `npx opennextjs-cloudflare deploy` (uploads to Cloudflare)
3. Verify at `https://re-rendering-atlas.tradesprior.workers.dev`

**Validation**:
- Build exits with status 0
- Deploy reports "Deployed"
- Essay accessible at `/essay/<id>`
- Audio loads and plays
- Book page (if thesis) shows new essay in track list

**Ralph loop**: If build fails → check errors → fix → rebuild. If deploy fails → check wrangler auth → re-deploy.

---

## State Machine Summary

```
                    ┌─────────────┐
                    │  Phase 0    │
                    │  Classify   │
                    └──────┬──────┘
                           ▼
                    ┌─────────────┐
              ┌─────│  Phase 1    │◄────┐
              │     │  Extract    │     │
              │     └──────┬──────┘     │
              │            ▼            │
              │     ┌─────────────┐     │
              │     │  Phase 2    │     │
              │     │  Convert    │─────┤ (validation fail)
              │     └──────┬──────┘     │
              │            ▼            │
              │     ┌─────────────┐     │
              │     │  Phase 3    │     │
              │     │  Glossary   │─────┤ (missing concepts)
              │     └──────┬──────┘     │
              │            ▼            │
              │     ┌─────────────┐     │
              │     │  Phase 4    │     │
              │     │  Art        │─────┤ (optional)
              │     └──────┬──────┘     │
              │            ▼            │
              │     ┌─────────────┐     │
              │     │  Phase 5    │     │
              │     │  Audio      │─────┤ (retry failures)
              │     └──────┬──────┘     │
              │            ▼            │
              │     ┌─────────────┐     │
              │     │  Phase 6    │     │
              │     │  Generate   │─────┤ (parse errors)
              │     └──────┬──────┘     │
              │            ▼            │
              │     ┌─────────────┐     │
              │     │  Phase 7    │     │
              └─────│  Deploy     │─────┤ (build/deploy fail)
                    └──────┬──────┘     │
                           ▼            │
                    ┌─────────────┐     │
                    │    DONE     │     │
                    └─────────────┘     │
                                         └──── Ralph Loop ◄────┘
```

## LangGraph Node Definition

Each phase is a LangGraph node:
- **State**: `{ essay_id, phase, status, errors, retry_count, artifacts }`
- **Edges**: Conditional — redirect to previous node on validation failure
- **Max retries**: 3 per phase, then escalate to human

## Reference Files

| File | Purpose |
|------|---------|
| `CLAUDE5.md` | Terse rules for AI agents writing essays |
| `formattingrequirements.md` | Full format spec for JSON, TTS, conversion |
| `scripts/generate-audio.mjs` | Single-essay audio generator |
| `scripts/generate-all-audio.mjs` | Batch audio generator (sequential) |
| `scripts/convert-blueprint-essays.mjs` | Markdown → JSON converter |
| `scripts/generate-graph-json.mjs` | Regenerates build data |
| `essayglobal/blueprints/` | Blueprint directory with all essay sources |
| `content/glossary/` | Essay, source, concept, art JSONs |
| `content/glossary/essays/` | All essay JSONs |
| `content/glossary/books/` | Album/book JSONs |
| `content/glossary/sources/` | Source reference JSONs |
| `content/glossary/concepts/` | Concept definitions |
| `content/glossary/art/` | Art metadata |
