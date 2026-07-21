# Agent System — LangGraph on Cloudflare Workers

## How This Architecture Achieves All Goals

### 1. Daimonic Companion (futureresearch.md Phase 0–4)

| Goal | How it's met |
|---|---|
| **DailySnapshot** recorded per user | Cron → Worker builds snapshot via caelus → D1 → DO alarm fires |
| **Personal Archive** (mood, energy, diary) | User writes diary → stored in DO SQLite → Vectorize indexes for search |
| **Daimon Agent** (proactive insight) | `subgraphs/daimon/` reads snapshot + memories + Vectorize results → LLM via AI Gateway → insight |
| **Shadow Agent** (pattern detection) | `subgraphs/shadow/` scans diary for planetary patterns → builds shadow map in Store |
| **Practice Scheduler** | `subgraphs/scheduler/` checks upcoming activations → schedules via DO Alarm |
| **Life Review** (weekly/monthly) | `subgraphs/life-review/` aggregates 7/30 snapshots → summary → Store |
| **LangGraph multi-agent system** | ParentGraph routes to subgraphs, each is a self-contained LangGraph subgraph |
| **Human-in-the-loop** | `interrupt()` pauses graph for user approval (practices, diary prompts) |
| **Memory** | LangGraph Store backed by DO SQLite: profile, shadow_map, agent_prompts, snapshots |
| **Faithful LLM Renderer** | AI Gateway proxies all LLM calls. Post-hoc validation rejects hallucinated entities |
| **Bidirectional "Why Now" engine** | User asks "why this practice?" → agent traces back through activation chain → explains |

### 2. Cloudflare Stack Integration (futureresearch.md + cloudflare-stack-research.md)

| Service | Role |
|---|---|
| **Durable Objects** | Per-user agent host. Holds state, SQLite, WebSocket, alarms. The DO IS the daimonic "soul" |
| **Workers** | Stateless entry points, API routes, cron triggers |
| **D1** | Relational data: user profiles, daily snapshots, spellbook, essays, frames, performance |
| **R2** | Object storage: audio files (202MB), source PDFs, generated videos, images |
| **Vectorize** | Semantic search: diary entries, mood patterns, essay recommendations |
| **AI Gateway** | LLM proxy with caching, rate limiting, fallback, cost tracking per user |
| **Queues** | Background processing: diary analysis, memory consolidation, weekly reports |
| **KV** | Cache: pre-computed snapshots, session tokens |
| **Images** | Edge-optimized book covers, art thumbnails, social cards |
| **Stream** | Video essay delivery (future) |
| **Browser Run** | Auto-generate social card images, PDF exports (future) |

### 3. Video Essay Pipeline (videos.md)

| Phase | Component |
|---|---|
| Essay script + MP3 | Existing content pipeline with audio |
| Forced alignment | Tool in the agent's tool registry |
| DeepSeek storyboard | `ralph/generate-storyboard.ts` — sends script + timings → structured JSON |
| Asset resolution | Tool queries glossary art (D1) → public-domain archives → fallback animation |
| Render timeline | Compiler maps frames → assets → motion presets → transitions → overlays |
| Render + upload | Queues the render job, stores in R2, uploads to YouTube |
| Retention → frames | Cron ingests YouTube analytics → maps `elapsedVideoTimeRatio × duration` → frame |
| Frame scoring | `frame_performance` table → aggregate across videos → insight report |
| Feedback loop | Insight report re-shapes future storyboard prompts |

### 4. Essay Automation Loop (essay-automation-loop.md)

| Phase | Implementation |
|---|---|
| Classify source | Tool: `classify_source_type()` → thesis vs condensed |
| Extract passages | Tool: `extract_passages()` → passage packs |
| Convert to JSON | Tool: `convert_blueprint_to_json()` → writes essay JSON |
| Glossary integration | Tool: `resolve_concepts()` → creates/links concept entries |
| Art association | Tool: `match_art()` → adds art_id blocks to body |
| Audio generation | Tool: `generate_audio()` → `npm run generate:audio -- <id>` |
| Regenerate build data | Tool: `regenerate_graph_data()` → runs generate-graph-json.mjs |
| Build & deploy | Tool: `deploy_cloudflare()` → cf:build + cf:deploy |
| Validate deployment | Tool: `validate_deployment()` → checks essay loads, audio plays |

Each phase loops on failure (max 3 retries) via the Ralph Loop pattern.

### 5. Ralph Loop Pattern

Each workflow in `agents/ralph/` is a self-contained tool-callable sequence:

```typescript
// agents/ralph/write-and-publish-essay.ts
export const writeAndPublishEssay: RalphLoop = {
  name: "write_and_publish_essay",
  description: "Full pipeline from source material → published audio essay",
  
  phases: [
    { name: "classify",       validate: validateSource,      retry: 3 },
    { name: "extract",        validate: validatePassageCount, retry: 3 },
    { name: "convert",        validate: validateJson,        retry: 3 },
    { name: "glossary",       validate: validateConcepts,    retry: 3 },
    { name: "art",            validate: validateArt,         retry: 1, optional: true },
    { name: "audio",          validate: validateAudio,       retry: 3 },
    { name: "regenerate",     validate: validateGenerated,   retry: 3 },
    { name: "deploy",         validate: validateDeployment,  retry: 2 },
  ],

  async execute(phase, state, tools) { /* ... */ },
  async validate(phase, state, tools): Promise<ValidationResult> { /* ... */ },
};
```

The Ralph Loop ensures each phase completes before the next starts. If validation fails, it loops back to the failed phase with feedback. Max retries prevent infinite loops.

### 6. What Stays the Same

No matter what agents or workflows we add:

1. **DO per user** — always the entry point for user-specific work
2. **ParentGraph** — always orchestrates subgraphs, doesn't need to change
3. **Tool registry** — always the same pattern for adding new tools
4. **State type** — `AgentState` is extensible but the base fields are fixed
5. **Persistence** — checkpointer + Store backed by D1/DO SQLite
6. **Streaming** — WebSocket → SSE always the same
7. **Ralph Loop pattern** — each workflow follows the same phase/validate/retry structure
8. **File layout** — `core/` never changes, `subgraphs/` grows, `ralph/` grows

## Core Architecture

```
Worker (stateless entry point)
  → Durable Object (per-user stateful agent host)
    → LangGraph (agent orchestration runtime)
      → Subgraphs (specialized agents)
        → Tools (function calls)
          → D1 / R2 / Vectorize / AI Gateway / Queues
```

### Why Durable Objects

Each user gets a DO that:
- Holds their persistent state (profile, memories, conversation history)
- Has SQLite storage for fast local reads
- Exposes a WebSocket for real-time chat
- Runs LangGraph agent graphs directly
- Has Alarms for cron-triggered processing

The DO is the "agent host" — it lives as long as the user exists. LangGraph manages the orchestration inside it.

## Core Graph Structure

```
┌─────────────────────────────────────────────────────────┐
│                     ParentGraph                          │
│  state: { userId, date, input, context, memories,       │
│           agent_outputs, errors, thread_id }              │
│                                                          │
│  always:                                                 │
│    build_context → route → [subgraph nodes] → assemble   │
│                                                          │
│  conditional:                                            │
│    if memory_stale → consolidate_memory                  │
│    if error → retry_or_fallback                          │
└─────────────────────────────────────────────────────────┘
```

### State Type

```typescript
interface AgentState {
  // Identity
  userId: string;
  threadId: string;

  // Input
  input: UserInput;
  date: string;

  // Context loaded at start
  context: {
    profile: UserProfile | null;
    dailySnapshot: DailySnapshot | null;
    recentMemories: Memory[];
    toolResults: ToolResult[];
  };

  // Agent outputs (populated by subgraphs)
  agentOutputs: Record<string, AgentOutput>;

  // Control
  errors: string[];
  retryCount: number;
  done: boolean;
}
```

### Base Node Pattern

Every node follows the same pattern:

```typescript
async function nodeName(
  state: AgentState,
  config: RuntimeConfig,
  tools: ToolContext
): Promise<Partial<AgentState>> {
  // 1. Validate preconditions
  if (!state.context.something) return { errors: ["missing context"] };

  // 2. Do work (LLM call, tool call, computation)
  const result = await doWork(state, tools);

  // 3. Return state update
  return { agentOutputs: { ...state.agentOutputs, nodeName: result } };
}
```

### Tool Context

```typescript
interface ToolContext {
  d1: D1Database;
  r2: R2Bucket;
  vectorize: VectorizeIndex;
  ai: Fetcher; // AI Gateway
  queue: Queue;
  store: LangGraphStore; // backed by DO SQLite or D1
}
```

## Subgraph Pattern

Each specialized agent is a subgraph:

```typescript
const daimonAgent = createSubgraph({
  name: "daimon_agent",
  nodes: [
    node_read_snapshot,
    node_query_memories,
    node_call_llm,
    node_format_insight,
  ],
  edges: [
    edge("__start__", "read_snapshot"),
    edge("read_snapshot", "query_memories"),
    edge("query_memories", "call_llm"),
    edge("call_llm", "format_insight"),
    edge("format_insight", "__end__"),
  ],
});
```

Parent graph calls it:

```typescript
async function run_daimon_agent(state: AgentState, config, tools) {
  const result = await daimonAgent.invoke({
    userId: state.userId,
    snapshot: state.context.dailySnapshot,
    memories: state.context.recentMemories,
  });
  return {
    agentOutputs: { ...state.agentOutputs, daimon: result },
  };
}
```

## Tool Pattern

Tools are stateless functions that take typed inputs and return typed outputs:

```typescript
// Definition
const getEssayRecommendation = tool({
  name: "get_essay_recommendation",
  description: "Find essays matching given concepts",
  inputSchema: { concepts: z.array(z.string()) },
  handler: async ({ concepts }, { d1 }) => {
    const essays = await d1.prepare(
      "SELECT id, title FROM glossary_essays WHERE concepts LIKE ?"
    ).bind(`%${concepts[0]}%`).all();
    return essays.results;
  },
});

// Usage in a node
const tools = { getEssayRecommendation, queryDiaryPatterns, ... };
const result = await tools.getEssayRecommendation.handler(
  { concepts: ["daimon"] },
  toolContext
);
```

## Persistence

LangGraph checkpointer backs onto D1:

```typescript
const checkpointer = new D1Checkpointer({
  d1: env.ATLAS_DB,
  namespace: (config) => `user:${config.configurable.userId}:thread:${config.configurable.threadId}`,
});
```

LangGraph Store backs onto DO SQLite (fast per-user) or D1 (cross-user):

```typescript
const store = new D1Store({
  d1: env.ATLAS_DB,
  prefix: "agent_memory",
});
```

## Streaming

All agent responses stream to the client via DO WebSocket:

```
Client WebSocket → DO → LangGraph.stream_events() → SSE → Client
```

The DO holds the WebSocket connection. LangGraph streams token-by-token through it.

## File Structure

```
agents/
├── README.md              ← this file
├── core/
│   ├── types.ts           ← AgentState, ToolContext, base types
│   ├── graph.ts           ← ParentGraph builder
│   ├── nodes/
│   │   ├── build_context.ts
│   │   ├── assemble.ts
│   │   └── consolidate_memory.ts
│   ├── tools/
│   │   ├── registry.ts    ← tool registry + validation
│   │   ├── d1.ts          ← D1 query tools
│   │   ├── vectorize.ts   ← semantic search tools
│   │   └── ai_gateway.ts  ← LLM call tools
│   └── persistence/
│       ├── checkpointer.ts
│       └── store.ts
├── subgraphs/
│   ├── daimon/            ← Daimon Agent
│   │   ├── graph.ts
│   │   ├── nodes/
│   │   └── prompts/
│   ├── shadow/            ← Shadow Agent
│   │   ├── graph.ts
│   │   ├── nodes/
│   │   └── prompts/
│   ├── scheduler/         ← Practice Scheduler
│   │   ├── graph.ts
│   │   ├── nodes/
│   │   └── prompts/
│   └── life-review/       ← Life Review Agent
│       ├── graph.ts
│       ├── nodes/
│       └── prompts/
├── ralph/                 ← Ralph Loop files (tool-callable workflows)
│   ├── write-and-publish-essay.ts
│   └── ...more loops
├── durables/
│   ├── user-agent.ts      ← User Durable Object (the "soul")
│   └── agent-host.ts      ← Base DO class
└── wrangler/
    ├── index.ts           ← Worker entry point
    └── routes.ts          ← HTTP/WebSocket route handlers
```

## Worker Entry Point

```typescript
// workers/agent-worker/index.ts
export default {
  async fetch(req, env) {
    const url = new URL(req.url);

    // Route to DO for user-specific requests
    if (url.pathname.startsWith("/api/agent/")) {
      const userId = authenticate(req);
      const doId = env.USER_AGENT.idFromName(userId);
      const stub = env.USER_AGENT.get(doId);
      return stub.fetch(req);
    }

    // Route to stateless endpoints
    if (url.pathname === "/api/cron/daily") {
      return handleDailyCron(req, env);
    }
  }
} satisfies ExportedHandler<Env>;
```

## User Durable Object (The "Soul")

```typescript
// agents/durables/user-agent.ts
export class UserAgent extends DurableObject {
  private graph: CompiledGraph;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    // Build the LangGraph once, cache it
    this.graph = buildParentGraph(env);
  }

  async fetch(req: Request) {
    const url = new URL(req.url);

    // WebSocket upgrade for real-time chat
    if (req.headers.get("Upgrade") === "websocket") {
      return this.handleWebSocket(req);
    }

    // HTTP endpoints
    switch (url.pathname) {
      case "/api/agent/chat":
        return this.handleChat(req);
      case "/api/agent/today":
        return this.handleToday();
      case "/api/agent/state":
        return this.handleGetState();
    }
  }

  async alarm() {
    // Daily processing triggered by cron
    const result = await this.graph.invoke({
      userId: this.ctx.id.name,
      date: today(),
      input: { type: "daily_cron" },
      agentOutputs: {},
      errors: [],
      retryCount: 0,
      done: false,
    });
    // Store result, notify user if WebSocket open
  }
}
```

## Adding a New Agent

1. Create `agents/subgraphs/<name>/graph.ts` with nodes + edges
2. Register it in the ParentGraph
3. Add its tools to the tool registry
4. Done — the DO handles persistence, streaming, and lifecycle

This is the structure that stays the same no matter what we add.
