# Vision 4: Comparative Engine — Grounded

**Core idea:** When two sources disagree, that disagreement IS content. Surface it as a standalone RO.

## Implementation

Disagreement detection is manual (seeded by the dreaming cycle):

```json
{
  "ro_id": "ro:disagreement-walker-voss",
  "title": "Walker vs Voss on Ficino's Daimon",
  "type": "disagreement",
  "sources": [
    {"id": "work:walker-spiritual-magic", "position": "daimon = genius", "passages": ["p_001"]},
    {"id": "work:voss-becoming-angel", "position": "daimon != genius", "passages": ["p_002"]}
  ],
  "body": [
    {"id": "p_001", "kind": "source", "text": "[Walker: Ficino equated genius with daimon]", "source": "work:walker-spiritual-magic"},
    {"id": "p_002", "kind": "source", "text": "[Voss: Ficino distinguished genius from daimon]", "source": "work:voss-becoming-angel"}
  ],
  "resolution": null
}
```

Auto-detection is a simple text match within RO body:
```python
def detect_contradictions(ro):
    """Find passages that directly contradict each other."""
    contradictions = []
    for i, p1 in enumerate(ro.get("body", [])):
        for p2 in ro.get("body", [])[i+1:]:
            if p1.get("source") == p2.get("source"):
                continue  # same source, can't contradict itself
            # Check if they discuss same topic but opposite claims
            shared = set(p1.get("topics", [])) & set(p2.get("topics", []))
            if shared:
                contradictions.append({
                    "topic": list(shared)[0],
                    "p_a": p1["id"],
                    "p_b": p2["id"],
                    "sources": [p1["source"], p2["source"]]
                })
    return contradictions
```

**Resolution is always null** — Hermes never resolves disagreements. It surfaces them. Resolution requires human judgment.

## What It Can't Do

- Can't detect semantic contradiction (same topic, different claim, different wording)
- Can't evaluate which position is better supported
- Can't auto-create disagreement ROs (requires human to confirm a real contradiction exists)

## Test

```
Given: RO body has 2 passages about "daimon origin" from different sources
When: detect_contradictions(ro) runs
Then: should flag both passages as potentially contradictory
```

## Failure Modes

| Failure | Detection | Recovery |
|---|---|---|
| False positive (sources agree, not contradict) | Human reviews, says "not contradictory" | Delete the disagreement RO |
| False negative (sources contradict, not detected) | Test fails — user notices | Manual entry through issues[] |
| Disagreement RO has no resolution for years | `resolution: null` is correct scholarship | No action needed |
