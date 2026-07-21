// POST /api/settings/password — change password

import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { D1Database } from "@cloudflare/workers-types";
import { hashPassword, verifyPassword } from "@/lib/password";

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
    const { currentPassword, newPassword } = await request.json();
    if (!currentPassword || !newPassword || newPassword.length < 4) {
      return NextResponse.json({ error: "Invalid password" }, { status: 400 });
    }

    const { env } = getCloudflareContext();
    const db = env.ATLAS_DB as D1Database;

    const user = await db.prepare("SELECT password_hash FROM users WHERE id = ?").bind(userId).first<{ password_hash: string }>();
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const valid = await verifyPassword(currentPassword, user.password_hash);
    if (!valid) return NextResponse.json({ error: "Current password is wrong" }, { status: 403 });

    const newHash = await hashPassword(newPassword);
    await db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").bind(newHash, userId).run();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Password change error:", error);
    return NextResponse.json({ error: "Failed to change password" }, { status: 500 });
  }
}
