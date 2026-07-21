import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd());
const skinnerPath = path.join(root, "stephenskinnerworking");
const text = fs.readFileSync(skinnerPath, "utf-8");
const lines = text.split("\n");

// ── Known correspondences we're looking for ──
const PLANETS = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto", "earth"];
const SIGNS = ["aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"];

function normalize(s) {
  return s.trim().toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
}

// ── Parse a table block ──
function parseTable(block) {
  const rows = block.split("\n").map(l => l.trim()).filter(l => l.length > 0);
  if (rows.length < 2) return null;

  // Find header row (first row with column labels)
  const headerIdx = rows.findIndex(r => /planet|angel|metal|stone|herb|plant|colour|color|incense|day|number|sign|house|sephirah|zodiac/i.test(r));
  if (headerIdx === -1) return null;

  const header = rows[headerIdx].toLowerCase();
  const dataRows = rows.slice(headerIdx + 1).filter(r => !/^─/.test(r) && !/^table/i.test(r));

  // Determine columns
  const columns = header.split(/\s{2,}/).map(h => {
    if (/planet/i.test(h)) return "planet";
    if (/sign|zodiac/i.test(h)) return "sign";
    if (/day/i.test(h)) return "day";
    if (/metal/i.test(h)) return "metal";
    if (/stone/i.test(h)) return "stone";
    if (/herb|plant/i.test(h)) return "herb";
    if (/colour|color/i.test(h)) return "colour";
    if (/incense|perfume/i.test(h)) return "incense";
    if (/animal|beast/i.test(h)) return "animal";
    if (/number/i.test(h)) return "number";
    if (/angel/i.test(h)) return "archangel";
    if (/name|divine/i.test(h)) return "divine_name";
    if (/spirit|intelligence/i.test(h)) return "spirit";
    if (/element/i.test(h)) return "element";
    if (/body|organ/i.test(h)) return "body_part";
    if (/sense/i.test(h)) return "sense";
    if (/note|music|sound/i.test(h)) return "musical_note";
    return null;
  }).filter(c => c !== null);

  if (columns.length < 2) return null;

  const entries = [];
  for (const row of dataRows) {
    const cells = row.split(/\s{2,}/).map(c => c.trim()).filter(c => c.length > 0);
    if (cells.length < 2) continue;

    // Determine the key identifier (first column)
    const keyLabel = cells[0].toLowerCase();
    // Find which planet/sign this row belongs to
    const keyName = PLANETS.find(p => keyLabel.includes(p)) || SIGNS.find(s => keyLabel.includes(s));
    if (!keyName) continue;

    for (let i = 1; i < Math.min(cells.length, columns.length); i++) {
      const value = cells[i].trim();
      if (!value || value.length < 2 || /^─+$/.test(value)) continue;
      const colType = columns[i];
      if (!colType) continue;

      // Clean the value
      const cleanValue = value.toLowerCase().replace(/[^a-z\s]/g, "").replace(/\s+/g, " ").trim();
      if (!cleanValue || cleanValue.length < 2 || cleanValue === keyLabel) continue;

      // Split multiple items
      const items = cleanValue.split(/[,;\/]/).map(s => s.trim()).filter(Boolean);
      for (const item of items) {
        if (item.length < 2) continue;
        const idBase = item.replace(/\s+/g, "_");
        entries.push({
          id: `corr:${colType}:${idBase}`,
          type: colType,
          label: item.charAt(0).toUpperCase() + item.slice(1),
          planets: PLANETS.includes(keyName) ? [`planet:${keyName}`] : [],
          signs: SIGNS.includes(keyName) ? [`sign:${keyName}`] : [],
          source: "Skinner",
          citation: `Complete Magician's Tables, Table H${columns.indexOf(colType)}`,
        });
      }
    }
  }
  return entries;
}

// ── Find table blocks in the text ──
function findTables(text) {
  const lines = text.split("\n");
  const tables = [];
  let currentBlock = [];
  let inTable = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Detect table start: line of dashes or table header
    if (/^─{10,}/.test(line) || /^[A-Z][a-z]+\s{2,}[A-Z][a-z]/.test(line) && /planet|angel|metal|stone/i.test(line)) {
      if (!inTable) {
        inTable = true;
        currentBlock = [line];
      } else {
        currentBlock.push(line);
      }
    } else if (inTable) {
      if (line.trim() === "" || /^TABLE\s/i.test(line) && currentBlock.length > 5) {
        inTable = false;
        const parsed = parseTable(currentBlock.join("\n"));
        if (parsed && parsed.length > 0) tables.push(...parsed);
        currentBlock = [];
      } else if (currentBlock.length > 0) {
        currentBlock.push(line);
      }
    }
  }
  return tables;
}

console.log("Scanning Skinner text for correspondence tables...");
const entries = findTables(text);
console.log(`Found ${entries.length} candidate entries`);

// ── Deduplicate ──
const seen = new Set();
const unique = [];
for (const e of entries) {
  const key = `${e.type}:${e.label}`;
  if (!seen.has(key)) {
    seen.add(key);
    unique.push(e);
  }
}

console.log(`Unique entries: ${unique.length}`);

// ── Output as TypeScript additions ──
const byType = {};
for (const e of unique) {
  if (!byType[e.type]) byType[e.type] = [];
  byType[e.type].push(e);
}

console.log("\n=== By Type ===");
for (const [type, items] of Object.entries(byType)) {
  console.log(`  ${type}: ${items.length}`);
}

// Write output
const outputPath = path.join(root, "scripts", "skinner-output.json");
fs.writeFileSync(outputPath, JSON.stringify(unique, null, 2));
console.log(`\nFull output written to scripts/skinner-output.json`);

// Generate TypeScript additions
let ts = `// Auto-generated from Stephen Skinner - The Complete Magician's Tables\n`;
ts += `// Added to correspondences.ts\n\n`;

for (const [type, items] of Object.entries(byType)) {
  ts += `  // ── ${type.charAt(0).toUpperCase() + type.slice(1)} (Skinner) ──\n`;
  for (const item of items.slice(0, 20)) {  // limit per type for now
    const planetRef = item.planets.length > 0 ? `planets: ["${item.planets[0]}"]` : "";
    const signRef = item.signs.length > 0 ? `signs: ["${item.signs[0]}"]` : "";
    const refs = [planetRef, signRef].filter(Boolean).join(", ");
    ts += `  { id: "${item.id}", type: "${item.type}", label: "${item.label}", ${refs}, source: "Skinner", citation: "${item.citation}" },\n`;
  }
  ts += "\n";
}

const tsPath = path.join(root, "scripts", "skinner-additions.ts");
fs.writeFileSync(tsPath, ts);
console.log(`\nTS additions written to scripts/skinner-additions.ts`);
console.log(`\nCheck output quality first, then add to correspondences.ts`);
