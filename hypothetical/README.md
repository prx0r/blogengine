# Goldilocks + Visions — Grounded Architecture

12 mechanisms. 5 visions grounded in tech. Everything has tests and failure modes.

## File Map

| File | What | Lines |
|---|---|---|
| `00-CORE-RO.md` | RO JSON schema — the fundamental unit | 25 |
| `01-VISION-LEARNING-LOOP.md` | RO review → Error Book constraint accumulation (NOT skill writing) | 65 |
| `02-VISION-PERSONAL-ROS.md` | Tag-based diary → personal ROs. No NLP. | 60 |
| `03-VISION-DREAMING.md` | Weekly cross-RO pattern detection. Budget-limited, sample-based. | 70 |
| `04-VISION-COMPARATIVE.md` | Disagreement detection → standalone ROs. `resolution: null`. | 70 |
| `05-ACQUISITION.md` | Running pipeline: citation chain + OA + free sources | 65 |

## What Each Vision Actually Does

| Vision | Mechanism | Verified By | Testable? |
|---|---|---|---|
| 1: Learning Loop | Compare RO vs sources → add Error Book constraints | Retrieval as Reasoning | ✅ Error Book has expected constraint |
| 2: Personal ROs | Tag matching → personal RO with linked_ros | Companion Knowledge | ✅ Personal RO exists when entry tagged |
| 3: Dreaming Mind | Sample 3 ROs → cross-domain patterns | Speculative (new) | ✅ Dream log has entry when pattern found |
| 4: Comparative Engine | Topic overlap → contradiction detection | ORKG, Retrieval as Reasoning | ✅ Contradiction flagged when sources disagree |
| 5: Acquisition | Citation chaining + OA budget + free sources | Practice (running) | ✅ PDF downloaded when signal > threshold |

## What's Excluded (Speculative, No Implementation Path)

- Skill writing via learning loop (no paper shows it works) → Error Book constraints instead
- Full-text dreaming (budget-limited sampling is cheaper, same value)
- Auto-resolved disagreements (scholarly disagreements can't be auto-resolved)
