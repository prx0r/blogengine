/** Test the full pipeline: deterministic → Pass 1 (Advanced) → Pass 2 (Ficinian) */
import { Engine } from "caelus";
import { embeddedData } from "caelus/data-embedded";
import { toUT } from "caelus-birth";
import { profectionAt, signRuler, SIGNS, zrAt } from "caelus";
import { normalizeChart } from "../src/astrology/caelus_adapter";
import { computeFirdaria, findSkyAspects } from "../src/astrology/activation_engine";
import { buildActivationPacket } from "../src/astrology/activation_packet";
import { buildMacroTranslation } from "../src/astrology/interpreters/aggregator";
import { synthesizeDaily } from "../src/astrology/synthesis";
import { registerSpellbookInGraph } from "../src/astrology/spellbook/spellbook";
import { getGraph, registerSourceRulesInGraph, registerPlanetProfilesInGraph } from "../src/astrology/knowledge_graph";
import type { PlanetId } from "../src/astrology/types";

const eng = new Engine(embeddedData);
const g = getGraph();
registerSpellbookInGraph();
registerSourceRulesInGraph();
registerPlanetProfilesInGraph();

// User's chart: 16 May 1999, 14:37 BST, Ascot UK (51.41°N, 0.67°W)
const form = { year: 1999, month: 5, day: 16, hour: 13, minute: 37, lat: 51.41, lon: -0.67, name: "Test" };
const t = toUT({ year: form.year, month: form.month, day: form.day, hour: form.hour, minute: form.minute, lat: form.lat, lon: form.lon });
const chart = eng.chart(t.utc.year, t.utc.month, t.utc.day, t.utc.hour, t.utc.minute, 0, form.lat, form.lon, "whole_sign");
const normalized = normalizeChart(chart, form.name);

const now = new Date();
const jdUt = now.getTime() / 86400000 + 2440587.5;
const pids: PlanetId[] = ["sun","moon","mercury","venus","mars","jupiter","saturn"];
const currentSkyPlanets: Record<string, {lon:number; sign_index:number}> = {};
for (const p of pids) { const lon = eng.longitude(p, jdUt); currentSkyPlanets[p] = { lon, sign_index: Math.floor(lon/30)%12 }; }
const currentSkyAspects = findSkyAspects(currentSkyPlanets);
const prof = profectionAt(eng, normalized.natal.jdUt, jdUt, form.lat, form.lon);
const zr = zrAt(eng, normalized.natal.jdUt, jdUt, form.lat, form.lon, "spirit") as any;
const zrFort = zrAt(eng, normalized.natal.jdUt, jdUt, form.lat, form.lon, "fortune") as any;
const firdaria = computeFirdaria(eng, normalized.natal.jdUt, jdUt, form.lat, form.lon);

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
const synthesis = synthesizeDaily(packet, normalized, macro);

const signNames = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
const ascSign = signNames[Math.floor(chart.angles.asc / 30) % 12] || "";
const natLots = normalized.natal.lots;

console.log("\n" + "=".repeat(60));
console.log("BIRTH DATA: 16 May 1999, 14:37 BST (13:37 UTC), Ascot UK");
console.log(`Ascendant: ${ascSign} ${(chart.angles.asc % 30).toFixed(2)}°`);
for (const p of pids) {
  const b = chart.bodies[p];
  if (b) console.log(`  ${p}: ${b.sign} ${b.signDeg.toFixed(2)}° H${b.house}${b.retrograde?" Rx":""} [${(b.dignities||[]).join(", ")}]`);
}
if (natLots.fortune) console.log(`Lot of Fortune: ${signNames[natLots.fortune.sign_index]} ${(natLots.fortune.degree_in_sign || 0).toFixed(2)}° H${natLots.fortune.house}`);
if (natLots.spirit) console.log(`Lot of Spirit: ${signNames[natLots.spirit.sign_index]} ${(natLots.spirit.degree_in_sign || 0).toFixed(2)}° H${natLots.spirit.house}`);

console.log("\n--- SIGNALS ---");
for (const s of packet.signals) {
  console.log(`${s.planet}: score=${s.score} conf=${s.confidence} sources=${s.timing_sources.join(",")} houses=[${s.activated_houses}]`);
}

console.log("\n--- YEAR/MONTH ---");
console.log(`Year lord: ${macro.timescales.year.profectionLord} (H${macro.timescales.year.profectionHouse})`);
console.log(`Month lord: ${macro.timescales.month ? macro.timescales.month.lord + " (H" + macro.timescales.month.profectionHouse + ")" : "none"}`);

console.log("\n--- DETERMINISTIC SYNTHESIS ---");
console.log(synthesis.traditions[0]?.atmosphere_decoding || "");
console.log(`ACTION: ${synthesis.traditions[0]?.action.what || ""}`);

console.log("\n" + "=".repeat(60));
console.log("LLM PIPELINE WOULD RUN NEXT (needs server + API key)");
console.log("Pass 1: Advanced Forecasting LLM");
console.log("Pass 2: Ficinian Depth (reads Pass 1 + deterministic + graph)");
console.log("=".repeat(60));
