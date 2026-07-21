# Factory Manual — Source Truth for the Content Factory

## Object Hierarchy

```
RAW SOURCE (PDF, text, book)
    ↓ acquire
WORK JSON (content/works/) — structured metadata + provenance
    ↓ compile
┌─────────────────────────────────────────────────────┐
│                    OBJECT LAYER                      │
│                                                      │
│  RO (Research Object) — one topic, one tradition     │
│    "The 36 Tattvas in Kashmir Shaivism"              │
│    "Corbin's Mundus Imaginalis"                      │
│    "The Daimon in Platonism"                         │
│                                                      │
│  CO (Comparison Object) — compares exactly 2 ROs    │
│    "Daimon across Platonism vs Theurgy"              │
│    "Death: Tibetan Buddhism vs Tantraloka"           │
│    Links: ro_x, ro_y                                 │
│                                                      │
│  SO (Synthesis Object) — combines 3+ ROs/COs         │
│    "The Death Journey: Tibetan, Egyptian, Steiner"    │
│    "Imagination as Faculty across Traditions"        │
│    Links: [ros and/or cos]                           │
│                                                      │
└─────────────────────────────────────────────────────┘
    ↓ write
ESSAY — can draw from RO, CO, or SO
  type: ro_focused | comparative | synthesis
  source_refs: [ro_id, co_id, so_id]
```

## Object Definitions

### Research Object (RO)

**Purpose:** A living compilation on ONE bounded topic. Like a Wikipedia article that version-controls its sources.

**Rules:**
- ONE topic, one tradition (or one thinker on one topic)
- NEVER comparative — if you want to compare, that's a CO
- Sources are works from content/works/
- Body passages are `kind: "source"` only — no commentary, no AI writing
- Versioned with semver, changelog in timeline[]
- Each passage traces to a specific source work + page reference

**When to use:** "What does X say about Y?" or "What is concept Z in tradition W?"
**When NOT to use:** Comparing two things. That's a CO.

**Valid families:** thinker-topic, tradition, theme, concept-evolution, practice, source-study

### Comparison Object (CO)

**Purpose:** Explicit comparison of exactly 2 ROs. Discovers agreements, disagreements, and unresolved questions.

**Rules:**
- Links exactly 2 ROs via `parents: [ro_id_1, ro_id_2]`
- Body has sections: scope, agreement, disagreement, unresolved
- Each passage traces to its source RO + passage_id
- Does NOT introduce new source material — only uses what's in the parent ROs
- Versioned with semver, linked parent versions pinned

**When to use:** "How does X compare to Y on topic Z?"
**When NOT to use:** Combining 3+ things. That's a SO.

### Synthesis Object (SO)

**Purpose:** Higher-level synthesis of 3+ ROs and/or COs. Produces the cross-tradition insights that make the content unique.

**Rules:**
- Links 3+ objects (mix of ROs and COs)
- Body has sections: scope, dimensions, convergences, divergences, open questions
- Can introduce NEW synthesis passages (kind: "ai") — the only object that can
- Versioned with semver

**When to use:** "What happens when we look at death across 6 traditions?" or "What do all these traditions agree on about the daimon?"

### Essay

**Purpose:** The consumer-facing product. Written from ROs, COs, and/or SOs.

**Types:**
- `ro_focused` — deep dive into one RO (1 source)
- `comparative` — explores a CO (2 sources)
- `synthesis` — big-picture from a SO (3+ sources)
- `concept` — stub/idea, not fully developed (<5 blocks)

**Rules:**
- Every `source` block traces to a passage via `ro_passage_id` or `co_passage_id` or `so_passage_id`
- Every essay registers against all objects it draws from in `essay-registry.json`
- 3-pass writing architecture applies to all types

### Concept

**Purpose:** Seed. An idea that hasn't been developed yet. <5 blocks, <1500 chars.

**When to use:** "I have an idea about X but haven't expanded it yet."
**Path forward:** Expand to 5+ blocks → reclassify as essay (any type).

---

## Why laya-daimon-contact is Wrong as an RO

`ro:laya-daimon-contact` combines two distinct topics (Layayoga + Daimon) into one RO. This breaks the rule:

- **ROs should be:** `ro:layayoga-absorption` (focused on one topic: absorption in Layayoga) AND `ro:daimon-contact` (focused on one topic: daimon contact)
- **CO should be:** `co:laya-daimon-contact` comparing the two ROs
- **SO or essay could be:** "The Daimon Contact Path through Layayoga and Tantraloka" drawing from both ROs via the CO

The existing RO should be split into two ROs and re-registered as a CO.

---

## FableCut Integration: Object → Screen

The video pipeline is the factory's output channel. Every object type can feed into it:

```
RO ───→ ro_focused essay ───→ storyboard ───→ visual assignment ───→ FableCut timeline ───→ YouTube
CO ───→ comparative essay ──→ storyboard ───→ visual assignment ───→ FableCut timeline ───→ YouTube
SO ───→ synthesis essay ────→ storyboard ───→ visual assignment ───→ FableCut timeline ───→ YouTube
                                   │                  │
                              picks artwork      matches art_id
                              from concept.art[]  to media files
                                   │                  │
                              adds quote cards   builds project.json
                              from essay quotes  via MCP or direct write
```

### Storyboard → Visual Assignment Link

The storyboard's segments reference concepts. The visual assignment resolves those concepts to specific artwork:

```
storyboard segment
  ├── narration text → extract keywords → match art.concepts[] → pick artwork_id
  ├── rhetorical_role → hook → doorway_open, quote → quote_card, etc.
  └── concepts[] → cross-reference against art gallery

visual assignment
  ├── segment_id → matches storyboard segment
  ├── artwork_id → resolves to public/art/ file → copied to FableCut media/
  ├── quote_text → sent to generate-quote-card.py → PNG → copied to FableCut media/
  └── motion → slow_zoom / ken_burns / still → applied as keyframes in FableCut
```

### The Complete Content Graph

```
                      ┌──────────────────┐
                      │   SOURCE WORK     │ (content/works/)
                      │  (acquired paper) │
                      └────────┬─────────┘
                               │ extracts passages
                               ▼
┌───────────────────────────────────────────────────────────────┐
│                     OBJECT LAYER                              │
│                                                               │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐                 │
│  │    RO    │◄──►│    CO    │◄──►│    SO    │                 │
│  │ (topic)  │    │(2 ROs)   │    │ (3+ ROs) │                 │
│  └────┬─────┘    └────┬─────┘    └────┬─────┘                 │
│       │               │               │                        │
│       ▼               ▼               ▼                        │
│  ┌──────────────────────────────────────────┐                 │
│  │               ESSAY                       │                 │
│  │  ro_focused / comparative / synthesis     │                 │
│  │  body: source + ai + art blocks           │                 │
│  │  concepts[], source_ids[], ro_passage_id  │                 │
│  └───────────────────┬──────────────────────┘                 │
│                      │                                         │
└──────────────────────┼─────────────────────────────────────────┘
                       │
                       ▼
              ┌──────────────────┐
              │   STORYBOARD     │ (content/publishing/storyboards/)
              │  8 segments      │
              │  rhetorical_roles│
              └────────┬─────────┘
                       │
                       ▼
              ┌──────────────────┐
              │ VISUAL ASSIGNMENT│ (content/video-objects/*/)
              │ artwork_id per   │
              │ segment          │
              └────────┬─────────┘
                       │
                       ▼
              ┌──────────────────┐
              │ FABLECUT TIMELINE│ (/root/projects/FableCut/project.json)
              │ clips + audio    │
              │ + transitions    │
              └────────┬─────────┘
                       │
                       ▼
              ┌──────────────────┐
              │   YOUTUBE        │
              │ uploaded video   │
              │ + analytics      │
              └────────┬─────────┘
                       │
                       ▼ (feedback loop)
              ┌──────────────────┐
              │ CONCEPT.UPDATE   │
              │ re-prioritize    │
              │ in factory queue │
              └──────────────────┘
```

## The Chain Reaction Principle

When a new source enters the system:

```
1. Source added to content/works/
2. Relevant RO found → passages extracted to RO (new version)
3. CO that links this RO → auto-updated (new version, may need new passages)
4. SO that links this CO → auto-updated (new version)
5. Essays that draw from any of these → flagged for review (not auto-updated)
```

This means one new paper can trigger a chain of updates across the entire object graph.

---

## Complete Entity-Relationship Map

```
SOURCE WORK (content/works/)
  │
  ├── feeds into RO (research_object.sources[].source_id → work.work_id)
  │
  ▼
CONCEPT (content/glossary/concepts/)
  │  concept.research_objects[] → ro.ro_id
  │  concept.essays[] → essay.id
  │  concept.art[] → art.id
  │  concept.source_material[] → work.work_id
  │
  ├── links to ART (art.concepts[] → concept.id, art.used_in[] → essay.id)
  │     art entry → FableCut media clip → video timeline
  │
  ├── links to RO (ro.body[].topics[] → concept matches)
  │     RO → CO (co.parents[] → ro.ro_id)
  │     RO → SO (so.parents[] → ro.ro_id)
  │     RO → essay (essay.source_ids[] → ro.ro_id)
  │
  ├── links to ESSAY (essay.concepts[] → concept.id)
  │     essay → STORYBOARD (storyboard.source_essay → essay.id)
  │     storyboard → VISUAL ASSIGNMENT (va.storyboard_id → storyboard.episode_id)
  │     visual assignment → FABLECUT TIMELINE (va.segments[].artwork_id → art.id)
  │     FableCut → YOUTUBE (video.youtube_video_id in video index)
  │
  └── links to ASTROLOGY (concept.astrology → correspondences)
        astrology → chart reading → personalized content
```

### Full Chain: Concept → Video

```
User explores "daimon" concept
  → concept.daimon loads: RO (ro:daimon-platonist), art (art_angel_gabriel), essays
  → Hermes picks RO → writes essay (3-pass)
  → Essay → storyboard (generate-storyboard.mjs)
  → Storyboard → visual assignment (picks artwork from concept.art[])
  → Visuals + narration → FableCut timeline
  → Export → YouTube
  → Analytics → informs which daimon essays perform best
  → Concept.daimon gets re-prioritized in queue
```

### Running the Link Script

```bash
python3 hypothetical-integrated/scripts/link-silos.py --dry-run  # preview
python3 hypothetical-integrated/scripts/link-silos.py           # apply
```

This links Concepts ↔ ROs ↔ Works ↔ Astrology ↔ Essays. Safe to run — only adds fields, never removes.

## Pipeline Actions by Object Type

| Object | Create | Update | Validate | Essay |
|--------|--------|--------|----------|-------|
| RO | compile from work(s) | add passage, bump version | R01-R23 | ro_focused essay |
| CO | link 2 existing ROs | re-compare, bump version | C01-C12 | comparative essay |
| SO | combine 3+ objects | re-synthesize, bump version | S01-S10 | synthesis essay |
| Essay | write from object(s) | 3-pass refine | E01-E13 | — |

---

## Factory Index Structure

```
content/factory/
  index.json                    — master inventory of all objects
  queue.json                    — processing queue by priority
  ro-queue.json                 — ROs ready for essay expansion
  essay-registry.json           — object → essay linkage
  essay-classification.json     — essay status classification
  ro-essay-linkage.json         — RO → essay traceability

content/research-objects/       — ROs (ro-* directories)
content/comparison-objects/     — COs (co-* directories)  ← NEW
content/synthesis-objects/      — SOs (so-* directories)   ← NEW
content/glossary/essays/        — essays (product)
```

## Essay Statuses (Final)

| Status | Criteria | Next Step |
|--------|----------|-----------|
| concept | <5 blocks or <1500 chars | Expand to 5+ blocks |
| first_draft | 5-14 blocks, structurally complete | Add audio, refine prose |
| final_draft | 15+ blocks, may lack audio/concepts | Add audio, register RO trace |
| published | Audio + concepts + 15+ blocks + RO trace | Monitor analytics |
