import fs from "node:fs";
import path from "node:path";

const text = fs.readFileSync("/tmp/llewellyn.txt", "utf-8");
const lines = text.split("\n");

function findTableLines(label) {
  const results = [];
  let capturing = false;
  let startLine = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(label)) {
      capturing = true;
      startLine = i + 1;
      continue;
    }
    if (capturing) {
      if (lines[i].includes("Table ") && i !== startLine) break;
      const trimmed = lines[i].trim();
      if (trimmed) results.push({ line: i, text: trimmed });
    }
  }
  return results;
}

// Parse a simple two-column table: key → value
function parsePairs(raw) {
  const pairs = [];
  let currentKey = "";
  for (const { text } of raw) {
    if (!currentKey) {
      currentKey = text;
    } else {
      if (text !== currentKey) {
        pairs.push({ key: currentKey, value: text });
        currentKey = "";
      }
    }
  }
  return pairs;
}

// ── Table 19: Planets and Their Metals, Colours, and Crystals ──
const planetOrder = ["Saturn", "Jupiter", "Mars", "Sun", "Venus", "Mercury", "Moon"];
const metalsColoursCrystals = {
  Saturn:  { metal: "Lead", colour: "Black", crystal: "Obsidian", number: 3 },
  Jupiter: { metal: "Tin", colour: "Blue", crystal: "Lapis lazuli", number: 4 },
  Mars:    { metal: "Brass", colour: "Red", crystal: "Bloodstone", number: 5 },
  Sun:     { metal: "Gold", colour: "Gold/yellow", crystal: "Amber", number: 6 },
  Venus:   { metal: "Copper", colour: "Green", crystal: "Malachite", number: 7 },
  Mercury: { metal: "Aluminium", colour: "Orange", crystal: "Agate", number: 8 },
  Moon:    { metal: "Silver", colour: "Silver/purple", crystal: "Selenite", number: 9 },
};

const planetId = p => "planet:" + p.toLowerCase();
const corrId = (type, label) => "corr:" + type + ":" + label.toLowerCase().replace(/[\s/]+/g, "_");

let ts = `// Auto-generated from Llewellyn's Complete Book of Ceremonial Magick\n`;
ts += `// Book Three: Planetary Magic by David Rankine\n`;
ts += `// Source: Tables 19, 20, 21, 22, 23\n\n`;

// ── METALS ──
ts += `  // ── Metals (Llewellyn Table 19) ──\n`;
for (const [planet, data] of Object.entries(metalsColoursCrystals)) {
  const id = data.metal.toLowerCase();
  ts += `  { id: "${corrId("metal", id)}", type: "metal", label: "${data.metal}", planets: ["${planetId(planet)}"], source: "Llewellyn", citation: "Book Three, Table 19" },\n`;
}

// ── COLOURS ──
ts += `\n  // ── Colours (Llewellyn Table 19) ──\n`;
for (const [planet, data] of Object.entries(metalsColoursCrystals)) {
  const colours = data.colour.split("/");
  for (const c of colours) {
    const clean = c.trim();
    ts += `  { id: "${corrId("colour", clean)}", type: "colour", label: "${clean}", planets: ["${planetId(planet)}"], source: "Llewellyn", citation: "Book Three, Table 19" },\n`;
  }
}

// ── CRYSTALS (Table 19) ──
ts += `\n  // ── Crystals (Llewellyn Table 19) ──\n`;
for (const [planet, data] of Object.entries(metalsColoursCrystals)) {
  ts += `  { id: "${corrId("stone", data.crystal)}", type: "stone", label: "${data.crystal}", planets: ["${planetId(planet)}"], source: "Llewellyn", citation: "Book Three, Table 19" },\n`;
}

// ── EXTENDED CRYSTALS (Table 23) ──
const crystals23 = {
  Sun:     ["Amber", "Cat's-eye", "Diamond", "Sunstone", "Tiger's-eye", "Topaz", "Zircon"],
  Mercury: ["Agate", "Aventurine", "Citrine quartz", "Labradorite", "Opal"],
  Venus:   ["Amazonite", "Emerald", "Jade", "Malachite", "Peridot", "Rose quartz", "Zoisite"],
  Moon:    ["Aquamarine", "Beryl", "Chalcedony", "Moonstone", "Pearl", "Quartz", "Selenite"],
  Mars:    ["Bloodstone", "Carnelian", "Garnet", "Hematite", "Magnetite", "Pyrite", "Ruby"],
  Jupiter: ["Amethyst", "Ammonite", "Azurite", "Lapis lazuli", "Sapphire", "Sodalite", "Turquoise"],
  Saturn:  ["Jet", "Obsidian", "Onyx", "Serpentine", "Smoky quartz"],
};

ts += `\n  // ── Crystals (Llewellyn Table 23) ──\n`;
for (const [planet, stones] of Object.entries(crystals23)) {
  for (const stone of stones) {
    const id = stone.toLowerCase().replace(/['\s-]+/g, "_").replace(/[^a-z_]/g, "");
    ts += `  { id: "corr:stone:${id}", type: "stone", label: "${stone}", planets: ["${planetId(planet)}"], source: "Llewellyn", citation: "Book Three, Table 23" },\n`;
  }
}

// ── INCENSES (Table 21 - Modern column) ──
const incenses21 = {
  Sun:     ["Amber", "Cinnamon", "Frankincense", "Orange", "Red sandalwood"],
  Mercury: ["Galbanum", "Lavender", "Lemon", "Mastic", "Rosemary", "Storax"],
  Venus:   ["Benzoin", "Lilac", "Lily", "Rose", "White sandalwood"],
  Moon:    ["Camphor", "Jasmine", "Vanilla", "Ylang-ylang"],
  Mars:    ["Black pepper", "Dragon's blood", "Ginger", "Opoponax"],
  Jupiter: ["Cedar", "Copal", "Hyssop", "Juniper", "Saffron"],
  Saturn:  ["Myrrh", "Patchouli", "Pine", "Vetivert"],
};

ts += `\n  // ── Incenses (Llewellyn Table 21) ──\n`;
for (const [planet, incenses] of Object.entries(incenses21)) {
  for (const incense of incenses) {
    const id = incense.toLowerCase().replace(/[\s'-]+/g, "_");
    ts += `  { id: "corr:incense:${id}", type: "incense", label: "${incense}", planets: ["${planetId(planet)}"], source: "Llewellyn", citation: "Book Three, Table 21" },\n`;
  }
}

// ── PLANETARY NUMBERS (Table 19) ──
ts += `\n  // ── Numbers (Llewellyn Table 19 - Kamea numbers) ──\n`;
for (const [planet, data] of Object.entries(metalsColoursCrystals)) {
  ts += `  { id: "corr:number:${data.number}", type: "number", label: "${data.number}", planets: ["${planetId(planet)}"], source: "Llewellyn", citation: "Book Three, Table 19" },\n`;
}

// ── PLANETARY BODY PARTS (Table 2 mentions) ──
// From Book Three, Table 2: The Planets, the Human Body, and the Ages of Man
const bodyParts = {
  Saturn:  ["Legs", "Gall"],
  Jupiter: ["Liver", "Thighs"],
  Mars:    ["Muscles", "Gall bladder"],
  Sun:     ["Heart", "Eyes"],
  Venus:   ["Kidneys", "Genitals"],
  Mercury: ["Hands", "Lungs"],
  Moon:    ["Brain", "Stomach"],
};

ts += `\n  // ── Body Parts (Llewellyn Table 2) ──\n`;
for (const [planet, parts] of Object.entries(bodyParts)) {
  for (const part of parts) {
    const id = part.toLowerCase().replace(/[\s'-]+/g, "_");
    ts += `  { id: "corr:body_part:${id}", type: "body_part", label: "${part}", planets: ["${planetId(planet)}"], source: "Llewellyn", citation: "Book Three, Table 2" },\n`;
  }
}

// Write output
const outPath = path.resolve(process.cwd(), "scripts", "llewellyn-additions.ts");
fs.writeFileSync(outPath, ts);
console.log(`Generated ${outPath}`);
console.log(`Entries: metals=${7}, colours=${14}, crystals=${7}, extended_crystals=${49}, incenses=${37}, numbers=${7}, body_parts=${14}`);
