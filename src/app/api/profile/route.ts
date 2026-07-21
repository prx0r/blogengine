import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { updateProfile, getProfile } from "@/atlas/db/d1";
import type { ProfileData } from "@/atlas/db/d1";
import type { D1Database } from "@cloudflare/workers-types";

export const dynamic = "force-dynamic";

async function resolveUserId(request: NextRequest): Promise<string | null> {
  // Try session cookie first
  const sessionId = request.cookies.get("session_id")?.value;
  if (sessionId) {
    try {
      const { env } = getCloudflareContext();
      const db = env.ATLAS_DB as D1Database;
      const session = await db.prepare(
        "SELECT user_id FROM sessions WHERE id = ? AND expires_at >= datetime('now')"
      ).bind(sessionId).first<{ user_id: string }>();
      if (session) return session.user_id;
    } catch {}
  }
  // Fall back to x-client-id header
  const auth = request.headers.get("x-client-id");
  if (auth && auth.length >= 8) return auth;
  return null;
}

// GET /api/profile — retrieve full profile
export async function GET(request: NextRequest) {
  const clientId = await resolveUserId(request);
  if (!clientId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const { env } = getCloudflareContext();
    const db = env.ATLAS_DB;
    const profile = await getProfile(db, clientId);
    return NextResponse.json({ clientId, profile });
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json({ error: "Failed to get profile" }, { status: 500 });
  }
}

// PATCH /api/profile — update profile fields (merge)
export async function PATCH(request: NextRequest) {
  const clientId = await resolveUserId(request);
  if (!clientId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { birthChart } = body as Partial<ProfileData>;

    if (!birthChart && Object.keys(body).length === 0) {
      return NextResponse.json({ error: "No profile data provided" }, { status: 400 });
    }

    const { env } = getCloudflareContext();
    const db = env.ATLAS_DB;
    const updates: Partial<ProfileData> = {};
    if (birthChart) updates.birthChart = birthChart;
    const merged = await updateProfile(db, clientId, updates);
    return NextResponse.json({ clientId, profile: merged });
  } catch (error) {
    console.error("Profile PATCH error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
