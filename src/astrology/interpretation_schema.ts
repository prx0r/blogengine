/**
 * Standardized Interpretation Schema
 * 
 * One ActivationPacket → multiple interpretive systems → convergence.
 * 
 * Each interpreter reads the same packet and outputs structured interpretations.
 * Convergence = when 3+ interpreters agree on a theme.
 */

import type { PlanetId, PlanetConditionPacket, PlanetCombination, Confidence, LotName } from "./types";
import type { ActivationPacket } from "./activation_packet";
import { interpretDemetra, type InterpretationTheme } from "./interpreters/demetra";
import { buildMacroTranslation, type MacroTranslation } from "./interpreters/aggregator";

const PLANET_NAMES: Record<string, string> = {
  sun: "Sun", moon: "Moon", mercury: "Mercury", venus: "Venus",
  mars: "Mars", jupiter: "Jupiter", saturn: "Saturn",
};

type PacketSignal = {
  planet: PlanetId;
  score: number;
  confidence: Confidence;
  timing_sources: string[];
  timescales: string[];
  activated_houses: number[];
  activated_lots: LotName[];
  condition?: PlanetConditionPacket;
};
import { getRulesByPlanet, getRulesByHouse, type AncientSourceRule } from "./source_rules";
import { PLANET_PROFILES } from "./planet_profiles";

// ─── Shared interpretation types ───
// InterpretationTheme is now imported from ./interpreters/demetra

export interface InterpretedReading {
  packet_snapshot: {
    date: string;
    primary_planets: string[];
    confidence: string;
    dominant_mode: string;
  };
  interpretations: {
    al_khayyat: InterpretationTheme[];
    valens: InterpretationTheme[];
    ficino: InterpretationTheme[];
    greenbaum: InterpretationTheme[];
    demetra: InterpretationTheme[];
  };
  /** Macro translation: preserves all engine data, never summarized away */
  macro: MacroTranslation;
  convergence: {
    themes: string[];        // tags appearing in 3+ systems
    planets: string[];       // planets flagged by 3+ systems
    advice: string[];        // practices recommended by multiple systems
  };
}

// ─── Interpreter: al-Khayyāt (medieval Arabic, 9th C) ───
// Focus: concrete life outcomes — career, health, relationships, wealth
// Source: "On the Judgments of Nativities" Ch.47
// 84 if-then rules for each planet in each house

function interpretAlKhayyat(signals: ActivationPacket["signals"], conditions: PlanetConditionPacket[]): InterpretationTheme[] {
  const themes: InterpretationTheme[] = [];
  
  for (const sig of signals) {
    if (!sig.condition) continue;
    const rules = getRulesByPlanet(sig.planet).filter(r => r.house === sig.condition!.house);
    const primaryRule = rules[0];  // best match: same planet, same house
    
    if (primaryRule?.delineation) {
      // Enhance with condition modifiers
      const conditionNotes: string[] = [];
      if (sig.condition.retrograde) conditionNotes.push("retrograde");
      if (sig.condition.essential_dignity.includes("detriment")) conditionNotes.push("compromised");
      if (sig.condition.essential_dignity.includes("fall")) conditionNotes.push("weakened");
      if (sig.condition.angularity === "angular") conditionNotes.push("empowered");
      
      const conditionStr = conditionNotes.length ? ` (${conditionNotes.join(", ")})` : "";
      
      themes.push({
        planet: sig.planet,
        system: "al-Khayyāt",
        title: `${PLANET_NAMES[sig.planet] || sig.planet} in House ${sig.condition.house}`,
        body: `${primaryRule.delineation}${conditionStr}`,
        tags: [sig.planet, `house_${sig.condition.house}`, ...conditionNotes],
        source: "On the Judgments of Nativities Ch.47",
      });
    }
  }
  
  return themes;
}

// ─── Interpreter: Valens (Hellenistic, 2nd C) ───
// Focus: planetary relationships, combinations, timing
// Source: Anthologiae Book I.21 — 21 planetary pairs

function interpretValens(signals: PacketSignal[], combinations: PlanetCombination[]): InterpretationTheme[] {
  const themes: InterpretationTheme[] = [];
  const activePlanets = signals.map(s => s.planet);
  
  // For each pair of active planets, check Valens pair rules
  for (let i = 0; i < activePlanets.length; i++) {
    for (let j = i + 1; j < activePlanets.length; j++) {
      const combo = combinations.find(c => 
        c.combination_type === "pair" &&
        c.planets.includes(activePlanets[i]) &&
        c.planets.includes(activePlanets[j])
      );
      
      if (combo) {
        themes.push({
          planet: activePlanets[i],
          system: "Valens",
          title: `${combo.planets.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(" + ")}`,
          body: combo.themes.slice(0, 3).join("; "),
          tags: [...combo.planets, "pair"],
          source: "Anthologiae I.21",
          practice: combo.opportunities.slice(0, 2),
        });
      }
    }
  }
  
  return themes;
}

// ─── Interpreter: Ficino (Renaissance, 15th C) ───
// Focus: practice, attunement, what to DO
// Source: Three Books on Life, planet profiles

function interpretFicino(signals: PacketSignal[]): InterpretationTheme[] {
  return signals.map(sig => {
    const profile = PLANET_PROFILES[sig.planet];
    if (!profile) return null;
    
    const isDaimonActive = sig.timing_sources?.includes("oikodespotes") ?? false;
    
    return {
      planet: sig.planet,
      system: "Ficino",
      title: `${isDaimonActive ? "★ DAIMON — " : ""}${profile.name}`,
      body: `Qualities: ${profile.qualities.slice(0, 3).join(", ")}. ` +
        `Healthy: ${profile.healthy_expression[0]}. Distorted: ${profile.distorted_expression[0]}.`,
      tags: [sig.planet, ...profile.qualities.slice(0, 2)],
      source: "De Vita (Three Books on Life)",
      practice: [
        ...profile.activities.slice(0, 2),
        ...profile.music_features.slice(0, 1),
      ],
    };
  }).filter(Boolean) as InterpretationTheme[];
}

// ─── Interpreter: Greenbaum (modern daimon ontology) ───
// Focus: Fortune vs Spirit, soul purpose, daimonic call
// Source: The Daimon in Hellenistic Astrology

function interpretGreenbaum(
  signals: PacketSignal[],
  packet: ActivationPacket,
  oikodespotesPlanet?: string,
): InterpretationTheme[] {
  const themes: InterpretationTheme[] = [];
  
  // Daimon signal
  if (oikodespotesPlanet) {
    const daimonSignal = signals.find(s => s.planet === oikodespotesPlanet);
    if (daimonSignal) {
      themes.push({
        planet: oikodespotesPlanet as PlanetId,
        system: "Greenbaum",
        title: "Daimon Active — This is YOUR moment",
        body: `Your personal daimon (${oikodespotesPlanet}) is activated. ` +
          `This is a daimonic period — the soul's intention is constellated. ` +
          `What you do now matters more than what happens to you.`,
        tags: [oikodespotesPlanet, "daimon", "soul_purpose"],
        source: "The Daimon in Hellenistic Astrology",
      });
    }
  }
  
  // Fortune/Spirit mode
  const mode = packet.dominant_mode;
  themes.push({
    planet: mode === "spirit" ? "sun" as PlanetId : "moon" as PlanetId,
    system: "Greenbaum",
    title: mode === "spirit" ? "Spirit-Led Period" : "Fortune-Led Period",
    body: mode === "spirit"
      ? "The daimon is leading. This period is about intention, action, and authorship — what you DO with circumstance."
      : "Fortune is leading. This period is about body, material conditions, and what happens TO you through incarnation.",
    tags: [mode, mode === "spirit" ? "intention" : "circumstance"],
    source: "Greenbaum §9 / Paulus Ch.23",
  });
  
  return themes;
}

// ─── Main interpretation function ───

export function interpretPacket(
  packet: ActivationPacket,
  oikodespotesPlanet?: string,
): InterpretedReading {
  const signals = packet.signals;
  const conditions = packet.planet_conditions;
  const combinations = packet.valens_combinations;
  
  const al_khayyat = interpretAlKhayyat(signals, conditions);
  const valens = interpretValens(signals, combinations);
  const ficino = interpretFicino(signals);
  const greenbaum = interpretGreenbaum(signals, packet, oikodespotesPlanet);
  const demetra = interpretDemetra(signals, conditions);
  
  // ─── Convergence detection ───
  // Find tags that appear in 3+ systems
  const tagCounts = new Map<string, { count: number; practices: string[]; systems: Set<string> }>();
  
  const allThemes = [...al_khayyat, ...valens, ...ficino, ...greenbaum];
  const systemNames = { al_khayyat: "al-Khayyāt", valens: "Valens", ficino: "Ficino", greenbaum: "Greenbaum" };
  
  for (const theme of allThemes) {
    for (const tag of theme.tags) {
      if (!tagCounts.has(tag)) tagCounts.set(tag, { count: 0, practices: [], systems: new Set() });
      const entry = tagCounts.get(tag)!;
      entry.count++;
      entry.systems.add(theme.system);
      if (theme.practice) entry.practices.push(...theme.practice);
    }
  }
  
  const convergence: InterpretedReading["convergence"] = {
    themes: [],
    planets: [],
    advice: [],
  };
  
  for (const [tag, data] of tagCounts) {
    if (data.systems.size >= 3) {
      if (["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn"].includes(tag)) {
        convergence.planets.push(tag);
      } else {
        convergence.themes.push(tag);
      }
      convergence.advice.push(...data.practices);
    }
  }
  
  const macro = buildMacroTranslation(packet, oikodespotesPlanet);

  return {
    packet_snapshot: {
      date: packet.date,
      primary_planets: packet.activated_planets.slice(0, 3),
      confidence: packet.signals[0]?.confidence || "low",
      dominant_mode: packet.dominant_mode,
    },
    interpretations: { al_khayyat, valens, ficino, greenbaum, demetra },
    macro,
    convergence: {
      themes: [...new Set(convergence.themes)],
      planets: [...new Set(convergence.planets)],
      advice: [...new Set(convergence.advice)].slice(0, 5),
    },
  };
}
