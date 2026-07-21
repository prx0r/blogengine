// GET /api/journal/:id/map — get phase/risk/corrective mapping for a journal entry
// POST /api/journal/:id/map — run journal mapping pipeline (re-classify text against graph)

import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { D1Database } from "@cloudflare/workers-types";
import { searchPhases } from "@/atlas/graph/phaseCache";

export const dynamic = "force-dynamic";

function getClientId(request: NextRequest): string | null {
  const auth = request.headers.get("x-client-id");
  if (auth && auth.length >= 8) return auth;
  return null;
}

// ── Mapping logic (shared between GET and POST) ────────────────

function classifyText(text: string): { phaseId: string; phaseLabel: string }[] {
  const matched = searchPhases(text);
  return matched.map((p) => ({ phaseId: p.id, phaseLabel: p.label }));
}

// ── GET /api/journal/:id/map — fetch existing mappings ──────────

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

    // Verify entry exists and belongs to user
    const entry = await db.prepare(
      "SELECT id, kind, text FROM journal_entries WHERE id = ? AND user_id = ?"
    ).bind(id, clientId).first<Record<string, unknown>>();

    if (!entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    const mappings = await db.prepare(
      "SELECT * FROM personal_mappings WHERE journal_entry_id = ? AND user_id = ? ORDER BY created_at DESC"
    ).bind(id, clientId).all<Record<string, unknown>>();

    return NextResponse.json({
      entryId: id,
      text: entry.text,
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
    console.error("Journal map GET error:", error);
    return NextResponse.json({ error: "Failed to load mappings" }, { status: 500 });
  }
}

// ── POST /api/journal/:id/map — run mapping pipeline ────────────

export async function POST(
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

    // Verify entry exists
    const entry = await db.prepare(
      "SELECT id, text FROM journal_entries WHERE id = ? AND user_id = ?"
    ).bind(id, clientId).first<{ id: string; text: string }>();

    if (!entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    // Delete old mappings
    await db.prepare(
      "DELETE FROM personal_mappings WHERE journal_entry_id = ? AND user_id = ?"
    ).bind(id, clientId).run();

    // Classify text against atlas phases
    const phases = classifyText(entry.text);
    const now = new Date().toISOString();
    const newMappings: { phaseId: string; phaseLabel: string; mappingId: string }[] = [];

    for (const phase of phases) {
      const mappingId = crypto.randomUUID();
      await db.prepare(
        "INSERT INTO personal_mappings (id, journal_entry_id, user_id, global_phase, created_at) VALUES (?, ?, ?, ?, ?)"
      ).bind(mappingId, id, clientId, phase.phaseId, now).run();
      newMappings.push({ ...phase, mappingId });
    }

    return NextResponse.json({
      entryId: id,
      mappings: newMappings,
      total: newMappings.length,
    });
  } catch (error) {
    console.error("Journal map POST error:", error);
    return NextResponse.json({ error: "Failed to map entry" }, { status: 500 });
  }
}
