# Current Research Docs — Content Architecture & Pipeline Design

> **North Star:** Hermes as compiler, not writer. The system exists to surface what scholars have already said — organized, linked, audible, deployable. Original writing is a separate concern.

---

## The Three-Tier Content Taxonomy

Every piece of text in the system belongs to exactly one of three tiers. This is non-negotiable.

### Tier 1: Source Material (author's own words)
- Raw text from the original author (Corbin, Ficino, Nanananda, Plato, etc.)
- May be: PDF, scanned book, transcribed lecture, academic paper
- ID format: `source:{slug}`
- Stored in: `content/glossary/sources/` or `library/{corpus}/`
- Never modified, only extracted and formatted
- **Body block kind:** `"source"`

### Tier 2: Commentary (a scholar writing about the source)
- An academic's analysis, interpretation, or criticism of a source
- Examples: a journal article about Ficino, a thesis about Corbin
- ID format: `work:{slug}`
- Stored in: `content/works/`
- This is what we acquire via the acquisition pipeline
- **Body block kind:** `"source"` — it's still someone's original writing, just secondary literature

### Tier 3: Compilation (Hermes assembling existing texts, NOT writing)
- Takes Tier 1 or Tier 2 texts and presents them together around a concept
- **Zero AI writing.** No `kind: "ai"` blocks. No commentary. No framing.
- Every block is `kind: "source"` or `kind: "summary"` — the latter only for compression, never for original claims
- This is what a "concept essay" is: Ficino on the Daimon collects everything Ficino wrote about daimons, presented alongside what Plato wrote, organized thematically
- ID format: `concept:{concept-name}` or `essay:{slug}` with type `"compilation"`
- Stored in: `content/glossary/essays/`

### The Rule

```
Tier 1: Source        → kind: "source"     → the author's own words
Tier 2: Commentary    → kind: "source"     → a scholar's own words
Tier 3: Compilation   → kind: "source"     → Hermes compiles, does NOT write
                       kind: "summary"     → only for compression, never analysis
                       NO kind: "ai"       → NEVER
```

Original Hermes-written essays (Type A from the skills) exist outside this taxonomy — they are a separate product, produced by `/write-and-publish`. The three tiers above are the **hermeneutic pipeline**: moving from raw ore → refined ingot → assembled structure, with Hermes as the factory machinery, not the craftsman.

---

## The Factory Pipeline

### Material Flow

```
                        KANBAN BOARD
                        ┌──────────────────────────────────────────┐
  RAW MATERIAL           │ Backlog │ Extract │ Compile │ Audio │ Live │
  (uploaded PDF,         │         │         │         │       │      │
   acquired paper,       │  Plato  │  Ficino │ Daimon  │  gen  │ deploy
   scholar article)      │  Timaeus│  on Soul│  Concept│  audio│  site
                         │         │         │  Essay  │       │      │
                         └──────────────────────────────────────────┘
                              │         │         │
                              ▼         ▼         ▼
                         TIER 1    TIER 2    TIER 3
                         Source    Work JSON  Concept Essay
```

### Pipeline Stages

Each paper or source moves through these stages. Each stage is a column on a Kanban board.

#### Stage 0: Backlog
- **Input:** User uploads a PDF, or acquisition pipeline downloads it
- **Action:** Categorize by tradition (Ficino/Platonism/Corbin/Nanananda), tag with tentative concepts
- **Gate:** PDF is valid, has extractable text layer
- **Hermes tool:** `/acquisition` or manual upload

#### Stage 1: Extract
- **Input:** PDF with text layer
- **Action:** Extract clean text, identify: central argument, key definitions, striking passages, figures discussed, critical position
- **Output:** Passage packs tagged by concept
- **Gate:** At least 4 passage packs, each 3+ sentences
- **Hermes tool:** `terminal` + `pdftotext`, then manual passage extraction

#### Stage 2: Concept Link
- **Input:** Passage packs from extraction
- **Action:** Map each passage to existing glossary concepts. Create new concept JSONs if needed. Build bidirectional links: `concept → sees_treatment_in → work`, `work → discusses → concept`
- **Output:** Updated concept JSONs with `works` array, updated work JSONs with `concepts` array
- **Gate:** Every passage maps to at least one concept
- **Hermes tool:** Edit concept JSONs in `content/glossary/concepts/`

#### Stage 3: Compile (Concept Essay)
- **Input:** Multiple works tagged with the same concept
- **Action:** Create a compilation essay that presents all treatments of that concept. For example: "The Daimon in Platonic Tradition" would compile:
  - Plato's daimon (from the source text)
  - Ficino's daimon (from acquired papers)
  - Corbin's imaginal angel (from acquired papers)
  - Organized thematically, not by author
- **Output:** Essay JSON with ALL `kind: "source"` blocks. Zero AI writing.
- **Gate:** Every block traces to a specific work + passage
- **Hermes tool:** Write essay JSON manually, referencing extracted passages

#### Stage 4: Audio
- **Input:** Essay JSON
- **Action:** Generate TTS audio — single male voice for compilation essays (all source text)
- **Gate:** Audio file exists at `public/audio/{slug}.mp3`
- **Hermes tool:** `node scripts/generate-audio.mjs {slug}`

#### Stage 5: Deploy
- **Input:** Essay JSON + audio file
- **Action:** Git commit, push, Cloudflare build + deploy
- **Gate:** Essay loads at live URL, audio plays
- **Hermes tool:** `/deploy-site`

---

## Concept Essays: The Core Product

### What Is a Concept Essay?

A concept essay takes a single glossary concept (e.g., "Daimon", "Mundus Imaginalis", "Papañca") and presents everything the system's library says about it, organized thematically.

**Example: "The Daimon in Western Esotericism"**

This essay would compile, in order:
1. Plato's daimon from the *Symposium* (Tier 1 — source text)
2. Ficino's daemon socratico (Tier 2 — acquired paper)
3. Corrias on daemonic imagination (Tier 2 — acquired paper)
4. Corbin's angelology as daimonic (Tier 2 — acquired paper)
5. Theurgy and the personal daimon (Tier 1 — source text)

Every block is `kind: "source"`. There is no Hermes commentary. The essay is structured by thematic sections (The Daimon as Mediator, The Daimon as Guardian, The Daimon as Imagination) — each section introduces nothing but source blocks.

**The effect:** The reader experiences multiple authors across 2,000 years speaking about the same concept, in their own words, without an AI filter. This is what the site should offer that no other resource does.

### How Higher-Order Effects Emerge

Once multiple concept essays exist, higher-order patterns become visible:

- **Ficino's treatment of the daimon vs. Plato's:** A reader can open the Daimon concept essay and see both side by side, in their own words — no analysis needed, the contrast speaks for itself
- **The Mundus Imaginalis across traditions:** Corbin's Islamic philosophy sources alongside Ficino's Neoplatonic sources alongside the Buddhist papañca concept — the same structural insight emerging from different traditions
- **Tension detection:** When concept essays from different traditions contradict each other, that contradiction IS the insight — Hermes flags it but does not resolve it

### How to Use Kanban for This

Each concept essay is a **card** on the Kanban board:

```
Column: "Compile"
  Card: "Concept Essay: Daimon"
    - Links to: work:plato-symposium, work:ficino-daemon-socratico, 
                work:corrias-daemonic-imagination, work:corbin-angelology
    - Status: needs 2 more passages
    - Priority: high (3 users have viewed the daimon concept page)
```

Hermes can create these cards automatically when:
- A concept page gets viewed 3+ times but has no concept essay yet
- A new work is acquired that discusses a concept with 2+ existing works
- The user explicitly requests it

### Kanban Hermes integration:

```yaml
# Hermes kanban card for a concept essay
kanban_create:
  title: "Compile Concept Essay: Daimon"
  assignee: "publication-pipeline"
  body: |
    Works available:
    - work:plato-symposium (source: daimon of Socrates)
    - work:ficino-daemon-socratico (Tier 2, Portuguese)
    - work:corrias-daemonic-imagination (Tier 2, paywalled stub)
    
    Sections: Mediator / Guardian / Imagination
    
    Compile from available works. If some are paywalled stubs, 
    note them as "[unavailable]" in the section header.
  skills: ["publish-paper"]
  parents: ["concept:daimon"]
```

---

## Git Versioning for the Pipeline

Every essay JSON is a text file in git. This means:

1. **Every change is tracked** — who added which passage, when, from which source
2. **Revert is trivial** — `git revert` if a bad compilation is published
3. **Diff shows the evolution** — `git diff` between versions shows exactly what passages were added or removed
4. **Branch for experiments** — try different organizational structures without publishing
5. **Blame for provenance** — `git blame` shows which agent added which block, from which source

### Proposed Workflow

```bash
# A new concept essay compilation
git checkout -b concept/daimon-v2
# Edit the essay JSON
git add content/glossary/essays/concept_daimon.json
git commit -m "concept(daimon): add Ficino's daemon socratico passages"
# Merge when ready
git checkout main
git merge concept/daimon-v2
# Deploy
npm run cf:deploy
```

### Automated Routine (Cron)

Hermes can run a weekly routine:

```yaml
# Weekly: check for new material that could expand existing concept essays
cronjob:
  schedule: "0 9 * * 1"  # Mondays 9am
  skill: "publication-pipeline"
  prompt: |
    1. Check content/works/ for any new works added since last week
    2. For each new work, check which glossary concepts it discusses
    3. For each concept with 2+ works and no concept essay, create a kanban card
    4. Report: new works found, new concept essays possible
```

---

## Upload → Extract → Concept Essay Flow

When the user uploads a new PDF:

```
User sends PDF to Telegram
  │
  ▼
Hermes receives file
  │
  ▼
1. Save to library/{corpus}/{slug}.pdf
2. Create work JSON at content/works/work_{slug}.json
3. pdftotext to check for text layer
  ├── Has text → Extract passages, tag with concepts
  └── No text  → Skip, note as scanned
4. For each concept the paper discusses:
  ├── Update concept JSON to include this work
  └── If concept has 2+ works AND no concept essay → create Kanban card
5. Report back: "Saved and indexed. Connected to [concepts]. [N] concept essays now possible."
```

---

## Hermes Capability Map

| Capability | How it serves the pipeline |
|---|---|
| **Kanban** | Orchestrate the factory: cards for each paper moving through Extract → Compile → Audio → Deploy |
| **Goals (`/goal`)** | Persistent compilation tasks: "Compile the Daimon concept essay" stays active until done |
| **Cron** | Weekly: check for new material, auto-create Kanban cards for concept essays |
| **Git** | Version control for every essay JSON; revert, diff, blame for provenance |
| **`/publish-paper` (Type B)** | Take existing text → JSON → audio → deploy (0% AI writing) |
| **`/acquisition`** | Acquire new Tier 2 materials (scholarly papers) |
| **Acquisition script** | OpenAlex metadata + OA resolution + download + text extraction check |
| **External skills dir** | Live sync: edit a skill file in the project, gateway picks it up |
| **Web search** | Find alternative copies, verify references, research concept connections |
| **Telegram gateway** | User uploads PDF via chat, Hermes processes it, reports back |

---

## Implementation Roadmap

### Phase 1: Foundation (Current)

- [x] Acquisition pipeline (download papers, create work JSONs)
- [x] Type B publishing (existing paper → JSON → audio → deploy)
- [x] 7 PDFs in library, 13 work records
- [x] Concept/essay/source glossary structure
- [x] Kanban available as Hermes tool

### Phase 2: The Factory (Next)

- [ ] Upload → extract flow: user sends PDF, Hermes processes it
- [ ] Passage extraction and concept tagging pipeline
- [ ] Kanban board set up with Extract → Compile → Audio → Deploy columns
- [ ] Auto-create kanban card when concept has 2+ works but no essay
- [ ] Weekly cron for new material detection

### Phase 3: Concept Essays (Core Product)

- [ ] First concept essay: "The Daimon in Platonic Tradition"
- [ ] Second: "Mundus Imaginalis in Corbin and Sufism"
- [ ] Third: "Papañca and the Deconstruction of Experience"
- [ ] Concept page on the site shows: definition + linked works + concept essay
- [ ] Higher-order: side-by-side comparison of same concept across traditions

### Phase 4: Automation

- [ ] Git branch-per-essay workflow automated
- [ ] `/goal`-based compilation: "Compile everything on concept X"
- [ ] Auto-detect tensions across traditions and flag them
- [ ] Reader can navigate: Concept → Works discussing it → Essay compiling them

---

## The One-Sentence North Star

> **Hermes is the librarian, not the author. The system organizes what scholars have already said — surfaced, linked, audible, comparative — and never pretends to be the source.**

