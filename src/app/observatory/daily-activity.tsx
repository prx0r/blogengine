"use client";

import { PLANET_NAMES, PLANET_SYMBOLS, PLANET_COLORS } from "./correspondences";

const PLANET_PLAIN: Record<string, { vibe: string; advice: string }> = {
  sun: { vibe: "Vitality — lead from your center today", advice: "Do what makes you feel alive. Morning sun practice, conscious creation, or simply being visible in your work." },
  moon: { vibe: "Feeling — your emotional landscape is the map today", advice: "Honor what you feel without needing to fix it. Journal, rest, tend to your inner world." },
  mercury: { vibe: "Connection — communication is the current", advice: "Write, teach, have the conversation you've been putting off. Your daimon LVJK is Mercurial — this is your native element." },
  venus: { vibe: "Harmony — beauty and relationship are calling", advice: "Connect with someone you love. Make something beautiful. Pleasure is productive today." },
  mars: { vibe: "Action — something needs to be started", advice: "Move. Not planning, not analyzing — acting. Physical movement breaks mental blocks." },
  jupiter: { vibe: "Expansion — something is trying to grow", advice: "Say yes to the opportunity that feels slightly too big. Teach what you're learning. Take the wider view." },
  saturn: { vibe: "Structure — something needs to be built", advice: "Do the hard thing you've been avoiding. Discipline today creates freedom tomorrow." },
};

const MODE_EXPLAINED: Record<string, string> = {
  fortune: "Fortune leads — pay attention to what arrives. Circumstance is on your side.",
  spirit: "Spirit leads — your choices matter more than your conditions. Act with purpose.",
  mixed: "Fortune and Spirit are balanced — both what arrives and what you initiate matter today.",
};

interface ActivityProps {
  signals: { planet: string; score: number; confidence: string; timescales: string[]; sign: string; house: number; daimon: boolean }[];
  packet: any;
  synthesis: any;
  daimonName: string;
}

const HOUSE_NAMES: Record<number, string> = {
  1: "self", 2: "money", 3: "thinking", 4: "home", 5: "creativity", 6: "health",
  7: "relationships", 8: "transformation", 9: "philosophy", 10: "career", 11: "community", 12: "spirituality",
};
const SIGN_NAMES = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];

function extractTopLine(atmo: string): string {
  const lines = atmo.split("\n").filter(l => l.trim());
  if (lines.length > 0) return lines[0].replace(/^Your year is shaped by /, "").replace(/\. This is the long arc.*$/, "").trim();
  return "";
}

function extractPractice(atmo: string, daimonPlanet: string): string[] {
  const out: string[] = [];
  const lines = atmo.split("\n");
  let inPractice = false;
  for (const l of lines) {
    if (l.toLowerCase().includes("practice for your daimon") || l.toLowerCase().includes("strongest overall")) {
      inPractice = true;
    }
    if (inPractice && l.trim()) {
      if (l.includes("Best time") || l.includes("Best time")) continue;
      out.push(l.replace(/^\s*[·•]\s*/, "").trim());
    }
  }
  return out.slice(0, 3);
}

export default function DailyActivity({ signals, packet, synthesis, daimonName }: ActivityProps) {
  const top = signals[0];
  const mode = packet?.dominant_mode || "mixed";
  const atmo = synthesis?.traditions?.[0]?.atmosphere_decoding || "";
  const practices = extractPractice(atmo, top?.planet || "");

  if (!top) return <p className="text-sm text-zinc-500 italic">No activations today.</p>;

  const pp = PLANET_PLAIN[top.planet] || { vibe: "Energy is active", advice: "Check the signals tab for details." };
  const signDeg = SIGN_NAMES[["ari","tau","gem","can","leo","vir","lib","sco","sag","cap","aqu","pis"].indexOf(top.sign?.toLowerCase().slice(0, 3))] || top.sign;
  const topLine = extractTopLine(atmo);

  return (
    <div className="space-y-4">
      {/* Hero card — the ONE thing to know */}
      <div className={`rounded-2xl border ${PLANET_COLORS[top.planet]}-700/30 bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-sm p-5`}>
        <p className="text-xs text-zinc-500 uppercase tracking-[0.15em] mb-1">Today&apos;s Main Influence</p>
        <div className="flex items-start gap-4">
          <span className="text-4xl">{PLANET_SYMBOLS[top.planet] || "☿"}</span>
          <div className="flex-1">
            <p className="text-xl font-semibold text-zinc-100">{PLANET_NAMES[top.planet]} in {signDeg}</p>
            <p className="text-base text-zinc-300 mt-1 leading-relaxed">{pp.vibe}</p>
            {top.daimon && <p className="text-xs text-yellow-400 mt-1">✦ {daimonName} — this is your daimon&apos;s planet</p>}
          </div>
        </div>
      </div>

      {/* What to DO about it */}
      <div className="rounded-xl border border-zinc-800 bg-black/20 backdrop-blur-sm p-4">
        <p className="text-xs text-zinc-500 uppercase tracking-[0.15em] mb-2">What to Do</p>
        <p className="text-sm text-zinc-200 leading-relaxed">{pp.advice}</p>
      </div>

      {/* Practices */}
      {practices.length > 0 && (
        <div className="rounded-xl border border-zinc-800 bg-black/20 backdrop-blur-sm p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-[0.15em] mb-2">Recommended Practice</p>
          {practices.map((p, i) => (
            <p key={i} className="text-sm text-zinc-200 leading-relaxed">{p}</p>
          ))}
        </div>
      )}

      {/* Year context — one line */}
      {topLine && (
        <div className="rounded-xl border border-zinc-800 bg-black/20 backdrop-blur-sm p-3">
          <p className="text-xs text-zinc-500 uppercase tracking-[0.15em] mb-1">Year Context</p>
          <p className="text-sm text-zinc-400">{topLine}</p>
        </div>
      )}

      {/* Mode + AI Analysis button */}
      <div className="rounded-xl border border-zinc-800 bg-black/20 backdrop-blur-sm p-4">
        <p className="text-xs text-zinc-500 mb-2">{MODE_EXPLAINED[mode] || ""}</p>
        <div className="flex gap-3 text-[10px] text-zinc-600 mb-3">
          <span>Fortune {packet?.fortune_score?.toFixed(0) || "—"}</span>
          <span>Spirit {packet?.spirit_score?.toFixed(0) || "—"}</span>
        </div>
        <button
          onClick={() => window.location.href = "/astrology"}
          className="w-full text-xs text-zinc-500 hover:text-zinc-200 transition-colors py-2 rounded-lg border border-zinc-800 hover:border-zinc-600"
        >
          Generate Deep Analysis →
        </button>
      </div>
    </div>
  );
}
