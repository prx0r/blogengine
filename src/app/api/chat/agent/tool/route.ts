// Tool execution endpoint for Letta agent.
// The LLM can request graph queries and writes via this endpoint.
// POST /api/chat/agent/tool

import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { D1Database } from "@cloudflare/workers-types";
import { getTool } from "@/atlas/db/graph-tools";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { toolName, arguments: args } = body as { toolName?: string; arguments?: Record<string, unknown> };

    if (!toolName) {
      return NextResponse.json({ error: "toolName is required" }, { status: 400 });
    }

    const tool = getTool(toolName);
    if (!tool) {
      return NextResponse.json({ error: `Unknown tool: ${toolName}` }, { status: 400 });
    }

    if (!args || typeof args !== "object") {
      return NextResponse.json({ error: "arguments object is required" }, { status: 400 });
    }

    const { env } = getCloudflareContext();
    const db = env.ATLAS_DB as D1Database;

    const result = await tool.handler(db, args);

    return NextResponse.json({ result });
  } catch (error) {
    console.error("Tool execution error:", error);
    return NextResponse.json({
      error: "Tool execution failed",
      details: error instanceof Error ? error.message : "Unknown",
    }, { status: 500 });
  }
}
