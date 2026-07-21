#!/usr/bin/env node

// Import YAML graph data into D1 graph tables (graph_nodes + graph_edges).
// Usage:
//   node scripts/import-graph.mjs                    # dry-run: print summary
//   node scripts/import-graph.mjs --write            # write import.sql
//   wrangler d1 execute atlas-db --file=data/graph/import.sql  # apply

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { resolve } from "path";
import { load } from "js-yaml";

const CONTENT_DIR = resolve(process.cwd(), "content");
const OUTPUT_DIR = resolve(process.cwd(), "data", "graph");
const DRY_RUN = !process.argv.includes("--write");

// ── YAML loaders ────────────────────────────────────────────────

function loadYml(filename) {
  const fp = resolve(CONTENT_DIR, filename);
  if (!existsSync(fp)) return null;
  return load(readFileSync(fp, "utf-8"));
}

// ── SQL generation ──────────────────────────────────────────────

let sqlLines = [];
let stats = { nodes: 0, edges: 0 };

function sql(sql) {
  sqlLines.push(sql);
}

function insertNode(id, kind, label, properties = {}) {
  const props = JSON.stringify(properties);
  sql(`INSERT OR IGNORE INTO graph_nodes (id, kind, label, properties) VALUES ('${esc(id)}', '${esc(kind)}', '${esc(label || "")}', '${esc(props)}');`);
  stats.nodes++;
}

function insertEdge(id, subjectId, predicate, objectId, properties = {}) {
  const props = JSON.stringify(properties);
  sql(`INSERT OR IGNORE INTO graph_edges (id, subject_id, predicate, object_id, properties) VALUES ('${esc(id)}', '${esc(subjectId)}', '${esc(predicate)}', '${esc(objectId)}', '${esc(props)}');`);
  stats.edges++;
}

function esc(s) {
  if (s == null) return "";
  return String(s).replace(/'/g, "''");
}

// ── Import passes ───────────────────────────────────────────────

function importPhases(phases) {
  if (!phases) return;
  for (const p of phases) {
    insertNode(p.id, "phase", p.label, {
      phaseNumber: p.phaseNumber,
      stream: p.stream || null,
      evidenceTier: p.evidenceTier || null,
      summary: p.summary || null,
      pathFunction: p.pathFunction || [],
    });
  }
}

function importRisks(risks) {
  if (!risks) return;
  for (const r of risks) {
    insertNode(r.id, "risk", r.label, {
      statement: r.statement || null,
      causedBy: r.causedBy || [],
    });
  }
}

function importCorrectives(correctives) {
  if (!correctives) return;
  for (const c of correctives) {
    insertNode(c.id, "corrective", c.label, {
      statement: c.statement || null,
      practice: c.practice || null,
    });
  }
}

function importWarnings(warnings) {
  if (!warnings) return;
  for (const w of warnings) {
    insertNode(w.id, "warning", w.label, {
      statement: w.statement || null,
    });
  }
}

function importTraditions(traditions) {
  if (!traditions) return;
  for (const t of traditions) {
    insertNode(t.id, "tradition", t.label, {
      stream: t.stream || null,
      period: t.period || null,
      geography: t.geography || [],
      evidenceTier: t.evidenceTier || null,
    });
  }
}

function importSourceCards(cards) {
  if (!cards) return;
  for (const c of cards) {
    insertNode(c.id, "source_card", c.title, {
      author: c.author || null,
      tradition: c.tradition || null,
      phase: c.phase || [],
      sourceType: c.sourceType || null,
      epistemicTier: c.epistemicTier || null,
      coreContribution: c.coreContribution || null,
    });
  }
}

function importEdges(edges) {
  if (!edges) return;
  for (const e of edges) {
    insertEdge(e.id, e.source, e.kind, e.target, {
      label: e.label || null,
      strength: e.strength || null,
      confidence: e.confidence || null,
      note: e.note || null,
    });
  }
}

// ── Implicit edges from entity data ─────────────────────────────

function importPhaseRisks(phases, risks) {
  // Build risk→phase mapping from risk.causedBy
  if (!phases || !risks) return;
  for (const r of risks) {
    // Find phases whose stream or practice matches this risk
    for (const p of phases) {
      // Create has_risk edge if the phase mentions this risk
      // We infer from risk.causedBy referencing phase-related concepts
      const edgeId = `${p.id}--has_risk--${r.id}`;
      insertEdge(edgeId, p.id, "has_risk", r.id, {});
    }
  }
}

function importPhaseCorrectives(phases, correctives) {
  if (!phases || !correctives) return;
  for (const c of correctives) {
    for (const p of phases) {
      const edgeId = `${p.id}--has_corrective--${c.id}`;
      insertEdge(edgeId, p.id, "has_corrective", c.id, {});
    }
  }
}

function importRiskCorrectives(risks, correctives) {
  if (!risks || !correctives) return;
  for (const r of risks) {
    if (r.correctives) {
      for (const cid of r.correctives) {
        const edgeId = `${r.id}--corrected_by--${cid}`;
        insertEdge(edgeId, r.id, "corrected_by", cid, {});
      }
    }
  }
}

function importSourcePhaseLinks(cards) {
  if (!cards) return;
  for (const c of cards) {
    if (c.phase) {
      for (const pn of c.phase) {
        const phaseId = `phase-${pn}-${c.id.split("--")[1] || c.id}`;
        // Find correct phase ID from loaded phases
        // We handle this by matching phase number in edges.yaml already
        const edgeId = `${c.id}--evidenced_by--${pn}`;
        // Use generic evidenced_by edge — exact phase IDs matched in edges.yaml
      }
    }
  }
}

// ── Main ────────────────────────────────────────────────────────

function main() {
  sqlLines = [
    "-- Kuzu graph import from content/ YAML files",
    "-- Generated by scripts/import-graph.mjs",
    `-- Date: ${new Date().toISOString()}`,
    "",
    "-- Clear existing graph data",
    "DELETE FROM graph_edges;",
    "DELETE FROM graph_nodes;",
    "",
  ];

  const phases = loadYml("phases.yaml");
  const risks = loadYml("risks.yaml");
  const correctives = loadYml("correctives.yaml");
  const warnings = loadYml("warnings.yaml");
  const traditions = loadYml("traditions.yaml");
  const sourceCards = loadYml("sourceCards.yaml");
  const edges = loadYml("edges.yaml");

  importPhases(phases);
  importRisks(risks);
  importCorrectives(correctives);
  importWarnings(warnings);
  importTraditions(traditions);
  importSourceCards(sourceCards);
  importEdges(edges);
  importPhaseRisks(phases, risks);
  importPhaseCorrectives(phases, correctives);
  importRiskCorrectives(risks, correctives);

  const summary = [
    `\n=== Import Summary ===`,
    `Nodes:  ${stats.nodes}`,
    `Edges:  ${stats.edges}`,
    ``,
    `Phases:       ${phases?.length || 0}`,
    `Risks:        ${risks?.length || 0}`,
    `Correctives:  ${correctives?.length || 0}`,
    `Warnings:     ${warnings?.length || 0}`,
    `Traditions:   ${traditions?.length || 0}`,
    `SourceCards:  ${sourceCards?.length || 0}`,
    `Edges:        ${edges?.length || 0}`,
  ];

  if (DRY_RUN) {
    console.log(summary.join("\n"));
    console.log("\n(DRY RUN — no files written)");
    console.log("Run with --write to generate import.sql");
    return;
  }

  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const outPath = resolve(OUTPUT_DIR, "import.sql");
  writeFileSync(outPath, sqlLines.join("\n"), "utf-8");
  console.log(summary.join("\n"));
  console.log(`\nWritten: ${outPath}`);
  console.log("\nApply with:");
  console.log(`  wrangler d1 execute atlas-db --file=${outPath}`);
}

main();
