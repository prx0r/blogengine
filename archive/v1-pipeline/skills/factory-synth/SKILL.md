---
name: synth
description: Synthesize answers from internal knowledge — cites sources, flags gaps, suggests next steps.
version: 1.0.0
author: Hermes
metadata:
  hermes:
    tags: [synthesize, answer, research, cite]
    requires_tools: [terminal, web_search]
---

# Synth — Internal Knowledge Synthesis

Answers questions using OUR library. Not general LLM knowledge.
Every claim cites its source. Gaps are surfaced honestly.

## Usage

```
/synth "What did Ficino think about the daimon?"
/synth "How does theurgy relate to Neoplatonism?"
/synth "What's the difference between daimon and angel in Corbin?"
```

## How It Works

```
1. Search ALL silos: start by reading content/sources/_index.json to see what traditions/topics exist
2. Then search: concepts (content/glossary/concepts/), ROs (content/research-objects/), works (content/works/), essays (content/glossary/essays/), AND all source materials in content/sources/ (organized by tradition)
3. For PDFs in content/sources/, use pdftotext to extract text on-the-fly
4. Find relevant passages across ALL materials
5. Compile answer with inline citations showing source file paths
6. Flag what's NOT known (gaps)
7. Suggest next steps (what to acquire, compile, explore, or read from our library)
```

## Response Format

```
Answer: Ficino identified the Socratic daimon as a tutelary spirit
assigned at birth, mediating between the individual and the divine.

Sources:
  • ro:ficino-daimon passage p_001 (from work:ficino-daemon-socratico)
  • work:kiosoglou-ficino-soul (on the soul-vehicle function)

Note: I don't have sources on how this compares to Plotinus's
daimon concept — that's a known gap in our library.

Suggested: /search "Plotinus daimon comparison" or /acquire Corrias
```

## Rules

1. Every claim MUST cite a source from our library
2. If no source exists, say "I don't have a source for that"
3. Never use general LLM knowledge to fill gaps
4. Always surface known gaps alongside answers
5. If a question would benefit from a new RO, suggest /curate
