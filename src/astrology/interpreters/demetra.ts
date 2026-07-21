/**
 * Demetra George Interpreter
 * 
 * Unlike al-Khayyāt's fixed lookup table, Demetra George uses a GENERATIVE
 * sentence structure that combines planet nature + sign qualities + house
 * topics + condition into a dynamic interpretation.
 * 
 * Source: Ancient Astrology in Theory and Practice, Vol 2 (2022)
 * Method: 6-step delineation from Ch.78-85
 */

import type { PlanetId, PlanetConditionPacket, Confidence } from "../types";
import type { ActivationPacket } from "../activation_packet";

export interface InterpretationTheme {
  planet: PlanetId;
  system: string;
  title: string;
  body: string;
  tags: string[];
  source?: string;
  practice?: string[];
}

const PLANET_SIGNIFICATIONS: Record<string, string[]> = {
  sun: ["leadership", "vitality", "self-expression", "authority", "creative will"],
  moon: ["receptivity", "nurture", "emotion", "intuition", "habit"],
  mercury: ["communication", "thought", "exchange", "writing", "commerce"],
  venus: ["love", "desire", "intimacy", "union", "beauty", "harmony"],
  mars: ["assertion", "drive", "courage", "anger", "initiative"],
  jupiter: ["expansion", "wisdom", "generosity", "growth", "meaning"],
  saturn: ["limitation", "discipline", "work", "structure", "responsibility"],
};

const SIGN_QUALITIES: Record<number, { gender: string; modality: string; element: string }> = {
  0: { gender: "masculine", modality: "cardinal", element: "fire" },
  1: { gender: "feminine", modality: "fixed", element: "earth" },
  2: { gender: "masculine", modality: "mutable", element: "air" },
  3: { gender: "feminine", modality: "cardinal", element: "water" },
  4: { gender: "masculine", modality: "fixed", element: "fire" },
  5: { gender: "feminine", modality: "mutable", element: "earth" },
  6: { gender: "masculine", modality: "cardinal", element: "air" },
  7: { gender: "feminine", modality: "fixed", element: "water" },
  8: { gender: "masculine", modality: "mutable", element: "fire" },
  9: { gender: "feminine", modality: "cardinal", element: "earth" },
  10: { gender: "masculine", modality: "fixed", element: "air" },
  11: { gender: "feminine", modality: "mutable", element: "water" },
};

const SIGN_NAMES = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];

const HOUSE_TOPICS: Record<number, string[]> = {
  1: ["life", "vitality", "character", "body"],
  2: ["wealth", "resources", "possessions", "livelihood"],
  3: ["siblings", "communication", "short travel"],
  4: ["home", "family", "roots", "inheritance"],
  5: ["children", "creativity", "pleasure", "romance"],
  6: ["health", "illness", "servitude", "daily work"],
  7: ["marriage", "partnership", "contracts", "open enemies"],
  8: ["death", "inheritance", "transformation", "shared resources"],
  9: ["philosophy", "religion", "foreign travel", "higher education"],
  10: ["profession", "reputation", "career", "authority"],
  11: ["friends", "alliances", "hopes", "community"],
  12: ["enemies", "suffering", "confinement", "hidden matters"],
};

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function signExpression(gender: string, modality: string, element: string): string {
  const map: Record<string, Record<string, string>> = {
    masculine: { cardinal: "assertive and initiating", fixed: "determined and focused", mutable: "adaptable and communicative" },
    feminine: { cardinal: "receptive and initiating", fixed: "steady and persistent", mutable: "flexible and responsive" },
  };
  return map[gender]?.[modality] || `${gender}, ${modality}`;
}

export function interpretDemetra(
  signals: ActivationPacket["signals"],
  conditions: PlanetConditionPacket[],
): InterpretationTheme[] {
  const themes: InterpretationTheme[] = [];

  for (const sig of signals) {
    if (!sig.condition) continue;
    const planet = sig.planet;
    const pData = sig.condition;
    const signIdx = SIGN_NAMES.indexOf(pData.sign);
    const qualities = SIGN_QUALITIES[signIdx >= 0 ? signIdx : 0];
    const significations = PLANET_SIGNIFICATIONS[planet] || [];
    const houseTopics = HOUSE_TOPICS[pData.house] || [];
    const expression = signExpression(qualities.gender, qualities.modality, qualities.element);

    // Sentence 1: The planet signifies
    const s1 = `The planet ${planet.charAt(0).toUpperCase() + planet.slice(1)} signifies ${significations.slice(0, 3).join(", ")}.`;

    // Sentence 2: It is in [sign]
    const s2 = `It is in the zodiacal sign of ${pData.sign}, which is ${qualities.gender} (gender), ${qualities.modality} (modality), and of the ${qualities.element} element.`;

    // Sentence 3: Therefore it expresses as
    const s3 = `Based upon these characteristics, the planet expresses its own significations in a manner that is ${expression}.`;

    // Sentence 4: House location
    const s4 = `It is located in the ${ordinal(pData.house)} house, using the topics of ${houseTopics.slice(0, 3).join(", ")} to actualize its significations.`;

    // Sentence 5: Condition
    const conditionLevel = sig.confidence === "high" ? "strong" : sig.confidence === "medium" ? "moderate" : "challenged";
    const dignityNote = pData.essential_dignity.includes("detriment") ? ", though it operates in detriment here" :
      pData.essential_dignity.includes("fall") ? ", though it is in fall here" :
      pData.essential_dignity.includes("domicile") ? ", and it is powerfully placed in its own domicile" :
      pData.essential_dignity.includes("exaltation") ? ", and it is exalted here" : "";
    const rxNote = pData.retrograde ? ", retrograde motion turns its action inward" : "";
    const s5 = `Its condition is ${conditionLevel}${dignityNote}${rxNote}.`;

    // Sentence 6: Synthesis
    const s6 = `Therefore, the native's ${significations[0]} is expressed through the domain of ${houseTopics[0] || "life"} with ${conditionLevel} effectiveness${dignityNote || rxNote ? "," : ""} requiring conscious attention to integrate the planetary energies constructively.`;

    themes.push({
      planet,
      system: "Demetra George",
      title: `${planet.charAt(0).toUpperCase() + planet.slice(1)} in ${pData.sign} (House ${pData.house})`,
      body: `${s1} ${s2} ${s3} ${s4} ${s5} ${s6}`,
      tags: [planet, `house_${pData.house}`, pData.sign.toLowerCase(), qualities.element, qualities.modality],
      source: "Ancient Astrology in Theory and Practice Vol 2 (2022)",
    });
  }

  return themes;
}
