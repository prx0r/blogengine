import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const API_KEY = process.env.DEEPSEEK_API_KEY || "sk-7dtUVBKJrJcglO9WzdLQZJXwNuz1MucUrDQCZxJjJaH29Q8CqT357DSeFyHV4B75";

const sourceFile = process.argv[2];
const essayId = process.argv[3];
if (!sourceFile || !essayId) {
  console.error("Usage: node scripts/generate-long-essay.mjs <source-filename> <essay-id>");
  process.exit(1);
}

const sourcePath = path.join(root, "content", "glossary", "sources", "essays", sourceFile);
if (!fs.existsSync(sourcePath)) {
  console.error("Source not found:", sourcePath);
  process.exit(1);
}

console.log("Extracting text...");
const result = spawnSync("pdftotext", [sourcePath, "-"], { encoding: "utf-8", maxBuffer: 100 * 1024 * 1024 });
const cleanText = result.stdout.replace(/\f/g, "\n\n").replace(/(\n){4,}/g, "\n\n\n").trim();
console.log(`Extracted ${cleanText.length} chars`);

// Split into chunks of ~20K chars
const CHUNK_SIZE = 20000;
const chunks = [];
for (let i = 0; i < cleanText.length; i += CHUNK_SIZE) {
  chunks.push(cleanText.slice(i, i + CHUNK_SIZE));
}
console.log(`Split into ${chunks.length} chunks`);

const systemPrompt = `Do not reason. Output directly. You format source text as JSON body blocks.

Rules:
- Most blocks: "source" (author's own words, keep long passages intact)
- "summary": compress citations, footnotes, repetitive sections only
- "ai": rarely, only when a term needs clarification
- Remove only: citations in parentheses, footnotes, bibliography, page numbers
- Output ONLY valid JSON: {"body":[{"kind":"source|ai|summary","text":"..."}]}
- TTS constraint: no citations like (Corbin 1969), no markdown`;

let allBlocks = [];
let allConcepts = [];
let essayMeta = {};

for (let i = 0; i < chunks.length; i++) {
  const isFirst = i === 0;
  const isLast = i === chunks.length - 1;
  const userPrompt = isFirst
    ? `This is the full source text. Process it into body blocks:\n\n${chunks[i]}`
    : `Continue processing the source text:\n\n${chunks[i]}`;

  const instruction = isFirst
    ? `\n\nFor this first chunk, also output the essay metadata and concepts in this format: {"essay":{"id":"${essayId}","title":"...","type":"condensed_source","source_ids":["..."],"author":"...","concepts":[...],"body":[...]},"concepts":[...],"body":[...]}`
    : `\n\nOutput ONLY: {"body":[...]}`;

  console.log(`\nChunk ${i + 1}/${chunks.length} (${chunks[i].length} chars)...`);
  
  const res = await fetch("https://opencode.ai/zen/go/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + API_KEY },
    body: JSON.stringify({
      model: "deepseek-v4-flash",
      messages: [
        { role: "system", content: systemPrompt + instruction },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.2,
      max_tokens: 32768,
    }),
    signal: AbortSignal.timeout(300000),
  });

  const raw = await res.text();
  if (!res.ok) {
    console.error(`Chunk ${i + 1} failed:`, raw.slice(0, 300));
    continue;
  }

  let content;
  try {
    const data = JSON.parse(raw);
    content = data.choices?.[0]?.message?.content;
    if (!content || content.trim().length === 0) {
      console.error(`Chunk ${i + 1}: empty content`);
      continue;
    }
  } catch { console.error(`Chunk ${i + 1}: parse error`); continue; }

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) { console.error(`Chunk ${i + 1}: no JSON found`); continue; }

  let parsed;
  try { parsed = JSON.parse(jsonMatch[0]); }
  catch { console.error(`Chunk ${i + 1}: JSON parse error`); continue; }

  if (isFirst) {
    essayMeta = parsed.essay || {};
    allConcepts = parsed.concepts || [];
  }

  const chunkBody = parsed.body || parsed.essay?.body || [];
  allBlocks = allBlocks.concat(chunkBody);
  console.log(`  Got ${chunkBody.length} blocks (total: ${allBlocks.length})`);
}

if (allBlocks.length === 0) {
  console.error("No blocks generated from any chunk");
  process.exit(1);
}

// Save results
const dirs = {
  sources: path.join(root, "content", "glossary", "sources"),
  essays: path.join(root, "content", "glossary", "essays"),
  concepts: path.join(root, "content", "glossary", "concepts"),
};
Object.values(dirs).forEach(d => fs.mkdirSync(d, { recursive: true }));

const finalEssay = {
  ...essayMeta,
  id: essayId,
  body: allBlocks,
};
fs.writeFileSync(path.join(dirs.essays, essayId + ".json"), JSON.stringify(finalEssay, null, 2));

const sourceData = {
  title: finalEssay.title || sourceFile.replace(".pdf", ""),
  author: finalEssay.author || "",
  type: "pdf",
  tradition: [],
};
fs.writeFileSync(path.join(dirs.sources, essayId + ".json"), JSON.stringify(sourceData, null, 2));

for (const c of allConcepts) {
  const cid = c.id || "concept_" + (c.name || "").toLowerCase().replace(/\s+/g, "_");
  fs.writeFileSync(path.join(dirs.concepts, cid + ".json"), JSON.stringify(c, null, 2));
}

const s = allBlocks.filter(b => b.kind === "source").length;
const a = allBlocks.filter(b => b.kind === "ai").length;
const sum = allBlocks.filter(b => b.kind === "summary").length;
const totalChars = allBlocks.reduce((acc, b) => acc + (b.text || "").length, 0);

console.log(`\nDone!`);
console.log(`Total blocks: ${allBlocks.length} (${s} source, ${a} ai, ${sum} summary)`);
console.log(`Total chars: ${totalChars}`);
console.log(`Concepts: ${allConcepts.map(c => c.name || c).join(", ")}`);
