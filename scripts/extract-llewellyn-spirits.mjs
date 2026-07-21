// Extracts planetary spirits, intelligences, alternate archangels from Llewellyn Table 5
const entries = [];

const spiritData = [
  { planet: "planet:saturn", archangel: "Tzaphkiel", order: "Thrones", intelligence: "Agiel", spirit: "Zazel", divineName: "Yahveh Elohim" },
  { planet: "planet:jupiter", archangel: "Tzadkiel", order: "Dominations", intelligence: "Jophiel", spirit: "Hismael", divineName: "El" },
  { planet: "planet:mars", archangel: "Khamael", order: "Powers", intelligence: "Graphiel", spirit: "Bartzabel", divineName: "Elohim Gibor" },
  { planet: "planet:sun", archangel: "Michael", order: "Virtues", intelligence: "Nakhiel", spirit: "Sorath", divineName: "Eloa va-daath" },
  { planet: "planet:venus", archangel: "Uriel", order: "Principalities", intelligence: "Hagiel", spirit: "Kedemel", divineName: "Jahveh Sabaoth" },
  { planet: "planet:mercury", archangel: "Raphael", order: "Archangels", intelligence: "Tiriel", spirit: "Taphthartharath", divineName: "Elohim Sabaoth" },
  { planet: "planet:moon", archangel: "Gabriel", order: "Angels", intelligence: "Malka", spirit: "Schad", divineName: "Shaddai El Chi" },
];

console.log("// Auto-generated from Llewellyn Book Three, Table 5: Planetary Hierarchy");
console.log("");

// Spirits (new type - not in existing correspondences)
for (const d of spiritData) {
  const id = d.spirit.toLowerCase().replace(/[\s'-]+/g, "_");
  console.log(`  { id: "corr:spirit:${id}", type: "spirit", label: "${d.spirit}", planets: ["${d.planet}"], source: "Llewellyn", citation: "Book Three, Table 17" },`);
}

// Intelligences (new type - not in existing)
for (const d of spiritData) {
  const id = d.intelligence.toLowerCase().replace(/[\s'-]+/g, "_");
  console.log(`  { id: "corr:spirit:${id}", type: "spirit", label: "${d.intelligence}", planets: ["${d.planet}"], source: "Llewellyn", citation: "Book Three, Table 16" },`);
}

// Alternate archangels (where different from existing Agrippa entries)
const newArchangels = spiritData.filter(d => {
  const existing = { saturn: "Zaphkiel", mars: "Samael", venus: "Haniel" };
  const p = d.planet.replace("planet:", "");
  return existing[p] && existing[p] !== d.archangel;
});
for (const d of newArchangels) {
  const id = d.archangel.toLowerCase();
  console.log(`  { id: "corr:archangel:${id}", type: "archangel", label: "${d.archangel}", planets: ["${d.planet}"], source: "Llewellyn", citation: "Book Three, Table 15" },`);
}

// Divine names (new - not in existing correspondences.ts)
console.log("");
for (const d of spiritData) {
  const name = d.divineName;
  const id = name.toLowerCase().replace(/[\s-]+/g, "_").replace(/[^a-z_]/g, "").replace(/_{2,}/g, "_");
  console.log(`  { id: "corr:divine_name:${id}", type: "divine_name", label: "${name}", planets: ["${d.planet}"], source: "Llewellyn", citation: "Book Three, Table 5" },`);
}
