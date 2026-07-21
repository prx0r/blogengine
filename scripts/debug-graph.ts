/** Debug: why does clusterByPlanet return Jupiter practices for all planets? */
import { getGraph, registerSourceRulesInGraph, registerPlanetProfilesInGraph } from "../src/astrology/knowledge_graph";
import { registerSpellbookInGraph } from "../src/astrology/spellbook/spellbook";

const g = getGraph();
registerSpellbookInGraph();
registerSourceRulesInGraph();
registerPlanetProfilesInGraph();

// Check practice_for edges count
const edges = (g as any).edges as Array<{subject:string;predicate:string;object:string}>;
const practiceEdges = edges.filter(e => e.predicate === "practice_for");
console.log(`Total practice_for edges: ${practiceEdges.length}`);

// Group by planet
const byPlanet = new Map<string, number>();
for (const e of practiceEdges) {
  byPlanet.set(e.object, (byPlanet.get(e.object) || 0) + 1);
}
console.log("\nPractices per planet:");
for (const [planet, count] of byPlanet) {
  console.log(`  ${planet}: ${count}`);
}

// Now test each planet's cluster
for (const p of ["sun","moon","mercury","venus","mars","jupiter","saturn"]) {
  const cluster = g.clusterByPlanet(p);
  const pfs = cluster.edges.filter(e => e.predicate === "practice_for");
  console.log(`\n${p}: ${pfs.length} practice_for edges`);
  for (const e of pfs.slice(0,3)) {
    const node = g.getNode(e.subject);
    console.log(`  -> ${e.subject} (label: ${node?.label || 'no label'})`);
  }
}
