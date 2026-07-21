// GET /api/journal/:id — single entry with phase mappings
// DELETE /api/journal/:id — delete entry and its mappings

import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { D1Database } from "@cloudflare/workers-types";

export const dynamic = "force-dynamic";

function getClientId(request: NextRequest): string | null {
  const auth = request.headers.get("x-client-id");
  if (auth && auth.length >= 8) return auth;
  return null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const clientId = getClientId(request);
  if (!clientId) {
    return NextResponse.json({ error: "x-client-id header required" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { env } = getCloudflareContext();
    const db = env.ATLAS_DB as D1Database;

    const entry = await db.prepare(
      "SELECT * FROM journal_entries WHERE id = ? AND user_id = ?"
    ).bind(id, clientId).first<Record<string, unknown>>();

    if (!entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    // Get phase mappings
    const mappings = await db.prepare(
      "SELECT * FROM personal_mappings WHERE journal_entry_id = ? AND user_id = ?"
    ).bind(id, clientId).all<Record<string, unknown>>();

    return NextResponse.json({
      id: entry.id,
      kind: entry.kind,
      title: entry.title || null,
      text: entry.text,
      createdAt: entry.created_at,
      updatedAt: entry.updated_at || null,
      mappings: (mappings.results || []).map((m) => ({
        id: m.id,
        phaseId: m.global_phase,
        riskId: m.global_risk,
        correctiveId: m.global_corrective,
        practice: m.global_practice,
        suggestedAction: m.suggested_next_action,
        userApproved: !!m.user_approved,
        createdAt: m.created_at,
      })),
    });
  } catch (error) {
    console.error("Journal entry GET error:", error);
    return NextResponse.json({ error: "Failed to load entry" }, { status: 500 });
  }
}

// DELETE /api/journal/:id — delete entry and its mappings

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const clientId = getClientId(request);
  if (!clientId) {
    return NextResponse.json({ error: "x-client-id header required" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { env } = getCloudflareContext();
    const db = env.ATLAS_DB as D1Database;

    // Verify ownership
    const entry = await db.prepare(
      "SELECT id FROM journal_entries WHERE id = ? AND user_id = ?"
    ).bind(id, clientId).first<{ id: string }>();

    if (!entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    // Delete mappings first (FK cascade should handle this, but explicit is cleaner)
    await db.prepare("DELETE FROM personal_mappings WHERE journal_entry_id = ?").bind(id).run();
    await db.prepare("DELETE FROM journal_entries WHERE id = ?").bind(id).run();

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error("Journal entry DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete entry" }, { status: 500 });
  }
}
