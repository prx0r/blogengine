// POST /api/chat/agent — streaming DeepSeek with memory blocks + graph tool calling
// The agent can query the knowledge graph and write facts during conversation.

import { route } from "@/atlas/ai/router";
import { getPhaseCache } from "@/atlas/graph/phaseCache";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { D1Database } from "@cloudflare/workers-types";
import type { ProfileData } from "@/atlas/db/d1";
import { buildGraphContext } from "@/atlas/db/graph-context";
import { getOpenAITools, executeToolCall, type OpenAIToolCall } from "@/atlas/db/graph-tools";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const OPENCODE_API = "https://opencode.ai/zen/go/v1/chat/completions";
const API_KEY = process.env.DEEPSEEK_API_KEY || "sk-SDjjQ8NtTdpM2OmWl3GXDrPlhcQiLvZln60mSVVcJQ3rkg7trYHQoLKshcKSeg0Y";

// ── Memory Block Helpers ─────────────────────────────────────

const SYSTEM_PERSONA = `You are a Socratic guide using the Re-Rendering Atlas framework.
You help users explore metaphysical assumptions through 17 phases of transformation.
You are warm, curious, and precise. You cite phases by number and name.
You suggest practices. You flag risks and correctives.

You have access to a knowledge graph with Atlas phases, risks, correctives, source cards, and traditions.
When you need more context, use the query_knowledge_graph tool.
When you learn something durable about the user, use the write_to_graph tool.

You never give unsolicited opinions — you present the Atlas framework and let the user draw their own conclusions.`;

function formatHumanBlock(profile: ProfileData): string {
  const parts: string[] = ["The user's profile:"];
  const bc = profile.birthChart;
  if (bc) {
    parts.push(`- Birth chart on file: ${bc.name || "Unknown"}, born ${bc.year}-${String(bc.month).padStart(2, "0")}-${String(bc.day).padStart(2, "0")} at ${bc.hour}:${String(bc.minute).padStart(2, "0")}, ${bc.placeName || bc.lat + ", " + bc.lon}`);
    if (bc.bodies) {
      const bodies = Object.entries(bc.bodies).slice(0, 10);
      for (const [key, val] of bodies) {
        parts.push(`  - ${key}: ${val.sign} ${val.house ? `house ${val.house}` : ""} ${val.retrograde ? "(R)" : ""}`);
      }
    }
  }
  const prefs = profile.preferences || {};
  if (prefs.responseStyle) parts.push(`- Prefers ${prefs.responseStyle} responses`);
  if (prefs.customInstructions) parts.push(`- Custom instruction: ${prefs.customInstructions}`);
  return parts.join("\n");
}

function formatRulesBlock(depth: string, matchedPhaseLabels: string[], query: string): string {
  const parts = [
    "Critical rules:",
    "- Cite Atlas phases by number and name",
    "- Flag category errors and risks when relevant",
    "- End with a practice or inquiry when appropriate",
    "- Be concise unless the user asks for depth",
  ];
  if (matchedPhaseLabels.length > 0) {
    parts.push(`- Query relates to: ${matchedPhaseLabels.join(", ")}`);
  }
  if (depth === "deep") {
    parts.push("- Surface assumptions, offer replacement models");
  }
  try {
    const { contextBlock } = buildGraphContext(query);
    parts.push("", contextBlock);
  } catch {}
  return parts.join("\n");
}

// ── Conversation History ─────────────────────────────────────

interface StoredMessage {
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  tool_calls?: OpenAIToolCall[];
  tool_call_id?: string;
}

async function getConversationHistory(db: D1Database, userId: string, limit = 6): Promise<StoredMessage[]> {
  const rows = await db.prepare(
    `SELECT cm.role, cm.content, cm.tool_calls, cm.tool_call_id
     FROM chat_messages cm
     JOIN chat_sessions cs ON cm.session_id = cs.id
     WHERE cs.user_id = ? AND cs.mode = 'atlas'
     ORDER BY cm.created_at DESC LIMIT ?`
  ).bind(userId, limit * 2).all<{ role: string; content: string; tool_calls?: string; tool_call_id?: string }>();

  if (!rows.results) return [];
  return rows.results.reverse().map((r) => ({
    role: r.role as StoredMessage["role"],
    content: r.content,
    tool_calls: r.tool_calls ? JSON.parse(r.tool_calls) : undefined,
    tool_call_id: r.tool_call_id || undefined,
  }));
}

async function saveMessages(
  db: D1Database, userId: string, sessionId: string, messages: StoredMessage[]
) {
  const now = new Date().toISOString();
  for (const msg of messages) {
    await db.prepare(
      "INSERT INTO chat_messages (id, session_id, user_id, role, content, tool_calls, tool_call_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(
      crypto.randomUUID(), sessionId, userId, msg.role, msg.content,
      msg.tool_calls ? JSON.stringify(msg.tool_calls) : null,
      msg.tool_call_id || null, now
    ).run();
  }
  await db.prepare("UPDATE chat_sessions SET updated_at = ? WHERE id = ?").bind(now, sessionId).run();
}

async function getOrCreateSession(db: D1Database, userId: string): Promise<string> {
  const existing = await db.prepare(
    "SELECT id FROM chat_sessions WHERE user_id = ? AND mode = 'atlas' ORDER BY updated_at DESC LIMIT 1"
  ).bind(userId).first<{ id: string }>();
  if (existing) return existing.id;

  const sessionId = crypto.randomUUID();
  await db.prepare(
    "INSERT INTO chat_sessions (id, user_id, mode, title, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)"
  ).bind(sessionId, userId, "atlas", "Atlas Chat", new Date().toISOString(), new Date().toISOString()).run();
  return sessionId;
}

// ── LLM Call (non-streaming, with tools) ─────────────────────

interface LLMMessage {
  role: string;
  content: string;
  tool_call_id?: string;
  tool_calls?: { id: string; type: string; function: { name: string; arguments: string } }[];
}

async function llmCall(
  messages: LLMMessage[],
  tools?: ReturnType<typeof getOpenAITools>
): Promise<{ content: string; tool_calls?: OpenAIToolCall[] }> {
  const body: Record<string, unknown> = {
    model: "deepseek-v4-flash",
    messages,
    temperature: 0.4,
    max_tokens: 2048,
  };
  if (tools && tools.length > 0) {
    body.tools = tools;
    body.tool_choice = "auto";
  }

  const res = await fetch(OPENCODE_API, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${API_KEY}` },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "Unknown error");
    throw new Error(`API error (${res.status}): ${err}`);
  }

  const data = await res.json();
  const choice = data.choices?.[0]?.message;
  return {
    content: choice?.content || "",
    tool_calls: choice?.tool_calls,
  };
}

// ── LLM Call (streaming, no tools) ───────────────────────────

async function* llmStream(
  messages: { role: string; content: string }[]
): AsyncGenerator<string> {
  const res = await fetch(OPENCODE_API, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${API_KEY}` },
    body: JSON.stringify({
      model: "deepseek-v4-flash",
      messages,
      temperature: 0.4,
      max_tokens: 2048,
      stream: true,
    }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "Unknown error");
    throw new Error(`API error (${res.status}): ${err}`);
  }

  const reader = res.body!.getReader();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += new TextDecoder().decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    for (const line of lines) {
      const t = line.trim();
      if (!t || !t.startsWith("data:") || t === "data: [DONE]") continue;
      try {
        const chunk = JSON.parse(t.slice(5).trim());
        const delta = chunk.choices?.[0]?.delta?.content;
        if (delta) yield delta;
      } catch {}
    }
  }
}

// ── POST Handler ─────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { claim } = body;
    const req = request as unknown as { cookies?: { get: (name: string) => { value: string } | undefined } };
    const authSessionId = req.cookies?.get?.("session_id")?.value;
    let clientId = request.headers.get("x-client-id") || null;

    if (authSessionId) {
      try {
        const { env } = getCloudflareContext();
        const db = env.ATLAS_DB as D1Database;
        const session = await db.prepare(
          "SELECT user_id FROM sessions WHERE id = ? AND expires_at >= datetime('now')"
        ).bind(authSessionId).first<{ user_id: string }>();
        if (session) clientId = session.user_id;
      } catch {}
    }

    if (!claim || typeof claim !== "string" || claim.trim().length === 0) {
      return new Response(JSON.stringify({ error: "claim is required" }), {
        status: 400, headers: { "Content-Type": "application/json" },
      });
    }

    const trimmed = claim.trim();
    const { env } = getCloudflareContext();
    const db = env.ATLAS_DB as D1Database;
    getPhaseCache();

    const { depth, matchedPhases } = route(trimmed);

    let profile: ProfileData = {};
    if (clientId) {
      try {
        const row = await db.prepare("SELECT profile FROM users WHERE id = ?").bind(clientId).first<{ profile: string }>();
        if (row) profile = JSON.parse(row.profile || "{}");
      } catch {}
    }

    // Build initial messages
    const human = formatHumanBlock(profile);
    const rules = formatRulesBlock(depth, matchedPhases.map((p) => p.label), trimmed);
    const history = clientId ? await getConversationHistory(db, clientId) : [];
    const tools = getOpenAITools();

    const messages: { role: string; content: string }[] = [
      { role: "system", content: `=== PERSONA ===\n${SYSTEM_PERSONA}\n\n=== HUMAN ===\n${human}\n\n=== RULES ===\n${rules}\n\nRespond naturally. Use the HUMAN block for user-specific context.` },
      ...history.map((h) => ({
        role: h.role,
        content: h.content,
        ...(h.tool_call_id ? { tool_call_id: h.tool_call_id } : {}),
      })),
      { role: "user", content: trimmed },
    ];

    const sessionId = clientId ? await getOrCreateSession(db, clientId) : crypto.randomUUID();

    // ── Tool loop ───────────────────────────────────────────
    // Keep calling the model with tools until it returns a text response.

    let finalContent = "";
    const allMessages: StoredMessage[] = [{ role: "user", content: trimmed }];
    let loopMessages = [...messages];
    let toolCallCount = 0;
    const MAX_TOOL_CALLS = 5;

    while (toolCallCount < MAX_TOOL_CALLS) {
      const result = await llmCall(loopMessages, tools);

      if (result.tool_calls && result.tool_calls.length > 0) {
        // Save assistant message with tool calls
        allMessages.push({
          role: "assistant",
          content: result.content || "",
          tool_calls: result.tool_calls,
        });
        loopMessages.push({
          role: "assistant",
          content: result.content || "",
          tool_calls: result.tool_calls?.map((tc) => ({
            id: tc.id,
            type: tc.type,
            function: tc.function,
          })),
        } as LLMMessage);

        // Execute each tool call
        for (const tc of result.tool_calls) {
          const toolResult = await executeToolCall(db, tc);
          allMessages.push({
            role: "tool",
            content: toolResult.content,
            tool_call_id: tc.id,
          } as StoredMessage);
          loopMessages.push({
            role: "tool",
            tool_call_id: tc.id,
            content: toolResult.content,
          } as LLMMessage);
        }

        toolCallCount++;
        // On next loop, don't pass tools again — let model respond with text
        // Actually, we should still pass tools in case it wants to call more
        continue;
      }

      // Model returned text — we're done with tool loop
      finalContent = result.content;
      allMessages.push({ role: "assistant", content: finalContent });
      break;
    }

    if (toolCallCount >= MAX_TOOL_CALLS && !finalContent) {
      finalContent = "I've reached the maximum number of lookups for this query. Let me summarize what I found.";
      allMessages.push({ role: "assistant", content: finalContent });
    }

    // ── Stream the final response ───────────────────────────
    const encoder = new TextEncoder();
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();

    const analysis = {
      depth,
      matchedPhases: matchedPhases.map((p) => ({ id: p.id, label: p.label, phaseNumber: p.phaseNumber, summary: p.summary })),
      hasBirthChart: !!profile.birthChart,
      toolCalls: toolCallCount,
    };

    writer.write(encoder.encode(`event: memory\ndata: ${JSON.stringify(analysis)}\n\n`));

    // Stream the response
    if (finalContent) {
      // We already have the full response from the non-streaming call
      // Send it as tokens for a consistent client experience
      writer.write(encoder.encode(`event: token\ndata: ${JSON.stringify({ token: finalContent })}\n\n`));
      writer.close();
    } else {
      // Stream from LLM (fallback — should not reach here)
      try {
        for await (const token of llmStream(loopMessages)) {
          writer.write(encoder.encode(`event: token\ndata: ${JSON.stringify({ token })}\n\n`));
        }
      } catch (err) {
        console.error("Stream error:", err);
      }
      writer.close();
    }

    // Save conversation asynchronously
    if (clientId && finalContent) {
      saveMessages(db, clientId, sessionId, allMessages).catch((err) => {
        console.error("Failed to save conversation:", err);
      });
    }

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Agent error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process", details: error instanceof Error ? error.message : "Unknown" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
