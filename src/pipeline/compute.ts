#!/usr/bin/env tsx
/**
 * Compute charts and activation records for all subjects in the pipeline DB.
 * Usage: npx tsx src/pipeline/compute.ts
 *        npx tsx src/pipeline/compute.ts --domain athlete
 *        npx tsx src/pipeline/compute.ts --death-only
 */
import { Engine } from "caelus";
import { embeddedData } from "caelus/data-embedded";
import { normalizeChart } from "@/astrology/caelus_adapter";
import { computeOikodespotes } from "@/astrology/oikodespotes";
import { computeFirdaria } from "@/astrology/activation_engine";
import { buildActivationPacket } from "@/astrology/activation_packet";
import { profectionAt, signRuler, SIGNS } from "caelus";
import { zrAt } from "caelus";
import { insertSubject, getSubjectsByDomain, insertActivationRecord, closeDb } from "./store";
import type { PipelineSubject } from "./types";
import type { PlanetId } from "@/astrology/types";
import type { PacketInput } from "@/astrology/activation_packet";

const engine = new Engine(embeddedData);

/** Use noon UTC as default birth time. */
function getDefaultJd(birthDate: string): number {
  const d = new Date(birthDate + "T12:00:00Z");
  return d.getTime() / 86400000 + 2440587.5;
}

function getSkyForDate(dateStr: string): Record<PlanetId, { lon: number; sign_index: number }> {
  const d = new Date(dateStr + "T12:00:00Z");
  const jd = d.getTime() / 86400000 + 2440587.5;
  const sky = {} as Record<PlanetId, { lon: number; sign_index: number }>;
  for (const p of ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn"]) {
    const lon = engine.longitude(p, jd);
    sky[p as PlanetId] = { lon, sign_index: Math.floor(lon / 30) % 12 };
  }
  return sky;
}

export async function computeSubject(subject: PipelineSubject): Promise<void> {
  if (!subject.birthLat || !subject.birthLon) {
    console.error(`  SKIP ${subject.label}: no birth coordinates`);
    return;
  }

  const jd = getDefaultJd(subject.birthDate);

  try {
    // Compute natal chart
    const birthParts = subject.birthDate.split("-").map(Number);
    const chart = engine.chart(birthParts[0], birthParts[1], birthParts[2], 12, 0, 0,
      subject.birthLat, subject.birthLon, "whole_sign");
    const normalized = normalizeChart(chart, subject.id);

    // Compute oikodespotes
    const oikodespotes = computeOikodespotes(normalized);

    // Store subject with oikodespotes info
    await insertSubject(subject);

    // If subject has a death date, compute activation records
    if (subject.deathDate) {
      await computeDeathRecords(subject, normalized, jd);
    }

    console.error(`  OK ${subject.label} (${subject.domain}): oikodespotes=${oikodespotes?.planet ?? "none"}`);
  } catch (e: any) {
    console.error(`  ERR ${subject.label}: ${e.message}`);
  }
}

async function computeDeathRecords(subject: PipelineSubject, normalized: any, natalJd: number): Promise<void> {
  const deathDate = subject.deathDate!;
  const deathJd = new Date(deathDate + "T12:00:00Z").getTime() / 86400000 + 2440587.5;

  // Death date
  await computeAndStore(subject.id, deathDate, "death", normalized, natalJd, deathJd, subject);

  // 10 control dates: same year as death, ±1 to 5 years
  const deathYear = parseInt(deathDate.split("-")[0]);
  const deathMonth = parseInt(deathDate.split("-")[1]);
  const deathDay = parseInt(deathDate.split("-")[2]);

  for (let offset = -5; offset <= 5; offset++) {
    if (offset === 0) continue;  // skip death date itself
    // Pick same month/day but different year
    const controlYear = deathYear + offset;
    const controlDate = `${controlYear}-${String(deathMonth).padStart(2, "0")}-${String(deathDay).padStart(2, "0")}`;
    const controlJd = new Date(controlDate + "T12:00:00Z").getTime() / 86400000 + 2440587.5;
    await computeAndStore(subject.id, controlDate, "control", normalized, natalJd, controlJd, subject);
  }
}

async function computeAndStore(
  subjectId: string, date: string, dateType: string,
  normalized: any, natalJd: number, targetJd: number,
  subject: PipelineSubject,
): Promise<void> {
  const currentSky = getSkyForDate(date);
  const lat = subject.birthLat || 0;
  const lon = subject.birthLon || 0;

  const prof = profectionAt(engine, natalJd, targetJd, lat, lon);
  const zr = zrAt(engine, natalJd, targetJd, lat, lon, "spirit");
  const zrFort = zrAt(engine, natalJd, targetJd, lat, lon, "fortune");
  const firdaria = computeFirdaria(engine, natalJd, targetJd, lat, lon);

  const input: PacketInput = {
    chart: normalized,
    currentSkyPlanets: currentSky,
    currentSkyAspects: [],
    targetDate: new Date(date + "T12:00:00Z"),
    profection: {
      annual: { house: prof.annual.house, sign: prof.annual.sign, lord: prof.annual.lord as PlanetId },
      monthly: { house: prof.monthly.house, sign: prof.monthly.sign, lord: prof.monthly.lord as PlanetId },
    },
    zrSpirit: (zr as any).l1 ? { lord: signRuler(SIGNS.indexOf((zr as any).l1)) as PlanetId, sign: (zr as any).l1 } : undefined,
    zrFortune: (zrFort as any).l1 ? { lord: signRuler(SIGNS.indexOf((zrFort as any).l1)) as PlanetId, sign: (zrFort as any).l1 } : undefined,
    firdaria: firdaria.lord ? { lord: firdaria.lord as PlanetId } : undefined,
  };

  const packet = buildActivationPacket(input);
  const saturnSignal = packet.signals.find(s => s.planet === "saturn");
  const marsSignal = packet.signals.find(s => s.planet === "mars");

  await insertActivationRecord(
    subjectId, date, dateType,
    saturnSignal?.confidence || "none",
    saturnSignal?.score || 0,
    marsSignal?.confidence || "none",
    marsSignal?.score || 0,
    packet.activated_houses.includes(8),
  );
}

export async function computeBatch(domain?: string): Promise<void> {
  const domains = domain ? [domain] : ["athlete", "artist", "writer", "musician", "scientist", "leader", "philosopher", "control"];

  for (const d of domains) {
    console.error(`\n=== Computing ${d} ===`);
    // For pipeline testing, use a small batch. In production, this reads from the DB.
    // Since we're building this incrementally, we load from JSON lines for now.
    // The store will be populated by fetch + geocode first.
    const subjects = await getSubjectsByDomain(d);
    console.error(`  ${subjects.length} subjects found in DB`);

    for (let i = 0; i < subjects.length; i++) {
      await computeSubject(subjects[i]);
      if ((i + 1) % 10 === 0) console.error(`  Progress: ${i + 1}/${subjects.length}`);
    }
  }

  await closeDb();
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  const domainIdx = args.indexOf("--domain");
  const domain = domainIdx >= 0 ? args[domainIdx + 1] : undefined;

  computeBatch(domain).catch(e => { console.error(e); process.exit(1); });
}
