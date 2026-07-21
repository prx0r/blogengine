import type { Graph, GraphPacket, SourceCard, Risk, Corrective, NodeKind } from "./schema";
import { loadGraph } from "./loadGraph";

export interface PacketOptions {
  claim: string;
  mode?: "atlas" | "guide";
  phaseHint?: string;
  riskHints?: string[];
  maxSourceCards?: number;
  maxRisks?: number;
  maxCorrectives?: number;
}

export function buildGraphPacket(
  graph: Graph,
  options: PacketOptions
): GraphPacket {
  const {
    claim,
    mode = "atlas",
    phaseHint,
    riskHints = [],
    maxSourceCards = 3,
    maxRisks = 3,
    maxCorrectives = 3,
  } = options;

  // Resolve primary phase (from hint or default to phase 1)
  let primaryPhase: { id: string; label: string; phaseNumber: number } | undefined;

  if (phaseHint) {
    const matched = graph.phases?.find(
      (p) =>
        p.id === phaseHint ||
        p.label.toLowerCase().includes(phaseHint.toLowerCase())
    );
    if (matched) {
      primaryPhase = {
        id: matched.id,
        label: matched.label,
        phaseNumber: matched.phaseNumber,
      };
    }
  }

  if (!primaryPhase && graph.phases && graph.phases.length > 0) {
    primaryPhase = {
      id: graph.phases[0].id,
      label: graph.phases[0].label,
      phaseNumber: graph.phases[0].phaseNumber,
    };
  }

  // Collect assumptions from the graph
  const assumptions: string[] =
    graph.phases?.map((p) => p.entryAssumption).slice(0, 3) ?? [];

  // Build graph path from edges
  const graphPath: { nodeId: string; label: string; kind: NodeKind }[] = [];
  const visited = new Set<string>();

  if (primaryPhase) {
    graphPath.push({
      nodeId: primaryPhase.id,
      label: primaryPhase.label,
      kind: "phase" as NodeKind,
    });
    visited.add(primaryPhase.id);
  }

  for (const edge of graph.edges ?? []) {
    if (!visited.has(edge.target)) {
      const targetNode = findNodeByLabel(graph, edge.target);
      if (targetNode) {
        graphPath.push({
          nodeId: targetNode.id,
          label: targetNode.label,
          kind: targetNode.kind,
        });
        visited.add(edge.target);
      }
    }
    if (graphPath.length >= 6) break;
  }

  // Collect source cards
  const sourceCards: SourceCard[] = [];
  if (primaryPhase) {
    const phaseEdges = graph.edges?.filter(
      (e) => e.target === primaryPhase.id && e.kind === "evidenced_by"
    ) ?? [];
    for (const edge of phaseEdges) {
      const card = graph.sourceCards?.find((s) => s.id === edge.source);
      if (card) {
        sourceCards.push(card);
        if (sourceCards.length >= maxSourceCards) break;
      }
    }
  }

  // Collect risks (matching hints or first available)
  const risks: { id: string; label: string; causedBy?: string[] }[] = [];
  for (const hint of riskHints) {
    const matched = graph.risks?.find(
      (r) =>
        r.id === hint || r.label.toLowerCase().includes(hint.toLowerCase())
    );
    if (matched) {
      risks.push({
        id: matched.id,
        label: matched.label,
        causedBy: matched.causedBy,
      });
      if (risks.length >= maxRisks) break;
    }
  }
  if (risks.length === 0 && graph.risks) {
    for (const r of graph.risks.slice(0, maxRisks)) {
      risks.push({ id: r.id, label: r.label, causedBy: r.causedBy });
    }
  }

  // Collect correctives (matching first available risks)
  const correctives: { id: string; label: string; practice?: string }[] = [];
  const matchedCorrectiveIds = new Set<string>();
  for (const risk of risks) {
    const correctiveEdges = graph.edges?.filter(
      (e) => e.source === risk.id && e.kind === "corrects"
    ) ?? [];
    for (const edge of correctiveEdges) {
      if (matchedCorrectiveIds.has(edge.target)) continue;
      const matched = graph.correctives?.find((c) => c.id === edge.target);
      if (matched) {
        correctives.push({
          id: matched.id,
          label: matched.label,
          practice: matched.practice,
        });
        matchedCorrectiveIds.add(edge.target);
        if (correctives.length >= maxCorrectives) break;
      }
    }
    if (correctives.length >= maxCorrectives) break;
  }
  if (correctives.length === 0 && graph.correctives) {
    for (const c of graph.correctives.slice(0, maxCorrectives)) {
      correctives.push({ id: c.id, label: c.label, practice: c.practice });
    }
  }

  // Collect category warnings
  const categoryWarnings: string[] =
    graph.warnings?.map((w) => w.statement).slice(0, 3) ?? [];

  // Determine evidence tier
  const evidenceTier = primaryPhase
    ? graph.phases?.find((p) => p.id === primaryPhase.id)?.evidenceTier
    : undefined;

  return {
    userClaim: claim,
    mode,
    primaryPhase,
    assumptions,
    demolition:
      graph.phases?.find((p) => p.id === primaryPhase?.id)?.proofMove,
    replacementModel:
      graph.phases?.find((p) => p.id === primaryPhase?.id)?.replacementModel,
    graphPath,
    sourceCards,
    risks,
    correctives,
    evidenceTier,
    categoryWarnings,
    suggestedPractice:
      graph.phases?.find((p) => p.id === primaryPhase?.id)?.practiceMove,
  };
}

function findNodeByLabel(
  graph: Graph,
  idOrLabel: string
): { id: string; label: string; kind: NodeKind } | null {
  const allNodes: { id: string; label: string; kind: NodeKind }[] = [
    ...(graph.phases?.map((p) => ({ id: p.id, label: p.label, kind: "phase" as NodeKind })) ?? []),
    ...(graph.risks?.map((r) => ({ id: r.id, label: r.label, kind: "risk" as NodeKind })) ?? []),
    ...(graph.correctives?.map((c) => ({ id: c.id, label: c.label, kind: "corrective" as NodeKind })) ?? []),
    ...(graph.warnings?.map((w) => ({ id: w.id, label: w.label, kind: "warning" as NodeKind })) ?? []),
    ...(graph.traditions?.map((t) => ({ id: t.id, label: t.label, kind: "tradition" as NodeKind })) ?? []),
    ...(graph.sourceCards?.map((s) => ({ id: s.id, label: s.title, kind: "source_card" as NodeKind })) ?? []),
  ];

  return allNodes.find((n) => n.id === idOrLabel || n.label === idOrLabel) ?? null;
}

export { loadGraph } from "./loadGraph";
