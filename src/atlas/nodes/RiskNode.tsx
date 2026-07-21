"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { Node } from "@xyflow/react";
import type { ReRenderingNodeData } from "@/atlas/graph/schema";

export type RiskNodeType = Node<ReRenderingNodeData, "risk">;

export function RiskNode({ data, selected }: NodeProps<RiskNodeType>) {
  return (
    <div
      className={`
        relative px-4 py-3 rounded-lg border shadow-sm min-w-[180px]
        transition-all duration-200 cursor-pointer
        ${selected ? "border-red-400 shadow-red-500/20 ring-2 ring-red-500/30" : "border-red-900/50 hover:border-red-700"}
        bg-red-950/30
      `}
    >
      <Handle type="target" position={Position.Top} className="!bg-red-500" />
      <Handle type="source" position={Position.Bottom} className="!bg-red-500" />

      <div className="flex items-center gap-2 mb-1">
        <span className="text-[10px] font-medium uppercase tracking-wider text-red-400">
          Risk
        </span>
      </div>

      <h3 className="text-sm font-semibold text-red-100 leading-snug">
        {data.label}
      </h3>

      {data.statement && (
        <p className="text-[11px] text-red-300/60 mt-1.5 leading-relaxed">
          {data.statement}
        </p>
      )}
    </div>
  );
}
