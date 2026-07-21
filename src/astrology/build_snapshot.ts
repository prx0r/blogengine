/**
 * Build a maximally-granular DailySnapshot from the engine output.
 * All data is deterministic. The LLM renders from this.
 */

import type { ActivationPacket } from "./activation_packet";
import type { InterpretedReading } from "./interpretation_schema";
import type { SpellEntry } from "./spellbook/types";
import type { DailySnapshot } from "./daily_snapshot";
import type { PlanetId } from "./types";
import { correspondencesForPlanet } from "./spellbook/correspondences";
import type { CorrespondenceEntry } from "./spellbook/correspondences";

/** Source text repository — links practice IDs to their actual source material */
const SOURCE_TEXTS: Record<string, string> = {
  "orphic:sun:001": "Hear, blessed one, whose eye sees all from afar, / Sun, fiery Titan, ever-living flame, / Who gives light to mortals, who brings the seasons, / Pure guardian of the world, come with your radiance. — Orphic Hymn 8 to the Sun",
  "orphic:mercury:001": "Hermes, messenger of Zeus, guide of souls, / Who turns the key of dreams, who brings light to words, / Sharpen my tongue, clarify my thought, / Let what I speak be true and what I write be clear. — Orphic Hymn 28 to Hermes",
  "picatrix:mars:001": "Hold a piece of iron or hematite. Visualize a red shield. Recite the Orphic Hymn to Ares. Speak: 'I act with courage, not with anger.' — Picatrix II.3, adapted",
  "picatrix:mercury:001": "Write a clear intention on clean paper. Recite a Mercury hymn. Perform a timed study block (25 min). Use yellow and pale blue. — Picatrix II.3, adapted",
};

export function buildSnapshot(
  packet: ActivationPacket,
  reading: InterpretedReading,
  practices: SpellEntry[],
): DailySnapshot {
  const strongest = packet.signals[0];
  const corrs: CorrespondenceEntry[] = strongest
    ? correspondencesForPlanet("planet:" + strongest.planet)
    : [];

  // Build correspondences object grouped by type
  const correspondences: DailySnapshot["correspondences"] = {};
  for (const item of corrs) {
    if (!correspondences[item.type]) correspondences[item.type] = [];
    correspondences[item.type].push({
      type: item.type,
      label: item.label,
      citation: item.citation || "",
    });
  }

  return {
    date: packet.date,
    native_id: packet.native_id,
    computed_at: Date.now(),

    engine: {
      signals: packet.signals.map(s => ({
        planet: s.planet,
        score: s.score,
        confidence: s.confidence,
        timing_sources: s.timing_sources,
        activated_houses: s.activated_houses,
        activated_lots: s.activated_lots,
        condition: s.condition || null,
      })),
      dominant_mode: packet.dominant_mode,
      fortune_score: packet.fortune_score,
      spirit_score: packet.spirit_score,
      oikodespotes: packet.oikodespotes
        ? {
            planet: packet.oikodespotes.planet,
            score: packet.oikodespotes.score,
            interpretation: packet.oikodespotes.interpretation,
          }
        : null,
      planet_conditions: packet.planet_conditions,
      aspect_patterns: packet.aspect_patterns.map(a => ({
        type: a.type,
        planets: a.planets,
        description: a.description,
      })),
      antiscia: packet.antiscia.map(a => ({
        planet_a: a.planet_a,
        planet_b: a.planet_b,
        orb: a.orb,
      })),
      bonification: packet.bonification.map(b => ({
        type: b.type,
        planet_a: b.planet_a,
        planet_b: b.planet_b,
        description: b.description,
        beneficial: b.beneficial,
      })),
      valens_combinations: packet.valens_combinations.map(c => ({
        planets: c.planets,
        type: c.combination_type,
        themes: c.themes,
      })),
    },

    timescapes: reading.macro.timescales,

    interpretations: reading.interpretations,

    convergence: reading.convergence,

    practices: practices.map(p => ({
      id: p.id,
      source: p.source,
      type: p.type,
      title: p.title,
      procedure: p.procedure,
      incantation: p.incantation || null,
      timing: p.timing || null,
      materials: p.materials || null,
      safety: p.safety,
      source_text: SOURCE_TEXTS[p.id] || null,
    })),

    correspondences,
  };
}
