---
name: schedule-ritual
description: Find the optimal planetary hour for a recommended practice and schedule it
version: 1.0.0
author: Thomas Prior
metadata:
  hermes:
    tags: [astrology, practice, timing, scheduling, blueprint]
    blueprint:
      schedule: "0 20 * * *"
      deliver: origin
      prompt: "Check tomorrow's astrology and schedule the best planetary hours for recommended practices."
---

# Schedule Planetary Practice

Find the optimal planetary hour for a given practice and create a calendar entry or notification.

## When to Use
- "When should I do the {practice} today?"
- After receiving a practice recommendation
- Evening cron: pre-schedule tomorrow's practices

## Procedure

### 1. Get Tomorrow's Reading (when running as evening cron)
If running at 8pm, compute tomorrow's astrology:
- Call `astrology_tool()` with the same birth data
- The API computes for the current date — for tomorrow, add 1 day

### 2. Determine the Target Planet
The practice is linked to a planet. Identify which planet:
- Read the practice's `planets[]` field
- The primary planet is the first in the array

### 3. Compute Planetary Hours
Planetary hours follow the Chaldean order:
- Day hours: sunrise to sunset divided by 12
- Night hours: sunset to sunrise divided by 12
- First hour of the day is ruled by the day ruler (Sunday=Sun, Monday=Moon, etc.)
- Each subsequent hour follows: Saturn → Jupiter → Mars → Sun → Venus → Mercury → Moon

The hour ruler for hour N:
```
Rulers: [Saturn, Jupiter, Mars, Sun, Venus, Mercury, Moon]
First hour = day_ruler (index based on day of week)
Hour N = rulers[(start_index + N) % 7]
```

### 4. Find the Best Hour
Find the planetary hour(s) matching the target planet:
- Look for hours where the ruler matches the practice's primary planet
- Prefer daytime hours (for ease)
- Prefer hours when the planet is also in an active timing source

### 5. Format Schedule

```
─── Practice Schedule ───

📝 {practice_name} — {planet}
   Best time: {hour}:00-{hour+1}:00 (ruled by {planet})
   Duration: {estimated_minutes} min

🌙 Alternative: {hour}:00-{hour+1}:00 (night hour)

📅 Planetary day: {day_name} (ruled by {planet})
```

## Pitfalls
- Planetary hours depend on latitude for sunrise/set. The current API defaults to lat=0.
- For precise hours, compute: sunrise = 6:00, sunset = 18:00 (equator approximation)
- Moon phase is also relevant for lunar practices
- Don't schedule a practice for 3am unless it's specifically a night practice

## Verification
- The scheduled hour's ruler matches the practice's planet
- The time is reasonable (not 3am unless intentional)
