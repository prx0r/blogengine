"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";

interface PhaseMatch {
  id: string;
  label: string;
  phaseNumber: number;
  summary: string;
}

interface WikiEntry {
  phase: {
    number: number;
    label: string;
    summary: string;
    entryAssumption: string;
    proofMove: string;
    replacementModel: string;
    practiceMove: string;
    successMarker: string;
    failureMode: string;
    evidenceTier?: string;
    stream?: string;
  };
  risks: { id: string; label: string; statement: string }[];
  correctives: { id: string; label: string; statement: string; practice?: string }[];
  warnings: string[];
  sourceCards: { id: string; title: string; author: string; coreContribution: string; sourceType: string }[];
}

interface Analysis {
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
}

interface Message {
  role: "user" | "assistant";
  content: string;
  analysis?: Analysis;
  wiki?: WikiEntry[];
}

const INITIAL_MESSAGE: Message = {
  role: "assistant",
  content: "Ask anything — I'll look it up in the Atlas.",
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [matchedPhases, setMatchedPhases] = useState<PhaseMatch[]>([]);
  const [pendingAnalysis, setPendingAnalysis] = useState<Analysis | null>(null);
  const [pendingWiki, setPendingWiki] = useState<WikiEntry[] | null>(null);
  const [streamingContent, setStreamingContent] = useState("");
  const [agentMode, setAgentMode] = useState(false);
  const [agentMemory, setAgentMemory] = useState<{ depth: string; matchedPhases: any[]; hasBirthChart: boolean } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent, pendingAnalysis, pendingWiki, matchedPhases]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || loading) return;

      const userMsg = input.trim();
      setInput("");
      setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
      setLoading(true);
      setMatchedPhases([]);
      setPendingAnalysis(null);
      setPendingWiki(null);
      setStreamingContent("");
      setAgentMemory(null);

      const clientId = typeof window !== "undefined" ? localStorage.getItem("client_id") : null;
      const endpoint = agentMode ? "/api/chat/agent" : "/api/chat/stream";

      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(clientId ? { "x-client-id": clientId } : {}),
          },
          credentials: "include",
          body: JSON.stringify({ claim: userMsg, mode: "atlas" }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Request failed" }));
          throw new Error(err.error || `API error ${res.status}`);
        }

        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let currentEvent = "";
        let fullContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("event: ")) {
              currentEvent = line.slice(7).trim();
            } else if (line.startsWith("data: ")) {
              handleEvent(currentEvent, line.slice(6));
            }
          }
        }

        function handleEvent(event: string, raw: string) {
          if (event === "memory") {
            try {
              const mem = JSON.parse(raw);
              setAgentMemory(mem);
              setMatchedPhases(mem.matchedPhases ?? []);
            } catch {}
            return;
          }

          if (event === "context") {
            try {
              const ctx = JSON.parse(raw);
              setMatchedPhases(ctx.matchedPhases ?? []);
            } catch {}
            return;
          }

          if (event === "wiki") {
            try {
              const parsed = JSON.parse(raw);
              if (parsed.entries) {
                setPendingWiki(parsed.entries);
              }
            } catch {}
            return;
          }

          if (event === "analysis") {
            try {
              const parsed = JSON.parse(raw);
              if (parsed.classification) {
                setPendingAnalysis(parsed as Analysis);
              }
            } catch {}
            return;
          }

          if (event === "token") {
            try {
              const parsed = JSON.parse(raw);
              if (parsed.token) {
                fullContent += parsed.token;
                setStreamingContent(fullContent);
              }
            } catch {}
            return;
          }
        }

        if (pendingWiki) {
          setMessages((prev) => [...prev, { role: "assistant", content: "", wiki: pendingWiki }]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: fullContent,
              analysis: pendingAnalysis || undefined,
            },
          ]);
        }
      } catch (err: any) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `Error: ${err.message || "Failed."}` },
        ]);
      } finally {
        setLoading(false);
        setMatchedPhases([]);
        setPendingAnalysis(null);
        setPendingWiki(null);
        setStreamingContent("");
      }
    },
    [input, loading, pendingAnalysis, pendingWiki]
  );

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 flex flex-col min-h-screen">
      <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-4 inline-block">
        &larr; Feed
      </Link>

      <section className="mb-6">
        <p className="text-xs uppercase tracking-[0.18em] text-zinc-600 mb-2">Inquiry</p>
        <h1 className="text-2xl font-bold mb-2">Atlas</h1>
        <p className="text-sm text-zinc-400 leading-relaxed">Look up any concept in the Atlas.</p>
        <div className="flex items-center gap-3 mt-3">
          <button
            onClick={() => setAgentMode(false)}
            className={`text-[11px] px-2.5 py-1 rounded font-medium transition-colors ${
              !agentMode
                ? "bg-zinc-700 text-zinc-200"
                : "bg-zinc-800/50 text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Quick
          </button>
          <button
            onClick={() => setAgentMode(true)}
            className={`text-[11px] px-2.5 py-1 rounded font-medium transition-colors ${
              agentMode
                ? "bg-violet-700 text-white"
                : "bg-zinc-800/50 text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Agent
          </button>
          {agentMode && (
            <span className="text-[10px] text-zinc-600">
              Memory blocks · Conversation history
            </span>
          )}
        </div>
      </section>

      <div className="flex-1 space-y-4 mb-4 overflow-y-auto">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-zinc-700 text-zinc-200"
                  : "bg-zinc-900/60 border border-zinc-800 text-zinc-300"
              }`}
            >
              {msg.role === "user" ? (
                <span>{msg.content}</span>
              ) : msg.wiki ? (
                <WikiView entries={msg.wiki} />
              ) : msg.analysis ? (
                <div className="space-y-3">
                  <AnalysisBadges analysis={msg.analysis} />
                  <div className="text-zinc-300 leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                </div>
              ) : (
                <span>{msg.content}</span>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="w-full max-w-[85%] space-y-3">
              {pendingWiki ? (
                <div className="rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <WikiView entries={pendingWiki} />
                </div>
              ) : matchedPhases.length > 0 || pendingAnalysis ? (
                <div className="rounded-xl px-4 py-3 bg-zinc-900/60 border border-zinc-800">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] uppercase tracking-wider text-violet-400 font-medium">
                      {pendingAnalysis ? "Analysis" : "Thinking"}
                    </span>
                    {!pendingAnalysis && <span className="animate-pulse text-zinc-600">●</span>}
                  </div>
                  {matchedPhases.length > 0 && !pendingAnalysis && (
                    <div className="mb-1">
                      <span className="text-[10px] uppercase tracking-wider text-zinc-500">Related Phases</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {matchedPhases.map((p) => (
                          <span key={p.id} className="text-[11px] px-1.5 py-0.5 rounded bg-violet-950/40 border border-violet-900/30 text-violet-400">
                            Phase {p.phaseNumber}: {p.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {pendingAnalysis && <AnalysisBadges analysis={pendingAnalysis} />}
                  {agentMemory && agentMode && (
                    <div className="mt-2 flex gap-3 text-[10px] text-zinc-600">
                      <span>Agent · depth: {agentMemory.depth}</span>
                      {agentMemory.hasBirthChart && <span className="text-violet-500">· birth chart loaded</span>}
                      <span>· {agentMemory.matchedPhases.length} phase(s)</span>
                    </div>
                  )}
                </div>
              ) : null}

              {streamingContent && (
                <div className="rounded-xl px-4 py-3 bg-zinc-900/60 border border-zinc-800 text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {streamingContent}
                  <span className="animate-pulse text-zinc-600">▊</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Look up a concept... (e.g., 'What is a daimon?', 'Ritual is placebo')"
          disabled={loading}
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-violet-500 disabled:opacity-40"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-violet-700 hover:bg-violet-600 disabled:opacity-40 text-white px-5 py-3 rounded-xl text-sm font-medium transition-colors"
        >
          {loading ? "..." : "Ask"}
        </button>
      </form>
    </div>
  );
}

function WikiView({ entries }: { entries: WikiEntry[] }) {
  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <div key={entry.phase.number} className="border-b border-zinc-800 last:border-0 pb-4 last:pb-0">
          {/* Phase header */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono text-zinc-500">#{entry.phase.number}</span>
            <h2 className="text-sm font-semibold text-zinc-100">{entry.phase.label}</h2>
            {entry.phase.evidenceTier && (
              <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-amber-950/40 border border-amber-900/30 text-amber-400">
                {entry.phase.evidenceTier.replace(/_/g, " ")}
              </span>
            )}
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed mb-3">{entry.phase.summary}</p>

          {/* Details grid */}
          <div className="space-y-2 text-xs">
            {entry.phase.stream && (
              <div>
                <span className="text-zinc-600 uppercase tracking-wider text-[10px]">Stream</span>
                <p className="text-zinc-400">{entry.phase.stream}</p>
              </div>
            )}
            <div>
              <span className="text-zinc-600 uppercase tracking-wider text-[10px]">Entry Assumption</span>
              <p className="text-zinc-400 italic">"{entry.phase.entryAssumption}"</p>
            </div>
            <div>
              <span className="text-zinc-600 uppercase tracking-wider text-[10px]">What It Challenges</span>
              <p className="text-zinc-400">{entry.phase.proofMove}</p>
            </div>
            <div>
              <span className="text-emerald-600 uppercase tracking-wider text-[10px]">Alternative View</span>
              <p className="text-zinc-400">{entry.phase.replacementModel}</p>
            </div>
            <div>
              <span className="text-amber-600 uppercase tracking-wider text-[10px]">Practice</span>
              <p className="text-zinc-400">{entry.phase.practiceMove}</p>
            </div>
            {entry.phase.successMarker && (
              <div>
                <span className="text-green-600 uppercase tracking-wider text-[10px]">Success Marker</span>
                <p className="text-zinc-400">{entry.phase.successMarker}</p>
              </div>
            )}
            {entry.phase.failureMode && (
              <div>
                <span className="text-red-600 uppercase tracking-wider text-[10px]">Failure Mode</span>
                <p className="text-zinc-400">{entry.phase.failureMode}</p>
              </div>
            )}
          </div>

          {/* Risks */}
          {entry.risks.length > 0 && (
            <div className="mt-3">
              <span className="text-[10px] uppercase tracking-wider text-red-500 font-medium">Risks</span>
              <div className="space-y-1.5 mt-1">
                {entry.risks.map((r) => (
                  <div key={r.id} className="bg-red-950/20 border border-red-900/30 rounded-lg p-2">
                    <p className="text-[11px] font-medium text-red-300">{r.label}</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">{r.statement}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Correctives */}
          {entry.correctives.length > 0 && (
            <div className="mt-3">
              <span className="text-[10px] uppercase tracking-wider text-emerald-500 font-medium">Correctives</span>
              <div className="space-y-1.5 mt-1">
                {entry.correctives.map((c) => (
                  <div key={c.id} className="bg-emerald-950/20 border border-emerald-900/30 rounded-lg p-2">
                    <p className="text-[11px] font-medium text-emerald-300">{c.label}</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">{c.statement}</p>
                    {c.practice && <p className="text-[11px] text-amber-400 mt-0.5">Practice: {c.practice}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Source Cards */}
          {entry.sourceCards.length > 0 && (
            <div className="mt-3">
              <span className="text-[10px] uppercase tracking-wider text-violet-500 font-medium">Sources</span>
              <div className="space-y-1.5 mt-1">
                {entry.sourceCards.map((s) => (
                  <div key={s.id} className="bg-violet-950/20 border border-violet-900/30 rounded-lg p-2">
                    <p className="text-[11px] font-medium text-violet-300">{s.title}</p>
                    <p className="text-[10px] text-zinc-500">{s.author} · {s.sourceType.replace(/_/g, " ")}</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">{s.coreContribution}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warnings */}
          {entry.warnings.length > 0 && (
            <div className="mt-3">
              <span className="text-[10px] uppercase tracking-wider text-yellow-500 font-medium">Cautions</span>
              <ul className="list-disc list-inside text-[11px] text-zinc-400 mt-1 space-y-0.5">
                {entry.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function AnalysisBadges({ analysis }: { analysis: Analysis }) {
  const { classification: c, graphPacket: g } = analysis;
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        {c.relationContext && (
          <span className="text-[10px] uppercase tracking-wider text-violet-400 font-medium px-2 py-0.5 rounded bg-violet-950/40 border border-violet-900/30">
            {c.relationContext.replace(/_/g, " ")}
          </span>
        )}
        {c.evidenceTier && (
          <span className="text-[10px] uppercase tracking-wider text-amber-400 font-medium px-2 py-0.5 rounded bg-amber-950/40 border border-amber-900/30">
            {c.evidenceTier.replace(/_/g, " ")}
          </span>
        )}
        {c.normalizedClaim && (
          <span className="text-[11px] text-zinc-500 italic">"{c.normalizedClaim}"</span>
        )}
      </div>
      {g && (
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          {g.graphPath.length > 0 && (
            <div className="flex flex-wrap gap-1 items-center">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500">Path</span>
              {g.graphPath.map((p, i) => (
                <span key={i} className="text-[11px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                  {p}{i < g.graphPath.length - 1 ? "→" : ""}
                </span>
              ))}
            </div>
          )}
          {g.risks.length > 0 && (
            <div className="flex flex-wrap gap-1 items-center">
              <span className="text-[10px] uppercase tracking-wider text-red-500">Risks</span>
              {g.risks.map((r, i) => (
                <span key={i} className="text-[11px] px-1.5 py-0.5 rounded bg-red-950/40 border border-red-900/30 text-red-400">
                  {r.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          )}
          {g.correctives.length > 0 && (
            <div className="flex flex-wrap gap-1 items-center">
              <span className="text-[10px] uppercase tracking-wider text-emerald-500">Correctives</span>
              {g.correctives.map((c, i) => (
                <span key={i} className="text-[11px] px-1.5 py-0.5 rounded bg-emerald-950/40 border border-emerald-900/30 text-emerald-400">
                  {c.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          )}
          {g.categoryWarnings.length > 0 && (
            <div className="flex flex-wrap gap-1 items-center">
              <span className="text-[10px] uppercase tracking-wider text-yellow-500">Warnings</span>
              {g.categoryWarnings.map((w, i) => (
                <span key={i} className="text-[11px] px-1.5 py-0.5 rounded bg-yellow-950/40 border border-yellow-900/30 text-yellow-400">
                  {w}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
      {g?.suggestedPractice && (
        <div className="bg-amber-950/20 border border-amber-900/30 rounded-lg p-2">
          <span className="text-[10px] uppercase tracking-wider text-amber-500 font-medium">Suggested Practice</span>
          <p className="text-xs text-zinc-300 mt-0.5">{g.suggestedPractice}</p>
        </div>
      )}
    </div>
  );
}
