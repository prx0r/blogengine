import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const essayDirs = [
  path.join(root, "content", "glossary", "essays"),
  path.join(root, "content", "essays"),
];

function getAllEssayIds() {
  const ids = [];
  for (const dir of essayDirs) {
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir).filter((n) => n.endsWith(".json"))) {
      const essayPath = path.join(dir, f);
      try {
        const essay = JSON.parse(fs.readFileSync(essayPath, "utf-8"));
        // Only process if no audioUrl yet, or if audio file doesn't exist
        const audioPath = path.join(root, "public", "audio", `${essay.id}.mp3`);
        if (!fs.existsSync(audioPath)) {
          ids.push(essay.id);
        }
      } catch {
        // skip parse errors
      }
    }
  }
  return ids;
}

const ids = getAllEssayIds();
console.log(`\n=== Essays needing audio: ${ids.length} ===\n`);

for (let i = 0; i < ids.length; i++) {
  const id = ids[i];
  console.log(`\n[${i + 1}/${ids.length}] Processing: ${id}`);

  const result = spawnSync("node", [
    path.join(root, "scripts", "generate-audio.mjs"),
    id,
  ], {
    cwd: root,
    stdio: "inherit",
    timeout: 300000, // 5 min per essay
  });

  if (result.status !== 0) {
    console.error(`  FAILED (exit ${result.status}), continuing...`);
  } else {
    console.log(`  DONE`);
  }

  // Delay between essays to avoid rate limiting
  if (i < ids.length - 1) {
    const delay = 2000;
    console.log(`  Waiting ${delay}ms before next essay...`);
    await new Promise((r) => setTimeout(r, delay));
  }
}

console.log(`\n=== All done! ===`);
