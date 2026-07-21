import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const offset = parseInt(searchParams.get("offset") || "0");
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);

  let sql = `select id, distilled_title, distilled_body, category, created_at, original_url from entries`;
  const params: unknown[] = [];

  if (category && category !== "all") {
    sql += ` where category = $1`;
    params.push(category);
  }

  sql += ` order by created_at desc limit $${params.length + 1} offset $${params.length + 2}`;
  params.push(limit, offset);

  const result = await query(sql, params);
  return NextResponse.json(result.rows);
}
