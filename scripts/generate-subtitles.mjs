#!/usr/bin/env node
/**
 * generate-subtitles.mjs
 *
 * Reads a storyboard + timing manifest and produces:
 *   - .ass styled subtitles (custom fonts, positioning, fades)
 *   - .srt plain subtitles (YouTube upload)
 *
 * Voice mapping (from generate-audio.mjs):
 *   source/quotes → en-GB-RyanNeural (male)
 *   main/ai       → en-US-AriaNeural (female)
 *
 * Usage:
 *   node scripts/generate-subtitles.mjs <storyboard-id> [options]
 *
 * Options:
 *   --font <name>       Font for main text (default: Reenie Beanie)
 *   --quote-font <name> Font for quotes (default: Ephesis)
 *   --out <dir>         Output directory (default: content/publishing/subtitles/)
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const storyboardId = process.argv[2];
if (!storyboardId) {
  console.error("Usage: node scripts/generate-subtitles.mjs <storyboard-id>");
  process.exit(1);
}

// Options
const mainFont = opt("--font", "Reenie Beanie");
const quoteFont = opt("--quote-font", "Ephesis");
const outDir = opt("--out", path.join(root, "content", "publishing", "subtitles", storyboardId));

fs.mkdirSync(outDir, { recursive: true });

const storyboardPath = path.join(root, "content", "publishing", "storyboards", `${storyboardId}.json`);
const timingPath = path.join(root, "content", "publishing", "voiceover", storyboardId, "timing.json");

if (!fs.existsSync(storyboardPath)) {
  console.error(`Storyboard not found: ${storyboardPath}`);
  process.exit(1);
}
if (!fs.existsSync(timingPath)) {
  console.error(`Timing manifest not found: ${timingPath}. Run generate-voiceover.mjs first.`);
  process.exit(1);
}

const storyboard = JSON.parse(fs.readFileSync(storyboardPath, "utf-8"));
const timing = JSON.parse(fs.readFileSync(timingPath, "utf-8"));

const segments = storyboard.segments || [];
const timingSegs = timing.segments || [];

console.log(`Generating subtitles for: ${storyboard.episode_title || storyboardId}`);
console.log(`Segments: ${segments.length}`);
console.log(`Font: ${mainFont} (main), ${quoteFont} (quotes)`);

// Build timing lookup
const timingMap = {};
for (const ts of timingSegs) {
  timingMap[ts.segment_id] = ts;
}

// ── ASS subtitle generator ──

let assEvents = [];
let assTime = 0;

for (let i = 0; i < segments.length; i++) {
  const seg = segments[i];
  const ts = timingMap[seg.segment_id];
  if (!ts) {
    console.log(`  [${i + 1}] ${seg.segment_id} — no timing data, skipping`);
    continue;
  }

  const text = seg.narration || "";
  if (!text.trim()) continue;

  const duration = ts.actual_duration_sec || (ts.end_sec - ts.start_sec) || 5;
  const start = assTime;
  const end = start + duration;

  // Determine style: quote/source material gets quote font
  const isQuote = seg.rhetorical_role === "source" || seg.rhetorical_role === "quote";
  const font = isQuote ? quoteFont : mainFont;
  const styleName = isQuote ? "Quote" : "Default";

  assEvents.push({
    start,
    end,
    text: text.replace(/\n/g, "\\N"),
    style: styleName,
  });

  assTime = end;

  process.stdout.write(`  [${i + 1}/${segments.length}] ${seg.segment_id} (${duration.toFixed(1)}s) ${isQuote ? "📖" : "🎙️"}\n`);
}

// ── Write .ass file ──

const assStyles = `
[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,${mainFont},38,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,0,0,0,0,100,100,0,0,1,1.5,2,2,60,60,30,1
Style: Quote,${quoteFont},34,&H00FFE8C8,&H000000FF,&H00000000,&H80000000,0,1,0,0,100,100,1,0,1,1.5,2,2,60,60,30,1
Style: Title,${quoteFont},52,&H00FFE8C8,&H000000FF,&H00000000,&H80000000,0,0,0,0,100,100,2,0,1,2,3,8,60,60,50,1
`;

let assDialogue = "";
for (const evt of assEvents) {
  const startStr = toAssTime(evt.start);
  const endStr = toAssTime(evt.end);
  // Add fade in/out effect
  const fadeIn = Math.min(0.3, evt.end - evt.start - 0.3);
  const fadeOut = Math.min(0.3, evt.end - evt.start - 0.3);
  assDialogue += `Dialogue: 0,${startStr},${endStr},${evt.style},,0,0,0,,{\\fad(${Math.round(fadeIn*1000)},${Math.round(fadeOut*1000)})}${evt.text}\n`;
}

const assHeader = `
[Script Info]
Title: ${storyboard.episode_title || storyboardId}
ScriptType: v4.00+
WrapStyle: 0
ScaledBorderAndShadow: yes
YCbCr Matrix: TV.601
PlayResX: 1280
PlayResY: 720
`;

const assContent = assHeader + assStyles + "\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n" + assDialogue;

const assPath = path.join(outDir, `${storyboardId}.ass`);
fs.writeFileSync(assPath, assContent);
console.log(`\nASS subtitles: ${assPath} (${assEvents.length} events)`);

// ── Write .srt file (YouTube-compatible) ──

let srtContent = "";
for (let i = 0; i < assEvents.length; i++) {
  const evt = assEvents[i];
  srtContent += `${i + 1}\n`;
  srtContent += `${toSrtTime(evt.start)} --> ${toSrtTime(evt.end)}\n`;
  srtContent += `${evt.text.replace(/\\N/g, "\n")}\n\n`;
}

const srtPath = path.join(outDir, `${storyboardId}.srt`);
fs.writeFileSync(srtPath, srtContent);
console.log(`SRT subtitles: ${srtPath} (for YouTube upload)`);

// ── Helpers ──

function toAssTime(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(s.toFixed(2)).padStart(5, "0")}`;
}

function toSrtTime(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const cs = Math.round((s - Math.floor(s)) * 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(Math.floor(s)).padStart(2, "0")},${String(cs).padStart(3, "0")}`;
}

function opt(name, defaultValue) {
  const idx = process.argv.indexOf(name);
  return idx !== -1 && process.argv[idx + 1] !== undefined ? process.argv[idx + 1] : defaultValue;
}
