/**
 * Pure signal packet — no interpretation, no profiles, no rituals.
 * This is the ENGINE output. Everything else is layered on top.
 */
import type {
  NormalizedChart, PlanetId, LotName, PlanetConditionPacket,
  StarConjunction, OikodespotesResult, AntisciaConnection, BonificationCondition,
  TimescaleSlice, Confidence,
} from "./types";
import { computeActivations, determineFortuneSpiritMode, type ActivationResult } from "./activation_engine";
import { matchCombinations, getHouseTopics } from "./valens_combinations";
import { classifyDaimonicHouses } from "./daimonic_houses";
import { computeAntiscia } from "./antiscia";
import { computeBonification } from "./bonification";
import { detectAspectPatterns } from "./aspect_patterns";
import { computeNatalPromise, type NatalPromise } from "./natal_promise";
import type { PlanetCombination, AspectPattern } from "./types";

export interface ActivationPacket {
  date: string;
  native_id: string;

  // Timing — what the sky is doing
  atmosphere: {
    daily: TimescaleSlice;
    weekly: TimescaleSlice;
    monthly: TimescaleSlice;
    yearly: TimescaleSlice;
  };

  // Signals — which planets are active, how strongly
  signals: {
    planet: PlanetId;
    score: number;
    confidence: Confidence;
    timing_sources: string[];
    timescales: string[];
    activated_houses: number[];
    activated_lots: LotName[];
    condition?: PlanetConditionPacket;
  }[];

  // Aggregated activation
  activated_planets: PlanetId[];
  activated_houses: number[];
  activated_lots: LotName[];
  activated_topics: string[];

  // Fortune / Spirit raw scores
  fortune_score: number;
  spirit_score: number;
  dominant_mode: "fortune" | "spirit" | "mixed";

  // Structural
  planet_conditions: PlanetConditionPacket[];
  daimonic_houses: {
    good_fortune: { house: number; planets: PlanetId[] };
    bad_fortune: { house: number; planets: PlanetId[] };
    good_daimon: { house: number; planets: PlanetId[] };
    bad_daimon: { house: number; planets: PlanetId[] };
  };
  oikodespotes?: OikodespotesResult;
  antiscia: AntisciaConnection[];
  bonification: BonificationCondition[];
  fixed_stars: StarConjunction[];
  aspect_patterns: AspectPattern[];
  valens_combinations: PlanetCombination[];
  natal_promise: NatalPromise;

  // Trace — why each planet was activated
  graph_trace: {
    why_this_planet: string[];
    source_edges: string[];
  };
}

export interface PacketInput {
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
  fixedStars?: StarConjunction[];
  firdaria?: { lord: PlanetId };
}

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

/**
 * Build a pure ActivationPacket — just signals, no interpretation.
 * This is the ENGINE output that Interpretation and Practice layers read from.
 */
export function buildActivationPacket(input: PacketInput): ActivationPacket {
  const { chart } = input;

  const activation: ActivationResult = computeActivations({
    chart: input.chart,
    currentSkyPlanets: input.currentSkyPlanets,
    currentSkyAspects: input.currentSkyAspects,
    targetDate: input.targetDate,
    profection: input.profection,
    zrSpirit: input.zrSpirit,
    zrFortune: input.zrFortune,
  });

  // Add firdaria if provided
  if (input.firdaria) {
    activation.signals.forEach(s => {
      if (s.planet === input.firdaria!.lord) {
        s.score += 4;
        s.sources.push("firdaria" as any);
        s.timescales.push("yearly" as any);
        if (!s.why.includes("firdaria")) s.why.push(`Firdaria lord: ${input.firdaria!.lord}`);
      }
    });
  }

  const fortuneSpirit = determineFortuneSpiritMode(activation.signals, chart);

  const relevantSignals = activation.signals.filter(s =>
    s.confidence !== "low" || s.sources.includes("natal_prominence") || s.sources.includes("oikodespotes")
  );
  relevantSignals.sort((a, b) => b.score - a.score);
  const planetOrder = relevantSignals.map(s => s.planet);

  const combinations: PlanetCombination[] = planetOrder.length >= 2
    ? matchCombinations(planetOrder)
    : [];

  const activatedHouses = [...new Set(relevantSignals.flatMap(s => s.activated_houses))];
  const activatedLots = [...new Set(relevantSignals.flatMap(s => s.activated_lots))];
  const activatedTopics = [...new Set(activatedHouses.flatMap(h => getHouseTopics(h)))];

  const daimonicHouses = classifyDaimonicHouses(activation.planet_conditions);
  const antiscia: AntisciaConnection[] = computeAntiscia(chart);
  const bonification: BonificationCondition[] = computeBonification(chart);
  const fixedStars: StarConjunction[] = input.fixedStars || [];

  // Aspect patterns
  const aspectPatterns: AspectPattern[] = detectAspectPatterns(chart.natal.aspects);

  // Natal promise — baseline chart story
  const natalPromise: NatalPromise = computeNatalPromise(chart, activation.planet_conditions);

  // Graph trace
  const whyPlanet = relevantSignals.slice(0, 3).flatMap(s => s.why);
  const sourceEdges: string[] = [];
  for (const combo of combinations) {
    sourceEdges.push(...combo.source_rule_ids.map(id => `rule:${id}`));
  }
  for (const sig of relevantSignals.slice(0, 3)) {
    if (sig.condition) {
      const c = sig.condition;
      if (c.retrograde) sourceEdges.push(`condition:${c.planet}_retrograde`);
      if (c.essential_dignity.includes("detriment")) sourceEdges.push(`condition:${c.planet}_detriment`);
      if (c.essential_dignity.includes("fall")) sourceEdges.push(`condition:${c.planet}_fall`);
      if (c.angularity === "angular") sourceEdges.push(`condition:${c.planet}_angular`);
      if (c.daimonic_tag) sourceEdges.push(`daimonic_house:${c.planet}_in_${c.daimonic_tag}`);
    }
  }
  if (activation.oikodespotes) sourceEdges.push(`oikodespotes:${activation.oikodespotes.planet}`);
  for (const anti of antiscia) sourceEdges.push(`antiscion:${anti.planet_a}_${anti.planet_b}`);
  for (const boni of bonification.slice(0, 3)) sourceEdges.push(`bonification:${boni.type}_${boni.planet_a}_${boni.planet_b}`);

  const signals = relevantSignals.map(s => ({
    planet: s.planet,
    score: s.score,
    confidence: s.confidence,
    timing_sources: s.sources,
    timescales: s.timescales,
    activated_houses: s.activated_houses,
    activated_lots: s.activated_lots,
    condition: s.condition,
  }));

  return {
    date: formatDate(input.targetDate),
    native_id: chart.native_id,
    atmosphere: {
      daily: activation.daily,
      weekly: activation.weekly,
      monthly: activation.monthly,
      yearly: activation.yearly,
    },
    signals,
    activated_planets: planetOrder,
    activated_houses: activatedHouses,
    activated_lots: activatedLots,
    activated_topics: [...new Set(activatedTopics)],
    fortune_score: fortuneSpirit.fortuneScore,
    spirit_score: fortuneSpirit.spiritScore,
    dominant_mode: fortuneSpirit.mode,
    planet_conditions: activation.planet_conditions,
    daimonic_houses: daimonicHouses,
    oikodespotes: activation.oikodespotes,
    antiscia,
    bonification,
    fixed_stars: fixedStars,
    aspect_patterns: aspectPatterns,
    valens_combinations: combinations,
    natal_promise: natalPromise,
    graph_trace: {
      why_this_planet: whyPlanet,
      source_edges: sourceEdges.slice(0, 20),
    },
  };
}
