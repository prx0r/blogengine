# Complete Hermes Skill Manifest

## Core Pipeline Skills

| Skill | Purpose | When to Use |
|---|---|---|
| `/acquire` | Download + catalog a paper | User sends DOI/URL/title |
| `/compile` | Create or update an RO from works | Sources exist, need compiling |
| `/publish` | RO → essay + audio + deploy | RO is reviewed, ready to publish |
| `/deploy` | Git → Cloudflare build + deploy | After publish or content changes |

## Knowledge Skills

| Skill | Purpose | When to Use |
|---|---|---|
| `/explore` | Search all silos, surface gaps | User wants to know what we have |
| `/synth` | Answer from internal sources with citations | User asks a research question |
| `/navigate` | Show connections between entities | User wants to see the graph |
| `/curate` | RO management: coverage, issues, suggestions | Reviewing or planning expansions |
| `/search` | OpenAlex/HAL/Zenodo search | User wants to find new papers |

## Writing Skills

| Skill | Purpose | When to Use |
|---|---|---|
| `/write` | Type A essay (with commentary) | User wants original essay |
| `/audio` | TTS for essay JSON | Need audio for existing essay |
| `/art` | Fetch art for concepts | Essay needs illustrations |

## Astrology Skills

| Skill | Purpose | When to Use |
|---|---|---|
| `/daily-daimon` | Today's astrological insight | Morning |
| `/deep-analysis` | Gold-standard astrology reading | Deep dive |
| `/recommend-practice` | Practice from current activations | Need guidance |
| `/weekly-review` | Weekly astrology summary | Sunday |

## Skill Bundles

```yaml
# ~/.hermes/skill-bundles/research-cycle.yaml
name: research-cycle
skills: [search, acquire, compile, curate, publish]
```

```yaml
# ~/.hermes/skill-bundles/knowledge-query.yaml
name: knowledge-query
skills: [synth, navigate, explore]
```

## Navigation Flow

```
                    ┌────────────┐
                    │  /synth    │  Ask a question → get cited answer + gaps
                    └─────┬──────┘
                          │
              ┌───────────┼───────────┐
              ▼           ▼           ▼
       ┌──────────┐ ┌──────────┐ ┌──────────┐
       │/navigate │ │/explore  │ │/curate   │
       │ Show     │ │ Search   │ │ Manage   │
       │ graph    │ │ all silos│ │ ROs      │
       └────┬─────┘ └────┬─────┘ └────┬─────┘
            │            │            │
            └────────────┼────────────┘
                         ▼
                   ┌──────────┐
                   │ /acquire │  Fill gaps → new sources
                   └────┬─────┘
                        ▼
                   ┌──────────┐
                   │ /compile │  Sources → ROs
                   └────┬─────┘
                        ▼
                   ┌──────────┐
                   │ /publish │  ROs → essays + audio
                   └──────────┘
```
