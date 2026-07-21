// GET /api/user/patterns — aggregate practice streaks, phase engagement, temporal trends
// Returns summary of recent activity from journal_entries + personal_mappings

import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { D1Database } from "@cloudflare/workers-types";

export const dynamic = "force-dynamic";

function getClientId(request: NextRequest): string | null {
  const auth = request.headers.get("x-client-id");
  if (auth && auth.length >= 8) return auth;
  return null;
}

export async function GET(request: NextRequest) {
  const clientId = getClientId(request);
  if (!clientId) {
    return NextResponse.json({ error: "x-client-id header required" }, { status: 401 });
  }

  try {
    const { env } = getCloudflareContext();
    const db = env.ATLAS_DB as D1Database;

    // Total entry count
    const totalResult = await db.prepare(
      "SELECT COUNT(*) as count FROM journal_entries WHERE user_id = ?"
    ).bind(clientId).first<{ count: number }>();

    // Entry count by kind
    const byKind = await db.prepare(
      "SELECT kind, COUNT(*) as count FROM journal_entries WHERE user_id = ? GROUP BY kind ORDER BY count DESC"
    ).bind(clientId).all<{ kind: string; count: number }>();

    // Recent activity (last 7 days)
    const recentResult = await db.prepare(
      "SELECT COUNT(*) as count FROM journal_entries WHERE user_id = ? AND created_at >= datetime('now', '-7 days')"
    ).bind(clientId).first<{ count: number }>();

    // Practice streak: consecutive days with at least one entry
    const allDates = await db.prepare(
      "SELECT DISTINCT date(created_at) as d FROM journal_entries WHERE user_id = ? ORDER BY d DESC"
    ).bind(clientId).all<{ d: string }>();

    let currentStreak = 0;
    if (allDates.results && allDates.results.length > 0) {
      const today = new Date().toISOString().split("T")[0];
      let checkDate = today;
      for (const row of allDates.results) {
        while (checkDate > row.d) {
          checkDate = new Date(new Date(checkDate).getTime() - 86400000).toISOString().split("T")[0];
          if (checkDate !== row.d) break;
        }
        if (checkDate === row.d) {
          currentStreak++;
          checkDate = new Date(new Date(checkDate).getTime() - 86400000).toISOString().split("T")[0];
        } else {
          break;
        }
      }
    }

    // Phase engagement: which phases have the most journal mappings
    const phaseEngagement = await db.prepare(
      `SELECT pm.global_phase, COUNT(*) as count
       FROM personal_mappings pm
       WHERE pm.user_id = ?
       GROUP BY pm.global_phase
       ORDER BY count DESC
       LIMIT 10`
    ).bind(clientId).all<{ global_phase: string; count: number }>();

    // Recent practice sessions
    const recentPractices = await db.prepare(
      "SELECT id, kind, title, text, created_at FROM journal_entries WHERE user_id = ? AND kind IN ('practice_session', 'ritual_note', 'meditation') ORDER BY created_at DESC LIMIT 5"
    ).bind(clientId).all<Record<string, unknown>>();

    return NextResponse.json({
      summary: {
        totalEntries: totalResult?.count || 0,
        currentStreak,
        entriesThisWeek: recentResult?.count || 0,
      },
      byKind: (byKind.results || []).map((r) => ({ kind: r.kind, count: r.count })),
      phaseEngagement: (phaseEngagement.results || []).map((r) => ({
        phaseId: r.global_phase,
        count: r.count,
      })),
      recentPractices: (recentPractices.results || []).map((r) => ({
        id: r.id,
        kind: r.kind,
        title: r.title || null,
        createdAt: r.created_at,
      })),
    });
  } catch (error) {
    console.error("Patterns GET error:", error);
    return NextResponse.json({ error: "Failed to load patterns" }, { status: 500 });
  }
}
