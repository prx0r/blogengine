// POST /api/auth/login — authenticate with username + password

import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { D1Database } from "@cloudflare/workers-types";
import { verifyPassword } from "@/lib/password";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 });
    }

    const cleaned = username.trim().toLowerCase();

    const { env } = getCloudflareContext();
    const db = env.ATLAS_DB as D1Database;

    const user = await db.prepare(
      "SELECT id, email, password_hash, display_name FROM users WHERE email = ?"
    ).bind(cleaned).first<{ id: string; email: string; password_hash: string; display_name: string }>();

    if (!user) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    // Create session
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    await db.prepare(
      "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)"
    ).bind(sessionId, user.id, expiresAt).run();

    const response = NextResponse.json({ success: true, id: user.id, username: user.display_name });
    response.cookies.set("session_id", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });
    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Failed to log in" }, { status: 500 });
  }
}
