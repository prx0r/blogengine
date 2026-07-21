# Vision 3: Dreaming Mind — Grounded

**Core idea:** Weekly review of ROs to find cross-domain patterns. Budget-limited, sample-based, not comprehensive.

## Implementation

```yaml
cron: "0 2 * * 0"  # Weekly, Sunday 2am
budget: 30000  # tokens — ~$0.15
action: |
  Pick 3 random ROs from the corpus.
  For each pair of the 3, compare their topics and coverage.
  If they discuss the same concept from different traditions:
    → Log: "ro:ficino-daimon and ro:corbin-imaginal both discuss 'intermediary beings'"
    → Suggest: new comparative RO could bridge them
  If a topic appears in 2+ ROs but neither covers it well:
    → Log: "angelology is mentioned in 2 ROs but neither has a dedicated section"
    → Suggest: create or expand coverage
  Write dream log entry.
  Budget limit: 30K tokens. Stop when exhausted.
```

## Dream Log Format

Stored at `hermes/notes/dream-log.md`:
```markdown
# Dream Log — 2026-07-12

## Pattern: Intermediary Beings
- ro:ficino-daimon discusses daimon as intermediary
- ro:corbin-imaginal discusses angel as intermediary
- Neither mentions the Arabic barzakh tradition
- **Suggestion**: New RO "The Intermediary Across Traditions"

## Gap: Angelology
- 2 ROs mention angels but neither has a dedicated section
- Sources exist in library (Stang on Corbin's angelology)
- **Suggestion**: Expand ontology section in both ROs
```

## What It Can't Do

- Can't detect patterns it doesn't know to look for (no unsupervised clustering)
- Can't create new ROs autonomously — only suggests (human must approve)
- Can't review ALL ROs — sampling only, some patterns missed

## Test

```
Given: ro:ficino-daimon and ro:corbin-imaginal both discuss intermediaries
When: dreaming cycle runs
Then: dream-log.md should contain entry about intermediary beings
```

## Failure Modes

| Failure | Detection | Recovery |
|---|---|---|
| Budget exhausted before finding patterns | Log shows partial run | Increase budget or reduce sample size |
| Sample never includes the most interesting pair | Random sampling misses it | Run more frequently (daily, not weekly) |
| Dream log grows too large to read | > 100 entries | Archive entries older than 6 months |
| LLM hallucinates a pattern | Dream log is speculative | Mark as "unverified" — human checks |
