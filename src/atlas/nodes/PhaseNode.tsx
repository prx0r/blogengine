"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { Node } from "@xyflow/react";
import type { ReRenderingNodeData } from "@/atlas/graph/schema";
import { useCallback } from "react";

export type PhaseNodeType = Node<ReRenderingNodeData, "phase">;

export function PhaseNode({ data, selected }: NodeProps<PhaseNodeType>) {
  return (
    <div
      className={`
        relative px-4 py-3 rounded-lg border shadow-sm min-w-[200px]
        transition-all duration-200 cursor-pointer
        ${selected ? "border-violet-400 shadow-violet-500/20 ring-2 ring-violet-500/30" : "border-zinc-700 hover:border-zinc-500"}
        ${data.status === "replacement" ? "bg-emerald-950/40" : data.status === "corrective" ? "bg-amber-950/40" : "bg-zinc-900/80"}
      `}
    >
      <Handle type="target" position={Position.Top} className="!bg-zinc-500" />
      <Handle type="source" position={Position.Bottom} className="!bg-zinc-500" />

      <div className="flex items-center gap-2 mb-1">
        {data.phaseNumber && (
          <span className="text-[10px] font-mono text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">
            {String(data.phaseNumber).padStart(2, "0")}
          </span>
        )}
        <span className="text-[10px] font-medium uppercase tracking-wider text-violet-400">
          Phase
        </span>
        {data.stream && (
          <span className="text-[9px] text-zinc-600 ml-auto">{data.stream}</span>
        )}
      </div>

      <h3 className="text-sm font-semibold text-zinc-100 leading-snug">
        {data.label}
      </h3>

      {data.entryAssumption && (
        <p className="text-[11px] text-zinc-500 mt-1.5 italic leading-relaxed">
          "{data.entryAssumption}"
        </p>
      )}

      {data.practiceMove && (
        <div className="mt-2 pt-2 border-t border-zinc-800">
          <span className="text-[9px] uppercase tracking-wider text-amber-500 font-medium">
            Practice
          </span>
          <p className="text-[10px] text-zinc-400 mt-0.5">{data.practiceMove}</p>
        </div>
      )}

      {data.evidenceTier && (
        <div className="mt-2 flex gap-1 flex-wrap">
          <span className="text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500">
            {data.evidenceTier.replace(/_/g, " ")}
          </span>
        </div>
      )}
    </div>
  );
}
