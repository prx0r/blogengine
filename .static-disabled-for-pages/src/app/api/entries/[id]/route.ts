import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await query("select * from entries where id = $1", [id]);
  if (result.rows.length === 0) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  await query("update entries set read = true where id = $1", [id]);

  return NextResponse.json(result.rows[0]);
}
