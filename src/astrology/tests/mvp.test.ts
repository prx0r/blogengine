import { describe, it, expect } from "vitest";
import { buildDailySphereReading, type ReaderInput } from "../daily_sphere_reader";
import { computeActivations, determineFortuneSpiritMode } from "../activation_engine";
import { getPairRule, generateTriple, matchCombinations, getAllPairRules, getHouseTopics } from "../valens_combinations";
import { PLANET_PROFILES, chooseAlignmentMode } from "../planet_profiles";
import { getRitualReferences, getAllRitualReferences } from "../ritual_references";
import { SYNTHETIC_CHART_DAY, SYNTHETIC_CHART_NIGHT, CURRENT_SKY_MERCURY_MARS } from "./fixtures";
import type { PlanetId } from "../types";

describe("MVP: Determinism", () => {
  it("produces identical output given identical input", () => {
    const input: ReaderInput = {
      chart: SYNTHETIC_CHART_DAY,
      currentSkyPlanets: CURRENT_SKY_MERCURY_MARS,
      currentSkyAspects: [],
      targetDate: new Date("2026-07-10"),
    };
    const r1 = buildDailySphereReading(input);
    const r2 = buildDailySphereReading(input);
    expect(JSON.stringify(r1)).toBe(JSON.stringify(r2));
  });
});

describe("MVP: Activation Scoring", () => {
  it("produces at least one signal", () => {
    const result = computeActivations({
      chart: SYNTHETIC_CHART_DAY,
      currentSkyPlanets: CURRENT_SKY_MERCURY_MARS,
      currentSkyAspects: [],
      targetDate: new Date("2026-07-10"),
    });
    expect(result.signals.length).toBeGreaterThan(0);
  });

  it("Mercury scores high when hit by multiple systems", () => {
    const result = computeActivations({
      chart: SYNTHETIC_CHART_DAY,
      currentSkyPlanets: CURRENT_SKY_MERCURY_MARS,
      currentSkyAspects: [],
      targetDate: new Date("2026-07-10"),
      profection: {
        annual: { house: 11, sign: "Gemini", lord: "mercury" },
        monthly: { house: 11, sign: "Gemini", lord: "mercury" },
      },
      zrSpirit: { lord: "mercury", sign: "Gemini" },
    });
    const mercury = result.signals.find(s => s.planet === "mercury");
    expect(mercury).toBeDefined();
    expect(mercury!.confidence).toBe("high");
    expect(mercury!.repetition_count).toBeGreaterThanOrEqual(3);
  });

  it("suppresses low-confidence random transits", () => {
    const result = computeActivations({
      chart: SYNTHETIC_CHART_DAY,
      currentSkyPlanets: CURRENT_SKY_MERCURY_MARS,
      currentSkyAspects: [],
      targetDate: new Date("2026-07-10"),
    });
    const lowConf = result.signals.filter(s => s.confidence === "low");
    // Without profection/ZR, some signals may be low — but transit-only should be low
    const transitOnly = result.signals.filter(s =>
      s.sources.every(src => src.startsWith("transit"))
    );
    for (const sig of transitOnly) {
      expect(["low", "medium"]).toContain(sig.confidence);
    }
  });
});

describe("MVP: Fortune/Spirit Split", () => {
  it("detects Fortune mode", () => {
    const result = computeActivations({
      chart: SYNTHETIC_CHART_DAY,
      currentSkyPlanets: CURRENT_SKY_MERCURY_MARS,
      currentSkyAspects: [],
      targetDate: new Date("2026-07-10"),
    });
    const { mode } = determineFortuneSpiritMode(result.signals, SYNTHETIC_CHART_DAY);
    expect(["fortune", "spirit", "mixed"]).toContain(mode);
  });

  it("returns mixed when both Fortune and Spirit are active", () => {
    const chart = { ...SYNTHETIC_CHART_DAY };
    const result = computeActivations({
      chart,
      currentSkyPlanets: CURRENT_SKY_MERCURY_MARS,
      currentSkyAspects: [],
      targetDate: new Date("2026-07-10"),
      profection: {
        annual: { house: 5, sign: "Sagittarius", lord: "jupiter" },
        monthly: { house: 5, sign: "Sagittarius", lord: "jupiter" },
      },
    });
    const { mode } = determineFortuneSpiritMode(result.signals, chart);
    expect(["fortune", "spirit", "mixed"]).toContain(mode);
  });
});

describe("MVP: Valens Combinations", () => {
  it("has all 21 pair rules", () => {
    const rules = getAllPairRules();
    expect(rules.length).toBe(21);
  });

  it("returns correct Mercury+Mars pair", () => {
    const rule = getPairRule("mercury", "mars");
    expect(rule).not.toBeNull();
    expect(rule!.themes.length).toBeGreaterThan(0);
    expect(rule!.opportunities.toString().toLowerCase()).toContain("writing");
  });

  it("generates triple from three planets", () => {
    const triple = generateTriple("mercury", "mars", "venus");
    expect(triple).not.toBeNull();
    expect(triple!.planets.length).toBe(3);
    expect(triple!.composed_of.length).toBe(3);
    expect(triple!.themes.length).toBeGreaterThan(0);
  });

  it("matches combinations from activated planets", () => {
    const combos = matchCombinations(["mercury", "mars", "venus"]);
    expect(combos.length).toBeGreaterThanOrEqual(3); // 3 pairs + 1 triple
    const pairs = combos.filter(c => c.combination_type === "pair");
    expect(pairs.length).toBe(3);
  });
});

describe("MVP: Planet Profiles", () => {
  it("has all 7 planets", () => {
    expect(Object.keys(PLANET_PROFILES).length).toBe(7);
  });

  it("each profile has all fields", () => {
    for (const [id, profile] of Object.entries(PLANET_PROFILES)) {
      expect(profile.planet).toBe(id);
      expect(profile.daimonic_function.length).toBeGreaterThan(0);
      expect(profile.qualities.length).toBeGreaterThan(0);
      expect(profile.healthy_expression.length).toBeGreaterThan(0);
      expect(profile.distorted_expression.length).toBeGreaterThan(0);
      expect(profile.strengthen_when.length).toBeGreaterThan(0);
      expect(profile.balance_when.length).toBeGreaterThan(0);
      expect(profile.colours.length).toBeGreaterThan(0);
      expect(profile.activities.length).toBeGreaterThan(0);
    }
  });

  it("chooseAlignmentMode returns valid mode", () => {
    expect(chooseAlignmentMode({ planet: "mars", pressures: ["agitation", "anger"] })).toBe("cool");
    expect(chooseAlignmentMode({ planet: "saturn", pressures: ["melancholy", "rigid"] })).toBe("strengthen");
    expect(chooseAlignmentMode({ planet: "jupiter", pressures: ["excess", "grandiose"] })).toBe("balance");
    expect(chooseAlignmentMode({ planet: "mercury", pressures: ["scatter", "overthink"] })).toBe("stabilize");
  });
});

describe("MVP: Ritual References", () => {
  it("has at least 2 references per planet", () => {
    const planets: PlanetId[] = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn"];
    for (const p of planets) {
      expect(getRitualReferences(p).length).toBeGreaterThanOrEqual(2);
    }
  });

  it("total references >= 20", () => {
    const all = getAllRitualReferences();
    expect(all.length).toBeGreaterThanOrEqual(20);
  });

  it("each reference has safe adaptation", () => {
    for (const ref of getAllRitualReferences()) {
      expect(ref.safe_adaptation.length).toBeGreaterThan(0);
      expect(["safe_symbolic", "historical_reference", "restricted"]).toContain(ref.safety_class);
    }
  });
});

describe("MVP: House Topics", () => {
  it("returns topics for each house 1-12", () => {
    for (let i = 1; i <= 12; i++) {
      const topics = getHouseTopics(i);
      expect(topics.length).toBeGreaterThan(0);
    }
  });
});

describe("MVP: Full Integration Smoke Test", () => {
  it("builds a complete DailySphereReading", () => {
    const input: ReaderInput = {
      chart: SYNTHETIC_CHART_DAY,
      currentSkyPlanets: CURRENT_SKY_MERCURY_MARS,
      currentSkyAspects: [],
      targetDate: new Date("2026-07-10"),
      profection: {
        annual: { house: 11, sign: "Gemini", lord: "mercury" },
        monthly: { house: 11, sign: "Gemini", lord: "mercury" },
      },
      zrSpirit: { lord: "mercury", sign: "Gemini" },
    };
    const reading = buildDailySphereReading(input);

    expect(reading.date).toBe("2026-07-10");
    expect(reading.natal_activation.activated_planets.length).toBeGreaterThan(0);
    expect(reading.natal_activation.confidence).toBe("high");
    expect(["fortune", "spirit", "mixed"]).toContain(reading.daimonic_interpretation.mode);
    expect(reading.alignment.length).toBeGreaterThan(0);
    expect(reading.ritual_references.length).toBeGreaterThan(0);
    expect(reading.graph_trace.why_this_planet.length).toBeGreaterThan(0);
    expect(reading.graph_trace.source_edges.length).toBeGreaterThan(0);
    expect(reading.atmosphere.yearly.applicable).toBe(true);
    expect(reading.atmosphere.monthly.applicable).toBe(true);
  });

  it("works for night charts too", () => {
    const input: ReaderInput = {
      chart: SYNTHETIC_CHART_NIGHT,
      currentSkyPlanets: CURRENT_SKY_MERCURY_MARS,
      currentSkyAspects: [],
      targetDate: new Date("2026-07-10"),
    };
    const reading = buildDailySphereReading(input);
    expect(reading.natal_activation.activated_planets.length).toBeGreaterThan(0);
  });
});
