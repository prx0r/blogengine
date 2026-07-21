import { loadGraph } from "./loadGraph";
import type { Graph, Risk, Corrective, Warning, EvidenceTier } from "./schema";

export interface PhaseCacheEntry {
  id: string;
  label: string;
  phaseNumber: number;
  summary: string;
  stream?: string;
  evidenceTier?: EvidenceTier;
  entryAssumption: string;
  proofMove: string;
  replacementModel: string;
  practiceMove: string;
  successMarker: string;
  failureMode: string;
  risks: { id: string; label: string; statement: string }[];
  correctives: { id: string; label: string; statement: string; practice?: string }[];
  warnings: string[];
}

let cache: Map<string, PhaseCacheEntry> | null = null;
let graphCache: Graph | null = null;

function buildRiskMap(risks: Risk[]): Map<string, Risk> {
  const m = new Map<string, Risk>();
  for (const r of risks) m.set(r.id, r);
  return m;
}

function buildCorrectiveMap(correctives: Corrective[]): Map<string, Corrective> {
  const m = new Map<string, Corrective>();
  for (const c of correctives) m.set(c.id, c);
  return m;
}

function getLinkedRisks(
  phaseId: string,
  edges: { source: string; target: string; kind: string }[],
  riskMap: Map<string, Risk>
): { id: string; label: string; statement: string }[] {
  const riskIds = edges
    .filter((e) => e.source === phaseId && e.kind === "risks")
    .map((e) => e.target);
  return riskIds
    .map((id) => {
      const r = riskMap.get(id);
      return r ? { id: r.id, label: r.label, statement: r.statement } : null;
    })
    .filter(Boolean) as { id: string; label: string; statement: string }[];
}

function getLinkedCorrectives(
  phaseId: string,
  edges: { source: string; target: string; kind: string }[],
  riskMap: Map<string, Risk>,
  correctiveMap: Map<string, Corrective>
): { id: string; label: string; statement: string; practice?: string }[] {
  // Find risks linked to this phase
  const riskIds = edges
    .filter((e) => e.source === phaseId && e.kind === "risks")
    .map((e) => e.target);

  // Find correctives that correct those risks
  const correctiveIds = new Set<string>();
  for (const riskId of riskIds) {
    for (const edge of edges) {
      if (edge.source === riskId && edge.kind === "corrects") {
        correctiveIds.add(edge.target);
      }
    }
  }

  return Array.from(correctiveIds)
    .map((id) => {
      const c = correctiveMap.get(id);
      return c
        ? { id: c.id, label: c.label, statement: c.statement, practice: c.practice }
        : null;
    })
    .filter(Boolean) as { id: string; label: string; statement: string; practice?: string }[];
}

export function getPhaseCache(): Map<string, PhaseCacheEntry> {
  if (cache) return cache;

  const graph = loadGraph();
  graphCache = graph;
  cache = new Map();

  const riskMap = buildRiskMap(graph.risks ?? []);
  const correctiveMap = buildCorrectiveMap(graph.correctives ?? []);
  const edges = (graph.edges ?? []) as { source: string; target: string; kind: string }[];
  const warnings = (graph.warnings ?? []).map((w: Warning) => w.statement);

  for (const phase of graph.phases ?? []) {
    const entry: PhaseCacheEntry = {
      id: phase.id,
      label: phase.label,
      phaseNumber: phase.phaseNumber,
      summary: phase.summary ?? "",
      stream: phase.stream,
      evidenceTier: phase.evidenceTier,
      entryAssumption: phase.entryAssumption,
      proofMove: phase.proofMove,
      replacementModel: phase.replacementModel,
      practiceMove: phase.practiceMove,
      successMarker: phase.successMarker,
      failureMode: phase.failureMode,
      risks: getLinkedRisks(phase.id, edges, riskMap),
      correctives: getLinkedCorrectives(phase.id, edges, riskMap, correctiveMap),
      warnings: warnings.slice(0, 3),
    };
    cache.set(phase.id, entry);
  }

  return cache;
}

export function getCachedGraph(): Graph {
  if (graphCache) return graphCache;
  getPhaseCache();
  return graphCache!;
}

export function getPhaseByLabel(label: string): PhaseCacheEntry | undefined {
  const c = getPhaseCache();
  const lower = label.toLowerCase();
  for (const entry of c.values()) {
    if (entry.label.toLowerCase().includes(lower) || lower.includes(entry.label.toLowerCase())) {
      return entry;
    }
  }
  return undefined;
}

export function searchPhases(query: string): PhaseCacheEntry[] {
  const c = getPhaseCache();
  const terms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 3);
  if (terms.length === 0) return [];

  const scored = Array.from(c.values()).map((entry) => {
    let score = 0;
    const text = `${entry.label} ${entry.summary} ${entry.stream ?? ""}`.toLowerCase();
    for (const t of terms) {
      const count = (text.match(new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length;
      score += count * (entry.label.toLowerCase().includes(t) ? 5 : 1);
    }
    return { entry, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((s) => s.entry);
}
