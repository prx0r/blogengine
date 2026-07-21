---
name: weekly-review
description: Aggregate the week's snapshots into a structured weekly review
version: 1.0.0
author: Thomas Prior
metadata:
  hermes:
    tags: [astrology, daimon, weekly, review, blueprint]
    blueprint:
      schedule: "0 9 * * 0"
      deliver: telegram
      prompt: "Aggregate the past 7 days of astrology snapshots, compute mood and planet frequency patterns, and deliver a weekly synthesis with insights."
---

# Weekly Daimonic Review

Deliver a weekly synthesis of the past 7 days' astrological patterns.

## When to Use
- Cron runs every Sunday at 9am
- Manual: "How was my week?"

## Procedure

### 1. Fetch the Week's Snapshots
Call `snapshot_list(user_id="thomas", days=7)`.

### 2. Aggregate Patterns
For each snapshot in the results:
- Track which planets were active each day
- Count frequency: "Mercury active 4 days this week"
- Note the daimon planet each day
- Track dominant_mode shifts (spirit vs fortune days)
- Extract mood signals from journal entries (if available)

### 3. Compute Statistics
```
Planets active this week:
  Mercury: 4 days (high)
  Saturn:  3 days (high)
  Venus:   2 days (moderate)

Convergence: Mercury-Saturn was the dominant theme.

Patterns (from diary correlation):
  When Mercury active + writing: mood 4.2
  When Mercury active + no writing: mood 2.8
```

### 4. Format the Weekly Review

```
─── 📊 Your Week in Review ───

Mood: 3.8/5 (↑0.2 from last week)
Energy: 3.2/5 (→ consistent)

Planets active this week:
  Mercury: 4 days (high)
  Saturn:  3 days (high)
  Venus:   2 days (moderate)

Convergence: Mercury-Saturn was the dominant theme.
Your diary shows 3 entries about financial analysis work.
Mood was 4.5 on Mercury-active days vs 3.0 on non-Mercury days.

─── Patterns ───
When Mercury is active and you write: mood 4.2
When Mercury is active and you don't write: mood 2.8

─── Shadow note ───
When Saturn is active, your entries mention "blocked" or "stuck."
Consider the Warming Saturn Practice next time Saturn peaks.
```

### 5. Save the Review
Call `journal_write(kind="weekly_review")` with the review text.

## Pitfalls
- If there are fewer than 3 snapshots, note "not enough data for pattern detection"
- Don't over-interpret small samples — note confidence
- Mood correlation requires at least 3 data points per planet

## Verification
- At least 3 snapshots were available
- Each claimed pattern references specific data
