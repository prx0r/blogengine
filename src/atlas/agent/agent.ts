// ── Modular Agent Structure ─────────────────────────────────────
// Draft. Core actions and functions defined. Implementation deferred
// until Atlas graph and Letta integration are finalised.
// ───────────────────────────────────────────────────────────────

import type { ProfileData } from "@/atlas/db/d1";

// ── Context Sources ────────────────────────────────────────────
// Each source knows how to fetch and format its data.
// The agent composes them based on routing depth.

interface SourceResult {
  source: string;
  weight: number;
  content: string;
  priority: "always" | "on_match" | "background";
}

interface SourceFetcher {
  name: string;
  fetch(userId: string, query: string, profile: ProfileData): Promise<SourceResult | null>;
}

// ── Built-in Sources ───────────────────────────────────────────

const atlasPhasesSource: SourceFetcher = {
  name: "atlas_phases",
  async fetch(userId, query, profile) {
    // Uses router.ts to determine depth + matched phases
    // Returns formatted phase data (light = summary, deep = full packet)
    return null; // TODO: implement
  },
};

const birthChartSource: SourceFetcher = {
  name: "birth_chart",
  async fetch(userId, query, profile) {
    if (!profile.birthChart) return null;
    // Check if query has astrological relevance (keyword match)
    // Format: "Sun in Capricorn 10th, Moon in Cancer 4th..."
    return null; // TODO: implement
  },
};

const practiceHistorySource: SourceFetcher = {
  name: "practice_history",
  async fetch(userId, query, profile) {
    // Query D1 journal_entries for recent practice patterns
    // Format: "12 LBRP sessions this month, 8 meditation sessions..."
    return null; // TODO: implement
  },
};

const preferencesSource: SourceFetcher = {
  name: "preferences",
  async fetch(userId, query, profile) {
    if (!profile.preferences) return null;
    // Format preferences as instructions for the LLM
    return null; // TODO: implement
  },
};

// ── Agent Router ───────────────────────────────────────────────
// Determines which sources to fetch and how to compose them.

interface AgentRoute {
  depth: "light" | "deep";
  sources: SourceFetcher[];
  systemPrompt: string;
}

function routeQuery(query: string, profile: ProfileData): AgentRoute {
  // 1. Run keyword router (router.ts)
  // 2. Select sources based on depth + profile
  // 3. Build system prompt template
  return { depth: "light", sources: [], systemPrompt: "" }; // TODO
}

// ── Context Composer ──────────────────────────────────────────
// Fetches all selected sources in parallel, weights them,
// and composes the final context for the LLM.

interface ComposedContext {
  sources: SourceResult[];
  systemPrompt: string;
  userMessage: string;
}

async function composeContext(
  userId: string,
  query: string,
  profile: ProfileData
): Promise<ComposedContext> {
  const route = routeQuery(query, profile);

  // Fetch all sources in parallel
  const results = await Promise.allSettled(
    route.sources.map((s) => s.fetch(userId, query, profile))
  );

  const sources: SourceResult[] = results
    .filter((r) => r.status === "fulfilled" && r.value !== null)
    .map((r) => (r as PromiseFulfilledResult<SourceResult>).value);

  return {
    sources,
    systemPrompt: route.systemPrompt,
    userMessage: query,
  };
}

// ── Agent Core ────────────────────────────────────────────────
// The main agent loop. Called by the streaming endpoint.

interface AgentMemory {
  // Always-in-context (Letta human block equivalent)
  birthChart?: ProfileData["birthChart"];
  preferences?: ProfileData["preferences"];
  practiceSummary?: string;
  // Managed by feedback/consolidation
  learnedPatterns?: string[];
  recentTopics?: string[];
}

interface AgentOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export class AtlasAgent {
  private memory: AgentMemory = {};
  private options: AgentOptions;

  constructor(profile: ProfileData, options: AgentOptions = {}) {
    this.memory.birthChart = profile.birthChart;
    this.memory.preferences = profile.preferences;
    this.options = options;
  }

  // ── Core Actions ───────────────────────────────────────────

  async think(query: string, userId: string): Promise<ComposedContext> {
    // 1. Route the query
    // 2. Compose context from sources
    // 3. Return composed context for LLM call
    return composeContext(userId, query, {
      birthChart: this.memory.birthChart,
      preferences: this.memory.preferences,
    });
  }

  async learn(response: string, feedback?: { rating: number; topic?: string }) {
    // 1. Extract durable patterns from conversation
    // 2. Update memory based on feedback
    // 3. Consolidate if needed (via dreaming subagent)
  }

  async recall(topic: string): Promise<string[]> {
    // 1. Search Letta archival memory or D1 for relevant context
    // 2. Return formatted context
    return [];
  }

  async schedule(action: "daily" | "weekly" | "phase_milestone") {
    // 1. Check practice history
    // 2. Generate proactive message based on birth chart + history
    // 3. Return formatted reminder
  }

  // ── Memory Management ──────────────────────────────────────

  updateBirthChart(data: ProfileData["birthChart"]) {
    this.memory.birthChart = data;
  }

  updatePreferences(prefs: ProfileData["preferences"]) {
    this.memory.preferences = prefs;
  }

  getMemorySnapshot(): AgentMemory {
    return { ...this.memory };
  }
}

// ── Example Usage ──────────────────────────────────────────────
/*
const agent = new AtlasAgent({
  birthChart: {
    name: "Test",
    year: 1990, month: 6, day: 15,
    hour: 12, minute: 0,
    lat: 51.5, lon: -0.12,
    placeName: "London, UK",
  },
  preferences: {
    responseStyle: "concise",
    includeReferences: true,
    humorLevel: 0,
    insightDepth: "normal",
    birthChartInfluence: 60,
  },
});

// Agent composes context and returns it for the LLM
const ctx = await agent.think("What is a daimon?", "user-123");
// ctx.sources = [atlas_phases, birth_chart, preferences]
// ctx.systemPrompt = formatted with weights

// After response, agent learns from feedback
await agent.learn(responseText, { rating: 5, topic: "daimon" });

// Agent can recall past topics
const past = await agent.recall("daimon");
*/
