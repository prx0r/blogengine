---
name: deep-analysis
description: Produce a gold-standard-quality astrological analysis using the full packet data and LLM synthesis
version: 1.0.0
author: Thomas Prior
metadata:
  hermes:
    tags: [astrology, analysis, gold-standard, deep-reading]
---

# Advanced Astrological Analysis

Produce a deep, gold-standard-quality reading using the full deterministic packet and LLM synthesis.

Target quality: the gold standard reference at `content/astrology/GOLD_STANDARD.md`.

## When to Use
- "Give me a deep reading"
- "Analyze today in detail with all techniques"
- After the daily daimon, for a deeper dive

## Procedure

### 1. Fetch Full Reading
Call `astrology_tool()` with the user's birth data.

### 2. Extract Structured Data
Build the prompt payload from the response:

**Birth Data:**
- Year, month, day, hour, minute, lat, lon
- Ascendant sign
- Natal planets (sign, degree, house, retrograde, dignities)

**Today's Signals (sorted by strength):**
For each signal: planet, score, confidence, timing_sources, activated_houses, activated_lots

**Timing Lords:**
- Year lord (annual profection)
- Month lord (monthly profection)
- Firdaria lord (if present)
- ZR Spirit/Fortune lords (if present)

**Planet Conditions:**
For each planet: sign, house, angularity, dignities, retrograde, sect status

**Daimon (Oikodespotes):**
- Planet, score, interpretation, soul choice

**Convergence:**
- Planets flagged by 3+ interpreters
- Themes agreed upon

**Aspect Patterns:**
- Natal aspect patterns (grand trine, T-square, etc.)
- Current transits with orbs

### 3. Apply the Forecasting Stack
Structure the analysis as:
1. **Year frame**: "This is a year of X because [technique]. Today's transits serve this."
2. **Month filter**: How the monthly profection focuses the year.
3. **Today's landscape**: Top configurations by intensity, using aspect grammar.
   - Separate PERSONAL transits (hit natal planets) from COLLECTIVE (sky aspects).
   - Name specific orbs, natal targets, dignities.
4. **What this means for YOU**: Connect to the natal chart specifically.
5. **Daimon/purpose thread**: How the personal daimon is involved.
6. **Recommended action**: Specific, actionable, data-referenced.

### 4. Apply the Aspect Grammar
Every transit interpretation uses:
[Transiting planet] [action verb] [natal planet/house] [quality] [context].

Verb map:
- Sun: present, lead, express, clarify, center
- Moon: respond, nurture, attune, feel, protect
- Mercury: communicate, write, revise, question, connect
- Venus: relate, beautify, harmonize, value, choose
- Mars: initiate, assert, cut, pursue, defend
- Jupiter: expand, teach, grow, publish, advise
- Saturn: structure, commit, delay, limit, master

### 5. Call the LLM
Use the opencode API via POST to generate the narrative.
System prompt: professional astrologer using Hellenistic techniques.
Temperature: 0.3. Max tokens: 30000.

### 6. Post-Validation
Check the LLM output for:
- All planet names are valid (sun, moon, mercury, etc.)
- All house numbers are 1-12
- All technique names exist in the data
- No generic planet descriptions that aren't grounded in data

If validation fails, return the deterministic synthesis instead.

## Pitfalls
- ONLY reference data present in the packet — no generic planet descriptions
- EVERY claim must trace to a specific orb, house, sign, or dignity
- Do NOT mention Zodiacal Releasing if not in the data
- Do NOT make up Egyptian bounds or terms if not computed
- If the LLM call fails, fall back to the deterministic synthesis text

## Verification
- The reading follows the 6-part structure
- Every claim references specific data
- No hallucinated techniques or planets
