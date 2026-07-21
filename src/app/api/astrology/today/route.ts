import { NextRequest, NextResponse } from "next/server";
import { Engine } from "caelus";
import { embeddedData } from "caelus/data-embedded";
import { profectionAt, signRuler, SIGNS } from "caelus";
import { zrAt } from "caelus";
import { normalizeChart } from "@/astrology/caelus_adapter";
import { computePlanetConditions, computeFirdaria, findSkyAspects } from "@/astrology/activation_engine";
import { computeOikodespotes } from "@/astrology/oikodespotes";
import { buildActivationPacket, type PacketInput } from "@/astrology/activation_packet";
import { buildDailySphereReading } from "@/astrology/daily_sphere_reader";
import { buildMacroTranslation } from "@/astrology/interpreters/aggregator";
import { interpretPacket } from "@/astrology/interpretation_schema";
import { getGraph, registerSourceRulesInGraph, registerPlanetProfilesInGraph } from "@/astrology/knowledge_graph";
import { registerSpellbookInGraph } from "@/astrology/spellbook/spellbook";
import type { PlanetId } from "@/astrology/types";

let graphInitialized = false;

function ensureGraph() {
  if (!graphInitialized) {
    getGraph();
    registerSpellbookInGraph();
    registerSourceRulesInGraph();
    registerPlanetProfilesInGraph();
    graphInitialized = true;
  }
  return getGraph();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      year, month, day, hour, minute = 0,
      lat, lon,
      name = "Native",
      timezone = 0,
    } = body;

    if (!year || !month || !day || hour === undefined || lat === undefined || lon === undefined) {
      return NextResponse.json({
        error: "Missing required fields: year, month, day, hour, lat, lon"
      }, { status: 400 });
    }

    const engine = new Engine(embeddedData);

    const chart = engine.chart(year, month, day, hour, minute, timezone, lat, lon, "whole_sign");
    const normalized = normalizeChart(chart, name);
    const conditions = computePlanetConditions(normalized);
    const oikodespotes = computeOikodespotes(normalized);

    const now = new Date();
    const jdUt = now.getTime() / 86400000 + 2440587.5;

    const currentSky: Record<PlanetId, { lon: number; sign_index: number }> = {} as any;
    for (const p of ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn"] as PlanetId[]) {
      const lon = engine.longitude(p, jdUt);
      currentSky[p] = { lon, sign_index: Math.floor(lon / 30) % 12 };
    }

    const currentSkyAspects = findSkyAspects(currentSky);

    const prof = profectionAt(engine, normalized.natal.jdUt, jdUt, lat, lon);
    const zrSpirit = zrAt(engine, normalized.natal.jdUt, jdUt, lat, lon, "spirit");
    const zrFortune = zrAt(engine, normalized.natal.jdUt, jdUt, lat, lon, "fortune");
    const firdaria = computeFirdaria(engine, normalized.natal.jdUt, jdUt, lat, lon);

    const packetInput: PacketInput = {
      chart: normalized,
      currentSkyPlanets: currentSky,
      currentSkyAspects,
      targetDate: now,
      profection: {
        annual: { house: prof.annual.house, sign: prof.annual.sign, lord: prof.annual.lord as PlanetId },
        monthly: { house: prof.monthly.house, sign: prof.monthly.sign, lord: prof.monthly.lord as PlanetId },
      },
      zrSpirit: (zrSpirit as any).l1 ? { lord: signRuler(SIGNS.indexOf((zrSpirit as any).l1)) as PlanetId, sign: (zrSpirit as any).l1 } : undefined,
      zrFortune: (zrFortune as any).l1 ? { lord: signRuler(SIGNS.indexOf((zrFortune as any).l1)) as PlanetId, sign: (zrFortune as any).l1 } : undefined,
      firdaria: firdaria.lord ? { lord: firdaria.lord as PlanetId } : undefined,
    };

    const age = now.getFullYear() - year - (now.getMonth() < month - 1 || (now.getMonth() === month - 1 && now.getDate() < day) ? 1 : 0);

    const packet = buildActivationPacket(packetInput);
    const reading = buildDailySphereReading(packetInput);
    const interpretation = interpretPacket(packet, oikodespotes?.planet);
    const macro = buildMacroTranslation(packet, oikodespotes?.planet, age);

    const graph = ensureGraph();
    const graphData: Record<string, any> = {};
    for (const sig of packet.signals.slice(0, 5)) {
      try {
        const cluster = graph.clusterByPlanet(sig.planet);
        const correspondences = graph.getCorrespondences(sig.planet);
        graphData[sig.planet] = {
          nodeCount: cluster.nodes.length,
          edgeCount: cluster.edges.length,
          correspondences: correspondences.map(e => e.object),
          edges: cluster.edges.filter(e => e.predicate === "practice_for").map(e => ({
            practice: e.object,
            label: graph.getNode(e.object)?.label || e.object,
          })),
        };
      } catch { }
    }

    return NextResponse.json({
      date: now.toISOString().split("T")[0],
      age,
      name,
      chart: {
        ascendant: `${normalized.natal.ascendant.sign} ${Math.round(normalized.natal.ascendant.degree_in_sign)}°`,
        mc: `${normalized.natal.mc.sign} ${Math.round(normalized.natal.mc.degree_in_sign)}°`,
        fortune: `${normalized.natal.lots.fortune.sign} H${normalized.natal.lots.fortune.house}`,
        spirit: `${normalized.natal.lots.spirit.sign} H${normalized.natal.lots.spirit.house}`,
        planets: Object.fromEntries(
          ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn"].map(p => {
            const pl = normalized.natal.planets[p as PlanetId];
            const c = conditions.find(x => x.planet === p);
            return [p, {
              sign: pl?.sign || "",
              degree: Math.round(pl?.degree_in_sign || 0),
              house: pl?.house || 0,
              angularity: c?.angularity || "cadent",
              dignities: c?.essential_dignity || [],
              retrograde: pl?.retrograde || false,
              sect: c?.sect_status,
              strength_score: c?.strength_score || 0,
              difficulty_score: c?.difficulty_score || 0,
            }];
          }),
        ),
      },
      oikodespotes: oikodespotes ? {
        planet: oikodespotes.planet,
        name: oikodespotes.name,
        score: oikodespotes.score,
        interpretation: oikodespotes.interpretation,
        soulChoice: oikodespotes.soul_choice,
        pointsConsidered: oikodespotes.points_considered,
      } : null,
      signals: packet.signals.map(s => ({
        planet: s.planet,
        score: s.score,
        confidence: s.confidence,
        timing_sources: s.timing_sources,
        timescales: s.timescales,
        activated_houses: s.activated_houses,
        activated_lots: s.activated_lots,
      })),
      dominant_mode: packet.dominant_mode,
      fortune_score: packet.fortune_score,
      spirit_score: packet.spirit_score,
      interpretation: {
        convergence: interpretation.convergence,
        macro: {
          prevailing_temperament: macro.integrated.prevailing_temperament,
          dominant_house: macro.integrated.dominant_house,
          dominant_element: macro.integrated.dominant_element,
          dominant_modality: macro.integrated.dominant_modality,
          tightest_config: macro.integrated.tightest_config,
          tensions: macro.integrated.tensions,
          eases: macro.integrated.eases,
          year_daily_interaction: macro.integrated.year_daily_interaction,
          month_daily_interaction: macro.integrated.month_daily_interaction,
        },
        timescales: {
          year: macro.timescales.year,
          month: macro.timescales.month,
          week: macro.timescales.week,
          day: macro.timescales.day,
        },
        interpreters: {
          al_khayyat: interpretation.interpretations.al_khayyat.map(t => ({ title: t.title, body: t.body, planet: t.planet })),
          valens: interpretation.interpretations.valens.map(t => ({ title: t.title, body: t.body, tags: t.tags })),
          ficino: interpretation.interpretations.ficino.map(t => ({ title: t.title, body: t.body, practices: t.practice })),
          greenbaum: interpretation.interpretations.greenbaum.map(t => ({ title: t.title, body: t.body })),
          demetra: interpretation.interpretations.demetra.map(t => ({ title: t.title, body: t.body, planet: t.planet })),
        },
      },
      graph: graphData,
      graph_stats: {
        total_nodes: graph.getAllNodes().length,
        total_edges: 0,
        layers: graph.getLayers(),
      },
    });
  } catch (error) {
    console.error("Astrology today error:", error);
    return NextResponse.json({
      error: "Failed to compute astrology reading",
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}
