import { NextRequest, NextResponse } from "next/server";
import { getGraph } from "@/astrology/knowledge_graph";
import { registerSpellbookInGraph } from "@/astrology/spellbook/spellbook";
import { registerSourceRulesInGraph, registerPlanetProfilesInGraph } from "@/astrology/knowledge_graph";

let initialized = false;

function ensureGraph() {
  if (!initialized) {
    const g = getGraph();
    registerSpellbookInGraph();
    registerSourceRulesInGraph();
    registerPlanetProfilesInGraph();
    initialized = true;
  }
  return getGraph();
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const planet = searchParams.get("planet");
    const type = searchParams.get("type");

    const graph = ensureGraph();

    if (id) {
      const result = graph.traverse(id);
      return NextResponse.json({ id, nodes: result.nodes, edges: result.edges });
    }

    if (planet) {
      const result = graph.clusterByPlanet(planet);
      return NextResponse.json({ planet, nodes: result.nodes, edges: result.edges });
    }

    if (type === "all") {
      const nodes = graph.getAllNodes();
      const layers = graph.getLayers();
      return NextResponse.json({ nodeCount: nodes.length, layers, nodes });
    }

    if (type === "layers") {
      return NextResponse.json({ layers: graph.getLayers() });
    }

    if (type === "correspondences" && planet) {
      const edges = graph.getCorrespondences(planet);
      return NextResponse.json({ planet, correspondences: edges.map(e => ({ id: e.object, predicate: e.predicate, data: e.data })) });
    }

    return NextResponse.json({ error: "Specify ?id=, ?planet=, or ?type=all" }, { status: 400 });
  } catch (error) {
    console.error("Astrology graph error:", error);
    return NextResponse.json({ error: "Failed to query graph" }, { status: 500 });
  }
}
