import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const disabledRoot = path.join(root, ".static-disabled-for-pages");

const env = { ...process.env, GITHUB_PAGES: "true", NEXT_PUBLIC_BASE_PATH: "/blogengine" };

const disabledPaths = [
  ["src/app/api", "src/app/api"],
  ["src/app/entry", "src/app/entry"],
  ["src/lib/db.ts", "src/lib/db.ts"],
  ["src/middleware.ts", "src/middleware.ts"],
];

function disableServerOnlyPaths() {
  fs.rmSync(disabledRoot, { recursive: true, force: true });
  fs.mkdirSync(disabledRoot, { recursive: true });

  for (const [relativePath, disabledName] of disabledPaths) {
    const source = path.join(root, relativePath);
    if (!fs.existsSync(source)) continue;

    const target = path.join(disabledRoot, disabledName);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.renameSync(source, target);
    console.log(`  → Disabled ${relativePath} for static export`);
  }
}

function restoreServerOnlyPaths() {
  for (const [relativePath, disabledName] of disabledPaths) {
    const source = path.join(disabledRoot, disabledName);
    if (!fs.existsSync(source)) continue;

    const target = path.join(root, relativePath);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.renameSync(source, target);
    console.log(`  → Restored ${relativePath}`);
  }

  fs.rmSync(disabledRoot, { recursive: true, force: true });
}

try {
  console.log("  → Generating static graph data...");
  execSync("node scripts/generate-graph-json.mjs", { cwd: root, stdio: "inherit" });

  console.log("  → Extracting Picatrix spells...");
  execSync("node scripts/extract-picatrix.mjs", { cwd: root, stdio: "inherit" });

  disableServerOnlyPaths();
  execSync("npx next build", { cwd: root, env, stdio: "inherit" });
  const outDir = path.join(root, "out");
  const docsDir = path.join(root, "docs");
  if (fs.existsSync(docsDir)) fs.rmSync(docsDir, { recursive: true });
  fs.cpSync(outDir, docsDir, { recursive: true });
  fs.writeFileSync(path.join(docsDir, ".nojekyll"), "");
  console.log("  → Copied to docs/ for GitHub Pages");
} finally {
  restoreServerOnlyPaths();
}
