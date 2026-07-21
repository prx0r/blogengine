import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const ficinoDir = path.join(root, "essayglobal", "blueprints", "Ficino - Three Books on Life");

const essayId = process.argv[2];
if (!essayId) {
  console.error("Usage: node scripts/build-thesis-json.mjs <essay-slug>");
  process.exit(1);
}

const essayPath = path.join(ficinoDir, essayId, "essay.md");
if (!fs.existsSync(essayPath)) {
  console.error(`Essay not found at ${essayPath}`);
  process.exit(1);
}

const markdown = fs.readFileSync(essayPath, "utf-8");
const lines = markdown.split("\n");

const body = [];
let currentText = "";
let currentKind = null;

function flush() {
  if (currentText.trim()) {
    body.push({ kind: currentKind || "ai", text: currentText.trim() });
  }
  currentText = "";
  currentKind = null;
}

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const trimmed = line.trim();

  // Skip title, separators, empty lines
  if (trimmed.startsWith("# ") || trimmed === "---") {
    flush();
    continue;
  }

  // Empty line — flush current block
  if (trimmed === "") {
    flush();
    continue;
  }

  // Standalone italic line = Latin tag (skip or merge)
  if (/^\*.*\*$/.test(trimmed) && trimmed.length < 80) {
    continue;
  }

  // Detect if line is a source quote: starts with " and has substantial quoted content
  const hasSourceQuote = trimmed.startsWith("\"") && trimmed.length > 30;

  // Detect section headers (short lines with no period)
  if (!trimmed.includes(".") && trimmed.length < 50 && !trimmed.startsWith("\"")) {
    // It's likely a section transition — treat as ai
    if (currentKind !== "ai") flush();
    currentKind = "ai";
    currentText = (currentText || "") + (currentText ? " " : "") + trimmed;
    continue;
  }

  const kind = hasSourceQuote ? "source" : "ai";

  if (currentKind !== kind) {
    flush();
    currentKind = kind;
  }

  const clean = trimmed.replace(/\*+/g, "").replace(/_/g, "");
  currentText = (currentText || "") + (currentText ? " " : "") + clean;
}
flush();

// Merge consecutive same-kind blocks
const merged = [];
for (const block of body) {
  const last = merged[merged.length - 1];
  if (last && last.kind === block.kind) {
    last.text += " " + block.text;
  } else {
    merged.push({ ...block });
  }
}

const slug = essayId.replace(/^\d+-/, "").replace(/-/g, "_");
const titleMatch = markdown.match(/^# (.+)$/m);
const title = titleMatch ? titleMatch[1].trim() : essayId;

const json = {
  id: `ficino_${slug}`,
  title,
  type: "thesis_essay",
  source_ids: ["ficino-three-books-of-life"],
  author: "Marsilio Ficino",
  concepts: [],
  body: merged,
};

const outDir = path.join(root, "content", "glossary", "essays");
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, `${json.id}.json`);
fs.writeFileSync(outPath, JSON.stringify(json, null, 2));

console.log(`Written: ${outPath}`);
console.log(`Title: ${json.title}`);
console.log(`Blocks: ${json.body.length} (source: ${json.body.filter(b => b.kind === "source").length}, ai: ${json.body.filter(b => b.kind === "ai").length})`);
