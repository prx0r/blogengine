# Factory Pipeline Reference

## Object Flow

```
Raw Source (PDF/file)
  │
  ▼
Stage 1: Source → Work
  │  Extract text, metadata, topics
  │  Validate: W01-W08 (8 gates)
  ▼
Work JSON (content/works/work_{slug}.json)
  │
  ▼
Stage 2: Work → Research Object
  │  Compile passages around a question
  │  Route to one of 15 RO families
  │  Validate: R01-R23 (23 gates)
  ▼
RO (content/research-objects/ro-{slug}/ro.json)
  │
  ├──► PO (Philosopher Object abstraction)
  │      Build philosopher asset library from ROs
  │
  └──► Stage 3: RO → Essay (Type A)
         │  3-pass write (dump → refine → shape)
         │  Validate: P1_A-F, P2_A-F, P3_A-H
         ▼
      Essay (content/glossary/essays/{slug}.json)
         │
         └──► Audio (TTS via Deepgram Aura)
         │
         └──► Stage 4: Essay → Storyboard
                │  Timed segments with art assignments
                │  Validate: S01-S10 (10 gates)
                ▼
             Storyboard (content/publishing/storyboards/{id}.json)
                │
                └──► Stage 5: Storyboard → Video
                       │  Art search, subtitle gen, timeline build
                       │  Validate: V01-V07 (7 gates)
                       ▼
                    Video Object → YouTube Upload
```

## RO Families (15)

| # | Pattern | Family | Example |
|---|---------|--------|---------|
| 1 | {T} on {X} | thinker-topic | Ficino on the Daimon |
| 2 | {X} across {T}s | topic-across-thinkers | Daimon across Platonists |
| 3 | {A} on {B} | thinker-on-thinker | Ficino on Plato |
| 4 | evolution of {X} | concept-evolution | Daimon Plato->Ficino |
| 5 | {A} vs {B} | comparative | Corbin vs Jung |
| 6 | reception of {X} | reception | Reception of Timaeus |
| 7 | what is {X} | tradition | What is Theurgy |
| 8 | everything on {X} | theme | Everything on Beauty |
| 9 | {T} on {practice} | practice | Ficino on Prayer |
| 10 | how did {X} | historical-question | How astrology survived |
| 11 | arguments for/against {X} | debate | Arguments for X |
| 12 | map {domain} | research-map | Map everything on Spiritus |
| 13 | reading companion for {X} | reading-companion | Three Books on Life |
| 14 | primary sources on {X} | sourcebook | Sources on Daimon |
| 15 | investigate: {Q} | research-question | Did Ficino equate Genius? |

## Essay 3-Pass Structure

### Pass 1: Source-Maximal Dump
- 70% source passages, 30% AI commentary
- AI blocks ≤ 40 words
- Zero paraphrasing, zero NARR patterns
- Hook as first non-source block
- **Gates:** P1_A (AI ≤40 words), P1_B (≥60% source), P1_C (no NARR), P1_D (≤3 NEG), P1_E (hook exists), P1_F (no summary)

### Pass 2: Slop Removal
- Replace abstractions with concrete images
- ≥1 unexpected concrete noun per AI block
- Adopt a stance (amused, awed, unsettled, skeptical)
- **Gates:** P2_A (≤2 AI blocks with NEG), P2_B (zero NARR), P2_C (≥50% AI blocks have concrete noun), P2_D (no consecutive same-start words), P2_F (no flat transitions)

### Pass 3: Emotional Arc
- Hook → second hook (40%) → climax → return
- Ending circles back to opening concretely
- **Gates:** P3_A (hook ≤25 words, no hedging), P3_B (mid hook exists), P3_C (longest source in latter half), P3_D (ending shares word with opening)

### Failure handling
- Any gate fails → DELETE essay → retry (max 3)
- Only proceed on all-pass

## Signal System → HO Flow

```
Market Demand (0.3)
  ├─ YouTube gap scores
  ├─ Language lag scores
  └─ Trending velocity

Our Analytics (0.3)
  ├─ Channel breakout rates
  ├─ Historical hypothesis results
  └─ Own video performance

Content Readiness (0.2)
  ├─ Source availability
  ├─ RO coverage
  └─ Art availability

Channel Fit (0.2)
  ├─ Audience overlap
  ├─ Production capability
  └─ Brand alignment

  ▼
Weighted Sum (≥0.8 = Charge, ≥0.6 = Test, ≥0.4 = Explore, <0.4 = Monitor)
  │
  ▼
HO proposed → in_production → published → monitoring → validated/rejected
```

## Cron Schedule

| Cron | Frequency | Worker Action |
|------|-----------|---------------|
| 6am daily | Daily | Channel harvest, breakout scores, thumbnail cascade, gap map, push opportunities |
| Noon Monday | Weekly | Full gap rebuild, Wikipedia pageview velocity, hypothesis testing against corpus |
| 1st of month | Monthly | Full recomputation, reclustering, fact-check audit |

## Queue Architecture

```
pipeline_ingest ← Research cron pushes new_topic events
  → Workflow: produce_video
    → On render step: push to render_jobs

render_jobs ← VPS render worker pulls FFmpeg jobs
  → Renders video → uploads to R2
  → Webhook back to Workflow: continue

dead_letter ← Failed messages (3 retries exceeded)
  → Manual human review
```
