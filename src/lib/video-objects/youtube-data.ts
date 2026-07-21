import { attachBreakout, buildBaseline } from "./breakout";
import type { BreakoutReference, DiscoveryLens, MarketSnapshot } from "./types";

const DATA_API_ROOT = "https://www.googleapis.com/youtube/v3";

interface SearchItem {
  id?: { videoId?: string };
  snippet?: { publishedAt?: string; channelId?: string; title?: string };
}

interface VideoItem {
  id: string;
  snippet?: {
    publishedAt?: string;
    channelId?: string;
    channelTitle?: string;
    title?: string;
    thumbnails?: Record<string, { url?: string; width?: number }>;
  };
  contentDetails?: { duration?: string };
  statistics?: { viewCount?: string; likeCount?: string; commentCount?: string };
}

interface ChannelItem {
  id: string;
  contentDetails?: { relatedPlaylists?: { uploads?: string } };
  statistics?: { subscriberCount?: string; hiddenSubscriberCount?: boolean };
}

interface PlaylistItem {
  contentDetails?: { videoId?: string };
  snippet?: { resourceId?: { videoId?: string } };
}

interface ListResponse<T> {
  items?: T[];
  nextPageToken?: string;
  error?: { message?: string };
}

interface HydratedVideo {
  videoId: string;
  title: string;
  channelId: string;
  channelTitle: string;
  publishedAt: string;
  durationSeconds: number;
  viewCount: number;
  likeCount: number | null;
  commentCount: number | null;
  thumbnailUrl: string;
  ageDays: number;
  viewsPerDay: number;
}

export interface DiscoverMarketOptions {
  regionCode?: string;
  publishedAfter?: string;
  order?: "viewCount" | "relevance" | "date";
  maxResultsPerQuery?: number;
  maxReferences?: number;
  baselineWindow?: number;
  now?: Date;
  discoveryLenses?: DiscoveryLens[];
  channelIds?: string[];
}

function parseCount(value?: string): number | null {
  if (value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseIsoDuration(value: string): number {
  const match = value.match(/^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/);
  if (!match) return 0;
  return (
    Number(match[1] || 0) * 86400 +
    Number(match[2] || 0) * 3600 +
    Number(match[3] || 0) * 60 +
    Number(match[4] || 0)
  );
}

function bestThumbnail(thumbnails?: Record<string, { url?: string; width?: number }>): string {
  if (!thumbnails) return "";
  return Object.values(thumbnails)
    .filter((thumbnail): thumbnail is { url: string; width?: number } => Boolean(thumbnail.url))
    .sort((a, b) => (b.width ?? 0) - (a.width ?? 0))[0]?.url ?? "";
}

function chunk<T>(values: T[], size: number): T[][] {
  const output: T[][] = [];
  for (let index = 0; index < values.length; index += size) {
    output.push(values.slice(index, index + size));
  }
  return output;
}

export class YouTubeDataClient {
  constructor(private readonly apiKey: string) {
    if (!apiKey) throw new Error("YOUTUBE_API_KEY is required for live market discovery.");
  }

  private async get<T>(resource: string, parameters: Record<string, string | number | undefined>): Promise<T> {
    const url = new URL(`${DATA_API_ROOT}/${resource}`);
    url.searchParams.set("key", this.apiKey);
    for (const [key, value] of Object.entries(parameters)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
    const response = await fetch(url);
    const body = (await response.json()) as T & { error?: { message?: string } };
    if (!response.ok) {
      throw new Error(`YouTube Data API ${resource} failed (${response.status}): ${body.error?.message ?? response.statusText}`);
    }
    return body;
  }

  private async search(query: string, options: Required<Pick<DiscoverMarketOptions,
    "regionCode" | "publishedAfter" | "order" | "maxResultsPerQuery"
  >>): Promise<string[]> {
    const response = await this.get<ListResponse<SearchItem>>("search", {
      part: "snippet",
      type: "video",
      q: query,
      order: options.order,
      publishedAfter: options.publishedAfter,
      regionCode: options.regionCode,
      relevanceLanguage: "en",
      safeSearch: "moderate",
      maxResults: Math.min(options.maxResultsPerQuery, 50),
    });
    return (response.items ?? [])
      .map((item) => item.id?.videoId)
      .filter((videoId): videoId is string => Boolean(videoId));
  }

  private async videos(videoIds: string[], now: Date): Promise<HydratedVideo[]> {
    const output: HydratedVideo[] = [];
    for (const ids of chunk([...new Set(videoIds)], 50)) {
      if (ids.length === 0) continue;
      const response = await this.get<ListResponse<VideoItem>>("videos", {
        part: "snippet,contentDetails,statistics",
        id: ids.join(","),
        maxResults: 50,
      });
      for (const item of response.items ?? []) {
        const publishedAt = item.snippet?.publishedAt;
        const channelId = item.snippet?.channelId;
        if (!publishedAt || !channelId) continue;
        const viewCount = parseCount(item.statistics?.viewCount) ?? 0;
        const ageDays = Math.max(1, (now.getTime() - new Date(publishedAt).getTime()) / 86400000);
        output.push({
          videoId: item.id,
          title: item.snippet?.title ?? "Untitled",
          channelId,
          channelTitle: item.snippet?.channelTitle ?? "Unknown channel",
          publishedAt,
          durationSeconds: parseIsoDuration(item.contentDetails?.duration ?? "PT0S"),
          viewCount,
          likeCount: parseCount(item.statistics?.likeCount),
          commentCount: parseCount(item.statistics?.commentCount),
          thumbnailUrl: bestThumbnail(item.snippet?.thumbnails),
          ageDays: Math.round(ageDays * 10) / 10,
          viewsPerDay: Math.round((viewCount / ageDays) * 10) / 10,
        });
      }
    }
    return output;
  }

  private async channels(channelIds: string[]): Promise<Map<string, ChannelItem>> {
    const output = new Map<string, ChannelItem>();
    for (const ids of chunk([...new Set(channelIds)], 50)) {
      const response = await this.get<ListResponse<ChannelItem>>("channels", {
        part: "contentDetails,statistics",
        id: ids.join(","),
        maxResults: 50,
      });
      for (const channel of response.items ?? []) output.set(channel.id, channel);
    }
    return output;
  }

  private async uploadIds(playlistId: string, maxResults = 50): Promise<string[]> {
    const response = await this.get<ListResponse<PlaylistItem>>("playlistItems", {
      part: "contentDetails",
      playlistId,
      maxResults: Math.min(maxResults, 50),
    });
    return (response.items ?? [])
      .map((item) => item.contentDetails?.videoId ?? item.snippet?.resourceId?.videoId)
      .filter((videoId): videoId is string => Boolean(videoId));
  }

  async discoverMarket(queries: string[], options: DiscoverMarketOptions = {}): Promise<MarketSnapshot> {
    const now = options.now ?? new Date();
    const regionCode = options.regionCode ?? "US";
    const publishedAfter = options.publishedAfter ?? new Date(now.getTime() - 730 * 86400000).toISOString();
    const order = options.order ?? "viewCount";
    const maxResultsPerQuery = options.maxResultsPerQuery ?? 20;
    const maxReferences = options.maxReferences ?? 12;
    const baselineWindow = options.baselineWindow ?? 12;
    const cleanChannels = [...new Set(options.channelIds ?? [])].slice(0, 20);
    const cleanQueries = [...new Set(queries.map((query) => query.trim()).filter(Boolean))].slice(0, 6);
    if (cleanQueries.length === 0 && cleanChannels.length === 0) throw new Error("At least one market search query or channel ID is required.");

    const discoveredBy = new Map<string, Set<string>>();

    for (const channelId of cleanChannels) {
      const channelMap = await this.channels([channelId]);
      const uploadsId = channelMap.get(channelId)?.contentDetails?.relatedPlaylists?.uploads;
      if (!uploadsId) continue;
      const ids = await this.uploadIds(uploadsId, 50);
      for (const videoId of ids) {
        const found = discoveredBy.get(videoId) ?? new Set<string>();
        found.add(`channel:${channelId}`);
        discoveredBy.set(videoId, found);
      }
    }

    for (const query of cleanQueries) {
      const videoIds = await this.search(query, { regionCode, publishedAfter, order, maxResultsPerQuery });
      for (const videoId of videoIds) {
        const found = discoveredBy.get(videoId) ?? new Set<string>();
        found.add(query);
        discoveredBy.set(videoId, found);
      }
    }

    const hydrated = (await this.videos([...discoveredBy.keys()], now))
      .filter((video) => video.durationSeconds >= 240)
      .sort((a, b) => b.viewsPerDay - a.viewsPerDay)
      .slice(0, maxReferences * 2);
    const channelMap = await this.channels(hydrated.map((video) => video.channelId));
    const uploadsByChannel = new Map<string, HydratedVideo[]>();

    for (const channelId of [...new Set(hydrated.map((video) => video.channelId))]) {
      const uploadsId = channelMap.get(channelId)?.contentDetails?.relatedPlaylists?.uploads;
      if (!uploadsId) {
        uploadsByChannel.set(channelId, []);
        continue;
      }
      const ids = await this.uploadIds(uploadsId, 50);
      uploadsByChannel.set(
        channelId,
        (await this.videos(ids, now)).filter((video) => video.durationSeconds >= 240),
      );
    }

    const references: BreakoutReference[] = hydrated.map((video) => {
      const priorVideos = (uploadsByChannel.get(video.channelId) ?? [])
        .filter((other) => other.videoId !== video.videoId && other.publishedAt < video.publishedAt)
        .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
        .slice(0, baselineWindow)
        .map((other) => ({
          videoId: other.videoId,
          viewCount: other.viewCount,
          viewsPerDay: other.viewsPerDay,
        }));
      const channel = channelMap.get(video.channelId);
      const baseline = buildBaseline({
        channelId: video.channelId,
        subscriberCount: channel?.statistics?.hiddenSubscriberCount
          ? null
          : parseCount(channel?.statistics?.subscriberCount),
        videos: priorVideos,
        windowSize: baselineWindow,
      });
      return attachBreakout({
        video_id: video.videoId,
        url: `https://www.youtube.com/watch?v=${video.videoId}`,
        title: video.title,
        thumbnail_url: video.thumbnailUrl,
        channel_id: video.channelId,
        channel_title: video.channelTitle,
        published_at: video.publishedAt,
        duration_seconds: video.durationSeconds,
        age_days: video.ageDays,
        view_count: video.viewCount,
        like_count: video.likeCount,
        comment_count: video.commentCount,
        views_per_day: video.viewsPerDay,
        discovery_queries: [...(discoveredBy.get(video.videoId) ?? [])],
        thumbnail_analysis: {
          status: "not_analyzed",
          focal_subject: null,
          visible_text: null,
          composition: null,
          contrast: null,
          argument: null,
          model: null,
        },
        channel_baseline: baseline,
      });
    });

    references.sort((a, b) => {
      const aSignal = Math.max(a.breakout.views_ratio ?? 0, a.breakout.velocity_ratio ?? 0);
      const bSignal = Math.max(b.breakout.views_ratio ?? 0, b.breakout.velocity_ratio ?? 0);
      return bSignal - aSignal || b.views_per_day - a.views_per_day;
    });

    return {
      provider: "youtube_data_api_v3",
      retrieved_at: now.toISOString(),
      region_code: regionCode,
      published_after: publishedAfter,
      search_queries: cleanQueries,
      discovery_lenses: [
        ...(options.discoveryLenses ?? cleanQueries.map((query) => ({
          query,
          lens: "literal" as const,
          reason: "Deterministic or manually supplied search query.",
        }))),
        ...cleanChannels.map((channelId) => ({
          query: `channel:${channelId}`,
          lens: "channel" as const,
          reason: "Known channel harvested for market analysis.",
        })),
      ],
      search_order: order,
      references: references.slice(0, maxReferences),
      own_channel_evidence: [],
      notes: [
        "Public view counts are point-in-time snapshots; views_per_day is lifetime views divided by age, not YouTube's private daily velocity.",
        "Channel baseline uses the median of up to 12 prior long-form uploads visible in the channel's latest 50 uploads.",
        "Breakout flags are evidence filters, not predictions of future performance.",
      ],
    };
  }
}
