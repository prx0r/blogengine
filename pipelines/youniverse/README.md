# YouNiverse Pipeline

## Source

- **Paper:** arXiv:2012.10378 (ICWSM 2021)
- **Data:** Zenodo DOI 10.5281/zenodo.4650046
- **Code:** github.com/epfl-dlab/YouNiverse
- **License:** CC BY

## Dataset Contents

Four files (all filtered to English channels):

### 1. Channel Data (`df_channels_en.tsv.gz`)
136,470 channels with >10k subs and >10 videos, crawled Oct 2019.

| Field | Type | Description |
|-------|------|-------------|
| category_cc | string | YouTube category |
| join_date | date | Channel creation date |
| channel | string | Channel ID |
| name_cc | string | Channel name |
| subscribers_cc | int | Subscriber count at crawl |
| videos_cc | int | Video count at crawl |
| subscriber_rank_sb | int | SocialBlade subscriber rank |
| weights | float | Sampling weight |

### 2. Time Series (`df_timeseries_en.csv.gz`)
18.9M weekly data points across 153k channels, Jan 2015 - Sep 2019.

| Field | Type | Description |
|-------|------|-------------|
| channel | string | Channel ID |
| category | string | SocialBlade-assigned category |
| datetime | date | Week start |
| views | int | Total views this week |
| delta_views | int | New views this week |
| subs | int | Total subs this week |
| delta_subs | int | New subs this week |
| videos | int | Total videos this week |
| delta_videos | int | New videos this week |
| activity | int | Videos published in last 15 days |

### 3. Video Metadata (`yt_metadata_en.jsonl.gz`)
72.9M videos from 137k channels, 2005-2019.

| Field | Type | Description |
|-------|------|-------------|
| categories | string | YouTube category |
| channel_id | string | Channel ID |
| crawl_date | datetime | When metadata was fetched |
| description | string | Video description |
| dislike_count | int | Dislikes |
| display_id | string | YouTube video ID |
| duration | int | Duration in seconds |
| like_count | int | Likes |
| tags | string | Comma-separated tags |
| title | string | Video title |
| upload_date | date | Upload date |
| view_count | int | View count |

Also includes `yt_metadata_helper.feather` (same fields minus description, tags, title).

### 4. Comment Data (`youtube_comments.tsv.gz`)
8.6B comments from 449M users across 20.5M videos. Only includes videos with >30 comments.

| Field | Type | Description |
|-------|------|-------------|
| author | int | Anonymized user ID |
| video_id | string | YouTube video ID |
| likes | int | Comment likes |
| replies | int | Comment replies |

## Access

```bash
# Download from Zenodo
wget https://zenodo.org/record/4650046/files/df_channels_en.tsv.gz
wget https://zenodo.org/record/4650046/files/df_timeseries_en.csv.gz
wget https://zenodo.org/record/4650046/files/yt_metadata_en.jsonl.gz
wget https://zenodo.org/record/4650046/files/yt_metadata_helper.feather
wget https://zenodo.org/record/4650046/files/youtube_comments.tsv.gz
```

Total size: ~15GB compressed.

## Research Questions (Validated Here)

| # | Question | Method | Output |
|---|----------|--------|--------|
| 1 | How strongly does channel size explain views? | Regress log(views) on log(subs) across 136k channels. Report R^2. | Baseline: channel explains ~X% of view variance |
| 2 | Is views/age normalization sensible? | Compare linear, log, and age-band fits on actual accumulation curves from weekly time series. | Age-band ratio or log-linear model wins |
| 3 | How common are genuine within-channel outliers? | For each channel, compute outlier ratio. Distribution of outlier counts. | "X% of channels have any outliers; Y% have regular outliers" |
| 4 | Do title features add signal beyond channel baseline? | Nested regression: (1) channel only, (2) channel + title features. Delta R^2. | Title features add X% to predictive power |
| 5 | Is binary breakout classification sensible? | Compare continuous outlier scores vs top-10%/25% labels. How many near-boundary cases? | Recommend continuous or ordinal, not binary |
| 6 | Does duration interact with category? | Duration bucketed per category. Within-category outlier rates. | "Education: 10-20min optimal. Music: 3-5min optimal." |
| 7 | Do comment likes/replies predict video outliers? | Video-level: mean comment likes/replies regressed on breakout score. | Comment engagement correlates at r=X |
| 8 | How much do tags matter after title? | Compare title-only model vs title+tags model. Delta R^2. | Tags add X% beyond title alone |

## Pipeline Steps

```
1. Download all 5 files from Zenodo
2. Load channel table → compute channel_size distribution, category distribution
3. Load video metadata → sample 100k videos, compute age-normalized breakout scores
4. Join with channel table → run nested regressions
5. Load time series → validate accumulation curves
6. Load comment data → aggregate per video, join with breakout scores
7. Output validation report
```

Estimated compute: <10GB RAM, <1 hour on single core.

## Output

A validation report at `pipelines/youniverse/output/validation-report.json` containing all regression coefficients, R^2 values, correlation matrices, and recommendations for the Channel Growth Algorithm feature set.
