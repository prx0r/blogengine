# YouTube API Research Probes

Cheap, targeted queries using videos.list (1 unit/50 videos) and search.list (1 unit/call, 100/day).

## Probe A: Channel Content Audit (0 units — just search.list)

For each of the 89 IN-only gap channels, categorize them:
- What's their primary language? (check 5 random videos)
- What's their average video length?
- What's their niche within tantra (philosophy, practice, history, deity worship)?
- Do any actually have English content (misclassified by gap algorithm)?

**Cost:** ~10 search.list calls (sample 5 per channel across 2 channels first)
**Output:** `data/research/layer2/channel-audit.json`

## Probe B: Title Pattern Mining on Real Tantra Videos (units: ~50)

Take the 16 high-gap queries. For each:
1. Search for the query in US English
2. Pull top 20 results
3. Get their titles + view counts + durations via videos.list
4. Analyze: what patterns correlate with high views?

**Tests:**
- Do Upworthy priors hold? (questions lose, imperatives win?)
- What's the median view count per query?
- What's the average video length?
- Do longer or shorter videos perform better in this niche?

**Cost:** 16 search.list + 16 videos.list = ~32 units
**Output:** Real title-performance data for our exact niche

## Probe C: Competitor Deep Dive (units: ~20)

Pick the top 8 channels we compete with (Let's Talk Religion, ESOTERICA, ReligionForBreakfast, plus 5 from market scan). For each:
1. Pull their uploads via playlistItems.list
2. Get stats on last 50 videos each (videos.list)
3. Build per-channel benchmarks:
   - Median views
   - Median like ratio
   - Most common video length
   - Title patterns (questions, colons, etc.)
   - Publish frequency
   - Breakout videos (>2x channel median)

**Cost:** 8 playlistItems + 8 videos.list = 16 units
**Output:** `data/research/layer2/competitor-benchmarks.json`

## Probe D: Gap Topic Deep Dive (units: ~10)

For the top 3 gap queries (pancha makara 0.90, tantric texts 0.73, chakra tantra 0.57):
1. Search for English videos on these topics
2. Pull their stats
3. Analyze: why do these specific topics have no English content?
   - Is it hard to research?
   - Is it too niche?
   - Is existing content just bad?

**Cost:** 3 search.list + 3 videos.list = 6 units
**Output:** Prioritized topic queue with notes

## Probe E: Channel Archetype Analysis (units: ~0, uses existing data)

From the 75 market scan channels + 89 gap channels:
1. Group channels by subscriber count tier (1k-10k, 10k-100k, 100k+)
2. For each tier, what's the median views per video?
3. What's the median upload frequency?
4. Is there a "sweet spot" of channel size for our niche?

**Cost:** 0 — uses existing market scan data
**Output:** Channel strategy recommendations

## Total Cost: ~100 units + ~32 search.list calls

Well within daily budget. Can run all of them in one session.

## Priority Order

1. **C (Competitor Deep Dive)** — most directly actionable for production
2. **B (Title Pattern Mining)** — validates our priors for our actual niche
3. **A (Channel Audit)** — clarifies the gap map
4. **D (Gap Topic Deep Dive)** — content queue prioritization
5. **E (Channel Archetypes)** — strategic positioning
