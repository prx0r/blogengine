"use client";

import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import {
  ReactFlow,
  MiniMap,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  MarkerType,
  type Node,
  type Edge,
  type Connection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { PhaseNode } from "@/atlas/nodes/PhaseNode";
import { RiskNode } from "@/atlas/nodes/RiskNode";
import { CorrectiveNode } from "@/atlas/nodes/CorrectiveNode";
import { WarningNode } from "@/atlas/nodes/WarningNode";
import { TypedEdge } from "@/atlas/edges/TypedEdge";
import { getDagreLayout } from "@/atlas/graph/layouts/dagreLayout";
import type { Graph, ReRenderingNodeData, ReRenderingEdgeData, EdgeKind } from "@/atlas/graph/schema";

interface AtlasFlowProps {
  graph: Graph;
  initialPhase?: string;
}

const nodeTypes = {
  phase: PhaseNode,
  risk: RiskNode,
  corrective: CorrectiveNode,
  warning: WarningNode,
  assumption: PhaseNode,
  claim: PhaseNode,
  replacement_model: CorrectiveNode,
  practice: CorrectiveNode,
  incarnation: CorrectiveNode,
  stream: PhaseNode,
  tradition: PhaseNode,
  figure: PhaseNode,
  text: PhaseNode,
  source_card: PhaseNode,
  concept: PhaseNode,
};

const edgeTypes = {
  default: TypedEdge,
};

const EDGE_COLORS: Record<string, string> = {
  historical_influence: "#a78bfa",
  reception: "#818cf8",
  conceptual_parallel: "#f472b6",
  grounds: "#34d399",
  breaks_assumption: "#f87171",
  enables_practice: "#4ade80",
  risks: "#fb923c",
  corrects: "#22d3ee",
  bridges: "#38bdf8",
  evidenced_by: "#94a3b8",
  category_error_warning: "#facc15",
  maps_to_phase: "#818cf8",
  maps_to_risk: "#fb923c",
  maps_to_practice: "#4ade80",
};

function graphToFlow(graph: Graph): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const xOffset = 300;
  const yOffset = 100;

  // Add phase nodes
  for (const phase of graph.phases ?? []) {
    const data: ReRenderingNodeData = {
      id: phase.id,
      label: phase.label,
      kind: "phase",
      phaseNumber: phase.phaseNumber,
      entryAssumption: phase.entryAssumption,
      proofMove: phase.proofMove,
      replacementModel: phase.replacementModel,
      practiceMove: phase.practiceMove,
      successMarker: phase.successMarker,
      failureMode: phase.failureMode,
      nextPhaseLogic: phase.nextPhaseLogic,
      evidenceTier: phase.evidenceTier,
      stream: phase.stream,
      summary: phase.summary,
      pathFunction: phase.pathFunction,
    };

    nodes.push({
      id: phase.id,
      type: "phase",
      position: { x: (phase.phaseNumber - 1) * xOffset, y: 0 },
      data,
    });
  }

  // Add risk nodes
  for (const risk of graph.risks ?? []) {
    const data: ReRenderingNodeData = {
      id: risk.id,
      label: risk.label,
      kind: "risk",
      statement: risk.statement,
    };

    nodes.push({
      id: risk.id,
      type: "risk",
      position: { x: 0, y: yOffset * 3 },
      data,
    });
  }

  // Add corrective nodes
  for (const corrective of graph.correctives ?? []) {
    const data: ReRenderingNodeData = {
      id: corrective.id,
      label: corrective.label,
      kind: "corrective",
      statement: corrective.statement,
      enables: corrective.practice ? [corrective.practice] : [],
    };

    nodes.push({
      id: corrective.id,
      type: "corrective",
      position: { x: 0, y: yOffset * 4 },
      data,
    });
  }

  // Add warning nodes
  for (const warning of graph.warnings ?? []) {
    const data: ReRenderingNodeData = {
      id: warning.id,
      label: warning.label,
      kind: "warning",
      statement: warning.statement,
    };

    nodes.push({
      id: warning.id,
      type: "warning",
      position: { x: 0, y: yOffset * 5 },
      data,
    });
  }

  // Add edges
  for (const edge of graph.edges ?? []) {
    const edgeData: ReRenderingEdgeData = {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      kind: edge.kind,
      label: edge.label,
      strength: edge.strength,
      note: edge.note,
    };

    const color = EDGE_COLORS[edge.kind] ?? "#64748b";

    edges.push({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: "default",
      data: edgeData,
      markerEnd: { type: MarkerType.ArrowClosed, color },
      style: {
        stroke: color,
        strokeWidth: edge.strength ?? 1.5,
        strokeDasharray: edge.kind === "category_error_warning" ? "6 3" : edge.kind === "conceptual_parallel" ? "4 4" : undefined,
      },
      animated: edge.kind === "bridges",
    });
  }

  return { nodes, edges };
}

const edgeKindLabels: Record<string, string> = {
  historical_influence: "Historical Influence",
  reception: "Reception",
  translation_transmission: "Translation / Transmission",
  conceptual_parallel: "Conceptual Parallel",
  grounds: "Grounds",
  breaks_assumption: "Breaks Assumption",
  replaces_with: "Replaces With",
  enables_practice: "Enables Practice",
  risks: "Risks",
  corrects: "Corrects",
  incarnates_as: "Incarnates As",
  evidenced_by: "Evidenced By",
  bridges: "Bridges",
  pressure_tests: "Pressure Tests",
  category_error_warning: "⚠ Category Error",
  maps_to_phase: "Maps to Phase",
  maps_to_risk: "Maps to Risk",
  maps_to_practice: "Maps to Practice",
};

type FilterMode = "all" | "phases" | "risks" | "correctives";

export function AtlasFlow({ graph, initialPhase }: AtlasFlowProps) {
  const rawNodesAndEdges = useMemo(() => graphToFlow(graph), [graph]);
  const [nodes, setNodes, onNodesChange] = useNodesState(rawNodesAndEdges.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(rawNodesAndEdges.edges);
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [evidenceFilter, setEvidenceFilter] = useState<string>("all");
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [layoutReady, setLayoutReady] = useState(false);
  const initialized = useRef(false);
  const reactFlowRef = useRef<HTMLDivElement>(null);

  // Apply layout on mount
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    async function layout() {
      const result = await getDagreLayout(rawNodesAndEdges.nodes, rawNodesAndEdges.edges, {
        rankdir: "LR",
        nodesep: 100,
        ranksep: 140,
      });
      setNodes(result.nodes);
      setEdges(result.edges);
      setLayoutReady(true);
    }
    layout();
  }, [rawNodesAndEdges, setNodes, setEdges]);

  // Filter nodes
  useEffect(() => {
    let filteredNodes = rawNodesAndEdges.nodes;
    let filteredEdges = rawNodesAndEdges.edges;

    if (filterMode === "phases") {
      const phaseIds = new Set(graph.phases?.map((p) => p.id) ?? []);
      filteredNodes = filteredNodes.filter((n) => phaseIds.has(n.id));
      filteredEdges = filteredEdges.filter((e) => phaseIds.has(e.source) && phaseIds.has(e.target));
    } else if (filterMode === "risks") {
      const riskIds = new Set(graph.risks?.map((r) => r.id) ?? []);
      filteredNodes = filteredNodes.filter((n) => riskIds.has(n.id) || n.type === "corrective");
      filteredEdges = filteredEdges.filter((e) => (riskIds.has(e.source) || riskIds.has(e.target)));
    } else if (filterMode === "correctives") {
      const correctiveIds = new Set(graph.correctives?.map((c) => c.id) ?? []);
      filteredNodes = filteredNodes.filter((n) => correctiveIds.has(n.id) || n.type === "risk");
      filteredEdges = filteredEdges.filter((e) => (correctiveIds.has(e.source) || correctiveIds.has(e.target)));
    }

    if (evidenceFilter !== "all") {
      filteredNodes = filteredNodes.filter((n) => {
        const d = n.data as ReRenderingNodeData;
        return !d.evidenceTier || d.evidenceTier === evidenceFilter;
      });
    }

    // Re-apply layout for filtered
    getDagreLayout(filteredNodes, filteredEdges, { rankdir: "LR", nodesep: 80, ranksep: 120 }).then(
      (result) => {
        setNodes(result.nodes);
        setEdges(result.edges);
      }
    );
  }, [filterMode, evidenceFilter, graph, rawNodesAndEdges, setNodes, setEdges]);

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const evidenceTiers = useMemo(() => {
    const tiers = new Set<string>();
    for (const p of graph.phases ?? []) {
      if (p.evidenceTier) tiers.add(p.evidenceTier);
    }
    return ["all", ...Array.from(tiers).sort()];
  }, [graph]);

  return (
    <div className="relative w-full h-full">
      {/* Top toolbar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1 bg-zinc-900/90 backdrop-blur-sm rounded-lg border border-zinc-800 p-1">
          {(["all", "phases", "risks", "correctives"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-medium rounded transition-colors ${
                filterMode === mode
                  ? "bg-violet-600 text-white"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {mode === "all" ? "All" : mode}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 bg-zinc-900/90 backdrop-blur-sm rounded-lg border border-zinc-800 p-1">
          <select
            value={evidenceFilter}
            onChange={(e) => setEvidenceFilter(e.target.value)}
            className="bg-transparent text-[10px] text-zinc-400 uppercase tracking-wider border-none outline-none cursor-pointer"
          >
            {evidenceTiers.map((tier) => (
              <option key={tier} value={tier} className="bg-zinc-900">
                {tier === "all" ? "All Tiers" : tier.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* React Flow canvas */}
      <div ref={reactFlowRef} className="w-full h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          minZoom={0.2}
          maxZoom={2}
          colorMode="dark"
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#1a1a2e" gap={20} size={1} />
          <Controls className="!bg-zinc-900 !border-zinc-800 !text-zinc-400 [&_button]:!border-zinc-700 [&_button]:!text-zinc-400 [&_button:hover]:!bg-zinc-800" />
          <MiniMap
            className="!bg-zinc-900 !border-zinc-800"
            nodeColor={(n: { type?: string }) => {
              if (n.type === "risk") return "#7f1d1d";
              if (n.type === "corrective") return "#065f46";
              if (n.type === "warning") return "#713f12";
              return "#1e1b4b";
            }}
            maskColor="rgba(0,0,0,0.6)"
          />
        </ReactFlow>
      </div>

      {/* Node detail drawer */}
      {selectedNode && (
        <NodeDrawer node={selectedNode} onClose={() => setSelectedNode(null)} />
      )}
    </div>
  );
}

function NodeDrawer({
  node,
  onClose,
}: {
  node: Node;
  onClose: () => void;
}) {
  const data = node.data as ReRenderingNodeData;

  return (
    <div className="absolute top-3 right-3 bottom-3 w-[360px] z-20 bg-zinc-900/95 backdrop-blur-sm border border-zinc-800 rounded-lg shadow-2xl overflow-y-auto">
      <div className="sticky top-0 bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider font-medium text-violet-400">
          {data.kind?.replace(/_/g, " ")}
        </span>
        <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 text-sm">
          ✕
        </button>
      </div>

      <div className="p-4 space-y-4">
        <h2 className="text-lg font-semibold text-zinc-100">{data.label}</h2>

        {data.phaseNumber && (
          <div>
            <span className="text-[10px] uppercase tracking-wider text-zinc-500">Phase</span>
            <p className="text-sm text-zinc-300 font-mono">{data.phaseNumber}</p>
          </div>
        )}

        {data.entryAssumption && (
          <div>
            <span className="text-[10px] uppercase tracking-wider text-zinc-500">Entry Assumption</span>
            <p className="text-sm text-zinc-300 italic mt-0.5">"{data.entryAssumption}"</p>
          </div>
        )}

        {data.proofMove && (
          <div>
            <span className="text-[10px] uppercase tracking-wider text-zinc-500">Proof Move</span>
            <p className="text-sm text-zinc-300 mt-0.5">{data.proofMove}</p>
          </div>
        )}

        {data.replacementModel && (
          <div>
            <span className="text-[10px] uppercase tracking-wider text-emerald-500">Replacement Model</span>
            <p className="text-sm text-zinc-300 mt-0.5">{data.replacementModel}</p>
          </div>
        )}

        {data.practiceMove && (
          <div className="bg-amber-950/20 border border-amber-900/30 rounded-lg p-3">
            <span className="text-[10px] uppercase tracking-wider text-amber-500 font-medium">
              Practice
            </span>
            <p className="text-sm text-zinc-300 mt-0.5">{data.practiceMove}</p>
          </div>
        )}

        {data.successMarker && (
          <div>
            <span className="text-[10px] uppercase tracking-wider text-green-500">Success Marker</span>
            <p className="text-sm text-zinc-300 mt-0.5">{data.successMarker}</p>
          </div>
        )}

        {data.failureMode && (
          <div>
            <span className="text-[10px] uppercase tracking-wider text-red-500">Failure Mode</span>
            <p className="text-sm text-zinc-300 mt-0.5">{data.failureMode}</p>
          </div>
        )}

        {data.statement && (
          <div>
            <span className="text-[10px] uppercase tracking-wider text-zinc-500">Statement</span>
            <p className="text-sm text-zinc-300 mt-0.5">{data.statement}</p>
          </div>
        )}

        {data.stream && (
          <div>
            <span className="text-[10px] uppercase tracking-wider text-zinc-500">Stream</span>
            <p className="text-sm text-zinc-300 mt-0.5">{data.stream}</p>
          </div>
        )}

        {data.evidenceTier && (
          <div>
            <span className="text-[10px] uppercase tracking-wider text-zinc-500">Evidence Tier</span>
            <span className="inline-block mt-0.5 text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
              {data.evidenceTier.replace(/_/g, " ")}
            </span>
          </div>
        )}

        {data.cautions && data.cautions.length > 0 && (
          <div className="bg-red-950/20 border border-red-900/30 rounded-lg p-3">
            <span className="text-[10px] uppercase tracking-wider text-red-500 font-medium">
              Cautions
            </span>
            {data.cautions.map((c, i) => (
              <p key={i} className="text-sm text-zinc-300 mt-0.5">• {c}</p>
            ))}
          </div>
        )}

        {data.enables && data.enables.length > 0 && (
          <div>
            <span className="text-[10px] uppercase tracking-wider text-green-500">Enables</span>
            {data.enables.map((e, i) => (
              <p key={i} className="text-sm text-zinc-300 mt-0.5">• {e}</p>
            ))}
          </div>
        )}

        {data.risks && data.risks.length > 0 && (
          <div>
            <span className="text-[10px] uppercase tracking-wider text-red-500">Risks</span>
            {data.risks.map((r, i) => (
              <p key={i} className="text-sm text-zinc-300 mt-0.5">• {r}</p>
            ))}
          </div>
        )}

        {data.corrects && data.corrects.length > 0 && (
          <div>
            <span className="text-[10px] uppercase tracking-wider text-cyan-500">Corrects</span>
            {data.corrects.map((c, i) => (
              <p key={i} className="text-sm text-zinc-300 mt-0.5">• {c}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
