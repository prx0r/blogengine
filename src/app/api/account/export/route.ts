// GET /api/account/export — export all user data as JSON

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

export async function GET(request: NextRequest) {
  const userId = await resolveUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { env } = getCloudflareContext();
    const db = env.ATLAS_DB as D1Database;

    const [user, journal, sessions, chats] = await Promise.all([
      db.prepare("SELECT id, email, display_name, role, created_at, profile FROM users WHERE id = ?").bind(userId).first(),
      db.prepare("SELECT id, kind, title, text, created_at FROM journal_entries WHERE user_id = ? ORDER BY created_at DESC").bind(userId).all(),
      db.prepare("SELECT id, created_at, expires_at FROM sessions WHERE user_id = ? ORDER BY created_at DESC").bind(userId).all(),
      db.prepare("SELECT cm.role, cm.content, cm.created_at, cs.mode FROM chat_messages cm JOIN chat_sessions cs ON cm.session_id = cs.id WHERE cm.user_id = ? ORDER BY cm.created_at DESC LIMIT 500").bind(userId).all(),
    ]);

    return NextResponse.json({
      exportedAt: new Date().toISOString(),
      user: user ? {
        id: (user as any).id,
        email: (user as any).email,
        displayName: (user as any).display_name,
        role: (user as any).role,
        createdAt: (user as any).created_at,
        profile: (user as any).profile,
      } : null,
      journalEntries: (journal.results || []).map((r: any) => ({
        id: r.id, kind: r.kind, title: r.title, createdAt: r.created_at,
      })),
      sessions: (sessions.results || []).length,
      recentChats: (chats.results || []).slice(0, 50),
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
