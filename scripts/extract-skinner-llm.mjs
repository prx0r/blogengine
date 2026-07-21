// Uses LLM to extract structured correspondences from Skinner's text
// Splits the 81K-line file into sections, sends each to the LLM for parsing

import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd());
const skinnerPath = path.join(root, "stephenskinnerworking");
const text = fs.readFileSync(skinnerPath, "utf-8");

// Split into sections by the major table headers (A-Z)
const sections = text.split(/\n(?=[A-Z]\.\s+[A-Z])/).filter(Boolean);

// Find the sections most relevant to correspondences
const TARGET_SECTIONS = [
  "Heavens",     // planets, zodiac, houses
  "Natural",     // herbs, stones, animals, perfumes
  "Kabbalah",    // sephirah correspondences
  "Angels",      // angelic names
  "Magic",       // grimoire spirits
  "Rainbow",     // colour scales
  "Pagan",       // pantheon mappings
  "Letters",     // letter correspondences
  "Geomancy",    // geomantic figures
];

console.log(`Total sections: ${sections.length}`);
console.log(`Target sections: ${TARGET_SECTIONS.join(", ")}`);

// For each target section, find the range and write it out for manual/LLM review
for (const target of TARGET_SECTIONS) {
  const idx = sections.findIndex(s => s.includes(target));
  if (idx === -1) continue;
  
  const section = sections[idx];
  const lines = section.split("\n").filter(l => l.trim());
  
  // Write the first 200 lines of each target section for review
  const outPath = path.join(root, "scripts", "skinner-sections", `${target.toLowerCase().replace(/\s+/g, "-")}.txt`);
  fs.mkdirSync(path.join(root, "scripts", "skinner-sections"), { recursive: true });
  fs.writeFileSync(outPath, lines.slice(0, 200).join("\n"));
  console.log(`  ${target}: ${lines.length} lines → ${outPath}`);
}

// Create a prompt file for batch LLM extraction
const prompt = `You are a correspondence extraction specialist.
Your task is to extract structured correspondence entries from Stephen Skinner's 
"The Complete Magician's Tables" OCR text.

For each table you find, output entries in this format:
{ "type": "herb|metal|colour|stone|incense|animal|plant|day|number|archangel|spirit|divine_name|planet|sign|element|body_part|sense|musical_note", "label": "Item Name", "planets": ["planet:mars"], "signs": ["sign:leo"], "source": "Skinner", "citation": "Table identifier" }

Rules:
- Only extract from actual tables, not commentary
- Use the existing CorrespondenceType values
- Match planet and sign IDs to the shared entity format (planet:mars, sign:leo)
- Remove duplicates
- Be thorough - extract every correspondence you see`;

fs.writeFileSync(path.join(root, "scripts", "skinner-sections", "_PROMPT.md"), prompt);
console.log(`\nSections written to scripts/skinner-sections/`);
console.log(`Use the prompt in _PROMPT.md with each section file to extract correspondences via LLM.`);
console.log(`Then merge the output into correspondences.ts`);
