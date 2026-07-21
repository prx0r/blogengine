# Hermes Operations Manual — Dataset Engines & Build Phases

**Research Proposals:** Each engine has a detailed proposal in `pipelines/proposals/`. Proposals P1-P8 define falsifiable tests, methodology, and validation gates for hardening each raw dataset into a production engine.

## How This Works

Every dataset is raw material. Processing turns it into a **reusable engine** — a subroutine Hermes calls by name. Once built, it serves all farms.

```
RAW DATASET → PROCESSING → ENGINE → Hermes calls it via function/API
```

---

## The Engines (Built Once, Used by All Farms)

### E1: Headline Engine
**Dataset:** Upworthy Research Archive (122 MB, 32K A/B tests, causally identified)

**Processing:**
1. Extract per-feature win rates from pairwise A/B data
2. Train logistic regression on feature-difference vectors
3. Generate Bayesian posteriors for each feature coefficient
4. Package as: `score_title(title_candidate) → P(win)`

**Current state:** ✅ v0 done — 52.54% holdout accuracy (FAIL gate 0.55)
**Next:** Holdout replication, experiment-level bootstrap (fix pair-construction issue)

**Hermes calls it:**
```
headline_engine.score(topic_description, audience="western") → [{ title, p_win }]
```

---

### E2: Gap Engine
**Dataset:** YouTube Search API (100 calls/day free tier)

**Processing:**
1. Query `search.list` for same topic across IN, US, GB regions
2. Compute `gap_score = in_only_channels / total_in_channels`
3. Track weekly to filter noise from signal
4. Package as: `gap_score(topic) → [0, 1]`

**Current state:** ✅ Gap pattern confirmed (16/30 queries ≥ 0.30). Daily collection running.
**Next:** Compute week-over-week Spearman r when 14-day collection finishes

**Hermes calls it:**
```
gap_engine.score(topic) → { gap_score, uk_gap, in_only_channels, total_channels }
```

---

### E3: Question Engine
**Dataset:** Reddit Pushshift (217 files, ~84 GB raw, ~500 MB filtered for 30 subs)

**Processing:**
1. Extract submissions from 30 subreddits across 5 roles
2. Cluster titles by embedding → topic clusters
3. Compute per-cluster: frequency, persistence (years active), cross-subreddit spread
4. Detect language drift (definitional → practical → troubleshooting phases)
5. Compute specialist-mass translation gap
6. Package as: `questions(topic) → { clusters[], drift_phase, translation_gap }`

**Current state:** 🔄 Submissions data on R2. Comments uploading. Proposals 2 and 7 ready to run.
**Next:** Run Proposal 2 (recurring questions) + Proposal 7 (language drift) — same embedding pass

**Hermes calls it:**
```
question_engine.recurring(niche, subreddit_panel) → [{ topic, frequency, persistence, spread }]
question_engine.language_drift(topic) → { phase, transition_year, optimal_window }
question_engine.translation_gap(topic) → { semantic_distance, term_overlap, gap_score }
```

---

### E4: Controversy Engine
**Dataset:** Reddit comments (requires comments Parquet)

**Processing:**
1. Extract claim/stance pairs from high-scored comments and reply chains
2. Detect contradictions across threads on same topic
3. Map fault lines: which communities disagree, on what, with what sources
4. Package as: `controversy_map(topic) → [{ fault_line, positions[], evidence[] }]`

**Current state:** ❌ Blocked on comments data upload
**Next:** Claim/stance extraction pipeline after comments Parquet finishes

**Hermes calls it:**
```
controversy_engine.map(topic) → [{ claim, positions[], communities[], consensus_level }]
```

---

### E5: Gateway Engine
**Dataset:** Wikimedia Clickstream (4.2 GB, Wikipedia navigation paths)

**Processing:**
1. Extract prev_id → curr_id click pairs for relevant topics
2. Build gateway graph: for each target topic, which entities lead to it?
3. Score gateways by: familiarity (Google Trends volume) × gateway_strength (click ratio)
4. Package as: `gateways(target_topic) → [{ gateway, familiarity, strength, score }]`

**Current state:** ❌ Not started. Raw data in R2, needs processing.
**Next:** Download → parse → build gateway graph → D1 lookup table

**Hermes calls it:**
```
gateway_engine.find(target_topic) → [{ entity, familiarity, strength, score }]
```

---

### E6: Trend Engine
**Datasets:** Google Trends API + Global Trending (26.4 GB) + Wikipedia pageview API

**Processing:**
1. Google Trends: query volume over time for any topic → velocity + seasonality
2. Global Trending: cross-country diffusion patterns, IN→US lag times
3. Wikipedia pageviews: topic-level pageview velocity (free, no auth)
4. Package as: `trend(topic) → { google_velocity, trending_regions[], wiki_velocity }`

**Current state:** 🟡 Google Trends basic queries work. Global Trending not extracted. Wikipedia = free, no download needed.
**Next:** Extract Global Trending tarball, build Wikipedia pageview cron

**Hermes calls it:**
```
trend_engine.velocity(topic) → { 30d_change, yoy_change, seasonal_peak }
trend_engine.diffusion(topic) → { origin_region, current_regions[], lag_days }
```

---

### E7: Breakout Engine
**Dataset:** YouNiverse (3.2 GB, 136K channels, 72M videos, 2005-2019)

**Processing:**
1. Per-channel OLS: `log(views) ~ log(age_days)` → residual = breakout score
2. Strip channel momentum via two-stage residual
3. Ordinal labels: extreme/strong/normal/weak
4. Package as: `breakout(channel, topic_window) → { topics, breakout_scores[], channel_baseline }`

**Current state:** ✅ A1-A3 done (44% label difference — differentiated, not validated)
**Next:** REDO as Tier 1 — validate OLS residual against future views (weeks 5-8)

**Hermes calls it:**
```
breakout_engine.validate(topic) → { breakout_probability, confidence, similar_channels[] }
```

---

### E8: Visual Engine
**Datasets:** Met Museum Open Access (303 MB) + Art library (904 entries) + DPLA

**Processing:**
1. Embed all artworks by CLIP or similar
2. Tag by tradition, motif, style, concept
3. Match topic embedding → nearest artworks
4. Package as: `visuals(topic_description) → [{ image_url, artist, concept_match, confidence }]`

**Current state:** 🟡 341/904 art entries tagged. Visual matching not yet built.
**Next:** Tag remaining 563 art entries, build embedding similarity search

**Hermes calls it:**
```
visual_engine.find(topic_description, count=5) → [{ url, motif, concept_match, confidence }]
visual_engine.thumbnail(topic) → [{ composition_candidates[], predicted_ctr }]
```

---

### E9: Source Engine
**Datasets:** SARIT (204 MB), Muktabodha (89 MB), GRETIL (283 MB), Stack Exchange (337 MB), RO library (153 ROs)

**Processing:**
1. Index all source texts by concept, tradition, author
2. RO library = pre-compiled scholarly answers with provenance
3. Stack Exchange = community-validated explanations in audience language
4. Package as: `sources(topic) → { primary_texts[], commentaries[], community_explanations[] }`

**Current state:** ✅ Raw corpora on R2. 153 ROs exist (43 ready for essay).
**Next:** Build unified source index across all corpora

**Hermes calls it:**
```
source_engine.primary(topic) → [{ passage, text_name, verse_ref }]
source_engine.ro(topic) → { ro_id, body[], coverage{}, gaps[] }
source_engine.stack_exchange(topic) → [{ question, answer, score, subreddit }]
```

---

### E10: Decision Ledger
**Dataset:** Pipeline outcomes (self-generated)

**Processing:**
1. Every production decision recorded: inputs, expected outcome, actual outcome
2. Immutable append-only log
3. Cross-farm: compare predictions across niches
4. Package as: `ledger.query(predicate) → [{ decision, prediction, outcome, delta }]`

**Current state:** ❌ Not built. Schema exists in vision doc.
**Next:** Create D1 tables: evidence_ledger, claims, decision_ledger, outcome_ledger

**Hermes calls it:**
```
ledger.record(decision, expected, actual, confidence) → entry_id
ledger.evaluate(mode="opportunity_formula") → { accuracy, calibration, bias }
```

---

## Build Phases

### Phase 0: Foundation (COMPLETE)
- Hermes installed + Telegram gateway running
- R2 credentials configured
- Farm template code exists (untested)
- Headline Engine v0 running (52.54%, gate FAIL)
- Breakout Engine A1-A3 done
- Gap Engine confirmed, daily collection running
- 153 ROs, 1,917 works, 1,796 essays, 904 art entries
- Reddit submissions on R2

### Phase 1: Immediate (This Week)
- [ ] **Question Engine** — Run Proposals 2 + 7 (same embedding pass, submissions only)
- [ ] **Trend Engine** — Extract Global Trending tarball, build Wikipedia pageview cron
- [ ] **Headline Engine v1** — Holdout replication, fix pair-construction issue
- [ ] **Source Engine** — Tag remaining 563 art entries

### Phase 2: Short Term (Next 1-2 Weeks)
- [ ] **Gateway Engine** — Process clickstream data → gateway graph → D1
- [ ] **Visual Engine** — Build art embedding similarity search
- [ ] **Controversy Engine** — Requires comments Parquet upload to complete
- [ ] **YouTube API client** — Write `lib/youtube.ts` (biggest blocker to farm deployment)
- [ ] **Farm Worker deployment** — Deploy first farm (tantra), run daily research

### Phase 3: Medium Term (2-4 Weeks)
- [ ] **Decision Ledger** — Create D1 tables for all 4 ledgers
- [ ] **Breakout Engine v2** — Validate OLS residual against future views (Tier 1)
- [ ] **All engines integrated** — Hermes calls each by name in the production pipeline
- [ ] **First video through full pipeline** — End-to-end test

### Phase 4: Production (Ongoing)
- [ ] Publish weekly on validated pipeline
- [ ] Analytics feedback → engine posteriors update
- [ ] Cross-farm genome emerges (abstracted patterns across niches)
- [ ] New farms spin up from template (each needs its own subreddit panel + source library)

---

## Quick Reference: Dataset → Engine → Status

| Dataset | Engine | Status | Hermes Call |
|---------|--------|--------|-------------|
| Upworthy Archive | E1: Headline | ✅ v0, needs v1 | `headline_engine.score()` |
| YouTube API | E2: Gap | ✅ Pattern confirmed | `gap_engine.score()` |
| Reddit Pushshift | E3: Question | 🔄 Submissions on R2 | `question_engine.recurring()` |
| Reddit Comments | E4: Controversy | ❌ Uploading | `controversy_engine.map()` |
| Wikimedia Clickstream | E5: Gateway | ❌ Not started | `gateway_engine.find()` |
| Google Trends + Global Trending | E6: Trend | 🟡 Partial | `trend_engine.velocity()` |
| YouNiverse | E7: Breakout | ✅ A1-A3 done | `breakout_engine.validate()` |
| Met Museum + Art library | E8: Visual | 🟡 341/904 tagged | `visual_engine.find()` |
| SARIT + Muktabodha + GRETIL + Stack Exchange | E9: Source | ✅ Corpora loaded | `source_engine.ro()` |
| Pipeline outcomes | E10: Ledger | ❌ Not built | `ledger.record()` |

---

## How Hermes Runs the Pipeline

```python
# Pseudocode — Hermes calls these in sequence for each topic

def produce_video(topic, farm):
    # Stage 1: Discover
    questions = question_engine.recurring(farm.niche, farm.subreddit_panel)
    drift = question_engine.language_drift(topic)
    
    # Stage 2: Validate
    gap = gap_engine.score(topic)
    trend = trend_engine.velocity(topic)
    breakout = breakout_engine.validate(topic)
    
    if gap.score < 0.30:
        return SKIP("Topic not underserved")
    
    # Stage 3: Package
    titles = headline_engine.score(topic)
    gateway = gateway_engine.find(topic)
    controversy = controversy_engine.map(topic)
    
    # Stage 4: Research
    ro = source_engine.ro(topic)
    if not ro:
        ro = source_engine.compile(topic)  # RO_COMPILER
    primary = source_engine.primary(topic)
    explanation = source_engine.stack_exchange(topic)
    
    # Stage 5: Script
    visuals = visual_engine.find(topic)
    script = script_generator.assemble(ro, controversy, titles, gateway, visuals)
    
    # Stage 6: Produce
    audio = audio_generator.generate(script)
    video = renderer.render(script, visuals, audio)
    
    # Stage 7: Publish
    video_id = trypost.publish(video, titles[0])
    ledger.record(topic, video_id, expected={...})
    
    return video_id
```

This is the canonical sequence. Every engine is optional — if data isn't available, Hermes skips that step and uses the next best signal. Only the Gap Engine gate (≥0.30) is blocking.
