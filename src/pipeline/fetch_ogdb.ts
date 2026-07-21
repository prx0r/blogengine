#!/usr/bin/env tsx
/**
 * Fetch data from the Open Gauquelin Database.
 * 
 * OGDB is the best publicly available dataset: ~25K persons with verified
 * birth times, occupation labels, and eminence scores.
 * 
 * Access: https://opengauquelin.org/downloads (free CSV downloads)
 * License: Creative Commons open data
 */
import type { PipelineSubject } from "./types";
import { writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

const OGDB_BASE = "https://opengauquelin.org";

interface OgdbSubject {
  name: string;
  birth_date: string;
  birth_time: string;
  birth_tz: string;
  latitude: number;
  longitude: number;
  birth_place: string;
  occupation: string;
  eminence_group?: string;
  wikidata_id?: string;
}

/**
 * Download the main OGDB CSV file (all records with birth times).
 * Uses the semicolon-separated format from the official download page.
 */
export async function downloadOgdbMain(): Promise<OgdbSubject[]> {
  const url = "https://opengauquelin.org/download/ogdb-time-sep.csv.zip";
  console.error("Downloading OGDB (records with birth times)...");
  
  const res = await fetch(url, { headers: { "User-Agent": "astrology-pipeline/1.0" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  
  // The file is a ZIP — we need to decompress it
  // For now, we'll handle the ZIP by downloading and extracting
  const buffer = await res.arrayBuffer();
  
  // Try to decompress using the built-in decompression
  let text: string;
  try {
    const ds = new DecompressionStream("gzip");
    const writer = ds.writable.getWriter();
    writer.write(new Uint8Array(buffer));
    writer.close();
    const reader = ds.readable.getReader();
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    const totalLen = chunks.reduce((s, c) => s + c.length, 0);
    const combined = new Uint8Array(totalLen);
    let offset = 0;
    for (const chunk of chunks) { combined.set(chunk, offset); offset += chunk.length; }
    text = new TextDecoder().decode(combined);
  } catch {
    // If gzip decompression fails, the file is a zip not gzip
    // Fallback: just log and return empty
    console.error("  File is ZIP format — downloading raw version instead");
    // Fallback to the uncompressed version if available
    const res2 = await fetch("https://opengauquelin.org/download/ogdb-time-sep.csv", 
      { headers: { "User-Agent": "astrology-pipeline/1.0" } });
    if (!res2.ok) throw new Error(`HTTP ${res2.status}`);
    text = await res2.text();
  }
  
  const lines = text.split("\n").filter(l => l.trim());
  if (lines.length < 2) return [];
  
  // Parse CSV (comma separated despite the -sep suffix)
  const headers = lines[0].split(",").map(h => h.trim());
  const subjects: OgdbSubject[] = [];
  
  for (let i = 1; i < Math.min(lines.length, 24540); i++) {
    const vals = lines[i].split(",").map(v => v.trim());
    const record: Record<string, string> = {};
    headers.forEach((h, idx) => { record[h] = vals[idx] || ""; });
    
    subjects.push({
      name: record["name"] || "",
      birth_date: record["birth_date"] || "",
      birth_time: record["birth_time"] || "",
      birth_tz: record["birth_tz"] || "",
      latitude: parseFloat(record["latitude"] || "0"),
      longitude: parseFloat(record["longitude"] || "0"),
      birth_place: record["birth_place"] || "",
      occupation: record["occupation"] || "",
      eminence_group: record["eminence_group"],
      wikidata_id: record["wikidata_id"],
    });
  }
  
  console.error(`  → ${subjects.length} records (limited to 500 for testing)`);
  return subjects;
}

export async function fetchOgdbTest(): Promise<PipelineSubject[]> {
  const records = await downloadOgdbMain();
  const subjects: PipelineSubject[] = [];
  const seen = new Set<string>();
  
  for (const rec of records) {
    const key = `${rec.name}|${rec.birth_date}`;
    if (seen.has(key) || !rec.birth_time) continue;
    seen.add(key);
    
    subjects.push({
      id: rec.wikidata_id || `ogdb:${rec.name}`,
      label: rec.name,
      birthDate: rec.birth_date,
      birthLat: rec.latitude || undefined,
      birthLon: rec.longitude || undefined,
      birthPlaceName: rec.birth_place,
      occupations: [rec.occupation],
      domain: rec.eminence_group || "control",
    });
  }
  
  return subjects;
}

const OCCUPATION_DOMAIN: Record<string, string> = {
  "athletics-competitor": "athlete", "baseball-player": "athlete", "basketball-player": "athlete",
  "boxer": "athlete", "cyclist": "athlete", "football-player": "athlete", "gymnast": "athlete",
  "handball-player": "athlete", "hockey-player": "athlete", "judo": "athlete",
  "rugby-union-player": "athlete", "rugby-league-player": "athlete", "skier": "athlete",
  "swimmer": "athlete", "tennis-player": "athlete", "volleyball-player": "athlete",
  "water-polo": "athlete", "wrestler": "athlete", "athlete": "athlete",
  "actor": "artist", "painter": "artist", "sculptor": "artist", "dancer": "artist",
  "writer": "writer", "novelist": "writer", "poet": "writer", "journalist": "writer",
  "musician": "musician", "singer": "musician", "composer": "musician", "conductor": "musician",
  "scientist": "scientist", "researcher": "scientist", "physician": "scientist",
  "military-personnel": "athlete", "politician": "leader", "executive": "leader",
};

function mapOccupationToDomain(occupation: string): string {
  const occ = occupation.toLowerCase().trim();
  for (const [key, domain] of Object.entries(OCCUPATION_DOMAIN)) {
    if (occ === key || occ.includes(key)) return domain;
  }
  if (occ.includes("player") || occ.includes("sport")) return "athlete";
  if (occ.includes("writer") || occ.includes("author")) return "writer";
  if (occ.includes("actor") || occ.includes("painter")) return "artist";
  return "control";
}

// Legacy download function for backward compatibility
export async function downloadOgdbSeries(series: string, category: string): Promise<OgdbSubject[]> {
  const url = `${OGDB_BASE}/downloads/${series}/${category}.csv`;
  console.error(`Downloading OGDB: ${series}/${category}...`);
  
  const res = await fetch(url, { headers: { "User-Agent": "astrology-pipeline/1.0" } });
  if (!res.ok) {
    console.error(`  Failed: HTTP ${res.status}`);
    return [];
  }
  
  const text = await res.text();
  const lines = text.split("\n").filter(l => l.trim());
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(";").map(h => h.trim());
  const subjects: OgdbSubject[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const vals = lines[i].split(";").map(v => v.trim());
    const record: Record<string, string> = {};
    headers.forEach((h, idx) => { record[h] = vals[idx] || ""; });
    
    subjects.push({
      name: record["name"] || "",
      birth_date: record["birth_date"] || "",
      birth_time: record["birth_time"] || "",
      birth_tz: record["birth_tz"] || "",
      latitude: parseFloat(record["latitude"] || "0"),
      longitude: parseFloat(record["longitude"] || "0"),
      birth_place: record["birth_place"] || "",
      occupation: record["occupation"] || category,
      eminence_group: record["eminence_group"],
      wikidata_id: record["wikidata_id"],
    });
  }
  
  console.error(`  → ${subjects.length} records`);
  return subjects;
}

/**
 * OGDB series with known occupation categories.
 * Based on the Gauquelin historical test data structure.
 */
const OGDB_SERIES: Record<string, string[]> = {
  "gauquelin": ["sport", "medecin", "politic", "writer", "actor", "military", "researcher", "musician"],
  "muller": ["writer", "medecin"],
  "ertel": ["sport"],
  "comitepara": ["sport"],
  "csicop": ["sport"],
  "cfepp": ["sport"],
};

const DOMAIN_MAP: Record<string, string> = {
  "sport": "athlete",
  "medecin": "scientist",
  "politic": "leader",
  "writer": "writer",
  "actor": "artist",
  "military": "athlete",
  "researcher": "scientist",
  "musician": "musician",
};

export async function fetchOgdbAll(): Promise<PipelineSubject[]> {
  const all: PipelineSubject[] = [];
  const seen = new Set<string>();

  for (const [series, categories] of Object.entries(OGDB_SERIES)) {
    for (const category of categories) {
      const records = await downloadOgdbSeries(series, category);
      
      for (const rec of records) {
        // Deduplicate by name + birth_date
        const key = `${rec.name}|${rec.birth_date}`;
        if (seen.has(key)) continue;
        seen.add(key);
        
        // Only include records with birth time
        if (!rec.birth_time || rec.birth_time === "00:00:00" || !rec.birth_date) continue;
        
        const domain = DOMAIN_MAP[category] || "control";
        
        all.push({
          id: rec.wikidata_id || `ogdb:${series}:${key}`,
          label: rec.name,
          birthDate: rec.birth_date,
          birthLat: rec.latitude || undefined,
          birthLon: rec.longitude || undefined,
          birthPlaceName: rec.birth_place,
          occupations: [rec.occupation],
          domain,
        });
      }
    }
  }
  
  return all;
}

export function saveOgdbToJsonl(subjects: PipelineSubject[], filepath: string): void {
  const dir = filepath.split("/").slice(0, -1).join("/");
  if (dir && !existsSync(dir)) mkdirSync(dir, { recursive: true });
  
  const lines = subjects.map(s => JSON.stringify(s)).join("\n");
  writeFileSync(filepath, lines, "utf-8");
  console.error(`Saved ${subjects.length} subjects to ${filepath}`);
}

// CLI
if (require.main === module) {
  (async () => {
    console.error("Fetching Open Gauquelin Database (test subset)...");
    const subjects = await fetchOgdbTest();
    
    console.error(`\nTotal: ${subjects.length} subjects`);
    const byEminence: Record<string, number> = {};
    for (const s of subjects) { byEminence[s.domain] = (byEminence[s.domain] || 0) + 1; }
    for (const [d, c] of Object.entries(byEminence).sort((a, b) => b[1] - a[1])) {
      console.error(`  ${d}: ${c}`);
    }
    
    saveOgdbToJsonl(subjects, "ogdb_test_subjects.jsonl");
  })().catch(e => { console.error(e); process.exit(1); });
}
