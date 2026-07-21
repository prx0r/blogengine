# Signal System — Intelligence Layer for the Factory

## What Makes Something "High Signal"

Signal = confluence of independent indicators pointing at the same topic.

```
                    Market Demand (external)
                           │
              ┌────────────┼────────────┐
              │            │            │
         Competitor    Search/View   Seasonal/
         Breakouts     Volume        Cultural
              │            │            │
              └────────────┼────────────┘
                           │
                    Confluence Score
                           │
              ┌────────────┼────────────┐
              │            │            │
         Our Content    RO Depth     Our Channel
         Performance    (can we     (does this fit
         (does this     make good   our audience?)
          work for us?)  content?)  
              │            │            │
              └────────────┼────────────┘
                           │
                    SIGNAL SCORE (0-1)
                           │
                     decision: act?
```

## Signal Sources

### Source 1: Market Scan (external, weight: 0.3)

From the YouTube breakout data. Metrics per topic:

| Metric | Formula | Weight |
|--------|---------|--------|
| Competitor breakout multiplier | avg(multiplier) for topic | 0.4 |
| Competitor breakout count | # breakouts in topic | 0.3 |
| Competitor channel size | smaller = more signal (gap exists) | 0.2 |
| Recency | more recent = higher | 0.1 |

**Example — Theurgy:** Esoterica at 3.1x, tiny channel doing theurgy. Raw market signal: 0.78

### Source 2: Our Analytics (internal, weight: 0.3)

From our own YouTube videos. Metrics:

| Metric | Formula | Weight |
|--------|---------|--------|
| Retention by topic | avg(retention) for videos on topic | 0.3 |
| Views vs baseline | (views / channel avg) for topic | 0.3 |
| Subscriber conversion | subs gained / views for topic | 0.2 |
| Comment rate | comments / views | 0.2 |

**Example — Corbin:** Our Corbin video at published status, 40 blocks. No analytics yet (not uploaded). Falls back to content quality score.

### Source 3: Content Readiness (internal, weight: 0.2)

Can we actually make good content on this topic?

| Metric | Formula | Weight |
|--------|---------|--------|
| RO count for topic | # of ROs | 0.3 |
| RO quality | avg(RO score) for topic | 0.3 |
| Art available | # of relevant art entries | 0.2 |
| Essay readiness | # of ready-to-write essays | 0.2 |

**Example — Theurgy:** 3 ROs (iamblichean-theurgy at score 4, shaw-theurgy at 4, chaldean-oracles at 4). No art tagged. Raw readiness: 0.55

### Source 4: Channel Fit (internal, weight: 0.2)

Does this topic fit our channel identity and audience expectations?

| Metric | Formula | Weight |
|--------|---------|--------|
| Series alignment | is topic in planned 56 videos? | 0.3 |
| Format compatibility | can our video pipeline produce it? | 0.3 |
| Differentiation | how many competitors cover it? | 0.4 |

**Example — Theurgy:** In planned videos (#44 The Operation). Pipeline supports it. Zero competitors doing theurgy deep dives. Raw fit: 0.85

## Signal Scoring Engine

```python
def compute_signal(topic, market_data, our_analytics, content_inventory):
    market = score_market(topic, market_data)        # 0.78
    analytics = score_analytics(topic, our_analytics) # 0.50 (fallback)
    readiness = score_readiness(topic, content_inventory) # 0.55
    fit = score_channel_fit(topic)                    # 0.85
    
    score = (
        market * 0.3 +
        analytics * 0.3 +
        readiness * 0.2 +
        fit * 0.2
    )
    
    # Boost for confluence: if 3+ sources agree, add 0.1
    high_sources = sum([market > 0.6, analytics > 0.6, readiness > 0.6, fit > 0.6])
    if high_sources >= 3:
        score += 0.1
    
    # Decay: signals older than 90 days lose 50% weight
    age_days = (today - signal_date).days
    if age_days > 90:
        score *= 0.5
    
    return min(score, 1.0)
```

## Signal Thresholds

| Score | Action | Example |
|-------|--------|---------|
| ≥ 0.8 | **Charge** — full production, priority queue slot | Theurgy (0.82) |
| 0.6-0.8 | **Test** — produce one video, monitor analytics | Yogi Watch (0.71) |
| 0.4-0.6 | **Explore** — create RO, write essay, no video | Jung comparison (0.52) |
| < 0.4 | **Monitor** — add to scan, don't produce | Sanskrit content (0.22) |

## Current Signal Scores (from today's data)

### Charge (≥ 0.8)
| Topic | Score | Sources | Why |
|-------|-------|---------|-----|
| **Theurgy** | 0.82 | Market: 0.78, Fit: 0.85, Readiness: 0.55 | Esoterica proved demand. We have 3 ROs. Zero competitors. Planned in 56 videos. |
| **Abhinavagupta** | 0.85 | Fit: 0.95, Readiness: 0.80 | Untouched by any competitor. We have 17 tantraloka ROs. You want to be his home. Planned in 8 videos. |

### Test (0.6-0.8)
| Topic | Score | Sources |
|-------|-------|---------|
| **Yogi Watch series** | 0.71 | Market: 0.75 (SittingNow pattern), Fit: 0.70, Readiness: 0.65 |
| **Western Tantra comparison** | 0.68 | Market: 0.72 (Vimarsha comparison), Fit: 0.70, Readiness: 0.60 |
| **Abhinavagupta vs Iamblichus** | 0.66 | Market: 0.60, Fit: 0.80, Readiness: 0.55 |

### Explore (0.4-0.6)
| Topic | Score |
|-------|-------|
| "Tantra Isn't What You Think" | 0.52 |
| Dark side of tantras | 0.48 |
| Corbin vs Jung | 0.44 |

## The Hypothesis Object (HO) Lifecycle

```
SIGNAL ≥ 0.8 → HO proposed (auto)
SIGNAL 0.6-0.8 → HO proposed (manual review)
SIGNAL < 0.6 → no HO

HO.status flow:
  proposed → in_production → published → monitoring → validated / rejected
                                                    │            │
                                                    ▼            ▼
                                              implications    refine signal
                                              → new HOs       model
```

## Integrating with the Factory

The factory cron currently reads:
1. `content/factory/ro-queue.json` — ROs ready for essay

It should also read:
2. `data/hypotheses/` — HOs with confidence ≥ 0.6
3. `data/market/patterns.json` — latest signal scores

Priority order:
1. HIGHEST: HO with status=proposed AND confidence ≥ 0.8 (charge)
2. HIGH: RO with matching topic to an active HO (theurgy RO gets priority)
3. NORMAL: Next RO in queue by score
4. LOW: HO with confidence 0.6-0.8 (test — produce one, monitor)

## What to Build Next

1. **Signal scoring script** — reads market data + our analytics + content inventory, outputs signal scores per topic, updates `data/market/scores.json`
2. **HO generator** — when signal ≥ 0.8, auto-create HO, save to `data/hypotheses/`
3. **Cron update** — read HOs alongside RO queue, prioritise high-confidence signals
4. **Analytics connector** — after video upload, after 30 days, check performance vs HO.target and set validated/rejected

The signal system makes the factory intelligent. Without it, you produce content in queue order. With it, you produce the *right* content when the data says it's time.
