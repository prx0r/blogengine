import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const artDir = path.join(root, "content", "glossary", "art");
const imgDir = path.join(root, "public", "art");
fs.mkdirSync(artDir, { recursive: true });
fs.mkdirSync(imgDir, { recursive: true });

const entries = process.argv.slice(2);
if (entries.length === 0) {
  console.error("Usage: node scripts/import-art.mjs <json-files...>");
  console.error("Each JSON file should contain an art object or array of art objects.");
  process.exit(1);
}

for (const file of entries) {
  const jsonPath = path.resolve(file);
  if (!fs.existsSync(jsonPath)) {
    console.error(`Not found: ${jsonPath}`);
    continue;
  }
  const data = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  const items = Array.isArray(data) ? data : [data];

  for (const item of items) {
    // Download the image
    if (item.image_url && !item.local_file) {
      const ext = path.extname(new URL(item.image_url).pathname) || ".jpg";
      const filename = `${item.id}${ext}`;
      const savePath = path.join(imgDir, filename);
      try {
        const resp = await fetch(item.image_url, { signal: AbortSignal.timeout(15000) });
        if (resp.ok) {
          const buffer = Buffer.from(await resp.arrayBuffer());
          fs.writeFileSync(savePath, buffer);
          item.local_file = `/art/${filename}`;
          console.log(`  Downloaded: ${filename} (${buffer.length} bytes)`);
        } else {
          console.error(`  Failed: ${item.image_url} (${resp.status})`);
        }
      } catch (e) {
        console.error(`  Error downloading ${item.image_url}: ${e.message}`);
      }
    }

    // Save the metadata JSON
    const metaPath = path.join(artDir, `${item.id}.json`);
    fs.writeFileSync(metaPath, JSON.stringify(item, null, 2));
    console.log(`  Saved: ${metaPath}`);
  }
}

console.log("\nDone!");
