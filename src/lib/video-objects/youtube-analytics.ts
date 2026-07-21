import type { RetentionPoint } from "./types";

const ANALYTICS_ENDPOINT = "https://youtubeanalytics.googleapis.com/v2/reports";
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";

interface AnalyticsResponse {
  columnHeaders?: Array<{ name: string; columnType?: string; dataType?: string }>;
  rows?: Array<Array<string | number>>;
  errors?: Array<{ message?: string }>;
}

export interface AnalyticsCredentials {
  accessToken?: string;
  clientId?: string;
  clientSecret?: string;
  refreshToken?: string;
}

function asNumber(value: string | number | undefined): number | null {
  if (value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export class YouTubeAnalyticsClient {
  constructor(private readonly credentials: AnalyticsCredentials) {}

  private async accessToken(): Promise<string> {
    if (this.credentials.accessToken) return this.credentials.accessToken;
    const { clientId, clientSecret, refreshToken } = this.credentials;
    if (!clientId || !clientSecret || !refreshToken) {
      throw new Error(
        "Analytics requires YOUTUBE_ANALYTICS_ACCESS_TOKEN or GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, and GOOGLE_OAUTH_REFRESH_TOKEN.",
      );
    }
    const response = await fetch(TOKEN_ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });
    const body = (await response.json()) as { access_token?: string; error_description?: string };
    if (!response.ok || !body.access_token) {
      throw new Error(`Google OAuth token refresh failed: ${body.error_description ?? response.statusText}`);
    }
    return body.access_token;
  }

  private async query(parameters: Record<string, string>): Promise<AnalyticsResponse> {
    const url = new URL(ANALYTICS_ENDPOINT);
    for (const [key, value] of Object.entries(parameters)) url.searchParams.set(key, value);
    const response = await fetch(url, {
      headers: { authorization: `Bearer ${await this.accessToken()}` },
    });
    const body = (await response.json()) as AnalyticsResponse & { error?: { message?: string } };
    if (!response.ok) {
      throw new Error(`YouTube Analytics API failed (${response.status}): ${body.error?.message ?? response.statusText}`);
    }
    return body;
  }

  async summary(videoId: string, startDate: string, endDate: string): Promise<Record<string, number>> {
    const response = await this.query({
      ids: "channel==MINE",
      startDate,
      endDate,
      filters: `video==${videoId}`,
      metrics: [
        "views",
        "estimatedMinutesWatched",
        "averageViewDuration",
        "averageViewPercentage",
        "likes",
        "comments",
        "shares",
        "subscribersGained",
        "subscribersLost",
      ].join(","),
    });
    const row = response.rows?.[0] ?? [];
    const summary: Record<string, number> = {};
    for (const [index, header] of (response.columnHeaders ?? []).entries()) {
      const value = asNumber(row[index]);
      if (value !== null) summary[header.name] = value;
    }
    return summary;
  }

  async retention(
    videoId: string,
    videoDurationSeconds: number,
    startDate: string,
    endDate: string,
  ): Promise<RetentionPoint[]> {
    const response = await this.query({
      ids: "channel==MINE",
      startDate,
      endDate,
      dimensions: "elapsedVideoTimeRatio",
      filters: `video==${videoId}`,
      metrics: [
        "audienceWatchRatio",
        "relativeRetentionPerformance",
        "startedWatching",
        "stoppedWatching",
        "totalSegmentImpressions",
      ].join(","),
      sort: "elapsedVideoTimeRatio",
    });
    const headers = (response.columnHeaders ?? []).map((header) => header.name);
    const indexOf = (name: string) => headers.indexOf(name);
    return (response.rows ?? []).flatMap((row) => {
      const elapsedRatio = asNumber(row[indexOf("elapsedVideoTimeRatio")]);
      const audienceWatchRatio = asNumber(row[indexOf("audienceWatchRatio")]);
      if (elapsedRatio === null || audienceWatchRatio === null) return [];
      return [{
        elapsed_ratio: elapsedRatio,
        elapsed_seconds: Math.round(elapsedRatio * videoDurationSeconds * 10) / 10,
        audience_watch_ratio: audienceWatchRatio,
        relative_retention_performance: asNumber(row[indexOf("relativeRetentionPerformance")]),
        started_watching: asNumber(row[indexOf("startedWatching")]),
        stopped_watching: asNumber(row[indexOf("stoppedWatching")]),
        total_segment_impressions: asNumber(row[indexOf("totalSegmentImpressions")]),
      }];
    });
  }
}
