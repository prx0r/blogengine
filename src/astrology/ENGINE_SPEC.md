# Engine Specification — Quantitative Astrology Architecture

## Current Problems

1. **Graph stores too little** — only conditions and interpretations, not scores, orbs, timescales, houses, lots, or temporal context
2. **Practices have no relevance ranking** — all 8 practice cards look identical because the graph can't distinguish a score-12 Jupiter from a score-2 Mars
3. **No temporal awareness** — can't compare today vs yesterday, can't contextualize where today falls in the week
4. **No quantitative scoring** — confidence is qualitative (low/medium/high) with a vague rule instead of a proper numeric score
5. **Weekly timescale is dead** — `weeklyActivations = []` always
6. **Monthly lord gets dropped** — single-source signal filtered as "low" confidence

---

## Required Architecture Changes

### A. Activation Engine — What to Add

#### 1. Orb Bonus in Scoring

Current: every daily transit gets weight = 1, regardless of orb.

Proposed: weight × orb_bonus where:
```
orb < 1°   → ×3  (exceptional — tightest possible)
orb < 2°   → ×2  (very tight — clearly felt)
orb < 3°   → ×1.5 (moderate — background)
orb ≥ 3°   → ×1  (wide — present but diffuse)
```

This is pure math, not confidence. A 0.2° Sun-Moon sextile (orb bonus ×3) scores higher than a 5° Saturn-Jupiter conjunction (×1). The engine already has the orbs — it just ignores them in scoring.

#### 2. Aspect Type Modifier

Different aspect types have different traditional significance:
```
conjunction  → ×1.2
opposition   → ×1.2
square       → ×1.1
trine        → ×0.9  (harmonious = less activation pressure)
sextile      → ×0.8
```

This is applied to the transit weight before the orb bonus. A square at 0.5° = 1 × 1.1 × 3 = 3.3. A trine at 4° = 1 × 0.9 × 1 = 0.9.

#### 3. House Overlap Bonus

When multiple signals activate the same house, that house gets a compounding focus score. The formula:
```
house_focus[house] = sum of all signal scores hitting that house
if 2+ signals hit same house: focus × 1.3 (house convergence)
```

This captures "Jupiter is year lord of H4 AND Mercury transits H4" = H4 is doubly activated.

#### 4. Weekly Computation

Remove `weeklyActivations = []`. Replace with:
- Scan all transits with orb applying (phase = "separating" planets are past, "applying" are incoming)
- Group applying aspects with orbs > current separation but < 7° → "aspects approaching this week"
- Also check: is the Moon applying to any natal planet? Moon transits define the week's emotional arc.

#### 5. Yesterday Snapshot

The engine already computes everything from `targetDate`. To compare yesterday:
```
yesterdayJd = targetJd - 1
// Re-run computeActivations with yesterdayJd
// Return delta: { planet, score_change, new_transits, dropped_transits }
```

This is expensive but deterministic. Cache the result per native per day.

### B. Graph Model — What to Store

#### Current graph nodes (already exist):
```
planet:mars          [static] — registered once
sign:leo             [static]
corr:herb:basil      [static — correspondence]
spell:ficino:mars:001 [static — practice]
condition:mars_detriment [computation — per session]
```

#### New graph nodes to add per session:

```
session:2026-07-10           [session] — session container
  --started_at--> date:2026-07-10

planet:jupiter_score_12      [computation] — signal score
  --score_of--> planet:jupiter
  --value--> 12

house:4_focus_8.5            [computation] — house focus score
  --focus_of--> house:4
  --value--> 8.5

transit:sun_sextile_moon_0.2 [computation] — individual transit
  --transits_from--> planet:sun (current sky)
  --transits_to--> planet:moon (natal)
  --aspect--> aspect:sextile
  --orb--> 0.2
  --weight--> 3.6  (raw × aspect_mod × orb_bonus)

sky_aspect:sun_conjunction_mercury_4.7_space   [computation] — current sky pattern
  --involves--> planet:sun
  --involves--> planet:mercury
  --type--> conjunction
  --orb--> 4.7

timescale:yearly               [static] — timescale dimension
timescale:monthly              [static]
timescale:daily                [static]

lot:fortune                    [static]
lot:spirit                     [static]
```

#### New edges per signal:

```
session:2026-07-10
  --contains--> planet:jupiter_score_12
  --contains--> planet:mercury_score_8

planet:jupiter_score_12
  --activates_house--> house:4
  --activates_lot--> lot:fortune
  --falls_on--> timescale:yearly
  --falls_on--> timescale:daily
  --caused_by--> timing:annual_profection_lord
  --caused_by--> transit:sun_square_jupiter_3.8

planet:mercury_score_8
  --activates_house--> house:9
  --activates_lot--> lot:nemesis
  --falls_on--> timescale:daily
  --caused_by--> transit:sun_sextile_mercury_3.3
  --caused_by--> transit:moon_conjunction_mercury_3.5
```

#### Temporal comparison:

```
session:2026-07-10
  --follows--> session:2026-07-09

planet:jupiter_score_delta_+4   [computation]
  --delta_of--> planet:jupiter
  --from_session--> session:2026-07-09
  --to_session--> session:2026-07-10
  --value--> +4

transit:mars_new_on_2026-07-10  [computation]
  --new_transit--> transit:mars_conjunction_moon_2.5
  --appears_in--> session:2026-07-10
  --absent_from--> session:2026-07-09
```

### C. Practice Ranking — Quantitative Relevance %

Once the graph has scores, orbs, houses, lots, and timescales, practice relevance is a computation:

```
relevance(practice, session) = base_match × orb_bonus × house_bonus × lot_bonus

Where:
  base_match = sum of matching planet scores in session
  orb_bonus = 1 + (0.2 × count of matching tight orbs < 2°)
  house_bonus = 1 + (0.15 × count of practices's houses matching session's focus houses)
  lot_bonus = 1 + (0.1 × count of matching lots)
```

This produces a clean 0-100% relevance score. No confidence multipliers. No vague qualitative layers. Pure engine math.

### D. Astro Calendar

With the graph model above, the calendar becomes:

```
for day in next_30_days:
    snapshot = computeSnapshot(day)  # runs full engine for that day
    high_impact_days = snapshot.signals.filter(s => s.score > threshold)
    for each high_impact_day:
        dominant_planet = snapshot.signals[0]
        recommended_practices = rankPractices(dominant_planet, snapshot)
        recommended_correspondences = getCorrespondences(dominant_planet, by_relevance)
```

The threshold is math: `mean(all_scores) + 1.5 × stddev(all_scores)` for "unusually active."

---

## Implementation Order

### Phase 1: Graph + Scoring (foundation)
1. Push full signal data into graph: scores, orbs, houses, lots, timescales, aspect types
2. Add orb bonus and aspect type modifier to activation_engine.ts
3. Add yesterday comparison (store previous snapshot, compute delta)
4. Fix weekly computation (remove empty array, implement applying aspects)

### Phase 2: Practice Ranking (application)
5. Build `rankPractices(session_signals, packet) → { practice_id, relevance_%, why }[]`
6. Replace the current flat graphRecs with ranked practices
7. Add correspondences ranked by relevance to the active planet

### Phase 3: Calendar (extension)
8. Build `computeUpcoming(startDate, days = 30) → day_snapshot[]`
9. Build `detectHighImpactDays(snapshots, threshold) → alert[]`
10. Pre-generate recommendations per high-impact day

### Phase 4: Interpreters (synthesis)
11. Each tradition reads the full graph + temporal data
12. Produces one synthesis (as prototyped in synthesis.ts)
13. Convergence = "3 traditions recommend writing — here's the aspect each saw"
