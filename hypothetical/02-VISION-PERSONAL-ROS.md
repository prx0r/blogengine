# Vision 2: Personal ROs — Grounded

**Core idea:** The user's diary entries become Tier 1 source material. Not NLP — explicit tag matching only.

## Implementation

The user tags diary entries manually (mood, energy, tags):
```json
{
  "date": "2026-07-11",
  "text": "Had a breakthrough in writing today. Mercury was active.",
  "mood": 4, "energy": 3,
  "tags": ["mercury", "writing", "creative_flow"]
}
```

Personal ROs compile these entries around a concept:
```json
{
  "ro_id": "ro:personal-mercury",
  "title": "My Relationship with Mercury",
  "type": "personal",
  "visibility": "private",
  "body": [{"text": "Mercury active → wrote 3x more", "source_id": "journal:2026-07-11"}],
  "linked_ros": ["ro:ficino-daimon"]
}
```

**Tag-based bridging** (not NLP):
```
mercury tag → matches concept:mercury → links to ro:ficino-daimon via shared concept
No NLP. No sentiment. No inference. Just tag matching.
```

## Privacy

- `content/personal/` — NOT in git (listed in .gitignore)
- Personal ROs never pushed, never deployed
- Only linked to public ROs via `linked_ros[]` array

## What It Can't Do

- Can't auto-tag entries (NLP is unreliable, expensive, speculative)
- Can't detect "I felt blocked" = Saturn unless user explicitly tags "saturn"
- Can't merge personal and scholarly ROs (different tiers, different privacy models)

## Test

```
Given: diary entry tagged ["mercury", "writing"]
When: run personal_ro_compiler()
Then: ro:personal-mercury exists
And: ro:personal-mercury.linked_ros contains ro:ficino-daimon (if it also tags mercury)
```

## Failure Modes

| Failure | Detection | Recovery |
|---|---|---|
| User never tags entries | No personal ROs created | Not a failure, expected |
| Wrong tag → wrong link | User sees unrelated RO in linked_ros | Remove the tag |
| D1 database unavailable | API call fails | Log error, retry next cron |
| Personal RO grows too large | > 100 entries | Archive oldest entries annually |
