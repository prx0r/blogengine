# Refinement Protocol — Hypothesis → Probe → Validate → Refine

Every insight we generate must be stress-tested before it becomes a pipeline decision. This document tracks the process.

## The Loop

```text
Hypothesis (from data analysis)
  → Live Probe (YouTube API, 10-100 calls)
  → Validate (does the real world agree?)
  → Refine (update engine, tighten threshold)
  → Repeat
```

## Why This Exists

We have 50+ spec files and ~7 validated claims. The gap between "the data suggests X" and "X is true for YouTube audiences in 2026" is where most projects fail. Live probes are cheap (100 YouTube API calls = 100 units, we have 10k/day). Use them.

## Current Engines and Their Validation State

| Engine | Status | Last Probe | Next Probe |
|--------|--------|------------|------------|
| E1: Headline Score | Shadow (soft priors only) | — | A/B test on first 5 video titles |
| E2: Gap Score | Pattern confirmed (16/30) | — | Test if high-gap topics predict video performance (needs 10+ videos) |
| E3: Question (Reddit) | BROKEN — clustering collapsed | — | Needs rebuild with stratification |
| E4: Controversy (Reddit) | Blocked — no comments data | — | — |
| E5: Gateway (Clickstream) | Not started | — | — |
| E6: Trend | Partial | — | Compare gap scores to Google Trends direction |
| E7: Breakout | Differentiated, not validated | A1-A3 on YouNiverse | Redo as Tier 1 with time-series outcome |
| E8: Visual | Not started | — | — |
| E9: Source | Not started | — | — |
| E10: Decision Ledger | Not built | — | — |

## Probe Design Rules

1. **One question per probe.** "Does gap score predict breakout?" not "How does the pipeline perform?"
2. **Falsifiable.** State what result kills the hypothesis.
3. **Cheap.** Target < 500 YouTube API units. If it costs more, find a proxy.
4. **Time-boxed.** Set a deadline. If the answer isn't clear after X calls, move on.

## Probe Ideas (Ready to Run)

### P1: Title Prior Transfer Test
Do Upworthy priors (questions lose, imperatives win) hold for YouTube search performance?
- Search for 10 tantra topics with question-headline videos vs statement-headline videos
- Compare title CTR from search result snippets
- Falsification: Question-headline videos have HIGHER avg CTR than statement-headline videos
- Cost: 20 search.list calls (2,000 units)

### P2: Gap Score → Search Volume Correlation
Do topics with high gap scores have higher search volume?
- Pick 5 high-gap (>0.5) and 5 low-gap (<0.2) queries
- Run YouTube search.list and compare result counts
- Falsification: Low-gap queries have EQUAL or HIGHER result counts
- Cost: 10 search.list calls (1,000 units)

### P3: Breakout Metric Check on Live Data
Does OLS residual breakout (from 2019 YouNiverse) predict anything in 2026?
- Pick 5 channels from Stage 1
- Pull their last 50 videos via videos.list
- Compute OLS residual for each
- Ask: do any patterns match the 44% differentiation finding?
- Cost: 5 channels.list + 50 videos.list (55 units)

## Results Log

| Date | Probe | Hypothesis | Result | Action |
|------|-------|-----------|--------|--------|
| — | — | — | — | — |

## Rules

1. Document ALL probes, including null results
2. If a probe costs > 500 units and returns nothing, flag the approach as wrong
3. Update engine confidence scores after each probe
4. Never delete a probe result — failed probes are as valuable as successful ones
