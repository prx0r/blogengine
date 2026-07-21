# Reddit Research — Reference Index

Central reference for all Reddit intelligence work. Covers pipeline design, peer reviews, revisions, and current state.

---

## File Index

| File | Purpose | Status |
|------|---------|--------|
| `pipelines/reddit-intelligence/README.md` | Original pipeline spec: 30 subreddits, object model, signal metrics, verification gates | ✅ Stable — defines the core data model and extraction approach |
| `pipelines/reddit-intelligence/reddit-signal-taxonomy.md` | 4 signal layers: submission, comment, cross-subreddit, temporal. Rich signal pattern catalog | ✅ Stable — reference for signal interpretation |
| `pipelines/reddit-intelligence/signal-quick-ref.md` | Lookup table: signal pattern → content decision | ✅ Stable — quick reference |
| `operations/reddit-extraction-guide.md` | Extraction code, subreddit panel with roles, 10 interpretation rules, schema docs | ✅ Stable — operational spec |
| `pipelines/reddit-intelligence/reddit-engine-design.md` | Farm-agnostic engine design. v3: includes data governance, claim/stance controversy, evaluation protocol, falsification test | ✅ Revised (v3) — incorporates both peer reviews |
| `pipelines/reddit-intelligence/reddit-research.md` | This file | ✅ New |

---

## Design Evolution

### v0: Original Pipeline Spec

The `README.md`, `reddit-signal-taxonomy.md`, and `reddit-extraction-guide.md` define the foundational concepts:
- 30 subreddits across 5 roles (specialist, practitioner, mass, narrative, critical)
- 4 signal layers (submission, comment, cross-subreddit, temporal)
- Object model: submission → comment → thread
- Signal metrics per subreddit
- 8 verification gates
- 10 interpretation rules (from peer review corrections)

These files are stable and define the data model. They don't need revision.

### v1: `reddit-engine-design.md` (This Session)

First version of the farm-agnostic engine design. Introduced:
- Parameterized pipeline: {niche, subreddit_panel} → outputs
- 5 signal products (question map, controversy map, source canon, narrative frames, language translation)
- Storage architecture: Vectorize + D1 + R2
- Query endpoints
- 5-phase build order

### v2 → v3: Peer Review Revisions

Two external reviews shaped the engine design:

**Review 1 (Reddit Engine design review):**
- Data rights and deletion compliance (CRITICAL blocking issue)
- Controversy pipeline: claim/stance analysis, not just controversiality flag
- Manual evaluation protocol with stratified sampling, annotation rubric, multiple raters
- Falsification test needs controlled blinded comparison with baselines
- Subreddit roles are topic-specific, not fixed
- Source entity registry with alias resolution
- High-value comment selection needs multiple inclusion lanes
- Terminology: "specialist community discourse" not "specialist explanation"
- Narrative frames: "inferred applicability" never "proven"

**Review 2 (Vision doc review, Reddit-relevant portions):**
- Reddit is not a truth engine — stronger caveats throughout
- Immutable data layers correct
- Staged embedding strategy correct
- Specialist-to-mass translation is the most defensible moat
- "Community-endorsed" not "validated"

All revisions incorporated into `reddit-engine-design.md` (v3).

---

## Current Architecture

### Data Flow

```
Pushshift 84 GB archive (Hetzner volume)
  → Subreddit filter (30 subs)
  → R2: raw/ (immutable, never modified)
    → R2: normalized/ (apostrophe fix, type coercion)
      → R2: farm-extracts/ (per-farm filtered subsets)
        → R2: embeddings/ (versioned by model)
          → R2: derived/ (versioned, never overwritten)
```

### Storage

| Layer | Location | Size | Cost/mo | Notes |
|-------|----------|------|---------|-------|
| Full Pushshift archive | Hetzner volume | 84 GB | €5.50 (already paid) | Submissions only, 2012-2018 |
| Filtered submissions | R2 | ~500 MB | ~$0.01 | Submissions for 30 subreddits |
| Comments (future) | R2 | ~15 GB expected | ~$0.23 | Not yet extracted |
| Derived outputs | R2 | ~1 GB | ~$0.02 | Clusters, maps, graphs |
| Title embeddings | Vectorize | ~500K x 1,024 dims | ~$0.31 | bge-m3 (benchmark first) |
| Metadata + scores | D1 | < 1 GB | Included | Active query lookups |

### Query Architecture

**Research phase:** DuckDB on VPS queries R2 Parquet directly over S3. Columnar + predicate pushdown — reads only relevant rows/columns.

**Production phase:** Pre-computed derived outputs cached in D1. Global Worker (`/api/reddit/*`) serves farm-scoped results. All farms query one global instance.

### The Five Signal Products

| Product | What It Answers | Current Status | Priority |
|---------|----------------|----------------|----------|
| Question map | What do people repeatedly want explained? | 🔲 Phase 1 | Highest |
| Controversy map | Where will the documentary encounter disagreement? | 🔲 Phase 3 | High |
| Recommendation graph | Which sources are repeatedly trusted? | 🔲 Phase 2 | High |
| Narrative frames | How do people naturally make this topic compelling? | 🔲 Phase 5 | Medium |
| Language translation | How should this be described to this audience? | 🔲 Phase 5 | Medium |

### Build Order (8 Phases)

| Phase | What | Output | Gate |
|-------|------|--------|------|
| 0 | Governance: provenance, deletion policy, privacy, evaluation preregistration | Data governance gate passed | Blocking prerequisite |
| 1 | Question map: extract, embed, cluster, evaluate | Working question map prototype | Manual eval thresholds met |
| 2 | Recommendation graph: source extraction, stance classification, entity resolution | Source canon per subreddit | Manual eval thresholds met |
| 3 | Controversy map: claim/stance extraction, cross-subreddit divergence | Fault line maps with positions | Manual eval thresholds met |
| 4 | Falsification experiment: blinded 4-condition comparison | Validated incremental value | ≥30% improvement, ≤10% false leads |
| 5 | Narrative frames + language translation | Frame library, translation pairs | Safety review passed |
| 6 | Vectorize + endpoints | Production API | Load tested |
| 7 | Generic farm template | Parameterized pipeline, second farm test | Tantra passes first |

---

## Subreddit Panel (Tantra)

```yaml
subreddit_panel:
  specialist:
    - KashmirShaivism
    - Tantrasadhaks
    - NonDualism (?) # role is actually more aligned with mass interest
    - TrikaShaivism     # check exists
  practitioner:
    - kundalini
    - Tantra
    - hinduism
  experiential:
    - awakened
    - Meditation
    - spirituality
    - nonduality
  skeptical:
    - DebateReligion
    - AcademicReligion
    - AskHistorians
  narrative:
    - HighStrangeness
    - Paranormal
    - NDE
    - Glitch_in_the_Matrix
```

Community Role Adjustments: Whether "nonduality" is driven by users who are practicing (practitioner) or those who are casually curious (mass), likely leans mass. "Tantra" as a subreddit may mix both practice and broader curiosity.

---

## Key Decisions (With Rationale)

| Decision | Rationale | Source |
|----------|-----------|--------|
| Data governance before extraction | Reddit ToS may restrict ML training; deletion pipeline required | Review 1, critical blocker |
| Question map first (not all 5 products) | Cleanest, lowest-risk, most immediate value | Review 1 |
| Controversy from claim/stance, not controversiality flag | Controversiality reflects close voting, not doctrinal fault lines | Review 1 |
| Subreddit roles are topic-specific, not fixed | r/AskPhilosophy is specialist for philosophy, adjacent for ritual history | Review 1 |
| Source entity registry with alias resolution | "Tantraloka" ≠ "Dyczkowski translation" must be separate nodes | Review 1 |
| Multiple inclusion lanes for comment selection | Popularity bias would remove minority positions and late corrections | Review 1 |
| Staged embedding (titles first, high-value comments second) | No need to embed 100% of comments; most are noise | Review 1 |
| Blinded falsification test before production | Must measure incremental value over LLM-only research | Review 1 |
| Global Worker, not per-farm Reddit instances | R2 cheaper than volume; one Worker serves all farms | This session |
| R2 for active data, volume for archive | $0.23/mo vs €5.50/mo for filtered; archive already on volume | This session |

---

## Open Questions

| Question | Status | Resolution |
|----------|--------|------------|
| Pushshift data license — ML training permitted? | 🔴 Unknown | Needs legal review before Phase 0 |
| Comments extraction — another 100 GB download? | 🟡 Not started | Submissions are filtered; comments dataset is separate |
| bge-m3 vs bge-small vs MiniLM — which is best for our titles? | 🟡 Not started | Need benchmark on 5,000 examples |
| HDBSCAN parameters for Reddit titles? | 🟡 Not started | Need to tune on actual data |
| How many unique submissions in our 30 subreddits? | 🟡 Unknown | 215 batches on R2, count pending |
| Can Pushshift comments be stream-filtered to R2 directly? | 🟡 Unknown | Avoids downloading full 100 GB locally |
| Cross-subreddit author overlap — how much is there? | 🟡 Unknown | Affects interpretation of "independent replication" |

---

## What To Do When the Upload Finishes

1. `duckdb` on VPS → count rows per subreddit in the R2 Parquet
2. Embed titles using Workers AI (`@cf/baai/bge-base-en-v1.5` for 768-dim or benchmark)
3. HDBSCAN cluster → first pass question clusters
4. Review 50 clusters manually — are they coherent?
5. If yes: build the recommendation graph (source mention extraction)
6. If no: adjust embedding model or clustering parameters
