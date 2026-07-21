#!/usr/bin/env tsx
/**
 * Validate spellbook entries — check for completeness, correctness.
 * Usage: npx tsx src/astrology/spellbook/validate.ts
 */
import type { SpellEntry } from "./types";
import { SPELLBOOK } from "./spellbook";

interface ValidationResult {
  total: number;
  valid: number;
  issues: Array<{ id: string; field: string; message: string }>;
  bySource: Record<string, number>;
  bySafety: Record<string, number>;
  byType: Record<string, number>;
  byPlanet: Record<string, number>;
}

function validate(): ValidationResult {
  const issues: ValidationResult["issues"] = [];
  const bySource: Record<string, number> = {};
  const bySafety: Record<string, number> = {};
  const byType: Record<string, number> = {};
  const byPlanet: Record<string, number> = {};

  for (const entry of SPELLBOOK) {
    // Collect stats
    bySource[entry.source] = (bySource[entry.source] || 0) + 1;
    bySafety[entry.safety] = (bySafety[entry.safety] || 0) + 1;
    byType[entry.type] = (byType[entry.type] || 0) + 1;
    for (const p of entry.planets) byPlanet[p] = (byPlanet[p] || 0) + 1;

    // Validate required fields
    if (!entry.id) issues.push({ id: entry.id, field: "id", message: "Missing id" });
    if (!entry.title) issues.push({ id: entry.id, field: "title", message: "Missing title" });
    if (!entry.summary) issues.push({ id: entry.id, field: "summary", message: "Missing summary" });
    if (!entry.procedure || entry.procedure.length === 0) {
      issues.push({ id: entry.id, field: "procedure", message: "No procedure steps" });
    }
    if (!entry.safeAdaptations || entry.safeAdaptations.length === 0) {
      issues.push({ id: entry.id, field: "safeAdaptations", message: "No safe adaptations" });
    }
    if (!entry.source) issues.push({ id: entry.id, field: "source", message: "Missing source" });
    if (!entry.purpose || entry.purpose.length === 0) {
      issues.push({ id: entry.id, field: "purpose", message: "No purpose defined" });
    }
    if (!entry.triggers || entry.triggers.length === 0) {
      issues.push({ id: entry.id, field: "triggers", message: "No triggers for state-based matching" });
    }

    // Validate ID format
    if (entry.id && !/^[a-z]+:[a-z]+:[a-z0-9]+$/.test(entry.id)) {
      issues.push({ id: entry.id, field: "id", message: "ID format should be source:type:domain" });
    }

    // Validate planet ID format if present
    for (const p of entry.planets) {
      if (!p.startsWith("planet:")) {
        issues.push({ id: entry.id, field: "planets", message: `"${p}" should use format planet:mars` });
      }
    }
    for (const s of entry.signs || []) {
      if (!s.startsWith("sign:")) {
        issues.push({ id: entry.id, field: "signs", message: `"${s}" should use format sign:leo` });
      }
    }
  }

  return {
    total: SPELLBOOK.length,
    valid: SPELLBOOK.length - new Set(issues.map(i => i.id)).size,
    issues,
    bySource,
    bySafety,
    byType,
    byPlanet,
  };
}

// Run
const result = validate();
console.log("\n=== SPELLBOOK VALIDATION ===\n");
console.log(`Total entries: ${result.total}`);
console.log(`Valid entries: ${result.valid}/${result.total}`);
console.log(`Issues found: ${result.issues.length}`);
console.log("");

if (result.issues.length > 0) {
  console.log("Issues:");
  for (const issue of result.issues) {
    console.log(`  [${issue.id}] ${issue.field}: ${issue.message}`);
  }
  console.log("");
}

console.log("By source:");
for (const [source, count] of Object.entries(result.bySource).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${source}: ${count}`);
}
console.log("");
console.log("By safety:");
for (const [safety, count] of Object.entries(result.bySafety)) {
  console.log(`  ${safety}: ${count}`);
}
console.log("");
console.log("By type:");
for (const [type, count] of Object.entries(result.byType).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${type}: ${count}`);
}
console.log("");
console.log("By planet:");
for (const [planet, count] of Object.entries(result.byPlanet).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${planet.replace("planet:", "")}: ${count}`);
}

console.log("\n" + (result.issues.length === 0 ? "✅ ALL VALID" : `❌ ${result.issues.length} issues to fix`));
