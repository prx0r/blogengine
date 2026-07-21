#!/usr/bin/env tsx
/**
 * Resolve birth place names to lat/lon using Open-Meteo geocoding API.
 * Usage: cat subjects.jsonl | npx tsx src/pipeline/geocode.ts > subjects_geocoded.jsonl
 */
import type { PipelineSubject } from "./types";

const GEO_API = "https://geocoding-api.open-meteo.com/v1/search";

interface GeoResult {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
}

async function searchPlace(query: string): Promise<GeoResult | null> {
  const url = `${GEO_API}?name=${encodeURIComponent(query)}&count=3&language=en&format=json`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "astrology-pipeline/1.0" } });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      return data.results[0];
    }
  } catch {}
  return null;
}

// Cache to avoid repeated lookups for the same city
const cache = new Map<string, { lat: number; lon: number }>();

export async function geocodeSubject(subject: PipelineSubject): Promise<PipelineSubject> {
  if (subject.birthLat !== undefined) return subject;  // already geocoded

  const place = subject.birthPlaceName;
  if (!place) return subject;

  // Check cache
  if (cache.has(place)) {
    const c = cache.get(place)!;
    return { ...subject, birthLat: c.lat, birthLon: c.lon };
  }

  const result = await searchPlace(place);
  if (result) {
    cache.set(place, { lat: result.latitude, lon: result.longitude });
    return { ...subject, birthLat: result.latitude, birthLon: result.longitude };
  }

  // Try just the first word of the place name
  const firstWord = place.split(",")[0].trim();
  if (firstWord && firstWord !== place) {
    const result2 = await searchPlace(firstWord);
    if (result2) {
      cache.set(place, { lat: result2.latitude, lon: result2.longitude });
      return { ...subject, birthLat: result2.latitude, birthLon: result2.longitude };
    }
  }

  return subject;
}

export async function geocodeBatch(subjects: PipelineSubject[], batchSize: number = 10): Promise<PipelineSubject[]> {
  const results: PipelineSubject[] = [];
  for (let i = 0; i < subjects.length; i += batchSize) {
    const batch = subjects.slice(i, i + batchSize);
    const geocoded = await Promise.all(batch.map(s => geocodeSubject(s)));
    results.push(...geocoded);

    // Progress
    if ((i + batchSize) % 100 === 0 || i + batchSize >= subjects.length) {
      const geocoded_count = results.filter(s => s.birthLat !== undefined).length;
      console.error(`Progress: ${i + batch.length}/${subjects.length} (${geocoded_count} geocoded)`);
    }

    // Rate limit: 1 request per 150ms
    if (i + batchSize < subjects.length) {
      await new Promise(r => setTimeout(r, 150));
    }
  }
  return results;
}

// CLI
if (require.main === module) {
  const readline = require("readline");
  const rl = readline.createInterface({ input: process.stdin });
  const subjects: PipelineSubject[] = [];

  rl.on("line", (line: string) => {
    try { subjects.push(JSON.parse(line)); } catch {}
  });

  rl.on("close", async () => {
    console.error(`Geocoding ${subjects.length} subjects...`);
    const geocoded = await geocodeBatch(subjects);
    for (const s of geocoded) {
      console.log(JSON.stringify(s));
    }
    const success = geocoded.filter(s => s.birthLat !== undefined).length;
    console.error(`Done: ${success}/${geocoded.length} geocoded`);
  });
}
