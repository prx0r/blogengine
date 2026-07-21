---
name: recommend-practice
description: Match today's astrological activations to spellbook entries and recommend practices
version: 1.0.0
author: Thomas Prior
metadata:
  hermes:
    tags: [astrology, practice, spellbook, recommendation]
---

# Recommend Practice

Match the current astrological activations to practices from the spellbook and recommend the most relevant ones.

## When to Use
- "What practice should I do today?"
- "What's the best practice for {planet}?"
- After getting a daily reading: "Which practice is most aligned?"

## Procedure

### 1. Get Today's Reading
Call `astrology_tool()` with the user's birth data to get today's ActivationPacket.

### 2. Extract Active Planets
From the response `signals[]` array:
- Sort by score (highest first)
- Note each planet's confidence, timing sources, and activated houses
- Identify the daimon planet from `oikodespotes`

### 3. Query the Knowledge Graph
For each active planet (top 3), call `graph_traverse(planet="{planet}")` and look for:
- `practice_for` edges — practices linked to this planet
- `corresponds_to` edges — correspondences linked to this planet

### 4. Rank Practices
Use this scoring:
- Base: signal score of the planet
- ×1.2 if the practice's purpose matches the planet's current mode (strengthen/balance/cool)
- ×1.15 if the planet is the daimon (oikodespotes)
- ×1.1 if the practice is safe_symbolic (vs historical_reference)
- ×1.1 if the practice is from Ficino (preferred source)

### 5. Format Recommendation

```
─── Recommended Practices for Today ───

★ DAIMON PRACTICE — {practice_name}
   Planet: {planet} ({confidence} confidence, score {score})
   Purpose: {purpose}
   When: {timing}
   Procedure: {first 2 steps...}

📝 Top General Practice — {practice_name}
   Planet: {planet}
   {reasoning}

🌿 Correspondences to work with:
   {herb} · {colour} · {stone} · {incense}
```

### 6. Save to Journal
Call `journal_write()` noting which practices were recommended and which the user chose.

## Pitfalls
- Don't recommend restricted or coercive practices
- Always prefer safe_symbolic over historical_reference when both exist
- If no practices match the top planet, fall back to correspondence-based advice from planet_profiles

## Verification
- Each recommended practice has a clear trigger match
- At least 1 practice is recommended per active planet (top 3)
