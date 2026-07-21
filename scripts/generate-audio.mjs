import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const essayId = process.argv[2];

if (!essayId) {
  console.error("Usage: npm run generate:audio -- <essay-id>");
  process.exit(1);
}

const voiceMap = {
  source: "en-GB-RyanNeural",
  ai: "en-US-AriaNeural",
  summary: "en-US-AriaNeural",
};
const defaultVoice = "en-US-AriaNeural";
const maxChars = Number(process.env.TTS_CHUNK_CHARS || 900);
const cacheDir = process.env.BLOGENGINE_AUDIO_CACHE_DIR
  ? path.resolve(root, process.env.BLOGENGINE_AUDIO_CACHE_DIR)
  : path.join(root, "data", "tts-cache");
const publicAudioDir = path.join(root, "public", "audio");
const R2_PUBLIC = "https://pub-8f77709efb2043fbbd8e88677347249a.r2.dev";
const R2_BUCKET = "atlas-sources";
let essayPath = path.join(root, "content", "essays", `${essayId}.json`);
if (!fs.existsSync(essayPath)) {
  essayPath = path.join(root, "content", "glossary", "essays", `${essayId}.json`);
}
const audioPath = path.join(publicAudioDir, `${essayId}.mp3`);

if (!fs.existsSync(essayPath)) {
  console.error(`Essay not found at content/essays/${essayId}.json or content/glossary/essays/${essayId}.json`);
  process.exit(1);
}

const essay = JSON.parse(fs.readFileSync(essayPath, "utf-8"));

fs.mkdirSync(cacheDir, { recursive: true });
fs.mkdirSync(publicAudioDir, { recursive: true });

console.log(`Essay: ${essay.title}`);

// Process each body block individually with its mapped voice
const chunkFiles = [];

if (Array.isArray(essay.body)) {
  for (let i = 0; i < essay.body.length; i++) {
    const block = essay.body[i];
    if (block.kind === "art") continue;
    const voice = voiceMap[block.kind] || defaultVoice;
    const blockChunks = chunkText(block.text, maxChars);

    for (let j = 0; j < blockChunks.length; j++) {
      const text = blockChunks[j];
      const filePath = cachePath(text, voice);
      chunkFiles.push({ path: filePath, voice });
      process.stdout.write(`  [${i + 1}/${essay.body.length}] [${block.kind}] ${voice} chunk ${j + 1}/${blockChunks.length} (${text.length}c)`);

      if (fs.existsSync(filePath) && fs.statSync(filePath).size > 0) {
        process.stdout.write(" cached\n");
        continue;
      }

      process.stdout.write(" generating...\n");
      synthesize(text, voice, filePath);
    }
  }
} else {
  // Fallback for plain-text body essays
  const voice = defaultVoice;
  const chunks = chunkText(essay.body, maxChars);
  for (let i = 0; i < chunks.length; i++) {
    const text = chunks[i];
    const filePath = cachePath(text, voice);
    chunkFiles.push({ path: filePath, voice });
    if (fs.existsSync(filePath) && fs.statSync(filePath).size > 0) {
      console.log(`  ${i + 1}/${chunks.length} ${voice} cached`);
      continue;
    }
    console.log(`  ${i + 1}/${chunks.length} ${voice} generating (${text.length}c)`);
    synthesize(text, voice, filePath);
  }
}

if (chunkFiles.length === 0) {
  console.error("No audio generated");
  process.exit(1);
}

if (chunkFiles.length === 1) {
  fs.copyFileSync(chunkFiles[0].path, audioPath);
} else {
  const paths = chunkFiles.map(c => c.path);
  concatMp3(paths, audioPath);
}

// Post-process: apply reverb + EQ for more natural TTS sound
const filterChain = process.env.TTS_DISABLE_FILTERS
  ? null
  : "highpass=f=80,equalizer=f=3000:width_type=h:width=1500:g=-4,equalizer=f=200:width_type=h:width=200:g=2,aecho=0.8:0.7:30:0.1";

if (filterChain) {
  const tmpPath = audioPath.replace(".mp3", "-raw.mp3");
  fs.renameSync(audioPath, tmpPath);
  const result = spawnSync("ffmpeg", [
    "-i", tmpPath,
    "-af", filterChain,
    "-y", audioPath,
  ], { stdio: "inherit" });
  fs.rmSync(tmpPath);
  if (result.status !== 0) {
    console.warn("Post-processing failed, using unprocessed audio");
    fs.renameSync(tmpPath, audioPath);
  } else {
    console.log("Post-processed: reverb + EQ applied");
  }
}

essay.audioUrl = `${R2_PUBLIC}/audio/${essayId}.mp3`;
fs.writeFileSync(essayPath, `${JSON.stringify(essay, null, 2)}\n`);
if (fs.existsSync(path.join(root, "content", "essays"))) {
  rebuildEssayIndex();
}

// Upload to R2
try {
  const result = spawnSync("npx", [
    "--no-install", "wrangler", "r2", "object", "put",
    `${R2_BUCKET}/audio/${essayId}.mp3`,
    "--file", audioPath,
    "--remote",
  ], { stdio: "inherit", cwd: root });
  if (result.status === 0) {
    console.log(`Uploaded to R2: ${essay.audioUrl}`);
  } else {
    console.warn("R2 upload failed, audio only available locally");
    essay.audioUrl = `/audio/${essayId}.mp3`;
    fs.writeFileSync(essayPath, `${JSON.stringify(essay, null, 2)}\n`);
  }
} catch (e) {
  console.warn("R2 upload error, using local path:", e.message);
  essay.audioUrl = `/audio/${essayId}.mp3`;
  fs.writeFileSync(essayPath, `${JSON.stringify(essay, null, 2)}\n`);
}

const stat = fs.statSync(audioPath);
console.log(`\nAudio: public/audio/${essayId}.mp3 (${Math.round(stat.size / 1024)} KB)`);
console.log(`Updated: ${path.basename(essayPath)}`);
console.log("Voices used:", [...new Set(chunkFiles.map(c => c.voice))].join(", "));

function cachePath(text, voice) {
  const hash = crypto.createHash("sha1").update(`${voice}\nmp3\n${text}`).digest("hex");
  return path.join(cacheDir, `${voice}-${hash}.mp3`);
}

function synthesize(text, voice, outputPath) {
  const result = spawnSync("edge-tts", [
    "--voice", voice,
    "--text", text,
    "--write-media", outputPath,
  ], { stdio: "inherit" });

  if (result.status !== 0) {
    throw new Error(`edge-tts failed with exit code ${result.status}`);
  }
}

function chunkText(text, limit) {
  const paragraphs = text.split(/\n+/).map((part) => part.trim()).filter(Boolean);
  const chunks = [];
  let current = "";

  for (const paragraph of paragraphs) {
    if (paragraph.length > limit) {
      flush();
      chunks.push(...splitLongParagraph(paragraph, limit));
      continue;
    }

    if (current && `${current}\n\n${paragraph}`.length > limit) {
      flush();
    }
    current = current ? `${current}\n\n${paragraph}` : paragraph;
  }

  flush();
  return chunks;

  function flush() {
    if (current) chunks.push(current);
    current = "";
  }
}

function splitLongParagraph(paragraph, limit) {
  const sentences = paragraph.match(/[^.!?]+[.!?]+["']?|[^.!?]+$/g) || [paragraph];
  const chunks = [];
  let current = "";

  for (const sentence of sentences.map((value) => value.trim()).filter(Boolean)) {
    if (sentence.length > limit) {
      if (current) chunks.push(current);
      chunks.push(...sentence.match(new RegExp(`.{1,${limit}}(\\s|$)`, "g")).map((value) => value.trim()).filter(Boolean));
      current = "";
      continue;
    }

    if (current && `${current} ${sentence}`.length > limit) {
      chunks.push(current);
      current = "";
    }
    current = current ? `${current} ${sentence}` : sentence;
  }

  if (current) chunks.push(current);
  return chunks;
}

function concatMp3(files, outputPath) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "blogengine-audio-"));
  const listPath = path.join(tmpDir, "files.txt");
  fs.writeFileSync(listPath, files.map((file) => `file '${file.replace(/'/g, "'\\''")}'`).join("\n"));

  const result = spawnSync("ffmpeg", [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-f",
    "concat",
    "-safe",
    "0",
    "-i",
    listPath,
    "-c",
    "copy",
    outputPath,
  ], { stdio: "inherit" });

  fs.rmSync(tmpDir, { recursive: true, force: true });

  if (result.status !== 0) {
    throw new Error("ffmpeg failed to concatenate audio chunks");
  }
}

function rebuildEssayIndex() {
  // Only for legacy essays in content/essays/
  const essaysDir = path.join(root, "content", "essays");
  if (!fs.existsSync(essaysDir)) return;
  const sourcesDir = path.join(root, "content", "sources");
  const sources = {};
  if (fs.existsSync(sourcesDir)) {
    for (const file of fs.readdirSync(sourcesDir).filter((name) => name.endsWith(".json"))) {
      const source = JSON.parse(fs.readFileSync(path.join(sourcesDir, file), "utf-8"));
      sources[source.id] = source.title;
    }
  }

  const indexData = fs.readdirSync(essaysDir)
    .filter((name) => name.endsWith(".json"))
    .map((file) => {
      const item = JSON.parse(fs.readFileSync(path.join(essaysDir, file), "utf-8"));
      return {
        id: item.id,
        title: item.title,
        category: item.category,
        sourceName: sources[item.sourceId] || "",
        audioUrl: item.audioUrl,
      };
    });

  fs.writeFileSync(path.join(root, "public", "essays-index.json"), `${JSON.stringify(indexData, null, 2)}\n`);
}
