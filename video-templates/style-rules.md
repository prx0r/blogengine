# Video Style Rules — Extracted from Exemplar Analysis

## 1. Asangoham Style ("Bizarre Life" Biography)

### Pacing
- Shot length: **7-16s avg** (varies by video intensity)
- Shots per video: **75-140**
- Motion in ~80% of shots (Ken Burns + video footage mix)

### Shot Mix
- `video_footage`: 40-50% (real footage, documentary clips)
- `text_overlay`: 30-40% (art with text titles/quote cards)
- `ken_burns_still`: 5-15% (static art with slow zoom)
- `unknown`: 5-10% (transitions, effects)

### Narration
- Speech rate: **200-250 wpm** (conversational but dense)
- Proper nouns: **75-110 per video** (name-dense, biographical)
- Narration style: narrative biography, "The [Adjective] Life of [Figure]"

### Title Pattern
- "The [X] of [Y]" — 77.5% of breakout titles start with "The"
- No questions (0% of breakouts)
- Under 8 words
- Biographical hook: "The Bizarre Life of [Figure]" (+2.5x lift)

### Visual Grammar
- Cut every 7-16 seconds (rapid visual change)
- Artwork changes with each new proper noun or concept
- Text overlays for quotes, names, dates
- Ken Burns zoom rarely, mostly cuts between stills

### Duration: 15-25 min

---

## 2. Academy of Ideas Style ("Why/How" Philosophical Essay)

### Pacing
- Shot length: **15-32s avg** (moderate — much faster than previously thought)
- Shots per video: **22-59** (after scene threshold fix to 0.05)
- Smooth crossfades and slow zooms, not hard cuts — ffmpeg scene scores max out at ~0.117, requiring `--threshold=0.05`
- High proportion of `unknown` type (42%) — frame-diff classifier struggles with smooth transitions

### Shot Mix
- `text_overlay`: 32-55% (art with superimposed text — quotes, key claims)
- `ken_burns_still`: 17-41% (static art with slow zoom — AOI's primary visual)
- `video_footage`: 0-8% (very little real footage)
- `unknown`: 5-42% (smooth transitions confuse the classifier)

### Narration
- Speech rate: **150-170 wpm** (slow, deliberate, contemplative)
- Proper nouns: **40-50 per video** (moderate, quote-focused)
- Narration style: philosophical essay, quotation-heavy, argument-driven

### Title Pattern
- How/Why questions: "How to [X]", "Why [Y]?"
- Colon + subtitle: "The Big Lie - How to Enslave the World"
- "Why" starts: +0.5% boost — uniquely works for them (1.99M subs)
- "How" starts: +6.6% boost — strongest signal
- Longer titles (9+ words) actually help for them

### Visual Grammar
- Artwork holds for 15-30 seconds (much shorter than previously assumed)
- Text overlays are the primary visual element
- Dark, moody classical art (Rembrandt, Goya, Blake)
- Music bed is subdued, ambient
- Ken Burns slow zoom is primary motion — NOT static presentation
- Use `--threshold=0.05` when running analyze-exemplar.py on this style

### Duration: 8-17 min

---

## 3. Eternalised Style ("The Psychology of The [Archetype]")

### Pacing (from 4 exemplar analyses)
- Shot length: **7-17s avg** (varies by video — Alan Watts is fastest at 7.1s)
- Shots per video: **75-139**
- Two distinct sub-styles:
  - **Fast biography** (Alan Watts, Anandamayi Ma): 7-9s avg, 105-139 shots — tight cutting, high energy
  - **Slower documentary** (Nisargadatta, Jesus): 15-17s avg, 75-92 shots — more contemplative

### Shot Mix (from actual analysis)

| Video | text_overlay | video_footage | ken_burns | unknown |
|-------|-------------|---------------|-----------|---------|
| Alan Watts | 40% | 48% | 7% | 6% |
| Anandamayi Ma | 42% | 35% | 19% | 4% |
| Nisargadatta | 28% | 48% | 13% | 11% |
| Jesus Himalayas | 65% | 22% | 4% | 9% |

- **Alan Watts** has the best mix: ~40/48/7 split with tight 7.1s pacing — primary gold standard
- **Jesus** is text-heavy (65%) — avoid this ratio
- **Anandamayi Ma** has good Ken Burns variety (19%) — use this for variety reference

### Narration
- Speech rate: estimated 160-180 wpm
- Deep psychological analysis
- Quote-driven (Jung, Nietzsche, Campbell as primary sources)

### Title Pattern
- "The Psychology of The [Archetype]" — dominant formula
- "The [X] of [Y]" — 52.3% of breakout titles
- Colon/dash for subtitle: "The Shadow - Carl Jung's Warning to The World"
- No questions in breakouts
- Short titles preferred (7 words)

### Visual Grammar
- Dark, symbolic art (William Blake, Bosch, surrealist)
- Text overlays for Jung quotes
- Minimal motion, contemplative pacing
- Chapters / section breaks every 10-15 minutes

### Duration: 20-55 min

---

## Universal Rules (Apply to All)

1. **No numbers in titles** (#1 XGBoost predictor, negative at -0.169)
2. **15-20 min is the universal sweet spot** (for small-medium channels)
3. **"The" starts outperform** (XGBoost importance 0.118)
4. **Avoid: meditation, chakras, awakening** (0.4-0.8x lift)
5. **Use "bizarre" (2.6x), "forgotten" (2.0x), "forbidden" (1.9x)**
6. **Biography format = 1.5x lift** across 317 videos
7. **Designed graphics > photos** in thumbnails
8. **Faces in thumbnails = neutral** (XGBoost 0.000)
9. **Questions work only after 100k subs** (-6.2% for small, +5.9% for mega)
10. **3-4 videos/month** — no benefit to going faster
