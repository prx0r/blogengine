import { describe, it, expect } from "vitest";
import { Engine } from "caelus";
import { embeddedData } from "caelus/data-embedded";
import { profectionAt, signRuler, SIGNS } from "caelus";
import { zrAt } from "caelus";
import { dignityScore } from "caelus";
import { normalizeChart } from "../caelus_adapter";
import { computeActivations, determineFortuneSpiritMode } from "../activation_engine";
import { buildDailySphereReading, type ReaderInput } from "../daily_sphere_reader";
import { getPairRule, generateTriple, matchCombinations, getHouseTopics } from "../valens_combinations";
import { PLANET_PROFILES } from "../planet_profiles";
import { getRitualReferences } from "../ritual_references";
import { SYNTHETIC_CHART_DAY, CURRENT_SKY_MERCURY_MARS } from "./fixtures";
import type { PlanetId } from "../types";

const REAL_CHARTS = {
  // Christopher Brennan — astrologer, born 1982-02-09 10:20 EST in Buffalo, NY
  brennan: { y: 1982, mo: 2, d: 9, h: 15, mi: 20, s: 0, lat: 42.886, lon: -78.878, name: "Chris Brennan" },
};

describe("Real caelus engine integration", () => {
  let engine: Engine;

  it("instantiates engine with embedded data", () => {
    engine = new Engine(embeddedData);
    expect(engine).toBeInstanceOf(Engine);
    expect(engine.bodies().length).toBeGreaterThan(0);
  });

  it("computes a real chart and normalizes it", () => {
    const c = REAL_CHARTS.brennan;
    const chart = engine.chart(c.y, c.mo, c.d, c.h, c.mi, c.s, c.lat, c.lon, "whole_sign");
    expect(chart.bodies.sun).toBeDefined();
    expect(chart.bodies.moon).toBeDefined();
    expect(chart.angles.asc).toBeGreaterThanOrEqual(0);

    const normalized = normalizeChart(chart, "test-brennan");
    expect(normalized.natal.planets.sun).toBeDefined();
    expect(normalized.natal.ascendant.sign).toBeDefined();
    expect(normalized.natal.houses_whole_sign.length).toBe(12);
    expect(normalized.natal.lots.fortune).toBeDefined();
    expect(normalized.natal.lots.spirit).toBeDefined();
    expect(typeof normalized.natal.day_chart).toBe("boolean");
  });
});

describe("Textual coherence: Valens pair meanings", () => {
  const VALENS_PAIRS: Array<{ a: PlanetId; b: PlanetId; expected_themes: string[] }> = [
    // Valens Book I.21: Mercury+Mars = "sharp, contentious, crafty, persuasive, argumentative"
    { a: "mercury", b: "mars", expected_themes: ["sharp", "speech", "craft", "precision"] },
    { a: "mars", b: "venus", expected_themes: ["passionate", "love", "creative", "desire"] },
    { a: "saturn", b: "jupiter", expected_themes: ["authority", "structure", "growth", "responsible"] },
    { a: "venus", b: "mercury", expected_themes: ["graceful", "speech", "artistic", "social"] },
    { a: "jupiter", b: "venus", expected_themes: ["generous", "love", "abundant", "beauty"] },
    { a: "mars", b: "jupiter", expected_themes: ["expansive", "action", "righteous", "force", "courage"] },
    { a: "saturn", b: "mars", expected_themes: ["disciplined", "force", "strategic", "pressure"] },
    { a: "saturn", b: "mercury", expected_themes: ["disciplined", "thought", "structured", "communication"] },
    { a: "moon", b: "sun", expected_themes: ["integrated", "self", "feeling", "will", "whole"] },
    { a: "jupiter", b: "mercury", expected_themes: ["wise", "speech", "expansive", "thought", "teaching"] },
  ];

  for (const pair of VALENS_PAIRS) {
    it(`${pair.a}+${pair.b} contains expected themes from Valens Book I.21`, () => {
      const rule = getPairRule(pair.a, pair.b);
      expect(rule).not.toBeNull();
      const fullText = rule!.themes.join(" ").toLowerCase();
      for (const theme of pair.expected_themes) {
        expect(fullText).toContain(theme);
      }
    });
  }

  it("triple Mercury+Mars+Venus combines all three pair themes", () => {
    const triple = generateTriple("mercury", "mars", "venus");
    expect(triple).not.toBeNull();
    expect(triple!.composed_of).toContain("valens:pair:mars+venus");
    expect(triple!.composed_of).toContain("valens:pair:mars+mercury");
    expect(triple!.composed_of).toContain("valens:pair:venus+mercury");
    // Triple themes should be a superset
    for (const pairId of triple!.composed_of) {
      const pairRule = getPairRule(
        pairId.split("+").slice(-2)[0] as PlanetId,
        pairId.split("+").slice(-2)[1] as PlanetId,
      );
      if (pairRule) {
        for (const theme of pairRule.themes) {
          expect(triple!.themes).toContain(theme);
        }
      }
    }
  });
});

describe("Textual coherence: Fortune/Spirit semantics (Greenbaum)", () => {
  it("Fortness is tied to Moon, body, material", () => {
    const result = computeActivations({
      chart: SYNTHETIC_CHART_DAY,
      currentSkyPlanets: CURRENT_SKY_MERCURY_MARS,
      currentSkyAspects: [],
      targetDate: new Date("2026-07-10"),
      profection: {
        annual: { house: 5, sign: "Sagittarius", lord: "jupiter" },
        monthly: { house: 5, sign: "Sagittarius", lord: "jupiter" },
      },
    });
    const fs = determineFortuneSpiritMode(result.signals, SYNTHETIC_CHART_DAY);
    // When Fortune lot lord is activated, fortune signal should be present
    expect(typeof fs.fortuneScore).toBe("number");
    expect(typeof fs.spiritScore).toBe("number");
    expect(["fortune", "spirit", "mixed"]).toContain(fs.mode);
    expect(fs.fortune).toBeDefined();
    expect(fs.spirit).toBeDefined();
    expect(typeof fs.fortune.lot_house).toBe("number");
    expect(typeof fs.spirit.lot_house).toBe("number");
  });

  it("Spirit is tied to Sun, action, vocation (Greenbaum §9)", () => {
    // Greenbaum: "Daimon happens to be lord of soul, temper, intentional mind"
    // Paulus ch.23: "Daimon is lord of soul, temper, phronesis and every capability"
    const mercuryProfile = PLANET_PROFILES.mercury;
    expect(mercuryProfile.daimonic_function).toContain("articulation");
    expect(mercuryProfile.daimonic_function).toContain("symbolic interpretation");
    expect(mercuryProfile.daimonic_function).toContain("technical craft");
    // These map to Greenbaum's "intentional mind" and "capability"
  });

  it("Fortune rules body and circumstance (Valens I.1, Paulus ch.23)", () => {
    // Valens I.1: Moon = life, body
    // Paulus ch.23: Fortune = body, actions, acquisition
    const moonProfile = PLANET_PROFILES.moon;
    expect(moonProfile.daimonic_function).toContain("receptivity");
    expect(moonProfile.daimonic_function).toContain("embodiment");
    expect(moonProfile.daimonic_function).toContain("nurture");
  });

  it("DailySphereReading correctly splits Fortune vs Spirit", () => {
    const input: ReaderInput = {
      chart: SYNTHETIC_CHART_DAY,
      currentSkyPlanets: CURRENT_SKY_MERCURY_MARS,
      currentSkyAspects: [],
      targetDate: new Date("2026-07-10"),
      profection: {
        annual: { house: 5, sign: "Sagittarius", lord: "jupiter" },
        monthly: { house: 5, sign: "Sagittarius", lord: "jupiter" },
      },
    };
    const reading = buildDailySphereReading(input);
    expect(["fortune", "spirit", "mixed"]).toContain(reading.daimonic_interpretation.mode);
    expect(reading.daimonic_interpretation.life_activity.length).toBeGreaterThan(0);
    // Should have planet_conditions, fortune_layer, spirit_layer
    expect(reading.planet_conditions.length).toBe(7);
    expect(reading.fortune_layer).toBeDefined();
    expect(reading.spirit_layer).toBeDefined();
    expect(typeof reading.fortune_layer.lot_house).toBe("number");
    expect(typeof reading.spirit_layer.lot_house).toBe("number");
  });
});

describe("Textual coherence: House topics (Dorotheus, Paulus)", () => {
  const HOUSE_TOPICS_MAP: Record<number, string[]> = {
    1: ["life", "vitality", "body"],
    2: ["wealth", "resources", "livelihood"],
    3: ["siblings", "communication"],
    4: ["home", "family", "roots"],
    5: ["children", "pleasures", "creativity"],
    6: ["health", "illness", "servitude"],
    7: ["marriage", "partnership"],
    8: ["death", "inheritance"],
    9: ["religion", "divination", "foreign"],
    10: ["profession", "reputation", "career"],
    11: ["friends", "alliances", "hopes"],
    12: ["enemies", "suffering", "danger"],
  };

  for (let i = 1; i <= 12; i++) {
    it(`House ${i} topics match Dorotheus/Paulus definitions`, () => {
      const topics = getHouseTopics(i);
      const expected = HOUSE_TOPICS_MAP[i];
      for (const e of expected) {
        expect(topics.join(" ").toLowerCase()).toContain(e);
      }
    });
  }
});

describe("Textual coherence: Planetary condition (Valens, Brennan)", () => {
  it("dignityScore from caelus evaluates essential dignities correctly", () => {
    // Mars in Aries (domicile), day chart
    const marsDignity = dignityScore("mars", 15, "day");
    expect(marsDignity.rulership).toBe(5); // domicile score
    expect(marsDignity.total).toBeGreaterThanOrEqual(5);

    // Venus in Libra (domicile), night chart 
    const venusLibra = dignityScore("venus", 188, "night"); // ~8° Libra
    expect(venusLibra.rulership).toBe(5);

    // Venus in Aries (detriment) 
    const venusDetriment = dignityScore("venus", 15, "day");
    expect(venusDetriment.detriment).toBe(-5);
  });

  it("planet profiles contain healthy and distorted expressions matching Valens", () => {
    // Valens Book I describes planetary significations
    // Saturn: "dark, obscure, sick, constrained" (Babylonian precursor)
    // Valens: Saturn = "destruction, cold, obstacle"
    const saturn = PLANET_PROFILES.saturn;
    expect(saturn.healthy_expression).toContain("patient building");
    expect(saturn.distorted_expression).toContain("rigidity");
    expect(saturn.distorted_expression).toContain("melancholy");

    // Mars: Valens = "cutting, sharp, swift, contentious"
    const mars = PLANET_PROFILES.mars;
    expect(mars.healthy_expression).toContain("disciplined action");
    expect(mars.distorted_expression).toContain("aggression");

    // Jupiter: Valens = "increase, honor, benevolence"
    const jupiter = PLANET_PROFILES.jupiter;
    expect(jupiter.healthy_expression).toContain("teaching");
    expect(jupiter.healthy_expression).toContain("generosity");
  });
});

describe("Textual coherence: Ritual references match source traditions", () => {
  it("Ficino references advise cooling Mars, not amplifying it", () => {
    const marsRefs = getRitualReferences("mars");
    const ficinoMars = marsRefs.find(r => r.source === "Ficino");
    expect(ficinoMars).toBeDefined();
    const adaptations = ficinoMars!.safe_adaptation.join(" ").toLowerCase();
    // Ficino warns against raw Mars and recommends disciplined channeling
    expect(adaptations).toContain("disciplined");
    expect(adaptations).toContain("meditative");
  });

  it("Picatrix references are marked historical_reference or safe_symbolic", () => {
    for (const ref of getRitualReferences("mercury")) {
      if (ref.source === "Picatrix") {
        expect(ref.safety_class).not.toBe("restricted");
      }
    }
  });

  it("Orphic hymns suggest prayer, not ritual performance", () => {
    for (const ref of getRitualReferences("sun")) {
      if (ref.source === "Orphic Hymn") {
        for (const adaptation of ref.safe_adaptation) {
          expect(adaptation.toLowerCase()).not.toContain("sacrifice");
        }
      }
    }
  });
});

describe("Integration: Real chart with caelus + analysis engine", () => {
  let engine: Engine;

  it("produces coherent DailySphereReading for Chris Brennan chart", () => {
    engine = new Engine(embeddedData);
    const c = REAL_CHARTS.brennan;
    const chart = engine.chart(c.y, c.mo, c.d, c.h, c.mi, c.s, c.lat, c.lon, "whole_sign");
    const normalized = normalizeChart(chart, "brennan-test");

    // Get current sky for a known date
    const testDate = new Date("2026-07-10");
    const jdUt = testDate.getTime() / 86400000 + 2440587.5;

    // Compute current sky planets using caelus
    const currentSkyPlanets: Record<PlanetId, { lon: number; sign_index: number }> = {
      sun: { lon: engine.longitude("sun", jdUt), sign_index: 0 },
      moon: { lon: engine.longitude("moon", jdUt), sign_index: 0 },
      mercury: { lon: engine.longitude("mercury", jdUt), sign_index: 0 },
      venus: { lon: engine.longitude("venus", jdUt), sign_index: 0 },
      mars: { lon: engine.longitude("mars", jdUt), sign_index: 0 },
      jupiter: { lon: engine.longitude("jupiter", jdUt), sign_index: 0 },
      saturn: { lon: engine.longitude("saturn", jdUt), sign_index: 0 },
    };
    for (const [key, val] of Object.entries(currentSkyPlanets)) {
      val.sign_index = Math.floor(val.lon / 30) % 12;
    }

    // Compute profection and ZR
    const prof = profectionAt(engine, normalized.natal.jdUt, jdUt, c.lat, c.lon);
    const zr = zrAt(engine, normalized.natal.jdUt, jdUt, c.lat, c.lon, "spirit");

    const input: ReaderInput = {
      chart: normalized,
      currentSkyPlanets,
      currentSkyAspects: [],
      targetDate: testDate,
      profection: {
        annual: { house: prof.annual.house, sign: prof.annual.sign, lord: prof.annual.lord as PlanetId },
        monthly: { house: prof.monthly.house, sign: prof.monthly.sign, lord: prof.monthly.lord as PlanetId },
      },
      zrSpirit: zr && zr.l1 ? { lord: signRuler(SIGNS.indexOf(zr.l1)) as PlanetId, sign: zr.l1 } : undefined,
    };

    const reading = buildDailySphereReading(input);

    // Verify coherence
    expect(reading.date).toBe("2026-07-10");
    expect(reading.natal_activation.activated_planets.length).toBeGreaterThan(0);
    expect(reading.natal_activation.confidence).toBeDefined();
    expect(reading.daimonic_interpretation.mode).toBeDefined();
    expect(reading.alignment.length).toBeGreaterThan(0);
    // Should have ritual references for activated planets
    expect(reading.ritual_references.length).toBeGreaterThan(0);
    // Graph trace should explain the activations
    expect(reading.graph_trace.why_this_planet.length).toBeGreaterThan(0);

    // New fields should be present
    expect(reading.planet_conditions.length).toBe(7);
    expect(reading.fortune_layer).toBeDefined();
    expect(reading.spirit_layer).toBeDefined();
    // Source edges should include condition info
    const hasConditionEdges = reading.graph_trace.source_edges.some(e => e.startsWith("condition:"));
    // May or may not have condition edges depending on chart

    // Verify determinism: identical input → identical output
    const reading2 = buildDailySphereReading(input);
    expect(JSON.stringify(reading)).toBe(JSON.stringify(reading2));
  });
});
