import { loadGraph, validateGraph } from "../src/atlas/graph/loadGraph";

function main() {
  console.log("Loading graph from content/ ...");
  const graph = loadGraph();

  console.log(`  phases:      ${graph.phases?.length ?? 0}`);
  console.log(`  risks:       ${graph.risks?.length ?? 0}`);
  console.log(`  correctives: ${graph.correctives?.length ?? 0}`);
  console.log(`  warnings:    ${graph.warnings?.length ?? 0}`);
  console.log(`  traditions:  ${graph.traditions?.length ?? 0}`);
  console.log(`  sourceCards: ${graph.sourceCards?.length ?? 0}`);
  console.log(`  edges:       ${graph.edges?.length ?? 0}`);
  console.log();

  console.log("Validating graph...");
  const errors = validateGraph(graph);

  if (errors.length === 0) {
    console.log("✓ All validations passed");
    process.exit(0);
  }

  console.log(`✗ ${errors.length} validation error(s):`);
  for (const err of errors) {
    console.log(`  - ${err}`);
  }
  process.exit(1);
}

main();
