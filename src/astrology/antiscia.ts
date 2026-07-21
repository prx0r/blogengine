import type { PlanetId, AntisciaConnection, NormalizedChart } from "./types";
import { PLANET_IDS } from "./types";

/**
 * Antiscia are degrees symmetrical across the solstice axis (0° Cancer/Capricorn).
 * A planet at 10° Taurus has its antiscion at 20° Leo.
 *
 * Formula: antiscion = 30 - degree_in_sign, in the opposite-sign pair:
 *   Aries ↔ Virgo, Taurus ↔ Leo, Gemini ↔ Cancer
 *   Libra ↔ Pisces, Scorpio ↔ Aquarius, Sagittarius ↔ Capricorn
 *
 * Per Firmicus Maternus (Mathesis), antiscia create invisible bonds between
 * planets — activating one activates the hidden support/obstruction of the other.
 */
const ANTISCIA_PAIRS: Record<number, number> = {
  0: 5, 5: 0,   // Aries ↔ Virgo
  1: 4, 4: 1,   // Taurus ↔ Leo
  2: 3, 3: 2,   // Gemini ↔ Cancer
  6: 11, 11: 6, // Libra ↔ Pisces
  7: 10, 10: 7, // Scorpio ↔ Aquarius
  8: 9, 9: 8,   // Sagittarius ↔ Capricorn
};

function computeAntiscion(signIndex: number, degreeInSign: number): { sign_index: number; degree: number } {
  const pair = ANTISCIA_PAIRS[signIndex];
  if (pair === undefined) return { sign_index: signIndex, degree: degreeInSign };
  return { sign_index: pair, degree: 30 - degreeInSign };
}

export function computeAntiscia(chart: NormalizedChart): AntisciaConnection[] {
  const results: AntisciaConnection[] = [];
  const planets = chart.natal.planets;

  for (let i = 0; i < PLANET_IDS.length; i++) {
    for (let j = i + 1; j < PLANET_IDS.length; j++) {
      const a = PLANET_IDS[i];
      const b = PLANET_IDS[j];
      const pa = planets[a];
      const pb = planets[b];
      if (!pa || !pb) continue;

      // Compute antiscion of planet A
      const antiA = computeAntiscion(pa.sign_index, pa.degree_in_sign);
      // Check if planet B is within orb of A's antiscion
      const orb = Math.abs(pb.degree_absolute - (antiA.sign_index * 30 + antiA.degree));
      if (orb <= 3) {
        results.push({
          planet_a: a,
          planet_b: b,
          antiscion_degree_a: antiA.sign_index * 30 + antiA.degree,
          antiscion_degree_b: pa.degree_absolute,
          orb,
        });
      }
    }
  }

  return results;
}
