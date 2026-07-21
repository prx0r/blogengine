# P4: Wikipedia Pageview Velocity

**Layer:** Signal — Demand validation
**Engine:** Trend Engine (E6)
**Dataset:** Wikimedia Pageview API (free, no auth, 100 req/s rate limit)
**Status:** Not started — zero infrastructure, can complete in 2 minutes
**Dependencies:** None

---

## Research Question

Does Wikipedia pageview velocity on tantra-related topics correlate with YouTube search demand?

If yes: we have a **free, daily-updating demand signal** for every topic, usable without quota or cost.
If no: we save ourselves from building a pipeline on a signal that doesn't transfer.

This matters because Google Trends' pre-built corpus has zero tantra keywords (confirmed — 1,845 terms, none relevant). `pytrends` works but is rate-limited. Wikipedia is free, fast, and directly measures Western curiosity.

---

## Hypothesis

Wikipedia pageviews are the first stop for Western curiosity about niche spiritual topics. A person who reads "Kashmir Shaivism" on Wikipedia today will search for it on YouTube tomorrow. Therefore:

**Primary:** Topic-level Wikipedia pageview velocity (30-day vs year-ago) correlates with YouTube Search API result counts (Spearman r ≥ 0.4).

**Secondary:** Topics with rising Wikipedia velocity also have high YouTube gap scores (≥ 0.30). If Wikipedia is measuring Western curiosity, and the gap score measures IN-only supply, then rising Wikipedia + high gap = strong opportunity signal.

**Falsification (primary):** Spearman r < 0.3 between Wikipedia pageview velocity and YouTube total result counts for 20 tantra queries.

**Falsification (secondary):** Fewer than 5 of the top-20 Wikipedia-rising topics have gap score ≥ 0.30. The rising topics are already well-served on YouTube.

---

## Preliminary Test (2 minutes, 50 API calls)

This is the minimal viability test. Run this before any further investment.

### Entity Selection (50 topics)

Grouped by expected signal strength:

```
TIER 1 — Core tantra (expect moderate pageviews):
  Kashmir_Shaivism, Tantra, Kundalini, Bhairava, Chinnamasta,
  Abhinavagupta, Tantraloka, Pratyabhijna, Spanda, Shaivism,
  Shaktism, Kaula, Sri_Yantra, Navaratri, Durga_Puja,
  Vijnana_Bhairava, Kali, Shiva, Shakti, Mahavidya,
  Kundalini_yoga, Kriya_Yoga, Shaktipata, Samadhi, Siddhi,
  Mandala, Yantra, Mantra, Tantra_techniques, Neo-Tantra

TIER 2 — Adjacent traditions (expect higher pageviews):
  Nonduality, Advaita_Vedanta, Vedanta, Yoga, Meditation,
  Buddhism, Tibetan_Buddhism, Vajrayana, Dzogchen, Mahamudra,
  Neoplatonism, Hermeticism, Theosophy, Gnosticism, Kabbalah,
  Alchemy, Mysticism, Esotericism, Occult, Western_esotericism
```

### Script

```python
import requests, json, time
from datetime import datetime, timedelta

def wiki_velocity(entity):
    """Fetch 90 days of pageviews, compute YoY velocity."""
    end = datetime.utcnow()
    start = end - timedelta(days=365)
    url = (f"https://wikimedia.org/api/rest_v1/metrics/pageviews/"
           f"per-article/en.wikipedia/all-access/all-agents/"
           f"{entity}/daily/{start.strftime('%Y%m%d')}/{end.strftime('%Y%m%d')}")
    resp = requests.get(url, headers={"User-Agent": "HermesFarm/1.0"})
    if resp.status_code != 200:
        return {"entity": entity, "error": resp.status_code}
    items = resp.json()["items"]
    # Split into recent 30 days vs same 30 days last year
    cutoff = (end - timedelta(days=60)).timestamp()
    recent = [i for i in items if i["timestamp"] >= cutoff]
    year_ago = [i for i in items if i["timestamp"] < cutoff]
    recent_avg = sum(i["views"] for i in recent) / max(len(recent), 1)
    year_ago_avg = sum(i["views"] for i in year_ago) / max(len(year_ago), 1)
    velocity = recent_avg / max(year_ago_avg, 1)
    return {"entity": entity, "velocity": round(velocity, 3),
            "recent_daily_avg": int(recent_avg),
            "year_ago_daily_avg": int(year_ago_avg)}

# Run for all 50 entities
entities = ["Kashmir_Shaivism", "Tantra", "Kundalini", ...]  # full list
results = []
for e in entities:
    results.append(wiki_velocity(e))
    time.sleep(0.1)  # rate limit

# Print rising entities
rising = [r for r in results if r.get("velocity", 0) > 1.2]
rising.sort(key=lambda x: -x["velocity"])
print(f"Rising entities ({len(rising)}):")
for r in rising[:10]:
    print(f"  {r['entity']}: {r['velocity']}x ({r['recent_daily_avg']} daily views)")
```

### Expected Outcome

If ≥10 entities show velocity > 1.2: proceed to YouTube correlation test.
If <5: the niche is not growing on Wikipedia — either already peaked or too niche.

---

## Phase 2: YouTube Correlation Test

Use YouTube Search API (search.list, 100 calls/day separate bucket) to correlate Wikipedia velocity with YouTube supply.

### Method

For the top 20 Wikipedia-rising entities (velocity > 1.2):

1. Convert entity name to a YouTube search query: "Kashmir Shaivism explained", "What is Kundalini", etc. (2-3 query variants per entity)
2. Run `search.list` for each query with `regionCode=US`, `relevanceLanguage=en`, `maxResults=15`
3. Record: `totalResults` (YouTube's estimate), `channel_count` unique channels, `in_only_channels` (channels whose defaultAudioLanguage is Hindi or region is IN)
4. Compute Spearman rank correlation between Wikipedia velocity and YouTube totalResults
5. Compute Spearman rank correlation between Wikipedia velocity and YouTube gap_score

### YouTube Search API Calls Needed

20 entities × 3 queries × 1 region (US) = 60 calls. Fits easily in 100/day limit.

### Validation Gates

```
Gate 1: ≥10 of 50 entities have Wikipedia velocity > 1.2
  → The niche has measurable Wikipedia interest

Gate 2: Spearman r ≥ 0.4 between wiki_velocity and YouTube totalResults
  → Wikipedia measures the same demand as YouTube search

Gate 3: ≥5 of top-20 rising entities have YouTube gap score ≥ 0.30
  → Rising demand + underserved supply = opportunity signal
```

---

## Phase 3: Expansion Studies

### E1: Lead Time Analysis

Does Wikipedia pageview velocity **lead** YouTube search demand, or is it coincident?

**Method:** For entities where we have 2+ years of daily Wikipedia data, find the date of peak velocity. Then check if YouTube search volume (via Google Trends, or via our Gap Engine's weekly collection) peaks in the same week or later.

**Prediction:** Wikipedia peaks 1-3 weeks before YouTube search. Wikipedia is the "what is this?" phase; YouTube is the "tell me more" phase.

**If confirmed:** Wikipedia velocity becomes a **leading indicator** — we produce content when Wikipedia is rising, before YouTube search peaks. This is the best-case scenario for production timing.

### E2: Seasonality Detection

Do tantra topics have seasonal Wikipedia traffic? (e.g., Navaratri → Kali spike)

**Method:** For entities with 3+ years of data, compute monthly average pageviews. Find peak months. Compare against Google Trends seasonal patterns.

**Use case:** Schedule production for topics that peak in specific months. Produce the Shiva video before Maha Shivaratri. Produce the Kali video before Navaratri.

### E3: Cross-Language Transfer

Do English Wikipedia pageviews for tantra topics correlate with Hindi Wikipedia pageviews? If a topic spikes in Hindi Wikipedia before English, that's an early warning that content is coming.

**Method:** Fetch same entities from `hi.wikipedia.org`. Compute cross-language lag.

**Use case:** Monitor Hindi Wikipedia for topics that haven't hit English yet — early mover advantage.

---

## Engine Integration

```
trend_engine.velocity(topic) → {
    wiki_velocity: float,        // normalized YoY change
    wiki_daily_avg: int,         // recent 30-day daily average
    wiki_lead_days: int|null,    // days Wikipedia leads YouTube search
    google_velocity: float|null, // from pytrends if available
    seasonal_peak: string|null,  // month of peak traffic
}
```

**Cost:** $0. Zero API costs. Run daily as a cron: 50 API calls × 100ms = 5 seconds.

**Frequency:** Daily. Wikipedia data updates with ~24h lag. Cron at 06:00 UTC.

---

## Quick Reference

| Step | What | API Calls | Time | Gate |
|------|------|-----------|------|------|
| Preliminary | 50 Wikipedia pageview fetches | 50 (free) | 2 min | ≥10 entities > 1.2 velocity |
| Phase 2 | 20 entities × 3 YouTube queries | 60 (search.list) | 5 min | r ≥ 0.4, ≥5 gaps ≥ 0.30 |
| E1 | Lead time analysis | Same data | 1 hour analysis | Lead ≥ 1 week confirmed |
| E2 | Seasonality | Same data + 3yr history | 1 hour | Peak months identified |
| E3 | Cross-language | 50 Hindi API calls | 2 min | Cross-language lag measurable |

**Run the preliminary test first.** If ≥10 entities have velocity > 1.2, proceed. If not, the niche is flat — move on to other signals.
