/**
 * Parse Cunningham's Encyclopedia of Magical Herbs into structured JSON.
 */
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const inputPath = join(__dirname, "..", "content/astrology/Cunninghams_Encyclopedia_of_Magical_Herbs.md");
const outputPath = join(__dirname, "..", "content/glossary/cunningham-catalog.json");

const text = readFileSync(inputPath, "utf-8");
const lines = text.split("\n");

const herbs = [];
let i = 0;

function peek() { return lines[i] || ""; }
function next() { const l = lines[i]; i++; return l; }
function hasMore() { return i < lines.length; }

// Skip to first herb entry
while (hasMore() && !/^[A-Z][A-Z\s\-'.,()!]+$/.test(peek().trim())) {
  if (/^[A-Z]{3,}\s*$/.test(peek().trim())) break;
  next();
}

function findSection(entryLines, start, label) {
  for (let j = start; j < Math.min(start + 20, entryLines.length); j++) {
    if (entryLines[j].trim().startsWith(label)) {
      return entryLines[j].replace(label, "").trim();
    }
  }
  return "";
}

function findAllSectionValues(entryLines, start, label) {
  const val = findSection(entryLines, start, label);
  if (!val) return [];
  return val.split(",").map(s => s.trim().replace(/\.$/, "")).filter(Boolean);
}

function collectFolkNames(entryLines, start) {
  const names = [];
  if (!entryLines[start]?.startsWith("Folk Names:")) return names;
  let j = start;
  while (j < entryLines.length && (entryLines[j].trim().startsWith("Folk Names:") || (entryLines[j].trim() && !entryLines[j].includes(":")))) {
    if (entryLines[j].trim().startsWith("Folk Names:")) {
      names.push(...entryLines[j].replace("Folk Names:", "").split(",").map(s => s.trim().replace(/\.$/, "")).filter(Boolean));
    } else if (entryLines[j].trim()) {
      names.push(...entryLines[j].split(",").map(s => s.trim().replace(/\.$/, "")).filter(Boolean));
    }
    j++;
  }
  return names;
}

while (hasMore()) {
  const nameLine = peek().trim();
  
  if (!/^[A-Z][A-Z\s\-'.,()!]+$/.test(nameLine) || nameLine.length < 3) {
    next();
    continue;
  }
  
  const name = nameLine;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
  const entryStart = i;
  
  const entryLines = [];
  let entryEnd = i;
  while (entryEnd < Math.min(i + 40, lines.length)) {
    const line = lines[entryEnd];
    if (entryEnd > entryStart && /^[A-Z][A-Z\s\-'.,()!]+$/.test(line.trim()) && line.trim().length >= 3) {
      break;
    }
    entryLines.push(line);
    entryEnd++;
  }
  
  const safetyMatch = nameLine.match(/\((.*?)\)/);
  const safetyNote = safetyMatch ? safetyMatch[1].toLowerCase() : "";
  let safety = "general";
  if (safetyNote.includes("poison")) safety = "poison";
  else if (safetyNote.includes("not for internal") || safetyNote.includes("never take")) safety = "external_only";
  
  const folkNames = collectFolkNames(entryLines, 1);
  const gender = findSection(entryLines, 0, "Gender:").toLowerCase();
  const planet = findSection(entryLines, 0, "Planet:").toLowerCase();
  const element = findSection(entryLines, 0, "Element:").toLowerCase();
  const deities = findAllSectionValues(entryLines, 0, "Deities:");
  const powers = findAllSectionValues(entryLines, 0, "Powers:");
  const ritualUses = findSection(entryLines, 0, "Ritual Uses:");
  const magicalUses = findSection(entryLines, 0, "Magical Uses:");
  
  herbs.push({
    id: `cunningham:${slug}`,
    name: name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(),
    slug,
    folk_names: folkNames.length > 0 ? folkNames : undefined,
    gender: gender || undefined,
    planet: planet || undefined,
    element: element || undefined,
    deities: deities.length > 0 ? deities : undefined,
    powers: powers.length > 0 ? powers : undefined,
    safety,
    safety_note: safetyNote || undefined,
    ritual_uses: ritualUses || undefined,
    magical_uses: magicalUses || undefined,
  });
  
  i = entryEnd;
}

writeFileSync(outputPath, JSON.stringify({ herbs, count: herbs.length, source: "Cunningham's Encyclopedia of Magical Herbs" }, null, 2));
console.log(`Parsed ${herbs.length} herbs → ${outputPath}`);
const withPlanets = herbs.filter(h => h.planet);
console.log(`With planetary associations: ${withPlanets.length}`);
const sample = herbs.filter(h => h.planet).slice(0, 5);
sample.forEach(h => console.log(`  ${h.name} → ${h.planet} [${(h.powers||[]).join(", ")}]`));
