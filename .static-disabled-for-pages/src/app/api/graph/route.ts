import { NextResponse } from "next/server";
import { loadGraph } from "@/atlas/graph/loadGraph";

export const dynamic = "force-static";

export async function GET() {
  try {
    const graph = loadGraph();
    return NextResponse.json(graph);
  } catch (error) {
    console.error("Failed to load graph:", error);
    return NextResponse.json(
      { error: "Failed to load graph" },
      { status: 500 }
    );
  }
}
