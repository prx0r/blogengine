# Research Object — Structural Schema Spec

> The RO is not a consumer product. It is structured data that downstream
> products (essays, audio, video, journeys, chatbot context) consume.
> This document defines exactly what that data looks like.

---

## Principle: The RO is a Compilation Manifest

An RO is not a text file. It is a **manifest** that says:

1. What question does this answer?
2. Which sources contribute to the answer?
3. How is the answer organized?
4. What coverage exists? What's missing?
5. What version is this? What changed?
6. What downstream products depend on it?

The body passages are NOT the essay. They are the structured evidence that
the essay (and audio, and video) will be generated from.

---

## Top-Level Structure

```json
{
  "ro_id": "ro:ficino-daimon",
  "schema_version": 2,
  "title": "Ficino on the Daimon",
  "subtitle": null,
  "family": "thinker-topic",
  "status": "published",
  "current_version": "1.2.0",
  
  "summary": {
    "one_line": "Ficino's concept of the daimon as tutelary spirit, astrological mediator, and ontological intermediary.",
    "scope": "Ficino's published works and major secondary scholarship. Excludes Pico della Mirandola and later Renaissance interpretations.",
    "traditions": ["ficino", "renaissance_platonism", "neoplatonism"]
  },

  "sources": [],
  "body": [],
  "coverage": {},
  "versions": [],
  "dependencies": [],
  "issues": [],
  "outputs": [],
  "timeline": []
}
```

---

## Sources Manifest

Every source that contributes to the RO is tracked:

```json
{
  "sources": [
    {
      "source_id": "work:ficino-daemon-socratico",
      "tier": 2,
      "label": "Vieira — Marsílio Ficino sobre o daemon socrático",
      "first_added_in": "1.0.0",
      "last_reviewed_in": "1.2.0",
      "contribution": ["socratic_daimon", "apology_commentary"],
      "sections_affected": ["ontology", "socrates"],
      "passages_used": 4,
      "status": "active"
    },
    {
      "source_id": "work:kiosoglou-ficino-soul",
      "tier": 2,
      "label": "Kiosoglou — Marsilio Ficino and the Soul",
      "first_added_in": "1.1.0",
      "last_reviewed_in": "1.2.0",
      "contribution": ["soul_vehicle", "elements_of_theology"],
      "sections_affected": ["ontology", "soul"],
      "passages_used": 3,
      "status": "active"
    },
    {
      "source_id": "work:corrias-daemonic-reason",
      "tier": 2,
      "label": "Corrias — From Daemonic Reason to Daemonic Imagination",
      "first_added_in": null,
      "last_reviewed_in": null,
      "contribution": ["plotinus_comparison", "daemonic_imagination"],
      "sections_affected": null,
      "passages_used": 0,
      "status": "paywalled_stub"
    }
  ]
}
```

Key fields:
- `status: "active"` — currently included
- `status: "paywalled_stub"` — known but not accessible
- `status: "deprecated"` — was active, later removed
- `contribution[]` — what specific concepts/themes this source provides
- `sections_affected[]` — which sections of the RO use this source
- `passages_used` — count of extracted passages (0 = not yet extracted)

---

## Body — Structured Passages

Each body entry is a passage with provenance. NOT an essay paragraph.

```json
{
  "body": [
    {
      "passage_id": "p_001",
      "section": "ontology",
      "subsection": "socratic_origin",
      "kind": "source",
      "text": "Ficino identifies the Socratic daimon as the individual's tutelary spirit, a guardian assigned at birth...",
      "source_id": "work:ficino-daemon-socratico",
      "page_ref": "p. 45",
      "topics": ["socratic_daimon", "tutelary_spirit"],
      "notes": "Key passage — Ficino explicitly connects the daimon to natal astrology"
    },
    {
      "passage_id": "p_002",
      "section": "ontology",
      "subsection": "soul_vehicle",
      "kind": "source",
      "text": "The daimon serves as the vehicle of the soul, mediating between the immortal intellect and the mortal body...",
      "source_id": "work:kiosoglou-ficino-soul",
      "page_ref": null,
      "topics": ["soul_vehicle", "mediation"],
      "notes": null
    }
  ]
}
```

Key design decisions:
- **NO section headers as part of body.** Sections are metadata (`section`, `subsection` fields). The downstream renderer decides how to present sections.
- **Every passage traces to exactly one source.** No blended passages.
- **`kind` is always `"source"`.** This is a Tier 3 compilation. No AI writing.
- **`notes` are Hermes's observations** about the passage — structural notes, not commentary.
- **`page_ref`** allows direct lookup in the source PDF.

---

## Sections Taxonomy

Sections are how the RO organizes knowledge. They are NOT fixed headers. Each
RO family has a default section template, but any RO can add custom sections.

### Default Sections by Family

**Family 1 (Thinker on Topic):**
```
ontology         — What IS the concept? Definitions, distinctions.
epistemology     — How does the thinker know about it?
sources          — Which sources does the thinker draw on?
practice         — How does it relate to practice/ritual?
comparison       — How does it differ from related concepts?
evolution        — How did the thinker's view change over time?
reception        — How was this interpreted by later thinkers?
```

**Family 5 (Comparative):**
```
scope            — What is being compared and why?
dimension_1      — Comparison dimension 1 (e.g., ontological status)
dimension_2      — Comparison dimension 2 (e.g., practical function)
dimension_3      — Comparison dimension 3 (e.g., sources used)
points_of_agreement
points_of_disagreement
unresolved        — Questions neither thinker resolves
```

**Family 4 (Concept Evolution):**
```
ancient           — Pre-500 CE
medieval          — 500-1400 CE
renaissance       — 1400-1700 CE
modern            — 1700-1900 CE
contemporary      — 1900-present
```

Each section has a `coverage` score (0.0-1.0) and an `estimated_passages` count.

---

## Coverage Map

Tracks what's covered and what's missing at the section level:

```json
{
  "coverage": {
    "ontology": {
      "status": "substantial",
      "sources": ["work:ficino-daemon-socratico", "work:kiosoglou-ficino-soul"],
      "passage_count": 7,
      "estimated_completeness": 0.8,
      "gaps": [
        "Latin terminology analysis (genius vs daemon)",
        "Plotinus comparison not yet included"
      ]
    },
    "astrology": {
      "status": "partial",
      "sources": ["work:ficino-daemon-socratico"],
      "passage_count": 2,
      "estimated_completeness": 0.3,
      "gaps": [
        "Ficino's natal astrology framework",
        "Planetary mediation of the daimon",
        "Three Books on Life astrological sections"
      ]
    },
    "prayer": {
      "status": "missing",
      "sources": [],
      "passage_count": 0,
      "estimated_completeness": 0.0,
      "gaps": [
        "No sources acquired on Ficino's prayer practices regarding the daimon"
      ]
    }
  }
}
```

The `gaps[]` array doubles as `research_todos[]`. Each gap is a search query
Hermes can use to find new sources.

---

## Versions

```json
{
  "versions": [
    {
      "version": "1.0.0",
      "date": "2026-07-11",
      "type": "initial",
      "summary": "Initial compilation from 2 sources",
      "sources_added": ["work:ficino-daemon-socratico", "work:kiosoglou-ficino-soul"],
      "sources_removed": [],
      "passage_count": 7,
      "test_pass_rate": 0.8,
      "skill_id": "compile:default"
    },
    {
      "version": "1.1.0",
      "date": "2026-07-18",
      "type": "minor",
      "summary": "Added Voss passages on angelic daimon",
      "sources_added": ["work:voss-becoming-angel"],
      "sources_removed": [],
      "passage_count": 13,
      "test_pass_rate": 0.9,
      "skill_id": "compile:daimon-v1"
    },
    {
      "version": "1.2.0",
      "date": "2026-07-25",
      "type": "minor",
      "summary": "Restructured ontology section, added Latin terminology analysis",
      "sources_added": ["work:walker-spiritual-magic"],
      "sources_removed": [],
      "passage_count": 16,
      "test_pass_rate": 0.95,
      "skill_id": "compile:daimon-v2"
    }
  ]
}
```

- `skill_id` — the Hermes skill that produced this version. Ties the learning loop to the output.
- `test_pass_rate` — from WiCER-style diagnostic tests. 1.0 = all tests pass.

---

## Dependency Tracking

```json
{
  "dependencies": [
    {
      "object_id": "ro:plotinus-daimon",
      "min_version": "0.8.0",
      "current_version": null,
      "relationship": "extends",
      "passages_used": 0
    },
    {
      "object_id": "ro:concept-daimon",
      "min_version": "1.0.0",
      "current_version": null,
      "relationship": "defines_concept",
      "passages_used": 0
    }
  ]
}
```

When a dependency's `current_version` is null, it means the RO was built from
raw sources, not from another RO. When populated, it means the RO is composed
from other ROs (recursive composition).

---

## Issues

```json
{
  "issues": [
    {
      "id": "issue-001",
      "type": "coverage_gap",
      "title": "Missing prayer section",
      "description": "Ficino's prayer practices regarding the daimon are not covered.",
      "suggested_sources": [
        "Ficino's Letters (Book 1, Epistles on Prayer)",
        "Kristeller's survey of Ficino's spiritual practices"
      ],
      "status": "open",
      "created": "2026-07-11",
      "auto_generated": true
    },
    {
      "id": "issue-002",
      "type": "potential_error",
      "title": "Verify Walker's claim about genius identification",
      "description": "Walker claims Ficino equated genius with daimon. Kiosoglou disputes this. Both passages are included but the disagreement is not flagged.",
      "suggested_sources": ["Original Latin text of Ficino's Letters"],
      "status": "open",
      "created": "2026-07-18",
      "auto_generated": true
    }
  ]
}
```

Issues are auto-generated from:
- Coverage gaps (coverage.status = "missing" → create issue)
- Source disagreements (two sources contradict → create issue)
- Lint failures (broken citation → create issue)
- Test failures (test doesn't pass → create issue)

---

## Outputs

```json
{
  "outputs": [
    {
      "output_id": "essay:ficino-daimon",
      "type": "essay",
      "version": "1",
      "ro_version": "1.2.0",
      "url": "https://re-rendering-atlas.tradesprior.workers.dev/essay/ficino-daimon",
      "audio_url": "/audio/ficino-daimon.mp3",
      "published_at": "2026-07-12",
      "needs_update": false
    }
  ]
}
```

`needs_update` is set to `true` when the RO version is newer than the output's
`ro_version`. A weekly cron checks for drift.

---

## Commentary Labeling (Better JSON for Content)

The existing work JSONs (content/works/) need better labeling. Proposal:

```json
{
  "work_id": "work:ficino-daemon-socratico",
  "tier": 2,
  "title": "Marsílio Ficino sobre o daemon socrático em seu comentário à Apologia de Sócrates",
  
  "commentary_on": {
    "primary_author": "Marsilio Ficino",
    "primary_work": "Commentary on Plato's Apology of Socrates",
    "primary_topic": "socratic daimon"
  },

  "scholarly_contribution": {
    "type": "textual_analysis",
    "claims": [
      "Ficino identifies the Socratic daimon as a tutelary spirit",
      "The daimon mediates between the individual and the divine",
      "Ficino's daimon is distinct from the Christian guardian angel"
    ],
    "methodology": "philological commentary analysis",
    "sources_used": ["Ficino's Latin text of Apology commentary", "Plato's Apology"]
  },

  "concepts": ["socratic_daimon", "tutelary_spirit", "ficino", "apology"],
  
  "relevance_to_ros": {
    "ro:ficino-daimon": "primary source for ontology section",
    "ro:daimon-across-platonists": "supports the Socratic origin claim"
  }
}
```

This makes the work JSON navigable by:
- What it comments on (`commentary_on.primary_author`, `.primary_work`, `.primary_topic`)
- What it claims (`scholarly_contribution.claims[]`)
- Which ROs it feeds (`relevance_to_ros{}`)

---

## Navigation: How to Find Things

### Concept → Works → ROs → Outputs

```
A user wants: "What does Ficino say about the daimon?"

1. Search concepts for "daimon"
   → concept:daimon.json lists works that discuss it

2. Filter works by tier=1, author=ficino
   → work:ficino-three-books, work:ficino-platonic-theology

3. Search ROs for "ficino" + "daimon"
   → ro:ficino-daimon (version 1.2.0)

4. Check RO's outputs
   → essay:ficino-daimon (audio available)
```

### Directory Index (auto-generated)

```
content/research-objects/_index.json

{
  "by_family": {
    "thinker-topic": ["ro:ficino-daimon", "ro:ficino-spiritus", "ro:ficino-astrology"],
    "comparative": ["ro:ficino-vs-pico"],
    "concept-evolution": ["ro:daimon-evolution"]
  },
  "by_tradition": {
    "ficino": ["ro:ficino-daimon", "ro:ficino-spiritus", "ro:ficino-astrology", "ro:ficino-vs-pico"],
    "neoplatonism": ["ro:ficino-daimon", "ro:plotinus-daimon", "ro:daimon-evolution"]
  },
  "by_status": {
    "idea": ["ro:ficino-astrology"],
    "collecting": ["ro:plotinus-daimon"],
    "draft": ["ro:daimon-evolution"],
    "published": ["ro:ficino-daimon", "ro:ficino-spiritus"],
    "stale": []
  }
}
```

---

## Validation Pass (Fixes Flaw 5)

The simplest validation that catches most content errors:

### Post-Compilation Validation Script

```python
def validate_ro(ro):
    errors = []
    
    # 1. Every passage traces to a source in sources[]
    for passage in ro.body:
        if passage.source_id not in [s.source_id for s in ro.sources]:
            errors.append(f"Passage {passage.passage_id} references unknown source {passage.source_id}")
    
    # 2. Every source in sources[] is used by at least one passage
    used_sources = set(p.source_id for p in ro.body)
    for s in ro.sources:
        if s.source_id not in used_sources:
            errors.append(f"Source {s.source_id} has 0 passages — either add passages or remove source")
    
    # 3. No duplicate passages (same text, different IDs)
    texts_seen = {}
    for passage in ro.body:
        if passage.text in texts_seen:
            errors.append(f"Duplicate passage: {passage.passage_id} and {texts_seen[passage.text]}")
        texts_seen[passage.text] = passage.passage_id
    
    # 4. Every section in coverage has at least one passage
    covered_sections = set(p.section for p in ro.body)
    for section in ro.coverage:
        if section not in covered_sections:
            errors.append(f"Section '{section}' has coverage entry but no passages")
    
    # 5. Cross-source consistency check (simplified WiCER diagnostic)
    for issue in ro.issues:
        if issue.type == "potential_error":
            # Flag it — don't block, but surface it
            pass
    
    return errors
```

This catches:
- Orphan passages (pointing to non-existent sources)
- Orphan sources (not used by any passage)
- Duplicate content
- Coverage/section mismatches
- Known contradictions (from issues)

It does NOT catch:
- Subtle misattributions (wrong source, plausible text)
- Conceptual conflations (daimon vs angel)
- Missing facts (coverage gaps that the system doesn't know about)

Those require the Error Book + human verification (the hard problem).

---

## File Tree

```
content/research-objects/
  _index.json                          ← auto-generated directory index
  error-book.json                      ← persistent correction records
  
  ro-ficino-daimon/
    ro.json                            ← the RO (schema above)
    changelog.md                       ← human-readable version log
    
  ro-plotinus-daimon/
    ro.json
    changelog.md
```

Single-file ROs (ro.json in a directory) allow adding supporting files later
(images, data exports) without changing the schema.

---

## Summary

| Question | Answer |
|---|---|
| Is the RO consumer-facing? | No. It's structured data. Essays are consumer-facing. |
| What is the RO's job? | To manifest one answer to one scholarly question, with full provenance. |
| How is it navigable? | By concept → work → RO → output. Plus directory index by family, tradition, status. |
| How do we label commentaries? | `commentary_on{}` + `scholarly_contribution{}` + `relevance_to_ros{}` |
| How do we fix flaw 5? | Post-compilation validation script: orphan sources, orphan passages, duplicates, coverage mismatches. Plus Error Book for the hard cases. |
| What format? | Single JSON file per RO in a directory. Supporting files co-located. |
