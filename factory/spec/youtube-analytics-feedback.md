# YouTube Analytics Feedback Loop

## Vision

The factory currently produces packs but has no feedback on whether they're actually good. YouTube API analytics can close the loop:

```
Production → YouTube → Analytics → Rule Update → Better Production
```

## What YouTube API Provides

- **Retention graph** per video — which seconds lose viewers
- **Chapter drop-off** — which chapters underperform
- **CTR** — thumbnail and title performance
- **Audience demographics** — who's watching
- **Comments** — qualitative feedback
- ** traffic sources** — how people find the content

## How to Connect

### 1. Tag each video with production metadata
```json
{
  "youtube_video_id": "abc123",
  "factory_job_id": "essay-33-v2",
  "slug": "essay-33",
  "production_date": "2026-07-24",
  "model_used": "deepseek-v4-flash",
  "stages_completed": 13,
  "retries_per_stage": {"motif_manufacturability": 2, "storyboard": 0},
  "shot_count": 37,
  "gold_score": 0.82
}
```

### 2. Fetch analytics after 7 days
```python
def fetch_retention(video_id):
    api = build('youtubeAnalytics', 'v2', credentials=creds)
    return api.reports().query(
        ids='channel==MINE',
        startDate='2026-07-24',
        endDate='2026-07-31',
        metrics='estimatedMinutesWatched,averageViewDuration',
        dimensions='video,chapter',
        filters=f'video=={video_id}'
    ).execute()
```

### 3. Map retention drops to specific shots
If chapter 3 drops 40% of viewers at shot 22, find shot 22 in the storyboard:
```json
{
  "shot_id": 22,
  "spoken_passage": "The One reflects across all facets...",
  "visual_mode": "facet_array",
  "duration": 6.5,
  "retention_drop": -0.40,
  "hypothesis": "Visual too abstract for the philosophical claim"
}
```

### 4. Generate production rules from patterns
```sql
INSERT INTO production_rules (rule_id, trigger, failure, correction, confidence)
VALUES (
  'youtube-017',
  'shot retention drop > 30% in first 7 days',
  'visual_audio_alignment mismatch',
  'add concrete metaphor layer before abstract claim',
  0.75
);
```

## Analytics-Driven Metrics

| Metric | Source | What it tells us |
|--------|--------|-----------------|
| Average view duration | YouTube API | Overall engagement |
| Chapter retention | YouTube API | Which concepts work visually |
| Best practice score | Manual review | How close to gold standard |
| Comment sentiment | NLP on comments | Audience understanding |
| Repair frequency | Factory DB | Which stages are weakest |
| First-pass approval rate | Factory DB | How well the system works |

## The Dynamic System

```
YouTube API ──┐
              ▼
      ┌─────────────────┐
      │ Retention Mapper│──→ storyboard + retention overlay
      └────────┬────────┘
               ▼
      ┌─────────────────┐
      │ Rule Generator  │──→ production_rules table
      └────────┬────────┘
               ▼
      ┌─────────────────┐
      │ Prompt Updater  │──→ Updated stage prompts with 
      │                  │    learned patterns
      └────────┬────────┘
               ▼
      ┌─────────────────┐
      │ Next Production │──→ Better videos
      └─────────────────┘
```

## Implementation Priority

1. ✅ Tag every production with job metadata (can do now — just add to visual_program.json)
2. ⬜ YouTube API auth (needs OAuth setup — refresh token flow)
3. ⬜ Weekly analytics fetch (cron job or Cloudflare Workers cron trigger)
4. ⬜ Retention-to-shot mapper (join YouTube chapter data with storyboard)
5. ⬜ Rule generator (LLM call: "given this retention pattern and storyboard, what should change?")
6. ⬜ Prompt updater (inject learned rules into stage prompts)
