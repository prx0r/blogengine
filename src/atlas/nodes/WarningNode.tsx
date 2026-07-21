"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { Node } from "@xyflow/react";
import type { ReRenderingNodeData } from "@/atlas/graph/schema";

export type WarningNodeType = Node<ReRenderingNodeData, "warning">;

export function WarningNode({ data, selected }: NodeProps<WarningNodeType>) {
  return (
    <div
      className={`
        relative px-4 py-3 rounded-lg border shadow-sm min-w-[200px]
        transition-all duration-200 cursor-pointer
        ${selected ? "border-yellow-400 shadow-yellow-500/20 ring-2 ring-yellow-500/30" : "border-yellow-900/50 hover:border-yellow-700"}
        bg-yellow-950/30
      `}
    >
      <Handle type="target" position={Position.Top} className="!bg-yellow-500" />
      <Handle type="source" position={Position.Bottom} className="!bg-yellow-500" />

      <div className="flex items-center gap-2 mb-1">
        <span className="text-[10px] font-medium uppercase tracking-wider text-yellow-400">
          ⚠ Warning
        </span>
      </div>

      <h3 className="text-sm font-semibold text-yellow-100 leading-snug">
        {data.label}
      </h3>

      {data.statement && (
        <p className="text-[11px] text-yellow-300/60 mt-1.5 leading-relaxed">
          {data.statement}
        </p>
      )}
    </div>
  );
}
