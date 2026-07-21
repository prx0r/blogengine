# Hermes Clarity — The Full System

## The Runtime: Hermes Agent

Hermes v0.18.2 is already running as a systemd service. It handles Telegram, skills, cron, memory, subagents, MCP, and a Tool Gateway (web search, image gen, TTS, browser). SOUL.md defines its personality — currently a "scholar's apprentice" identity. The skill architecture has 5 levels:

```
Level 1: Question routing  → /research-objects (15 families)
Level 2: Acquisition        → /acquisition → /impact
Level 3: Compilation        → /compile → /propose → /merge
Level 4: Verification        → /lint → /test → /error-book
Level 5: Publication        → /publish-paper → /deploy-site
```

Every skill is a SKILL.md file — instructions for Hermes to orchestrate its existing tools. No new code required for most skills.

## The Knowledge Substrate: ROs + COs

**Research Objects** (169 existing) are structured compilations answering one bounded question. Every passage is `kind: "source"`. They're versioned, source-tracked, and consumed by downstream products (essays, audio, video, chatbot context).

**Commentary Objects** (738 from UNO) are pedagogical annotations on ROs. Each CO stores: `(state, function, mechanism, register, my_thoughts, visible_response)`. They're what the teaching system queries — not to generate responses, but to SELECT which teacher's voice and move to use.

The CO schema extends the RO schema:

```json
{
  "co_id": "co:uno_advaita_identity_hierarchy",
  "lineage": "Advaita",
  "student_state": "seeking_identity_hierarchy",
  "pedagogy": {
    "phase": "REMAKING",
    "function": "RM_01",
    "mechanism": "structural_analogy",
    "register": {"intensity": 0.35, "intimacy": 0.72, ...}
  },
  "my_thoughts": "Answers the priority question by mapping the hierarchy...",
  "visible_response": "I am not the cloud, I am the space in which it appears.",
  "linked_ros": ["ro:upanishads", "ro:yoga-vasistha"],
  "usage": {"successes": 0, "failures": 0}
}
```

## The Product: Daimonic Companion (futureresearch.md)

Three data streams feed into Hermes:

| Stream | Source | What it produces | Status |
|--------|--------|-----------------|--------|
| Astrology | caelus → 32-file engine → ActivationPacket | Daily planetary activations, daimon, aspects | ✅ Production |
| Diary | D1 journal_entries table | Mood, energy, tags, free-form notes | ✅ Storing |
| Knowledge | ROs + COs | Structured compilations, pedagogical annotations | ✅ 169 ROs, 738 COs pending export |

Hermes reads all three and proactively offers guidance:

> "Mercury is your daimon. It's been the primary signal on 12 of the last 30 days. On those days, you wrote 3x more than average. Tomorrow Mercury is active again — consider focused writing time."

The Personality is defined by SOUL.md — currently a scholar's apprentice. For the daimonic companion, SOUL.md becomes the user's personal guide: tutelary, direct, grounded in the Western esoteric tradition. The personality isn't trained — it's prompted. SOUL.md + AGENTS.md + MEMORY.md define the character.

## The Teaching System: A Hermes Skill

The `/teach` skill takes an RO + a student question and returns a response:

```
1. Classify student state → Mātṛkā prototype
2. Thompson sample COs for (state, lineage)
3. CO gives: function, mechanism, register vector
4. Retrieve RO content from CO.linked_ros
5. Retrieve CO.visible_response as voice template
6. DeepSeek adapts template to current student (preserves voice, substitutes references only)
7. Return response
8. Student replies → update CO.successes/failures
9. Error Book catches failures
```

This is a Hermes skill. It runs inside the existing Hermes pipeline. It doesn't need a separate server, separate database, or separate deployment. The COs live in `content/commentaries/uno/` alongside the ROs in `content/research-objects/`. The Thompson selector is a Python function called by the skill. The Error Book is a JSON file at `content/commentaries/error-book.json`.

## SOUL.md as the Daimonic Interface

Currently, SOUL.md defines Hermes as a "scholar's apprentice" — curious, honest about gaps, never writing original claims. For the daimonic companion, SOUL.md becomes:

- **Your personal daimon** — not a generic assistant, but an entity that knows your chart, your diary, your patterns
- **Voice-preserving** — when it cites an RO, it uses the source's words. When it gives advice, it draws from the practice library. It never pretends to be the source of wisdom
- **Proactive** — Hermes cron pushes notifications based on upcoming planetary activations. It doesn't wait for you to ask
- **Longitudinal** — MEMORY.md + USER.md track your patterns across sessions. The system gets more personal over time

## What to Build Next

### Week 1: Fix the Parser + Export COs

```
Fix uno_parser.py (concatenated JSON arrays) → 738 COs
Create content/commentaries/uno/ directory
Export COs with fixed schema (pedagogical_hooks + abstract_pattern)
```

This is the only UNO work needed. 30 minutes.

### Week 2: Wire COs into Hermes

```
Create /teach skill (SKILL.md)
  └── Thompson selector: ~40 lines Python
  └── State classifier: ~30 lines (sentence-transformers + 50 prototypes)
  └── CO → RO linker: lineage-based mapping
  └── DeepSeek adapter: preserves CO voice, substitutes references
  └── Error Book: constraint log + block check
  └── Register predictor: tiny MLP, 5K params
```

### Week 3: Daimonic Companion

```
Update SOUL.md → daimonic personality (not scholar's apprentice)
Wire astrology engine → Hermes (daily ActivationPacket → Telegram)
Wire diary → Hermes (mood/energy/tags → personal ROs)
Create /daimon-daily skill (proactive morning briefing)
Create /daimon-review skill (weekly pattern summary)
```

### Week 4: RO Pipeline Completion

```
Create /impact skill (new work → affected ROs → Telegram)
Create /propose skill (git branch → diff → Telegram review)
Create /merge skill (approve → version bump → git push)
Wire dreaming cycle (weekly: cold state pairs → new RO proposals)
```

## The Architecture

```
┌─────────────────────────────────────────────────────────┐
│  HERMES AGENT (systemd service)                         │
│                                                         │
│  SOUL.md → Personality (daimonic / scholarly / custom) │
│  AGENTS.md → Project context                           │
│  MEMORY.md → Cross-session memory                      │
│                                                         │
│  Skills (SKILL.md files):                              │
│  ├── /acquisition  → Download + catalog papers         │
│  ├── /impact       → Detect ROs affected               │
│  ├── /compile      → Build RO from sources              │
│  ├── /teach        → CO selection + response           │  ⭐ New
│  ├── /daimon-daily → Proactive astrology briefing       │
│  ├── /lint         → Structural verification            │
│  ├── /publish-paper→ Essay + audio deployment           │
│  └── dreaming-cycle→ Weekly gap analysis                │
│                                                         │
│  Cron: daily-impact-sweep, weekly-lint, dreaming-cycle  │
└────────────────────────┬────────────────────────────────┘
                         │ talks to
┌────────────────────────▼────────────────────────────────┐
│  DATA LAYER (files + D1 + R2)                           │
│                                                         │
│  content/                                               │
│  ├── research-objects/    → 169 ROs (scholarly)        │
│  ├── commentaries/        → 738 COs (pedagogical)      │
│  ├── glossary/concepts/   → 76 concepts                │
│  ├── glossary/essays/     → 70 essays with audio       │
│  ├── works/               → 130 cataloged papers       │
│  └── sources/             → 12 traditions organized    │
│                                                         │
│  library/                 → 62 PDFs                    │
│  source-texts/            → 32 Anna's Archive books    │
│  D1 (Cloudflare)          → journal entries, user data │
└─────────────────────────────────────────────────────────┘
```

## The Key Insight

Hermes is not a chatbot. It's a **runtime for autonomous agents** — skills, cron, memory, Telegram, MCP, Tool Gateway. Everything we've designed (COs, Thompson, Error Book, daimonic companion) fits inside this runtime as skills and data files. No separate server. No separate database. No separate deployment. Just SKILL.md files and JSON in the content directory.

The 738 UNO blocks become `content/commentaries/uno/*.json`. The Thompson sampler is a Python function called by the `/teach` skill. The Error Book is `content/commentaries/error-book.json`. The daimonic companion is SOUL.md + a cron job.

The 169 ROs already exist. The pipeline skills already exist (`/acquisition`, `/publish-paper`, `/deploy-site`). The missing skills (`/teach`, `/impact`, `/propose`, `/merge`) are SKILL.md files — instructions for Hermes to orchestrate tools it already has.
