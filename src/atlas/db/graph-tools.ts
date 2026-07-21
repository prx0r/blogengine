// Graph tool definitions for the agent.
// These are exposed to the LLM as callable tools during chat.
// Each tool has a name, description, parameter schema, and handler.

import type { D1Database } from "@cloudflare/workers-types";
import { findNodes, findEdges, getNode, getNeighborhood, getPath, writeTriple } from "@/db/graph-store";

// ── Tool Definition Schemas ─────────────────────────────────────

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  handler: (db: D1Database, args: Record<string, unknown>) => Promise<unknown>;
}

// ── query_knowledge_graph ───────────────────────────────────────
// Agent calls this to traverse graph relationships.

export const queryKnowledgeGraphTool: ToolDefinition = {
  name: "query_knowledge_graph",
  description: `Query the Atlas knowledge graph. Supports:
- find_nodes: search nodes by kind and/or label
- get_node: fetch a single node by ID  
- get_neighborhood: traverse from a node to connected nodes (depth 1-3)
- find_path: find shortest path between two nodes
- get_edges: find edges by subject, predicate, or object

Use this when you need structured graph context — phase relationships,
risk→corrective chains, source→phase mappings, journal→phase links.`,
  parameters: {
    type: "object",
    properties: {
      operation: {
        type: "string",
        enum: ["find_nodes", "get_node", "get_neighborhood", "find_path", "get_edges"],
        description: "Which graph operation to run",
      },
      kind: {
        type: "string",
        description: "Node kind filter (phase, risk, corrective, warning, tradition, source_card, concept)",
      },
      label: {
        type: "string",
        description: "Search nodes by label (partial match)",
      },
      nodeId: {
        type: "string",
        description: "Node ID for get_node, get_neighborhood",
      },
      fromId: {
        type: "string",
        description: "Start node ID for find_path",
      },
      toId: {
        type: "string",
        description: "End node ID for find_path",
      },
      depth: {
        type: "number",
        description: "Traversal depth for get_neighborhood (1-3, default 1)",
      },
      predicate: {
        type: "string",
        description: "Edge predicate filter (bridges, corrects, has_risk, evidenced_by, etc.)",
      },
    },
    required: ["operation"],
  },
  handler: async (db, args) => {
    const op = args.operation as string;

    switch (op) {
      case "find_nodes": {
        const kind = args.kind as string | undefined;
        const label = args.label as string | undefined;
        const nodes = await findNodes(db, kind, label, 50);
        return nodes.map(n => ({
          id: n.id,
          kind: n.kind,
          label: n.label,
          properties: n.properties,
        }));
      }

      case "get_node": {
        const nodeId = args.nodeId as string;
        if (!nodeId) return { error: "nodeId is required" };
        const node = await getNode(db, nodeId);
        if (!node) return { error: `Node not found: ${nodeId}` };
        return {
          id: node.id,
          kind: node.kind,
          label: node.label,
          properties: node.properties,
        };
      }

      case "get_neighborhood": {
        const nodeId = args.nodeId as string;
        if (!nodeId) return { error: "nodeId is required" };
        const depth = Math.min(3, Math.max(1, (args.depth as number) || 1));
        const result = await getNeighborhood(db, nodeId, depth);
        return {
          centerNodeId: nodeId,
          depth,
          nodes: result.nodes.map(n => ({
            id: n.id, kind: n.kind, label: n.label,
          })),
          edges: result.edges.map(e => ({
            subjectId: e.subjectId,
            predicate: e.predicate,
            objectId: e.objectId,
          })),
        };
      }

      case "find_path": {
        const fromId = args.fromId as string;
        const toId = args.toId as string;
        if (!fromId || !toId) return { error: "fromId and toId are required" };
        const path = await getPath(db, fromId, toId);
        if (!path) return { error: "No path found" };
        return {
          path: path.map(n => ({
            id: n.id, kind: n.kind, label: n.label,
          })),
        };
      }

      case "get_edges": {
        const predicate = args.predicate as string | undefined;
        const subjectId = args.nodeId as string | undefined;
        const edges = await findEdges(db, { predicate, subjectId }, 50);
        return edges.map(e => ({
          subjectId: e.subjectId,
          predicate: e.predicate,
          objectId: e.objectId,
          properties: e.properties,
        }));
      }

      default:
        return { error: `Unknown operation: ${op}` };
    }
  },
};

// ── write_to_graph ──────────────────────────────────────────────
// Agent calls this to store durable facts it discovers.

export const writeToGraphTool: ToolDefinition = {
  name: "write_to_graph",
  description: `Store a durable fact in the knowledge graph as a triple (subject, predicate, object).
Call this when the agent learns something permanent about the user or their practice.

Examples:
- User prefers LBRP over Middle Pillar → ("user-abc", "prefers", "lbrp-over-middle-pillar")
- User journaled about Phase 12 today → ("entry-456", "maps_to", "phase-12-ritual-re-rendering")
- Discovery: daimon insights often follow ritual → ("phase-12", "bridges_to", "phase-13")

The metadata field is optional — use it for dates, confidence scores, or context.`,
  parameters: {
    type: "object",
    properties: {
      subject: {
        type: "string",
        description: "Entity ID or label (the subject of the triple)",
      },
      predicate: {
        type: "string",
        description: "Relationship type (prefers, maps_to, bridges_to, engages, relates_to)",
      },
      object: {
        type: "string",
        description: "Entity ID or label (the object of the triple)",
      },
      metadata: {
        type: "object",
        description: "Optional properties: date, confidence, context",
      },
    },
    required: ["subject", "predicate", "object"],
  },
  handler: async (db, args) => {
    const subject = args.subject as string;
    const predicate = args.predicate as string;
    const object = args.object as string;
    const metadata = args.metadata as Record<string, unknown> | undefined;

    await writeTriple(db, subject, predicate, object, {
      ...(metadata || {}),
      source: "agent",
      writtenAt: new Date().toISOString(),
    });

    return {
      success: true,
      triple: { subject, predicate, object },
    };
  },
};

// ── Tool registry ───────────────────────────────────────────────

export const ALL_TOOLS: ToolDefinition[] = [
  queryKnowledgeGraphTool,
  writeToGraphTool,
];

export function getTool(name: string): ToolDefinition | undefined {
  return ALL_TOOLS.find((t) => t.name === name);
}

export function getToolDescriptions(): string {
  return ALL_TOOLS.map(
    (t) => `- ${t.name}: ${t.description}`
  ).join("\n");
}

// ── OpenAI-compatible tool format ───────────────────────────────

export interface OpenAITool {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export function getOpenAITools(): OpenAITool[] {
  return ALL_TOOLS.map((t) => ({
    type: "function" as const,
    function: {
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    },
  }));
}

// ── Tool execution from OpenAI tool_call format ─────────────────

export interface OpenAIToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
}

export async function executeToolCall(
  db: D1Database,
  toolCall: OpenAIToolCall
): Promise<{ role: string; tool_call_id: string; content: string }> {
  const tool = getTool(toolCall.function.name);
  if (!tool) {
    return {
      role: "tool",
      tool_call_id: toolCall.id,
      content: JSON.stringify({ error: `Unknown tool: ${toolCall.function.name}` }),
    };
  }

  try {
    const args = JSON.parse(toolCall.function.arguments);
    const result = await tool.handler(db, args);
    return {
      role: "tool",
      tool_call_id: toolCall.id,
      content: JSON.stringify(result),
    };
  } catch (err) {
    return {
      role: "tool",
      tool_call_id: toolCall.id,
      content: JSON.stringify({
        error: err instanceof Error ? err.message : "Tool execution failed",
      }),
    };
  }
}
