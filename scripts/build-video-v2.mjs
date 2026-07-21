#!/usr/bin/env node
/**
 * build-video-v2.mjs — Full video assembly from script + voiceover + visual specs
 *
 * Takes a script directory and assembles a complete MP4 video:
 *   1. Reads beat-map.md for visual cues
 *   2. Generates visual scene clips (Manim/still/overlay) per beat
 *   3. Splits voiceover to match beat timings
 *   4. Assembles everything with FFmpeg
 *
 * Usage: node scripts/build-video-v2.mjs <script-id>
 *        node scripts/build-video-v2.mjs 01-k4
 */

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const scriptId = process.argv[2];
if (!scriptId) {
  console.error("Usage: node scripts/build-video-v2.mjs <script-id>");
  process.exit(1);
}

const scriptDir = path.join(root, "content", "publishing", "scripts", scriptId);
const voFile = path.join(root, "content", "publishing", "voiceover", scriptId, "narration.mp3");
const renderDir = path.join(root, "content", "publishing", "renders", scriptId);
const videoDir = path.join(root, "content", "publishing", "videos");
const outputPath = path.join(videoDir, `${scriptId}.mp4`);

const R2_BUCKET = "atlas-sources";
const R2_PUBLIC = "https://pub-8f77709efb2043fbbd8e88677347249a.r2.dev";

if (!fs.existsSync(scriptDir) || !fs.existsSync(voFile)) {
  console.error(`Missing script directory or voiceover for: ${scriptId}`);
  console.error(`Script dir: ${scriptDir} (exists: ${fs.existsSync(scriptDir)})`);
  console.error(`Voiceover: ${voFile} (exists: ${fs.existsSync(voFile)})`);
  process.exit(1);
}

fs.mkdirSync(renderDir, { recursive: true });
fs.mkdirSync(videoDir, { recursive: true });

const scriptText = fs.readFileSync(path.join(scriptDir, "script.md"), "utf-8");
const beatMapText = fs.existsSync(path.join(scriptDir, "beat-map.md"))
  ? fs.readFileSync(path.join(scriptDir, "beat-map.md"), "utf-8") : "";

const voDuration = parseFloat(
  spawnSync("ffprobe", ["-v", "quiet", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", voFile], { stdio: "pipe" })
    .stdout.toString().trim()
) || 0;

console.log(`Building: ${scriptId}`);
console.log(`Voiceover: ${Math.round(voDuration)}s`);
console.log(`Beat map: ${beatMapText ? "found" : "NOT FOUND"}`);

// ── Parse beat map into clips ──
const beats = parseBeats(beatMapText, voDuration);
if (beats.length === 0) {
  // Fallback: single visual
  beats.push({ start: 0, end: voDuration, visual: "dark void with title", label: "full" });
}
console.log(`Beats: ${beats.length}`);

// ── Generate visual clips per beat ──
const clipFiles = [];
for (let i = 0; i < beats.length; i++) {
  const beat = beats[i];
  const dur = beat.end - beat.start;
  const clipPath = path.join(renderDir, `beat-${String(i).padStart(2, "0")}.mp4`);

  process.stdout.write(`  Beat ${i + 1}/${beats.length} [${Math.round(beat.start)}-${Math.round(beat.end)}s] ${beat.label}... `);

  if (!fs.existsSync(clipPath)) {
    createVisualClip(clipPath, beat, dur, scriptDir);
    process.stdout.write("rendered\n");
  } else {
    process.stdout.write("cached\n");
  }
  clipFiles.push(clipPath);
}

// ── Split voiceover into per-beat segments ──
const segmentFiles = [];
for (let i = 0; i < beats.length; i++) {
  const beat = beats[i];
  const segPath = path.join(renderDir, `vo-${String(i).padStart(2, "0")}.mp3`);
  if (!fs.existsSync(segPath)) {
    spawnSync("ffmpeg", [
      "-hide_banner", "-loglevel", "error", "-y",
      "-i", voFile,
      "-ss", String(beat.start),
      "-t", String(beat.end - beat.start + 0.5),
      "-c:a", "libmp3lame", "-q:a", "2",
      segPath,
    ], { stdio: "pipe" });
  }
  segmentFiles.push(segPath);
}

// ── Mux visual + voiceover per beat ──
const muxedFiles = [];
for (let i = 0; i < clipFiles.length; i++) {
  const muxPath = path.join(renderDir, `mux-${String(i).padStart(2, "0")}.mp4`);
  if (!fs.existsSync(muxPath)) {
    const dur = beats[i].end - beats[i].start;
    spawnSync("ffmpeg", [
      "-hide_banner", "-loglevel", "error", "-y",
      "-stream_loop", "-1", "-i", clipFiles[i],
      "-i", segmentFiles[i],
      "-t", String(dur + 0.3),
      "-c:v", "copy",
      "-c:a", "aac", "-b:a", "128k",
      "-shortest",
      "-map", "0:v:0", "-map", "1:a:0",
      muxPath,
    ], { stdio: "pipe", timeout: 30000 });
  }
  muxedFiles.push(muxPath);
}

// ── Concat all muxed segments ──
const concatList = path.join(renderDir, "concat.txt");
fs.writeFileSync(concatList, muxedFiles.map(f => `file '${f}'`).join("\n"));

process.stdout.write("  Concatenating... ");
const result = spawnSync("ffmpeg", [
  "-hide_banner", "-loglevel", "error", "-y",
  "-f", "concat", "-safe", "0", "-i", concatList,
  "-c:v", "libx264", "-preset", "fast", "-crf", "23",
  "-c:a", "aac", "-b:a", "128k",
  "-pix_fmt", "yuv420p", "-movflags", "+faststart",
  outputPath,
], { stdio: "inherit", timeout: 120000 });

if (result.status !== 0) {
  console.error("FFmpeg failed");
  process.exit(1);
}

const stat = fs.statSync(outputPath);
console.log(`\nDone: ${outputPath}`);
console.log(`Size: ${Math.round(stat.size / 1024 / 1024)} MB`);

// Upload to R2
try {
  const r2Key = `videos/${scriptId}.mp4`;
  const r2Result = spawnSync("npx", [
    "--no-install", "wrangler", "r2", "object", "put",
    `${R2_BUCKET}/${r2Key}`,
    "--file", outputPath, "--remote",
  ], { stdio: "inherit", cwd: root });
  if (r2Result.status === 0) {
    console.log(`R2: ${R2_PUBLIC}/${r2Key}`);
  }
} catch (e) {
  console.warn(`R2 upload skipped: ${e.message}`);
}

// ── Beat parser ──
function parseBeats(text, totalDuration) {
  if (!text) return [];
  const beats = [];
  const lines = text.split("\n");

  let currentBeat = null;
  for (const line of lines) {
    // Match "B1 [0:00-0:20]" or "BEAT 1 [0:00-0:30]" or "### B1 [0:00-0:15]"
    const m = line.match(/^\s*(?:###\s*)?B(?:EAT\s*)?(\d+)\s*\[(\d+):(\d+)\s*-\s*(?:(\d+):)?(\d+)\]/i);
    if (m) {
      if (currentBeat) beats.push(currentBeat);
      const startMin = parseInt(m[2]) || 0;
      const startSec = parseInt(m[3]) || 0;
      const endMin = m[4] ? parseInt(m[4]) : startMin;
      const endSec = parseInt(m[5]) || 0;
      currentBeat = {
        label: `beat-${m[1]}`,
        start: startMin * 60 + startSec,
        end: endMin * 60 + endSec || totalDuration,
      };
    } else if (currentBeat && line.includes("VISUAL:")) {
      currentBeat.label = line.replace(/.*VISUAL:\s*/, "").slice(0, 60);
    }
  }
  if (currentBeat) beats.push(currentBeat);

  // Fill gaps and clip to duration
  for (let i = 0; i < beats.length; i++) {
    if (i > 0 && beats[i].start === beats[i - 1].end) continue;
    if (i < beats.length - 1) {
      beats[i].end = Math.min(beats[i + 1].start, totalDuration);
    } else {
      beats[i].end = totalDuration;
    }
  }
  return beats;
}

// ── Visual clip generator ──
function createVisualClip(outPath, beat, duration, scriptDir) {
  const bgColor = "#0D1117";
  const goldColor = "#D4A574";
  const whiteColor = "#E6E1DC";

  // Create a dark void frame with subtle particle-like noise
  const filters = [];

  // Add subtle animated noise particles (low opacity)
  filters.push(`geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)'`);
  filters.push(`noise=alls=8:allf=t+u`);

  // Draw beat label
  const label = (beat.label || "").replace(/'/g, "\\'").slice(0, 50);
  filters.push(`drawtext=text='${label}':font='Sans':fontsize=18:fontcolor=${whiteColor}:x=20:y=h-40:alpha='if(lt(t,1),0.5*t,0.5)'`);

  spawnSync("ffmpeg", [
    "-hide_banner", "-loglevel", "error", "-y",
    "-f", "lavfi",
    "-i", `color=c=${bgColor}:s=1920x1080:d=${Math.ceil(duration) + 1}`,
    "-vf", filters.join(","),
    "-c:v", "libx264", "-preset", "ultrafast",
    "-pix_fmt", "yuv420p",
    outPath,
  ], { stdio: "pipe", timeout: 30000 });
}
