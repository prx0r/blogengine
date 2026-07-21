---
name: daily-daimon
description: Interpret today's astrological ActivationPacket and deliver a daimonic morning insight
version: 1.0.0
author: Thomas Prior
metadata:
  hermes:
    tags: [astrology, daimon, daily, blueprint]
    blueprint:
      schedule: "0 6 * * *"
      deliver: telegram
      prompt: "Fetch today's astrology reading, identify the daimon planet, check yesterday's snapshot for changes, and write a compact daimonic insight with practice recommendation."
---

# Daily Daimon Reading

Deliver a compact, daimonic morning reading via Telegram.

## When to Use
- Cron runs this every morning at 6am
- Manual: "What does today look like?"

## Procedure

### 1. Fetch Today's Reading
Call the `astrology_today` tool with the user's birth data:
- year: 1999, month: 5, day: 16, hour: 14, minute: 37
- lat: 51.41, lon: -0.67
- name: "Thomas Prior"

### 2. Extract Key Data from Response
Parse the JSON response:
- `age` — current age
- `oikodespotes` — the daimon planet (personal daimon for entire life)
- `signals[0]` — top activated planet today (daily daimon)
- `dominant_mode` — "spirit", "fortune", or "mixed"
- `signals` — all active planets with scores and confidence
- `interpretation.macro` — integrated timescape analysis
- `interpretation.convergence.planets` — planets flagged by 3+ interpreters
- `graph` — correspondences and practices per planet

### 3. Check Yesterday's Snapshot
Call `snapshot_list(user_id="thomas", days=2)` to get yesterday's reading.
Compare:
- Is the daimon planet the same?
- Are any planets NEWLY active (not in yesterday's snapshot)?
- Are there any DROPPED planets?

### 4. Build the Insight (3 paragraphs max)

Format:

```
─── ☀️ Your Daimon — {day}, {date} ───

Today's sky: {top_planet} active ({daimon_tag}), {year_lord} year lord.
{planet} in {sign} in H{house} — {short_interpretation}.
{convergence_count}/5 interpreters agree: "{convergence_theme}"

{paragraph about what changed from yesterday, if anything}

─── Recommended ───
📝 {top_practice} ({duration}) — {best_hour}
🌿 {secondary_practice} — {secondary_timing}

─── {essay_title} ───
▶ Audio available ({duration} min)

─── Reply to adjust · /daimon help ───
```

### 5. Save Snapshot
Call `snapshot_save()` with the full reading data for historical comparison.

### 6. Write Journal Entry (if mood captured)
Call `journal_write()` with a brief entry noting the daimon and mood.

## Pitfalls
- Don't write more than 3 paragraphs — Telegram messages should be compact
- Don't use New Age language — be precise and sourced
- Always cite the interpreter that gave the reading ("al-Khayyāt says...")
- If the API is down, note it and skip (don't hallucinate a reading)

## Verification
- Confirm the API returned a 200 response
- Confirm the insight contains a planet name, practice, and timestamp
