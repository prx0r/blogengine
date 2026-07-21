# Integrated Architecture — Hermes at the Center

## The Symbiotic Loop

```
User (Telegram / Chat)
  │
  ├── Asks a question → Hermes searches internal docs + ROs + concepts
  │   └── Returns answer with citations from OUR library, not generic LLM knowledge
  │
  ├── Sends a paper → Acquisition pipeline downloads + catalogs
  │   └── Hermes checks: does this affect existing ROs? Proposes updates.
  │
  ├── Says "explore the daimon concept" → Hermes loads the daimon concept + related ROs + art + essays
  │   └── User sees: concept definition, linked ROs, scholarly commentaries, art, astrology correspondences
  │
  ├── Writes a diary entry → Personal ROs compile around tagged concepts
  │   └── Hermes links personal observations to scholarly ROs
  │
  └── Reviews an RO → Hermes shows coverage, gaps, suggested expansions
      └── User approves/rejects → RO moves to next state
```

## What Hermes Can ACCESS

| Data | Where | How Hermes Loads It |
|---|---|---|
| Concept definitions | `content/glossary/concepts/*.json` | Context file or read_object |
| Published essays | `content/glossary/essays/*.json` | Context file |
| Art metadata | `content/glossary/art/*.json` | Context file |
| Acquired papers (Tier 2) | `content/works/*.json` | Context file |
| Research Objects | `content/research-objects/ro-*/ro.json` | Context file |
| Astrology graph | `src/astrology/knowledge_graph.ts` (in-memory) | API call via terminal tool |
| Correspondences | `src/astrology/spellbook/correspondences.ts` | Loaded as data |
| User journal | D1 `journal_entries` table | API call via terminal |
| User profile | `~/.hermes/memories/USER.md` | Built-in Hermes memory |
| Agent notes | `~/.hermes/memories/MEMORY.md` | Built-in Hermes memory |

## The Symbiotic Workflow

```
User's Role:                          Hermes's Role:
─────────────                         ──────────────
Ask questions                         Search internal docs, compile answer with citations
Send papers                           Acquire, catalog, check impact on ROs
Guide RO structure                    Extract passages, organize by section
Review and approve PRs                Generate diffs, bump versions, deploy
Tag diary entries                     Compile personal ROs, link to scholarly
Write tests for ROs                   Run tests, report failures
Curate the Error Book                 Accumulate constraints, detect patterns
```

Hermes does the heavy lifting (acquisition, extraction, compilation, testing).
The human does the high-level guidance (curation, approval, structural decisions).
Neither can function well without the other.
