# Production Pipeline Guide

## Co-Host Format

Every script is speaker-tagged: HOST and AI-COHOST.

- **HOST** (you): reactions, questions, pacing, keeping the flow. Recorded in your voice.
- **AI-COHOST** (TTS): exposition, source readings, historical context, philosophical explanations.

This cuts your recording load (only HOST lines), strengthens authenticity (real human reacting live), and naturally varies the video feel.

## Pipeline Stages

```
1. research_gap           → Query D1 for gap scores on this topic
2. build_research_pack    → Extract sourced claims with exact locators
3. fact_check             → Every claim must have a source (F01-F04 gates)
4. WAIT_FOR_APPROVAL     → Human reviews research pack + sources
5. generate_treatment     → Title, hook, beat sheet, source list
6. write_script           → HOST/AI-COHOST dialogue with validation gates
7. WAIT_FOR_VOICEOVER    → Human records HOST lines. Dashboard shows script.
8. generate_ai_audio      → TTS for AI-COHOST lines only (halves the cost)
9. interleave_audio       → Merge HOST recording + AI TTS into one timeline
10. render                → Push to FFmpeg or FableCut
11. WAIT_FOR_APPROVAL    → Human reviews final render
12. publish               → YouTube. "Altered or synthetic" checkbox checked.
                          → Publishing autonomy: NEVER for historical/religious claims.
```

## Fixed 8-Beat Structure

1. Frightening claim or mystery question
2. Strongest surviving image or story
3. What the earliest text actually says
4. What later folklore added
5. Why the practice made philosophical sense
6. What historians can verify
7. What modern channels commonly get wrong
8. Why the subject still matters

## Fact-Check Gates

```
F01: Every historical claim has a traceable primary or academic secondary source
F02: Claims marked with certainty level (confirmed/consensus/traditional/disputed)
F03: No core factual claim lacks a source
F04: Sources verified against research corpus
```

## YouTube Risks

- **Authentic content policy (July 2025):** Targets formulaic, mass-produced template channels. Human voiceover is the strongest signal against this. The 8-beat structure is structural, not templated prose — each topic demands different research.
- **16 channels demonetized Jan 2026** for "mass-produced/templated content." Real voice + varied research = best defense.
- **videos.insert costs 1,600 quota units.** ~6 uploads/day with 10k daily quota.
- **No auto-publish** for historical or religious claims content. Permanent rule.
