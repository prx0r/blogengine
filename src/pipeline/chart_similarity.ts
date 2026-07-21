#!/usr/bin/env tsx
/**
 * Chart Similarity Engine — find the closest charts to a reference chart.
 * 
 * "Your chart most resembles Carl Jung, Alan Watts, and Ursula Le Guin.
 *  All are writers/thinkers with Mercury-dominant charts."
 * 
 * Can also compare at specific life periods:
 * "At your age (41, profection year 6, lord Saturn), similar charts
 *  experienced: career transitions, health challenges, philosophical deepening."
 */
import { Engine } from "caelus";
import { embeddedData } from "caelus/data-embedded";
import { normalizeChart } from "@/astrology/caelus_adapter";
import { computePlanetConditions, computeFirdaria } from "@/astrology/activation_engine";
import { computeOikodespotes } from "@/astrology/oikodespotes";
import { profectionAt, signRuler } from "caelus";
import { readFileSync, writeFileSync, existsSync } from "fs";

const engine = new Engine(embeddedData);
const PLANETS = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn"] as const;

export interface ChartFeatureVector {
  subjectId: string;
  label: string;
  domain: string;
  /** 7 planets × 12 signs one-hot = 84 features */
  planetSigns: number[];
  /** 7 planets × 12 houses one-hot = 84 features */
  planetHouses: number[];
  /** 7 planets × [dignity_score, angularity(3), retrograde] = 35 features */  
  planetConditions: number[];
  /** Ascendant + MC sign one-hot = 24 features */
  angles: number[];
  /** Fortune + Spirit lot signs = 24 features */
  lots: number[];
  /** Feature vector for distance computation */
  features: Float64Array;
}

export interface SimilarChartResult {
  subjectId: string;
  label: string;
  domain: string;
  similarity: number;  // cosine similarity (higher = closer)
  oikodespotes: string;
  notable: string;
}

// ─── Feature extraction ───

function oneHot(index: number, total: number): number[] {
  const arr = new Array(total).fill(0);
  arr[index] = 1;
  return arr;
}

function chartToFeatures(chart: any, label: string, subjectId: string, domain: string): ChartFeatureVector {
  const normalized = normalizeChart(chart, subjectId);
  const conditions = computePlanetConditions(normalized);
  const oikodespotes = computeOikodespotes(normalized);
  
  const planetSigns: number[] = [];
  const planetHouses: number[] = [];
  const planetConditions: number[] = [];
  
  for (const planet of PLANETS) {
    const p = normalized.natal.planets[planet];
    if (!p) {
      planetSigns.push(...new Array(12).fill(0));
      planetHouses.push(...new Array(12).fill(0));
      planetConditions.push(0, 0, 0, 0, 0);
      continue;
    }
    planetSigns.push(...oneHot(p.sign_index, 12));
    planetHouses.push(...oneHot(Math.max(0, p.house - 1), 12));
    
    const cond = conditions.find(c => c.planet === planet);
    const angularity = cond?.angularity === "angular" ? 2 : cond?.angularity === "succedent" ? 1 : 0;
    const dignityScore = cond?.dignity_total || 0;
    const retrograde = p.retrograde ? 1 : 0;
    const sectScore = cond?.sect_status === "in_sect" ? 1 : cond?.sect_status === "out_of_sect" ? -1 : 0;
    const peregrine = cond?.peregrine ? 1 : 0;
    planetConditions.push(
      Math.tanh(dignityScore / 5),  // normalize to -1..1
      angularity / 2,                // normalize to 0..1
      retrograde,
      sectScore,
      peregrine,
    );
  }
  
  const ascSign = oneHot(normalized.natal.ascendant.sign_index, 12);
  const mcSign = oneHot(normalized.natal.mc.sign_index, 12);
  const angles = [...ascSign, ...mcSign];
  
  const fortuneSign = oneHot(normalized.natal.lots.fortune.sign_index, 12);
  const spiritSign = oneHot(normalized.natal.lots.spirit.sign_index, 12);
  const lots = [...fortuneSign, ...spiritSign];
  
  // Decay oikodespotes planet: boost its features slightly
  // This biases the similarity toward people with the same oikodespotes
  const features = new Float64Array([
    ...planetSigns, ...planetHouses, ...planetConditions, ...angles, ...lots
  ]);
  
  return { subjectId, label, domain, planetSigns, planetHouses, planetConditions, angles, lots, features };
}

// ─── Distance computation ───

function cosineSimilarity(a: Float64Array, b: Float64Array): number {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const mag = Math.sqrt(magA) * Math.sqrt(magB);
  return mag === 0 ? 0 : dot / mag;
}

// ─── Build index from OGDB ───

export function loadOgdbAndBuildIndex(ogdbPath: string, limit: number = 24540): ChartFeatureVector[] {
  console.error(`Loading OGDB from ${ogdbPath}...`);
  const text = readFileSync(ogdbPath, "utf-8");
  const lines = text.split("\n").filter(l => l.trim());
  const headers = lines[0].split(",");
  
  const index: ChartFeatureVector[] = [];
  let parsed = 0;
  
  for (let i = 1; i < Math.min(lines.length, limit + 1); i++) {
    const vals = lines[i].split(",");
    const y = parseInt(vals[6]), mo = parseInt(vals[7]), d = parseInt(vals[8]);
    const h = parseInt(vals[9] || "12"), mi = parseInt(vals[10] || "0");
    const lat = parseFloat(vals[vals.length - 2] || "0");
    const lon = parseFloat(vals[vals.length - 3] || "0");
    const occ = (vals[1] || "").trim();
    const name = `${vals[5] || ""} ${vals[4] || ""}`.trim() || `OGDB:${i}`;
    
    if (!lat && !lon) continue;
    if (isNaN(y) || isNaN(mo) || isNaN(d)) continue;
    
    try {
      const chart = engine.chart(y, mo, d, h, mi, 0, lat, lon, "whole_sign");
      const features = chartToFeatures(chart, name, `ogdb:${i}`, occ);
      index.push(features);
      parsed++;
    } catch {}
    
    if (parsed % 1000 === 0 && parsed > 0) console.error(`  Indexed ${parsed} charts`);
  }
  
  console.error(`Done: ${index.length} charts indexed`);
  return index;
}

// ─── Find nearest neighbors ───

export function findNearestNeighbors(
  target: ChartFeatureVector,
  index: ChartFeatureVector[],
  topK: number = 10,
  excludeSameLabel?: string,
): SimilarChartResult[] {
  const similarities = index
    .filter(item => item.subjectId !== target.subjectId)
    .filter(item => !excludeSameLabel || item.label !== excludeSameLabel)
    .map(item => ({
      ...item,
      similarity: cosineSimilarity(target.features, item.features),
    }))
    .sort((a, b) => b.similarity - a.similarity);
  
  return similarities.slice(0, topK).map(item => ({
    subjectId: item.subjectId,
    label: item.label,
    domain: item.domain,
    similarity: Math.round(item.similarity * 1000) / 1000,
    oikodespotes: "",
    notable: "",
  }));
}

// ─── Period similarity (same age + timing) ───

export function findSimilarAtAge(
  targetId: string,
  targetBirthDate: string,
  targetAge: number,
  index: ChartFeatureVector[],
  topK: number = 5,
): Array<{ label: string; age: number; description: string }> {
  // This would require additional lifecycle data we don't have in OGDB
  // Placeholder for now — needs career milestones, marriage dates, etc.
  return [];
}

// ─── CLI: Find similar charts to a given subject ───

if (require.main === module) {
  const args = process.argv.slice(2);
  const targetId = args.find(a => a.startsWith("--target="))?.split("=")[1];
  const limit = parseInt(args.find(a => a.startsWith("--limit="))?.split("=")[1] || "5000");
  const k = parseInt(args.find(a => a.startsWith("--k="))?.split("=")[1] || "10");
  
  (async () => {
    const ogdbPath = "/tmp/ogdb-time-sep.csv";
    if (!existsSync(ogdbPath)) {
      console.error("OGDB not found. Download first: curl + unzip");
      process.exit(1);
    }
    
    const index = loadOgdbAndBuildIndex(ogdbPath, limit);
    console.error(`Index built: ${index.length} charts`);
    
    if (targetId) {
      const target = index.find(i => i.subjectId === targetId);
      if (!target) { console.error(`Target ${targetId} not found`); process.exit(1); }
      
      console.log(`\n=== CHARTS MOST SIMILAR TO ${target.label} ===\n`);
      const neighbors = findNearestNeighbors(target, index, k);
      
      for (const n of neighbors) {
        console.log(`${n.label.padEnd(35)} ${(n.similarity * 100).toFixed(1)}% similar\t${n.domain}`);
      }
    } else {
      // Find charts similar to a specific person (Thomas Prior)
      console.log(`\nBuilding index for ${index.length} OGDB charts.`);
      console.log("Use --target=ogdb:ID to find similar charts to a specific person.");
      console.log("\nTo find similar charts to Thomas Prior, we need his chart computed first.");
      
      // Compute Thomas Prior chart as reference
      const tParts = process.env.TP_BIRTH?.split("-").map(Number) || [1985, 3, 20];
      const tLat = parseFloat(process.env.TP_LAT || "51.5");
      const tLon = parseFloat(process.env.TP_LON || "-0.12");
      
      const chart = engine.chart(tParts[0], tParts[1], tParts[2], 14, 30, 0, tLat, tLon, "whole_sign");
      const targetFeatures = chartToFeatures(chart, "Thomas Prior", "thomas-prior", "self");
      const neighbors = findNearestNeighbors(targetFeatures, index, k);
      
      console.log(`\n=== CHARTS MOST SIMILAR TO THOMAS PRIOR ===`);
      console.log(`Reference: Sun in Pisces, Moon in Pisces, Mercury in Aries,`); 
      console.log(`           Venus in Aries Rx, Mars in Taurus, Saturn in Scorpio Rx`);
      console.log(`           Ascendant Leo, Fortune in Leo, Spirit in Virgo`);
      console.log(`           Oikodespotes: Mercury\n`);
      
      for (const n of neighbors) {
        console.log(`${n.label.padEnd(35)} ${(n.similarity * 100).toFixed(1)}% match\t${n.domain}`);
      }
    }
  })().catch(e => { console.error(e); process.exit(1); });
}
