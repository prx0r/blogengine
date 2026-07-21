# Research Pipeline Guide

## What It Does

Daily: harvest new uploads from tracked channels, compute breakout scores, classify thumbnails, update gap map.
Weekly: recompute opportunity scores, Wikipedia pageview velocity, hypothesis testing.
Monthly: full recomputation, topic reclustering, fact-check audit.

## Channels

Each farm tracks channels in three roles:

| Role | Purpose | Example |
|------|---------|---------|
| `source` | Indian content providers — subject discovery | Tantrik Spirituality, Rajarshi Nandy |
| `authority` | Academic-style — citation discipline, historical framing | ESOTERICA, ReligionForBreakfast |
| `narrative` | Documentary craft from any niche — packaging and pacing | Any narrative documentary channel |

Add channels via SQL:

```sql
INSERT INTO channels (channel_id, farm_id, name, competitor_type)
VALUES ('UCxxx', 'tantra', 'Name', 'source');
```

## Gap Map

The gap map measures: for a given search query, what % of channels visible in IN results are NOT visible in US/GB results. High gap score = high potential for cultural translation content.

Formula:
```
gap_score = in_only_channels / total_in_channels
```

Run weekly, not daily. Daily deltas in a slow niche measure search API jitter, not signal.

## Opportunity Scores

```
opportunity = 0.30 * clamp(gap_score)
            + 0.25 * clamp(language_lag)
            + 0.20 * clamp(breakout_rate)
            + 0.15 * clamp(google_trends_demand)
            + 0.10 * clamp(pageview_velocity)
```

Where `clamp(x) = max(0.1, min(1.0, x))`.

Topics with opportunity > 0.5 are pushed to the production queue.

## Reddit Intelligence

To run Reddit-based question discovery, see `operations/reddit-extraction-guide.md` in the blog repository.

This is an independent pipeline that feeds question clusters and audience language into the treatment generation stage. Reddit data is Tier 3 exploratory — it generates hypotheses, not validated conclusions.
