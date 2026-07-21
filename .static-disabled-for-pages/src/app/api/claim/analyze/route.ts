import { NextRequest, NextResponse } from "next/server";
import { classifyClaim } from "@/atlas/ai/classifyClaim";

export const dynamic = "force-dynamic";

const RECENT_CLAIMS_CACHE = new Map<string, { result: unknown; timestamp: number }>();
const CACHE_TTL_MS = 60_000; // 1 minute

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { claim, mode = "atlas" } = body;

    if (!claim || typeof claim !== "string" || claim.trim().length === 0) {
      return NextResponse.json(
        { error: "claim is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    const trimmed = claim.trim();

    // Check cache
    const cacheKey = `${mode}:${trimmed.toLowerCase()}`;
    const cached = RECENT_CLAIMS_CACHE.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json(cached.result);
    }

    const result = await classifyClaim(trimmed, { mode });

    // Cache result
    RECENT_CLAIMS_CACHE.set(cacheKey, { result, timestamp: Date.now() });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Claim analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze claim" },
      { status: 500 }
    );
  }
}
