// POST /api/feedback — store user feedback on a response, update preferences
// Body: { messageId?: string, rating: 1-5, topic?: string, comment?: string }

import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { D1Database } from "@cloudflare/workers-types";
import { updateProfile, getProfile } from "@/atlas/db/d1";
import type { ProfileData } from "@/atlas/db/d1";

export const dynamic = "force-dynamic";

function getClientId(request: NextRequest): string | null {
  const auth = request.headers.get("x-client-id");
  if (auth && auth.length >= 8) return auth;
  return null;
}

export async function POST(request: NextRequest) {
  const clientId = getClientId(request);
  if (!clientId) {
    return NextResponse.json({ error: "x-client-id header required" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { rating, topic, comment } = body as {
      rating?: number; topic?: string; comment?: string;
    };

    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "rating must be a number 1-5" }, { status: 400 });
    }

    const { env } = getCloudflareContext();
    const db = env.ATLAS_DB as D1Database;

    // Load current profile
    const profile = await getProfile(db, clientId);

    // Aggregate feedback
    const feedback = profile.preferences?.feedback || {
      totalRatings: 0,
      averageRating: 0,
      byTopic: {},
      recentComments: [],
    };

    feedback.totalRatings = (feedback.totalRatings || 0) + 1;
    const prevTotal = feedback.totalRatings - 1;
    feedback.averageRating = prevTotal > 0
      ? ((feedback.averageRating * prevTotal) + rating) / feedback.totalRatings
      : rating;

    if (topic) {
      if (!feedback.byTopic[topic]) {
        feedback.byTopic[topic] = { count: 0, average: 0 };
      }
      const t = feedback.byTopic[topic];
      t.count = (t.count || 0) + 1;
      t.average = t.count > 1
        ? ((t.average * (t.count - 1)) + rating) / t.count
        : rating;
    }

    if (comment) {
      feedback.recentComments = [
        { rating, comment, topic: topic || null, date: new Date().toISOString() },
        ...(feedback.recentComments || []),
      ].slice(0, 20); // keep last 20
    }

    // Adjust preferences based on feedback patterns
    const adjustments: Partial<ProfileData["preferences"]> = {};
    if (feedback.totalRatings >= 5) {
      // Check topic-specific trends
      for (const [t, stats] of Object.entries(feedback.byTopic)) {
        const s = stats as { count: number; average: number };
        if (s.average < 3 && s.count >= 3) {
          // Low-rated topic — reduce astrological influence for this topic
          if (t === "astrology" && profile.preferences?.birthChartInfluence) {
            adjustments.birthChartInfluence = Math.max(0, (profile.preferences.birthChartInfluence || 50) - 10);
          }
        }
      }

      // General style adjustment from low ratings with verbosity comments
      const lowRatings = feedback.recentComments.filter(
        (c: { rating: number }) => c.rating <= 2
      );
      if (lowRatings.length >= 3) {
        const verbosityComments = lowRatings.filter(
          (c: { comment?: string }) => c.comment && /verbose|long|wordy|concise|shorter/i.test(c.comment || "")
        ) as { comment: string }[];
        if (verbosityComments.length >= 2) {
          adjustments.responseStyle = "concise";
        }
      }
    }

    // Save updated profile
    const updates: Partial<ProfileData> = {
      preferences: {
        ...(profile.preferences || {}),
        ...adjustments,
        feedback,
      },
    };
    await updateProfile(db, clientId, updates);

    return NextResponse.json({
      success: true,
      rating,
      adjusted: Object.keys(adjustments).length > 0 ? adjustments : undefined,
      averageRating: feedback.averageRating,
      totalRatings: feedback.totalRatings,
    });
  } catch (error) {
    console.error("Feedback POST error:", error);
    return NextResponse.json({ error: "Failed to store feedback" }, { status: 500 });
  }
}
