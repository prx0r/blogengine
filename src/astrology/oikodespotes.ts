import { almuten, type Sect } from "caelus";
import type { NormalizedChart, OikodespotesResult, PlanetId } from "./types";
import { toPlanetName, PLANET_IDS } from "./types";

const PLANET_ORDER: PlanetId[] = ["saturn", "jupiter", "mars", "venus", "mercury", "moon", "sun"];

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/**
 * Compute the oikodespotes (house-master / personal daimon) using Porphyry's method.
 *
 * Per Greenbaum ch.7 and Porphyry's Introduction to the Tetrabiblos ch.30:
 * Find which planet has the greatest essential dignity (almuten) at each of
 * five key points: ASC, Lot of Fortune, Lot of Spirit, Sun, Moon.
 * The planet with the highest total score is the oikodespotes.
 */
export function computeOikodespotes(chart: NormalizedChart): OikodespotesResult | undefined {
  const sect: Sect = chart.natal.day_chart ? "day" : "night";

  const points = [
    { name: "Ascendant", lon: chart.natal.ascendant.degree_absolute },
    { name: "Lot of Fortune", lon: chart.natal.lots.fortune.degree_absolute },
    { name: "Lot of Spirit", lon: chart.natal.lots.spirit.degree_absolute },
    { name: "Sun", lon: chart.natal.planets.sun.degree_absolute },
    { name: "Moon", lon: chart.natal.planets.moon.degree_absolute },
  ];

  const scores = new Map<PlanetId, { score: number; points: string[] }>();
  for (const pid of PLANET_IDS) {
    scores.set(pid, { score: 0, points: [] });
  }

  for (const pt of points) {
    try {
      const result = almuten(pt.lon, sect);
      if (result && result.planet) {
        const pid = result.planet.toLowerCase() as PlanetId;
        if (scores.has(pid)) {
          const entry = scores.get(pid)!;
          entry.score += result.score;
          entry.points.push(pt.name);
        }
      }
    } catch {
      // almuten may fail for some degrees; skip
    }
  }

  // Find the planet with the highest score
  let best: { planet: PlanetId; score: number; points: string[] } | null = null;
  for (const [pid, entry] of scores) {
    if (entry.score > 0 && (!best || entry.score > best.score || (entry.score === best.score && PLANET_ORDER.indexOf(pid) < PLANET_ORDER.indexOf(best.planet)))) {
      best = { planet: pid, score: entry.score, points: entry.points };
    }
  }

  if (!best) return undefined;

  // Deep interpretation — why this daimon chose THIS life
  const planetCondition = chart.natal.planets[best.planet];
  const house = planetCondition?.house || 0;
  const sign = planetCondition?.sign || "";
  const houseTopic = house > 0 ? chart.natal.houses_whole_sign[house - 1]?.topics?.[0] || "unknown" : "unknown";
  const dignified = planetCondition?.dignities?.includes("domicile") || planetCondition?.dignities?.includes("exaltation");

  const daimonWhy: Record<PlanetId, string> = {
    sun: `The soul chose solar incarnation — to learn authentic leadership and creative will. The daimon placed the Sun in ${sign} in the ${ordinal(house)} house of ${houseTopic}, where the native's identity must be forged through ${dignified ? "natural authority" : "conscious effort"}.`,
    moon: `The soul chose lunar incarnation — to learn emotional attunement and embodied wisdom. The daimon placed the Moon in ${sign} in the ${ordinal(house)} house of ${houseTopic}, where feeling and nurture are the gateway to growth.`,
    mercury: `The soul chose Mercurial incarnation — to learn articulation, symbol systems, and the translation between worlds. The daimon placed Mercury in ${sign} in the ${ordinal(house)} house of ${houseTopic}, where speech and thought are the primary instruments of becoming.`,
    venus: `The soul chose Venusian incarnation — to learn love, beauty, and right relationship. The daimon placed Venus in ${sign} in the ${ordinal(house)} house of ${houseTopic}, where harmony and value must be cultivated through experience.`,
    mars: `The soul chose Martial incarnation — to learn courage, initiative, and righteous action. The daimon placed Mars in ${sign} in the ${ordinal(house)} house of ${houseTopic}, where the native must develop disciplined force and protective boundary.`,
    jupiter: `The soul chose Jupiterian incarnation — to learn wisdom, generosity, and lawful expansion. The daimon placed Jupiter in ${sign} in the ${ordinal(house)} house of ${houseTopic}, where meaning and growth are found through teaching and ethical action.`,
    saturn: `The soul chose Saturnian incarnation — to learn discipline, endurance, and the confrontation with limitation. The daimon placed Saturn in ${sign} in the ${ordinal(house)} house of ${houseTopic}, where karma and structure are the curriculum.`,
  };

  // Generate interpretation based on which planet wins
  const interpretations: Record<PlanetId, string> = {
    sun: "The personal daimon manifests through conscious will, radiance, and creative authority. The native's guiding spirit is solar — calling them toward authentic self-expression and leadership.",
    moon: "The personal daimon manifests through receptivity, nurture, and emotional attunement. The native's guiding spirit is lunar — calling them toward embodied wisdom and care.",
    mercury: "The personal daimon manifests through articulation, symbol systems, and exchange. The native's guiding spirit is Mercurial — calling them toward writing, teaching, and translation between worlds.",
    venus: "The personal daimon manifests through harmony, attraction, and aesthetic judgment. The native's guiding spirit is Venusian — calling them toward love, beauty, and right relationship.",
    mars: "The personal daimon manifests through initiative, courage, and discriminating force. The native's guiding spirit is Martial — calling them toward righteous action and protective boundary.",
    jupiter: "The personal daimon manifests through expansion, meaning, and beneficence. The native's guiding spirit is Jupiterian — calling them toward wisdom, generosity, and growth.",
    saturn: "The personal daimon manifests through structure, discipline, and karmic reckoning. The native's guiding spirit is Saturnian — calling them toward endurance, mastery, and the confrontation with limitation.",
  };

  return {
    planet: best.planet,
    name: toPlanetName(best.planet),
    score: best.score,
    points_considered: best.points,
    interpretation: interpretations[best.planet] || "The personal daimon is not clearly indicated in the chart.",
    soul_choice: daimonWhy[best.planet] || undefined,
  };
}
