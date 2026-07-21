"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { Node } from "@xyflow/react";
import type { ReRenderingNodeData } from "@/atlas/graph/schema";

export type CorrectiveNodeType = Node<ReRenderingNodeData, "corrective">;

export function CorrectiveNode({ data, selected }: NodeProps<CorrectiveNodeType>) {
  return (
    <div
      className={`
        relative px-4 py-3 rounded-lg border shadow-sm min-w-[180px]
        transition-all duration-200 cursor-pointer
        ${selected ? "border-emerald-400 shadow-emerald-500/20 ring-2 ring-emerald-500/30" : "border-emerald-900/50 hover:border-emerald-700"}
        bg-emerald-950/30
      `}
    >
      <Handle type="target" position={Position.Top} className="!bg-emerald-500" />
      <Handle type="source" position={Position.Bottom} className="!bg-emerald-500" />

      <div className="flex items-center gap-2 mb-1">
        <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-400">
          Corrective
        </span>
      </div>

      <h3 className="text-sm font-semibold text-emerald-100 leading-snug">
        {data.label}
      </h3>

      {data.statement && (
        <p className="text-[11px] text-emerald-300/60 mt-1.5 leading-relaxed">
          {data.statement}
        </p>
      )}

      {data.enables && data.enables.length > 0 && (
        <div className="mt-2 pt-2 border-t border-emerald-900/30">
          <span className="text-[9px] uppercase tracking-wider text-emerald-500 font-medium">
            Practice
          </span>
          <p className="text-[10px] text-emerald-300/50 mt-0.5">{data.enables[0]}</p>
        </div>
      )}
    </div>
  );
}
