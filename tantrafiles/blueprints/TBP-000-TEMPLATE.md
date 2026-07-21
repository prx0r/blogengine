# Research Blueprint NNN: Title

## Blueprint Metadata

* `blueprint_id`: TBP-NNN
* `topic_id`: SLUG
* `created_at`: DATE
* `target_runtime_minutes`: 20
* `channel`: Tantra Files | Ochema | Angeliz | Pramāṇa | Intelligent Others
* `human_review_required`: yes/no

## Data-Driven Predictions

*These fields are computed from the 149-channel dataset before the first word is written.*

| Metric | Value | Source |
|--------|-------|--------|
| **Predicted breakout probability** | XX% | `predict_views.py --title "..."` |
| **Baseline breakout rate** | 25% | 15,735 video dataset |
| **Niche breakout rate** | XX% | `niche-breakout-rates.json` |
| **Topic keyword lift** | X.Xx | `hermes_knowledge.py --topic X` |
| **Best framing word** | "forgotten" (2.0x) | `hermes_knowledge.py --framing-words` |
| **Competitor videos found** | XX | YouTube search (see Market Comparison) |
| **Competitor median views** | XX,XXX | Market scan |
| **Channel fit** | HIGH/MED/LOW | Does this match the channel's proven patterns? |
| **Predicted view range (P50)** | XX,XXX–XXX,XXX | XGBoost + channel baseline |

## Title Candidates (Ranked by Predicted Breakout)

| Title | Pattern Score | Framing Lift | Combined |
|-------|--------------|--------------|----------|
| "Title A" | 0.XX | X.Xx | X.X |
| "Title B" | 0.XX | X.Xx | X.X |

## Charged Hook

*80-100 word opening that establishes the central mystery.*

## Video Thesis

*One sentence: what this video argues.*

## Narrative Engine

### Central Mystery
*One sentence: the question the video answers.*

### Hypotheses
- **HYP-01**: [Hypothesis]
- **HYP-02**: [Hypothesis]
- **HYP-03**: [Hypothesis]

### Key Evidence (with Data Tags)
| Claim | Confidence | Source | Verified? |
|-------|------------|--------|-----------|
| CLM-001: [claim] | 0.XX | SRC-00X | yes/no |

## Beat Structure (20 min)

| Beat | Time | Role | Content | Key Claim | Key Asset |
|------|------|------|---------|-----------|-----------|
| 1 | 0:00-1:25 | HOOK | [description] | CLM-001 | AST-001 |
| 2 | 1:25-3:15 | ORIENTATION | [description] | CLM-002 | AST-002 |
| ... | ... | ... | ... | ... | ... |

## Source Ledger

| ID | Author | Title | Access | Claims It Supports |
|----|--------|-------|--------|-------------------|
| SRC-001 | — | — | open/library | CLM-001–005 |

## Visual Asset Manifest

| ID | Content | Source | Licence | Status |
|----|---------|--------|---------|--------|
| AST-001 | [description] | Wikimedia/Original | CC-BY-SA/Create | verified/pending |

## Post-Publish

*After publishing, return here and record:*
- **Actual views:** XXX,XXX
- **Breakout status:** yes/no
- **Retention at each beat:** (fill from analytics)
- **Prediction error:** ±XX%
- **HO update needed?** yes/no
- **Spin-off priority:** [rank from queue]
