# Build Notes

## Current State (2026-07-15)

### What's Working

| Component | Status | Location |
|-----------|--------|----------|
| UNO parser (738 blocks, 6 lineages) | ✅ | `geometricengine/src/parser/uno_parser.py` |
| CO export (738 COs) | ✅ | `content/commentaries/uno/` (3MB) |
| CO index loader | ✅ | `geometricengine/src/tetrahermes_pipeline.py` |
| Thompson selector (Beta posterior) | ✅ | `tetrahermes_pipeline.py` |
| Error Book (constraint log) | ✅ | `content/commentaries/error-book.json` |
| State classifier (keyword) | ⚠️ Works, needs embeddings | `tetrahermes_pipeline.py` |
| Lineage detection (keyword) | ⚠️ Works, needs refinement | `tetrahermes_pipeline.py` |
| CO adapter (voice preservation) | ⚠️ Works for exact matches, needs DeepSeek for regen | `tetrahermes_pipeline.py` |
| Hermes gateway (Telegram) | ✅ Running as systemd |
| Acquisition pipeline | ✅ Running 24/7 |
| Cloudflare site | ✅ Live |

### What's Running

```bash
# Hermes Telegram gateway
systemctl --user status hermes-gateway

# Acquisition
pgrep -af "cron-acquire|scholar-expansion"

# Pipeline test
python3 geometricengine/src/tetrahermes_pipeline.py
```

### Data Layer

```
content/
  commentaries/           ← NEW — 738 pedagogical annotations
    uno/                  ← 738 COs exported from UNO
      _index.json         ← lineage counts, top states
    exemplar-co.json      ← schema reference
    error-book.json       ← constraint log (cold start)
    promoted/             ← future canonical COs
    flagged/              ← future COs needing review
    dream/                ← future dream-cycle candidates
  research-objects/       ← 169 scholarly compilations
  works/                  ← 130 cataloged papers
  glossary/
    concepts/             ← 76 concepts
    essays/               ← 70 essays with audio
```

### Next Build Steps

Priority order:

1. **Embedding classifier** — Replace keyword state detection with sentence-transformers (already in geometricengine's embed.py). Needs: 50 prototype embeddings, cosine distance, entropy-based uncertainty.

2. **Lineage-biased selection** — When lineage is clear from text (Advaita keywords, Socratic keywords), bias Thompson toward that lineage. When unclear, use highest-confidence lineage from keyword match.

3. **DeepSeek voice-preserving adapter** — When a CO's visible_response references original episode context (therapy scenario, specific person), have DeepSeek regenerate in the teacher's voice using the PEDAGOGY as constraint. The prompt should include the CO's lineage, register vector, and a sample of the teacher's actual words — then DeepSeek generates new words in the same voice.

4. **RO retrieval** — When a CO has `linked_ros`, retrieve the RO passages and inject them as context before the response. The adapter already supports this.

5. **UNKNOWN function handling** — 22 COs have `function_id: UNKNOWN`. These need manual annotation or filtering from Thompson selection.

### Known Issues

- Classifier misclassifies Advaita utterances as Socratic ("I am not the body" → resist_intellectually)
- CO responses reference original episode context (therapy scenario for Advaita questions)
- No embedding model loaded yet (sentence-transformers)
- No DeepSeek API integration yet
- Error Book cold start (no feedback data yet)
- Buddhist lineage only has 8 COs (not enough for Thompson to work well)
