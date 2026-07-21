import {
  type NormalizedChart, type PlanetId, type LotName, type ActivationSource,
  type Activation, type TimescaleSlice, type SignalScore, type Timescale,
  type Confidence, type PlanetConditionPacket, PLANET_IDS, toPlanetName,
} from "./types";
import { getHouseTopics } from "./valens_combinations";
import { getDaimonicTag, getDaimonicMeaning } from "./daimonic_houses";
import { computeOikodespotes } from "./oikodespotes";
import { computeAntiscia } from "./antiscia";
import { computeBonification } from "./bonification";
import { dignityScore, termRuler, faceRuler, firdariaAt } from "caelus";
import { Engine } from "caelus";

export function computeFirdaria(eng: any, natalJd: number, targetJd: number, lat: number, lonEast: number): { lord: string | null } {
  try {
    const result = firdariaAt(eng as Engine, natalJd, targetJd, lat, lonEast);
    return { lord: result.major };
  } catch {
    return { lord: null };
  }
}

export interface ActivationResult {
  daily: TimescaleSlice;
  weekly: TimescaleSlice;
  monthly: TimescaleSlice;
  yearly: TimescaleSlice;
  signals: SignalScore[];
  planet_conditions: PlanetConditionPacket[];
  oikodespotes?: OikodespotesResult;
  antiscia: AntisciaConnection[];
  bonification: BonificationCondition[];
}

import type { OikodespotesResult, AntisciaConnection, BonificationCondition } from "./types";

interface ActivationInput {
  chart: NormalizedChart;
  currentSkyPlanets: Record<PlanetId, { lon: number; sign_index: number }>;
  currentSkyAspects: Array<{ a: PlanetId; b: PlanetId; aspect: string; orb: number }>;
  targetDate: Date;
  profection?: {
    annual: { house: number; sign: string; lord: PlanetId };
    monthly: { house: number; sign: string; lord: PlanetId };
  };
  zrSpirit?: { lord: PlanetId; sign: string };
  zrFortune?: { lord: PlanetId; sign: string };
}

const ASPECT_ORBS: Record<string, number> = {
  conjunction: 8, opposition: 8, square: 6, trine: 6, sextile: 4,
};

// Orb bonus: tighter orbs = higher multiplier
const ORB_BONUS: Record<string, number> = {
  tight: 3,    // < 1°  — exceptional
  close: 2,    // < 2°  — clearly felt
  moderate: 1.5, // < 3° — background
  wide: 1,     // ≥ 3° — present but diffuse
};

// Aspect type: some aspects carry more activation force
const ASPECT_MODIFIER: Record<string, number> = {
  conjunction: 1.2, opposition: 1.2, square: 1.1,
  trine: 0.9, sextile: 0.8,
};

const ANGULAR_HOUSES = new Set([1, 4, 7, 10]);
const SUCCEDENT_HOUSES = new Set([2, 5, 8, 11]);

const SIGN_RULERS: PlanetId[] = ["mars", "venus", "mercury", "moon", "sun", "mercury", "venus", "mars", "jupiter", "saturn", "saturn", "jupiter"];
const EXALTATIONS: Record<string, number> = { sun: 1, moon: 1, mercury: 5, venus: 11, mars: 0, jupiter: 2, saturn: 6 };

/** Compute effective weight with orb bonus + aspect type modifier */
function effectiveWeight(base: number, aspect?: string, orb?: number): number {
  let w = base;
  if (aspect && ASPECT_MODIFIER[aspect]) w *= ASPECT_MODIFIER[aspect];
  if (orb !== undefined) {
    if (orb < 1) w *= ORB_BONUS.tight;
    else if (orb < 2) w *= ORB_BONUS.close;
    else if (orb < 3) w *= ORB_BONUS.moderate;
    else w *= ORB_BONUS.wide;
  }
  return Math.round(w * 10) / 10;
}

function computeAge(birthDate: Date, targetDate: Date): number {
  let age = targetDate.getFullYear() - birthDate.getFullYear();
  const mDiff = targetDate.getMonth() - birthDate.getMonth();
  if (mDiff < 0 || (mDiff === 0 && targetDate.getDate() < birthDate.getDate())) age--;
  return age;
}

function computeProfection(age: number): { house: number; lord: PlanetId | null } {
  const house = (age % 12) + 1;
  const lordMap: Record<number, PlanetId> = {
    1: "mars", 2: "venus", 3: "mercury", 4: "moon", 5: "sun",
    6: "mercury", 7: "venus", 8: "mars", 9: "jupiter", 10: "saturn",
    11: "saturn", 12: "jupiter",
  };
  return { house, lord: lordMap[house] || null };
}

function aspectOrb(lon1: number, lon2: number, aspectAngle: number, maxOrb: number): number | null {
  let diff = Math.abs(lon1 - lon2) % 360;
  if (diff > 180) diff = 360 - diff;
  const target = Math.abs(diff - aspectAngle);
  return target <= maxOrb ? target : null;
}

function findTransits(
  natal: Record<PlanetId, { lon: number }>,
  current: Record<PlanetId, { lon: number }>,
): Array<{ transit: PlanetId; natal: PlanetId; aspect: string; orb: number }> {
  const results: Array<{ transit: PlanetId; natal: PlanetId; aspect: string; orb: number }> = [];
  const aspectDefs: Record<string, number> = { conjunction: 0, opposition: 180, square: 90, trine: 120, sextile: 60 };
  for (const tPlanet of PLANET_IDS) {
    for (const nPlanet of PLANET_IDS) {
      for (const [aspectName, angle] of Object.entries(aspectDefs)) {
        const orb = ASPECT_ORBS[aspectName] || 6;
        const distance = aspectOrb(current[tPlanet].lon, natal[nPlanet].lon, angle, orb);
        if (distance !== null) {
          results.push({ transit: tPlanet, natal: nPlanet, aspect: aspectName, orb: distance });
        }
      }
    }
  }
  return results;
}

function findLotTransits(
  lots: Record<string, { degree_absolute: number }>,
  current: Record<PlanetId, { lon: number }>,
): Array<{ planet: PlanetId; lot: string; orb: number }> {
  const results: Array<{ planet: PlanetId; lot: string; orb: number }> = [];
  for (const planet of PLANET_IDS) {
    for (const [lotName, lotData] of Object.entries(lots)) {
      if (!("degree_absolute" in lotData)) continue;
      const distance = aspectOrb(current[planet].lon, lotData.degree_absolute, 0, 6);
      if (distance !== null) {
        results.push({ planet, lot: lotName, orb: distance });
      }
    }
  }
  return results;
}

export function findSkyAspects(
  current: Record<PlanetId, { lon: number }>,
): Array<{ a: PlanetId; b: PlanetId; aspect: string; orb: number }> {
  const results: Array<{ a: PlanetId; b: PlanetId; aspect: string; orb: number }> = [];
  const aspectDefs: Record<string, number> = { conjunction: 0, opposition: 180, square: 90, trine: 120, sextile: 60 };
  for (let i = 0; i < PLANET_IDS.length; i++) {
    for (let j = i + 1; j < PLANET_IDS.length; j++) {
      const aLon = current[PLANET_IDS[i]]?.lon;
      const bLon = current[PLANET_IDS[j]]?.lon;
      if (aLon === undefined || bLon === undefined) continue;
      for (const [aspectName, angle] of Object.entries(aspectDefs)) {
        const orb = ASPECT_ORBS[aspectName] || 6;
        const distance = aspectOrb(aLon, bLon, angle, orb);
        if (distance !== null) {
          results.push({ a: PLANET_IDS[i], b: PLANET_IDS[j], aspect: aspectName, orb: distance });
        }
      }
    }
  }
  return results;
}

function findAngleTransits(
  angles: { ascendant: { degree_absolute: number }; mc: { degree_absolute: number } },
  current: Record<PlanetId, { lon: number }>,
): Array<{ planet: PlanetId; angle: string; orb: number }> {
  const results: Array<{ planet: PlanetId; angle: string; orb: number }> = [];
  for (const planet of PLANET_IDS) {
    for (const [angleName, angleData] of Object.entries(angles)) {
      const distance = aspectOrb(current[planet].lon, angleData.degree_absolute, 0, 6);
      if (distance !== null) {
        results.push({ planet, angle: angleName, orb: distance });
      }
    }
  }
  return results;
}

function computePlanetCondition(chart: NormalizedChart, planet: PlanetId, dayChart: boolean): PlanetConditionPacket {
  const p = chart.natal.planets[planet];
  if (!p) {
    return { planet, sign: "", house: 0, house_topics: [], daimonic_tag: undefined, sect_status: "neutral", angularity: "cadent", essential_dignity: [], dignity_total: 0, peregrine: true, retrograde: false, triplicity_rulers: [], term_ruler: "", face_ruler: "", strength_score: 0, difficulty_score: 0 };
  }

  const house = p.house;
  const angularity = ANGULAR_HOUSES.has(house) ? "angular" : SUCCEDENT_HOUSES.has(house) ? "succedent" : "cadent";

  const diurnalPlanets: PlanetId[] = ["sun", "jupiter", "saturn"];
  const nocturnalPlanets: PlanetId[] = ["moon", "venus", "mars"];
  let sect_status: "in_sect" | "out_of_sect" | "neutral" = "neutral";
  if (planet === "mercury") sect_status = "neutral";
  else if (dayChart && diurnalPlanets.includes(planet)) sect_status = "in_sect";
  else if (!dayChart && nocturnalPlanets.includes(planet)) sect_status = "in_sect";
  else if (dayChart && nocturnalPlanets.includes(planet)) sect_status = "out_of_sect";
  else if (!dayChart && diurnalPlanets.includes(planet)) sect_status = "out_of_sect";

  const dignities = p.dignities || [];
  const retrograde = p.retrograde || false;

  // Full dignity scoring using caelus dignityScore()
  let ds: { rulership: number; exaltation: number; triplicity: number; term: number; face: number; detriment: number; fall: number; total: number; peregrine: boolean };
  try {
    const raw = dignityScore(planet, p.degree_absolute, dayChart ? "day" : "night");
    ds = raw;
  } catch {
    ds = { rulership: 0, exaltation: 0, triplicity: 0, term: 0, face: 0, detriment: 0, fall: 0, total: 0, peregrine: true };
  }

  // Triplicity rulers (Dorothean)
  const TRIPLICITY: Record<number, string[]> = {
    0: ["sun", "jupiter", "saturn"],    // fire: Aries/Leo/Sagittarius — day/night/part
    1: ["venus", "moon", "mars"],       // earth: Taurus/Virgo/Capricorn
    2: ["saturn", "mercury", "jupiter"],// air: Gemini/Libra/Aquarius
    3: ["mars", "venus", "moon"],       // water: Cancer/Scorpio/Pisces
  };
  const triplicityRulers = TRIPLICITY[p.sign_index % 4] || [];

  // Term ruler
  let termRulerName = "";
  try { termRulerName = termRuler(p.sign_index, p.degree_in_sign); } catch {}

  // Face ruler
  let faceRulerName = "";
  try { faceRulerName = faceRuler(p.degree_absolute); } catch {}

  // Scoring
  let strengthScore = 0;
  let difficultyScore = 0;

  if (angularity === "angular") strengthScore += 2;
  else if (angularity === "succedent") strengthScore += 1;
  else strengthScore -= 1;

  if (sect_status === "in_sect") strengthScore += 1;
  else if (sect_status === "out_of_sect" && (planet === "mars" || planet === "saturn")) difficultyScore += 1;

  if (dignities.includes("domicile")) strengthScore += 3;
  if (dignities.includes("exaltation")) strengthScore += 2;
  if (dignities.includes("detriment")) difficultyScore += 2;
  if (dignities.includes("fall")) difficultyScore += 2;
  if (retrograde) difficultyScore += 1;

  // Triplicity/term/face add subtle strength
  if (triplicityRulers[0] === planet || triplicityRulers[1] === planet) strengthScore += 0.5;
  if (termRulerName === planet) strengthScore += 0.5;

  const dignity_total = ds.total;

  return {
    planet,
    sign: p.sign,
    house,
    house_topics: getHouseTopics(house),
    daimonic_tag: getDaimonicTag(house),
    sect_status,
    angularity,
    essential_dignity: dignities,
    dignity_total,
    peregrine: ds.peregrine,
    retrograde,
    triplicity_rulers: triplicityRulers,
    term_ruler: termRulerName,
    face_ruler: faceRulerName,
    strength_score: strengthScore,
    difficulty_score: difficultyScore,
  };
}

function getHouseRuler(signIndex: number): PlanetId {
  return SIGN_RULERS[signIndex] || "sun";
}

export function computePlanetConditions(chart: NormalizedChart): PlanetConditionPacket[] {
  return PLANET_IDS.map(p => computePlanetCondition(chart, p, chart.natal.day_chart));
}

export function computeActivations(input: ActivationInput): ActivationResult {
  const { chart, currentSkyPlanets, targetDate } = input;
  const dayChart = chart.natal.day_chart;
  const age = computeAge(new Date(input.chart.birth_data.date || "1990-01-01"), targetDate);

  const computedProf = computeProfection(age);
  const prof = input.profection || {
    annual: { house: computedProf.house, sign: "", lord: computedProf.lord || "sun" },
    monthly: { house: ((age * 12 + targetDate.getMonth()) % 12) + 1, sign: "", lord: "sun" },
  };

  const natalPlanets = chart.natal.planets;
  const natalLots = chart.natal.lots;

  const natalLons = Object.fromEntries(Object.entries(natalPlanets).map(([k, v]) => [k, { lon: v.degree_absolute }])) as Record<PlanetId, { lon: number }>;
  const transits = findTransits(natalLons, currentSkyPlanets);
  // Compute current sky aspects (transiting planet to transiting planet)
  const skyAspects: Array<{ a: PlanetId; b: PlanetId; aspect: string; orb: number }> = [];
  const skyAspectDefs: Record<string, number> = { conjunction: 0, opposition: 180, square: 90, trine: 120, sextile: 60 };
  for (let si = 0; si < PLANET_IDS.length; si++) {
    for (let sj = si + 1; sj < PLANET_IDS.length; sj++) {
      const aLon = currentSkyPlanets[PLANET_IDS[si]]?.lon;
      const bLon = currentSkyPlanets[PLANET_IDS[sj]]?.lon;
      if (aLon === undefined || bLon === undefined) continue;
      for (const [aspectName, angle] of Object.entries(skyAspectDefs)) {
        const maxOrb = ASPECT_ORBS[aspectName] || 6;
        const d = aspectOrb(aLon, bLon, angle, maxOrb);
        if (d !== null) {
          skyAspects.push({ a: PLANET_IDS[si], b: PLANET_IDS[sj], aspect: aspectName, orb: d });
        }
      }
    }
  }
  const lotTransits = findLotTransits(natalLots as any, currentSkyPlanets);
  const natalAngles = { ascendant: chart.natal.ascendant, mc: chart.natal.mc };
  const angleTransits = findAngleTransits(natalAngles, currentSkyPlanets);

  // Pre-compute planet conditions
  const conditions = computePlanetConditions(chart);

  // Compute oikodespotes (personal daimon)
  const oikodespotes = computeOikodespotes(chart);

  // Compute antiscia (hidden connections)
  const antiscia = computeAntiscia(chart);

  // Compute bonification/maltreatment
  const bonification = computeBonification(chart);

  const allActivations: Activation[] = [];

  // Oikodespotes gets an activation source
  if (oikodespotes) {
    allActivations.push({
      source: "oikodespotes",
      planet: oikodespotes.planet,
      weight: 3,
      timescale: "yearly",
      description: `Personal daimon (oikodespotes): ${oikodespotes.name}`,
    });
  }

  // ── Natal prominence (baseline activation from chart structure) ──
  for (const cond of conditions) {
    let natalWeight = 0;
    const reasons: string[] = [];

    // Angular houses
    if (cond.angularity === "angular") { natalWeight += 1; reasons.push("angular"); }
    // Essential dignity
    if (cond.essential_dignity.includes("domicile")) { natalWeight += 2; reasons.push("domicile"); }
    if (cond.essential_dignity.includes("exaltation")) { natalWeight += 2; reasons.push("exaltation"); }
    if (cond.essential_dignity.includes("detriment")) { natalWeight += 1; reasons.push("detriment(natal)"); }
    if (cond.essential_dignity.includes("fall")) { natalWeight += 1; reasons.push("fall(natal)"); }
    // Retrograde
    if (cond.retrograde) { natalWeight += 1; reasons.push("retrograde"); }

    if (natalWeight > 0) {
      allActivations.push({
        source: "natal_prominence",
        planet: cond.planet,
        weight: natalWeight,
        timescale: "yearly",
        description: `Natal prominence: ${reasons.join(", ")}`,
      });
    }
  }

  // ── Yearly activations (time-lords) ──
  // Annual profection — tag the relevant lot if the house matches
  allActivations.push({
    source: "annual_profection_lord",
    planet: prof.annual.lord || "sun",
    house: prof.annual.house,
    weight: 5,
    timescale: "yearly",
    description: `Annual profection activates house ${prof.annual.house}, lord ${prof.annual.lord || "sun"}`,
  });

  if (input.zrSpirit) {
    allActivations.push({
      source: "zr_spirit_lord",
      planet: input.zrSpirit.lord,
      lot: "spirit",
      weight: 5,
      timescale: "yearly",
      description: `Zodiacal Releasing from Spirit: lord ${input.zrSpirit.lord}`,
    });
  }

  if (input.zrFortune) {
    allActivations.push({
      source: "zr_fortune_lord",
      planet: input.zrFortune.lord,
      lot: "fortune",
      weight: 4,
      timescale: "yearly",
      description: `Zodiacal Releasing from Fortune: lord ${input.zrFortune.lord}`,
    });
  }

  // ── Monthly activation ──
  allActivations.push({
    source: "monthly_profection_lord",
    planet: prof.monthly.lord || "sun",
    house: prof.monthly.house,
    weight: 2,
    timescale: "monthly",
    description: `Monthly profection activates house ${prof.monthly.house}, lord ${prof.monthly.lord || "sun"}`,
  });

  // ── Daily transits (weighted by orb + aspect type) ──
  for (const t of transits) {
    allActivations.push({
      source: "transit_to_planet",
      planet: t.natal,
      weight: effectiveWeight(1, t.aspect, t.orb),
      timescale: "daily",
      description: `${t.transit} ${t.aspect} natal ${t.natal} (orb ${t.orb.toFixed(1)}°)`,
    });
  }

  for (const lt of lotTransits) {
    allActivations.push({
      source: "transit_to_lot",
      planet: lt.planet,
      lot: lt.lot as LotName,
      weight: effectiveWeight(2, "conjunction", lt.orb),
      timescale: "daily",
      description: `${lt.planet} conjunct Lot of ${lt.lot} (orb ${lt.orb.toFixed(1)}°)`,
    });
  }

  for (const at of angleTransits) {
    allActivations.push({
      source: "transit_to_angle",
      planet: at.planet,
      weight: effectiveWeight(1, "conjunction", at.orb),
      timescale: "daily",
      description: `${at.planet} conjunct ${at.angle} (orb ${at.orb.toFixed(1)}°)`,
    });
  }

  // Daily sky aspects — weighted by orb + aspect type
  for (const sa of skyAspects) {
    allActivations.push({
      source: "transit_to_planet",
      planet: sa.a,
      weight: effectiveWeight(1, sa.aspect, sa.orb),
      timescale: "daily",
      description: `${sa.a} ${sa.aspect} ${sa.b} in the sky (orb ${sa.orb.toFixed(1)}°)`,
    });
  }

  // ── Score signals by planet ──
  const signalMap = new Map<PlanetId, {
    score: number; sources: Set<ActivationSource>; timescales: Set<Timescale>;
    houses: Set<number>; lots: Set<LotName>; activations: Activation[]; condition?: PlanetConditionPacket;
  }>();

  for (const act of allActivations) {
    if (!signalMap.has(act.planet)) {
      signalMap.set(act.planet, {
        score: 0, sources: new Set(), timescales: new Set(),
        houses: new Set(), lots: new Set(), activations: [],
        condition: conditions.find(c => c.planet === act.planet),
      });
    }
    const sig = signalMap.get(act.planet)!;
    sig.score += act.weight;
    sig.sources.add(act.source);
    sig.timescales.add(act.timescale);
    if (act.house) sig.houses.add(act.house);
    if (act.lot) sig.lots.add(act.lot);
    sig.activations.push(act);
  }

  // ── House overlap bonus ──
  // Count how many signals hit each house, then bonus planets in shared houses
  const houseHitCount = new Map<number, PlanetId[]>();
  for (const [planet, sig] of signalMap) {
    for (const h of sig.houses) {
      if (!houseHitCount.has(h)) houseHitCount.set(h, []);
      houseHitCount.get(h)!.push(planet);
    }
  }
  for (const [planet, sig] of signalMap) {
    let overlapBonus = 0;
    for (const h of sig.houses) {
      const planetsInHouse = houseHitCount.get(h) || [];
      if (planetsInHouse.length >= 2) overlapBonus += 2; // 2+ planets hitting same house
    }
    if (overlapBonus > 0) sig.score += overlapBonus;
  }

  const signals: SignalScore[] = [];
  for (const [planet, sig] of signalMap) {
    const uniqueSources = sig.sources.size;
    const uniqueTimescales = sig.timescales.size;
    let confidence: Confidence = "low";

    // Transit-only with no natal prominence = low
    const hasTimeLord = sig.sources.has("annual_profection_lord") || sig.sources.has("zr_spirit_lord") || sig.sources.has("zr_fortune_lord") || sig.sources.has("monthly_profection_lord");
    const hasNatalProminence = sig.sources.has("natal_prominence");
    const onlyTransit = sig.sources.size === 1 && sig.sources.has("transit_to_planet");

    if (onlyTransit) confidence = "low";
    else if (uniqueSources >= 3 && uniqueTimescales >= 2 && (hasTimeLord || hasNatalProminence)) confidence = "high";
    else if (uniqueSources >= 2) confidence = "medium";
    else if (hasTimeLord) confidence = "medium"; // monthly lord now gets medium (fix: was falling through to low)

    const why: string[] = [];
    for (const act of sig.activations.slice(0, 5)) {
      why.push(act.description);
    }

    signals.push({
      planet,
      name: toPlanetName(planet),
      score: sig.score,
      confidence,
      repetition_count: uniqueSources,
      timescales: [...sig.timescales],
      sources: [...sig.sources],
      activated_houses: [...sig.houses],
      activated_lots: [...sig.lots],
      why,
      condition: sig.condition,
    });
  }

  signals.sort((a, b) => b.score - a.score);

  const yearlyActivations = allActivations.filter(a => a.timescale === "yearly");
  const monthlyActivations = allActivations.filter(a => a.timescale === "monthly");

  // ── Weekly: aspects that are approaching (applying, orb 3-7°) ──
  // An aspect is "applying" if the transiting planet's motion is decreasing the orb.
  // We estimate by checking if the next-degree position is closer or farther.
  function isApplying(tp: PlanetId, np: PlanetId, aspectAngle: number, currentOrb: number): boolean {
    const transit = currentSkyPlanets[tp];
    const natal = natalLons[np];
    if (!transit || !natal) return false;
    // Move transit forward ~1° (rough daily motion) and check if orb decreases
    const futureLon = (transit.lon + 1) % 360;
    let futureDiff = Math.abs(futureLon - natal.lon) % 360;
    if (futureDiff > 180) futureDiff = 360 - futureDiff;
    const futureOrb = Math.abs(futureDiff - aspectAngle);
    return futureOrb < currentOrb;
  }

  const weeklyActivations: Activation[] = [];
  const aspectDefs: Record<string, number> = { conjunction: 0, opposition: 180, square: 90, trine: 120, sextile: 60 };
  for (const t of transits) {
    const aspectAngle = aspectDefs[t.aspect] ?? 0;
    // Only consider aspects with orb 3-7° (close enough to feel approaching, far enough to not be daily)
    if (t.orb < 3 || t.orb > 7) continue;
    if (!isApplying(t.transit, t.natal, aspectAngle, t.orb)) continue;
    weeklyActivations.push({
      source: "transit_to_planet",
      planet: t.natal,
      weight: effectiveWeight(0.7, t.aspect, t.orb),
      timescale: "weekly",
      description: `${t.transit} approaching ${t.aspect} natal ${t.natal} (applying at ${t.orb.toFixed(1)}°)`,
    });
  }

  const dailyActivations = allActivations.filter(a => a.timescale === "daily");

  return {
    daily: {
      applicable: dailyActivations.length > 0,
      description: dailyActivations.length > 0
        ? `${dailyActivations.length} transit activations today`
        : "No significant daily activations",
      activations: dailyActivations,
    },
    weekly: {
      applicable: weeklyActivations.length > 0,
      description: "Major applying aspects this week",
      activations: weeklyActivations,
    },
    monthly: {
      applicable: monthlyActivations.length > 0,
      description: monthlyActivations.length > 0
        ? `Monthly profection activates house ${prof.monthly.house}`
        : "No significant monthly activation",
      activations: monthlyActivations.slice(0, 3),
    },
    yearly: {
      applicable: yearlyActivations.length > 0,
      description: yearlyActivations.length > 0
        ? `Annual profection activates house ${prof.annual.house}`
        : "No significant yearly activation",
      activations: yearlyActivations.slice(0, 3),
    },
    signals,
    planet_conditions: conditions,
    oikodespotes,
    antiscia,
    bonification,
  };
}

export function determineFortuneSpiritMode(
  signals: SignalScore[],
  chart: NormalizedChart,
): { mode: "fortune" | "spirit" | "mixed"; spiritScore: number; fortuneScore: number; fortune: FortuneSpiritInfo; spirit: FortuneSpiritInfo } {
  let spiritScore = 0;
  let fortuneScore = 0;

  const fortuneLot = chart.natal.lots.fortune;
  const spiritLot = chart.natal.lots.spirit;

  for (const sig of signals) {
    const isSpirit = sig.activated_lots.includes("spirit");
    const isFortune = sig.activated_lots.includes("fortune");

    // Also check if planet occupies same sign as the lot (semantic link via Greenbaum)
    const planetInSpiritSign = spiritLot && chart.natal.planets[sig.planet]?.sign_index === spiritLot.sign_index;
    const planetInFortuneSign = fortuneLot && chart.natal.planets[sig.planet]?.sign_index === fortuneLot.sign_index;

    if (isSpirit || planetInSpiritSign) spiritScore += sig.score;
    if (isFortune || planetInFortuneSign) fortuneScore += sig.score;
  }

  // Check if annual/ZR lords are also the lot lords
  const spiritLord = spiritLot ? getHouseRuler(spiritLot.sign_index) : null;
  const fortuneLord = fortuneLot ? getHouseRuler(fortuneLot.sign_index) : null;

  if (spiritLord) {
    const spiritSig = signals.find(s => s.planet === spiritLord);
    if (spiritSig) spiritScore += 3;
  }
  if (fortuneLord) {
    const fortuneSig = signals.find(s => s.planet === fortuneLord);
    if (fortuneSig) fortuneScore += 3;
  }

  let mode: "fortune" | "spirit" | "mixed";
  if (spiritScore > fortuneScore * 1.5) mode = "spirit";
  else if (fortuneScore > spiritScore * 1.5) mode = "fortune";
  else mode = "mixed";

  return {
    mode, spiritScore, fortuneScore,
    fortune: {
      active: fortuneScore > 0,
      lot_house: fortuneLot?.house || 0,
      lot_house_topics: getHouseTopics(fortuneLot?.house || 0),
      confidence: fortuneScore > 6 ? "high" : fortuneScore > 3 ? "medium" : "low",
    },
    spirit: {
      active: spiritScore > 0,
      lot_house: spiritLot?.house || 0,
      lot_house_topics: getHouseTopics(spiritLot?.house || 0),
      confidence: spiritScore > 6 ? "high" : spiritScore > 3 ? "medium" : "low",
    },
  };
}

export interface FortuneSpiritInfo {
  active: boolean;
  lot_house: number;
  lot_house_topics: string[];
  confidence: Confidence;
}
