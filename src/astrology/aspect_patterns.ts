import type { PlanetId, AspectData } from "./types";
import { PLANET_IDS } from "./types";

export interface AspectPattern {
  type: "grand_trine" | "t_square" | "grand_cross" | "yod";
  planets: PlanetId[];
  description: string;
  beneficial: boolean;
}

/**
 * Detect major aspect patterns in a set of aspects.
 *
 * - Grand trine: 3 planets each trine the others (120° apart)
 * - T-square: 2 planets in opposition, both square a 3rd
 * - Grand cross: 2 oppositions, each pair square each other
 * - Yod: 2 planets sextile (60°) both quincunx (150°) a 3rd
 */
export function detectAspectPatterns(aspects: AspectData[]): AspectPattern[] {
  const patterns: AspectPattern[] = [];

  // Build adjacency: for each pair, what aspect connects them
  const adjacency = new Map<string, string>();
  for (const asp of aspects) {
    const key = [asp.planet_a, asp.planet_b].sort().join(":");
    // Only tight orbs for patterns
    if (asp.orb <= 3) {
      adjacency.set(key, asp.aspect);
    }
  }

  function hasAspect(a: PlanetId, b: PlanetId, type: string): boolean {
    const key = [a, b].sort().join(":");
    return adjacency.get(key) === type;
  }

  const activePlanets = [...new Set(aspects.flatMap(a => [a.planet_a, a.planet_b]))];

  // Grand trine: 3 planets all trine each other
  for (let i = 0; i < activePlanets.length; i++) {
    for (let j = i + 1; j < activePlanets.length; j++) {
      for (let k = j + 1; k < activePlanets.length; k++) {
        const a = activePlanets[i], b = activePlanets[j], c = activePlanets[k];
        if (hasAspect(a, b, "trine") && hasAspect(a, c, "trine") && hasAspect(b, c, "trine")) {
          patterns.push({
            type: "grand_trine",
            planets: [a, b, c],
            description: `Grand trine: ${a}, ${b}, ${c} — harmonious flow, talent triangle`,
            beneficial: true,
          });
        }
      }
    }
  }

  // T-square: 2 planets oppose, both square a 3rd
  for (let i = 0; i < activePlanets.length; i++) {
    for (let j = i + 1; j < activePlanets.length; j++) {
      for (let k = 0; k < activePlanets.length; k++) {
        if (k === i || k === j) continue;
        const a = activePlanets[i], b = activePlanets[j], c = activePlanets[k];
        if (hasAspect(a, b, "opposition") && hasAspect(a, c, "square") && hasAspect(b, c, "square")) {
          patterns.push({
            type: "t_square",
            planets: [a, b, c],
            description: `T-square: ${a} opposes ${b}, both square ${c} — dynamic tension, pressure toward action`,
            beneficial: false,
          });
        }
      }
    }
  }

  // Grand cross: 2 oppositions at right angles
  for (let i = 0; i < activePlanets.length; i++) {
    for (let j = i + 1; j < activePlanets.length; j++) {
      for (let k = 0; k < activePlanets.length; k++) {
        if (k === i || k === j) continue;
        for (let l = k + 1; l < activePlanets.length; l++) {
          if (l === i || l === j) continue;
          const a = activePlanets[i], b = activePlanets[j], c = activePlanets[k], d = activePlanets[l];
          if (hasAspect(a, b, "opposition") && hasAspect(c, d, "opposition") &&
              hasAspect(a, c, "square") && hasAspect(a, d, "square") &&
              hasAspect(b, c, "square") && hasAspect(b, d, "square")) {
            patterns.push({
              type: "grand_cross",
              planets: [a, b, c, d],
              description: `Grand cross: ${a}/${b} oppose ${c}/${d} — extreme tension, crisis as catalyst`,
              beneficial: false,
            });
          }
        }
      }
    }
  }

  // Yod: 2 planets sextile, both quincunx a 3rd
  for (let i = 0; i < activePlanets.length; i++) {
    for (let j = i + 1; j < activePlanets.length; j++) {
      for (let k = 0; k < activePlanets.length; k++) {
        if (k === i || k === j) continue;
        const a = activePlanets[i], b = activePlanets[j], c = activePlanets[k];
        if (hasAspect(a, b, "sextile") && hasAspect(a, c, "quincunx") && hasAspect(b, c, "quincunx")) {
          patterns.push({
            type: "yod",
            planets: [a, b, c],
            description: `Yod: ${a} sextile ${b}, both quincunx ${c} — fated adjustment, redirection`,
            beneficial: false,
          });
        }
      }
    }
  }

  return patterns;
}
