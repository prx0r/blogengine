# R2 Dataset Reference

Standardized documentation for all research datasets stored in R2. Each dataset has a source paper, schema reference, access method, and known limitations.

## Bucket: `research-datasets`

### YouNiverse

**Source:** arXiv:2012.10378 — "YouNiverse: Large-Scale Channel and Video Metadata from English-Speaking YouTube"
**R2 Path:** `s3://research-datasets/youniverse/`
**Size:** 3.1 GB (3 files)
**Period Covered:** 2005-05 to 2019-10
**License:** CC BY 4.0

| File | R2 Path | Size | Rows |
|------|---------|------|------|
| Channel data | `youniverse/df_channels_en.tsv.gz` | 5.7 MB | 136,470 |
| Time series | `youniverse/df_timeseries_en.tsv.gz` | 544 MB | 18,872,499 |
| Video metadata | `youniverse/yt_metadata_helper.feather` | 2.6 GB | 72,924,794 |

**Columns:**

`df_channels_en.tsv.gz`:
| Column | Type | Description |
|--------|------|-------------|
| category_cc | string | YouTube category (Gaming, Education, Music, etc.) |
| join_date | date | Channel creation date |
| channel | string | YouTube channel ID |
| name_cc | string | Channel display name |
| subscribers_cc | int | Subscriber count at crawl |
| videos_cc | int | Total video count at crawl |
| subscriber_rank_sb | float | SocialBlade subscriber rank |
| weights | float | Sampling weight |

`df_timeseries_en.csv.gz`:
| Column | Type | Description |
|--------|------|-------------|
| channel | string | YouTube channel ID |
| category | string | SocialBlade-assigned category |
| datetime | datetime | Week start date |
| views | float | Total views this week |
| delta_views | float | New views this week |
| subs | float | Total subscribers this week |
| delta_subs | float | New subscribers this week |
| videos | int | Total videos this week |
| delta_videos | int | New videos this week |
| activity | int | Videos published in last 15 days |

`yt_metadata_helper.feather`:
| Column | Type | Description |
|--------|------|-------------|
| categories | string | YouTube category |
| channel_id | string | YouTube channel ID |
| crawl_date | datetime | When fetched |
| dislike_count | int | Dislikes |
| display_id | string | YouTube video ID |
| duration | int | Duration in seconds |
| like_count | int | Likes |
| upload_date | date | Upload date |
| view_count | int | View count |

**Access:**
```bash
# Direct S3 API
aws s3 cp s3://research-datasets/youniverse/df_channels_en.tsv.gz - \
  --endpoint-url $S3_ENDPOINT | gunzip

# DuckDB (after setting up R2 Data Catalog or via httpfs)
SELECT * FROM read_csv('s3://research-datasets/youniverse/df_channels_en.tsv.gz', ...)

# Python with pyarrow
import pyarrow as pa
table = pa.feather.read_feather(
    pa.fs.S3FileSystem(access_key=..., secret_key=...).open_input_file(
        'research-datasets/youniverse/yt_metadata_helper.feather'
    )
)
```

**Limitations:**
- Data ends October 2019 — unsuitable for current-topic detection
- Channel sample derived from SocialBlade (not fully random)
- Only English-language channels (via video metadata filter)
- Video metadata helper excludes description, tags, title (use `_raw_yt_metadata.jsonl.zst` for those, but it's 13 GB)

---

### YTCommentVerse

**Source:** arXiv:2412.03465 — "YT-30M: A Multi-lingual Multi-category Dataset of YouTube Comments"
**R2 Path:** `s3://research-datasets/ytcommentverse/`
**Size:** 10.1 GB (1 file)
**License:** CC BY 4.0

| File | R2 Path | Size | Rows |
|------|---------|------|------|
| Comment database | `ytcommentverse/YT-30M.db` | 10.1 GB | 32,236,173 comments |

**Schema (SQLite):**
| Column | Type | Description |
|--------|------|-------------|
| comment_id | string | Unique comment identifier |
| video_id | string | YouTube video ID |
| commentor_name | string | Display name |
| commentor_channel_id | string | Commenter's channel ID |
| comment_text | string | Raw comment text |
| upvotes | int | Upvote count |
| channel_id | string | Video's channel ID |
| category | string | YouTube category (Science & Technology, Education, etc.) |

**Access:**
```bash
# Direct query via sqlite3
aws s3 cp s3://research-datasets/ytcommentverse/YT-30M.db - \
  --endpoint-url $S3_ENDPOINT > /tmp/YT-30M.db
sqlite3 /tmp/YT-30M.db "SELECT category, COUNT(*) FROM comments GROUP BY category;"

# Or stream without full download (DuckDB SQLite scanner)
```

**Limitations:**
- Comment text only — no user geography
- No demographic data
- Category field is YouTube's classification (may be broad)

---

### Global YouTube Trending

**Source:** arXiv:2510.23645 — "Global YouTube Trending Dataset (2022-2025)"
**R2 Path:** `s3://research-datasets/global-trending/`
**Size:** 26.4 GB (1 tarball)
**License:** CC BY 4.0

| File | R2 Path | Size | Contents |
|------|---------|------|----------|
| Trending archive | `global-trending/youtube_trends.tar.bz2` | 26.4 GB | 446,971 snapshots, 726,627 videos, 104 countries |

**Schema (per snapshot record):**
| Column | Type | Description |
|--------|------|-------------|
| snapshot_time | datetime | When trending page was fetched |
| country | string | ISO 3166-1 alpha-2 country code |
| rank | int | Position on trending page (1-200) |
| video_id | string | YouTube video ID |
| channel_id | string | YouTube channel ID |
| category | string | YouTube category |
| title | string | Video title |
| description | string | Video description |
| tags | string | Comma-separated tags |
| channel_name | string | Channel display name |
| language | string | Video language |
| live_status | boolean | Was it a live stream? |
| view_count | int | Views at snapshot |
| comment_count | int | Comments at snapshot |
| published_at | datetime | Original upload time |

**Access:**
Requires extracting tarball first:
```bash
tar -xjf youtube_trends.tar.bz2
# Then load into DuckDB for querying
```

**Limitations:**
- Only contains videos that appeared on public Trending pages (not the full YouTube ecosystem)
- Niche content rarely trends — this dataset reveals *cultural-crossover mechanics*, not topic popularity
- YouTube retired public Trending pages July 1, 2025 — data ends June 30, 2025

---

## Research Outputs

All Layer 1-3 results go to `/root/projects/blog/data/research/{dataset}/{experiment-name}.json`
with standardized schema:

```json
{
  "experiment": "layer1-assumption-1",
  "dataset": "youniverse",
  "timestamp": "2026-07-22",
  "method": "log(views) ~ log(age_days) OLS per channel, compare residual vs raw rank",
  "sample": { "channels": 5000, "videos_per_channel": 50 },
  "results": {
    "residual_rank_overlap_with_top_quartile": 0.72,
    "raw_views_rank_overlap_with_top_quartile": 0.31,
    "delta": 0.41,
    "conclusion": "OLS residual predicts breakout 2.3x better than raw views"
  },
  "gates": {
    "A01": { "status": "PASS", "detail": "delta R^2 > 0.1" }
  },
  "next_steps": "Proceed to Assumption 2 (format_class addition)"
}
```
