/** Check practice node data for per-practice differentiation */
import { getGraph } from "../src/astrology/knowledge_graph";
import { registerSpellbookInGraph } from "../src/astrology/spellbook/spellbook";

const g = getGraph();
registerSpellbookInGraph();

const allNodes = g.getAllNodes();
for (const node of allNodes) {
  if (!node.id.startsWith("spell:") && !node.id.startsWith("picatrix:") && !node.id.startsWith("pgm:")) continue;
  const edges = g.getEdges(node.id);
  const pf = edges.find(e => e.predicate === "practice_for");
  if (pf?.object === "planet:saturn" || pf?.object === "planet:jupiter") {
    console.log(`\n${node.id} [${pf.object}]`);
    console.log(`  label: ${node.label}`);
    console.log(`  type: ${node.type}`);
    console.log(`  data:`, JSON.stringify(node.data));
  }
}
