import fs from "node:fs";
import path from "node:path";
import { mapRetentionToBeats } from "../src/lib/video-objects/breakout";
import type { VideoObject } from "../src/lib/video-objects/types";
import { validateVideoObject } from "../src/lib/video-objects/validate";
import { YouTubeAnalyticsClient } from "../src/lib/video-objects/youtube-analytics";

function valueAfter(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

async function main(): Promise<void> {
  const objectPath = valueAfter("--object");
  if (!objectPath) throw new Error("Usage: npm run video:analytics -- --object content/video-objects/<slug>/video.json --youtube-id ID --start-date YYYY-MM-DD");
  const resolved = path.resolve(objectPath);
  const video = JSON.parse(fs.readFileSync(resolved, "utf8")) as VideoObject;
  const videoId = valueAfter("--youtube-id") ?? video.publication.youtube_video_id;
  if (!videoId) throw new Error("Provide --youtube-id or set publication.youtube_video_id in the Video Object.");
  const startDate = valueAfter("--start-date") ?? video.publication.published_at?.slice(0, 10);
  if (!startDate) throw new Error("Provide --start-date or set publication.published_at in the Video Object.");
  const yesterday = new Date(Date.now() - 86400000);
  const endDate = valueAfter("--end-date") ?? isoDate(yesterday);

  const client = new YouTubeAnalyticsClient({
    accessToken: process.env.YOUTUBE_ANALYTICS_ACCESS_TOKEN,
    clientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
    clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_OAUTH_REFRESH_TOKEN,
  });
  const [summary, retention] = await Promise.all([
    client.summary(videoId, startDate, endDate),
    client.retention(videoId, video.production.estimated_duration_seconds, startDate, endDate),
  ]);
  video.publication.youtube_video_id = videoId;
  video.publication.youtube_url = `https://www.youtube.com/watch?v=${videoId}`;
  video.analytics.last_ingested_at = new Date().toISOString();
  video.analytics.window = { start_date: startDate, end_date: endDate };
  video.analytics.summary = summary;
  video.analytics.retention_points = retention;
  video.analytics.beat_performance = mapRetentionToBeats(retention, video.production.beats);
  video.updated_at = new Date().toISOString();

  const validation = validateVideoObject(video);
  if (validation.errors.length > 0) throw new Error(`Updated object failed validation:\n- ${validation.errors.join("\n- ")}`);
  fs.writeFileSync(resolved, `${JSON.stringify(video, null, 2)}\n`);
  console.log(`Updated ${objectPath} with ${retention.length} retention points.`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
