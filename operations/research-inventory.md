# Research Inventory — All Spec'd Experiments

Everything we designed across all files, mapped to current status. This is the complete picture of what we said we'd test vs what we actually ran.

## Source: `intelligence-pipeline.md`

| Experiment | Status | Notes |
|-----------|--------|-------|
| 1. Within-Channel Breakout Analysis | ✅ A1-A3 complete | Validated OLS residual, category, momentum |
| 2. IN↔US Gap Map | ✅ Layer 2 Task 1 | 16/30 queries ≥ 0.30, weekly cadence adopted |
| 3. Title Association Ranking | ❌ Not started | Spearman correlation of 15 title features vs views_per_day. Data already in YouNiverse. Could run today. |
| 4. Duration-Performance Per Niche | ❌ Not started | Mean breakout ratio per duration bucket per niche. Data in YouNiverse. Could run today. |
| Hook Library backfill | ❌ Not started | Classify first 150 words of transcripts across all breakout-tier videos. Requires transcript data. |

## Source: `pipelines/youniverse/README.md` (8 research questions)

| Question | Status | Notes |
|----------|--------|-------|
| How much does channel size explain views? | ❌ Not started | Regress log(views) on log(subs). Easy — data in hand. |
| Is views/age normalization sensible? | ✅ A1 | OLS residual beats raw views by 44% |
| How common are within-channel outliers? | ❌ Not started | Distribution of outlier scores across 136k channels |
| Do title features add signal beyond channel baseline? | ❌ Not started | Delta R² from nested regression. This is Experiment 3 from intelligence-pipeline. |
| Is binary breakout classification sensible? | ❌ Not started | Compare continuous vs ordinal vs binary. |
| Does duration interact with category? | ❌ Not started | Experiment 4 from intelligence-pipeline. |
| Do comment likes/replies predict video outliers? | ❌ Not started | Requires YTCommentVerse pipeline. |
| How much do tags matter after title? | ❌ Not started | Title-only vs title+tags model. |

## Source: `pipelines/global-trending/README.md` (8 research questions)

| Question | Status | Notes |
|----------|--------|-------|
| Which topics cross national boundaries? | ❌ Not started | Requires extracting Global Trending tarball |
| Do Indian educational/religious videos trend in US/UK? | ❌ Not started | Same — tarball extraction needed |
| Time lag between IN and US appearance? | ❌ Not started | Same |
| What title archetypes travel internationally? | ❌ Not started | Same |
| Does English IN content diffuse differently from Hindi? | ❌ Not started | Same |
| Do IN videos cross through diaspora first? | ❌ Not started | Same |
| Which adjacent categories carry tantra-adjacent content? | ❌ Not started | Same |
| What view count thresholds predict cross-country migration? | ❌ Not started | Same |

## Source: `pipelines/yt30m-comments/README.md` (7 research questions)

| Question | Status | Notes |
|----------|--------|-------|
| Can comment language proxy audience geography? | ❌ Not started | Requires YTCommentVerse pipeline |
| How do viewers formulate questions across languages? | ❌ Not started | Same |
| What comment features predict high engagement? | ❌ Not started | Same |
| Can requests for explanation be reliably clustered? | ❌ Not started | Same — this is the comment taxonomy experiment |
| What % of comments are substantive? | ❌ Not started | Same |
| Which categories show highest request-for-explanation density? | ❌ Not started | Same |
| Does non-English comment presence predict gap? | ❌ Not started | Same |

## Source: `channel-growth-algorithm.md` (experiment playbook)

| Experiment | Status | Notes |
|-----------|--------|-------|
| 1. Is the niche actually underserved? | ✅ Layer 2 Task 1 | Confirmed |
| 2. Cross-language lead-lag | ❌ Not started | Compare Hindi breakouts to English equivalents. Needs channel curation. |
| 3. Which breakout metric predicts best? | ✅ A1 | OLS residual wins |
| 4. Search vs Narrative vs Hybrid packaging | ❌ Not started | Requires own production (can't test without published videos) |
| 5. Comment-to-content gap | ❌ Not started | Requires YTCommentVerse + own production |
| 6. Session building | ❌ Not started | Requires own production + 15+ videos |

## Source: `farm-implementation-plan.md` (Layer 2)

| Test | Status | Notes |
|------|--------|-------|
| A4: Weekly gap map stability | ⏳ Running | 13 days remaining on daily collection |
| A5: Wikipedia z-score | ✅ Done | r=0.027, skipped permanently |
| A6: Stage 1 channel replication | ✅ Done | 16/30 queries confirmed, weekly cadence |

## Source: `highsignalspec.md` (8 steps)

| Step | Status | Notes |
|------|--------|-------|
| 1. Underserved-claim check | ✅ Done | |
| 2. Channel list curation | ❌ Not started | 20-40 channels with source/authority/narrative split |
| 3. Pull full video population | ❌ Not started | Requires channel list first |
| 4. Compute breakout scores | ✅ A1 | |
| 5. LLM passes (thumbnail, hook, topic) | ❌ Not started | Requires channel video data |
| 6. Build feature table in D1 | ❌ Not started | |
| 7. Fit simple model | ❌ Not started | |

## Summary

| Category | Total Designed | Completed | In Progress | Not Started |
|----------|---------------|-----------|-------------|-------------|
| Intelligence pipeline | 4 + 1 sub | 2 | 0 | 3 |
| YouNiverse questions | 8 | 1 | 0 | 7 |
| Global Trending | 8 | 0 | 0 | 8 |
| YTCommentVerse | 7 | 0 | 0 | 7 |
| Channel growth experiments | 6 | 2 | 0 | 4 |
| High-signal steps | 7 | 2 | 0 | 5 |
| **Total** | **~41** | **7** | **1** | **~33** |

We've completed about 7 of ~41 designed experiments. The vast majority are not started. Most of them are blocked only by "write the pipeline script and run it" — not by missing data or infrastructure.
