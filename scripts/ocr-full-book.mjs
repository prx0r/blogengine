/**
 * OCR the full Philosophy of Illumination book in chunks.
 *
 * Processes 20 pages at a time, combines results, creates work JSON + essay JSON.
 *
 * Usage: node scripts/ocr-full-book.mjs
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const ROOT = path.resolve(import.meta.dirname, "..");
const PDF_PATH = path.join(ROOT, "public", "pdfs", "suhrawardi-philosophy-of-illumination.pdf");
const TMP_DIR = "/tmp/illumination-ocr";
const OUTPUT_DIR = path.join(TMP_DIR, "chunks");
const FINAL_TEXT = path.join(TMP_DIR, "full-text.txt");
const CHUNK_SIZE = 20;
const TOTAL_PAGES = 214;

function run(cmd) {
  try {
    return execSync(cmd, { encoding: "utf-8", timeout: 300000, stdio: ["pipe", "pipe", "pipe"] });
  } catch (e) {
    return e.stdout || "";
  }
}

function cleanOcrText(text) {
  return text
    // Remove repeated form-feed chars
    .replace(/\f+/g, "\n\n")
    // Collapse multiple newlines
    .replace(/\n{3,}/g, "\n\n")
    // Remove isolated single chars on their own line (OCR noise)
    .replace(/^\s*.\s*$/gm, "")
    // Remove lines that are mostly non-alphanumeric
    .split("\n")
    .filter(line => {
      const alpha = line.replace(/[^a-zA-Z0-9\s]/g, "").length;
      return alpha > 3 || line.trim().length === 0;
    })
    .join("\n")
    // Remove scattered backticks and garbage
    .replace(/[`'']/g, "'")
    .replace(/\s{2,}/g, " ")
    .trim();
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log(`OCR'ing ${TOTAL_PAGES} pages in chunks of ${CHUNK_SIZE}...\n`);

  // Process in chunks
  for (let start = 1; start <= TOTAL_PAGES; start += CHUNK_SIZE) {
    const end = Math.min(start + CHUNK_SIZE - 1, TOTAL_PAGES);
    const chunkFile = path.join(OUTPUT_DIR, `pages-${start}-${end}.txt`);

    if (fs.existsSync(chunkFile) && fs.statSync(chunkFile).size > 100) {
      console.log(`  [SKIP] Pages ${start}-${end} already done`);
      continue;
    }

    const ocrPdf = path.join(TMP_DIR, `chunk-${start}-${end}.pdf`);
    console.log(`  [OCR] Pages ${start}-${end}...`);

    // OCR this chunk
    run(`ocrmypdf --pages ${start}-${end} --language eng --deskew --clean-final "${PDF_PATH}" "${ocrPdf}"`);

    // Extract text
    const text = run(`pdftotext "${ocrPdf}" -`);
    const cleaned = cleanOcrText(text);
    fs.writeFileSync(chunkFile, cleaned);

    const chars = cleaned.length;
    console.log(`        ${chars} chars extracted`);

    // Clean up the temp OCR PDF to save space
    fs.rmSync(ocrPdf);
  }

  // Combine all chunks
  console.log("\nCombining chunks...");
  const allText = [];
  for (let start = 1; start <= TOTAL_PAGES; start += CHUNK_SIZE) {
    const end = Math.min(start + CHUNK_SIZE - 1, TOTAL_PAGES);
    const chunkFile = path.join(OUTPUT_DIR, `pages-${start}-${end}.txt`);
    if (fs.existsSync(chunkFile)) {
      allText.push(`[Pages ${start}-${end}]\n${fs.readFileSync(chunkFile, "utf-8")}`);
    }
  }

  const fullText = allText.join("\n\n");
  fs.writeFileSync(FINAL_TEXT, fullText);
  console.log(`Total: ${fullText.length} chars`);

  // Create work JSON
  const slug = "suhrawardi-philosophy-of-illumination";
  const workJson = {
    work_id: `work:${slug}`,
    schema_version: 1,
    title: "The Philosophy of Illumination (Ḥikmat al-ishrāq)",
    authors: [
      { name: "Shihāb al-Dīn al-Suhrawardī", author_id: "author:suhrawardi" }
    ],
    translators: ["John Walbridge", "Hossein Ziai"],
    publication: {
      year: 1999,
      publisher: "Brigham Young University Press",
      type: "book",
      language: "en",
    },
    identifiers: { isbn: "0-8425-2457-6" },
    topics: ["illumination", "suhrawardi", "ishraq", "islamic philosophy"],
    tradition: ["sufism"],
    tier: 1,  // Primary source
    relations: [],
    assets: {
      pdf_path: "pdfs/suhrawardi-philosophy-of-illumination.pdf",
      source_url: null,
    },
    abstract: fullText.substring(0, 1000).replace(/\n+/g, " ") + "...",
    body_clean: fullText,
    references: [],
  };

  const workPath = path.join(ROOT, "content", "works", `work_${slug}.json`);
  fs.writeFileSync(workPath, JSON.stringify(workJson, null, 2));
  console.log(`\nWrote: content/works/work_${slug}.json`);

  // Create essay JSON (Type B - publication)
  // Split into paragraphs, alternating source/ai for audio variety
  const paragraphs = fullText.split(/\n\n+/).filter(p => p.trim().length > 50);
  const body = [];
  let isSource = true;
  let paraCount = 0;
  const maxParas = 500; // Limit to avoid absurdly large audio

  for (const p of paragraphs) {
    if (paraCount >= maxParas) break;
    body.push({ kind: isSource ? "source" : "ai", text: p.trim() });
    isSource = !isSource;
    paraCount++;
  }

  const essayJson = {
    id: slug,
    title: "The Philosophy of Illumination (Ḥikmat al-ishrāq)",
    type: "publication",
    source_ids: [`work:${slug}`],
    author: "Shihāb al-Dīn al-Suhrawardī",
    concepts: ["illumination", "ishraq", "suhrawardi", "hikmat al-ishraq"],
    prerequisites: [],
    body,
  };

  const essayPath = path.join(ROOT, "content", "glossary", "essays", `${slug}.json`);
  fs.writeFileSync(essayPath, JSON.stringify(essayJson, null, 2));
  console.log(`Wrote: content/glossary/essays/${slug}.json`);

  console.log("\nDone! Next steps:");
  console.log(`  1. Verify the text in ${FINAL_TEXT}`);
  console.log("  2. Create audio with: npm run generate:audio -- " + slug);
  console.log("  3. Add to TRADITION_MAP in essays.ts");
  console.log("  4. Rebuild and deploy");
}

main().catch(console.error);
