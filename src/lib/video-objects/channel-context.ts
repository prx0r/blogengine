import fs from "node:fs";
import path from "node:path";
import type { MarketSnapshot, OwnChannelVideoEvidence, VideoObject } from "./types";

function videoObjectPaths(rootDir: string): string[] {
  if (!fs.existsSync(rootDir)) return [];
  return fs.readdirSync(rootDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(rootDir, entry.name, "video.json"))
    .filter(fs.existsSync);
}

export function collectOwnChannelEvidence(input: {
  rootDir?: string;
  excludeVoId?: string;
  limit?: number;
} = {}): OwnChannelVideoEvidence[] {
  const evidence: OwnChannelVideoEvidence[] = [];
  const rootDir = input.rootDir ?? path.resolve("content/video-objects");
  for (const filePath of videoObjectPaths(rootDir)) {
    let video: VideoObject;
    try {
      video = JSON.parse(fs.readFileSync(filePath, "utf8")) as VideoObject;
    } catch {
      continue;
    }
    const youtubeVideoId = video.publication?.youtube_video_id;
    const ingestedAt = video.analytics?.last_ingested_at;
    const summary = video.analytics?.summary;
    if (!youtubeVideoId || !ingestedAt || !summary || video.vo_id === input.excludeVoId) continue;
    const performance = new Map(
      video.analytics.beat_performance.map((beat) => [beat.beat_id, beat]),
    );
    evidence.push({
      vo_id: video.vo_id,
      youtube_video_id: youtubeVideoId,
      published_at: video.publication.published_at,
      analytics_ingested_at: ingestedAt,
      title: video.packaging.title,
      thumbnail_argument: video.packaging.thumbnail.argument,
      hook: video.packaging.hook,
      mode: video.mode,
      natural_form: video.premise.natural_form,
      word_count: video.production.word_count,
      duration_seconds: video.production.estimated_duration_seconds,
      summary,
      beats: video.production.beats.map((beat) => {
        const result = performance.get(beat.beat_id);
        return {
          beat_id: beat.beat_id,
          label: beat.label,
          rhetorical_role: beat.rhetorical_role,
          average_audience_watch_ratio: result?.average_audience_watch_ratio ?? null,
          retention_delta: result?.retention_delta ?? null,
          average_relative_retention: result?.average_relative_retention ?? null,
        };
      }),
    });
  }
  return evidence
    .sort((a, b) => b.analytics_ingested_at.localeCompare(a.analytics_ingested_at))
    .slice(0, input.limit ?? 12);
}

export function attachOwnChannelEvidence(
  market: MarketSnapshot,
  evidence: OwnChannelVideoEvidence[],
): MarketSnapshot {
  return {
    ...market,
    own_channel_evidence: evidence,
    notes: [
      ...market.notes,
      evidence.length > 0
        ? `Commission context includes private analytics from ${evidence.length} prior Light in Form video(s).`
        : "No prior Light in Form analytics were available; commission relies on Research Objects and public market evidence.",
    ],
  };
}
