import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { date, user_id, packet, signals, dominant_mode, oikodespotes } = body;

    if (!date) {
      return NextResponse.json({ error: "date is required" }, { status: 400 });
    }

    let db: any = null;
    try {
      const { getCloudflareContext } = await import("@opennextjs/cloudflare");
      const ctx = getCloudflareContext();
      db = ctx.env.ATLAS_DB;
    } catch {
      // Running outside Cloudflare (dev mode) — store in memory instead
    }

    if (db) {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      await db.prepare(
        `INSERT INTO astrology_snapshots (id, user_id, date, packet_json, created_at)
         VALUES (?, ?, ?, ?, ?)`
      ).bind(id, user_id || null, date, JSON.stringify(body), now).run();
      return NextResponse.json({ id, date, status: "saved" }, { status: 201 });
    }

    return NextResponse.json({ date, status: "noted", note: "D1 not available in dev mode" });
  } catch (error) {
    console.error("Snapshot error:", error);
    return NextResponse.json({ error: "Failed to save snapshot" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id");
    const days = parseInt(searchParams.get("days") || "7", 10);

    let db: any = null;
    try {
      const { getCloudflareContext } = await import("@opennextjs/cloudflare");
      const ctx = getCloudflareContext();
      db = ctx.env.ATLAS_DB;
    } catch { }

    if (!db) {
      return NextResponse.json({ snapshots: [], note: "D1 not available in dev mode" });
    }

    if (!user_id) {
      return NextResponse.json({ error: "user_id required" }, { status: 400 });
    }

    const since = new Date();
    since.setDate(since.getDate() - days);

    const rows = await db.prepare(
      `SELECT * FROM astrology_snapshots
       WHERE user_id = ? AND date >= ?
       ORDER BY date DESC LIMIT 90`
    ).bind(user_id, since.toISOString().split("T")[0]).all();

    return NextResponse.json({
      snapshots: (rows.results || []).map((r: any) => ({
        id: r.id, date: r.date, packet: JSON.parse(r.packet_json || "{}"), createdAt: r.created_at,
      })),
    });
  } catch (error) {
    console.error("Snapshot GET error:", error);
    return NextResponse.json({ error: "Failed to load snapshots" }, { status: 500 });
  }
}
