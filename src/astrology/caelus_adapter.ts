import { Engine, type Chart, type ChartBody, type Aspect, type Position } from "caelus";
import { type NormalizedChart, type PlanetId, type HouseData, type AspectData, type ZodiacPosition, type DignityScore, PLANET_IDS } from "./types";

const SIGN_NAMES = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];

function toZodiac(lon: number): ZodiacPosition {
  const sign_index = Math.floor(lon / 30) % 12;
  return {
    sign: SIGN_NAMES[sign_index],
    sign_index,
    degree_absolute: lon,
    degree_in_sign: lon % 30,
  };
}

function toPlanetId(bodyName: string): PlanetId | null {
  const lower = bodyName.toLowerCase();
  if (PLANET_IDS.includes(lower as PlanetId)) return lower as PlanetId;
  return null;
}

function buildHouses(chart: Chart): HouseData[] {
  const houses: HouseData[] = [];
  const ascSignIndex = Math.floor(chart.angles.asc / 30) % 12;
  for (let i = 0; i < 12; i++) {
    const signIdx = (ascSignIndex + i) % 12;
    houses.push({
      number: i + 1,
      sign: SIGN_NAMES[signIdx],
      sign_index: signIdx,
      topics: HOUSE_TOPICS[i],
    });
  }
  return houses;
}

const HOUSE_TOPICS: Record<number, string[]> = {
  0: ["life", "vitality", "body", "character"],
  1: ["livelihood", "wealth", "resources"],
  2: ["siblings", "short travel", "communication"],
  3: ["home", "family", "roots", "end of life"],
  4: ["children", "pleasures", "creativity"],
  5: ["illness", "servitude", "health"],
  6: ["marriage", "partnership", "open enemies"],
  7: ["death", "inheritance", "transformation"],
  8: ["religion", "divination", "foreign travel"],
  9: ["profession", "reputation", "actions"],
  10: ["friends", "alliances", "hopes"],
  11: ["enemies", "suffering", "danger"],
};

function computeHermeticLots(chart: Chart, day: boolean): Array<{ lot: string; lon: number; house: number }> {
  const asc = chart.angles.asc;
  const sun = chart.bodies.sun.lon;
  const moon = chart.bodies.moon.lon;
  const mer = chart.bodies.mercury.lon;
  const ven = chart.bodies.venus.lon;
  const mar = chart.bodies.mars.lon;
  const jup = chart.bodies.jupiter.lon;
  const sat = chart.bodies.saturn.lon;
  const houses = buildHouses(chart);

  const results: Array<{ lot: string; lon: number; house: number }> = [];

  const formulas: Array<{ lot: string; fn: () => number }> = [
    { lot: "fortune", fn: () => day ? mod360(asc + moon - sun) : mod360(asc + sun - moon) },
    { lot: "spirit", fn: () => day ? mod360(asc + sun - moon) : mod360(asc + moon - sun) },
    { lot: "eros", fn: () => mod360(asc + ven - sun) },
    { lot: "necessity", fn: () => mod360(asc + sat - mer) },
    { lot: "courage", fn: () => mod360(asc + mar - sun) },
    { lot: "victory", fn: () => mod360(asc + jup - mer) },
    { lot: "nemesis", fn: () => mod360(asc + sat - ven) },
  ];

  for (const f of formulas) {
    const lon = f.fn();
    const signIdx = Math.floor(lon / 30) % 12;
    const found = houses.find(h => h.sign_index === signIdx);
    results.push({ lot: f.lot, lon, house: found ? found.number : 0 });
  }

  return results;
}

export function normalizeChart(chart: Chart, nativeId: string): NormalizedChart {
  const planets: Record<string, any> = {};
  const dignities: Record<string, any> = {};

  for (const [key, body] of Object.entries(chart.bodies)) {
    const pid = toPlanetId(key);
    if (!pid) continue;
    const b = body as ChartBody;
    planets[pid] = {
      sign: b.sign,
      sign_index: SIGN_NAMES.indexOf(b.sign),
      degree_absolute: b.lon,
      degree_in_sign: b.signDeg,
      speed: b.speed,
      retrograde: b.retrograde,
      house: b.house,
      dignities: b.dignities,
    };
  }

  const ascZodiac = toZodiac(chart.angles.asc);
  const mcZodiac = toZodiac(chart.angles.mc);
  const dayChart = isDayChart(chart);

  const lots: Record<string, any> = {};
  const hermeticLots = computeHermeticLots(chart, dayChart);
  for (const l of hermeticLots) {
    lots[l.lot] = { ...toZodiac(l.lon), house: l.house };
  }

  const houses = buildHouses(chart);

  const aspects: AspectData[] = (chart.aspects || []).map((a: Aspect) => ({
    planet_a: a.a as PlanetId,
    planet_b: a.b as PlanetId,
    aspect: a.aspect,
    orb: a.orb,
    strength: a.strength,
    phase: a.phase,
  }));

  return {
    native_id: nativeId,
    birth_data: {
      date: "",
      time: "",
      timezone: "UTC",
      location: { name: "", lat: 0, lon: 0 },
    },
    natal: {
      jdUt: chart.jdUt,
      ascendant: ascZodiac,
      mc: mcZodiac,
      planets: planets as any,
      houses_whole_sign: houses,
      aspects,
      lots: lots as any,
      dignity_scores: dignities as any,
      day_chart: dayChart,
    },
  };
}

function isDayChart(chart: Chart): boolean {
  const sun = chart.bodies.sun;
  const asc = chart.angles.asc;
  // Sun is above the horizon when it's between the Descendant (asc+180) and Ascendant
  // going forward: position relative to asc is >= 180° and < 360°
  const sunAboveHorizon = (sun.lon - asc + 360) % 360 >= 180;
  return sunAboveHorizon;
}

function mod360(n: number): number {
  return ((n % 360) + 360) % 360;
}

export { Engine, SIGN_NAMES, mod360 };
