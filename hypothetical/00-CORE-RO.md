# Research Object — Core Schema

The fundamental unit. Everything else builds on this.

```json
{
  "ro_id": "ro:ficino-daimon",
  "title": "Ficino on the Daimon",
  "family": "thinker-topic",
  "status": "draft",
  "sources": [{"id": "work:ficino-daemon-socratico", "tier": 2, "status": "active"}],
  "body": [{"id": "p_001", "section": "ontology", "kind": "source", "text": "...", "source": "work:ficino-daemon-socratico"}],
  "coverage": {"ontology": {"status": "partial", "passage_count": 2, "gaps": ["Latin terminology"]}},
  "issues": [{"type": "coverage_gap", "section": "astrology", "note": "Need Voss"}]
}
```

**Design:** JSON file in `content/research-objects/ro-{slug}/ro.json`. Git is the version history — no `versions[]` array. Statuses: `idea → draft → review → published → stale`. Four states, no elaborate state machine.

**Failure modes:**
- passages_used and sources[] can drift → auto-generated tests catch this
- coverage gaps grow unbounded → issues track them, human closes when resolved
- RO never reaches "published" → not a failure, it's a draft
