// POST /api/account/delete — permanently delete account and all associated data

import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { D1Database } from "@cloudflare/workers-types";

export const dynamic = "force-dynamic";

async function resolveUserId(request: NextRequest): Promise<string | null> {
  const sessionId = request.cookies.get("session_id")?.value;
  if (!sessionId) return null;
  try {
    const { env } = getCloudflareContext();
    const db = env.ATLAS_DB as D1Database;
    const session = await db.prepare(
      "SELECT user_id FROM sessions WHERE id = ? AND expires_at >= datetime('now')"
    ).bind(sessionId).first<{ user_id: string }>();
    return session?.user_id || null;
  } catch { return null; }
}

export async function POST(request: NextRequest) {
  const userId = await resolveUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { env } = getCloudflareContext();
    const db = env.ATLAS_DB as D1Database;

    // Delete in correct order to respect foreign keys
    await db.prepare("DELETE FROM qa_evaluations WHERE qa_record_id IN (SELECT id FROM qa_records WHERE approved_by = ?)").bind(userId).run();
    await db.prepare("DELETE FROM personal_mappings WHERE user_id = ?").bind(userId).run();
    await db.prepare("DELETE FROM chat_messages WHERE user_id = ?").bind(userId).run();
    await db.prepare("DELETE FROM chat_sessions WHERE user_id = ?").bind(userId).run();
    await db.prepare("DELETE FROM journal_entries WHERE user_id = ?").bind(userId).run();
    await db.prepare("DELETE FROM sessions WHERE user_id = ?").bind(userId).run();
    await db.prepare("DELETE FROM users WHERE id = ?").bind(userId).run();

    const response = NextResponse.json({ success: true });
    response.cookies.set("session_id", "", { path: "/", maxAge: 0 });
    response.cookies.set("distillery_auth", "", { path: "/", maxAge: 0 });
    return response;
  } catch (error) {
    console.error("Account deletion error:", error);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}
