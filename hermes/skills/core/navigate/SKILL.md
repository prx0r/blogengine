---
name: navigate
description: Navigate the full knowledge graph — concepts, ROs, works, essays, art. See what connects to what.
version: 1.0.0
author: Hermes
metadata:
  hermes:
    tags: [navigate, graph, explore, connections]
    requires_tools: [terminal]
---

# Navigate — Knowledge Graph Browser

Shows how everything connects: concept → ROs → works → essays → art.

## Usage

```
/navigate daimon          # Show everything connected to "daimon"
/navigate ficino          # Show all Ficino-related content
/navigate theurgy         # Show theurgy cluster
/navigate whatsnew        # Show recently acquired works
```

## What It Shows

```
╔══════════════════════════════════════════════════════════════╗
║  NAVIGATE: daimon                                            ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Concept → daimon                                          ║
║  ├── Art: art_angel_gabriel, art_astrological_bowl         ║
║  ├── ROs: ro:ficino-daimon (draft, 23% coverage)           ║
║  ├── Essays: 2 published                                    ║
║  └── Works: 14 Tier 2 commentaries                         ║
║                                                              ║
║  Connections:                                               ║
║    ro:ficino-daimon → sources: 3 active, 1 paywalled       ║
║    ro:ficino-daimon → coverage: 5 sections, 2 partial      ║
║    Astrology: Mercury (planet), House 1                     ║
║                                                              ║
║  Gaps: astrology section empty, prayer section empty        ║
╚══════════════════════════════════════════════════════════════╝
```

## Sub-commands

| Command | What it does |
|---|---|
| `whatsnew` | Show works acquired in the last 24h |
| `status` | Show system-wide coverage stats |
| `graph` | Show all connections for a concept |
| `broken` | Find broken refs between silos |
