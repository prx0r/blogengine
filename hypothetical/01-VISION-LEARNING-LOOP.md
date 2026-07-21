# Vision 1: Learning Loop — Grounded

**Core idea:** After an RO is published, compare it against its source texts. Identify gaps. Write constraints to the Error Book. Don't write skills — the Error Book IS the learning mechanism.

## Implementation

```python
def review_ro(ro):
    """Compare RO against its source texts. Write constraints for gaps."""
    for source in ro.get("sources", []):
        if source.get("status") != "active":
            continue
        source_text = extract_source_text(source["id"])
        if not source_text:
            continue
        # Check: does the RO capture the source's key topics?
        source_topics = extract_topics(source_text)
        ro_topics = extract_ro_topics(ro)
        missing = source_topics - ro_topics
        for topic in missing:
            error_book.add_constraint(
                f"When compiling from {source['id']}, include coverage of {topic}"
            )
```

**Error Book constraint accumulation** (from Retrieval as Reasoning, verified):
- Each review pass detects missing topics
- Missing topics become constraints: "When compiling from work:X, include coverage of Y"
- Constraints are prepended to future compilation prompts
- No skill writing. No prompt engineering. Just constraint accumulation.

## What It Can't Do

- It can't detect SUBTLE errors (misattribution, conflation) — those need the Error Book's manual entries
- It can't improve prose quality — that's a rendering concern, not a compilation concern
- It can't catch missing sources that it doesn't know exist

## Test

```
Given: RO has sources [A, B], source A discusses topic X
When: run review_ro(ro)
Then: constraint "When compiling from A, include coverage of X" should exist in Error Book
```

## Failure Modes

| Failure | Detection | Recovery |
|---|---|---|
| Source text not extractable (foreign language) | `language_gate` flag | Skip source in review |
| Wrong constraint generated (topic not actually in source) | Error Book accumulates bad rules | Manual deletion from Error Book |
| Too many constraints (50+) → prompt bloat | LLM starts ignoring them | Archive constraints older than 90 days |
| Source text is a scan (no extractable text) | `pdftotext` returns < 100 chars | Flag source as "unreviewable" |
