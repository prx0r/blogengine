# Essay Writer — AI Prompt & Workflow

## Model

**DeepSeek v4 Flash** via opencode Go API (`https://opencode.ai/zen/go/v1/chat/completions`)

**Settings:** temperature 0.3, max_tokens 4096

## Context

This prompt is for an AI that produces condensed essays from source material. The output format is defined in `essayprocess.md` — read that first.

## Input

The AI receives:
- The `essayprocess.md` spec as system context
- A source text (raw or cleaned) as the user message
- Existing glossary concepts (if any) to match against

## Output Format (JSON)

The AI must return valid JSON matching this shape:

```json
{
  "source": {
    "title": "Mundus Imaginalis",
    "author": "Henry Corbin",
    "type": "pdf",
    "tradition": ["Islamic mysticism", "Sufism", "Iranian philosophy"],
    "notes": ""
  },
  "essay": {
    "id": "source_001_mundus_imaginalis",
    "title": "Mundus Imaginalis — Condensed Reader",
    "type": "condensed_source",
    "source_ids": ["source_001"],
    "author": "Henry Corbin",
    "concepts": ["Imaginal World", "Active Imagination"],
    "prerequisites": [],
    "body": []
  },
  "concepts": [],
  "existing_concept_matches": []
}
```

## Body Block Rules

1. Every `body` entry MUST have `kind` and `text` only.
2. `kind` must be one of: `"source"`, `"ai"`, `"summary"`.
3. **`source` blocks** = the author's own words, quoted or closely paraphrased. These should be substantial — let Corbin speak.
4. **`ai` blocks** = your explanatory links and clarifications. Keep them short and clear.
5. **`summary` blocks** = compressed low-signal sections. Use for historical background, extended examples, or tangents.
6. Alternate between kinds naturally. Typical rhythm: ai → source → ai → source → summary → source → ai.

## TTS / Audio Constraint

The final essay body will be read aloud by a text-to-speech engine (edge-tts, female American voice). Therefore:

- **No citations** — no "(Corbin, 1969)" or "[1]" or footnotes inline
- **No markdown formatting** — no `*asterisks*`, no `**bold**`, no headings
- **No lists with special characters** — if needed, write "first... second... third..."
- **No abbreviations that would be read wrong** — write "for example" not "e.g.", "that is" not "i.e."
- **Punctuation for reading** — use commas and periods naturally, avoid semicolons and dashes where possible
- **No parenthetical asides** — if something is worth saying, say it in a sentence

## Concept Rules

1. Extract 3–5 concepts from the source.
2. Each concept needs: `id`, `name`, `definition` (1-2 sentences), `tradition`, `synonyms` (cross-tradition equivalents), `related_to`.
3. Check `existing_concept_matches` against any existing glossary. If a concept already exists, reference it rather than duplicating.
4. Concepts must be specific (see essayprocess.md rule).

## Quality Check (self-review)

After writing the essay, the AI should verify:

1. **Does every source block trace back to an actual passage in the source text?** If not, flag it.
2. **Is the main argument preserved?** Could someone who hasn't read the original understand it?
3. **Are there any TTS-unfriendly artifacts?** Scan for parentheses, citations, abbreviations, markdown.
4. **Are the ai blocks actually helpful?** Do they explain why the source passage matters, not just repeat it?
5. **Is the output long enough?** A condensed essay should be roughly 15–30% of the original, not 5%.

## Workflow (for the system, not the AI)

```text
1. User provides a source file (PDF, text, URL)
2. Extract clean text from source
3. Send prompt + source to DeepSeek v4 Flash
4. Parse returned JSON
5. Save source JSON → content/glossary/sources/
6. Save essay JSON → content/glossary/essays/
7. Save concept JSONs → content/glossary/concepts/
8. Run `npm run generate:audio -- <essay-id>`
9. Run `npm run cf:deploy`
```

## Future Improvements (experimental)

- Two-pass: first pass extracts all source quotes, second pass arranges them with ai/summary blocks
- Citation stripping pass before feeding to TTS
- Manual review step before audio generation
- Difficulty estimation via prerequisite chain length
