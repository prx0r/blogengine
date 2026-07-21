# Ideas — Architectural & Product Ideas

> Generated from the July 11, 2026 build session. These are not tasks.
> They are directions worth exploring — seedlings, not blueprints.

---

## 1. Research Objects as the Central Artifact

Replace the concept of "wiki pages" with Research Objects — one bounded scholarly question,
versioned, with per-paragraph provenance, source-contribution manifests, and semantic versioning.

**Why:** Generic wiki pages don't capture scholarly questions ("Ficino on the Daimon").
ROs are the natural unit for scholarship.

**Status:** Defined in daimon.md, visionary.md, visionarynotes.md. Not built yet.

---

## 2. Three-Tier Content Taxonomy

Every text belongs to exactly one of: Source (author's own words), Commentary (scholar
analyzing a source), Compilation (Hermes assembling existing texts, zero AI writing).

**Why:** Prevents confusion between primary sources, secondary literature, and Hermes's output.
Makes provenance explicit.

**Status:** Implemented in content/works/ with tier field. 71 records tagged.

---

## 3. 15 Research Object Families

Every scholarly question maps to one of 15 families: Thinker on Topic, Topic Across Thinkers,
Thinker on Thinker, Concept Evolution, Comparative, Reception, Tradition, Theme, Practice,
Historical Question, Debate, Research Map, Reading Companion, Sourcebook, Research Question.

**Why:** A scholar doesn't think "I want a Type 4 object." They think "how did the daimon
change from Plato to Ficino?" The question router maps it.

**Status:** Defined in visionary.md. Router not built.

---

## 4. Knowledge Pull Requests

Instead of Kanban cards, each RO gets Issues. An update is a source-aware change proposal
with git branch + Telegram approval flow.

**Why:** Git branches + approval buttons already exist in Hermes. This maps the scholarly
update workflow onto existing infrastructure.

**Status:** Design in visionbuild.md. Not built.

---

## 5. Semantic Versioning for Scholarship

PATCH (citation fix), MINOR (new source), MAJOR (reorganization). Downstream outputs
pin their dependency versions. Hermes reports drift.

**Why:** When every RO has a version, you can track what changed and whether outputs
are stale. Package management for scholarship.

**Status:** Design in visionbuild.md. Not built.

---

## 6. Impact Detection

When a new paper arrives, Hermes checks: which ROs does this affect? Coverage delta?
New paragraphs possible? Sends a Telegram notification like a GitHub PR.

**Why:** Turns acquisition from "I downloaded a paper" into "this paper improves
your living knowledge objects by 12%." Makes the research backlog purposeful.

**Status:** Cron design exists. Not built.

---

## 7. Error Book

Persistent record of corrections: "Ficino/genius and Ficino/daimon were incorrectly merged.
Resolution: keep distinct. Rule added: never normalize genius→daimon without evidence."

**Why:** Every correction becomes a maintenance rule. The system improves by remembering
its mistakes.

**Status:** Borrowed from WiCER paper and AutoSci. Not built.

---

## 8. Diagnostic Tests for Essays

Each RO has a small test set: "Can it distinguish daimon from spiritus? Can it identify
scholarly disagreement? Can it list all included primary sources?" Run after every revision.

**Why:** Blind compilation discards crucial details. Targeted diagnosis and refinement
recovers quality. Unit tests for scholarship.

**Status:** Borrowed from WiCER (arXiv 2605.07068). Not built.

---

## 9. Personal Research Objects

Diary entries become Tier 1 source material. Personal ROs alongside scholarly ROs.
"Here's what Ficino said about the daimon, and here's what your diary says about
your daimon experiences."

**Why:** The synthesis of tradition + personal experience is unique and valuable.
No other system does this.

**Status:** Vision 2 in visionary.md. Not built.

---

## 10. Recursive RO Composition

Once you have 10+ ROs, Hermes can compose higher-order ROs without touching raw PDFs.
"The Daimonic Soul in Renaissance Platonism" assembled from 6 existing ROs.

**Why:** This is where the system compounds. Each new RO increases the value of
every RO that came before.

**Status:** Design in visionary.md. Not built.

---

## 11. The Dreaming Cycle

Weekly cron where Hermes reviews ALL ROs, all new sources, all feedback, and
identifies cross-domain patterns no human would see.

**Why:** Hermes reads everything, every week. It will find connections across
traditions that specialists miss.

**Status:** Vision 3 in visionary.md. Not built.

---

## 12. Karpathy LLM Wiki Convergence

Hermes is converging on the same architectural insight as Karpathy's LLM Wiki —
compile knowledge into persistent artifacts, don't recompute from raw chunks.
But Hermes's unit is the scholarly question, not the generic wiki page.

**Why:** Validates the direction. The community is independently arriving at
similar conclusions.

**Status:** Analyzed in visionarynotes.md and visionbuild.md.

---

## 13. Hermes as a Skill-Based Learning System

The Learning Loop (Vision 1) uses Hermes's own `skill_manage` tool to write
improvement skills from self-review. No code changes needed — the skill IS the improvement.

**Why:** This is the most practical path to autonomous improvement. Hermes already
has the infrastructure (cron, skill_manage, git, terminal).

**Status:** Design in visionary.md. The gap_score tracking and skill-writing cron
not built.

---

# Ideas — Chat Architecture Refinements

## Current Problem

The streaming chat works but the pipeline is still sequential: classify → buildGraphPacket → generate. This means:

1. Every query pays the full cost of classification + graph packet building before a single token flows
2. Over-delivers for simple queries ("what is a daimon?" triggers full evidence tier, risks, correctives, practice)
3. The thinking block arrives before tokens do — backwards for UX (users see analysis before conversation)
4. No caching — identical or similar phase lookups repeat every time

---

## Idea 1: Router, Not Classifier

Replace `classifyClaim` (DeepSeek JSON mode, ~3-5s) with a cheap router that decides *how much* graph context is needed:

```
Input: "What is a daimon?"
  → Router output: "light" (one phase match, no analysis needed)
  → Action: grab Phase 13 data from cache, inject into system prompt, done

Input: "Quantum physics proves magic"
  → Router output: "deep" (cross-phase, category error risk)
  → Action: full graph packet building, but still in parallel with streaming
```

**Options for the router:**

- **Keyword-pattern match** (cheapest, ~1ms): if query matches phase labels/keywords → "light". If query has comparative/causal/absolute language ("proves", "is just", "means") → "deep". No LLM call needed.
- **Tiny classifier** (cheap, ~50ms): a small local model or a single-token LLM call that outputs just one of three tokens. Could use DeepSeek with `max_tokens: 1` and a tiny prompt.
- **Embedding similarity** (moderate, ~50ms): embed query, compare against pre-computed phase embeddings (Vectorize), if top-1 similarity > threshold → "light" with that phase, else "deep".

**Trade-offs:** Keyword is fragile but free. Embedding is robust but needs Vectorize set up and embeddings computed. Tiny classifier is a good middle ground for now — DeepSeek with `max_tokens: 1` and `temperature: 0` costs pennies and takes ~500ms.

---

## Idea 2: Fire LLM Immediately, Parallelize Graph Lookup

Stop waiting for graph analysis before calling DeepSeek. The streaming call fires immediately with a minimal system prompt and a note that graph context may follow. Graph retrieval runs concurrently.

**Two patterns:**

### 2a. Context-Injection Pattern (preferred)

1. User submits query
2. Hybrid retrieval fires: keyword search (client-side already has this) + optional embedding search
3. Retrieved graph nodes inject directly into DeepSeek's system prompt
4. Single streaming call to DeepSeek — no separate thinking/classification round-trip
5. If retrieval returns nothing useful, a generic system prompt handles it gracefully

The system prompt becomes something like:

```
You are a Socratic guide. Use the Atlas context below if relevant to the user's question.
If the context isn't relevant, just respond conversationally from your own knowledge.

Atlas context: {phase label + summary + risks + correctives (only if matched)}
```

This is one streaming call total. No two-phase classify→generate. No waiting.

### 2b. Speculative Pattern (fallback)

1. Start streaming immediately with no graph context — user sees tokens within 1-2s
2. Run graph retrieval in parallel
3. If retrieval surfaces something material, inject a formatted card/block after the fact: *"By the way, the Atlas places this in Phase 13 (Daimon/Guidance) — worth exploring."*
4. This is more complex but guarantees instant response

**Recommendation:** Start with 2a (context-injection). It's simple, one streaming call, and retrieval is fast enough (<100ms hybrid) that the user won't notice the delay before tokens start.

---

## Idea 3: Move Thinking Card to Async Background SSE

The structured analysis (evidence tier, risks, correctives, practice) is useful but shouldn't gate the conversation. Instead:

1. Fire the conversational stream immediately (with whatever graph context is available from fast retrieval)
2. In parallel, run the expensive classification pipeline
3. When classification finishes, send a second SSE event with the "Thinking" card
4. The UI appends it to the assistant message as it arrives — could be seconds after tokens started

This means the user sees:
- 0-1s: Quick graph matches (client-side keyword, instant)
- 1-2s: Streaming tokens begin
- 3-8s: Thinking card arrives (if at all — for simple queries it may be empty)

The thinking card becomes an additive bonus, not a blocking requirement.

**SSE structure:**

```
event: token
data: {"token": "That's..."}

event: token
data: {"token": " a great..."}

...

event: analysis
data: {"classification": {...}, "graphPacket": {...}}
```

The client renders tokens as they arrive and appends the analysis card when that event fires. If it never fires (timeout, error), the conversation still works fine — just without the structured overlay.

---

## Idea 4: Cache Graph Packets per Phase/Topic

The graph data is static. Phase 13 (Daimon/Guidance) has the same summary, risks, and correctives every time. Yet the current pipeline rebuilds the graph packet from scratch on every request.

**What to cache:**

- Per-phase packet: `{ phase.id → { label, summary, risks[], correctives[], evidenceTier, suggestedPractice, categoryWarnings } }`
- Pre-computed at build time from YAML (or generated-data.ts)
- Loaded once, shared across all requests
- Retrieval is O(1) lookup by phase ID or O(n) keyword search over cached labels

**Bonus:** Cache the *router output* too. If "what is a daimon" and "tell me about daimons" both route to Phase 13, the second hit skips retrieval entirely.

**Implementation:** A simple in-memory Map on the server (Cloudflare Workers can use global state or KV for this). Keyed by normalized query + matched phases.

---

## Idea 5: Dynamic Graph Context — Right-Size Per Query

The current graph packet is the same shape for every query: primary phase, assumptions, demolition, replacement, path, source cards, risks, correctives, evidence tier, warnings, practice. This is over-engineered for simple queries and under-powered for complex ones.

**Principle:** The amount of graph context injected should match the query depth.

| Query Type | Context Injected |
|---|---|
| Definition ("what is X") | Phase label + 1-sentence summary only |
| Comparison ("X is Y") | Phase labels + summaries + relation warnings |
| Claim ("X proves Y") | Full packet (risks, correctives, evidence tier, practice) |
| Practice ("how to X") | Practice move + success marker + failure mode |

**How to determine type:** The router from Idea 1 outputs a depth level, which maps to how much context to attach.

**In the system prompt:**

```
Phase context (definition match): "Phase 13 — Daimon/Guidance/Vocation. Summary: ..."
vs
Phase context (deep claim): "Phase 13 — full analysis with risks: [...], correctives: [...], warnings: [...]"
```

This keeps prompts tight for simple queries (faster, cheaper) and expands for complex ones.

---

## Summary — Recommended Architecture

```
User query
    │
    ├── [1ms] Client-side keyword search → show quick phase pills immediately
    │
    ├── [50ms] Server: Router (cheap classifier) → output "light" | "deep"
    │              │                                │
    │           "light"                          "deep"
    │              │                                │
    │    [50ms] Fetch 1 phase from cache    [100ms] Build full graph packet
    │              │                                │
    └──────────────┴────────────────────────────────┘
                        │
            [0ms] Inject into system prompt
                        │
            [Stream] Fire DeepSeek with stream: true
                        │
            [Async] Non-blocking: run expensive classification
                        │
            If classification completes: push analysis SSE event to client
```

**Key changes from current implementation:**

- No sequential dependency between graph retrieval and LLM call
- Router replaces classifier for the fast path (80% of queries skip expensive analysis)
- Graph packet is dynamic — simple queries get 1 sentence, complex ones get full context
- Thinking card is async — doesn't block anything, arrives whenever it's ready
- Caching eliminates repeat work

**First step if implementing:** Lightweight router (keyword + max_tokens:1 DeepSeek call), context-injection streaming, and per-phase packet cache. That alone eliminates the ~5s classification wait and makes simple queries feel instant.

---

## User Profile Architecture

### Profile Data Model

The D1 `users` table has a `profile JSON` column. This is the canonical user profile. The profile should hold everything needed for personalisation:

```typescript
interface UserProfile {
  // Identity
  displayName?: string;
  bio?: string;

  // Birth chart (from caelus)
  birthChart?: {
    name: string;
    year: number; month: number; day: number;
    hour: number; minute: number;
    lat: number; lon: number;
    placeName?: string;
    // Computed data cached for quick access (computed client-side, stored for server)
    sun?: { sign: string; house: number };
    moon?: { sign: string; house: number };
    ascendant?: { sign: string; degree: number };
    dominantElement?: string;       // fire/water/air/earth weighting
    dominantMode?: string;          // cardinal/fixed/mutable
  };

  // Psyche map (Bardon-style elemental deconstruction + Jungian shadow)
  psyche?: {
    elements: {        // Bardon's four elements as psychic faculties
      fire: number;    // 0-100, will/assertion
      water: number;   // 0-100, emotion/feeling
      air: number;     // 0-100, intellect/reason
      earth: number;   // 0-100, stability/body
      spirit: number;  // 0-100, integration/self-awareness
    };
    shadow?: string[]; // Jungian shadow traits identified
    dominantArchetype?: string;  // from journal/pattern analysis
  };

  // Practice history (aggregated, not raw entries)
  practice?: {
    totalSessions: number;
    currentStreak: number;
    longestStreak: number;
    preferredPractices: string[];        // e.g. ["meditation", "ritual/lbrp"]
    phaseEngagement: Record<string, number>;  // phaseId → session count
    lastSessionDate?: string;
  };

  // Preferences
  preferences: {
    responseStyle: "concise" | "conversational" | "scholarly";
    includeReferences: boolean;     // always cite Atlas phases/sources
    humorLevel: 0 | 1 | 2;         // 0 = none, 1 = light, 2 = warm
    insightDepth: "light" | "normal" | "deep";
    birthChartInfluence: number;    // 0-100, how much to weigh astrology
    customInstructions?: string;    // freeform user override
  };

  // Feedback history (aggregated)
  feedback?: {
    totalRatings: number;
    averageRating: number;
    topicPreferences: Record<string, number>;  // topic → avg rating
    lastFeedbackDate?: string;
  };
}
```

**Storage strategy:** Profile JSON in D1 for the structured data. mem0 for the unstructured memory (journal entries, session logs, dream records). D1 is the source of truth for profile; mem0 is the searchable memory layer.

---

### mem0 as Memory Layer: Assessment

**Already integrated:** `src/lib/memory.ts` wraps the mem0ai SDK with `addMemory`, `searchMemories`, `getContext`, `summarizeAndStore`.

**Pros:**
- Semantic search over unstructured text (journal entries, practice logs)
- User-scoped via `user_id` parameter
- Metadata filtering (source type, date, tags)
- Managed service — no infrastructure to run
- Already works with the existing AI pipeline (OpenAI-compatible)

**Cons:**
- Requires `MEM0_API_KEY` env var (currently not set in Cloudflare)
- Cloud API — adds latency vs local storage
- Free tier has limits (5k memories, 1k searches/month)
- No self-hosted option without their Docker setup

**Fit assessment:** Good fit for search across journal entries, practice logs, and dream records. Not a replacement for D1 (structured profile data belongs in D1). The two complement each other: D1 for the profile schema, mem0 for the memory search.

**If mem0 isn't viable long-term** (API key management, cost, latency), the alternative is to use D1 + Vectorize:
- Store journal/practice entries in D1 `journal_entries` table (already has the schema)
- Embed them with the OpenCode Go API (same model, `embeddings` endpoint if available) or a simple keyword index
- Query with Vectorize for semantic similarity
- This keeps everything in the Cloudflare ecosystem

---

### AI Agent Architecture: LangGraph-Like Source Router

The core idea: the AI doesn't use all sources equally for every query. It needs a *source router* that dynamically decides which information sources to consult and how to weight them for each specific query.

**Sources available:**

```
User Profile
  ├── Birth Chart (astrological factors, element dominance)
  ├── Psyche Map (elemental scores, shadow traits)
  ├── Practice History (recent sessions, preferred practices)
  └── Preferences (style, depth, humor, reference mode)

Atlas Knowledge Graph
  ├── Phase Data (17 phases, summaries, risks, correctives)
  ├── Source Cards (Iamblichus, Corbin, Nagarjuna, etc.)
  ├── Traditions (Neoplatonism, Gnosticism, Tantra, Buddhism)
  └── Warnings (category errors, common pitfalls)

Memory Layer (mem0)
  ├── Recent Journal Entries (tagged, date-stamped)
  ├── Practice Logs (Gateway sessions, rituals, meditations)
  ├── Dream Records (symbols, themes, patterns)
  └── Previous Conversations (Q&A history, feedback)

Atlas Essays / Wiki (future)
  └── Formal essays with real quotes, linked to phases
```

**Dynamic weighting mechanism:**

Instead of a fixed system prompt, the agent uses a *context composer*:

```typescript
interface SourceWeight {
  source: string;
  weight: number;        // 0.0 - 1.0, how much to include
  priority: "always" | "on_match" | "background";
  content: string;
}

// Router determines which sources to activate:
function composeContext(query: string, profile: UserProfile): SourceWeight[] {
  const weights: SourceWeight[] = [];

  // Always include matching phases from Atlas (router determines depth)
  const { matchedPhases, depth } = route(query);
  if (matchedPhases.length > 0) {
    weights.push({
      source: "atlas",
      weight: depth === "light" ? 0.4 : 0.8,
      priority: "always",
      content: buildPhaseContext(matchedPhases, depth),
    });
  }

  // Check birth chart relevance (astrological keywords in query?)
  if (profile.birthChart && hasAstrologicalAspect(query)) {
    weights.push({
      source: "birthChart",
      weight: profile.preferences.birthChartInfluence / 100,
      priority: "on_match",
      content: formatBirthChartContext(profile.birthChart),
    });
  }

  // Search mem0 for relevant memories
  if (hasPersonalAspect(query)) {
    const memories = await searchMemories(query, profile.clientId);
    if (memories) {
      weights.push({
        source: "memory",
        weight: 0.5,
        priority: "on_match",
        content: memories,
      });
    }
  }

  // Always include preferences (low weight, background)
  weights.push({
    source: "preferences",
    weight: 0.2,
    priority: "background",
    content: formatPreferences(profile.preferences),
  });

  return weights;
}
```

The composed context is injected into the system prompt with explicit weighting instructions:

```
Context sources (weighted by relevance):

[ATLAS · weight: 0.8] Phase 12 — Ritual Re-Rendering...
[BIRTH CHART · weight: 0.6] Sun in Leo 9th house, Moon in Pisces...
[MEMORY · weight: 0.5] User has been practicing LBRP daily for 2 weeks...
[PREFERENCES · weight: 0.2] User prefers concise responses with references.

Respond naturally. Higher weight = more relevant to this query.
Do not force lower-weight sources into the response.
```

This makes the agent dynamically adjust its sources per-query without needing a LangGraph framework — just structured prompt engineering.

---

### Feedback Loop: Response Calibration

Every response can be rated. The rating adjusts future behaviour:

```
User sends 👍 or 👎 on a response
  → Stored in D1 profile.feedback
  → Aggregated per topic (topic extracted from classification phase)
  → If rating < threshold for a topic 3+ times:
      → Reduce weight of responses style elements user disliked
      → Increase mention of references if user wanted more sources
      → Flag topic for review (maybe the Atlas phase data needs updating)

System prompt includes a calibration section:
  "User preferences from past feedback:
   - Enjoys scholarly depth for ritual topics (avg 4.5/5)
   - Prefers concise answers for definition questions (avg 4.2/5)
   - Responded well to source citations (avg 4.8/5)
   Adjust your style accordingly."
```

**Long-term:** Aggregated feedback across users could identify which Atlas phases need updating, which response styles work best per topic, and which birth chart factors correlate with engagement.

---

### Custom Personality Settings

Exposed as user-controlled toggles in the Settings page:

| Setting | Type | Effect |
|---|---|---|
| Response Style | concise / conversational / scholarly | Changes the system prompt framing |
| Include References | toggle | If on, AI always cites phase numbers and source cards |
| Humour Level | none / light / warm | Adds a tone modifier to system prompt |
| Insight Depth | light / normal / deep | Controls how much of the phase packet is injected |
| Birth Chart Influence | slider 0-100 | Weights how much astrology factors into responses |
| Custom Instructions | free text | Appended to system prompt as user override |
| Always Cite Atlas | toggle | Forces graphPacket display even on light queries |

These are stored in `profile.preferences` and injected into the streaming endpoint's system prompt.

---

### Practice History Integration

The existing journal system (`src/lib/journal.ts`) has tagged notes. The diary (`src/lib/diary.ts`) has day entries. The Gateway tapes (`src/lib/gateway.ts`) have session data.

**Integration pattern:**

1. When user saves a journal entry or practice log, also store a summarised version to mem0 with `user_id` and metadata tags
2. When user asks a question in Chat, the streaming endpoint:
   a. Searches mem0 for relevant memories (`searchMemories(query, userId)`)
   b. If results found, includes them as a `[PRACTICE HISTORY]` context source
   c. The AI can reference recent practice: "I see you've been working with LBRP — this connects to Phase 12 (Ritual Re-Rendering)..."
3. Periodically (cron job or on journal save), aggregate practice stats into `profile.practice` in D1

**Auto-tagging journal → Atlas phases:**
When a journal entry is saved, run it through the classifier (`classifyClaim`) to detect which Atlas phases it relates to. Store the mapping in `profile.practice.phaseEngagement`. This builds a personal "which phases has this user engaged with" map over time.

---

### Birth Chart as User Model

The birth chart is more than just a profile picture. It's a structured personality model:

```typescript
// Derived from planetary positions
interface AstroProfile {
  dominantElement: "fire" | "water" | "air" | "earth";
  // Based on which signs have the most planets

  dominantQuality: "cardinal" | "fixed" | "mutable";

  sunSign: string;
  moonSign: string;
  ascendant: string;

  // Phase affinities (which Atlas phases this chart naturally resonates with)
  phaseAffinities: Record<string, number>;
  // e.g. heavy Capricorn → Dashboard Diagnosis (Phase 1)
  //      Pisces Moon → Nonordinary Rendering (Phase 14)
  //      Scorpio placements → Daimon/Guidance (Phase 13)

  // House emphasis
  emphasizedHouses: number[];

  // Aspect patterns
  aspectPatterns: string[];  // e.g. ["T-square", "grand trine"]
}
```

The phase affinities mapping is a static lookup table (astrological placements → phase IDs), computed at profile save time. This lets the AI know which phases a user is naturally drawn to without needing to call DeepSeek.

**In the system prompt:**
```
User's astrological profile:
- Dominant element: Water (Moon in Cancer 4th house, Pisces rising)
- Sun in Capricorn 10th house → natural affinity for Dashboard Diagnosis
- Moon-Neptune square → tendency toward Nonordinary Rendering; caution re: category errors
```

This gives the AI a structured personality lens without making it guess from raw birth data.

---

### Summary: Recommended Architecture

```
┌─────────────────────────────────────────────────┐
│                  User Request                     │
└────────────────────┬────────────────────────────┘
                     │
              ┌──────▼──────┐
              │   Router    │  ← cheap keyword + optional tiny LLM call
              │  (depth,    │
              │   topics)   │
              └──────┬──────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
   ┌────────┐  ┌──────────┐  ┌────────┐
   │ Atlas  │  │ Profile   │  │ mem0   │  ← parallel fetch
   │ Phases │  │ (D1)      │  │ Search │
   └───┬────┘  └─────┬────┘  └───┬────┘
       │             │           │
       └─────────────┼───────────┘
                     ▼
            ┌────────────────┐
            │ Context        │  ← weighted composition
            │ Composer       │
            └───────┬────────┘
                    ▼
            ┌────────────────┐
            │ DeepSeek       │  ← single streaming call
            │ Stream         │     with composed context
            └───────┬────────┘
                    ▼
            ┌────────────────┐
            │ Response +     │
            │ Feedback UI    │  ← user rates → stored in profile
            └────────────────┘
```

**Key integrations with existing code:**

| Component | What to change |
|---|---|
| `src/app/api/chat/stream/route.ts` | After router, fetch profile + mem0 in parallel before composing context |
| `src/app/api/profile/route.ts` | Accept psyche map, preferences, feedback updates |
| `src/app/birth-chart/page.tsx` | On save, compute phase affinities, store to profile |
| `src/app/settings/page.tsx` | Add preference toggles (style, references, humor, depth, custom instructions) |
| `src/app/journal/page.tsx` | On save, classify against Atlas phases, store to mem0 + D1 practice history |
| `src/lib/memory.ts` | Already works — wire MEM0_API_KEY into Cloudflare secrets |
| `src/atlas/db/d1.ts` | Add profile update helpers for psyche, practice, feedback |

**If mem0 is not viable:** Replace with D1 `journal_entries` table + Vectorize for embedding search. The schema already exists with `personal_mappings` for phase linking.

---

## Letta (formerly MemGPT) — Better Fit Than mem0

**GitHub:** https://github.com/letta-ai/letta (23.6k ★, Apache 2.0)
**Docs:** https://docs.letta.com
**SDK:** `@letta-ai/letta-agent-sdk` (TypeScript)

### Why Letta Fits Better

mem0 is a **searchable memory store** — you query it before each LLM call. Letta is a **stateful agent platform** — memory is always present in the context window. This is the key distinction:

| | mem0 | Letta |
|---|---|---|
| **Memory model** | Search/retrieval (explicit query) | Always-in-context memory blocks |
| **Birth chart** | Must search before every response | Lives in a memory block — always available |
| **Practice history** | Searchable | Structured block + archival memory |
| **User preferences** | Stored as metadata | Memory block with schema |
| **Cross-session** | Must re-query each session | Persistent agent state across sessions |
| **Self-improvement** | No | "Dreaming" — consolidates memories overnight |
| **Deployment** | Cloud API only | Cloud (Constellation) + self-host + local |
| **TypeScript SDK** | Yes (mem0ai npm) | Yes (`@letta-ai/letta-agent-sdk`) |

### How Letta Would Work with the Atlas

Each user gets a **Letta agent** with structured memory blocks:

```typescript
// Agent persona block — always in context
const agent = await client.createAgent({
  model: "opencode-go/deepseek-v4-flash",  // or any OpenAI-compatible
  persona: `You are a Socratic guide using the Re-Rendering Atlas...`,
  human: `
    User profile:
    - Birth chart: Sun in Capricorn 10th, Moon in Cancer 4th, Pisces rising
    - Dominant element: Water
    - Phase affinities: Dashboard Diagnosis (Capricorn), Daimon/Guidance (Scorpio MC)
    - Practice history: 12 LBRP sessions, 8 meditation sessions
    - Current streak: 5 days
    - Preferences: concise style, always cite references
  `,
  tools: [
    searchAtlasPhases,     // search the 17-phase graph
    getSourceCard,          // retrieve a specific source card
    getPhaseByNumber,       // get phase details
    searchMemories,         // search past journal entries
  ],
});
```

The agent is stateful — it remembers past conversations. No need to fetch birth chart from D1 before each response, no need to search mem0 for context. The relevant data is **always in the prompt** via memory blocks.

### Memory Architecture in Letta

```
Context Window (always present)
├── Persona Block ("who the AI is")
├── Human Block ("who the user is")
│   ├── birthChart (sun, moon, asc, elements, phase affinities)
│   ├── preferences (style, depth, humor, references)
│   └── practiceSummary (streak, recent sessions, top phases)
│
├── Archival Memory (paginated, searchable)
│   ├── Journal entries (auto-summarized)
│   ├── Dream logs
│   ├── Past conversations (Q&A history)
│   └── Session data (Gateway, rituals, meditations)
│
└── Tools (functions the agent can call)
    ├── searchAtlasPhases(query) → phase data
    ├── getSourceCard(id) → source card content
    ├── searchMemories(query) → past memories
    └── updateProfile(field, value) → update D1 user profile
```

### Integration Path

1. **Create a Letta agent per user** on account creation — attach personality + persona blocks
2. **Replace the streaming endpoint** with the Letta Agent SDK — `session.send(query)` + `session.stream()`
3. **Birth chart, preferences, practice history** → `human` memory block (always in context)
4. **Journal entries, dream logs, session data** → `archival memory` (searchable, paginated)
5. **Atlas phases, source cards, traditions** → tool implementations (called when needed)
6. **Letta handles state, memory consolidation, and context management** automatically

### Trade-offs vs Current Architecture

| Current (custom) | Letta |
|---|---|
| Manually compose context per request | Automatic memory block injection |
| Must implement memory search | Built-in archival + search |
| Custom feedback loop | Built-in "dreaming" consolidation |
| Total control | Framework constraints |
| No infra dependencies | Requires Letta cloud or self-hosted server |
| Works on Cloudflare Workers | Letta agent runs externally (REST API calls) |

### Recommendation

Letta is the right **long-term** architecture if you want persistent stateful agents. The memory blocks model is exactly what you described — birth chart always in context, practice history always available, preferences always respected.

For the **short-term** (next sprint), the current D1 + mem0 hybrid is simpler and already works. You can migrate to Letta incrementally:
1. Keep the current streaming endpoint as the "fast path" for simple queries
2. Add a Letta agent as the "deep path" for users who want persistent conversation memory
3. Letta handles the complex state; the current system handles the quick wiki lookups
