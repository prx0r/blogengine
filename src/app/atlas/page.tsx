"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import type { Graph } from "@/atlas/graph/schema";

const AtlasFlow = dynamic(
  () => import("@/atlas/components/AtlasFlow").then((m) => m.AtlasFlow),
  { ssr: false }
);

type ClaimResult = {
  classification: {
    normalizedClaim: string;
    claimType: string;
    evidenceTier: string;
    relationContext: string;
  };
  graphPacket: {
    primaryPhase: { id: string; label: string; phaseNumber: number } | null;
    graphPath: string[];
    risks: string[];
    correctives: string[];
    evidenceTier: string;
    categoryWarnings: string[];
    suggestedPractice?: string;
  };
  answer: string;
};

export default function AtlasPage() {
  const [graph, setGraph] = useState<Graph | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [claim, setClaim] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ClaimResult | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadGraph() {
      try {
        const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
        const isStatic = !!basePath;
        const url = isStatic ? `${basePath}/graph-data.json` : "/api/graph";
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to load graph: ${res.statusText}`);
        const data = await res.json();
        setGraph(data);
      } catch (err) {
        console.error("Failed to load graph:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    }
    loadGraph();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!claim.trim() || loading) return;

    const userClaim = claim.trim();
    setClaim("");
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/claim/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claim: userClaim, mode: "atlas" }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error || `API error ${res.status}`);
      }
      const data = await res.json();
      setResult(data);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err: any) {
      setResult({
        classification: {
          normalizedClaim: userClaim,
          claimType: "error",
          evidenceTier: "speculative",
          relationContext: "error",
        },
        graphPacket: {
          primaryPhase: null,
          graphPath: [],
          risks: [],
          correctives: [],
          evidenceTier: "speculative",
          categoryWarnings: [],
        },
        answer: `Error: ${err.message}`,
      });
    } finally {
      setLoading(false);
    }
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-sm">Failed to load atlas: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 text-xs text-violet-400 hover:text-violet-300 underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!graph) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-zinc-600 text-sm">Loading atlas...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <AtlasFlow graph={graph} />

      {/* Claim input bar */}
      <div className="border-t border-zinc-800 bg-zinc-900/95 px-4 py-3">
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-4xl mx-auto">
          <input
            type="text"
            value={claim}
            onChange={(e) => setClaim(e.target.value)}
            placeholder="Enter a claim to analyze (e.g., 'Quantum physics proves magic.')"
            disabled={loading}
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-violet-500 disabled:opacity-40"
          />
          <button
            type="submit"
            disabled={loading || !claim.trim()}
            className="bg-violet-700 hover:bg-violet-600 disabled:opacity-40 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </form>
      </div>

      {/* Claim result panel */}
      {result && (
        <div ref={resultRef} className="border-t border-zinc-800 bg-zinc-900/95 max-h-[50vh] overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
            {/* Classification */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[10px] uppercase tracking-wider text-violet-400 font-medium px-2 py-0.5 rounded bg-violet-950/40 border border-violet-900/30">
                {result.classification.relationContext?.replace(/_/g, " ")}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-amber-400 font-medium px-2 py-0.5 rounded bg-amber-950/40 border border-amber-900/30">
                {result.classification.evidenceTier?.replace(/_/g, " ")}
              </span>
              {result.classification.normalizedClaim && (
                <span className="text-xs text-zinc-400 italic">
                  "{result.classification.normalizedClaim}"
                </span>
              )}
            </div>

            {/* Answer */}
            {result.answer && (
              <div className="bg-zinc-800/60 border border-zinc-700/50 rounded-lg p-4 text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                {result.answer}
              </div>
            )}

            {/* Graph packet */}
            <div className="flex flex-wrap gap-4 text-xs">
              {result.graphPacket.graphPath.length > 0 && (
                <div>
                  <span className="text-zinc-500 uppercase tracking-wider">Path</span>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {result.graphPacket.graphPath.map((p, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                        {p}{i < result.graphPacket.graphPath.length - 1 ? " →" : ""}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {result.graphPacket.risks.length > 0 && (
                <div>
                  <span className="text-red-500 uppercase tracking-wider">Risks</span>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {result.graphPacket.risks.map((r, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-red-950/40 border border-red-900/30 text-red-300">
                        {r.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {result.graphPacket.correctives.length > 0 && (
                <div>
                  <span className="text-emerald-500 uppercase tracking-wider">Correctives</span>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {result.graphPacket.correctives.map((c, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-900/30 text-emerald-300">
                        {c.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {result.graphPacket.categoryWarnings.length > 0 && (
                <div>
                  <span className="text-yellow-500 uppercase tracking-wider">Warnings</span>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {result.graphPacket.categoryWarnings.map((w, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-yellow-950/40 border border-yellow-900/30 text-yellow-300">
                        {w.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
