# Data & Research Map — All Datasets, Signals, and Pipeline Integration

## Overview

```
                    ┌──────────────────────────────────────┐
                    │         HERMES DECISION LOOP          │
                    │  detect → validate → produce → observe│
                    └──────────────────────────────────────┘
                                   │
        ┌──────────────────────────┼──────────────────────────┐
        │                          │                          │
        ▼                          ▼                          ▼
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│  SIGNAL LAYER     │    │  KNOWLEDGE LAYER  │    │  PRODUCTION LAYER │
│  What to produce  │    │  How to research  │    │  How to package   │
├──────────────────┤    ├──────────────────┤    ├──────────────────┤
│ Reddit           │    │ SARIT            │    │ Upworthy         │
│ YouNiverse       │    │ Muktabodha       │    │ Clickstream      │
│ Global Trending  │    │ GRETIL           │    │ Met Museum       │
│ Google Trends    │    │ Stack Exchange   │    │ DPLA             │
│ YouTube API      │    │ Translation data │    │ YouTube API      │
│ YTCommentVerse   │    │ RO library       │    │                  │
└──────────────────┘    └──────────────────┘    └──────────────────┘
```

---

## Dataset Map

### SIGNAL LAYER — What topics to produce

| Dataset | Size | What It Contains | What We Extract | Which Evidence Dimension | Pipeline Stage |
|---------|------|------------------|----------------|-------------------------|----------------|
| **Reddit** (Pushshift) | 84 GB raw / ~15 GB filtered | Submissions + comments from 30+ subreddits, 2005-2023 | Question clusters, controversy maps, recommendation graphs, narrative frames, specialist-mass translation pairs | D (demand), S (scarcity), F (audience fit) | Topic discovery, script research, risk assessment |
| **YouNiverse** | 3.2 GB | 136K channels, 72M videos, weekly stats 2005-2019 | OLS residual breakout scores, channel size effects, title feature importance, duration × category interactions, momentum effects | D (demand), F (audience fit) | Breakout metric validation, topic scoring |
| **Global Trending** | 26.4 GB | 104 countries, 3 years, trending videos | Cross-country diffusion patterns, IN→US lag times, title archetypes that travel, category-level trend maps | M (momentum), T (cross-market transfer) | Topic timing, market selection |
| **Google Trends** | API (free) | Search volume over time for any query | Western demand scores (US+GB), topic velocity, seasonal patterns | D (demand), M (momentum) | Demand validation |
| **YouTube Search API** | API (100 calls/day) | Search results per query per region | Gap scores (IN-only channels vs US/GB), supply scarcity | S (supply scarcity) | Topic validation (Stage 2, step 1) |
| **YTCommentVerse** | 10.1 GB | 32M multilingual YouTube comments | Comment intent classification, language-as-geography proxy, question-to-content gap analysis | D (demand), F (audience fit) | Audience intelligence, comment mining |

### KNOWLEDGE LAYER — How to research the topic

| Dataset | Size | What It Contains | What We Extract | Pipeline Stage |
|---------|------|------------------|----------------|----------------|
| **SARIT** | 204 MB | Sanskrit TEI XML corpus, philosophical and medical texts | Primary-source passages for fact-checking, verse context | Research pack (Stage 4) |
| **Muktabodha** | 89 MB | 570+ Shaiva Tantra e-texts (IAST + Devanagari) | Source passages, manuscript references | Research pack |
| **GRETIL** | 283 MB | Full Sanskrit corpus, Vedic through philosophical | Cross-reference for source verification | Research pack |
| **Stack Exchange** | 337 MB | Q&A from Hinduism, Buddhism, Philosophy, History, Mythology | Community-validated explanations, audience-level questions, terminology | Script research, audience language |
| **Translation datasets** (BPCC, Samanantar, IITB, etc.) | ~650 MB | Sanskrit→English, Hindi→English parallel corpora | Translation of primary sources | Research pack (deferred) |

### PRODUCTION LAYER — How to package the video

| Dataset | Size | What It Contains | What We Extract | Pipeline Stage |
|---------|------|------------------|----------------|----------------|
| **Upworthy Research Archive** | 122 MB | 32K headline A/B tests, causally identified | Title feature win rates, pairwise title ranker, Bayesian posteriors | Title generation, packaging |
| **Clickstream** (Wikimedia) | 4.2 GB | Wikipedia navigation paths | Gateway entity graph (Kali→Chinnamasta), narrative entry frames | Title framing, hook design |
| **Met Museum Open Access** | 303 MB | 470K CC0 museum objects with metadata | Visual assets filtered by culture/period, image embeddings | Thumbnail composition |
| **DPLA** | ~5 GB | Millions of cultural heritage objects (CC0) | Supplementary visual assets | Thumbnail composition |
| **YouTube API** | API (10K units/day) | Channel videos, stats, comments | Breakout detection, performance snapshots, A/B test results | Publish, observe, update |

---

## Evidence Dimensions — Which Datasets Feed Which

```
AUDIENCE DEMAND (D)
├── Reddit question clusters (frequency, persistence, cross-subreddit spread)
├── Google Trends (western search volume)
├── YouNiverse breakout (related topics broke out = audience exists)
├── YouTube Search API (search volume per query)
└── YTCommentVerse (comment language indicates demand geography)

SUPPLY SCARCITY (S)
├── YouTube Gap Map (YouTube Search API: IN-only vs US/GB channels)
└── Reddit controversy map (lots of disagreement = underserved explanation)

TOPIC MOMENTUM (M)
├── Google Trends velocity (rising/falling over 12 months)
├── YouNiverse breakout per year (is this topic growing?)
├── Global Trending (is it appearing in trending feeds?)
├── Reddit language drift (definitional → practical → troubleshooting phases)
└── Reddit topic velocity (rising/falling question frequency)

CROSS-MARKET TRANSFER (T)
├── Global Trending (IN→US/UK diffusion patterns)
├── Clickstream gateway graph (gateway entities exist in English Wikipedia)
└── YouTube Search API (appears in US searches despite IN origin)

PRODUCTION VIABILITY (V)
├── SARIT + Muktabodha + GRETIL (source depth = can we research this?)
├── Met Museum + DPLA (visual depth = can we illustrate this?)
├── Stack Exchange (audience question depth = script material available)
├── Reddit recommendation graph (what sources does the community recommend?)
└── Reddit source canon (which texts/teachers are authoritative?)

AUDIENCE-TOPIC FIT (F)
├── Reddit specialist-mass translation gap (does our channel's audience match?)
├── Reddit cross-subreddit role comparison (specialist vs practitioner vs mass)
├── YouNiverse channel profile similarity (similar channels had breakout on this)
└── YTCommentVerse (comment language matches our audience's language)
```

---

## Pipeline Stage → Dataset Dependencies

```
STAGE 1: SIGNAL DETECTION
  Reddit opportunity scores (D, M, F)
  + YouTube gap scores (S)
  + YouNiverse breakout (D, F)
  → Candidate topic list

STAGE 2: TOPIC VALIDATION
  Google Trends (D) — is there search demand?
  + Gap map (S) — is it underserved?
  + Reddit question map (D, F) — are people asking about it?
  + Global Trending (M, T) — is it spreading geographically?
  + Clickstream gateways (F, T) — can people find it?
  → Validated topic with evidence dimensions

STAGE 3: OPPORTUNITY SCORING
  Weighted combination of D + S + M + T + V + F
  Each dimension from its contributing datasets
  → Score with uncertainty per dimension

STAGE 4: RESEARCH PACK
  SARIT + Muktabodha + GRETIL (source passages)
  + Stack Exchange (audience questions, explanations)
  + Reddit recommendation graph (sources to cite)
  + Reddit controversy map (fault lines to address)
  + Reddit language translation (terms to define/avoid)
  → Claim graph with sourced passages

STAGE 5: PACKAGE GENERATION
  Upworthy title priors (Bayesian posteriors)
  + Clickstream gateway graph (title framing)
  + Reddit narrative frames (hook structure)
  + Met Museum + DPLA (thumbnail assets)
  → Title-thumbnail-hook package

STAGE 6: PUBLISH
  YouTube API (upload)
  → Published video

STAGE 7: OBSERVE
  YouTube API (analytics at 24h/7d/28d/90d)
  → Performance snapshots

STAGE 8: UPDATE
  All upstream models update with outcome data
  Bayesian title engine: new A/B data → posterior update
  Opportunity dimensions: compare predicted vs actual performance
  → Improved priors for next topic
```

---

## Research Proposals Status

```
READY TO RUN (submissions data in R2):
├── Proposal 2: Recurring Question Predictive Value
│      What: Question frequency × persistence predicts video demand
│      Validation: Google Trends correlation
│      Status: ready_to_run
├── Proposal 7: Language Drift Timing Predictor
│      What: Question phase transitions predict optimal production moment
│      Validation: YouTube search trend correlation
│      Status: ready_to_run
└── Proposal 5: Narrative Frame Extraction
       What: Extract story structures from personal-story posts
       Validation: Manual review + later retention comparison
       Status: ready_to_run (submissions only)

BLOCKED ON COMMENTS DATA:
├── Proposal 1: Specialist-Mass Translation Gap
│      Why: Needs comment text from both specialist and mass subs
├── Proposal 3: Controversy-Driven Engagement
│      Why: Needs claim/stance extraction from comment threads
└── Proposal 6: Source Authority Cross-Validation
       Why: Needs source mention extraction from comments

BLOCKED ON OTHER DATA:
├── Proposal 4: Gateway Entity Predictor
│      Why: Needs clickstream data processed into gateway graph
│      Unblock: Process clickstream R2 data (~4.2 GB) into D1 lookup table
```

---

## Dataset Sizes & Costs

| Dataset | Raw Size | In R2? | R2 Cost/mo | Processed Outputs | Value |
|---------|----------|--------|-----------|-------------------|-------|
| Reddit submissions (filtered) | ~500 MB | ✅ | $0.01 | Question clusters, controversy maps | Critical |
| Reddit comments (filtered) | ~15 GB expected | 🔄 Uploading | $0.23 | Translation pairs, source canon | Critical |
| YouNiverse | 3.2 GB | ✅ | $0.05 | Breakout scores, feature importance | High |
| Global Trending | 26.4 GB | ✅ | $0.40 | Diffusion patterns, IN→US lag | Medium |
| Upworthy | 122 MB | ✅ | $0.00 | Title priors, pairwise ranker | High |
| Clickstream | 4.2 GB | ✅ | $0.06 | Gateway entity graph | Medium |
| Met Museum | 303 MB | ✅ | $0.00 | Visual asset embeddings | Medium |
| YTCommentVerse | 10.1 GB | ✅ | $0.15 | Comment intent model | Low (deferred) |
| SARIT / Muktabodha / GRETIL | ~576 MB | ✅ | $0.01 | Source passage retrieval | High (for research packs) |
| Stack Exchange | 337 MB | ✅ | $0.01 | Q&A extraction | Medium |
| Translation datasets | ~650 MB | ✅ | $0.01 | Parallel corpora | Low (deferred) |
| DPLA / Smithsonian | ~15 GB | ❌ | N/A | Supplementary visuals | Low (nice to have) |

---

## Quick Reference: Dataset → Action

| If you want to... | Use... | How |
|-------------------|--------|-----|
| Find what topics have demand | Reddit question clusters + Google Trends | Cross-subreddit question frequency × Trends volume |
| Check if a topic is underserved | YouTube gap map | IN-only vs US/GB channel ratio for relevant queries |
| Time a video release | Reddit language drift + Global Trending | Phase 1→2 transition + IN→US diffusion lag |
| Find the right hook | Reddit narrative frames + Clickstream gateways | Gateway entity as framing device + proven narrative structure |
| Write the script | Reddit question deep-dive + Stack Exchange + SARIT | Audience question → specialist answer → objections → sources |
| Pick titles that work | Upworthy Bayesian posteriors | Statement > question, "What"/"How" > "Why", imperatives win |
| Find visuals | Met Museum CLIP embeddings | Topic embedding → similarity search → CC0 museum objects |
| Validate your priors | YouTube API + decision ledger | Publish → measure → update Bayesian posteriors |

---

## Key Insight: The Moat Is Not Any Single Dataset

No single dataset makes this system defensible. The moat is the **integration** — taking Reddit's audience questions, cross-referencing with YouTube's supply gap, validating with Google Trends demand, enriching with clickstream gateways and museum visuals, packaging with Upworthy's causally-identified title priors, and feeding everything back through the decision ledger.

A competitor could license Reddit data. They could download YouNiverse. They could run the same gap score queries. What they can't easily replicate is the **structured transformation** — the claim that "for topic X, the specialist community says Y, the mass audience thinks Z, the gateway entity is W, and the proven narrative frame is Q" — produced automatically for any topic in any niche.
