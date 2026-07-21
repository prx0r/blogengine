#!/usr/bin/env node
/**
 * generate-voiceover.mjs
 *
 * Reads a storyboard JSON and generates per-segment MP3 voiceover files
 * using edge-tts. Each segment gets its own file with precise timing.
 * Produces a timing manifest for FFmpeg assembly.
 *
 * Usage:
 *   node scripts/generate-voiceover.mjs <storyboard-id>
 *   node scripts/generate-voiceover.mjs nanavira-fundamental-structure
 *   node scripts/generate-voiceover.mjs nanavira-fundamental-structure --voice en-US-AriaNeural
 */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const storyboardId = process.argv[2];
if (!storyboardId) {
  console.error("Usage: node scripts/generate-voiceover.mjs <storyboard-id> [--voice <voice>]");
  process.exit(1);
}

const customVoice = process.argv.includes("--voice")
  ? process.argv[process.argv.indexOf("--voice") + 1]
  : null;

const storyboardPath = path.join(root, "content", "publishing", "storyboards", `${storyboardId}.json`);
if (!fs.existsSync(storyboardPath)) {
  console.error(`Storyboard not found: ${storyboardPath}`);
  process.exit(1);
}

const storyboard = JSON.parse(fs.readFileSync(storyboardPath, "utf-8"));
const defaultVoice = customVoice || storyboard.narration_voice || "en-US-AriaNeural";

const cacheDir = path.join(root, "data", "tts-cache");
const voDir = path.join(root, "content", "publishing", "voiceover", storyboardId);
fs.mkdirSync(cacheDir, { recursive: true });
fs.mkdirSync(voDir, { recursive: true });

console.log(`Storyboard: ${storyboard.episode_title}`);
console.log(`Voice: ${defaultVoice}`);
console.log(`Segments: ${storyboard.segments.length}\n`);

const timingManifest = {
  storyboard_id: storyboardId,
  generated: new Date().toISOString(),
  voice: defaultVoice,
  segments: [],
};

let errors = 0;

for (let i = 0; i < storyboard.segments.length; i++) {
  const seg = storyboard.segments[i];
  const segId = seg.segment_id;
  const text = seg.narration;

  if (!text || text.trim().length === 0) {
    console.log(`  [${i + 1}/${storyboard.segments.length}] ${segId} — SKIPPED (no narration)`);
    continue;
  }

  const outFile = path.join(voDir, `${segId}.mp3`);
  const cacheFile = cachePath(text, defaultVoice);

  process.stdout.write(`  [${i + 1}/${storyboard.segments.length}] ${segId} (${Math.round(text.length / 1000 * 10) / 10}s)`);

  // Use cached chunk if available
  if (fs.existsSync(cacheFile) && fs.statSync(cacheFile).size > 0) {
    fs.copyFileSync(cacheFile, outFile);
    process.stdout.write(" cached\n");
  } else {
    process.stdout.write(" generating...\n");
    const result = spawnSync("edge-tts", [
      "--voice", defaultVoice,
      "--text", text,
      "--write-media", cacheFile,
    ], { stdio: "pipe", timeout: 120000 });

    if (result.status !== 0) {
      console.error(`    edge-tts failed: ${result.stderr?.toString()?.slice(0, 200)}`);
      errors++;
      continue;
    }

    if (!fs.existsSync(cacheFile) || fs.statSync(cacheFile).size === 0) {
      console.error(`    edge-tts produced empty file`);
      errors++;
      continue;
    }

    fs.copyFileSync(cacheFile, outFile);
  }

  // Get exact duration via ffprobe
  const actualDuration = getAudioDuration(outFile);

  timingManifest.segments.push({
    segment_id: segId,
    file: `${segId}.mp3`,
    start_sec: seg.start_sec,
    end_sec: seg.end_sec,
    actual_duration_sec: actualDuration,
    label: seg.label,
    rhetorical_role: seg.rhetorical_role,
  });
}

// Write timing manifest
const manifestPath = path.join(voDir, "timing.json");
fs.writeFileSync(manifestPath, JSON.stringify(timingManifest, null, 2));

console.log(`\nDone. ${timingManifest.segments.length} segments generated, ${errors} errors.`);
console.log(`Timing manifest: ${manifestPath}`);
console.log(`Voiceover files: ${voDir}/`);

// --- Helpers ---
function cachePath(text, voice) {
  const hash = crypto.createHash("sha1").update(`${voice}\nmp3\n${text}`).digest("hex");
  return path.join(cacheDir, `${voice}-${hash}.mp3`);
}

function getAudioDuration(filePath) {
  const result = spawnSync("ffprobe", [
    "-v", "quiet",
    "-show_entries", "format=duration",
    "-of", "default=noprint_wrappers=1:nokey=1",
    filePath,
  ], { stdio: "pipe" });

  if (result.status === 0) {
    return parseFloat(result.stdout.toString().trim()) || 0;
  }
  return 0;
}
