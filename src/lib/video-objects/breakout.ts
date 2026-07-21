import type { BeatPerformance, BreakoutReference, ChannelBaseline, RetentionPoint, TimedBeat } from "./types";

export function median(values: number[]): number | null {
  const clean = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (clean.length === 0) return null;
  const middle = Math.floor(clean.length / 2);
  return clean.length % 2 === 0
    ? (clean[middle - 1] + clean[middle]) / 2
    : clean[middle];
}

export function safeRatio(value: number, baseline: number | null): number | null {
  if (baseline === null || baseline <= 0) return null;
  return Math.round((value / baseline) * 100) / 100;
}

export function buildBaseline(input: {
  channelId: string;
  subscriberCount: number | null;
  videos: Array<{ videoId: string; viewCount: number; viewsPerDay: number }>;
  windowSize?: number;
}): ChannelBaseline {
  const windowSize = input.windowSize ?? 12;
  const videos = input.videos.slice(0, windowSize);
  return {
    channel_id: input.channelId,
    subscriber_count: input.subscriberCount,
    sample_size: videos.length,
    sample_video_ids: videos.map((video) => video.videoId),
    median_views: median(videos.map((video) => video.viewCount)),
    median_views_per_day: median(videos.map((video) => video.viewsPerDay)),
    method: "prior_longform_uploads",
    window_size: windowSize,
    ...(videos.length < 3 ? { unavailable_reason: "Fewer than three comparable prior long-form uploads." } : {}),
  };
}

export function attachBreakout(
  reference: Omit<BreakoutReference, "breakout">,
): BreakoutReference {
  const viewsRatio = safeRatio(reference.view_count, reference.channel_baseline.median_views);
  const velocityRatio = safeRatio(reference.views_per_day, reference.channel_baseline.median_views_per_day);
  return {
    ...reference,
    breakout: {
      views_ratio: viewsRatio,
      velocity_ratio: velocityRatio,
      is_breakout: (viewsRatio ?? 0) >= 3 || (velocityRatio ?? 0) >= 4,
      rule: "views>=3x_baseline_or_velocity>=4x_baseline",
    },
  };
}

function average(values: number[]): number | null {
  return values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
}

export function mapRetentionToBeats(points: RetentionPoint[], beats: TimedBeat[]): BeatPerformance[] {
  return beats.map((beat) => {
    const within = points.filter(
      (point) => point.elapsed_seconds >= beat.start_seconds && point.elapsed_seconds <= beat.end_seconds,
    );
    const first = within.at(0)?.audience_watch_ratio ?? null;
    const last = within.at(-1)?.audience_watch_ratio ?? null;
    const relative = within
      .map((point) => point.relative_retention_performance)
      .filter((value): value is number => value !== null);
    return {
      beat_id: beat.beat_id,
      average_audience_watch_ratio: average(within.map((point) => point.audience_watch_ratio)),
      retention_start: first,
      retention_end: last,
      retention_delta: first !== null && last !== null ? last - first : null,
      average_relative_retention: average(relative),
      point_count: within.length,
    };
  });
}
