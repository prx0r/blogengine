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
# Storyboard Notes — Ochema Video Pipeline

## Full Pipeline

```
Essay / Research Object
    ↓
[1] generate-storyboard.mjs
    → storyboard.json (segments with narration, rhetorical roles, visual notes)
    ↓
[2] generate-voiceover.mjs
    → per-segment MP3s + timing.json
      (en-US-AriaNeural female = main, en-GB-RyanNeural male = quotes)
    ↓
[3] generate-visual-assignment.mjs   ← NEW
    → visual-assignment.json (artwork, treatments per segment)
    ↓
[4] generate-subtitles.mjs
    → .ass (styled) + .srt (YouTube plain)
    ↓
[5] generate-quote-card.py
    → transparent quote PNGs
    ↓
[6] Hermes → FableCut MCP
    → project.json (timeline with clips, filters, transitions)
    ↓
[7] Preview in browser (FableCut UI)
    → tweak timings, swap artwork, adjust filters
    ↓
[8] Export MP4
    → ffmpeg CRF-18, 1280x720
```

---

## Video Structure Template

Every Ochema video follows this structure:

```
OPENING:
  black (2s)
  doorway clip (fade from black, 6-10s)
  black (1.5s, audio continues)

BODY (per beat):
  artwork (with treatment filter + slow zoom)
  — or —
  quote card (transparent PNG overlay, fade in/out)
  — or —
  visual clip (LTX-generated scene)

CLOSING:
  black (1.5s)
  doorway clip reversed (fade to black, 6-10s)
  black (2s)
```

---

## Segments → Event Type Mapping

| Rhetorical Role | Visual Event Type | Duration Range |
|----------------|-------------------|----------------|
| hook | doorway_open | 6-10s |
| context | artwork | 10-20s |
| evidence | artwork | 12-25s |
| quote | quote_card | 6-12s |
| example | artwork | 10-18s |
| contrast | artwork | 10-15s |
| reconstruction | artwork | 12-20s |
| implication | artwork or visual clip | 10-18s |
| synthesis | artwork | 12-20s |
| closing | doorway_close | 6-10s |
| section_break | black (audio continues) | 1.5-3s |

---

## Visual Assignment Schema

Stored at: `content/video-objects/<slug>/visual-assignment.json`

```json
{
  "video_id": "tantraloka-01",
  "storyboard_id": "tantraloka-01-engine-of-consciousness",
  "generated": "2026-07-20",
  "model": "deepseek-chat",
  "segments": [
    {
      "segment_id": "seg-01-hook",
      "type": "doorway_open",
      "doorway": "door_candle_001.mp4",
      "duration": 8,
      "notes": "Candle flame doorway — contemplative entry"
    },
    {
      "segment_id": "seg-02-context",
      "type": "artwork",
      "artwork_id": "art_alchemy_e270",
      "treatment": "golden-imaginal",
      "motion": "slow_zoom",
      "duration": 14,
      "concepts_matched": ["light", "descent", "consciousness"]
    },
    {
      "segment_id": "seg-03-quote",
      "type": "quote_card",
      "quote_text": "Consciousness is not in the body.",
      "quote_author": "Abhinavagupta",
      "style": "centered_sparse",
      "duration": 8,
      "font": "ephesis"
    },
    {
      "segment_id": "seg-04-evidence",
      "type": "artwork",
      "artwork_id": "art_alchemy_e045",
      "treatment": "corbin-blue",
      "motion": "ken_burns",
      "duration": 14
    },
    {
      "segment_id": "seg-05-closing",
      "type": "doorway_close",
      "doorway": "door_candle_001.mp4",
      "duration": 6
    }
  ]
}
```

### Decision Rules

1. **Rhetorical role** determines the event type (see mapping table above)
2. **Key concepts** from segment narration → matched against art gallery `concepts` + `visual_motifs` + `mood` fields
3. **Mood** of the segment text → picks treatment preset that matches
4. **Quote segments** use the exact quote text from the storyboard's `on_screen_text` or narration
5. **First segment** is always `doorway_open`, **last segment** always `doorway_close`
6. **Default treatment** per tradition:
   - Kashmir Shaivism → golden-imaginal
   - Sufi / Corbin → corbin-blue
   - Western occult / Hermetic → engraving-crisp
   - Buddhist / emptiness → sepia-classic
   - Tantra / energy → tibetan-red

---

## Treatment Presets

| Preset | Contrast | Sat | Bright | Temp | Vignette | Grain | Other |
|--------|----------|-----|--------|------|----------|-------|-------|
| none | 100 | 100 | 100 | 0 | 0 | 0 | — |
| golden-imaginal | 108 | 82 | 97 | +15 | 16 | 3% | — |
| tibetan-red | 112 | 90 | 95 | +10 | 0 | 4% | tint +20 |
| corbin-blue | 110 | 74 | 94 | -15 | 20 | 2% | — |
| engraving-crisp | 116 | 0 | 102 | 0 | 0 | 1% | grayscale, 5% sepia |
| sepia-classic | 108 | 70 | 100 | 0 | 15 | 0 | 35% sepia |
| mystical-dark | 112 | 105 | 90 | 0 | 35 | 5% | — |

---

## Quote Card Styles

| Style | Position | Text Font | Author Font | Best For |
|-------|----------|-----------|-------------|----------|
| centered_sparse | Center | Ephesis 52px | Cormorant 28px gold | Major quotes, full attention |
| lower_third | Bottom | Reenie Beanie 44px | Cormorant 24px gold | Supplementary quotes, overlay on artwork |
| full_quote | Center-wide | Ephesis 48px | Playfair 26px gold | Longer quotes, contemplative pause |

All: 1280x720 RGBA, transparent bg, text shadow, soft margins.

---

## Font Registry

### Subtitle fonts
| Font | Use |
|------|-----|
| Reenie Beanie | Main narration subtitles |
| Ephesis | Quote attribution subtitles |

### Quote card fonts
| Font | Use |
|------|-----|
| Ephesis | Quote text (centered_sparse, full_quote) |
| Reenie Beanie | Quote text (lower_third) |
| Cormorant Garamond | Author attribution (gold) |
| Playfair Display | Author attribution (full_quote) |

### Thumbnail fonts
| Font | Use |
|------|-----|
| Sedgwick Ave Display | Video title |
| Cinzel | Classical/academic titles |
| UnifrakturCook | Occult/gothic titles |
| EB Garamond | Scholarly captions |

### System-installed (all available for any use)
EB Garamond, IM FELL English, IM FELL English SC, Cinzel, Cinzel Decorative,
Cormorant Garamond, Playfair Display, Alegreya, Lora, Libre Baskerville,
Cardo, Goudy Bookletter, UnifrakturCook, UnifrakturMaguntia,
Kaushan Script, Mea Culpa, Eagle Lake, Metamorphous, Parisienne,
MedievalSharp, Old Standard TT, Reenie Beanie, Ephesis,
Sedgwick Ave Display, Caveat, Dancing Script, Lobster Two,
Junicode, Elstob, DejaVu Serif (fallback)

---

## Asset Storage

### Per-video assets
```
content/video-objects/<slug>/
  market.json                    — YouTube market snapshot
  commission-draft.json          — LLM creative brief
  video.json                     — compiled video object
  visual-assignment.json         — artwork/treatment per segment  ← NEW
  thumbnail.png                  — generated thumbnail
```

### Generated assets
```
content/publishing/
  storyboards/<id>.json          — storyboard (segments, narration)
  voiceover/<id>/                — per-segment MP3s + timing.json
  subtitles/<id>/                — .ass + .srt
  renders/<id>/                  — per-segment video clips
  videos/<id>.mp4                — final rendered video
```

### Art library
```
content/glossary/art/<id>.json   — artwork metadata (348+ records)
public/art/<id>.jpg              — artwork images
```

### Visual library (reusable clips)
```
content/video-objects/visual-library/
  doorways/                      — doorway clips (candle, mist, rain, etc.)
  treatments/                    — LTX-generated scenes
  overlays/                      — particle effects, animated SVGs
```

---

## Hermes → FableCut MCP Workflow

### Register the MCP server
```bash
claude mcp add -s user fablecut -- node "/root/projects/FableCut/mcp-server.js"
```

### Build a video timeline
```
1. fablecut_status — check server running, get project summary
2. fablecut_import_media — import all assets (doorway clips, artwork, narration, quote cards)
3. fablecut_patch_project — build timeline:
   a. Add media entries for all imported files
   b. Add clips to V1 in order:
      - doorway (fade from black, filter: golden-imaginal)
      - black (1.5s, audio continues)
      - artwork (filter: golden-imaginal, slow zoom keyframe)
      - quote card (fade in/out, V2)
      - artwork (filter: corbin-blue)
      - ...
      - black (1.5s)
      - doorway reversed (fade to black, speed: -1)
   c. Add narration to A1 at corresponding times
   d. Add ambient bed to A1 (lower volume)
4. fablecut_get_project {compact:true} — review timeline
5. User tweaks in browser → export
```

### Key patch operations
```json
{"op":"addMedia", "media":{"src":"/media/door_candle.mp4", "kind":"video"}}
{"op":"addMedia", "media":{"src":"/media/art_001.jpg", "kind":"image"}}
{"op":"addMedia", "media":{"src":"/media/narration.mp3", "kind":"audio"}}

{"op":"addClip", "clip":{
  "id":"c_doorway", "track":"V1", "start":0, "duration":8,
  "kind":"video", "mediaId":"m_door",
  "props":{"filterPreset":"golden-imaginal"},
  "transitionIn":{"type":"fade","duration":1.2}
}}

{"op":"updateClip", "id":"c_art_01", "set":{
  "props":{"filterPreset":"corbin-blue", "contrast":110}
}}
```

---

## Visual Assignment Decision Process

Given a storyboard segment, how to pick the artwork:

1. **Extract keywords** from the narration text (nouns, concepts, proper names)
2. **Match against art metadata**:
   - `concepts` field (highest weight)
   - `visual_motifs` field
   - `mood` field
   - `entities_depicted` field
   - `style` field
3. **Score candidates** by overlap count + concept match strength
4. **Prefer artworks with rich metadata** (tagged concepts > untagged)
5. **Fallback**: use the video's assigned image from thumbnail assignment

### Tradition → artwork filter:
| Tradition/Topic | Preferred Artwork Source | Treatment |
|----------------|-------------------------|-----------|
| Kashmir Shaivism / Tantraloka | Alchemical emblems, Indian sculpture | golden-imaginal |
| Sufi / Corbin | Persian miniatures, angel illustrations | corbin-blue |
| Neoplatonism | Renaissance engravings, Fludd diagrams | engraving-crisp |
| Western occult / Hermetic | Alchemical emblems, grimoire pages | engraving-crisp |
| Buddhist / emptiness | Buddha images, mandalas | sepia-classic |
| Yoga / practice | Nature scenes, mountain, dawn | golden-imaginal |
| Daimon / angel | Angel paintings, Merkaba, visionary | corbin-blue |
| Death / transformation | Skull imagery, dark emblems | mystical-dark |
| Fire / energy | Sun imagery, flame emblems | tibetan-red |

---

## Analytics Tie-in

Visual-assignment.json enables:

- **Retention correlation**: "segments with golden-imaginal treatment had +8% retention"
- **Artwork performance**: "art_alchemy_e045 was used in 3 top-performing videos"
- **Treatment A/B**: compare two versions of same video with different visual assignments
- **Beat-level analytics**: map YouTube retention curve back to specific artwork + treatment combos

After upload, the analytics pipeline reads:
```
youtube retention curve
  → maps elapsedVideoTimeRatio × duration → beat timestamps
  → joins against visual-assignment.json
  → per-segment retention, dropoff, rewatch signals
  → stored in video.json analytics fields
```

---

## Services

### FableCut Editor
```
Port: 7777
Start:   screen -dmS fablecut bash -c "cd /root/projects/FableCut && node server.js"
Stop:    screen -S fablecut -X quit
URL:     http://localhost:7777
Tunnel:  https://remembered-donations-glasgow-alive.trycloudflare.com
```

### Thumbnail Server
```
Port: 8765
Start:   screen -dmS thumbnail_server bash -c "python3 /root/projects/blog/scripts/thumbnail_server.py 8765"
Stop:    screen -S thumbnail_server -X quit
URL:     http://localhost:8765
Tunnel:  https://passenger-literary-alignment-enable.trycloudflare.com
Endpoints:
  /api/images       — all artwork images
  /api/matches      — video-to-image match results
  /api/assignments  — saved user assignments
  /api/render       — render thumbnail
  /img/<id>         — serve any artwork
```

### Vast.ai (LTX generation only)
```
GPU instance for generating doorway clips, visual scenes.
SSH: ssh -i ~/.ssh/id_ed25519 -p 35915 root@ssh1.vast.ai
ComfyUI: http://198.53.64.194:35076/
API: http://198.53.64.194:35219/
```

---

## Commands Cheat Sheet

```bash
# Start everything
screen -dmS thumbnail_server bash -c "python3 /root/projects/blog/scripts/thumbnail_server.py 8765"
screen -dmS fablecut bash -c "cd /root/projects/FableCut && node server.js"

# Generate storyboard from RO
node scripts/generate-storyboard.mjs --ro ro:<slug> --title "..." --series "..."

# Generate voiceover
node scripts/generate-voiceover.mjs <storyboard-id>

# Generate subtitles
node scripts/generate-subtitles.mjs <storyboard-id>

# Generate quote card
echo '{"text":"...","author":"...","style":"centered_sparse"}' | python3 scripts/generate-quote-card.py

# Thumbnail test
python3 scripts/thumbnail_render.py --test

# Start tunnels
cloudflared tunnel --url http://localhost:7777   # FableCut
cloudflared tunnel --url http://localhost:8765   # Thumbnails

# Stop screens
screen -S fablecut -X quit
screen -S thumbnail_server -X quit

# View logs
cat /tmp/fablecut_tunnel.log
cat /tmp/thumbnail_server.log
```
# FableVid — Content Factory

## The Complete Closed Loop

```
                          RESEARCH
                    (acquire papers per phase)
                            ↓
                    RESEARCH OBJECTS
                  (compile ROs from papers)
                            ↓
                    ESSAY (Type A)
            (multi-pass refinement, 8 phases)
                            ↓
 ┌──────────────── VIDEO PIPELINE ────────────────┐
 │  Storyboard (deepseek-v4-flash, 8 segments)     │
 │    ↓                                            │
 │  Voiceover (edge-tts, en-US-AriaNeural default) │
 │    ↓                                            │
 │  Art Search (match keywords → gallery API)      │
 │    ↓                                            │
 │  Subtitles (.ass styled + .srt plain)           │
 │    ↓                                            │
 │  Quote Cards (black page, serif text)           │
 │    ↓                                            │
 │  Thumbnail (art + title)                        │
 │    ↓                                            │
 │  FableCut Timeline (project.json)               │
 │    ↓                                            │
 │  Browser Preview → Export MP4                   │
 └────────────────────────────────────────────────┘
```

## Hermes Skill Chain

```
User triggers: /full-video-pipeline "Tantraloka — Engine of Consciousness"

  1. /research-acquire
     → acquire papers for phase (consciousness, self)
     → validate: papers in content/works/

  2. /ro-compile (knowledge PR pipeline)
     → build RO from acquired papers
     → validate: RO has ≥5 passages, no coverage gaps

  3. /write-and-publish (Type A essay)
     → 8-phase refinement: classify → extract → write → audio → deploy
     → validate: essay JSON exists, audioUrl set

  4. /publish-video-fablecut
     → storyboard → voiceover → visual assignment → subtitles
     → quote cards → FableCut MCP timeline → browser preview → export
     → validate: MP4 >1MB, duration within 20% of estimate

  5. /upload-youtube
     → upload as unlisted draft → set thumbnail → schedule publish
     → validate: youtube_video_id returned

  6. /ingest-analytics (7+ days after publish)
     → pull retention data from YouTube Analytics API
     → map retention per beat → join visual-assignment.json
     → compute: treatment retention scores, artwork dropoff rates
     → feed gaps back into phase research queue
```

## Skill Bundle

Installed at `~/.hermes/skill-bundles/full-video-pipeline.yaml`.

```bash
/full-video-pipeline "Tantraloka — The Engine of Consciousness"
```

This runs the entire closed loop: research → RO → essay → video → upload → analytics → feedback.

---

## Pipeline Steps

---

## Services

### 1. FableCut Editor
```
Port: 7777
Location: /root/projects/FableCut
Start:   screen -dmS fablecut bash -c "cd /root/projects/FableCut && node server.js"
Stop:    screen -S fablecut -X quit
Access:  http://localhost:7777
Tunnel:  https://remembered-donations-glasgow-alive.trycloudflare.com
```
Zero-dependency. Just Node 18+. `project.json` is the timeline — edit it directly or let an agent write it.

### 2. Thumbnail Server
```
Port: 8765
Location: /root/projects/blog
Start:   screen -dmS thumbnail_server bash -c "python3 /root/projects/blog/scripts/thumbnail_server.py 8765"
Stop:    screen -S thumbnail_server -X quit
Access:  http://localhost:8765
Tunnel:  https://passenger-literary-alignment-enable.trycloudflare.com
Endpoints:
  /api/images        — all 348+ images in the art library
  /api/matches       — video-to-image match results
  /api/assignments   — user-saved image assignments
  /api/render        — render a thumbnail from spec
  /img/<id>          — serve any artwork image by ID
```

---

## Pipeline Scripts

### Voiceover (`scripts/generate-voiceover.mjs`)
```bash
node scripts/generate-voiceover.mjs <storyboard-id>
```
Edge-TTS per segment. Dual voice:
- `en-US-AriaNeural` (female) — main narration
- `en-GB-RyanNeural` (male) — quotes/source material

Output: `content/publishing/voiceover/<id>/` — per-segment MP3s + `timing.json`

### Subtitles (`scripts/generate-subtitles.mjs`)
```bash
node scripts/generate-subtitles.mjs <storyboard-id> [--font <name>] [--quote-font <name>]
```
Reads storyboard + timing manifest. Produces:
- `.ass` — styled subs (Reenie Beanie main, Ephesis quotes, gold accent, fade in/out)
- `.srt` — plain text for YouTube upload

Uses app-generated word-timing from edge-tts to align subtitles to speech.

Options:
- `--font` — main text font (default: "Reenie Beanie")
- `--quote-font` — quote text font (default: "Ephesis")
- `--out` — output directory

### Quote Cards (`scripts/generate-quote-card.py`)
```bash
echo '{"text":"...","author":"...","style":"centered_sparse"}' | python3 scripts/generate-quote-card.py
```
Pillow-generated transparent PNGs for overlay. Styles:

| Style | Position | Text Font | Author Font |
|-------|----------|-----------|-------------|
| `centered_sparse` | Center | Ephesis 52px | Cormorant 28px gold |
| `lower_third` | Bottom | Reenie Beanie 44px | Cormorant 24px gold |
| `full_quote` | Center-wide | Ephesis 48px | Playfair 26px gold |

All cards: 1280x720 RGBA, transparent bg, text shadow, soft margins.

Cards are dropped into FableCut's `media/` folder, then placed on V1 or V2 as overlay clips with fade transitions.

---

## FableCut Filter Presets (Ochema treatments)

Added to `app.js` → `FILTER_PRESETS`:

| Preset | Contrast | Sat | Bright | Temp | Vignette | Grain | Other |
|--------|----------|-----|--------|------|----------|-------|-------|
| none | 100 | 100 | 100 | 0 | 0 | 0 | — |
| golden-imaginal | 108 | 82 | 97 | +15 | 16 | 3% | — |
| tibetan-red | 112 | 90 | 95 | +10 | 0 | 4% | tint +20 |
| corbin-blue | 110 | 74 | 94 | -15 | 20 | 2% | — |
| engraving-crisp | 116 | 0 | 102 | 0 | 0 | 1% | grayscale, 5% sepia |
| sepia-classic | 108 | 70 | 100 | 0 | 15 | 0 | 35% sepia |
| mystical-dark | 112 | 105 | 90 | 0 | 35 | 5% | — |

---

## Font Registry

### System-installed (for Pillow, FFmpeg, .ass subs)

| Font | Use | Source |
|------|-----|--------|
| EB Garamond | Scholarly serif | apt |
| IM FELL English | Old book | apt |
| IM FELL English SC | Small caps | apt |
| Cinzel | Classical display | Google Fonts |
| Cinzel Decorative | Ornamental display | Google Fonts |
| Cormorant Garamond | Editorial serif | Google Fonts |
| Playfair Display | Classical serif | Google Fonts |
| Alegreya | Old-style | Google Fonts |
| Lora | Readable serif | Google Fonts |
| Libre Baskerville | Old-style | Google Fonts |
| Cardo | Medieval scholarly | apt |
| Goudy Bookletter | Old style | apt |
| UnifrakturCook | Blackletter | Google Fonts |
| UnifrakturMaguntia | Blackletter | Google Fonts |
| Kaushan Script | Calligraphic | apt |
| Mea Culpa | Calligraphic | Google Fonts |
| Eagle Lake | Mystical/whimsical | Google Fonts |
| Metamorphous | Whimsical | Google Fonts |
| Parisienne | Elegant script | Google Fonts |
| MedievalSharp | Medieval display | Google Fonts |
| Old Standard TT | Classical | apt |
| **Reenie Beanie** | **Subtitles (main)** | Google Fonts |
| **Ephesis** | **Subtitles (quotes)** | Google Fonts |
| **Sedgwick Ave Display** | **Thumbnail titles** | Google Fonts |
| **Caveat** | **Handwritten subs** | Google Fonts |
| Dancing Script | Calligraphic | apt |
| Lobster Two | Script | apt |
| Junicode | Medievalist | apt |
| Elstob | Medievalist | apt |
| DejaVu Serif | Fallback | system |

### FableCut Google Fonts (auto-fetched in UI)
All above + Anton, Bebas Neue, Inter, Montserrat, Poppins, Roboto, etc. (20+ bundled in `library/fonts/`)

---

## Video Structure

Every video follows this structure in FableCut:

```
Track V1 (main visuals):
  [artwork with slow zoom] → [artwork with Ken Burns] → [quote card black page] → [artwork] → ...
  
Track A1 (audio):
  [narration segments]
```

All artwork clips: gentle slow zoom or Ken Burns pan for motion. No filters, no colour grading.
Quote cards: full-screen black with centred white serif text, speaker name in smaller gold below.

---

## Hermes MCP Integration

FableCut exposes an MCP server at `/root/projects/FableCut/mcp-server.js`.

### Register with Claude:
```bash
claude mcp add -s user fablecut -- node "/root/projects/FableCut/mcp-server.js"
```

### Available tools:

| Tool | Purpose |
|------|---------|
| `fablecut_status` | Check server, get project + media summary |
| `fablecut_docs` | Get schema docs (supports `section` filter) |
| `fablecut_get_project` | Read current timeline (pass `compact:true` for summary) |
| `fablecut_set_project` | Replace entire project JSON |
| `fablecut_patch_project` | Targeted edits — PREFER THIS |
| `fablecut_import_media` | Copy file into media/ and register |
| `fablecut_analyze_reference` | Analyze reference video into edit blueprint |

### Patch operations:
- `{op:'addClip', clip:{track:'V1', start:0, duration:10, kind:'video', mediaId:'m_xxx', props:{...}}}`
- `{op:'updateClip', id:'c_xxx', set:{props:{filterPreset:'golden-imaginal'}}}`
- `{op:'removeClip', id:'c_xxx'}`
- `{op:'addMedia', media:{src:'/media/file.mp4', kind:'video'}}`

### Hermes workflow for a video:
```
1. fablecut_status — ensure server is running
2. fablecut_import_media — import artwork images
3. fablecut_import_media — import quote card PNGs
4. fablecut_import_media — import narration MP3s
5. fablecut_patch_project — add clips to timeline:
   → V1: artwork with slow zoom (fade in)
   → V1: artwork with Ken Burns
   → V1: quote card (black page, fade in/out)
   → V1: artwork with slow zoom
   → ...
   → V1: final artwork (fade to black)
   → A1: narration segments
```

---

## Commands Quick Reference

```bash
# Start everything
screen -dmS thumbnail_server bash -c "python3 /root/projects/blog/scripts/thumbnail_server.py 8765"
screen -dmS fablecut bash -c "cd /root/projects/FableCut && node server.js"

# Voiceover
node /root/projects/blog/scripts/generate-voiceover.mjs <id>

# Subtitles
node /root/projects/blog/scripts/generate-subtitles.mjs <id>

# Quote cards
echo '{"text":"...","author":"...","style":"centered_sparse","output":"media/quote.png"}' | python3 /root/projects/blog/scripts/generate-quote-card.py

# Thumbnails
python3 /root/projects/blog/scripts/thumbnail_render.py --test

# Tunnel access
cloudflared tunnel --url http://localhost:7777   # FableCut
cloudflared tunnel --url http://localhost:8765   # Thumbnail server

# Kill screens
screen -S fablecut -X quit
screen -S thumbnail_server -X quit
```
# Factory Analytics — Feedback Loop

## Overview

After a video is published, YouTube Analytics feeds retention data back into the factory. This closes the loop: research → produce → measure → research better.

```
Published video on YouTube
        ↓  (7+ days later)
YouTube Analytics API
  → retention per second
  → mapped to storyboard segments
  → joined against visual-assignment.json
  → computed: which artwork, which topic, which treatment retained viewers
        ↓
Reports fed back into:
  - Research acquisition priority (which topics outperform)
  - RO expansion decisions (which passages resonate)
  - Video pipeline tuning (format, pacing, visual choices)
  - Factory queue reprioritisation
```

## What Analytics Can Tell Us

### Per-Video Metrics (from YouTube Analytics API)

| Metric | What It Measures | Factory Use |
|--------|-----------------|-------------|
| `averageViewDuration` | How long people watched | Overall quality signal |
| `averageViewPercentage` | % of video watched | Compared to benchmark |
| `views` | Total views | Reach |
| `estimatedMinutesWatched` | Total watch time | Engagement weight |
| `likes`, `comments`, `shares` | Engagement | Community signal |
| `subscribersGained` | Channel growth | Topic demand signal |
| `audienceRetention` | Per-second retention curve | Beat-level performance |

### Beat-Level Analytics (Mapped to Storyboard)

The retention curve is mapped to storyboard segments:

```
elapsedVideoTimeRatio × duration → beat timestamp
  → beat timestamp → segment_id in storyboard
    → join against visual-assignment.json
      → which artwork was showing?
      → which topic was being discussed?
      → which rhetorical role (hook, thesis, quote, etc.)?
```

This produces per-segment metrics:

```json
{
  "segment_id": "seg-03-expansion",
  "topic": "Active Imagination",
  "artwork_id": "art_alchemy_e281",
  "treatment": "none",
  "retention_at_start": 0.92,
  "retention_at_end": 0.78,
  "dropoff": 0.14,
  "relative_retention": 1.05
}
```

### Cross-Video Aggregation

After 5+ videos, patterns emerge:

| Question | How We Answer |
|----------|---------------|
| Which topics retain best? | Aggregate retention by RO topic across all videos |
| Which artwork correlates with dropoff? | Find artworks where retention drops >20% during their segment |
| Do quote cards hold attention? | Compare retention during quote segments vs artwork segments |
| Which rhetorical roles lose viewers? | Average dropoff per role (hook, thesis, expansion, etc.) |
| Do longer videos perform worse? | Correlation between duration and averageViewPercentage |
| Which series performs best? | Compare tantraloka vs mixed vs seth videos |

## Feedback Loop Actions

### Research Acquisition Priority

If analytics show:
- **Tantraloka videos retain 20% better than mixed traditions** → prioritise Tier 1 research
- **Viewers drop during dense metaphysical segments** → acquire better explanatory sources
- **Quote segments have highest retention** → find more quotable source material
- **Certain topics (e.g. daimon) outperform others** → expand RO coverage in that area

### RO Expansion Decisions

```
High-performing topic → expand RO with more passages
Low-performing topic  → audit RO for quality issues, find better sources
Untouched topic with high demand → fast-track through pipeline
```

### Video Pipeline Tuning

```
Retention drops at 8-12 min mark → shorten videos
Quote segments outperform → increase quote ratio
Artwork segments lose viewers → improve art selection, add motion
Hook segments lose viewers → rewrite hooks
```

### Factory Queue Reprioritisation

The queue's `pipeline-queue.json` is reordered by performance signals:

```
score = topic_demand × retention_potential × production_effort
```

Where:
- `topic_demand` = views + subscribers gained for similar topics
- `retention_potential` = average retention for videos in this series
- `production_effort` = inverse of time to produce (cheaper topics first)

## Implementation

### Analytics Ingestion Script

```
scripts/ingest-youtube-analytics.mjs <video-id>
  → pulls retention data from YouTube Analytics API
  → maps to storyboard segments
  → computes per-segment metrics
  → stores in content/video-objects/<slug>/analytics.json
  → updates _pipeline-queue.json priority scores
```

### When to Run

- **Auto:** 7 days after upload (cron job)
- **Manual:** `node scripts/ingest-youtube-analytics.mjs <slug>`

### Connecting the Loop

The final connection: analytics output → pipeline queue reprioritisation.

```python
def reprioritise_queue(analytics_data):
    queue = load("content/factory/queue.json")
    for tier in queue["priority_tiers"]:
        for topic in tier["topics"]:
            if topic in analytics_data:
                topic["performance_score"] = analytics_data[topic]["retention"]
        # Re-sort tier by performance_score descending
        tier["topics"].sort(key=lambda t: t.get("performance_score", 0), reverse=True)
    save(queue)
```

This means: **high-performing topics float to the top.** The factory automatically produces more of what the audience wants.
# Factory Template — Replicable Structure for Any Domain

The factory pipeline is domain-agnostic. The same 5-stage process works for esoteric philosophy, experimental neuroscience, consciousness studies, or any other knowledge domain. Only the source material and content changes.

---

## The Factory Pattern

```
DOMAIN LAYER          (what you're producing content about)
  Source material → Works → ROs → Essays → Videos

INFRASTRUCTURE LAYER  (the machinery, shared across all domains)
  Hermes skills, validation rules, audit scripts, cron, YouTube upload, analytics

INDEX LAYER           (tracking what exists across all domains)
  factory/index.json, factory/queue.json, video-objects/_index.json
```

---

## What Changes Per Domain

| Component | Esoteric | Neuroscience | Notes |
|-----------|----------|-------------|-------|
| **Source material** | blueprints/, content/sources/ | PubMed, arXiv, library/science/ | Different acquisition pipelines |
| **Work schema** | Same | Same | work.schema.json is universal |
| **RO taxonomy** | thinker-topic, tradition, theme | topic, mechanism, evidence, debate | Section taxonomy adapts |
| **Essay style** | Contemplative, poetic | Explanatory, evidence-focused | Writing tone, not structure |
| **Art library** | Alchemical engravings, Renaissance | Brain scans, microscopy, diagrams | Domain-specific visuals |
| **YouTube category** | 27 (Education) | 27 (Education) or 22 (Science) | Same |
| **Tags/metadata** | "tantra, corbin, esoteric" | "neuroscience, consciousness, EEG" | Keywords change |
| **Analytics signals** | Retention by tradition | Retention by mechanism | Topic families differ |

## What Stays The Same

```
Factory pipeline skill     → hermes/skills/factory/factory-pipeline/
Video pipeline skill       → hermes/skills/factory/publish-video-fablecut/
Validation rules           → scripts/factory-audit.py
Upload script              → scripts/upload-youtube.mjs
Analytics feedback         → scripts/ingest-youtube-analytics.mjs (to be built)
Index structure            → content/factory/index.json
Queue structure            → content/factory/queue.json
Video index                → content/video-objects/_index.json
```

---

## Adding a New Domain: Neuroscience Example

### Step 1: Define the Domain

```json
// content/factory/domains/neuroscience.json
{
  "domain": "neuroscience",
  "label": "Experimental Neuroscience & Consciousness",
  "acquisition": {
    "primary": "PubMed (via cron-acquire)",
    "secondary": "arXiv q-bio.NC, bioRxiv neuroscience",
    "queries": [
      "consciousness neural correlates",
      "predictive processing",
      "global workspace theory",
      "integrated information theory",
      "default mode network meditation",
      "brain connectivity consciousness",
      "neural oscillation awareness",
      "altered states fMRI",
      "psychedelic neuroscience",
      "meditation neuroplasticity"
    ]
  },
  "art_sources": ["brain imaging", "neural diagrams", "scientific illustrations"],
  "youtube_metadata": {
    "category": "27",
    "tags": ["neuroscience", "consciousness", "brain", "science"],
    "description_template": "An exploration of {topic} in experimental neuroscience and consciousness studies."
  },
  "tradition_tags": ["neuroscience", "consciousness_studies", "cognitive_science"]
}
```

### Step 2: Run Acquisition

The cron-acquire script already supports PubMed queries. Add the neuroscience queries:

```bash
# Already running: cron-acquire looks at content/works/ for gaps
# New queries go into the phase system:
# Phase 6: Predictive processing, causal inference
# Phase 7: Meditation, DMN, consciousness
# Phase 8: Spontaneous thought, creativity
```

Neuroscience papers are already being acquired:
- 800+ PMC works (t2-pmc-*)
- 700+ PubMed works (t2-pubmed-*)
- 34 Levin works (basal cognition, morphospace)
- Bridge works (EEG, neural networks, consciousness)

### Step 3: Build ROs

Same RO structure, different section taxonomy:

```
neuroscience topic ROs:
  mechanism    — how it works
  evidence     — key studies
  debates      — controversies
  implications — what it means for consciousness studies
  bridges      — connections to esoteric traditions (optional)
```

### Step 4: Art Adaptation

Neuroscience needs different visuals:
- Brain imaging (fMRI, EEG) — public domain from scientific papers
- Neural diagrams — created with Manim or sourced from open databases
- Scientific illustrations — Wellcome Collection has extensive biomedical art

The existing art pipeline's search APIs already support neuroscience queries.

### Step 5: Cross-Domain Bridges

The most valuable content lives at the intersection:

```
esoteric concept     ↔  neuroscience mechanism
meditation states    ↔  default mode network
nonduality           ↔  predictive processing
subtle body          ↔  interoceptive pathways
kundalini            ↔  thalamocortical loops
imaginal realm       ↔  imagination networks
```

These bridge ROs (many already exist: ro:nanavira, ro:levin, ro:penrose) are the factory's highest-value output — content that no other channel produces.

---

## Trending Neuroscience Topics (Last 2 Years)

Based on publication volume and citation velocity:

| Topic | Trend | Relevance to Factory |
|-------|-------|---------------------|
| **Default Mode Network & meditation** | ↑↑↑ | Direct bridge to tantra/buddhist ROs |
| **Predictive processing / active inference** | ↑↑↑ | Bridges to Vijnana Bhairava, nonduality |
| **Psychedelic neuroscience** | ↑↑↑ | Bridges to imaginal, visionary experience |
| **Neurophenomenology** | ↑↑ | Bridges to first-person contemplative science |
| **4E cognition (embodied, embedded, enactive, extended)** | ↑↑ | Bridges to tantra subtle body, yoga |
| **Consciousness integration (IIT, GNW, HOT)** | ↑ | Theoretical — bridges to Advaita, Shaivism |
| **Brain connectivity / connectomics** | ↑ | Lower direct bridge value |
| **Neuroaesthetics** | ↑ | Bridges to rasa theory, beauty |
| **Sleep & dreaming neuroscience** | ↑ | Bridges to dream yoga, lucid dreaming |
| **Metacognition / self-awareness** | ↑ | Bridges to atma-vichara, self-inquiry |

**Highest-value targets for bridge content:**
1. Default mode network + meditation ←→ tantra/buddhist emptiness
2. Predictive processing ←→ Vijnana Bhairava, nondual awareness
3. Psychedelic neuroscience ←→ Corbin's imaginal, visionary states
4. Neurophenomenology ←→ contemplative science, first-person methods

---

## Running Multiple Domains

The factory queue handles multiple domains natively. Each domain is a separate entry in the queue's priority tiers:

```json
{
  "domains": {
    "esoteric": { "tier": 1, "label": "Core — Esoteric Philosophy" },
    "neuroscience": { "tier": 2, "label": "Bridging — Consciousness Science" }
  },
  "priority_tiers": [
    {
      "domain": "esoteric",
      "tier": 1,
      "topics": ["tantraloka cosmology", "corbin imaginal", ...]
    },
    {
      "domain": "neuroscience",
      "tier": 2,
      "topics": ["DMN meditation", "predictive processing", ...]
    }
  ]
}
```

The cron alternates: process one esoteric item → process one neuroscience item → repeat. This ensures both domains progress.
# Organisation Audit — Re-Rendering Atlas

## The Problem

Everything lives in `/root/projects/blog/`. 332 top-level entries. The Next.js site, the astrology engine, the content factory, the video pipeline, Hermes skills, FableCut, thumbnails, source PDFs — all mixed in one directory. Skills are scattered across `hermes/skills/` and `~/.hermes/skills/`. Hermes has no clear boundary between "site content tasks" and "factory pipeline tasks."

---

## Current Inventory

### Site (Next.js + Cloudflare)
| Path | Purpose | Factory? |
|------|---------|----------|
| `src/` | Next.js app (pages, API routes, components) | NO |
| `workers/` | Cloudflare Workers (YouTube proxy) | NO |
| `server/` | Dev proxy | NO |
| `wrangler.jsonc`, `wrangler.toml`, `next.config.ts` | Config | NO |
| `content/glossary/` | Essays, art, concepts, sources FOR THE SITE | PARTIAL |
| `content/commentaries/` | Uno commentaries (site feature) | NO |

### Hermes Agent System
| Path | Purpose | Factory? |
|------|---------|----------|
| `hermes/skills/` | All factory + site skills (mixed) | MIXED |
| `hermes/notes/` | Specs, handovers, architecture | YES |
| `hermes/docs/` | Documentation | YES |
| `hermes/plugins/` | Astrology plugin | NO |
| `hermes/agents/` | Agent configs | PARTIAL |

### Content Factory
| Path | Purpose | Factory? |
|------|---------|----------|
| `content/works/` | Structured work JSONs | YES |
| `content/research-objects/` | ROs with passages | YES |
| `content/sources/` | Source material by tradition | YES |
| `content/video-objects/` | Video index, visual assignments | YES |
| `content/publishing/` | Storyboards, voiceovers, subtitles | YES |
| `content/_factory-index.json` | Factory inventory | YES |
| `content/_pipeline-queue.json` | Processing queue | YES |
| `factory-spec.md` | Formal rules | YES |
| `scripts/factory-audit.py` | Validation | YES |
| `scripts/generate-storyboard.mjs` | Storyboard gen | YES |
| `scripts/generate-voiceover.mjs` | Voiceover gen | YES |
| `scripts/generate-subtitles.mjs` | Subtitle gen | YES |
| `scripts/generate-quote-card.py` | Quote card gen | YES |
| `scripts/generate-audio.mjs` | TTS gen | YES |
| `scripts/thumbnail_render.py` | Thumbnail renderer | YES |
| `scripts/thumbnail_server.py` | Thumbnail server | YES |
| `fablevid.md` | Pipeline docs | YES |
| `storyboardnotes.md` | Pipeline notes | YES |

### Astrology Engine (Site Feature)
| Path | Purpose | Factory? |
|------|---------|----------|
| `workers/` | Astrology API workers | NO |
| `content/astrology/` | Astrology data | NO |
| `hermes/plugins/atlas-astrology/` | Astrology plugin | NO |
| `hermes/skills/astrology/` | Astrology skills | NO |

### Root-Level Mess
| Path | Count | Purpose |
|------|-------|---------|
| Root PDFs | 36 | Tantraloka, Nagarjuna, Steiner, etc. — should be in library/ |
| Root .md files | ~200 | Mix of specs, notes, essays, plans |
| `synthesis-essays/` | 146 | Pre-factory essays — should be ROs or works |
| `blueprints/` | 19 | Source texts — should be works |
| `essayglobal/` | ~500 | Old essay system |
| `library/` | 257 | Science papers + source texts |
| `hypothetical/` | 7 | Design docs |
| `hypothetical-integrated/` | 9 | More design docs |
| `tetrahermes*/` | Various | Old project artifacts |
| `gowan-papers/` | 122 | Raw papers |
| `agents/` | 1 | Agent configs (legacy) |
| `notes/` | 30 | Root-level notes |
| `scholars/` | 69 | Scholar content |

---

## The Organisation Plan

### Separation: Two Concerns

```
FACTORY PIPELINE                    SITE + ASTROLOGY ENGINE
(source → RO → essay → video)      (Next.js, API, astrology, graph, chat)
                                   
content/works/                      src/ (Next.js)
content/research-objects/           content/glossary/ (site-facing essays, art)
content/sources/                    content/commentaries/
content/video-objects/              content/astrology/
content/publishing/                 workers/ (Cloudflare)
content/_factory-*                  hermes/plugins/atlas-astrology/
factory-spec.md                     hermes/skills/astrology/
scripts/factory-audit.py            
scripts/generate-*.mjs/py           HERMES SYSTEM
scripts/thumbnail_*.py              (shared — controls both)
fablevid.md                         
storyboardnotes.md                  hermes/skils/factory-pipeline/
                                    hermes/skils/publish-video-fablecut/
                                    hermes/skils/acquire/
                                    hermes/skils/write/
                                    hermes/skils/publish/
```

### What Is Factory vs Site

| Domain | Factory | Site | Notes |
|--------|---------|------|-------|
| **Works** | ✅ Source material structured | ❌ | Factory consumes, site doesn't |
| **ROs** | ✅ Compilation manifests | ❌ | Internal — site reads essays, not ROs |
| **Essays** | ✅ Products the factory produces | ✅ Site displays them | Shared — factory writes, site serves |
| **Art** | ✅ Used in video pipeline | ✅ Site gallery | Shared |
| **Sources** | ✅ Raw material for extraction | ❌ | Factory internal |
| **Video objects** | ✅ Pipeline tracking | ❌ | Factory internal |
| **Astrology** | ❌ | ✅ Site feature | Not factory |
| **Commentaries** | ❌ | ✅ Site feature | Not factory |
| **Graph data** | ❌ | ✅ Site feature | Not factory |
| **Hermes skills** | ✅ Pipeline skills | ✅ Site skills | Separate directories |

### Skill Reorganisation

Current (mixed):
```
hermes/skills/
  astrology/       ← site
  core/            ← factory (acquire, publish, etc.)
  daimon/          ← site
  ops/             ← site
  practice/        ← site
  source-to-essay/ ← factory
  video/           ← factory
  writing/         ← factory
```

Proposed:
```
hermes/skills/
  factory/                     ← Pipeline skills
    factory-pipeline/           Master controller
    publish-video-fablecut/     Video pipeline
    acquire/                    Paper acquisition (moved from core/)
    publish/                    Publication (moved from core/)
    write/                      Essay writing (moved from writing/)
    source-to-essay/            Source extraction (moved from source-to-essay/)
    
  site/                        ← Site operations
    astrology/                  Astrology skills
    daimon/                     Daimon companion
    practice/                   Practice recommendations
    ops/                        DevOps (deploy, etc.)
    art/                        Art curation
    audio/                      Audio generation for site essays
```

### File Reorganisation

Move root-level mess into structured directories:
```
library/
  source-texts/     ← blueprints/source_texts/ moved here
  science/          ← already here
  pdfs/             ← root PDFs moved here

content/
  factory/          ← Factory-specific (new)
    _index.json       → from _factory-index.json
    _queue.json       → from _pipeline-queue.json
  works/            ← stays
  research-objects/ ← stays
  video-objects/    ← stays
  publishing/       ← stays
  sources/          ← stays
  glossary/         ← stays (shared with site)
  astrology/        ← stays (site)
  commentaries/     ← stays (site)
```

---

## Action Items

### Immediate (sorted by impact)

1. **Move skills** — `core/acquire` → `factory/acquire`, `writing/write` → `factory/write`, etc. Update `~/.hermes/skills/` copies. Restart gateway.

2. **Update cron skill** — change `video-pipeline` cron to load `factory-pipeline` skill instead of `publish-video-fablecut`. Remove the old prompt confusion.

3. **Separate factory index** — move `_factory-index.json` and `_pipeline-queue.json` to `content/factory/`. Update AGENTS.md references.

4. **Prune root** — move 36 root PDFs to `library/pdfs/`, archive old root markdown docs to `archive/` or delete.

### Medium-term

5. **Collapse synthesis-essays/ into content/works/** — those 146 essays are source material, not factory output. Convert them to Work JSONs.

6. **Collapse blueprints/source_texts/ into content/works/** — same logic, 19 source texts need Work JSONs.

7. **Remove essayglobal/ and tetrahermes*/ and gowan-papers/** — either integrate into content/works/ or archive.

8. **Separate skill repo** — optional: move `hermes/` skills to `/root/projects/hermes-factory-skills/` so the factory pipeline doesn't need the site repo.

### Never

- Don't move `content/glossary/essays/` — the site serves them, the factory writes them. Shared boundary is fine.
- Don't move `content/glossary/art/` — same reasoning, shared between site gallery and video pipeline.

---

# RO Quality Audit (2026-07-20)

## Summary
- 166 ROs total
- 0 at 100% validation pass rate (before fixes)
- Top 10 ROs targeted for manual correction to prove the system
- Most common failures: R23 (sources with 0 passages used: 164 ROs), R21 (<50% from Tier 1: 163 ROs), R05 (one_line >200 chars: 102 ROs)
- 34 ROs have <5 passages (too thin for essay expansion)

## Factory Skills
Factory skills in /root/projects/blog/hermes/skills/factory/:
  acquire, audio, cron-acquire, factory-pipeline, publish, publish-video-fablecut, search, source-to-essay, synth, write

Site skills in /root/projects/blog/hermes/skills/site/:
  art, astrology, daimon, ops, practice

## Services
- FableCut: port 7777, /root/projects/FableCut
- Thumbnail server: port 8765
- Cron: video-pipeline (every 6h) with factory-pipeline skill
- Gateway: Hermes systemd service

## Traceability Chain
source PDF → work JSON → RO passage (source_id) → essay block (ro_passage_id) → storyboard segment (source_essay) → visual assignment (artwork_id) → FableCut clip → YouTube

## Pipeline Stages
1. Source → Work (acquire)
2. Work → RO (compile)
3. RO → Essay (write-and-publish, Ralph Loop, 8 phases)
4. Essay → Storyboard (generate-storyboard.mjs + generate-voiceover.mjs)
5. Storyboard → Video (art search + FableCut timeline + export)
6. Upload to YouTube (upload-youtube.mjs)
7. Analytics feedback → research reprioritisation

## Replicable Template
The factory structure is domain-agnostic. Same 5-stage pipeline works for esoteric philosophy, neuroscience, or any knowledge domain. Only source material and content changes. See factory-template.md.
