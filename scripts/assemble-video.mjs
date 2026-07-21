#!/usr/bin/env node
/**
 * assemble-video.mjs
 *
 * Takes a storyboard JSON + generated voiceover segments and assembles
 * the final video via FFmpeg. Supports two render modes:
 *
 *   --mode manim   : Use pre-rendered Manim scene MP4s
 *   --mode still   : Use static art images with slow zoom (fallback, no Manim needed)
 *
 * Usage:
 *   node scripts/assemble-video.mjs <storyboard-id>
 *   node scripts/assemble-video.mjs nanavira-fundamental-structure
 *   node scripts/assemble-video.mjs nanavira-fundamental-structure --mode still
 */

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const storyboardId = process.argv[2];
if (!storyboardId) {
  console.error("Usage: node scripts/assemble-video.mjs <storyboard-id> [--mode manim|still] [--output <path>]");
  process.exit(1);
}

const mode = process.argv.includes("--mode") ? process.argv[process.argv.indexOf("--mode") + 1] : "still";
const outputArg = process.argv.includes("--output") ? process.argv[process.argv.indexOf("--output") + 1] : null;

const storyboardPath = path.join(root, "content", "publishing", "storyboards", `${storyboardId}.json`);
const voDir = path.join(root, "content", "publishing", "voiceover", storyboardId);
const timingPath = path.join(voDir, "timing.json");
const R2_BUCKET = "atlas-sources";
const R2_PUBLIC = "https://pub-8f77709efb2043fbbd8e88677347249a.r2.dev";

const renderDir = path.join(root, "content", "publishing", "renders", storyboardId);
const artDir = path.join(root, "content", "glossary", "art");
const manimSceneDir = path.join(root, "content", "publishing", "manim");
const localVideoDir = path.join(root, "content", "publishing", "videos");

if (!fs.existsSync(storyboardPath)) {
  console.error(`Storyboard not found: ${storyboardPath}`);
  process.exit(1);
}
if (!fs.existsSync(timingPath)) {
  console.error(`Timing manifest not found. Run generate-voiceover.mjs first.`);
  process.exit(1);
}

const storyboard = JSON.parse(fs.readFileSync(storyboardPath, "utf-8"));
const timing = JSON.parse(fs.readFileSync(timingPath, "utf-8"));

fs.mkdirSync(renderDir, { recursive: true });
fs.mkdirSync(localVideoDir, { recursive: true });

console.log(`Assembling: ${storyboard.episode_title}`);
console.log(`Mode: ${mode}`);
console.log(`Segments: ${timing.segments.length}\n`);

// ── Gather available art images ──
const artFiles = [];
if (fs.existsSync(artDir)) {
  for (const f of fs.readdirSync(artDir)) {
    if (/\.(png|jpg|jpeg|webp)$/i.test(f)) artFiles.push(path.join(artDir, f));
  }
}

// ── Build per-segment video clips ──
const clipFiles = [];
const concatList = [];

for (const seg of timing.segments) {
  const voFile = path.join(voDir, seg.file);
  if (!fs.existsSync(voFile)) {
    console.warn(`  Missing voiceover: ${seg.file} — skipping`);
    continue;
  }

  const sbSeg = storyboard.segments.find(s => s.segment_id === seg.segment_id);
  const visualDesc = sbSeg?.visual?.description || "";
  const actualDuration = seg.actual_duration_sec || sbSeg?.visual?.manim_duration_sec || 10;

  process.stdout.write(`  ${seg.segment_id} [${seg.rhetorical_role}] (${Math.round(actualDuration)}s)... `);

  let clipPath;

  if (mode === "manim") {
    // Look for pre-rendered Manim scene
    const sceneName = sbSeg?.visual?.scene_file?.replace(".py", "") || seg.segment_id;
    const manimRender = path.join(manimSceneDir, "media", "videos", sceneName, "1080p60", `${sbSeg?.visual?.scene_class || "Scene"}.mp4`);
    if (fs.existsSync(manimRender)) {
      clipPath = manimRender;
      process.stdout.write("manim cached\n");
    } else {
      process.stdout.write("manim MISSING, falling back to still\n");
      clipPath = createStillClip(seg, seg.segment_id, actualDuration, artFiles, renderDir);
    }
  } else {
    // Still mode: art + zoom + text overlay
    clipPath = createStillClip(seg, seg.segment_id, actualDuration, artFiles, renderDir);
  }

  // Mux voiceover onto clip
  const muxedPath = path.join(renderDir, `${seg.segment_id}-muxed.mp4`);
  if (fs.existsSync(muxedPath)) {
    process.stdout.write("muxed cached\n");
  } else {
    muxVoiceover(clipPath, voFile, muxedPath, actualDuration);
    process.stdout.write("muxed\n");
  }

  clipFiles.push(muxedPath);
  concatList.push(muxedPath);
}

if (clipFiles.length === 0) {
  console.error("No clips generated.");
  process.exit(1);
}

// ── Intro card ──
const introPath = path.join(renderDir, "00-intro.mp4");
if (!fs.existsSync(introPath)) {
  createIntroCard(introPath, storyboard.episode_title, storyboard.series, 4);
}
concatList.unshift(introPath);

// ── Outro card ──
const outroPath = path.join(renderDir, "99-outro.mp4");
if (!fs.existsSync(outroPath)) {
  createOutroCard(outroPath, storyboard, 5);
}
concatList.push(outroPath);

// ── Concat all clips into final video ──
const outputPath = outputArg || path.join(localVideoDir, `${storyboardId}.mp4`);
const listPath = path.join(renderDir, "concat.txt");
fs.writeFileSync(listPath, concatList.map(f => `file '${f}'`).join("\n"));

console.log(`\nConcatenating ${concatList.length} clips...`);

const result = spawnSync("ffmpeg", [
  "-hide_banner", "-loglevel", "error", "-y",
  "-f", "concat", "-safe", "0", "-i", listPath,
  "-c:v", "libx264", "-preset", "fast", "-crf", "23",
  "-c:a", "aac", "-b:a", "128k",
  "-pix_fmt", "yuv420p",
  "-movflags", "+faststart",
  outputPath,
], { stdio: "inherit", timeout: 300000 });

if (result.status !== 0) {
  console.error("FFmpeg concat failed.");
  process.exit(1);
}

const stat = fs.statSync(outputPath);
console.log(`\nVideo (local): ${outputPath}`);
console.log(`Size: ${Math.round(stat.size / 1024 / 1024)} MB`);
console.log(`Duration: ~${Math.round(storyboard.estimated_duration_min + 9)} min`);

// Upload to R2
try {
  const r2Key = `videos/${storyboardId}.mp4`;
  const r2Result = spawnSync("npx", [
    "--no-install", "wrangler", "r2", "object", "put",
    `${R2_BUCKET}/${r2Key}`,
    "--file", outputPath,
    "--remote",
  ], { stdio: "inherit", cwd: root });
  if (r2Result.status === 0) {
    const r2Url = `${R2_PUBLIC}/${r2Key}`;
    console.log(`R2: ${r2Url}`);
    // Update storyboard with video URL
    storyboard.video_url = r2Url;
    storyboard.video_r2_key = r2Key;
    storyboard.video_size_bytes = stat.size;
    fs.writeFileSync(storyboardPath, JSON.stringify(storyboard, null, 2));
    console.log(`Storyboard updated with video_url`);
  } else {
    console.warn("R2 upload failed, video only available locally");
  }
} catch (e) {
  console.warn(`R2 upload error: ${e.message}`);
}

// ── Helpers ──
function createStillClip(seg, segId, duration, artFiles, renderDir) {
  const outPath = path.join(renderDir, `${segId}-still.mp4`);
  if (fs.existsSync(outPath)) return outPath;

  // Pick an art image (random for now, later matched by concept tags)
  const artPath = artFiles[Math.floor(Math.random() * artFiles.length)] || createBlankFrame(renderDir);

  // Build FFmpeg filter: slow zoom + text overlay
  const filters = [
    `scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2`,
    `zoompan=z='min(zoom+0.0004,1.2)':d=${Math.round(duration * 25)}:s=1920x1080`,
  ];

  const args = [
    "-hide_banner", "-loglevel", "error", "-y",
    "-loop", "1", "-i", artPath,
    "-t", String(duration),
    "-vf", filters.join(","),
    "-c:v", "libx264", "-preset", "ultrafast",
    "-pix_fmt", "yuv420p",
    outPath,
  ];

  spawnSync("ffmpeg", args, { stdio: "pipe", timeout: 60000 });
  return outPath;
}

function muxVoiceover(videoPath, audioPath, outputPath, targetDuration) {
  spawnSync("ffmpeg", [
    "-hide_banner", "-loglevel", "error", "-y",
    "-i", videoPath,
    "-i", audioPath,
    "-c:v", "copy",
    "-c:a", "aac", "-b:a", "128k",
    "-shortest",
    "-map", "0:v:0", "-map", "1:a:0",
    outputPath,
  ], { stdio: "pipe", timeout: 60000 });
}

function createBlankFrame(dir) {
  const blankPath = path.join(dir, "_blank.png");
  if (!fs.existsSync(blankPath)) {
    spawnSync("ffmpeg", [
      "-y", "-f", "lavfi",
      "-i", "color=c=#0D1117:s=1920x1080:d=1",
      "-frames:v", "1", blankPath,
    ], { stdio: "pipe" });
  }
  return blankPath;
}

function createIntroCard(outPath, title, series, durationSec) {
  const filters = [
    `drawtext=text='${title.replace(/'/g, "\\'")}':font='Times New Roman':fontsize=52:fontcolor=#D4A574:x=(w-text_w)/2:y=(h-text_h)/2-40`,
    `drawtext=text='${(series || "").replace(/'/g, "\\'")}':font='Times New Roman':fontsize=28:fontcolor=#8B7355:x=(w-text_w)/2:y=(h-text_h)/2+40`,
  ];

  spawnSync("ffmpeg", [
    "-hide_banner", "-loglevel", "error", "-y",
    "-f", "lavfi",
    "-i", `color=c=#0D1117:s=1920x1080:d=${durationSec}`,
    "-vf", filters.join(","),
    "-c:v", "libx264", "-preset", "ultrafast",
    "-pix_fmt", "yuv420p",
    outPath,
  ], { stdio: "pipe", timeout: 30000 });
}

function createOutroCard(outPath, storyboard, durationSec) {
  const filters = [
    `drawtext=text='The Tetrahedron':font='Times New Roman':fontsize=36:fontcolor=#D4A574:x=(w-text_w)/2:y=(h-text_h)/2-60`,
    `drawtext=text='Next: Episode ${(storyboard.episode_number || 1) + 1}':font='Sans':fontsize=22:fontcolor=#6B7280:x=(w-text_w)/2:y=(h-text_h)/2`,
    `drawtext=text='Subscribe for more':font='Sans':fontsize=20:fontcolor=#8B7355:x=(w-text_w)/2:y=(h-text_h)/2+50`,
  ];

  spawnSync("ffmpeg", [
    "-hide_banner", "-loglevel", "error", "-y",
    "-f", "lavfi",
    "-i", `color=c=#0D1117:s=1920x1080:d=${durationSec}`,
    "-vf", filters.join(","),
    "-c:v", "libx264", "-preset", "ultrafast",
    "-pix_fmt", "yuv420p",
    outPath,
  ], { stdio: "pipe", timeout: 30000 });
}
