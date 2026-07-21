# Object Model Reference

## Work (Work JSON)

Raw source converted to structured metadata. Input to the factory pipeline.

**D1 Table:** `works`
**R2 Key:** `sources/{work_id}.json`

| Field | Type | Description |
|-------|------|-------------|
| work_id | TEXT PK | work:{slug} |
| title | TEXT | Full title |
| authors | JSON | [{ name, author_id }] |
| publication_year | INT | |
| publication_type | TEXT | article, book, translation, etc. |
| language | TEXT | en, hi, sa, etc. |
| tier | INT | 1 = primary source, 2 = scholarly commentary |
| topics | JSON | [topic1, topic2] |
| tradition | JSON | [tradition1] |
| abstract | TEXT | |
| body_clean | TEXT | Stripped text for passage extraction |
| pdf_path | TEXT | R2 key to original PDF |
| source_url | TEXT | Original URL |
| quality_score | FLOAT | 0-1 |
| commentary_on | JSON | { primary_author, primary_work, primary_topic } |
| scholarly_contribution | JSON | { type, claims[], methodology, sources_used[] } |
| concepts | JSON | [{ concept, weight }] |
| relevance_to_ros | JSON | [{ ro_id, relevance_score }] |
| created_at | TEXT | ISO date |
| updated_at | TEXT | ISO date |

## RO (Research Object)

Compiled knowledge around one bounded scholarly question. Versioned, source-tracked.

**D1 Table:** `research_objects`
**R2 Key:** `ros/{ro_id}/passages.json`

| Field | Type | Description |
|-------|------|-------------|
| ro_id | TEXT PK | ro:{slug} |
| title | TEXT | Human-readable question |
| family | TEXT | thinker-topic, comparative, concept-evolution, etc. |
| status | TEXT | idea, collecting, draft, review, published, stale, improving |
| version | TEXT | semver: 1.2.0 |
| schema_version | INT | currently 2 |
| one_line | TEXT | One-sentence summary |
| scope | TEXT | Scope description |
| traditions | JSON | ["tradition1"] |
| passage_count | INT | Number of passages |
| coverage | JSON | Per-section completeness map |
| dependencies | JSON | [{ object_id, min_version, relationship }] |
| issues | JSON | [{ id, type, title, status }] |
| outputs | JSON | [{ output_id, type, ro_version, url }] |
| sources | JSON | [{ source_id, tier, label }] |
| timeline | JSON | [{ version, date, type, summary }] |
| created_at | TEXT | |
| updated_at | TEXT | |

**R2 Object:** `ros/{ro_id}/passages.json`

```json
{
  "ro_id": "ro:example",
  "passages": [
    {
      "passage_id": "passage-001",
      "section": "metaphysics",
      "subsection": "causality",
      "kind": "source",
      "text": "The primary source text...",
      "source_id": "work:example-work",
      "page_ref": "p. 45",
      "topics": ["causality", "emanation"],
      "notes": "Key passage on causal chain"
    }
  ]
}
```

## PO (Philosopher Object)

A philosopher as a reusable content asset library.

**D1 Table:** `philosopher_objects`

| Field | Type | Description |
|-------|------|-------------|
| po_id | TEXT PK | po:{slug} |
| name | TEXT | Full name |
| era | TEXT | 950-1020 CE |
| tradition | TEXT | Primary tradition |
| traditions | JSON | [tags] |
| metaphysics_summary | TEXT | |
| key_terms | JSON | [{ term, definition, ro_id }] |
| core_claim | TEXT | Central philosophical claim |
| signature_ideas | JSON | [{ idea, source_ro }] |
| art_ids | JSON | [art_id references] |
| quote_ids | JSON | [{ quote_id, source_ro, passage_id }] |
| primary_sources | JSON | [{ work, ro_id }] |
| affinities | JSON | [{ type, target, note }] |
| scenarios | JSON | [{ scenario, response, tone }] |
| pipeline_ready | BOOLEAN | |
| created_at | TEXT | |
| updated_at | TEXT | |

## HO (Hypothesis Object)

A testable claim about content performance, generated from the signal system.

**D1 Table:** `hypothesis_objects`

| Field | Type | Description |
|-------|------|-------------|
| ho_id | TEXT PK | HO-YYYY-MM-DD-NNN |
| created | TEXT | ISO date |
| signal_source | TEXT | market-scan-YYYY-MM-DD |
| signal_confidence | FLOAT | 0-1 |
| hypothesis | TEXT | Testable claim |
| reasoning | JSON | [bullet reasoning] |
| content_spec | JSON | { title_candidate, format, ros[], target_duration_min } |
| status | TEXT | proposed, in_production, published, monitoring, validated, rejected |
| published_date | TEXT | Nullable ISO date |
| performance | JSON | Nullable { views, likes, comments, breakout_score } |
| validated | BOOLEAN | Nullable |
| implications | JSON | [implication strings] |
| created_at | TEXT | |

## Essay

Consumer-facing document with voice-tagged body blocks.

**D1 Table:** `essays`

| Field | Type | Description |
|-------|------|-------------|
| essay_id | TEXT PK | essay:{slug} |
| title | TEXT | |
| ro_id | TEXT FK | Source Research Object |
| status | TEXT | draft, pass1_done, pass2_done, pass3_done, published |
| body | TEXT | R2 key to body JSON |
| word_count | INT | |
| source_ratio | FLOAT | 0-1, % source blocks |
| audio_urls | JSON | [{ voice, url }] |
| validation_gates | JSON | { pass1: { all_pass, gates{} }, pass2: {}, pass3: {} } |
| created_at | TEXT | |
| updated_at | TEXT | |

## Storyboard

Timed video segments with art assignments.

**D1 Table:** `storyboards`

| Field | Type | Description |
|-------|------|-------------|
| storyboard_id | TEXT PK | sb:{slug} |
| essay_id | TEXT FK | |
| segments | JSON | [{ segment_id, title, duration_s, narration_text, art_ids[], quote_id, shot_type }] |
| total_duration_s | INT | |
| validation_gates | JSON | { all_pass, gates{} } |
| created_at | TEXT | |
| updated_at | TEXT | |

## Video Object

Published video metadata and asset references.

**D1 Table:** `video_objects`

| Field | Type | Description |
|-------|------|-------------|
| video_id | TEXT PK | |
| youtube_id | TEXT | |
| title | TEXT | |
| storyboard_id | TEXT FK | |
| thumbnail_urls | JSON | [variant_urls] |
| r2_assets | JSON | { master_mp4, audio, subtitle_files, art_used[] } |
| market_data | JSON | { gap_score, language_lag, search_rank_us, search_rank_in } |
| hypothesis_ids | JSON | [ho_ids tested by this video] |
| published_at | TEXT | |
| metrics | JSON | { views, likes, comments, ctr, retention } |
| created_at | TEXT | |
