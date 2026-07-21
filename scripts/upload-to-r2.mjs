/**
 * Upload assets to Cloudflare R2 (atlas-sources bucket)
 *
 * Usage:
 *   node scripts/upload-to-r2.mjs          # upload all audio + pdfs
 *   node scripts/upload-to-r2.mjs --dry-run # preview only
 *
 * Requires env vars:
 *   R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_ENDPOINT, CLOUDFLARE_API_TOKEN, ACCOUNT_ID
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import crypto from "crypto";

const ROOT = path.resolve(import.meta.dirname, "..");

const R2_ENDPOINT = process.env.R2_ENDPOINT;
const R2_BUCKET = "atlas-sources";
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;

const ACCESS_KEY = process.env.R2_ACCESS_KEY_ID;
const SECRET_KEY = process.env.R2_SECRET_ACCESS_KEY;

const ACCOUNT_ID = process.env.ACCOUNT_ID;
const CF_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

if (!ACCESS_KEY || !SECRET_KEY || !R2_ENDPOINT) {
  throw new Error("Set R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_ENDPOINT env vars");
}

function sha256(str) {
  return crypto.createHash("sha256").update(str).digest("hex");
}

function hmacSha256(key, msg) {
  return crypto.createHmac("sha256", key).update(msg).digest();
}

async function uploadViaApi(filePath, key) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/r2/buckets/${R2_BUCKET}/objects/${encodeURIComponent(key)}`;
  const fileBuf = fs.readFileSync(filePath);

  const resp = await fetch(url, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${CF_TOKEN}`,
      "Content-Type": key.endsWith(".mp3") ? "audio/mpeg" : "application/pdf",
    },
    body: fileBuf,
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Upload failed for ${key}: ${resp.status} ${text}`);
  }
  return true;
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const mode = process.argv.includes("--audio-only") ? "audio" :
               process.argv.includes("--pdf-only") ? "pdf" : "all";

  const files = [];

  // Audio files
  if (mode === "all" || mode === "audio") {
    const audioDir = path.join(ROOT, "public", "audio");
    if (fs.existsSync(audioDir)) {
      for (const f of fs.readdirSync(audioDir).filter(f => f.endsWith(".mp3"))) {
        files.push({ src: path.join(audioDir, f), dest: `audio/${f}`, type: "audio" });
      }
    }
  }

  // PDFs (from sources and public/pdfs)
  if (mode === "all" || mode === "pdf") {
    const pdfDir = path.join(ROOT, "public", "pdfs");
    if (fs.existsSync(pdfDir)) {
      for (const f of fs.readdirSync(pdfDir).filter(f => f.endsWith(".pdf"))) {
        files.push({ src: path.join(pdfDir, f), dest: `pdfs/${f}`, type: "pdf" });
      }
    }
    // Also upload source PDFs
    const srcDir = path.join(ROOT, "content", "sources");
    if (fs.existsSync(srcDir)) {
      for (const trad of fs.readdirSync(srcDir)) {
        const tradDir = path.join(srcDir, trad);
        if (!fs.statSync(tradDir).isDirectory()) continue;
        for (const topic of fs.readdirSync(tradDir)) {
          const topicDir = path.join(tradDir, topic);
          if (!fs.statSync(topicDir).isDirectory()) continue;
          for (const f of fs.readdirSync(topicDir).filter(f => f.endsWith(".pdf") || f.endsWith(".epub"))) {
            files.push({ src: path.join(topicDir, f), dest: `sources/${trad}/${topic}/${f}`, type: "source" });
          }
        }
      }
    }
  }

  console.log(`Found ${files.length} files to upload`);

  let ok = 0, fail = 0, skip = 0;

  for (const { src, dest, type } of files) {
    const size = fs.statSync(src).size;
    const sizeMB = (size / 1024 / 1024).toFixed(1);

    if (dryRun) {
      console.log(`  [DRY] ${dest} (${sizeMB} MB)`);
      ok++;
      continue;
    }

    // Skip files over 100 MB (too large for single upload)
    if (size > 100 * 1024 * 1024) {
      console.log(`  ⚠ SKIP ${dest} (${sizeMB} MB - too large)`);
      skip++;
      continue;
    }

    try {
      await uploadViaApi(src, dest);
      console.log(`  ✓ ${dest} (${sizeMB} MB)`);
      ok++;
    } catch (e) {
      console.log(`  ✗ ${dest}: ${e.message}`);
      fail++;
    }
  }

  console.log(`\nDone: ${ok} uploaded, ${skip} skipped, ${fail} failed`);
}

main().catch(console.error);
