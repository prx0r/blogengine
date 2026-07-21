import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  const result = await query("select * from sources order by name");
  return NextResponse.json(result.rows);
}

export async function POST(request: Request) {
  const { url, name, kind, category } = await request.json();
  if (!url || !name) {
    return NextResponse.json({ error: "url and name required" }, { status: 400 });
  }

  const result = await query(
    `insert into sources (url, name, kind, category) values ($1, $2, $3, $4)
     returning *`,
    [url, name, kind || "rss", category || "unsorted"]
  );

  return NextResponse.json(result.rows[0], { status: 201 });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  await query("delete from sources where id = $1", [id]);
  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request) {
  const { id, active } = await request.json();
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const result = await query(
    `update sources set active = $1 where id = $2 returning *`,
    [active, id]
  );

  if (result.rows.length === 0) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  return NextResponse.json(result.rows[0]);
}
