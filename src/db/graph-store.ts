// D1-backed graph store — Kuzu-compatible abstraction for Cloudflare Workers
// Provides Cypher-like graph traversal over D1 graph_nodes + graph_edges tables.
// In local dev, could swap to native Kuzu. On Workers, uses D1.

import type { D1Database } from "@cloudflare/workers-types";

// ── Types ───────────────────────────────────────────────────────

export interface GraphNode {
  id: string;
  kind: string;
  label: string | null;
  properties: Record<string, unknown>;
  createdAt: string;
}

export interface GraphEdge {
  id: string;
  subjectId: string;
  predicate: string;
  objectId: string;
  properties: Record<string, unknown>;
  createdAt: string;
}

export interface GraphQueryResult {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// ── Schema Init ─────────────────────────────────────────────────

export async function ensureGraphTables(db: D1Database): Promise<void> {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS graph_nodes (
      id TEXT PRIMARY KEY,
      kind TEXT NOT NULL,
      label TEXT,
      properties JSON NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_graph_nodes_kind ON graph_nodes(kind);

    CREATE TABLE IF NOT EXISTS graph_edges (
      id TEXT PRIMARY KEY,
      subject_id TEXT NOT NULL REFERENCES graph_nodes(id) ON DELETE CASCADE,
      predicate TEXT NOT NULL,
      object_id TEXT NOT NULL REFERENCES graph_nodes(id) ON DELETE CASCADE,
      properties JSON NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_graph_edges_subject ON graph_edges(subject_id);
    CREATE INDEX IF NOT EXISTS idx_graph_edges_predicate ON graph_edges(predicate);
    CREATE INDEX IF NOT EXISTS idx_graph_edges_object ON graph_edges(object_id);
  `);
}

// ── Node CRUD ───────────────────────────────────────────────────

export async function createNode(
  db: D1Database,
  id: string,
  kind: string,
  label?: string,
  properties?: Record<string, unknown>
): Promise<GraphNode> {
  const node: GraphNode = {
    id,
    kind,
    label: label || null,
    properties: properties || {},
    createdAt: new Date().toISOString(),
  };
  await db.prepare(
    "INSERT OR REPLACE INTO graph_nodes (id, kind, label, properties, created_at) VALUES (?, ?, ?, ?, ?)"
  ).bind(node.id, node.kind, node.label, JSON.stringify(node.properties), node.createdAt).run();
  return node;
}

export async function getNode(db: D1Database, id: string): Promise<GraphNode | null> {
  const row = await db.prepare("SELECT * FROM graph_nodes WHERE id = ?").bind(id).first<Record<string, unknown>>();
  if (!row) return null;
  return rowToNode(row);
}

export async function findNodes(
  db: D1Database,
  kind?: string,
  label?: string,
  limit = 100
): Promise<GraphNode[]> {
  let query = "SELECT * FROM graph_nodes WHERE 1=1";
  const params: unknown[] = [];
  if (kind) { query += " AND kind = ?"; params.push(kind); }
  if (label) { query += " AND label LIKE ?"; params.push(`%${label}%`); }
  query += " ORDER BY created_at DESC LIMIT ?";
  params.push(limit);
  const rows = await db.prepare(query).bind(...params).all<Record<string, unknown>>();
  return (rows.results || []).map(rowToNode);
}

// ── Edge CRUD ───────────────────────────────────────────────────

export async function createEdge(
  db: D1Database,
  subjectId: string,
  predicate: string,
  objectId: string,
  properties?: Record<string, unknown>
): Promise<GraphEdge> {
  const id = `${subjectId}--${predicate}--${objectId}--${Date.now()}`;
  const edge: GraphEdge = {
    id,
    subjectId,
    predicate,
    objectId,
    properties: properties || {},
    createdAt: new Date().toISOString(),
  };
  await db.prepare(
    "INSERT OR REPLACE INTO graph_edges (id, subject_id, predicate, object_id, properties, created_at) VALUES (?, ?, ?, ?, ?, ?)"
  ).bind(edge.id, edge.subjectId, edge.predicate, edge.objectId, JSON.stringify(edge.properties), edge.createdAt).run();
  return edge;
}

export async function findEdges(
  db: D1Database,
  opts: { subjectId?: string; predicate?: string; objectId?: string },
  limit = 100
): Promise<GraphEdge[]> {
  let query = "SELECT * FROM graph_edges WHERE 1=1";
  const params: unknown[] = [];
  if (opts.subjectId) { query += " AND subject_id = ?"; params.push(opts.subjectId); }
  if (opts.predicate) { query += " AND predicate = ?"; params.push(opts.predicate); }
  if (opts.objectId) { query += " AND object_id = ?"; params.push(opts.objectId); }
  query += " ORDER BY created_at DESC LIMIT ?";
  params.push(limit);
  const rows = await db.prepare(query).bind(...params).all<Record<string, unknown>>();
  return (rows.results || []).map(rowToEdge);
}

export async function deleteEdges(db: D1Database, subjectId: string, predicate?: string): Promise<void> {
  let query = "DELETE FROM graph_edges WHERE subject_id = ?";
  const params: unknown[] = [subjectId];
  if (predicate) { query += " AND predicate = ?"; params.push(predicate); }
  await db.prepare(query).bind(...params).run();
}

// ── Graph Queries ───────────────────────────────────────────────

export async function getNeighborhood(
  db: D1Database,
  nodeId: string,
  depth = 1,
  direction: "outgoing" | "incoming" | "both" = "both"
): Promise<GraphQueryResult> {
  const nodesMap = new Map<string, GraphNode>();
  const edgesSet = new Set<string>();
  const visited = new Set<string>();
  let currentLevel = [nodeId];

  for (let d = 0; d < depth && currentLevel.length > 0; d++) {
    const nextLevel: string[] = [];

    for (const nid of currentLevel) {
      if (visited.has(nid)) continue;
      visited.add(nid);

      const node = await getNode(db, nid);
      if (node) nodesMap.set(nid, node);

      if (direction === "outgoing" || direction === "both") {
        const outEdges = await findEdges(db, { subjectId: nid });
        for (const e of outEdges) {
          edgesSet.add(e.id);
          if (!visited.has(e.objectId)) nextLevel.push(e.objectId);
        }
      }
      if (direction === "incoming" || direction === "both") {
        const inEdges = await findEdges(db, { objectId: nid });
        for (const e of inEdges) {
          edgesSet.add(e.id);
          if (!visited.has(e.subjectId)) nextLevel.push(e.subjectId);
        }
      }
    }
    currentLevel = nextLevel;
  }

  return {
    nodes: Array.from(nodesMap.values()),
    edges: Array.from(edgesSet).map(id => edgesMap.get(id)!).filter(Boolean),
  };
}

// Track edges from previous operations for getNeighborhood
const edgesMap = new Map<string, GraphEdge>();

export async function getPath(
  db: D1Database,
  fromId: string,
  toId: string,
  maxDepth = 5
): Promise<GraphNode[] | null> {
  if (fromId === toId) {
    const node = await getNode(db, fromId);
    return node ? [node] : null;
  }

  const visited = new Set<string>();
  const queue: { nodeId: string; path: GraphNode[] }[] = [{ nodeId: fromId, path: [] }];

  while (queue.length > 0) {
    const { nodeId, path } = queue.shift()!;
    if (visited.has(nodeId)) continue;
    visited.add(nodeId);

    const node = await getNode(db, nodeId);
    if (!node) continue;
    const newPath = [...path, node];

    if (nodeId === toId) return newPath;
    if (newPath.length > maxDepth) continue;

    const edges = await findEdges(db, { subjectId: nodeId });
    for (const e of edges) {
      if (!visited.has(e.objectId)) {
        queue.push({ nodeId: e.objectId, path: newPath });
      }
    }
  }
  return null;
}

export async function writeTriple(
  db: D1Database,
  subject: string,
  predicate: string,
  object: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await createEdge(db, subject, predicate, object, metadata);
}

// ── Helpers ─────────────────────────────────────────────────────

function rowToNode(row: Record<string, unknown>): GraphNode {
  return {
    id: row.id as string,
    kind: row.kind as string,
    label: row.label as string | null,
    properties: parseJSON(row.properties as string),
    createdAt: row.created_at as string,
  };
}

function rowToEdge(row: Record<string, unknown>): GraphEdge {
  const edge: GraphEdge = {
    id: row.id as string,
    subjectId: row.subject_id as string,
    predicate: row.predicate as string,
    objectId: row.object_id as string,
    properties: parseJSON(row.properties as string),
    createdAt: row.created_at as string,
  };
  edgesMap.set(edge.id, edge);
  return edge;
}

function parseJSON(val: string | Record<string, unknown>): Record<string, unknown> {
  if (typeof val === "object") return val as Record<string, unknown>;
  try { return JSON.parse(val || "{}"); } catch { return {}; }
}
