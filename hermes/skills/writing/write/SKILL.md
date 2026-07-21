---
name: write
description: TYPE A — Original essay writing: extract passages, write commentary, interleave with source text, audio, deploy
version: 1.0.0
author: Thomas Prior
metadata:
  hermes:
    tags: [essay, writing, publishing, audio, type-a]
    requires_tools: [web_search, web_extract]
---

# Write and Publish — Type A (Hermes Essay)

**This is TYPE A.** You write an original essay using the 3-Pass Architecture.

Read `hermes/notes/writing/3-pass-architecture.md` — it is your complete procedure. Read `user-style.md`, `writingtips.md`, `goodprose.md`, `antislopguide.md`, and `slopnotes.md` before writing.

## Comparison

| | Type A: Write Essay | Type B: Publish Paper |
|---|---|---|
| What you do | Write original content + interleave with quotes | Format existing text as JSON + audio |
| Body blocks | `ai` (commentary) + `source` (quotes) | ALL `source` — paper's own words |
| Voice | Dual: female (commentary) + male (quotes) | Single: male (entire paper) |
| When to use | User says "write an essay about X" | User says "publish this paper" |
| Writing process | 3-pass (Dump → Refine → Shape) | N/A |
| Skill | `/write-and-publish` | `/publish-paper` |

## The 3-Pass Architecture

### Pass 1: Source-Maximal Dump
- 70% source, 30% AI
- AI blocks ≤ 40 words
- Zero NARR, zero NEG, zero paraphrasing
- Hook as first non-source block

**Validation gates:** P1_A through P1_F must ALL pass. Run:
```bash
python3 scripts/validate-essay-pass.py content/glossary/essays/{essay_id}.json 1
```
Exit code 0 = ALL PASS. Exit code 1 = FAIL. If ANY gate fails → DELETE the essay file immediately with `rm content/glossary/essays/{essay_id}.json` and retry the pass from scratch (max 3). Do NOT proceed to the next pass unless exit code is 0. The validation script is authoritative — if it says FAIL, the essay is not saved.

### Pass 2: Slop Removal + Texture
- Replace every abstraction with a concrete image
- Add ≥1 unexpected concrete noun per AI block
- Kill neutral summarizer voice — adopt stance
- Check every AI block against the anti-slop checklist

**Validation gates:** P2_A through P2_F must ALL pass. Run:
```bash
python3 scripts/validate-essay-pass.py content/glossary/essays/{essay_id}.json 2
```
Exit code 0 = ALL PASS. Exit code 1 = FAIL. If ANY gate fails → DELETE the essay file and retry (max 3). Do NOT proceed unless exit code is 0.

### Pass 3: Emotional Arc
- Hook → second hook (at 40%) → climax → return
- Ending circles back to opening concretely
- Ending shares NO key words with the last source block
- Read aloud test: does it sound like a lecture? If so, rewrite.

**Validation gates:** P3_A through P3_H must ALL pass. Run:
```bash
python3 scripts/validate-essay-pass.py content/glossary/essays/{essay_id}.json 3
```
Exit code 0 = ALL PASS. Exit code 1 = FAIL. If ANY gate fails → DELETE the essay file and retry (max 3). Do NOT save unless exit code is 0.

### After All 3 Passes Pass: Register + Proceed

Before saving, check if this RO already has an essay registered:
```bash
python3 scripts/register-essay.py --check {ro_id}
```

If `has_essay` is `true` → STOP. The RO already has an essay. Inform the user.

If `has_essay` is `false` → save the essay, then register it:
```bash
python3 scripts/register-essay.py {ro_id} {essay_id}
```

Then proceed to glossary integration, audio, deploy.

Full 8-phase pipeline: classify → extract → **3-pass write** → glossary → art → audio → build → deploy.

Each phase has a validation gate. If validation fails, loop back with max 3 retries per phase.

## When to Use
- "Write an essay about {topic} from {source}"
- Only use if the source text is available in the project files

## Procedure

### Phase 1: Classify Source Type
Use `terminal` to check the source:
```bash
ls content/glossary/sources/books/ blueprints/source_texts/ essayglobal/blueprints/
```

Classify the source:
- **Thesis-style**: Single continuous argument → extract key passages
- **Condensed/encyclopedic**: Short entries → extract whole entries that match the theme

**Validation**: Confirm the source file exists and is readable (> 100 lines)

### Phase 2: Extract Passages
Read the source file:
```bash
wc -l <source-file>
head -n 50 <source-file>
```

Extract passages that:
1. Define key terms
2. Make central arguments
3. Use striking imagery or analogies
4. Contrast with other traditions

Save as passage packs: `{ source, reference, text, theme }`

**Validation**: At least 4 passage packs extracted. Each ≥ 3 sentences.

### Phase 3: Convert to Essay JSON
Format as a JSON file in `content/glossary/essays/`:

```json
{
  "id": "author-topic-slug",
  "title": "The Essay Title",
  "author": "Source Author",
  "book": "book-id",
  "series": 1,
  "order": 1,
  "body": [
    {
      "type": "text",
      "text": "Connective tissue paragraph introducing the first passage."
    },
    {
      "type": "passage",
      "source": "Book Title, Chapter X",
      "text": "The actual passage text..."
    },
    {
      "type": "text",
      "text": "Commentary connecting this passage to the next."
    }
  ],
  "concepts": ["concept-slug-1", "concept-slug-2"]
}
```

The essay should be ~60% source passages, ~25% framing/connective tissue, ~15% analysis.

**Validation**: JSON is valid. All referenced concept slugs exist in `content/glossary/concepts/`.

### Phase 4: Glossary Integration
For each concept in `concepts[]`:
- If the slug doesn't exist in `content/glossary/concepts/`, create it
- Check `content/glossary/books/{book-id}.json` and add the essay ID to the book's essay list

**Validation**: All concepts resolved. Book JSON includes the new essay ID.

### Phase 5: Art Matching
For each passage in the essay, find matching art:
```bash
cat content/glossary/art/*.json | grep -i "<concept>"
```

Add `art_id` to body blocks where a match is found.

**Validation**: At least 1 art match for every 3 passages (optional — skip if none found).

### Phase 6: Audio Generation
```bash
cd /root/projects/blog
node scripts/generate-audio.mjs <essay-id>
```

**Validation**: Audio file exists at `public/audio/<essay-id>.mp3` and is > 0 bytes.

### Phase 7: Regenerate Build Data
```bash
node scripts/generate-graph-json.mjs
```

**Validation**: Script exits 0.

### Phase 8: Build & Deploy
```bash
npm run cf:build
npm run cf:deploy
```

**Validation**: Deployment succeeds. Verify the essay loads at `/essays/<essay-id>` and audio plays.

## Pitfalls
- If audio generation fails (Kokoro OOM, etc.), retry with `--model edge-tts` fallback
- If the build fails, check TypeScript errors first: `npx tsc --noEmit`
- Don't deploy without validation — check the essay loads
- If no source text exists for the topic, say so — don't hallucinate passages

## Verification
- Essay JSON is valid and follows the format
- Audio file is generated
- Build succeeds
- Deployed essay loads and audio plays
