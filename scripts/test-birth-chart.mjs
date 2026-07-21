import { Engine } from "caelus";
import { embeddedData } from "caelus/data-embedded";
import { toUT } from "caelus-birth";
import { profectionAt, signRuler, SIGNS, zrAt } from "caelus";
import { normalizeChart } from "../src/astrology/caelus_adapter.ts";
import { computeFirdaria, findSkyAspects } from "../src/astrology/activation_engine.ts";
import { buildActivationPacket } from "../src/astrology/activation_packet.ts";
import { buildMacroTranslation } from "../src/astrology/interpreters/aggregator.ts";
import { synthesizeDaily } from "../src/astrology/synthesis.ts";

const eng = new Engine(embeddedData);

// Test: random birth chart (e.g. someone born June 8 1995, 14:30, London)
const form = { year: 1995, month: 6, day: 8, hour: 14, minute: 30, lat: 51.5, lon: -0.12, name: "Test Native" };

const t = toUT({ year: form.year, month: form.month, day: form.day, hour: form.hour, minute: form.minute, lat: form.lat, lon: form.lon });
const chart = eng.chart(t.utc.year, t.utc.month, t.utc.day, t.utc.hour, t.utc.minute, 0, form.lat, form.lon, "whole_sign");
const normalized = normalizeChart(chart, form.name);

const now = new Date();
const jdUt = now.getTime() / 86400000 + 2440587.5;

const currentSkyPlanets = {};
for (const p of ["sun","moon","mercury","venus","mars","jupiter","saturn"]) {
  const lon = eng.longitude(p, jdUt);
  currentSkyPlanets[p] = { lon, sign_index: Math.floor(lon / 30) % 12 };
}

const currentSkyAspects = findSkyAspects(currentSkyPlanets);
const prof = profectionAt(eng, normalized.natal.jdUt, jdUt, form.lat, form.lon);
const zr = zrAt(eng, normalized.natal.jdUt, jdUt, form.lat, form.lon, "spirit");
const zrFort = zrAt(eng, normalized.natal.jdUt, jdUt, form.lat, form.lon, "fortune");
const firdaria = computeFirdaria(eng, normalized.natal.jdUt, jdUt, form.lat, form.lon);

const packetInput = {
  chart: normalized, currentSkyPlanets, currentSkyAspects, targetDate: now,
  profection: {
    annual: { house: prof.annual.house, sign: prof.annual.sign, lord: prof.annual.lord },
    monthly: { house: prof.monthly.house, sign: prof.monthly.sign, lord: prof.monthly.lord },
  },
  zrSpirit: zr?.l1 ? { lord: signRuler(SIGNS.indexOf(zr.l1)), sign: zr.l1 } : undefined,
  zrFortune: zrFort?.l1 ? { lord: signRuler(SIGNS.indexOf(zrFort.l1)), sign: zrFort.l1 } : undefined,
  firdaria: firdaria.lord ? { lord: firdaria.lord } : undefined,
};

const packet = buildActivationPacket(packetInput);
const macro = buildMacroTranslation(packet, packet.oikodespotes?.planet);
const synthesis = synthesizeDaily(packet, normalized, macro);

const t2 = synthesis.traditions[0];
console.log("=== BIRTH DATA ===");
console.log(`${form.name}: ${form.year}-${form.month}-${form.day} ${form.hour}:${form.minute}, ${form.lat}°, ${form.lon}°`);
console.log(`Natal Sun: ${chart.bodies.sun.sign} ${chart.bodies.sun.signDeg.toFixed(2)}° House ${chart.bodies.sun.house}`);
console.log(`Natal Moon: ${chart.bodies.moon.sign} ${chart.bodies.moon.signDeg.toFixed(2)}° House ${chart.bodies.moon.house}`);
console.log(`Natal Mercury: ${chart.bodies.mercury.sign} ${chart.bodies.mercury.signDeg.toFixed(2)}° House ${chart.bodies.mercury.house}`);

const conds = packet.planet_conditions;
const sigs = packet.signals;

console.log("\n=== TODAY'S SIGNALS (sorted by score) ===");
for (const s of sigs) {
  const c = conds.find(x => x.planet === s.planet);
  console.log(`${s.planet.padEnd(10)} score=${String(s.score).padEnd(5)} conf=${s.confidence.padEnd(6)} sources=${s.timing_sources.join(",").padEnd(40)} house=${(s.activated_houses || []).join(",")} lots=${(s.activated_lots || []).join(",")}`);
}

console.log("\n=== MACRO (INTEGRATED) ===");
const m = macro.integrated;
console.log(`Temperament: ${m.prevailing_temperament.substring(0, 200)}...`);
console.log(`Dominant house: H${m.dominant_house.house} (${m.dominant_house.theme}) score=${m.dominant_house.score}`);
console.log(`Tensions: ${m.tensions.length}, Eases: ${m.eases.length}`);
console.log(`Tightest: ${m.tightest_config?.description}`);

console.log("\n=== FICINO SYNTHESIS ===");
console.log(t2.atmosphere_decoding);
console.log(`\nACTION: ${t2.action.what} (${t2.action.urgency})`);
console.log(`WHY: ${t2.action.why}`);
