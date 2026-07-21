/**
 * LLM containment validation — prevents hallucination by checking
 * that rendered output only references entities present in the
 * ActivationPacket.
 *
 * Usage:
 *   const valid = validatePacketFidelity(llmOutput, packet);
 *   if (!valid) reject the output and retry.
 */
import type { PlanetId, PlanetName } from "./types";
import { PLANET_IDS, PLANET_NAMES } from "./types";
import { getAllRuleIds } from "./source_rules";

// The canonical planet names the LLM might reference
const PLANET_NAMES_SET = new Set(PLANET_NAMES);
const PLANET_NAMES_LOWER = new Set(PLANET_NAMES.map(n => n.toLowerCase()));
const PLANET_IDS_SET = new Set(PLANET_IDS);

// Also common alternative names
const ALIASES: Record<string, string> = {
  mercury: "mercury",
  "hermes": "mercury",
  venus: "venus",
  "aphrodite": "venus",
  mars: "mars",
  "ares": "mars",
  jupiter: "jupiter",
  "zeus": "jupiter",
  saturn: "saturn",
  "kronos": "saturn",
  "cronus": "saturn",
  sun: "sun",
  "sol": "sun",
  moon: "moon",
  "luna": "moon",
};

function extractMentionedPlanets(text: string): string[] {
  const mentioned: string[] = [];
  const words = text.toLowerCase().split(/[\s,.;:!?()"']+/);
  for (const word of words) {
    if (PLANET_IDS_SET.has(word as PlanetId)) {
      mentioned.push(word);
    } else if (ALIASES[word]) {
      mentioned.push(ALIASES[word]);
    }
  }
  return [...new Set(mentioned)];
}

function extractMentionedHouses(text: string): number[] {
  const mentioned: number[] = [];
  // Match patterns like "1st house", "2nd house", "third house", "house 4"
  const patterns = [
    /(\d+)(?:st|nd|rd|th)\s+house/gi,
    /house\s+(\d+)/gi,
    /(?:first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth)\s+house/gi,
  ];
  const wordMap: Record<string, number> = {
    first: 1, second: 2, third: 3, fourth: 4, fifth: 5, sixth: 6,
    seventh: 7, eighth: 8, ninth: 9, tenth: 10, eleventh: 11, twelfth: 12,
  };

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      if (match[1]) {
        mentioned.push(parseInt(match[1]));
      } else {
        const word = match[0].split(" ")[0].toLowerCase();
        if (wordMap[word]) mentioned.push(wordMap[word]);
      }
    }
  }

  return [...new Set(mentioned)];
}

function extractMentionedRuleIds(text: string): string[] {
  const allIds = getAllRuleIds();
  return allIds.filter(id => text.includes(id));
}

export interface FidelityResult {
  valid: boolean;
  violations: string[];
  mentioned_planets: string[];
  mentioned_houses: number[];
  mentioned_rule_ids: string[];
}

/**
 * Validate that LLM output only references planets and houses
 * present in the ActivationPacket.
 *
 * @param llmOutput - The rendered text from the LLM
 * @param packetPlanets - Array of activated planet IDs from the packet
 * @param packetHouses - Array of activated house numbers from the packet
 * @param packetRuleIds - Array of rule IDs cited in the packet
 */
export function validatePacketFidelity(
  llmOutput: string,
  packetPlanets: PlanetId[],
  packetHouses: number[],
  packetRuleIds?: string[],
): FidelityResult {
  const violations: string[] = [];
  const validPlanets = new Set(packetPlanets);
  const validHouses = new Set(packetHouses);

  const mentionedPlanets = extractMentionedPlanets(llmOutput);
  const mentionedHouses = extractMentionedHouses(llmOutput);
  const mentionedRuleIds = extractMentionedRuleIds(llmOutput);

  // Check for hallucinated planets
  for (const planet of mentionedPlanets) {
    if (!validPlanets.has(planet as PlanetId)) {
      violations.push(`Hallucinated planet: "${planet}" is not in the activation packet`);
    }
  }

  // Check for hallucinated houses
  for (const house of mentionedHouses) {
    if (!validHouses.has(house)) {
      violations.push(`Hallucinated house: house ${house} is not in the activation packet`);
    }
  }

  // Check rule IDs are valid
  const allValidIds = new Set(getAllRuleIds());
  for (const ruleId of mentionedRuleIds) {
    if (!allValidIds.has(ruleId)) {
      violations.push(`Hallucinated source rule: "${ruleId}" is not in the rule database`);
    }
  }

  return {
    valid: violations.length === 0,
    violations,
    mentioned_planets: mentionedPlanets,
    mentioned_houses: mentionedHouses,
    mentioned_rule_ids: mentionedRuleIds,
  };
}
