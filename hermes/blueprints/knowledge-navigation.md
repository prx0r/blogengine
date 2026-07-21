# Knowledge Navigation Blueprint

## How Hermes Moves Through the System

```
User asks question
  │
  ▼
SYNTH → searches all silos → returns answer with citations + gaps
  │
  ▼
If gaps found → CURATE → suggests expansions
  │
  ▼
If expansions approved → ACQUIRE → finds new sources
  │
  ▼
If new sources → COMPILE → updates ROs
  │
  ▼
If RO updated → PUBLISH → deploys essay + audio
  │
  ▼
Feedback → Error Book → constraints accumulate
```

## Navigation Map

```
content/                          Navigation route
─────────────────────────────────────────────────────────────
glossary/concepts/                /synth → concept → find linked ROs
glossary/essays/                  /synth → essay → find concept tags
glossary/art/                     /navigate → concept → art[]
works/                            /navigate → work → tier + commentary_on
research-objects/                 /curate → RO → coverage + issues + outputs
authors/                          /navigate → author → works + ROs
library/                          /acquire → PDF → catalog → work JSON
source-texts/                     /acquire → PDF → catalog → tier=1
```

## Skill Chain

```
/synth "daimon"
  → finds: concept:daimon, ro:ficino-daimon, works, essays
  → returns: compiled answer + gaps
  
/navigate daimon
  → shows: concept + ROs + works + art + astrology
  → shows: connections between them

/curate show ro:ficino-daimon
  → shows: coverage % per section, open issues
  → suggests: sources in library that fill gaps

/acquire "Voss astrology Ficino"
  → searches: HAL, Zenodo, OpenAlex
  → downloads: PDF → catalogs → checks impact on ROs

/explore theurgy
  → searches: concepts, ROs, works, essays simultaneously
  → surfaces: what we know AND what we don't
```

## Data Flow for a Complete Query

```
User: "Tell me about the daimon in Renaissance Platonism"

1. /synth "daimon renaissance platonism"
   → search concepts for "daimon" → found
   → search ROs for "ficino-daimon" → found (draft, 23% coverage)
   → search works for "daimon" → 14 Tier 2 found
   → search essays for "daimon" → 2 found
   → compile: RO body passages + concept definition
   → cite: each claim traces to a source passage
   → flag: astrology section empty, Plotinus comparison missing
   
2. User: "Fill the astrology gap"
   → /curate suggest ro:ficino-daimon
   → suggests: work:voss-becoming-angel (already in library)
   → /compile expand ro:ficino-daimon with work:voss-becoming-angel
   → extract passages → append body → update coverage
   
3. User: "Deploy"
   → /publish ro:ficino-daimon
   → generate essay JSON → audio → deploy to Cloudflare
   → RO status: draft → published
```
