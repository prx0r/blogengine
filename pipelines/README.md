# Research Dataset Pipeline

Four open datasets that validate breakout methodology and cross-cultural diffusion patterns before we spend any YouTube API quota.

```
pipelines/
├── README.md                          ← this file
├── youniverse/                        ← Channel + video metadata from 136k channels, 72.9M videos
│   ├── README.md                      ← Dataset overview, access, schema, pipeline spec
│   └── paper-arxiv-2012.10378.md      ← Imported paper
├── global-trending/                   ← Trending data from 104 countries, 3 years, 726k videos
│   ├── README.md
│   └── paper-arxiv-2510.23645.md
├── yt30m-comments/                    ← 32M multilingual YouTube comments
│   ├── README.md
│   └── paper-arxiv-2412.03465.md
└── regional-audit/                    ← 915k geolocated search results across US + South Africa
    ├── README.md
    └── paper-arxiv-2409.10168.md
```

## What each dataset validates

| Question | Dataset | Method |
|----------|---------|--------|
| How much does channel size explain views? | YouNiverse | Regress views on subs, test residual variance |
| Is views/age statistically sensible? | YouNiverse | Compare linear vs nonlinear accumulation curves |
| How common are genuine within-channel outliers? | YouNiverse | Compute outlier ratio across 136k channels |
| Do titles add signal after controlling for channel? | YouNiverse | Nested regression with/without title features |
| Which topics cross national boundaries? | Global Trending | Country co-occurrence matrix by category |
| Do Indian educational/religious videos trend in US/UK? | Global Trending | Filter IN origin, check presence in Western countries |
| What language patterns predict export? | Global Trending | Title language vs non-native trending success |
| Can comment language proxy geography? | YT-30M | Comment language distribution vs country channel origin |
| What types of comments predict engagement? | YT-30M | Comment features regressed on likes/replies |
| How reliable are rank-similarity metrics? | Regional Audit | Jaccard/RBO/Top-10 overlap across geolocated bots |

## Combined cross-dataset outcome

After running all four pipelines, we have:

- **Validated breakout metric** (which formula best predicts actual outlier status)
- **Validated feature set** (which title/thumbnail/hook features carry independent signal)
- **Cultural export mechanics** (which Indian content crosses to Western markets and via what patterns)
- **Comment intent taxonomy** (how to classify audience questions without LLM hallucinations)
- **Regional similarity baseline** (expected search overlap between IN and US/UK, so future gap scores have a null hypothesis)

This replaces the need to burn API quota on method validation. Only then do we run small live YouTube checks.

---

## Academic Signal Stack — Cross-Referencing

Alongside YouTube data, we measure academic interest in topics. This feeds the **opportunity score**: a topic with rising academic publication volume + strong YouTube gap = high confidence.

### Provider Architecture

Replace any single-API dependency with a provider interface:

```
AcademicProvider (protocol)
  ├── Crossref         → publication volume and growth (required)
  ├── Semantic Scholar → citations, abstracts, semantic neighbours (optional enrichment)
  ├── OpenCitations    → citation graph fallback (required)
  ├── arXiv            → emerging science signal (science-adjacent topics only)
  ├── Europe PMC       → neuroscience, consciousness, bioelectricity (domain-specific)
  ├── CORE             → full-text enrichment (top-ranked opportunities only)
  └── DataCite         → datasets, software, theses (supplementary)
```

### Fallback Chain

1. **Crossref** — default source. 180M records, polite pool with `mailto`. Get publication counts by year, growth rate, author diversity.
2. **OpenCitations** — citation graph. 180 req/min/IP, bulk dumps available.
3. **Semantic Scholar** — citation counts, abstracts, SPECTER embeddings, related papers. Cache everything.
4. **arXiv** — consciousness science, active inference, bioelectricity (not humanities).
5. **Europe PMC** — neuroscience, meditation research, altered states (33M+ life-science publications).
6. **CORE** — open-access full text (rate-limited, use only for top candidates).

### Score

```
academic_signal = 0.40 × publication_growth
               + 0.25 × citation_growth
               + 0.20 × independent_author_diversity
               + 0.15 × recent_influential_work
```

Where:

| Component | Source | Measure |
|-----------|--------|---------|
| publication_growth | Crossref | papers last 3y / papers previous 3y |
| citation_growth | Semantic Scholar / OpenCitations | citations last 3y / citations previous 3y |
| independent_author_diversity | Crossref | unique authors in last 3y |
| recent_influential_work | Semantic Scholar | papers in top citation percentile last 2y |

### Example Request

```python
params = {
    "query.bibliographic": "Kashmir Shaivism tantra",
    "filter": "from-pub-date:2023-01-01,until-pub-date:2026-12-31",
    "rows": 0,
    "mailto": "your-email@example.com",
}
```

`rows=0` returns only the result count — no paper metadata needed for the momentum score.

### Why Not OpenAlex

OpenAlex was the original plan but is replaceable by Crossref + OpenCitations, which together cover publication metadata and citation graphs with better rate limits and bulk access. Semantic Scholar adds abstracts and embeddings when needed. This stack is more robust and removes a single-point-of-failure dependency.
