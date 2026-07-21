"use client";

import {
  BaseEdge,
  getBezierPath,
  type EdgeProps,
  type Edge,
} from "@xyflow/react";
import type { ReRenderingEdgeData } from "@/atlas/graph/schema";

export type TypedEdgeType = Edge<ReRenderingEdgeData>;

const EDGE_COLORS: Record<string, string> = {
  historical_influence: "#a78bfa",
  reception: "#818cf8",
  translation_transmission: "#6366f1",
  conceptual_parallel: "#f472b6",
  grounds: "#34d399",
  breaks_assumption: "#f87171",
  replaces_with: "#60a5fa",
  enables_practice: "#4ade80",
  risks: "#fb923c",
  corrects: "#22d3ee",
  incarnates_as: "#a78bfa",
  evidenced_by: "#94a3b8",
  contained_in: "#64748b",
  bridges: "#38bdf8",
  pressure_tests: "#c084fc",
  category_error_warning: "#facc15",
  maps_to_phase: "#818cf8",
  maps_to_risk: "#fb923c",
  maps_to_practice: "#4ade80",
};

export function TypedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps<TypedEdgeType>) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const color = data?.kind ? EDGE_COLORS[data.kind] : "#64748b";
  const strokeWidth = selected ? 2.5 : 1.5;
  const dashArray = data?.kind === "category_error_warning" ? "6 3" : data?.kind === "conceptual_parallel" ? "4 4" : undefined;

  return (
    <g>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: color,
          strokeWidth,
          strokeDasharray: dashArray,
          opacity: selected ? 1 : 0.6,
        }}
      />
      {data?.label && (
        <text>
          <textPath
            href={`#${id}`}
            startOffset="50%"
            textAnchor="middle"
            className="text-[9px] fill-zinc-500"
            style={{ dominantBaseline: "central" }}
          >
            {data.label}
          </textPath>
        </text>
      )}
    </g>
  );
}
