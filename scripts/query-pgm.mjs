import { readFileSync } from "fs";
const catalog = JSON.parse(readFileSync("content/glossary/pgm-catalog.json", "utf-8"));

const [,, purpose, planet] = process.argv;

if (!purpose && !planet) {
  console.log("Usage: npx tsx scripts/query-pgm.mjs [purpose] [planet]\n");
  console.log("Purposes:", Object.keys(catalog.byPurpose).join(", "));
  console.log("Planets: sun, moon, mercury, venus, mars, jupiter, saturn\n");
  console.log("Examples:");
  console.log("  npx tsx scripts/query-pgm.mjs love");
  console.log("  npx tsx scripts/query-pgm.mjs divination");
  console.log("  npx tsx scripts/query-pgm.mjs "" sun");
  process.exit(0);
}

let results = catalog.spells;
if (purpose) results = results.filter(s => s.purposes.includes(purpose));
if (planet) results = results.filter(s => s.planets.includes("planet:" + planet));

console.log(`\n${results.length} PGM spells matching ${purpose ? "purpose=" + purpose : ""}${planet ? " planet=" + planet : ""}\n`);
for (const s of results) {
  console.log(`  ${s.ref}  — ${s.title}`);
}
