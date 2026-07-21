# The Loom — Visionary Architecture

## What We're Actually Building

Not a YouTube channel. Not a content farm. A **self-replicating media foundry** that discovers underserved intellectual territory, designs an appropriate media institution, provisions it as an isolated autonomous farm, evaluates its work, learns from its audience, and reproduces successful production knowledge across an expanding network.

```
                   ┌─────────────────────────────┐
                   │     DISCOVERY ENGINE          │
                   │  (Layer 1+2: datasets, API,   │
                   │   gap scores, Wikipedia z,    │
                   │   forum question clusters)    │
                   └─────────────┬───────────────┘
                                 │ "this topic has demand
                                 │  and no supply"
                                 ▼
                   ┌─────────────────────────────┐
                   │     FARM FOUNDRY              │
                   │  (provisions infrastructure,  │
                   │   generates manifest, seeds   │
                   │   D1 + R2 + Workers, creates  │
                   │   Docker container, deploys)  │
                   └─────────────┬───────────────┘
                                 │ "here is your new farm
                                 │  with its own identity"
                                 ▼
                   ┌─────────────────────────────┐
                   │     FARM (per channel)        │
                   │  ┌─────────────────────────┐  │
                   │  │ Research pipeline        │  │
                   │  │  → daily harvest         │  │
                   │  │  → weekly gap            │  │
                   │  │  → opportunity scores    │  │
                   │  └──────────┬──────────────┘  │
                   │             │                  │
                   │  ┌──────────▼──────────────┐  │
                   │  │ Production pipeline      │  │
                   │  │  → research pack         │  │
                   │  │  → fact-check gate       │  │
                   │  │  → speaker-tagged script │  │
                   │  │  → WAIT_FOR_VOICEOVER    │  │
                   │  │    (human records HOST)  │  │
                   │  │  → TTS (AI-COHOST only)  │  │
                   │  │  → interleave + render   │  │
                   │  │  → WAIT_FOR_APPROVAL     │  │
                   │  │  → publish               │  │
                   │  └──────────┬──────────────┘  │
                   │             │                  │
                   │  ┌──────────▼──────────────┐  │
                   │  │ Post-release learning    │  │
                   │  │  → 24h/7d/28d/90d       │  │
                   │  │  → hypothesis testing    │  │
                   │  │  → genome feedback       │  │
                   │  └─────────────────────────┘  │
                   └─────────────────────────────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          │                      │                      │
          ▼                      ▼                      ▼
   ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
   │ Global      │      │ Content     │      │ Genome      │
   │ Control     │      │ Genome      │      │ Evolution   │
   │ Plane       │      │ (shared     │      │ (lineage,   │
   │ (dashboard, │      │  patterns,  │      │  mutations, │
   │  approvals, │      │  hooks,     │      │  selection) │
   │  cross-farm)│      │  rubrics)   │      │             │
   └─────────────┘      └─────────────┘      └─────────────┘
```

## The Components

### 1. Discovery Engine (Layers 1-2)

**What it does:** Finds underserved topics by combining open datasets, API signals, and forum research.

**Data sources:**
- YouNiverse (breakout metric validation — done, A1/A2 pass)
- Global Trending (cross-country diffusion priors)
- YTCommentVerse (comment intent taxonomy)
- Wikipedia pageview velocity (emerging interest signal)
- YouTube Search API (gap scores — weekly, not daily)
- Google Trends (western demand)
- Reddit/forum question clusters (what people are confused about)

**Output:** Candidate Opportunity Packet — topic, gap score, replication evidence, visual depth, source availability, estimated cost.

### 2. Farm Foundry

**What it does:** Takes an opportunity hypothesis and provisions a fully isolated farm.

**Input:** `hypothesis: { niche, audience, format, monthly_budget, minimum_evidence_score }`
**Output:** Running farm with D1, R2, Workers, Queues, Docker container, Hermes agent, first 20-video slate.

**Provisioning sequence:**
1. Collect market signals
2. Identify comparable channels
3. Estimate topic depth and asset availability
4. Generate brand constitution (farm-manifest.yaml)
5. Produce simulated first 20-video slate
6. Estimate production cost and bottlenecks
7. Provision Cloudflare resources (D1, R2, Workers, Queues)
8. Create Docker container config
9. Seed farm's private knowledge base
10. Run three unpublished pilot videos
11. Present launch approval gate

### 3. Farm (per channel)

**Three pipelines running continuously:**

| Pipeline | Cadence | Key Steps |
|----------|---------|-----------|
| Research | Daily harvest, weekly gap | Channel uploads, breakout scores, opportunity detection |
| Production | Per video (~1-2 weeks) | Research pack → fact-check → script (HOST/AI-COHOST) → voiceover → TTS → render → publish |
| Learning | Post-release fixed ages | 24h/7d/28d/90d metrics, hypothesis testing, genome feedback |

**Human gates:**
- Fact-check gate (every historical claim needs a source)
- Treatment approval (you review the angle)
- Voiceover (you record HOST lines — the real bottleneck)
- Publish approval (you give final go — permanently "no" to auto-publish)

### 4. Global Control Plane

**What it does:** One dashboard across all farms. Reads metadata only — never content.

**Tables:** farms, pipeline_stages, approvals, topic_opportunities, cross_farm_metrics, control_commands, health_incidents.

**Dashboard features:**
- Farm grid (current stage, queue depth, last breakout)
- Approval inbox (all WAIT_FOR_APPROVAL items across all farms)
- Per-farm drill-down (recent videos, topics, hypotheses)
- Cross-farm opportunity view (what niches are uncovered)
- Interrupt controls (pause/resume/terminate per farm, per workflow)
- Record view (script with HOST lines highlighted, recording interface)

### 5. Content Genome

**What it is:** A shared, read-only pattern library. Not scripts — abstracted lessons.

**Genome types:**
```yaml
HOOK_PATTERN       # "begin with popular interpretation, reveal opposite"
TITLE_PATTERN      # "question + specific entity + universal stake"
STORY_STRUCTURE    # "mystery → evidence → reversal → resolution"
VISUAL_METAPHOR    # "cremation ground as map of consciousness"
DIAGRAM_TEMPLATE   # "36 tattvas as layered concentric circles"
THUMBNAIL_RULE     # "one focal object, no competing elements"
SOURCE_RUBRIC      # "primary text tier 1, academic tier 2, folklore tier 3"
RISK_PATTERN       # "claim about living lineage needs practitioner verification"
```

Each pattern stores: description, suitable_for, avoid_when, evidence (how many experiments, median effect size).

**Validation gate:** Nothing enters the genome without ≥5 confirmations from controlled experiments (same 50-sample hand-check standard from Stage 4).

### 6. Evolution

**How creative decisions improve across videos:**

```
Title "X" → produced → performance data → attribution analysis
  → "title specificity correlates with CTR at 0.3"
  → genome learns: specificity matters more for Search, less for Browse

Thumbnail T17 → produced → compared to T04
  → "removing secondary face improved CTR by 12%"
  → genome updates thumbnail rules for this niche
```

Ralph-style loops mutate one variable at a time: title specificity, face/no face, hook structure, first reveal timing. With 1 video/week, the system cannot mutate multiple variables simultaneously and still attribute results.

### 7. Shadow Farm Simulator

Before launching a farm, run it in accelerated simulated time against historical data:
- Does it run out of viable subjects?
- Dependence on temporary trends?
- Probable cost per completed video?
- Expected failure modes?

**Purpose:** Reject structurally weak farms before spending money on them. Not to predict exact views.

### 8. The Opportunity Exchange

Every discovered topic becomes an opportunity object. Farms "bid" based on audience fit, topical authority, production cost. Control plane assigns to the strongest farm or recommends creating a new one.

**Prevents:** Three farms producing the same story. Interesting discoveries getting lost. Trend chasing that damages channel identity.

## The Constraint Everything Answers To

**Human voiceover is the real bottleneck.** One person recording HOST lines. ~2 hours/week. ~8 videos/month across ALL farms.

This means:
- The foundry's output is capped by human recording bandwidth, not infrastructure
- More farms = more scripts queued for your voice, not more output
- The Opportunity Exchange bids for your time, not compute budget
- Every other optimization (TTS cost halved, AI co-host carries exposition) exists to maximize output per recording minute

## Current Status

| Component | Status | What's Missing |
|-----------|--------|----------------|
| Discovery (Layer 1) | Mostly done | Layer 2 API tests |
| Farm template | Spec'd + hypothetical code | YouTube/Google/Wikipedia API clients, deployment |
| Control plane | Schema designed | Dashboard Worker implementation |
| Content genome | Conceptual | Schema + validation gate + first patterns |
| Farm Foundry | Conceptual | provisioning Workflow |
| Shadow Farm | Conceptual | Polars simulation engine |
| Opportunity Exchange | Conceptual | Scoring + bidding logic |
| Evolution | Conceptual | Lineage tracking + mutation framework |

## The Build Order

1. **Layer 2 API tests** (this week) — resolves open questions, costs only quota
2. **First 10 tantra videos** (next 10 weeks) — proves one farm works
3. **Dashboard + control plane** (parallel with #2) — makes the system manageable
4. **Second farm** (after #2 proves the model) — tests replication
5. **Genome + evolution** (after data from #2+#3) — only with real performance data
6. **Farm Foundry** (after #4 proves replication) — automates what's been done manually twice
7. **Everything else** — only if the first 10 videos show the model actually works
