---
name: factory-pipeline
description: Factory pipeline controller — transforms source material into published videos through 5 formal stages with binary validation gates
version: 1.0.0
author: Thomas Prior
metadata:
  hermes:
    tags: [factory, pipeline, source, ro, essay, video, publish]
    requires_tools: [terminal, file]
---

# Factory Pipeline

Formal transformation pipeline: source material → Work JSON → Research Object → Essay → Storyboard → Video. Every stage has binary validation rules. Every artifact tracks its provenance.

## Core Principle

Every piece of content is a product moving through a pipeline. Each stage transforms raw material into a higher-value artifact. Each transformation is validated by strict rules before advancing. Failed rules trigger a micro-loop (max 3 retries), then escalate to human.

## File Locations

```
Project root:            /root/projects/blog
Factory index:           content/_factory-index.json
Pipeline queue:          content/_pipeline-queue.json
Factory spec:            factory-spec.md
Validation script:       scripts/factory-audit.py
Works:                   content/works/
Research Objects:        content/research-objects/
Essays:                  content/glossary/essays/
Storyboards:             content/publishing/storyboards/
Video index:             content/video-objects/_index.json
Art gallery:             content/glossary/art/
```

## Priority Tiers (from _pipeline-queue.json)

Tier 1: Tantra, Kashmir Shaivism, Corbin (core differentiators)
Tier 2: Western esoteric (alchemy, hermetic, theurgy)
Tier 3: Comparative (death, dreams, consciousness)
Tier 4: Scholarly (platonism, science bridges)
Tier 5: Literature (mythical narratives)

---

## Procedure

### Step 0: Read the Factory Index

Start every cycle by reading:
```bash
cat /root/projects/blog/content/_factory-index.json
cat /root/projects/blog/content/_pipeline-queue.json
```

Determine what to process next:
1. Find the lowest tier with unprocessed items
2. Within that tier, find the earliest stage that has work to do
3. Process ONE stage of ONE item per cycle

---

### Stage 1: Source → Work

Convert raw source material into a structured Work JSON.

**Input location:** `blueprints/source_texts/`, `library/source-texts/`, `content/sources/`, `synthesis-essays/`, root PDFs

**Output location:** `content/works/work_{slug}.json`

**Procedure:**
```bash
# Check what source material exists
ls content/sources/{tradition}/
ls blueprints/source_texts/
ls library/science/
```

Read the source, extract metadata, write the Work JSON:

```json
{
  "work_id": "work:{slug}",
  "schema_version": 1,
  "title": "Full Title",
  "authors": [{"name": "Author Name"}],
  "publication": {"year": 2024, "type": "article"},
  "topics": ["topic1", "topic2"],
  "tradition": ["relevant_tradition"],
  "assets": {"pdf_path": "path/to/source.pdf"},
  "analysis": {
    "summary": "1-3 sentence summary",
    "argument": "Central thesis",
    "quality_score": 0.8
  }
}
```

**Validation Gates (ALL must pass):**

```
W01 work_id matches ^work:[a-z0-9_-]+$
W02 title is non-empty
W03 at least 1 author with name
W04 at least 1 topic
W05 at least 1 tradition (or quality_score set for science)
W06 summary exists and ≥10 chars
W07 if pdf_path set, file exists on disk
W08 quality_score ≥ 0.3 if set
```

Run validation:
```bash
python3 scripts/factory-audit.py --works
```

If ANY gate fails → fix and retry (max 3). If still failing → log to issues and move on.

---

### Stage 2: Work → Research Object

Compile one or more Works into a Research Object.

**Output location:** `content/research-objects/ro-{slug}/ro.json`

**Procedure:**

1. Determine the RO family from the topic:
   - Single thinker on a topic → `thinker-topic`
   - Same topic across multiple thinkers → `topic-across-thinkers`
   - Within a tradition → `tradition`
   - Cross-tradition theme → `theme`
   - Literary work → `literature`

2. Use the appropriate section taxonomy:

| Family | Sections |
|--------|----------|
| thinker-topic | ontology, epistemology, sources, practice, comparison, evolution, reception |
| topic-across-thinkers | scope, dimension_1, dimension_2, dimension_3, agreement, disagreement, unresolved |
| tradition | ontology, cosmology, practice, comparative, sources, evolution |
| theme | definition, history, variants, cross_tradition, practices, open_questions |
| literature | plot, themes, symbols, interpretation, influence |

3. Extract passages from the source Works. Each passage must have:
   - `passage_id`: `p_001`, `p_002`, etc.
   - `section`: dot-notation path in the section taxonomy
   - `text`: complete sentence(s) from the source — NO paraphrasing
   - `source_id`: must match a work_id in the sources manifest
   - `page_ref`: page number(s) if available

4. Every RO needs at least 5 passages (condensed) or 7+ (thesis).

5. Run the source coverage audit micro-loop:
   - After extracting all passages, re-read each source Work
   - Check if any interesting content was missed
   - Add any missed passages with score ≥ 0.7

**Validation Gates:**

```
R01 ro_id matches ^ro:[a-z0-9_-]+$
R02 title is non-empty
R03 family is one of the 5 known families
R04 status is in valid transition
R05 one_line ≤ 200 chars
R06 at least 1 tradition
R07 at least 1 source in sources[]
R08 every source.source_id resolves to a work in content/works/
R09 every source has valid status
R10 at least 5 passages
R11 every passage_id matches ^p_\d{3}$
R12 every passage has non-empty text
R13 every passage.source_id is in sources[]
R14 every passage.section matches family taxonomy
R15 every section in taxonomy has a coverage entry
R16 no coverage section below 0.3 without a gap noted
R17 current_version matches semver
R18 versions[] has entry for current_version
R19 all issues have status
R20 at least one source has passages_used > 0
R21 ≥50% of passages come from Tier 1 sources
R22 no orphan passages (source_id points to missing source)
R23 no active sources with 0 passages
```

Run validation:
```bash
python3 scripts/factory-audit.py --ros
```

---

### Stage 3: Research Object → Essay

Expand an RO into a voice-tagged essay.

**Output location:** `content/glossary/essays/{slug}.json`

**Procedure:**

1. Read the RO's passages
2. Classify: thesis_essay (long-form) vs condensed_source (single-topic)
3. Write body blocks following the Ralph Loop pattern:
   - `source` blocks: direct quotes from RO passages, with `ro_passage_id` set
   - `ai` blocks: your commentary/analysis
   - `summary` blocks: section summaries
   - `art` blocks: artwork references (optional)
4. Every `source` block MUST reference the RO passage it came from via `ro_passage_id`
5. Extract concepts from the body and link them to `content/glossary/concepts/`

**Validation Gates:**

```
E01 id is kebab-case
E02 title is non-empty
E03 type ∈ {thesis_essay, condensed_source}
E04 source_ids references valid RO
E05 at least 5 body blocks
E06 total chars ≥ 1000
E07 every block.kind ∈ {source, ai, summary, art}
E08 every block has non-empty text
E09 every kind=source block has ro_passage_id
E10 every ro_passage_id resolves to a passage in source RO
E11 every kind=art block has valid art_id
E12 all concept references resolve
E13 audioUrl set after generation
```

**Micro Loop:** Verify every RO passage with topics matching the essay title is cited. If any are missing, add them.

---

### Stage 4: Essay → Storyboard

Generate a timed video storyboard from the essay.

**Output location:** `content/publishing/storyboards/{episode_id}.json`

**Procedure:**

```bash
cd /root/projects/blog
node scripts/generate-storyboard.mjs --ro {ro_id} --title "{title}" --series "{series}"
```

Then generate voiceover:
```bash
node scripts/generate-voiceover.mjs {episode_id}
```

**Validation Gates:**

```
S01 episode_id is kebab-case
S02 source_essay resolves to essay JSON
S03 source_ro resolves to RO
S04 at least 5 segments
S05 at most 12 segments
S06 first segment rhetorical_role = "hook"
S07 last segment rhetorical_role = "closing"
S08 at least 1 quote segment
S09 every segment has non-empty narration
S10 every segment has duration > 0
```

---

### Stage 5: Storyboard → Video Assembly

Build the visual assignment and FableCut timeline.

**Output location:** `content/video-objects/{slug}/visual-assignment.json`

**Procedure:**

1. For each storyboard segment, search the art gallery for matching artwork:
   - Extract keywords from narration
   - Match against art.json concepts, visual_motifs, mood, entities_depicted
   - Pick best match, write to visual-assignment.json

2. Build the FableCut timeline:
   - Copy artwork → FableCut media directory
   - Copy narration MP3s → FableCut media directory
   - Generate black-page quote cards for quote segments
   - Write project.json

**Validation Gates:**

```
V01 video_id in video index
V02 storyboard_id resolves to existing storyboard
V03 every segment type ∈ {artwork, quote_card}
V04 every artwork_id resolves to art gallery
V05 every quote_card has non-empty quote_text
V06 motion ∈ {slow_zoom, ken_burns, still}
V07 durations match voiceover timing within 20%
```

---

## Reporting

After each stage, update the factory index:

```bash
# Update _factory-index.json last_updated
# Update _pipeline-queue.json with progress
```

At the end of each cycle, output a brief report:

```
Cycle YYYY-MM-DD HH:MM:
  Processed: {item}
  Stage: {stage}
  Validation: {passed}/{total} ({pct}%)
  Next: {next item and stage}
```

## Error Recovery

If ANY validation gate fails:
1. Log which rule(s) failed and why
2. Apply corrective action (fix the artifact)
3. Re-run validation
4. Max 3 retries per stage per item
5. If still failing after 3 retries → mark item as blocked in the index and move to the next item

Do NOT skip failed validation gates. Do NOT advance to the next stage until all gates pass.
