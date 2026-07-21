# Reddit Engine — Farm-Agnostic Intelligence Layer

## What This Dataset Actually Is

85 GB of machine-readable human discourse across 2005–2023. For every topic, it contains layered signals:

- **Questions** people are asking (titles, selftext)
- **Community-endorsed explanations** (top-voted comments)
- **Disagreements** (controversiality flags, reply chains where the top reply corrects the parent)
- **Story frames** (first-person narratives with narrative structure)
- **Source recommendations** (book/text/teacher mentions in context)
- **Language patterns** (specialist vs mass audience vocabulary for the same topic)
- **Temporal evolution** (how questions change over years — "what is X" → "how do I practice X")
- **Cross-subreddit signals** (same question with different answers across role layers)
- **Moderation artifacts** (removed content, locked threads — invisible evidence of controversy)

Reddit is not a truth engine. It is a **machine-readable map of questions, language, disagreements, recommendations, and narrative behaviour**. It does not replace representative surveys, credentialed expert interviews, primary-source verification, or legal/factual risk review. It automates the exploratory research department and tells Hermes where deeper verification is necessary.

---

## What Reddit Can Partly Automate

| Traditional Function | Reddit Equivalent |
|---------------------|-------------------|
| Audience surveys | Recurring questions, confusion patterns, phrasing frequency |
| Exploratory interviews | Long-form personal accounts and follow-up discussion chains |
| Competitor research | Shared links, reactions to creators, repeated content gaps |
| Objection research | Skeptical comments, corrections, recurring rebuttals |
| Source discovery | Books, teachers, papers and canonical recommendations |
| Tone research | Native vocabulary, humour, taboos, acceptable framing |
| Risk scanning | Community fault lines, accusations, sensitive claims |
| Story research | First-person narratives, strange cases, transformation arcs |

Reddit does NOT reliably replace: representative surveys, credentialed expert interviews, primary-source verification, ethnographic access to offline communities, direct audience testing, or legal/factual risk review.

---

## The Specialist-to-Mass Translation Moat

This is the most defensible advantage of the Reddit engine. For one topic, compare how it appears across audience layers:

```
r/KashmirShaivism          → specialist explanation and terminology
r/Hinduism / r/AskReligion  → informed outsider questions
r/awakened / r/Meditation   → experiential interpretation
r/DebateReligion            → objections and skeptical pressure
r/HighStrangeness           → dramatic or supernatural framing
```

The output is not "people are interested in X." It is:

```json
{
  "specialist_model": "How experts explain it — with terminology, sources, precision",
  "mass_model": "How ordinary viewers currently understand it — with errors",
  "translation_gap": "What must be explicitly explained or corrected",
  "objections": "What viewers will resist or disbelieve",
  "gateway_language": "What familiar concepts lead into this topic",
  "danger_terms": "What wording triggers mistrust or misunderstanding"
}
```

This directly shapes: title, hook, assumed knowledge, analogy selection, script ordering, disclaimers, anticipated objections, and follow-up video planning.

---

## The Five Signal Products

These are separate products, not one opportunity score.

### 1. Question Map

**Answers:** What do people repeatedly want explained?

```json
{
  "cluster_id": "shaktipata_mechanism",
  "canonical_question": "What is shaktipata and how does it work?",
  "paraphrases": [
    "Can grace be transmitted?",
    "Does initiation require a living guru?"
  ],
  "subreddits": ["KashmirShaivism", "kundalini", "nonduality", "Tantra"],
  "frequency": { "total": 142, "per_year": [18, 22, 31, 27, 25, 19] },
  "years_active": 6,
  "specialist_vs_mass": {
    "specialist_occurrences": 38,
    "mass_occurrences": 104
  },
  "answeredness": {
    "has_high_score_answer": true,
    "answer_sources_cited": ["Tantraloka", "Ksemaraja"],
    "unresolved_subquestions": [
      "Can it happen spontaneously?",
      "Does it require a mantra?"
    ]
  },
  "confusion_score": 0.64,
  "evidence_refs": ["thread:t3_abc123", "thread:t3_def456"],
  "limitations": ["Dominant answer may reflect community orthodoxy, not historical accuracy"]
}
```

The strongest opportunities are often not the most frequent questions, but questions with **high recurrence + poor existing answers + specialist knowledge available**.

### 2. Controversy Map

**Answers:** Where will the documentary encounter disagreement?

```json
{
  "fault_line_id": "shaktipata_guru_requirement",
  "description": "Is shaktipata dependent on a living guru?",
  "dispute_type": "doctrinal_dispute",
  "positions": [
    {
      "position": "Formal initiation from a qualified guru is necessary",
      "communities": ["KashmirShaivism", "Tantra"],
      "supporting_threads": ["t3_ghi789"],
      "typical_strength": "majority_within_community"
    },
    {
      "position": "Grace can occur spontaneously or through any channel",
      "communities": ["kundalini", "nonduality", "awakened"],
      "supporting_threads": ["t3_jkl012"],
      "typical_strength": "majority_within_community"
    }
  ],
  "consensus_level": "disputed_across_communities",
  "editorial_advice": "Present as a genuine doctrinal disagreement between traditions",
  "moderation_notes": "r/KashmirShaivism removes posts challenging guru requirement",
  "evidence_refs": ["thread:t3_ghi789", "thread:t3_jkl012"]
}
```

Distinguish dispute types:
- terminology dispute
- historical dispute
- doctrinal dispute
- practice/safety dispute
- lineage legitimacy dispute
- skeptic-believer dispute
- political/identity dispute

And shapes of disagreement:
- consensus with fringe dissent
- two legitimate schools
- specialists vs popular belief
- moderator-enforced orthodoxy
- community-specific norm

Do not reduce controversy to sentiment variance.

### 3. Source Canon and Recommendation Graph

**Answers:** Which books, papers, teachers and creators are repeatedly trusted?

```json
{
  "source_id": "tantraloka",
  "type": "text",
  "recommended_by": {
    "subreddits": ["KashmirShaivism", "Tantra", "shaivism"],
    "total_citations": 47,
    "for_questions": ["kashmir_shaivism_basics", "pratyabhijna", "spanda"]
  },
  "critical_mentions": {
    "subreddits": ["AcademicReligion"],
    "count": 3,
    "reasons": ["translation_disputes", "sectarian_bias"]
  },
  "credential_claims": ["Primary 10th-century Shaiva text", "Authored by Abhinavagupta"],
  "cross_community_agreement": 0.7,
  "evidence_refs": ["comment:t3_mno345:abc"]
}
```

A source repeatedly recommended in r/occult and rejected in r/AcademicReligion is not universally canonical. That contrast is itself intelligence.

### 4. Narrative Frame Library

**Answers:** How do people naturally make this topic compelling?

```json
{
  "frame_id": "misconception_reversal",
  "structure": {
    "setup": "Widely held belief or popular interpretation",
    "turn": "Specialist correction or historical evidence",
    "payoff": "More surprising underlying explanation"
  },
  "best_for": ["history", "philosophy", "religion"],
  "example_count": 89,
  "source_subreddits": ["HighStrangeness", "occult", "history"],
  "applicable_topic_types": ["cremation_ground", "tantric_cosmology", "subtle_body"],
  "evidence_refs": ["thread:t3_pqr678"]
}
```

Frames should be represented structurally — not copied as text. The library becomes a reusable genetic resource without plagiarising posts.

Common frame patterns:
- "I tried X and this happened" (personal experiment)
- "The teacher warned me not to…" (forbidden knowledge)
- "Everyone misunderstands X" (correction)
- "The historical explanation is stranger than the myth" (reality is weirder)
- "I thought this meant X, but it actually means Y" (personal discovery)
- "Two traditions describe the same experience differently" (comparative)

### 5. Language Translation Layer

**Answers:** How should this be described to this audience?

```json
{
  "specialist_term": "śaktipāta",
  "mass_language_equivalents": [
    "sudden spiritual awakening",
    "grace that changes perception",
    "an experience initiated rather than achieved"
  ],
  "misleading_equivalents": [
    { "phrase": "kundalini activation", "risk": "conflates distinct concepts", "severity": "high" },
    { "phrase": "instant enlightenment", "risk": "implies completion, not beginning", "severity": "high" }
  ],
  "unsafe_simplifications": [
    { "simplification": "it's like being zapped by God", "reason": "theistic framing distorts non-theistic tradition" }
  ],
  "search_language": ["spiritual initiation", "guru grace", "energy transmission"],
  "skeptical_language": ["placebo", "suggestion", "power of belief"]
}
```

Preserve both accurate specialist terminology and accessible audience language — with warnings where simplification becomes distortion.

---

## What the Engine Does NOT Do

**Reddit is not the audience.** Reddit users are not representative of YouTube viewers, India, practitioners, scholars, or the general public. Participation is affected by age, geography, English fluency, platform culture, moderation, self-selection, and ideological sorting. Every output must carry:

```text
subreddit_panel
collection_period
activity_level
moderation_style
likely_population
known_biases
```

Not "Audiences believe X" but "Across these seven English-language subreddits, this framing recurred..."

**Upvotes are not truth.** Upvotes can indicate agreement, entertainment, identity confirmation, early-placement advantage, popularity of the author, or conformity to norms. A highly upvoted answer may be factually wrong. Use separate scores:
- community_endorsement
- cross_community_replication
- source_support
- factual_verification

**Moderation creates invisible evidence.** Deleted and removed posts matter. A community may look consensual because dissent is removed. Another may look chaotic because moderation is absent. Store removed/deleted/locked status where possible.

**Same users may dominate several communities.** Cross-subreddit repetition is not necessarily independent replication. Require anonymized author-overlap measures:
- unique_author_count
- top_author_concentration
- cross_subreddit_author_overlap
- gini_of_contribution

**Historical volume can overpower current relevance.** The 85 GB archive is strategically useful, but old patterns dominate clustering. Every cluster needs: first_seen, last_seen, yearly_frequency, recent_velocity, decay_weight.

**Story-rich communities can distort reality.** r/HighStrangeness is excellent for narrative structures but terrible as evidence for prevalence or factuality. Separate frame_usefulness from claim_credibility.

---

## Architecture

### R2 Layout (Immutable Layers)

```
s3://research-datasets/reddit/
├── raw/                              # Immutable: never modified after upload
│   ├── submissions_v1.parquet
│   └── comments_v1.parquet
├── normalized/                        # Cleaned: apostrophe fix, type coercion
│   ├── submissions.parquet
│   └── comments.parquet
├── farm-extracts/                     # Per-farm filtered subsets
│   ├── tantra/
│   │   ├── submissions.parquet
│   │   └── comments.parquet
│   └── neuroscience/                 # Future
├── embeddings/                        # Versioned by model
│   ├── titles_bge-m3_v1.parquet
│   └── high_value_comments_v1.parquet
└── derived/                           # Versioned by pipeline run
    ├── question-clusters_v1.json
    ├── controversy-maps_v1.json
    ├── recommendation-graph_v1.json
    └── narrative-frames_v1.json
```

Derived outputs never overwrite previous versions. Include `dataset_hash`, `extract_version`, `feature_version`, `model_version`, `created_at`.

### Staged Embedding (Not All Comments)

Stage 1: Embed all submission titles only (cheap, fast, covers question discovery).
Stage 2: Embed high-value selftexts and comments meeting criteria:
- score > threshold for subreddit
- reply depth >= 2 (correction chains)
- contains question mark
- contains citation or recommendation
- contains disagreement markers
- cross-subreddit match detected

Do not embed every comment blindly.

### Embedding Model Benchmark

Before committing to bge-m3 (1,024 dims), test on 5,000 manually grouped examples:

| Model | Dims | Cost/M tokens | Question-neighbour precision | Specialist/mass alignment | Clustering coherence |
|-------|------|--------------|---------------------------|--------------------------|---------------------|
| bge-m3 | 1,024 | $0.012 | TBD | TBD | TBD |
| bge-small-en-v1.5 | 384 | $0.020 | TBD | TBD | TBD |
| bge-base-en-v1.5 | 768 | $0.067 | TBD | TBD | TBD |
| MiniLM | 384 | — | TBD | TBD | TBD |

Choose by measured performance on your actual data, not by model prestige.

### D1 Schema (Compact Nodes + R2 Source Pointers)

```sql
CREATE TABLE reddit_threads (
  thread_id TEXT PRIMARY KEY,
  subreddit TEXT NOT NULL,
  role TEXT NOT NULL,
  title TEXT,
  score INTEGER,
  num_comments INTEGER,
  created_utc INTEGER,
  top_comment_score INTEGER,
  controversial INTEGER DEFAULT 0,
  removed INTEGER DEFAULT 0,         -- moderation artifact
  locked INTEGER DEFAULT 0,
  post_type TEXT,                     -- question | experience | argument | resource_request
  unique_authors INTEGER,             -- deduplication count
  embedding_id TEXT,
  data_hash TEXT,
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_threads_role ON reddit_threads(role);
CREATE INDEX idx_threads_score ON reddit_threads(score DESC);
CREATE INDEX idx_threads_year ON reddit_threads(created_utc);

CREATE TABLE reddit_recommendations (
  subreddit TEXT NOT NULL,
  item_name TEXT NOT NULL,
  item_type TEXT NOT NULL,            -- text | teacher | practice | book
  weight REAL NOT NULL,
  positive_citations INTEGER DEFAULT 0,
  critical_citations INTEGER DEFAULT 0,
  cross_community_count INTEGER DEFAULT 0,
  PRIMARY KEY (subreddit, item_name)
);

CREATE TABLE reddit_controversy_map (
  fault_line_id TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  dispute_type TEXT NOT NULL,
  positions JSON NOT NULL,            -- both sides with thread refs
  consensus_level TEXT NOT NULL,
  editorial_advice TEXT,
  thread_count INTEGER DEFAULT 0,
  moderation_notes TEXT
);

CREATE TABLE reddit_narrative_frames (
  frame_id TEXT PRIMARY KEY,
  structure JSON NOT NULL,            -- setup/turn/payoff, not copied text
  best_for JSON,
  example_count INTEGER DEFAULT 0,
  source_subreddits JSON,
  applicable_topic_types JSON
);
```

---

## The Generic Farm Template

The reusable object is not just subreddit names — it includes roles:

```yaml
farm_id: tantra-files
niche: Indian Tantra
subreddit_panel:
  specialist:          # Expert discussion
    - KashmirShaivism
    - Tantrasadhaks
  adjacent:            # Informed outsider perspective
    - hinduism
    - AdvaitaVedanta
  experiential:        # Personal practice
    - awakened
    - meditation
  skeptical:           # Objections and critical pressure
    - DebateReligion
    - AskPhilosophy
  narrative:           # Story frames
    - HighStrangeness
    - occult
  mass:                # Broad curiosity
    - spirituality
```

The role matters more than the subreddit name. The same pipeline compares equivalent layers across farms:

```
specialist → adjacent → experiential → skeptical → narrative → mass
```

---

## Endpoint Contracts

Every endpoint returns evidence provenance, not just summaries.

### `/opportunities`

```json
{
  "topic": "shaktipata",
  "question_mass": 0.71,
  "specialist_depth": 0.83,
  "answer_gap": 0.64,
  "cross_subreddit_replication": 0.58,
  "recency": 0.49,
  "evidence_refs": ["thread:t3_abc123", "thread:t3_def456"],
  "limitations": ["All specialist signal from r/KashmirShaivism (n=3k users)"]
}
```

### `/question-deep-dive`

Return: canonical question, paraphrases, specialist answers, common wrong assumptions, unresolved subquestions, time distribution, exact thread pointers.

### `/controversy-map`

Return positions as sides with supporting threads, not a single score.

### `/recommendation-graph`

Return positive and negative edges, source type, subreddit context, cross-community agreement.

### `/narrative-frames`

Return abstracted structures with frame type, proven applicability, frequency — not copied hooks.

### `/language-translation`

Return specialist → mass → skeptical → search mappings, with warnings where simplification becomes distortion.

---

## Build Order

### Phase 1: Extract + 3 Foundational Outputs

1. Finish Tantra subreddit extraction
2. Define subreddit-role schema
3. Produce exactly three outputs:
   - **Question clusters** (embed + HDBSCAN)
   - **Controversy maps** (threads with controversiality=1, grouped by topic)
   - **Recommendation graph** (source co-occurrence from top-voted comments)
4. Manually review 100 random outputs from each
5. Measure: cluster coherence, factual usefulness, duplicate rate, source quality, controversy-side balance

### Phase 2: Validate + Iterate

Falsification test: Give the Reddit engine ten documentary topics. Does its output reveal useful questions, risks, or sources that an ordinary keyword search + one LLM research pass failed to find?

If yes, proceed. If no, redesign the clustering or scoring.

### Phase 3: Narrative Frames + Language Translation

6. Extract narrative frames from personal-story posts (experiential and narrative subs)
7. Build specialist ↔ mass language translation pairs
8. Review 100 outputs manually for safety (unsafe simplifications, misleading equivalences)

### Phase 4: Vectorize + Endpoints

9. Run embedding benchmark
10. Embed titles + high-value comments
11. Store in Vectorize
12. Deploy all six query endpoints with evidence contracts
13. Set up cron for periodic re-clustering

### Phase 5: Generic Farm Template

14. Parameterize the pipeline: {niche, subreddit_panel} → outputs
15. Document the subreddit selection heuristic for new farms
16. Test with a second farm (neuroscience, mythology)
