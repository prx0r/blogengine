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
r/KashmirShaivism          → discourse in configured specialist community
r/Hinduism / r/AskReligion  → informed outsider questions
r/awakened / r/Meditation   → experiential interpretation
r/DebateReligion            → objections and skeptical pressure
r/HighStrangeness           → dramatic or supernatural framing
```

The output is not "people are interested in X." It is:

```json
{
  "specialist_community_model": "How configured specialist communities explain it — with terminology, sources",
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

Return abstracted structures with frame type, observed contexts, inferred applicability, frequency — not copied hooks. All applicability is "inferred", never "proven."

### `/language-translation`

Return specialist → mass → skeptical → search mappings, with warnings where simplification becomes distortion.

---

## Data Governance Gate (Critical — Prerequisite)

Before any extraction, resolve data rights. This is a blocking issue, not an appendix.

### Dataset Provenance Record

```yaml
dataset_provenance:
  source: fddemarco/pushshift-reddit (HuggingFace)
  acquired_at: 2026-07-21
  access_terms_at_acquisition: Pushshift data, publicly archived
  commercial_use: unknown — needs review
  machine_learning_use: Reddit Developer Terms restrict training AI/algorithmic
    models without permission — verify Pushshift license specifically
  deletion_sync_required: yes — deleted content should not persist in derivatives
  counsel_review_status: NOT REVIEWED
```

### Deletion/Takedown Pipeline

Reddit's Developer Terms require deleted or removed content to be modified or removed from derivatives.

| Content State | Handling |
|---------------|----------|
| removed_at_collection | Metadata only, no full text |
| later_deleted | Suppress full text, retain aggregated counts if permitted |
| moderator_removed | Suppress full text, retain moderation metadata |
| [deleted] author, text present | Redact author, retain text only if permitted |
| [removed] by moderators | Moderation metadata only |

**Do not store full text of deleted/removed content in derived outputs.** Retain moderation-event metadata where permitted.

### Privacy Requirements

- Hash or pseudonymize all author IDs
- Do not expose usernames to downstream farms
- Prohibit direct quotation by default — use structural frame extraction
- Store `removed`, `locked`, `deleted` status per thread

---

## Controversy Map: Claim/Stance Pipeline (Not Just Controversiality Flag)

Phase 1 proposes starting with `threads with controversiality=1, grouped by topic`. This will not reliably recover doctrinal or factual fault lines. Reddit's controversiality flag can reflect close voting, hostility, spam, or local culture — while a profound disagreement may appear in two separately upvoted threads with no flag.

### Candidate Generation Pipeline

1. **Semantic contradiction / stance detection** — compare claims across threads for the same topic
2. **Reply chains with correction markers** — "actually", "that's wrong", "citation needed"
3. **Cross-subreddit answer divergence** — same question, opposite answers across communities
4. **High disagreement between source communities** — specialist vs practitioner subs disagreeing
5. **Moderator intervention signals** — locked threads, removed comments, moderator-pinned corrections
6. **Controversiality as one auxiliary feature** (never the primary signal)

### Implementation

```python
# For each topic cluster, extract claims with stances
claims = []
for thread in topic_threads:
    for comment in thread.top_comments:
        stances = extract_stance(comment.body, thread.title)
        claims.extend(stances)

# Cluster claims by proposition, group by stance
controversies = cluster_by_proposition(claims)
# Output: { proposition, supporting_stances[], opposing_stances[], evidence_refs[] }
```

Each extracted stance:

```json
{
  "claim": "A living guru is required for shaktipata",
  "stance": "support",
  "reason": "Traditional texts require diksha from a qualified guru",
  "tradition_context": "Kashmir Shaivism, Tantra",
  "evidence_ref": "comment:t3_abc123:xyz",
  "confidence": 0.7
}
```

### Moderation Observations Carry Evidence

Do not assert "this subreddit removes posts challenging X" without measurement. Store:

```json
"moderation_observation": {
  "removed_rate_on_position_a": 0.18,
  "removed_rate_on_position_b": 0.42,
  "sample_size": 67,
  "confidence": "low",
  "interpretation": "Possible differential moderation; reason unknown"
}
```

---

## Subreddit Roles Are Topic-Specific, Not Fixed

The generic farm template assigns fixed roles (specialist, skeptical) to subreddits. Roles should be probabilistic and topic-specific.

r/AskPhilosophy may be specialist for one philosophical concept and merely adjacent for a ritual-history question.

```json
{
  "subreddit": "AskPhilosophy",
  "configured_roles": ["skeptical", "adjacent"],
  "topic_role": {
    "kashmir_shaivism": "adjacent",
    "philosophy_of_mind": "specialist"
  },
  "role_confidence": 0.72
}
```

Do not call the aggregate output "specialist explanation." Use "discourse in configured specialist communities." It prevents accidentally implying credentialed expertise.

---

## Source Entity Resolution

The recommendation graph assumes `item_name` can serve as a primary key within a subreddit. This will fragment entities: "Tantraloka", "Tantrāloka", "Abhinavagupta's Tantraloka", "Tantraloka vol. 1", "Dyczkowski translation" will become separate nodes.

### Source Registry

```sql
CREATE TABLE source_registry (
  source_id TEXT PRIMARY KEY,
  canonical_name TEXT NOT NULL,
  source_type TEXT CHECK(source_type IN (
    'primary_text', 'edition', 'translation', 'commentary',
    'modern_book', 'teacher', 'website', 'video', 'practice'
  )),
  author TEXT,
  work_id TEXT,
  edition_id TEXT,
  translator TEXT,
  external_ids JSON,
  confidence REAL
);

CREATE TABLE source_aliases (
  alias TEXT NOT NULL,
  source_id TEXT NOT NULL,
  context TEXT,
  confidence REAL,
  PRIMARY KEY (alias, source_id)
);
```

"Tantrāloka" (the Sanskrit text) and "a particular English translation of the Tantrāloka" should not collapse into one node.

---

## High-Value Comment Selection: Multiple Inclusion Lanes

The staged criteria (score threshold, top-voted) will encode popularity bias, removing minority positions, specialist corrections posted late, and niche sources.

Use parallel inclusion lanes:

| Lane | Criteria | Purpose |
|------|----------|---------|
| POPULAR | High score or engagement | Mainstream view |
| STRUCTURAL | Deep reply chains, corrections, explicit disagreement | Nuance, objections |
| EVIDENTIAL | Links, citations, named sources, quotations | Source discovery |
| MINORITY | Controversial or low-score stance within high-engagement thread | Underrepresented views |
| SPECIALIST | Author/topic expertise indicators or specialist subreddit | Expert discourse |
| TEMPORAL | Recent emerging phrasing | Current language |

Each embedded item stores its inclusion reason:

```json
{
  "comment_id": "t3_abc:xyz",
  "inclusion_reasons": ["EVIDENTIAL: cites Tantraloka 4.2", "STRUCTURAL: top correction in reply chain"]
}
```

---

## Manual Evaluation Protocol

"Review 100 random outputs from each" is not enough.

### Sampling

Use stratified samples across:
- Product type (question map, controversy map, recommendation graph)
- Subreddit role (specialist, practitioner, mass, narrative, skeptical)
- Cluster size (large, medium, small)
- Score (high, low)
- Recency (recent, historic)
- Cross-community reach (single subreddit, multiple)

Pure random sampling will mostly return large, easy clusters.

### Annotation Rubric

For question clusters:

| Criterion | Question | Scale |
|-----------|----------|-------|
| Coherence | Does the cluster contain one semantic topic? | 1-5 |
| Completeness | Are major phrasings captured? | 1-5 |
| Duplicate contamination | Are unrelated topics merged? | % |
| Canonical question accuracy | Does the canonical form represent the cluster? | 1-5 |
| Material usefulness | Would this help a documentary researcher? | yes/no |

For controversy maps:

| Criterion | Question | Scale |
|-----------|----------|-------|
| Real disagreement present | Is this an actual fault line? | yes/no |
| Positions faithfully represented | Are both sides captured fairly? | 1-5 |
| Minority view preserved | Is nuance retained? | 1-5 |
| Editorial advice justified | Does the advice follow from the evidence? | 1-5 |
| False controversy introduced | Is disagreement overstated? | yes/no |

### Acceptance Thresholds (Set Before Viewing Results)

```yaml
question_cluster_gate:
  coherence_good_or_better: ">= 80%"
  duplicate_error_rate: "<= 10%"
  materially_useful: ">= 60%"

controversy_gate:
  real_fault_line_precision: ">= 75%"
  both_major_positions_present: ">= 85%"
  invented_or_overstated_dispute: "<= 5%"
```

### Multiple Raters

- 100 items reviewed by you (Thomas)
- 30-item overlap reviewed independently by another human
- LLM reviewer as additional diagnostic, NOT as gold standard
- Inter-rater agreement (Cohen's κ) calculated on overlap
- Disagreements adjudicated before proceeding

---

## Falsification Test: Controlled Blinded Comparison

The current test ("does it find useful things beyond keyword search?") is the right instinct but underspecified.

### Design

- 10–20 documentary topics from the Tantra farm
- Four conditions per topic:

| Condition | What Evaluator Sees |
|-----------|---------------------|
| A — Baseline | Google/Reddit keyword search results |
| B — LLM only | One normal LLM research pass |
| C — Reddit engine | Reddit engine outputs (question map, controversy map, recommendation graph) |
| D — LLM + engine | LLM research pass supplied with Reddit engine outputs |

### Evaluation

Evaluators score anonymized outputs on:
- Unique useful questions identified
- Unique credible source leads
- Genuine risks found
- False or misleading claims introduced
- Estimated time saved vs doing it manually
- Relevance to treatment construction

### Success Condition

```
At least 30% more unique useful insights than LLM-only (Condition B),
with no more than 10% increase in false or misleading leads.
```

The engine does not need to outperform every researcher independently. It needs to produce **incremental value inside Hermes**.

---

## Build Order

### Phase 0 — Governance and Evaluation Preregistration

Before any extraction:

1. Confirm dataset provenance and permitted use
2. Define deletion/takedown and author privacy policy
3. Preregister manual evaluation rubric, acceptance thresholds
4. Create blinded baseline comparison design
5. Hash or pseudonymize author IDs
6. Prohibit direct quotation by default

### Phase 1 — Question Map Only (Cleanest, Lowest-Risk)

1. Finish Tantra subreddit extraction
2. Run embedding benchmark (bge-m3 vs bge-small vs MiniLM) on 5,000 examples
3. Embed titles only; cluster with HDBSCAN
4. Build question clusters with stratified manual evaluation (100 items, 30 overlap, rubric preregistered)
5. Ship a local query prototype — no Vectorize or endpoints yet
6. Pass acceptance thresholds before proceeding

### Phase 2 — Recommendation Graph

1. Extract source mentions from top-voted comments
2. Classify stance (recommendation vs mere mention vs critical)
3. Build source entity registry with alias resolution
4. External source verification layer (cross-reference against existing Work/RO library)
5. Human audit of 100 items with rubric
6. Pass acceptance thresholds before proceeding

### Phase 3 — Controversy Map (Only After Stance Extraction Works)

1. Build claim/stance extraction pipeline (semantic contradiction, reply chain analysis, cross-subreddit divergence)
2. Use controversiality as ONE auxiliary feature, not primary signal
3. Review 100 controversy maps for: real fault lines, both positions present, false controversy rate
4. Pass acceptance thresholds before proceeding

### Phase 4 — Falsification Experiment

1. Run controlled blinded comparison: keyword search vs LLM-only vs Reddit engine vs LLM+engine
2. 10–20 documentary topics, anonymized outputs
3. Evaluators score on: unique useful questions, source leads, risks found, false claims introduced
4. Pass condition: ≥30% more useful insights than LLM-only, ≤10% increase in false leads

### Phase 5 — Narrative Frames + Language Translation

1. Extract narrative frames from personal-story posts using structural templates (not copied text)
2. Build specialist ↔ mass language translation pairs with safety warnings
3. Review 100 outputs for safety (unsafe simplifications, misleading equivalences)
4. All outputs labeled "inferred applicability" — never "proven"

### Phase 6 — Vectorize + Endpoints

1. Embed titles + high-value comments (using multiple inclusion lanes)
2. Store in Vectorize
3. Deploy all six query endpoints with full evidence contracts
4. Set up cron for periodic re-clustering

### Phase 7 — Generic Farm Template

1. Parameterize the pipeline: {niche, subreddit_panel} → outputs
2. Include automated subreddit validation task (exists, active, language, role justification)
3. Test with a second farm (neuroscience, mythology)
4. Only after Tantra outputs pass all acceptance thresholds
