"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Engine, fmtLon, profectionAt, signRuler, SIGNS, zrAt } from "caelus";
import { embeddedData } from "caelus/data-embedded";
import { toUT } from "caelus-birth";
import { ChartWheel } from "caelus-wheel";
import { normalizeChart } from "@/astrology/caelus_adapter";
import { buildActivationPacket, type PacketInput } from "@/astrology/activation_packet";
import { interpretPacket, type InterpretedReading } from "@/astrology/interpretation_schema";
import { buildMacroTranslation } from "@/astrology/interpreters/aggregator";
import { computeFirdaria, findSkyAspects } from "@/astrology/activation_engine";
import { computeDaimonName, type DaimonNameResult } from "@/astrology/genius-name";
import { buildDailySphereReading, type ReaderInput } from "@/astrology/daily_sphere_reader";
import { PLANET_PROFILES } from "@/astrology/planet_profiles";
import { registerSpellbookInGraph } from "@/astrology/spellbook/spellbook";
import { pushActivationToGraph, graphRecommend, getGraph, registerSourceRulesInGraph, registerPlanetProfilesInGraph } from "@/astrology/knowledge_graph";
import { synthesizeDaily, type DailySynthesis } from "@/astrology/synthesis";
import type { LLMSynthesisOutput, LLMSynthesisInput } from "@/astrology/llm-synthesis";
import type { FicinianOutput } from "@/astrology/ficino-synthesis";
import type { PlanetId, DailySphereReading } from "@/astrology/types";
import Link from "next/link";

const SIGN_LABELS = ["Ari", "Tau", "Gem", "Can", "Leo", "Vir", "Lib", "Sco", "Sag", "Cap", "Aqu", "Pis"];

interface SavedChart {
  name: string;
  data: {
    year: number; month: number; day: number;
    hour: number; minute: number;
    lat: number; lon: number;
    placeName?: string;
  };
  savedAt: string;
}

interface FormData {
  name: string;
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  lat: number;
  lon: number;
  placeName: string;
}

interface GeoResult {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
}

const PLANET_LABELS: Record<string, string> = {
  sun: "Sun", moon: "Moon", mercury: "Mercury", venus: "Venus",
  mars: "Mars", jupiter: "Jupiter", saturn: "Saturn", uranus: "Uranus",
  neptune: "Neptune", pluto: "Pluto", chiron: "Chiron",
  mean_node: "Mean Node", true_node: "True Node",
};

const ASPECT_LABELS: Record<string, string> = {
  conjunction: "Conjunction \u260c", sextile: "Sextile \u26b9", square: "Square \u25a1",
  trine: "Trine \u25b3", opposition: "Opposition \u260d", quincunx: "Quincunx \u26bb",
  semi_sextile: "Semi-Sextile \u26ba", semi_square: "Semi-Square \u2220",
  sesquiquadrate: "Sesquiquadrate \u26bc", quintile: "Quintile \u2b1f",
};

const STORAGE_KEY = "birth-charts-v1";
let geoDebounce: ReturnType<typeof setTimeout> | null = null;

function loadSavedCharts(): SavedChart[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
}

function saveChart(chart: SavedChart) {
  const all = loadSavedCharts();
  const idx = all.findIndex((c) => c.name === chart.name);
  if (idx >= 0) all[idx] = chart;
  else all.push(chart);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

function deleteChart(name: string) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(loadSavedCharts().filter((c) => c.name !== name)));
}

const bodyLabel = (id: string) => PLANET_LABELS[id] || id;

export default function BirthChartPage() {
  const [engine, setEngine] = useState<Engine | null>(null);
  const [form, setForm] = useState<FormData>({
    name: "", year: 1990, month: 6, day: 15,
    hour: 12, minute: 0, lat: 51.5, lon: -0.12, placeName: "",
  });
  const [chart, setChart] = useState<any>(null);
  const [saved, setSaved] = useState<SavedChart[]>([]);
  const [tab, setTab] = useState<"chart" | "analysis">("chart");
  const [reading, setReading] = useState<DailySphereReading | null>(null);
  const [interpretation, setInterpretation] = useState<InterpretedReading | null>(null);
  const [synthesis, setSynthesis] = useState<DailySynthesis | null>(null);
  const [llmSynthesis, setLlmSynthesis] = useState<LLMSynthesisOutput | null>(null);
  const [ficinianSynthesis, setFicinianSynthesis] = useState<FicinianOutput | null>(null);
  const [llmLoading, setLlmLoading] = useState(false);
  const [ficinianLoading, setFicinianLoading] = useState(false);
  const [llmError, setLlmError] = useState<string | null>(null);
  const llmInputRef = useRef<LLMSynthesisInput | null>(null);
  const recsRef = useRef<any[]>([]);
  const [packetData, setPacketData] = useState<any>(null);
  const [daimonName, setDaimonName] = useState<DaimonNameResult | null>(null);
  const [computing, setComputing] = useState(false);
  const [graphRecs, setGraphRecs] = useState<Array<{
    planet: string; practiceId: string; label: string; reason: string;
    score: number; confidence: string; interpretations: string[];
    correspondences: string[]; daimon: boolean; converged: boolean;
  }>>([]);
  const wheelRef = useRef<HTMLDivElement>(null);
  const [editingName, setEditingName] = useState<string>("");
  const [geoResults, setGeoResults] = useState<GeoResult[]>([]);
  const [geoSearching, setGeoSearching] = useState(false);
  const [geoOpen, setGeoOpen] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const geoRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const [showRaw, setShowRaw] = useState(false);
  const [analysisSubTab, setAnalysisSubTab] = useState<string>("Overview");

  useEffect(() => {
    const eng = new Engine(embeddedData);
    setEngine(eng);
    setSaved(loadSavedCharts());
    registerSpellbookInGraph();
    registerSourceRulesInGraph();
    registerPlanetProfilesInGraph();
    if (!localStorage.getItem("client_id")) {
      localStorage.setItem("client_id", crypto.randomUUID());
    }
    // Auto-load last saved chart
    const savedCharts = loadSavedCharts();
    if (savedCharts.length > 0) {
      const last = savedCharts[savedCharts.length - 1];
      const savedData = localStorage.getItem(`chart_${last.name}`);
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          setForm(parsed.form || form);
          if (parsed.chart) setChart(parsed.chart);
          if (parsed.reading) setReading(parsed.reading);
          if (parsed.interpretation) setInterpretation(parsed.interpretation);
          if (parsed.synthesis) setSynthesis(parsed.synthesis);
          if (parsed.llmSynthesis) setLlmSynthesis(parsed.llmSynthesis);
          if (parsed.ficinianSynthesis) setFicinianSynthesis(parsed.ficinianSynthesis);
          if (parsed.daimonName) setDaimonName(parsed.daimonName);
          if (parsed.analysisSubTab) setAnalysisSubTab(parsed.analysisSubTab);
          if (parsed.tab) setTab(parsed.tab);
        } catch {}
      }
    }
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (geoRef.current && !geoRef.current.contains(e.target as Node)) {
        setGeoOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (!wheelRef.current || !chart) return;
    const els = wheelRef.current.querySelectorAll<SVGTextElement>("text[id^='sg-']");
    els.forEach((el) => {
      const idx = parseInt(el.id.replace("sg-", ""), 10);
      if (idx >= 0 && idx < SIGN_LABELS.length) {
        el.textContent = SIGN_LABELS[idx];
      }
    });
  }, [chart]);

  const searchPlace = useCallback((query: string) => {
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
    setForm((f) => ({
      ...f,
      lat: place.latitude,
      lon: place.longitude,
      placeName: `${place.name}${place.admin1 ? ", " + place.admin1 : ""}, ${place.country}`,
    }));
    setGeoOpen(false);
    setGeoResults([]);
  }

  async function compute() {
    if (!engine) return;
    setComputing(true);
    try {
      const t = toUT({
        year: form.year, month: form.month, day: form.day,
        hour: form.hour, minute: form.minute,
        lat: form.lat, lon: form.lon,
      });
      const c = engine.chart(t.utc.year, t.utc.month, t.utc.day, t.utc.hour, t.utc.minute, 0, form.lat, form.lon, "whole_sign");
      setChart(c);

      const normalized = normalizeChart(c, form.name || "native");

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

      const currentSkyAspects = findSkyAspects(currentSkyPlanets);

      const prof = profectionAt(engine, normalized.natal.jdUt, jdUt, form.lat, form.lon);
      const zr = zrAt(engine, normalized.natal.jdUt, jdUt, form.lat, form.lon, "spirit");
      const zrFort = zrAt(engine, normalized.natal.jdUt, jdUt, form.lat, form.lon, "fortune");
      const firdaria = computeFirdaria(engine, normalized.natal.jdUt, jdUt, form.lat, form.lon);

      const readerInput: ReaderInput = {
        chart: normalized, currentSkyPlanets, currentSkyAspects, targetDate: today,
        profection: {
          annual: { house: prof.annual.house, sign: prof.annual.sign, lord: prof.annual.lord as PlanetId },
          monthly: { house: prof.monthly.house, sign: prof.monthly.sign, lord: prof.monthly.lord as PlanetId },
        },
        zrSpirit: zr && (zr as any).l1 ? { lord: signRuler(SIGNS.indexOf((zr as any).l1)) as PlanetId, sign: (zr as any).l1 } : undefined,
        zrFortune: zrFort && (zrFort as any).l1 ? { lord: signRuler(SIGNS.indexOf((zrFort as any).l1)) as PlanetId, sign: (zrFort as any).l1 } : undefined,
      };

      const result = buildDailySphereReading(readerInput);
      setReading(result);

      const packetInput: PacketInput = {
        chart: normalized, currentSkyPlanets, currentSkyAspects, targetDate: today,
        profection: {
          annual: { house: prof.annual.house, sign: prof.annual.sign, lord: prof.annual.lord as PlanetId },
          monthly: { house: prof.monthly.house, sign: prof.monthly.sign, lord: prof.monthly.lord as PlanetId },
        },
        zrSpirit: zr && (zr as any).l1 ? { lord: signRuler(SIGNS.indexOf((zr as any).l1)) as PlanetId, sign: (zr as any).l1 } : undefined,
        zrFortune: zrFort && (zrFort as any).l1 ? { lord: signRuler(SIGNS.indexOf((zrFort as any).l1)) as PlanetId, sign: (zrFort as any).l1 } : undefined,
        firdaria: firdaria.lord ? { lord: firdaria.lord as PlanetId } : undefined,
      };
      const packet = buildActivationPacket(packetInput);
      setPacketData(packet);
      const oikodespotes = result.oikodespotes?.planet;
      const interpreted = interpretPacket(packet, oikodespotes);
      setInterpretation(interpreted);

      const macro = buildMacroTranslation(packet, oikodespotes);
      const dailySynthesis = synthesizeDaily(packet, normalized, macro);
      setSynthesis(dailySynthesis);

      // Compute daimon name from Agrippa's method
      const sunPos = normalized.natal.planets.sun;
      const moonPos = normalized.natal.planets.moon;
      const ascDeg = normalized.natal.ascendant.degree_absolute;
      const fortuneDeg = normalized.natal.lots.fortune.degree_absolute;
      const isDay = normalized.natal.day_chart;
      // Estimate prenatal syzygy from lunar phase
      const synodicMonth = 29.53059;
      const lunarPhase = ((moonPos.degree_absolute - sunPos.degree_absolute) % 360 + 360) % 360;
      const daysSinceSyzygy = lunarPhase / 360 * synodicMonth;
      const isAfterNewMoon = daysSinceSyzygy < synodicMonth / 2;
      const effectiveDays = isAfterNewMoon ? daysSinceSyzygy : daysSinceSyzygy - synodicMonth / 2;
      const syzygyDeg = ((sunPos.degree_absolute - effectiveDays * 0.9856) + 360) % 360;
      const daimonResult = computeDaimonName({
        isDayBirth: isDay,
        sunDeg: sunPos.degree_absolute,
        moonDeg: moonPos.degree_absolute,
        ascDeg,
        fortuneDeg,
        syzygyDeg,
      });
      setDaimonName(daimonResult);

      // Compute graphRecs FIRST, then fire LLM pipeline (so practices are available)
      const g = getGraph();
      const recs: Array<{planet: string; label: string; score: number; daimon: boolean; converged: boolean; reason: string; confidence: string; interpretations: string[]; correspondences: string[]; practiceId: string}> = [];
      const orbCounts = new Map<string, number>();
      for (const act of packet.atmosphere.daily.activations) {
        const orbMatch = act.description.match(/orb (\d+\.?\d*)°/);
        if (!orbMatch) continue;
        const orb = parseFloat(orbMatch[1]);
        if (orb >= 3) continue;
        for (const p of ["sun","moon","mercury","venus","mars","jupiter","saturn"]) {
          if (act.description.toLowerCase().includes(p)) orbCounts.set(p, (orbCounts.get(p)||0)+1);
        }
      }
      const lotCounts = new Map<string, number>();
      for (const act of packet.atmosphere.daily.activations) {
        if (act.source === "transit_to_lot") lotCounts.set(act.planet, (lotCounts.get(act.planet)||0)+1);
      }
      for (const sig of packet.signals) {
        try {
          const cluster = g.clusterByPlanet(sig.planet);
          const practices = cluster.edges.filter(e => e.predicate === "practice_for");
          const intEdges = cluster.edges.filter(e => e.predicate === "interpreted_by");
          const corrEdges = cluster.edges.filter(e => e.predicate === "corresponds_to");
          const daimonEdge = cluster.edges.find(e => e.predicate === "is_daimon");
          const tightOrbs = orbCounts.get(sig.planet)||0;
          const lotHits = lotCounts.get(sig.planet)||0;
          const isDaimon = !!daimonEdge;
          const isConverged = interpreted.convergence.planets.includes(sig.planet);
          const houseOverlap = sig.activated_houses.length > 0 ? 1 : 0;
          for (const e of practices) {
            const node = g.getNode(e.subject);
            const intLabels = intEdges.map(ie => { const n = g.getNode(ie.object); return n ? n.data?.system + ": " + n.label.slice(0,60) : ""; }).filter(Boolean).slice(0,3);
            const corrLabels = corrEdges.map(ce => { const n = g.getNode(ce.object); return n ? n.label : ""; }).filter(Boolean).slice(0,6);
            const ds = Math.round(sig.score * (1 + tightOrbs*0.15 + lotHits*0.1 + (isDaimon?0.25:0) + (isConverged?0.2:0) + houseOverlap*0.1) * 10) / 10;
            recs.push({ planet: sig.planet, practiceId: e.object, label: node?.label || e.object, reason: isDaimon ? "Daimon planet" : isConverged ? "Converged" : `Score ${sig.score}`, score: ds, confidence: sig.confidence, interpretations: intLabels, correspondences: corrLabels, daimon: isDaimon, converged: isConverged });
          }
        } catch {}
      }
      recs.sort((a, b) => (b.daimon?1:0)+(b.converged?1:0)-((a.daimon?1:0)+(a.converged?1:0)) || b.score - a.score);
      setGraphRecs(recs.slice(0, 12));

      // Store data for manual LLM trigger
      const signNames = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
      const ascSign = signNames[Math.floor(chart.angles.asc / 30) % 12] || "";
      const natLots = normalized.natal.lots;
      llmInputRef.current = {
        signals: packet.signals, planet_conditions: packet.planet_conditions,
        birth_data: { year: form.year, month: form.month, day: form.day, hour: form.hour, minute: form.minute, lat: form.lat, lon: form.lon, name: form.name },
        ascendant_sign: ascSign,
        natal_planets: Object.fromEntries(Object.entries(chart.bodies).map(([k, v]: [string, any]) => [k, { sign: v.sign, sign_deg: v.signDeg, house: v.house || 0, retrograde: v.retrograde || false, dignities: v.dignities || [] }])),
        daily_activations: packet.atmosphere.daily.activations.map(a => ({ description: a.description, source: a.source })),
        weekly_activations: packet.atmosphere.weekly.activations.map(a => ({ description: a.description, source: a.source })),
        year_lord: interpreted.macro.timescales.year.profectionLord, year_house: interpreted.macro.timescales.year.profectionHouse,
        month_lord: interpreted.macro.timescales.month?.lord || "", month_house: interpreted.macro.timescales.month?.profectionHouse || 0,
        oikodespotes: packet.oikodespotes ? { planet: packet.oikodespotes.planet, name: packet.oikodespotes.name, score: packet.oikodespotes.score, interpretation: packet.oikodespotes.interpretation, soul_choice: packet.oikodespotes.soul_choice } : undefined,
        convergence_planets: interpreted.convergence.planets, dominant_mode: packet.dominant_mode,
        lot_positions: natLots ? { fortune: natLots.fortune ? { sign: signNames[natLots.fortune.sign_index] || "", house: natLots.fortune.house } : undefined, spirit: natLots.spirit ? { sign: signNames[natLots.spirit.sign_index] || "", house: natLots.spirit.house } : undefined } : undefined,
        natal_promise: packet.natal_promise ? { strongest_planet: packet.natal_promise.strongest_planet || undefined, most_afflicted: packet.natal_promise.most_afflicted || undefined, element_predominance: packet.natal_promise.element_predominance } : undefined,
        aspect_patterns: packet.aspect_patterns, valens_combinations: packet.valens_combinations,
        ranked_practices: recs.slice(0, 5).map(r => ({ label: r.label, score: r.score, planet: r.planet })),
        deterministic_synthesis: dailySynthesis.traditions[0]?.atmosphere_decoding || "",
        deterministic_action: dailySynthesis.traditions[0]?.action || { what: "", why: "", urgency: "today" },
      };
      recsRef.current = recs;

      const allThemes = [
        ...interpreted.interpretations.al_khayyat,
        ...interpreted.interpretations.valens,
        ...interpreted.interpretations.ficino,
        ...interpreted.interpretations.greenbaum,
        ...interpreted.interpretations.demetra,
      ];
      pushActivationToGraph(
        packet.signals,
        allThemes.map(t => ({ planet: t.planet, tags: t.tags, system: t.system })),
        oikodespotes,
        packet.date,
      );
      // graphRecs computed above before LLM pipeline
      setTab("analysis");
    } catch (e) {
      console.error("Chart error:", e);
      setReading(null);
      setInterpretation(null);
      setSynthesis(null);
      setLlmSynthesis(null);
      setDaimonName(null);
      setLlmError("Chart computation failed. Check your birth data and try again.");
    } finally {
      setComputing(false);
    }
  }

  async function runDeepAnalysis() {
    const input = llmInputRef.current;
    const r = recsRef.current;
    if (!input) {
      setLlmError("Chart data not available. Please compute the chart first.");
      return;
    }
    setLlmError(null);
    setLlmLoading(true);
    setLlmSynthesis(null);
    setFicinianSynthesis(null);
    if (typeof window !== "undefined") {
      const trace = ["🔄 Preparing chart data..."];
      localStorage.setItem("analysis_trace", JSON.stringify(trace));
    }

    const updateTrace = (msg: string) => {
      if (typeof window !== "undefined") {
        const t = JSON.parse(localStorage.getItem("analysis_trace") || "[]");
        t.push(msg);
        localStorage.setItem("analysis_trace", JSON.stringify(t));
      }
    };

    const callAPI = async (system: string, user: string, label: string, prevPass?: string) => {
      const payload = { model: "deepseek-v4-flash", messages: [
        { role: "system", content: system },
        ...(prevPass ? [{ role: "assistant", content: prevPass }] : []),
        { role: "user", content: user },
      ], temperature: 0.3, max_tokens: 30000 };
      const res = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      return data.choices?.[0]?.message?.content || "";
    };

    try {
      const fmt = (i: typeof input) => {
        const l: string[] = [];
        l.push(`BIRTH: ${i.birth_data.year}-${i.birth_data.month}-${i.birth_data.day} ${i.birth_data.hour}:${i.birth_data.minute}UTC`);
        l.push(`ASC: ${i.ascendant_sign}`);
        for (const [p, d] of Object.entries(i.natal_planets)) l.push(`${p}: ${d.sign} ${d.sign_deg.toFixed(1)}° H${d.house}${d.retrograde?" Rx":""} [${d.dignities.join(", ")||"peregrine"}]`);
        if (i.lot_positions?.fortune) l.push(`Fortune: ${i.lot_positions.fortune.sign} H${i.lot_positions.fortune.house}`);
        if (i.lot_positions?.spirit) l.push(`Spirit: ${i.lot_positions.spirit.sign} H${i.lot_positions.spirit.house}`);
        l.push(`Year lord: ${i.year_lord} (H${i.year_house}). Month lord: ${i.month_lord||"none"} (H${i.month_house||"none"})`);
        if (i.oikodespotes) l.push(`Daimon: ${i.oikodespotes.planet}`);
        l.push(`\nToday:`);
        for (const a of i.daily_activations) l.push(`  ${a.description}`);
        if (i.weekly_activations.length > 0) { l.push(`\nWeekly:`); for (const w of i.weekly_activations) l.push(`  ${w.description}`); }
        if (i.ranked_practices && i.ranked_practices.length > 0) { l.push(`\nPractices:`); for (const p of i.ranked_practices.slice(0,5)) l.push(`  ${p.label} (${p.score}) — ${p.planet}`); }
        return l.join("\n");
      };

      const dataBlock = fmt(input);

      // Pass 1
      const pass1System = "You are an astrologer. Use the Forecasting Stack: Year theme → Month filter → Day trigger. Ground every claim in specific data (houses, orbs, dignities). Write 2-4 paragraphs. End with recommended action.";
      const pass1User = `Write a daily reading for this data:\n\n${dataBlock}`;
      const pass1 = await callAPI(pass1System, pass1User, "pass1-narrative");
      updateTrace("✅ Pass 1 complete");
      setLlmSynthesis({ narrative: pass1, action: input.deterministic_action, model: "deepseek-v4-flash" });
      setLlmLoading(false);
      setFicinianLoading(true);

      // Pass 2 (Ficinian)
      updateTrace("🧠 Pass 2: Generating Ficinian depth layer...");
      const pass2System = "You are Marsilio Ficino. Use the descent: natal instrument → daimon → year → month → day. Diagnose excess/deficiency/obstruction. Prescribe sensory cue + action + contemplation. End with 1-2 practice recommendations from the list.";
      const pass2User = `DATA:\n${dataBlock}\n\nPREVIOUS READING:\n${pass1}\n\nWrite the Ficinian depth layer and recommend practices.`;
      const pass2 = await callAPI(pass2System, pass2User, "pass2-ficinian", pass1);
      updateTrace("✅ Pass 2 complete");
      setFicinianSynthesis({ narrative: pass2, recommended_practices: [], action: input.deterministic_action, model: "deepseek-v4-flash" });
      setFicinianLoading(false);

    } catch (e: any) {
      console.error("Deep analysis failed:", e);
      setLlmError(e.message || "API call failed. Check browser console for details.");
      setLlmLoading(false);
      setFicinianLoading(false);
    }
  }

  function handleSave() {
    if (!form.name.trim() || !chart) return;
    const entry: SavedChart = {
      name: form.name.trim(),
      data: { year: form.year, month: form.month, day: form.day, hour: form.hour, minute: form.minute, lat: form.lat, lon: form.lon, placeName: form.placeName || undefined },
      savedAt: new Date().toISOString(),
    };
    saveChart(entry);
    setSaved(loadSavedCharts());
    setEditingName("");
  }

  function loadChart(saved: SavedChart) {
    setForm({ ...saved.data, name: saved.name, placeName: saved.data.placeName || "" });
    setEditingName(saved.name);
    setChart(null);
    setReading(null);
    setInterpretation(null);
    setSynthesis(null);
    setLlmSynthesis(null);
    setFicinianSynthesis(null);
    setLlmError(null);
    setPacketData(null);
    setGraphRecs([]);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }

  function handleDelete(name: string) {
    deleteChart(name);
    setSaved(loadSavedCharts());
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-6 inline-block">
        &larr; Feed
      </Link>

      <section className="mb-8">
        <p className="text-xs uppercase tracking-[0.18em] text-zinc-600 mb-2">Astrology</p>
        <h1 className="text-2xl font-bold mb-2">Birth Chart</h1>
        <p className="text-sm text-zinc-400 leading-relaxed max-w-2xl">
          Enter birth details to generate a natal chart and full daimonic analysis — timing, interpretation, practices, and correspondences.
        </p>
      </section>

      <div ref={formRef} className="mb-6">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
          <h2 className="text-sm font-semibold text-zinc-300 mb-4">Birth Details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Name" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} placeholder="e.g. Aleister Crowley" className="sm:col-span-2" />
            <Input label="Year" type="number" value={form.year} onChange={(v) => setForm((f) => ({ ...f, year: +v }))} />
            <Input label="Month" type="number" value={form.month} onChange={(v) => setForm((f) => ({ ...f, month: +v }))} min={1} max={12} />
            <Input label="Day" type="number" value={form.day} onChange={(v) => setForm((f) => ({ ...f, day: +v }))} min={1} max={31} />
            <Input label="Hour (24h)" type="number" value={form.hour} onChange={(v) => setForm((f) => ({ ...f, hour: +v }))} min={0} max={23} />
            <Input label="Minute" type="number" value={form.minute} onChange={(v) => setForm((f) => ({ ...f, minute: +v }))} min={0} max={59} />
            <div className="sm:col-span-2 relative" ref={geoRef}>
              <label className="block text-xs text-zinc-500 mb-1">Place of Birth</label>
              <div className="relative">
                <input type="text" value={form.placeName} onChange={(e) => { setForm((f) => ({ ...f, placeName: e.target.value })); searchPlace(e.target.value); }}
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
                      <span className="text-zinc-700 ml-2 text-[10px]">{r.latitude.toFixed(3)}&deg;, {r.longitude.toFixed(3)}&deg;</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Input label="Latitude" type="number" value={form.lat} onChange={(v) => setForm((f) => ({ ...f, lat: +v }))} step="any" />
            <Input label="Longitude" type="number" value={form.lon} onChange={(v) => setForm((f) => ({ ...f, lon: +v }))} step="any" />
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={compute} disabled={computing}
              className="text-sm bg-violet-700 hover:bg-violet-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors font-medium"
            >
              {computing ? "Computing..." : "Compute Chart"}
            </button>
            {chart && (
              <>
                <button onClick={handleSave} className="text-sm border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-zinc-200 px-4 py-2 rounded-lg transition-colors">
                  {editingName ? "Update Saved" : "Save Chart"}
                </button>
                <button onClick={async () => {
                    setProfileSaving(true);
                    try {
                      const bodies: Record<string, { sign: string; lon: number; house?: number; retrograde?: boolean }> = {};
                      if (chart?.bodies) {
                        for (const [key, val] of Object.entries(chart.bodies)) {
                          const b = val as any;
                          if (b && typeof b === "object" && b.sign) {
                            bodies[key] = { sign: b.sign, lon: b.lon, house: b.house, retrograde: b.retrograde };
                          }
                        }
                      }
                      await fetch("/api/profile", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify({
                          birthChart: {
                            name: form.name, year: form.year, month: form.month, day: form.day,
                            hour: form.hour, minute: form.minute, lat: form.lat, lon: form.lon,
                            placeName: form.placeName || undefined, bodies,
                            angles: chart?.angles ? { asc: chart.angles.asc, mc: chart.angles.mc } : undefined,
                          },
                        }),
                      });
                      setProfileSaved(true);
                      setTimeout(() => setProfileSaved(false), 3000);
                    } catch {}
                    setProfileSaving(false);
                  }}
                  className={`text-sm border px-4 py-2 rounded-lg transition-colors ${profileSaved ? "border-emerald-700 text-emerald-400 bg-emerald-950/20" : "border-zinc-700 text-zinc-400 hover:text-zinc-200"}`}
                >
                  {profileSaving ? "..." : profileSaved ? "Saved to Profile \u2713" : "Save to Profile"}
                </button>
              </>
            )}
          </div>
        </div>

        {saved.length > 0 && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 mt-4">
            <h2 className="text-sm font-semibold text-zinc-300 mb-3">Saved Charts</h2>
            <div className="space-y-2">
              {saved.map((s) => (
                <div key={s.name} className="flex items-center justify-between group">
                  <button onClick={() => loadChart(s)} className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors text-left">
                    {s.name}
                    <span className="text-xs text-zinc-600 ml-2">{s.data.year}-{String(s.data.month).padStart(2, "0")}-{String(s.data.day).padStart(2, "0")}</span>
                    {s.data.placeName && <span className="text-xs text-zinc-700 ml-2"> &middot; {s.data.placeName}</span>}
                  </button>
                  <button onClick={() => handleDelete(s.name)} className="text-xs text-zinc-700 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">delete</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {chart && (
        <>
          <div className="flex gap-1 border-b border-zinc-800 mb-6">
            <button onClick={() => setTab("chart")}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-[1px] ${tab === "chart" ? "text-violet-300 border-violet-600" : "text-zinc-600 border-transparent hover:text-zinc-400"}`}
            >
              Chart
            </button>
            <button onClick={() => setTab("analysis")}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-[1px] ${tab === "analysis" ? "text-violet-300 border-violet-600" : "text-zinc-600 border-transparent hover:text-zinc-400"}`}
            >
              Analysis
            </button>
          </div>

          {tab === "chart" && (
            <div className="grid gap-6 lg:grid-cols-[1fr_auto]">
              <div className="space-y-6">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
                  <h2 className="text-sm font-semibold text-zinc-300 mb-3">Planets</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-zinc-600 border-b border-zinc-800">
                          <th className="text-left py-2 pr-3">Body</th>
                          <th className="text-left py-2 pr-3">Sign</th>
                          <th className="text-right py-2 pr-3">Position</th>
                          <th className="text-right py-2 pr-3">House</th>
                          <th className="text-right py-2">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(chart.bodies).map(([id, body]: [string, any]) => (
                          <tr key={id} className="border-b border-zinc-800/50 text-zinc-400">
                            <td className="py-2 pr-3 text-zinc-300">{bodyLabel(id)}</td>
                            <td className="py-2 pr-3">{body.sign}</td>
                            <td className="py-2 pr-3 text-right">{fmtLon(body.lon)}</td>
                            <td className="py-2 pr-3 text-right">{body.house ?? "-"}</td>
                            <td className="py-2 text-right">{body.retrograde ? "\u211e" : body.dignities?.join(", ") || ""}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
                  <h2 className="text-sm font-semibold text-zinc-300 mb-3">Aspects</h2>
                  <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-zinc-600 border-b border-zinc-800">
                          <th className="text-left py-2 pr-3">Body 1</th>
                          <th className="text-left py-2 pr-3">Body 2</th>
                          <th className="text-left py-2 pr-3">Aspect</th>
                          <th className="text-right py-2 pr-3">Orb</th>
                          <th className="text-right py-2">Phase</th>
                        </tr>
                      </thead>
                      <tbody>
                        {chart.aspects?.map((asp: any, i: number) => (
                          <tr key={i} className="border-b border-zinc-800/50 text-zinc-400">
                            <td className="py-2 pr-3 text-zinc-300">{bodyLabel(asp.a)}</td>
                            <td className="py-2 pr-3 text-zinc-300">{bodyLabel(asp.b)}</td>
                            <td className="py-2 pr-3">{ASPECT_LABELS[asp.aspect] || asp.aspect}</td>
                            <td className="py-2 pr-3 text-right">{asp.orb?.toFixed(1)}&deg;</td>
                            <td className="py-2 text-right text-zinc-500">{asp.phase}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="space-y-6 lg:max-w-[520px]">
                <div ref={wheelRef} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
                  <ChartWheel chart={chart} size={480} showAspects theme={{ axis: "#a78bfa" }} />
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
                  <h2 className="text-sm font-semibold text-zinc-300 mb-3">Angles</h2>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <Angle label="ASC" lon={chart.angles.asc} />
                    <Angle label="MC" lon={chart.angles.mc} />
                    <Angle label="DC" lon={chart.angles.asc + 180} />
                    <Angle label="IC" lon={chart.angles.mc + 180} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "analysis" && interpretation && reading && (
            <div className="space-y-6">
              {/* Deep Analysis trigger */}
              {!llmSynthesis && !llmLoading && !ficinianLoading && (
                <div className="flex items-center justify-between p-3 rounded-lg border border-violet-800/30 bg-violet-950/10">
                  <p className="text-xs text-violet-300/80">Deterministic analysis shown. Generate an LLM-enhanced reading for deeper insight.</p>
                  <button onClick={runDeepAnalysis} disabled={llmLoading || ficinianLoading}
                    className="text-xs bg-violet-700 hover:bg-violet-600 disabled:bg-violet-900/50 disabled:text-violet-400/50 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                  >{llmLoading || ficinianLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-pulse">●</span> Thinking...
                    </span>
                  ) : "Generate Deep Analysis"}</button>
                </div>
              )}

              {/* Sub-tab bar */}
              <>
                <div className="flex gap-1 border-b border-zinc-800">
                  {["Overview","Daily","Weekly","Monthly","Yearly","Daimon","Life"].map(st => (
                    <button key={st} onClick={() => setAnalysisSubTab(st)}
                      className={`px-3 py-1.5 text-xs font-medium transition-colors border-b-2 -mb-[1px] ${analysisSubTab === st ? "text-violet-300 border-violet-600" : "text-zinc-600 border-transparent hover:text-zinc-400"}`}
                    >{st}</button>
                  ))}
                </div>

                {/* ═══ OVERVIEW ═══ */}
                {analysisSubTab === "Overview" && (
                      <>
                        {/* LLM-enhanced synthesis (shown when available) */}
                        {llmSynthesis && (
                          <div className="rounded-xl border border-emerald-800/40 bg-emerald-950/10 p-6">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <p className="text-[10px] uppercase tracking-[0.18em] text-emerald-500 mb-1">Deep Synthesis</p>
                                <h2 className="text-lg font-bold text-emerald-200">{llmSynthesis.action.what}</h2>
                              </div>
                              <span className="text-[9px] text-emerald-400/60 px-2 py-1 rounded-full border border-emerald-800/30">LLM · {llmSynthesis.model}</span>
                            </div>
                            <div className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line mb-3">{llmSynthesis.narrative}</div>
                            <div className="p-3 rounded-lg border border-amber-800/20 bg-amber-950/10">
                              <p className="text-[10px] uppercase tracking-wider text-amber-400/60 mb-1">Recommended Action</p>
                              <p className="text-sm text-amber-200/80">{llmSynthesis.action.why}</p>
                            </div>
                          </div>
                        )}
                        {llmError && (
                          <div className="rounded-xl border border-red-800/30 bg-red-950/10 p-4">
                            <p className="text-xs text-red-400/80">{llmError}</p>
                            <p className="text-[10px] text-zinc-500 mt-1">Set your API key in the Spells tab (<code className="text-zinc-400">localStorage.setItem("deepseek_api_key", "sk-...")</code>) or ensure the proxy worker is running.</p>
                          </div>
                        )}
                        {llmLoading && (
                          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-2">
                            <p className="text-xs text-violet-400/80 font-medium">🔄 Generating deep analysis...</p>
                            <div className="flex flex-col gap-1">
                              {["Preparing chart data...", "🧠 Pass 1: Generating narrative reading...", "✅ Pass 1 complete", "🧠 Pass 2: Generating Ficinian depth layer...", "✅ Pass 2 complete"].map((step, i) => {
                                const trace = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("analysis_trace") || "[]") : [];
                                const done = trace.includes(step);
                                const current = trace[trace.length - 1] === step;
                                return (
                                  <div key={i} className={`flex items-center gap-2 text-[11px] transition-opacity ${done ? "text-zinc-400" : current ? "text-violet-300" : "text-zinc-700"}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${done ? "bg-emerald-500" : current ? "bg-violet-400 animate-pulse" : "bg-zinc-800"}`} />
                                    {step}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Ficinian depth layer (Pass 2) */}
                        {ficinianSynthesis && (
                          <div className="rounded-xl border border-amber-800/40 bg-amber-950/10 p-6">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <p className="text-[10px] uppercase tracking-[0.18em] text-amber-500 mb-1">Ficinian Depth</p>
                                <h2 className="text-lg font-bold text-amber-200">{ficinianSynthesis.action.what}</h2>
                              </div>
                              <span className="text-[9px] text-amber-400/60 px-2 py-1 rounded-full border border-amber-800/30">Pass 2 · {ficinianSynthesis.model}</span>
                            </div>
                            <div className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line mb-3">{ficinianSynthesis.narrative}</div>
                            {ficinianSynthesis.recommended_practices.length > 0 && (
                              <div className="mt-4 p-3 rounded-lg border border-emerald-800/20 bg-emerald-950/10">
                                <p className="text-[10px] uppercase tracking-wider text-emerald-400/60 mb-2">Ficino's Recommended Practices</p>
                                {ficinianSynthesis.recommended_practices.map((pr, i) => (
                                  <div key={i} className="text-xs text-emerald-200/80 mb-1">{pr.label} <span className="text-emerald-400/60">({pr.planet})</span></div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                        {ficinianLoading && (
                          <div className="rounded-xl border border-amber-800/30 bg-amber-950/5 p-4">
                            <p className="text-xs text-amber-500 italic animate-pulse">Ficino is reading the configurations...</p>
                          </div>
                        )}

                        {/* Synthesis from each tradition (deterministic fallback, shown when LLM not ready) */}
                        {synthesis && !llmSynthesis && !llmLoading && synthesis.traditions.map((t, ti) => (
                          <div key={ti} className="rounded-xl border border-violet-800/40 bg-violet-950/10 p-6">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <p className="text-[10px] uppercase tracking-[0.18em] text-violet-500 mb-1">{t.tradition}</p>
                                <h2 className="text-lg font-bold text-violet-200">{t.action.what}</h2>
                              </div>
                              <span className={`text-[10px] uppercase px-2 py-1 rounded-full border ${t.action.urgency === "now" ? "border-red-800/40 text-red-400 bg-red-950/20" : t.action.urgency === "today" ? "border-amber-800/40 text-amber-400 bg-amber-950/20" : "border-zinc-700 text-zinc-500 bg-zinc-800/40"}`}>{t.action.urgency}</span>
                            </div>
                            <div className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line mb-3">{t.atmosphere_decoding}</div>
                            <div className="p-3 rounded-lg border border-emerald-800/20 bg-emerald-950/10">
                              <p className="text-[10px] uppercase tracking-wider text-emerald-400/60 mb-1">Recommended Action</p>
                              <p className="text-sm text-emerald-200/80">{t.action.why}</p>
                              <p className="text-[10px] text-emerald-400/40 mt-1">Source: {t.source}</p>
                            </div>
                          </div>
                        ))}

                        {/* Convergence */}
                        {interpretation.convergence.planets.length > 0 && (
                          <div className="rounded-xl border border-emerald-800/40 bg-emerald-950/10 p-4">
                            <p className="text-xs uppercase tracking-wider text-emerald-400 mb-1">Convergence</p>
                            <p className="text-sm text-emerald-200/80">{interpretation.convergence.planets.length} planets flagged across 3+ systems: {interpretation.convergence.planets.join(", ")}</p>
                            {interpretation.convergence.advice.length > 0 && <p className="text-xs text-emerald-400/60 mt-1">Shared advice: {interpretation.convergence.advice.slice(0, 3).join(" · ")}</p>}
                          </div>
                        )}

                        {/* Integrated timescape analysis */}
                        {interpretation.macro.integrated && (
                          <div className="rounded-xl border border-violet-800/30 bg-violet-950/5 p-4">
                            <p className="text-xs uppercase tracking-wider text-violet-400 mb-2">Integrated Timescape Analysis</p>
                            <p className="text-xs text-violet-200/80 leading-relaxed mb-3">{interpretation.macro.integrated.prevailing_temperament}</p>
                            <div className="grid gap-2 sm:grid-cols-2">
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
                      </>
                    )}

                    {/* ═══ DAILY ═══ */}
                    {analysisSubTab === "Daily" && (
                      <>
                        {/* Daily transits sorted by orb tightness */}
                        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
                          <h2 className="text-sm font-semibold text-zinc-300 mb-3">Today's Transits</h2>
                          <div className="space-y-1">
                            {[...reading.atmosphere.daily.activations].sort((a, b) => {
                              const oA = parseFloat(a.description.match(/orb (\d+\.?\d*)°/)?.[1] || "99");
                              const oB = parseFloat(b.description.match(/orb (\d+\.?\d*)°/)?.[1] || "99");
                              return oA - oB;
                            }).map((act, i) => {
                              const orb = parseFloat(act.description.match(/orb (\d+\.?\d*)°/)?.[1] || "99");
                              return (
                                <div key={i} className="flex items-center gap-2 text-xs text-zinc-400 p-1.5 rounded hover:bg-zinc-800/30">
                                  <span className={`shrink-0 w-1.5 h-1.5 rounded-full ${orb < 1 ? "bg-red-500" : orb < 3 ? "bg-amber-500" : "bg-zinc-600"}`} />
                                  <span className="grow">{act.description}</span>
                                  <span className="text-zinc-600 text-[10px]">{act.source}</span>
                                  <span className={`text-[10px] font-mono ${orb < 1 ? "text-red-400" : orb < 3 ? "text-amber-400" : "text-zinc-500"}`}>{orb.toFixed(1)}°</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Practices for today */}
                        {graphRecs.length > 0 && (
                          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
                            <p className="text-xs uppercase tracking-wider text-zinc-600 mb-2">Practices — ranked by today's activation</p>
                            <div className="grid gap-3 sm:grid-cols-2">
                              {graphRecs.slice(0, 6).map((r, i) => (
                                <div key={i} className={`rounded-lg p-3 border ${r.daimon ? "border-amber-500/40 bg-amber-500/5" : r.converged ? "border-emerald-500/30 bg-emerald-500/5" : "border-zinc-700/30 bg-zinc-800/30"}`}>
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <span className="text-[10px] font-bold uppercase text-zinc-400">{r.planet}</span>
                                    {r.daimon && <span className="text-[9px] px-1 py-0.5 rounded bg-amber-500/20 text-amber-400">daimon</span>}
                                    <span className="text-[9px] ml-auto text-zinc-500">score {r.score}</span>
                                  </div>
                                  <p className="text-xs font-medium text-zinc-200 mb-0.5">{r.label}</p>
                                  <p className="text-[9px] text-zinc-500">{r.reason}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* ═══ WEEKLY ═══ */}
                    {analysisSubTab === "Weekly" && (
                      <>
                        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
                          <h2 className="text-sm font-semibold text-zinc-300 mb-3">This Week</h2>
                          {reading.atmosphere.weekly.activations.length > 0 ? (
                            <div className="space-y-1">
                              {reading.atmosphere.weekly.activations.map((act, i) => (
                                <p key={i} className="text-xs text-zinc-400">{act.description} <span className="text-zinc-600">({act.source})</span></p>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-zinc-600 italic">No significant aspects approaching this week</p>
                          )}
                          <div className="mt-4">
                            <p className="text-[10px] uppercase tracking-wider text-zinc-600 mb-2">Sky aspects this week</p>
                            {interpretation.macro.timescales.week.skyAspects.length > 0 ? (
                              <div className="space-y-1">
                                {interpretation.macro.timescales.week.skyAspects.map((sa, i) => (
                                  <p key={i} className="text-xs text-zinc-400">{sa}</p>
                                ))}
                              </div>
                            ) : <p className="text-xs text-zinc-600 italic">No major sky patterns this week</p>}
                          </div>
                        </div>
                      </>
                    )}

                    {/* ═══ MONTHLY ═══ */}
                    {analysisSubTab === "Monthly" && (
                      <>
                        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
                          <h2 className="text-sm font-semibold text-zinc-300 mb-3">This Month</h2>
                          {interpretation.macro.timescales.month ? (
                            <>
                              <p className="text-sm text-zinc-200">House {interpretation.macro.timescales.month.profectionHouse} &middot; Lord {bodyLabel(interpretation.macro.timescales.month.lord)}</p>
                              <p className="text-xs text-zinc-400 mt-1">Theme: {interpretation.macro.timescales.year.profectionHouseTheme}</p>
                              <div className="mt-4">
                                <p className="text-[10px] uppercase tracking-wider text-zinc-600 mb-2">Monthly activations</p>
                                {reading.atmosphere.monthly.activations.map((act, i) => (
                                  <p key={i} className="text-xs text-zinc-400">{act.description}</p>
                                ))}
                              </div>
                            </>
                          ) : <p className="text-xs text-zinc-600 italic">No distinct monthly activation</p>}
                        </div>
                      </>
                    )}

                    {/* ═══ YEARLY ═══ */}
                    {analysisSubTab === "Yearly" && (
                      <>
                        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
                          <h2 className="text-sm font-semibold text-zinc-300 mb-3">This Year</h2>
                          <p className="text-sm text-zinc-200">House {interpretation.macro.timescales.year.profectionHouse} &middot; Lord {bodyLabel(interpretation.macro.timescales.year.profectionLord)}</p>
                          <p className="text-xs text-zinc-400 mt-1">Theme: {interpretation.macro.timescales.year.profectionHouseTheme}</p>
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            {interpretation.macro.timescales.year.firdariaLord && (
                              <div className="p-3 rounded bg-zinc-800/40 border border-zinc-700/30">
                                <p className="text-[10px] text-zinc-500">Firdaria Lord</p>
                                <p className="text-xs text-zinc-300">{bodyLabel(interpretation.macro.timescales.year.firdariaLord)}</p>
                              </div>
                            )}
                            {interpretation.macro.timescales.year.zrSpirit && (
                              <div className="p-3 rounded bg-zinc-800/40 border border-zinc-700/30">
                                <p className="text-[10px] text-zinc-500">ZR Spirit</p>
                                <p className="text-xs text-zinc-300">{bodyLabel(interpretation.macro.timescales.year.zrSpirit.lord)} in {interpretation.macro.timescales.year.zrSpirit.sign}</p>
                              </div>
                            )}
                            {interpretation.macro.timescales.year.zrFortune && (
                              <div className="p-3 rounded bg-zinc-800/40 border border-zinc-700/30">
                                <p className="text-[10px] text-zinc-500">ZR Fortune</p>
                                <p className="text-xs text-zinc-300">{bodyLabel(interpretation.macro.timescales.year.zrFortune.lord)} in {interpretation.macro.timescales.year.zrFortune.sign}</p>
                              </div>
                            )}
                          </div>
                          <div className="mt-4">
                            <p className="text-[10px] uppercase tracking-wider text-zinc-600 mb-2">Yearly activations</p>
                            {reading.atmosphere.yearly.activations.map((act, i) => (
                              <p key={i} className="text-xs text-zinc-400">{act.description}</p>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {/* ═══ DAIMON ═══ */}
                    {analysisSubTab === "Daimon" && (
                      <>
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
                            <p className="text-xs text-amber-400/40 mt-2">Determined via Porphyry's method &middot; Score: {reading.oikodespotes.score} &middot; Found at: {reading.oikodespotes.points_considered.join(", ")}</p>
                          </div>
                        )}

                        {/* Agrippa Daimon Name */}
                        {daimonName && (
                          <div className="rounded-xl border border-violet-800/50 bg-violet-950/10 p-5">
                            <h2 className="text-sm font-semibold text-violet-300 mb-3">Agrippa's Genius Name</h2>
                            <div className="flex items-center gap-3 mb-2">
                              <div className="text-3xl font-bold text-violet-200 tracking-widest">{daimonName.geniusName}</div>
                              <div className="text-xs text-violet-400/60">root: {daimonName.geniusValue}</div>
                            </div>
                            <div className="text-xs text-violet-400/80 mb-3">With divine suffix: <span className="text-violet-200 font-mono font-bold">{daimonName.geniusNameSuffixed}</span> (value: {daimonName.geniusValue + 1})</div>
                            <div className="grid gap-2" style={{gridTemplateColumns: `repeat(${daimonName.breakdown.length}, minmax(0, 1fr))`}}>
                              {daimonName.breakdown.map((b, i) => (
                                <div key={i} className="rounded-lg bg-violet-950/20 border border-violet-800/30 p-2 text-center">
                                  <p className="text-[10px] uppercase tracking-wider text-violet-400/60">{b.label}</p>
                                  <p className="text-lg font-bold text-violet-200">{b.letter}</p>
                                  <p className="text-[10px] text-violet-400/60">{b.name}</p>
                                  <p className="text-[10px] text-violet-400/40">{b.value}</p>
                                </div>
                              ))}
                            </div>
                            <div className="flex items-center gap-3 mt-2">
                              <div className="text-xs text-violet-400/60">Evil Daimon: <span className="text-red-400/80 font-mono">{daimonName.demonName}</span> (value: {daimonName.demonValue})</div>
                            </div>
                            <p className="text-[10px] text-violet-400/30 mt-2">From Agrippa, Three Books of Occult Philosophy III.xxvi &middot; {daimonName.isDayBirth ? "Day" : "Night"} Birth</p>
                          </div>
                        )}
                        {/* Daimonic today */}
                        <div className="rounded-xl border border-amber-800/30 bg-amber-950/5 p-5">
                          <h2 className="text-sm font-semibold text-amber-300 mb-3">Daimon — Today's Activation</h2>
                          <p className="text-xs text-amber-200/80">Your daimon {reading.oikodespotes ? bodyLabel(reading.oikodespotes.planet) : "Mercury"} is active today. Check Overview for the full atmospheric reading.</p>
                          <div className="grid gap-3 sm:grid-cols-2 mt-4">
                            <div className={`rounded-xl border p-4 ${reading.fortune_layer.active ? "border-zinc-700 bg-zinc-900/40" : "border-zinc-800/50 bg-zinc-900/20 opacity-60"}`}>
                              <p className="text-xs font-semibold text-zinc-300 mb-1">Fortune Layer</p>
                              <p className="text-xs text-zinc-400">House {reading.fortune_layer.lot_house} &middot; {reading.fortune_layer.active ? "Active" : "Inactive"}</p>
                              {reading.fortune_layer.active && <p className="text-[10px] text-zinc-500">Confidence: {reading.fortune_layer.confidence}</p>}
                            </div>
                            <div className={`rounded-xl border p-4 ${reading.spirit_layer.active ? "border-zinc-700 bg-zinc-900/40" : "border-zinc-800/50 bg-zinc-900/20 opacity-60"}`}>
                              <p className="text-xs font-semibold text-zinc-300 mb-1">Spirit Layer</p>
                              <p className="text-xs text-zinc-400">House {reading.spirit_layer.lot_house} &middot; {reading.spirit_layer.active ? "Active" : "Inactive"}</p>
                              {reading.spirit_layer.active && <p className="text-[10px] text-zinc-500">Confidence: {reading.spirit_layer.confidence}</p>}
                            </div>
                          </div>
                        </div>
                        {/* Daimonic houses */}
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                          <DaimonicHouseCard title="Good Fortune" tag="good_fortune" data={reading.daimonic_houses.good_fortune} bodyLabel={bodyLabel} />
                          <DaimonicHouseCard title="Good Daimon" tag="good_daimon" data={reading.daimonic_houses.good_daimon} bodyLabel={bodyLabel} />
                          <DaimonicHouseCard title="Bad Fortune" tag="bad_fortune" data={reading.daimonic_houses.bad_fortune} bodyLabel={bodyLabel} />
                          <DaimonicHouseCard title="Bad Daimon" tag="bad_daimon" data={reading.daimonic_houses.bad_daimon} bodyLabel={bodyLabel} />
                        </div>
                        {/* Daimonic interpretation */}
                        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
                          <h2 className="text-sm font-semibold text-zinc-300 mb-3">Daimonic Interpretation</h2>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                              <p className="text-xs uppercase tracking-wider text-zinc-600 mb-2">Life Activity</p>
                              <div className="flex flex-wrap gap-1">{reading.daimonic_interpretation.life_activity.slice(0, 5).map((a, i) => (<span key={i} className="text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded">{a}</span>))}</div>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-wider text-zinc-600 mb-2">Opportunity</p>
                              <div className="flex flex-wrap gap-1">{reading.daimonic_interpretation.opportunity.slice(0, 5).map((o, i) => (<span key={i} className="text-xs bg-emerald-950/40 text-emerald-400 px-2 py-1 rounded">{o}</span>))}</div>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-wider text-zinc-600 mb-2">Pressure</p>
                              <div className="flex flex-wrap gap-1">{reading.daimonic_interpretation.pressure.slice(0, 5).map((p, i) => (<span key={i} className="text-xs bg-red-950/40 text-red-400 px-2 py-1 rounded">{p}</span>))}</div>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-wider text-zinc-600 mb-2">Distortion</p>
                              <div className="flex flex-wrap gap-1">{reading.daimonic_interpretation.distortion.slice(0, 5).map((d, i) => (<span key={i} className="text-xs bg-amber-950/40 text-amber-400 px-2 py-1 rounded">{d}</span>))}</div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* ═══ LIFE ═══ */}
                    {analysisSubTab === "Life" && (
                      <>
                        {/* Natal promise static info */}
                        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
                          <h2 className="text-sm font-semibold text-zinc-300 mb-3">Natal Promise</h2>
                          {packetData?.natal_promise && (
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                              {packetData.natal_promise.strongest_planet && <div className="p-3 bg-zinc-800/30 rounded-lg"><p className="text-[10px] text-zinc-500">Strongest</p><p className="text-xs text-emerald-400">{bodyLabel(packetData.natal_promise.strongest_planet.planet)}</p><p className="text-[9px] text-zinc-600">{packetData.natal_promise.strongest_planet.reason}</p></div>}
                              {packetData.natal_promise.most_afflicted && <div className="p-3 bg-zinc-800/30 rounded-lg"><p className="text-[10px] text-zinc-500">Most Afflicted</p><p className="text-xs text-red-400">{bodyLabel(packetData.natal_promise.most_afflicted.planet)}</p><p className="text-[9px] text-zinc-600">{packetData.natal_promise.most_afflicted.reason}</p></div>}
                              {packetData.natal_promise.stellium && <div className="p-3 bg-zinc-800/30 rounded-lg"><p className="text-[10px] text-zinc-500">Stellium</p><p className="text-xs text-zinc-300">H{packetData.natal_promise.stellium.house}</p><p className="text-[9px] text-zinc-600">{packetData.natal_promise.stellium.planets.map(bodyLabel).join(", ")}</p></div>}
                              <div className="p-3 bg-zinc-800/30 rounded-lg"><p className="text-[10px] text-zinc-500">Element</p><p className="text-xs text-zinc-300">{packetData.natal_promise.element_predominance.map((e: any) => `${e.element} ${e.percentage}%`).join(" · ")}</p></div>
                              <div className="p-3 bg-zinc-800/30 rounded-lg"><p className="text-[10px] text-zinc-500">Modality</p><p className="text-xs text-zinc-300">{packetData.natal_promise.modality_predominance.map((m: any) => `${m.modality} ${m.percentage}%`).join(" · ")}</p></div>
                              <div className="p-3 bg-zinc-800/30 rounded-lg"><p className="text-[10px] text-zinc-500">Chart Ruler</p><p className="text-xs text-zinc-300">{bodyLabel(packetData.natal_promise.sect_ruler)}</p></div>
                            </div>
                          )}
                        </div>

                        {/* Planet conditions */}
                        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
                          <h2 className="text-sm font-semibold text-zinc-300 mb-3">Planetary Condition</h2>
                          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {reading.planet_conditions.filter(c => c.house > 0).map(c => (
                              <div key={c.planet} className="bg-zinc-800/40 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-medium text-zinc-200">{bodyLabel(c.planet)}</span>
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${c.angularity === "angular" ? "bg-violet-950/40 text-violet-400" : c.angularity === "succedent" ? "bg-zinc-800 text-zinc-400" : "bg-zinc-900 text-zinc-600"}`}>{c.angularity}</span>
                                </div>
                                <p className="text-xs text-zinc-500">{c.sign} · H{c.house}{c.daimonic_tag ? ` · ${c.daimonic_tag.replace("_", " ")}` : ""}</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {c.essential_dignity.map((d, i) => (
                                    <span key={i} className={`text-[10px] px-1 py-0.5 rounded ${d === "domicile" || d === "exaltation" ? "bg-emerald-950/40 text-emerald-400" : d === "detriment" || d === "fall" ? "bg-red-950/40 text-red-400" : "bg-zinc-800 text-zinc-500"}`}>{d}</span>
                                  ))}
                                  {c.peregrine && <span className="text-[10px] px-1 py-0.5 rounded bg-zinc-800 text-zinc-600">peregrine</span>}
                                  {c.retrograde && <span className="text-[10px] px-1 py-0.5 rounded bg-amber-950/40 text-amber-400">Rx</span>}
                                  {c.sect_status !== "neutral" && <span className={`text-[10px] px-1 py-0.5 rounded ${c.sect_status === "in_sect" ? "bg-emerald-950/40 text-emerald-400" : "bg-red-950/40 text-red-400"}`}>{c.sect_status}</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Antiscia + Bonification */}
                        {reading.antiscia.length > 0 && (
                          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
                            <h2 className="text-sm font-semibold text-zinc-300 mb-3">Antiscia (Hidden Connections)</h2>
                            {reading.antiscia.map((a, i) => (<p key={i} className="text-xs text-zinc-400">{bodyLabel(a.planet_a)} ↔ {bodyLabel(a.planet_b)} (orb {a.orb.toFixed(1)}°)</p>))}
                          </div>
                        )}
                        {reading.bonification.length > 0 && (
                          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
                            <h2 className="text-sm font-semibold text-zinc-300 mb-3">Bonification & Maltreatment</h2>
                            {reading.bonification.slice(0, 8).map((b, i) => (<p key={i} className={`text-xs ${b.beneficial ? "text-emerald-400" : "text-red-400"}`}>{b.type}: {b.description}</p>))}
                          </div>
                        )}

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
                                  <><p className="text-xs text-zinc-500 mb-2">{profile.daimonic_function.join(" · ")}</p>
                                  <div className="space-y-1 text-xs text-zinc-400">
                                    {a.colour.length > 0 && <p>Colour: {a.colour.join(", ")}</p>}
                                    {a.scent_or_symbolic_herb.length > 0 && <p>Scent: {a.scent_or_symbolic_herb.join(", ")}</p>}
                                    {a.activity.length > 0 && <p>Practice: {a.activity.slice(0, 3).join(", ")}</p>}
                                    {a.music.length > 0 && <p>Music: {a.music.slice(0, 2).join(", ")}</p>}
                                  </div></>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
              </>

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
                  <p className="text-xs text-amber-400/40 mt-2">Score: {reading.oikodespotes.score} &middot; Found via: {reading.oikodespotes.points_considered.join(", ")}</p>
                </div>
              )}

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
                      <p className="text-xs text-zinc-500">{c.sign} &middot; House {c.house} {c.daimonic_tag ? `\u00b7 ${c.daimonic_tag.replace("_", " ")}` : ""}</p>
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
                          <span className="text-[10px] px-1 py-0.5 rounded bg-zinc-800 text-zinc-500" title={`Triplicity rulers: ${c.triplicity_rulers.join(", ")}`}>tri</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fortune / Spirit */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className={`rounded-xl border p-5 ${reading.fortune_layer.active ? "border-zinc-700 bg-zinc-900/40" : "border-zinc-800/50 bg-zinc-900/20 opacity-60"}`}>
                  <h2 className="text-sm font-semibold text-zinc-300 mb-2">Fortune Layer</h2>
                  <p className={`text-xs mb-2 ${reading.fortune_layer.active ? "text-zinc-400" : "text-zinc-600"}`}>{reading.fortune_layer.active ? "Active" : "Inactive"}</p>
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
                  <p className={`text-xs mb-2 ${reading.spirit_layer.active ? "text-zinc-400" : "text-zinc-600"}`}>{reading.spirit_layer.active ? "Active" : "Inactive"}</p>
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
                          <p className="text-xs text-zinc-500 mb-2">{profile.daimonic_function.join(" \u00b7 ")}</p>
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

              {/* Antiscia */}
              {reading.antiscia.length > 0 && (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
                  <h2 className="text-sm font-semibold text-zinc-300 mb-3">Antiscia (Hidden Connections)</h2>
                  <div className="space-y-1">
                    {reading.antiscia.map((a, i) => (
                      <p key={i} className="text-xs text-zinc-400">{bodyLabel(a.planet_a)} \u2194 {bodyLabel(a.planet_b)} (orb {a.orb.toFixed(1)}&deg;)</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Bonification */}
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
                        <li key={i} className="text-xs text-zinc-400">\u2022 {w}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-zinc-600 mb-2">Source edges</p>
                    <ul className="space-y-1">
                      {reading.graph_trace.source_edges.slice(0, 5).map((e, i) => (
                        <li key={i} className="text-xs text-zinc-400">\u2022 {e}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Raw packet toggle */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
                <button onClick={() => setShowRaw(!showRaw)} className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                  {showRaw ? "Hide" : "Show"} Raw Packet
                </button>
                {showRaw && (
                  <pre className="mt-3 text-xs text-zinc-500 overflow-x-auto max-h-[600px] overflow-y-auto">
                    {JSON.stringify(reading, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

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

function Angle({ label, lon }: { label: string; lon: number }) {
  return (
    <div className="bg-zinc-800/40 rounded-lg p-3 text-center">
      <div className="text-zinc-600 text-[10px] uppercase tracking-wider mb-0.5">{label}</div>
      <div className="text-zinc-200 font-medium text-sm">{fmtLon(lon)}</div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-zinc-800/30 rounded-lg p-3 border border-zinc-700/30">
      <p className="text-[10px] uppercase tracking-wider text-zinc-600 mb-0.5">{label}</p>
      <p className="text-xs text-zinc-300">{value}</p>
    </div>
  );
}

function DaimonicHouseCard({ title, tag, data, bodyLabel }: {
  title: string; tag: string; data: { house: number; planets: string[] }; bodyLabel: (id: string) => string;
}) {
  const colors: Record<string, string> = {
    good_fortune: "border-emerald-800/30 bg-emerald-950/5 text-emerald-400",
    good_daimon: "border-amber-800/30 bg-amber-950/5 text-amber-400",
    bad_fortune: "border-red-800/30 bg-red-950/5 text-red-400",
    bad_daimon: "border-zinc-700 bg-zinc-800/30 text-zinc-500",
  };
  return (
    <div className={`rounded-xl border p-4 ${colors[tag] || "border-zinc-800 bg-zinc-900/40"}`}>
      <p className="text-xs font-semibold text-zinc-300 mb-1">{title}</p>
      <p className="text-xs text-zinc-400">House {data.house}</p>
      {data.planets.length > 0 && (
        <p className="text-[10px] text-zinc-500 mt-1">{data.planets.map(bodyLabel).join(", ")}</p>
      )}
    </div>
  );
}
