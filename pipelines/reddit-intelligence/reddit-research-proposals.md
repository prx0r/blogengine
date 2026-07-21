# Reddit Research Proposals — Testable Hypotheses for Content Intelligence

## For the Agent: How to Execute These Proposals

Every proposal is designed to be run by an agent without requiring deep domain knowledge. Follow this pattern for each:

### 1. Read the proposal
Understand the hypothesis, formula, and methodology.

### 2. Run the extraction
Each proposal lists specific queries against the Reddit Parquet files in R2 (217 files, ~84 GB). Use DuckDB on the VPS:

```bash
# Credentials (set fresh each session)
export AWS_ACCESS_KEY_ID="b31c6e90450f740629ac030f6e16eef4"
export AWS_SECRET_ACCESS_KEY="cce64be980580e166482b2c64c6396d5ea25bdb889ff43f3782c0932a75a9b32"
export AWS_DEFAULT_REGION="auto"
export S3_ENDPOINT="https://954612afb5a97bb15dddcdc70176813d.r2.cloudflarestorage.com"
```

**Memory warning:** The full Pushshift archive is 217 Parquet files. Never load all files at once with `read_parquet('s3://.../*.parquet')` — it OOMs the VPS (7.75 GB RAM). Do NOT use pandas `.fetchdf()` — it doubles memory (DuckDB buffer + DataFrame copy) and Python doesn't release it back.

Use DuckDB-only processing: create a persistent table, INSERT per file, then COPY to a single output Parquet:

```python
import duckdb, subprocess as sp, os, time

S3 = "s3://research-datasets/reddit/full"
con = duckdb.connect()
con.execute("INSTALL httpfs; LOAD httpfs;")
for k, v in [("s3_region","auto"), ("s3_endpoint","954612afb5a97bb15dddcdc70176813d.r2.cloudflarestorage.com"),
             ("s3_access_key_id","b31c6e90450f740629ac030f6e16eef4"),
             ("s3_secret_access_key","cce64be980580e166482b2c64c6396d5ea25bdb889ff43f3782c0932a75a9b32"),
             ("s3_url_style","path")]:
    con.execute(f"SET {k}='{v}'")

SUBS = ("'Tantra','KashmirShaivism','hinduism','spirituality','occult','kundalini','Meditation'")

# List files
result = sp.run(["aws", "s3", "ls", f"s3://research-datasets/reddit/full/", "--endpoint-url", os.environ['S3_ENDPOINT']],
                capture_output=True, text=True)
files = [l.split()[-1] for l in result.stdout.strip().split('\n') if l]

# Process one file at a time — pure DuckDB, no pandas
con.execute(f"CREATE TABLE filtered AS SELECT subreddit, title, score, created_utc \
              FROM read_parquet('{S3}/{files[0]}') WHERE subreddit IN ({SUBS}) AND title IS NOT NULL")
start = time.time()
for i, fname in enumerate(files[1:], 1):
    con.execute(f"INSERT INTO filtered SELECT subreddit, title, score, created_utc \
                  FROM read_parquet('{S3}/{fname}') WHERE subreddit IN ({SUBS}) AND title IS NOT NULL")
    if i % 25 == 0:
        print(f"  {i}/{len(files)} files ({time.time()-start:.0f}s)")

# Export
con.execute("COPY filtered TO '/tmp/filtered_submissions.parquet' (FORMAT PARQUET)")
sp.run(["aws", "s3", "cp", "/tmp/filtered_submissions.parquet",
        "s3://research-datasets/reddit/processed/submissions_all.parquet",
        "--endpoint-url", os.environ['S3_ENDPOINT']])

# Then run queries against the single filtered file
con.execute("SELECT count(*) FROM read_parquet('s3://research-datasets/reddit/processed/submissions_all.parquet')")
print(f"Total: {con.fetchone()[0]} rows")
```

This keeps everything in DuckDB's C memory manager, uses ~500 MB peak, and finishes in ~5 minutes.

### 3. Record output to `data/research/reddit/{proposal-name}-{timestamp}.json`
Use the JSON schema specified in each proposal.

### 4. Report findings
Every output must include:

```json
{
  "experiment": "proposal-2-recurring-questions",
  "timestamp": "20260721_143000",
  "hypothesis": "Frequency and persistence of questions predicts video demand",
  "falsification": "High-frequency questions do NOT produce above-median watch time",
  "data_source": "R2 reddit/submissions/batch-*.parquet",
  "sample": { "total_submissions_scanned": 100000, "clusters_found": 47 },
  "results": { "primary_metric": 0.0 },
  "gates": { "proposal_ready": true },
  "interpretation": { "what_it_means": "", "what_it_does_NOT_mean": "" },
  "next_step": "",
  "limitations": []
}
```

### 5. Validation status tracking
Each proposal has a status in `data/research/reddit/research-status.json`:

```json
{
  "proposal_1": { "status": "not_started | running | completed | invalid" },
  "proposal_2": { "status": "not_started | running | completed | invalid" }
}
```

Update this file when starting and finishing each proposal.

---

Every proposal follows the same structure:
- **Research question:** What we want to know
- **Hypothesis:** Falsifiable claim
- **Formula:** Quantitative definition
- **Methodology:** How we measure it from Reddit
- **Content decision:** What we do with the finding
- **Cross-validation:** How we test it against real video performance or other datasets
- **Risk:** What could make the hypothesis wrong
- **Execution:** Step-by-step instructions for any agent to run it
- **Output schema:** Exact JSON format to save to `data/research/reddit/`

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

### Execution (for any agent)

```
STEP 1: Cluster submissions into topics
  Query: SELECT subreddit, title, selftext, score FROM reddit/submissions/
           WHERE subreddit IN ('KashmirShaivism','Tantra','kundalini',
             'awakened','spirituality','nonduality')
  Action: Embed titles, HDBSCAN cluster → topic_clusters.json
  Save to: data/research/reddit/proposal1-topic-clusters-{timestamp}.json

STEP 2: Identify specialist vs mass subs for each cluster
  For each cluster:
    - Count submissions from specialist subs (KashmirShaivism, Tantra)
    - Count submissions from mass subs (awakened, spirituality, nonduality)
  Filter: keep clusters with ≥5 submissions in EITHER group

STEP 3: Compute centroids
  For each group in each cluster:
    - Collect all top-voted comment bodies
    - Embed using Workers AI (bge-base-en-v1.5)
    - Compute centroid (mean embedding vector)

STEP 4: Compute translation_gap_score
  For each cluster:
    semantic_distance = cosine_distance(centroid_specialist, centroid_mass)
    If only one group has data: score = null (not computable)
  Save to: data/research/reddit/proposal1-results-{timestamp}.json

STEP 5: Report
  Update data/research/reddit/research-status.json
```

### Output Schema

```json
{
  "experiment": "proposal-1-translation-gap",
  "timestamp": "20260721_143000",
  "hypothesis": "Specialist-mass discourse divergence predicts video performance",
  "falsification": "High-divergence topics do NOT outperform low-divergence on watch time",
  "data_source": "R2 reddit/submissions/batch-*.parquet + R2 reddit/comments/ (future)",
  "sample": {
    "total_submissions_scanned": 100000,
    "clusters_identified": 47,
    "clusters_with_both_groups": 23
  },
  "results": {
    "translation_gap_scores": [
      { "topic": "shaktipata", "semantic_distance": 0.74, "term_overlap": 0.12, "translation_gap_score": 0.62, "specialist_count": 34, "mass_count": 89 },
      { "topic": "kundalini", "semantic_distance": 0.32, "term_overlap": 0.58, "translation_gap_score": 0.14, "specialist_count": 12, "mass_count": 156 }
    ],
    "top_5_gap_topics": ["shaktipata", "samkoca", "pratyabhijna", "turiya", "spanda"]
  },
  "gates": {
    "sufficient_clusters_with_both_groups": true,
    "computable_for_majority": true
  },
  "interpretation": {
    "what_it_means": "Topics where specialist and mass discourse diverge most",
    "what_it_does_NOT_mean": "These topics will necessarily perform better — obscurity confound not controlled"
  },
  "next_step": "Wait for comments data to be extracted, then re-run with actual comment text",
  "limitations": ["Comments data not yet available — using submission titles only as proxy"]
}
```

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

### Execution (for any agent)

```
STEP 1: Extract question clusters
  Same clustering as Proposal 1, but extract explicit questions
  (submission titles containing "?")
  Save to: data/research/reddit/proposal2-questions-{timestamp}.json

STEP 2: Per-cluster metrics
  For each cluster:
    total_occurrences = count of submissions
    years_active = max(created_utc) - min(created_utc) in years
    unique_subreddits = count of distinct subreddits mentioning the question
    best_answer_score = max(comment.score) across all threads in cluster
    (from comments data when available; skip this field if no comments)

STEP 3: Compute question_demand_score
  frequency = ln(total_occurrences + 1)
  persistence = min(years_active, 5) / 5
  cross_subreddit_spread = min(unique_subreddits, 10) / 10
  answer_quality_gap = 1 - (best_answer_score / 1000)  # estimate; refine with real data
  question_demand_score = (frequency + persistence + cross_subreddit_spread) / 3

STEP 4: Validate against Google Trends
  For top 20 clusters:
    Extract canonical question phrase
    Query Google Trends for search volume (pytrends on VPS)
    Spearman rank correlation between question_demand_score and Trends volume
  Gate: if r > 0.4, score is externally valid

STEP 5: Report
  Save to: data/research/reddit/proposal2-results-{timestamp}.json
  Update data/research/reddit/research-status.json
```

### Output Schema

```json
{
  "experiment": "proposal-2-recurring-questions",
  "timestamp": "20260721_143000",
  "hypothesis": "Question frequency × persistence × spread predicts video demand",
  "falsification": "High-scoring questions do NOT produce above-median watch time",
  "data_source": "R2 reddit/submissions/batch-*.parquet",
  "sample": {
    "total_submissions_scanned": 100000,
    "question_clusters_found": 47,
    "clusters_with_google_trends_data": 20
  },
  "results": {
    "question_demand_scores": [
      {
        "topic": "awakening_aftereffects",
        "canonical_question": "Why do I feel worse after awakening?",
        "total_occurrences": 87,
        "years_active": 6,
        "unique_subreddits": 4,
        "question_demand_score": 0.74,
        "google_trends_r": 0.52
      }
    ],
    "google_trends_validation": {
      "spearman_r": 0.52,
      "n": 20,
      "gate": "PASS"
    }
  },
  "gates": {
    "google_trends_correlation_above_04": true
  },
  "interpretation": {
    "what_it_means": "Recurring questions with cross-subreddit spread correlate with search demand",
    "what_it_does_NOT_mean": "These topics will perform well as videos — search demand ≠ watch time"
  },
  "next_step": "Schedule top 5 topics as production candidates",
  "limitations": ["Pushshift data ends 2023 — recent questions not captured"]
}
```

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

### Execution (for any agent)

```
STEP 1: Identify controversial threads
  Query: SELECT id, subreddit, title, score, num_comments
         FROM reddit/submissions/
         WHERE subreddit IN (specialist, practitioner, skeptical subs)
           AND num_comments > 20
  For each thread, fetch all comments from R2 (requires comments data)
  For each comment, check controversiality flag

STEP 2: Extract claims and stances
  For each controversial thread:
    - Extract claim from submission title or top-level comment
    - Classify stance of each reply (support / oppose / qualify)
    - Use LLM or keyword-based stance detection
  Group by proposition

STEP 3: Compute controversy_engagement_score
  For each proposition:
    position_count = unique stances detected
    evidence_disagreement = count(supporting_sources) / count(opposing_sources)
    emotional_investment = avg(comment_depth) * total_comments
    resolution_proximity = assess from moderator interventions + sentiment trend
  Score = position_count + evidence_disagreement + emotional_investment - resolution_proximity

STEP 4: Report
  Gate: position_count >= 2 (real disagreement exists)
  Save to: data/research/reddit/proposal3-results-{timestamp}.json
  Update research-status.json
```

### Output Schema

```json
{
  "experiment": "proposal-3-controversy-engagement",
  "timestamp": "20260721_143000",
  "hypothesis": "Structured disagreement generates higher engagement than consensus",
  "falsification": "Controversial topics do NOT outperform on comment rate or watch time",
  "data_source": "R2 reddit/comments/ (requires comments data — skip if not available)",
  "sample": {
    "controversial_threads_found": 0,
    "propositions_extracted": 0
  },
  "results": {
    "controversy_scores": [],
    "note": "Requires comments data — not computable with submissions only"
  },
  "gates": {
    "comments_data_available": false,
    "stance_extraction_working": false
  },
  "interpretation": {
    "what_it_means": "N/A — not yet computable",
    "what_it_does_NOT_mean": ""
  },
  "next_step": "Wait for comments extraction, then re-run",
  "limitations": ["Requires comments Parquet in R2"]
}
```

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

### Execution (for any agent)

```
STEP 1: Load gateway graph from clickstream data
  Requires: precomputed clickstream data in R2 or D1
  Query: SELECT prev_id, curr_id, SUM(click_count) as total_clicks
         FROM clickstream_enwiki
         GROUP BY prev_id, curr_id
  Filter: for each target topic (e.g., Chinnamasta), find top 5 prev_ids by total_clicks

STEP 2: Score each gateway
  For each (gateway_entity, target_topic) pair:
    gateway_familiarity = Google Trends volume for gateway_entity (pytrends)
    gateway_strength = click_count_to_target / total_clicks_from_gateway
    narrative_readiness = count of narrative frames in library that bridge gateway → target
  gateway_score = (gateway_familiarity + gateway_strength + narrative_readiness) / 3

STEP 3: Report
  Save to: data/research/reddit/proposal4-results-{timestamp}.json
  Update research-status.json
```

### Output Schema

```json
{
  "experiment": "proposal-4-gateway-entities",
  "timestamp": "20260721_143000",
  "hypothesis": "Topics with clear gateway entities outperform those without",
  "falsification": "Gateway-framed titles do NOT improve CTR or retention",
  "data_source": "R2 blueprint/clickstream/",
  "sample": {
    "target_topics_analyzed": 10,
    "gateway_entities_found": 23
  },
  "results": {
    "gateway_scores": [
      {
        "target_topic": "Chinnamasta",
        "gateway_entity": "Kali",
        "gateway_familiarity": 0.82,
        "gateway_strength": 0.65,
        "narrative_readiness": 3,
        "gateway_score": 0.72
      }
    ],
    "top_gateway_recommendations": [
      { "topic": "Chinnamasta", "recommended_gateway": "Kali", "score": 0.72 },
      { "topic": "samkoca", "recommended_gateway": "awakening_aftereffects", "score": 0.58 }
    ]
  },
  "gates": {
    "clickstream_data_processed": true,
    "google_trends_accessible": true
  },
  "interpretation": {
    "what_it_means": "Gateway entities exist for most obscure topics",
    "what_it_does_NOT_mean": "Gateway framing automatically improves performance — must A/B test"
  },
  "next_step": "A/B test gateway vs direct title framing on first 3 videos",
  "limitations": ["Clickstream data ends 2026-03; gateway entities may change"]
}
```

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

### Execution (for any agent)

```
STEP 1: Extract personal-story posts
  Query submissions WHERE subreddit IN ('HighStrangeness','NDE','Paranormal','Glitch_in_the_Matrix','AstralProjection')
    AND (selftext_length > 500 OR title matches first-person patterns)
  Extract: title, selftext, score, num_comments

STEP 2: Extract narrative structure
  For each post:
    Use LLM to extract: setup → turn → payoff structure
    Classify frame type: misconception_reversal | personal_discovery |
      forbidden_knowledge | skeptic_to_believer | ancient_wisdom | comparative
  Cluster by frame type across all posts

STEP 3: Score each frame type
  For each type:
    cross_community_recurrence = count of distinct subreddits where it appears
    temporal_stability = years between first and last occurrence
    engagement_correlation = median score of posts using this frame (normalized)

STEP 4: Report
  Save to: data/research/reddit/proposal5-results-{timestamp}.json
  Update research-status.json
```

### Output Schema

```json
{
  "experiment": "proposal-5-narrative-frames",
  "timestamp": "20260721_143000",
  "hypothesis": "Reddit-proven narrative frames improve video retention",
  "falsification": "Frame-structured videos do NOT retain better than ad-hoc structure",
  "data_source": "R2 reddit/submissions/ + comments/",
  "sample": {
    "personal_story_posts_extracted": 500,
    "frame_types_identified": 8,
    "frames_with_sufficient_data": 5
  },
  "results": {
    "frame_scores": [
      {
        "frame_type": "misconception_reversal",
        "cross_community_recurrence": 6,
        "temporal_stability_years": 8,
        "engagement_correlation": 0.73,
        "example_posts": 89,
        "structure": { "setup": "widely held belief", "turn": "evidence contradicts", "payoff": "more surprising truth" }
      }
    ],
    "top_frame_recommendations": [
      { "applicable_to": ["history", "philosophy", "religion"], "recommended_frame": "misconception_reversal" }
    ]
  },
  "gates": {
    "sufficient_posts_extracted": true,
    "frames_manually_reviewed": false
  },
  "interpretation": {
    "what_it_means": "Narrative frames from narrative-demand subs cluster into reusable patterns",
    "what_it_does_NOT_mean": "These frames are proven to work in YouTube documentaries — they require testing"
  },
  "next_step": "Manually review 50 frame extractions before using in script generation",
  "limitations": ["Pushshift ends 2023 — post-2023 narrative trends not captured"]
}
```

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

### Execution (for any agent)

```
STEP 1: Extract source mentions from top-voted comments
  Requires comments data.
  For each comment with score > 10:
    Extract noun phrases that match known source patterns
    ("Tantraloka", "Ksemaraja", "Lakshmanjoo", "Tantraloka Chapter 4", etc.)
    Classify stance: positive / critical / neutral
  Group by normalized source entity name

STEP 2: Cross-community tracking
  For each source entity:
    Count unique subreddits where it appears
    In each subreddit, count positive vs critical mentions
    Check if source appears in controversial threads (controversiality=1)

STEP 3: Compute source_reliability_score
  cross_community_endorsements = count of unique subreddit roles with positive mentions
  stance_balance = critical_count / total_count
  controversy_proximity = mentions_in_controversial_threads / total_mentions
  score = cross_community_endorsements + (1 - stance_balance) - controversy_proximity

STEP 4: Report
  Save to: data/research/reddit/proposal6-results-{timestamp}.json
  Update research-status.json
```

### Output Schema

```json
{
  "experiment": "proposal-6-source-authority",
  "timestamp": "20260721_143000",
  "hypothesis": "Cross-community source endorsement predicts source reliability",
  "falsification": "Cross-validated sources have same error rate as single-community sources",
  "data_source": "R2 reddit/comments/ (requires comments data)",
  "sample": {
    "source_entities_found": 0,
    "sources_with_cross_community_data": 0
  },
  "results": {
    "source_scores": [],
    "note": "Requires comments data — not computable with submissions only"
  },
  "gates": {
    "comments_data_available": false
  },
  "interpretation": {
    "what_it_means": "N/A — not yet computable",
    "what_it_does_NOT_mean": ""
  },
  "next_step": "Wait for comments extraction, then re-run",
  "limitations": ["Requires comments Parquet in R2", "Entity resolution needs manual review"]
}
```

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

### Execution (for any agent)

```
STEP 1: Classify questions by phase
  For each submission title (from existing cluster):
    Phase 1 (definitional): matches "what is|explain|definition|meaning|introduction to"
    Phase 2 (practical): matches "how to|practice|technique|method|guide|steps"
    Phase 3 (troubleshooting): matches "why not|problem|issue|doesn't work|stuck|can't"
    Phase 4 (comparative): matches "vs|difference between|comparison|better than|vs\."
  Can use LLM or regex patterns

STEP 2: Group by year and cluster
  For each topic cluster, group submissions by year
  Calculate phase ratios per year:
    definitional_ratio = phase1 / total
    practical_ratio = phase2 / total
    troubleshooting_ratio = phase3 / total
    comparative_ratio = phase4 / total

STEP 3: Detect transitions
  For each consecutive year pair:
    Track slope of definitional_ratio
    If slope < -0.2 (definitional declining) AND practical_ratio > 0.3:
      Topic may be transitioning from Phase 1 to Phase 2 — optimal production window

STEP 4: Report
  Save to: data/research/reddit/proposal7-results-{timestamp}.json
  Update research-status.json
```

### Output Schema

```json
{
  "experiment": "proposal-7-language-drift",
  "timestamp": "20260721_143000",
  "hypothesis": "Phase 1→2 transition is optimal production moment",
  "falsification": "Videos published at transition do NOT outperform other phases on search CTR",
  "data_source": "R2 reddit/submissions/batch-*.parquet",
  "sample": {
    "total_submissions_analyzed": 100000,
    "topic_clusters_with_temporal_data": 47,
    "clusters_at_transition_point": 8
  },
  "results": {
    "phase_distributions": [
      {
        "topic": "kashmir_shaivism_consciousness",
        "phases": {
          "2018": { "definitional": 0.82, "practical": 0.12, "troubleshooting": 0.04, "comparative": 0.02, "total": 45 },
          "2020": { "definitional": 0.61, "practical": 0.28, "troubleshooting": 0.07, "comparative": 0.04, "total": 52 },
          "2022": { "definitional": 0.43, "practical": 0.41, "troubleshooting": 0.10, "comparative": 0.06, "total": 38 }
        },
        "transition_detected": true,
        "transition_year": "2020-2022",
        "production_window": "2022-2024"
      }
    ],
    "transition_clusters": ["kashmir_shaivism_consciousness", "tantra_meditation", "kundalini_awakening"]
  },
  "gates": {
    "sufficient_temporal_data": true,
    "transitions_detectable": true
  },
  "interpretation": {
    "what_it_means": "Question language evolves predictably; some topics are entering optimal production window",
    "what_it_does_NOT_mean": "Topics at Phase 1 are bad — they may be early-stage opportunities with less competition"
  },
  "next_step": "Cross-reference with Google Trends velocity to confirm timing",
  "limitations": ["Pushshift ends 2023 — post-2023 phase shifts not captured", "Reddit question phrasing may not match YouTube search phrasing"]
}
```

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
