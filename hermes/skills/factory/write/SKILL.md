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

**This is TYPE A.** You write an original essay: extract passages from a source, write your own commentary and analysis, interleave them with source text in a 60/25/15 ratio, generate audio with dual-voice, and deploy.

If the user wants to publish an existing paper as-is (no writing, no commentary), use `/publish-paper` (Type B) instead.

## Comparison

| | Type A: Write Essay | Type B: Publish Paper |
|---|---|---|
| What you do | Write original content + interleave with quotes | Format existing text as JSON + audio |
| Body blocks | `ai` (commentary) + `source` (quotes) + `summary` | ALL `source` — paper's own words |
| Voice | Dual: female (commentary) + male (quotes) | Single: male (entire paper) |
| When to use | User says "write an essay about X" | User says "publish this paper" or "add to collection" |
| Skill | `/write-and-publish` | `/publish-paper` |

Full 8-phase pipeline: classify source → extract passages → convert to JSON → glossary integration → art matching → audio generation → build → deploy.

Each phase has a validation gate. If validation fails, loop back with max 3 retries per phase.

## When to Use
- Manual: "Write an essay about {topic} from {source}"
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
