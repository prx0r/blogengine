import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const API_KEY = process.env.DEEPSEEK_API_KEY || "sk-7dtUVBKJrJcglO9WzdLQZJXwNuz1MucUrDQCZxJjJaH29Q8CqT357DSeFyHV4B75";
const API_URL = "https://opencode.ai/zen/go/v1/chat/completions";
const MODEL = "deepseek-v4-flash";

const styles = {
  faithful: {
    desc: "Minimal AI intrusion. Mostly source blocks. Let the author speak.",
    extra: "Keep AI blocks very short and rare. The essay should feel like the author is speaking, with only occasional clarification.",
  },
  nanavira: {
    desc: "Precise, philosophical, dense. Terse AI blocks. No fluff.",
    extra: "Write like Nanavira Thera: precise, rigorous, philosophical. Every word must carry weight. AI blocks should be terse and incisive. Use short punchy sentences. Avoid all padding.",
  },
  nanananda: {
    desc: "Careful, analytic, deconstructive. Slowly unfolding meaning.",
    extra: "Write like Nanananda: careful and analytic. Let meaning unfold slowly through examination of terms. AI blocks should deconstruct assumptions and clarify terms. Be methodical.",
  },
  hook: {
    desc: "Starts with a hook/abstract. Clear narrative arc. Structured.",
    extra: "Begin with a hook paragraph that frames why the reader should care. Structure with a clear arc: problem → exploration → insight. First AI block should act as an abstract.",
  },
  conversational: {
    desc: "Warmer tone. More AI explanation. Assumes less prior knowledge.",
    extra: "Warmer, more conversational tone. AI blocks can be longer. Assume the reader is intelligent but not familiar with the tradition. Define terms clearly. Use analogies.",
  },
};

const sourceId = process.argv[2];
const styleName = process.argv[3] || "faithful";
const customId = process.argv[4];

if (!sourceId) {
  console.error("Usage: node scripts/process-source.mjs <source-id> [style] [custom-id]");
  process.exit(1);
}

const style = styles[styleName];
if (!style) { console.error(`Unknown style: ${styleName}`); process.exit(1); }

const sourceDirs = [
  path.join(root, "content", "glossary", "sources", "essays"),
  path.join(root, "content", "glossary", "sources", "books"),
];
let sourcePath = null;
for (const dir of sourceDirs) {
  for (const f of [sourceId, `${sourceId}.pdf`, `${sourceId}.txt`]) {
    const c = path.join(dir, f);
    if (fs.existsSync(c)) { sourcePath = c; break; }
  }
  if (sourcePath) break;
}
if (!sourcePath) { console.error(`Source not found: ${sourceId}`); process.exit(1); }

console.log(`\n Processing: ${path.basename(sourcePath)}`);
console.log(` Style: ${styleName} — ${style.desc}`);

let rawText;
if (sourcePath.endsWith(".txt")) {
  rawText = fs.readFileSync(sourcePath, "utf-8");
} else {
  const result = spawnSync("pdftotext", [sourcePath, "-"], { encoding: "utf-8", maxBuffer: 50 * 1024 * 1024 });
  if (result.status !== 0) { console.error("pdftotext failed:", result.stderr); process.exit(1); }
  rawText = result.stdout;
}
console.log(` Extracted ${rawText.length} chars`);

const cleanText = rawText
  .replace(/\f/g, "\n\n")
  .replace(/(\n){4,}/g, "\n\n\n")
  .replace(/□|■|●|○|▪|▸|→/g, "")
  .trim();

const maxChars = process.env.MAX_SOURCE_CHARS ? parseInt(process.env.MAX_SOURCE_CHARS) : 30000;
const truncated = cleanText.length > maxChars ? cleanText.slice(0, maxChars) + "\n\n[...]" : cleanText;
console.log(` Sending ${truncated.length} chars to API (max ${maxChars})`);

const essayProcess = fs.readFileSync(path.join(root, "essayprocess.md"), "utf-8");
const essayWriter = fs.readFileSync(path.join(root, "essaywriter.md"), "utf-8");

const systemPrompt = [
  "You are an essay condenser. Follow these rules precisely.",
  essayProcess,
  "## Style Instruction\n\nStyle: " + styleName + "\n" + style.extra,
  "## Additional Rules",
  essayWriter,
  "",
  "Target: 20-40 body blocks, 8000-15000 chars total. Be thorough. Start with a hook. End with a conclusion.",
  "Respond with valid JSON only. No markdown fences.",
].join("\n\n");

async function callAPI(jsonMode, timeoutMs) {
  const body = {
    model: MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: "Source text:\n\n" + truncated },
    ],
    temperature: 0.3,
    max_tokens: 4096,
  };
  if (jsonMode) body.response_format = { type: "json_object" };

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + API_KEY },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
  });
  return res;
}

async function main() {
  console.log(`\n Calling ${MODEL}...`);

  let res = await callAPI(true, 180000);

  for (let attempts = 0; attempts < 3; attempts++) {
    if (!res.ok) {
      const err = await res.text().catch(() => "");
      console.log(` Attempt ${attempts + 1}: API error ${res.status}, retrying...`);
      res = await callAPI(false, 180000);
      continue;
    }
    const raw = await res.text();
    let content = null;
    try {
      const data = JSON.parse(raw);
      content = data.choices?.[0]?.message?.content;
    } catch {}
    if (content && content.trim().length > 0) {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const toParse = jsonMatch ? jsonMatch[0] : content;
      try {
        const result = JSON.parse(toParse);
        await saveResult(result);
        return;
      } catch (parseErr) {
        console.log(` Attempt ${attempts + 1}: JSON parse failed, retrying...`);
        res = await callAPI(false, 180000);
        continue;
      }
    }
    console.log(` Attempt ${attempts + 1}: empty content, retrying...`);
    res = await callAPI(false, 180000);
  }
  console.error("Failed after 3 attempts");
  process.exit(1);
}

await main();

async function saveResult(result) {
  const sourceIdClean = customId || sourceId.replace(/\.pdf$/, "");
  const essay = result.essay || result.condensed_essay || result.body ? { body: result.body, concepts: result.concepts } : null;
  const source = result.source || { title: sourceIdClean, author: "", type: "pdf", tradition: [], notes: "" };
  const concepts = result.concepts || [];

  // Save source JSON
  const sf = path.join(root, "content", "glossary", "sources", sourceIdClean + ".json");
  fs.writeFileSync(sf, JSON.stringify(source, null, 2));
  console.log(` Source → ${path.relative(root, sf)}`);

  // Save essay JSON
  const essayId = customId || result.essay?.id || sourceIdClean;
  const ef = path.join(root, "content", "glossary", "essays", essayId + ".json");
  const essayData = { ...(result.essay || {}), id: essayId, title: result.essay?.title || source.title || sourceIdClean, type: "condensed_source", source_ids: [sourceIdClean], author: source.author || "", concepts: concepts.map(c => c.name || c), prerequisites: [], body: result.body || result.essay?.body || [], notes: "" };
  fs.writeFileSync(ef, JSON.stringify(essayData, null, 2));
  console.log(` Essay → ${path.relative(root, ef)}`);

  // Save concept JSONs
  for (const c of concepts) {
    const cid = c.id || "concept_" + (c.name || "").toLowerCase().replace(/\s+/g, "_");
    const cf = path.join(root, "content", "glossary", "concepts", cid + ".json");
    fs.writeFileSync(cf, JSON.stringify(c, null, 2));
    console.log(` Concept → ${path.relative(root, cf)}`);
  }

  const blocks = essayData.body || [];
  console.log(`\n Summary:`);
  console.log(`  Source: ${path.basename(sourcePath)}`);
  console.log(`  Style: ${styleName}`);
  console.log(`  Title: ${essayData.title}`);
  console.log(`  Blocks: ${blocks.length} (${blocks.filter(b=>b.kind==='source').length}s ${blocks.filter(b=>b.kind==='ai').length}ai ${blocks.filter(b=>b.kind==='summary').length}sum)`);
  console.log(`  Length: ${blocks.reduce((a,b) => a + b.text.length, 0)} chars`);
  console.log(`  Concepts: ${concepts.map(c => c.name || c).join(", ")}`);
  console.log(`\n Done!`);
}
