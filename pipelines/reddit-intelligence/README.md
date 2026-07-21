# Reddit Intelligence Pipeline

## Objective

Extract structured signal from Reddit discussions — not raw comments, but community-validated questions, recurring confusion, recommendation canons, and narrative frames — to feed our content opportunity detection.

## Research Role (Tier 2 — Calibration)

This pipeline is Tier 2: it calibrates topic opportunity scores and provides training data for script language models. It does not independently validate content hypotheses (Tier 1). All findings from this pipeline are cross-referenced against YouTube gap scores and channel breakout data before production decisions.

## Critical Constraints

**Historical window:** Pushshift archive covers June 2005 – April 2023. Subreddits created after April 2023 (e.g., r/Tantrasadhaks, r/HighMagic) have zero data in the archive. Use the historical panel for large-scale analysis and Reddit API for current extension.

**Data is not evidence:** Reddit comments reflect the opinions of self-selected Reddit users, not representative populations. A recurring question does not mean "viewers want this video" — it means "this question is unresolved in this community." That's useful but different.

**Subreddit role matters:** The same sentence in r/KashmirShaivism and r/awakened means different things. Never pool across subreddit roles without explicit stratification.

---

## Subreddit Panel

### Historical Core (30 subreddits, June 2005 – April 2023 in Pushshift)

#### Direct source / practitioner layer
`Tantra` (2008), `KashmirShaivism` (2015), `shaivism` (2013), `Shaktism` (2015), `AdvaitaVedanta` (2011), `hinduism` (2008), `Vajrayana` (2009), `TibetanBuddhism` (2008), `Dzogchen` (2009), `kundalini` (2008)

#### Western esoteric layer
`occult` (2008), `magick` (2008), `GoldenDawnMagicians` (2019), `Quareia` (2016), `Hermeticism` (2013), `Thelema` (2009), `Theurgy` (2012), `Esotericism` (2012), `alchemy` (2008)

#### Audience-language layer
`awakened` (2012), `spirituality` (2009), `nonduality` (2012), `Meditation` (2008), `streamentry` (2015), `TheMindIlluminated` (2015)

#### Narrative-demand layer
`HighStrangeness` (2013), `Paranormal` (2008), `NDE` (2012), `Glitch_in_the_Matrix` (2013), `AstralProjection` (2009)

### Critical / comparative layer (added per research object)
`consciousness`, `philosophyofmind`, `neurophilosophy`, `askphilosophy`, `DebateReligion`, `AcademicBiblical`, `Neoplatonism`, `Sufism`, `ChristianMysticism`, `gnosticism`, `mythology`

---

## Data Extraction (Stream-Filtered, Not Full Download)

**Do not download the 292 GB Pushshift dump.** Stream-filter by subreddit using HuggingFace datasets library:

```python
from datasets import load_dataset

SUBREDDITS = [
    "Tantra", "KashmirShaivism", "shaivism", "Shaktism",
    "AdvaitaVedanta", "hinduism", "Vajrayana", "TibetanBuddhism",
    "Dzogchen", "kundalini", "occult", "magick",
    "GoldenDawnMagicians", "Quareia", "Hermeticism", "Thelema",
    "Theurgy", "Esotericism", "alchemy",
    "awakened", "spirituality", "nonduality", "Meditation",
    "streamentry", "TheMindIlluminated",
    "HighStrangeness", "Paranormal", "NDE",
    "Glitch_in_the_Matrix", "AstralProjection"
]

# Stream submissions (titles + selftext) — ~5 GB filtered
ds = load_dataset("fddemarco/pushshift-reddit", split="train", streaming=True)
filtered = ds.filter(lambda x: x['subreddit'] in SUBREDDITS)

# Save filtered to Parquet
filtered.save_to_disk("/mnt/data/raw/reddit/submissions_filtered.parquet")

# Stream comments — ~10 GB filtered
ds2 = load_dataset("fddemarco/pushshift-reddit-comments", split="train", streaming=True)
filtered2 = ds2.filter(lambda x: x['subreddit'] in SUBREDDITS)
filtered2.save_to_disk("/mnt/data/raw/reddit/comments_filtered.parquet")
```

Filtered output: ~5 GB for submissions, ~10 GB for comments. Uploads to R2.

---

## Object Model

### Per Submission

```yaml
subreddit: "KashmirShaivism"
subreddit_role: specialist          # specialist | practitioner | mass_spiritual | testimonial | critical
post_type: question                  # question | experience | argument | resource_request | recommendation
created_utc: 2018-03-15
title: "Why does Abhinavagupta say the world is real but Maya is also real?"
selftext: "I'm confused about how... "
explicit_question: "How can the world be both real and Maya?"
underlying_need: reconcile_contradiction  # reconcile | understand | verify | apply
topic_cluster: abhinavagupta_ontology
has_experience_claim: false
has_textual_claim: true
num_comments: 12
score: 45
```

### Per Comment

```yaml
subreddit: "KashmirShaivism"
comment_type: top_level | reply_deep
parent_type: question | experience | argument
sentiment: explanatory | corrective | skeptical | devotional
source_mentions: ["Tantraloka", "Pratyabhijna"]
teacher_mentions: ["Abhinavagupta"]
book_mentions: []
practice_mentions: []
upvotes: 23
depth: 1           # 0 = top-level, 1 = reply to top, etc.
controversial: false  # upvote ratio < 0.5
```

### Per Thread (Derived)

```yaml
thread_id: "abc123"
subreddit: "KashmirShaivism"
question: "How can the world be both real and Maya?"
best_answer: "Abhinavagupta distinguishes empirical reality from ultimate..."
consensus: "Most responses cite Svatantrya as the resolution"
dissent: "A minority argues this is a later interpolation"
unresolved_confusion: "The term 'Maya' is used differently by different commentators"
recommended_sources: ["Ksemaraja", "Tantraloka Chapter 6"]
```

---

## Signal Metrics

After extraction, compute per subreddit:

| Metric | What It Measures | Use |
|--------|-----------------|-----|
| question_rate | questions / total posts | How much this sub asks vs shows |
| median_comments_per_question | engagement depth | Are questions getting real answers? |
| source_mention_rate | sources / 1k comments | How text-grounded is the discussion? |
| disagreement_rate | controversial comments / total | Are there active debates? |
| topic_persistence | same topic appears across years | Recurring unresolved questions |
| cross_subreddit_repetition | same topic in multiple roles | Mass demand signal |
| first_person_rate | experience claims / total | Is discussion experiential or textual? |
| self_promotion_rate | promotional content / total | Noise level |

**Gate:** Subreddits with self_promotion_rate > 20% excluded from analysis.

---

## Analysis Pipeline

### Phase 1: Topic Clustering (Exploratory, Tier 3)

```python
# Embed all submission titles + top comment texts
# Cluster with HDBSCAN
# Extract top terms per cluster
# Label clusters manually
# Output: Topic cluster with example questions per cluster

cluster_example = {
    "topic": "awakening_aftereffects",
    "subreddit_role": "mass_spiritual",
    "example_questions": [
        "Why does awakening make me feel detached?",
        "Nothing feels real after my meditation retreat",
        "Is it normal to feel worse after awakening?"
    ],
    "cross_subreddit_count": 4,  # appeared in 4 subreddits
    "years_active": [2018, 2019, 2020, 2021, 2022],
    "specialist_depth": null,  # populated if same topic found in specialist subs
    "mass_signal": "high"
}
```

### Phase 2: Question Extraction (Calibration, Tier 2)

```python
# For each topic cluster:
# 1. Extract all explicit questions (containing "?")
# 2. Group by phrasing similarity
# 3. For each phrasing: count frequency, count cross-subreddit spread
# 4. For each phrasing: does a specialist sub provide a better answer than mass subs?
# 5. Output: phrasings ranked by (specialist_depth × mass_signal)

question_finding = {
    "phrasing": "Why do I still feel like a separate self after awakening?",
    "mass_signal": { "subreddits": ["awakened", "nonduality", "spirituality"],
                     "total_occurrences": 87, "years_active": 6 },
    "specialist_depth": { "subreddits": ["KashmirShaivism", "AdvaitaVedanta"],
                          "total_occurrences": 12, "years_active": 5,
                          "source_mentions": ["Pratyabhijna", "Bhagavad Gita"] },
    "opportunity_score": specialist_depth * mass_signal,
    "content_frame": "Why Enlightenment Does Not Destroy the Ego: Abhinavagupta's Stranger Answer"
}
```

### Phase 3: Recommendation Graph (Calibration, Tier 2)

```python
# For each subreddit:
# 1. Extract all book/teacher/practice mentions from top-voted comments
# 2. Count co-occurrence
# 3. Build directed graph: question → recommended_source
# 4. Output: "What does this community recommend for this question?"

recommendation = {
    "subreddit": "KashmirShaivism",
    "question_cluster": "tantraloka_study",
    "top_recommendations": [
        {"item": "Tantraloka", "type": "text", "weight": 0.8},
        {"item": "Ksemaraja commentaries", "type": "text", "weight": 0.6},
        {"item": "Swami Lakshmanjoo", "type": "teacher", "weight": 0.5}
    ]
}
```

### Phase 4: Narrative Frame Mining (Exploratory, Tier 3)

```python
# For narrative-demand subreddits (HighStrangeness, Paranormal, NDE, Glitch_in_the_Matrix):
# 1. Extract first-person experience posts
# 2. Identify narrative structure: setup → escalation → anomaly → aftermath
# 3. Cluster by anomaly type
# 4. Output: "Which paranormal story frames could carry tantra content?"

narrative_frame = {
    "frame": "ancient_text_describes_modern_phenomenon",
    "example_posts": [
        "Tibetan text describes near-death experience exactly",
        "Ancient Indian texts mention parallel universes"
    ],
    "applicable_to": ["cremation ground", "tantric cosmology", "subtle body"],
    "hook_template": "A 1,000-year-old text describes something scientists only recently confirmed"
}
```

---

## The Opportunity Intersection

The strongest content opportunities sit at the intersection of:

```
specialist_depth × mass_language_resonance
```

Example:

- r/KashmirShaivism: technical discussions of recognition (prakasa/vimarsa), contraction (samkoca), and why enlightenment doesn't destroy the ego
- r/nonduality: "Why do I still feel like a separate self?"
- r/awakened: "I had an awakening but nothing in my life changed"

That intersection produces:

> **Why Enlightenment Does Not Destroy the Ego: Abhinavagupta's Stranger Answer**

This is the actual edge: not identifying frequent questions, but finding where a precise tradition provides an unexpectedly powerful answer to a widespread human question.

---

## Verification Gates

| Gate | Check | Fail Action |
|------|-------|-------------|
| R01 | All 30 subreddits have data in Pushshift (check created dates) | Replace post-2023 subs with available alternatives |
| R02 | Stream-filter completed without full download | Resume from checkpoint |
| R03 | Topic clusters show meaningful separation (silhouette > 0.3) | Adjust embedding or recluster |
| R04 | Question extraction catches >80% of explicit questions | Expand regex patterns |
| R05 | Per-subreddit signal metrics computed | Flag high-self-promotion subs |
| R06 | Recommendation graph has ≥5 sources per specialist sub | Expand minimum, flag sparse subs |
| R07 | Narrative frames reviewed by human | Frame library stored in genome |
| R08 | All findings labeled Tier 2 or Tier 3 (not sold as validated) | Correct labels before pipeline use |

## Output Files

| File | Contents |
|------|----------|
| `data/research/reddit/topic-clusters.json` | HDBSCAN topic clusters with example questions |
| `data/research/reddit/question-extractions.json` | Ranked phrasings with mass_signal × specialist_depth |
| `data/research/reddit/recommendation-graph.json` | Per-subreddit source recommendation networks |
| `data/research/reddit/narrative-frames.json` | Story frames from narrative-demand subs |
| `data/research/reddit/subreddit-signals.json` | Question rate, comment depth, source density per sub |

## Limitations (Explicit)

- Reddit users are not representative of YouTube viewers. A question that recurs on Reddit may have zero search volume on YouTube.
- Pushshift data ends April 2023. Post-2023 subreddits and content are not captured.
- Specialist subreddits have small sample sizes (r/KashmirShaivism: ~3k members). Questions appearing 10 times there may be less robust than 10 times in r/awakened.
- Recommendation graphs capture what communities *recommend*, not what is *correct*.
- Narrative frames from r/HighStrangeness should never be used as evidence that a supernatural claim is true.
