# Visionary Notes — Hermes as Living Scholarly Literature

## The Karpathy Convergence

Karpathy's LLM Wiki insight: **Don't query raw documents forever. Compile them into persistent knowledge artifacts that keep improving.**

This is exactly what Research Objects are — but Hermes's natural unit is a **scholarly question**, not a wiki page.

```
Karpathy:             Hermes:
Raw docs              Raw works (library/)
  ↓                     ↓
Wiki pages            Research Objects (content/research-objects/)
  ↓                     ↓
Queries               Comparative Objects → Essays → Audio → Video → Courses → Journeys
```

The difference: wiki pages are generic, but a Research Object answers a specific scholarly question:
- "Ficino on the Daimon"
- "Participation in Proclus"
- "Corbin's Interpretation of Avicenna"

Those are much more natural objects for scholarship than a generic "Daimon" page.

---

## The Architecture

### Immutable Sources vs. Living Artifacts

Raw works never change. The PDF is ingested once, hashed, and stored immutably. The Research Object evolves as new evidence arrives.

```
Raw/
  Three Books on Life.pdf      ← Immutable. Never edited.
  Platonic Theology.pdf        ← Immutable. Never edited.

Compiled/
  ro:ficino-daimon v1          ← Living. Improves with new sources.
  ro:ficino-daimon v2          ← Living. Updated when Kiosoglou acquired.
  ro:ficino-daimon v3          ← Living. Updated when Corrias found.

Published/
  essay/ficino-daimon v1       ← Snapshot at time of publication.
  essay/ficino-daimon v2       ← Updated when RO reached v3.
```

### Append-Only Timeline

Each Research Object has a scholarly-level timeline:

```
ro:ficino-daimon

v1 (2026-07-01)
  Added: Voss (2 passages)
  Added: Three Books on Life (3 passages)

v2 (2026-07-11)
  Added: Kiosoglou (4 passages on soul vehicle)
  Coverage: +12%

v3 (2026-07-18)
  Added: Corrias (3 passages on Plotinus comparison)
  Added: Kristeller references (5 passages)
  Removed: weak passage on prayer (source wasn't actually about Ficino)
  Coverage: +8%
```

This is more useful than git log because it's at the scholarly level — "added Kiosoglou" not "changed line 47."

---

## The Recursive Insight

Once you have Research Objects, Hermes can compose them.

```
Ficino on the Daimon    (Thinker on Topic)
Plato on the Daimon     (Thinker on Topic)
Proclus on the Daimon   (Thinker on Topic)
History of the Daimon   (Concept Evolution)
Ficino on Spiritus      (Thinker on Topic)
Ficino on Astrology     (Thinker on Topic)
                            ↓
Hermes asks: "What higher-order object should exist?"
                            ↓
"The Daimonic Soul in Renaissance Platonism"
  — composed from 6 existing ROs, 0 raw PDFs touched
```

That's recursive scholarship: syntheses built from previous syntheses, not from raw material.

---

## Issues, Not Kanban

Instead of Kanban cards, each Research Object has **Issues**:

```
Issue #14: Need better treatment of natal genius
  Status: Open
  Potential sources: 3 (Walker, Kristeller, Ficino's Letters)

Issue #31: Corbin comparison too weak
  Status: Blocked
  Waiting for: Alone with the Alone annotations

Issue #47: Coverage gap in Section 4 (astrological daimon)
  Status: Resolved
  Fixed in: v3 (added Kiosoglou passages)
```

Hermes isn't wandering the internet. It's resolving explicit research issues against known gaps.

---

## The Research Backlog

When you open a Research Object, Hermes shows:

```
Ficino on the Daimon

Coverage: ████████░░  (78%)

Missing:
  □ Walker's interpretation of natal genius
  □ Kristeller's Latin source analysis
  □ Ficino's Letters on personal daimon
  □ Arabic influences on Ficino's daimon concept

New papers found this week: 3
  Potential impact: High
  Would improve: Section 4, Section 7
```

This becomes your research backlog. Not "read random paper" but "this paper closes a gap in a living knowledge object."

---

## The Distinction

| | LLM Wiki | Hermes |
|---|---|---|
| Unit | Wiki page | Research Object (answers one question) |
| Sources | Any docs | Scholarly works (Tier 1-3) |
| Compilation | LLM summarizes | Compiles `kind: "source"` passages |
| Evolution | Manual refresh | Cron + impact detection + issues |
| Output | Wiki page | Essay + Audio + Video + Journey + Course |
| Recursion | No | Yes — ROs compose into ROs |
| Gap tracking | No | Issues + coverage map + research todos |

---

## The One-Sentence Summary

> **Build a versioned, living scholarly literature where every new source improves enduring research objects rather than producing disposable answers.**

That's what Hermes becomes. Not AI writing philosophy. Not better RAG. Not PDF summarization. A compounding knowledge system where the compiled artifact is the thing that persists and improves, not the chat.

---

## What This Means For the Build

The `visionbuild.md` gap analysis still holds. The priority hasn't changed:

1. Build `content/research-objects/` and the first RO (prove the format)
2. Build the creation pipeline (Hermes can create ROs from its library)
3. Build impact detection (new sources → automatic RO updates)
4. Build the learning loop (RO self-review → skill writing)
5. Build the recursive composer (ROs composing ROs)

The Karpathy convergence just confirms we're on the right track. The LLM Wiki community is independently arriving at the same architectural insight: **compile, don't recompute.**
