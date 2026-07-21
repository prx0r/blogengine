"use client";

import { useState, useEffect, useRef } from "react";
import { Engine } from "caelus";
import { embeddedData } from "caelus/data-embedded";
import { toUT } from "caelus-birth";
import { profectionAt, signRuler, SIGNS } from "caelus";
import { zrAt } from "caelus";
import { normalizeChart } from "@/astrology/caelus_adapter";
import { buildDailySphereReading, type ReaderInput } from "@/astrology/daily_sphere_reader";
import { buildActivationPacket, type PacketInput } from "@/astrology/activation_packet";
import { interpretPacket } from "@/astrology/interpretation_schema";
import { synthesizeDaily, type DailySynthesis } from "@/astrology/synthesis";
import { computeFirdaria } from "@/astrology/activation_engine";
import type { PlanetId } from "@/astrology/types";
import { registerSpellbookInGraph } from "@/astrology/spellbook/spellbook";
import { pushActivationToGraph, registerSourceRulesInGraph, registerPlanetProfilesInGraph } from "@/astrology/knowledge_graph";
import MoonPhase from "./moon";
import { PLANET_COLORS, PLANET_SYMBOLS, PLANET_NAMES, blendPlanetColors } from "./correspondences";
import AtmoBackground from "./atmo";
import DailyActivity from "./daily-activity";
import { getPlanetaryHours, PLANET_NAMES_SHORT } from "./planetary-hours";
import ChatBar from "./chat-bar";

const BANGKOK_TZ = "Asia/Bangkok";
const BIRTH = { year: 1999, month: 5, day: 16, hour: 14, minute: 37, lat: 51.41, lon: -0.67 };

interface ActivationSummary {
  planet: string; score: number; confidence: string; timescales: string[];
  sign: string; house: number; daimon: boolean; converged: boolean;
}

const SIGN_SYMBOLS = ["♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"];
const TIMESCALE_LABELS: Record<string, string> = {
  annual_profection: "Year", zr_spirit: "Spirit", zr_fortune: "Fortune",
  firdaria: "Firdaria", monthly_profection: "Month", transit: "Transit",
  lot_transit: "Lot", angle_transit: "Angle", sky_aspect: "Sky",
  natal_prominence: "Natal", oikodespotes: "Daimon",
  annual_profection_lord: "Year Lord", zr_fortune_lord: "Fortune Lord",
  zr_spirit_lord: "Spirit Lord",
};

function getBangkokNow(): Date {
  const now = new Date();
  const bangkok = new Intl.DateTimeFormat("en-CA", {
    timeZone: BANGKOK_TZ, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
  }).formatToParts(now);
  const get = (t: string) => parseInt(bangkok.find(p => p.type === t)?.value || "0", 10);
  return new Date(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
}

function getTimeOfDay(h: number): string {
  if (h < 6) return "night";
  if (h < 9) return "dawn";
  if (h < 12) return "morning";
  if (h < 15) return "noon";
  if (h < 18) return "afternoon";
  if (h < 21) return "dusk";
  return "night";
}

const TAB_NAMES = ["Today", "Signals", "Schedule", "Layers", "Practices"];

export default function ObservatoryPage() {
  const [engine, setEngine] = useState<Engine | null>(null);
  const [reading, setReading] = useState<any>(null);
  const [packet, setPacket] = useState<any>(null);
  const [interpretation, setInterpretation] = useState<any>(null);
  const [synthesis, setSynthesis] = useState<DailySynthesis | null>(null);
  const [signals, setSignals] = useState<ActivationSummary[]>([]);
  const [daimonName, setDaimonName] = useState("LVJK");
  const [bangkokNow, setBangkokNow] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setDaimonName(typeof window !== "undefined" ? localStorage.getItem("genius_name") || "LVJK" : "LVJK");
    setEngine(new Engine(embeddedData));
    registerSpellbookInGraph();
    registerSourceRulesInGraph();
    registerPlanetProfilesInGraph();
    timerRef.current = setInterval(() => setBangkokNow(getBangkokNow()), 60000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  useEffect(() => {
    if (!engine) return;
    try {
      const now = getBangkokNow();
      const t = toUT({ ...BIRTH, hour: BIRTH.hour, minute: BIRTH.minute });
      const chart = engine.chart(t.utc.year, t.utc.month, t.utc.day, t.utc.hour, t.utc.minute, 0, BIRTH.lat, BIRTH.lon, "whole_sign");
      const normalized = normalizeChart(chart, "Thomas Prior");
      const jdUt = now.getTime() / 86400000 + 2440587.5;
      const today = new Date();

      const sky: Record<string, { lon: number; sign_index: number }> = {};
      for (const p of ["sun","moon","mercury","venus","mars","jupiter","saturn"]) {
        const lon = engine.longitude(p, jdUt);
        sky[p] = { lon, sign_index: Math.floor(lon / 30) % 12 };
      }

      const prof = profectionAt(engine, normalized.natal.jdUt, jdUt, BIRTH.lat, BIRTH.lon);
      const zr = zrAt(engine, normalized.natal.jdUt, jdUt, BIRTH.lat, BIRTH.lon, "spirit");
      const zrFort = zrAt(engine, normalized.natal.jdUt, jdUt, BIRTH.lat, BIRTH.lon, "fortune");
      const firdaria = computeFirdaria(engine, normalized.natal.jdUt, jdUt, BIRTH.lat, BIRTH.lon);

      const readerInput: ReaderInput = {
        chart: normalized, currentSkyPlanets: sky as any, currentSkyAspects: [], targetDate: today,
        profection: {
          annual: { house: prof.annual.house, sign: prof.annual.sign, lord: prof.annual.lord as PlanetId },
          monthly: { house: prof.monthly.house, sign: prof.monthly.sign, lord: prof.monthly.lord as PlanetId },
        },
        zrSpirit: zr?.l1 ? { lord: signRuler(SIGNS.indexOf(zr.l1)) as PlanetId, sign: zr.l1 } : undefined,
        zrFortune: zrFort?.l1 ? { lord: signRuler(SIGNS.indexOf(zrFort.l1)) as PlanetId, sign: zrFort.l1 } : undefined,
      };

      const result = buildDailySphereReading(readerInput);
      setReading(result);

      const packetInput: PacketInput = {
        ...readerInput,
        firdaria: firdaria.lord ? { lord: firdaria.lord as PlanetId } : undefined,
      };
      const pkt = buildActivationPacket(packetInput);
      setPacket(pkt);

      const oikodespotes = result.oikodespotes?.planet;
      const interp = interpretPacket(pkt, oikodespotes);
      setInterpretation(interp);

      const dailySynth = synthesizeDaily(pkt, normalized, interp.macro);
      setSynthesis(dailySynth);

      // Push to graph for layer system (not for display — synthesis handles practice ranking)
      const allThemes = [
        ...interp.interpretations.al_khayyat, ...interp.interpretations.valens,
        ...interp.interpretations.ficino, ...interp.interpretations.greenbaum,
        ...interp.interpretations.demetra,
      ];
      pushActivationToGraph(pkt.signals, allThemes.map(t => ({ planet: t.planet, tags: t.tags, system: t.system })), oikodespotes);

      const summaries: ActivationSummary[] = pkt.signals.map((s: any) => ({
        planet: s.planet, score: s.score, confidence: s.confidence,
        timescales: (s.timing_sources || []).map((ts: string) => TIMESCALE_LABELS[ts] || ts),
        sign: SIGN_SYMBOLS[sky[s.planet]?.sign_index ?? 0],
        house: s.activated_houses?.[0] || 0,
        daimon: s.planet === oikodespotes,
        converged: interp.convergence.planets.includes(s.planet),
      }));
      setSignals(summaries);
    } catch (e) { console.error("Observatory error:", e); }
  }, [engine]);

  const tod = getTimeOfDay(bangkokNow.getHours());
  const topSignal = signals[0];
  const blend = blendPlanetColors(
    signals.length > 0 ? signals.map(s => ({ planet: s.planet, score: s.score })) : [{ planet: "mercury", score: 1 }],
    tod
  );
  const ph = getPlanetaryHours(bangkokNow);
  const moonLon = reading?.currentSkyPlanets?.moon?.lon ?? 0;
  const sunLon = reading?.currentSkyPlanets?.sun?.lon ?? 0;
  const moonPhaseRaw = ((moonLon - sunLon) % 360 + 360) % 360;

  return (
    <>
      <AtmoBackground gradientCss={blend.css} accentColor={blend.topColor} planet={topSignal?.planet || "mercury"} />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-6 min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs tracking-[0.3em] text-zinc-400 uppercase">
              {tod === "dawn" && "The sky awakens"}
              {tod === "morning" && "The sky rises"}
              {tod === "noon" && "The sun stands high"}
              {tod === "afternoon" && "The light leans west"}
              {tod === "dusk" && "The veil thins"}
              {tod === "night" && "The stars emerge"}
            </p>
            <h1 className="text-2xl font-bold tracking-wider text-zinc-100 font-mono">{daimonName}</h1>
          </div>
          <div className="text-right text-xs text-zinc-400">
            <p suppressHydrationWarning>{bangkokNow.toLocaleDateString("en-GB", { timeZone: BANGKOK_TZ, weekday: "long", day: "numeric", month: "long" }).replace(/,/g, "")}</p>
            <p suppressHydrationWarning className="text-zinc-500">{bangkokNow.toLocaleTimeString("en-GB", { timeZone: BANGKOK_TZ, hour: "2-digit", minute: "2-digit" })}</p>
            <p className="text-yellow-500/70 mt-0.5">{ph.currentSymbol} {ph.currentPlanet.charAt(0).toUpperCase() + ph.currentPlanet.slice(1)} Hour</p>
          </div>
        </div>

        {/* Top row: Moon + Planetary Hour + Top Activation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="rounded-2xl border border-zinc-700/50 bg-black/30 backdrop-blur-sm p-4 flex items-center gap-4">
            <MoonPhase phase={moonPhaseRaw} size={72} />
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider">Moon</p>
              <p className="text-lg font-semibold text-zinc-100">
                {moonPhaseRaw < 45 ? "🌑 New" : moonPhaseRaw < 135 ? "🌓 First Quarter" : moonPhaseRaw < 225 ? "🌕 Full" : moonPhaseRaw < 315 ? "🌗 Last Quarter" : "🌑 New"}
              </p>
              <p className="text-xs text-zinc-400">in {SIGN_SYMBOLS[Math.floor(moonLon / 30) % 12]}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-700/50 bg-black/30 backdrop-blur-sm p-4 flex items-center gap-4">
            <span className="text-3xl">{ph.currentSymbol}</span>
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider">Current Hour</p>
              <p className="text-lg font-semibold text-zinc-100">{PLANET_NAMES[ph.currentPlanet] || ph.currentPlanet}</p>
              <p className="text-xs text-zinc-400">
                Dawn ruler: {PLANET_NAMES[ph.dawn] || ph.dawn}
                {ph.currentPlanet === "mercury" && <span className="text-yellow-400 ml-2">✦ Best for LVJK</span>}
              </p>
            </div>
          </div>

          {topSignal && (
            <div className={`md:col-span-1 rounded-2xl border ${PLANET_COLORS[topSignal.planet]}-700/30 bg-black/30 backdrop-blur-sm p-4`}>
              <p className="text-xs text-zinc-500 uppercase tracking-wider">Highest Signal</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-3xl">{PLANET_SYMBOLS[topSignal.planet] || "☿"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-bold text-zinc-100 truncate">{PLANET_NAMES[topSignal.planet] || topSignal.planet}</p>
                  <p className="text-xs text-zinc-400 truncate">
                    {topSignal.sign} {topSignal.house > 0 ? `H${topSignal.house}` : ""} · {topSignal.confidence}
                    {topSignal.daimon && <span className="text-yellow-400 ml-2">✦</span>}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xl font-bold text-zinc-100">{topSignal.score}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Signals strip */}
        {signals.length > 1 && (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-thin">
            {signals.slice(1).map((s) => (
              <div key={s.planet} className={`shrink-0 rounded-xl border ${PLANET_COLORS[s.planet]}-700/20 bg-black/20 backdrop-blur-sm p-3 min-w-[100px]`}>
                <div className="flex items-center gap-2 mb-1">
                  <span>{PLANET_SYMBOLS[s.planet] || "☿"}</span>
                  <span className="text-xs font-medium text-zinc-200">{PLANET_NAMES[s.planet]}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-zinc-100">{s.score}</span>
                  <span className="text-xs text-zinc-500">{s.sign}</span>
                </div>
                <div className="flex gap-0.5 mt-0.5">
                  {s.daimon && <span className="text-[10px] text-yellow-400">✦</span>}
                  {s.converged && <span className="text-[10px] text-emerald-400">◈</span>}
                  <span className="text-[10px] text-zinc-500">{s.confidence}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 border-b border-zinc-800 mb-4">
          {TAB_NAMES.map((name, i) => (
            <button key={name} onClick={() => setActiveTab(i)}
              className={`pb-2 text-sm font-medium transition-colors ${activeTab === i ? "text-zinc-100 border-b-2 border-zinc-400" : "text-zinc-600 hover:text-zinc-300"}`}>
              {name}
            </button>
          ))}
        </div>

        {/* Tab: Today */}
        {activeTab === 0 && (
          <DailyActivity signals={signals} packet={packet} synthesis={synthesis} daimonName={daimonName} />
        )}

        {/* Tab: Signals */}
        {activeTab === 1 && (
          <div className="space-y-2">
            {signals.map((s) => (
              <div key={s.planet} className="rounded-xl border border-zinc-800 bg-black/20 backdrop-blur-sm p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{PLANET_SYMBOLS[s.planet] || "☿"}</span>
                  <div>
                    <p className="text-sm font-medium text-zinc-200">{PLANET_NAMES[s.planet]} {s.daimon && <span className="text-yellow-400 text-xs">✦</span>}</p>
                    <p className="text-xs text-zinc-500">{s.sign} · H{s.house} · {s.confidence}{s.converged && <span className="text-emerald-400 ml-1">◈ Converged</span>}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1 flex-wrap justify-end max-w-[200px]">
                    {s.timescales.slice(0, 4).map((ts) => (
                      <span key={ts} className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 whitespace-nowrap">{ts}</span>
                    ))}
                  </div>
                  <span className="text-lg font-bold text-zinc-100 w-8 text-right">{s.score}</span>
                </div>
              </div>
            ))}
            {signals.length === 0 && <p className="text-sm text-zinc-500 italic">Computing sky...</p>}
          </div>
        )}

        {/* Tab: Schedule */}
        {activeTab === 2 && (
          <div className="rounded-xl border border-zinc-800 bg-black/20 backdrop-blur-sm p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Today&apos;s Planetary Hours</p>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
              {ph.hourPlanets.map((hp) => (
                <div key={hp.hour} className={`text-center p-1.5 rounded-lg text-xs ${hp.planet === ph.currentPlanet ? "bg-zinc-700/60 border border-zinc-600" : "bg-zinc-800/30"}`}>
                  <p className="text-zinc-400">{String(hp.hour).padStart(2, "0")}:00</p>
                  <p className="text-lg">{hp.symbol}</p>
                  <p className="text-[10px] text-zinc-500">{hp.name}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-zinc-500 mt-3">
              Dawn ruler: {PLANET_NAMES[ph.dawn] || ph.dawn} · {ph.currentPlanet === "mercury" && <span className="text-yellow-400">Mercury hour now — ideal for daimon practice ✦</span>}
            </p>
          </div>
        )}

        {/* Tab: Layers */}
        {activeTab === 3 && (
          <div className="rounded-xl border border-zinc-800 bg-black/20 backdrop-blur-sm p-4">
            <p className="text-sm text-zinc-400 italic">Layer system will display Egyptian decans, Agrippa genius, Shem angels, Picatrix mansions, and other tradition overlays for today&apos;s activations.</p>
            {topSignal && (
              <div className="mt-4 p-3 rounded-lg bg-zinc-800/30">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">{PLANET_NAMES[topSignal.planet]} — Quick Correspondences</p>
                <div className="grid grid-cols-3 gap-2 text-xs text-zinc-400">
                  <span>Day: {["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][["sun","moon","mars","mercury","jupiter","venus","saturn"].indexOf(topSignal.planet) >= 0 ? ["sun","moon","mars","mercury","jupiter","venus","saturn"].indexOf(topSignal.planet) : 0]}</span>
                  <span>Hour: {ph.currentSymbol}</span>
                  <span>Daimon: {topSignal.daimon ? "✦ Active" : "—"}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab: Practices */}
        {activeTab === 4 && (
          <div className="rounded-xl border border-zinc-800 bg-black/20 backdrop-blur-sm p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Recommended Practices</p>
            {synthesis?.traditions?.[0]?.atmosphere_decoding ? (
              <div className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
                {/* Extract practice section from synthesis text */}
                {synthesis.traditions[0].atmosphere_decoding.includes("Practice") || synthesis.traditions[0].atmosphere_decoding.includes("practice") ? (
                  <div className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
                    {synthesis.traditions[0].atmosphere_decoding.split("\n").filter(l => l.toLowerCase().includes("practice") || l.toLowerCase().includes("daimon") || l.toLowerCase().includes("score")).join("\n") || "See the full analysis in the Today tab for practice recommendations."}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-500 italic">Practice recommendations are embedded in the Today tab analysis. Check the &quot;The Sky Today&quot; section for specific practices.</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-zinc-500 italic">No practice recommendations available.</p>
            )}
            <a href="/daimon" className="mt-3 inline-block text-xs text-yellow-500 hover:text-yellow-400">→ Daimon Practice Worksheet</a>
          </div>
        )}
      </div>

      <ChatBar daimonName={daimonName} topPlanet={topSignal?.planet || "mercury"} />
    </>
  );
}
