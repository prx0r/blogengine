/**
 * Assembles the full DailySphereReading by layering Interpretation
 * data (profiles, rituals, alignment) on top of the pure ActivationPacket.
 *
 * Architecture:
 *   Computation (caelus) → Engine (ActivationPacket) → DailySphereReader (interpretation)
 */
import type { PlanetId, DailySphereReading } from "./types";
import { PLANET_PROFILES, chooseAlignmentMode } from "./planet_profiles";
import { getRitualReferencesForPlanets } from "./ritual_references";
import { buildActivationPacket, type PacketInput, type ActivationPacket } from "./activation_packet";
import { pushActivationToGraph } from "./knowledge_graph";

export type ReaderInput = PacketInput;

export function buildDailySphereReading(input: ReaderInput): DailySphereReading {
  // 1. Build the pure signal packet (ENGINE layer)
  const packet: ActivationPacket = buildActivationPacket(input);

  // 1b. Push activation into the knowledge graph
  pushActivationToGraph(
    packet.signals,
    [], // themes populated by interpretPacket — passed separately
    packet.oikodespotes?.planet,
  );

  // 2. Layer interpretation on top
  const { activated_planets: planetOrder } = packet;
  const relevantSignals = packet.signals;
  const combinations = packet.valens_combinations;

  // ── Alignment advice (from planet profiles) ──
  const alignment = planetOrder.slice(0, 4).map(planet => {
    const profile = PLANET_PROFILES[planet];
    const pressures = profile?.distorted_expression || [];
    const alignMode = chooseAlignmentMode({ planet, pressures, condition: "active" });

    let advice: string[] = [];
    if (profile) {
      switch (alignMode) {
        case "strengthen": advice = profile.strengthen_when; break;
        case "balance": case "cool": case "stabilize": advice = profile.balance_when; break;
        case "discipline": advice = [...profile.healthy_expression.slice(0, 2), ...profile.balance_when.slice(0, 1)]; break;
      }
    }

    return {
      planet,
      mode: alignMode,
      ficinian_advice: advice.length > 0 ? advice : [`Attend to ${profile?.name || planet} qualities today`],
      music: profile?.music_features || [],
      colour: profile?.colours || [],
      scent_or_symbolic_herb: profile?.scents_or_symbolic_herbs || [],
      activity: profile?.activities || [],
    };
  });

  // ── Ritual references ──
  const ritualRefs = getRitualReferencesForPlanets(planetOrder.slice(0, 3));

  // ── Daimonic interpretation ──
  const lifeActivity: string[] = [];
  const opportunity: string[] = [];
  const pressure: string[] = [];
  const distortion: string[] = [];

  planetOrder.forEach((planet, i) => {
    const profile = PLANET_PROFILES[planet];
    if (!profile) return;
    if (i === 0) {
      lifeActivity.push(...profile.healthy_expression.slice(0, 2));
      opportunity.push(...profile.daimonic_function.slice(0, 2));
    } else if (i === 1) {
      lifeActivity.push(...profile.healthy_expression.slice(0, 1));
      opportunity.push(...profile.daimonic_function.slice(0, 1));
    } else {
      lifeActivity.push(profile.healthy_expression[0]);
    }
    pressure.push(...profile.distorted_expression.slice(0, 1));
  });

  for (const combo of combinations) {
    opportunity.push(...combo.opportunities.slice(0, 1));
    pressure.push(...combo.pressures.slice(0, 1));
  }

  const distortionKeywords = ["over", "false", "excess", "lack", "too much", "scatter", "rigid", "aggression", "melancholy"];
  for (const p of pressure) {
    if (distortionKeywords.some(k => p.toLowerCase().includes(k))) distortion.push(p);
  }

  // ── Assemble ──
  return {
    date: packet.date,
    native_id: packet.native_id,
    atmosphere: packet.atmosphere,
    natal_activation: {
      activated_planets: packet.activated_planets,
      activated_houses: packet.activated_houses,
      activated_lots: packet.activated_lots,
      activated_topics: packet.activated_topics,
      confidence: packet.signals.length > 0
        ? (packet.signals[0].confidence === "high" ? "high"
          : packet.signals.some(s => s.confidence === "medium") ? "medium" : "low")
        : "low",
    },
    daimonic_houses: packet.daimonic_houses,
    daimonic_interpretation: {
      mode: packet.dominant_mode,
      life_activity: [...new Set(lifeActivity)],
      opportunity: [...new Set(opportunity)],
      pressure: [...new Set(pressure)],
      distortion: [...new Set(distortion)],
    },
    alignment,
    ritual_references: ritualRefs,
    planet_conditions: packet.planet_conditions,
    fortune_layer: {
      active: packet.fortune_score > 0,
      lot_house: packet.planet_conditions.find(c => c.planet === "sun")?.house || 0,
      lot_house_topics: packet.activated_topics,
      confidence: packet.fortune_score > 6 ? "high" : packet.fortune_score > 3 ? "medium" : "low",
    },
    spirit_layer: {
      active: packet.spirit_score > 0,
      lot_house: packet.planet_conditions.find(c => c.planet === "moon")?.house || 0,
      lot_house_topics: packet.activated_topics,
      confidence: packet.spirit_score > 6 ? "high" : packet.spirit_score > 3 ? "medium" : "low",
    },
    oikodespotes: packet.oikodespotes,
    antiscia: packet.antiscia,
    fixed_stars: packet.fixed_stars,
    bonification: packet.bonification,
    aspect_patterns: packet.aspect_patterns,
    graph_trace: {
      why_this_planet: packet.graph_trace.why_this_planet.map(w => w),
      why_this_advice: alignment.map(a => `${a.planet}: ${a.mode} mode`),
      source_edges: packet.graph_trace.source_edges,
    },
  };
}
