# DAIMON — Research Objects: Living Scholarly Compilations

> **Core insight:** The graph can stay tiny. The product becomes **Research Objects** — evolving knowledge compilations that accrete evidence over time. Essays, audio, video, journeys, chatbots all consume the same object. This is not a graph database. This is an **essay workspace** for scholarly synthesis.

---

## What Is a Research Object?

A Research Object is a structured compilation around a concept (Ficino on the Daimon, Corbin on Active Imagination, Papañca in Buddhism). It is not a wiki page, not an Obsidian note, not a Notion doc. It is a **living scholarly synthesis** with:

- **Versioned history** — every change attributable, every source tracked
- **Per-paragraph provenance** — each paragraph knows which source it came from
- **Coverage map** — which topics are covered, which are gaps
- **Research TODO** — explicit gaps Hermes can work to close
- **Impact detection** — when a new source arrives, Hermes says "this affects these Research Objects"

A Research Object is the Tier 3 compilation from `currentresearchdocs.md`. It lives at `content/research-objects/{slug}.json` and is the central artifact everything else consumes.

---

## Lifecycle of a Research Object

```
Raw Idea                          (user says "I want a compilation on X")
    │
Collect Sources                   (Hermes searches library + OpenAlex for relevant works)
    │
First Compilation                 (Hermes assembles passages into structured JSON)
    │
Review                            (user reviews on Telegram, requests changes)
    │
Expanded                          (Hermes adds more sources, fills gaps)
    │
Published                         (deployed to Cloudflare as essay + audio)
    │
Ongoing improvement               (cron checks for new sources, suggests expansions)
```

Each Research Object has a status:

```json
"status": "idea" | "collecting" | "draft" | "review" | "published" | "expanding"
```

---

## Anatomy of a Research Object

```json
{
  "ro_id": "ro:ficino-daimon",
  "title": "Ficino on the Daimon",
  "status": "draft",
  "schema_version": 1,
  
  "sources": [
    { "id": "work:ficino-three-books-life", "coverage": "ontology, spiritus", "included": true },
    { "id": "work:ficino-platonic-theology", "coverage": "astrology, soul", "included": true },
    { "id": "work:voss-becoming-angel", "coverage": "angelic daimon", "included": true },
    { "id": "work:kiosoglou-ficino-soul", "coverage": "elements, soul vehicle", "included": true },
    { "id": "work:corrias-daemonic-imagination", "coverage": "plotinus comparison", "included": false },
    { "id": "source:ficino-letters", "coverage": "prayer, personal daimon", "included": false }
  ],
  
  "coverage": {
    "astrology": 0.9,
    "ontology": 0.8,
    "spiritus": 0.7,
    "prayer": 0.0,
    "letters": 0.0,
    "plotinus_comparison": 0.3
  },
  
  "research_todos": [
    "Find Ficino's letters discussing the personal daimon (0 sources)",
    "Locate Walker's interpretation of Ficinian daimon (0 sources)",
    "Search for Arabic influence on Ficino's daimon concept (0 sources)",
    "Add Kristeller's references to daemon/genius in Latin texts"
  ],
  
  "versions": [
    { "version": 1, "date": "2026-07-01", "change": "Initial compilation from Voss and Three Books on Life", "sources_added": 2 },
    { "version": 2, "date": "2026-07-05", "change": "Added Kiosoglou dissertation, expanded ontology section", "sources_added": 1 },
    { "version": 3, "date": "2026-07-11", "change": "Added Three Books on Life, expanded astrology section using Letters", "sources_added": 2 }
  ],

  "body": [
    {
      "id": "para_001",
      "kind": "source",
      "text": "The daimon, for Ficino, is not merely a poetic conceit but a metaphysical intermediary...",
      "sources": ["work:ficino-platonic-theology", "work:voss-becoming-angel"],
      "topics": ["ontology", "daimon"]
    },
    {
      "id": "para_002",
      "kind": "source",
      "text": "In his commentary on the Symposium, Ficino identifies the daimon with the celestial Venus...",
      "sources": ["work:ficino-three-books-life"],
      "topics": ["astrology", "venus"]
    }
  ],
  
  "artifacts": {
    "essay_url": "https://re-rendering-atlas.tradesprior.workers.dev/essay/ficino-daimon",
    "audio_url": "/audio/ficino-daimon.mp3",
    "video_url": null,
    "journey_id": null
  },
  
  "timeline": [
    { "date": "2026-07-01", "event": "RO created from user request", "sources_total": 2 },
    { "date": "2026-07-11", "event": "Kiosoglou acquired, auto-linked to RO", "sources_total": 4 }
  ]
}
```

---

## How Existing Hermes Capabilities Support This

### 1. The Research Object IS the file (not a database)

```
content/research-objects/ficino-daimon.json
```

Just like `content/glossary/concepts/` and `content/works/`. Git tracks everything. No database needed. This is the pattern we already use.

### 2. Impact Detection (Cron + Concept Linking)

When a new paper is acquired:

```
1. Acquisition finishes → work JSON created at content/works/work_{slug}.json
2. Paper has concepts: ["ficino", "daimon", "spiritus"]
3. Hermes checks: which Research Objects mention these concepts?
4. Hits: ro:ficino-daimon, ro:planetary-spiritus
5. Hermes estimates impact:
   - ro:ficino-daimon: +12% coverage, 3 new paragraphs, 2 citations, 1 disagreement
6. Hermes sends Telegram notification:
   
   📬 New source affects "Ficino on the Daimon"
   
   Potential additions:
   • 3 paragraphs on natal genius
   • 2 citations from 2022 dissertation
   • 1 disagreement with current Walker interpretation
   
   Coverage: ██████░░░░ → ████████░░ (+12%)
   
   [Accept] [Reject] [View Diff]
```

**Hermes features used:** Cron, web_search, Telegram gateway, git diff, concept JSON linking

### 3. Pull Requests for Knowledge (Git Branches + Telegram Review)

When Hermes finds new material for an RO:

```bash
git checkout -b ro/ficino-daimon/update-kiosoglou
# Edit the RO JSON with new paragraphs
git add content/research-objects/ficino-daimon.json
git commit -m "ro(ficino-daimon): add Kiosoglou paragraphs on soul vehicle"
git push origin ro/ficino-daimon/update-kiosoglou
```

Then Hermes sends to Telegram:

```
📝 PR: ro/ficino-daimon — Add Kiosoglou

Added 3 paragraphs, 2 citations, 1 disagreement

Files changed:
  ficino-daimon.json (+47 lines)

[View Diff] [Approve] [Reject]
```

If approved:
```bash
git checkout main && git merge ro/ficino-daimon/update-kiosoglou && git push
```

If rejected:
```bash
git branch -D ro/ficino-daimon/update-kiosoglou
```

**Hermes features used:** Terminal/git, Telegram button approvals (`hermes` approval system)

### 4. Research Inbox (Telegram as the Inbox)

The Telegram DM IS the research inbox. Notifications about:
- New papers acquired → which ROs affected
- Cron weekly summary → "17 new papers in library, 3 ROs with potential updates"
- Coverage gaps → "ro:ficino-daimon missing 4 sources: Ficino's Letters, Kristeller, Walker, Arabic influence"

```json
// Stored at hermes/goals/research-inbox.json
{
  "notifications": [
    {
      "type": "impact",
      "ro_id": "ro:ficino-daimon",
      "source_id": "work:kiosoglou-ficino-soul",
      "impact": "+12% coverage, 3 paragraphs, 1 disagreement",
      "status": "pending",
      "created": "2026-07-11"
    }
  ]
}
```

**Hermes features used:** Telegram gateway (notifications), journal_write (inbox persistence)

### 5. Coverage Map & Research TODO (Stored in RO JSON)

The coverage map is part of the RO JSON. Hermes calculates it from:
- Number of sources covering each topic
- Number of paragraphs per topic
- Gaps: topics with 0 sources

The Research TODO is generated by Hermes when it detects a gap:
- "Topic `prayer` has 0 sources — search OpenAlex for 'Ficino prayer daimon'"
- "Topic `arabic_influence` has 0 sources — search HAL for 'Ficino arabe influence'"

**Hermes features used:** Terminal (OpenAlex API), web_search, concept of "goal" via `/goal`

### 6. Versioning (Git — Already Works)

```
git log --oneline content/research-objects/ficino-daimon.json

c9e5332 ro(ficino-daimon): add Kiosoglou paragraphs
ca81afb ro(ficino-daimon): expand astrology section
d3139ef ro(ficino-daimon): initial compilation
```

Versions in the JSON are a human-readable summary. Git is the canonical source of truth.

**Hermes features used:** Terminal (git)

### 7. The "Inbox" Cron (Hermes Cron + Notification)

```bash
# Weekly: check for new sources affecting existing ROs
hermes cron create "0 9 * * 1" \
  --skill research-objects \
  --deliver telegram \
  "Check all new works added this week. For each, check which ROs they affect. Report:
   - New works: [count]
   - Affected ROs: [count]
   - For each affected RO: coverage change estimate, new paragraphs possible, new citations"
```

**Hermes features used:** Cron, skill loading, Telegram delivery

---

## The Research Object as Central Artifact

```
                    ┌──────────────────────┐
                    │  Research Object     │
                    │  (ro:ficino-daimon)  │
                    │                      │
                    │  sources[]           │
                    │  coverage{}          │
                    │  body[]              │
                    │  versions[]          │
                    │  research_todos[]    │
                    └──────────┬───────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         │                     │                     │
         ▼                     ▼                     ▼
    Essay JSON           Audio (TTS)           Future Artifacts
    (deployed site)      (public/audio/)       (video, journey, chatbot)
```

Everything downstream reads the same Research Object:
- The **essay** is a formatted view of `body[]` with audio generated from the same text
- The **audio** is TTS of `body[].text` with the standard voice config
- The **video** would be a storyboard rendered from the same paragraphs
- The **journey** would be a guided path through the sources
- The **chatbot** would use the RO as context

This means: improve the RO once, and every downstream artifact improves automatically.

---

## New Hermes Skills Needed

### Skill: `research-objects`

The central skill for managing ROs:
- `/research-objects create "Ficino on the Daimon"` — create new RO
- `/research-objects status ficino-daimon` — show current status
- `/research-objects expand ficino-daimon` — search for new sources to fill gaps
- `/research-objects publish ficino-daimon` — deploy as essay + audio

### Skill: `ro-inbox`

Manage the research inbox:
- `/ro-inbox` — show pending notifications
- `/ro-inbox accept <id>` — approve suggested update
- `/ro-inbox reject <id>` — reject suggested update
- `/ro-inbox diff <id>` — show what would change

---

## Existing Infrastructure That Already Supports This

| Component | Supports |
|---|---|
| `content/works/` | Stores acquired papers (Tier 2) |
| `content/glossary/concepts/` | Concept definitions with `works` array linking to papers |
| `content/glossary/essays/` | Deployed essay JSONs |
| Git | Version history for every RO |
| Hermes Telegram gateway | Inbox notifications, approval buttons, status updates |
| Hermes cron | Weekly new-source sweep, coverage check |
| Hermes terminal tool | git operations, OpenAlex API calls, text extraction |
| `hermes/skills/publishing/publish-paper/` | Can be adapted for RO publication |
| `hermes/plugins/atlas-astrology/tools/` | Plugin pattern can be extended for RO tools |
| `hermes/goals/` | Directory ready for RO-related goal definitions |
| `hermes/AGENTS.md` | Project context already documents the skill structure |

---

## New Infrastructure Needed

| Component | Purpose | Format |
|---|---|---|
| `content/research-objects/` | Store RO JSON files | `ro:{slug}.json` |
| `hermes/skills/research/research-objects/` | Hermes skill for RO management | SKILL.md |
| `hermes/skills/research/ro-inbox/` | Hermes skill for inbox management | SKILL.md |
| `hermes/goals/research-inbox.json` | Persistent inbox state | JSON |

---

## Comparison: Research Objects vs. Alternatives

| Feature | Research Objects | Obsidian/Notion | Wikipedia | Graph DB |
|---|---|---|---|---|
| Per-paragraph provenance | ✅ Built-in | ❌ Manual | ❌ | ✅ Possible |
| Version history | ✅ Git-native | ❌ Limited | ✅ | ❌ |
| Impact detection | ✅ Auto via concept linking | ❌ | ❌ | ✅ Possible |
| Research TODO with automation | ✅ Hermes closes gaps | ❌ | ❌ | ❌ |
| Downstream artifact generation | ✅ Essay + Audio + Video | ❌ | ❌ | ❌ |
| Pull-request workflow | ✅ Git branches + Telegram review | ❌ | ✅ (but bureaucratic) | ❌ |
| Freshness/cron sweeps | ✅ Automatic | ❌ | ❌ | ❌ |
| Coverage map | ✅ Per-paragraph topics | ❌ | ❌ | ❌ |
| Offline/local | ✅ JSON files + git | ✅ | ❌ | Depends |
| Learning curve | Low (just JSON + git) | Low | Medium | High |

---

## Grounded Flow: A Complete Walkthrough

### Day 1: User Requests a Research Object

**On Telegram:**
```
User: Create a Research Object on Ficino's concept of the daimon
```

**Hermes does:**
```bash
# Step 1: Check what we already have
grep -rl "daimon\|daemon\|daimonic" /root/projects/blog/content/works/*.json

# Hits: work:ficino-daemon-socratico, work:corrias-daemonic-reason,
#        work:kiosoglou-ficino-soul, work:voss-becoming-angel

# Step 2: Extract relevant passages from each work
# For each work JSON, check if we have the PDF, extract text
pdftotext library/ficino/ficino-daemon-socratico.pdf /tmp/ficino-daimon-extracted.txt
# ... identify paragraphs that discuss "daimon" specifically

# Step 3: Create the Research Object
mkdir -p /root/projects/blog/content/research-objects
```

**RO JSON created at `content/research-objects/ro-ficino-daimon.json`:**
```json
{
  "ro_id": "ro:ficino-daimon",
  "title": "Ficino on the Daimon",
  "status": "draft",
  "sources": [
    {"id": "work:ficino-daemon-socratico", "coverage": "socratic_daimon", "included": true, "passages_used": 4},
    {"id": "work:corrias-daemonic-reason", "coverage": "plotinus_comparison", "included": false, "passages_used": 0},
    {"id": "work:kiosoglou-ficino-soul", "coverage": "soul_vehicle", "included": true, "passages_used": 3}
  ],
  "coverage": {
    "socratic_daimon": {"status": "covered", "sources": 1, "paragraphs": 4},
    "soul_vehicle": {"status": "covered", "sources": 1, "paragraphs": 3},
    "plotinus_comparison": {"status": "missing", "sources": 0, "paragraphs": 0},
    "astrology": {"status": "missing", "sources": 0, "paragraphs": 0},
    "prayer": {"status": "missing", "sources": 0, "paragraphs": 0},
    "angelic_daimon": {"status": "missing", "sources": 0, "paragraphs": 0}
  },
  "research_todos": [
    "Find Ficino's Letters discussing the personal daimon",
    "Acquire Corrias daemonic imagination paper (paywalled, find OA copy)",
    "Search for Voss's Becoming Angel for daimon-angel connection",
    "Check Three Books on Life for astrological daimon references"
  ],
  "versions": [{"version": 1, "date": "2026-07-11", "change": "Initial compilation", "sources_added": 2}],
  "body": [
    {
      "id": "para_001",
      "kind": "source",
      "text": "Ficino identifies the Socratic daimon as the individual's tutelary spirit...",
      "sources": ["work:ficino-daemon-socratico"],
      "topics": ["socratic_daimon"]
    }
  ],
  "artifacts": {},
  "timeline": [{"date": "2026-07-11", "event": "RO created", "sources_total": 2}]
}
```

**Hermes reports back on Telegram:**
```
✅ Research Object created: "Ficino on the Daimon"

Status: draft
Sources included: 2
Coverage: 2/6 topics covered

Research TODO:
□ Acquire Corrias paper (paywalled, search for OA)
□ Find Voss's Becoming Angel
□ Search Three Books on Life for astrology
□ Find Ficino's Letters

Next: [Expand] [Publish Draft]
```

### Day 2: Expand via Acquisition

**Cron triggers or user says "Expand it":**

```bash
# Hermes searches for missing topics
python3 acquisition.py acquire --title "Ficino astrological daimon three books life"
# → finds Three Books on Life references, extracts passages

python3 acquisition.py acquire --title "Voss becoming angel daimon"
# → finds work:voss-becoming-angel (already in library), extracts 6 new passages

python3 acquisition.py acquire --doi "10.1080/09608788.2013.771608"
# → paywalled, but notes: "Corrias paper discusses Plotinus-Ficino daimon comparison"
# → adds to research_todos: "Find OA copy of Corrias daemonic paper"
```

**RO updated to v2:** 5 sources, 4/6 topics covered, coverage jumps to 65%

**Hermes reports:**
```
📬 "Ficino on the Daimon" expanded to v2

Changes:
+ Added Voss (6 passages on angelic daimon)
+ Added Three Books on Life (3 passages on astrological daimon)
+ New topic covered: angelic_daimon
+ Coverage: ██████░░░░ (65%)

Still missing:
□ plotinus_comparison (Corrias paper is paywalled)
□ prayer (Ficino's Letters not yet acquired)

[Publish] [Keep Expanding]
```

### Day 3: Publish

**User approves publication:**

```bash
# Step 1: Generate essay JSON from RO body
cp content/research-objects/ro-ficino-daimon.json content/glossary/essays/ficino-daimon.json

# Step 2: Generate audio
node scripts/generate-audio.mjs ficino-daimon

# Step 3: Deploy
npm run cf:build && npm run cf:deploy
```

**Now live on the site:**
```
https://re-rendering-atlas.tradesprior.workers.dev/essay/ficino-daimon
→ 12 paragraphs, all kind: "source"
→ 15 min audio, single male voice
→ Sources listed at bottom: 5 works cited
→ Links to glossary: concept:daimon, concept:ficino, concept:tutelary-spirit
```

### Week 2: Impact Detection (Cron Sweep)

**Cron triggers weekly check:**
```yaml
cronjob:
  schedule: "0 9 * * 1"
  skill: "research-objects"
  prompt: |
    1. Check content/works/ for new works added since last week
    2. For each new work, check which concepts it discusses
    3. For each concept, check if an RO exists
    4. If RO exists, estimate impact: new paragraphs, coverage delta, new citations
    5. Report to inbox
```

**Result:**
```
📬 Research Inbox — 1 new notification

New work: work:kristeller-ficino-philosophy (acquired today)
Concepts: ficino, daimon, platonic_theology, astrology

Affects: ro:ficino-daimon
Impact estimate:
  +5 paragraphs on platonic theology
  +3 citations from Kristeller's authoritative source
  +Strengthens ontology section (currently 1 source only)
  Coverage: +8%

[View Diff] [Accept Update] [Reject]
```

If accepted, Hermes creates a git branch, applies the update, and sends a PR:
```
📝 PR: ro/ficino-daimon — Add Kristeller

Added 5 paragraphs, 3 citations
Coverage: 73% → 81%

[Approve] [Reject] [View Changes]
```

---

## Emergent Effects: What Happens When You Have Many ROs

### Effect 1: The Comparative RO (Auto-generated)

After 3 ROs exist:
- `ro:ficino-daimon` — Ficino's daimon as intermediary being
- `ro:corbin-imaginal` — Corbin's imaginal angel as intermediary being  
- `ro:nanananda-papanca` — Nanananda's conceptual proliferation as cognitive intermediary

Hermes notices they all discuss "intermediary being/cognition":
```json
// Auto-generated: ro:intermediary-in-western-esotericism
{
  "ro_id": "ro:intermediary-western-esotericism",
  "title": "The Intermediary in Western Esotericism",
  "status": "auto-generated",
  "sources": [
    {"id": "ro:ficino-daimon", "type": "research_object"},
    {"id": "ro:corbin-imaginal", "type": "research_object"},
    {"id": "ro:nanananda-papanca", "type": "research_object"}
  ],
  "body": [
    // paragraphs assembled from the three source ROs,
    // organized thematically rather than by author
  ]
}
```

This is a **Tier 3 compilation of Tier 3 compilations** — a meta-object that emerges naturally when enough ROs exist.

### Effect 2: Video Generation (RO → YouTube)

Each RO can be rendered as a video:

```bash
# Step 1: Extract RO topics → storyboard sections
# Topics in ro:ficino-daimon:
#   - socratic_daimon → Section 1
#   - soul_vehicle → Section 2  
#   - angelic_daimon → Section 3

# Step 2: For each section, find matching imagery
# Topic "socratic_daimon" → search museum APIs for "Socrates daimon"
# Topic "angelic_daimon" → search for "angel annunciation renaissance"

# Step 3: Generate storyboard JSON
# Step 4: Render video (Remotion or similar)
# Step 5: Upload to YouTube
```

The RO's body paragraphs + topic tags are the exact input the video pipeline needs. The storyboard schema from `videos.md` maps section → visuals → narration. The narration IS the RO body text (all `kind: "source"`, read by the TTS voice).

```yaml
# Auto-generated video blueprint from ro:ficino-daimon
video:
  title: "Ficino on the Daimon"
  duration: "15:00"
  sections:
    - topic: socratic_daimon
      paragraphs: [1, 2, 3]
      visuals: ["socrates_daimon_painting", "angel_icon_renaissance"]
      narration: para_001.text + para_002.text + para_003.text
    - topic: soul_vehicle
      paragraphs: [4, 5, 6]
      visuals: ["soul_ascent_diagram", "platonic_chariot"]
      narration: para_004.text + para_005.text + para_006.text
```

### Effect 3: Podcast Episodes (Auto-generated)

Compile ROs into thematic podcast episodes:

| Episode | RO Sources | Duration |
|---|---|---|
| "The Daimon in Renaissance Thought" | ro:ficino-daimon | 15 min |
| "The Imaginal World: Corbin's Vision" | ro:corbin-imaginal | 22 min |
| "Concept and Reality: Buddhist Deconstruction" | ro:nanananda-papanca | 30 min |
| "The Intermediary: Across Traditions" | ro:intermediary-western-esotericism | 45 min |

Each episode is just the RO's `body[].text` concatenated, read by the TTS voice. No editing needed. The RO IS the script.

```bash
for ro in ficino-daimon corbin-imaginal nanananda-papanca; do
  node scripts/generate-audio.mjs "ro-$ro"
  # → public/audio/ro-ficino-daimon.mp3
done
```

### Effect 4: Journey (Guided Learning Path)

A "Journey" is a sequence of ROs in a recommended order:

```json
{
  "journey_id": "journey:introduction-to-esotericism",
  "title": "Introduction to Western Esotericism",
  "steps": [
    {"order": 1, "ro_id": "ro:ficino-daimon", "title": "Ficino on the Daimon", "read_time": "15 min"},
    {"order": 2, "ro_id": "ro:planetary-spiritus", "title": "Planetary Spiritus", "read_time": "20 min"},
    {"order": 3, "ro_id": "ro:corbin-imaginal", "title": "The Imaginal World", "read_time": "22 min"},
    {"order": 4, "ro_id": "ro:intermediary-western-esotericism", "title": "The Intermediary", "read_time": "45 min"}
  ]
}
```

Each step has an "I've finished this" button. After completing all steps, the user can generate a personalized synthesis essay from the journey's ROs — their own Tier 3 compilation of the journey they just took.

### Effect 5: Hermes Chat Context

When the user asks about the daimon in Hermes chat:

```
User: What did Ficino think about the daimon?

Hermes: Let me check the Research Object on this topic.
[Reads ro:ficino-daimon]
[Summarizes from the RO's body paragraphs, citing sources]

Key points (from ro:ficino-daimon, 5 sources):
1. Ficino identifies the Socratic daimon as a tutelary spirit
   — from Ficino's commentary on Apology (source)
2. The daimon mediates between the individual and the divine
   — from Three Books on Life (source)
3. This connects to the astrological natal genius tradition
   — from Voss's Becoming Angel (source)

For more detail, see: /essay/ficino-daimon
```

The RO is the authoritative context. Hermes never speculates — it reads the compiled sources and reports what they say. This is the `kind: "source"` principle applied to chat: Hermes becomes a research assistant, not a philosopher.

### Effect 6: Coverage Dashboard

After 10 ROs exist, a dashboard shows the state of knowledge:

```
Research Objects — Coverage Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ro:ficino-daimon          ████████░░  82%  v3  up to date
ro:corbin-imaginal        ██████░░░░  61%  v2  +3 new sources available
ro:nanananda-papanca      ████░░░░░░  43%  v1  needs expansion
ro:planetary-spiritus     ███████░░░  70%  v2  up to date
ro:intermediary-esoteric  ██░░░░░░░░  18%  v1  auto-generated, needs review
ro:theurgy-symbols        █░░░░░░░░░  12%  v1  needs sources
ro:ficino-astrology       ████████░░  78%  v3  up to date
ro:plotinus-beauty        █████░░░░░  52%  v2  up to date
ro:goethe-perception      ██░░░░░░░░  22%  v1  needs expansion
ro:iamblichus-ritual      █░░░░░░░░░   8%  v1  critical gaps

Overall: 10 ROs, average coverage 45%, 47 research todos open
Latest cron sweep: 3 new sources found, 2 ROs affected
```

Every metric comes from the RO JSONs. No separate analytics system needed.

---

## The Full File Map

```
content/
  research-objects/           ← The heart of the system
    ro-ficino-daimon.json
    ro-corbin-imaginal.json
    ro-nanananda-papanca.json
    ro-intermediary-esoteric.json     (auto-generated from above three)
    ...

  works/                      ← Acquired papers (ingredients for ROs)
    work_ficino-daemon-socratico.json
    work_kiosoglou-ficino-soul.json
    ...

  glossary/
    concepts/                 ← Concept definitions (tags for ROs)
      daimon.json
      mundus_imaginalis.json
      papanca.json
      ...
    essays/                   ← Published views of ROs
      ficino-daimon.json           (compiled from ro:ficino-daimon)
      intermediary-esoteric.json   (compiled from ro:intermediary-esoteric)
      ...

public/
  audio/                      ← Generated from RO body
    ro-ficino-daimon.mp3
    ro-corbin-imaginal.mp3
    ...

library/                      ← Raw PDFs (unprocessed ingredients)
  ficino/
  corbin/
  nanananda/

hermes/
  skills/
    research/
      research-objects/       ← Create, expand, publish ROs
      ro-inbox/               ← Review suggestions, approve/reject updates
    publishing/
      publish-paper/          ← Deploy RO as essay + audio

  notes/
    daimon.md                 ← This spec
    currentresearchdocs.md    ← Three-tier taxonomy
    targets.md                ← Acquisition targets

  goals/
    research-inbox.json       ← Pending notifications for RO updates
```

---

## What Hermes Does at Each Stage

| Stage | Hermes Action | Hermes Tool |
|---|---|---|
| **Create** | Accept user request, search library for relevant works, extract passages, assemble RO JSON | terminal, web_search |
| **Expand** | Search OpenAlex for missing topics, acquire new papers, extract new passages | /acquisition, terminal |
| **Review** | Present PR with diff on Telegram, wait for approval | gateway, git, approvals |
| **Publish** | Copy RO to essays/, generate audio, deploy | terminal, generate-audio, cf:deploy |
| **Sweep** | Weekly cron: check new works against all ROs, estimate impact, notify inbox | cron, research-objects skill |
| **Auto-generate** | Detect ROs with overlapping concepts, suggest meta-RO | research-objects skill |
| **Chat** | Use RO as authoritative context for user questions | session context |

---

## The Compiler Loop

```
Collect → Compile → Review → Improve → Version → Reuse
```

This is the loop. Everything else—essays, audio, video, journeys, chatbot context, personalized study—is downstream of those evolving Research Objects. The Research Object becomes the heart of Hermes.

> **North Star:** Hermes is the librarian, not the author. Research Objects are the shelves. Every source finds its place. Every gap is known. Every compilation improves over years, not days.
