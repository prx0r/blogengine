// GET /api/me — returns current user info from session cookie
// Used by the client to check if logged in and get user data.

import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { D1Database } from "@cloudflare/workers-types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const sessionId = request.cookies.get("session_id")?.value;
  if (!sessionId) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }

  try {
    const { env } = getCloudflareContext();
    const db = env.ATLAS_DB as D1Database;

    const session = await db.prepare(
      "SELECT user_id, expires_at FROM sessions WHERE id = ? AND expires_at >= datetime('now')"
    ).bind(sessionId).first<{ user_id: string; expires_at: string }>();

    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    const user = await db.prepare(
      "SELECT id, email, display_name, avatar_url, role, profile FROM users WHERE id = ?"
    ).bind(session.user_id).first<Record<string, unknown>>();

    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    return NextResponse.json({
      authenticated: true,
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      avatarUrl: user.avatar_url,
      role: user.role,
      profile: JSON.parse((user.profile as string) || "{}"),
    });
  } catch (error) {
    console.error("Me endpoint error:", error);
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }
}
