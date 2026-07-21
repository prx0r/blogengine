import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const pdfDir = root;
const outDir = path.join(root, "src", "data");
const textDir = "/tmp/picatrix-text";

fs.mkdirSync(textDir, { recursive: true });

const pdfs = fs.readdirSync(pdfDir).filter((f) => f.includes("Picatrix") && f.endsWith(".pdf"));

for (const pdf of pdfs) {
  const outPath = path.join(textDir, pdf.replace(".pdf", ".txt"));
  execSync(`pdftotext -layout "${path.join(pdfDir, pdf)}" "${outPath}"`, { stdio: "pipe" });
  console.log(`  ✓ Extracted: ${path.basename(outPath)}`);
}

const textFiles = fs.readdirSync(textDir).filter((f) => f.endsWith(".txt"));
let allChunks = [];

for (const tf of textFiles) {
  const raw = fs.readFileSync(path.join(textDir, tf), "utf-8");
  const lines = raw.split("\n");

  let currentBook = 0;
  let currentChapter = "";
  let currentLines = [];
  let chapterCount = 0;
  let chapterNum = 0;
  let inContent = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (/^Book\s+(One|Two|Three|Four|I|II|III|IV)\b/i.test(trimmed)) {
      if (currentLines.length > 0 && currentChapter && currentLines.join(" ").trim().length > 50) {
        allChunks.push({
          book: currentBook,
          chapter: chapterNum,
          title: currentChapter,
          content: currentLines.join("\n").trim(),
        });
      }
      const numMatch = trimmed.match(/(One|Two|Three|Four|I|II|III|IV)/i);
      const numMap = { one: 1, two: 2, three: 3, four: 4, i: 1, ii: 2, iii: 3, iv: 4 };
      currentBook = numMap[numMatch[1].toLowerCase()] || 0;
      currentChapter = "";
      currentLines = [];
      chapterNum = 0;
      chapterCount = 0;
      inContent = false;
      continue;
    }

    if (/^Chapter\s+(One|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten|Eleven|Twelve|Thirteen|Fourteen|Fifteen|Sixteen|Seventeen|Eighteen|Nineteen|Twenty)/i.test(trimmed)) {
      if (currentLines.length > 0 && currentChapter && currentLines.join(" ").trim().length > 50) {
        allChunks.push({
          book: currentBook,
          chapter: chapterNum,
          title: currentChapter,
          content: currentLines.join("\n").trim(),
        });
      }
      currentChapter = trimmed;
      currentLines = [];
      chapterNum = ++chapterCount;
      inContent = true;
      continue;
    }

    if (inContent) {
      currentLines.push(trimmed);
    }
  }

  if (currentLines.length > 0 && currentChapter && currentLines.join(" ").trim().length > 50) {
    allChunks.push({
      book: currentBook,
      chapter: chapterNum,
      title: currentChapter,
      content: currentLines.join("\n").trim(),
    });
  }
}

allChunks = allChunks.filter((c) => c.content.length > 100);
fs.writeFileSync(path.join(outDir, "picatrix.json"), JSON.stringify(allChunks, null, 2));
console.log(`\n✅ ${allChunks.length} chunks written to src/data/picatrix.json`);
