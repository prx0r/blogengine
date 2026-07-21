# Farm Implementation Plan — Master Document

## Abstract

Cloudflare-native intelligence and content pipeline for English-language tantra documentary channels. Validates topics through open research datasets, generates gap maps via structured YouTube API queries, produces video treatments through AI Workflows, and publishes to YouTube — all for ~$14/month. Parameterized as a "farm template" cloneable for any niche.

---

## Research Hypothesis

Indian creators and audiences validate subjects, figures, and narratives poorly translated into Western documentary conventions. The opportunity is identifying culturally proven subjects and repackaging them around universal curiosity.

### Three Gap Types

| Gap | Description | Detection |
|-----|-------------|-----------|
| Language | Hindi/Bengali video, no English equivalent | `regionCode=IN` + `defaultAudioLanguage` check |
| Format | Info exists only as lectures/podcasts/satsangs | Classify results by format type |
| Framing | Nobody searches technical terms, clicks universal narratives | Title archetype: technical vs transferable |

### Rejected Alternative

"YouTube deliberately suppresses Indian channels" — cannot prove with available tools (Search API unsuitable per arXiv:2506.11727, `regionCode` does not simulate personalized feeds).

---

## Methodology

### Core Principle: Within-Channel Breakout Analysis

Comparing across channels measures audience size, not content. Within-channel isolates the variable: what made THIS video hit vs that channel's own misses.

### Fix 1: Breakout Metric — OLS Regression Baseline, Not Age-Band Median

**Problem:** `floor(age_days/30)` bins with per-channel median. At ~8 videos/month per channel, a 30-day bin has 6-10 data points. For small channels, fewer. The baseline is noise, not signal.

**Solution:** Fit per channel:

```
log(views) ~ log(age_days)  (OLS)
breakout_score = residual = log(actual_views) - log(predicted_views)
```

This uses every video to inform the curve instead of sparse bins. It naturally handles front-loaded, decaying accumulation that a linear age-band comparison doesn't capture.

**Fallback:** Age-banding only for channels with <20 videos (too small for stable OLS).

### Fix 2: Strip Channel Momentum Before Labeling

**Problem:** If a channel grew 3x in subscribers over the 12-month window, videos from months 10-12 look like "breakouts" against the whole-window median solely because the channel got bigger. That's not signal — it's finding "growth" and calling it "topic worked."

**Solution:** Two-stage residual:

```
Step 1: residual_1 = log(views) - f(log(age_days))     # age-normalized (OLS per channel)
Step 2: residual_2 = residual_1 - g(calendar_time)        # strip momentum trend
```

Then ordinal labels (extreme/strong/normal/weak) from `residual_2`. This ensures breakout labels reflect content quality, not channel growth trajectory.

### Breakout Labels (Ordinal)

| Percentile | Label | Use |
|------------|-------|-----|
| Top 10% | Extreme breakout | Model training target |
| 75-90% | Strong | Secondary target |
| 25-75% | Normal | Baseline |
| Bottom 25% | Weak | Inverse signal |

Do not discard the middle 25%.

### Why Not Regex Title Features as Primary Signal

Multimodal features (arXiv:1807.05959) outperform individual classes. The model should test:

```
Outlier ~ topic + channel_baseline + channel_momentum + duration + title_semantics + thumbnail_semantics
```

Not: `Outlier ~ question_mark + colon + power_words`

Title analysis should use semantic axes (known entity, universal problem, mystery, conflict, prohibition, technical density, epistemic posture) rather than regex counts.

### Sampling

All uploads from last 12 months per channel (full population). If >100 in window, random sample of 100. Never top 100 by views — selects on outcome. Fixed 12-month window plus age normalization gives every video the same maximum exposure time.

---

## Falsifiable Assumptions (Three Layers)

### Layer 1: Structural — Testable with YouNiverse this week

| # | Assumption | Falsified If | Test | Priority |
|---|-----------|-------------|------|----------|
| 1 | Within-channel OLS residual predicts breakout better than cross-channel raw views | Residual has no predictive power for future performance; channel size dominates | Regress day-28 views on OLS residual vs raw views. Compare R^2. | Do first |
| 2 | Adding format_class to OLS improves over age-only | Delta R^2 from adding format_class < 0.01 | Nested regression on YouNiverse | Do first |
| 3 | Channel momentum must be stripped; >15% of top-quartile labels flip after correction | <15% of breakout labels change after removing calendar-time trend | Compare label assignments before/after; threshold set at 15% | Do first |

### Layer 2: Data Source — Testable with API quota

| # | Assumption | Falsified If | Test | Priority |
|---|-----------|-------------|------|----------|
| 4 | Weekly rolling gap score is stable enough (API noise < signal) | Spearman r < 0.3 between week-over-week gap scores for same queries | Collect 2 weeks of daily searches (672 calls, free quota), compute week-over-week rank correlation | Parallel with Layer 1 |
| 5 | Wikipedia pageview velocity (rate of change, not raw level) correlates with YouTube gap scores | Spearman r < 0.2 between pageview z-score and gap score for 20 topics | Compute week-over-week pageview delta (free API), correlate with gap map scores | Parallel with Layer 1 |
| 6 | The 54 IN-only channels from Stage 1 are real, not API artifacts | Jaccard similarity < 0.5 when re-running the same 30 queries | Re-run Stage 1 test; compare channel lists | Parallel with Layer 1 |

### Layer 3: Causal — Only testable with own production. All three draw from the same n=10 sample and must be designed as one experiment.

**Critical constraint:** Assumptions 7, 8, and 9 all depend on the same first ~10 videos. They are not three independent tests — they are one underpowered test wearing three hats. Poor packaging could make gap score look useless (reject 7) when the real cause is 9. Fix: design the first 10 videos as a single structured experiment, not three incidental hopes.

**First 10 video experiment design:**

- Pick 10 topics spanning high and low gap scores (tests Assumption 7)
- Hold packaging quality consistently good across all 10 (removes confound on 7, gives baseline for 9)
- Use fixed 8-beat format on all 10 (already decided; treat 8 as "where in the beat structure does retention drop," not "beat vs no-beat" — no contrast group exists)
- Run YouTube native Test & Compare on 2-3 of the 10 to isolate Assumption 9

| # | Assumption | Falsified If | Caveat |
|---|-----------|-------------|--------|
| 7 | High gap score + high replication predicts above-baseline performance on our channel | Top 5 gap topics all perform below channel median at 28 days | **Confounded by Assumption 9** — poor packaging could produce false rejection. Mitigation: hold packaging consistent across all 10. |
| 8 | The 8-beat structure drives retention | Retention curves show uniform drop-off regardless of beat placement; no change at beat boundaries | No control group (videos without 8-beat structure exist only later). Test is "where in the beats does retention drop," not "does the structure work at all." |
| 9 | Packaging (title+thumbnail) is a lever we can tune | Native A/B test shows no CTR difference across 3 variants for same video | **Likely underpowered** — brand-new channel may not get enough impressions for the test to resolve. A null result means "inconclusive, need more traffic," not "packaging doesn't matter." Do not read absence of evidence as evidence of absence. |
| 10 | Historical corpus priors transfer to our channel | Our own first 10 videos systematically disagree with historical corpus direction | **n=10 is a coin flip against n=10,000.** Don't treat as binary agree/disagree. Bayesian framing: own small sample updates the historical prior, doesn't overturn it. Need n=30-50 of own videos before a disagreement is worth trusting over the corpus. |

### Execution Order

```
WEEK 1: Layer 1 (YouNiverse — already in R2)
  Validate breakout metric before writing pipeline code.
  If Assumptions 1-3 fail, everything downstream needs rework.

WEEK 1-2: Layer 2 (API quota — parallel, doesn't block)
  Assumption 4 resolves daily-vs-weekly with data.
  Assumption 5 validates Wikipedia as signal.
  Assumption 6 checks whether Stage 1 data was real.

WEEK 2-4: Build pipeline (after Layer 1 confirmed)
  Research pipeline, Workers, D1 schema, farm template.

WEEK 4-14: Layer 3 (own production — slowest, most expensive)
  First 10 videos designed as one experiment.
  Bayesian update on historical priors, not binary confirmation.
  Native A/B tests on 2-3 videos (flagged as likely underpowered).
```

This order guarantees that the most expensive layer (own production) rests on validated foundations. If Layers 1 or 2 fail, we learn that before spending weeks on pipeline code or video production.---

### Primary: YouTube Data API v3

| Endpoint | Cost | Daily Limit | Use |
|----------|------|-------------|-----|
| `search.list` | 1 call | 100 (separate bucket) | Discovery, gap measurement |
| `videos.list` | 1 per 50 | 10,000 general | Stats, audio language |
| `channels.list` | 1 per 50 | 10,000 general | Channel metadata |
| `playlistItems.list` | 1 per call | 10,000 general | Upload harvest |
| `commentThreads.list` | 1 per call | 10,000 general | Comment mining |

### Secondary: Open Research Datasets

| Dataset | Size | What It Validates |
|---------|------|-------------------|
| YouNiverse | 3.4 GB | Breakout metric selection, channel size effects, title signal |
| Global Trending | 26.4 GB | Cross-country diffusion, IN-to-US lag, title archetypes |
| YTCommentVerse | 10.8 GB | Comment intent taxonomy, language-as-geography proxy |

### Tertiary: Wikipedia Pageview Velocity (replaces arXiv/Crossref signal)

**Problem:** arXiv/Crossref/OpenCitations bias toward STEM. Tantric studies is a humanities field with thin, slow-moving citation graphs. Weighting opportunity scores on STEM-biased academic signals is measuring almost nothing for this niche.

**Solution:** Wikipedia pageview velocity on specific deity/text/lineage/figure names:

```
pageview_signal = (pageviews_last_30_days) / (pageviews_same_period_last_year)
```

For topics like "Kali," "Kaula," "Abhinavagupta," "Chinnamasta," "Bhairava" — spiking pageviews indicate a subject entering Western curiosity. Wikipedia's API is free, no auth required.

```python
import requests
params = {
    "action": "query",
    "format": "json",
    "titles": "Kali|Kaula|Abhinavagupta|Chinnamasta|Bhairava",
    "prop": "pageviews",
    "pvipdays": 30
}
response = requests.get("https://en.wikipedia.org/w/api.php", params=params)
```

### Academic Signal Stack (de-emphasized, domain-specific only)

Crossref and OpenCitations kept for publication/citation counts but weighted at <5% of opportunity score. Only used when a topic has identifiable academic literature (e.g., consciousness science, active inference). For tantric studies subjects, Wikipedia pageview velocity is the primary signal.

---

## Fix 3: Define western_demand

**Problem:** Used in the opportunity formula but never defined or sourced.

**Solution:** Google Trends interest-over-time for each topic's core search terms, geo-filtered to US+GB, `time=today%2012-m`, normalized 0-100 as Trends returns.

```python
# Uses pytrends (unofficial library)
from pytrends.request import TrendReq
pytrends = TrendReq(hl='en-US', tz=360)
pytrends.build_payload(kw_list=['Chinnamasta'], timeframe='today 12-m', geo='US')
data = pytrends.interest_over_time()
western_demand = data['Chinnamasta'].mean() / 100.0  # normalize 0-1
```

Free. No API key. Runs on the VPS or Workers as a scheduled task.

---

## Fix 4: Opportunity Score — Weighted Sum With Floor, Not Multiplicative

**Problem:** Multiplying 4-5 independently-estimated scores means if any one is a noisy near-zero, the whole score collapses. One shaky estimate kills real signal from the other three.

**Solution:** Weighted sum with each component clamped to [0.1, 1]:

```
topic_opportunity = 0.30 * clamp(gap_score) + 0.25 * clamp(language_lag) + 0.20 * clamp(breakout_rate) + 0.15 * clamp(western_demand) + 0.10 * clamp(pageview_signal)
```

Where `clamp(x) = max(0.1, min(1.0, x))`. No single input can zero out the score. A topic strong on 3 of 5 axes still scores meaningfully even if the other 2 are undetermined.

### Why Weighted Sum

| Component | Weight | Rationale |
|-----------|--------|-----------|
| `gap_score` | 0.30 | Largest — directly measures market gap |
| `language_lag` | 0.25 | Second — our primary edge (Hindi-to-English transfer) |
| `breakout_rate` | 0.20 | Confirms topic performs within existing channels |
| `western_demand` | 0.15 | Validates thesis: US/UK audiences actually search this |
| `pageview_signal` | 0.10 | Wikipedia interest as independent proxy |

---

## Fix 6: Hook Library — Backfill Once, Then Maintain

**Problem:** "Top 5 breakouts per day" accumulates a trickle. The hook library needs to be a reusable formula, not a slow drip.

**Solution:** Run hook classification once over the full historical corpus (Stage 0, all channels, all breakout-tier videos — however many hundred that is). Then top 5/day is ongoing maintenance to keep the library current.

```
One-time backfill: classify all existing breakout videos (~300-500)
  -> Build hook_type distribution per topic cluster
  -> Establish baseline: "tantra philosophy: 60% bold claim hooks break out"
  -> Publish to D1 hook_library table

Ongoing: classify top 5 daily breakouts
  -> Update hook_library rolling averages
  -> Flag novel hook types for manual review
```

---

## Architecture

### Component Rationale

| Need | Choice | Why |
|------|--------|-----|
| Compute | Workers ($5/mo) | Cheaper than Cloud Functions for volume |
| Storage | R2 ($0.015/GB) | No egress fees |
| Database | D1 ($0.75/GB) | Cloud SQL minimum $10/mo |
| AI inference | Workers AI ($0.011/1k) | Vertex AI ~$0.05/call |
| LLM gateway | AI Gateway (included) | Caching, fallback, cost tracking |
| Analytics | BigQuery ($5/TB) | Cloudflare has no equivalent |
| Containers | Cloud Run (free 2M req) | Cloudflare has no equivalent |

Cloudflare core: ~$14/mo. GCP credit ($300) for BigQuery + Cloud Run + optional training.

### Hermes as Cognitive Controller

Hermes chooses topics and requests approval. Workflows own the durable state machine.

```
Hermes: "Produce topic X using packet Y"
  -> Video Workflow: durable execution (retries, state, persistence)
    -> Cloudflare tasks + External compute (VPS render)
```

### Queue Topology

```
research_ingest   <- Research cron pushes opportunities
external_jobs     <- VPS render worker pulls FFmpeg jobs
dead_letter       <- Failed messages for manual review
```

Workflows handle state within Cloudflare. Queues only needed across compute boundaries.

### Why Not FLUX for Thumbnails

Brand edge is authentic historical artwork + crisp typography. AI thumbnails undermine credibility. FLUX only for backgrounds/concepts. Thumbnails composed deterministically from public domain art, safe typography, single focal object.

---

## Pipeline Stages

### Stage 0: Dataset Validation (one-time, in progress)

Download YouNiverse, YTCommentVerse, Global Trending to R2. Run regressions:

| Question | Method |
|----------|--------|
| How much does channel size explain views? | Regress log(views) on log(subs) |
| Does OLS residual beat age-band median? | Compare both formulas on historical data |
| Do title features add signal beyond channel? | Delta R^2 from nested regression |
| Which breakout metric predicts best? | Compare 4 predictors against day-28 outcome |

**Also:** Run hook library backfill on all breakout-tier videos across all channels.

### Stage 1: Daily Research (Cron 6am)

Daily = harvest known channels only. Gap computation is weekly (see below).

```
1. playlistItems.list + videos.list -> new uploads from CHANNEL_IDS
2. Compute breakout scores (OLS residual, age-band fallback for <20 videos)
3. Strip momentum trend via calendar-time regression
4. Thumbnail stratified sample: 25% extreme/strong, 25% normal, 25% weak, 25% uncertain
5. Cheap features on all, LLaVA only on stratified sample
6. Hook classification on top 5 breakouts (maintain hook library)
7. Store raw search results (48 queries + 12 velocity) for weekly computation
```

API budget: 0 search calls (collection only, computation is weekly).

### Weekly Gap Computation (Cron Monday noon)

```
1. Read last 7 days of raw search results
2. Compute gap map using rolling window (this week vs last week)
3. Compute opportunity scores (weighted sum with clamp)
4. Push high-opportunity topics to Queue
5. Wikipedia pageview velocity for top topics
6. Hypothesis testing against historical corpus
```

Rationale: Daily gap deltas in a slow-moving niche like tantra/Indology measure sampling noise from YouTube's search ranking jitter, not real signal. A rolling 7-day window filters this. If farm expands to a fast-moving niche (news, tech), revisit daily computation.

### Stage 2: Topic Opportunity Detection

```
topic_opportunity = 0.30 * clamp(gap_score)
                  + 0.25 * clamp(language_lag_score)
                  + 0.20 * clamp(breakout_rate)
                  + 0.15 * clamp(western_demand)       # Google Trends US+GB
                  + 0.10 * clamp(pageview_signal)       # Wikipedia velocity
```

Where `clamp(x) = max(0.1, min(1.0, x))`.

### Fix 7: Research Pack — Sourced Claims Before Script Writing

**Problem:** The fact-check gate operated on treatment, but treatment and script-with-sources shouldn't be the same document. You can't reverse-engineer "was this claim sourced" out of finished narration.

**Solution:** Add a Research Pack stage between HO and treatment/script. This is a formal artifact containing sourced claims with exact locators. The fact-check gate operates on this, not on prose.

```
HO → Research Pack (sourced claims) → Treatment → Script → Video
```

Research Pack schema:
```json
{
  "research_pack_id": "RP-{slug}",
  "claims": [
    {
      "claim": "The Kapalikas carried skull-topped staffs as a deliberate inversion of caste markers.",
      "certainty": "scholarly_consensus",
      "sources": [
        {
          "source_id": "work:example",
          "locator": "Chapter 3, p. 45-47",
          "secondary": "Davidson 2002, Indian Esoteric Buddhism"
        }
      ]
    }
  ],
  "fact_check": {
    "all_claims_sourced": true,
    "gates_passed": ["F01", "F02", "F03", "F04"]
  }
}
```

This separates the sourcing concern (Research Pack) from the narrative concern (treatment/script), so the fact-check gate has a canonical artifact to validate before prose is written.

### Stage 3: Content Production (Workflows)

```
Step 1: research_gap(topic_id) -> D1 query
Step 2: build_research_pack -> sourced claims with exact locators
Step 3: FACT_CHECK gate (every claim must have a source, gates F01-F04)
Step 4: WAIT_FOR_APPROVAL (human reviews research pack + sources)
Step 5: generate_treatment -> AI Gateway ($0.02)
Step 6: write_script -> AI Gateway + validation gates ($0.05)
Step 7: WAIT_FOR_VOICEOVER (human records audio. Real bottleneck for all farms.)
         Dashboard shows script with recording interface. Beat timing happens AFTER
         audio exists — waveform drives pacing, not pre-planned duration.
Step 8: create_thumbnail -> deterministic composition ($0)
Step 9: push_render_job -> Queue -> VPS FFmpeg -> R2
Step 10: WAIT_FOR_RENDER
Step 11: publish -> YouTube API (1,600 quota), requires approval. 
         Publishing autonomy: NEVER for historical/religious claims content.
         This is a permanently closed question, not a design tradeoff.
```

Each step idempotent: `video_id + step_name + input_hash + version`.

### Stage 4: Publication Gate

```
rendered -> qa_passed -> WAITING_FOR_PUBLISH_APPROVAL -> published
```

Never auto-publish. Historical/religious claims require human review with source checklist.

### Fix 8: Hypothesis Falsification Against Historical Corpus

**Problem:** "≥5 tests per hypothesis" at 1 video/week means testing a single hypothesis takes over a month. At that rate, the first few hypotheses take nearly a year.

**Solution:** Test hypotheses against the historical corpus first — the hundreds of other channels' videos already collected. Use a 3-state model (pending / confirmed / rejected) with confidence-weighted n, not more states.

```
For each hypothesis (e.g., "Question titles outperform statements"):
  1. Query historical corpus (all channels, all videos)
  2. Compute: mean(breakout_score) for question-title videos vs non-question-title
  3. t-test or Mann-Whitney U
  4. Record effect size, significance, n_tests, n_supporting, n_against
  5. Store as: { status: "confirmed", n_tests: 847, n_supporting: 523, n_against: 324 }

Then use own weekly production as CONFIRMATION of strong priors, not discovery.

| Hypothesis Source | Sample Size | Time to n>=5 |
|-------------------|-------------|--------------|
| Historical corpus (other channels) | Thousands of videos | Immediate |
| Own production (your channel) | 1 video/week | 5+ weeks |
```

State machine: `pending / confirmed / rejected`. No intermediate states. Confidence is conveyed by `n_tests` and `n_supporting/n_against` ratios, not by adding states that won't populate at 1 video/week.

---

## Content Strategy

Positioning: "Not how to practise dark tantra. Not everything is fake. But what these traditions claimed, why people believed them, and what history can verify."

Repeatable format (8 beats):
1. Frightening claim
2. Strongest image or story
3. What earliest text says
4. What later folklore added
5. Why practice made philosophical sense
6. What historians can verify
7. What modern channels get wrong
8. Why subject still matters

### Lane Priorities

Tier 1 (build identity): Cremation-ground religion, Forbidden goddesses, Investigations of famous claims.
Tier 2 (after identity set): Black magic history, Tantric objects, Dark temples.
Tier 3 (reach, not identity): Tantra/sex/taboo, Possession/exorcism.

---

## Verification System

Every stage has binary gates. All must pass before advancing.

| Stage | Gates | Key Checks |
|-------|-------|------------|
| Layer 1 | A01-A03 | OLS residual beats raw views (delta R^2 > 0), format_class adds signal, momentum strips >15% of labels |
| Layer 2 | B01-B04 | Weekly gap Spearman > 0.3, Wikipedia z-score correlates, Stage 1 replicates at Jaccard > 0.5, API logged |
| Stage 0 | V01-V05 | All queries returned, gap_score computed, API logged, schema valid |
| Stage 1 | V06-V10 | Channels pass criteria, 20-40 count, metadata fetched |
| Stage 2 | V11-V15 | Uploads fetched, OLS residual computed, momentum stripped, full sample |
| Stage 3 | V16-V19 | Title features extracted, thumbnail LLM >=80%, hook LLM >=80%, stored in D1 |
| Stage 4 | V20-V24 | Fact-check gate passed, model trained, gap map published, API tracked |
| Stage 5 | V25-V29 | Historical hypotheses tested, own production confirms priors, sources verified |

LLM validation: 50 hand-checked samples before trusting. >=80% agreement required.

### Fact-Check Gate

```
F01: Every historical claim has a traceable primary or academic secondary source
F02: Claims marked with certainty level (confirmed / consensus / traditional / disputed)
F03: No core factual claim lacks a source
F04: Sources verified against Crossref / Semantic Scholar / Wikipedia references
```

### First 10 Video Experiment Design Gates

```
E01: Topics span both high and low gap scores (tests Assumption 7 cleanly)
E02: Packaging quality held consistent across all 10 (removes confound on 7)
E03: Fixed 8-beat format on all 10 (Assumption 8: measure retention at beat boundaries)
E04: Native A/B test run on 2-3 videos (Assumption 9: flagged as likely underpowered)
E05: Bayesian framing, not binary (Assumption 10: n=10 cannot overturn n=10,000 corpus)
```

---

## Cost Summary

| Component | Monthly |
|-----------|---------|
| Workers Paid | $5.00 |
| R2 (40GB datasets) | $0.60 |
| Workers AI (research) | ~$3.00 |
| AI Gateway | Included |
| D1, Queues | Included |
| Stream (optional) | ~$0.10 |
| Browser Rendering | ~$5.00 |
| **Total** | **~$13.70** |

Per-video production: ~$0.25 + YouTube quota (1,600 units for videos.insert). At 1 video/week: ~$1/month + base = ~$14.70/month.

GCP credit ($300) separate: BigQuery for dataset analysis, Cloud Run for FFmpeg render.

## Farm Template

Parameterized by Tier A (must configure, requires human judgment) + Tier B (derived from data, fits automatically).

### Tier A — Configured per farm (6 items)

| Parameter | Type | Example (Tantra) | Example (Neuroscience) |
|-----------|------|-------------------|------------------------|
| `FARM_ID` | string | `tantra` | `neuroscience` |
| `CHANNEL_IDS` | string[] | `["UCxxx","UCyyy"]` | `["UCaaa","UCbbb"]` |
| `TOPIC_CLUSTERS` | object[] | `[{ name: "deity", terms: ["Kali","Bhairava"] }]` | `[{ name: "consciousness", terms: ["GNW","IIT"] }]` |
| `EVIDENCE_STANDARDS` | string[] | `["primary_text","academic_indology","museum_record"]` | `["peer_reviewed","registered_report","replication"]` |
| `FORBIDDEN_FRAMINGS` | string[] | `["science proves tantra","shocking = common","nonduality erases ethics"]` | `["overclaims mechanism","individuals = pathology"]` |
| `AUDIENCE_PROMISE` | string | `"Hidden history of Indian philosophy and consciousness"` | `"What consciousness research actually shows"` |

### Tier B — Derived from data (not manually configured)

| Parameter | Derivation Method |
|-----------|-------------------|
| `SCORING_WEIGHTS` | Fit from Stage 0 historical validation (same regression used for breakout metric) |
| `BLUEPRINT_PROMPT` | Selected from prompt library based on EVIDENCE_STANDARDS + AUDIENCE_PROMISE |

Tier B parameters are never set by hand. They come out of the farm's own dataset validation stage, the same way the breakout metric is selected.

```
farm-template/
├── wrangler.jsonc       <- D1, R2, Queue, AI bindings
├── src/
│   ├── cron/daily-research.ts
│   ├── workflows/produce-video.ts
│   ├── workers/api.ts
│   └── d1/schema.sql
└── package.json
```

Additional farm cost: ~$2/month for storage. Workers Paid covers unlimited farms.
