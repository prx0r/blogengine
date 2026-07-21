#!/usr/bin/env tsx
/**
 * Personal Daimonic Report — generated for Thomas Prior.
 * 
 * Combines: chart analysis, nearest neighbors, current timing,
 * and daimonic interpretation into a single structured report.
 */
import { Engine } from "caelus";
import { embeddedData } from "caelus/data-embedded";
import { normalizeChart } from "./caelus_adapter";
import { computePlanetConditions, computeFirdaria } from "./activation_engine";
import { computeOikodespotes } from "./oikodespotes";
import { buildActivationPacket, type PacketInput } from "./activation_packet";
import { profectionAt, signRuler, SIGNS } from "caelus";
import { zrAt } from "caelus";
import type { PlanetId } from "./types";

const engine = new Engine(embeddedData);

/** Compute everything for a given birth chart + current time */
export function buildPersonalReport(
  birthYear: number, birthMonth: number, birthDay: number,
  birthHour: number, birthMinute: number,
  birthLat: number, birthLon: number,
  nativeName: string = "Native",
) {
  const chart = engine.chart(birthYear, birthMonth, birthDay, birthHour, birthMinute, 0, birthLat, birthLon, "whole_sign");
  const normalized = normalizeChart(chart, nativeName);
  const conditions = computePlanetConditions(normalized);
  const oikodespotes = computeOikodespotes(normalized);

  const now = new Date();
  const jdUt = now.getTime() / 86400000 + 2440587.5;
  const today = new Date();

  const currentSky: Record<PlanetId, { lon: number; sign_index: number }> = {} as any;
  for (const p of ["sun","moon","mercury","venus","mars","jupiter","saturn"] as PlanetId[]) {
    const lon = engine.longitude(p, jdUt);
    currentSky[p] = { lon, sign_index: Math.floor(lon / 30) % 12 };
  }

  const prof = profectionAt(engine, normalized.natal.jdUt, jdUt, birthLat, birthLon);
  const zr = zrAt(engine, normalized.natal.jdUt, jdUt, birthLat, birthLon, "spirit");
  const zrFort = zrAt(engine, normalized.natal.jdUt, jdUt, birthLat, birthLon, "fortune");
  const firdaria = computeFirdaria(engine, normalized.natal.jdUt, jdUt, birthLat, birthLon);

  const input: PacketInput = {
    chart: normalized,
    currentSkyPlanets: currentSky,
    currentSkyAspects: [],
    targetDate: today,
    profection: {
      annual: { house: prof.annual.house, sign: prof.annual.sign, lord: prof.annual.lord as PlanetId },
      monthly: { house: prof.monthly.house, sign: prof.monthly.sign, lord: prof.monthly.lord as PlanetId },
    },
    zrSpirit: (zr as any).l1 ? { lord: signRuler(SIGNS.indexOf((zr as any).l1)) as PlanetId, sign: (zr as any).l1 } : undefined,
    zrFortune: (zrFort as any).l1 ? { lord: signRuler(SIGNS.indexOf((zrFort as any).l1)) as PlanetId, sign: (zrFort as any).l1 } : undefined,
    firdaria: firdaria.lord ? { lord: firdaria.lord as PlanetId } : undefined,
  };

  const packet = buildActivationPacket(input);

  const age = now.getFullYear() - birthYear - (now.getMonth() < birthMonth - 1 || (now.getMonth() === birthMonth - 1 && now.getDate() < birthDay) ? 1 : 0);

  return {
    nativeName,
    age,
    chart: {
      ascendant: `${normalized.natal.ascendant.sign} ${Math.round(normalized.natal.ascendant.degree_in_sign)}°`,
      mc: `${normalized.natal.mc.sign} ${Math.round(normalized.natal.mc.degree_in_sign)}°`,
      fortune: `${normalized.natal.lots.fortune.sign} H${normalized.natal.lots.fortune.house}`,
      spirit: `${normalized.natal.lots.spirit.sign} H${normalized.natal.lots.spirit.house}`,
      planets: Object.fromEntries(
        ["sun","moon","mercury","venus","mars","jupiter","saturn"].map(p => {
          const pl = normalized.natal.planets[p as PlanetId];
          const c = conditions.find(x => x.planet === p);
          return [p, {
            sign: pl?.sign || "",
            degree: Math.round(pl?.degree_in_sign || 0),
            house: pl?.house || 0,
            angularity: c?.angularity || "cadent",
            dignities: c?.essential_dignity || [],
            retrograde: pl?.retrograde || false,
            sect: c?.sect_status,
          }];
        }),
      ),
    },
    oikodespotes: oikodespotes ? {
      planet: oikodespotes.planet,
      interpretation: oikodespotes.interpretation,
      soulChoice: oikodespotes.soul_choice,
    } : null,
    current_chapter: {
      age,
      profection: {
        house: prof.annual.house,
        sign: prof.annual.sign,
        lord: prof.annual.lord,
      },
      firdaria_lord: firdaria.lord,
      zr_spirit_lord: (zr as any).l1,
      zr_fortune_lord: (zrFort as any).l1,
      confidence: packet.signals.length > 0 ? packet.signals[0].confidence : "none",
      primary_planets: packet.signals.map(s => `${s.planet} (${s.confidence})`),
    },
    daimonic_mode: packet.dominant_mode,
  };
}

if (require.main === module) {
  // Thomas Prior's actual birth data from D1
  const report = buildPersonalReport(1999, 5, 16, 14, 37, 51.41082, -0.6748, "Thomas Prior");

  console.log(`
╔══════════════════════════════════════════════════════════════╗
║              DAIMONIC PERSONAL REPORT                       ║
║                    ${report.nativeName}                          
║              Age ${report.age} · ${new Date().toISOString().split("T")[0]}              
╚══════════════════════════════════════════════════════════════╝

━━━ YOUR CHART ━━━

  ASC: ${report.chart.ascendant}
  MC:  ${report.chart.mc}
  Fortune: ${report.chart.fortune}
  Spirit:  ${report.chart.spirit}

${Object.entries(report.chart.planets).map(([p, pl]: any) => 
  `  ${p.charAt(0).toUpperCase()+p.slice(1)}: ${pl.sign} ${pl.degree}° H${pl.house} ${pl.angularity}${pl.retrograde ? " Rx" : ""}${pl.dignities.length ? " ["+pl.dignities.join(",")+"]" : ""}`
).join("\n")}

━━━ YOUR DAIMON ━━━

  Oikodespotes: ${report.oikodespotes?.planet.toUpperCase()}

  ${report.oikodespotes?.interpretation}

  ${report.oikodespotes?.soulChoice}

━━━ CURRENT CHAPTER (Age ${report.current_chapter.age}) ━━━

  Annual Profection: House ${report.current_chapter.profection.house} (${report.current_chapter.profection.sign}), lord ${report.current_chapter.profection.lord}
  Firdaria Lord: ${report.current_chapter.firdaria_lord || "none"}
  ZR Spirit: ${report.current_chapter.zr_spirit_lord || "none"}
  ZR Fortune: ${report.current_chapter.zr_fortune_lord || "none"}
  Overall confidence: ${report.current_chapter.confidence}
  Primary signals: ${report.current_chapter.primary_planets.join(", ")}

  Daimonic mode: ${report.daimonic_mode}
  ${report.daimonic_mode === "spirit" ? "→ This is a Spirit-led period. The call is toward intention, action, and authorship."
    : report.daimonic_mode === "fortune" ? "→ This is a Fortune-led period. Circumstances are driving the narrative."
    : "→ This is a mixed period. Both circumstance and intention are active."}
`);
}
