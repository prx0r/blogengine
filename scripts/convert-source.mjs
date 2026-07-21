/**
 * Source-to-Essay Converter
 *
 * Converts a source PDF into:
 *   1. Work JSON (content/works/work_<slug>.json) — metadata + cleaned text + refs
 *   2. Essay JSON (content/glossary/essays/<slug>.json) — voice-tagged body blocks
 *
 * Usage: node scripts/convert-source.mjs <pdf-path> [options]
 *   --dry-run    Preview without writing files
 *   --validate   Only validate existing JSONs, don't convert
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const ROOT = path.resolve(import.meta.dirname, "..");

// ── Citation patterns ───────────────────────────────────
const CITATION_PAREN = /\([^)]*(?:et al\.|&|,?\s*(?:19|20)\d{2})[^)]*\)/g;
const CITATION_BRACKET = /\[[\d,\s–-]+\]/g;
const CITATION_FN = /\[\d+\]/g;
const REF_SECTION = /\n(?:references|bibliography|works cited|notes)\s*\n/i;

// ── Validation ───────────────────────────────────────────

function validateWorkJson(w) {
  const errors = [];
  if (!w.work_id?.startsWith("work:")) errors.push("work_id must start with 'work:'");
  if (!w.title) errors.push("title is required");
  if (!w.authors?.length) errors.push("authors array required");
  if (![1, 2].includes(w.tier)) errors.push("tier must be 1 or 2");
  if (w.body_clean && (CITATION_PAREN.test(w.body_clean) || CITATION_BRACKET.test(w.body_clean))) {
    errors.push("body_clean contains in-text citations");
  }
  return errors;
}

function validateEssayJson(e) {
  const errors = [];
  if (!e.id?.match(/^[a-z0-9_-]+$/)) errors.push("id must match [a-z0-9_-]+");
  if (e.type !== "condensed_source") errors.push("type must be condensed_source");
  if (!Array.isArray(e.body) || !e.body.length) { errors.push("body array required"); return errors; }
  for (const b of e.body) {
    if (!["ai", "source", "art"].includes(b.kind)) errors.push(`invalid block kind: ${b.kind}`);
    if (b.kind !== "art" && b.text?.length < 10) errors.push(`block too short: ${b.text?.substring(0, 40)}`);
    if (b.text && CITATION_BRACKET.test(b.text)) errors.push(`block contains bracketed citation: ${b.text.substring(0, 60)}`);
  }
  // Check alternation
  const kinds = e.body.filter(b => b.kind !== "art").map(b => b.kind);
  for (let i = 1; i < kinds.length; i++) {
    if (kinds[i] === kinds[i-1]) errors.push(`consecutive ${kinds[i]} blocks at index ${i}`);
  }
  return errors;
}

// ── Citation stripping ───────────────────────────────────

function stripCitations(text) {
  let cleaned = text
    .replace(CITATION_PAREN, "")
    .replace(CITATION_BRACKET, "")
    .replace(CITATION_FN, "");
  // Clean up double spaces and spaces before punctuation
  cleaned = cleaned.replace(/\s{2,}/g, " ").replace(/\s+([.,;:!?])/g, "$1");
  return cleaned.trim();
}

function extractReferences(text) {
  const lines = text.split("\n");
  const refStart = lines.findIndex(l => REF_SECTION.test(l));
  if (refStart < 0) return { body: text, refs: [] };
  const refLines = lines.slice(refStart + 1).filter(l => l.trim());
  const body = lines.slice(0, refStart).join("\n");
  return { body, refs: refLines.map(l => l.trim().replace(/^\[\d+\]\s*/, "")) };
}

// ── PDF text extraction ──────────────────────────────────

function extractPdfText(pdfPath) {
  try {
    const out = execSync(`pdftotext "${pdfPath}" -`, { encoding: "utf-8", timeout: 30000 });
    return out;
  } catch {
    console.error("  ⚠ pdftotext not available");
    return "";
  }
}

// ── Main ─────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const pdfPath = args.find(a => !a.startsWith("--"));
  const dryRun = args.includes("--dry-run");
  const validateOnly = args.includes("--validate");

  if (validateOnly) {
    // Validate all existing work and essay JSONs
    const dirs = [
      path.join(ROOT, "content", "works"),
      path.join(ROOT, "content", "glossary", "essays"),
    ];
    let total = 0, errors = 0;
    for (const dir of dirs) {
      if (!fs.existsSync(dir)) continue;
      for (const f of fs.readdirSync(dir).filter(f => f.endsWith(".json"))) {
        const data = JSON.parse(fs.readFileSync(path.join(dir, f), "utf-8"));
        const errs = f.includes("work_") ? validateWorkJson(data) : validateEssayJson(data);
        total++;
        if (errs.length) {
          console.log(`\n✗ ${f}:`);
          errs.forEach(e => console.log(`    - ${e}`));
          errors++;
        }
      }
    }
    console.log(`\nValidated ${total} files, ${errors} with errors.`);
    return;
  }

  if (!pdfPath) {
    console.log("Usage: node scripts/convert-source.mjs <pdf-path> [--dry-run]");
    console.log("       node scripts/convert-source.mjs --validate");
    process.exit(1);
  }

  if (!fs.existsSync(pdfPath)) {
    console.error(`File not found: ${pdfPath}`);
    process.exit(1);
  }

  console.log(`\nConverting: ${path.basename(pdfPath)}`);

  // Extract text
  const rawText = extractPdfText(pdfPath);
  if (!rawText) {
    console.error("  ✗ No text extracted");
    process.exit(1);
  }
  console.log(`  ✓ Extracted ${rawText.length} chars`);

  // Extract references and clean body
  const { body, refs } = extractReferences(rawText);
  const cleanedBody = stripCitations(body);

  // Generate slug from filename
  const basename = path.basename(pdfPath, ".pdf");
  const slug = basename
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .replace(/_+/g, "_")
    .substring(0, 80);

  // Build work JSON
  const workJson = {
    work_id: `work:${slug}`,
    schema_version: 1,
    title: basename.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
    authors: [{ name: "Unknown", author_id: `author:unknown` }],
    publication: { year: null, type: "article", language: "en" },
    identifiers: { doi: null, openalex_id: null },
    topics: [],
    tradition: ["sufism"],
    tier: 2,
    relations: [],
    assets: {
      pdf_path: `library/sufism/${slug}.pdf`,
      source_url: null,
    },
    abstract: cleanedBody.substring(0, 500) + "...",
    body_clean: cleanedBody,
    references: refs,
  };

  // Validate work JSON
  const workErrs = validateWorkJson(workJson);
  if (workErrs.length) {
    console.log("  ⚠ Work JSON validation warnings:");
    workErrs.forEach(e => console.log(`    - ${e}`));
  }

  // Build essay JSON with alternating blocks
  const paragraphs = cleanedBody.split(/\n\n+/).filter(p => p.trim().length > 50);
  const essayBody = [];
  let isSource = true;
  for (const p of paragraphs) {
    essayBody.push({
      kind: isSource ? "source" : "ai",
      text: stripCitations(p).trim(),
    });
    isSource = !isSource;
  }

  const essayJson = {
    id: slug,
    title: workJson.title,
    type: "condensed_source",
    source_ids: [workJson.work_id],
    author: "Unknown",
    concepts: [],
    prerequisites: [],
    body: essayBody,
  };

  // Validate essay JSON
  const essayErrs = validateEssayJson(essayJson);
  if (essayErrs.length) {
    console.log("  ⚠ Essay JSON validation warnings:");
    essayErrs.forEach(e => console.log(`    - ${e}`));
  }

  if (dryRun) {
    console.log("\n  [DRY RUN] Would write:");
    console.log(`    content/works/work_${slug}.json`);
    console.log(`    content/glossary/essays/${slug}.json`);
    return;
  }

  // Write files
  const workPath = path.join(ROOT, "content", "works", `work_${slug}.json`);
  const essayPath = path.join(ROOT, "content", "glossary", "essays", `${slug}.json`);

  fs.writeFileSync(workPath, JSON.stringify(workJson, null, 2));
  console.log(`  ✓ Wrote: content/works/work_${slug}.json`);

  fs.writeFileSync(essayPath, JSON.stringify(essayJson, null, 2));
  console.log(`  ✓ Wrote: content/glossary/essays/${slug}.json`);

  console.log("\n  Next steps:");
  console.log("    1. Edit the JSONs to correct author, title, concepts, tags");
  console.log("    2. Review body blocks for proper source/ai alternation");
  console.log("    3. Run: npm run generate:audio -- " + slug);
}

main().catch(console.error);
