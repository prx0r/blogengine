# Reddit Signal Taxonomy — Getting the Most Out of the Data

## Core Insight

Reddit's structure gives us four distinct signal layers, not one. Submissions tell you what people ask. Comments tell you what the community validates. Scores tell you how much agreement exists. Controversiality tells you where agreement breaks down. Each layer answers a different research question.

---

## Layer 1: Submission Signals (What People Want To Know)

### High Score + High Comments — Viral Popular Topic

```
score > 100, num_comments > 50
```

The community upvoted it AND engaged with it. This is a topic that generates both agreement and discussion. 

**Use:** Broad documentary topic candidate. The question has mass appeal.
**Subreddit role matters:** In r/spirituality, this indicates mass demand. In r/KashmirShaivism, it indicates specialist interest with potential to broaden.
**Example pattern:** "What is the hardest thing about awakening?" (high score) with 80 comments (people sharing experiences) → content frame: "Why Awakening Is Harder Than Anyone Tells You"

### High Score + Low Comments — Widely Approved Reference

```
score > 50, num_comments < 10
```

The community upvoted but didn't debate it. This is typically a link to an article, a book recommendation, or a well-known answer. It's reference material, not a discovery opportunity.

**Use:** Source discovery (what articles/books does this community consider authoritative?)
**Check:** Is it a question or a link? Links → source discovery. Questions → already-solved, boring.

### Low Score + High Comments — Controversial / Unresolved

```
score < 10, num_comments > 30
```

People are arguing but not agreeing. The score is low because the post is controversial — downvotes from one side cancel upvotes from the other. The comment count is high because both sides want to engage.

**Use:** Objection mining. What are the fault lines? What do people disagree about? These are the exact topics where a documentary needs to handle multiple perspectives carefully.
**Example pattern:** "Is Tantra really about sex?" — low score (downvoted by practitioners), high comments (everyone has an opinion) → content frame: "Why Westerners Think Tantra Is About Sex and Why Practitioners Disagree"

### High Score + Explicit Question — Validated Demand

```
score > 30, title contains "?"
```

The community upvoted a question. This is direct evidence that people want this answered.

**Use:** Primary candidate for treatment generation. The phrasing of the question is audience-validated copy for titles and hooks.
**Subreddit role matters:**
- r/KashmirShaivism: a specialist question with high score means experts also find it worth asking → "What is the difference between prakasa and vimarsa?" could be a search foundation video
- r/awakened: a mass question with high score means universal demand → "Why do I feel worse after meditation?" is a hook

### High Score + Personal Experience — Narrative Appeal

```
score > 30, selftext length > 500, first person pronouns
```

Someone shared a personal story and the community validated it. This is evidence that narrative framing works for this topic.

**Use:** Story structure discovery. Extract: setup → escalation → anomaly → aftermath. The community's reaction tells you which parts of the story resonate.
**Example:** r/NDE post with a detailed near-death story and high score → narrative frame: "The scientist who didn't believe in NDEs until it happened to him"

### High Score + Resource Request — Educational Demand

```
score > 30, contains "book" or "resource" or "recommend"
```

People are asking for learning materials. This means the topic is actively being studied, not just casually consumed.

**Use:** Content pipeline priority. If people are asking for book recommendations, they want structured educational content. A documentary series on this topic would meet active demand.
**Example pattern:** "Best books on Kashmir Shaivism for beginners?" recurring every 6 months → clear gap in accessible introductory content

### Recurring Across Years — Persistent Unresolved Question

Same question or topic appearing in 2018, 2020, 2022. The community still hasn't found a satisfactory answer, or the question is perennial.

**Use:** Evergreen content candidate. A video answering this question will have search demand for years.
**Detection:** Group questions by embedding similarity; count distinct years of appearance.
**High signal:** Same question in 4+ years = extremely persistent. "What is the difference between dualism and nondualism?" appears annually → perfect search foundation video.

---

## Layer 2: Comment Signals (What the Community Validates)

### High Score Top-Level Comment — The Canonical Answer

```
top-level comment, score > 20
```

The community's accepted answer to the submission's question. This is your gold standard for "what explanation does this community find convincing?"

**Use:** Script research. This tells you:
- What framing works (how do they explain this concept?)
- What sources they cite (which texts/teachers are authoritative?)
- What language they use (which terms need definition vs. which are assumed?)

**Subreddit role matters:**
- r/KashmirShaivism top comment → uses scholarly terminology, cites Tantraloka → authoritative explanation
- r/awakened top comment → uses experiential language, recommends a teacher → relatable explanation

The gap between these two is your content opportunity: translate the specialist explanation into the mass language.

### High Score Reply — Nuanced Correction

```
depth > 0 (reply to a comment), score > 10
```

A reply to someone else's comment that got more upvotes than the original. This means the simple answer was wrong or incomplete, and the community prefers the correction.

**Use:** Objection handling. What do beginners get wrong? What do even experienced commenters get wrong?
**Example pattern:** In r/Tantra, a beginner says "Tantra is about sex" (downvoted). A high-score reply corrects them with the historical definition. That correction is your script's "what modern channels get wrong" beat.

### Controversial Comment (1) — Active Disagreement

```
controversiality: 1
```

Reddit flags this when the upvote ratio is near 50% — roughly equal upvotes and downvotes. This is the community disagreeing with itself.

**Use:** Identifying fault lines for balanced documentaries. Where do practitioners disagree with scholars? Where do traditions disagree with each other?
**High signal:** A comment with score > 10 AND controversiality: 1. This means many people upvoted it AND many downvoted it. Genuinely polarizing.

### High Score + Source Mention — Authoritative Recommendation

```
score > 10, body contains book/text/teacher mentions
```

The community validated a specific source recommendation. This is your canon list.

**Use:** Source discovery for research packs. If r/KashmirShaivism consistently recommends "Tantraloka" and "Ksemaraja's commentaries," those go into the source requirements for any Kashmir Shaivism video.

### Long Reply Chain — Topic Has Depth

```
depth >= 3, multiple participants
```

A thread where people keep responding. The topic has enough complexity to sustain extended discussion. This maps directly to video duration potential.

**Use:** Beat sheet design. A thread with 50 comments across 5 levels of depth covers more ground than a question with 2 one-line answers. Extract the sub-questions that emerge in the chain — those are your video's beats.

---

## Layer 3: Cross-Subreddit Signals (What Transfers Between Audiences)

### Same Question in Specialist + Mass — The Ideal Candidate

Same question appears in r/KashmirShaivism AND r/awakened.

```
specialist_signal: { subreddit: "KashmirShaivism", score: 45, occurrences: 8 }
mass_signal: { subreddit: "awakened", score: 120, occurrences: 43 }
opportunity_score = specialist_depth × mass_resonance
```

**Use:** Primary content pipeline candidate. The specialist sub has the authoritative answer. The mass sub has the audience demand. The content frame is: translate the specialist answer into mass language.

**The Opportunity Exchange formula for Reddit:**
```
reddit_opportunity = specialist_depth × mass_signal
```

Where:
- specialist_depth = (score in specialist sub × comment_depth × source_density) — weighted by sub's total volume
- mass_signal = (cross_subreddit_count × total_score × years_active) — weighted by year to normalize for sub age

### Same Question Across Multiple Mass Subs — Widespread Curiosity

Same question in r/awakened, r/spirituality, r/nonduality, r/Meditation.

**Use:** Evergreen content candidate. This question is not niche — it's a universal human question that happens to intersect with tantra/philosophy.
**Example:** "Why do I feel separate from everything?" appears across 4 mass subs → frame: "What If Separateness Is Just a Misunderstanding? The Philosophy That Says You Never Were Alone."

### Same Question in Critical Subs — Objections to Preempt

Same question in r/DebateReligion, r/askphilosophy, r/consciousness.

**Use:** Script content for the "skeptic" beat. If r/DebateReligion has a high-score post arguing against nonduality, that argument needs to be addressed fairly in any documentary about nonduality.

### Same Narrative Frame in Multiple Subs — Tested Story Format

A specific storytelling structure (e.g., "ancient text predicted modern discovery") appears across r/HighStrangeness, r/NDE, r/Paranormal.

**Use:** Hook library. Extract the frame structure and add to the content genome as a reusable pattern.

---

## Layer 4: Temporal Signals (What Changes Over Time)

### Topic Velocity — Rising or Falling Interest

Compare topic frequency in years 1-3 vs years 3-5 vs years 5-7.

**Rising:** Topic appears more in later years → growing interest. Worth early production before peak.
**Falling:** Topic appears less → may be saturated or fading.
**Stable:** Topic persists at consistent rate → evergreen. Worth producing at any time.
**Recurring:** Topic disappears and reappears → tied to events or seasonal. Worth timing production.

### Language Drift — How Questions Change Over Time

In 2015, people asked "What is nonduality?"
In 2020, people asked "How do I practice nonduality?"
In 2025, people asked "Why isn't nonduality working for me?"

The evolution of questions tracks audience sophistication. Early questions are definitional. Later questions are application and troubleshooting.

**Use:** Content stage prediction. If a topic's questions are mostly definitional, the mass audience hasn't arrived yet — early mover advantage. If questions are mostly troubleshooting, the topic is mature — need a differentiated angle.

### Event Correlation — Spikes Tied to External Events

A topic spikes in Reddit activity on specific dates. Cross-reference with:
- YouTube video publication dates (a popular video drove Reddit discussion)
- Google Trends spikes
- News events (festival, controversy, celebrity mention)
- Book/publication releases

**Use:** Content timing. Produce when Reddit is already talking about the topic — existing demand.

---

## Putting It Together: The Content-Agnostic Reddit Pipeline

This pipeline works for ANY niche, not just tantra. The subreddit list changes; the methodology stays the same.

### Step 1: Define the Niche's Reddit Universe

For any new farm, identify subreddits across 5 roles:

| Role | Purpose | Example (Tantra) | Example (Neuroscience) |
|------|---------|-------------------|----------------------|
| Specialist | Expert discussion | r/KashmirShaivism | r/neuroscience |
| Practitioner | Applied discussion | r/kundalini | r/Nootropics |
| Mass interest | Broad curiosity | r/awakened | r/consciousness |
| Narrative | Story-worthy angle | r/HighStrangeness | r/Glitch_in_the_Matrix |
| Critical | Objections | r/DebateReligion | r/skeptic |

Not all roles have valid subs for every niche. Minimum: 3 roles with ≥2 subs each.

### Step 2: Extract, Filter, Join

```python
# Stream-filter submissions + comments for the subreddit list
# Join comments to submissions via link_id → t3_ → submission.id
# Tag each subreddit with its role
# Tag each submission with its post_type (question/experience/resource_request/etc.)
```

### Step 3: Compute Per-Topic Signals

For each topic cluster (from embedding + HDBSCAN):

```python
def score_topic(topic):
    return {
        "specialist_depth": topic.weighted_score_in_specialist_subs,
        "mass_resonance": topic.cross_subreddit_count * topic.mean_mass_score,
        "persistence": topic.years_active,
        "controversy_potential": topic.controversial_comment_rate,
        "narrative_readiness": topic.first_person_story_count,
        "educational_demand": topic.resource_request_count,
        "opportunity": topic.specialist_depth * topic.mass_resonance
    }
```

### Step 4: Generate Content Candidates

```python
# For topics with opportunity > threshold:
# 1. Extract top-voted question phrasing → title candidate
# 2. Extract top-voted answer → script framing
# 3. Extract source mentions → research pack leads
# 4. Extract controversial comments → objection beats
# 5. Extract narrative structure → story arc
```

### Step 5: Output Structured Packets

```json
{
  "niche": "tantra",
  "source": "reddit",
  "confidence": "exploratory",
  "topic": "awakening_aftereffects",
  "opportunity_score": 0.74,
  "title_candidates": [
    "Why Do I Feel Worse After Awakening?",
    "Enlightenment Did Not Fix My Life",
    "The Dark Side of Spiritual Awakening"
  ],
  "expert_explanation": "In Kashmir Shaivism, this is samkoca...",
  "objections": ["Skeptics argue this is just temporal lobe epilepsy..."],
  "recommended_sources": ["Tantraloka Ch. 4", "Ksemaraja on samkoca"],
  "narrative_frame": "They said awakening would fix everything. It didn't. Here's what actually happened."
}
```

---

## What NOT To Do

- **Don't use Reddit to validate YouTube demand.** Reddit and YouTube are different populations. Use it to find questions, not to predict views.
- **Don't treat upvotes as "correct."** Upvotes mean "this is what the community agrees with," not "this is factually true." Especially in specialist subs, the most upvoted answer may be the most traditional, not the most historically accurate.
- **Don't pool across subreddit roles.** The same question in r/KashmirShaivism and r/spirituality needs different treatment.
- **Don't ignore controversial comments.** The controversial comments are often more informative than the highly-upvoted ones — they show where the fault lines are.
- **Don't use narrative-demand subs as evidence.** r/HighStrangeness stories are not proof of supernatural claims.
