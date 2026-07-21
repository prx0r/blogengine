import type { Node, Edge } from "@xyflow/react";

interface LayoutOptions {
  rankdir?: "TB" | "LR" | "BT" | "RL";
  nodesep?: number;
  ranksep?: number;
}

export async function getDagreLayout(
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions = {}
): Promise<{ nodes: Node[]; edges: Edge[] }> {
  const dagre = await import("dagre");
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));

  const { rankdir = "TB", nodesep = 80, ranksep = 120 } = options;
  g.setGraph({ rankdir, nodesep, ranksep });

  for (const node of nodes) {
    g.setNode(node.id, { width: 220, height: node.data?.phaseNumber ? 160 : 120 });
  }

  for (const edge of edges) {
    g.setEdge(edge.source, edge.target);
  }

  dagre.layout(g);

  const layoutedNodes = nodes.map((node) => {
    const dagreNode = g.node(node.id);
    if (!dagreNode) return node;

    return {
      ...node,
      position: {
        x: dagreNode.x - (dagreNode.width ?? 220) / 2,
        y: dagreNode.y - (dagreNode.height ?? 120) / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}
