import fs from "node:fs";
import path from "node:path";

const text = fs.readFileSync(
  path.resolve(process.cwd(), "content/glossary/sources/books/pgm.txt"),
  "utf-8"
);
const lines = text.split("\n");

// ── Parse the table-of-spells section ──
// Lines like: "PGM IV. 1928-2005 Excellent spell for binding a lover"
function parseSpellList(lines) {
  const spells = [];
  // Known papyrus numbers for the table of spells
  const pgmPattern = /^(PGM\s+[A-Z]+\.?\s*\d+[\d–\-,. ]+\d+)\s+(.+)/;
  // Also handle multi-line entries where text continues next line
  let buffer = "";

  for (let i = 555; i < Math.min(lines.length, 2000); i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Skip page numbers, editor notes, table headers
    if (/^\d+$/.test(line)) continue;
    if (/^Table of Spells|^Translations|^Dieterich|^Preisendanz|^Bibliography|^INTRODUCTION/i.test(line)) continue;
    if (line.length < 5) continue;

    const match = line.match(pgmPattern);
    if (match) {
      if (buffer) {
        // Try to parse the buffered line too
        const bm = buffer.match(pgmPattern);
        if (bm) spells.push({ ref: bm[1], title: bm[2].trim() });
      }
      buffer = "";
      spells.push({ ref: match[1].trim(), title: match[2].trim() });
    } else if (line.startsWith("PGM") || line.startsWith("PG") || /^[A-Z]/.test(line)) {
      // Continuation or standalone title
      if (buffer) {
        buffer += " " + line;
        const bm = buffer.match(pgmPattern);
        if (bm) {
          spells.push({ ref: bm[1], title: bm[2].trim() });
          buffer = "";
        }
      } else {
        buffer = line;
        const bm = buffer.match(pgmPattern);
        if (bm) {
          spells.push({ ref: bm[1], title: bm[2].trim() });
          buffer = "";
        }
      }
    } else if (buffer) {
      buffer += " " + line;
    }
  }
  return spells;
}

// ── Classify each spell by type, purpose, and planet ──
function classify(spell) {
  const lower = (spell.title + " " + spell.ref).toLowerCase();

  // Detect type
  let type = "ritual"; // default
  if (/prayer|hymn|invocation/i.test(lower)) type = "prayer";
  if (/amulet|phylactery|ring|seal|talisman|engrav/i.test(lower)) type = "talisman";
  if (/dream|vision|revelation|oracle|divination|scrying|foreknowledge/i.test(lower)) type = "meditation";
  if (/love|attraction|erotic|binding.*lover|aphrodite/i.test(lower)) type = "ritual";
  if (/memory|learning|knowledge/i.test(lower)) type = "prayer";

  // Detect purpose
  const purposes = [];
  if (/love|attraction|eros|aphrodite/i.test(lower)) purposes.push("love");
  if (/protection|phylactery|safety|defense/i.test(lower)) purposes.push("protection");
  if (/invisibility|hidden/i.test(lower)) purposes.push("invisibility");
  if (/memory/i.test(lower)) purposes.push("memory");
  if (/dream|vision|oracle|revelation|divination|foreknowledge|clairvoyance/i.test(lower)) purposes.push("divination");
  if (/curse|bind|restrain|silence|subject/i.test(lower)) purposes.push("binding");
  if (/heal|cure|health|medicine/i.test(lower)) purposes.push("healing");
  if (/wealth|business|success|favor|victory|praise/i.test(lower)) purposes.push("success");
  if (/exorcism|drive.*out|possession/i.test(lower)) purposes.push("exorcism");
  if (/anger|restrain.*anger|cool|calm/i.test(lower)) purposes.push("calm");
  if (/wisdom|knowledge|philosophy|understanding/i.test(lower)) purposes.push("wisdom");
  if (/initiation|consecration/i.test(lower)) purposes.push("initiation");
  if (/daimon|spirit.*guide|guardian|familiar/i.test(lower)) purposes.push("daimon");
  if (/necromancy|dead|corpse|shadow/i.test(lower)) purposes.push("necromancy");
  if (/charm|spell.*for/i.test(lower) && purposes.length === 0) purposes.push("general");
  if (purposes.length === 0) purposes.push("unknown");

  // Detect planet from deity names
  const planets = [];
  if (/apollo|helios|sol|sun/i.test(lower)) planets.push("planet:sun");
  if (/selene|moon|luna|lunar|meni/i.test(lower)) planets.push("planet:moon");
  if (/hermes|mercury|thoth/i.test(lower)) planets.push("planet:mercury");
  if (/aphrodite|venus|desire/i.test(lower)) planets.push("planet:venus");
  if (/ares|mars|war/i.test(lower)) planets.push("planet:mars");
  if (/zeus|jupiter|king/i.test(lower)) planets.push("planet:jupiter");
  if (/kronos|cronos|saturn|time/i.test(lower)) planets.push("planet:saturn");

  // Detect completeness from title
  const complete = !/no title|fragment|unclear|uncertain|illegible/i.test(lower);

  return { type, purposes, planets, complete };
}

function cleanTitle(title) {
  // Remove editor initials at end
  return title.replace(/\s+[A-Z]\.\s*[A-Z]\.\s*[A-Z]\.?\s*$/, "")
    .replace(/\s+[A-Z]\.\s*[A-Z]\.?\s*$/, "")
    .replace(/\(No title\)\s*/i, "")
    .trim();
}

const spells = parseSpellList(lines);
console.log(`Parsed ${spells.length} spells from catalog\n`);

// Deduplicate by ref
const seen = new Set();
const unique = [];
for (const s of spells) {
  const key = s.ref;
  if (!seen.has(key)) {
    seen.add(key);
    unique.push(s);
  }
}

const classified = unique.map(s => ({
  id: "pgm_" + s.ref.replace(/[.\s–—,;:']/g, "_").replace(/_+/g, "_").toLowerCase(),
  ref: s.ref,
  title: cleanTitle(s.title),
  ...classify(s),
}));

// Group by purpose
const byPurpose = {};
const byPlanet = {};
for (const s of classified) {
  for (const p of s.purposes) {
    if (!byPurpose[p]) byPurpose[p] = [];
    byPurpose[p].push(s);
  }
  for (const p of s.planets) {
    const key = p.replace("planet:", "");
    if (!byPlanet[key]) byPlanet[key] = [];
    byPlanet[key].push(s);
  }
}

console.log("=== BY PURPOSE ===");
for (const [p, items] of Object.entries(byPurpose).sort((a, b) => b[1].length - a[1].length)) {
  console.log(`  ${p}: ${items.length}`);
}

console.log("\n=== BY PLANET ===");
for (const [p, items] of Object.entries(byPlanet).sort((a, b) => b[1].length - a[1].length)) {
  console.log(`  ${p}: ${items.length}`);
}

console.log(`\nTotal unique: ${classified.length}`);
console.log(`Complete: ${classified.filter(s => s.complete).length}`);
console.log(`Fragmentary: ${classified.filter(s => !s.complete).length}`);

// Write JSON database
const output = {
  source: "PGM (Betz translation, 2nd ed.)",
  total: classified.length,
  generated: new Date().toISOString().split("T")[0],
  byPurpose,
  byPlanet,
  spells: classified,
};

const outPath = path.resolve(process.cwd(), "content/glossary/pgm-catalog.json");
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
console.log(`\n→ Written to ${outPath}`);
