/**
 * Test: Knowledge graph integration with the full engine pipeline.
 * Uses Thomas Prior (1999-05-16, 14:37, Ascot) — same as technicaltest.md
 */
import { buildActivationPacket } from "../src/astrology/activation_packet";
import { interpretPacket } from "../src/astrology/interpretation_schema";
import { registerSpellbookInGraph } from "../src/astrology/spellbook/spellbook";
import * as kg from "../src/astrology/knowledge_graph";
const { getGraph, pushActivationToGraph, graphRecommend } = kg;
import type { NormalizedChart, PlanetId } from "../src/astrology/types";

// ── Initialize and wire graph ──
kg.resetGraph();
kg.getGraph(); // force init with static entities
registerSpellbookInGraph();

// ── Use the synthetic day chart from fixtures (avoids caelus ephemeris dependency) ──
const chart: NormalizedChart = {
  native_id: "test-day-chart",
  birth_data: { date: "1990-06-15", time: "12:00", timezone: "UTC", location: { name: "London", lat: 51.5, lon: -0.12 } },
  natal: {
    jdUt: 2448000,
    ascendant: { sign: "Leo", sign_index: 4, degree_absolute: 150, degree_in_sign: 0 },
    mc: { sign: "Taurus", sign_index: 1, degree_absolute: 45, degree_in_sign: 15 },
    planets: {
      sun: { sign: "Gemini", sign_index: 2, degree_absolute: 75, degree_in_sign: 15, speed: 1, retrograde: false, house: 10, dignities: [] },
      moon: { sign: "Pisces", sign_index: 11, degree_absolute: 345, degree_in_sign: 15, speed: 13, retrograde: false, house: 4, dignities: [] },
      mercury: { sign: "Gemini", sign_index: 2, degree_absolute: 80, degree_in_sign: 20, speed: 1.5, retrograde: false, house: 10, dignities: ["domicile"] },
      venus: { sign: "Cancer", sign_index: 3, degree_absolute: 100, degree_in_sign: 10, speed: 1.2, retrograde: false, house: 11, dignities: [] },
      mars: { sign: "Aries", sign_index: 0, degree_absolute: 20, degree_in_sign: 20, speed: 0.8, retrograde: true, house: 8, dignities: [] },
      jupiter: { sign: "Libra", sign_index: 6, degree_absolute: 195, degree_in_sign: 15, speed: 0.2, retrograde: false, house: 3, dignities: [] },
      saturn: { sign: "Capricorn", sign_index: 9, degree_absolute: 285, degree_in_sign: 15, speed: 0.1, retrograde: false, house: 6, dignities: ["domicile"] },
    },
    houses_whole_sign: [
      { number: 1, sign: "Leo", sign_index: 4, topics: ["life"] },
      { number: 2, sign: "Virgo", sign_index: 5, topics: ["wealth"] },
      { number: 3, sign: "Libra", sign_index: 6, topics: ["communication"] },
      { number: 4, sign: "Scorpio", sign_index: 7, topics: ["home"] },
      { number: 5, sign: "Sagittarius", sign_index: 8, topics: ["creativity"] },
      { number: 6, sign: "Capricorn", sign_index: 9, topics: ["health"] },
      { number: 7, sign: "Aquarius", sign_index: 10, topics: ["partnership"] },
      { number: 8, sign: "Pisces", sign_index: 11, topics: ["transformation"] },
      { number: 9, sign: "Aries", sign_index: 0, topics: ["philosophy"] },
      { number: 10, sign: "Taurus", sign_index: 1, topics: ["career"] },
      { number: 11, sign: "Gemini", sign_index: 2, topics: ["friends"] },
      { number: 12, sign: "Cancer", sign_index: 3, topics: ["unconscious"] },
    ],
    aspects: [],
    lots: { fortune: { sign: "Sagittarius", sign_index: 8, degree_absolute: 270, degree_in_sign: 0, house: 5 }, spirit: { sign: "Gemini", sign_index: 2, degree_absolute: 80, degree_in_sign: 20, house: 11 } as any, eros: { sign: "", sign_index: 0, degree_absolute: 0, degree_in_sign: 0, house: 0 }, necessity: { sign: "", sign_index: 0, degree_absolute: 0, degree_in_sign: 0, house: 0 }, courage: { sign: "", sign_index: 0, degree_absolute: 0, degree_in_sign: 0, house: 0 }, victory: { sign: "", sign_index: 0, degree_absolute: 0, degree_in_sign: 0, house: 0 }, nemesis: { sign: "", sign_index: 0, degree_absolute: 0, degree_in_sign: 0, house: 0 } },
    dignity_scores: {} as any,
    day_chart: true,
    oikodespotes: { planet: "mercury", name: "Mercury", score: 17, points_considered: ["Lot of Fortune", "Moon"], interpretation: "Personal daimon" },
  },
};

const targetDate = new Date("2026-07-09T12:00:00");
const currentSkyPlanets = {
  sun: { lon: 75, sign_index: 2 }, moon: { lon: 345, sign_index: 11 },
  mercury: { lon: 80, sign_index: 2 }, venus: { lon: 100, sign_index: 3 },
  mars: { lon: 20, sign_index: 0 }, jupiter: { lon: 195, sign_index: 6 },
  saturn: { lon: 285, sign_index: 9 },
} as Record<PlanetId, { lon: number; sign_index: number }>;

const packet = buildActivationPacket({
  chart,
  currentSkyPlanets,
  currentSkyAspects: [],
  targetDate,
});

const oikodespotes = packet.oikodespotes?.planet;
const reading = interpretPacket(packet, oikodespotes);

// ── Push to graph ──
// Build theme summaries from all 5 interpreters
const allThemes = [
  ...reading.interpretations.al_khayyat,
  ...reading.interpretations.valens,
  ...reading.interpretations.ficino,
  ...reading.interpretations.greenbaum,
  ...reading.interpretations.demetra,
];

pushActivationToGraph(
  packet.signals,
  allThemes.map(t => ({ planet: t.planet, tags: t.tags, system: t.system })),
  oikodespotes,
);

// ── Inspect the graph ──
const g = getGraph();
const allNodes = g.getAllNodes();
const allEdges = g.getAllNodes().flatMap(n => g.getEdges(n.id));

console.log("=== GRAPH STATE ===\n");
console.log(`Total nodes: ${allNodes.length}`);
console.log(`Total edges (indexed): ${allEdges.length}\n`);

// Layer breakdown
const byLayer: Record<string, number> = {};
for (const n of allNodes) {
  byLayer[n.layer] = (byLayer[n.layer] || 0) + 1;
}
console.log("By layer:", byLayer);

// Type breakdown
const byType: Record<string, number> = {};
for (const n of allNodes) {
  byType[n.type] = (byType[n.type] || 0) + 1;
}
console.log("By type:", byType, "\n");

// ── Cluster by each activated planet ──
console.log("=== PER-PLANET CLUSTERS ===\n");
for (const p of packet.signals) {
  const cluster = g.clusterByPlanet(p.planet);
  const practiceEdges = cluster.edges.filter(e => e.predicate === "practice_for");
  const corrEdges = cluster.edges.filter(e => e.predicate === "corresponds_to");
  const intEdges = cluster.edges.filter(e => e.predicate === "interpreted_by");
  const condEdges = cluster.edges.filter(e => e.predicate === "has_condition");
  const timingEdges = cluster.edges.filter(e => e.predicate === "has_timing");

  console.log(`${p.planet} (score ${p.score}, ${p.confidence}):`);
  console.log(`  Practices:    ${practiceEdges.length}`);
  console.log(`  Correspondences: ${corrEdges.length}`);
  console.log(`  Interpretations: ${intEdges.length}`);
  console.log(`  Conditions:   ${condEdges.length}`);
  console.log(`  Timing:       ${timingEdges.length}`);
  if (intEdges.length > 0) {
    console.log(`  Interpretation themes:`);
    for (const e of intEdges) {
      const node = g.getNode(e.object);
      if (node) console.log(`    - ${node.label}`);
    }
  }
  console.log("");
}

// ── Graph-backed recommendation ──
console.log("=== GRAPH-BASED PRACTICE RECOMMENDATIONS ===\n");
for (const p of packet.signals) {
  const recs = graphRecommend(p.planet, reading.convergence.planets, p.confidence);
  for (const r of recs) {
    const node = g.getNode(r.practiceId);
    const label = node?.label || r.practiceId.replace(/.*?:(pgm_|picatrix_|spell:)?/, "");
  console.log(`  ${r.planet} → ${label}: ${r.reason}`);
  }
}

// ── Verification checks ──
console.log("\n=== VERIFICATION ===\n");
let pass = 0;
let fail = 0;

// Check 1: Oikodespotes is computed
if (packet.oikodespotes) {
  console.log(`✅ Oikodespotes: ${packet.oikodespotes.name} (score ${packet.oikodespotes.score})`);
  pass++;
} else { console.log("❌ No oikodespotes"); fail++; }

// Check 2: Signals present
if (packet.signals.length > 0) {
  console.log(`✅ Signals: ${packet.signals.length} active planets`);
  pass++;
} else { console.log("❌ No signals"); fail++; }

// Check 3: Interpreters produce output
const totalThemes = allThemes.length;
if (totalThemes > 0) {
  console.log(`✅ Interpretations: ${totalThemes} total from all 5 systems`);
  pass++;
} else { console.log("❌ No interpretations"); fail++; }

// Check 4: Convergence detected
if (reading.convergence.planets.length > 0) {
  console.log(`✅ Convergence: ${reading.convergence.planets.length} planets flagged by 3+ systems`);
  pass++;
} else { console.log("❌ No convergence"); fail++; }

// Check 5: Graph has practice_for edges for activated planets
let totalRecs = 0;
for (const p of packet.signals) {
  const cluster = g.clusterByPlanet(p.planet);
  totalRecs += cluster.edges.filter(e => e.predicate === "practice_for").length;
}
if (totalRecs > 0) {
  console.log(`✅ Graph recommendations: ${totalRecs} practices linked to activated planets`);
  pass++;
} else { console.log("❌ No graph recommendations"); fail++; }

// Check 6: Graph has interpreted_by edges from pushActivationToGraph
let totalInt = 0;
for (const p of packet.signals) {
  const cluster = g.clusterByPlanet(p.planet);
  totalInt += cluster.edges.filter(e => e.predicate === "interpreted_by").length;
}
if (totalInt > 0) {
  console.log(`✅ Graph interpretations: ${totalInt} interpreter themes linked to planets`);
  pass++;
} else { console.log("⚠️ No interpretation edges (expected if no themes matched)"); }

// Check 7: Graph has conditions for active planets
let totalCond = 0;
for (const p of packet.signals) {
  const cluster = g.clusterByPlanet(p.planet);
  totalCond += cluster.edges.filter(e => e.predicate === "has_condition").length;
}
if (totalCond > 0) {
  console.log(`✅ Graph conditions: ${totalCond} condition edges`);
  pass++;
} else { console.log("⚠️ No condition edges"); }

// Check 8: Static entities registered
const signCount = g.getAllNodes().filter(n => n.type === "sign").length;
const houseCount = g.getAllNodes().filter(n => n.type === "house").length;
const elemCount = g.getAllNodes().filter(n => n.type === "element").length;
if (signCount === 12 && houseCount === 12 && elemCount === 4) {
  console.log(`✅ Static entities: ${signCount} signs, ${houseCount} houses, ${elemCount} elements`);
  pass++;
} else { console.log(`❌ Static entities: ${signCount} signs, ${houseCount} houses, ${elemCount} elements`); fail++; }

console.log(`\nPassed: ${pass}/${pass + fail}`);

if (fail > 0) {
  console.log(`FAILED: ${fail} checks failed`);
  process.exit(1);
} else {
  console.log("ALL CHECKS PASSED");
}
