import {
  graphSchema,
  type Graph,
} from "./schema";
import { GRAPH_DATA as FALLBACK_GRAPH } from "./generated-data";

let fs: any = null;
let path: any = null;
let yaml: any = null;

try {
  fs = require("fs");
  path = require("path");
  yaml = require("js-yaml");
} catch {
  // Running in browser/worker — no fs available
}

function loadYaml<T>(filename: string): T | null {
  if (!fs || !path || !yaml) return null;
  try {
    const filePath = path.resolve(process.cwd(), "content", filename);
    const raw = fs.readFileSync(filePath, "utf-8");
    return yaml.load(raw) as T;
  } catch {
    return null;
  }
}

export function loadGraph(): Graph {
  if (fs && path && yaml) {
    const data: Graph = {};

    const phases = loadYaml<any[]>("phases.yaml");
    if (phases) data.phases = phases as any;

    const assumptions = loadYaml<any[]>("assumptions.yaml");
    if (assumptions) data.assumptions = assumptions as any;

    const risks = loadYaml<any[]>("risks.yaml");
    if (risks) data.risks = risks as any;

    const correctives = loadYaml<any[]>("correctives.yaml");
    if (correctives) data.correctives = correctives as any;

    const warnings = loadYaml<any[]>("warnings.yaml");
    if (warnings) data.warnings = warnings as any;

    const traditions = loadYaml<any[]>("traditions.yaml");
    if (traditions) data.traditions = traditions as any;

    const sourceCards = loadYaml<any[]>("sourceCards.yaml");
    if (sourceCards) data.sourceCards = sourceCards as any;

    const edges = loadYaml<any[]>("edges.yaml");
    if (edges) data.edges = edges as any;

    if (data.phases && data.phases.length > 0) return data;
  }

  return { ...FALLBACK_GRAPH };
}

export function validateGraph(graph: Graph): string[] {
  const errors: string[] = [];
  const result = graphSchema.safeParse(graph);

  if (!result.success) {
    for (const issue of result.error.issues) {
      errors.push(`${issue.path.join(".")}: ${issue.message}`);
    }
  }

  const ids = new Set<string>();
  for (const p of graph.phases ?? []) ids.add(p.id);
  for (const r of graph.risks ?? []) ids.add(r.id);
  for (const c of graph.correctives ?? []) ids.add(c.id);
  for (const w of graph.warnings ?? []) ids.add(w.id);
  for (const t of graph.traditions ?? []) ids.add(t.id);
  for (const s of graph.sourceCards ?? []) ids.add(s.id);

  for (const edge of graph.edges ?? []) {
    if (!ids.has(edge.source)) {
      errors.push(`Edge ${edge.id}: source '${edge.source}' not found in any node`);
    }
    if (!ids.has(edge.target)) {
      errors.push(`Edge ${edge.id}: target '${edge.target}' not found in any node`);
    }
  }

  return errors;
}
