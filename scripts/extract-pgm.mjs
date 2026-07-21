import fs from "node:fs";
import path from "node:path";
import OpenAI from "openai";

const root = path.resolve(process.cwd());
const pgmPath = path.join(root, "content/glossary/sources/books/pgm.txt");
const text = fs.readFileSync(pgmPath, "utf-8");

const openai = new OpenAI({
  baseURL: "https://opencode.ai/zen/go/v1",
  apiKey: process.env.OPENCODE_GO_API_KEY || "sk-SDjjQ8NtTdpM2OmWl3GXDrPlhcQiLvZln60mSVVcJQ3rkg7trYHQoLKshcKSeg0Y",
});

// ── Find all PGM spell headings ──
function findSpellSections(text) {
  const lines = text.split("\n");
  const sections = [];
  let currentStart = null;
  let currentHeader = "";
  let currentText = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const headerMatch = line.match(/^(PGM\s+[A-Z]+\.?\s*\d+[\d–\-,. ]+.*?)(?:\s+\w+\.\s*\w+\.?\s*\w+\.?\s*.*)?$/);
    
    if (headerMatch) {
      if (currentStart !== null) {
        sections.push({ header: currentHeader, text: currentText, startLine: currentStart, endLine: i - 1 });
      }
      currentStart = i;
      currentHeader = line;
      currentText = "";
    } else if (currentStart !== null) {
      if (line && !line.match(/^\d+$/) && !line.match(/^--+$/) && !line.match(/^[A-Z]\.[A-Za-z]/)) {
        currentText += line + (lines[i].endsWith(" ") ? "" : " ");
      }
    }
  }
  if (currentStart !== null) {
    sections.push({ header: currentHeader, text: currentText, startLine: currentStart });
  }
  return sections;
}

function classifySpell(header, body) {
  const lower = (header + " " + body).toLowerCase();
  const planetMap = {
    sun: { names: ["helios", "apollo", "sun", "sol", "light"], triggers: ["trigger:active:sun"], id: "planet:sun" },
    moon: { names: ["selene", "moon", "luna", "lunar", "meni"], triggers: ["trigger:active:moon"], id: "planet:moon" },
    mercury: { names: ["hermes", "mercury", "mercurial", "thoth"], triggers: ["trigger:active:mercury"], id: "planet:mercury" },
    venus: { names: ["aphrodite", "venus", "venereal", "love", "desire"], triggers: ["trigger:active:venus"], id: "planet:venus" },
    mars: { names: ["ares", "mars", "martial", "war", "courage", "strength"], triggers: ["trigger:active:mars"], id: "planet:mars" },
    jupiter: { names: ["zeus", "jupiter", "jovial", "kingship"], triggers: ["trigger:active:jupiter"], id: "planet:jupiter" },
    saturn: { names: ["kronos", "saturn", "saturnine", "time"], triggers: ["trigger:active:saturn"], id: "planet:saturn" },
  };
  for (const [planet, info] of Object.entries(planetMap)) {
    if (info.names.some(n => lower.includes(n))) {
      return { planet: info.id, triggers: info.triggers };
    }
  }
  return null;
}

function toType(body) {
  const lower = body.toLowerCase();
  if (lower.includes("prayer") || lower.includes("hymn") || lower.includes("invocation") || lower.includes("call upon")) return "prayer";
  if (lower.includes("amulet") || lower.includes("phylactery") || lower.includes("engrave") || lower.includes("inscribe") || lower.includes("stone") || lower.includes("ring")) return "talisman";
  if (lower.includes("dream") || lower.includes("vision") || lower.includes("revelation")) return "meditation";
  if (lower.includes("charm") || lower.includes("love") || lower.includes("spell")) return "ritual";
  return "ritual";
}

// ── Process spells in batches ──
async function extractBatch(spells) {
  const prompt = `You are a PGM (Greek Magical Papyri) extraction specialist.
Extract structured SpellEntry objects from these PGM spell texts.
Return ONLY valid JSON array. No explanation, no markdown.

For each spell, output: {
  "id": "pgm:type:domain:number",
  "source": "PGM",
  "type": "prayer | ritual | talisman | meditation",
  "triggers": ["trigger:active:planet"],
  "planets": ["planet:mars"],
  "purpose": ["courage"],
  "title": "Spell Title (PGM X. 123-45, Adapted)",
  "summary": "One-line description",
  "procedure": ["Step 1", "Step 2"],
  "incantation": "spoken words if found",
  "materials": { "herbs": [], "metals": [], "colours": [], "stones": [], "incenses": [], "other": [] },
  "timing": { "moonPhase": "waxing" },
  "safety": "historical_reference",
  "safeAdaptations": ["Focus on self-transformation, not external coercion", "Omit any hazardous ingredients"],
  "citation": "PGM reference number"
}

Spells to extract:
${spells.map((s, i) => `--- SPELL ${i + 1} ---
Header: ${s.header}
Body: ${s.text.slice(0, 2000)}
`).join("\n")}

Rules:
- Extract only spells with clear purpose and procedure
- Map planetary deity to planet (Hermes→mercury, Aphrodite→venus, Ares→mars, Zeus→jupiter, Helios→sun, Selene→moon, Kronos→saturn)
- Skip fragmentary or unclear spells
- Always provide safeAdaptations
- Each procedure step should be a complete action
- Use shared entity ID format: planet:mars`;

  const res = await openai.chat.completions.create({
    model: "deepseek-v4-flash",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 8192,
  });
  return res.choices[0].message.content;
}

// ── Main ──
const sections = findSpellSections(text);
console.log(`Found ${sections.length} potential spell sections`);

// Filter to substantial sections with actual content
const spells = sections.filter(s => s.text.length > 100 && s.text.length < 10000);
console.log(`Filtered to ${spells.length} substantial spells`);

// Process in batches of 5
const BATCH_SIZE = 5;
let allEntries = [];

for (let i = 0; i < Math.min(spells.length, 30); i += BATCH_SIZE) {
  const batch = spells.slice(i, i + BATCH_SIZE);
  console.log(`\nProcessing batch ${i / BATCH_SIZE + 1} (spells ${i + 1}-${i + batch.length})...`);
  try {
    const result = await extractBatch(batch);
    // Parse JSON from response
    const jsonMatch = result.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const entries = JSON.parse(jsonMatch[0]);
      allEntries.push(...entries);
      console.log(`  → ${entries.length} entries extracted`);
    }
  } catch (e) {
    console.error(`  Batch failed: ${e.message}`);
  }
  // Small delay between batches
  await new Promise(r => setTimeout(r, 1000));
}

// Write output
const outputPath = path.join(root, "scripts", "pgm-output.json");
fs.writeFileSync(outputPath, JSON.stringify(allEntries, null, 2));
console.log(`\nTotal: ${allEntries.length} entries → scripts/pgm-output.json`);

// Generate TypeScript additions
if (allEntries.length > 0) {
  let ts = `// Auto-generated from PGM (Betz translation)\n`;
  ts += `// Generated ${new Date().toISOString().split("T")[0]}\n\n`;

  for (const entry of allEntries) {
    const triggers = JSON.stringify(entry.triggers);
    const planets = JSON.stringify(entry.planets);
    const purpose = JSON.stringify(entry.purpose);
    const procedure = JSON.stringify(entry.procedure);
    const materials = entry.materials ? JSON.stringify(entry.materials) : "undefined";
    const timing = entry.timing ? JSON.stringify(entry.timing) : "undefined";
    const incantation = entry.incantation ? JSON.stringify(entry.incantation) : "undefined";
    const safeAd = JSON.stringify(entry.safeAdaptations);

    ts += `  {\n`;
    ts += `    id: "${entry.id}", source: "PGM", type: "${entry.type}",\n`;
    ts += `    purpose: ${purpose}, triggers: ${triggers}, planets: ${planets},\n`;
    ts += `    title: ${JSON.stringify(entry.title)},\n`;
    ts += `    summary: ${JSON.stringify(entry.summary)},\n`;
    ts += `    procedure: ${procedure},\n`;
    if (entry.incantation) ts += `    incantation: ${incantation},\n`;
    if (entry.timing) ts += `    timing: ${timing},\n`;
    if (entry.materials) ts += `    materials: ${materials},\n`;
    ts += `    safety: "historical_reference",\n`;
    ts += `    safeAdaptations: ${safeAd},\n`;
    ts += `    citation: ${JSON.stringify(entry.citation)},\n`;
    ts += `  },\n`;
  }

  const tsPath = path.join(root, "scripts", "pgm-additions.ts");
  fs.writeFileSync(tsPath, ts);
  console.log(`TS additions → scripts/pgm-additions.ts`);
}
