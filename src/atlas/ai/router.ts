import { searchPhases, getPhaseByLabel } from "../graph/phaseCache";
import type { PhaseCacheEntry } from "../graph/phaseCache";

export type RouterDepth = "light" | "deep";

export interface RouterResult {
  depth: RouterDepth;
  matchedPhases: PhaseCacheEntry[];
}

const DEEP_PATTERNS = [
  /\bproves?\b/i,
  /\bmeans?\b/i,
  /\bis (just|really|basically|essentially)\b/i,
  /\bis the same as\b/i,
  /\bis like\b/i,
  /\bimplies?\b/i,
  /\btherefore\b/i,
  /\bmust be\b/i,
  /\bcannot be\b/i,
  /\bis (not |never )\b/i,
  /\bcontradicts?\b/i,
  /\bdebunks?\b/i,
  /\bvs\.?\b/i,
  /\bversus\b/i,
  /\bdifference between\b/i,
  /\bsimilar to\b/i,
];

const DEFINITION_PATTERNS = [
  /\bwhat is\b/i,
  /\bwhat are\b/i,
  /\bexplain\b/i,
  /\bdefine\b/i,
  /\bmeaning of\b/i,
  /\btell me about\b/i,
  /\bhow (do|does|can)\b/i,
  /\bhow to\b/i,
  /\bintroduce\b/i,
];

const PHASE_KEYWORDS: { pattern: RegExp; phaseLabel: string }[] = [
  { pattern: /\bdaimon\b/i, phaseLabel: "Daimon" },
  { pattern: /\bguidance\b/i, phaseLabel: "Daimon" },
  { pattern: /\bvocat(i|ion)\b/i, phaseLabel: "Daimon" },
  { pattern: /\bsoul(\b|'s)/i, phaseLabel: "Daimon" },
  { pattern: /\bring\b/i, phaseLabel: "Daimon" },
  { pattern: /\britual\b/i, phaseLabel: "Ritual Re-Rendering" },
  { pattern: /\btheurgy\b/i, phaseLabel: "Ritual Re-Rendering" },
  { pattern: /\bceremony\b/i, phaseLabel: "Ritual Re-Rendering" },
  { pattern: /\bplacebo\b/i, phaseLabel: "Ritual Re-Rendering" },
  { pattern: /\bimag(in|e)\b/i, phaseLabel: "Imaginal Reconstruction" },
  { pattern: /\bsymbol\b/i, phaseLabel: "Imaginal Reconstruction" },
  { pattern: /\barchetype\b/i, phaseLabel: "Imaginal Reconstruction" },
  { pattern: /\bmantra\b/i, phaseLabel: "Language / Sign / Mantra" },
  { pattern: /\blanguage\b/i, phaseLabel: "Language / Sign / Mantra" },
  { pattern: /\bconsciousness\b/i, phaseLabel: "Nonordinary Rendering" },
  { pattern: /\bnonordinary\b/i, phaseLabel: "Nonordinary Rendering" },
  { pattern: /\bmeditation\b/i, phaseLabel: "Non-fabrication" },
  { pattern: /\bdzogchen\b/i, phaseLabel: "Non-fabrication" },
  { pattern: /\bmahamudra\b/i, phaseLabel: "Non-fabrication" },
  { pattern: /\bempt(y|iness)\b/i, phaseLabel: "Emptiness" },
  { pattern: /\bnihilism\b/i, phaseLabel: "Emptiness" },
  { pattern: /\breification\b/i, phaseLabel: "Emptiness" },
  { pattern: /\bdependent arising\b/i, phaseLabel: "Dependent Arising" },
  { pattern: /\bcausation\b/i, phaseLabel: "Dependent Arising" },
  { pattern: /\bkarma\b/i, phaseLabel: "Dependent Arising" },
  { pattern: /\bmind(as | )?computer\b/i, phaseLabel: "Mind-as-Computer Critique" },
  { pattern: /\bcognitio\b/i, phaseLabel: "Mind-as-Computer Critique" },
  { pattern: /\bconscious\b/i, phaseLabel: "Mind-as-Computer Critique" },
  { pattern: /\bai consciousness\b/i, phaseLabel: "Mind-as-Computer Critique" },
  { pattern: /\bquantum\b/i, phaseLabel: "Physical De-solidification" },
  { pattern: /\bmatter\b/i, phaseLabel: "Physical De-solidification" },
  { pattern: /\bphysics\b/i, phaseLabel: "Physical De-solidification" },
  { pattern: /\bmagic\b/i, phaseLabel: "Physical De-solidification" },
  { pattern: /\benergy\b/i, phaseLabel: "Body-Energy Interface" },
  { pattern: /\bsomatic\b/i, phaseLabel: "Body-Energy Interface" },
  { pattern: /\bchakra\b/i, phaseLabel: "Body-Energy Interface" },
  { pattern: /\belemental\b/i, phaseLabel: "Body-Energy Interface" },
  { pattern: /\bcosmolog(y|ies)\b/i, phaseLabel: "Visionary Cosmologies" },
  { pattern: /\bkabbalah\b/i, phaseLabel: "Visionary Cosmologies" },
  { pattern: /\bgnostic\b/i, phaseLabel: "Visionary Cosmologies" },
  { pattern: /\bneoplatonis\b/i, phaseLabel: "Visionary Cosmologies" },
  { pattern: /\btantra\b/i, phaseLabel: "Visionary Cosmologies" },
  { pattern: /\banimis\b/i, phaseLabel: "Ecology / Animism" },
  { pattern: /\becolog(y|ical)\b/i, phaseLabel: "Ecology / Animism" },
  { pattern: /\bmore.?than.?human\b/i, phaseLabel: "Ecology / Animism" },
  { pattern: /\bincarnation\b/i, phaseLabel: "Social Incarnation" },
  { pattern: /\bpraxis\b/i, phaseLabel: "Social Incarnation" },
  { pattern: /\bcommun(it|y)\b/i, phaseLabel: "Social Incarnation" },
  { pattern: /\bmechanical\b/i, phaseLabel: "Mechanicality" },
  { pattern: /\bh(a|a)bit\b/i, phaseLabel: "Mechanicality" },
  { pattern: /\bfree will\b/i, phaseLabel: "Mechanicality" },
  { pattern: /\bconditioning\b/i, phaseLabel: "Mechanicality" },
  { pattern: /\bnested agency\b/i, phaseLabel: "Nested Agency" },
  { pattern: /\bsubpersonalit(y|ies)\b/i, phaseLabel: "Nested Agency" },
  { pattern: /\binner critic\b/i, phaseLabel: "Nested Agency" },
  { pattern: /\bshadow\b/i, phaseLabel: "Nested Agency" },
  { pattern: /\bdiagnosis\b/i, phaseLabel: "Dashboard Diagnosis" },
  { pattern: /\bdashboard\b/i, phaseLabel: "Dashboard Diagnosis" },
  { pattern: /\bself.?surve(y|ey)\b/i, phaseLabel: "Dashboard Diagnosis" },
];

export function route(query: string): RouterResult {
  const q = query.trim();

  // 1. Check for phase keyword matches
  const matchedLabels = new Set<string>();
  for (const { pattern, phaseLabel } of PHASE_KEYWORDS) {
    if (pattern.test(q)) {
      matchedLabels.add(phaseLabel);
    }
  }

  // 2. Try full-text search in phase cache
  const searched = searchPhases(q);

  // Merge keyword matches with search results
  const seen = new Set<string>();
  const matchedPhases: PhaseCacheEntry[] = [];

  for (const label of matchedLabels) {
    const phase = getPhaseByLabel(label);
    if (phase && !seen.has(phase.id)) {
      matchedPhases.push(phase);
      seen.add(phase.id);
    }
  }

  for (const phase of searched) {
    if (!seen.has(phase.id)) {
      matchedPhases.push(phase);
      seen.add(phase.id);
    }
  }

  // 3. Determine depth
  const isDefinition = DEFINITION_PATTERNS.some((p) => p.test(q));
  const isDeep = DEEP_PATTERNS.some((p) => p.test(q));

  let depth: RouterDepth;
  if (isDeep && matchedPhases.length > 0) {
    depth = "deep";
  } else if (matchedPhases.length === 0) {
    depth = "deep"; // no clear match, go deep to find something
  } else if (isDefinition) {
    depth = "light";
  } else if (matchedPhases.length <= 2) {
    depth = "light";
  } else {
    depth = "deep";
  }

  return { depth, matchedPhases: matchedPhases.slice(0, 3) };
}
