# Complete Data Model — Entity Schemas & Relationships

> Every entity, its fields, its relationships, and where it lives.
> This is the canonical reference for the entire content architecture.

---

## Hierarchy

```
CONCEPT (abstract)
  │
  ├── Art (illustrates concept)
  ├── Concept Essay (compilation about concept, Tier 3)
  │     └── Body passages (kind: "source" only)
  ├── Research Object (living compilation about concept)
  │     └── Body passages (kind: "source" only)
  │           └── Sources (works that provide passages)
  │                 ├── Tier 1: Primary Source (original author)
  │                 └── Tier 2: Commentary (scholar on author)
  │                       └── Author (who wrote it)
  └── Book (collection of essays about concept)
        └── Essays
```

---

## Entities

### 1. Concept

**Location:** `content/glossary/concepts/{slug}.json`
**ID format:** `{slug}` (e.g., `daimon`, `mundus-imaginalis`)

```json
{
  "id": "daimon",
  "name": "Daimon",
  "definition": "An intermediate spiritual being that mediates between gods and humans...",
  "tradition": ["Platonism", "Ficino", "Neoplatonism"],
  "synonyms": ["Daemon", "Spiritual Being", "Mediator", "Genius"],
  "related_to": ["Eros", "Participation", "Divine Madness"],
  "essays": ["ficino-daimon", "daimon-across-platonists"],
  "source_material": ["work:ficino-daemon-socratico"],
  "research_objects": ["ro:ficino-daimon"],
  "art": ["art_angel_gabriel", "art_astrological_bowl"]
}
```

**Relationships:**
- `related_to[]` → other concepts (concept → concept)
- `essays[]` → glossary essays (concept → essay)
- `source_material[]` → works (concept → work)
- `research_objects[]` → ROs (concept → RO)
- `art[]` → art (concept → art)

---

### 2. Art

**Location:** `content/glossary/art/{slug}.json`
**ID format:** `art_{source}_{id}`

```json
{
  "id": "art_met_1",
  "title": "Drawing of an Angel",
  "artist": "Unknown",
  "date": "16th century",
  "source_url": "https://www.metmuseum.org/art/collection/search/454648",
  "image_url": "https://images.metmuseum.org/CRDImages/is/original/DP273279.jpg",
  "license": "Public Domain",
  "description": "",
  "concepts": ["daimon", "angel"],
  "visual_motifs": ["wings", "halo"],
  "style": ["renaissance"],
  "used_in": ["ficino-daimon"]
}
```

**Relationships:**
- `concepts[]` → concepts (art illustrates concept)
- `used_in[]` → essays (art appears in essay)

---

### 3. Essay (Glossary)

**Location:** `content/glossary/essays/{slug}.json`
**ID format:** `{slug}` (e.g., `ficino-daimon`, `corbin_imago_templi_v6`)
**Types:** `hermes_essay` (Type A, has `ai` blocks), `publication` (Type B, all `source` blocks)

```json
{
  "id": "ficino-daimon",
  "title": "Ficino on the Daimon",
  "type": "publication",
  "author": "Henry Corbin",
  "source_ids": ["work:ficino-daemon-socratico"],
  "concepts": ["daimon", "ficino", "tutelary_spirit"],
  "prerequisites": [],
  "audioUrl": "/audio/ficino-daimon.mp3",
  "body": [
    {"kind": "source", "text": "Ficino identifies the Socratic daimon..."},
    {"kind": "source", "text": "The daimon serves as the vehicle of the soul..."}
  ],
  "art": ["art_astrological_bowl"],
  "research_object": "ro:ficino-daimon",
  "ro_version": "1.2.0"
}
```

**Relationships:**
- `concepts[]` → concepts (essay about concept)
- `source_ids[]` → sources / works (essay draws from)
- `art[]` → art (essay uses art)
- `research_object` → RO (essay generated from RO)
- `ro_version` — pins the RO version at time of generation

---

### 4. Source (Glossary)

**Location:** `content/glossary/sources/{slug}.json`
**ID format:** `{slug}` (e.g., `corbin_alone_with_alone`)

```json
{
  "id": "corbin_alone_with_alone",
  "title": "Alone with the Alone: Creative Imagination in the Sufism of Ibn 'Arabī",
  "author": "Henry Corbin",
  "type": "book",
  "tradition": ["Islamic mysticism", "Sufism"],
  "concepts": ["mundus-imaginalis", "active-imagination"]
}
```

**Relationships:**
- Referenced by essays via `source_ids[]`
- Referenced by works via their acquisition metadata

---

### 5. Work (Acquired Paper)

**Location:** `content/works/work_{slug}.json`
**ID format:** `work:{slug}`

```json
{
  "work_id": "work:ficino-daemon-socratico",
  "schema_version": 1,
  "title": "Marsílio Ficino sobre o daemon socrático",
  "authors": [{"name": "Otávio Santana Vieira", "author_id": "author:otavio-vieira"}],
  "publication": {"year": 2020, "type": "article", "language": "pt"},
  "identifiers": {"doi": "10.34019/2237-6151.2020.v17.31924"},
  "tier": 2,
  "tier_label": "scholarly commentary",
  
  "commentary_on": {
    "primary_author": "Marsilio Ficino",
    "primary_work": "Commentary on Plato's Apology of Socrates",
    "primary_topic": "socratic daimon"
  },
  "scholarly_contribution": {
    "type": "textual_analysis",
    "claims": [
      "Ficino identifies the Socratic daimon as a tutelary spirit",
      "The daimon mediates between the individual and the divine"
    ],
    "methodology": "philological commentary analysis",
    "sources_used": ["Ficino's Latin text of Apology commentary"]
  },
  
  "topics": ["socratic_daimon", "tutelary_spirit", "ficino"],
  "tradition": ["platonism", "ficino"],
  "relevance_to_ros": {
    "ro:ficino-daimon": "primary source for ontology section"
  },
  
  "assets": {
    "pdf_path": "library/ficino/ficino-daemon-socratico.pdf",
    "text_path": null,
    "source_url": "https://periodicos.ufjf.br/index.php/sacrilegens/article/view/31924"
  },
  "provenance": {
    "access_status": "open",
    "oa_status": "gold",
    "retrieved_at": "2026-07-11T06:55:00Z"
  },
  "analysis": {
    "summary": "Examines Ficino's commentary on the Apology...",
    "quality_score": 0.85
  }
}
```

**Relationships:**
- `tier` — 1 (primary source) or 2 (commentary)
- `commentary_on{}` — if tier=2, what does this comment on?
- `topics[]` → concepts (work discusses concept)
- `relevance_to_ros{}` → ROs (work feeds into RO)
- `assets.pdf_path` → library PDF

---

### 6. Research Object

**Location:** `content/research-objects/ro-{slug}/ro.json`
**ID format:** `ro:{slug}`

Full schema in `hermes/docs/ro-schema-spec.md`. Key relationships:

```json
{
  "ro_id": "ro:ficino-daimon",
  "family": "thinker-topic",
  "title": "Ficino on the Daimon",
  
  "sources": [{"source_id": "work:ficino-daemon-socratico", ...}],
  "body": [{"passage_id": "p_001", "source_id": "work:ficino-daemon-socratico", "section": "ontology", ...}],
  "coverage": {"ontology": {"status": "substantial", "gaps": ["Latin terminology"]}, ...},
  "issues": [{"type": "coverage_gap", "title": "Missing prayer section", ...}],
  "outputs": [{"output_id": "essay:ficino-daimon", "type": "essay", "ro_version": "1.2.0", ...}]
}
```

**Relationships:**
- `sources[].source_id` → works (RO compiled from works)
- `body[].source_id` → works (each passage traces to a work)
- `outputs[].output_id` → essays (RO generates essay)
- Implicit: concepts via body passage topics

---

### 7. Author

**Location:** `content/authors/author_{slug}.json`
**ID format:** `author:{slug}`

```json
{
  "author_id": "author:henry-corbin",
  "name": "Henry Corbin",
  "born": 1903,
  "died": 1978,
  "tradition": ["shii_islam", "sufism", "phenomenology"],
  "works": ["work:corbin-mundus-imaginalis", "work:corbin-temple-contemplation"],
  "research_objects": ["ro:corbin-imaginal"],
  "description": "French philosopher...",
  "key_concepts": ["mundus-imaginalis", "active-imagination", "ta-wil"]
}
```

---

### 8. Book (Album)

**Location:** `content/glossary/books/{slug}.json`
**ID format:** `{slug}`

```json
{
  "id": "ficino_album",
  "title": "Ficino — Platonic Theology",
  "author": "Marsilio Ficino",
  "description": "Essays on Marsilio Ficino's Platonic Theology...",
  "essays": ["ficino-ladder-of-desire", "ficino-sunlike-eye", "ficino-spiritus"],
  "concepts": ["ficino", "platonic-theology", "soul"],
  "art": ["art_angel_gabriel"]
}
```

---

## Complete Relationship Map

```
                        ┌──────────┐
                        │  Author  │
                        └────┬─────┘
                             │ wrote
                             ▼
┌─────────┐           ┌──────────┐           ┌───────────┐
│ Concept │◄──────────│   Work   │──────────►│   RO     │
│         │  tags     │  (T1/T2) │  feeds     │           │
│  art[]  │           │          │           │ sources[] │
│ essays[]│           │ tier,    │           │ body[]    │
│  ros[]  │           │ commentary_on,        │ outputs[] │
│ sources[]           │ scholarly_            │ issues[]  │
└────┬────┘           │ contribution          └─────┬─────┘
     │                └──────┬───┘                   │
     │ illustrates           │ pdf at                │ generates
     ▼                       ▼                       ▼
┌──────────┐          ┌──────────┐           ┌───────────┐
│   Art    │          │ Library  │           │  Essay    │
│          │          │ (PDFs)   │           │ (output)  │
│ concepts[]          └──────────┘           │           │
│ used_in[]                                 │ concepts[]│
└──────────┘                                 │ art[]     │
                                              │ audioUrl  │
                                              │ ro_version│
                                              └───────────┘
```

---

## File Tree With All Entity Types

```
content/
  glossary/
    concepts/          ← Concept definitions (76 files)
      daimon.json
      mundus-imaginalis.json
      ...

    art/               ← Art metadata (30+ files)
      art_met_1.json
      art_angel_gabriel.json
      ...

    essays/            ← Published essays (67 files)
      ficino-daimon.json
      corbin_imago_templi_v6.json
      ...

    sources/           ← Source material records
      corbin_alone_with_alone.json
      iamblichus_mysteries.json
      ...

    books/             ← Essay collections / albums
      ficino_album.json
      corbin-alone-with-the-alone.json
      ...

  works/               ← Acquired paper records (71 files)
    work_ficino-daemon-socratico.json
    work_kiosoglou-ficino-soul.json
    ...

  authors/             ← Author profiles (2 files)
    author_henry-corbin.json
    author_nanananda.json
    ...

  research-objects/    ← ROs (not yet built)
    _index.json
    ro-ficino-daimon/
      ro.json
      changelog.md
    ...

library/               ← PDF files (62 files)
  ficino/
  corbin/
  voss/
  shaw/
  ...

source-texts/          ← Anna's Archive source PDFs (32 files)
  ficino/
  corbin/
  ibn-arabi/
  ...
```

---

## Query Patterns (How to Navigate)

### "Find all art about the daimon"
```
1. Open concept:daimon.json
2. Read art[] → ["art_angel_gabriel", "art_astrological_bowl"]
3. Open each art JSON for details
```

### "Find all essays about Ficino's daimon"
```
1. Search essays JSONs for concept:"daimon" + author:"Ficino"
2. Or: open concept:daimon.json, read essays[] → filter by ficino relevance
3. Or: open ro:ficino-daimon, read outputs[] → ["essay:ficino-daimon"]
```

### "Find all commentary on Ficino's daimon"
```
1. Search works JSONs for commentary_on.primary_author:"Ficino" + topics:"daimon"
2. Or: open concept:daimon.json, read source_material[] → filter by tier=2
```

### "Trace a passage in an RO back to its source PDF"
```
1. Open ro:ficino-daimon
2. Read body[].source_id → "work:ficino-daemon-socratico"
3. Open work:ficino-daemon-socratico
4. Read assets.pdf_path → "library/ficino/ficino-daemon-socratico.pdf"
```

### "Check if an RO needs updating"
```
1. Open ro:ficino-daimon
2. Read outputs[].ro_version → "1.2.0"
3. Read current_version → "1.3.0"
4. If outputs[].ro_version < current_version → output is stale
```
