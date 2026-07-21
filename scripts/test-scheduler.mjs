// Scheduler test — uses same synthetic chart as graph integration test
import { buildActivationPacket } from "../src/astrology/activation_packet";
import { interpretPacket } from "../src/astrology/interpretation_schema";
import { registerSpellbookInGraph } from "../src/astrology/spellbook/spellbook";
import { registerSourceRulesInGraph, registerPlanetProfilesInGraph, getGraph, pushActivationToGraph, resetGraph } from "../src/astrology/knowledge_graph";
import { buildSchedule } from "../src/astrology/scheduler";

resetGraph();
registerSpellbookInGraph();
registerSourceRulesInGraph();
registerPlanetProfilesInGraph();

const chart = {
  native_id: "test",
  birth_data: { date: "1990-06-15", time: "12:00", timezone: "UTC", location: { name: "London", lat: 51.5, lon: -0.12 } },
  natal: {
    jdUt: 2448000,
    ascendant: { sign: "Leo", sign_index: 4, degree_absolute: 150, degree_in_sign: 0 },
    mc: { sign: "Taurus", sign_index: 1, degree_absolute: 45, degree_in_sign: 15 },
    planets: {
      sun: { sign: "Gemini", sign_index: 2, degree_absolute: 75, degree_in_sign: 15, speed: 1, retrograde: false, house: 10, dignities: [] },
      moon: { sign: "Pisces", sign_index: 11, degree_absolute: 345, degree_in_sign: 15, speed: 13, retrograde: false, house: 4, dignities: [] },
      mercury: { sign: "Gemini", sign_index: 2, degree_absolute: 80, degree_in_sign: 20, speed: 1.5, retrograde: false, house: 10, dignities: ["domicile"] },
      venus: { sign: "Cancer", sign_index: 3, degree_absolute: 100, degree_in_sign: 10, speed: 1.2, retrograde: false, house: 11, dignities: [] },
      mars: { sign: "Aries", sign_index: 0, degree_absolute: 20, degree_in_sign: 20, speed: 0.8, retrograde: true, house: 8, dignities: [] },
      jupiter: { sign: "Libra", sign_index: 6, degree_absolute: 195, degree_in_sign: 15, speed: 0.2, retrograde: false, house: 3, dignities: [] },
      saturn: { sign: "Capricorn", sign_index: 9, degree_absolute: 285, degree_in_sign: 15, speed: 0.1, retrograde: false, house: 6, dignities: ["domicile"] },
    },
    houses_whole_sign: [...Array(12)].map((_, i) => ({ number: i + 1, sign: "", sign_index: 0, topics: [] })),
    aspects: [],
    lots: { fortune: { sign: "", sign_index: 0, degree_absolute: 0, degree_in_sign: 0, house: 0 }, spirit: { sign: "", sign_index: 0, degree_absolute: 0, degree_in_sign: 0, house: 0 }, eros: { sign: "", sign_index: 0, degree_absolute: 0, degree_in_sign: 0, house: 0 }, necessity: { sign: "", sign_index: 0, degree_absolute: 0, degree_in_sign: 0, house: 0 }, courage: { sign: "", sign_index: 0, degree_absolute: 0, degree_in_sign: 0, house: 0 }, victory: { sign: "", sign_index: 0, degree_absolute: 0, degree_in_sign: 0, house: 0 }, nemesis: { sign: "", sign_index: 0, degree_absolute: 0, degree_in_sign: 0, house: 0 } },
    dignity_scores: {},
    day_chart: true,
  },
};

const targetDate = new Date("2026-07-09T12:00:00");
const currentSkyPlanets = {
  sun: { lon: 75, sign_index: 2 }, moon: { lon: 345, sign_index: 11 },
  mercury: { lon: 80, sign_index: 2 }, venus: { lon: 100, sign_index: 3 },
  mars: { lon: 20, sign_index: 0 }, jupiter: { lon: 195, sign_index: 6 },
  saturn: { lon: 285, sign_index: 9 },
};

const packet = buildActivationPacket({ chart, currentSkyPlanets, currentSkyAspects: [], targetDate });
const oikodespotes = packet.oikodespotes?.planet;
const reading = interpretPacket(packet, oikodespotes);

const allThemes = [
  ...reading.interpretations.al_khayyat, ...reading.interpretations.valens,
  ...reading.interpretations.ficino, ...reading.interpretations.greenbaum,
  ...reading.interpretations.demetra,
];
pushActivationToGraph(
  packet.signals,
  allThemes.map(t => ({ planet: t.planet, tags: t.tags, system: t.system })),
  oikodespotes,
);

const schedule = buildSchedule(packet, reading);

console.log("=== TODAY'S SCHEDULE ===\n");
for (const item of schedule.items) {
  const tags = [];
  if (item.daimon) tags.push("DAIMON");
  if (item.converged) tags.push("CONVERGED");
  console.log(`${item.date}  ${item.label}  [${tags.join(" ")} ${item.type.toUpperCase()}]`);
  if (item.planetaryHour) {
    console.log(`  ⏰ Best time: ${item.planetaryHour.start}–${item.planetaryHour.end} (${item.planetaryHour.planet} hour)`);
  }
  if (item.interpretations.length > 0) {
    console.log(`  📖 Why:`);
    for (const int of item.interpretations) console.log(`     · ${int}`);
  }
  if (item.practices.length > 0) {
    console.log(`  ✦ Practices:`);
    for (const p of item.practices) console.log(`     · ${p}`);
  }
  if (item.correspondences.length > 0) {
    console.log(`  ◇ Materials: ${item.correspondences.join(", ")}`);
  }
  console.log("");
}

console.log("=== THIS WEEK'S OPPORTUNITIES ===\n");
for (const item of schedule.weekly) {
  console.log(`${item.date}  ${item.label}`);
  if (item.planetaryHour) console.log(`  ⏰ ${item.planetaryHour.planet} hour at ${item.planetaryHour.start}`);
  if (item.practices.length > 0) {
    for (const p of item.practices) console.log(`  ✦ ${p}`);
  }
  console.log("");
}

console.log("=== UPCOMING DAIMON DAYS ===\n");
for (const item of schedule.upcomingDaimonEvents) {
  console.log(`${item.date}  ${item.label}`);
  if (item.planetaryHour) console.log(`  ⏰ ${item.planetaryHour.start}–${item.planetaryHour.end}`);
  if (item.practices.length > 0) {
    for (const p of item.practices) console.log(`  ✦ ${p}`);
  }
  console.log("");
}
