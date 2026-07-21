Yes—for the **structural questions**, arXiv and open research datasets give us nearly everything needed. We only need a small amount of live YouTube checking at the very end to see whether the identified patterns still apply to tantra in July 2026.

The important pivot is this:

> **Stop trying to prove that YouTube is deliberately suppressing Indian tantra channels. Study the more actionable possibility that Indian content has already validated subjects and stories which have not been translated, packaged or narrativized for Western English audiences.**

That is both easier to test and more useful.

## What the research literature already establishes

### 1. Regional differences on YouTube are real

A large geolocation audit collected 915,000 YouTube search results using controlled browser agents in multiple US and South African locations over ten days. It found substantial regional differences in search results. So geographical variation is plausible. However, the researchers needed actual IP locations, repeated measurements, twin control bots and browser search—not merely the API's `regionCode`. ([arXiv][1])

Therefore:

* **Keep:** "Western and Indian viewers may receive different discovery environments."
* **Discard:** "Our `regionCode` test proves Indian tantra content is algorithmically hidden."

### 2. The YouTube Search API is unsuitable as the main scientific instrument

A 2025 six-month audit found that identical YouTube API queries returned inconsistent video sets, relevance searches frequently returned off-topic results, and older videos became much harder to retrieve after only 20–60 days. The authors concluded that the Search API is not adequate for robust comprehensive retrieval without substantial mitigation. ([arXiv][2])

That explains the strange Stage 1 results better than the conclusion that Britain has no tantra results.

Your report also has internal validity problems:

* Eleven UK queries report exactly zero channels and later queries report exactly fifteen.
* The script declares a 12-month window but does not send `publishedAfter`.
* `relevanceLanguage=en` is treated as proving English audio, which it does not.
* The validator primarily checks whether fields and gates exist, not whether the underlying conclusion is scientifically valid.
* A YouTube API key appears directly in the public script and should be rotated.

So I would mark Stage 1:

> **Interesting exploratory signal, not confirmed evidence.**

Do not spend more time perfecting it.

---

# The stronger research hypothesis

## Original

> Indian English-language tantra content would succeed with Western audiences, but regional recommendation prevents exposure.

## Revised

> Indian creators and audiences are validating subjects, figures and narratives that remain poorly translated into Western documentary conventions. The opportunity lies in identifying these culturally proven subjects and repackaging them around universal curiosity, while retaining source quality.

This predicts three distinct gaps:

### Language gap

The useful video is in Hindi, Bengali or another language and has no strong English equivalent.

### Format gap

The information exists in English, but only as:

* Long podcasts
* Lectures
* Satsangs
* Poorly titled interviews
* Unedited presentations
* Devotional explanations
* Clips without context

### Framing gap

Western viewers might not search for:

> pañcamakāra, pratyabhijñā or śaktipāta

But may watch:

> Why Tantra Used Everything Religion Forbade
> The Philosophy That Says You Forgot You Are Reality
> Can Enlightenment Be Transmitted?

This is potentially much larger than an SEO search gap.

---

# The open datasets that matter

## 1. YouNiverse

YouNiverse contains metadata from more than 136,000 English-speaking channels and 72.9 million videos, plus weekly channel subscriber/view histories and information about which videos hundreds of millions of anonymous users commented on. Its data ends in 2019, so it is unsuitable for identifying current topics, but excellent for validating statistical methods. ([arXiv][3])

Use it to answer:

* How strongly does channel size explain views?
* Is `views / age` statistically sensible?
* How nonlinear is view accumulation?
* How much do titles add after channel history is included?
* How common are genuine within-channel outliers?
* Does video duration interact with category?
* Is binary breakout classification sensible?

This dataset can help design the model before feeding it current tantra data.

## 2. Global YouTube Trending Dataset

This contains approximately 78.4 million country-level trending entries, covering 726,627 unique videos across 104 countries from July 2022 through June 2025. It includes country, rank, language, channel, title, tags, publication date, views and comments. ([arXiv][4])

This is the best dataset for studying:

* Which subjects cross national boundaries.
* Which Indian videos also trend in the UK, US, Canada and Australia.
* Language effects.
* Time lag between Indian and Western appearance.
* Whether Indian educational/religious content crosses borders at all.
* Which title archetypes travel internationally.
* Whether content normally crosses through Indian diaspora countries first.
* Whether English-language Indian videos diffuse differently from Hindi videos.

It probably contains few highly technical tantra videos, but it can reveal the **mechanics of cultural export**.

The key comparison is not tantra versus all YouTube. It is:

* Indian spirituality
* Indian mythology
* Yoga
* Religious biography
* Historical mystery
* Meditation
* Consciousness
* Archaeology
* Temple history

Those are tantra's adjacent acquisition markets.

## 3. YT-30M / YTCommentVerse

YT-30M contains more than 32 million multilingual comments, with video IDs, language-relevant text, upvotes and channel/category metadata. The later YTCommentVerse version covers more than 178,000 videos and over 50 languages. ([arXiv][5])

This can validate:

* Whether comment language is a useful audience proxy.
* How viewers formulate questions across languages.
* Which kinds of comments predict unusually strong engagement.
* Whether requests for explanation, translation and follow-up can be reliably clustered.
* What percentage of comments are substantive enough to use.

It cannot reliably identify geography. Use it to model **language and intent**, not nationality.

## 4. Regional-audit datasets

The 915,000-result geolocation audit dataset can be reused to determine which similarity metrics reliably detect regional divergence:

* Jaccard overlap
* Rank-biased overlap
* Top-10 overlap
* Channel overlap
* Exposure-weighted overlap

This saves you inventing an arbitrary `gapScore`. ([arXiv][1])

---

# What the literature says about your breakout metric

Your current metric is:

```
(views / age days) / channel median views/day
```

It is better than raw views, but it assumes views accumulate linearly. They generally do not.

A video commonly follows one of several curves:

* Immediate spike and decay
* Slow evergreen search accumulation
* Delayed recommendation breakout
* Repeated seasonal resurfacing
* External-event spike
* Long flat period followed by rediscovery

Popularity forecasting research treats video attention as a temporal process rather than a static views-per-day ratio. Hawkes-process work explicitly models self-excitation and external promotion; other forecasting research first classifies view-growth patterns before predicting future popularity. ([arXiv][6])

## Simple replacement

Since you want a simple system, use matched age windows:

```
Outlier_i = log((V_i + 100) / (median(V_same channel, same age band) + 100))
```

Age bands:

* 0–7 days
* 8–30 days
* 31–90 days
* 91–180 days
* 181–365 days

This avoids pretending that day two and day 300 are comparable.

Even better, use only videos old enough to have completed the measured horizon:

* Compare all videos at 30 days after publication.
* Or compare all videos at 90 days.

But historical 30-day counts are unavailable unless previously recorded. For existing videos, matched age bands are sufficient for discovery—not precise forecasting.

## Do not discard the middle half

Throwing away the middle 25% creates cleaner labels but wastes information and exaggerates artificial separation.

Use continuous outlier score as the primary outcome:

```
y = log(outlier ratio)
```

Then optionally label:

* Extreme breakout: top 10%
* Strong: 75–90%
* Normal: 25–75%
* Weak: bottom 25%

That allows ordinal or regression modelling instead of a crude hit/miss classifier.

---

# What probably predicts popularity

The research implies a hierarchy.

## Very strong contextual variables

* Channel's normal audience size
* Recent channel momentum
* Topic demand
* Video age
* Existing external attention
* Early view trajectory
* Upload frequency
* Whether the subject is tied to a current event

## Moderately useful content variables

* Title semantics
* Recognisable named entities
* Emotional or practical framing
* Duration
* Thumbnail composition
* Video category
* Language

## Potentially useful but unavailable publicly

* CTR
* Impressions
* First-30-second retention
* Satisfaction
* Browse versus Search traffic
* Returning viewer response

Multimodal popularity research generally finds value in combining visual, textual and contextual information rather than treating thumbnails or title syntax as independently decisive. ([arXiv][7])

This means your model should test:

```
Outlier ~ topic + channel baseline + channel momentum + duration + title semantics + thumbnail semantics
```

Not:

```
Outlier ~ question mark + colon + power words
```

Punctuation features are cheap, but likely weak.

---

# The title analysis should become semantic

Instead of 15 mostly regex-based variables, represent each title along meaningful axes:

* **Known entity:** Abhinavagupta, Kali, Aghori
* **Universal problem:** death, consciousness, desire, fear
* **Mystery:** unexplained, hidden, forgotten
* **Conflict:** truth versus stereotype
* **Transformation:** awakening, liberation, possession
* **Prohibition:** forbidden, secret, dangerous
* **Practical promise:** how to understand or practise
* **Historical promise:** what really happened
* **Scientific frame:** experiment, brain, consciousness
* **Technical density:** number of specialist terms
* **Audience prerequisite:** beginner versus initiated
* **Epistemic posture:** devotional, sceptical, investigative, explanatory

The most valuable feature may be:

```
Universal framing - technical prerequisite
```

For example:

| Technical title | Transferable title |
|----------------|-------------------|
| The Kañcukas in Trika Śaivism | Why an Infinite Mind Feels Small |
| An Introduction to Pratyabhijñā | The Philosophy That Says Enlightenment Is Remembering |
| Pañcamakāra in Kaula Tantra | Why Tantra Used Everything Religion Forbade |
| The Doctrine of Ābhāsa | What If the World Is Consciousness Appearing to Itself? |

This is the exact translation layer your system should learn.

---

# The thumbnail model should not analyse colour first

Colour temperature and brightness may correlate with channel style but reveal little about why the proposition works.

Prioritise:

1. **Subject legibility**
2. **Number of competing focal objects**
3. **Recognisable human/deity/entity**
4. **Visual anomaly**
5. **Narrative tension**
6. **Text readability**
7. **Historical authenticity**
8. **Promise consistency with title**
9. **Generic AI-art probability**
10. **Similarity to neighbouring videos**

A useful thumbnail feature is not simply "warm."

It is:

> A severed-head goddess dominates the image, the title promises an explanation of what she means, and no other element competes for attention.

Your gallery-style thumbnail system may actually differentiate the channel in a niche dominated by podcast faces, devotional poster designs and generic occult AI imagery.

---

# The hook model is currently looking at too much text

The first 150 words may represent 45–75 seconds. That mixes the actual hook with background exposition.

Extract separately:

* First sentence
* First 30 words
* First 15 seconds
* First 60 seconds

Then label:

* Promise confirmed immediately?
* Central mystery stated?
* Concrete scene or abstraction?
* Stakes introduced?
* Technical terminology before explanation?
* Biography before premise?
* Credibility marker?
* Open question created?
* Delay before subject begins?

The most useful variable is probably:

```
Seconds until central promise
```

Not merely "contains curiosity gap."

---

# The largest potential edge: cross-language narrative transfer

Cross-lingual recommendation research outside YouTube demonstrates that topic preferences can transfer across languages when semantically equivalent content is aligned, even without overlapping users or articles. This does not prove that a Hindi tantra breakout will work in English, but it supports treating language markets as related domains rather than independent niches. ([arXiv][8])

The system should search for:

1. A subject repeatedly succeeds in Hindi or Indian English.
2. The same human motivation succeeds in Western adjacent niches.
3. No strong Western documentary connects them.
4. The sources and visuals are available.
5. The concept can be explained without assuming prior Sanskrit knowledge.

Example:

### Indian evidence

Videos about Chinnamastā, cremation-ground practice or Aghori saints repeatedly outperform.

### Western adjacency

Western audiences watch:

* Dark religious history
* Extreme ascetics
* Death rituals
* Taboo anthropology
* Symbolic psychology
* Altered states

### Translation

Not:

> Chinnamastā Sādhana and Mahāvidyā Tattva

But:

> **Why This Hindu Goddess Cuts Off Her Own Head**

Then the video progresses from visual mystery into symbolism, history, tantric philosophy and serious source interpretation.

That is not cheap sensationalism if the shocking image is genuinely the thing being explained.

---

# A second edge: India as the source layer, Western documentary channels as the format layer

Do not require your 20–40 analysed channels to satisfy every property simultaneously.

You need two datasets.

## Source channels

Indian tantra, philosophy and religious channels provide:

* Subjects
* Claims
* Teachers
* Stories
* Terminology
* Audience questions
* Culturally salient topics

These may be lectures, podcasts or devotional channels.

## Format channels

Western documentary and philosophy channels provide:

* Narrative structure
* Titles
* Thumbnails
* Pacing
* Hooks
* Evidence presentation
* Cold-audience framing

Your product is a synthesis:

```
Indian information advantage + Western documentary grammar
```

Searching only for existing "English-language Indian tantra documentary channels" may leave you with too few genuine channels and simply copy the weaknesses of the current market.

---

# Simplified research pipeline

## Stage 1 — Literature and dataset priors

Use:

* YouNiverse for popularity methodology.
* Global Trending for international diffusion.
* Regional-audit data for geographic metrics.
* YT-30M for comment-language and intent models.
* Published multimodal popularity work for feature selection.

No live YouTube complexity.

## Stage 2 — Subject discovery

Collect Indian source videos from:

* Tantra channels
* Religious podcasts
* Philosophy lectures
* Mythology/history channels
* Hindi and English channels

Find within-channel outliers using matched age bands.

No strict requirement that every channel is documentary-style.

## Stage 3 — Cross-language opportunity clustering

For each subject:

* Indian outlier count
* Independent channel count
* English coverage
* Universal narrative archetype
* Source quality
* Visual availability
* Technical-entry cost

Produce:

```
Transfer Opportunity = (Indian replication × universal narrative strength × source quality) / (1 + strong English supply)
```

## Stage 4 — Western format mapping

Match every opportunity to successful formats:

* Strange biography
* Historical investigation
* Misunderstood idea
* Scientific test
* Forbidden practice
* Lost text
* Symbol decoded
* Place-based mystery

## Stage 5 — Small live validation

Only now manually inspect perhaps the top 20 English YouTube results for the top 10 opportunities.

You are checking:

* Does a strong English documentary already exist?
* Is it recent?
* Is it properly packaged?
* Are viewers requesting more?
* Can your video materially improve on it?

That is 200 result inspections, not an elaborate algorithm audit.

---

# Final verdict on the thesis

## Supported

* YouTube discovery can differ substantially by geography. ([arXiv][1])
* Cross-language subject preference can plausibly transfer.
* Large open datasets can reveal international diffusion and popularity patterns.
* Within-channel comparison is much better than raw cross-channel views.
* English documentary packaging may unlock subjects currently trapped inside lectures and regional-language content.

## Not supported yet

* That YouTube deliberately prevents Western users from seeing Indian tantra channels.
* That 54 channels are genuinely "India-only."
* That the UK is more underserved than the US.
* That a high regional search gap predicts Western demand.
* That question marks, colour temperature or hook labels will meaningfully predict breakout.
* That uncontested search demand is the biggest opportunity.

## Most likely actual opportunity

> **Not uncontested search demand, but uncontested narrative framing.**

The Western audience may never type "pañcamakāra five Ms" into Search.

But they may readily click:

> **Why Tantra Turned Forbidden Acts Into a Path to Liberation**

Your system should therefore become a **cultural translation and documentary-opportunity engine**, not primarily a regional SEO-gap detector.

[1]: https://arxiv.org/abs/2409.10168
[2]: https://arxiv.org/abs/2506.11727
[3]: https://arxiv.org/abs/2012.10378
[4]: https://arxiv.org/abs/2510.23645
[5]: https://arxiv.org/abs/2412.03465
[6]: https://arxiv.org/abs/1801.04117
[7]: https://arxiv.org/abs/1807.05959
[8]: https://arxiv.org/abs/2207.14370
