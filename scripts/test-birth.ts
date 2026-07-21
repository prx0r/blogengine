/** Test with two different birth charts to verify timescale coherence */
import { Engine } from "caelus";
import { embeddedData } from "caelus/data-embedded";
import { toUT } from "caelus-birth";
import { profectionAt, signRuler, SIGNS, zrAt } from "caelus";
import { normalizeChart } from "../src/astrology/caelus_adapter";
import { computeFirdaria, findSkyAspects } from "../src/astrology/activation_engine";
import { buildActivationPacket } from "../src/astrology/activation_packet";
import { buildMacroTranslation } from "../src/astrology/interpreters/aggregator";
import { synthesizeDaily } from "../src/astrology/synthesis";
import { interpretPacket } from "../src/astrology/interpretation_schema";
import { registerSpellbookInGraph } from "../src/astrology/spellbook/spellbook";
import { getGraph, registerSourceRulesInGraph, registerPlanetProfilesInGraph } from "../src/astrology/knowledge_graph";
import type { PlanetId } from "../src/astrology/types";

const eng = new Engine(embeddedData);

function testChart(label: string, year: number, month: number, day: number, hour: number, minute: number, lat: number, lon: number, name: string) {
  const t = toUT({ year, month, day, hour, minute, lat, lon });
  const chart = eng.chart(t.utc.year, t.utc.month, t.utc.day, t.utc.hour, t.utc.minute, 0, lat, lon, "whole_sign");
  const normalized = normalizeChart(chart, name);

  const now = new Date();
  const jdUt = now.getTime() / 86400000 + 2440587.5;
  const pids: PlanetId[] = ["sun","moon","mercury","venus","mars","jupiter","saturn"];
  const currentSkyPlanets: Record<string, {lon:number; sign_index:number}> = {};
  for (const p of pids) { const lon = eng.longitude(p, jdUt); currentSkyPlanets[p] = { lon, sign_index: Math.floor(lon/30)%12 }; }
  const currentSkyAspects = findSkyAspects(currentSkyPlanets);
  const prof = profectionAt(eng, normalized.natal.jdUt, jdUt, lat, lon);
  const zr = zrAt(eng, normalized.natal.jdUt, jdUt, lat, lon, "spirit") as any;
  const zrFort = zrAt(eng, normalized.natal.jdUt, jdUt, lat, lon, "fortune") as any;
  const firdaria = computeFirdaria(eng, normalized.natal.jdUt, jdUt, lat, lon);

  const pi = {
    chart: normalized, currentSkyPlanets, currentSkyAspects, targetDate: now,
    profection: { annual: { house: prof.annual.house, sign: prof.annual.sign, lord: prof.annual.lord as PlanetId }, monthly: { house: prof.monthly.house, sign: prof.monthly.sign, lord: prof.monthly.lord as PlanetId } },
    zrSpirit: zr?.l1 ? { lord: signRuler(SIGNS.indexOf(zr.l1)) as PlanetId, sign: zr.l1 } : undefined,
    zrFortune: zrFort?.l1 ? { lord: signRuler(SIGNS.indexOf(zrFort.l1)) as PlanetId, sign: zrFort.l1 } : undefined,
    firdaria: firdaria.lord ? { lord: firdaria.lord as PlanetId } : undefined,
  };

  const packet = buildActivationPacket(pi);
  const oiko = packet.oikodespotes?.planet;
  const macro = buildMacroTranslation(packet, oiko);

  // Compute yesterday for comparison
  const yesterdayDate = new Date(now.getTime() - 86400000);
  const yJdUt = yesterdayDate.getTime() / 86400000 + 2440587.5;
  const ySky: Record<string, {lon:number; sign_index:number}> = {};
  for (const p of pids) { const lon = eng.longitude(p, yJdUt); ySky[p] = { lon, sign_index: Math.floor(lon/30)%12 }; }
  const yAspects = findSkyAspects(ySky);
  const yProf = profectionAt(eng, normalized.natal.jdUt, yJdUt, lat, lon);
  const yPi = {
    chart: normalized, currentSkyPlanets: ySky, currentSkyAspects: yAspects, targetDate: yesterdayDate,
    profection: { annual: { house: yProf.annual.house, sign: yProf.annual.sign, lord: yProf.annual.lord as PlanetId }, monthly: { house: yProf.monthly.house, sign: yProf.monthly.sign, lord: yProf.monthly.lord as PlanetId } },
    zrSpirit: zr?.l1 ? { lord: signRuler(SIGNS.indexOf(zr.l1)) as PlanetId, sign: zr.l1 } : undefined,
    zrFortune: zrFort?.l1 ? { lord: signRuler(SIGNS.indexOf(zrFort.l1)) as PlanetId, sign: zrFort.l1 } : undefined,
    firdaria: firdaria.lord ? { lord: firdaria.lord as PlanetId } : undefined,
  };
  const yPacket = buildActivationPacket(yPi);

  // Build comparison
  const todayDescs = new Set(packet.atmosphere.daily.activations.map(a => a.description));
  const yDescs = new Set(yPacket.atmosphere.daily.activations.map(a => a.description));
  const newTransits = [...todayDescs].filter(d => !yDescs.has(d)).slice(0, 3);
  const droppedTransits = [...yDescs].filter(d => !todayDescs.has(d)).slice(0, 3);
  const yScores = new Map(yPacket.signals.map(s => [s.planet, s.score]));
  const stronger: Array<{planet:string;score_delta:number}> = [];
  const weaker: Array<{planet:string;score_delta:number}> = [];
  for (const s of packet.signals) {
    const ys = yScores.get(s.planet) || 0;
    const delta = Math.round((s.score - ys) * 10) / 10;
    if (delta > 1) stronger.push({planet:s.planet,score_delta:delta});
    else if (delta < -1) weaker.push({planet:s.planet,score_delta:delta});
  }
  const comparison = { date: yesterdayDate.toISOString().split("T")[0], new_transits: newTransits, dropped_transits: droppedTransits, stronger_planets: stronger, weaker_planets: weaker };

  const synthesis = synthesizeDaily(packet, normalized, macro, comparison);
  const reading = interpretPacket(packet, oiko);
  const t2 = synthesis.traditions[0];

  const signNames = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
  console.log(`\n${"=".repeat(60)}`);
  console.log(`${label}`);
  console.log(`Chart: ${year}-${month}-${day} ${hour}:${minute}, ${lat}° ${lon}°`);
  console.log(`Asc: ${signNames[Math.floor(chart.angles.asc/30)%12]}`);
  for (const p of pids) {
    const b = chart.bodies[p];
    if (b) console.log(`  ${p}: ${b.sign} ${b.signDeg.toFixed(1)}° H${b.house}${b.retrograde?" Rx":""}`);
  }

  console.log(`\nSIGNALS: ${macro.timescales.day.topSignals.map(s=>`${s.planet}(${s.confidence})`).join(", ")}`);
  console.log(`Year: H${macro.timescales.year.profectionHouse} lord=${macro.timescales.year.profectionLord}`);
  console.log(`Month: ${macro.timescales.month ? `H${macro.timescales.month.profectionHouse} lord=${macro.timescales.month.lord}` : "none"}`);
  console.log(`${"=".repeat(60)}`);
  console.log(t2.atmosphere_decoding);
  console.log(`\nACTION: ${t2.action.what} (${t2.action.urgency})`);
  console.log(`WHY: ${t2.action.why}`);
}

// Re-register graph for each test
const g = getGraph();
registerSpellbookInGraph();
registerSourceRulesInGraph();
registerPlanetProfilesInGraph();

// Test 1: Gemini Sun, Libra Moon, Libra Asc (June 8 1995, 14:30, London)
testChart("TEST 1: Gemini Sun / Libra Moon", 1995, 6, 8, 14, 30, 51.5, -0.12, "Test1");

// Test 2: Different chart — Capricorn Sun, Aries Moon (Jan 15 1988, 06:00, New York)
testChart("TEST 2: Capricorn Sun / Aries Moon", 1988, 1, 15, 6, 0, 40.7, -74.0, "Test2");

// Test 3: Leo Sun, Scorpio Moon, early afternoon (Aug 22 1979, 13:15, Tokyo)
testChart("TEST 3: Leo Sun / Scorpio Moon", 1979, 8, 22, 13, 15, 35.7, 139.7, "Test3");
