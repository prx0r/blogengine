// Builds a graph context string for LLM system prompts.
// Wraps the phase cache + Kuzu tools into a formatted context block.

import type { PhaseCacheEntry } from "@/atlas/graph/phaseCache";
import { searchPhases } from "@/atlas/graph/phaseCache";
import { getToolDescriptions } from "./graph-tools";

// ── Graph context from phase cache ──────────────────────────────

export interface GraphContext {
  phases: PhaseCacheEntry[];
  contextBlock: string;
  toolDescriptions: string;
}

export function buildGraphContext(query: string): GraphContext {
  const matched = searchPhases(query);
  const phases = matched.length > 0 ? matched : [];

  const lines: string[] = [
    "=== ATLAS GRAPH CONTEXT ===",
    `Query matched ${phases.length} phase(s):`,
    "",
  ];

  for (const p of phases) {
    lines.push(`Phase ${p.phaseNumber}: ${p.label}`);
    if (p.summary) lines.push(`  Summary: ${p.summary}`);
    lines.push("");
  }

  if (phases.length > 0) {
    lines.push("When answering, cite the relevant phase(s) by number and name.");
    lines.push("If the user's claim involves a category error, flag it explicitly.");
    lines.push("End with a practice or inquiry when appropriate.");
  }

  lines.push("");
  lines.push("=== AVAILABLE TOOLS ===");
  lines.push(getToolDescriptions());
  lines.push("");
  lines.push("You can call query_knowledge_graph to fetch more graph data if needed.");
  lines.push("You can call write_to_graph to store durable facts about the user.");

  return {
    phases,
    contextBlock: lines.join("\n"),
    toolDescriptions: getToolDescriptions(),
  };
}

// ── Format graph context for agent memory block ─────────────────

export function formatGraphContextForAgent(matchedPhases: PhaseCacheEntry[]): string {
  const lines: string[] = ["Current session graph context:"];
  for (const p of matchedPhases) {
    lines.push(`- Phase ${p.phaseNumber}: ${p.label}`);
    if (p.summary) lines.push(`  ${p.summary}`);
    if (p.entryAssumption) lines.push(`  Assumption: ${p.entryAssumption}`);
    if (p.proofMove) lines.push(`  Proof: ${p.proofMove}`);
  }
  return lines.join("\n");
}
