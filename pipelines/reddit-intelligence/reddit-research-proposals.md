# Reddit Research Proposals — Testable Hypotheses for Content Intelligence

Every proposal follows the same structure:
- **Research question:** What we want to know
- **Hypothesis:** Falsifiable claim
- **Formula:** Quantitative definition
- **Methodology:** How we measure it from Reddit
- **Content decision:** What we do with the finding
- **Cross-validation:** How we test it against real video performance or other datasets
- **Risk:** What could make the hypothesis wrong

---

## Proposal 1: Specialist-Mass Translation Gap

### Research Question
Does the size of the gap between specialist discourse and mass audience discourse predict video performance?

### Hypothesis
Topics where specialist communities and mass-audience communities discuss the same concept using different language, different assumptions, and different levels of precision will produce higher-performing videos than topics where both groups already agree.

**Falsification:** Topics with high specialist-mass divergence do NOT outperform topics with low divergence on watch time per impression, after controlling for topic popularity.

### Formula

```
translation_gap_score = Σ(
    semantic_distance(specialist_discourse, mass_discourse)
  + term_overlap_penalty(jargon_shared)
  + assumption_divergence(implicit_knowledge_specialist, implicit_knowledge_mass)
) / topic_mentions
```

Where:
- `semantic_distance` = cosine distance between embedding centroids of specialist sub comments and mass sub comments on the same topic
- `term_overlap_penalty` = fraction of key terms used by specialists that also appear in mass discourse (high overlap = less translation needed)
- `assumption_divergence` = count of terms in specialist discourse that assume background knowledge, minus count of definitions provided in mass discourse

### Methodology
1. For each topic cluster, identify threads from specialist subs (KashmirShaivism) and mass subs (awakened, spirituality)
2. Embed all top-voted comments from each group
3. Compute centroid for each group
4. Compute cosine distance between centroids
5. Extract key terms from specialist comments (TF-IDF)
6. Measure what fraction of those terms appear in mass comments
7. Compute topic mentions for normalization

### Content Decision
Topics with high translation_gap_score get priority production. The specialist explanation becomes the "expert answer" beat; the mass misunderstanding becomes the hook. The translation work — explaining specialist concepts in accessible language — IS the video's value proposition.

### Cross-Validation
**Method 1 — YouTube performance:**
- Score 20 topics using this formula
- Produce videos for top 5 and bottom 5
- Compare 28-day watch time per impression
- If high-gap topics outperform low-gap topics by >20%, hypothesis supported

**Method 2 — YouNiverse breakout:**
- For each topic cluster, find related YouTube videos in YouNiverse
- Check if topics with high translation_gap have higher breakout scores in existing channels
- Weak validation (YouNiverse can't measure specialist-mass divergence directly, but can check if niche academic topics overperform)

**Method 3 — Channel breakout correlation:**
- Overlay this score on top of your Tantra channel videos once you have at least 10
- Track whether videos on high-gap topics have better CTR and retention

### Risk
Specialist-mass divergence may simply correlate with obscurity. Obscure topics may underperform because fewer people search for them. Must control for search volume.

---

## Proposal 2: Recurring Question Predictive Value

### Research Question
Do topics with high-frequency recurring questions across multiple subreddits produce better videos than topics with few or no recurring questions?

### Hypothesis
The frequency and persistence of a question across independent subreddit communities predicts video demand. A question that appears annually across 4+ years in 3+ subreddits has higher documentary value than a question asked once in one subreddit.

**Falsification:** High-frequency, high-persistence questions do NOT produce above-median watch time when produced as videos.

### Formula

```
question_demand_score = Σ(
    frequency(log_total_occurrences)
  + persistence(years_active)
  + cross_subreddit_spread(unique_subreddits)
  + answer_quality_gap(existing_answer_quality)
) / subreddit_age

where:
frequency = ln(total_occurrences + 1)
persistence = min(years_active, 5) / 5  # normalize to 0-1
cross_subreddit_spread = min(unique_subreddits, 10) / 10
answer_quality_gap = 1 - (best_answer_score / max_possible_score)
```

### Methodology
1. After HDBSCAN clustering, for each cluster extract:
   - Total occurrences (number of submissions)
   - Years active (span between first and last occurrence)
   - Unique subreddits where the question appears
   - Best answer score (highest-scored comment across all threads)
2. Compute question_demand_score per cluster
3. Rank clusters by score

### Content Decision
Topics in the top quartile of question_demand_score are evergreen content candidates. They represent questions that people repeatedly ask and haven't found satisfactory answers to. A video answering this question has years of built-in search demand.

### Cross-Validation
**Method 1 — Google Trends correlation:**
- For top-10 question clusters, check Google Trends search volume for the canonical question phrasing
- If question_demand_score correlates with Google Trends volume (Spearman r > 0.5), the Reddit signal is externally valid
- If r < 0.2, the Reddit question signal is specific to Reddit and doesn't reflect broader search demand

**Method 2 — YouTube search volume:**
- Use YouTube Search API to get search volume for the canonical question
- Correlate with question_demand_score
- Stronger validation than Google Trends (YouTube-specific)

**Method 3 — Video performance:**
- After publishing 10+ videos, check if videos on high-question-demand topics outperform low on search-driven CTR

### Risk
Questions may be frequent because they're hard, not because they're demanded. "What is the nature of consciousness?" appears every year because it's unresolved, not because people want a documentary about it. Must distinguish "perennial philosophical question" from "answerable documentary topic."

---

## Proposal 3: Controversy-Driven Engagement

### Research Question
Do topics with clear, structured disagreement between communities generate more audience engagement than topics with consensus?

### Hypothesis
Topics where two or more communities disagree on a specific, articulable claim will produce videos with higher comment rate, longer watch time, and higher return viewer rate — because viewers have a stake in the outcome.

**Falsification:** Controversial topics do NOT outperform consensus topics on engagement metrics, after controlling for topic popularity. Watch time and comment rate are identical within statistical noise.

### Formula

```
controversy_engagement_score = Σ(
    position_count(unique_stances)
  + evidence_disagreement(sources_cited_for ÷ against)
  + emotional_investment(comment_depth × comment_count)
  - resolution_proximity(consensus_closeness)
) × controversyity_adjustment
```

Where:
- `position_count` = number of distinct stances detected (support / oppose / qualify)
- `evidence_disagreement` = ratio of pro sources to con sources (closer to 1 = more balanced = more engaging)
- `emotional_investment` = average comment depth × total comment count on controversial threads
- `resolution_proximity` = how close the community is to resolving the disagreement (1 = consensus emerging, 0 = entrenched)

### Methodology
1. For each topic cluster where the controversy map detects 2+ positions
2. Count unique stances
3. Count unique sources cited per stance
4. Measure average comment depth on controversial threads
5. Assess resolution proximity via moderator intervention signals and sentiment trend over years
6. Compute controversy_engagement_score

### Content Decision
Topics with score > 0.6 are selected for "balanced treatment" videos. The script presents both positions fairly, using the controversy as the narrative engine. The video becomes a "here's what both sides believe and why" format.

### Cross-Validation
**Method 1 — YouTube comments:**
- For published videos on controversial topics, measure comment rate per 1,000 views
- Compare to baseline (non-controversial topics)
- If controversy_engagement_score correlates with comment rate, hypothesis supported

**Method 2 — Retention analysis:**
- Check if retention drops at the point in the video where both positions are presented (engagement) or at the point where a position is rejected (disengagement)
- This tells us whether "balanced treatment" retains viewers or loses them

### Risk
Controversy can backfire. A documentary that presents a fringe position as equally valid can damage credibility. The distinction between "documented scholarly disagreement" and "internet argument" must be enforced at the script level, not the Reddit level.

---

## Proposal 4: Gateway Entity Predictor

### Research Question
Do topics with identifiable gateway entities (familiar concepts that lead into the topic) generate higher video performance than topics without clear gateways?

### Hypothesis
A documentary on an obscure topic performs better when there's a familiar entity (better-known concept, person, or story) that the viewer already knows and that naturally leads into the obscure topic. "Chinnamasta through Kali" outperforms "Chinnamasta" as a standalone topic.

**Falsification:** Videos that use gateway framing do NOT outperform non-gateway videos on CTR or 30-second retention.

### Formula

```
gateway_score = Σ(
    gateway_familiarity(known_entity_search_volume)
  + gateway_strength(click_count_to_target ÷ click_count_from_random)
  + narrative_readiness(gateway_story_frames_available)
)
```

Where:
- `gateway_familiarity` = Google Trends volume for the gateway entity (higher = more people can use it)
- `gateway_strength` = from clickstream data: what fraction of visits to the target topic come through this gateway vs from random
- `narrative_readiness` = number of narrative frames in the Reddit engine library that bridge from gateway to target

### Methodology
1. For each topic, query the clickstream gateway graph (R2, processed monthly)
2. Extract top-3 gateway entities by total click count
3. For each gateway, check Google Trends volume
4. For each gateway, count Reddit narrative frames that bridge from gateway to target
5. Compute gateway_score
6. Rank topics by weakest to strongest gateway

### Content Decision
Topics with weak gateway_score require more exposition budget in the script (longer hook, more context). Topics with strong gateway_score can skip directly to the specialist content. The gateway entity becomes the title's framing device: "What Kali's Severed Head Tells Us About Chinnamasta."

### Cross-Validation
**Method 1 — Gateway-native A/B test:**
- For one topic, produce two versions of the same video: one with gateway title ("What Kali Teaches Us About Chinnamasta") and one with direct title ("Chinnamasta: The Self-Decapitated Goddess")
- Compare CTR and retention
- Test this across 5 topics to see if gateway framing consistently outperforms

**Method 2 — YouTube Search API:**
- For each gateway framing, check whether "gateway + topic" has higher search volume than "topic" alone
- Example: compare search volume for "Chinnamasta" vs "Kali + Chinnamasta"

### Risk
Gateway framing can feel forced. "What X tells us about Y" is a journalistic cliché. The narrative readiness check should filter out gateways that lack a natural story bridge.

---

## Proposal 5: Narrative Frame Retention Hypothesis

### Research Question
Do videos structured around proven Reddit narrative frames achieve higher retention than videos using ad-hoc structure?

### Hypothesis
Narrative frames that appear repeatedly across independent Reddit communities correlate with storytelling structures that hold human attention. Videos using these frames will show higher audience retention than videos that do not.

**Falsification:** Videos using extracted narrative frames show identical or worse retention curves compared to videos without frame-based structure.

### Formula

```
frame_effectiveness = Σ(
    cross_community_recurrence(subreddits_with_frame)
  + temporal_stability(years_frame_appears)
  + engagement_correlation(avg_score_of_frame_posts)
) / total_frames_tested
```

For each frame type (misconception_reversal, personal_discovery, forbidden_knowledge, etc.):
- `cross_community_recurrence` = number of independent subreddits where the frame appears
- `temporal_stability` = years the frame has been in use (older = more durable)
- `engagement_correlation` = average score of posts using this frame (normalized by subreddit)

### Methodology
1. Extract narrative frames from personal-story posts across experiential and narrative subreddits
2. Cluster frames into types (misconception_reversal, personal_discovery, forbidden_knowledge, etc.)
3. For each type, measure cross-community recurrence, temporal stability, and engagement correlation
4. Score and rank frame types

### Content Decision
For each documentary topic, the system selects the highest-scoring applicable narrative frame. The script structure maps onto the frame's setup → turn → payoff pattern.

### Cross-Validation
**Method 1 — Retention comparison:**
- Produce 5 videos using top-ranked frames, 5 videos using ad-hoc structure
- Compare 30-second retention and average view duration
- If frame-structured videos retain >15% better, hypothesis supported

**Method 2 — YouTube Studio retention graphs:**
- For each video, check if retention drops correspond to frame boundaries
- If retention drops at the "turn" point (where the frame reveals new information), the frame is working
- If retention drops during the "setup" (before the turn), the frame needs faster pacing

### Risk
Frame extraction from Reddit may produce generic patterns ("first I thought X, then I learned Y") that don't transfer to documentary structure. Must manually review 50 frame extractions before trusting the clustering.

---

## Proposal 6: Source Authority Cross-Validation

### Research Question
Do sources that are recommended across multiple independent subreddit communities produce more reliable research foundations than sources recommended within a single community?

### Hypothesis
Cross-community source agreement (a text cited positively by r/KashmirShaivism, r/hinduism, and r/AcademicReligion) is a stronger signal of source reliability than single-community endorsement. Videos using cross-validated sources will require fewer fact-check corrections than videos using single-community sources.

**Falsification:** Cross-community endorsed sources produce the same rate of factual errors in scripts as single-community endorsed sources.

### Formula

```
source_reliability_score = Σ(
    cross_community_endorsements(unique_communities_endorsing)
  + stance_balance(critical_mentions ÷ total_mentions)
  - controversy_proximity(mentions_in_controversial_threads ÷ total)
)
```

Where:
- `cross_community_endorsements` = number of distinct subreddit roles where the source is cited positively
- `stance_balance` = fraction of mentions that are critical (0 = uncritical, 0.5 = balanced, 1 = entirely critical). Target is low (single source) or extremely balanced (cross-verified)
- `controversy_proximity` = fraction of mentions appearing in controversial threads (sources cited in disputes may be weaponized)

### Methodology
1. For each entity in the source registry, track which subreddit roles mention it
2. Count endorsements vs criticisms
3. Check if the source appears in controversial threads
4. Compute source_reliability_score

### Content Decision
Sources with score > 0.7 can be cited without additional verification. Sources with score < 0.3 require external scholarly verification before use in scripts. Borderline sources are flagged for human review.

### Cross-Validation
**Method 1 — Fact-check error rate:**
- For the first 10 videos, track which sources were used and whether any fact-check corrections were needed
- If cross-validated sources have lower correction rates, hypothesis supported

**Method 2 — RO source tracking:**
- The existing RO system already tracks sources per research object
- Add source_reliability_score as a field to the RO sources[] array
- Over time, check whether high-scoring sources produce more stable ROs (fewer version bumps due to source corrections)

### Risk
Cross-community endorsement may indicate popularity, not accuracy. A widely-cited popular book may be more accessible but less accurate than an obscure academic paper. The formula's stance_balance term partially addresses this, but there's no substitute for human subject-matter expertise.

---

## Proposal 7: Language Drift Timing Predictor

### Research Question
Can the evolution of question language over time predict the optimal moment to produce a documentary on that topic?

### Hypothesis
Questions about a topic evolve through predictable stages:
1. Definitional ("What is X?")
2. Practical ("How do I practice X?")  
3. Troubleshooting ("Why isn't X working for me?")
4. Comparative ("How does X compare to Y?")

Producing a video when the dominant question type transitions from Phase 1 to Phase 2 will maximize search demand — the mass audience has arrived (Phase 1 is saturated) but hasn't found actionable content yet (Phase 2 is underserved).

**Falsification:** Videos published at the Phase 1→2 transition do NOT outperform videos published at any other phase on search-driven CTR.

### Formula

```
language_phase_score = Σ(
    definitional_ratio(phase1_questions ÷ total)
  + practical_ratio(phase2_questions ÷ total)
  + troubleshooting_ratio(phase3_questions ÷ total)
  + comparative_ratio(phase4_questions ÷ total)
)

phase_dominance = argmax(phase_ratios)

production_timing_quality =
    1 if phase_dominance = 2 AND definitional_ratio > 0.3
  - 1 if phase_dominance = 1 AND definitional_ratio > 0.7
  + 0.5 if phase_dominance = 3
```

### Methodology
1. For each topic cluster, group submissions by year
2. Classify each submission title into question phase:
   - Phase 1: contains "what is", "explain", "definition", "meaning"
   - Phase 2: contains "how to", "practice", "technique", "method"
   - Phase 3: contains "why not", "problem", "issue", "doesn't work"
   - Phase 4: contains "vs", "difference between", "comparison", "better"
3. Calculate phase ratios per year
4. Track transition points using slope changes in phase_1 ratio

### Content Decision
If phase_dominance = 1 and definitional_ratio > 0.7: hold until Phase 2 emerges.
If phase_dominance = 2 or 3: produce now — demand exists, competition is low.
If phase_dominance = 4: market may be saturated. Consider differentiated angle.

### Cross-Validation
**Method 1 — YouTube search trend correlation:**
- For each topic phase, check YouTube Search API for query volume on the dominant question type
- If Phase 2 questions have rising volume when Phase 1 transitions to Phase 2, the model is predictive

**Method 2 — Retrospective testing:**
- Select 10 topics with different phase_dominance values
- Check if topics that transitioned to Phase 2 in the last 1-2 years show higher breakout rates in YouNiverse data

**Method 3 — Own video experience:**
- Track phase for each video you publish
- After 10+ videos, check whether those published at the Phase 1→2 transition outperformed those published at other phases

### Risk
Question phrasing on Reddit may not match YouTube search phrasing. "How do I practice Kashmir Shaivism alone?" on Reddit may be searched as "home Kashmir Shaivism practice" on YouTube. The classification needs a synonym-expansion step.

---

## Summary: Which Proposals to Run First

| Proposal | Data Needed | Reddit Work | Validation Path | R² Risk | Build Phase |
|----------|-------------|-------------|----------------|---------|-------------|
| 1. Translation gap | Specialists + mass sub comments | Medium (need both sides) | YouTube video performance | Medium — obscurity confound | Phase 1 (question map) |
| 2. Recurring questions | Submissions only | Low (titles + clusters) | Google Trends + YouTube search | Low — most direct signal | Phase 1 |
| 3. Controversy engagement | Stance detection | High (claim extraction) | YouTube comment rate | High — controversy ≠ quality | Phase 3 |
| 4. Gateway entities | Clickstream dataset | Low (precomputed) | A/B test title framing | Medium — forced framing | Phase 2 (recommendation graph) |
| 5. Narrative frames | Personal-story posts | Medium (frame extraction) | Retention comparison | High — frame ≠ video structure | Phase 5 |
| 6. Source authority | Source mentions in comments | Medium (entity resolution) | Fact-check error rate | Medium — popularity ≠ accuracy | Phase 2 |
| 7. Language drift | Timestamped submissions | Low (yearly grouping) | Search trend correlation | Medium — Reddit ≠ YouTube search | Phase 1 |

### Immediate Action (Phase 1)
Run **Proposal 2** (recurring questions) first — it requires only submissions data (already on R2), produces the most actionable output (which topics to produce), and has the simplest validation path (Google Trends).

Run **Proposal 7** (language drift timing) in parallel — same data, same embedding pass, additional classification step.

These two together give you: **what questions to answer** (Proposal 2) + **when to answer them** (Proposal 7).

**Proposal 1** (translation gap) is the highest-value but needs comments data and both specialist + mass subreddits. Run it in Phase 2 after the recommendation graph is built.

The remaining proposals (3, 4, 5, 6) are Phase 3-5 — valuable but not blocking the first question map.
