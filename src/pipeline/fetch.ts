#!/usr/bin/env tsx
import type { PipelineSubject } from "./types";

const WIKIDATA_SPARQL = "https://query.wikidata.org/sparql";

const DOMAIN_QIDS: Record<string, string[]> = {
  athlete: ["Q11513337"],
  artist: ["Q483501"],
  writer: ["Q36180"],
  musician: ["Q639669"],
  scientist: ["Q901"],
  leader: ["Q82955"],
  philosopher: ["Q4964182"],
  control: [],
};

function buildQuery(domain: string, limit: number): string {
  const qIds = DOMAIN_QIDS[domain] || [];
  const occClause = qIds.length > 0
    ? `?person wdt:P106 ?occ . FILTER(?occ IN (${qIds.map(id => `wd:${id}`).join(",")}))`
    : "";

  return `SELECT ?person ?label ?birthDate WHERE {
    ?person wdt:P31 wd:Q5 .
    ?person rdfs:label ?label . FILTER(LANG(?label) = "en")
    ?person wdt:P569 ?birthDate .
    ${occClause}
    FILTER(?birthDate >= "1970-01-01"^^xsd:dateTime)
    FILTER(?birthDate <= "2005-01-01"^^xsd:dateTime)
  } LIMIT ${limit}`;
}

async function queryWikidata(sparql: string): Promise<any[]> {
  const url = `${WIKIDATA_SPARQL}?format=json&query=${encodeURIComponent(sparql)}`;
  const res = await fetch(url, { headers: { "User-Agent": "astrology-pipeline/1.0" } });
  if (!res.ok) throw new Error(`SPARQL error: ${res.status}`);
  const data = await res.json();
  return data.results.bindings;
}

function hasMonthAndDay(dateStr: string): boolean {
  if (dateStr.includes("-00-00") || dateStr.includes("-00T")) return false;
  const parts = dateStr.split("T")[0].split("-");
  return parts.length === 3 && parts[1] !== "00" && parts[2] !== "00";
}

export async function fetchDomain(domain: string, limit: number = 200): Promise<PipelineSubject[]> {
  console.error(`Fetching ${domain} (limit ${limit})...`);
  const results = await queryWikidata(buildQuery(domain, limit));
  const seen = new Set<string>();
  const subjects: PipelineSubject[] = [];

  for (const row of results) {
    const id = row.person.value.split("/").pop() || "";
    if (seen.has(id)) continue;
    seen.add(id);
    if (!hasMonthAndDay(row.birthDate.value)) continue;

    subjects.push({
      id,
      label: row.label?.value || "unknown",
      birthDate: row.birthDate.value.split("T")[0],
      occupations: [],
      domain,
    });
  }

  console.error(`  → ${subjects.length} valid subjects`);
  return subjects;
}

export async function fetchAllDomains(limitPerDomain: number = 200): Promise<PipelineSubject[]> {
  const all: PipelineSubject[] = [];
  for (const domain of Object.keys(DOMAIN_QIDS)) {
    const subjects = await fetchDomain(domain, limitPerDomain);
    all.push(...subjects);
    await new Promise(r => setTimeout(r, 1000));
  }
  return all;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const domainIdx = args.indexOf("--domain");
  const limitIdx = args.indexOf("--limit");
  const domain = domainIdx >= 0 ? args[domainIdx + 1] : "all";
  const limit = limitIdx >= 0 ? parseInt(args[limitIdx + 1]) : 200;

  (async () => {
    const subjects = domain === "all" || args.includes("--all")
      ? await fetchAllDomains(limit)
      : await fetchDomain(domain, limit);
    for (const s of subjects) console.log(JSON.stringify(s));
    console.error(`Total: ${subjects.length} subjects`);
  })().catch(e => { console.error(e); process.exit(1); });
}
