import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { searchPhases } from "@/atlas/graph/phaseCache";
import type { D1Database } from "@cloudflare/workers-types";

export const dynamic = "force-dynamic";

const ALLOWED_KINDS = [
  "journal_entry", "dream", "practice_session", "insight",
  "question", "symbol", "risk_event", "mood_pattern",
  "book_note", "ritual_note", "guidance_hypothesis", "progress_marker",
] as const;

type JournalKind = typeof ALLOWED_KINDS[number];

function getClientId(request: NextRequest): string | null {
  const auth = request.headers.get("x-client-id");
  if (auth && auth.length >= 8) return auth;
  return null;
}

function validateKind(kind: string): kind is JournalKind {
  return ALLOWED_KINDS.includes(kind as JournalKind);
}

// ── Auto-classify text against Atlas phases ─────────────────────

function classifyText(text: string): { phaseIds: string[]; phaseLabels: string[] } {
  const matched = searchPhases(text);
  return {
    phaseIds: matched.map((p) => p.id),
    phaseLabels: matched.map((p) => p.label),
  };
}

// ── POST /api/journal — create entry ────────────────────────────

export async function POST(request: NextRequest) {
  const clientId = getClientId(request);
  if (!clientId) {
    return NextResponse.json({ error: "x-client-id header required" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { kind, title, text } = body as { kind?: string; title?: string; text?: string };

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }
    if (kind && !validateKind(kind)) {
      return NextResponse.json({ error: `invalid kind: ${kind}. Valid: ${ALLOWED_KINDS.join(", ")}` }, { status: 400 });
    }

    const { env } = getCloudflareContext();
    const db = env.ATLAS_DB as D1Database;

    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const entryKind = kind || "journal_entry";

    await db.prepare(
      "INSERT INTO journal_entries (id, user_id, kind, title, text, created_at) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(id, clientId, entryKind, title || null, text.trim(), now).run();

    // Auto-classify against Atlas phases
    const { phaseIds, phaseLabels } = classifyText(text.trim());

    // Store mappings
    for (const phaseId of phaseIds) {
      const mappingId = crypto.randomUUID();
      await db.prepare(
        "INSERT INTO personal_mappings (id, journal_entry_id, user_id, global_phase, created_at) VALUES (?, ?, ?, ?, ?)"
      ).bind(mappingId, id, clientId, phaseId, now).run();
    }

    return NextResponse.json({
      id,
      kind: entryKind,
      title: title || null,
      text: text.trim(),
      createdAt: now,
      mappings: phaseIds.map((pid, i) => ({ phaseId: pid, phaseLabel: phaseLabels[i] || pid })),
    }, { status: 201 });
  } catch (error) {
    console.error("Journal POST error:", error);
    return NextResponse.json({ error: "Failed to create entry" }, { status: 500 });
  }
}

// ── GET /api/journal — list entries ─────────────────────────────

export async function GET(request: NextRequest) {
  const clientId = getClientId(request);
  if (!clientId) {
    return NextResponse.json({ error: "x-client-id header required" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const kind = searchParams.get("kind");
    const offset = Math.max(0, parseInt(searchParams.get("offset") || "0", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));

    if (kind && !validateKind(kind)) {
      return NextResponse.json({ error: `invalid kind: ${kind}` }, { status: 400 });
    }

    const { env } = getCloudflareContext();
    const db = env.ATLAS_DB as D1Database;

    let query = "SELECT * FROM journal_entries WHERE user_id = ?";
    const params: unknown[] = [clientId];

    if (kind) {
      query += " AND kind = ?";
      params.push(kind);
    }

    // Get total count
    const countQuery = query.replace("SELECT *", "SELECT COUNT(*) as total");
    const countResult = await db.prepare(countQuery).bind(...params).first<{ total: number }>();

    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const rows = await db.prepare(query).bind(...params).all<Record<string, unknown>>();
    const entries = (rows.results || []).map((r) => ({
      id: r.id,
      kind: r.kind,
      title: r.title || null,
      text: r.text,
      createdAt: r.created_at,
      updatedAt: r.updated_at || null,
    }));

    return NextResponse.json({
      entries,
      total: countResult?.total || 0,
      offset,
      limit,
    });
  } catch (error) {
    console.error("Journal GET error:", error);
    return NextResponse.json({ error: "Failed to list entries" }, { status: 500 });
  }
}
