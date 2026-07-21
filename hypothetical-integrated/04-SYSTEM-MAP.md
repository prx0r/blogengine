# Complete System Map — How Everything Connects

## Data Flow

```
                         ┌──────────────────┐
                         │   User (Chat)     │
                         └────────┬─────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         │                        │                        │
         ▼                        ▼                        ▼
┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│  Acquisition     │   │  Chat Query      │   │  RO Curation     │
│  (cron, running) │   │  (internal docs) │   │  (human-guided)  │
└────────┬─────────┘   └────────┬─────────┘   └────────┬─────────┘
         │                      │                      │
         ▼                      ▼                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   THE DATA LAYER (files + git)               │
│                                                              │
│  content/works/    → 130 acquired papers (Tier 1/2)          │
│  content/glossary/ → 76 concepts, 67 essays, 60 art          │
│  content/research-objects/ → 5 ROs (draft)                   │
│  content/authors/ → author profiles                          │
│  library/ → 62+ PDFs by author                              │
│  source-texts/ → 32 Anna's Archive books                     │
│                                                              │
│  src/astrology/knowledge_graph.ts → 32+ entity types        │
│  src/astrology/spellbook/correspondences.ts → 231 entries    │
└─────────────────────────────────────────────────────────────┘
         │                      │                      │
         ▼                      ▼                      ▼
┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│  Memory          │   │  Outputs         │   │  Astrology       │
│  (USER.md,       │   │  (essays, audio, │   │  (daily reading, │
│   MEMORY.md,     │   │   deploy)        │   │   chart, daimon) │
│   session_search)│   │                  │   │                  │
└──────────────────┘   └──────────────────┘   └──────────────────┘
```

## What's Connected vs What's Not

| Connection | Status | How |
|---|---|---|
| Acquisition → Works | ✅ Running | cron-acquire.py |
| Works → ROs | ❌ Not wired | Acquisition writes works, but no RO extraction pipeline yet |
| ROs → Essays | ❌ Not wired | ROs have placeholder passages, can't generate essays yet |
| Concepts → ROs | ❌ Not linked | Concept JSONs have `research_objects[]` field but it's empty |
| Astrology → Concepts | ❌ Not linked | No cross-reference between astrology graph and glossary |
| Chat → Internal docs | ❌ Not wired | Context files not configured for chat |
| Diary → Personal ROs | ❌ Not built | Diary API exists but no Personal RO compiler |
| Memory → Chat | ✅ Built-in | Hermes auto-loads MEMORY.md and USER.md |
| Citation verification | ❌ Not built | Chat doesn't verify claims against sources yet |

## What to Connect First (In Order)

1. **Context files for chat** — configure Hermes to load our content dirs. Instant chat with internal knowledge.
2. **Concepts → ROs** — populate `research_objects[]` in concept JSONs. Links the two systems.
3. **Astrology → Concepts** — add `astrology` field to relevant concept JSONs. Bridges the systems.
4. **Works → ROs** — passage extraction pipeline. The critical missing link.
5. **ROs → Essays** — publish ROs as essays when they reach "review" state.
6. **Diary → Personal ROs** — tag-based personal RO compiler.
7. **Citation verification** — chat checks answers against source texts.
