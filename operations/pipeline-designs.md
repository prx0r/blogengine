# Pipeline Designs for Remaining Datasets

## Pipeline 1: YTCommentVerse Comment Taxonomy

**Dataset:** 10.8 GB SQLite DB at `s3://research-datasets/ytcommentverse/YT-30M.db`
**Schema:** comment_id, video_id, commentor_name, commentor_channel_id, comment_text, upvotes, channel_id, category
**Assumption:** Comment intent types (question, correction, source request, skepticism, personal testimony, confusion, translation request, follow-up) can be reliably classified and clustered from text alone.

**Pilot** (the drill-down step):
- Query 10,000 comments from the DB (`SELECT comment_text, category, upvotes FROM comments LIMIT 10000`)
- Manually classify 100 into the 8 intent types (by hand, not LLM)
- Check: do the categories look clusterable? Are there clear linguistic patterns per type?
- If yes → scale to LLM classification on 1,000 comments, compare against hand-coded 100, compute macro F1
- If no → document that comment intent isn't reliably extractable for this dataset

**Scale:**
- Use DuckDB to query the SQLite DB directly from R2 (DuckDB can read remote SQLite via httpfs)
- Run LLM classification on stratified sample (50% high-upvote, 50% random)
- Store results in `data/research/ytcommentverse/comment-taxonomy.json`

**Output:** A validated taxonomy of comment intent types with per-type precision/recall, usable for classifying comments from our own channel and competitor channels.

---

## Pipeline 2: Global Trending Cross-Country Diffusion

**Dataset:** 26.4 GB tarball at `s3://research-datasets/global-trending/youtube_trends.tar.bz2`
**Schema (per record):** snapshot_time, country, rank, video_id, channel_id, category, title, description, tags, channel_name, language, live_status, view_count, comment_count, published_at
**Assumption:** Indian educational/religious content that appears in IN trending also appears in US/UK trending with a measurable time lag. This reveals the mechanics of cultural export.

**Crucial issue:** The tarball is 26.4 GB compressed. Extracting it requires the Hetzner volume (50 GB, currently has 6.8 GB free). The extracted data will be larger. **Do not extract until more disk space is freed or a larger volume is added.**

**Shortcut:** Instead of extracting the full tarball, write a script that streams the tarball and processes one country/month at a time:

```python
import tarfile, io
# Stream from R2 without full download
# Process IN trending for one month → store results → free memory → next month
```

**Pilot:**
- Stream one month of IN trending data (July 2022)
- Count unique videos, top categories, language distribution
- For each IN-trending video, check if same video_id appears in US/GB snapshots within 14 days
- Measure: what % cross borders? How fast?

**Scale:**
- If pilot shows measurable crossover → expand to full 3 years, compute diffusion matrix
- If pilot shows zero crossover → Indian trending content doesn't reach Western trending organically; document and stop

**Output:** Cross-country diffusion matrix (origin → target country transition probabilities, median lag time, category-specific rates).

---

## Daily Search Collection (In Progress)

**Status:** Day 1 collected (2026-07-21). Cron runs at 00:05 UTC. 48 calls/day.
**Purpose:** 14 days of data to compute week-over-week Spearman correlation. If r > 0.3, weekly gap maps are stable. If r < 0.3, daily noise is too high.
**Remaining:** 13 days. Results auto-accumulate in `data/research/layer2/daily-query-results/`.

The cron is set and running. No action needed. Check back after 14 days.
