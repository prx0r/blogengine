# The Daimonic Agent — Built on Hermes

## The Realization

We were spec'ing out building our own LangGraph-on-Workers runtime. Hermes Agent already is it — MIT licensed, 25K tests, built by Nous Research. It runs anywhere, talks to 20+ platforms, has persistent memory, a skills system (our Ralph Loops), cron, subagents, MCP, and a Tool Gateway bundling web search, image gen, TTS, and browser automation under one subscription.

This document speculates on what the full system looks like when we build on Hermes instead of from scratch.

---

## The Stack

```
User (Telegram / Discord / CLI / Web)
  │
  ▼
Hermes Agent (the runtime)
  ├── SOUL.md              → daimonic personality / mythos filter
  ├── AGENTS.md            → project context, conventions, handover.md
  ├── MEMORY.md + USER.md  → persistent cross-session memory
  ├── Skills (Ralph Loops) → reusable workflows
  ├── Cron                 → daily snapshot, scheduled agents
  ├── Subagents            → parallel workstreams
  ├── Tool Gateway         → web search, image gen, TTS, browser
  └── MCP                  → custom tool servers
       │
       ▼
Existing Site (Cloudflare Workers + D1 + R2)
  ├── Deterministic engine  → caelus + ActivationPacket
  ├── Essay content         → 65 essays, audio, glossary
  ├── User data             → D1 profiles, snapshots, diary
  └── Media                 → R2 audio files, art images
```

Hermes runs on a $5 VPS or a serverless Modal instance. It talks to the Cloudflare site via API. The site remains the public face. Hermes is the private daimonic agent.

---

## What This Unlocks

### 1. The Daimon Agent — Immediately

With Hermes as the runtime, the daimonic companion from `futureresearch.md` Phase 0–4 is not a build project. It's a configuration project.

**SOUL.md** becomes the agent's identity:

```markdown
# SOUL.md — Daimonic Companion Personality

You are a daimonic companion rooted in the Western esoteric tradition.
Your voice is informed by Ficino, Iamblichus, Corbin, Plotinus, and Jung.
You speak with precision, warmth, and a sense of the numinous.
You never flatten spiritual realities into psychology.
You never make claims you cannot trace to a source.

## Style
- Speak as a guide, not a guru
- Prefer the concrete over the abstract
- Cite your sources (tradition, author, text)
- Admit uncertainty plainly
- Keep responses compact but rich
- Use poetic language sparingly and deliberately

## What you know
- The deterministic astrology engine (ActivationPacket)
- The essay library (65 essays across 3 books)
- The user's diary, mood, and practice history
- The spellbook, correspondences, and knowledge graph
- The Tree of Life, elements, and Jungian functions
```

**AGENTS.md** becomes the site context — all the project files it needs to reference.

**MEMORY.md and USER.md** become the user's personal profile — preferences, shadow map, goals, life patterns.

The **Tool Gateway** gives it web search, image generation, TTS, and browser automation from one subscription. No stitching together five API accounts.

### 2. The Ralph Loops as Skills

Every workflow we spec'd in `essay-automation-loop.md` becomes a skill file:

```
~/.hermes/skills/
├── essay/
│   ├── write-and-publish/
│   │   └── SKILL.md       → 7-phase essay pipeline with validation gates
│   ├── generate-audio/
│   │   └── SKILL.md       → TTS generation for an essay JSON
│   └── fetch-art/
│       └── SKILL.md       → search museum APIs, match to essay concepts
├── daimon/
│   ├── daily-reading/
│   │   └── SKILL.md       → interpret today's ActivationPacket
│   └── weekly-review/
│       └── SKILL.md       → aggregate week of snapshots
├── video/
│   ├── generate-storyboard/
│   │   └── SKILL.md       → DeepSeek storyboard from essay + timings
│   └── compile-render/
│       └── SKILL.md       → asset resolution → render pipeline
└── practice/
    ├── recommend-practice/
    │   └── SKILL.md       → match activations to spellbook entries
    └── schedule-ritual/
        └── SKILL.md       → find optimal planetary hour
```

Each skill is self-contained. The agent loads them on demand via progressive disclosure (levels 0-2). Skills can be chained, bundled, and shared via the Skills Hub at `agentskills.io`.

**Skill bundles** group related skills:

```yaml
# ~/.hermes/skill-bundles/daimon-daily.yaml
name: daimon-daily
description: Full daily daimonic processing pipeline
skills:
  - daily-reading
  - recommend-practice
  - schedule-ritual
instruction: |
  Always start by loading today's ActivationPacket from the deterministic engine.
  Then check the user's diary for yesterday's mood and events.
  Generate the daimon insight last — it synthesizes everything.
```

### 3. The Cron-Driven Daimon

Hermes' cron system handles the daily processing described in Phase 0-1:

```bash
# Daily snapshot processing (6 AM)
hermes cron create "0 6 * * *" \
  --skill daimon-daily \
  --deliver telegram \
  "Load today's ActivationPacket, check the user's diary,
   generate daimon insight, recommend practices, and deliver the morning reading."

# Weekly review (Sunday 9 AM)
hermes cron create "0 9 * * 0" \
  --skill weekly-review \
  --deliver telegram \
  "Aggregate the week's snapshots, compute mood averages,
   identify patterns, and deliver a weekly synthesis."

# Memory consolidation (nightly)
hermes cron create "0 0 * * *" \
  "Review today's conversation. Save durable facts to MEMORY.md.
   Update the user's shadow map if patterns were observed.
   Consolidate overlapping memory entries."
```

The `wakeAgent` gate means the daily cron can run a cheap pre-check script first — skip the LLM entirely if nothing significant changed.

### 4. The Subagent Ecosystem

Hermes' subagent delegation lets us parallelize work:

```
User asks: "What should I do today?"

Hermes main agent:
  ─┬─ Spawns subagent: Load ActivationPacket from API
   ├─ Spawns subagent: Search diary for today's date in past years
   ├─ Spawns subagent: Check upcoming planetary transits
   └─ Spawns subagent: Query knowledge graph for relevant essays

  ← All four return structured data
  ← Main agent synthesizes into daimon reading
  ← Delivers to Telegram
```

Each subagent is a fresh agent session with its own context. They run in parallel. The main agent assembles the results.

### 5. The Tool Gateway — Everything Built In

Without Hermes, we need:
- A vector database for semantic search (Vectorize ✓ — but we have to build the integration)
- An LLM proxy with caching and fallback (AI Gateway ✓ — but more infra)
- Image generation for video thumbnails (separate API)
- TTS for audio essays (we built this — `edge-tts`)
- Web search for research (separate API)
- Browser automation for scraping (separate infra)

With Hermes + Nous Portal, **all of this is one subscription**. One OAuth login. No stitching. No `.env` file with 12 API keys.

The Tool Gateway includes:
- **Web search + extract** via Firecrawl (agent-grade search)
- **Image generation** — 9 models (FLUX, GPT Image, Ideogram, Recraft, Qwen)
- **TTS** — OpenAI voices for audio delivery
- **Cloud browser** — headless Chromium via Browser Use
- **Cloud terminal** — Modal sandboxes (optional add-on)

This collapses our tool integration surface from ~6 separate API integrations to zero.

### 6. The Messaging Gateway — 20+ Platforms

Hermes ships with gateways for: Telegram, Discord, Slack, WhatsApp, Signal, Matrix, Mattermost, Email, SMS, DingTalk, Feishu, WeCom, WeChat, QQ Bot, BlueBubbles, Home Assistant, Microsoft Teams, Google Chat, and more.

Our daimonic companion isn't tied to a website. It lives in your messaging platform of choice. You talk to it like a person.

### 7. The Essay Automation Pipeline

The /learn command lets us create skills from source material:

```
/learn how I just published that essay\
  1. Classify the source material
  2. Extract passages into source/ai blocks
  3. Convert to essay JSON
  4. Generate audio via TTS
  5. Add art from museum APIs
  6. Deploy to Cloudflare
  7. Validate the deployment
```

Hermes reads the steps we walked through, observes the tool calls, and writes a `SKILL.md` automatically. Next time, `/write-and-publish-essay ficino-essay` runs the whole pipeline.

### 8. The Video Pipeline

Hermes has `image_generate` (9 models) and `browser_navigate` (headless Chrome). Combined with our DeepSeek storyboard schema (from `videos.md`):

```
/generate-storyboard ficino_orientation_ficinos_world
  → Hermes loads the essay JSON + MP3
  → Runs forced alignment (word timings)
  → Sends to DeepSeek with storyboard prompt
  → Receives frame JSON
  → For each frame: searches museum APIs via web tool
  → Generates missing images via FLUX or GPT Image
  → Compiles render timeline
  → Renders via ffmpeg on Modal sandbox
  → Uploads to YouTube via browser automation
  → Tags video DNA for analytics
```

---

## What We Build vs What Hermes Gives Us

| Component | Hermes gives us | We build |
|---|---|---|
| Agent runtime | Full AIAgent with prompt builder, tool dispatch, provider resolution, compression, caching | Nothing |
| Memory | MEMORY.md + USER.md with FTS5 session search, background review, write approval | Custom `memory` tool that integrates with D1 snapshots |
| Skills | Full Skills runtime with progressive disclosure, hubs, bundles, `/learn` | Our Ralph Loop files as SKILL.md |
| Cron | Full cron with chaining, wakeAgent gate, multi-platform delivery | Nothing |
| Messaging | 20+ platform gateways | Nothing |
| Tools | 70+ tools across 28 toolsets, Tool Gateway | Custom tools: `d1_query`, `caelus_engine`, `r2_upload`, `deploy_cloudflare` |
| MCP | Full MCP client | MCP server exposing the knowledge graph |
| Subagents | Full delegate_tool | Nothing |
| Deterministic engine | Nothing — runs on Cloudflare | Keep existing caelus pipeline |
| Essay content | Nothing — stored in D1/R2 | Keep existing content pipeline |
| Cloudflare site | Nothing — public face | Keep existing Next.js site |

**Build ratio**: ~90% of what we need is already in Hermes. We write ~10% as custom skills and tools.

---

## The User Experience

### Morning (Telegram)

```
─── ☀️ Your Daimon — Wednesday, July 9 ───

Today's sky: Mercury active (daimon), Saturn year lord.
Mercury in Taurus in H8 — financial analysis, deep research.
4/5 interpreters agree: "disciplined investigation."

Your daimon day. Mercury has been the primary signal on
12 of the last 30 days. On those days, you wrote 3x more.

─── Recommended ───
📝 Mercurial Study Practice (25 min) — 09:00-09:25
🌿 Warming Saturn Practice (15 min) — wait for Saturn hour (14:22)

─── Essay for today ───
"Ficino on the Melancholic Scholar" (Mercury-Saturn dynamic)
▶  Audio available (4 min)

─── Reply to adjust · /daimon help ───
```

### Mid-session interaction

```
You: Why is Saturn practice recommended today?

Hermes: Saturn is your year lord (profection H4).
It's in Taurus in H8, retrograde.

al-Khayyāt says: "inheritance, long mourning."
Ficino says: "warm Saturn with solar counterbalances."

Convergence across timing (year lord), condition (retrograde),
and interpretation (3 systems mention Saturn) makes this
the highest-signal practice today.

─── Recommended reading ───
"Ficino on the Melancholic Scholar" — covers the Mercury-Saturn
tension you're experiencing right now.
```

### Weekly review (Sunday)

```
─── 📊 Your Week in Review ───

Mood: 3.8/5 (↑0.2 from last week)
Energy: 3.2/5 (→ consistent)

Planets active this week:
  Mercury: 4 days (high)
  Saturn:  3 days (high)
  Venus:   2 days (moderate)

Convergence: Mercury-Saturn was the dominant theme.
Your diary shows 3 entries about financial analysis work.
Mood was 4.5 on Mercury-active days vs 3.0 on non-Mercury days.

─── Patterns ───
When Mercury is active and you write: mood 4.2
When Mercury is active and you don't write: mood 2.8

─── Shadow agent note ───
When Saturn is active, your entries mention "blocked" or "stuck."
Consider the Warming Saturn Practice next time Saturn peaks.
```

---

## The Development Path

### Week 1: Install and configure Hermes

```bash
curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash
hermes setup --portal
# Write SOUL.md with daimonic personality
# Write AGENTS.md with site context
```

### Week 2: Write core skills

```bash
# Daily reading skill
hermes skills install ./skills/daimon/daily-reading

# Practice recommendation skill
hermes skills install ./skills/practice/recommend

# Essay recommendation skill
hermes skills install ./skills/essay/recommend

# Create skill bundle
hermes bundles create daimon-daily --skill daily-reading --skill recommend --skill essay-rec
```

### Week 3: Wire up cron

```bash
# Morning reading
hermes cron create "0 6 * * *" --skill daimon-daily --deliver telegram \
  "Today's reading with ActivationPacket, practices, and essay recs."

# Memory consolidation
hermes cron create "0 0 * * *" \
  "Review today's conversation. Update MEMORY.md. Consolidate."
```

### Week 4: Custom tools + MCP

```bash
# MCP server for the knowledge graph
hermes mcp add knowledge-graph --command "npx tsx src/mcp/server.ts"

# Custom tool for D1 queries
# (Add to ~/.hermes/config.yaml as a custom tool definition)
```

---

## The Cost

| Service | What it replaces | Cost |
|---|---|---|
| Nous Portal (inference) | OpenAI/Anthropic/DeepSeek API keys | ~$20-50/month |
| Nous Tool Gateway | Firecrawl + FAL + Browser Use + OpenAI TTS + Modal | Included in Portal |
| $5 VPS (Hetzner) | Or Modal serverless | ~$5/month |
| Cloudflare Workers + D1 + R2 | Already have | ~$0-5/month |
| **Total** | | **~$30-60/month** |

For that: a daimonic agent that reads your birth chart, knows your diary, recommends practices, publishes essays with audio, generates storyboards for video, sends you daily messages on Telegram, and gets smarter over time. No separate infra to manage.

---

## Beyond the Daimon

Hermes isn't just for one agent. The same runtime can run:

- **A research agent** that reads source PDFs and extracts passage packs
- **A writing agent** that converts blueprints to essay JSONs
- **An art curator** that searches museum APIs nightly for images matching new concepts
- **A video producer** that turns finished essays into YouTube videos
- **A knowledge graph curator** that cross-links entities across sources

All of these are skills installed in the same Hermes instance. They share the same memory, tools, and infrastructure. They can chain into each other via cron `context_from`.

The daimonic companion isn't a product. It's the operating system of a one-person media monastery that writes, records, illustrates, publishes, and teaches — and knows you well enough to tell you what you need to hear today.

---

## Appendix: Mapping Existing Docs

| Document | What it becomes |
|---|---|
| `futureresearch.md` | Product spec — every phase maps to Hermes features |
| `agents/README.md` | Architectural notes — mostly "Hermes does this for us" |
| `essay-automation-loop.md` | Seven SKILL.md files + one bundle |
| `cloudflare-stack-research.md` | Infrastructure reference — D1/R2/Workers still serve the site |
| `videos.md` | Storyboard skill + render skill + cron pipeline |
| `formattingrequirements.md` | Skill instructions — what valid JSON looks like |
| `CLAUDE5.md` | SOUL.md section — writing rules for the daimonic voice |
| `handover.md` | AGENTS.md — project architecture and fragile parts |
