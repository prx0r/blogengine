# Factory Analytics — Feedback Loop

## Overview

After a video is published, YouTube Analytics feeds retention data back into the factory. This closes the loop: research → produce → measure → research better.

```
Published video on YouTube
        ↓  (7+ days later)
YouTube Analytics API
  → retention per second
  → mapped to storyboard segments
  → joined against visual-assignment.json
  → computed: which artwork, which topic, which treatment retained viewers
        ↓
Reports fed back into:
  - Research acquisition priority (which topics outperform)
  - RO expansion decisions (which passages resonate)
  - Video pipeline tuning (format, pacing, visual choices)
  - Factory queue reprioritisation
```

## What Analytics Can Tell Us

### Per-Video Metrics (from YouTube Analytics API)

| Metric | What It Measures | Factory Use |
|--------|-----------------|-------------|
| `averageViewDuration` | How long people watched | Overall quality signal |
| `averageViewPercentage` | % of video watched | Compared to benchmark |
| `views` | Total views | Reach |
| `estimatedMinutesWatched` | Total watch time | Engagement weight |
| `likes`, `comments`, `shares` | Engagement | Community signal |
| `subscribersGained` | Channel growth | Topic demand signal |
| `audienceRetention` | Per-second retention curve | Beat-level performance |

### Beat-Level Analytics (Mapped to Storyboard)

The retention curve is mapped to storyboard segments:

```
elapsedVideoTimeRatio × duration → beat timestamp
  → beat timestamp → segment_id in storyboard
    → join against visual-assignment.json
      → which artwork was showing?
      → which topic was being discussed?
      → which rhetorical role (hook, thesis, quote, etc.)?
```

This produces per-segment metrics:

```json
{
  "segment_id": "seg-03-expansion",
  "topic": "Active Imagination",
  "artwork_id": "art_alchemy_e281",
  "treatment": "none",
  "retention_at_start": 0.92,
  "retention_at_end": 0.78,
  "dropoff": 0.14,
  "relative_retention": 1.05
}
```

### Cross-Video Aggregation

After 5+ videos, patterns emerge:

| Question | How We Answer |
|----------|---------------|
| Which topics retain best? | Aggregate retention by RO topic across all videos |
| Which artwork correlates with dropoff? | Find artworks where retention drops >20% during their segment |
| Do quote cards hold attention? | Compare retention during quote segments vs artwork segments |
| Which rhetorical roles lose viewers? | Average dropoff per role (hook, thesis, expansion, etc.) |
| Do longer videos perform worse? | Correlation between duration and averageViewPercentage |
| Which series performs best? | Compare tantraloka vs mixed vs seth videos |

## Feedback Loop Actions

### Research Acquisition Priority

If analytics show:
- **Tantraloka videos retain 20% better than mixed traditions** → prioritise Tier 1 research
- **Viewers drop during dense metaphysical segments** → acquire better explanatory sources
- **Quote segments have highest retention** → find more quotable source material
- **Certain topics (e.g. daimon) outperform others** → expand RO coverage in that area

### RO Expansion Decisions

```
High-performing topic → expand RO with more passages
Low-performing topic  → audit RO for quality issues, find better sources
Untouched topic with high demand → fast-track through pipeline
```

### Video Pipeline Tuning

```
Retention drops at 8-12 min mark → shorten videos
Quote segments outperform → increase quote ratio
Artwork segments lose viewers → improve art selection, add motion
Hook segments lose viewers → rewrite hooks
```

### Factory Queue Reprioritisation

The queue's `pipeline-queue.json` is reordered by performance signals:

```
score = topic_demand × retention_potential × production_effort
```

Where:
- `topic_demand` = views + subscribers gained for similar topics
- `retention_potential` = average retention for videos in this series
- `production_effort` = inverse of time to produce (cheaper topics first)

## Implementation

### Analytics Ingestion Script

```
scripts/ingest-youtube-analytics.mjs <video-id>
  → pulls retention data from YouTube Analytics API
  → maps to storyboard segments
  → computes per-segment metrics
  → stores in content/video-objects/<slug>/analytics.json
  → updates _pipeline-queue.json priority scores
```

### When to Run

- **Auto:** 7 days after upload (cron job)
- **Manual:** `node scripts/ingest-youtube-analytics.mjs <slug>`

### Connecting the Loop

The final connection: analytics output → pipeline queue reprioritisation.

```python
def reprioritise_queue(analytics_data):
    queue = load("content/factory/queue.json")
    for tier in queue["priority_tiers"]:
        for topic in tier["topics"]:
            if topic in analytics_data:
                topic["performance_score"] = analytics_data[topic]["retention"]
        # Re-sort tier by performance_score descending
        tier["topics"].sort(key=lambda t: t.get("performance_score", 0), reverse=True)
    save(queue)
```

This means: **high-performing topics float to the top.** The factory automatically produces more of what the audience wants.
