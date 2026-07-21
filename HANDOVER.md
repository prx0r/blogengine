# Handover — YouTube Intelligence & Content Pipeline

## Project State (2026-07-21)

Research hypothesis: Indian creators validate topics that haven't been narrativized for Western audiences. The opportunity is cultural translation — not SEO gap detection. The system is a **self-replicating media foundry**: one farm per channel, Cloudflare-native, with a human host + AI co-host format.

---

## Architecture

```
Human (you) — records HOST lines, approves treatments, approves publish
  │
  ▼
Hermes (cognitive controller) — chooses topics, requests approval, updates strategy
  │
  ▼
Cloudflare Workers + Workflows (durable execution)
  ├── Research Pipeline → D1 gap map + feature store
  ├── Content Pipeline → HOST/AI-COHOST script → voiceover → TTS → render → YouTube
  └── Analytics Pipeline → hypothesis tracking + genome feedback

Global content-genome R2 (read-only for all farms)
Global control plane D1 (metadata only — never content)
Per-farm R2 bucket (scoped credentials, read++write on own bucket only)
```

---

## Completed Work

### Data & Validation

| Work | Result | Key Files |
|------|--------|-----------|
| Dataset download | YouNiverse, YTCommentVerse, Global Trending in R2 | `operations/dataset-download.md` |
| Layer 1: breakout metric | A1 PASS (44% diff), A2 PASS (delta R²=0.017), A3 informative | `data/research/youniverse/README.md`, `scripts/layer1-youniverse-test.py` |
| Layer 2 Task 1: gap verification | 16/30 queries ≥ 0.30 gap — pattern real, weekly cadence | `data/reports/underserved-claim-test-2026-07-21.json` |
| Layer 2 Task 3: Wikipedia | r=0.027 — zero signal, skipped permanently | `data/research/layer2/wikipedia-validation.json`, `scripts/wikipedia-validation.mjs` |
| Layer 2 Task 2: daily search | Cron running 00:05 UTC, 14-day collection in progress | `scripts/daily-search-collection.mjs`, `scripts/run-daily-search.sh` |
| Credential cleanup | Hardcoded keys purged from 12 files, .env.example added | — |

### Spec & Architecture

| Work | Key File | What It Contains |
|------|----------|------------------|
| Farm implementation plan | `pipelines/farm-implementation-plan.md` | Full 5-stage pipeline, falsifiable assumptions, co-host format, verification gates |
| Franchise spec | `farm-factory/franchise-spec.md` | VPS layout, Docker containers, R2 credential architecture, farm-manifest.yaml |
| Dashboard spec | `farm-factory/dashboard/dashboard-spec.md` | Control plane D1 schema, approval inbox, cross-farm view, interrupt controls |
| The Loom | `pipelines/the-loom.md` | Visionary architecture: discovery engine → farm foundry → genome → evolution |
| Build plan | `operations/build-plan.md` | 6 sprints, dependency chain, concrete file-by-file actions |
| Object model | `farm-factory/docs/OBJECT-MODEL.md` | RO, PO, HO, Essay, Storyboard, Video schemas |
| R2 dataset reference | `pipelines/r2-dataset-reference.md` | Schema, access commands, limitations for all datasets |
| R2 credential architecture | `farm-factory/franchise-spec.md` §Global R2 | Read-only global token + read-write farm token, zero-trust isolation |
| Co-host format | `pipelines/farm-implementation-plan.md` §Stage 3 | HOST/AI-COHOST dialogue, recording view, interleaved audio |

### Hermes Integration

| File | Purpose |
|------|---------|
| `pipelines/hermes-army/hermescloudflare.md` | Full Cloudflare architecture with costs and farm template |
| `hermes/AGENTS.md` | Hermes agent context |
| `hermes/SOUL.md` | Hermes personality: "the librarian, not the author" |

---

## Currently Running

| Process | What | Duration |
|---------|------|----------|
| Daily search collection | 16 queries × 3 regions at 00:05 UTC | 14 days from 2026-07-21 |
| Dataset volume | 50GB Hetzner volume mounted, 6.8 GB free | — |

---

## Not Started (Priority Order)

| # | What | Why It's Blocked |
|---|------|-----------------|
| 1 | Global R2 `content-genome` bucket | No code — just create in dashboard + upload existing art library |
| 2 | YouTube API client (`lib/youtube.ts`) | Doesn't exist yet. Needed before farm Worker can run |
| 3 | Google Trends client (`lib/trends.ts`) | Doesn't exist yet. Needed for western_demand signal |
| 4 | Farm Worker deployment (tantra) | After API clients exist. Depends on #1-#3 |
| 5 | First video through full pipeline | Depends on #4 running and producing research data |
| 6 | Control plane D1 + dashboard | Can build in parallel with #1-#3 |
| 7 | Docker infrastructure | Not needed until Worker pipeline is proven |
| 8 | RO/PO full schema | First 5 videos use flat research packs, not versioned ROs |

---

## Key Decisions (with Rationale)

| Decision | Rationale |
|----------|-----------|
| Within-channel breakout | Controls for audience size. Cross-channel compares 10k-sub to 5M-sub. |
| OLS residual metric | `log(views) ~ log(age)`, residual = breakout. 44% different labels from raw views. |
| Weighted sum with clamp | Multiplicative score dies if any input is near-zero. Clamp [0.1, 1] ensures one bad input doesn't kill the score. |
| Co-host format (HOST/AI-COHOST) | Cuts recording load (you voice only HOST lines). Strengthens authenticity signal. Varies rhythm per video naturally. |
| No TTS for host | You record your own lines. This is the single strongest signal against YouTube's inauthentic content policy. |
| Never auto-publish | Historical/religious claims. Closed decision, not a design tradeoff. |
| Wikipedia skipped | r = 0.027 at n=11. Zero signal. Gap scores alone are sufficient. |
| Per-farm scoped R2 tokens | Read-only global + read-write own bucket. Cloudflare IAM enforces isolation, not code. |
| Weekly gap computation | Daily deltas in a slow niche = noise. Rolling 7-day window filters jitter. |

---

## Open Threads & Unresolved Questions

These are conversations we started but haven't settled. Each is worth exploring when relevant data exists.

**1. Does gap score actually predict video performance?**
The entire opportunity formula rests on this. Layer 1 validated that the *metric* works (OLS residual captures different signal). But the causal claim — "topics with high gap scores will perform above channel baseline when we produce them" — can't be tested until we have 10+ published videos. That's the single most important unknown.

**2. How much of the 44% label difference from A1 is signal vs noise?**
At n=500 we got 44%. At n=100 we got 16%. The result converged as sample size increased, suggesting it's real. But the within-channel OLS is noisy (fit on ~30 points per channel), and some of that 44% difference could be overfitting. Cross-validation on held-out channels would tell us.

**3. Does the co-host format actually retain viewers?**
The format is designed to fix authenticity, templating, and recording-bottleneck problems. But we don't know if audiences like it. The 8-beat structure with two voices might feel more natural or might feel gimmicky. Only retention curves from real videos will answer this.

**4. Is one voiceover session per week realistic at scale?**
The arithmetic says 2 hours/week = 8 videos/month across ALL farms. But that assumes consistent output. Realistically, some weeks you'll record 30 minutes, some weeks 4 hours. The bottleneck isn't a line — it's a probability distribution. Worth tracking actual recording throughput once production starts.

**5. The genome propagation risk: will shared patterns across farms trigger YouTube enforcement?**
Multiple farms using similar hook structures, title patterns, and thumbnail compositions is the exact signature YouTube's inauthentic content policy targets. The genome is supposed to be abstract enough that each farm's output looks distinct. But "abstract enough" is a hypothesis, not a design spec. We'll know when a second farm exists and produces visually similar work to the first.

**6. When does the daily-vs-weekly decision get made with confidence?**
The 14-day collection will give us Spearman r on week-over-week gap scores. If r > 0.3, weekly is fine. If r < 0.3, we need to rethink. Data incoming in ~12 days.

**7. Should the research pack become a full RO with versioning, or stay flat?**
The first 5 videos don't need versioned ROs. But as the source library grows, tracking which RO version a video used becomes important for attribution and fact-check updates. The inflection point is probably around video 10-15.

**8. Is the 8-beat format actually flexible enough to avoid feeling templated?**
The co-host format adds variation per video. But the underlying structure (hook → context → evidence → escalation → return) is fixed. At what n does a viewer notice every video follows the same arc? Only audience retention data can answer.

---

## Running the Research Pipeline

```bash
# Layer 1 breakout validation (YouNiverse, ~70s)
python3 scripts/layer1-youniverse-test.py

# Stage 1 underserved test (YouTube API, 90 search calls)
npm run data:underserved-test
python3 scripts/validate-data-report.py data/reports/underserved-claim-test-*.json

# Wikipedia validation (free API, ~30s)
node scripts/wikipedia-validation.mjs

# Daily search collection (cron — runs automatically at 00:05 UTC)
node scripts/daily-search-collection.mjs
```

## API Usage

- YouTube search.list: 100 calls/day (separate bucket)
- YouTube general pool: 10,000 units/day
- Track usage: `data/api-usage-log.csv`
- Daily search collection: 48 calls/day (16 queries × 3 regions)

---

## File Index

### Strategy (root level)
`intelligence-pipeline.md`, `highsignalspec.md`, `channel-growth-algorithm.md`, `youtubemaster.md`, `youtubemaster2.md`, `brainstormcontent.md`

### Pipeline Specs
`pipelines/README.md`, `pipelines/farm-implementation-plan.md`, `pipelines/the-loom.md`, `pipelines/r2-dataset-reference.md`, `pipelines/hermes-army/hermescloudflare.md`, `pipelines/youniverse/`, `pipelines/global-trending/`, `pipelines/yt30m-comments/`, `pipelines/regional-audit/`

### Farm Factory (hypothetical Workers code)
`farm-factory/farm-template/`, `farm-factory/hermes-conductor/`, `farm-factory/dashboard/dashboard-spec.md`, `farm-factory/franchise-spec.md`, `farm-factory/docs/`, `farm-factory/scripts/`

### Data
`data/research/youniverse/` (Layer 1 outputs), `data/research/layer2/` (Layer 2 outputs + daily collection), `data/reports/` (standardized JSON reports), `data/api-usage-log.csv`

### Operations
`operations/dataset-download.md`, `operations/layer1-handover.md`, `operations/build-plan.md`

### Scripts
`scripts/layer1-youniverse-test.py`, `scripts/test-underserved-claim.mjs`, `scripts/validate-data-report.py`, `scripts/wikipedia-validation.mjs`, `scripts/daily-search-collection.mjs`, `scripts/run-daily-search.sh`, `scripts/market-landscape.ts`

### Reference Docs
`docs/api-ref/` (YouTube API), `docs/cloudflare-ref/` (Cloudflare API)

### Hermes
`hermes/AGENTS.md`, `hermes/SOUL.md`, `hermes/skills/`, `hermes/notes/`
