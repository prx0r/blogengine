# Global YouTube Trending Pipeline

## Source

- **Paper:** arXiv:2510.23645 (ICWSM 2026)
- **Data:** Illinois Data Bank DOI 10.13012/B2IDB-9307654_V1
- **License:** CC BY

## Dataset Contents

Three years of YouTube Trending page snapshots: July 1, 2022 → June 30, 2025.

- 446,971 snapshots from 104 countries
- 726,627 unique videos
- 78.4M video entries (each video appears in multiple snapshots)
- 4 snapshots per day per country
- Up to 200 trending videos per snapshot

### Schema

Each record in the dataset:

| Field | Type | Description |
|-------|------|-------------|
| snapshot_time | datetime | When the trending page was fetched |
| country | string | ISO 3166-1 alpha-2 country code |
| rank | int | Position on trending page (1-200) |
| video_id | string | YouTube video ID |
| channel_id | string | YouTube channel ID |
| category | string | YouTube category |
| title | string | Video title |
| description | string | Video description |
| tags | string | Comma-separated tags |
| channel_name | string | Channel display name |
| language | string | Video language |
| live_status | boolean | Was this a live stream? |
| view_count | int | Views at snapshot time |
| comment_count | int | Comments at snapshot time |
| published_at | datetime | Original upload time |

### Country Coverage

104 countries including: US, GB, IN, CA, AU, DE, FR, JP, BR, MX, AR, CO, CL, ZA, NG, KE, EG, AE, SA, IL, TR, RU, KR, ID, MY, PH, SG, TH, VN, HK, TW, NZ, and 74 more.

## Access

```bash
# Download from Illinois Data Bank
# File: youtube_trends.tar.bz2 (26.4GB)
wget https://databank.illinois.edu/datasets/IDB-9307654/download/youtube_trends.tar.bz2
tar -xjf youtube_trends.tar.bz2
```

Or use Globus for large transfer.

## Research Questions

| # | Question | Method | Output |
|---|----------|--------|--------|
| 1 | Which topics cross national boundaries? | Country co-occurrence matrix per category. Find categories with highest cross-country overlap. | "Music: 80% cross-country. Education: 30%." |
| 2 | Do Indian educational/religious videos trend in US/UK? | Filter by country=IN, check if same video_id appears in US or GB snapshots within 14 days. | Cross-country diffusion rate for Indian content |
| 3 | What is the time lag between IN and US appearance? | For videos present in both IN and US, compute days between first IN snapshot and first US snapshot. | Median lag = X days. Distribution shape. |
| 4 | What title archetypes travel internationally? | Cluster titles by archetype (question, list, name, etc). Compute cross-country rate per archetype. | "Question titles travel 2x farther than name-only titles." |
| 5 | Does English-language Indian content diffuse differently from Hindi? | Split by video language. Compare cross-country rates. | English IN content: X% cross. Hindi IN content: Y% cross. |
| 6 | Do Indian videos cross through diaspora first? | Check for presence in UAE, UK, US, CA, AU, SG sequentially. | Common path: IN→UAE→UK→US |
| 7 | Which adjacent categories carry tantra-adjacent content? | Search titles for keywords (tantra, yoga, meditation, consciousness, hindu, vedic, spirituality). Count cross-country rate per category. | "Spirituality: 20% cross. Education: 35% cross." |
| 8 | What view count thresholds predict cross-country migration? | For videos that cross borders, what was their view count at first IN snapshot vs at first US snapshot? | Median views before crossing = X |

## Pipeline Steps

```
1. Download 26.4GB tar archive (or sample first 10% via streaming)
2. Load into DuckDB or SQLite for fast querying
3. Create country adjacency matrix
4. Filter IN-origin videos, trace cross-country paths
5. Title archetype clustering via regex + LLM sample
6. Language-based diffusion comparison
7. Category-level cross-country heatmap
8. Export diffusion model coefficients
```

## Output

- `pipelines/global-trending/output/diffusion-matrix.json` — country-to-country transition probabilities
- `pipelines/global-trending/output/in-export-report.json` — specific findings for Indian content reaching Western markets
- `pipelines/global-trending/output/title-archetype-crosscountry.csv` — cross-country rate per title pattern
