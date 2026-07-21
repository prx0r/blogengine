/**
 * Aggregator — integrated timescape macro translation.
 *
 * Takes the full ActivationPacket and produces a structured analysis
 * that answers: how do yearly, monthly, and daily layers INTERACT?
 * Not per-planet descriptions — integrated timescape temperament.
 */

import type { PlanetId, PlanetConditionPacket, PlanetCombination } from "../types";
import type { ActivationPacket } from "../activation_packet";
import { getRulesByPlanet } from "../source_rules";

const SIGN_NAMES = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
const ELEMENTS = ["fire", "earth", "air", "water"];
const MODALITIES = ["cardinal", "fixed", "mutable"];
const SIGN_RULERS: PlanetId[] = ["mars", "venus", "mercury", "moon", "sun", "mercury", "venus", "mars", "jupiter", "saturn", "saturn", "jupiter"];

const PROFECTION_HOUSE_THEMES: Record<number, string> = {
  1: "self, identity, new beginnings", 2: "resources, values, self-worth",
  3: "communication, learning, community", 4: "home, family, foundations",
  5: "creativity, children, joy", 6: "health, work, service",
  7: "partnership, marriage, contracts", 8: "transformation, death, inheritance",
  9: "philosophy, travel, higher education", 10: "career, reputation, authority",
  11: "friends, community, hopes", 12: "solitude, healing, unconscious",
};

// ─── Planet nature — used by interpreters, not for display ───
export const PLANET_NATURE: Record<string, string[]> = {
  sun: ["vitality", "leadership", "creative will", "authority", "self-expression"],
  moon: ["receptivity", "nurture", "emotion", "instinct", "habit"],
  mercury: ["thought", "communication", "exchange", "writing", "commerce"],
  venus: ["love", "harmony", "beauty", "relationship", "value"],
  mars: ["assertion", "drive", "courage", "anger", "initiative"],
  jupiter: ["expansion", "meaning", "growth", "generosity", "wisdom"],
  saturn: ["structure", "discipline", "limitation", "responsibility", "time"],
};

const PLANET_NAMES: Record<string, string> = {
  sun: "Sun", moon: "Moon", mercury: "Mercury", venus: "Venus",
  mars: "Mars", jupiter: "Jupiter", saturn: "Saturn",
};

function pn(p: PlanetId): string {
  return PLANET_NAMES[p] || p;
}

// ─── Planet context (structured data, shared with interpreters) ───
export interface PlanetMacroContext {
  planet: PlanetId;
  sign: string;
  signIndex: number;
  house: number;
  houseTopics: string[];
  nature: string[];
  element: string;
  modality: string;
  ruler: PlanetId;
  dignity: string;
  retrograde: boolean;
  angularity: string;
  confidence: string;
  score: number;
  timingSources: string[];
  alKhayyatRule?: string;
  valensPairs: string[];
  isDaimon: boolean;
}

export interface MacroTranslation {
  /** Integrated timescale analysis — the "macro view" of how all layers interact */
  integrated: {
    /** The through-line connecting all timescales */
    prevailing_temperament: string;
    /** Which house is most activated across all timescales */
    dominant_house: { house: number; theme: string; score: number };
    /** Dominant element among all active planets */
    dominant_element: string;
    /** Dominant modality */
    dominant_modality: string;
    /** The tightest configuration driving today */
    tightest_config: { description: string; orb: number; type: string } | null;
    /** Major tension points (squares, oppositions under 3°) */
    tensions: Array<{ description: string; orb: number; planets: PlanetId[] }>;
    /** Major ease points (trines, sextiles under 3°) */
    eases: Array<{ description: string; orb: number; planets: PlanetId[] }>;
    /** How the yearly theme colors today's transits */
    year_daily_interaction: string;
    /** How the monthly focus colors today */
    month_daily_interaction: string;
    /** What's different from yesterday */
    changes_from_yesterday: string[];
    /** What's building toward the rest of the week */
    building_this_week: string[];
  };

  /** Structured timescale data (for tab display) */
  timescales: {
    year: { age: number; profectionHouse: number; profectionHouseTheme: string; profectionLord: PlanetId; profectionLordSign: string; profectionLordHouse: number; firdariaLord?: PlanetId; zrSpirit?: { lord: PlanetId; sign: string }; zrFortune?: { lord: PlanetId; sign: string } };
    month?: { profectionHouse: number; lord: PlanetId };
    week: { skyAspects: string[] };
    day: { topSignals: Array<{ planet: PlanetId; confidence: string }> };
  };

  /** Per-planet structured data (for interpreter consumption, not display) */
  planets: PlanetMacroContext[];

  dominantMode: "fortune" | "spirit" | "mixed";
  oikodespotes?: PlanetId;
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function getHouseTopics(h: number): string[] {
  const m: Record<number, string[]> = {
    1: ["self", "identity", "body"], 2: ["resources", "wealth", "values"],
    3: ["communication", "siblings", "learning"], 4: ["home", "family", "foundations"],
    5: ["creativity", "children", "pleasure"], 6: ["health", "work", "service"],
    7: ["partnership", "marriage", "relationships"], 8: ["transformation", "death", "shared resources"],
    9: ["philosophy", "travel", "higher education"], 10: ["career", "reputation", "authority"],
    11: ["friends", "community", "hopes"], 12: ["solitude", "healing", "unconscious"],
  };
  return m[h] || [];
}

function buildPlanetContext(
  sig: ActivationPacket["signals"][number],
  cond: PlanetConditionPacket | undefined,
  oikodespotesPlanet?: string,
): PlanetMacroContext {
  const si = cond ? SIGN_NAMES.indexOf(cond.sign) : 0;
  const ruler = SIGN_RULERS[si >= 0 ? si : 0];
  const hTopics = getHouseTopics(cond?.house || 0);
  const rules = getRulesByPlanet(sig.planet).filter(r => r.house === (cond?.house || 0));

  return {
    planet: sig.planet,
    sign: cond?.sign || "",
    signIndex: si,
    house: cond?.house || 0,
    houseTopics: hTopics,
    nature: PLANET_NATURE[sig.planet] || [],
    element: ELEMENTS[si % 4],
    modality: MODALITIES[si % 3],
    ruler,
    dignity: cond?.essential_dignity?.join(", ") || "peregrine",
    retrograde: cond?.retrograde || false,
    angularity: cond?.angularity || "cadent",
    confidence: sig.confidence,
    score: sig.score,
    timingSources: sig.timing_sources,
    alKhayyatRule: rules[0]?.delineation,
    valensPairs: [],
    isDaimon: sig.planet === oikodespotesPlanet,
  };
}

/** Build the integrated macro translation */
export function buildMacroTranslation(
  packet: ActivationPacket,
  oikodespotesPlanet?: string,
  age?: number,
): MacroTranslation {
  const signals = packet.signals;
  const conditions = packet.planet_conditions;

  // Extract timing lords
  const annualSig = signals.find(s => s.timing_sources.includes("annual_profection_lord"));
  const annualCond = annualSig ? conditions.find(c => c.planet === annualSig.planet) : undefined;
  const firdariaSig = signals.find(s => s.timing_sources.includes("firdaria"));
  const zrSpiritSig = signals.find(s => s.timing_sources.includes("zr_spirit_lord"));
  const zrFortuneSig = signals.find(s => s.timing_sources.includes("zr_fortune_lord"));
  const monthlySig = signals.find(s => s.timing_sources.includes("monthly_profection_lord"));

  // Sky aspects
  const skyAspects = packet.atmosphere.daily.activations.filter(a => a.description.includes("in the sky"));

  // Build planet contexts
  const planets: PlanetMacroContext[] = signals.map(sig => {
    const cond = conditions.find(c => c.planet === sig.planet);
    const ctx = buildPlanetContext(sig, cond, oikodespotesPlanet);
    const pairs = packet.valens_combinations
      .filter(c => c.combination_type === "pair" && c.planets.includes(sig.planet))
      .map(c => { const partner = c.planets.find(p => p !== sig.planet); return `${partner}: ${c.themes.slice(0, 2).join(", ")}`; });
    ctx.valensPairs = pairs;
    return ctx;
  });

  // ── Integrated timescape analysis ──

  // Dominant house: sum scores by house across all signals
  const houseScores = new Map<number, { score: number; planets: PlanetId[] }>();
  for (const sig of signals) {
    for (const h of sig.activated_houses) {
      if (!houseScores.has(h)) houseScores.set(h, { score: 0, planets: [] });
      const hs = houseScores.get(h)!;
      hs.score += sig.score;
      hs.planets.push(sig.planet);
    }
  }
  let dominantHouse: { house: number; theme: string; score: number } = { house: 0, theme: "", score: 0 };
  for (const [h, data] of houseScores) {
    if (data.score > dominantHouse.score) {
      dominantHouse = { house: h, theme: PROFECTION_HOUSE_THEMES[h] || "", score: Math.round(data.score * 10) / 10 };
    }
  }

  // Dominant element
  const elementCount: Record<string, number> = { fire: 0, earth: 0, air: 0, water: 0 };
  for (const p of planets) { elementCount[p.element] += p.score; }
  const dominantElement = Object.entries(elementCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "";

  // Dominant modality
  const modCount: Record<string, number> = { cardinal: 0, fixed: 0, mutable: 0 };
  for (const p of planets) { modCount[p.modality] += p.score; }
  const dominantModality = Object.entries(modCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "";

  // Tightest config from daily activations
  let tightestConfig: { description: string; orb: number; type: string } | null = null;
  for (const act of packet.atmosphere.daily.activations) {
    const orbMatch = act.description.match(/orb (\d+\.?\d*)°/);
    if (orbMatch) {
      const orb = parseFloat(orbMatch[1]);
      if (!tightestConfig || orb < tightestConfig.orb) {
        tightestConfig = {
          description: act.description,
          orb,
          type: act.source === "transit_to_planet" ? (act.description.includes("in the sky") ? "sky_aspect" : "transit") : act.source,
        };
      }
    }
  }

  // Tensions (squares/oppositions under 3°)
  const tensions: MacroTranslation["integrated"]["tensions"] = [];
  const eases: MacroTranslation["integrated"]["eases"] = [];
  for (const act of packet.atmosphere.daily.activations) {
    const orbMatch = act.description.match(/orb (\d+\.?\d*)°/);
    if (!orbMatch) continue;
    const orb = parseFloat(orbMatch[1]);
    if (orb >= 3) continue;
    const isHard = act.description.includes("square") || act.description.includes("opposition");
    const isSoft = act.description.includes("trine") || act.description.includes("sextile");
    const planetsInDesc = [...new Set(["sun","moon","mercury","venus","mars","jupiter","saturn"]
      .filter(p => act.description.toLowerCase().includes(p)).map(p => p as PlanetId))];
    if (isHard) tensions.push({ description: act.description, orb, planets: planetsInDesc });
    else if (isSoft) eases.push({ description: act.description, orb, planets: planetsInDesc });
  }

  // Year-daily interaction — specific, not generic
  let yearDailyInteraction = "";
  if (annualSig && tightestConfig) {
    const yrPlanet = pn(annualSig.planet);
    const yrHouse = annualSig.activated_houses[0] || 0;
    const yrTheme = PROFECTION_HOUSE_THEMES[yrHouse] || "";
    const yrCond = conditions.find(c => c.planet === annualSig.planet);
    const yrSign = yrCond ? `${yrCond.sign} in House ${yrCond.house}` : "";
    const yrDignity = yrCond?.essential_dignity?.join("/") || "peregrine";

    // Categorize the tightest config
    const isLotTransit = tightestConfig.description.includes("Lot of");
    const tightDesc = isLotTransit
      ? `The tightest configuration is a transit to a Lot (${tightestConfig.description})`
      : tightestConfig.description;

    yearDailyInteraction = `The year is ruled by ${yrPlanet} (${yrSign}, ${yrDignity}) governing House ${yrHouse} (${yrTheme}). ${tightDesc} at ${tightestConfig.orb.toFixed(1)}° ${tightestConfig.orb < 1 ? "partile" : "orb"}. Since ${yrPlanet} rules the year, this transit should be read through the yearly theme of ${yrTheme} — whatever area of life this transit touches, it carries the weight of the year's concern.`;
  }

  // Month-daily interaction
  let monthDailyInteraction = "";
  if (monthlySig) {
    const moLord = pn(monthlySig.planet);
    const moHouse = monthlySig.activated_houses[0] || 0;
    const moTheme = PROFECTION_HOUSE_THEMES[moHouse] || "";
    const moCond = conditions.find(c => c.planet === monthlySig.planet);
    const moSign = moCond ? ` ${moCond.sign} in House ${moCond.house}` : "";
    monthDailyInteraction = `This month, ${moLord}${moSign} rules House ${moHouse} (${moTheme}). Today's transits land in ${moTheme} territory — the daily developments this week should be read as expressions of the monthly ${moTheme} theme, which itself serves the yearly ${PROFECTION_HOUSE_THEMES[annualSig?.activated_houses[0] || 0] || ""} concern.`;
  }

  // Changes from yesterday (we don't have yesterday's data, but we can note what's NEW today)
  // This will be populated when yesterday comparison is implemented
  const changesFromYesterday: string[] = [];

  // Building this week
  const buildingThisWeek: string[] = [];
  for (const act of packet.atmosphere.daily.activations) {
    if (act.timescale === "weekly") {
      buildingThisWeek.push(act.description);
    }
  }

  // Prevailing temperament synthesis
  let prevailingTemperament = "";
  {
    const yrLord = annualSig ? pn(annualSig.planet) : "";
    const yrHouseTheme = annualSig ? PROFECTION_HOUSE_THEMES[annualSig.activated_houses[0] || 0] : "";
    const dayPlanets = signals.slice(0, 3).map(s => pn(s.planet)).join(", ");
    const dayTension = tensions.length > 0 ? `with ${tensions.length} tight configuration${tensions.length > 1 ? "s" : ""} creating friction` : "";
    const dayEase = eases.length > 0 ? `and ${eases.length} harmonious aspect${eases.length > 1 ? "s" : ""} providing flow` : "";

    prevailingTemperament = `Across all timescales, the dominant energy is ${dominantElement} ${dominantModality} — ${dominantElement === "fire" ? "initiatory and transformative" : dominantElement === "earth" ? "practical and embodied" : dominantElement === "air" ? "intellectual and relational" : "emotional and receptive"}. The year's ${yrLord}-ruled ${yrHouseTheme} theme is activated today through ${dayPlanets} ${dayTension} ${dayEase}. The prevailing atmosphere: ${dominantElement} energy expressed through ${dominantModality} modality, grounded in House ${dominantHouse.house} (${dominantHouse.theme}) concerns.`;
  }

  return {
    integrated: {
      prevailing_temperament: prevailingTemperament,
      dominant_house: dominantHouse,
      dominant_element: dominantElement,
      dominant_modality: dominantModality,
      tightest_config: tightestConfig,
      tensions,
      eases,
      year_daily_interaction: yearDailyInteraction,
      month_daily_interaction: monthDailyInteraction,
      changes_from_yesterday: changesFromYesterday,
      building_this_week: buildingThisWeek,
    },
    timescales: {
      year: {
        age: age ?? 27,
        profectionHouse: annualSig?.activated_houses[0] || 0,
        profectionHouseTheme: PROFECTION_HOUSE_THEMES[annualSig?.activated_houses[0] || 0] || "",
        profectionLord: annualSig?.planet || "sun",
        profectionLordSign: annualCond?.sign || "",
        profectionLordHouse: annualCond?.house || 0,
        firdariaLord: firdariaSig?.planet,
        zrSpirit: zrSpiritSig ? { lord: zrSpiritSig.planet, sign: zrSpiritSig.condition?.sign || "" } : undefined,
        zrFortune: zrFortuneSig ? { lord: zrFortuneSig.planet, sign: zrFortuneSig.condition?.sign || "" } : undefined,
      },
      month: monthlySig ? { profectionHouse: monthlySig.activated_houses[0] || 0, lord: monthlySig.planet } : undefined,
      week: { skyAspects: skyAspects.map(a => a.description) },
      day: { topSignals: signals.slice(0, 5).map(s => ({ planet: s.planet, confidence: s.confidence })) },
    },
    planets,
    dominantMode: packet.dominant_mode,
    oikodespotes: oikodespotesPlanet as PlanetId | undefined,
  };
}
