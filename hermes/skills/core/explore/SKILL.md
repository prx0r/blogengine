---
name: explore
description: Search all internal knowledge — concepts, ROs, works, essays. Surfaces gaps too.
version: 1.0.0
author: Hermes
metadata:
  hermes:
    tags: [research, search, internal, knowledge]
    requires_tools: [terminal]
---

# Explore — Internal Knowledge Search

Searches ALL data silos at once: glossary concepts, Research Objects, acquired works, published essays.
Also surfaces what's NOT known (gaps) as opportunities for acquisition.

## Usage

```
/explore daimon
/explore "Henry Corbin imaginal"
/explore ficino astrology
```

## What It Searches

1. **Concepts** — glossary definitions, names, synonyms
2. **Research Objects** — titles, body passages, coverage maps
3. **Works** — acquired paper titles, topics
4. **Essays** — published essay titles, concept tags

## What It Surfaces

- Found results with citations
- Gaps: "No ROs on this topic — need to compile?"
- Connections: "These ROs might be related: ro:ficino-daimon vs ro:corbin-imaginal"
- Action items: "No Tier 2 commentaries — need to acquire?"
