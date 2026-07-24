# Factory Spec — Re-Rendering Atlas

## The Formal System

Every piece of content is a product moving through a pipeline. Each stage transforms raw material into a higher-value artifact. Each transformation is audited by binary validation rules. Every artifact tracks its provenance so we can measure what works.

---

## Pipeline Overview

```
RAW ORE                    → EXTRACTION       → INGOT          → PRODUCT      → BLUEPRINT    → SHIPMENT
source material            → Work JSON        → Research Object → Essay JSON   → Storyboard   → Video
(PDF, text, book)           (structured meta)  (passages, map)   (voice-tagged) (segments)     (FableCut → YouTube)
```

Each stage is a **formal transformation function**:

```
transform(source) → artifact
  validate(artifact) → [PASS/FAIL × N rules]
  if FAIL: micro-loop (max 3 retries)
  if PASS: link to parent, advance
```

---

## Stage 1: Source → Work

**Input:** Raw source material (PDF, book text, article, essay draft)
**Output:** `content/works/work_{slug}.json`

### Schema (from `work.schema.json`)

| Field | Required | Type | Rule |
|-------|----------|------|------|
| `work_id` | YES | `^work:[a-z0-9_-]+$` | Must match pattern |
| `schema_version` | YES | int ≥ 1 | Currently 1 |
| `title` | YES | string | Non-empty |
| `authors` | YES | `[{name, author_id?}]` | At least 1 author with name |
| `publication.year` | NO | int | 4 digits |
| `publication.type` | NO | enum | article/thesis/book/book_chapter/essay/preprint/conference |
| `topics` | NO | string[] | At least 1 topic recommended |
| `tradition` | NO | string[] | At least 1 tradition if applicable |
| `assets.pdf_path` | NO | string | Must exist on disk if set |
| `provenance.access_status` | NO | enum | open/paywalled/request_only/rights_check |
| `provenance.retrieved_at` | NO | datetime | ISO 8601 |
| `analysis.summary` | NO | string | 1-3 sentence summary |
| `analysis.argument` | NO | string | Central thesis |
| `analysis.quality_score` | NO | 0-1 | Confidence in source quality |

### Validation Rules (binary)

```
W01 [work_id]       PASS if work_id matches ^work:[a-z0-9_-]+$
W02 [title]         PASS if title is non-empty string
W03 [authors]       PASS if ≥1 author with non-empty name
W04 [topics]        PASS if ≥1 topic
W05 [tradition]     PASS if ≥1 tradition (or null for science)
W06 [summary]       PASS if summary exists and ≥10 chars
W07 [pdf_exists]    PASS if assets.pdf_path set → file exists on disk
W08 [quality_min]   PASS if analysis.quality_score ≥ 0.3 or null
W09 [doi_format]    PASS if identifiers.doi set → matches doi pattern
W10 [provenance]    PASS if provenance.access_status ∈ allowed enum
```

**Source utilization rule:** A Work must track which source material it came from. If the source is a PDF, `assets.pdf_path` is required.

---

## Stage 2: Work → Research Object

**Input:** 1+ Work JSONs + synthesis
**Output:** `content/research-objects/ro-{slug}/ro.json`

### Schema (from `ro-schema-spec.md`)

| Field | Required | Description |
|-------|----------|-------------|
| `ro_id` | YES | `^ro:[a-z0-9_-]+$` |
| `schema_version` | YES | int |
| `title` | YES | string |
| `family` | YES | thinker-topic / topic-across-thinkers / tradition / theme / literature |
| `status` | YES | idea → draft → review → published → stale |
| `current_version` | YES | semver string |
| `summary.one_line` | YES | ≤200 chars |
| `summary.scope` | YES | What this RO covers |
| `summary.traditions` | YES | string[] |
| `sources[]` | YES | Array of source manifests (see below) |
| `body[]` | YES | Array of passage objects (see below) |
| `coverage` | YES | Per-section coverage map |
| `versions[]` | YES | Version history |
| `issues[]` | YES | Open issues |
| `outputs[]` | NO | Essays/videos generated from this RO |

### Source Manifest (per source)

| Field | Required | Rule |
|-------|----------|------|
| `source_id` | YES | Must match a work_id in content/works/ |
| `tier` | YES | 1 (primary) / 2 (secondary) / 3 (tertiary) |
| `label` | YES | Human-readable |
| `passages_used` | YES | int — how many passages extracted from this source |
| `status` | YES | active / paywalled_stub / deprecated |

### Body Passage

| Field | Required | Rule |
|-------|----------|------|
| `passage_id` | YES | `^p_\d{3}$` |
| `section` | YES | Dot-notation path matching the section taxonomy |
| `kind` | YES | Always "source" |
| `text` | YES | Non-empty, complete sentence(s) |
| `source_id` | YES | Must reference a source in the sources[] manifest |
| `topics[]` | NO | Topic tags |
| `page_ref` | NO | Page number(s) in source |

### Section Taxonomy

Each family has its own section taxonomy (from `ro-schema-spec.md`):

**thinker-topic:** ontology, epistemology, sources, practice, comparison, evolution, reception
**topic-across-thinkers:** scope, dimension_1, dimension_2, dimension_3, agreement, disagreement, unresolved
**tradition:** ontology, cosmology, practice, comparative, sources, evolution
**theme:** definition, history, variants, cross_tradition, practices, open_questions
**literature:** plot, themes, symbols, interpretation, influence

### Validation Rules (binary)

```
R01 [ro_id]         PASS if ro_id matches ^ro:[a-z0-9_-]+$
R02 [title]         PASS if title is non-empty
R03 [family]        PASS if family ∈ known families
R04 [status]        PASS if status ∈ allowed transition from previous
R05 [summary]       PASS if one_line exists and ≤200 chars
R06 [traditions]    PASS if ≥1 tradition
R07 [sources_min]   PASS if ≥1 source in sources[] manifest
R08 [source_exists] PASS if every source.source_id resolves to a work in content/works/
R09 [source_status] PASS if every source has status ∈ {active, paywalled_stub, deprecated}
R10 [body_min]      PASS if ≥5 passages (condensed) or ≥7 (thesis)
R11 [passage_id]    PASS if every passage_id matches ^p_\d{3}$
R12 [passage_text]  PASS if every passage.text is non-empty
R13 [passage_source] PASS if every passage.source_id is in sources[].source_id
R14 [section_valid] PASS if every passage.section matches the family's section taxonomy
R15 [coverage_all]  PASS if every section in taxonomy has a coverage entry
R16 [coverage_min]  PASS if no coverage section has estimated_completeness < 0.3 without a gap noted
R17 [version]       PASS if current_version matches semver
R18 [versions_log]  PASS if versions[] has entry for current_version
R19 [issues]        PASS if all issues have status (open/closed/resolved)
R20 [source_utilization] PASS if at least one source has passages_used > 0
R21 [source_p50]    PASS if ≥50% of total passage count comes from Tier 1 sources
R22 [no_orphan_passages] PASS if every passage.source_id is in a source that exists
R23 [no_orphan_sources]  PASS if every source in sources[] has at least one passage referencing it (unless status=paywalled_stub)
```

### Micro Loop: Source Coverage Audit

After initial compilation, run a **source coverage audit**:

```
1. For each source in sources[]:
   a. Read the full source text (work JSON body_clean)
   b. Compare against extracted passages
   c. Identify ANY interesting content NOT yet extracted
   d. If found → create candidate passage entries
   e. Score each candidate: relevance × uniqueness × quotability
   f. If any candidate scores ≥ 0.7 → add to body[], increment version
2. Must run at least once per RO at draft stage
3. Log findings to coverage.gaps[]
```

This is the **"what did we miss?" micro loop**. It prevents the common failure mode where only obvious passages get extracted and subtle gold is left behind.

---

## Stage 3: Research Object → Essay

**Input:** Research Object (1+ ROs)
**Output:** `content/glossary/essays/{slug}.json`

### Schema

| Field | Required | Type | Rule |
|-------|----------|------|------|
| `id` | YES | string | kebab-case |
| `title` | YES | string | Non-empty |
| `type` | YES | thesis_essay / condensed_source |
| `source_ids` | YES | string[] | References RO IDs |
| `author` | YES | string | Original author |
| `body[]` | YES | array | Voice-tagged blocks (see below) |
| `concepts[]` | NO | string[] | Concept slugs |
| `audioUrl` | NO | string | Set after audio generation |

### Body Block

| Field | Required | Rule |
|-------|----------|------|
| `kind` | YES | source / ai / summary / art |
| `text` | YES | Non-empty |
| `ro_passage_id` | NO | If kind=source, MUST reference passage_id from the source RO |
| `art_id` | NO | If kind=art, MUST reference an art entry |

### Validation Rules (binary)

```
E01 [id]            PASS if id is kebab-case
E02 [title]         PASS if title is non-empty
E03 [type]          PASS if type ∈ {thesis_essay, condensed_source}
E04 [source_ids]    PASS if ≥1 source_id references a valid RO
E05 [body_min]      PASS if ≥5 blocks
E06 [body_chars]    PASS if total chars ≥ 1000
E07 [block_kind]    PASS if every block.kind ∈ {source, ai, summary, art}
E08 [block_text]    PASS if every block.text is non-empty
E09 [ro_trace]      PASS if every kind=source block has ro_passage_id set
E10 [ro_exists]     PASS if every ro_passage_id resolves to a passage in the source RO
E11 [art_exists]    PASS if every kind=art block has art_id that resolves
E12 [concepts]      PASS if all concept references resolve to content/glossary/concepts/
E13 [audio]         PASS if audioUrl is set after audio generation
```

**Traceability heatmap:** The `ro_passage_id` field on every `source` block creates a link from essay → RO passage. This enables:
- Which ROs are most cited in essays
- Which passages within an RO are most used
- Which ROs have zero essay output (coverage gap)

---

## Stage 4: Essay → Storyboard

**Input:** Essay JSON
**Output:** `content/publishing/storyboards/{episode_id}.json`

### Schema

| Field | Required | Rule |
|-------|----------|------|
| `episode_id` | YES | kebab-case |
| `episode_title` | YES | Non-empty |
| `source_essay` | YES | References essay ID |
| `source_ro` | YES | References RO ID |
| `segments[]` | YES | ≥5, ≤12 |
| `segments[].segment_id` | YES | `^seg-\d{2}-[a-z-]+$` |
| `segments[].rhetorical_role` | YES | hook / thesis / expansion / quote / contrast / example / synthesis / closing |
| `segments[].narration` | YES | Non-empty |
| `segments[].duration` | YES | Seconds (from timing.json actual_duration_sec) |

### Validation Rules (binary)

```
S01 [episode_id]    PASS if episode_id is kebab-case
S02 [source_essay]  PASS if source_essay resolves to an essay JSON
S03 [source_ro]     PASS if source_ro resolves to an RO
S04 [segments_min]  PASS if ≥5 segments
S05 [segments_max]  PASS if ≤12 segments
S06 [first_hook]    PASS if segments[0].rhetorical_role == "hook"
S07 [last_closing]  PASS if segments[-1].rhetorical_role == "closing"
S08 [has_quote]     PASS if ≥1 segment with rhetorical_role == "quote"
S09 [narration_all] PASS if every segment has non-empty narration
S10 [duration_all]  PASS if every segment has duration > 0
```

---

## Stage 5: Storyboard → Video Assembly

**Input:** Storyboard + Visual Assignment
**Output:** FableCut timeline → exported MP4

### Visual Assignment Schema

Stored at: `content/video-objects/{slug}/visual-assignment.json`

| Field | Required | Rule |
|-------|----------|------|
| `video_id` | YES | Matches video index |
| `storyboard_id` | YES | References storyboard |
| `segments[]` | YES | One per storyboard segment |
| `segments[].segment_id` | YES | Matches storyboard segment_id |
| `segments[].type` | YES | artwork / quote_card |
| `segments[].artwork_id` | conditional | Required if type=artwork |
| `segments[].motion` | NO | slow_zoom / ken_burns / still |
| `segments[].quote_text` | conditional | Required if type=quote_card |
| `segments[].quote_author` | conditional | Required if type=quote_card |
| `segments[].style` | conditional | black_page / black_page_compact |

### Validation Rules (binary)

```
V01 [video_id]      PASS if video_id is in video index
V02 [storyboard]    PASS if storyboard_id resolves to existing storyboard
V03 [segments_all]  PASS if every storyboard segment has a visual assignment
V04 [artwork_exists] PASS if every artwork_id resolves to content/glossary/art/
V05 [quote_text]    PASS if every quote_card has non-empty quote_text
V06 [motion_valid]  PASS if motion ∈ {slow_zoom, ken_burns, still}
V07 [duration_match] PASS if visual assignment durations match voiceover timing
```

---

## The Ralph Loop Integration

Each stage's validation feeds into the Ralph Loop pattern (from `essay-automation-loop.md`):

```
Phase N:
  1. Execute transformation
  2. Run validation rules
  3. If ALL PASS → advance to Phase N+1
  4. If ANY FAIL:
     a. Log which rules failed
     b. Apply corrective action
     c. Max 3 retries
     d. If still failing → escalate to human
```

The corrective actions for each rule are documented in the `issues[]` field of each artifact.

---

## Micro Loops

### Loop 1: Source Coverage Audit (Stage 2)
After initial RO compilation, actively search for missed content. Runs once per RO at draft stage.

### Loop 2: Essay Completeness Check (Stage 3)
After essay generation, verify every RO passage with topics matching the essay title is cited. If not, flag for inclusion.

### Loop 3: Storyboard-Narration Sync (Stage 4)
After storyboard generation, verify narration timing matches voiceover duration within 20%. If not, regenerate.

### Loop 4: Visual Quality (Stage 5)
After visual assignment, verify every artwork has a minimum resolution of 500×500. If not, flag for replacement.

---

## Traceability Chain

```
source material (PDF) 
  → work JSON (assets.pdf_path)
    → RO passage (passage.source_id → work.work_id)
      → essay block (block.ro_passage_id → RO.passage_id)
        → storyboard segment (storyboard.source_essay → essay.id)
          → visual assignment segment (segment.artwork_id → art.id)
            → FableCut clip (clip.mediaId → media file)
              → YouTube video (youtube_video_id)
```

This chain enables:
- **Heatmaps:** Which ROs produce the most essays? Which passages are most cited?
- **Analytics:** Which artwork correlates with highest retention? Which treatments?
- **Gap analysis:** Which ROs have zero essay output? Which sources have zero passages extracted?
- **Quality tracking:** Do videos from higher-scoring ROs perform better?

---

## Factory Index Update Logic

After every transformation, `content/_factory-index.json` is updated:

```python
def update_factory_index(stage, artifact_id, status):
    idx = load("content/_factory-index.json")
    idx[stage][artifact_id] = {
        "status": status,
        "last_updated": now(),
        "validation_results": {rule: pass/fail for rule in rules},
        "parent": parent_artifact_id,
    }
    idx["last_updated"] = now()
    save(idx)
```

---

## Cron Integration

The existing `video-pipeline` cron job (every 6h) reads `_factory-index.json` to find the next actionable item:

```
1. Find any source material not in works/ → acquire
2. Find any work not in an RO → compile
3. Find any RO not expanded to essay → write
4. Find any essay without audio → generate TTS
5. Find any essay without storyboard → generate
6. Find any storyboard without visual assignment → assign
7. Find any assigned without FableCut timeline → build
8. Find any timeline without export → notify user
```

Each cycle processes ONE stage of ONE item, then updates the index and exits.
