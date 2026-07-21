# YouTube Intelligence Data Pipeline

Standardized methodology for gathering, verifying, and publishing YouTube market intelligence data. Every report follows this spec so results are machine-readable, comparable across time, and auditable.

## Pipeline Stages

Each stage has binary verification gates. All gates in a stage must pass before advancing to the next.

```
Stage 1: Underserved-Claim Check
  │  Verifies the market gap exists before spending budget
  ▼
Stage 2: Channel Curation
  │  Selects channels meeting inclusion criteria
  ▼
Stage 3: Video Harvest
  │  Pulls full video population + transcripts + metadata
  ▼
Stage 4: Feature Extraction
  │  Computes title features, thumbnail analysis, hook classification
  ▼
Stage 5: Model Training + Gap Map
  │  Trains predictor, publishes updated gap map
```

---

## Stage 1: Underserved-Claim Check

### Purpose
Test whether English-language content from Indian creators is invisible to Western audiences. Run before any budget is spent on deeper analysis.

### Method
| Parameter | Value | Rationale |
|-----------|-------|-----------|
| API | `search.list` | Separate quota bucket (100/day) |
| Regions | IN, US, GB | Covers target market + two Western benchmarks |
| `relevanceLanguage` | `en` | Only English results |
| `maxResults` | 15 | Top of search is what users see |
| Time window | Last 12 months | Standardized default for all queries |
| Queries | 30 tantra-specific | Covering 5 topic clusters × 6 queries each |

### Output Format
Every report file: `data/reports/{type}-{date}.json`

```json
{
  "report": {
    "id": "underserved-claim-test-2026-07-21",
    "type": "underserved_claim_test",
    "date": "2026-07-21",
    "pipeline_version": "1.0.0"
  },
  "method": {
    "api": "YouTube search.list",
    "parameters": {
      "regions": ["IN", "US", "GB"],
      "relevanceLanguage": "en",
      "maxResults": 15,
      "timeWindowMonths": 12,
      "queries": [{"query": "...", "topic": "philosophy"}]
    },
    "formulas": {
      "gap_score": {
        "expression": "in_only_channel_count / total_in_channel_count",
        "range": "[0, 1]",
        "interpretation": "1 = fully underserved (all IN channels invisible to US/GB), 0 = fully served (all channels visible everywhere)",
        "threshold_for_gap": ">= 0.30"
      },
      "uk_gap_score": {
        "expression": "gb_channel_count == 0 ? 1.0 : in_only_gb_channel_count / total_gb_channel_count",
        "note": "Separate flag because UK often has zero results for tantra topics"
      },
      "channel_visibility": {
        "expression": "classify based on region presence",
        "classes": ["IN_only", "IN_US", "IN_GB", "US_only", "GB_only", "all_three", "none"]
      }
    },
    "channel_size_tiers": {
      "micro": {"range": "[1, 5000)", "label": "Micro"},
      "small": {"range": "[5000, 50000)", "label": "Small"},
      "medium": {"range": "[50000, 500000)", "label": "Medium"},
      "large": {"range": "[500000, 5000000)", "label": "Large"},
      "mega": {"range": "[5000000, inf)", "label": "Mega"}
    }
  },
  "api_usage": {
    "endpoints": [
      {"name": "search.list", "calls": 90, "bucket": "search_list", "dailyLimit": 100, "remaining": 10}
    ],
    "general_pool_units": 0,
    "total_budget_used_pct": 0.9
  },
  "verification": {
    "gates": {
      "V01_all_queries_returned": {"status": "PASS", "detail": "30/30 queries returned at least one result"},
      "V02_gap_score_computed": {"status": "PASS", "detail": "gap_score computed for all 30 queries using formula"},
      "V03_api_usage_tracked": {"status": "PASS", "detail": "90 search.list calls recorded"},
      "V04_threshold_applied": {"status": "PASS", "detail": "gap threshold >= 0.30 applied"},
      "V05_output_schema_valid": {"status": "PASS", "detail": "Output matches data/SCHEMA.json"}
    },
    "all_pass": true,
    "next_stage": "stage_2_channel_curation"
  },
  "data": {
    "summary": {...},
    "channels": [...],
    "queryAnalysis": [...]
  }
}
```

### Verification Gates

| Gate | Check | Fail Action |
|------|-------|-------------|
| V01 | All queries returned ≥1 result | Rerun failed queries individually |
| V02 | gap_score computed for every query | Flag missing formulas, do not publish |
| V03 | API usage logged in report | Do not proceed until logged |
| V04 | Gap threshold applied (≥0.30 = gap) | Reclassify without threshold |
| V05 | Output JSON matches `data/SCHEMA.json` | Fix schema mismatch, do not publish |

### API Usage Tracker
Before publishing any report, confirm:

- [ ] search.list calls counted and logged
- [ ] General pool units counted and logged  
- [ ] Remaining daily budget calculated
- [ ] Total budget used percentage calculated
- [ ] Entry added to `data/api-usage-log.csv`

---

## Stage 2: Channel Curation

### Inclusion Criteria
| Criterion | Check |
|-----------|-------|
| English language | Audio is English (defaultAudioLanguage=en) or has English subtitles |
| Documentary format | Teaching/philosophy, not vlog/reaction/shorts |
| India-focused | Source material is India-based or India-focused |
| Mature channel | ≥ 20 videos published (hits AND misses) |
| Active | At least 1 video in last 6 months |
| Tantra niche | Content covers tantra, Kashmir Shaivism, related philosophy |

### Channel Size (continuous feature, not bucket)
Channel size is `log10(subscriberCount)` used as a continuous feature in models. For reporting only, use the tiers defined in Stage 1 method.

### Verification Gates
| Gate | Check |
|------|-------|
| V06 | All channels pass inclusion criteria |
| V07 | Channel list has 20-40 entries |
| V08 | Each channel has ≥20 videos |
| V09 | Each channel has content in tantra niche |
| V10 | Channel metadata fetched (subs, video count, country) |

---

## Stage 3: Video Harvest

### Method
- Per channel: pull ALL uploads from last 12 months via `playlistItems.list` + `videos.list`
- If a channel has >100 videos in 12 months, random sample of 100
- For each video: collect all fields from `snippet`, `contentDetails`, `statistics`, `status`

### Breakout Score
```
breakout_score = (viewCount / ageDays) / channel_median_views_per_day
```
- `ageDays = max(1, today - publishedAt in days)`
- `channel_median_views_per_day = median of (viewCount / ageDays) for all videos from this channel in the 12-month window`
- Classification: top quartile = breakout, bottom half = baseline, middle discarded

### Verification Gates
| Gate | Check |
|------|-------|
| V11 | All channel uploads fetched |
| V12 | breakout_score computed for every video |
| V13 | breakout_score formula documented |
| V14 | Age normalization applied (viewCount / ageDays) |
| V15 | No video selected on outcome (full sample, not top-N) |

---

## Stage 4: Feature Extraction

### Title Features (local regex, zero cost)
| Feature | Implementation |
|---------|---------------|
| titleLengthChars | `title.length` |
| titleLengthWords | `title.split(' ').length` |
| hasQuestion | `title.includes('?')` |
| hasColon | `title.includes(':')` |
| startsWithNumber | `/^\d+/.test(title)` |
| powerWordCount | Dictionary match |
| hasDirectAddress | Contains you, your, youre |
| hasCuriosityGap | Starts with the, contains this is why, the reason |
| emotionalValence | Positive/negative word list match |

### Thumbnail Features (LLM vision, validate first)
See `highsignalspec.md` for prompt template.

### Hook Classification (transcript first 150 words)
See `highsignalspec.md` for taxonomy.

### Verification Gates
| Gate | Check |
|------|-------|
| V16 | Title features extracted for all videos |
| V17 | Thumbnail LLM call agreement ≥80% with hand-check (50 sample) |
| V18 | Hook LLM call agreement ≥80% with hand-check (50 sample) |
| V19 | Features stored in D1 table `niche_intelligence` |

---

## Stage 5: Model Training + Gap Map

### Models
1. Logistic regression: `is_breakout ~ gap_score + topic + log_subs + duration + title_has_question`
2. Feature importance ranking: which features carry signal
3. Gap map: topics sorted by `gap_score * breakout_rate`

### Gap Map Update
Published to `data/gap-map-latest.json`. Schema:

```json
{
  "report": {"id": "gap-map-{date}", "type": "gap_map"},
  "method": {"formulas": {...}},
  "topics": [
    {
      "topic": "Bhairava tantra explained",
      "cluster": "deity",
      "gap_score": 1.0,
      "uk_gap": true,
      "breakout_rate": null,
      "opportunity_score": null,
      "recommended_title_format": null,
      "recommended_thumbnail_style": null,
      "recommended_duration_min": null
    }
  ],
  "api_usage": {...},
  "verification": {"gates": {...}, "all_pass": true}
}
```

### Verification Gates
| Gate | Check |
|------|-------|
| V20 | Model trained on feature store data |
| V21 | Feature importance ranking computed |
| V22 | Gap map published with opportunity scores |
| V23 | API usage tracked for all stages |
| V24 | All previous gates still passing |

---

## Standardized Defaults

| Parameter | Default | Rationale |
|-----------|---------|-----------|
| Time window | Last 12 months (rolling) | Eliminates age confound, captures full content lifecycle |
| Queries per report | 30 | Fits in daily search budget (30 × 3 regions = 90/100) |
| Results per query | 15 | Top of search is what users see |
| Gap threshold | ≥ 0.30 | Below this, gap is too small to act on |
| Min channel videos | 20 | Need enough data for within-channel comparison |
| LLM validation sample | 50 | Enough for 80% confidence in agreement rate |
| Retry limit | 3 per gate | Matches Hermes pipeline convention |
| Channel count per curation | 20-40 | Enough for generalization, feasible to harvest |

---

## API Usage Tracking

Every report must include an `api_usage` block. A cumulative log is kept at `data/api-usage-log.csv`:

```csv
date,report_id,endpoint,calls,bucket,daily_remaining
2026-07-21,underserved-claim-test-2026-07-21,search.list,90,search_list,10
```

Before publishing any report, the log must be updated and verified (V03 gate).

## Schema Validation

All report JSON files must conform to `data/SCHEMA.json`. The schema defines:

- Required fields per report type
- Allowed values for enumerated fields (e.g. `channel_visibility`)
- Type constraints (e.g. `gap_score` must be float 0-1)
- Structural requirements (e.g. `verification.gates` must include all expected gate keys)

To validate:
```bash
# Use python to validate against schema
python3 -c "
import json
with open('data/reports/test-report.json') as f:
    report = json.load(f)
with open('data/SCHEMA.json') as f:
    schema = json.load(f)
# Validate required fields
errors = []
for field in schema['required']:
    if field not in report:
        errors.append(f'Missing required field: {field}')
for gate_name, gate_spec in schema['verification']['gates'].items():
    if gate_name not in report.get('verification', {}).get('gates', {}):
        errors.append(f'Missing verification gate: {gate_name}')
print('PASS' if not errors else 'FAIL: ' + ', '.join(errors))
"
```

## Quick Start

```bash
# Run underserved claim test
npm run test:underserved-claim

# Validate output
python3 scripts/validate-data-report.py data/reports/underserved-claim-test-YYYY-MM-DD.json

# Check API usage
cat data/api-usage-log.csv

# Curate channels (manual + search)
# See highsignalspec.md Stage 2

# Full pipeline
npm run pipeline:full
```

Run scripts defined in `package.json`:
```json
{
  "test:underserved-claim": "node scripts/test-underserved-claim.mjs",
  "validate:data-report": "python3 scripts/validate-data-report.py",
  "pipeline:full": "node scripts/run-full-pipeline.mjs"
}
```
