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
