import type { PlanetId, NormalizedChart, BonificationCondition, AspectData } from "./types";
import { PLANET_IDS } from "./types";

const MALEFICS = new Set<PlanetId>(["mars", "saturn"]);
const BENEFICS = new Set<PlanetId>(["venus", "jupiter"]);

/**
 * Bonification and maltreatment — the Hellenistic doctrine of planetary condition
 * through aspect geometry (Brennan ch.14, Valens, Antiochus).
 *
 * - Overcoming: A faster planet separates from a slower one and applies to another
 *   — it "overcomes" the slower. Benefit if benefic, harm if malefic.
 * - Striking with a ray: A malefic in square/opposition to a planet.
 * - Enclosure: A planet between two malefics (sandwiched).
 * - Counteraction: A planet in its own domicile/exaltation mitigates maltreatment.
 * - Adherence: Two planets within 3° orb (bound together).
 * - Reception: A planet in the domicile of another — the received planet helps.
 */
export function computeBonification(chart: NormalizedChart): BonificationCondition[] {
  const conditions: BonificationCondition[] = [];
  const planets = chart.natal.planets;
  const aspects = chart.natal.aspects;

  // 1. Striking with a ray — malefics squaring or opposing
  for (const asp of aspects) {
    if (asp.aspect !== "square" && asp.aspect !== "opposition") continue;
    const mal = MALEFICS.has(asp.planet_a) ? asp.planet_a : MALEFICS.has(asp.planet_b) ? asp.planet_b : null;
    const target = mal === asp.planet_a ? asp.planet_b : mal === asp.planet_b ? asp.planet_a : null;
    if (mal && target && asp.orb <= 3) {
      conditions.push({
        type: "striking",
        planet_a: mal,
        planet_b: target,
        description: `${mal} strikes ${target} with a ray (${asp.aspect}, orb ${asp.orb.toFixed(1)}°)`,
        beneficial: false,
      });
    }
  }

  // 2. Adherence — planets within 3° orb (same sign conjunction)
  for (let i = 0; i < PLANET_IDS.length; i++) {
    for (let j = i + 1; j < PLANET_IDS.length; j++) {
      const a = PLANET_IDS[i];
      const b = PLANET_IDS[j];
      const pa = planets[a];
      const pb = planets[b];
      if (!pa || !pb) continue;

      const diff = Math.abs(pa.degree_absolute - pb.degree_absolute);
      if (diff > 3) continue;

      const beneficial = (BENEFICS.has(a) && BENEFICS.has(b)) ||
        (a === "sun" || a === "moon" || b === "sun" || b === "moon" && (BENEFICS.has(a) || BENEFICS.has(b)));

      conditions.push({
        type: "adherence",
        planet_a: a,
        planet_b: b,
        description: `${a} adheres to ${b} (orb ${diff.toFixed(1)}°)`,
        beneficial,
      });
    }
  }

  // 3. Enclosure — planet sandwiched between two malefics
  // Check each planet: is there a malefic < 8° before and another < 8° after?
  const maleficsPresent = PLANET_IDS.filter(p => MALEFICS.has(p) && planets[p]);
  const allBodies = PLANET_IDS.filter(p => planets[p]).map(p => ({
    planet: p,
    lon: planets[p]!.degree_absolute,
  })).sort((a, b) => a.lon - b.lon);

  for (const target of allBodies) {
    if (MALEFICS.has(target.planet) || target.planet === "sun" || target.planet === "moon") continue;
    const before = allBodies.filter(b => b.lon < target.lon && MALEFICS.has(b.planet)).pop();
    const after = allBodies.find(b => b.lon > target.lon && MALEFICS.has(b.planet));
    if (before && after) {
      const distBefore = target.lon - before.lon;
      const distAfter = after.lon - target.lon;
      if (distBefore <= 8 && distAfter <= 8) {
        conditions.push({
          type: "enclosure",
          planet_a: before.planet,
          planet_b: target.planet,
          description: `${target.planet} enclosed by ${before.planet} (${distBefore.toFixed(1)}°) and ${after.planet} (${distAfter.toFixed(1)}°)`,
          beneficial: false,
        });
      }
    }
  }

  // 4. Reception — planet in another's domicile
  const DOMICILE_MAP: Record<string, number[]> = {
    mars: [0, 7],     // Aries, Scorpio
    venus: [1, 6],    // Taurus, Libra
    mercury: [2, 5],  // Gemini, Virgo
    moon: [3],        // Cancer
    sun: [4],         // Leo
    jupiter: [8, 11], // Sagittarius, Pisces
    saturn: [9, 10],  // Capricorn, Aquarius
  };

  for (const [planet, signs] of Object.entries(DOMICILE_MAP)) {
    const pid = planet as PlanetId;
    const pp = planets[pid];
    if (!pp) continue;
    // Find which other planets are in this planet's domicile signs
    for (const otherPid of PLANET_IDS) {
      if (otherPid === pid) continue;
      const op = planets[otherPid];
      if (!op) continue;
      if (signs.includes(op.sign_index)) {
        conditions.push({
          type: "reception",
          planet_a: pid,
          planet_b: otherPid,
          description: `${otherPid} is received by ${pid} (in ${pid}'s domicile)`,
          beneficial: MALEFICS.has(pid) === false,
        });
      }
    }
  }

  return conditions;
}
