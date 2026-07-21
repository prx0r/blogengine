# Future Research — Visionary Build Ideas

## The Daimonic Companion — A Soul Partner

The engine is already a deterministic translator of sky to self. The next evolution is a **proactive daimonic companion** that lives with you, learns from you, and grows with you.

### Phase 0: The Raw Daily Snapshot (Prerequisite)

**Maximally granular deterministic output.** Before any rendering, before any LLM, before any diary — the system produces one `DailySnapshot` object that contains EVERYTHING:

```ts
DailySnapshot {
  engine: { signals[], conditions, oikodespotes, aspects, antiscia, bonification, combinations },
  timescapes: { year, month, week, day as structured data },
  interpretations: { al_khayyat[], valens[], ficino[], greenbaum[], demetra[] },
  convergence: { planets[], themes[], advice[] },
  practices: [{ id, source, title, procedure[], incantation?, source_text? }],
  correspondences: { herbs[], metals[], colours[], stones[], incenses[] },
  user?: { mood?, energy?, notes?, events?, tags? },
}
```

This is stored in D1 as a JSON blob, indexed by date + native_id. Every field is deterministic. The LLM never sees raw caelus data — it only reads the snapshot.

**Source material linking**: Each practice carries its actual source text:
```ts
"orphic:mercury:001" → "Hermes, messenger of Zeus, guide of souls, 
  Who turns the key of dreams, who brings light to words..."
```

This means the LLM can render the actual prayer, not just a reference to it.

### Phase 1: The Personal Archive (Foundational)

**Daily Snapshot Recording**
Every visit to `/astrology` logs: the full `DailySnapshot`, your mood/energy ratings, free-form journal notes, and any life events you tag. After 30 days, you have a personal dataset. After 365 days, you have a year-long record of how planetary activations correlate with YOUR actual experience — not a generic prediction, but YOUR specific patterns.

The data structure:
```ts
{
  date: "2026-07-09",
  packet: ActivationPacket,
  mood: 4,                          // 1-5
  energy: 3,                        // 1-5
  notes: "Had a breakthrough in writing today",
  events: ["finished_chapter"],
  tags: ["creative_flow"],
  // Automatically recorded:
  daimon_active: true,              // was Mercury the daimon?
  year_lord: "saturn",
  dominant_mode: "mixed",
}
```

After 90 days, the system can answer: "When Mercury is active and I write, my average mood is 4.2. When Mercury is active and I don't write, my average mood is 2.8."

**Life Chapter Map**
Compute the engine for every year of your life retroactively. Show your profection years mapped against actual life events:

| Age | Profection | Theme | What happened |
|---|---|---|---|
| 14 | H3 (Mercury) | Communication | Started keeping a journal |
| 21 | H10 (Saturn) | Career | First serious job |
| 27 | H4 (Saturn) | Foundations | Current — building home/family |

This turns the engine into a **time machine** — you can see the patterns of your life laid bare, and recognize that the current chapter is part of a larger rhythm.

### Phase 2: The Daimonic Agent (LangGraph)

A multi-agent system that monitors your data streams and proactively offers insight:

```
User Data Streams:
  ├── Astrology Engine (daily ActivationPacket)
  ├── Diary/Journal (user notes, mood, energy)
  ├── Calendar (events, meetings, travel)
  ├── Biometrics (sleep, HRV, step count — from Apple Watch/Oura)
  └── Communications (email sentiment, social media activity)

                    ↓
          Orchestrator Agent (LangGraph)
                    ↓
    ┌───────────┬───────────┬───────────┬───────────┐
    │ Daimon    │ Shadow    │ Practice  │ Life      │
    │ Agent     │ Agent     │ Scheduler │ Review    │
    │ (reads    │ (reads    │ Agent     │ Agent     │
    │ macro +   │ activations│ (suggests │ (weekly/  │
    │ daimon    │ + diary   │ practices │ monthly   │
    │ context)  │ for shadow│ based on  │ summary)  │
    │           │ patterns) │ upcoming  │           │
    └───────────┴───────────┴───────────┴───────────┘
```

Agent descriptions:

**1. Daimon Agent** — "Your daimon (Mercury) has been the primary signal on 12 of the last 30 days. On those days, you wrote 3x more than average and rated your mood 1.2 points higher. Tomorrow Mercury is active again — consider scheduling focused writing time."

**2. Shadow Agent** — Reads activations + diary + calendar for tension patterns. "Mars has been in detriment and retrograde for the past 3 months. In your diary entries during this period, I notice recurring themes of frustration with self-assertion. This will resolve when Mars turns direct [date]. Until then, the practice is 'reconsider how you assert before acting.'"

**3. Practice Scheduler Agent** — Proactively schedules practices based on upcoming activations. "Saturn is lord of the year and in Taurus. This Saturday is the Saturn hour — I've scheduled a 15-minute Warming Saturn Practice. Also: Mercury is active on Wednesday, your daimon day — I've blocked 25 minutes for Mercurial Study."

**4. Life Review Agent** — Weekly/monthly summaries with pattern recognition. "This week: Jupiter was the strongest signal (H7, partnerships). You had 3 meetings about collaborative projects. Saturn (year lord) was also active — your notes mention 'foundation-building.' The convergence suggests productive tension between expansion and structure."

### Phase 3: Jungian Integration

**Archetype Engine**
Each planet maps to a Jungian archetype. When the planet is activated, the archetype is "constellated" in your psyche:

| Planet | Jungian Archetype | Shadow Expression | Integration Practice |
|---|---|---|---|
| Sun | Self, Hero | Grandiosity, vanity | Authentic self-expression |
| Moon | Great Mother, Anima | Martyrdom, clinginess | Nurturing boundaries |
| Mercury | Trickster, Messenger | Deceit, scattering | Conscious communication |
| Venus | Anima, Lover | Codependence, vanity | Loving discernment |
| Mars | Warrior, Hero-shadow | Aggression, rage | Disciplined assertion |
| Jupiter | Wise Old Man, King | Dogmatism, excess | Generative wisdom |
| Saturn | Senex, Father | Rigidity, melancholy | Mature structure |

When the engine detects Mars active, the **Shadow Agent** can ask: "Mars is constellated. In Jungian terms, the Warrior archetype is active. Its shadow is raw aggression. Its integration is disciplined assertion. Looking at your diary from the last Mars-active period (3 days ago), you wrote 'snapped at a colleague.' Today, with Mars active again but also in trine with Jupiter, the integration path is open — assertive but generous."

**Shadow Self Mapping**
Over time, build a personal shadow map: for each planet, track what comes up in your diary when that planet is active.

```
My personal shadow map:
  Mars active → "I get irritable, especially about [topic]"
  Saturn active → "I feel blocked, especially around [area]"
  Mercury active → "I overthink, especially about [subject]"
```

The system can then say: "Mars is active today. Your pattern shows this often manifests as irritability about work boundaries. Awareness is the first integration — consider a cooling Mars practice instead of reacting."

### Phase 4: Proactive Intelligence

**Ritual Scheduling**
The Practice Scheduler Agent watches upcoming planetary activations and proactively schedules practices. It doesn't wait for you to ask — it tells you:

```
┌──────────────────────────────────────────────┐
│  UPCOMING THIS WEEK                           │
│                                               │
│  Wednesday (Mercury day, daimon active):     │
│  09:00 — Mercurial Study Practice (25 min)  │
│                                               │
│  Saturday (Saturn hour, year lord activity): │
│  08:30 — Warming Saturn Practice (15 min)    │
│                                               │
│  Sunday (Sun day, Jupiter in trine):         │
│  Morning — Solar Attunement + Jupiter        │
│            Wisdom Practice (combined)         │
└──────────────────────────────────────────────┘
```

**Convergence Alerts**
When 4+ interpreters agree on a theme and the engine shows high confidence, push a notification:

> "🔥 High convergence: Mars + Saturn active. 4 of 5 interpreters point to 'disciplined force under pressure.' This is a rare alignment — the last similar activation was [date]. Recommended: Martial Courage Operation. Avoid: impulsive decisions."

**The "Why Now" Engine**
Given any practice or question, the system can explain the astrological reasoning bidirectionally:

- User: "Why is the Warming Saturn Practice recommended today?"
- Engine: "Saturn is your year lord (profection H4). It's in Taurus in H8, retrograde. The al-Khayyāt rule says 'inheritance, long mourning.' Ficino says 'warm Saturn with solar counterbalances.' The convergence across timing (year lord), condition (retrograde), and interpretation (3 systems mention Saturn) makes this the highest-signal practice today."

- User: "I want to do the Mercurial Knowledge Operation. When is a good time?"
- Engine: "Mercury is your daimon. The best time is Wednesday (Mercury day) during a Mercury hour, when Mercury is not combust the Sun. In your chart, Mercury is in Taurus — the Moon in Gemini would reinforce the operation. Next window: Wednesday July 16, 09:00-10:00 local time. Current confidence: 85%."

**Music of the Spheres Generator**
From the daily activation, generate a procedural composition. Each planet has a voice (bass/tenor/alto/soprano per Kepler), a mode (per Ficino), and a dynamic level (per activation confidence). The angular distances between activated planets determine intervals. The result is a unique daily piece of music — your chart's "song" for that day.

### Phase 5: The Skinner Integration

Once Skinner's tables are fully parsed, EVERY practice recommendation can cite its source lineage:

> "The Warming Saturn Practice draws on:
> - **Agrippa** (I.23): 'Saturn governs myrrh, cypress, lead, black.'
> - **Picatrix** (II.3): 'The image of Saturn is an old man on a throne.'
> - **Ficino** (De Vita III): 'Warm Saturn with solar counterbalances.'
> - **Skinner** (Table H6): 'Saturn in fall in Aries, in detriment in Leo.'
> 
> All four sources agree: Saturn requires warming, structuring, patient engagement."

This turns every practice into a **living citation web** — the user can trace any recommendation back through 2,000 years of tradition.

### Phase 6: The Soul Timeline

A visual interface where you scroll through your life and see it mapped against the engine's output:

```
2026 ──────────────────────────────────────────────
  Jan  Feb  Mar  Apr  May  Jun  Jul  Aug  Sep  Oct  Nov  Dec
  [H4 Saturn year — foundations, family, home]
  
  [Mercury daimon active] ████████░░░░░░░░░░░░░░ 43%
  [Saturn year lord]      ████████████████████████ 100%
  [Mixed mode]            ████████████████████████ 100%

2025 ──────────────────────────────────────────────
  [H3 Mercury year — communication, writing]
  
  [Mercury daimon active] ████████████████████████ 72%
  [Writing output]        ████████████████░░░░░░░░  84K words
  [Average mood]          ██████████████░░░░░░░░  3.8/5

2024 ──────────────────────────────────────────────
  [H2 Venus year — resources, values, self-worth]
  ...
```

You can click any point and see: what the engine said, what you wrote in your diary, what practices were recommended, what the convergence was. Your entire life, astrologically mapped, with your own annotations.

### Summary: What This Becomes

| Feature | What it does | Why it matters |
|---|---|---|
| **Daily Snapshot** | Logs engine + mood + notes | Builds personal dataset |
| **Life Chapter Map** | Retroactive yearly analysis | See your life's rhythm |
| **Daimonic Agent** | Proactive insight from all data streams | A soul partner that knows you |
| **Shadow Agent** | Maps personal shadow patterns | Integration through awareness |
| **Practice Scheduler** | Proactively schedules practices | You never miss an alignment |
| **Convergence Alerts** | Notifies on rare high-conviction alignments | Catch the big moments |
| **Bidirectional Engine** | Explains "why this practice" or "when to do X" | Full transparency |
| **Music Generator** | Daily procedural composition | Your chart's song |
| **Skinner Citation Web** | Every practice traces back 2000 years | Depth and lineage |
| **Soul Timeline** | Scroll through your astrologically-mapped life | Perspective and meaning |

## The Faithful LLM Renderer

The snapshot exists. The LLM renders it. Nothing more.

```
DailySnapshot → LLM with strict prompt → rendered prose → validated → stored
                     ↑
        "You may ONLY reference entities in this snapshot."
        "You may NOT add planets, houses, aspects, or confidence levels."
```

The prompt is deterministic. The validation is deterministic. The only non-deterministic part is the prose quality, which is why validation exists.

**Post-hoc validation** checks:
1. Every planet mentioned in the output exists in the snapshot
2. Every house mentioned exists in the snapshot
3. No new timing systems are introduced
4. Confidence levels match the snapshot

If validation fails, the output is rejected and a fallback template is used. This guarantees that even if the LLM hallucinates, the user never sees it.

---

## Structured Psychological Layer (High Signal Only, No Slop)

The rule: every claim about the user's psyche must trace to ONE of:
1. A **structured assessment** the user completed (Bardon questionnaire, Jungian typology test)
2. An **actual diary entry** they wrote (not inferred)
3. A **verifiable behavioral pattern** from the daily snapshot data (e.g., "when Mercury active, you write 3x more")

Anything that can't be sourced to one of these is excluded. No "you seem to be struggling with..." based on planetary position alone.

### Franz Bardon IIH Elemental Analysis (Bardon, Initiation Into Hermetics, Step 1-3)

Bardon's system is uniquely suited for this because it's structured, testable, and has clear progression:

**Step 1 — Elemental Soul Mirror**: The user completes Bardon's 4-element self-assessment:
- **Air**: "Do you enjoy abstract discussion? How long can you concentrate? Do you jump between ideas?"
- **Fire**: "Are you quick to anger? Do you procrastinate? Do you have strong will or scattered impulses?"
- **Water**: "Do you feel others' emotions strongly? Are you indecisive? Do you absorb atmosphere?"
- **Earth**: "Are you orderly? Do you resist change? Are you grounded or lost in thought?"

Each question maps to a dominance ratio: Air 30%, Fire 45%, Water 15%, Earth 10% — not as a personality label, but as a measure of which elements need work per Bardon's step-by-step method.

**Step 2 — Elemental Deconstruction**: The LLM (acting as Bardon guide) helps the user identify where each element is over/under-developed:
- Excess Air → scattered thinking, inability to ground
- Deficient Fire → lack of will, procrastination
- Etc.

**Step 3 — Elemental Workflow**: For each element, assign daily practices from Bardon:
- Air → concentration exercises (staring at a dot, counting breaths)
- Fire → will-training (cold showers, fasting)
- Water → emotional observation (noting feelings without reacting)
- Earth → physical discipline (posture, exercise)

**How this connects to the engine**: The elemental analysis runs independently but the engine's daily activation can flag which practices are most relevant:
> "Mercury active today — Air element is constellated. Your Bardon assessment shows Air dominance at 30%. Today is good for concentration exercises, but be aware of scattering tendency."

### Jungian Typology (Not MBTI — actual Jungian functions)

Based on Jung's Psychological Types, the onboarding assesses:
- **Dominant function**: Thinking / Feeling / Sensation / Intuition
- **Auxiliary function**: the second-most developed
- **Attitude**: Extraversion / Introversion
- **Shadow function**: the least developed (inferior function)

**How this connects to the engine**:

| Planet | Jungian Function | Shadow | Engine Flag |
|---|---|---|---|---|
| Sun | Thinking (conscious will) | Feeling | Sun active → conscious decisions constellated |
| Moon | Feeling (emotional attunement) | Thinking | Moon active → emotional processing needed |
| Mercury | Intuition (perception) | Sensation | Mercury active → intuitive insight available |
| Venus | Feeling (relating) | Thinking | Venus active → relational awareness |
| Mars | Sensation (action) | Intuition | Mars active → impulse before reflection |
| Jupiter | Intuition (meaning) | Sensation | Jupiter active → pattern recognition |
| Saturn | Thinking (structure) | Feeling | Saturn active → logical framework building |

See also `content/astrology/mbti.md` for a detailed MBTI-Astrology mapping theorem, including:
- 12 Rulers mapping Houses/Signs to planetary bodies
- Quadrant theory linking cardinal points to psychological orientation
- Retrospect Arcs mapped to MBTI cognitive functions (Ni, Ti, Te, Ne)
- INFJ case study with detailed function analysis
- Preliminary INFJ statistics showing significant patterns (Nodes, Mars, Moon placements)

The rule: when a planet is active, its associated function is constellated in the user's psyche. The shadow is the opposite function. A conscious practice is to engage the shadow function deliberately.

> Example: Mars active today. Mars constellates Sensation (action, impulse). Your shadow function (per assessment) is Intuition. The practice: before acting, pause and ask "what else might be true here?" — engaging Intuition to balance Sensation.

### Structured Therapeutic Onboarding

The onboarding is NOT a free-form "tell me about your mother" conversation. It's a fixed questionnaire with defined outputs:

```
Phase 1: Life Context
  - What are 3 significant life events from each profection year? (structured timeline)
  - What recurring patterns do you notice? (user-identified)
  
Phase 2: Goals (Short + Long Term)
  - Short-term (3 months): specific, measurable
  - Long-term (3 years): directional, meaningful
  - The goals become guiding principles for the LangGraph agents
  
Phase 3: Bardon Elemental Mirror (fixed questionnaire, scored deterministically)
  - 20 questions across 4 elements
  - Output: elemental ratio, recommended practices
  
Phase 4: Jungian Function Stack (fixed questionnaire, scored deterministically)
  - 20 questions assessing cognitive functions
  - Output: dominant/auxiliary/tertiary/inferior functions
```

All outputs are stored in D1 alongside the DailySnapshots. The LangGraph agents read them.

### Goals System (Guiding Principles for Agents)

Stored as structured data alongside the user's daily snapshots:

```ts
interface UserGoals {
  short_term: Array<{
    goal: string;
    category: "creative" | "career" | "health" | "relationship" | "spiritual";
    started: string; // date
    deadline?: string;
    progress: 0-100;
    check_in_frequency: "daily" | "weekly" | "monthly";
  }>;
  long_term: Array<{
    goal: string;
    category: string;
    started: string;
    target_year?: number;
    why: string; // the deeper motivation
  }>;
}
```

The agents use goals to contextualize daily recommendations:

> "Jupiter is active in H7 (partnerships) today. Your long-term goal is 'build collaborative projects.' Your short-term goal has a weekly check-in due today. Jupiter+H7 is the best alignment this month for this goal. Recommended action: reach out to one collaborator."

Without goals, the engine can only say "Jupiter is active." With goals, it says "Jupiter is active AND this supports your specific objective."

### Integration with Site Content

**Tree of Life section**: Each sephirah maps to planetary archetypes. The engine's daily activation recommends which sephirah to meditate on:
- Saturn active → Binah (Understanding, structure)
- Jupiter active → Chesed (Mercy, expansion)
- etc.

**Essay recommendations**: The site has 60+ structured essays on theurgy, Ficino, Corbin, etc. When the engine detects convergence on a theme, it recommends relevant essays:
> "Mercury (daimon) active + Saturn (year lord) active. Essays that address this tension: 'Ficino on the Melancholic Scholar' (mercury-saturn dynamic), 'Theurgy and the Active Intellect' (Mercury as messenger)."

**Auto-generated essays**: For persistent stuck patterns (e.g., "every Saturn year I experience X"), the system could draft a personalized essay that the user can edit and publish — contributing to the global essay layer over time.

**Atlas Phase Integration**: The 17 existing phases (Dashboard Diagnosis, etc.) become a graduated pathway. The engine assesses where the user is based on diary patterns + activation history and recommends the next phase:

```
Phase 1 (Dashboard Diagnosis): You are here. Your Saturn year has surfaced foundation patterns.
  Recommended practice: Warming Saturn Practice for 1 week.
  Move to Phase 2 when: diary entries shift from "identifying" to "working with" patterns.
```

### What Makes This High Signal (Not Slop)

| Feature | Risk | Mitigation |
|---|---|---|
| Bardon elemental analysis | Made-up ratios | Use Bardon's actual 20-question mirror from IIH Step 1. Score deterministically. |
| Jungian functions | MBTI horoscope | Use actual Jungian function assessment (not MBTI). Map to planets by known archetypes. |
| Goals system | Forgotten goals | Check-in frequency stored in goals. Agent prompts at scheduled intervals. |
| Essay recommendations | Wrong essays | Match by planet + theme tags only. User confirms useful/not useful. |
| Atlas phases | Forced progression | User self-selects phase. Engine only recommends, never assigns. |
| Shadow work | Therapy without license | No diagnostic language. Only: "this pattern appears in your diary." User draws their own conclusions. |

The golden rule: **every psychological claim is sourced to a user-completed assessment, a written diary entry, or a verifiable data pattern.** If it can't be one of these three, it doesn't get said.

### External Validation — Capricorn Astrology Research

The [Capricorn Astrology Research](https://astrologyresearch.co.uk/does-this-prove-astrology/) project (Cockell) is the largest independent statistical validation dataset for astrological correlations. Key studies directly relevant to the engine:

- **Venus and Mars in 20,000+ Public Figures** — Extraordinary statistical scores for planetary positions
- **Planet in Signs Effect** — 76 distributions proving non-random planet-sign correlations
- **Moon's Nodes and Fame** — North Node clustering in 20,000+ public figures
- **Mars-Jupiter/Saturn Index** — Comparative frequencies across all research groups
- **Jupiter and Royal Families** — 229 royal family members, Jupiter aspects
- **Victims Research** — 1,518 cases (murder, AIDS, accidents, cot death)
- **Sun Sign Career Advice** — 23,000+ subjects, Sun sign distributions by profession
- **Sexuality Research** — 1,787 gay men, Mars and Venus positions
- **Artists vs Scientists** — 783 vs 737 charts compared
- **Writers** — 2,048 charts, Mercury correlations

This provides external statistical grounding for the engine's confidence calibration. See `content/astrology/mbti.md` for the complementary MBTI-astrology mapping theorem.

## The Full Pipeline (As Built)

```
Birth Data + Time
  → caelus (ephemeris computation)
    → Engine (16 deterministic layers)
      → DailySnapshot (maximally granular, stored in D1)
        → LLM Faithful Renderer (deterministic prompt + post-hoc validation)
          → Rendered reading (stored alongside snapshot)
            → Daimonic Chat (user can converse about the snapshot)
```

Every layer before the LLM is deterministic. The LLM is only a renderer of pre-computed truth. The `handover.md` document contains everything needed to maintain this separation.

The system stops being a "daily horoscope" and becomes a **living partner in your self-understanding** — not predicting your future, but illuminating your present with the accumulated wisdom of 2,000 years of tradition, grounded in YOUR personal data.

---

## Cloudflare Stack Implementation Architecture

### Core: Per-User Durable Object as the "Soul"

Each user gets their own Durable Object — the daimonic agent itself. A DO uniquely combines compute + storage + WebSocket at the edge. Perfect for a persistent per-user agent.

```
User DO (daimonic "soul"):
├── State: profile, last 30 snapshots, agent memories
├── SQLite storage: strongly consistent, fast local
├── WebSocket: real-time chat (no polling, full duplex)
├── Alarms: cron triggers for daily processing
└── LangGraph JS/TS agent runs inside the DO
```

### Cloudflare Product Map

| Product | What it gives | Use case |
|---|---|---|
| **Durable Objects** | Per-user stateful Worker + SQLite + WebSocket | The daimonic agent itself. Holds user state, processes daily snapshots, maintains real-time chat. One DO per user. |
| **Workers AI** | 50+ open-source models on serverless GPUs | Embed diary entries locally, small inference (classification, summarization) |
| **AI Gateway** | Proxy + cache + rate limit + fallback for ANY LLM | All LLM calls routed here. Cache identical prompts. Fallback if provider down. Cost tracking per user. |
| **Vectorize** | Vector database on the edge | Semantic search: similar diary entries, mood patterns, essay recommendations |
| **Queues** | Guaranteed async message delivery | Offload background work: diary analysis, memory consolidation, weekly reports. Non-blocking. |
| **R2** | S3-compatible storage, zero egress | Source PDFs, generated audio (202MB mp3s), essay images, book covers |
| **Images** | Edge image optimization + resize + CDN | Auto-optimize book covers, art thumbnails, social cards. Serve from R2. |
| **Stream** | Serverless video encoding/delivery | Video versions of audio essays (animated text + planetary diagrams), live-streamed rituals |
| **Browser Run** | Headless Chrome on the edge | Auto-generate social card images (essay title + author as PNG), PDF export of monthly personal reports |
| **KV** | Global key-value, low latency | Cache computed DailySnapshots, pre-rendered content, session tokens |

### Data Flow: Daily Daimonic Processing

```
Cron Trigger 6am
  → Worker builds DailySnapshot (deterministic caelus → D1)
  → DO Alarm fires (wakes user's Durable Object)
    → DO reads snapshot from D1
    → DO reads user memories from own SQLite
    → Workers AI: embed diary entries from yesterday
    → Vectorize: semantic search for similar past states
    → AI Gateway → Anthropic: generate daimon insight
    → DO writes insight + stores in memory
    → If user has WebSocket open: push notification

When user opens daimonic chat:
  → Browser connects to DO WebSocket (full duplex)
  → DO runs LangGraph sub-orchestrator:
    ├── Daimon Agent subgraph
    ├── Shadow Agent subgraph (if diary exists)
    ├── Practice Scheduler subgraph
    └── Life Review subgraph (weekly/monthly)
  → Each subgraph reads from DO memory + D1 + Vectorize
  → LLM calls through AI Gateway (cached, monitored, fallback)
  → Streaming response through WebSocket

Background (Queues, non-blocking):
  User writes diary entry → Queue message
    → Shadow Agent processes async
    → Updates shadow map in DO memory
    → If pattern detected: flags for next chat session

Weekly:
  Queue → Life Review Agent
    → Aggregates 7 daily snapshots
    → Computes mood/energy averages
    → Generates weekly summary
    → Stores in DO memory
```

### LangGraph on Durable Objects

LangGraph JS/TS SDK runs natively on Workers. The agent graph maps to:

```
ParentGraph (inside DO):
  state: { userId, date, dailySnapshot, agentMemories, chatHistory }

  Node[build_context]: load D1, DO memory, Vectorize results → state
  Node[daimon_agent]: LLM via AI Gateway → daimon_insight
  Node[shadow_agent]: if diary exists → shadow_insight
  Node[schedule_practices]: check upcoming activations → practice_plan
  Node[assemble_response]: merge all insights → final message
  Edge[conditional]: if no diary → skip shadow_agent
```

**Persistence**: LangGraph checkpointer backed by DO SQLite storage (or D1). Thread = user session.

**Interrupts**: `interrupt()` for human-in-the-loop — "Approve this practice?" before scheduling. Resume via WebSocket message.

**Memory** (LangGraph Store backed by DO SQLite):
```
(user_id, "profile")         → goals, elemental ratios, Jungian functions
(user_id, "shadow_map")      → planet → observed diary patterns
(user_id, "agent_prompts")   → self-improving agent instructions
(user_id, "snapshots")       → last 30 daily snapshots
```

### Why This Beats a Separate Server

| Need | Cloudflare | Traditional approach |
|---|---|---|
| Per-user state | DO (built-in, edge-native) | PostgreSQL + Redis + WebSocket server |
| LLM proxy | AI Gateway (caching, fallback, monitoring) | Custom proxy + cost tracking infra |
| Async processing | Queues (no infra to manage) | Celery + Redis + worker pool |
| Vector search | Vectorize (edge-native) | Pinecone/Weaviate (separate infra) |
| Content storage | R2 + Images (zero egress fees) | S3 + CloudFront |
| Video | Stream (serverless encode + CDN) | Encoding pipeline + CDN |
| Browser automation | Browser Run (edge) | Dedicated browser farm |
| Agent orchestration | LangGraph JS/TS on Workers | LangGraph Python on separate server |

### Key Rule (from handover.md)

The **engine stays deterministic**. The DO agents are pure consumers of the DailySnapshot. The snapshot is computed by the existing deterministic caelus pipeline (Workers → D1). Agents only read it, never produce it. "Packet before prose."

### Reference

Full detailed breakdown in `cloudflare-stack-research.md`.

---

## Video Essay Pipeline

The storyboard-driven video system converts audio essays into cinematic YouTube videos with a feedback loop from retention analytics. See full spec in `videos.md`.

**Core flow**: Essay → rhythm analysis → DeepSeek storyboard JSON → asset resolution → video render → YouTube → retention mapped to frames → frame-level performance data → creative insight.

**Key design**: Two-level tagging (global concepts for the essay, local concepts per frame) + standardized rhetorical roles (hook, quote, contrast, synthesis, etc.) + mythos filter for consistent visual identity.

**Analytics loop**: YouTube retention points → `elapsedVideoTimeRatio × duration` → frame lookup → frame scoring (retention_delta, dropoff_rate) → aggregate across videos → "which visual motifs retain best?"

**Infrastructure**: D1 for storyboards/frames/assets/renders/performance data, R2 for video files, Workers for the compilation pipeline, Queues for async rendering.

---

## Supporting Files Reference

| File | Purpose |
|---|---|
| `videos.md` | Full video essay pipeline spec — DeepSeek storyboard schema, mythos filter, asset resolution, YouTube retention mapping, DB tables, algorithm |
| `cloudflare-stack-research.md` | Cloudflare product map — Durable Objects, Workers AI, AI Gateway, Queues, Vectorize, R2, Browser Run, Stream, Images — with data flow diagrams |
| `agents/README.md` | LangGraph + Cloudflare Workers architecture — core graph structure, DO pattern, subgraph pattern, tool registry, persistence, streaming, Ralph Loop files. Shows how every goal maps to implementation |
| `formattingrequirements.md` | Essay JSON format spec, TTS requirements, audio generation pipeline, blueprint conversion rules |
| `CLAUDE5.md` | Terse rules for AI agents writing essays — required fields, body block kinds, TTS readiness rules |
| `essay-automation-loop.md` | 7-phase Ralph Loop spec for the write-and-publish workflow — classify, extract, convert, glossary, art, audio, deploy. Each phase has validation gates and retry logic |
