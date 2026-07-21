# Memory Block Pattern — Native Implementation

**Note: We do not use the Letta cloud service.** The memory block pattern (persona, human, system blocks always in context) is implemented natively in `/api/chat/agent` — a streaming DeepSeek endpoint that composes persona/human/system blocks from the user's D1 profile, without any external agent platform.

The original Letta integration ideas are preserved below for reference, but the current implementation is fully self-contained on Cloudflare Workers + D1.

---

## Core Concept: Memory Blocks

The agent has **memory blocks** — structured sections that are always in the LLM context window. This is the killer feature:

```
agent memory (always in context)
├── persona  ("who the AI is" — the Socratic guide persona)
├── human    ("who the user is" — birth chart, preferences, practice history)
└── custom blocks (critical rules, Kuzu schema, always loaded every turn)
```

No retrieval, no search, no latency. The birth chart, preferences, and practice summary are **already in the prompt** every turn.

---

## Architecture: One Letta Agent Per User

Each user gets their own Letta agent, created when they first save their profile. Agents run on Letta's **Constellation** cloud. Our Next.js API routes on Cloudflare Workers call the SDK as a client.

### Agent Creation

```typescript
import { LettaAgentClient } from "@letta-ai/letta-agent-sdk";

const client = new LettaAgentClient({
  backend: "cloud",
  apiKey: process.env.LETTA_API_KEY,
});

const agentId = await client.createAgent({
  model: "opencode-go/deepseek-v4-flash",

  // Persona block — who the AI is
  persona: `You are a Socratic guide using the Re-Rendering Atlas.
You help users explore metaphysical assumptions through 17 phases of transformation.
You cite phases by number and name. You suggest practices. You flag risks.
You have access to a knowledge graph (Kuzu) for structured queries.`,

  // Human block — who the user is (filled from profile)
  human: `
Birth Chart:
- Sun: Capricorn (10th house)
- Moon: Cancer (4th house)
- Rising: Pisces
- Dominant element: Water
- Phase affinities: Dashboard Diagnosis, Daimon/Guidance, Nonordinary Rendering

Preferences:
- Response style: concise
- Always cite references: true
- Birth chart influence: 60%

Practice History:
- 12 LBRP sessions
- 8 meditation sessions
- Current streak: 5 days
- Top phases engaged: Ritual Re-Rendering (8), Body-Energy Interface (5)
  `,
});
```

Tools are created separately and attached to the agent (see below).

### Conversing — New Conversation

```typescript
await using session = client.createSession(agentId);
await session.send("What is a daimon?");
for await (const message of session.stream()) {
  if (message.type === "assistant") {
    // message.content already has birth chart context, preferences, practice history
    console.log(message.content);
  }
  if (message.type === "tool_call") {
    console.log("tool:", message.toolName, message.toolInput);
  }
  if (message.type === "reasoning") {
    console.log("thinking:", message.content);
  }
  if (message.type === "result" && !message.success) {
    console.error(message.errorDetail);
  }
}
```

### Resume Existing Conversation

```typescript
const conversationId = "conv-abc123";
await using session = client.resumeSession(conversationId);
await session.send("Continue from where we left off.");
for await (const message of session.stream()) {
  if (message.type === "assistant") console.log(message.content);
}
```

### Resume Main Conversation

```typescript
await using session = client.resumeSession(agentId);
```

---

## Idea 1: Memory Block Inheritance from D1 Profile

When a user updates their birth chart or preferences, the Letta agent's `human` memory block should update automatically.

**How:** When `PATCH /api/profile` is called, also update the agent's memory block:

```typescript
await client.agents.blocks.update(agentId, "human", {
  value: formatHumanBlock(profile),
});
```

The agent's understanding of the user is always current — no stale data in context.

---

## Idea 2: Dreaming — Automatic Memory Consolidation

Letta's "dreaming" feature runs background subagents that review conversations and extract durable lessons into memory.

**For the Atlas, a dream subagent could:**

- Review conversations about Phase 13 (Daimon) and extract what the user specifically resonated with
- Notice that the user keeps asking about ritual topics → promote Ritual Re-Rendering to the `system/` block (always in context)
- Detect that the user consistently rates scholarly responses higher → update preferences
- Cross-reference journal entries with chat questions to find unasked connections: "You've been journaling about fire elements and asking about ritual — these connect through Phase 12."

**Trigger:** After every N chat messages, or on a cron schedule.

---

## Idea 3: Subagents for Specialized Analysis

Letta has 7 built-in subagent types and supports custom subagents. Each is a focused agent spawned for a specific task, keeping the main agent's context clean.

**Custom subagents for the Atlas:**

| Subagent | Purpose | What it does |
|---|---|---|
| `phase-matcher` | Given a user query, find the most relevant Atlas phases | Searches phase cache, returns phase numbers + relevance scores. Main agent only sees the result, not the search process. |
| `risk-analyzer` | Analyze a claim for category errors | Runs classifyClaim logic, returns risks + correctives. Runs in background — doesn't block response. |
| `source-finder` | Find relevant source cards for a topic | Searches source cards, returns formatted citations. |
| `journal-connector` | Cross-reference query with practice history | Searches mem0/journal entries for relevant patterns. Returns: "You've explored this before in your journal entry from 3 days ago." |
| `astrology-advisor` | Given birth chart + query, suggest astrological factors | Runs only when birth chart influence > 0 and query has astrological relevance. |

**Custom subagent definition (`.letta/agents/phase-matcher.md`):**

```markdown
---
name: phase-matcher
description: Search the 17 Atlas phases for relevance to a user query
tools: Grep, Read
model: auto-fast
memoryBlocks: none
---

You are a phase matching specialist. Given a user query, search the Atlas phase data
and return the top 1-3 most relevant phases with:
- Phase number and name
- Relevance score (0-100)
- Key reason for relevance (one sentence)

Only return phases that are genuinely relevant. If no phase matches closely, return empty.
```

---

## Idea 4: Skills for Reusable Behaviors

Letta implements the open [Agent Skills](https://agentskills.io) standard. Skills are portable instruction sets that agents can load when relevant.

**Skills to build for the Atlas:**

| Skill | What it teaches the agent |
|---|---|
| `atlas-socratic-method` | How to use Socratic questioning with the 17-phase framework. "When user makes a claim, first find the phase, then surface the assumption, then offer the replacement model." |
| `atlas-source-citation` | Format for citing sources: "Phase 12 (Ritual Re-Rendering) — cf. Iamblichus, On the Mysteries" |
| `atlas-astro-integration` | How to weigh birth chart factors: "Sun sign → phase affinity, Moon sign → emotional approach to practice, Rising → presentation of self in inquiry" |
| `atlas-practice-recommendation` | How to format practice suggestions: "Based on your engagement with Phase 12, try: [practice]. Success marker: [marker]. Watch for: [failure mode]." |
| `atlas-response-calibration` | How to adjust response based on user feedback history: "User rates scholarly depth 4.5/5 for ritual topics — expand there. User rates conciseness high for definitions — keep those tight." |

Skills travel with the agent across devices and sessions (stored in MemFS).

---

## Idea 5: Channels — Meet Users Where They Are

Letta supports Slack, Telegram, Discord, WhatsApp, and Signal as channels. Each user's agent can be reached through their preferred platform.

**Channel integration ideas:**

- **Slack:** User messages their Atlas agent in DM. Agent responds with phase info, practice suggestions. Agent can post to a private channel for daily practice reminders (via Schedules/crons).
- **Telegram:** User sends a voice message about their latest meditation. Agent transcribes, analyzes against phases, stores to memory.
- **Discord:** Community server where multiple users' agents can collaborate. "Phase 12 discussion: @user1's agent, what practices has your user found effective?"

**How it works:** User pairs their chat platform with their agent via a one-time code. Messages flow through the channel adapter → agent queue → agent → response via `MessageChannel` tool.

---

## Idea 6: Schedules — Proactive Practice Reminders

Letta supports cron-based schedules. The agent can proactively message the user.

| Schedule | What the agent does |
|---|---|
| Daily 8am | "Good morning. Your current streak is 5 days. Today's suggested practice: Phase 11 (Body-Energy Interface) — 10 minute body scan. Your Cancer Moon responds well to embodied practice." |
| Weekly Sunday | "Weekly reflection: You engaged most with Phase 12 this week (8 sessions). Your Saturn in Capricorn is driving disciplined ritual work. Consider: is there room for Phase 10 (Imaginal) to balance structure with creativity?" |
| New Moon | "New Moon in your 4th house — good time for Phase 1 (Dashboard Diagnosis). Review your practice log from the past month." |
| Phase milestone | "You've completed 20 sessions in Phase 12. Time to consider Phase 13 (Daimon/Guidance). Your Pisces rising may find this phase natural." |

---

## Idea 7: Goal Mode — Persistent Autonomous Work

Letta's Goal mode (`/goal`) lets the agent work persistently on a long-running objective. The agent continues working across sessions, saving progress, and coming back to you when it needs input.

**Goal ideas for the Atlas:**

- **Dream Journal Analysis:** "Analyze my last 30 dream journal entries for recurring symbols. Map each symbol to an Atlas phase. Identify patterns I might be missing." Agent works across hours/days, reading entries, cross-referencing phases, building a personal symbol dictionary.
- **Practice Plan Design:** "Design a 4-week practice plan that progresses through Phases 1-5, customized to my birth chart." Agent iterates, asks clarifying questions, refines the plan.
- **Personal Mythology Mapping:** "Map my life experiences onto the 17-phase path. Where am I? Where have I been? What's the next phase?" Agent reviews journal entries, chat history, practice logs — builds a personal phase timeline.

---

## Idea 8: Chat API Route — Cloudflare → Letta Constellation

The Letta Agent SDK uses `backend: "cloud"` to connect to Letta's Constellation. The SDK manages WebSocket connections internally.

```
Browser/Client
  → POST /api/chat/letta (Cloudflare Worker)
    → @letta-ai/letta-agent-sdk (backend: "cloud")
      → Letta Constellation API
        → Agent with memory blocks + Kuzu graph tools
```

**In the Next.js API route:**

```typescript
// POST /api/chat/letta
import { LettaAgentClient } from "@letta-ai/letta-agent-sdk";

export async function POST(req: Request) {
  const { claim, agentId } = await req.json();
  const client = new LettaAgentClient({
    backend: "cloud",
    apiKey: process.env.LETTA_API_KEY,
    sandbox: {
      ttlMinutes: 5,
      terminateOnClose: true,
    },
  });

  const session = client.createSession(agentId, {
    cwd: "/workspace/atlas",
  });

  await session.send(claim);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      for await (const msg of session.stream()) {
        if (msg.type === "assistant") {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ token: msg.content })}\n\n`)
          );
        }
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream" },
  });
}
```

`createSession()` starts a new conversation. For resume, use `resumeSession(conversationId)`.

---

## Integration Path: Current Stack → Letta

### Phase 1: Parallel (current + Letta)

Keep the current streaming endpoint as the "fast path" for simple wiki lookups. Add a Letta agent as the "deep path" for users who want persistent memory. The chat page offers both: quick lookup (no agent) or deep conversation (with agent).

### Phase 2: Letta Primary, Current as Fallback

For users with a saved profile, use Letta as the primary chat backend. The fast path (current streaming endpoint) becomes the fallback for anonymous users or simple definition queries.

### Phase 3: Full Letta Migration

All users get Letta agents. The current streaming endpoint is deprecated. Subagents handle specialized analysis (phase matching, risk analysis, source finding). Schedules handle proactive engagement. Channels handle multi-platform access.

---

---

## AgentFile (.af) — Portable Agent Packaging

AgentFile (`.af`) is an open standard file format for serializing an entire agent — memory, tools, prompts, config — into one portable file. This is the feature most people miss: **you're not just building an agent, you're building something you can snapshot, fork, and version-control like a git repo.**

### What .af Includes

| Component | What it captures |
|---|---|
| **Memory blocks** | `persona`, `human`, `system/` contents — the agent's entire identity |
| **Tool definitions** | Source code + JSON schema for every tool |
| **Message history** | Complete chat history with context window markers |
| **Model config** | Model name, context window limit, embedding model |
| **System prompt** | Initial instructions defining behavior |
| **Tool rules** | Sequencing and constraint rules |
| **Environment variables** | Config values for tool execution |

### Why .af Matters for the Atlas

**Checkpoint an agent at any stage:**

```bash
# Export a user's agent after 3 months of conversations
curl -X GET "https://app.letta.com/v1/agents/{AGENT_ID}/export" \
  -H "Authorization: Bearer $LETTA_API_KEY" \
  -o user-agent-july-2026.af
```

The `.af` file captures everything: the birth chart in the `human` block, the learned preferences in `system/`, the conversation history, the tool configurations. It's a complete snapshot.

**Fork an agent to experiment:**

```bash
# Import the snapshot as a new agent
curl -X POST "https://app.letta.com/v1/agents/import" \
  -H "Authorization: Bearer $LETTA_API_KEY" \
  -F "file=@user-agent-july-2026.af"

# Now you have two agents:
#   - The original (unchanged, still serving the user)
#   - The fork (experimental, trying different personae or tools)
```

This lets you A/B test agent behaviours on real user data without disrupting them.

**Version control agent evolution:**

```
agents/
├── atlas-user-abc-v1.af      # Birth chart + default preferences
├── atlas-user-abc-v2.af      # After 1 month of feedback tuning
├── atlas-user-abc-v3.af      # After dream subagent consolidation
└── atlas-user-abc-v4.af      # After adding journal-connector subagent
```

Each version is a git-commit-able file. You can diff, revert, branch.

**Portable across environments:**

```typescript
// Export from production
const schema = await client.agents.exportFile(agentId);
fs.writeFileSync("prod-agent.af", JSON.stringify(schema));

// Import to staging
const stagingClient = new Letta({ apiKey: STAGING_KEY });
await stagingClient.agents.importFile({
  file: await toFile(fs.readFileSync("prod-agent.af"), "agent.af"),
});
```

Move agents between Letta Cloud, self-hosted Docker, and local development without rebuilding.

**Reproducible evaluations (Letta Evals):**

```yaml
# suite.yaml
target:
  kind: agent
  agent_file: ./agents/atlas-baseline-v3.af
  base_url: https://api.letta.com
```

Each eval test creates a fresh agent from the `.af` file. No shared state, no cross-test contamination. Commit the `.af` alongside your test suites.

### Practical Use for the Atlas

| Use Case | How |
|---|---|
| **User checkpointing** | Export `.af` monthly — roll back if feedback tuning goes wrong |
| **A/B testing personae** | Fork a user's agent: `A` = scholarly persona, `B` = concise persona. Compare ratings. |
| **Sharing agent configs** | Ship `atlas-socratic-guide-v1.af` as the baseline persona — new users start from a known good configuration |
| **Disaster recovery** | User reports agent acting strangely — revert to last known good `.af` snapshot |
| **Community sharing** | Share interesting agent evolutions: "Here's my agent after 6 months of dream journal analysis — `.af` attached" |

### Links

- AgentFile GitHub: https://github.com/letta-ai/agent-file
- .af schema spec: https://github.com/letta-ai/letta/blob/main/letta/schemas/agent_file.py
- Import: `POST /v1/agents/import`, Export: `GET /v1/agents/{id}/export`

---

## Kuzu Graph DB — Knowledge Graph Custom Tools

Letta doesn't ship with a knowledge graph. Its own memory (core + archival/recall) runs on Postgres/SQLite with vector search. If you want actual graph structure — birth chart relationships, entity links across diary entries, temporal queries — you bolt it on as **custom tools** that Letta calls when it needs graph context. That's normal — Letta's whole design is "give the agent tools."

Kuzu is an embedded graph DB (Cypher-compatible, no server process, single file on disk like SQLite for graphs). Documented in `mbuild.md` § Graph Storage: Kuzu (Embedded), Not Neo4j — the full Cypher schema, import pipeline, and example queries live there.

### Architecture

```
Atlas Phase YAML  ──→  scripts/import-graph.mjs  ──→  D1 graph_nodes + graph_edges  (atlas graph)
                                                                        │
Journal entries (runtime) ──→ D1 graph write ──→ personal_mappings + graph_edges  (per-user)
                                                                        │
Birth charts (runtime)  ──→ D1 store ──→ users.profile JSON  (per-user)
                                                                        │
Chat agent learns a fact ──→ write_to_graph tool ──→ D1 graph_edges  (per-user)
```

YAML files stay as human-editable source for phases, risks, correctives, source cards, traditions. A one-time import script (`scripts/import-graph.mjs`) loads YAML → D1 graph tables on change. Everything the agent writes at runtime (journal entries, extracted facts, chat memories, agent-discovered relationships) goes straight into D1 graph tables — not back into YAML.

Cypher compatibility means migrating to real Neo4j at scale is trivial. No lock-in.

### Setup: Create + Register Tools

Create tools via the Letta Tools API, then attach them to agents:

```typescript
import { LettaAgentClient } from "@letta-ai/letta-agent-sdk";

const client = new LettaAgentClient({
  backend: "cloud",
  apiKey: process.env.LETTA_API_KEY,
});

// Tool 1: Read — Cypher query
const queryTool = await client.tools.create({
  name: "query_knowledge_graph",
  description: "Run a Cypher query against the Atlas knowledge graph. Returns matching nodes and relationships.",
  parameters: {
    type: "object",
    properties: {
      cypher: {
        type: "string",
        description: "Cypher query to execute (read-only). e.g. MATCH (p:Phase)-->(r:Risk) RETURN p.label, r.label",
      },
    },
    required: ["cypher"],
  },
});

// Tool 2: Write — triple insert
const writeTool = await client.tools.create({
  name: "write_to_graph",
  description: "Store a durable fact as a triple in the knowledge graph. Call this when the agent learns something permanent about the user or their practice.",
  parameters: {
    type: "object",
    properties: {
      subject: { type: "string", description: "Entity ID or label" },
      predicate: { type: "string", description: "Relationship type" },
      object: { type: "string", description: "Entity ID or label" },
      metadata: { type: "object", description: "Optional properties" },
    },
    required: ["subject", "predicate", "object"],
  },
});

// Attach to an agent
await client.agents.tools.attach(agentId, queryTool.id);
await client.agents.tools.attach(agentId, writeTool.id);
```

### When Letta Calls the Graph

| Trigger | Tool | Example |
|---|---|---|
| User asks about chart patterns | `query_knowledge_graph` | `MATCH (p:Person {id})-->(pl:Planet)-->(s:Sign {element:'Water'}) RETURN pl.name` |
| Agent discovers a user preference | `write_to_graph` | `("user-abc", "prefers", "lbrp-over-middle-pillar")` |
| Agent needs phase context | `query_knowledge_graph` | `MATCH (p:Phase {number:12})-[:HAS_RISK]->(r:Risk)<-[:CORRECTS]-(c:Corrective) RETURN r,c` |
| Journal entry auto-classified | `write_to_graph` | `("entry-456", "maps_to", "phase-12-ritual-re-rendering", {date: "2026-07-04"})` |
| Temporal trend detection | `query_knowledge_graph` | `MATCH (e:JournalEntry {userId})-[:MAPS_TO]->(ph:Phase) RETURN ph.label, e.createdAt ORDER BY e.createdAt` |

### Birth Chart: Core Memory vs Graph

**Core memory (always loaded)** — human block contains a summary:
```
Sun: Capricorn 10th, Moon: Cancer 4th, Rising: Pisces
Dominant element: Water
Phase affinities: Dashboard Diagnosis, Daimon/Guidance
```
Cheap, always present. Good for the 80% case.

**Kuzu graph (queried on demand)** — full chart:
```
All 13 planets, signs, houses, aspects, dignities
Aspect patterns, element distributions, house emphasis
Transit overlays, progressions
```
Rich, queryable, zero context cost until called. Good for the 20% case.

**Recommended:** Hybrid. Core memory for the summary keeps the agent coherent without graph latency. Kuzu for deep traversal when the agent decides it needs specifics.

### Kuzu Client Module

```typescript
// src/db/graph-store.ts — D1 graph client, schema init, CRUD helpers
import type { D1Database } from "@cloudflare/workers-types";

let db: Database | null = null;

export function getDb(): Database {
  if (!db) {
    db = new Database(DB_PATH);
    initSchema(db);
  }
  return db;
}

export function query(cypher: string, params?: Record<string, unknown>) {
  const conn = getDb().connect();
  const result = conn.execute(cypher, params);
  return result.toArray();
}

export function write(subject: string, predicate: string, object: string, metadata?: Record<string, unknown>) {
  const conn = getDb().connect();
  conn.execute(
    `MERGE (s:Entity {id: $subject})
     MERGE (o:Entity {id: $object})
     CREATE (s)-[r:FACT {predicate: $predicate, metadata: $metadata, createdAt: timestamp()}]->(o)`,
    { subject, predicate, object, metadata: JSON.stringify(metadata || {}) }
  );
}
```

---

## Practice Diary: Storage, Retrieval & Feedback Architecture

### Storage Layer

Journal entries flow through two storage systems with different purposes:

```
User writes journal entry
  → D1 journal_entries table (canonical, queryable, paginated)
    → personal_mappings table (phase/risk/corrective links)
  → Kuzu graph (entity links, temporal edges, cross-session patterns)
    → Letta agent memory (if user has a Letta agent)
```

**D1** is the source of truth. Schema exists with `journal_entries` (id, user_id, kind, title, text, created_at) and `personal_mappings` (links entries to phases/risks/correctives).

**Kuzu** is the graph layer. When a journal entry is saved, it's classified against Atlas phases and written as graph nodes + edges:

```typescript
// On journal save — auto-classify and store to Kuzu
const conn = getDb().connect();
conn.execute(`
  MERGE (e:JournalEntry {id: $entryId})
  SET e.userId = $userId, e.kind = $kind, e.text = $text, e.createdAt = $createdAt
`, { entryId, userId, kind, text, createdAt });

// Link to Atlas phases
if (mappedPhase) {
  conn.execute(`
    MATCH (e:JournalEntry {id: $entryId})
    MATCH (p:Phase {id: $phaseId})
    CREATE (e)-[:MAPS_TO {date: $date}]->(p)
  `, { entryId, phaseId, date: createdAt });
}
```

This gives the Letta agent's `query_knowledge_graph` tool access to journal entries for cross-session pattern detection, temporal trend queries, and relationship traversal — without needing a separate memory service.

### Retrieval Frequency & Triggers

| Trigger | What gets retrieved | Source | Frequency |
|---|---|---|---|
| User asks a question in Chat | Kuzu temporal query: recent journal entries for the user | Kuzu | Every chat message |
| User mentions a practice | Filter by `kind: "practice_session"` + date range | D1 | On keyword match |
| Daily schedule fires | Aggregate practice stats from past 7 days | D1 | Once daily |
| Agent detects a pattern | `MATCH (e:JournalEntry {userId}) RETURN e.kind, e.text, e.createdAt ORDER BY e.createdAt` | Kuzu | When agent suspects a pattern (via tool call) |
| New journal entry saved | Auto-classify against Atlas phases, store to Kuzu + D1 | classifyClaim | On save |
| Weekly reflection | Aggregate top phases, risks, correctives from past week | D1 + Kuzu | Weekly cron |

**Privacy controls (from mbuild.md Phase 8):**
- Journal entries are **private** — never used in global graph or Q&A
- Global learning only if `allowGlobalLearningFromPrivateNotes` is true + identifiers stripped
- Delete endpoint removes entry + all associated graph nodes from Kuzu + D1

### Feedback Loop: Agent Tuning from User Ratings

Every response the agent gives can be rated. The feedback adjusts future behaviour:

```
User rates response 4/5
  → Stored in D1 profile.feedback.aggregate
    → If topic-specific pattern emerges (e.g. consistently low ratings for astrology-heavy responses):
        → Reduce birthChartInfluence preference
        → Add "user prefers minimal astrology" to agent memory
    → If user consistently rates scholarly depth high for ritual topics:
        → Increase phase packet depth for ritual-related queries
        → Promote Phase 12 (Ritual Re-Rendering) to system/ block (always in context)

User rates response 2/5 with comment "too verbose"
  → responseStyle preference shifts toward "concise"
  → Agent memory updated: "user prefers concise responses"
```

**Feedback data model (in D1 profile.feedback):**
```typescript
{
  totalRatings: 47,
  averageRating: 4.2,
  byTopic: {
    "daimon": { count: 5, average: 4.8, trend: "improving" },
    "ritual": { count: 8, average: 3.2, trend: "needs_attention" },
    "emptiness": { count: 3, average: 4.0, trend: "stable" },
  },
  recentComments: [
    { rating: 2, comment: "too much astrology", topic: "ritual", date: "2026-07-04" },
    { rating: 5, comment: "perfect depth", topic: "daimon", date: "2026-07-03" },
  ],
  responseStyleAdjustments: {
    conciseness: +0.2,    // moving toward concise
    astrologyWeight: -0.1, // reducing astrological influence
    referenceFrequency: +0.3, // citing more sources
  },
}
```

### Direct Feedback to Letta Agent

When a user has a Letta agent, feedback flows directly into the agent's memory:

```typescript
// After user rates a response
await client.agents.blocks.update(agentId, "human", {
  value: formatHumanBlock(updatedProfile),  // includes updated feedback stats
});
```

The agent remembers the feedback across sessions naturally (it's in the memory block). Memory blocks are agent-managed — the agent can also update them autonomously via built-in memory tools as it learns patterns.

For deeper tuning, the Letta agent's **dreaming** subagent can review feedback history overnight and suggest structural memory changes:

```
Dream subagent reviews:
  - User rated 5 ritual responses poorly over 2 weeks
  - All had heavy astrological content
  - User explicitly commented "too much astrology" twice

→ Suggestion: reduce birthChartInfluence from 60 to 30
→ Suggestion: add note to system/ block: "user prefers minimal astrology"
→ Suggestion: for Phase 12 queries, use concise mode by default
```

### Adjustment Dimensions

User feedback can adjust these agent dimensions:

| Dimension | Range | Effect |
|---|---|---|
| birthChartInfluence | 0-100 | How much astrology factors into responses |
| responseStyle | concise / conversational / scholarly | Tone and depth of language |
| referenceFrequency | 0-100 | How often sources are cited |
| humorLevel | 0-2 | Warmth/playfulness in responses |
| insightDepth | light / normal / deep | How much of the phase packet is included |
| proactiveEngagement | 0-100 | How often the agent initiates topics |
| topicAffinity | per-phase | Which phases get boosted weight |

Each dimension has a default (from user preferences) and an adjusted value (from feedback). The adjusted value drifts as new feedback comes in, with a decay function for old feedback.

---

## Build Plan (Aligned with mbuild.md)

### Phase 0: Backend Foundation (Current Sprint)

**Goal:** Every user has a D1 record, graph seeded, and a profile endpoint.

- [x] D1 users table with `profile` JSON column
- [x] `GET/PATCH /api/profile` — create/update user profile
- [x] Client UUID generation on first visit (`localStorage.client_id`)
- [x] Atlas graph data in YAML (17 phases, risks, correctives, source cards, traditions)
- [x] Graph store (`src/db/graph-store.ts`) — D1-backed nodes + edges
- [x] `scripts/import-graph.mjs` — import YAML → D1 graph tables
- [x] `POST /api/journal` — create journal entry + auto-classify + store mappings
- [x] `GET /api/journal` — list entries (paginated, by kind filter)
- [x] `GET /api/journal/:id/map` — get phase mappings
- [x] `POST /api/journal/:id/map` — re-classify entries
- [x] `/api/chat/agent` — streaming DeepSeek with memory blocks + birth chart context
- [x] Google OAuth — `/api/auth/google/url`, `/callback`, `/logout`, `/api/me`
- [x] Session middleware — accepts `session_id` cookie or password

### Phase 1: Journal + Practice Tracking (mbuild.md Phase 8)

**Goal:** Users log practice sessions, journal entries, dream records. All are stored as Kuzu graph nodes with temporal edges to Atlas phases.

- [ ] Journal input UI (`/journal` page) with kind selector, text input, tag support
- [ ] `POST /api/journal` auto-classifies against Atlas phases via `classifyClaim`
- [ ] Journal entry written to Kuzu as `JournalEntry` node with `MAPS_TO` edge to phase
- [ ] Practice streak tracking (daily login → increment streak in `profile.practice`)
- [ ] Weekly practice summary endpoint (`GET /api/user/patterns`) — Kuzu Cypher query
- [ ] Journal entry → Letta agent memory (promoted to `human` block if agent deems important)

### Phase 2: Letta Agent Integration

**Goal:** Users with agents get persistent memory, Kuzu graph tools, proactive engagement, and feedback-driven tuning.

- [ ] `POST /api/chat/letta` — streaming endpoint that uses Letta Agent SDK with `backend: "cloud"`
- [ ] Agent creation on profile save (birth chart → `human` block, preferences → `custom` block)
- [ ] `POST /api/profile/feedback` — store feedback, propagate to Letta agent memory block
- [ ] Kuzu tools created and attached: `query_knowledge_graph` + `write_to_graph`
- [ ] Dreaming subagent configuration (weekly memory consolidation)
- [ ] Custom Atlas subagents (`phase-matcher`, `source-finder`, `journal-connector`)
- [ ] Atlas skills (`atlas-socratic-method`, `atlas-source-citation`, `atlas-astro-integration`)
- [ ] Schedule: daily practice reminder, weekly reflection, new moon check-in
- [ ] Feedback loop: user ratings → automatic preference adjustment via block update

### Phase 3: Source RAG (mbuild.md Phase 10)

**Goal:** Source PDFs/texts embedded and retrievable for answer grounding.

- [ ] R2 bucket per user for source documents
- [ ] PDF/text chunking pipeline
- [ ] Embedding via OpenCode Go API or Vectorize
- [ ] Retrieval: on answer generation, query source chunks relevant to graph path
- [ ] Source chunk citations in answer output

### Phase 4: Global Learning (mbuild.md Phase 15)

**Goal:** Anonymized patterns extracted from opted-in chats, stored as global learning candidates.

- [ ] Extraction pipeline: after chat, if `allowGlobalLearningFromChats`, extract claim → normalized → anonymized
- [ ] Admin review page for candidates
- [ ] Approved candidates promoted to Q&A records
- [ ] Fine-tuning dataset export (mbuild.md Phase 16)

### Phase 5: Admin Dashboard (mbuild.md Phase 14)

**Goal:** Admin can review Q&A, approve/reject, manage users.

- [ ] Q&A review page
- [ ] User management (view profiles, consent settings)
- [ ] Graph import (upload YAML, validate, preview diff)
- [ ] Fine-tune export page

---

## Quick Start Commands

```bash
# Get a Letta API key from https://app.letta.com/api-keys
export LETTA_API_KEY="letta-..."

# Install the Letta Agent SDK in the project
npm install @letta-ai/letta-agent-sdk

# Install Kuzu (embedded graph DB)
# Graph store uses D1 (built-in with Cloudflare Workers)
```

## Key Links

- GitHub: https://github.com/letta-ai/letta
- Docs: https://docs.letta.com
- Agent SDK quickstart: https://docs.letta.com/letta-agent-sdk/quickstart
- Agent SDK reference: https://docs.letta.com/letta-agent-sdk/reference
- Deployment (cloud/local/remote): https://docs.letta.com/letta-agent-sdk/deployment/
- Memory blocks: https://docs.letta.com/guides/core-concepts/memory/memory-blocks/
- Streaming: https://docs.letta.com/guides/core-concepts/messages/streaming/
- Subagents: https://docs.letta.com/letta-agent/subagents
- Skills: https://docs.letta.com/letta-agent/skills
- Channels: https://docs.letta.com/letta-agent/channels
- Schedules: https://docs.letta.com/letta-agent/scheduling
- Pricing: https://docs.letta.com/letta-agent/pricing
- Kuzu: https://kuzudb.com
