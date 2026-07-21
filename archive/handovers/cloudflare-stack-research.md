# Cloudflare Stack Research — Daimonic Agent Architecture

## Core Architecture: Per-User Durable Object as the "Soul"

Each user gets their own Durable Object — the daimonic agent itself. A DO is a persistent, stateful Worker with SQLite storage and WebSocket support. Perfect for a per-user agent that lives across sessions.

```
User DO (daimonic "soul"):
├── State: user profile, last 30 daily snapshots, agent memories
├── SQLite: strongly consistent, fast local storage
├── WebSocket: real-time chat (no polling, full duplex)
├── Alarms: cron triggers for daily processing
└── LangGraph agent runs inside the DO
```

## Cloudflare Product Map

### Compute & State
| Product | What it gives | Use case |
|---|---|---|
| **Durable Objects** | Persistent stateful Worker per user with SQLite + WebSocket | The daimonic agent itself. Holds user state, processes daily snapshots, maintains real-time chat connection. Each user gets their own DO. |
| **Workers** | Stateless compute at edge | API routes, SSR, image resizing proxies, cron triggers that wake DOs |
| **Cron Triggers** | Scheduled Workers | Daily 6am: build DailySnapshot, wake the DO, generate daimon insight |

### AI & Intelligence
| Product | What it gives | Use case |
|---|---|---|
| **Workers AI** | 50+ open-source models on serverless GPUs | Run embeddings locally, small inference (classification, summarization) |
| **AI Gateway** | Proxy + cache + rate limit + fallback for ANY LLM | All LLM calls routed through this. Cache identical prompts. Fallback if OpenAI/Anthropic down. Cost tracking per user. |
| **Vectorize** | Vector database on the edge | Semantic search: similar diary entries, mood patterns, essay recommendations |
| **Queues** | Guaranteed async message delivery | Offload background work: diary analysis, memory consolidation, weekly reports. Non-blocking. |

### Storage & Media
| Product | What it gives | Use case |
|---|---|---|
| **D1** | Serverless SQLite (relational) | User profiles, daily snapshots, journal entries, spellbook — already using this |
| **R2** | S3-compatible object storage, zero egress | Source PDFs, generated audio (202MB of mp3s), essay images, book covers |
| **KV** | Global key-value, low latency | Cache computed DailySnapshots, pre-rendered content, session tokens |
| **Images** | Edge image optimization + resize + CDN | Auto-optimize book covers, art thumbnails, social cards. Serve from R2 or origin. |
| **Stream** | Serverless video encoding/delivery | Video versions of audio essays (animated text + planetary diagrams), live-streamed rituals |

### Browser Automation
| Product | What it gives | Use case |
|---|---|---|
| **Browser Run** | Headless Chrome on the edge | Auto-generate social card images (essay title + author as PNG), PDF export of monthly personal reports, screenshot birth charts |

## Data Flow: Daily Daimonic Processing

```
Cron Trigger 6am
  → Worker builds DailySnapshot (deterministic caelus engine → D1)
  → DO Alarm fires (wakes the user's Durable Object)
    → DO reads snapshot from D1
    → DO reads user memories from own SQLite
    → Workers AI: embed diary entries from yesterday
    → Vectorize: semantic search for similar past states
    → AI Gateway → Anthropic: generate daimon insight
    → DO writes insight + stores in memory
    → If user has WebSocket open: push notification
    → Done

When user opens daimonic chat:
  → Browser connects to DO WebSocket
  → DO runs LangGraph sub-orchestrator:
    ├── Daimon Agent subgraph
    ├── Shadow Agent subgraph (if diary exists)
    ├── Practice Scheduler subgraph
    └── Life Review subgraph (weekly/monthly)
  → Each subgraph reads from DO memory + D1
  → LLM calls through AI Gateway (cached, monitored)
  → Streaming response through WebSocket

Background (Queues, non-blocking):
  User writes diary entry → Queue message
    → Shadow Agent processes (async)
    → Updates shadow map in DO memory
    → If pattern detected: flags for next chat session

Weekly:
  Queue → Life Review Agent
    → Aggregates 7 daily snapshots
    → Computes mood/energy averages
    → Generates weekly summary
    → Stores in DO memory
    → Triggers notification if user opted in
```

## LangGraph on Cloudflare

LangGraph JS/TS SDK runs natively on Workers. The agent state graph maps to:

```
ParentGraph (runs inside DO):
  state: { userId, date, dailySnapshot, agentMemories, chatHistory }

  Node[build_context]: loads D1, DO memory, Vectorize results → state
  Node[daimon_agent]: LLM call via AI Gateway → daimon_insight
  Node[shadow_agent]: if diary exists → shadow_insight
  Node[schedule_practices]: check upcoming activations → practice_plan
  Node[assemble_response]: merge all insights → final message
  Edge[conditional]: if no diary → skip shadow_agent
```

**Persistence**: LangGraph checkpointer backs onto DO SQLite storage (or D1). Thread = user session.

**Interrupts**: `interrupt()` for human-in-the-loop — "Approve this practice?" before scheduling. Resume via WebSocket.

**Memory**: LangGraph Store namespaces backed by DO SQLite:
```
(user_id, "profile")         → goals, elemental ratios, Jungian functions
(user_id, "shadow_map")      → planet → observed patterns in diary
(user_id, "agent_prompts")   → self-improving agent instructions
(user_id, "snapshots")       → last 30 daily snapshots
```

## Key Architectural Rule (from handover.md)

The **engine stays deterministic**. The DO agents are pure consumers of the DailySnapshot. The snapshot is computed by the existing deterministic caelus pipeline (Workers → D1). Agents only read it, never produce it. This preserves "packet before prose."

## Why This Beats a Separate Server

| Need | Cloudflare | Traditional |
|---|---|---|
| Per-user state | DO (built-in, edge-native) | PostgreSQL + Redis + WebSocket server |
| LLM proxy | AI Gateway (caching, fallback, monitoring) | Custom proxy + cost tracking |
| Async processing | Queues (no infra) | Celery + Redis + worker pool |
| Vector search | Vectorize (edge-native) | Pinecone/Weaviate (separate infra) |
| Content storage + serving | R2 + Images (zero egress) | S3 + CloudFront |
| Video | Stream (serverless encode + CDN) | Encoding pipeline + CDN |
| Browser automation | Browser Run (edge) | Dedicated browser farm |
| Agent orchestration | LangGraph JS/TS on Workers | LangGraph Python on separate server |
| Tracing | LangSmith (cloud or self-hosted) | Prometheus + Grafana |
