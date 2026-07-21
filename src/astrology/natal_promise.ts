/**
 * Natal promise — the baseline story of the chart, independent of timing.
 * Answers: what is the native's fundamental nature, what are they here to work on?
 */
import type { PlanetId, PlanetConditionPacket, NormalizedChart, AspectData, AspectPattern } from "./types";
import { PLANET_IDS, toPlanetName } from "./types";
import { detectAspectPatterns } from "./aspect_patterns";
import { getHouseTopics } from "./valens_combinations";

export interface NatalPromise {
  /** The most dignified planet in the chart (by essential dignity + angularity) */
  strongest_planet: { planet: PlanetId; reason: string } | null;
  /** The most afflicted planet */
  most_afflicted: { planet: PlanetId; reason: string } | null;
  /** Stellium — the house with 3+ planets */
  stellium: { house: number; planets: PlanetId[]; topics: string[] } | null;
  /** Element predominance */
  element_predominance: { element: string; percentage: number }[];
  /** Modality predominance */
  modality_predominance: { modality: string; percentage: number }[];
  /** Unaspected planets (no major aspects within orb) */
  unaspected_planets: PlanetId[];
  /** The planet that rules the most houses */
  sect_ruler: PlanetId;
  /** Most aspected planet */
  most_aspected: PlanetId;
}

const ELEMENTS: Record<number, string> = { 0: "fire", 1: "earth", 2: "air", 3: "water" };
const MODALITIES: Record<number, string> = { 0: "cardinal", 1: "fixed", 2: "mutable" };

export function computeNatalPromise(chart: NormalizedChart, conditions: PlanetConditionPacket[]): NatalPromise {
  const planets = chart.natal.planets;

  // Strongest planet
  let strongest: { planet: PlanetId; score: number; reason: string } | null = null;
  let mostAfflicted: { planet: PlanetId; score: number; reason: string } | null = null;

  for (const cond of conditions) {
    if (cond.difficulty_score > 0 && (!mostAfflicted || cond.difficulty_score > mostAfflicted.score)) {
      mostAfflicted = { planet: cond.planet, score: cond.difficulty_score, reason: `${cond.essential_dignity.join(", ")} ${cond.retrograde ? "Rx" : ""}`.trim() };
    }
    if (cond.strength_score > 0 && (!strongest || cond.strength_score > strongest.score)) {
      strongest = { planet: cond.planet, score: cond.strength_score, reason: `${cond.angularity} ${cond.essential_dignity.join(", ")} ${cond.sect_status}` };
    }
  }

  // Stellium — 3+ planets in same house
  const houseCount = new Map<number, PlanetId[]>();
  for (const pid of PLANET_IDS) {
    const p = planets[pid];
    if (!p) continue;
    if (!houseCount.has(p.house)) houseCount.set(p.house, []);
    houseCount.get(p.house)!.push(pid);
  }
  let stellium: { house: number; planets: PlanetId[]; topics: string[] } | null = null;
  for (const [h, ps] of houseCount) {
    if (ps.length >= 3) {
      stellium = { house: h, planets: ps, topics: getHouseTopics(h) };
      break;
    }
  }

  // Element predominance
  const elementCount: Record<string, number> = { fire: 0, earth: 0, air: 0, water: 0 };
  for (const pid of PLANET_IDS) {
    const p = planets[pid];
    if (!p) continue;
    elementCount[ELEMENTS[p.sign_index % 4]]++;
  }
  const totalPlanets = PLANET_IDS.filter(p => planets[p]).length;
  const elementPredominance = Object.entries(elementCount)
    .map(([element, count]) => ({ element, percentage: Math.round((count / totalPlanets) * 100) }))
    .sort((a, b) => b.percentage - a.percentage);

  // Modality predominance
  const modalityCount: Record<string, number> = { cardinal: 0, fixed: 0, mutable: 0 };
  for (const pid of PLANET_IDS) {
    const p = planets[pid];
    if (!p) continue;
    modalityCount[MODALITIES[p.sign_index % 3]]++;
  }
  const modalityPredominance = Object.entries(modalityCount)
    .map(([modality, count]) => ({ modality, percentage: Math.round((count / totalPlanets) * 100) }))
    .sort((a, b) => b.percentage - a.percentage);

  // Unaspected planets
  const aspectedSet = new Set<PlanetId>();
  for (const asp of chart.natal.aspects) {
    if (asp.orb <= 6) {
      aspectedSet.add(asp.planet_a);
      aspectedSet.add(asp.planet_b);
    }
  }
  const unaspected = PLANET_IDS.filter(p => planets[p] && !aspectedSet.has(p));

  // Planet that rules the most houses
  const houseRulerCount = new Map<PlanetId, number>();
  const SIGN_RULERS: PlanetId[] = ["mars", "venus", "mercury", "moon", "sun", "mercury", "venus", "mars", "jupiter", "saturn", "saturn", "jupiter"];
  for (const h of chart.natal.houses_whole_sign) {
    const ruler = SIGN_RULERS[h.sign_index];
    houseRulerCount.set(ruler, (houseRulerCount.get(ruler) || 0) + 1);
  }
  let maxCount = 0;
  let sectRuler: PlanetId = "sun";
  for (const [pid, count] of houseRulerCount) {
    if (count > maxCount) { maxCount = count; sectRuler = pid; }
  }

  // Most aspected planet
  const aspectCount = new Map<PlanetId, number>();
  for (const asp of chart.natal.aspects) {
    if (asp.orb > 6) continue;
    aspectCount.set(asp.planet_a, (aspectCount.get(asp.planet_a) || 0) + 1);
    aspectCount.set(asp.planet_b, (aspectCount.get(asp.planet_b) || 0) + 1);
  }
  let mostAspected: PlanetId = "sun";
  let mostCount = 0;
  for (const [pid, count] of aspectCount) {
    if (count > mostCount) { mostCount = count; mostAspected = pid; }
  }

  return {
    strongest_planet: strongest ? { planet: strongest.planet, reason: strongest.reason } : null,
    most_afflicted: mostAfflicted ? { planet: mostAfflicted.planet, reason: mostAfflicted.reason } : null,
    stellium,
    element_predominance: elementPredominance,
    modality_predominance: modalityPredominance,
    unaspected_planets: unaspected,
    sect_ruler: sectRuler,
    most_aspected: mostAspected,
  };
}
