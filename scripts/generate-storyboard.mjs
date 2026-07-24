#!/usr/bin/env node
/**
 * generate-storyboard.mjs
 *
 * Takes an RO ID or essay ID and generates a storyboard JSON asset.
 * Uses DeepSeek to produce the segment-level visual script with
 * narration text, per-segment Manim scene specs, and on-screen text.
 *
 * Usage:
 *   node scripts/generate-storyboard.mjs --ro ro:nanavira-clearing-path
 *   node scripts/generate-storyboard.mjs --essay ficino-on-the-daimon
 *   node scripts/generate-storyboard.mjs --ro ro:nanavira-clearing-path --title "My Episode" --series "the-tetrahedron"
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const storyboardDir = path.join(root, "content", "publishing", "storyboards");
const roDir = path.join(root, "content", "research-objects");

const API_KEY =
  process.env.DEEPSEEK_API_KEY ||
  process.env.VIDEO_LLM_API_KEY ||
  process.env.OPENCODE_API_KEY || "KEY_REMOVED_SECURITY";
const BASE_URL = process.env.VIDEO_LLM_BASE_URL || "https://opencode.ai/zen/go/v1";
const MODEL = process.env.VIDEO_LLM_MODEL || "deepseek-v4-flash";

// --- CLI ---
const args = parseArgs();
if (!args.ro && !args.essay) {
  console.error("Usage: --ro <ro_id> or --essay <essay_id> [--title <string>] [--series <string>] [--voice <edge-tts-voice>]");
  process.exit(1);
}

const title = args.title || null;
const series = args.series || null;
const voice = args.voice || "en-US-AriaNeural";

// --- Load source content ---
let sourceText = "";
let sourceTitle = "";
let sourceRos = [];

if (args.ro) {
  const roPath = path.join(roDir, `${args.ro.replace("ro:", "ro-")}`, "ro.json");
  if (!fs.existsSync(roPath)) {
    console.error(`RO not found: ${roPath}`);
    process.exit(1);
  }
  const ro = JSON.parse(fs.readFileSync(roPath, "utf-8"));
  sourceTitle = title || ro.title;
  sourceRos = [args.ro];

  sourceText += `TITLE: ${ro.title}\n`;
  sourceText += `SUBTITLE: ${ro.subtitle || ""}\n`;
  sourceText += `SUMMARY: ${ro.summary?.one_line || ""}\n\n`;
  sourceText += `SCOPE: ${ro.summary?.scope || ""}\n\n`;
  sourceText += "PASSAGES:\n";

  for (const passage of ro.body || []) {
    const kind = passage.kind || "source";
    const section = passage.section ? ` [${passage.section}]` : "";
    sourceText += `--- ${kind}${section} ---\n${passage.text}\n\n`;
  }
} else {
  // Load essay JSON
  const essayPaths = [
    path.join(root, "content", "glossary", "essays", `${args.essay}.json`),
    path.join(root, "content", "essays", `${args.essay}.json`),
  ];
  let essayPath = essayPaths.find(p => fs.existsSync(p));
  if (!essayPath) {
    console.error(`Essay not found: ${args.essay}`);
    process.exit(1);
  }
  const essay = JSON.parse(fs.readFileSync(essayPath, "utf-8"));
  sourceTitle = title || essay.title;
  sourceText += `TITLE: ${essay.title}\n\n`;
  sourceText += "BODY:\n";
  for (const block of essay.body || []) {
    sourceText += `[${block.kind}] ${block.text}\n\n`;
  }
}

// --- Generate storyboard via DeepSeek ---
const systemPrompt = `You are a storyboard director for a video channel called Distillery — philosophical, contemplative, geometric explainer videos. The visual style is: dark void background (#0D1117), gold wireframe geometry (#D4A574), green accent (#00FF88), serif title cards, archival manuscript textures, contemplative pacing.

Your job: convert source material into a JSON storyboard. The storyboard splits the material into 5-8 segments (each 60-180 seconds). Each segment has:
- A label and rhetorical role
- Narration text (the voiceover script — YOUR words explaining the material clearly)
- A Manim scene spec (what the animation shows)
- On-screen text elements (title cards, labels, quotes)

RULES:
- Narration must be conversational, precise, no jargon without explanation. Like 3Blue1Brown but slower, more contemplative.
- Each segment should teach ONE idea clearly.
- The first segment is always a HOOK — grab attention.
- The last segment is always a CLOSING — bring it home, leave them thinking.
- Include at least one QUOTE segment with a direct citation.
- Manim scenes should describe geometries, not vague "beautiful imagery."
- Estimate realistic seconds for each segment (narration at ~150 words/min).
- Output valid JSON only. No markdown. No code fences.

The storyboard JSON schema:
{
  "episode_id": "kebab-case-id",
  "episode_title": "string",
  "series": "string",
  "episode_number": 1,
  "version": "0.1.0",
  "source_ros": ["ro:..."],
  "source_docs": ["..."],
  "global_concepts": ["..."],
  "mythos_filter": "hermetic-documentary",
  "style_profile": "distillery-dark-gold",
  "visual_direction": "...",
  "narration_voice": "${voice}",
  "estimated_duration_min": 0,
  "segments": [
    {
      "segment_id": "seg-NN-label",
      "label": "Human-readable segment name",
      "start_sec": 0,
      "end_sec": 0,
      "rhetorical_role": "hook|thesis|expansion|quote|contrast|example|synthesis|closing",
      "narration": "Full voiceover text for this segment",
      "visual": {
        "type": "manim",
        "scene_file": "snake_case.py",
        "scene_class": "CamelCase",
        "description": "What the scene shows geometrically",
        "manim_duration_sec": 0,
        "color_palette": "distillery-dark-gold"
      },
      "on_screen_text": [
        { "text": "...", "style": "title-serif|label|label-emphasis|formula|quote-serif|citation|closing-serif|closing-emphasis|subtitle|vertex-label", "position": "center|top|below|top-left|top-right|bottom-left|bottom-right|mid-right" }
      ],
      "concepts": ["..."],
      "quote_active": false,
      "quote_text": null,
      "quote_source": null
    }
  ],
  "youtube_metadata": {
    "title": "...",
    "description": "...",
    "tags": ["..."],
    "category": "Education",
    "privacy": "private",
    "playlist": "..."
  },
  "analytics_tags": {
    "rhetorical_roles_used": ["..."],
    "visual_types_used": ["..."],
    "concept_density": "low|medium|high",
    "quote_ratio": 0
  }
}`;

console.log(`Generating storyboard for: ${sourceTitle}`);
console.log(`Source material: ${Math.round(sourceText.length / 1000)}K chars`);
console.log("Calling DeepSeek...");

const apiPath = BASE_URL.endsWith("/v1") ? `${BASE_URL}/chat/completions` : `${BASE_URL}/v1/chat/completions`;
const response = await fetch(apiPath, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
  body: JSON.stringify({
    model: MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Episode title: ${sourceTitle}\nSeries: ${series || "standalone"}\n\nSource material:\n${sourceText.slice(0, 24000)}` },
    ],
    temperature: 0.6,
    max_tokens: 16000,
  }),
});

if (!response.ok) {
  console.error(`LLM API error: ${response.status}`);
  console.error(await response.text());
  process.exit(1);
}

const data = await response.json();
const msg = data.choices?.[0]?.message;
const content = msg?.content || msg?.reasoning_content;

if (!content) {
  console.error("LLM returned empty response. The source may be too long.");
  console.error("Try with a shorter source or use --essay with a pre-compiled essay JSON.");
  process.exit(1);
}

// Parse the JSON (strip any accidental markdown fences)
let storyboard;
const jsonMatch = content.match(/\{[\s\S]*\}/);
if (jsonMatch) {
  try {
    storyboard = JSON.parse(jsonMatch[0]);
  } catch {
    console.error("Failed to parse LLM response as JSON.");
    console.error("Raw response:", content.slice(0, 500));
    process.exit(1);
  }
} else {
  console.error("DeepSeek response did not contain JSON.");
  console.error("Raw:", content.slice(0, 500));
  process.exit(1);
}

// --- Enrich & save ---
storyboard.episode_id = storyboard.episode_id || args.ro?.replace("ro:", "") || args.essay || "untitled";
storyboard.source_ros = storyboard.source_ros || sourceRos;
storyboard.series = storyboard.series || series || "standalone";
storyboard.version = "0.1.0";
storyboard.narration_voice = voice;
storyboard.timeline = [
  { date: new Date().toISOString().split("T")[0], event: "Storyboard generated via DeepSeek.", version: "0.1.0" },
];

// Calculate total duration
let totalSec = 0;
for (let i = 0; i < storyboard.segments.length; i++) {
  const seg = storyboard.segments[i];
  seg.segment_id = seg.segment_id || `seg-${String(i + 1).padStart(2, "0")}-${seg.rhetorical_role || "content"}`;
  seg.start_sec = totalSec;
  const dur = seg.visual?.manim_duration_sec || seg.end_sec - seg.start_sec || 90;
  seg.end_sec = seg.start_sec + dur;
  totalSec = seg.end_sec;
}
storyboard.estimated_duration_min = Math.round(totalSec / 60);

// Write
const outPath = path.join(storyboardDir, `${storyboard.episode_id}.json`);
fs.mkdirSync(storyboardDir, { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(storyboard, null, 2));
console.log(`\nStoryboard saved: ${outPath}`);
console.log(`Segments: ${storyboard.segments.length}`);
console.log(`Estimated duration: ~${storyboard.estimated_duration_min} min`);
console.log(`Narration voice: ${voice}`);

// --- Helpers ---
function parseArgs() {
  const result = {};
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--ro") result.ro = argv[++i];
    else if (argv[i] === "--essay") result.essay = argv[++i];
    else if (argv[i] === "--title") result.title = argv[++i];
    else if (argv[i] === "--series") result.series = argv[++i];
    else if (argv[i] === "--voice") result.voice = argv[++i];
  }
  return result;
}
