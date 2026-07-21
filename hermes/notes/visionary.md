# Visionary — Five Visions for the Hermetic Pipeline

> Each vision builds on the Research Object architecture from `daimon.md`. Each is implementable with Hermes's existing capabilities. Each produces a distinct product that feeds the others.

---

## Vision 1: The Hermetic Learning Loop

### Concept

Hermes publishes a compilation essay, then compares it against the scholarly commentaries it was compiled from. It identifies gaps, writes improvement skills, and gets better over time — without changing a line of Python or JavaScript. The skill IS the improvement.

### The Loop

```
                    ┌────────────────────────────────────────┐
                    │  Scholar commentaries (ground truth)    │
                    │  e.g., "Voss on Ficino's Daimon"       │
                    └────────────────┬───────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Hermes Compilation (ro:ficino-daimon v1)                   │
│  "I compiled passages from 5 sources into 12 paragraphs"    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  Hermes Self-Review                                         │
│                                                             │
│  "I compare my compilation to Voss's original paper:        │
│   - Voss discusses the astrological daimon (I have 0 paras) │
│   - Voss cites Latin sources (I didn't check the originals) │
│   - Voss organizes by timeline (I organized by theme)       │
│   Gap score: 34%"                                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  Hermes Writes a Skill                                      │
│                                                             │
│  skill: improve-daimon-compilation                          │
│  "When compiling on daimon topics:                          │
│   1. Always check Latin original sources                    │
│   2. Include astrological dimension                         │
│   3. Order passages chronologically within themes"          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  Next Compilation Loads That Skill                          │
│                                                             │
│  ro:planetary-spiritus v1 (compiled with the new skill)     │
│  → Gap score: 52% (better!)                                 │
│  → Human feedback: "nice but missing medical tradition"     │
│  → Skill updated to v2                                      │
└─────────────────────────────────────────────────────────────┘
```

### How It Works

Each RO version stores the skill name that produced it:

```json
{
  "ro_id": "ro:ficino-daimon",
  "versions": [
    {"version": 1, "date": "2026-07-11", "skill": "compile:default", "gap_score": 0.34},
    {"version": 2, "date": "2026-07-18", "skill": "compile:daimon-v1", "gap_score": 0.52},
    {"version": 3, "date": "2026-07-25", "skill": "compile:daimon-v2", "gap_score": 0.68}
  ]
}
```

The gap score is calculated by:
1. For each source the RO claims to use, ask: "Does this RO capture all major claims of the source?"
2. For each topic in the RO coverage map, ask: "Do scholarly commentaries on this topic include anything the RO misses?"
3. Aggregate: percentage of source claims and topics that the RO adequately covers

### The Skill File

```markdown
---
name: compile-daimon-v2
description: Compilation improvements learned from reviewing Voss, Kiosoglou, and Corrias against ro:ficino-daimon v1
version: 2
---

# Compilation Rules for Daimon-Topic ROs

## What v1 Got Wrong
1. Missed the astrological dimension entirely (Voss dedicates 30% of her paper to this)
2. Did not consult Latin originals (Kiosoglou works from the Latin, I worked from translations)
3. Chronological ordering would have shown evolution of Ficino's thought

## Rules
1. When a source mentions an astrological dimension, create a separate section for it
2. For Renaissance authors, check if the source works from Latin originals and note this
3. Order passages by source date within each theme section
4. Tag each paragraph with "primary_source_checked: true/false"

## Feedback from v1
- User: "good but missing medical tradition in Ficino"
- Action: add section on Ficino's medical theory of the daimon (De Vita III)
- Status: pending source acquisition
```

### Implementation

| Step | Hermes Action | Tool |
|---|---|---|
| After publish | Run self-review: compare RO body against each source's full text | terminal, python3 diff analysis |
| Gap detection | For each topic in source but not in RO, calculate coverage gap | prompt to LLM with both texts |
| Skill generation | Write skill to `~/.hermes/skills/compile-daimon-v2/` | `skill_manage` tool (Hermes can create its own skills) |
| Version tracking | Store skill_id in RO versions array | edit RO JSON |
| Human feedback | User thumbs up/down on Telegram per paragraph | Telegram button approvals |
| Skill improvement | Incorporate feedback into next skill version | skill_manage patch |

### The Key Insight

Hermes's own skill system (`skill_manage` tool) lets the agent create, edit, and delete skills autonomously. This means the learning loop is **self-contained within Hermes** — no code changes, no PRs, no deploy. Hermes learns by writing skills, and the skills improve the next compilation.

---

## Vision 2: Personal Research Objects

### Concept

The user's diary entries, mood ratings, and life events become Tier 1 source material. Hermes compiles them into Personal ROs alongside the scholarly ones. "Here's what Ficino said about the daimon, and here's what your diary says about your daimon experiences."

### The Personal RO

```json
{
  "ro_id": "ro:personal-mercury-patterns",
  "title": "My Relationship with Mercury",
  "type": "personal",
  "status": "published",
  "sources": [
    {"id": "journal:2026-01", "coverage": "writing_flow", "included": true},
    {"id": "journal:2026-02", "coverage": "communication_struggles", "included": true},
    {"id": "journal:2026-03", "coverage": "mercury_retrograde", "included": true},
    {"id": "work:ficino-mercury", "coverage": "scholarly_context", "included": true}
  ],
  "body": [
    {
      "id": "para_001",
      "kind": "source",
      "text": "When Mercury was active this month, I wrote 3x more than average...",
      "sources": ["journal:2026-01"],
      "topics": ["personal_observation"]
    },
    {
      "id": "para_002",
      "kind": "source",
      "text": "Ficino describes Mercury as the messenger of the soul...",
      "sources": ["work:ficino-mercury"],
      "topics": ["scholarly_context"]
    }
  ]
}
```

### How Personal ROs Get Created

```yaml
# Weekly cron: compile diary entries into Personal ROs
cronjob:
  schedule: "0 9 * * 7"  # Sundays
  prompt: |
    1. Read the last 7 days of journal entries from D1
    2. For each planetary activation mentioned, check if a Personal RO exists
    3. If not, create one: "My Relationship with [Planet]"
    4. Extract relevant diary entries as source passages
    5. Link to relevant scholarly ROs on the same topic
    6. Publish with audio so the user can listen to their own patterns
```

### The Product: Personal + Scholarly = Unique Synthesis

The site shows:

```
╔══════════════════════════════════════════════════════════════╗
║  The Daimon in Your Life                                    ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Part 1: What the Tradition Says                             ║
║  [from ro:ficino-daimon — all source passages, no AI]        ║
║                                                              ║
║  Part 2: What Your Experience Shows                          ║
║  [from ro:personal-daimon-experiences — your diary entries]   ║
║                                                              ║
║  The tension: Ficino says the daimon is a tutelary spirit    ║
║  sent at birth. Your diary shows you encounter it as an      ║
║  inner critic. Both are true.                                ║
║                                                              ║
║  Audio: 22 min — scholarly passages + your own words          ║
╚══════════════════════════════════════════════════════════════╝
```

### Implementation

| Component | How |
|---|---|
| Diary access | D1 database already stores journal_entries. Hermes queries via API. |
| Personal RO creation | Same pattern as scholarly RO, but `type: "personal"` |
| Linking personal ↔ scholarly | Both ROs tag concepts. When concept matches, Hermes suggests merge. |
| Privacy | Personal ROs have `visibility: "private"` field. Only published explicitly. |
| Audio | Same `generate-audio.mjs` — personal text in female voice (AriaNeural) to distinguish from scholarly male voice |

---

## Vision 3: The Dreaming Mind

### Concept

A weekly cron cycle where Hermes reviews ALL its ROs, all feedback, all new sources, and identifies patterns that no human would notice — because it reads everything, every week. It "dreams" by making associative connections across domains that normally don't speak to each other.

### The Dreaming Cycle

```yaml
# Sunday night: Hermes dreams
cronjob:
  schedule: "0 2 * * 7"  # 2am Sunday
  prompt: |
    Review all ROs in content/research-objects/.
    
    For each pair of ROs, ask:
    - Do these discuss the same concept from different traditions?
    - Is there a contradiction that would be valuable to surface?
    - Is there a synthesis that neither achieves alone?
    
    For each RO individually, ask:
    - What topics are missing that new sources could fill?
    - What patterns do the research_todos share?
    
    Generate:
    1. New comparative RO proposals (auto-generated JSON stubs)
    2. Gap analysis: "All ROs covering intermediaries are missing Arabic sources"
    3. Skill improvement suggestions based on patterns across all ROs
    4. A "dream log" entry in hermes/notes/dream-log.md
```

### The Dream Log

```markdown
# Dream Log — 2026-07-12

## Cross-RO Patterns Detected

**Pattern 1: The Missing Arabic Bridge**
- ro:ficino-daimon discusses intermediary beings
- ro:corbin-imaginal discusses intermediary beings
- ro:nanananda-papanca discusses cognitive intermediaries
- None of them mention the Arabic tradition of barzakh (the intermediate realm)
- Proposal: ro:barzakh-intermediary (auto-generated, needs review)

**Pattern 2: All ROs Weak on Embodiment**
- 8 of 12 ROs have research_todos mentioning "embodiment" or "practice"
- But no RO has a dedicated section on embodied practice
- Suggestion: new RO "The Embodied Scholar" compiling passages about practice across traditions

**Pattern 3: Recurring Improvement Opportunity**
- 5 ROs have gap_score < 0.5
- All 5 share a common weakness: they don't cite the original language sources
- Skill improvement: compile-v2 should add "check original language sources" rule

## New Skill Proposals
- skill:check-original-sources — before publishing, verify at least one original-language source
- skill:cross-tradition-linking — when creating an RO, check if other traditions discuss the same concept

## New RO Proposals
- ro:barzakh-intermediary (auto-generated from concept overlap)
- ro:embodied-scholar (suggested by gap pattern)
- ro:practice-as-theory (suggested by reading Iamblichus against Ficino)
```

### The Implementation

The Dreaming cycle uses Hermes's existing capabilities:
- `web_search` to find cross-tradition connections
- `skill_manage` to create new skills from patterns
- `terminal` to create RO stubs
- `journal_write` to log dreams
- Cron to trigger weekly

No new infrastructure. The dreaming IS the cron job reading its own outputs.

---

## Vision 4: The Comparative Engine

### Concept

When two scholars disagree, that disagreement IS the content. The Comparative Engine detects contradictions across sources and ROs, and surfaces them as standalone products.

### How Disagreements Surface

```
Scanning ro:ficino-daimon sources...

FOUND DISAGREEMENT:

Walker (2004) claims:
  "Ficino's daimon is essentially Neoplatonic, derived from Plotinus"

Voss (2016) claims:  
  "Ficino's daimon is essentially Hermetic, derived from the Asclepius"

Hermes analysis:
  Both cite primary sources. Neither engages with the other's argument.
  This disagreement is not resolved in the current RO.
  
  Action: Create a new section "The Walker-Voss Disagreement"
  with both passages presented side by side. No resolution offered.
  The reader sees the disagreement in the scholars' own words.
```

### The Disagreement RO

```json
{
  "ro_id": "ro:disagreement-walker-voss-daimon",
  "title": "The Walker-Voss Disagreement on Ficino's Daimon",
  "type": "disagreement",
  "sources": [
    {"id": "work:walker-ficino-daimon", "position": "neoplatonic", "passages": [1, 2, 3]},
    {"id": "work:voss-becoming-angel", "position": "hermetic", "passages": [4, 5]}
  ],
  "body": [
    {
      "id": "para_001",
      "kind": "source",
      "text": "Walker: 'Ficino's daimon is essentially Neoplatonic...'",
      "sources": ["work:walker-ficino-daimon"]
    },
    {
      "id": "para_002",
      "kind": "source",
      "text": "Voss: 'Ficino's daimon is essentially Hermetic...'", 
      "sources": ["work:voss-becoming-angel"]
    }
  ],
  "resolution": null
}
```

The `resolution: null` is honest. If Hermes ever finds a source that reconciles the disagreement, it adds the resolution. Otherwise, the disagreement stands — which is the scholarly correct thing to do.

### How Disagreements Propagate

1. **To the site:** The essay page shows a "Disagreement" badge. Clicking opens both positions side by side.
2. **To the audio:** `[disagreement]` tag in the paragraph metadata triggers a tone shift in the TTS.
3. **To chat:** When the user asks about this topic, Hermes says "There's a disagreement on this: Walker says X, Voss says Y."
4. **To new ROs:** Disagreements are themselves compilable into a meta-RO: "Key Disagreements in Ficino Scholarship."

### Implementation

| Detection Method | How |
|---|---|
| Within single RO source set | Two source paragraphs on the same topic contradict each other → flag |
| Across ROs | ro:ficino-daimon says X, ro:corbin-imaginal says not-X → flag |
| Source vs. RO | Source claims something the RO doesn't capture → coverage gap (already handled) |
| User feedback | User says "this doesn't match what I read in X" → Hermes checks X → surfaces disagreement |

---

## Vision 5: The Mature Ecosystem

### Concept

After 50+ ROs, the system reaches critical mass. The site becomes a self-sustaining knowledge ecosystem where:

- New users onboard by selecting ROs that interest them → personalized journey generated
- Scholars submit papers → auto-integrated into relevant ROs
- Weekly digests summarize what changed across all ROs
- Everything has audio. Everything has provenance. Everything improves over time.

### The 50-RO Milestone

```
Current state:
  50+ Research Objects
  200+ sources ingested
  1,500+ paragraphs with provenance
  30+ hours of audio
  15+ comparative ROs (auto-generated)
  8 disagreements surfaced
  12 skills written by Hermes
  Average gap score: 0.62 (up from 0.34 at v1)
```

### New User Onboarding

```
User arrives at the site →
  "Which traditions interest you?"
  □ Ficino / Renaissance Platonism
  □ Corbin / Islamic Philosophy  
  □ Nanananda / Early Buddhism
  □ Theurgy / Ritual Practice
  □ Goethe / Phenomenology

Based on selection → Hermes generates a Journey:
  1. ro:ficino-daimon (15 min audio)
  2. ro:planetary-spiritus (20 min audio)
  3. ro:corbin-imaginal (22 min audio)
  → "Your Journey" saved to user profile
  → Weekly: new ROs in your selected traditions get added
```

### Scholar Submission

```yaml
# When a scholar submits a paper via the site:
1. Hermes acquires it (standard acquisition pipeline)
2. Hermes checks: which ROs does this paper affect?
3. Hermes estimates impact for each RO
4. Scholar receives: "Your paper has been integrated into ro:ficino-daimon.
   View the diff at [link]. 3 new paragraphs added from your work."
5. Scholar can: [Approve] [Request Changes]
```

### Weekly Digest

```yaml
cronjob:
  schedule: "0 12 * * 1"  # Monday noon
  deliver: telegram
  prompt: |
    Generate the weekly research digest:
    
    📚 New Sources: [N] papers acquired
    📝 ROs Updated: [N] with coverage changes
    🆕 New ROs: [N] created (including auto-generated)
    🔥 Disagreements: [N] new detected
    📊 Overall Coverage: [avg] (up/down from last week)
    
    Top 3 ROs to review this week:
    1. ro:[name] — [+N% coverage, N new sources]
    2. ro:[name] — [N research todos completed]
    3. ro:[name] — [new disagreement surfaced]
```

### The Everything Dashboard

```
╔══════════════════════════════════════════════════════════════╗
║  HERMES — Research Object Dashboard                         ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  ROs by Status                                               ║
║  ● Published: 28    ● Draft: 12    ● Auto-generated: 8     ║
║  ● Needs Review: 5  ● Disagreements: 8                     ║
║                                                              ║
║  Coverage Trends                                              ║
║  ████████░░  Overall: 62% (↑3% from last month)             ║
║  ██████░░░░  Best: ro:ficino-daimon 82%                     ║
║  ██░░░░░░░░  Worst: ro:iamblichus-ritual 12%                ║
║                                                              ║
║  Recent Activity                                              ║
║  Today: 2 new sources, 3 ROs affected                        ║
║  This week: 7 new sources, 5 ROs updated, 1 dream cycle     ║
║  This month: 23 new sources, 12 ROs updated, 2 new skills   ║
║                                                              ║
║  Skill Evolution                                              ║
║  compile:default → compile:daimon-v1 → compile:daimon-v2     ║
║  Gap score improved: 0.34 → 0.52 → 0.68                     ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

### The Five Visions in One System

```
                         ┌──────────────────────┐
                         │  Research Objects     │
                         │  (core artifact)      │
                         └──────────┬───────────┘
                                    │
            ┌───────────────────────┼───────────────────────┐
            │                       │                       │
            ▼                       ▼                       ▼
┌───────────────────────┐ ┌───────────────────────┐ ┌───────────────────────┐
│  Vision 1             │ │  Vision 2             │ │  Vision 3             │
│  Learning Loop        │ │  Personal ROs         │ │  Dreaming Mind        │
│  (skills improve)     │ │  (diary → RO → audio) │ │  (cross-RO patterns)  │
└───────────────────────┘ └───────────────────────┘ └───────────────────────┘
            │                       │                       │
            └───────────────────────┼───────────────────────┘
                                    │
                                    ▼
                        ┌───────────────────────┐
                        │  Vision 4             │
                        │  Comparative Engine   │
                        │  (disagreements)      │
                        └───────────────────────┘
                                    │
                                    ▼
                        ┌───────────────────────┐
                        │  Vision 5             │
                        │  Mature Ecosystem     │
                        │  (50+ ROs, onboarding, │
                        │   scholar submission,  │
                        │   weekly digest)       │
                        └───────────────────────┘
```

---

## The 15 Research Object Families

### The Core Insight

There are about 15 families of Research Object. Every scholarly question maps to one of them. The user never sees "type" — they see a **question**. Hermes recognizes the question pattern and instantiates the right object.

```
User: "How did the daimon change from Plato to Ficino?"
  → Concept Evolution object (family 4)

User: "What did Ficino think about the daimon?"
  → Thinker on Topic object (family 1)

User: "How does Corbin differ from Jung?"
  → Comparative object (family 5)
```

The schema is the same. The question template changes. The body is always `kind: "source"`.

### Family 1: Thinker on Topic ⭐⭐⭐⭐⭐

**Question pattern:** "What did [Thinker] think about [Topic]?"

**Example:** Ficino on the Daimon, Corbin on the Imaginal, Nanananda on Papañca

**Implementation:**
```yaml
recognize:
  pattern: "{thinker} on {topic}"
  family: thinker-topic
pipeline:
  1. Search library for works by [thinker] tagged with [topic]
  2. Extract paragraphs discussing [topic] from each work
  3. Order by work chronology or theme
  4. Output: RO with sections per work
```

These are the foundational building blocks. Everything else composes from them.

### Family 2: Topic Across Thinkers ⭐⭐⭐⭐⭐

**Question pattern:** "What have different thinkers said about [Topic]?"

**Example:** The Daimon across Plato, Plotinus, Proclus, Ficino, Corbin

**Implementation:**
```yaml
recognize:
  pattern: "{topic} across {thinker_list}"
  family: topic-across-thinkers
pipeline:
  1. Find or create a Thinker-on-Topic RO for each [thinker]+[topic]
  2. Compose them into a single RO ordered chronologically or by tradition
  3. Add section headers per thinker
  4. No new passage extraction — purely compositional from existing ROs
```

### Family 3: Thinker on Thinker ⭐⭐⭐⭐⭐

**Question pattern:** "How did [Thinker A] interpret [Thinker B]?"

**Example:** Ficino on Plato, Corbin on Avicenna, Shaw on Iamblichus

**Implementation:**
```yaml
recognize:
  pattern: "{thinker_a} on {thinker_b}"
  family: thinker-on-thinker
pipeline:
  1. Search for works by [Thinker A] that explicitly discuss [Thinker B]
  2. Extract only passages where A cites, interprets, or critiques B
  3. Distinguish from A's own views (passages where A speaks in propria persona)
  4. Output: map of interpretation
```

**Key challenge:** Distinguishing "A reporting B" from "A's own view." Hermes checks: does the passage citation signal ("Ficino says...", "as Plato writes...") or internal context?

### Family 4: Concept Evolution ⭐⭐⭐⭐

**Question pattern:** "How did [Concept] change from [Earliest] to [Latest]?"

**Example:** The daimon from Plato to Corbin, Imagination from Aristotle to Burbea

**Implementation:**
```yaml
recognize:
  pattern: "evolution of {concept} from {era_a} to {era_b}"
  family: concept-evolution
pipeline:
  1. Find all passages tagged with [concept] across ALL works
  2. Order by source date
  3. Group by historical period (Ancient, Medieval, Renaissance, Modern)
  4. Add transition commentary (minimal — only noting what changed, not why)
  5. Output: evolutionary tree with branches
```

The structure IS the timeline. Each section title is a date range. The passages show what changed.

### Family 5: Comparative Objects ⭐⭐⭐⭐⭐

**Question pattern:** "How does [Thinker A] compare to [Thinker B] on [Topic]?"

**Example:** Corbin vs Jung on the imaginal, Ficino vs Pico on astrology

**Implementation:**
```yaml
recognize:
  pattern: "{thinker_a} vs {thinker_b} on {topic}"
  family: comparative
pipeline:
  1. Find Thinker-on-Topic ROs for both [A] and [B] on [topic]
  2. Align by subtopic (ontology, epistemology, practice)
  3. For each subtopic, present A's passage then B's passage
  4. Surface disagreements (covered in Vision 4)
  5. Output: side-by-side structure
```

**Voice config:** Section A in female voice, Section B in male voice — the listener hears the comparison as a dialogue.

### Family 6: Reception Objects ⭐⭐⭐⭐⭐

**Question pattern:** "How was [Work] interpreted through history?"

**Example:** Reception of the Timaeus from Plato to Ficino, Reception of the Elements of Theology

**Implementation:**
```yaml
recognize:
  pattern: "reception of {work}"
  family: reception
pipeline:
  1. Search all works that cite, discuss, or respond to [Work]
  2. Order by date of response
  3. Group by historical period
  4. Each period shows: what they emphasized, what they ignored, what they transformed
  5. Output: layered commentary stack
```

### Family 7: Tradition Objects ⭐⭐⭐⭐

**Question pattern:** "What is [Tradition]?"

**Example:** Neoplatonic Angelology, Persian Illuminationism, Theurgy

**Implementation:**
```yaml
recognize:
  pattern: "what is {tradition}"
  family: tradition
pipeline:
  1. Find all ROs tagged with [tradition]
  2. Create a gateway RO that links to them
  3. Add: key texts, key thinkers, key concepts, key practices
  4. Output: index + curated entry points
```

### Family 8: Theme Objects ⭐⭐⭐⭐⭐

**Question pattern:** "What does the library say about [Theme]?"

**Example:** Beauty, Prayer, Death, Memory, Love, Imagination, Light, Music, Symbols

**Implementation:**
```yaml
recognize:
  pattern: "everything on {theme}"
  family: theme
pipeline:
  1. Search ALL passages across ALL works tagged with [theme]
  2. Group by subtopic (e.g., Beauty: natural, divine, artistic, erotic)
  3. Within each subtopic, order by tradition or chronology
  4. Output: the full treatment of a theme across 2,000 years
```

### Family 9: Practice Objects ⭐⭐⭐⭐⭐

**Question pattern:** "What did [Thinker] say about [Practice]?"

**Example:** Ficino on Prayer, Ficino on Music, Corbin on Meditation, Iamblichus on Ritual

**Implementation:**
```yaml
recognize:
  pattern: "{thinker} on {practice}"
  family: practice
pipeline:
  1. Search for passages by [thinker] tagged as "practice" not "theory"
  2. Distinguish: prescriptive (how to do it) from descriptive (what it is)
  3. Include: materials, timing, procedure, purpose
  4. Output: practice manual compiled from sources
```

### Family 10: Historical Questions ⭐⭐⭐⭐

**Question pattern:** "How did [Historical Process] happen?"

**Example:** How did astrology survive Christianity? Where did the daimon disappear? Origins of theurgy

**Implementation:**
```yaml
recognize:
  pattern: "how did {historical_process}"
  family: historical-question
pipeline:
  1. Find all sources discussing [historical_process]
  2. Organize as a narrative arc: before → during → after
  3. Each phase: contemporary sources describing the transition
  4. Output: documentary-style compilation
```

### Family 11: Debate Objects ⭐⭐⭐⭐⭐

**Question pattern:** "What are the arguments for and against [Proposition]?"

**Example:** Is imagination ontological? Does astrology determine fate? Can symbols act?

**Implementation:**
```yaml
recognize:
  pattern: "arguments for and against {proposition}"
  family: debate
pipeline:
  1. Find passages that argue FOR [proposition]
  2. Find passages that argue AGAINST [proposition]
  3. Present both sides without resolution
  4. If the RO already exists, check for new sources that change the balance
  5. Output: structured debate with for/against columns
```

### Family 12: Research Maps ⭐⭐⭐⭐⭐

**Question pattern:** "Map everything related to [Domain]"

**Example:** Everything related to Spiritus, Everything related to Planetary Magic, Everything related to Papañca

**Implementation:**
```yaml
recognize:
  pattern: "map everything related to {domain}"
  family: research-map
pipeline:
  1. Find all ROs, works, and concepts tagged with [domain]
  2. Create a visual/structured index
  3. Show: how ROs connect, which concepts overlap, where gaps exist
  4. Output: knowledge map (JSON structure that a frontend can render as a graph)
```

### Family 13: Reading Companions ⭐⭐⭐⭐

**Question pattern:** "Create a reading companion for [Book]"

**Example:** Reading Companion for Three Books on Life, Reading Companion for Elements of Theology

**Implementation:**
```yaml
recognize:
  pattern: "reading companion for {work}"
  family: reading-companion
pipeline:
  1. Extract chapter-by-chapter summary from the work itself
  2. For each chapter: find secondary literature that discusses it
  3. Add: key terms defined, questions to consider, cross-references
  4. Output: guided reading structure
```

### Family 14: Sourcebooks ⭐⭐⭐⭐⭐

**Question pattern:** "Collect all primary sources on [Topic]"

**Example:** Primary Sources on the Daimon, Primary Sources on Imagination

**Implementation:**
```yaml
recognize:
  pattern: "primary sources on {topic}"
  family: sourcebook
pipeline:
  1. Find ALL Tier 1 sources (original texts) tagged with [topic]
  2. No Tier 2 (commentary), no Tier 3 (compilation)
  3. Order chronologically
  4. Minimal framing — only: source, date, context (one sentence max)
  5. Output: the canonical passages collected like a Loeb edition
```

### Family 15: Research Questions ⭐⭐⭐⭐⭐

**Question pattern:** "[Open Question] — what is the evidence?"

**Example:** Did Ficino identify Genius with Daimon? Is the daimon external or internal?

**Implementation:**
```yaml
recognize:
  pattern: "investigate: {question}"
  family: research-question
pipeline:
  1. Create a structured investigation with fields: for[], against[], missing_sources[], confidence
  2. Search ALL works for passages relevant to the question
  3. Classify each passage as: supporting, opposing, or neutral
  4. Track which side has more evidence, more authoritative sources
  5. Confidence score: ratio of covered evidence to total known evidence
  6. When new sources arrive, re-evaluate confidence automatically
  7. Output: living investigation that improves over time
```

```json
{
  "ro_id": "ro:question-daimon-genius-identification",
  "title": "Did Ficino identify Genius with Daimon?",
  "type": "research_question",
  "status": "investigating",
  "question": "Did Marsilio Ficino identify the concept of Genius with the daimon?",
  "evidence_for": [
    {"source": "work:ficino-platonic-theology", "passage": "...", "strength": 0.8},
    {"source": "work:voss-becoming-angel", "passage": "...", "strength": 0.6}
  ],
  "evidence_against": [
    {"source": "work:ficino-letters", "passage": "...", "strength": 0.7}
  ],
  "missing_sources": [
    "Kristeller's survey of Ficino's Latin terminology",
    "Walker's chapter on Renaissance genius concepts"
  ],
  "confidence": 0.55,
  "last_evaluated": "2026-07-11"
}
```

---

## The Recursive Composition

Once you have multiple ROs, Hermes can compose them into higher-order ROs without touching raw PDFs.

```
Raw PDFs (Tier 1)
    ↓
Thinker-on-Topic ROs (Family 1)
    ↓
Topic-Across-Thinkers ROs (Family 2) — composed from Family 1
    ↓
Comparative ROs (Family 5) — composed from Family 1 + 2
    ↓
Books/Courses — composed from multiple ROs
```

**Example: "The Daimonic Soul in Renaissance Platonism"**

Hermes builds this by composing:
- `ro:ficino-daimon` (Family 1)
- `ro:ficino-spiritus` (Family 1)
- `ro:ficino-astrology` (Family 1)
- `ro:daimon-across-platonists` (Family 2)
- `ro:reception-timaeus` (Family 6)

No PDFs touched. All source passages come from existing ROs. The composition is purely structural — Hermes selects sections from each RO and arranges them in a new order.

---

## Question-Based Routing

The user never sees "family 4." They ask a question, and Hermes routes it:

```
User: "How did the daimon change from Plato to Ficino?"
  ↓
Hermes parses:
  concept: "daimon"
  from: "Plato"
  to: "Ficino"
  pattern: concept-evolution
  ↓
Hermes checks existing ROs:
  - Has ro:daimon-concept-evolution? → Update it
  - Has individual thinker ROs? → Compose from them
  - Has nothing? → Create from scratch
  ↓
Hermes responds:
  "I found passages tracking the daimon from Plato → Plotinus → Proclus → Ficino.
   That covers ancient, late antique, and renaissance periods.
   I'm missing Arabic intermediate sources.
   Create the evolution RO? [Yes] [Add Arabic sources first]"
```

### Question Pattern Recognition

| If user says | Family |
|---|---|
| "[Thinker] on [Topic]" | 1: Thinker on Topic |
| "[Topic] across [List]" | 2: Topic Across Thinkers |
| "[Thinker A] on [Thinker B]" | 3: Thinker on Thinker |
| "evolution of [Concept]" | 4: Concept Evolution |
| "[A] vs [B] on [Topic]" | 5: Comparative |
| "reception of [Work]" | 6: Reception |
| "what is [Tradition]" | 7: Tradition |
| "everything on [Theme]" | 8: Theme |
| "[Thinker] on [Practice]" | 9: Practice |
| "how did [History]" | 10: Historical Question |
| "arguments for/against [Proposition]" | 11: Debate |
| "map everything on [Domain]" | 12: Research Map |
| "reading companion for [Book]" | 13: Reading Companion |
| "primary sources on [Topic]" | 14: Sourcebook |
| "investigate: [Question]" | 15: Research Question |
| "[Topic]" (no pattern match) | 8: Theme (default — gather everything on the topic) |

### Implementation: The Router

```python
# hermes/skills/research/research-objects/router.py

PATTERNS = [
    (r"(.+) on (.+)",                 "thinker-topic"),        # Ficino on the Daimon
    (r"(.+) across (.+)",              "topic-across"),         # Daimon across Platonists
    (r"(.+) vs (.+) on (.+)",          "comparative"),          # Ficino vs Pico on astrology
    (r"evolution of (.+)",             "concept-evolution"),    # evolution of the daimon
    (r"reception of (.+)",             "reception"),            # reception of the Timaeus
    (r"arguments? for and against (.+)", "debate"),             # arguments for and against X
    (r"investigate:? (.+)",            "research-question"),    # investigate: did Ficino...
    (r"primary sources? on (.+)",      "sourcebook"),           # primary sources on the daimon
    (r"map everything on (.+)",        "research-map"),         # map everything on spiritus
    (r"reading companion for (.+)",    "reading-companion"),    # reading companion for Three Books
    (r"how did (.+)",                  "historical-question"),  # how did astrology survive
    (r"what is (.+)",                  "tradition"),            # what is theurgy
    (r"(.+) on (.+) and (.+)",         "thinker-topic-comparative"),  # handles edge cases
]
```

### Implementation Summary

| Vision | New Code Needed | New Hermes Config | New Content |
|---|---|---|---|
| 1: Learning Loop | None (uses `skill_manage`) | Cron for review cycle, skill directory | Skills in `~/.hermes/skills/compile-*/` |
| 2: Personal ROs | D1 journal query (API already exists) | Cron for weekly personal RO gen | Personal ROs in `content/research-objects/` |
| 3: Dreaming Mind | None | Cron for Sunday night dream cycle | `hermes/notes/dream-log.md` |
| 4: Comparative Engine | Contradiction detection logic in acquisition script | None | Disagreement ROs |
| 5: Mature Ecosystem | User onboarding flow on site | Cron for weekly digest | Everything above at scale |

The remarkable thing: **Visions 1, 3, and parts of 4 require zero new code.** They use existing Hermes capabilities (cron, `skill_manage`, journal, terminal, git) orchestrated through SKILL.md files. The infrastructure is already there. What's needed is the skill that tells Hermes how to run the loop.

---

## The Guiding Role of Hermes

### Scholar, Not Writer

Hermes is a **composer**, not an author. It never writes anything. It finds what scholars have already written, organizes it, links it, voices it, deploys it, and tracks how it improves over time.

The distinction is absolute:

| Role | Does | Example |
|---|---|---|
| **Author** | Creates original claims | "The daimon is X because Y" |
| **Scholar** | Finds, organizes, cites existing work | "Plato says X. Ficino says Y. Here are both passages." |
| **Compiler** | Assembles existing passages without adding | Every RO body is `kind: "source"` |

Hermes is the third. It's the most honest and the most useful. A scholar spends 80% of their time finding, organizing, and citing sources. Hermes automates that 80% — not by writing, but by **compiling with provenance**.

### Hermes Learns to Ask Better Questions

The Learning Loop (Vision 1) applies not just to compilation quality, but to **question quality**. As Hermes reviews its own ROs against the source commentaries, it learns:

- "When a user asks about the daimon, they also care about astrology — I should suggest expanding in that direction."
- "Thinker-on-Topic ROs are weak without chronological context — I should ask if they want a Concept Evolution instead."
- "Comparative ROs get 3x more engagement when disagreements are surfaced — I should prioritize contradiction detection."

This means Hermes doesn't just answer questions. It learns what questions are worth asking.

```yaml
# After 10 RO reviews, Hermes writes a skill about question-asking:
skill: ask-better-questions
rules:
  - When someone asks "what did X think about Y", also ask "how did X compare to others on Y?"
  - When someone asks for a Thinker-on-Topic, check if a Concept Evolution would serve better
  - When sources disagree, surface that disagreement before compiling
  - When coverage is below 60%, suggest expanding before publishing
```

### The Hierarchy of Composition

```
Raw Sources (uploaded PDFs, acquired papers)
    │
    ▼ Tier 1: Ingestion
Works (content/works/) — metadata + provenance + text
    │
    ▼ Tier 2: Compilation
Research Objects (content/research-objects/) — one coherent answer to one question
    │
    ▼ Tier 3: Collection
Collections — groups of ROs on a theme ("Ficino's Cosmos")
    │
    ▼ Tier 4: Publication
Books — structured sequence of collections with narrative spine
    │
    ▼ Tier 5: Guided Experience
Journeys — personalized learning paths through books
    │
    ▼ Tier 6: Structured Education
Courses — journeys with assessments, milestones, community
```

Each tier composes from the tier below without adding new source material. A "Book" is just a collection of ROs with an ordering and a brief narrative spine (still `kind: "source"` — the spine is assembled from the ROs' introductory paragraphs). A "Journey" is a sequence of ROs with "you are here" tracking. A "Course" is a journey with checkpoints.

### How All Five Visions Combine

```
                         ┌──────────────────────┐
                         │  Research Objects     │
                         │  (15 families, all    │
                         │   kind: "source")     │
                         └──────────┬───────────┘
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         │                          │                          │
         ▼                          ▼                          ▼
┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐
│ Vision 1           │  │ Vision 2           │  │ Vision 3           │
│ Learning Loop      │  │ Personal ROs       │  │ Dreaming Mind      │
│ Hermes compares    │  │ Diary entries      │  │ Weekly cross-RO    │
│ RO to sources,     │  │ become sources,    │  │ pattern detection, │
│ writes skills,     │  │ personal +         │  │ new RO proposals,  │
│ improves gap score │  │ scholarly merge    │  │ dream log           │
└──────────┬─────────┘  └──────────┬─────────┘  └──────────┬─────────┘
           │                       │                       │
           └───────────────────────┼───────────────────────┘
                                   │
                                   ▼
                        ┌────────────────────┐
                        │ Vision 4           │
                        │ Comparative Engine │
                        │ Disagreements      │
                        │ surfaced as ROs    │
                        └──────────┬─────────┘
                                   │
                                   ▼
                        ┌────────────────────┐
                        │ Vision 5           │
                        │ Mature Ecosystem   │
                        │ 50+ ROs, new user  │
                        │ onboarding, weekly │
                        │ digest, everything │
                        │ dashboard          │
                        └──────────┬─────────┘
                                   │
                                   ▼
                        ┌────────────────────┐
                        │ The Hierarchy      │
                        │ Works → ROs →      │
                        │ Collections →      │
                        │ Books → Journeys → │
                        │ Courses            │
                        └────────────────────┘
```

### The One Rule That Binds Everything

> **Every paragraph in every RO is `kind: "source"`. Hermes never writes. It compiles, links, voices, deploys, and improves — but never creates original claims.**

This rule:
- Makes the system honest (no AI-generated scholarship pretending to be human)
- Makes the system verifiable (every claim traces to a source)
- Makes the system improvable (gap scores are objective)
- Makes the system composable (ROs can be assembled without touching raw material)
- Makes the system durable (when models change, the ROs don't)
- Makes the system trustworthy (scholars can submit their work knowing it won't be distorted)

Hermes is the librarian, the editor, the voice actor, the deployment pipeline, and the quality assurance system — but never the author. The authors are Plato, Plotinus, Proclus, Ficino, Corbin, Nanananda, Voss, Kiosoglou, and everyone else whose words fill the ROs. Hermes just makes sure they're found, organized, audible, and improving.
