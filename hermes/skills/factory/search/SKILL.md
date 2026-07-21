---
name: search
description: Map astrological and esoteric concepts to modern scientific research domains
version: 1.0.0
author: Thomas Prior
metadata:
  hermes:
    tags: [research, science, mapping, essays]
    requires_tools: [web_search]
---

# Research Mapping (Science ↔ Esoteric)

Map esoteric and astrological concepts to modern scientific research, creating bridges for the essay pipeline.

## Domain Mappings

| Esoteric Domain | Science Domain |
|---|---|
| Ficino spiritus | Interoception, predictive processing |
| Corbin imaginal | Mental imagery, hallucination models, psychedelic research |
| Goethe perception | Active inference, enactive cognition |
| Iamblichus ritual | Contemplative neuroscience |
| Plotinus beauty | Neuroaesthetics |

## When to Use
- "Find research that relates to {concept}"
- "What does modern science say about {esoteric concept}?"
- Before writing an essay on a domain bridge

## Procedure

### 1. Query arXiv Papers
Use `web_search` to search arxiv for recent papers matching the concept:
```
site:arxiv.org {esoteric concept} {science domain}
site:arxiv.org "predictive processing" Ficino
site:arxiv.org mental imagery imaginal
```

### 2. Classify Per Friston Schema
For each paper found, classify it into:
- **Classification**: Which domain it belongs to
- **Mathematical framework**: Key equations or formalisms
- **Empirical predictions**: What it predicts that can be tested
- **Theoretical relationships**: What it builds on, supports, or conflicts with
- **Evidence assessment**: How strong is the evidence

### 3. Check for Tensions
Compare the paper's claims with existing essay claims:
- Does the paper support or contradict an existing essay claim?
- Does it address an "unknown" listed in an essay?
- Does it extend an idea in a novel direction?

### 4. Build a Research Note
Format as structured markdown:
```markdown
# Research Note: {Paper Title}

## Paper
- Authors, Year, Journal
- Link

## Classification
- Domain: {science domain}
- Maps to: {esoteric concept}

## Key Claim
...

## Relationship to Existing Essays
- {Essay title}: {supports/conflicts/extends} because...

## Tension Detected?
{Yes/No — if yes, describe the contradiction}

## Recommendation
{Should this become an essay? A footnote? Ignore?}
```

### 5. Save as Journal Entry
Call `journal_write(kind="research_note")` with the note.

## Pitfalls
- Don't force connections that aren't there
- Note when the science contradicts the esoteric claim — these tensions are often the best essay topics
- If no papers are found after 3 searches, the concept may not have a research bridge yet

## Verification
- At least one paper was found and classified
- The mapping to an esoteric concept is genuine (not forced)
