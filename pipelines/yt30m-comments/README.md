# YT-30M Comment Pipeline

## Source

- **Paper:** arXiv:2412.03465 (2024)
- **Author:** Hridoy Sankar Dutta
- **License:** CC BY

## Dataset Contents

Two datasets:

### YT-30M (full)
32,236,173 comments from YouTube channels across all categories.

### YT-100K (sample)
108,694 comments randomly sampled from YT-30M. Used for initial validation before running on full set.

### Schema

| Field | Type | Description |
|-------|------|-------------|
| comment_id | string | Unique comment identifier |
| video_id | string | YouTube video ID |
| commentor_name | string | Display name of commenter |
| commentor_channel_id | string | Channel ID of commenter |
| comment_text | string | Raw comment text |
| upvotes | int | Number of upvotes |
| channel_id | string | Channel ID of the video |
| category | string | YouTube category (e.g. Science & Technology, News & Politics, Education, Entertainment) |

Languages: multilingual (dataset includes comments from 50+ languages, language tags available).

## Access

```bash
# Download from source (check paper for current repository)
# YT-30M full: ~ 1.5GB compressed
# YT-100K sample: ~ 10MB
```

Contact author via paper for current hosting location if not on GitHub/HuggingFace.

## Research Questions

| # | Question | Method | Output |
|---|----------|--------|--------|
| 1 | Can comment language proxy audience geography? | Cross-tabulate comment language vs video category. For English-language videos, what % of comments are in English? | "89% of comments on English videos are in English." |
| 2 | How do viewers formulate questions across languages? | Extract comments containing "?" or interrogative patterns. Cluster by language and topic. | Question intent taxonomy per language |
| 3 | What comment features predict high engagement? | Regress upvotes on: comment_length, has_question, has_url, sentiment, language, category. | Top features: length (r=X), has_question (r=Y) |
| 4 | Can requests for explanation be reliably clustered? | LLM-classify 500 comments into: request_explanation, request_followup, confusion, correction, source_request, skepticism, personal_experience. Measure inter-rater reliability. | Agreement ≥80%: yes, clusterable. |
| 5 | What % of comments are substantive enough for content gap analysis? | Classify all comments as substantive (request, question, correction, source) vs non-substantive (spam, one-word, emoji-only). | "% substantive varies by category. Education: 40%. Entertainment: 15%." |
| 6 | Which categories show highest request-for-explanation density? | Per category: count of request_explanation comments / total comments. | "Education: 12%. Science: 9%. Entertainment: 2%." |
| 7 | Does non-English comment presence on English videos predict gap? | For English-channel videos with high non-English comment %, are those videos more likely to be breakout outliers? | Test on YouNiverse breakout scores joined with YT-30M comment data. |

## Pipeline Steps

```
1. Download YT-100K sample (10MB)
2. Load and explore: language distribution, category distribution, comment length distribution
3. Extract question patterns via regex per language
4. LLM-classify 500 random comments into intent taxonomy, validate against hand-coded 100
5. Compute per-category substantive comment ratios
6. Join with YouNiverse video breakout scores (via video_id)
7. Build comment signal features for each video: question_density, substantive_ratio, multilingual_ratio
8. Test if comment features improve breakout prediction over channel+title-only baseline
```

## Output

- `pipelines/yt30m-comments/output/comment-intent-taxonomy.json` — validated taxonomy with per-category distributions
- `pipelines/yt30m-comments/output/comment-breakout-correlation.json` — how comment features correlate with breakout scores
- `pipelines/yt30m-comments/output/language-distribution.csv` — per-category language mix
