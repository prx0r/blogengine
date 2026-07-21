/**
 * Clean essay JSONs: fix types, strip footnotes, set authors, remove bad ones.
 *
 * Usage: node scripts/clean-essays.mjs
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const ROOT = path.resolve(import.meta.dirname, "..");

const KNOWN_AUTHORS = {
  "2001_suhrawardi_al_maqtul_the_martyr_of": "Roxanne D. Marcotte",
  "2011_suhrawardis_realm_of_the_imaginal": "Roxanne D. Marcotte",
  "ibn_arabi_on_the_benefit_of_knowledge": "William C. Chittick",
  "ibn_al_arabi_the_doorway_to_an_intellect": "William C. Chittick",
  "in_the_end_will_be_consciousness_farghan": "William C. Chittick",
  "rumi_on_traveling_the_path_of_the_prophe": "William C. Chittick",
  "suhrawardi_s_creed_of_the_sages": "John Walbridge",
  "the_philosophy_of_illumination_esoterici": "Shihāb ad-Dīn Suhrawardī",
};

// Patterns to strip from source text
const CLEANUP_PATTERNS = [
  [/\[\d+(?:[,\-\s]\d+)*\]/g, ""],          // [1], [1,2], [1-3]
  [/\[\d+\]/g, ""],                          // standalone [1] markers
  [/\([^)]*(?:\d{4})[^)]*\)/g, ""],         // (Corbin, 1976) year citations
  [/[\u00B9\u00B2\u00B3\u2070\u2071\u2074\u2075\u2076\u2077\u2078\u2079]/g, ""], // superscript digits
  [/[\u1D43-\u1D6A\u2090-\u209C]/g, ""],   // modifier letters
  [/[\u207B\u207C\u207D\u207E]/g, ""],      // superscript parens
  [/\s{2,}/g, " "],
  [/\s+([.,;:!?])/g, "$1"],
];

function cleanText(text) {
  if (!text) return text;
  for (const [pattern, replacement] of CLEANUP_PATTERNS) {
    text = text.replace(pattern, replacement);
  }
  return text.trim();
}

function cleanEssay(fp) {
  const d = JSON.parse(fs.readFileSync(fp, "utf-8"));
  const id = d.id;
  let changed = false;

  // Fix unknown authors
  if (d.author === "Unknown" && KNOWN_AUTHORS[id]) {
    d.author = KNOWN_AUTHORS[id];
    changed = true;
  }

  // Fix type — new publications should be "publication" not "condensed_source"
  if (d.type === "condensed_source" && KNOWN_AUTHORS[id]) {
    // Check if it has any AI blocks (if not, it's a pure publication)
    const hasAi = Array.isArray(d.body) && d.body.some(b => b.kind === "ai");
    if (!hasAi) {
      d.type = "publication";
      changed = true;
    }
  }

  // Clean body text
  if (Array.isArray(d.body)) {
    for (const b of d.body) {
      if (b.text) {
        const cleaned = cleanText(b.text);
        if (cleaned !== b.text) {
          b.text = cleaned;
          changed = true;
        }
      }
    }
  }

  if (changed) {
    fs.writeFileSync(fp, JSON.stringify(d, null, 2));
    console.log(`  ✓ Fixed: ${id}`);
  }
  return changed;
}

function main() {
  const essaysDir = path.join(ROOT, "content", "glossary", "essays");
  let cleaned = 0;

  for (const f of fs.readdirSync(essaysDir).filter(f => f.endsWith(".json"))) {
    const fp = path.join(essaysDir, f);
    if (cleanEssay(fp)) cleaned++;
  }

  console.log(`\nCleaned ${cleaned} essays`);

  // Update work JSONs tier
  const worksDir = path.join(ROOT, "content", "works");
  let worksFixed = 0;
  for (const f of fs.readdirSync(worksDir).filter(f => f.endsWith(".json"))) {
    const fp = path.join(worksDir, f);
    const d = JSON.parse(fs.readFileSync(fp, "utf-8"));
    if (!d.tier) {
      d.tier = 2;
      fs.writeFileSync(fp, JSON.stringify(d, null, 2));
      worksFixed++;
    }
  }
  console.log(`Fixed ${worksFixed} work JSONs (set tier=2)`);

  console.log("\nDone. Run generate-graph-json.mjs and rebuild.");
}

main();
