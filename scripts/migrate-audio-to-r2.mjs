/**
 * Migrate essay audio URLs from public/audio/ to R2
 *
 * Updates all essay JSONs in content/glossary/essays/ to use R2 URLs.
 * Also removes oversized audio files from public/audio/ that exceed 25 MB.
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const ROOT = path.resolve(import.meta.dirname, "..");
const R2_PUBLIC = "https://pub-8f77709efb2043fbbd8e88677347249a.r2.dev";
const R2_BUCKET = "atlas-sources";
const AUDIO_DIR = path.join(ROOT, "public", "audio");

// Update essay JSONs
const essaysDir = path.join(ROOT, "content", "glossary", "essays");
let updated = 0;

for (const f of fs.readdirSync(essaysDir).filter(f => f.endsWith(".json"))) {
  const fp = path.join(essaysDir, f);
  let essay = JSON.parse(fs.readFileSync(fp, "utf-8"));

  if (essay.audioUrl && essay.audioUrl.startsWith("/audio/")) {
    const slug = essay.audioUrl.replace("/audio/", "").replace(".mp3", "");
    essay.audioUrl = `${R2_PUBLIC}/audio/${slug}`;
    fs.writeFileSync(fp, JSON.stringify(essay, null, 2));
    updated++;
    console.log(`  ✓ ${f}`);
  }
}

console.log(`\nUpdated ${updated} essay JSONs`);

// Remove oversized audio files from public/audio/
let removed = 0;
for (const f of fs.readdirSync(AUDIO_DIR).filter(f => f.endsWith(".mp3"))) {
  const fp = path.join(AUDIO_DIR, f);
  const sizeMB = fs.statSync(fp).size / 1024 / 1024;
  if (sizeMB > 24) {
    fs.unlinkSync(fp);
    console.log(`  ✗ Removed oversized: ${f} (${sizeMB.toFixed(1)} MB)`);
    removed++;
  }
}

console.log(`\nRemoved ${removed} oversized audio files from public/audio/`);

console.log("\nDone. Rebuild and deploy to apply changes.");
