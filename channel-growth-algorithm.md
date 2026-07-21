# Channel Growth Algorithm — Master Spec

> **API Reference Docs:** `docs/api-ref/` contains the official YouTube Data API documentation:
> - Quota: `docs/api-ref/quota-calculator.md`
> - search.list: `docs/api-ref/search-list.md`
> - videos.list: `docs/api-ref/videos-list.md`
> - channels.list: `docs/api-ref/channels-list.md`
> - playlistItems.list: `docs/api-ref/playlistitems-list.md`
> - commentThreads.list: `docs/api-ref/commentthreads-list.md`
> - captions.list: `docs/api-ref/captions-list.md`
> - Video resource: `docs/api-ref/video-resource.md`
> - Channel resource: `docs/api-ref/channel-resource.md`

Machine-readable source document for AI execution. Every stage has binary gates. All gates in a stage must pass before advancing.

## Pipeline Overview

```
Stage 0: Niche Census
  → Stage 1: Underserved-Claim Check
    → Stage 2: Channel Curation
      → Stage 3: Video Harvest + Feature Extraction
        → Stage 4: Opportunity Detection
          → Stage 5: Treatment Generation
            → Stage 6: Production + Validation
              → Stage 7: Post-Release Learning
                → (loop back to Stage 4)
```

---

## Stage 0: Niche Census

### 0.1 Channel Universe Construction

Build three concentric sets:

**Set A — Direct Competitors** (15-25 channels)
- Same niche (tantra, Saivism, Sakta, yogis, Indian esotericism)
- English spoken or reliable English subtitles
- Documentary, explanatory, historical or teaching format
- India-based or India-focused source material
- At least 20 long-form uploads
- Active in last 6 months
- Exclude: Shorts farms, motivational clips, vlogs, one-viral-wonder channels

**Set B — Audience Competitors** (15-30 channels)
- Adjacent niches: Indian philosophy, Buddhism, yoga history, comparative mysticism, consciousness, occult history, academic religion
- Same format and language criteria

**Set C — Format Competitors** (10-20 channels)
- Any niche, same production format: narrated historical documentaries, philosophical video essays, investigative religious history
- Source of production and packaging patterns

Add feature: `competitor_type` ∈ {direct, audience, format}.

### 0.2 Data Collection

For every channel in all three sets, collect and store:

| Table | Columns | Update Frequency |
|-------|---------|------------------|
| channels | channel_id, name, subs, video_count, country, created_at, competitor_type, language | Weekly |
| videos | video_id, channel_id, title, published_at, duration, views, likes, comments, tags, description, thumbnails | Daily snapshots |
| video_snapshots | video_id, captured_at, views, likes, comments | Daily |
| search_snapshots | query, region, date, rank, video_id, channel_id | Weekly |
| topic_signals | topic, demand_score, supply_score, gap_score, date | Weekly |
| comment_clusters | video_id, cluster_topic, frequency, sample_comments | Weekly |

### Verification Gates

| Gate | Check | Fail Action |
|------|-------|-------------|
| V0_A | Set A has 15-25 channels | Search broader queries |
| V0_B | Set B has 15-30 channels | Expand adjacent niches |
| V0_C | Set C has 10-20 channels | Broaden format search |
| V0_D | Daily snapshots running for all channels | Fix snapshot script |
| V0_E | Each channel meets inclusion criteria | Remove and replace |

---

## Stage 1: Underserved-Claim Check

### 1.1 Topic Selection

For the chosen niche, generate 40-60 topic groups. Each group contains:

- The canonical term
- 2-4 synonyms or beginner-language formulations
- 2-4 problem/desire terms (not just identity terms)

Example:

```json
{
  "canonical": "Kashmir Shaivism",
  "synonyms": ["Trika philosophy", "nondual Shaivism", "Pratyabhijna school"],
  "problemTerms": ["reality is consciousness philosophy", "indian philosophy consciousness explained", "nonduality and the world"],
  "cluster": "philosophy"
}
```

### 1.2 Demand Measurement

For each topic, measure:

| Signal | Source | Weight |
|--------|--------|--------|
| Google Trends 5-year level (US+UK+CA+AU) | trends.google.com | 0.25 |
| Google Trends 90-day growth | trends.google.com | 0.20 |
| Geographic breadth (countries with interest) | trends.google.com | 0.10 |
| English Wikipedia pageviews (30-day) | Wikimedia Analytics API | 0.15 |
| Recent Reddit question frequency | reddit.com search | 0.10 |
| Comment request frequency across Set A+B | comment_clusters table | 0.10 |
| YouTube autocomplete presence | search suggest API | 0.05 |
| Related queries count | trends.google.com | 0.05 |

Demand score: `sum(signal × weight)` for each signal normalized 0-1.

### 1.3 Supply Measurement

For each topic, retrieve top 25-50 YouTube results (regionCode=US, relevanceLanguage=en, order=relevance). Classify each result:

- English or non-English
- Format: documentary, lecture, interview, vlog, short
- Published in last 24 months (boolean)
- Duration in seconds
- Current views
- Age-normalized outlier score: `log2((views + 100) / (channel median + 100))`
- Channel subscriber count
- Query match quality: exact, partial, tangential
- Production quality (1-5, manual or LLM)

### 1.4 Gap Score Calculation

```
z_demand = (demand_score - mean(demand_scores)) / std(demand_scores)
z_supply = (quality_adjusted_supply_count - mean(supply_counts)) / std(supply_counts)
gap_score = z_demand - z_supply
```

Classification:
- gap_score > 1.0: underserved (meaningful demand, weak supply)
- gap_score 0.5 to 1.0: possible gap (investigate manually)
- gap_score 0 to 0.5: terminology gap (demand exists under different terms)
- gap_score < 0: well-served (crowded or low demand)

### 1.5 Cross-Language Lead-Lag (Hindi-English)

For topics passing the gap threshold:
1. Search same topic in Hindi (regionCode=IN, remove relevanceLanguage filter)
2. Collect top 25 results
3. Calculate outlier scores for Hindi results
4. Count independent channels producing Hindi breakouts

```
language_lag_score = (hindi_outlier_count × independent_hindi_channels) / (1 + strong_english_videos)
```

Threshold: language_lag_score > 3.0 = strong transfer opportunity.

### Verification Gates

| Gate | Check | Fail Action |
|------|-------|-------------|
| V1_A | 40-60 topic groups generated | Expand synonym research |
| V1_B | Demand scores computed for all topics | Fix signal collection |
| V1_C | Supply scores computed for all topics | Run YouTube searches |
| V1_D | Gap scores computed and classified | Verify formula |
| V1_E | Language-lag computed for top gaps | Run Hindi searches |
| V1_F | API usage logged | Check api-usage-log.csv |

---

## Stage 2: Channel Curation

### 2.1 Channel Scoring

For each candidate channel, compute:

```
channel_value = (outlier_rate × log(subs) × recency_score × niche_relevance) / saturation_risk
```

Where:
- outlier_rate = recent breakouts / total recent uploads
- recency_score = 1 - (days_since_last_upload / 180)
- niche_relevance = % of videos in target niche (LLM classification)
- saturation_risk = 1 + (channel_videos_in_last_year / 50)

### 2.2 Selection Criteria (binary)

All must pass:
- English spoken or subtitled
- Documentary/teaching format (not vlog/reaction)
- ≥20 long-form uploads
- Active in last 6 months
- ≥60% content in or adjacent to target niche
- Not a Shorts farm or motivational clip channel
- Not dependent on one viral upload

### 2.3 Final Set

Select 20-40 channels minimum. Supplement with Set B and C channels as needed to reach floor. Add `competitor_type` feature to each.

### Verification Gates

| Gate | Check | Fail Action |
|------|-------|-------------|
| V2_A | 20-40 channels selected | Broaden search |
| V2_B | All pass binary criteria | Replace failed channels |
| V2_C | Channel metadata fetched | Run channels.list |
| V2_D | competitor_type assigned | Manual classification |

---

## Stage 3: Video Harvest + Feature Extraction

### 3.1 Full Population Harvest

For each curated channel:
- Pull ALL uploads from last 12 months via playlistItems.list + videos.list
- If >100 videos in window, random sample of 100
- Store every available field from snippet, contentDetails, statistics, status

### 3.2 Breakout Score

Age-normalized per channel:

```
age_days = max(1, today - publishedAt)
views_per_day = viewCount / age_days
channel_median_vpd = median(views_per_day for all videos from this channel in window)
breakout_score = views_per_day / channel_median_vpd
```

Classification: top quartile = breakout, bottom half = baseline, middle 25% = discarded.

Alternative (if age-band version performs better in backtest):

```
age_band = floor(age_days / 30)  // monthly bands
band_median = median(views for same-band videos from this channel)
outlier_score = log2((views + 100) / (band_median + 100))
```

Use whichever metric has higher Spearman correlation with day-28 performance (requires snapshot data).

### 3.3 Title Features

Extract via regex (zero cost):

| Feature | Implementation | Example |
|---------|---------------|---------|
| title_length_chars | `title.length` | 54 |
| title_length_words | `title.split(' ').length` | 9 |
| has_question | `title.includes('?')` | true |
| has_colon | `title.includes(':')` | false |
| starts_with_number | `/^\d+/.test(title)` | false |
| starts_with_question_word | `/^(What|Why|How|Who|When|Where|Is|Are|Do|Does)\b/i.test(title)` | true |
| power_word_count | dictionary match: secret, revealed, explained, hidden, truth, essential, ultimate, every, complete, real, actual, strange, dark, forbidden, dangerous, lost, ancient, forgotten, unknown | 1 |
| has_direct_address | `/you['r]?\b/i.test(title)` | true |
| has_curiosity_gap | `/^(the|this is why|the reason|what happens|the truth about)\b/i.test(title)` | false |
| sentiment_score | positive_words - negative_words / total_words | 0.2 |
| all_caps_word_count | `/^[A-Z]{2,}$/.test(word)` count | 1 |
| contains_number | `/\d+/.test(title)` | true |

### 3.4 Thumbnail Features

Via LLM vision call (cost ~$0.0005/image). First validate 50 samples against hand classification. Agreement must be ≥80% before full run.

| Feature | Options | Prompt |
|---------|---------|--------|
| has_text | true/false | "Does this thumbnail contain any visible text?" |
| text_content | string | "What text is visible in this thumbnail?" |
| composition_type | talking_head / text_overlay / split_screen / illustration / photo / mixed / diagram | "What is the primary visual composition of this thumbnail?" |
| color_temperature | warm / cool / neutral / high_contrast | "Describe the dominant color temperature:" |
| has_face | true/false | "Is there a human face visible?" |
| face_count | integer | "How many faces are visible?" |
| expression | urgent / curious / calm / serious / surprised / neutral / none | "What is the facial expression of the primary subject?" |
| style | photographic / 3d_render / 2d_illustration / text_only / collage / artwork / manuscript | "What visual style is this thumbnail?" |
| brightness | dark / medium / bright | "Rate the overall brightness:" |
| visual_complexity | low / medium / high | "How visually complex is this thumbnail?" |

### 3.5 Hook Classification

Pull the first 150 words of the video transcript via youtubetranscript.com (free, no quota). Classify via LLM.

| Hook Type | Definition | Example |
|-----------|------------|---------|
| bold_claim | Makes a strong, surprising assertion | "Everything you know about tantra is wrong." |
| question | Poses a direct question to viewer | "What if consciousness is not what you think?" |
| story_frame | Opens with a narrative | "In 10th century Kashmir, a philosopher was about to change everything." |
| promise | States what viewer will learn | "By the end of this video, you'll understand the 36 tattvas." |
| curiosity_gap | Creates information asymmetry | "There's a concept in Indian philosophy that modern science is only now catching up to." |
| direct_address | Speaks directly to viewer's experience | "You've been told tantra is about sex. It's not." |
| context_setting | Provides background before thesis | "Tantra is one of the oldest philosophical systems in the world." |

Validate against 50 hand-classified samples. Agreement must be ≥80%.

### 3.6 Video-Level Feature Store

One row per video:

```sql
CREATE TABLE video_features (
  video_id TEXT,
  channel_id TEXT,
  snapshot_date DATE,
  breakout_score FLOAT,
  is_breakout BOOLEAN,
  -- Title features
  title_length_chars INT,
  title_length_words INT,
  has_question BOOLEAN,
  has_colon BOOLEAN,
  starts_with_number BOOLEAN,
  starts_with_question_word BOOLEAN,
  power_word_count INT,
  has_direct_address BOOLEAN,
  has_curiosity_gap BOOLEAN,
  sentiment_score FLOAT,
  all_caps_word_count INT,
  contains_number BOOLEAN,
  -- Thumbnail features
  thumbnail_has_text BOOLEAN,
  thumbnail_composition TEXT,
  thumbnail_color_temperature TEXT,
  thumbnail_has_face BOOLEAN,
  thumbnail_expression TEXT,
  thumbnail_style TEXT,
  thumbnail_brightness TEXT,
  -- Hook features
  hook_type TEXT,
  -- Market features
  gap_score FLOAT,
  language_lag_score FLOAT,
  -- Metadata
  duration_seconds INT,
  channel_subs INT,
  competitor_type TEXT,
  age_days INT,
  topic_cluster TEXT,
  -- Raw data for reference
  title TEXT,
  thumbnail_url TEXT,
  description TEXT,
  tags TEXT,
  PRIMARY KEY (video_id, snapshot_date)
);
```

### Verification Gates

| Gate | Check | Fail Action |
|------|-------|-------------|
| V3_A | All channel uploads fetched | Retry failed channels |
| V3_B | Breakout score computed for all | Fix formula |
| V3_C | Title features extracted for all | Run regex pipeline |
| V3_D | Thumbnail agreement ≥80% | Retune prompt, re-validate |
| V3_E | Hook agreement ≥80% | Retune prompt, re-validate |
| V3_F | Feature store written to D1 | Fix D1 connection |
| V3_G | No selection-on-outcome (full sample) | Audit sample method |

---

## Stage 4: Opportunity Detection

### 4.1 Topic Opportunity Score

For each topic cluster:

```
topic_opportunity = gap_score × language_lag_score × breakout_rate × western_demand
```

Where:
- gap_score: from Stage 1
- language_lag_score: from Stage 1.5
- breakout_rate: fraction of videos on this topic that are breakouts (from Stage 3 data)
- western_demand: Google Trends level in US+UK (0-100, normalized)

### 4.2 Pattern Mining

For each topic cluster, compare breakout vs baseline videos on all features:

| Contrast | Method | Output |
|----------|--------|--------|
| Title features | For each feature: mean(breakout) vs mean(baseline), t-test | "Question titles: 42% breakout vs 18% baseline (p<0.01)" |
| Thumbnail features | Chi-square test on categorical features | "Warm thumbnails: 65% breakout vs 32% baseline" |
| Hook types | Frequency comparison | "Bold claim hooks: 48% breakout vs 22% baseline" |
| Duration | Mean comparison per cluster | "Kundalini videos: 12-18min optimal. History videos: 20-30min optimal." |
| Interaction effects | Feature pairs | "Question title + warm thumbnail + bold claim: 3.2x breakout rate vs baseline" |

### 4.3 Channel Opportunity Signals

Flag for each curated channel:

- Accelerating subscriber growth (last 30 days vs previous 30 days)
- Topic drift (new topics appearing in recent uploads)
- New channel entering niche (<1 year old, >3 breakouts)
- Old channel reviving (inactive >6 months, then uploaded)
- Format change (shorts→longform or longform→shorts)

### 4.4 Content Roadmap Generation

Sort topic clusters by `topic_opportunity`. For top 20:

```
Rank  Topic                          Gap  LLag  BRate  Opp  Recommended
1     Cremation ground tantra        0.92 0.85  0.31   0.24  "Why Tantrics..."
2     Bhairava tantra explained      0.87 0.72  0.28   0.18  "Bhairava: The..."
3     Bagalamukhi tantra             0.85 0.68  0.25   0.14  "The Goddess..."
...
```

### Verification Gates

| Gate | Check | Fail Action |
|------|-------|-------------|
| V4_A | Topic opportunity scores computed | Check formula |
| V4_B | Pattern mining run on all clusters | Check breakout/baseline split |
| V4_C | Content roadmap generated | Check sort |
| V4_D | Channel opportunity signals flagged | Run delta computation |

---

## Stage 5: Treatment Generation

### 5.1 One-Sentence Test

For each opportunity, generate:

```
click_because: "A viewer who knows nothing about me will click because [PROPOSITION]"
reveals: "and will remain because the video progressively reveals [ARC]"
```

Must pass human review. If unclear, do not proceed.

### 5.2 Packaging Triplet

Generate three packages per video concept:

**Package A — Search**
- Title: explicit, keyword-forward
- Thumbnail: text-heavy, explanatory
- Hook: direct answer

**Package B — Narrative**
- Title: story-driven, curiosity-gap
- Thumbnail: image-focused, emotional
- Hook: bold claim or story frame

**Package C — Hybrid**
- Title: "Keyword: Narrative"
- Thumbnail: image + minimal text
- Hook: question or curiosity gap

### 5.3 Beat Sheet

Structure for philosophical documentaries:

1. **Hook** (0-60s): Frightening claim, strongest image, or mystery question
2. **Context** (1-3min): What the viewer needs to know
3. **Evidence** (3-8min): Walk through sources with graded certainty
4. **Escalation** (8-12min): Deeper implications, contradictions
5. **Modern connection** (12-15min): Why this matters now
6. **Return** (15-18min): Circle back to opening image/claim with new understanding
7. **Bridge** (18-20min): Natural transition to next video

Every beat labeled: PROMISE | EVIDENCE | ESCALATION | CONTEXT | PAYOFF | BRIDGE. Delete anything labeled INTERESTING that doesn't serve the thesis.

### 5.4 Hook Script (First 20 Seconds)

Template:

```
"[TIME/PLACE], [SUBJECT] did [EXTRAORDINARY THING]. What happened became [LEGEND STATUS] — but [CORRECTION/INVESTIGATION]."
```

Must contain: subject, action, stake, investigation frame. Must not contain: logos, greetings, disclaimers, biography before premise.

### 5.5 Risk Assessment

| Risk | Check | Pass Criteria |
|------|-------|---------------|
| Core claim supported | Source citation exists | At least 2 independent sources |
| Title stronger than evidence | Title vs sources comparison | Title does not overclaim |
| Legends clearly labeled | Script review | "According to tradition" vs "Historians confirm" distinguished |
| Respectful treatment | Tone review | Not devotional, not dismissive |
| Distinguishes tantra from generic spirituality | Script review | Specific traditions named |
| Visuals properly licensed | Asset review | Public domain or CC0 |
| Living teachers/contested translations | Human review | Fact-checked by domain expert |

### Verification Gates

| Gate | Check | Fail Action |
|------|-------|-------------|
| V5_A | One-sentence test passes human review | Rework concept or discard |
| V5_B | Three packages generated | Generate missing packages |
| V5_C | Beat sheet complete | Fill missing beats |
| V5_D | Hook script passes (no disallowed elements) | Rewrite hook |
| V5_E | Risk assessment all pass | Fix flagged issues |
| V5_F | Sources verified | Add missing citations |

---

## Stage 6: Production + Validation

### 6.1 Script Validation

Before production, run:

- **Fact check**: Every historical claim cross-referenced against source
- **Legend label**: Each non-verifiable claim tagged with certainty level
- **Package alignment**: Title-thumbnail-hook-first-60s must form coherent promise
- **One-sentence test**: Archived alongside final script

### 6.2 Production Checklist

- [ ] Audio: clean, consistent level, no room tone
- [ ] Visuals: all assets match described style
- [ ] Thumbnail: readable at 160px, one focal point, minimal text
- [ ] End screen: one deliberate next-video target + verbal transition recorded
- [ ] Description: first 2 lines contain the hook (not SEO boilerplate)
- [ ] Comments: pinned comment with question asking what to cover next

### 6.3 Upload Time

Publish when target audience is active. Check YouTube Studio analytics for your channel's audience activity pattern. Default: 14:00 UTC (adjust based on actual data).

### 6.4 Pre-Registration

Before hitting publish, document:

```json
{
  "video_id": "",
  "expected_audience": "core / adjacent / cold",
  "expected_traffic_source": "search / browse / suggested",
  "package_type": "search / narrative / hybrid",
  "hypothesis": "This video will [predictions] because [reasoning]",
  "success_threshold": "> channel median views at 28 days, > channel median CTR",
  "primary_next_video": "slug-or-id",
  "tests": ["title A vs B already in native test", ""]
}
```

### Verification Gates

| Gate | Check | Fail Action |
|------|-------|-------------|
| V6_A | Fact check passed | Fix errors |
| V6_B | Risk assessment all pass | Fix or discard |
| V6_C | Pre-registration complete | Fill missing fields |
| V6_D | Thumbnail passes readability test | Redesign |
| V6_E | End screen + verbal bridge recorded | Re-record |

---

## Stage 7: Post-Release Learning

### 7.1 Fixed-Age Metric Collection

At 24 hours, 7 days, 28 days, 90 days:

| Metric | Source | Diagnostic |
|--------|--------|------------|
| Impressions | YouTube Analytics | Reach |
| Views | YouTube Analytics | Reach |
| CTR | YouTube Analytics | Packaging effectiveness |
| Avg view duration | YouTube Analytics | Retention quality |
| Avg percentage viewed | YouTube Analytics | Retention quality |
| 30s retention | YouTube Analytics | Hook effectiveness |
| Subscribers gained | YouTube Analytics | Conversion |
| Returning viewers | YouTube Analytics | Session building |
| End-screen clicks | YouTube Analytics | Next-video effectiveness |
| Browse impressions | YouTube Analytics | Cold audience testing |
| Suggested impressions | YouTube Analytics | Recommendation expansion |
| Search impressions | YouTube Analytics | Query matching |
| External impressions | YouTube Analytics | Promotion effectiveness |

### 7.2 Diagnostic Decision Trees

**High impressions, low CTR:**
```
→ Packaging mismatch or cold audience testing
→ Action: Test 2 new title+thumbnail variants
→ Action: Check if impressions are Browse vs Search (Browse suggests cold testing)
```

**Low impressions, high CTR:**
```
→ Narrow topic or small core audience
→ Action: Check if similar topics get more impressions
→ Action: Create broader entry-point version
→ Action: Wait for more data (early sample bias)
```

**High CTR, weak early retention:**
```
→ Package overpromises or opening misrepresents
→ Action: Rewrite first 30 seconds
→ Action: Remove greetings, disclaimers, setup
→ Action: Verify opening matches title promise exactly
```

**Strong retention, weak CTR:**
```
→ Good content, wrong packaging
→ Action: Repackage with new thumbnail + title
→ Action: Preserve video, test new entry points
```

**High views, low subscriber conversion:**
```
→ One-time search solution, not channel proposition
→ Action: Improve bridge to next video
→ Action: Clarify channel promise in description
```

### 7.3 Pattern Database Update

After each release, append to pattern database:

```
video_id: str
hypothesis_confirmed: bool
strongest_feature: str  # which feature most correlated with success
weakest_feature: str    # which feature underperformed
comment_requests: [str] # unanswered questions from comments
next_strongest_video: str  # which follow-up topic emerged
```

### 7.4 Hypothesis Falsification

Track every hypothesis across releases:

| Hypothesis | Status | Evidence | Videos Tested |
|-----------|--------|----------|---------------|
| Question titles outperform statements | PENDING | — | 0 |
| Warm thumbnails outperform cool | PENDING | — | 0 |
| Narrative titles > search titles for biography | PENDING | — | 0 |
| Bold claim hooks > question hooks | PENDING | — | 0 |
| 12-18 min optimal for philosophical content | PENDING | — | 0 |
| Shorts drive long-form views | PENDING | — | 0 |
| Next-video bridge boosts session length | PENDING | — | 0 |

Update as evidence accumulates. Only mark CONFIRMED or REJECTED after ≥5 tests.

### Verification Gates

| Gate | Check | Fail Action |
|------|-------|-------------|
| V7_A | Fixed-age metrics saved at all 4 checkpoints | Set calendar reminders |
| V7_B | Diagnostic decision tree applied | Run through each branch |
| V7_C | Pattern database updated | Fill missing fields |
| V7_D | Hypothesis table updated | Add entry |
| V7_E | API usage logged for any API calls | Update api-usage-log.csv |

---

## Experiment Playbook

Six structured experiments to run. Each produces a conditional rule, not a universal winner.

### Experiment 1: Is the Niche Actually Underserved?

**When:** Before any budget spent on content production.

**Method:** 40-60 topic groups × demand/supply measurement (Stage 1.1-1.4).

**Outcome:** Topic gap scores ranked. Distinguishes underserved from terminology-gap from low-demand from well-served.

### Experiment 2: Cross-Language Lead-Lag

**When:** After gap scores computed.

**Method:** Hindi search + outlier detection on same topics (Stage 1.5).

**Hypothesis:** Topics break out in Hindi before English documentaries exist.

**Outcome:** Language-lag scores. Topics with high lag + high gap = immediate production candidates.

### Experiment 3: Which Breakout Metric Predicts Best?

**When:** After ≥30 days of competitor snapshots exist.

**Method:** Compare 4 predictors (raw ratio, age-band ratio, velocity ratio, regression residual) against day-28 performance. Spearman correlation, precision@20.

**Hypothesis:** One metric predicts better than others.

**Outcome:** Winning metric selected as standard. Re-validate annually.

### Experiment 4: Search vs Narrative vs Hybrid Packaging

**When:** After ≥10 videos published on your own channel.

**Method:** YouTube native A/B test with 3 variants per video. Minimum 10 tests.

**Hypothesis:** Conditional rule exists (Search for queries, Narrative for stories, Hybrid for introductions).

**Outcome:** Channel-specific packaging rule.

### Experiment 5: Comment-to-Content Gap

**When:** After ≥20 competitor breakouts collected.

**Method:** Pull top 100 comments per breakout. Cluster unanswered questions. Count cluster density across videos.

**Hypothesis:** Repeated unanswered questions identify content gaps that keyword tools miss.

**Outcome:** Ranked list of audience-validated content ideas.

### Experiment 6: Session Building

**When:** After ≥15 videos on own channel.

**Method:** Compare end-screen CTR and next-video views across: deliberate verbal bridge, targeted end-screen, generic recommendation.

**Hypothesis:** Verbal + visual next-video bridge outperforms either alone.

**Outcome:** Channel-specific session-building protocol.

---

## Features Worth Collecting (Master List)

### Channel Features

| Feature | Source | Type |
|---------|--------|------|
| subscriber_count | channels.list | continuous |
| video_count | channels.list | continuous |
| channel_age_days | channels.list | continuous |
| upload_frequency_30d | computed | continuous |
| avg_views_30d | computed | continuous |
| competitor_type | manual | categorical |
| language | channels.list | categorical |
| country | channels.list | categorical |
| topic_affinities | LLM on title corpus | vector |

### Video Features

| Feature | Source | Type |
|---------|--------|------|
| duration_seconds | videos.list | continuous |
| age_days | computed | continuous |
| published_weekday | computed | categorical |
| published_hour | computed | categorical |
| title_length | computed | continuous |
| has_question | computed | boolean |
| has_colon | computed | boolean |
| starts_with_number | computed | boolean |
| power_word_count | computed | continuous |
| has_direct_address | computed | boolean |
| has_curiosity_gap | computed | boolean |
| sentiment_score | computed | continuous |
| thumbnail_composition | LLM vision | categorical |
| thumbnail_color | LLM vision | categorical |
| thumbnail_has_face | LLM vision | boolean |
| thumbnail_expression | LLM vision | categorical |
| thumbnail_style | LLM vision | categorical |
| thumbnail_brightness | LLM vision | categorical |
| hook_type | LLM on transcript | categorical |
| tags | videos.list | set |
| category_id | videos.list | categorical |
| topic_cluster | LLM on title+tags | categorical |
| is_series_member | manual | boolean |

### Market Features

| Feature | Source | Type |
|---------|--------|------|
| gap_score | Stage 1 | continuous |
| language_lag_score | Stage 1.5 | continuous |
| western_demand_level | Google Trends | continuous |
| western_demand_growth | Google Trends | continuous |
| competing_video_count_12mo | computed | continuous |
| independent_channel_count | computed | continuous |
| quality_supply_count | computed | continuous |
| search_rank_us | computed | ordinal |
| search_rank_uk | computed | ordinal |
| search_rank_in | computed | ordinal |

---

## API Usage Budget

| Operation | Cost | Bucket | Daily Max |
|-----------|------|--------|-----------|
| search.list | 1 | search_list (separate) | 100 |
| channels.list | 1 | general | 10,000 |
| videos.list | 1 per 50 | general | 10,000 |
| playlistItems.list | 1 | general | 10,000 |
| commentThreads.list | 1 | general | 10,000 |

Always log usage to `data/api-usage-log.csv`. Never proceed past a verification gate without confirming API usage is tracked.

## Quick Start

```bash
# Stage 0-1: Niche census + underserved check
npm run data:underserved-test

# Validate report
python3 scripts/validate-data-report.py data/reports/underserved-claim-test-YYYY-MM-DD.json

# Stage 2: Manual channel curation (see Stage 2 criteria)
# Stage 3: Run harvest after channels selected
# Stage 4-7: Follow spec

# Full pipeline reference
cat data/README.md
cat highsignalspec.md
```
