#!/usr/bin/env node
/**
 * upload-youtube.mjs
 *
 * Upload a rendered video to YouTube as an unlisted draft with metadata.
 * OAuth setup required first: node scripts/youtube-oauth-setup.mjs
 *
 * Usage:
 *   node scripts/upload-youtube.mjs <video-file> \
 *     --title "..." \
 *     --description "..." \
 *     --tags "tag1,tag2,tag3" \
 *     --category 27 \
 *     --privacy unlisted \
 *     --thumbnail path/to/thumb.jpg \
 *     --playlist "Tantraloka"
 *
 * Returns: { youtube_video_id: "abc123", url: "https://youtu.be/abc123" }
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// ── Config ──
const YT_API = "https://www.googleapis.com/upload/youtube/v3/videos";
const YT_API_BASE = "https://www.googleapis.com/youtube/v3";

// Read OAuth token from env or .hermes/.env
function getAccessToken() {
  const token = process.env.YOUTUBE_ACCESS_TOKEN;
  if (token) return token;

  // Try to refresh using stored refresh token
  const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  
  if (refreshToken && clientId && clientSecret) {
    console.log("Refreshing OAuth token...");
    // Refresh would happen here
    throw new Error("Token refresh not implemented yet. Set YOUTUBE_ACCESS_TOKEN directly.");
  }

  throw new Error(
    "No YouTube OAuth token found.\n\n" +
    "Set YOUTUBE_ACCESS_TOKEN in your env, or run:\n" +
    "  node scripts/youtube-oauth-setup.mjs\n\n" +
    "This will give you a refresh token. Then set:\n" +
    "  GOOGLE_OAUTH_REFRESH_TOKEN=...\n" +
    "  GOOGLE_OAUTH_CLIENT_ID=...\n" +
    "  GOOGLE_OAUTH_CLIENT_SECRET=..."
  );
}

async function uploadVideo(filePath, metadata) {
  const token = getAccessToken();
  const fileSize = fs.statSync(filePath).size;

  // Step 1: Initiate resumable upload
  console.log(`Uploading: ${path.basename(filePath)} (${(fileSize / 1024 / 1024).toFixed(1)} MB)`);
  
  const body = {
    snippet: {
      title: metadata.title || "Untitled",
      description: metadata.description || "",
      tags: metadata.tags || [],
      categoryId: metadata.category || "27", // 27 = Education
      defaultLanguage: "en",
    },
    status: {
      privacyStatus: metadata.privacy || "unlisted",
      selfDeclaredMadeForKids: false,
    },
  };

  // Build multipart upload
  const boundary = `yt_upload_${Date.now()}`;
  let payload = "";
  payload += `--${boundary}\r\n`;
  payload += `Content-Type: application/json; charset=UTF-8\r\n\r\n`;
  payload += JSON.stringify(body) + "\r\n";
  payload += `--${boundary}\r\n`;
  payload += `Content-Type: video/*\r\n`;
  payload += `Content-Length: ${fileSize}\r\n\r\n`;

  const headerBuffer = Buffer.from(payload, "utf-8");
  const videoBuffer = fs.readFileSync(filePath);
  const footerBuffer = Buffer.from(`\r\n--${boundary}--\r\n`, "utf-8");
  const totalLength = headerBuffer.length + videoBuffer.length + footerBuffer.length;

  const uploadUrl = `${YT_API}?uploadType=resumable&part=snippet,status`;

  try {
    // Initiate
    const initRes = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
        "X-Upload-Content-Length": fileSize.toString(),
        "X-Upload-Content-Type": "video/*",
      },
      body: Buffer.concat([headerBuffer, videoBuffer, footerBuffer]),
    });

    if (!initRes.ok) {
      const err = await initRes.text();
      throw new Error(`YouTube API error ${initRes.status}: ${err.slice(0, 300)}`);
    }

    const result = await initRes.json();
    const videoId = result.id;
    console.log(`Uploaded: https://youtu.be/${videoId}`);

    // Step 2: Set thumbnail if provided
    if (metadata.thumbnail && fs.existsSync(metadata.thumbnail)) {
      console.log("Setting custom thumbnail...");
      // Thumbnail upload via separate API call
      // POST https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId={id}
      // with the image file as binary body
      const thumbUrl = `${YT_API_BASE}/thumbnails/set?videoId=${videoId}`;
      const thumbRes = await fetch(thumbUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "image/jpeg",
        },
        body: fs.readFileSync(metadata.thumbnail),
      });
      if (thumbRes.ok) {
        console.log("Thumbnail set.");
      } else {
        console.warn(`Thumbnail upload failed: ${thumbRes.status}`);
      }
    }

    // Step 3: Add to playlist if specified
    if (metadata.playlist) {
      console.log(`Adding to playlist: ${metadata.playlist}`);
      // TODO: resolve playlist ID from name, then POST playlistItems.insert
    }

    // Step 4: Update video index
    updateVideoIndex(metadata.video_id, videoId);

    return { youtube_video_id: videoId, url: `https://youtu.be/${videoId}` };

  } catch (e) {
    console.error("Upload failed:", e.message);
    throw e;
  }
}

function updateVideoIndex(videoId, youtubeId) {
  const indexPath = path.join(ROOT, "content", "video-objects", "_index.json");
  if (!fs.existsSync(indexPath)) return;
  
  const index = JSON.parse(fs.readFileSync(indexPath, "utf-8"));
  for (const v of index.videos) {
    if (v.id === videoId) {
      v.youtube_video_id = youtubeId;
      v.status = "uploaded";
      v.published_at = new Date().toISOString();
      break;
    }
  }
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
  console.log(`Updated video index: ${videoId} → ${youtubeId}`);
}

// ── CLI ──
function parseArgs() {
  const args = process.argv.slice(2);
  const file = args[0];
  if (!file || !fs.existsSync(file)) {
    console.error("Usage: node scripts/upload-youtube.mjs <video.mp4> [options]");
    process.exit(1);
  }
  const get = (flag) => {
    const i = args.indexOf(flag);
    return i >= 0 && i + 1 < args.length ? args[i + 1] : null;
  };
  const has = (flag) => args.includes(flag);
  return {
    file,
    title: get("--title") || path.basename(file, path.extname(file)),
    description: get("--description") || "",
    tags: (get("--tags") || "").split(",").filter(Boolean),
    category: get("--category") || "27",
    privacy: get("--privacy") || "unlisted",
    thumbnail: get("--thumbnail"),
    playlist: get("--playlist"),
    video_id: get("--video-id"),
    dry_run: has("--dry-run"),
  };
}

async function main() {
  const meta = parseArgs();
  
  if (meta.dry_run) {
    console.log("\n=== DRY RUN ===");
    console.log(`File: ${meta.file}`);
    console.log(`Title: ${meta.title}`);
    console.log(`Description: ${meta.description.slice(0, 100)}...`);
    console.log(`Tags: ${meta.tags.join(", ")}`);
    console.log(`Category: ${meta.category}`);
    console.log(`Privacy: ${meta.privacy}`);
    console.log(`Thumbnail: ${meta.thumbnail}`);
    console.log(`Playlist: ${meta.playlist}`);
    console.log("=== No upload performed ===\n");
    return;
  }

  const result = await uploadVideo(meta.file, meta);
  console.log(`\nResult: ${JSON.stringify(result, null, 2)}`);
}

main().catch((e) => {
  process.exit(1);
});
