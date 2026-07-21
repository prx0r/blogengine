# The high-signal YouTube growth guide

I reviewed the top/all-time pages and targeted high-signal threads across r/NewTubers, r/PartneredYouTube, and r/YouTubers, then checked their recurring claims against YouTube's current official documentation. I did **not** literally read every post ever published; Reddit contains too much repetitive, contradictory, and unverifiable material. This is the useful consensus after filtering out motivational filler, tiny-sample anecdotes, SEO sales pitches, and superstition.

## The core conclusion

Successful channels usually solve five problems in this order:

1. **Demand:** Is there already an audience hungry for the subject?
2. **Idea:** Is this specific video proposition unusually interesting?
3. **Packaging:** Can the title and thumbnail communicate that proposition instantly?
4. **Delivery:** Does the opening confirm and heighten the promise?
5. **Continuation:** Does the video lead naturally into another video from the same channel?

Small creators routinely reverse that order. They spend 40 hours editing an idea nobody strongly wanted, attach a title afterward, upload it at a supposedly optimal hour, stuff the description with tags, and then blame "the algorithm." The highest-signal creator posts repeatedly say that idea selection and viewer value dominate production effort; YouTube itself says its system ranks videos according to relevance, viewer behaviour, performance with similar viewers, and long-term satisfaction—not how difficult the video was to make. ([Reddit][1])

---

# Part I — Stop thinking of "the algorithm" as an audience

YouTube does not take your finished upload and decide whether you deserve exposure. Its system tries to find videos for individual viewers based on what they watch, avoid, search for, enjoy, dismiss, and report through satisfaction signals. Home relies heavily on viewing history; Suggested relies heavily on the currently watched video plus personal history. Recommendations generate more viewing than subscriptions or search, according to YouTube. ([Google Help][2])

The better mental model is:

> **YouTube repeatedly offers your video to progressively different viewer groups and observes whether those people choose it and enjoy it.**

That means a video can fail for several distinct reasons:

* The subject has weak demand.
* The subject has demand, but the packaging is weak.
* The packaging attracts the wrong people.
* The opening does not confirm the packaging.
* The video satisfies a search query but provides no reason to watch another video.
* The video works with your core audience but fails when testing expands to colder viewers.
* It is simply being compared with stronger alternatives at that moment.

This is why one universal CTR target is nonsense. A 4% CTR from millions of broad Home impressions may be healthier than a 12% CTR from a tiny loyal audience. External, Search, Browse and Suggested viewers can have very different retention patterns. YouTube explicitly recommends examining performance by traffic source instead of relying only on aggregate metrics. ([reddit.com][3])

## The three audiences every video passes through

Think in stages:

**Core viewers:** People who already watch you or extremely similar material.

**Adjacent viewers:** People interested in neighbouring topics—Indian philosophy, meditation, occult history, consciousness, Buddhism, yoga, comparative religion.

**Cold viewers:** People who do not yet care about Abhinavagupta, Śaiva metaphysics or tantric ritual but may care about forbidden knowledge, consciousness, death, altered states, ancient science, secret traditions or strange historical lives.

Your channel grows when a concept survives all three stages without becoming dishonest or generic.

For example:

* Core-only: **Abhinavagupta's Account of Ābhāsa**
* Adjacent: **Why Kashmir Shaivism Says the World Is Real**
* Cold-capable: **The Philosopher Who Said Reality Is Consciousness Playing Hide-and-Seek**

The deepest scholarship can remain inside the third video. Accessibility is an entry-point decision, not intellectual dilution.

---

# Part II — Niche selection: demand before devotion

The best Reddit advice is not "follow your passion." It is closer to:

> Find a subject you can remain interested in **for which repeated public evidence of demand already exists**.

One PartneredYouTube creator described spending roughly ten years following personal interests without breaking 1,000 subscribers, then growing after deliberately studying demand and viewer expectations. Another creator's strategy was to find several sub-50,000-subscriber channels producing disproportionate views, because successful small channels are stronger evidence of an accessible opportunity than enormous incumbents with teams, celebrity and accumulated distribution. These are anecdotes, not controlled experiments, but they reflect a very strong repeated creator consensus. ([Reddit][4])

## Your proposed channel universe is directionally correct

Do not select three small, three medium and three large channels. Build a niche census.

### Core inclusion criteria

* English spoken content or reliable English subtitles.
* Documentary, explanatory, historical or teaching format.
* Tantra, tantric philosophy, Śaivism, Śāktism or closely associated traditions.
* India-based, India-focused or substantially reliant on Indian source material.
* At least 20 long-form uploads.
* Enough age and activity to contain both successes and failures.
* No Shorts farms, generic motivational clip channels or mostly personal vlogs.
* No channels whose apparent success comes almost entirely from one unrelated viral upload.

You may not find 20–40 channels that meet every exact criterion. Use concentric sets rather than contaminating one sample:

### Set A: direct competitors

English documentary or educational channels directly covering tantra, Śaivism, Śāktism, yogis, Indian esotericism and related philosophy.

### Set B: audience competitors

Indian philosophy, Buddhism, yoga history, comparative mysticism, consciousness, occult history and academic religion channels.

### Set C: format competitors

Channels outside the subject that use the production format you want: narrated historical documentaries, philosophical video essays, manuscript-driven storytelling, strange-biography documentaries and investigative religious history.

Do not mix the sets blindly in one model. Add `competitor_type` as a feature. Set A tells you **what the audience wants**. Set C tells you **how attention is structured**.

## Validate with repeated outliers

One small channel hitting 500,000 views could be luck, a celebrity share, paid traffic or a topic unrelated to its normal content. Five independent small channels breaking out on closely related propositions constitute much stronger evidence.

Your opportunity detector should therefore reward:

* Multiple independent channels covering the theme.
* Recent rather than purely historical breakouts.
* Breakouts from small and medium channels.
* Repeated success across more than one title formulation.
* Continued channel performance after the breakout.
* Comments indicating demand for adjacent explanations.
* Search queries with weak or outdated current results.

This matches the strongest Reddit outlier-research advice: study successful channels within operational reach, validate an opportunity through multiple examples, and distinguish an accessible pattern from one lucky creator. ([Reddit][5])

---

# Part III — Properly test whether English tantra is underserved

Your seed is right that "Indian tantra is not getting pushed to Western viewers" is presently a hypothesis. But I would modify the proposed test.

## 1. Search-result regional comparison is a weak proxy

The YouTube Data API supports `regionCode` and `relevanceLanguage`, but `regionCode` is officially described as returning videos viewable in that country, while `relevanceLanguage` favours—not exclusively restricts—results relevant to a language. API search results are also not equivalent to a particular logged-in viewer's personalised Home or Suggested feed. Therefore, US-versus-India API rank differences are useful evidence, but not a clean measurement of recommendation suppression. ([Google for Developers][6])

Use:

* `regionCode=US`, `GB`, `CA`, `AU`, `IN`
* `relevanceLanguage=en`
* The same query and collection time
* Both `order=relevance` and `order=viewCount`
* A fixed top-20 or top-50 result depth
* Repeated snapshots, because rankings change

Record:

* Rank
* Channel country where available
* Spoken language
* Subtitle availability
* Video age
* Views
* Channel size
* Exact versus partial query match
* Documentary quality
* Whether the result genuinely answers the query

A large rank difference is suggestive. The more important observation may be that US and UK results are filled with shallow, sensational, old or tangential videos while strong Indian material remains absent.

## 2. Measure demand independently

For each concept, combine:

* Google Trends by country.
* YouTube autocomplete phrases.
* Google search autocomplete.
* Search-result counts and freshness.
* Recent Reddit questions.
* Comments requesting explanations.
* Repeated breakouts on adjacent channels.
* Performance of related books, podcasts and interviews as secondary evidence.

Separate **identity terms** from **problem terms**.

Identity terms:

* Kashmir Shaivism
* Abhinavagupta
* Trika
* Śrīvidyā
* Kaula
* Vijñānabhairava

Problem or desire terms:

* kundalini awakening symptoms
* nonduality and the world
* why consciousness creates reality
* dangerous meditation practices
* what tantra actually means
* hidden history of yoga
* ancient Indian theories of consciousness

Identity terms tell you what existing initiates seek. Problem terms tell you how the larger audience enters.

## 3. Replace speculative comment geolocation

Do not ask an LLM to guess commenters' countries from names, avatars or writing style. That will generate confident nonsense.

Only classify:

* Explicit statements such as "I'm watching from London."
* Language used.
* References to locally specific institutions or experiences when unmistakable.
* Requests for English explanation or translation.
* Familiarity level: novice, practitioner, academic, culturally familiar.

The last variable is more useful than geography. You need to know whether the video attracts Indians, Western occultists, yoga practitioners, scholars, meditators or general documentary viewers—not merely which flag they might belong to.

## A practical gap score

For topic (t):

```
Opportunity(t) = D_t × W_t × R_t × C_t / S_t
```

Where:

* D_t: observable demand
* W_t: Western or English-language demand share
* R_t: recent breakout replication across channels
* C_t: compatibility with your channel and production system
* S_t: strength and freshness of existing supply

This is preferable to "high Trends score = good topic." A topic with substantial interest but ten excellent recent documentaries is less attractive than a slightly smaller topic whose available videos are old, badly packaged or superficial.

---

# Part IV — Fixing the breakout metric properly

You are correct that:

```
views / channel median views
```

over-rewards old videos and ignores changing channel size, topic demand and exposure time.

## Minimum viable version

For each channel, group videos into age bands:

* 0–7 days
* 8–30 days
* 31–90 days
* 91–365 days
* 1–3 years
* 3+ years

Then calculate:

```
Simple Outlier Score_i = log2((views_i + 100) / (median views of channel videos in same age band + 100))
```

Interpretation:

* 0 = normal
* 1 = approximately 2× expectation
* 2 = approximately 4×
* 3 = approximately 8×
* -1 = approximately half

Use the median, not the mean, because viral outliers distort channel averages. A high-signal Reddit analytics post similarly recommends tracking medians as well as averages and comparing performance at common ages such as 24 hours, seven days and 28 days. ([Reddit][3])

## Better offline model

Fit a robust model such as:

```
log(1+views_i) = f(log(1+age_i)) + channel_effect + upload_year_effect + topic_features + duration + format + seasonality + ε_i
```

Then:

```
Breakout_Residual_i = log(1+actual_views_i) - log(1+predicted_views_i)
```

Use gradient boosting or quantile regression initially. Do not jump directly to a neural network. Your data set will be relatively small, noisy and full of missing variables.

### Features worth collecting

**Channel**

* Subscribers now
* Total uploads
* Typical recent views
* Upload frequency
* Channel age
* Direct, audience or format competitor

**Video**

* Views
* Age in hours and days
* Duration
* Publish weekday
* Topic embedding
* Named entities
* Presence of famous person or institution
* Title length
* Question versus statement
* Numbers
* Emotion and curiosity terms
* Thumbnail text count
* Face/no face
* Artwork/manuscript/person/place/diagram
* Visual complexity
* Colour and contrast estimates
* Series membership
* Documentary, lecture, interview or explainer

**Market**

* Google Trends level and acceleration
* Number of recent competing videos
* Number of independent channel outliers
* Search rank by region
* News or anniversary relevance
* English supply quality

## The serious version requires snapshots

Public APIs provide current video statistics, not historical performance curves for competitors. You cannot reconstruct how many views a three-year-old video had after its first seven days from today's public count.

Start storing daily snapshots now:

```
video_id
captured_at
published_at
views
likes
comments
channel_subscribers
search_rank_US
search_rank_IN
search_rank_GB
query_id
```

Then you can model actual velocity:

```
v_i,t = (views_i,t - views_i,t-1) / Δt
```

and acceleration:

```
a_i,t = v_i,t - v_i,t-1
```

A video accelerating at day 20 may be more strategically interesting than one that received a large subscriber burst on day one and then died.

## Your final opportunity labels

Use more than breakout/not-breakout:

* **Flash:** Fast initial spike, rapid decay.
* **Search evergreen:** Slow but persistent accumulation.
* **Browse breakout:** Rapid broad expansion.
* **Resurfaced:** Old video receiving a new wave.
* **Channel carry:** Strong because the channel is currently hot.
* **Topic wave:** Several channels rising simultaneously.
* **Isolated anomaly:** One creator only.
* **Conversion asset:** Moderate views but high subscriber or next-video conversion on your own channel.

Public competitor data cannot reveal CTR, retention, traffic source or subscriber conversion. Keep the distinction between **observable outcome** and **unobservable cause** explicit.

---

# Part V — Ideas beat editing

One of the most important Reddit distinctions is between **quality** and **value**.

Quality can mean:

* Clean sound
* Beautiful animation
* Extensive research
* Smooth editing
* 4K footage
* Sophisticated prose

Value means:

* The viewer learns something unavailable elsewhere.
* A mystery is resolved.
* A desire is fulfilled.
* A difficult subject becomes understandable.
* The viewer experiences wonder, fear, amusement or transformation.
* The video saves time or replaces expensive effort.

A technically elegant readout of information the audience can absorb faster from Wikipedia may have high production quality but low video value. A modestly produced documentary with rare archival material, a clear argument and a fascinating central mystery may have enormous value. ([Reddit][1])

## Evaluate ideas before scripts

Score every concept from 0–5 on:

* Existing demand
* Evidence from multiple channels
* Novelty of angle
* Emotional force
* Viewer identity relevance
* Visual potential
* Credibility advantage
* Series potential
* Search potential
* Browse potential
* Production cost
* Risk of sensational dishonesty

Do not produce an expensive video unless it clears a threshold.

### The one-sentence test

Before research begins, complete:

> A viewer who knows nothing about me will click because ________, and remain because the video progressively reveals ________.

Weak:

> This video is about the metaphysics of Abhinavagupta.

Strong:

> A thousand years ago, an Indian philosopher argued that matter is consciousness hiding its own nature; the video reconstructs how his system supposedly works.

## The "why yours?" test

High-signal Reddit posts repeatedly ask the brutal question: why should someone watch your video when familiar creators already cover the topic? "Good editing," "I worked hard," and "I am passionate" are not viewer advantages. ([Reddit][7])

Your real advantages could be:

* English access to underused Hindi or Sanskrit sources.
* Accurate citations without academic deadness.
* Indian teachers and locations.
* Original manuscript imagery.
* Connections to current consciousness science.
* Narrative documentary structure rather than lectures.
* First-person field investigation in Varanasi.
* A visible progression from novice to serious student.
* A database capable of identifying forgotten people and texts.
* Honest separation of history, doctrine, legend and speculation.

That is a genuine competitive position:

> **Underreported Indian philosophy and esoteric history, researched seriously, explained cinematically, and eventually investigated on location.**

---

# Part VI — Channel name and brand

## The algorithm does not need your keyword in the name

The channel name is primarily a human branding and retrieval tool. YouTube's own description of recommendation inputs emphasises viewer history, video performance, relevance, satisfaction and topic affinity—not keyword density in the channel name. Partnered creators commonly report changing names without a measurable distribution penalty, although frequent or confusing changes can damage recognition. ([Google Help][2])

## A good channel name should be

* Distinctive in search.
* Pronounceable after seeing it once.
* Spellable after hearing it once.
* Broad enough to survive expansion.
* Short enough to remember.
* Available or nearly consistent across major platforms.
* Free of accidental associations with unrelated brands.
* Capable of appearing on a book, documentary or website later.
* Not dependent on "TV," "Media," "Official," numbers or punctuation.
* Supported by a descriptive banner and About line.

## Do not make the name do the title's job

A channel called **Tantra Philosophy Ancient Indian Mysticism Explained** is searchable but weak as a durable brand. Individual video titles and descriptions can carry topical meaning.

For your project:

* **Ochema** is distinctive and broad, but requires pronunciation and meaning to be taught.
* **Light in Form** is immediately evocative and aligned with your philosophy, but less distinctive in general web search.
* A workable hybrid could be a master brand plus an explanatory line:

> **Ochema**
> Hidden histories of Indian philosophy and consciousness

or:

> **Light in Form**
> Tantra, philosophy and the strange history of consciousness

Do not keep renaming. Pick one durable identity and let repeated videos give the word meaning.

---

# Part VII — Packaging: design the click before producing the video

Titles and thumbnails are not decoration added at upload. They define the audience promise and therefore the video itself.

YouTube calls them vital for communicating value and setting expectations. It now allows native A/B tests using as many as three title and thumbnail variants, including tests on existing uploads. YouTube also recommends updating older thumbnails where appropriate. ([Google Help][8])

## Start each video with three packages

Before full research, create:

* Three possible titles.
* Three thumbnail concepts.
* One-sentence viewer promise for each combination.
* The specific audience each package attracts.
* The opening ten seconds required to satisfy it.

Reject concepts that cannot generate a strong, honest package.

## Title and thumbnail should cooperate, not repeat

Bad:

* Title: **The Secret Teachings of Abhinavagupta**
* Thumbnail text: **SECRET TEACHINGS OF ABHINAVAGUPTA**

Better:

* Title: **The Philosopher Who Said You Are the Universe**
* Thumbnail: Abhinavagupta manuscript portrait/artwork with **REALITY IS YOU**

Or:

* Title: **Tantra Was Never What the West Thought**
* Thumbnail: historical manuscript contrasted with modern sexualised imagery, minimal text: **THE GREAT MISTRANSLATION**

The title supplies context. The thumbnail supplies immediate perception, tension or emotion.

## Search packaging versus Browse packaging

### Search-first

The viewer already knows what they want.

* What Is Kashmir Shaivism?
* Vijñānabhairava: 112 Meditation Practices Explained
* Who Was Abhinavagupta?
* Tantra vs Neo-Tantra
* The 36 Tattvas Explained

Use explicit language and place the critical terms early. YouTube Search evaluates how well the title, description and video content match the query, along with engagement for that search. ([Google Help][9])

### Browse-first

The viewer does not know the technical term yet.

* India's Forgotten Theory of Consciousness
* The Meditation Text That Begins With Terror
* Why Tantra Used the Things Religion Feared
* The Saint Who Let Scientists Test His Heart
* The Philosophy That Refuses to Call the World an Illusion

Browse needs recognisable human stakes, not merely accurate taxonomy.

### Hybrid

* **Kashmir Shaivism: The Indian Philosophy That Says Reality Is Consciousness**
* **Abhinavagupta: The Philosopher Who Turned the World Into a Meditation**

These are particularly appropriate while your channel is small: explicit enough for Search, compelling enough for Home.

## Thumbnail rules worth retaining

Repeated creator advice and YouTube's official guidance converge on:

* One dominant focal point.
* Comprehensibility at phone size.
* Minimal text.
* Strong separation from the interface.
* A visual question or contradiction.
* Accurate representation.
* Avoiding excess logos, small symbols and multiple equal subjects.
* Testing against current successful packaging in the niche rather than blindly copying generic MrBeast aesthetics. ([Reddit][10])

Your gallery-style artwork template can work exceptionally well because it is recognisable and credible. But the caption must be large enough to read, and the selected artwork must itself contain a legible subject. Historical art is not automatically a thumbnail; many manuscript pages become brown visual noise at 160 pixels.

---

# Part VIII — The opening minute

A widely shared Reddit analysis proposed "Hook, Heighten, Hold":

* **Hook:** Immediate core claim or question.
* **Heighten:** Introduce contradiction, stakes or unexpected evidence.
* **Hold:** Supply enough context to continue while creating the next question.

Treat this as a useful writing framework, not a proven algorithmic formula. The post's claims about exact algorithmic treatment and universal retention thresholds were not independently demonstrated. YouTube's official guidance does, however, explicitly recommend inspecting the opening 30 seconds, changing slow or confusing intros, and ensuring the opening matches the title and thumbnail. ([Reddit][11])

## First ten seconds

Your opening should answer:

* Did I click the correct video?
* Is this credible?
* What specifically is at stake?
* Why should I continue rather than read the description?

Avoid:

* Animated logos.
* "Hey guys, welcome back."
* Long disclaimers.
* Biography before premise.
* Asking for subscriptions.
* Explaining your production journey.
* Mood footage without narrative information.

## Example

Title:

> **The Yogi Who Let Scientists Test the Impossible**

Opening:

> "In 1970, researchers at the Menninger Foundation placed a Hindu monk inside a laboratory and connected him to medical instruments. What happened became one of the most repeated stories in modern yoga—but the legend has grown far beyond what the experiment actually showed."

That confirms:

* Yogi
* Scientists
* Extraordinary claim
* Investigation rather than credulous repetition
* A reason to stay: legend versus evidence

## Documentary retention is question management

A good segment answers one question while opening the next.

1. What allegedly happened?
2. Who was the subject?
3. Why did researchers believe the test mattered?
4. What did the instruments actually record?
5. How did the press transform the findings?
6. What explanations remain?
7. Why does the story still matter?

Do not withhold the central answer artificially. Give an answer, then reveal that it creates a deeper problem.

## Eliminate non-promissory side paths

A PartneredYouTube creator's strongest lesson was that every section not connected to the title-thumbnail promise becomes a potential exit point. Side stories are acceptable when they intensify the main question, not merely because they were interesting during research. ([Reddit][4])

For your scripts, label every beat:

* `PROMISE`
* `EVIDENCE`
* `ESCALATION`
* `CONTEXT`
* `PAYOFF`
* `BRIDGE`

Delete or move anything labelled merely `INTERESTING`.

---

# Part IX — Retention without brainrot

Retention does not mean frantic cuts every two seconds. It means preserving meaningful forward motion.

For philosophical documentaries, use changes in **cognitive mode**:

* Story
* Primary quotation
* Explanation
* Diagram
* Historical evidence
* Objection
* Modern comparison
* Return to story

A static visual can hold attention when the thought is intense. A hundred meaningless cuts cannot rescue conceptual drift.

## Retention diagnostics

When the graph drops, inspect the exact moment:

* Did the video finally begin after a long intro?
* Did the narration repeat the premise?
* Did an unexplained Sanskrit term appear?
* Did the visual stop matching the narration?
* Did you insert an early call to action?
* Did a side biography interrupt the mystery?
* Did the audio become difficult?
* Did the title promise one claim while the script changed subjects?

When the graph spikes:

* Was there a striking quotation?
* A diagram?
* A controversial claim?
* A transformation or reveal?
* A section viewers replayed because it was valuable—or because it was confusing?

Use relative retention and traffic-source segmentation where available. Avoid treating one overall percentage as a verdict. YouTube itself recommends evaluating dips, spikes, intros and traffic sources. ([Reddit][12])

---

# Part X — Build viewing sessions, not isolated uploads

The objective is not merely to make one video succeed. It is to make the next choice obvious.

A creator who reached 100,000 subscribers reported using one deliberately selected end-screen video and a verbal transition, producing substantial end-screen click-through and reviving older videos. The precise percentage is an individual anecdote, but YouTube provides end-screen performance metrics because this behaviour is directly measurable. ([Reddit][4])

## Build topic webs

Example cluster:

### Entry video

**Tantra Was Never What the West Thought**

Leads to:

**Why Tantra Used Forbidden Rituals**

Leads to:

**Abhinavagupta's Four Paths to Liberation**

Leads to:

**The Vijñānabhairava's Most Radical Meditation**

Each upload should have:

* A natural predecessor.
* A natural successor.
* One end-screen target.
* One pinned-comment target.
* A playlist based on viewer intent, not academic classification.

Weak playlist:

> Kashmir Shaivism Videos

Better:

> Start Here: How Tantra Understands Consciousness

## Use small videos to test expensive videos

One of the more valuable PartneredYouTube observations is that smaller standalone videos can validate interest and test packages before a multi-month flagship documentary. ([Reddit][4])

Before producing:

> **Abhinavagupta and the Complete Architecture of Consciousness**

Test:

* Why Kashmir Shaivism Rejects "The World Is an Illusion"
* The Five Powers That Make Consciousness Feel Limited
* What Does Pratyabhijñā—Recognition—Actually Mean?
* Why Abhinavagupta Thought Art Could Liberate You

The flagship then uses verified audience interest instead of hope.

---

# Part XI — Publishing frequency and consistency

Consistency is useful for:

* Maintaining your own production habit.
* Giving returning viewers a recognisable rhythm.
* Generating enough experiments to learn.
* Preventing a growing audience from going unfed.
* Building a coherent catalogue.

It does not transform weak ideas into strong ones. Recent creator discussions accurately summarise the priority as idea, packaging and retention; YouTube says upload time is not known to influence long-term performance, although publishing when viewers are active can improve immediate response. Uploading a video as unlisted before publishing should not significantly affect performance either. ([Reddit][13])

For your documentary channel, I would use:

* **One substantial long-form video every 7–14 days**
* **One smaller adjacent explainer between major releases**
* Optional Shorts only when they attract the same audience
* A research backlog so production does not stop when one topic becomes difficult

Do not promise viewers "every Tuesday" until your pipeline can reliably support it. A predictable quality range matters more than hitting Tuesday at the expense of the video.

## The "100 videos" advice

"Make 100 videos" is helpful only when interpreted as:

> Complete enough feedback cycles to become competent.

It is harmful when interpreted as:

> Publish 100 interchangeable videos and expect a statistical reward.

Creator threads contain both sides: some emphasise that competence emerges through repeated production, while others correctly observe that one excellent idea can outperform 100 weak uploads. The synthesis is **deliberate volume**: every upload should test or improve something identifiable. ([Reddit][14])

After each release, choose one primary learning target:

* Better premise
* Clearer thumbnail
* Stronger opening
* Less conceptual density
* Better audio
* More useful visual explanation
* Stronger final bridge

---

# Part XII — Search, Suggested and Browse require different strategies

## Search

Good for:

* Definitions
* Tutorials
* Text or thinker introductions
* Comparisons
* Specific practices
* Questions with stable demand

Search traffic can produce durable evergreen views but may yield one-and-done viewers who leave after receiving the answer.

## Suggested

Suggested growth is strongly related to viewing context. The currently watched video is a major signal for what appears next. This means producing a strong companion to an already successful video is not inherently "copying"; it can fit an established viewing journey. ([Google Help][15])

Study:

* Which videos appear beside the niche leaders?
* Which title patterns form clusters?
* Which questions remain unanswered?
* What does the leading video mention but not explain?
* What more advanced or sceptical follow-up would its viewers want?

## Browse

Browse requires the proposition to make sense without a typed query. It rewards broader emotional or intellectual entry points.

Search:

> What Are the Five Kañcukas?

Browse:

> The Five Forces That Make an Infinite Mind Feel Trapped

Same underlying research; different acquisition surface.

---

# Part XIII — Shorts: contested, so use an audience test

Reddit is sharply divided about whether Shorts harm long-form. Some partnered creators report substantial drops or "dead" subscribers; others argue that these are confounded anecdotes and that weak crossover simply means the Shorts and long-form videos attract different viewers. The most defensible conclusion is not that Shorts technically poison a channel, but that **audience mismatch produces weak conversion and misleading subscriber growth**. ([Reddit][16])

## Use Shorts when

* The same person would plausibly enjoy the long video.
* The Short communicates the channel's real tone.
* It contains a complete idea rather than an empty trailer.
* It links naturally to one related long video.
* You evaluate long-form conversion, not just Short views and subscribers.

Good:

> "Tantra does not originally mean sex. The word refers to a system, framework or continuum—and its historical traditions are much stranger than the modern stereotype."

Bad:

> Generic AI quote over temple footage: "Your third eye is awakening."

The second may attract a large audience that has no interest in historical or philosophical documentaries.

Track:

```
Short-to-long conversion = long-video viewers attributed to Short / Short viewers
```

Also compare:

* Returning long-form viewers before and after.
* Long-form views per subscriber.
* Audience overlap.
* Subscriber source.
* Whether the same topics work in both formats.

If Shorts generate vanity subscribers but almost no movement into your catalogue, stop or separate them.

---

# Part XIV — Community and promotion

## Comments are research, not an engagement ritual

Do not ask "What do you think?" mechanically.

Ask questions that expose demand:

* Which tantric figure should be investigated next?
* What part of the 36 tattvas remains unclear?
* Which claim have you heard that you want sourced?
* Would you rather see the ritual history or the philosophy next?
* Which text should receive a line-by-line introduction?

Classify comments into:

* Confusion
* Objection
* Requested follow-up
* Personal testimony
* Source request
* Correction
* Emotional response
* New entity or topic
* Viewer familiarity level

Feed these into the idea model.

## External promotion

Promotion is useful when it reaches people who genuinely want the video. Dumping links into generic promotion groups supplies low-intent traffic and little durable learning. Traffic-source retention can differ considerably, so diagnose external viewers separately rather than assuming they "killed the algorithm." ([blog.youtube][17])

High-value promotion:

* A relevant scholar or translator sharing the video.
* A discussion thread where the video directly answers the question.
* A newsletter serving the same audience.
* Collaboration with an adjacent creator.
* A source author or institution acknowledging the work.
* A meaningful clip posted to a community already discussing the subject.

Low-value promotion:

* Sub-for-sub.
* Generic YouTube-promotion communities.
* Paid low-intent views.
* Posting unrelated links under large creators.
* Friends clicking out of obligation and leaving immediately.

---

# Part XV — Analytics that actually lead to decisions

Do not stare at real-time views. Maintain a decision table.

## Track at fixed ages

For every upload:

| Metric | 24h | 7d | 28d | 90d |
|--------|-----|
| Impressions | | | | |
| Views | | | | |
| CTR | | | | |
| Average view duration | | | | |
| Average percentage viewed | | | | |
| 30-second retention | | | | |
| Subscribers gained | | | | |
| Returning viewers | | | | |
| End-screen clicks | | | | |
| Browse share | | | | |
| Suggested share | | | | |
| Search share | | | | |
| External share | | | | |

The fixed-age approach is a direct improvement over comparing lifetime view counts. Reddit's strongest analytics post recommends tracking 24-hour, seven-day and 28-day performance and comparing videos against channel medians. ([Reddit][3])

## Diagnose using combinations

### High impressions, low CTR

Likely packaging, audience mismatch or heavy testing with cold viewers.

Action:

* Test new title and thumbnail combinations.
* Inspect which traffic source has low CTR.
* Reconsider whether the concept is legible to non-experts.

### Low impressions, high CTR

Possible narrow topic, tiny core audience, insufficient comparative data or early sample bias.

Action:

* Do not celebrate the CTR alone.
* Examine whether similar topics receive meaningful impressions.
* Create a broader entry-point version of the idea.
* Wait for a reasonable observation period.

### High CTR, weak early retention

The package may overpromise or misrepresent the opening.

Action:

* Rewrite the first 30 seconds.
* Remove greetings and setup.
* Confirm the exact promise immediately.
* Avoid using an exciting package for a slow academic lecture.

YouTube explicitly identifies this pattern as a possible mismatch between package and delivery. ([blog.youtube][17])

### Strong retention, weak CTR

The people who enter enjoy it, but not enough people enter.

Action:

* Repackage.
* Preserve the video.
* Test older videos with new thumbnails and titles.
* Learn what the existing viewers believed they were choosing.

### Strong views, low subscribers

The video may solve a one-time search problem or sit outside the channel's repeatable proposition.

Action:

* Improve the bridge to an adjacent video.
* Clarify the recurring channel promise.
* Compare subscriber conversion per 1,000 views.

A PartneredYouTube discussion specifically recommends studying which videos produce subscribers relative to views rather than merely copying the highest-viewed topics. ([Reddit][18])

### Moderate views, high next-video conversion

This may be a strategically valuable catalogue node even if it is not a breakout.

Do not optimise only for isolated view count. A channel is a connected system.

---

# Part XVI — Myths to delete from your pipeline

## "Tags are crucial"

False for most videos. YouTube says tags mainly help with misspellings and otherwise play a minimal role in discovery. Titles, thumbnails and descriptions matter more. ([Google Help][19])

## "There is one ideal CTR"

False. Compare against your own matched contexts and understand traffic-source expansion.

## "Uploading at the wrong hour killed it"

Not as a long-term rule. Publish time may affect immediate activity but is not known to affect long-term performance. ([Google Help][2])

## "Consistency makes YouTube reward you"

Consistency helps audiences and learning systems; it cannot rescue weak ideas.

## "A channel becomes permanently dead"

Usually the audience is not responding to the recent propositions. Diagnose impressions, clicks and retention rather than treating the channel as cursed. ([Reddit][20])

## "Subscribers guarantee views"

Subscriptions are one input. YouTube recommendations are heavily personalised, and many subscribers will not be interested in every upload. ([Google Help][2])

## "More editing means more value"

Only when the editing improves comprehension, emotion or progression.

## "Never study competitors because originality"

Wrong. Study structures, demand, angles and audience expectations. Do not copy scripts, footage, research phrasing or distinctive creative expression. The useful creator maxim is essentially: imitate the grammar, assimilate it, then innovate. ([Reddit][11])

## "Delete and re-upload every flop"

Avoid this as a routine. You lose accumulated watch time, comments, links and the possibility of later discovery. Repackage first. Delete only for meaningful factual, legal, reputational or production reasons—not because 24 hours disappointed you. Reddit advice here is highly anecdotal and contradictory, so there is no basis for claims about mysterious permanent algorithmic damage. ([Reddit][21])

## "A/B testing means selecting the highest CTR"

YouTube's native testing should be used because it evaluates title and thumbnail variants in the real environment. But the winner must still accurately set expectations; click-maximisation that lowers satisfaction is strategically useless. YouTube's recommendation system includes satisfaction signals, not merely clicks. ([Google Help][22])

---

# Part XVII — The operating system for your channel

## Stage 1: Niche census

Build a database of approximately:

* 15–25 direct channels if available.
* 15–30 audience-adjacent channels.
* 10–20 format reference channels.

Collect every eligible long-form upload and update statistics daily or weekly.

## Stage 2: Topic graph

Extract:

* People
* Texts
* Traditions
* Practices
* Places
* Claims
* Controversies
* Experiments
* Modern comparisons
* Viewer questions

Connect them:

```
Abhinavagupta
  -> Kashmir Shaivism
  -> aesthetics/rasa
  -> Tantrāloka
  -> Pratyabhijñā
  -> consciousness
  -> ritual
  -> Varanasi/Kashmir teachers
```

## Stage 3: Opportunity detection

Flag:

* Recent multi-channel outliers.
* Old evergreen videos with weak current competition.
* High-demand searches answered badly.
* Indian-language breakouts lacking strong English equivalents.
* Topics appearing in comments but not yet in titles.
* Famous adjacent concepts with an unknown tantric connection.
* Upcoming anniversaries, releases or public discussions.
* Successful videos whose obvious follow-up does not exist.

## Stage 4: Treatment generation

For every opportunity, generate:

* Core audience
* Cold audience entry point
* Historical question
* Emotional stake
* Evidence available
* Potential objections
* Three titles
* Three thumbnail treatments
* Hook
* Beat sheet
* Source pack
* Visual pack
* Risk assessment
* Connected next video

## Stage 5: Human approval

Your automated factory should not autonomously publish anything involving historical accusations, secret practices, medical claims, living teachers or contested translations.

Human checks:

* Is the core claim actually supported?
* Is the title stronger than the evidence?
* Are legends clearly labelled?
* Is the topic treated respectfully without becoming devotional propaganda?
* Does the video distinguish tantra from generic social-media spirituality?
* Are the visuals licensed and correctly attributed?
* Would the intended viewer understand the proposition immediately?

## Stage 6: Post-release learning

At 24 hours, seven days and 28 days:

* Save metrics.
* Label what happened.
* Compare to matched medians.
* Inspect package and retention.
* Extract comment questions.
* Identify the strongest next video.
* Update topic and packaging priors.

Do not let the system learn merely "red thumbnails win." It must learn conditional relationships:

> Manuscript-focused thumbnails work for known-text Search viewers, while expressive faces or strong symbolic objects work better for cold Browse viewers.

---

# Part XVIII — The tantra-channel strategy I would use

## Channel proposition

> **The hidden history and philosophy of Indian consciousness traditions—reconstructed from texts, people, experiments and places.**

This gives you room for:

* Tantra
* Kashmir Shaivism
* Yogis and saints
* Sanskrit texts
* Consciousness science
* Varanasi field reporting
* Hindi interviews
* Ritual history
* Buddhist and Sufi comparison
* Nepalese and regional traditions

It is tighter than "all spirituality" but not so narrow that you exhaust direct tantra searches.

## Four content lanes

### 1. Breakout documentaries

Cold-audience historical stories:

* The Yogi Scientists Couldn't Explain
* India's Most Misunderstood Philosophy
* The Tantric Saint Who Lived in a Cremation Ground
* The Secret Experiment Behind Modern Yoga
* The Philosopher Who Said Reality Is Consciousness

### 2. Search foundations

* What Is Kashmir Shaivism?
* Who Was Abhinavagupta?
* Tantra vs Neo-Tantra
* The 36 Tattvas Explained
* What Is Śaktipāta?
* Vijñānabhairava for Beginners

### 3. Authority builders

Deeper, carefully sourced work:

* Abhinavagupta's Theory of Recognition
* How Ābhāsa Differs From Illusion
* The Four Upāyas in the Tantrāloka
* Rasa as a Route to Liberation
* Sanskrit terminology and translation problems

### 4. Field material

When you reach India:

* Learning Hindi to Speak With Yogis
* Searching for Kashmir Shaivism in Varanasi
* What a Sivananda Ashram Day Is Actually Like
* Asking Sanskrit Teachers How to Read the Tantrāloka
* What Indian Practitioners Think the West Gets Wrong About Tantra

The breakout lane acquires viewers. Foundations answer queries. Authority creates trust. Field material makes the channel personally irreplaceable.

## Your moat is not automation

Automation will become increasingly common. Your moat is:

* Source quality
* Taste
* Topic selection
* Honest judgement
* Personal progression
* Access to India
* Hindi and Sanskrit development
* Relationships with teachers
* A coherent philosophical perspective
* An archive and knowledge graph that compounds over years

The machine should increase research coverage and experimental speed. It should not flatten your videos into interchangeable narrated summaries.

---

# Your immediate 30-video experiment

Do not wait for a perfect machine-learning model. Build the data collector, then produce three groups.

## Ten broad-entry documentaries

Use tantra, yogis, forbidden practices, scientific experiments, forgotten figures and strange historical events.

## Ten searchable foundations

Answer the most important beginner questions cleanly.

## Ten bridge videos

Connect the broad stories to your serious interests:

* Yogi experiment → theories of mind-body control
* Kundalini → subtle-body history
* Tantra stereotype → original texts
* Nonduality → Kashmir Shaivism
* Consciousness science → Abhinavagupta
* Meditation techniques → Vijñānabhairava

For every video, pre-register:

* Expected audience
* Expected traffic source
* Package
* Hypothesis
* Success threshold relative to matched channel median
* Next-video target

After 30 videos, you should know:

* Which entry-point emotions work: mystery, taboo, wonder, biography, science or practical transformation.
* Which visual class works: person, manuscript, temple, symbolic object, diagram or contrast.
* Which technical terms attract Search without repelling Browse.
* Which subjects convert viewers into repeat watchers.
* Whether Shorts produce meaningful long-form movement.
* Whether English tantra is genuinely underserved or merely low demand.

That is the point at which the ML system becomes useful. Before then, a sophisticated model will mostly automate uncertainty.

## The rule to lock into the pipeline

> **Never ask, "How can we get the algorithm to push this?" Ask, "Which viewers already want this promise, how do we communicate it instantly, and does every minute fulfil it?"**

That is the durable insight underneath nearly every genuinely useful Reddit success post—and it is consistent with how YouTube describes its own recommendation system. ([Reddit][4])

[1]: https://www.reddit.com/r/NewTubers/comments/bc0whz/understanding_value_why_quality_isnt_enough/ "Understanding \"Value\": Why \"Quality\" Isn't Enough : r/NewTubers"
[2]: https://support.google.com/youtube/answer/16533387?hl=en&utm_source=chatgpt.com "YouTube's Recommendation System"
[3]: https://www.reddit.com/r/NewTubers/comments/17jjngu/these_are_the_metrics_that_actually_grow_your/ "These are the metrics that actually grow your channel. : r/NewTubers"
[4]: https://www.reddit.com/r/PartneredYoutube/comments/1k8t7tr/i_just_hit_100k_after_13_years_heres_what_ive/ "I just hit 100K after 13 years. Here's what I've learned. : r/PartneredYoutube"
[5]: https://www.reddit.com/r/PartneredYoutube/comments/1mkqrev/how_i_got_monetized_in_40_days_instead_of_1_year/ "How I Got Monetized in 40 Days Instead of 1 Year. My Small Channel Growth Strategy : r/PartneredYoutube"
[6]: https://developers.google.com/youtube/v3/docs/search/list?utm_source=chatgpt.com "Search: list | YouTube Data API"
[7]: https://www.reddit.com/r/NewTubers/comments/jcu80w/if_you_want_to_make_money_on_youtube_please_read/ "If you want to make money on Youtube, please read. : r/NewTubers"
[8]: https://support.google.com/youtube/answer/16559650?hl=en&utm_source=chatgpt.com "Understand your content performance for YouTube's ..."
[9]: https://support.google.com/youtube/answer/141805?hl=en&utm_source=chatgpt.com "YouTube performance FAQ & Troubleshooting"
[10]: https://www.reddit.com/r/NewTubers/comments/15x3196/your_1_advice_to_grow_your_channel/ "Your #1 Advice to Grow Your Channel? : r/NewTubers"
[11]: https://www.reddit.com/r/NewTubers/comments/1gqajmp/i_analyzed_the_first_minute_of_100_viral_videos/ "I Analyzed the First Minute of 100 Viral Videos - Here's The Success Pattern Nobody's Talking About : r/NewTubers"
[12]: https://www.reddit.com/r/NewTubers/comments/1k51u24/my_honest_advice_for_people_trying_to_grow/ "\"My\" Honest Advice for People trying to Grow YouTube channels. : r/NewTubers"
[13]: https://www.reddit.com/r/NewTubers/comments/1sihen3/consistency_is_overrated_on_youtube/?utm_source=chatgpt.com "Consistency is overrated on YouTube : r/NewTubers"
[14]: https://www.reddit.com/r/NewTubers/comments/1c5m0k7/dont_expect_success_before_youve_made_100_videos/?utm_source=chatgpt.com "Don't expect success before you've made 100 videos"
[15]: https://support.google.com/youtube/answer/16089387?hl=en&utm_source=chatgpt.com "How YouTube recommendations work"
[16]: https://www.reddit.com/r/PartneredYoutube/comments/1imu538/will_posting_shorts_hurt_my_long_form_content/ "Will posting shorts hurt my long form content? : r/PartneredYoutube"
[17]: https://blog.youtube/creator-and-artist-stories/master-these-4-metrics/?utm_source=chatgpt.com "Stop guessing, start growing: Master these 4 metrics"
[18]: https://www.reddit.com/r/PartneredYoutube/comments/1dozi2p/aside_from_the_standard_youtube_advice_thumbnails/?utm_source=chatgpt.com "Aside from the standard YouTube advice (thumbnails, titles ..."
[19]: https://support.google.com/youtube/answer/146402?hl=en-GB&utm_source=chatgpt.com "Add tags to your YouTube videos"
[20]: https://www.reddit.com/r/PartneredYoutube/comments/xmtiqo/at_what_point_is_a_channel_just_dead/?utm_source=chatgpt.com "At what point is a channel just dead? : r/PartneredYoutube"
[21]: https://www.reddit.com/r/NewTubers/comments/1lt8pg6/never_delete_your_videos_advice_is_wrong/?utm_source=chatgpt.com "Never delete your videos advice is wrong : r/NewTubers"
[22]: https://support.google.com/youtube/answer/16391400?hl=en&utm_source=chatgpt.com "A/B test titles & thumbnails - YouTube Help"


The next phase should be **falsification, not more advice collection**. We need to identify which attractive claims are true specifically for English-language tantra documentaries.

## First: three corrections from the structured-data research

### 1. Regional YouTube search does not measure recommendation suppression

`regionCode=US` tells the API to return videos viewable in the US. It does not simulate an American viewer's personalised Home feed. `relevanceLanguage=en` merely favours English-relevant results and can still return other languages. Therefore, US-versus-India rank differences measure **regional search availability**, not "YouTube refuses to push Indian channels to Westerners." ([Google for Developers][1])

That test remains useful, but the claim must be reframed:

> Are good English videos on this subject difficult to discover through Western search results?

### 2. Competitor data cannot reveal the causal mechanism

For other channels, the public Data API gives metadata and current public statistics. CTR, impressions, retention, traffic sources, viewer geography and watch time require authorization from the channel owner. ([Google for Developers][2])

So split the research system:

* **Competitor data:** identify demand, outliers, gaps and transferable formats.
* **Your channel data:** causally test packaging, intros, traffic sources, Shorts and session-building.

As of January 2026, YouTube's owner-authorized Reporting API includes reach reports containing impressions and CTR, making your own channel a much better experimental laboratory. ([Google for Developers][3])

### 3. Google Trends is useful but not search volume

The standard Trends interface uses a sample of searches, normalizes by geography and time, and rescales each request from 0–100. Low-volume terms can appear as zero, and random statistical noise is deliberately introduced. ([Google Help][4])

Google announced a Trends API alpha with consistently scaled data, geography controls and a rolling five-year history, but access remains limited to approved testers. ([Google for Developers][5])

The public BigQuery dataset is immediately usable, but contains only the Top 25 and Top 25 Rising searches. That makes it valuable for detecting **macro hooks**, not measuring persistent demand for niche terms such as "Pratyabhijñā." ([Google Help][6])

---

# The six experiments I would run

## Experiment 1: Is English tantra actually underserved?

This is the most important experiment.

### Sample

Start with 40–60 topic groups:

* tantra meaning
* tantric philosophy
* Kashmir Shaivism
* kundalini
* Vijñānabhairava
* Abhinavagupta
* aghori
* cremation-ground tantra
* goddess worship
* Śrīvidyā
* Kaula
* nondual Shaivism
* mantra science
* tantric Buddhism
* yogi scientific experiments

Each topic should contain synonyms and beginner-language formulations:

```
Kashmir Shaivism
Trika philosophy
nondual Shaivism
Indian philosophy consciousness
reality is consciousness philosophy
```

### Demand measurements

For US, UK, Canada, Australia and India:

* Five-year Google Trends level.
* Last-90-day versus previous-90-day growth.
* Geographic breadth.
* Related and rising queries.
* English Wikipedia pageviews.
* Number of recent Reddit questions.
* Frequency of the topic in comments on adjacent videos.

Wikimedia's Analytics API supplies public pageview data, while Google Trends supplies relative search attention. ([doc.wikimedia.org][7])

### Supply measurements

For each topic, retrieve the top 25–50 YouTube results and classify:

* English or non-English.
* Documentary, lecture, interview, vlog or Shorts.
* Published in the last 24 months.
* Duration.
* Current views.
* Age-normalized outlier score.
* Channel size.
* Whether it genuinely answers the query.
* Production and research quality, rated manually from 1–5.

Do not use YouTube's approximate `totalResults` value as the supply count. YouTube explicitly says it is approximate. ([Google for Developers][1])

### Score

```
GapScore_t = z(Western demand) + z(demand growth) + z(question density) - z(quality-adjusted recent supply)
```

A topic passes when:

* It is above median demand in at least three Western countries.
* Demand is stable or increasing.
* Fewer than five strong recent English videos exist.
* At least one neighbouring or non-English version has already performed.

### What this settles

It distinguishes:

* **Actually underserved:** meaningful demand, poor supply.
* **Terminology gap:** demand exists under ordinary language, not Sanskrit terms.
* **Low-demand niche:** poor supply because almost nobody searches.
* **Well-served niche:** appealing personally, but crowded.
* **Browse-only opportunity:** low explicit search demand but proven narrative potential.

---

## Experiment 2: Cross-language lead–lag

This is probably your strongest original edge.

### Hypothesis

Topics sometimes break out in Hindi or other Indian-language channels before a high-quality English documentary exists.

### Simple version

Begin with Hindi and English only.

1. Identify 20–30 reliable Hindi channels covering tantra, saints, temples, yogis, astrology and Indian religious history.
2. Enumerate all uploads.
3. Calculate age-normalized outlier scores within each channel.
4. Translate and cluster titles into shared concepts.
5. Count English-language coverage of each concept.
6. Record the publication dates of Hindi and English outliers.

### Score

```
LanguageLag_t = (recent Hindi outliers_t × independent Hindi channels_t) / (1 + strong recent English videos_t)
```

A particularly strong signal would be:

* Three or more unrelated Hindi channels produce outliers.
* The topic is not tied to temporary celebrity news.
* Western demand exists for an adjacent concept.
* Fewer than two strong English documentaries exist.
* English-speaking commenters request context or translation.

### Critical control

Compare successful Hindi topics with unsuccessful Hindi topics. Otherwise, the system will merely find dramatic Hindi titles and assume they transfer culturally.

Useful transfer variables:

* Universal human stake.
* Famous person or strange biography.
* Mystery or disputed event.
* Visual evidence.
* Scientific or historical tension.
* Dependence on Indian celebrity recognition.
* Dependence on language-specific humour.
* Amount of background knowledge required.

### Decision rule

Prioritize topics that succeed in Hindi **and** resemble known English documentary archetypes:

> forbidden practice, strange experiment, misunderstood philosophy, lost text, unexplained saint, hidden history, consciousness theory.

---

## Experiment 3: Find the breakout metric that really predicts future performance

Do not decide theoretically whether an age-band ratio or regression residual is best. Backtest them.

### Collection

For every new upload from the competitor universe, save daily:

```
video_id
channel_id
published_at
captured_at
views
likes
comments
channel_subscribers
```

Public API statistics show the current state, not historical first-week performance. You therefore need snapshots from now onward rather than trying to reconstruct curves later. Competitor retention and impressions remain unavailable. ([Google for Developers][8])

### Compare four predictors

At day seven, calculate:

**A. Raw ratio**

```
V_7 / channel median
```

**B. Age-band ratio**

```
V_7 / median day-7 views for that channel
```

**C. Velocity ratio**

```
(V_7 - V_3) / channel median (V_7 - V_3)
```

**D. Regression residual**

Predicted views based on:

* Channel.
* Video age.
* Current channel baseline.
* Duration.
* Topic.
* Publication year.

### Target

Predict which videos finish in the top 10% of matched performance at day 28.

Evaluate:

* Precision among the top 20 predictions.
* Spearman correlation with day-28 outcome.
* False-positive rate.
* Whether it works equally for small and large channels.

The winning metric is the simplest one whose predictive performance is close to the best model. There is little value in a complex ML system that improves precision from 71% to 72%.

---

## Experiment 4: Search title versus narrative title versus hybrid

This must be tested on your own videos.

YouTube now allows up to three title, thumbnail or combined variants in a native test. The winning version is selected according to watch-time share rather than CTR alone. Tests can run for up to two weeks, and YouTube recommends initially testing older videos to reduce risk. ([Google Help][9])

### Three variants

For the same video:

**Search**

> What Is Kashmir Shaivism?

**Narrative**

> The Indian Philosophy That Says Reality Is Consciousness

**Hybrid**

> Kashmir Shaivism: The Philosophy That Says Reality Is Consciousness

Run this across at least ten eligible videos rather than drawing conclusions from one result.

### Record

* Winning archetype.
* Search versus Browse impression share.
* Watch-time share.
* New versus returning viewers.
* Whether the winner changes according to audience familiarity.
* Whether Sanskrit terms help or hurt.

### Likely useful result

You may discover a conditional rule rather than one universal winner:

* Exact titles win for known texts and practical questions.
* Narrative titles win for biographies and historical mysteries.
* Hybrids win for philosophical introductions.

That conditional rule is much more useful to the automated system than "curiosity titles perform better."

---

## Experiment 5: Comment-to-content gap

Comments are a cheap demand-discovery dataset.

The public `commentThreads.list` endpoint costs one normal API unit, so sampling comments across a modest competitor set is inexpensive. ([Google for Developers][10])

### Sample

For:

* 20 breakout videos.
* 20 matched ordinary videos.
* Up to 100 top-level comments each.

Classify comments into:

* Requested explanation.
* Requested follow-up.
* Confusion.
* Factual correction.
* Source request.
* Scepticism.
* Personal experience.
* "Please translate/explain in English."
* Mention of another person, text or event.

### Metric

```
UnansweredQuestionDensity_t = repeated unresolved question clusters / comments sampled
```

The strongest signal is not one popular comment. It is the same question appearing:

* Under several videos.
* On several channels.
* In Reddit discussions.
* In search autocomplete or Trends related queries.
* Without a strong recent English answer.

This could uncover opportunities that keyword tools miss because viewers describe their confusion conversationally.

---

## Experiment 6: Does one video create a session?

Run this once you have a catalogue of around 15–20 connected videos.

### Test

Divide comparable videos between:

* A deliberate, verbally introduced next video.
* YouTube's generic "best for viewer" recommendation.
* A deliberate next video without a verbal transition.

Measure:

```
End-screen CTR = end-screen clicks / end-screen impressions
```

YouTube provides end-screen impressions, clicks and click rate in owner-authorized reporting. ([Google for Developers][3])

More importantly, compare:

* Next-video views.
* Returning viewers.
* Views per unique viewer.
* Whether old videos revive.
* Which topic connections work.

This answers whether your channel should be built as isolated documentaries or as tightly connected viewing paths.

---

# Lower-priority experiments

## Shorts crossover

Alternate between long-form releases with and without a tightly matched Short. Measure actual movement from the Short into the related documentary, not subscribers gained.

Do this later. At the beginning, small sample sizes and rapidly changing baseline performance will make the result noisy.

## Upload time

Do not spend serious research resources here. It may influence the first few hours, but it is unlikely to reveal your strategic edge.

## Channel name

Test recognition qualitatively, not algorithmically:

* Can five people pronounce it?
* Can they spell it after hearing it?
* Can they recall it a day later?
* Does searching it return unrelated dominant entities?

This is a branding question, not where the highest research return lies.

## Intro length

Instead of trying to create duplicate uploads, rate each video's **promise alignment**:

> Does the first 20 seconds clearly deliver what the title and thumbnail promised?

Have three independent raters score it before publication, then compare the score with 30-second retention. This will give you a channel-specific rule without duplicate-video contamination.

---

# Structured datasets worth integrating

| Dataset | What it tells you | What it cannot tell you |
|---------|-------------------|------------------------|
| YouTube Data API | Videos, channels, titles, descriptions, dates, views, likes, comments | Competitor CTR, retention, watch time or geography |
| YouTube Analytics/Reporting | Your impressions, CTR, retention, traffic sources, geography and end-screen performance | Competitor private analytics |
| Google Trends Explore | Relative demand, growth, geography, related queries | Absolute search volume |
| Google Trends API alpha | Consistently scaled five-year interest data | Currently limited-access |
| Google Trends BigQuery | Top and rising macro searches across countries | Most persistent niche queries |
| Wikimedia Analytics | Public attention around named people, texts and concepts | Direct video demand or viewer intent |
| Reddit | Questions, language used by novices, objections and desired follow-ups | Representative population demand |
| OpenAlex | Scholarly growth, important papers, experts and emerging academic language | General-public interest |
| Global YouTube Trending Dataset | Historical cross-country diffusion and title archetypes | Current niche recommendation performance |

OpenAlex provides an open catalogue and API covering works, authors, institutions, sources and topics, making it useful for detecting academic attention and finding credible experts. ([OpenAlex Developers][11])

The Global YouTube Trending Dataset contains four daily snapshots across 104 countries from July 2022 through June 2025, covering 726,627 unique videos. It is useful for historical cross-country diffusion, although its broad trending-video population will contain relatively little niche tantra material. ([databank.illinois.edu][12])

---

# My main new edge: the Language-Lag Opportunity Engine

I would make this the centre of the system.

## Signal 1: Proven Indian attention

A topic produces several outliers in Hindi or another Indian language.

## Signal 2: Western adjacency

Western audiences already show interest in an adjacent desire:

* consciousness
* kundalini
* nonduality
* altered states
* meditation
* forbidden religion
* strange historical experiments
* hidden philosophy

## Signal 3: English supply failure

Current English results are:

* Old.
* Lectures rather than documentaries.
* Poorly packaged.
* Historically inaccurate.
* Sensational without sources.
* Too advanced for newcomers.
* Missing completely.

## Signal 4: Your production advantage

You have:

* Usable primary and secondary sources.
* Public-domain visuals.
* A credible narrative.
* An English framing.
* Potential future access to Indian locations and teachers.
* A natural next-video path.

Then:

```
Opportunity = (Indian proof × Western adjacency × narrative strength × source availability) / (1 + English quality supply)
```

This is better than chasing whatever is globally trending. It identifies **culturally proven stories that have not yet crossed the language boundary**.

---

# A second edge: authority–attention mismatch

Look for topics where:

* OpenAlex publications are increasing.
* Wikipedia pageviews are increasing.
* Reddit questions are increasing.
* Google Trends is stable or rising.
* English YouTube supply remains weak.

For example, an emerging academic debate about tantric embodiment or consciousness may not itself be clickable. But it can expose a broader documentary proposition:

> "A thousand-year-old theory of consciousness is suddenly relevant again."

The scholarship supplies authority; the public-attention signals tell you whether there is an audience; the YouTube gap tells you whether the opportunity remains open.

---

# Minimal implementation

You only need six tables:

```
channels
videos
video_snapshots
search_snapshots
topic_signals
comment_clusters
```

Use `search.list` only for discovering channels and measuring query results. Current official quota documentation gives it a separate limit of 100 calls per day. Once a channel is known, retrieve its uploads playlist and enumerate videos with `playlistItems.list`, then batch video statistics with `videos.list`; these normal list calls cost one unit each. ([Google for Developers][10])

## Initial research order

1. Run the demand–supply gap test.
2. Build the Hindi–English language-lag detector.
3. Begin daily competitor snapshots immediately.
4. Extract unresolved comment clusters.
5. Use your first uploads to test search, narrative and hybrid packaging.
6. Add session and Shorts experiments only after a connected catalogue exists.

The most valuable discovery will probably not be "what thumbnail colour works." It will be:

> **Which stories have already proven themselves inside India, possess a universal Western entry point, and still lack a strong English documentary?**

That is a genuine information advantage rather than generic YouTube optimisation.

[1]: https://developers.google.com/youtube/v3/docs/search/list "Search: list | YouTube Data API | Google for Developers"
[2]: https://developers.google.com/youtube/analytics/channel_reports?utm_source=chatgpt.com "YouTube Analytics API: Channel Reports"
[3]: https://developers.google.com/youtube/analytics/revision_history?utm_source=chatgpt.com "Revision History | YouTube Analytics and Reporting APIs"
[4]: https://support.google.com/trends/answer/4365533?hl=en "FAQ about Google Trends data - Trends Help"
[5]: https://developers.google.com/search/blog/2025/07/trends-api "Introducing the Google Trends API (alpha): a new way to access Search Trends data | Google Search Central Blog | Google for Developers"
[6]: https://support.google.com/trends/answer/12764470?hl=en "Get started with the Google Trends dataset - Trends Help"
[7]: https://doc.wikimedia.org/generated-data-platform/aqs/analytics-api/?utm_source=chatgpt.com "Wikimedia Analytics API"
[8]: https://developers.google.com/youtube/v3/docs/videos/list?utm_source=chatgpt.com "Videos: list | YouTube Data API"
[9]: https://support.google.com/youtube/answer/16391400?hl=en-GB "A/B test titles and thumbnails - YouTube Help"
[10]: https://developers.google.com/youtube/v3/determine_quota_cost "Quota Calculator | YouTube Data API | Google for Developers"
[11]: https://developers.openalex.org/?utm_source=chatgpt.com "OpenAlex API"
[12]: https://databank.illinois.edu/datasets/IDB-9307654 "Global YouTube Trending Dataset (2022–2025): Three Years of Platform-Curated, Cross-National Trends in Digital Culture | Illinois Data Bank | Illinois"
