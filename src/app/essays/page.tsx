// @ts-nocheck
"use client";
import { getEssays, TRADITIONS, getEssayTraditionById } from "@/lib/essays";
import Link from "next/link";
import { useState, useEffect } from "react";

const HIDDEN_IDS = new Set(["becoming_an_angel"]);

const CARD_STYLES: Record<string, { gradient: string; symbol: string; accent: string }> = {
  Sufism: {
    gradient: "from-emerald-900 via-emerald-950 to-black",
    symbol: "☾",
    accent: "emerald",
  },
  Platonism: {
    gradient: "from-indigo-900 via-indigo-950 to-black",
    symbol: "◇",
    accent: "indigo",
  },
  Occult: {
    gradient: "from-amber-900 via-amber-950 to-black",
    symbol: "△",
    accent: "amber",
  },
  Tantra: {
    gradient: "from-green-900 via-green-950 to-black",
    symbol: "🜍",
    accent: "green",
  },
  Other: {
    gradient: "from-stone-900 via-stone-950 to-black",
    symbol: "○",
    accent: "stone",
  },
};

interface RecentEssay {
  id: string;
  title: string;
  scrollPct: number;
  updatedAt: number;
}

function getRecentEssays(): RecentEssay[] {
  try {
    const raw = localStorage.getItem("essay-progress");
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Object.entries(data)
      .filter(([_, v]: [string, any]) => v.scrollPct > 0 && v.scrollPct < 99)
      .map(([id, v]: [string, any]) => ({ id, ...v }))
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 5);
  } catch {
    return [];
  }
}

export default function EssaysLanding() {
  const essays = getEssays();
  const [recent, setRecent] = useState<RecentEssay[]>([]);

  useEffect(() => {
    setRecent(getRecentEssays());
  }, []);

  const cards = TRADITIONS.map(t => {
    const count = essays.filter(e => !HIDDEN_IDS.has(e.id) && getEssayTraditionById(e.id) === t.id).length;
    const style = CARD_STYLES[t.id];
    return { ...t, count, style };
  });

  return (
    <div className="flex flex-col flex-1 mx-auto w-full max-w-4xl px-6 py-16">
      <nav className="mb-12 text-sm">
        <Link href="/" className="text-zinc-500 hover:text-zinc-300 transition-colors">
          ← Home
        </Link>
      </nav>

      <div className="mb-16">
        <h1 className="text-4xl font-bold text-zinc-100 mb-3 tracking-tight">Essays</h1>
        <p className="text-sm text-zinc-500 max-w-lg leading-relaxed">
          Curated scholarly compilations organized by tradition. Each essay interweaves source passages with commentary.
        </p>
      </div>

      {/* Recent essays */}
      {recent.length > 0 && (
        <div className="mb-16">
          <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-600 mb-4">Continue Reading</h2>
          <div className="space-y-2">
            {recent.map(r => {
              const essay = essays.find(e => e.id === r.id);
              if (!essay) return null;
              const trad = getEssayTraditionById(r.id);
              const accentColor = trad === "Sufism" ? "bg-emerald-500" : trad === "Platonism" ? "bg-indigo-500" : trad === "Occult" ? "bg-amber-500" : trad === "Tantra" ? "bg-green-500" : "bg-zinc-500";
              return (
                <Link
                  key={r.id}
                  href={`/essay/${r.id}`}
                  className="flex items-center gap-4 rounded-lg border border-zinc-800/50 p-4 hover:border-zinc-700 hover:bg-zinc-900/30 transition-all duration-200 group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-zinc-200 truncate">{r.title}</div>
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="flex-1 h-1 rounded-full bg-zinc-800 overflow-hidden max-w-[120px]">
                        <div className={`h-full ${accentColor} rounded-full transition-all`} style={{ width: `${r.scrollPct}%` }} />
                      </div>
                      <span className="text-[11px] text-zinc-600">{r.scrollPct}%</span>
                    </div>
                  </div>
                  <span className="text-xs text-zinc-600 group-hover:text-zinc-400 transition-colors">→</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Tradition cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {cards.map(({ id, label, icon, description, count, style }) => (
          <Link
            key={id}
            href={`/essays/${id.toLowerCase()}`}
            className={`group relative rounded-2xl overflow-hidden bg-gradient-to-br ${style.gradient} p-8 hover:scale-[1.02] transition-all duration-300 border border-zinc-800/50 hover:border-zinc-700/80 shadow-xl`}
          >
            <div className="relative z-10">
              <div className="text-5xl mb-5 opacity-40 group-hover:opacity-70 transition-opacity duration-300">
                {style.symbol}
              </div>
              <h2 className="text-2xl font-bold text-zinc-100 mb-1.5">{label}</h2>
              <p className="text-xs text-zinc-500 leading-relaxed mb-6 line-clamp-2">{description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-600">{count} {count === 1 ? "essay" : "essays"}</span>
                <span className="text-xs text-zinc-600 group-hover:text-zinc-400 transition-colors font-medium">
                  Browse collection →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
