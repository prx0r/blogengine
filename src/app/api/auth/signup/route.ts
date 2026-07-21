// POST /api/auth/signup — create account with username + password

import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { D1Database } from "@cloudflare/workers-types";
import { hashPassword } from "@/lib/password";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || typeof username !== "string" || username.trim().length < 3) {
      return NextResponse.json({ error: "Username must be at least 3 characters" }, { status: 400 });
    }
    if (!password || typeof password !== "string" || password.length < 4) {
      return NextResponse.json({ error: "Password must be at least 4 characters" }, { status: 400 });
    }

    const cleaned = username.trim().toLowerCase();

    const { env } = getCloudflareContext();
    const db = env.ATLAS_DB as D1Database;

    // Check if username taken
    const existing = await db.prepare("SELECT id FROM users WHERE email = ?").bind(cleaned).first();
    if (existing) {
      return NextResponse.json({ error: "Username already taken" }, { status: 409 });
    }

    const id = crypto.randomUUID();
    const passwordHash = await hashPassword(password);

    await db.prepare(
      "INSERT INTO users (id, email, password_hash, display_name) VALUES (?, ?, ?, ?)"
    ).bind(id, cleaned, passwordHash, cleaned).run();

    // Create session
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    await db.prepare(
      "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)"
    ).bind(sessionId, id, expiresAt).run();

    const response = NextResponse.json({ success: true, id, username: cleaned });
    response.cookies.set("session_id", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });
    return response;
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}
