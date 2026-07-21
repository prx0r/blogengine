# Hypothesis System — Data-Driven Content Strategy

A closed loop: market signal → hypothesis → content → monitor → validate → feed back.

## The Hypothesis Object (HO)

Stored in `data/hypotheses/ho-YYYY-MM-DD-NNN.json`:

```json
{
  "id": "HO-2026-07-20-001",
  "created": "2026-07-20",
  "signal": {
    "source": "market-scan-2026-07-20",
    "evidence": "Esoterica's 'What is Theurgy?' at 3.1x breakout. Vimarsha's 'Trika/Advaita comparison' at 2.1x breakout. Theurgy demand growing.",
    "confidence": 0.7
  },
  "hypothesis": "A 'What is Theurgy?' video using question-title format will outperform (break out >2x channel baseline)",
  "reasoning": [
    "Question titles are 27% of breakouts in our niche",
    "Esoterica's theurgy video proved demand exists",
    "No dedicated theurgy explainer in English at 10-20min length",
    "Our RO depth on Iamblichus/Proclus exceeds any competitor"
  ],
  "content_spec": {
    "title_candidate": "what is theurgy? the western tantra nobody talks about",
    "format": "hook → passage → decode → takeaway",
    "ros": ["ro:iamblichean-theurgy", "ro:shaw-theurgy", "ro:chaldean-oracles", "ro:proclus-hymns"],
    "target_duration_min": 15,
    "target_views": 50000,
    "validation_window_days": 30
  },
  "status": "proposed",         
  "published": null,             
  "performance": null,           
  "validated": null,             
  "implications": []             
}
```

## The Loop

```
Market scan ──→ detects signal (theurgy trending)
       │
       ▼
Hypothesis proposed ──→ Hermes finds ROs, drafts content
       │
       ▼
Content published ──→ HO.status = "published"
       │
       ▼
30-day monitor ──→ HO.performance collected
       │
       ▼
Validate? ──→ HO.validated = true/false
       │                    │
       ▼                    ▼
Implications          Refine hypothesis
generated             (what went wrong?)
       │
       ▼
Next hypothesis
```

## Current Signals (from today's scan)

### Strong — should act on
| Signal | Evidence | Hypothesis Idea |
|--------|----------|----------------|
| Theurgy trending | Esoterica 3.1x, zero competitors | "What is Theurgy? — Western Tantra" |
| Comparison content works | Vimarsha 2.9x "Advaita & Trika" | "5 Things Abhinavagupta Saw That Iamblichus Missed" |
| Short-form in niche | Tantra Talks 25.8x at 51sec | 1min theurgy shorts — "Theurgy in 60 Seconds" series |
| Name-dropping format | SittingNow 5.9x with named guest | "The Forgotten Yogi" spotlight series |

### Moderate — should explore
| Signal | Evidence | Hypothesis Idea |
|--------|----------|----------------|
| "Not what you think" pattern | Doug's Dharma 2.8x, Esoterica 3.2x | "Tantra Isn't What You Think" |
| Taboo + expertise | Vimarsha 4.7x "Sex, Alcohol & Tantra" | "The Dark Side of the Tantras" |
| Jung content still huge | Pursuit of Wonder 4.4x | "Corbin vs Jung: The Imaginal Debate" |

### Weak — monitor only
| Signal | Evidence |
|--------|----------|
| Long-form interviews | SittingNow 5.9x, but hard to produce |
| Sanskrit/Hindi content | Vimarsha 5.1x, but wrong language for English channel |

## Next Steps

1. Convert strongest signal → HO-001 (theurgy explainer)
2. Run second market scan in 7 days to compare pattern shifts
3. Publish theurgy content → monitor 30 days
4. If validates: publish "Western Tantra" comparison follow-up
5. Feed validated hypotheses into content calendar
