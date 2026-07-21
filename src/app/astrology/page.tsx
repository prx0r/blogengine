"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Engine, fmtLon } from "caelus";
import { embeddedData } from "caelus/data-embedded";
import { toUT } from "caelus-birth";
import { profectionAt, signRuler, SIGNS } from "caelus";
import { zrAt } from "caelus";
import { normalizeChart } from "@/astrology/caelus_adapter";
import { buildDailySphereReading, type ReaderInput } from "@/astrology/daily_sphere_reader";
import { PLANET_PROFILES } from "@/astrology/planet_profiles";
import { interpretPacket, type InterpretedReading } from "@/astrology/interpretation_schema";
import { buildActivationPacket } from "@/astrology/activation_packet";
import { computeFirdaria } from "@/astrology/activation_engine";
import type { PlanetId, DailySphereReading } from "@/astrology/types";
import type { PacketInput } from "@/astrology/activation_packet";
import { registerSpellbookInGraph } from "@/astrology/spellbook/spellbook";
import { pushActivationToGraph, graphRecommend, getGraph, registerSourceRulesInGraph, registerPlanetProfilesInGraph } from "@/astrology/knowledge_graph";
import Link from "next/link";

const SIGN_LABELS = ["Ari", "Tau", "Gem", "Can", "Leo", "Vir", "Lib", "Sco", "Sag", "Cap", "Aqu", "Pis"];

interface GeoResult { name: string; latitude: number; longitude: number; country: string; admin1?: string; }

// DAIMONIC_SYSTEM moved inline into sendChat()

export default function AstrologyPage() {
  const [engine, setEngine] = useState<Engine | null>(null);
  const [reading, setReading] = useState<DailySphereReading | null>(null);
  const [llmOutput, setLlmOutput] = useState("");
  const [llmLoading, setLlmLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{role: string; content: string}>>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [interpretation, setInterpretation] = useState<InterpretedReading | null>(null);
  const [form, setForm] = useState({
    name: "", year: 1990, month: 6, day: 15,
    hour: 12, minute: 0, lat: 51.5, lon: -0.12, placeName: "",
  });
  const [geoResults, setGeoResults] = useState<GeoResult[]>([]);
  const [geoSearching, setGeoSearching] = useState(false);
  const [geoOpen, setGeoOpen] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [graphRecs, setGraphRecs] = useState<Array<{
    planet: string; practiceId: string; label: string; reason: string;
    score: number; confidence: string; interpretations: string[];
    correspondences: string[]; daimon: boolean; converged: boolean;
  }>>([]);
  const geoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEngine(new Engine(embeddedData));
    registerSpellbookInGraph();
    registerSourceRulesInGraph();
    registerPlanetProfilesInGraph();
  }, []);

  // Load saved birth chart from profile on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) return;
        const data = await res.json();
        const bc = data.profile?.birthChart;
        if (bc) {
          setForm({
            name: bc.name || "",
            year: bc.year,
            month: bc.month,
            day: bc.day,
            hour: bc.hour,
            minute: bc.minute,
            lat: bc.lat,
            lon: bc.lon,
            placeName: bc.placeName || "",
          });
          setSaved(true);
        }
      } catch {}
      setProfileLoading(false);
    })();
  }, []);

  // Auto-compute when profile loads with saved chart
  useEffect(() => {
    if (!profileLoading && saved && engine) {
      computeFromProfile();
    }
  }, [profileLoading, saved, engine]);

  async function computeFromProfile() {
    if (!engine) return;
    try {
      const t = toUT({ year: form.year, month: form.month, day: form.day, hour: form.hour, minute: form.minute, lat: form.lat, lon: form.lon });
      const chart = engine.chart(t.utc.year, t.utc.month, t.utc.day, t.utc.hour, t.utc.minute, 0, form.lat, form.lon, "whole_sign");
      const normalized = normalizeChart(chart, form.name || "native");

      const now = new Date();
      const jdUt = now.getTime() / 86400000 + 2440587.5;
      const today = new Date();

      const currentSkyPlanets: Record<PlanetId, { lon: number; sign_index: number }> = {
        sun: { lon: engine.longitude("sun", jdUt), sign_index: 0 },
        moon: { lon: engine.longitude("moon", jdUt), sign_index: 0 },
        mercury: { lon: engine.longitude("mercury", jdUt), sign_index: 0 },
        venus: { lon: engine.longitude("venus", jdUt), sign_index: 0 },
        mars: { lon: engine.longitude("mars", jdUt), sign_index: 0 },
        jupiter: { lon: engine.longitude("jupiter", jdUt), sign_index: 0 },
        saturn: { lon: engine.longitude("saturn", jdUt), sign_index: 0 },
      };
      for (const key of Object.keys(currentSkyPlanets)) {
        currentSkyPlanets[key as PlanetId].sign_index = Math.floor(currentSkyPlanets[key as PlanetId].lon / 30) % 12;
      }

      const prof = profectionAt(engine, normalized.natal.jdUt, jdUt, form.lat, form.lon);
      const zr = zrAt(engine, normalized.natal.jdUt, jdUt, form.lat, form.lon, "spirit");
      const zrFort = zrAt(engine, normalized.natal.jdUt, jdUt, form.lat, form.lon, "fortune");

      const input: ReaderInput = {
        chart: normalized,
        currentSkyPlanets,
        currentSkyAspects: [],
        targetDate: today,
        profection: {
          annual: { house: prof.annual.house, sign: prof.annual.sign, lord: prof.annual.lord as PlanetId },
          monthly: { house: prof.monthly.house, sign: prof.monthly.sign, lord: prof.monthly.lord as PlanetId },
        },
        zrSpirit: zr && (zr as any).l1 ? { lord: signRuler(SIGNS.indexOf((zr as any).l1)) as PlanetId, sign: (zr as any).l1 } : undefined,
        zrFortune: zrFort && (zrFort as any).l1 ? { lord: signRuler(SIGNS.indexOf((zrFort as any).l1)) as PlanetId, sign: (zrFort as any).l1 } : undefined,
      };

      const result = buildDailySphereReading(input);
      setReading(result);
      setLlmOutput("");
    } catch (e) {
      console.error("Astrology error:", e);
    }
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (geoRef.current && !geoRef.current.contains(e.target as Node)) setGeoOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const searchPlace = useCallback((query: string) => {
    if (typeof window === "undefined") return;
    if (geoDebounce) clearTimeout(geoDebounce);
    if (query.length < 2) { setGeoResults([]); setGeoOpen(false); return; }
    geoDebounce = setTimeout(async () => {
      setGeoSearching(true);
      try {
        const res = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=en&format=json`
        );
        const data = await res.json();
        setGeoResults(data.results || []);
        setGeoOpen(true);
      } catch { setGeoResults([]); }
      setGeoSearching(false);
    }, 300);
  }, []);

  function selectPlace(place: GeoResult) {
    setForm(f => ({ ...f, lat: place.latitude, lon: place.longitude, placeName: `${place.name}${place.admin1 ? ", " + place.admin1 : ""}, ${place.country}` }));
    setGeoOpen(false);
    setGeoResults([]);
  }

  async function compute() {
    if (!engine) return;
    try {
      const t = toUT({ year: form.year, month: form.month, day: form.day, hour: form.hour, minute: form.minute, lat: form.lat, lon: form.lon });
      const chart = engine.chart(t.utc.year, t.utc.month, t.utc.day, t.utc.hour, t.utc.minute, 0, form.lat, form.lon, "whole_sign");
      const normalized = normalizeChart(chart, form.name || "native");

      const now = new Date();
      const jdUt = now.getTime() / 86400000 + 2440587.5;
      const today = new Date();

      const currentSkyPlanets: Record<PlanetId, { lon: number; sign_index: number }> = {
        sun: { lon: engine.longitude("sun", jdUt), sign_index: 0 },
        moon: { lon: engine.longitude("moon", jdUt), sign_index: 0 },
        mercury: { lon: engine.longitude("mercury", jdUt), sign_index: 0 },
        venus: { lon: engine.longitude("venus", jdUt), sign_index: 0 },
        mars: { lon: engine.longitude("mars", jdUt), sign_index: 0 },
        jupiter: { lon: engine.longitude("jupiter", jdUt), sign_index: 0 },
        saturn: { lon: engine.longitude("saturn", jdUt), sign_index: 0 },
      };
      for (const key of Object.keys(currentSkyPlanets)) {
        currentSkyPlanets[key as PlanetId].sign_index = Math.floor(currentSkyPlanets[key as PlanetId].lon / 30) % 12;
      }

      const prof = profectionAt(engine, normalized.natal.jdUt, jdUt, form.lat, form.lon);
      const zr = zrAt(engine, normalized.natal.jdUt, jdUt, form.lat, form.lon, "spirit");
      const zrFort = zrAt(engine, normalized.natal.jdUt, jdUt, form.lat, form.lon, "fortune");
      const firdaria = computeFirdaria(engine, normalized.natal.jdUt, jdUt, form.lat, form.lon);

      const input: ReaderInput = {
        chart: normalized, currentSkyPlanets, currentSkyAspects: [], targetDate: today,
        profection: {
          annual: { house: prof.annual.house, sign: prof.annual.sign, lord: prof.annual.lord as PlanetId },
          monthly: { house: prof.monthly.house, sign: prof.monthly.sign, lord: prof.monthly.lord as PlanetId },
        },
        zrSpirit: zr && (zr as any).l1 ? { lord: signRuler(SIGNS.indexOf((zr as any).l1)) as PlanetId, sign: (zr as any).l1 } : undefined,
        zrFortune: zrFort && (zrFort as any).l1 ? { lord: signRuler(SIGNS.indexOf((zrFort as any).l1)) as PlanetId, sign: (zrFort as any).l1 } : undefined,
      };

      const result = buildDailySphereReading(input);
      setReading(result);

      // Compute interpretations from the packet
      const packetInput: PacketInput = {
        chart: normalized, currentSkyPlanets, currentSkyAspects: [], targetDate: today,
        profection: {
          annual: { house: prof.annual.house, sign: prof.annual.sign, lord: prof.annual.lord as PlanetId },
          monthly: { house: prof.monthly.house, sign: prof.monthly.sign, lord: prof.monthly.lord as PlanetId },
        },
        zrSpirit: zr && (zr as any).l1 ? { lord: signRuler(SIGNS.indexOf((zr as any).l1)) as PlanetId, sign: (zr as any).l1 } : undefined,
        zrFortune: zrFort && (zrFort as any).l1 ? { lord: signRuler(SIGNS.indexOf((zrFort as any).l1)) as PlanetId, sign: (zrFort as any).l1 } : undefined,
        firdaria: firdaria.lord ? { lord: firdaria.lord as PlanetId } : undefined,
      };
      const packet = buildActivationPacket(packetInput);
      const oikodespotes = result.oikodespotes?.planet;
      const reading = interpretPacket(packet, oikodespotes);
      setInterpretation(reading);

      // Push activation to graph and generate detailed recommendations
      const allThemes = [
        ...reading.interpretations.al_khayyat,
        ...reading.interpretations.valens,
        ...reading.interpretations.ficino,
        ...reading.interpretations.greenbaum,
        ...reading.interpretations.demetra,
      ];
      pushActivationToGraph(
        packet.signals,
        allThemes.map(t => ({ planet: t.planet, tags: t.tags, system: t.system })),
        oikodespotes,
      );
      const g = getGraph();
      const recs = [];
      for (const sig of packet.signals) {
        const cluster = g.clusterByPlanet(sig.planet);
        const practices = cluster.edges.filter(e => e.predicate === "practice_for");
        const intEdges = cluster.edges.filter(e => e.predicate === "interpreted_by");
        const corrEdges = cluster.edges.filter(e => e.predicate === "corresponds_to");
        const daimonEdge = cluster.edges.find(e => e.predicate === "is_daimon");
        for (const e of practices) {
          const node = g.getNode(e.subject);
          const intLabels = intEdges.map(ie => {
            const n = g.getNode(ie.object);
            return n ? n.data?.system + ": " + n.label.slice(0, 60) : "";
          }).filter(Boolean).slice(0, 3);
          const corrLabels = corrEdges.map(ce => {
            const n = g.getNode(ce.object);
            return n ? n.label : "";
          }).filter(Boolean).slice(0, 6);
          recs.push({
            planet: sig.planet,
            practiceId: e.object,
            label: node?.label || e.object,
            reason: e.data?.confidence ? `Converged at ${e.data.confidence}` : `Active at ${sig.confidence}`,
            score: sig.score,
            confidence: sig.confidence,
            interpretations: intLabels,
            correspondences: corrLabels,
            daimon: !!daimonEdge,
            converged: reading.convergence.planets.includes(sig.planet),
          });
        }
      }
      recs.sort((a, b) => (b.converged ? 1 : 0) - (a.converged ? 1 : 0) || b.score - a.score);
      setGraphRecs(recs.slice(0, 12));

      setLlmOutput("");
    } catch (e) {
      console.error("Astrology error:", e);
    }
  }

  async function saveToProfile() {
    setSaving(true);
    try {
      const bodies: Record<string, any> = {};
      if (engine) {
        const t = toUT({ year: form.year, month: form.month, day: form.day, hour: form.hour, minute: form.minute, lat: form.lat, lon: form.lon });
        const chart = engine.chart(t.utc.year, t.utc.month, t.utc.day, t.utc.hour, t.utc.minute, 0, form.lat, form.lon, "whole_sign");
        for (const [key, val] of Object.entries(chart.bodies)) {
          const b = val as any;
          if (b && b.sign) bodies[key] = { sign: b.sign, lon: b.lon, house: b.house, retrograde: b.retrograde };
        }
      }
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          birthChart: {
            name: form.name,
            year: form.year, month: form.month, day: form.day,
            hour: form.hour, minute: form.minute,
            lat: form.lat, lon: form.lon,
            placeName: form.placeName || undefined,
            bodies,
          },
        }),
      });
      setSaved(true);
    } catch {}
    setSaving(false);
  }

  async function sendChat() {
    if (!chatInput.trim() || !interpretation) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    setChatMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setChatLoading(true);

    try {
      // Build system prompt with macro translation data
      const macroData = interpretation.macro;
      const timescalesText = `Year: H${macroData.timescales.year.profectionHouse} (${macroData.timescales.year.profectionHouseTheme}), lord ${macroData.timescales.year.profectionLord}.
Month: ${macroData.timescales.month ? `H${macroData.timescales.month.profectionHouse}, lord ${macroData.timescales.month.lord}` : "No distinct monthly activation"}.
Day: ${macroData.timescales.day.topSignals.map(s => `${s.planet} (${s.confidence})`).join(", ")}.`;

      const integratedText = macroData.integrated ? macroData.integrated.prevailing_temperament : "";

      const systemPrompt = `You are a daimonic guide. You have access to the user's astrological macro translation for today.

MACRO DATA:
${timescalesText}

INTEGRATED ANALYSIS:
${integratedText}

DOMINANT MODE: ${macroData.dominantMode}
DAIMON: ${macroData.oikodespotes || "not determined"}

RULES:
- Always reference the user's actual chart data from the readings above.
- When suggesting practices, ground them in the specific planet/sign/house data.
- Do not add planets or houses not present in the data.
- Keep responses concise (2-4 paragraphs).
- Ask questions to engage the user about their experience.`;

      const messages = [
        { role: "system", content: systemPrompt },
        ...chatMessages.map(m => ({ role: m.role, content: m.content })),
        { role: "user", content: userMsg },
      ];

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "deepseek-v4-flash", messages, temperature: 0.4, max_tokens: 2048 }),
      });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || "The daimon is silent.";
      setChatMessages(prev => [...prev, { role: "assistant", content }]);
    } catch (e: any) {
      setChatMessages(prev => [...prev, { role: "assistant", content: `Error: ${e.message}` }]);
    } finally {
      setChatLoading(false);
    }
  }

  const bodyLabel = (id: string) => ({ sun: "Sun", moon: "Moon", mercury: "Mercury", venus: "Venus", mars: "Mars", jupiter: "Jupiter", saturn: "Saturn" })[id] || id;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-6 inline-block">&larr; Feed</Link>

      <section className="mb-8">
        <p className="text-xs uppercase tracking-[0.18em] text-zinc-600 mb-2">Astrology</p>
        <h1 className="text-2xl font-bold mb-2">Daimonic Sphere Reading</h1>
        <p className="text-sm text-zinc-400 leading-relaxed max-w-2xl">
          Enter birth details to compute a deterministic DailySphereReading: current sky activation, timing systems, Fortune/Spirit split, Valens combinations, and daimonic alignment practice.
        </p>
      </section>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 mb-6">
        <h2 className="text-sm font-semibold text-zinc-300 mb-4">Birth Details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Name" value={form.name} onChange={(v) => setForm(f => ({ ...f, name: v }))} placeholder="e.g. Thomas Prior" className="sm:col-span-2" />
          <Input label="Year" type="number" value={form.year} onChange={(v) => setForm(f => ({ ...f, year: +v }))} />
          <Input label="Month" type="number" value={form.month} onChange={(v) => setForm(f => ({ ...f, month: +v }))} min={1} max={12} />
          <Input label="Day" type="number" value={form.day} onChange={(v) => setForm(f => ({ ...f, day: +v }))} min={1} max={31} />
          <Input label="Hour (24h)" type="number" value={form.hour} onChange={(v) => setForm(f => ({ ...f, hour: +v }))} min={0} max={23} />
          <Input label="Minute" type="number" value={form.minute} onChange={(v) => setForm(f => ({ ...f, minute: +v }))} min={0} max={59} />
          <div className="sm:col-span-2 relative" ref={geoRef}>
            <label className="block text-xs text-zinc-500 mb-1">Place of Birth</label>
            <div className="relative">
              <input type="text" value={form.placeName} onChange={(e) => { setForm(f => ({ ...f, placeName: e.target.value })); searchPlace(e.target.value); }}
                onFocus={() => { if (geoResults.length > 0) setGeoOpen(true); }}
                placeholder="Search city..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 pr-8 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
              />
              {geoSearching && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs animate-pulse">...</span>}
            </div>
            {geoOpen && geoResults.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl max-h-48 overflow-y-auto">
                {geoResults.map((r, i) => (
                  <button key={i} onClick={() => selectPlace(r)}
                    className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors border-b border-zinc-800 last:border-0"
                  >
                    <span className="text-zinc-200">{r.name}</span>
                    {r.admin1 && <span className="text-zinc-500">, {r.admin1}</span>}
                    <span className="text-zinc-600">, {r.country}</span>
                    <span className="text-zinc-700 ml-2 text-[10px]">{r.latitude.toFixed(3)}°, {r.longitude.toFixed(3)}°</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <Input label="Latitude" type="number" value={form.lat} onChange={(v) => setForm(f => ({ ...f, lat: +v }))} step="any" />
          <Input label="Longitude" type="number" value={form.lon} onChange={(v) => setForm(f => ({ ...f, lon: +v }))} step="any" />
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={compute}
            className="text-sm bg-violet-700 hover:bg-violet-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
          >
            Compute Reading
          </button>
          <button onClick={saveToProfile} disabled={saving || !form.name}
            className="text-sm border border-zinc-700 hover:border-zinc-500 disabled:opacity-40 text-zinc-400 hover:text-zinc-200 px-4 py-2 rounded-lg transition-colors"
          >
            {saving ? "..." : saved ? "Saved ✓" : "Save to Profile"}
          </button>
        </div>
      </div>

      {reading && (
        <div className="space-y-6">
          {/* Macro timescale context */}
          {interpretation && (
            <div className="rounded-xl border border-violet-800/30 bg-violet-950/10 p-5">
              <h2 className="text-sm font-semibold text-violet-300 mb-3">Current Timescapes</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-violet-950/20 rounded-lg p-3 border border-violet-800/20">
                  <p className="text-[10px] uppercase tracking-wider text-violet-400/60 mb-1">Year</p>
                  <p className="text-xs text-violet-200/80">H{interpretation.macro.timescales.year.profectionHouse} ({interpretation.macro.timescales.year.profectionHouseTheme}) · Lord {bodyLabel(interpretation.macro.timescales.year.profectionLord)}</p>
                  {interpretation.macro.timescales.year.firdariaLord && <p className="text-[10px] text-violet-300/60">Firdaria: {bodyLabel(interpretation.macro.timescales.year.firdariaLord)}</p>}
                  {interpretation.macro.timescales.year.zrSpirit && <p className="text-[10px] text-violet-300/60">ZR Spirit: {bodyLabel(interpretation.macro.timescales.year.zrSpirit.lord)}</p>}
                </div>
                <div className="bg-violet-950/20 rounded-lg p-3 border border-violet-800/20">
                  <p className="text-[10px] uppercase tracking-wider text-violet-400/60 mb-1">Month</p>
                  <p className="text-xs text-violet-200/80">{interpretation.macro.timescales.month ? `H${interpretation.macro.timescales.month.profectionHouse} · Lord ${bodyLabel(interpretation.macro.timescales.month.lord)}` : "No distinct monthly activation"}</p>
                </div>
                <div className="bg-violet-950/20 rounded-lg p-3 border border-violet-800/20">
                  <p className="text-[10px] uppercase tracking-wider text-violet-400/60 mb-1">Week / Sky</p>
                  <p className="text-xs text-violet-200/80">{interpretation.macro.timescales.week.skyAspects.slice(0, 2).join(", ") || "No major sky patterns"}</p>
                </div>
                <div className="bg-violet-950/20 rounded-lg p-3 border border-violet-800/20">
                  <p className="text-[10px] uppercase tracking-wider text-violet-400/60 mb-1">Day</p>
                  <p className="text-xs text-violet-200/80">{interpretation.macro.timescales.day.topSignals.map(s => bodyLabel(s.planet) + " (" + s.confidence + ")").join(", ")}</p>
                </div>
              </div>
              <div className="mt-3 text-xs text-violet-300/60 italic">
                Mode: {interpretation.macro.dominantMode} · Daimon: {interpretation.macro.oikodespotes ? bodyLabel(interpretation.macro.oikodespotes) : "—"}
              </div>
            </div>
          )}

          {/* Four-system interpretation */}
          {interpretation && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-zinc-300">Interpretations</h2>
              {interpretation.convergence.planets.length > 0 && (
                <div className="rounded-xl border border-emerald-800/40 bg-emerald-950/10 p-4">
                  <p className="text-xs uppercase tracking-wider text-emerald-400 mb-1">Convergence</p>
                  <p className="text-sm text-emerald-200/80">
                    {interpretation.convergence.planets.length} planets flagged across 3+ systems:
                    {" "}{interpretation.convergence.planets.join(", ")}
                  </p>
                  {interpretation.convergence.advice.length > 0 && (
                    <p className="text-xs text-emerald-400/60 mt-1">Shared advice: {interpretation.convergence.advice.slice(0, 3).join(" · ")}</p>
                  )}
                </div>
              )}
              {/* Integrated timescape analysis — replaces old per-planet macro readings */}
              {interpretation.macro.integrated && (
                <div className="rounded-xl border border-violet-800/30 bg-violet-950/5 p-4">
                  <p className="text-xs uppercase tracking-wider text-violet-400 mb-2">★ Integrated Timescape Analysis</p>
                  <p className="text-sm text-violet-200/80 leading-relaxed">{interpretation.macro.integrated.prevailing_temperament}</p>
                  <div className="grid gap-2 sm:grid-cols-2 mt-3">
                    <div className="p-2 rounded bg-red-950/10 border border-red-800/20">
                      <p className="text-[10px] text-red-400/60">Tensions ({interpretation.macro.integrated.tensions.length})</p>
                      {interpretation.macro.integrated.tensions.map((t, i) => (
                        <p key={i} className="text-[10px] text-red-300/80">{t.description}</p>
                      ))}
                    </div>
                    <div className="p-2 rounded bg-emerald-950/10 border border-emerald-800/20">
                      <p className="text-[10px] text-emerald-400/60">Ease ({interpretation.macro.integrated.eases.length})</p>
                      {interpretation.macro.integrated.eases.map((e, i) => (
                        <p key={i} className="text-[10px] text-emerald-300/80">{e.description}</p>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {/* Graph-backed practice recommendations */}
              {graphRecs.length > 0 && (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
                  <p className="text-xs uppercase tracking-wider text-zinc-600 mb-2">
                    Recommended Practices
                    <span className="text-[9px] text-zinc-600 ml-2">graph-backed · sorted by convergence</span>
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {graphRecs.slice(0, 8).map((r, i) => (
                      <div key={i} className={`rounded-lg p-3 border ${r.daimon ? "border-amber-500/40 bg-amber-500/5" : r.converged ? "border-emerald-500/30 bg-emerald-500/5" : "border-zinc-700/30 bg-zinc-800/30"}`}>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-bold uppercase text-zinc-400">{r.planet}</span>
                          {r.daimon && <span className="text-[9px] px-1 py-0.5 rounded bg-amber-500/20 text-amber-400">daimon</span>}
                          {r.converged && <span className="text-[9px] px-1 py-0.5 rounded bg-emerald-500/20 text-emerald-400">converged</span>}
                          <span className={`text-[9px] ml-auto ${r.confidence === "high" ? "text-emerald-400" : "text-zinc-500"}`}>{r.confidence}</span>
                        </div>
                        <p className="text-xs font-medium text-zinc-200 mb-0.5">{r.label}</p>
                        <p className="text-[9px] text-zinc-500 mb-1">Score {r.score} · {r.reason}</p>
                        {r.interpretations.length > 0 && (
                          <div className="mb-1">
                            <p className="text-[8px] uppercase tracking-wider text-zinc-600 mb-0.5">Why</p>
                            {r.interpretations.map((int, j) => (
                              <p key={j} className="text-[9px] text-zinc-400 leading-tight">{int}</p>
                            ))}
                          </div>
                        )}
                        {r.correspondences.length > 0 && (
                          <div>
                            <p className="text-[8px] uppercase tracking-wider text-zinc-600 mb-0.5">Correspondences</p>
                            <p className="text-[9px] text-zinc-500">{r.correspondences.join(" · ")}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                {(["al_khayyat", "valens", "ficino", "greenbaum", "demetra"] as const).map(sys => {
                  const themes = interpretation.interpretations[sys];
                  const labels = { al_khayyat: "al-Khayyāt (9th C)", valens: "Valens (2nd C)", ficino: "Ficino (Renaissance)", greenbaum: "Greenbaum (modern)", demetra: "Demetra George (2022)" };
                  return (
                    <div key={sys} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
                      <p className="text-[10px] uppercase tracking-wider text-zinc-600 mb-2">{labels[sys]}</p>
                      {themes.slice(0, 3).map((t, i) => (
                        <div key={i} className="mb-2 last:mb-0">
                          <p className="text-xs font-medium text-zinc-200">{t.title}</p>
                          <p className="text-xs text-zinc-400">{t.body}</p>
                          {t.practice && t.practice.length > 0 && (
                            <p className="text-[10px] text-zinc-500 mt-0.5">→ {t.practice.slice(0, 2).join(", ")}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <div className="h-4" />

          {/* Activation summary */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
            <h2 className="text-sm font-semibold text-zinc-300 mb-3">Current Activation</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-4">
              <Metric label="Confidence" value={reading.natal_activation.confidence} />
              <Metric label="Mode" value={reading.daimonic_interpretation.mode} />
              <Metric label="Active Planets" value={reading.natal_activation.activated_planets.map(bodyLabel).join(", ")} />
              <Metric label="Active Houses" value={reading.natal_activation.activated_houses.join(", ")} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Metric label="Active Lots" value={reading.natal_activation.activated_lots.join(", ") || "none"} />
              <Metric label="Active Topics" value={reading.natal_activation.activated_topics.slice(0, 4).join(", ")} />
              <Metric label="Timescales" value={["daily", "weekly", "monthly", "yearly"].filter(t => (reading.atmosphere as any)[t]?.applicable).join(", ")} />
              <Metric label="Alignments" value={reading.alignment.map(a => `${bodyLabel(a.planet)} (${a.mode})`).join(", ")} />
            </div>
          </div>

          {/* Timescale breakdown */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(["yearly", "monthly", "daily", "weekly"] as const).map(ts => {
              const slice = reading.atmosphere[ts];
              return (
                <div key={ts} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
                  <h3 className="text-xs uppercase tracking-wider text-zinc-600 mb-2">{ts}</h3>
                  {slice.applicable ? (
                    <ul className="space-y-1">
                      {slice.activations.slice(0, 3).map((a, i) => (
                        <li key={i} className="text-xs text-zinc-400">{a.description}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-zinc-600 italic">No significant activation</p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Oikodespotes — Personal Daimon */}
          {reading.oikodespotes && (
            <div className="rounded-xl border border-amber-800/50 bg-amber-950/10 p-5">
              <h2 className="text-sm font-semibold text-amber-300 mb-2">Personal Daimon (Oikodespotes)</h2>
              <p className="text-sm text-amber-200 font-medium mb-1">{bodyLabel(reading.oikodespotes.planet)} — {reading.oikodespotes.interpretation}</p>
              {reading.oikodespotes.soul_choice && (
                <div className="mt-3 p-3 rounded-lg bg-amber-950/20 border border-amber-800/30">
                  <p className="text-xs uppercase tracking-wider text-amber-400/60 mb-1">Why this daimon chose this life</p>
                  <p className="text-sm text-amber-200/80 leading-relaxed">{reading.oikodespotes.soul_choice}</p>
                </div>
              )}
              <p className="text-xs text-amber-400/40 mt-2">Score: {reading.oikodespotes.score} · Found via: {reading.oikodespotes.points_considered.join(", ")}</p>
            </div>
          )}

          {/* Chart Similarity — nearest neighbors */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
            <h2 className="text-sm font-semibold text-zinc-300 mb-3">Chart Echoes</h2>
            <p className="text-xs text-zinc-500 mb-3">People whose natal chart structure most closely resembles yours. These are the careers and paths your daimonic signature aligns with.</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-zinc-800/30 rounded-lg p-3 border border-zinc-700/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-zinc-300">{SIMILARITY_DATA[i]?.name || "—"}</span>
                    <span className="text-[10px] text-zinc-500">{SIMILARITY_DATA[i]?.match || "—"}</span>
                  </div>
                  <p className="text-[10px] text-zinc-600">{SIMILARITY_DATA[i]?.domain || ""}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Daimonic Houses */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <DaimonicHouseCard title="Good Fortune" tag="good_fortune" data={reading.daimonic_houses.good_fortune} bodyLabel={bodyLabel} />
            <DaimonicHouseCard title="Good Daimon" tag="good_daimon" data={reading.daimonic_houses.good_daimon} bodyLabel={bodyLabel} />
            <DaimonicHouseCard title="Bad Fortune" tag="bad_fortune" data={reading.daimonic_houses.bad_fortune} bodyLabel={bodyLabel} />
            <DaimonicHouseCard title="Bad Daimon" tag="bad_daimon" data={reading.daimonic_houses.bad_daimon} bodyLabel={bodyLabel} />
          </div>

          {/* Planet conditions */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
            <h2 className="text-sm font-semibold text-zinc-300 mb-3">Planetary Condition</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {reading.planet_conditions.filter(c => c.house > 0).map(c => (
                <div key={c.planet} className="bg-zinc-800/40 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-zinc-200">{bodyLabel(c.planet)}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      c.angularity === "angular" ? "bg-violet-950/40 text-violet-400" :
                      c.angularity === "succedent" ? "bg-zinc-800 text-zinc-400" :
                      "bg-zinc-900 text-zinc-600"
                    }`}>{c.angularity}</span>
                  </div>
                  <p className="text-xs text-zinc-500">{c.sign} · House {c.house} {c.daimonic_tag ? `· ${c.daimonic_tag.replace("_", " ")}` : ""}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {c.essential_dignity.map((d, i) => (
                      <span key={i} className={`text-[10px] px-1 py-0.5 rounded ${
                        d === "domicile" || d === "exaltation" ? "bg-emerald-950/40 text-emerald-400" :
                        d === "detriment" || d === "fall" ? "bg-red-950/40 text-red-400" :
                        "bg-zinc-800 text-zinc-500"
                      }`}>{d}</span>
                    ))}
                    {c.peregrine && <span className="text-[10px] px-1 py-0.5 rounded bg-zinc-800 text-zinc-600">peregrine</span>}
                    {c.retrograde && <span className="text-[10px] px-1 py-0.5 rounded bg-amber-950/40 text-amber-400">Rx</span>}
                    {c.sect_status !== "neutral" && (
                      <span className={`text-[10px] px-1 py-0.5 rounded ${
                        c.sect_status === "in_sect" ? "bg-emerald-950/40 text-emerald-400" : "bg-red-950/40 text-red-400"
                      }`}>{c.sect_status}</span>
                    )}
                    {c.triplicity_rulers.length > 0 && (
                      <span className="text-[10px] px-1 py-0.5 rounded bg-zinc-800 text-zinc-500" title={`Triplicity rulers: ${c.triplicity_rulers.join(", ")}`}>
                        tri
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fortune/Spirit layer */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className={`rounded-xl border p-5 ${reading.fortune_layer.active ? "border-zinc-700 bg-zinc-900/40" : "border-zinc-800/50 bg-zinc-900/20 opacity-60"}`}>
              <h2 className="text-sm font-semibold text-zinc-300 mb-2">Fortune Layer</h2>
              <p className={`text-xs mb-2 ${reading.fortune_layer.active ? "text-zinc-400" : "text-zinc-600"}`}>
                {reading.fortune_layer.active ? "Active" : "Inactive"}
              </p>
              {reading.fortune_layer.active && (
                <div className="space-y-1 text-xs text-zinc-400">
                  <p>Lot of Fortune: House {reading.fortune_layer.lot_house}</p>
                  <p>Topics: {reading.fortune_layer.lot_house_topics.join(", ")}</p>
                  <p>Confidence: {reading.fortune_layer.confidence}</p>
                </div>
              )}
            </div>
            <div className={`rounded-xl border p-5 ${reading.spirit_layer.active ? "border-zinc-700 bg-zinc-900/40" : "border-zinc-800/50 bg-zinc-900/20 opacity-60"}`}>
              <h2 className="text-sm font-semibold text-zinc-300 mb-2">Spirit / Daimon Layer</h2>
              <p className={`text-xs mb-2 ${reading.spirit_layer.active ? "text-zinc-400" : "text-zinc-600"}`}>
                {reading.spirit_layer.active ? "Active" : "Inactive"}
              </p>
              {reading.spirit_layer.active && (
                <div className="space-y-1 text-xs text-zinc-400">
                  <p>Lot of Spirit: House {reading.spirit_layer.lot_house}</p>
                  <p>Topics: {reading.spirit_layer.lot_house_topics.join(", ")}</p>
                  <p>Confidence: {reading.spirit_layer.confidence}</p>
                </div>
              )}
            </div>
          </div>

          {/* Daimonic interpretation */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
            <h2 className="text-sm font-semibold text-zinc-300 mb-3">Daimonic Interpretation</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wider text-zinc-600 mb-2">Life Activity</p>
                <div className="flex flex-wrap gap-1">
                  {reading.daimonic_interpretation.life_activity.map((a, i) => (
                    <span key={i} className="text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded">{a}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-zinc-600 mb-2">Opportunity</p>
                <div className="flex flex-wrap gap-1">
                  {reading.daimonic_interpretation.opportunity.map((o, i) => (
                    <span key={i} className="text-xs bg-emerald-950/40 text-emerald-400 px-2 py-1 rounded">{o}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-zinc-600 mb-2">Pressure</p>
                <div className="flex flex-wrap gap-1">
                  {reading.daimonic_interpretation.pressure.map((p, i) => (
                    <span key={i} className="text-xs bg-red-950/40 text-red-400 px-2 py-1 rounded">{p}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-zinc-600 mb-2">Distortion to Watch</p>
                <div className="flex flex-wrap gap-1">
                  {reading.daimonic_interpretation.distortion.map((d, i) => (
                    <span key={i} className="text-xs bg-amber-950/40 text-amber-400 px-2 py-1 rounded">{d}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Ficinian alignment */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reading.alignment.map(a => {
              const profile = PLANET_PROFILES[a.planet];
              return (
                <div key={a.planet} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-zinc-200">{bodyLabel(a.planet)}</span>
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-zinc-500">{a.mode}</span>
                  </div>
                  {profile && (
                    <>
                      <p className="text-xs text-zinc-500 mb-2">{profile.daimonic_function.join(" · ")}</p>
                      <div className="space-y-1 text-xs text-zinc-400">
                        {a.colour.length > 0 && <p>Colour: {a.colour.join(", ")}</p>}
                        {a.scent_or_symbolic_herb.length > 0 && <p>Scent: {a.scent_or_symbolic_herb.join(", ")}</p>}
                        {a.activity.length > 0 && <p>Practice: {a.activity.slice(0, 3).join(", ")}</p>}
                        {a.music.length > 0 && <p>Music: {a.music.slice(0, 2).join(", ")}</p>}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Daimonic Chat */}
          {interpretation && (
            <div className="rounded-xl border border-amber-800/30 bg-amber-950/5 p-5">
              <h2 className="text-sm font-semibold text-amber-300 mb-3">Converse with Your Daimon</h2>
              <p className="text-xs text-amber-400/60 mb-4">Ask about today's influences, practices, or what to pay attention to. The daimon responds based on your actual chart data.</p>
              <div ref={chatRef} className="space-y-3 mb-4 max-h-80 overflow-y-auto">
                {chatMessages.length === 0 && (
                  <p className="text-xs text-zinc-500 italic">Try: "What should I focus on today?" or "I'm feeling scattered — what does my chart say?"</p>
                )}
                {chatMessages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] rounded-xl px-4 py-2 text-xs leading-relaxed ${
                      m.role === "user" ? "bg-zinc-700 text-zinc-200" : "bg-zinc-800/50 border border-zinc-700/50 text-zinc-300"
                    }`}>
                      {m.content}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="text-xs text-zinc-500 italic px-2">Consulting the daimon...</div>
                  </div>
                )}
              </div>
              <form onSubmit={(e) => { e.preventDefault(); sendChat(); }} className="flex gap-2">
                <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)}
                  placeholder="Ask your daimon..." disabled={chatLoading}
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 disabled:opacity-40"
                />
                <button type="submit" disabled={chatLoading || !chatInput.trim()}
                  className="bg-amber-700 hover:bg-amber-600 disabled:opacity-40 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  Ask
                </button>
              </form>
            </div>
          )}

          {/* Raw packet */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
            <button onClick={() => setShowRaw(!showRaw)}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {showRaw ? "Hide" : "Show"} Raw Packet
            </button>
            {showRaw && (
              <pre className="mt-3 text-xs text-zinc-500 overflow-x-auto max-h-[600px] overflow-y-auto">
                {JSON.stringify(reading, null, 2)}
              </pre>
            )}
          </div>

          {/* Ritual references */}
          {reading.ritual_references.length > 0 && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
              <h2 className="text-sm font-semibold text-zinc-300 mb-3">Ritual References</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {reading.ritual_references.slice(0, 4).map(ref => (
                  <div key={ref.id} className="border border-zinc-800 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-zinc-200">{ref.source}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                        ref.safety_class === "safe_symbolic" ? "bg-emerald-950/40 text-emerald-400" :
                        ref.safety_class === "historical_reference" ? "bg-amber-950/40 text-amber-400" :
                        "bg-red-950/40 text-red-400"
                      }`}>{ref.safety_class}</span>
                    </div>
                    <p className="text-xs text-zinc-400 mb-1">{ref.historical_summary.slice(0, 120)}</p>
                    <p className="text-xs text-zinc-500">Safe: {ref.safe_adaptation.slice(0, 2).join(" · ")}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Antiscia */}
          {reading.antiscia.length > 0 && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
              <h2 className="text-sm font-semibold text-zinc-300 mb-3">Antiscia (Hidden Connections)</h2>
              <div className="space-y-1">
                {reading.antiscia.map((a, i) => (
                  <p key={i} className="text-xs text-zinc-400">{bodyLabel(a.planet_a)} ↔ {bodyLabel(a.planet_b)} (orb {a.orb.toFixed(1)}°)</p>
                ))}
              </div>
            </div>
          )}

          {/* Bonification/Maltreatment */}
          {reading.bonification.length > 0 && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
              <h2 className="text-sm font-semibold text-zinc-300 mb-3">Bonification & Maltreatment</h2>
              <div className="space-y-1">
                {reading.bonification.slice(0, 8).map((b, i) => (
                  <p key={i} className={`text-xs ${b.beneficial ? "text-emerald-400" : "text-red-400"}`}>
                    {b.type}: {b.description}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Graph trace */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
            <h2 className="text-sm font-semibold text-zinc-300 mb-3">Graph Trace</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wider text-zinc-600 mb-2">Why this planet</p>
                <ul className="space-y-1">
                  {reading.graph_trace.why_this_planet.slice(0, 5).map((w, i) => (
                    <li key={i} className="text-xs text-zinc-400">• {w}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-zinc-600 mb-2">Source edges</p>
                <ul className="space-y-1">
                  {reading.graph_trace.source_edges.slice(0, 5).map((e, i) => (
                    <li key={i} className="text-xs text-zinc-400">• {e}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const SIMILARITY_DATA = [
  { name: "Bernard Champigneulle", match: "51.6%", domain: "Writer" },
  { name: "Michel Butor", match: "48.8%", domain: "Novelist, Poet" },
  { name: "Alessandro Bonsanti", match: "47.6%", domain: "Writer" },
  { name: "Ulysse Butin", match: "50.7%", domain: "Painter" },
  { name: "Francisque Barret", match: "51.9%", domain: "Scientist" },
  { name: "Huguette Bouchardeau", match: "51.7%", domain: "Politician" },
];

let geoDebounce: ReturnType<typeof setTimeout> | null = null;

function Input({ label, value, onChange, type = "text", min, max, step, placeholder, className = "" }: {
  label: string; value: string | number; onChange: (v: string) => void;
  type?: string; min?: number; max?: number; step?: string; placeholder?: string; className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-xs text-zinc-500 mb-1">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        min={min} max={max} step={step} placeholder={placeholder}
        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
      />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-zinc-800/40 rounded-lg p-3">
      <p className="text-[10px] uppercase tracking-wider text-zinc-600 mb-1">{label}</p>
      <p className="text-sm text-zinc-200 font-medium capitalize">{value}</p>
    </div>
  );
}

function DaimonicHouseCard({ title, tag, data, bodyLabel }: {
  title: string; tag: string; data: { house: number; planets: string[] }; bodyLabel: (id: string) => string;
}) {
  const colors: Record<string, string> = {
    good_fortune: "border-emerald-800/50 bg-emerald-950/10",
    good_daimon: "border-sky-800/50 bg-sky-950/10",
    bad_fortune: "border-red-800/50 bg-red-950/10",
    bad_daimon: "border-purple-800/50 bg-purple-950/10",
  };
  const textColors: Record<string, string> = {
    good_fortune: "text-emerald-300",
    good_daimon: "text-sky-300",
    bad_fortune: "text-red-300",
    bad_daimon: "text-purple-300",
  };
  return (
    <div className={`rounded-xl border p-4 ${colors[tag] || "border-zinc-800 bg-zinc-900/40"}`}>
      <h3 className={`text-xs uppercase tracking-wider mb-1 ${textColors[tag] || "text-zinc-400"}`}>{title}</h3>
      <p className="text-xs text-zinc-500 mb-1">House {data.house}</p>
      <p className="text-xs text-zinc-400">
        {data.planets.length > 0 ? data.planets.map(bodyLabel).join(", ") : "—"}
      </p>
    </div>
  );
}
