---
name: curate
description: Curate Research Objects — review coverage, suggest expansions, manage issues.
version: 1.0.0
author: Hermes
metadata:
  hermes:
    tags: [curation, ros, review, quality]
    requires_tools: [terminal]
---

# Curate — RO Management

Review and manage Research Objects: coverage gaps, issues, suggested expansions.

## Usage

```
/curate list                     # All ROs with status and coverage
/curate show ro:ficino-daimon   # Full RO status
/curate gaps                     # ROs with open coverage gaps
/curate issues                   # ROs with unresolved issues
/curate suggest ro:ficino-daimon # Suggest sources to fill gaps
```

## What It Shows

```
╔══════════════════════════════════════════════════════════════╗
║  CURATE: ro:ficino-daimon                                    ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Status: draft (v0.1.0)                                      ║
║                                                              ║
║  Sections:                                                   ║
║    ontology    ████░░░░ 35% — 2 gaps                         ║
║    astrology   ░░░░░░░░ 0%  — 3 gaps (needs Voss)           ║
║    practice    ██░░░░░░ 20% — 2 gaps                         ║
║                                                              ║
║  Issues:                                                     ║
║    ⚠ coverage_gap: astrology section empty                  ║
║    ⚠ coverage_gap: prayer section missing                   ║
║    🔒 potential_error: Voss and Kiosoglou disagree?         ║
║                                                              ║
║  Suggested: acquire Voss on Ficino's astrology (in library)  ║
╚══════════════════════════════════════════════════════════════╝
```

## Workflow

1. `/curate list` — see all ROs
2. `/curate show ro:ficino-daimon` — see gaps
3. Review gaps → decide what to expand
4. `/curate suggest ro:ficino-daimon` — get source suggestions
5. Approve expansion → run `/acquire` or `/compile`
