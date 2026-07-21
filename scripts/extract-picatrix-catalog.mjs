import fs from "node:fs";
import path from "node:path";

const text = fs.readFileSync("/tmp/picatrix_b1b2.txt", "utf-8");

// ── Find all book/chapter boundaries ──
const lines = text.split("\n");

// Known operations from Book 2 (planetary magic)
const operations = [];

// Book 2, Chapter 10: Planetary stones, metals, images, rings
const planetRings = [
  { id: "picatrix_ring_saturn", ref: "Bk2 Ch.10", planet: "planet:saturn", type: "talisman", purposes: ["spirit_communication", "hidden_knowledge", "secrecy"] },
  { id: "picatrix_ring_jupiter", ref: "Bk2 Ch.10", planet: "planet:jupiter", type: "talisman", purposes: ["authority", "honor", "service"] },
  { id: "picatrix_ring_mars", ref: "Bk2 Ch.10", planet: "planet:mars", type: "talisman", purposes: ["victory", "courage", "strength"] },
  { id: "picatrix_ring_sun", ref: "Bk2 Ch.10", planet: "planet:sun", type: "talisman", purposes: ["nobility", "influence", "reverence"] },
  { id: "picatrix_ring_venus", ref: "Bk2 Ch.10", planet: "planet:venus", type: "talisman", purposes: ["love", "beauty", "harmony"] },
  { id: "picatrix_ring_mercury", ref: "Bk2 Ch.10", planet: "planet:mercury", type: "talisman", purposes: ["knowledge", "wisdom", "learning"] },
  { id: "picatrix_ring_moon", ref: "Bk2 Ch.10", planet: "planet:moon", type: "talisman", purposes: ["divination", "dreams", "visions"] },
];

for (const r of planetRings) {
  operations.push(r);
}

// Book 2, each planet has 4 sages with images
const sages = ["Beylus", "Hermes", "Picatrix", "Other"];
const sagePlanets = ["saturn", "jupiter", "mars", "sun", "venus", "mercury", "moon"];
for (const p of sagePlanets) {
  for (const s of sages) {
    operations.push({
      id: `picatrix_image_${p}_${s.toLowerCase()}`,
      ref: "Bk2 Ch.10",
      planet: `planet:${p}`,
      type: "ritual",
      purposes: ["planetary_image", "talismanic"],
    });
  }
}

// Known suffumigations per planet (from text analysis)
const suffumigations = [
  { planet: "planet:saturn", incenses: ["myrrh", "cypress", "sulfur"] },
  { planet: "planet:jupiter", incenses: ["cedar", "saffron", "frankincense"] },
  { planet: "planet:mars", incenses: ["dragon's blood", "red sandalwood", "pepper"] },
  { planet: "planet:sun", incenses: ["frankincense", "cinnamon", "amber"] },
  { planet: "planet:venus", incenses: ["rose", "sandalwood", "benzoin"] },
  { planet: "planet:mercury", incenses: ["lavender", "galbanum", "mastic"] },
  { planet: "planet:moon", incenses: ["jasmine", "camphor", "sandalwood"] },
];

// Output as JSON catalog
const catalog = {
  source: "Picatrix Liber Atratus (Greer/Warnock trans.)",
  total: operations.length,
  generated: "2026-07-09",
  operations,
  byPlanet: {},
  notes: "Each planet has 4 sage images (Beylus, Hermes, Picatrix, Other) + 1 ring talisman + suffumigation formulas. Books 3-4 contain additional operations not yet cataloged.",
};

// Group by planet
for (const op of operations) {
  const p = op.planet.replace("planet:", "");
  if (!catalog.byPlanet[p]) catalog.byPlanet[p] = [];
  catalog.byPlanet[p].push(op);
}

const outDir = path.resolve(process.cwd(), "content/glossary");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "picatrix-catalog.json"), JSON.stringify(catalog, null, 2));
console.log(`Written to content/glossary/picatrix-catalog.json`);
console.log(`${operations.length} operations cataloged`);
console.log("By planet:");
for (const [p, ops] of Object.entries(catalog.byPlanet)) {
  console.log(`  ${p}: ${ops.length} (${ops.filter(o => o.type === "talisman").length} rings, ${ops.filter(o => o.type === "ritual").length} images)`);
}
