#!/usr/bin/env tsx
/**
 * Store pipeline data — separate D1 database for training records.
 * Schema is defined in training_pipeline.md.
 * 
 * Uses SQLite locally for development, D1 in production.
 */
import type { PipelineSubject, TrainingRecord, ActivationRecord } from "./types";

// Dynamic import for SQLite — only used in pipeline, not in main engine
let db: any = null;

async function getDb(): Promise<any> {
  if (db) return db;
  // Use better-sqlite3 for local development
  try {
    const Database = (await import("better-sqlite3")).default;
    db = new Database("pipeline_data.db");
    db.pragma("journal_mode = WAL");
    await initSchema(db);
    return db;
  } catch {
    // Fallback: in-memory JSON store for testing without SQLite
    db = new JsonStore();
    return db;
  }
}

async function initSchema(db: any): Promise<void> {
  db.exec(`
    CREATE TABLE IF NOT EXISTS pipeline_subjects (
      id TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      birth_date TEXT NOT NULL,
      birth_lat REAL,
      birth_lon REAL,
      birth_place_name TEXT,
      death_date TEXT,
      occupations TEXT NOT NULL,
      domain TEXT NOT NULL,
      chart_json TEXT,
      oikodespotes_planet TEXT,
      oikodespotes_score REAL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS pipeline_activation_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject_id TEXT NOT NULL REFERENCES pipeline_subjects(id),
      target_date TEXT NOT NULL,
      date_type TEXT NOT NULL,
      saturn_confidence TEXT,
      saturn_score REAL,
      mars_confidence TEXT,
      mars_score REAL,
      house_8_active INTEGER,
      packet_json TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_pipe_subj_domain ON pipeline_subjects(domain);
    CREATE INDEX IF NOT EXISTS idx_pipe_act_subj ON pipeline_activation_records(subject_id);
  `);
}

// In-memory JSON store for testing
class JsonStore {
  subjects: PipelineSubject[] = [];
  activations: ActivationRecord[] = [];

  exec() {}
  prepare(sql: string) {
    return {
      run: (...params: any[]) => {
        if (sql.includes("INSERT INTO pipeline_subjects")) {
          this.subjects.push({
            id: params[0], label: params[1], birthDate: params[2],
            birthLat: params[3], birthLon: params[4],
            birthPlaceName: params[5], deathDate: params[6],
            occupations: JSON.parse(params[7] || "[]"),
            domain: params[8],
          });
        }
      },
      get: (...params: any[]) => undefined,
      all: (...params: any[]) => [],
    };
  }
}

export async function insertSubject(subject: PipelineSubject): Promise<void> {
  const d = await getDb();
  d.prepare(`
    INSERT OR REPLACE INTO pipeline_subjects
    (id, label, birth_date, birth_lat, birth_lon, birth_place_name, death_date, occupations, domain)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    subject.id, subject.label, subject.birthDate,
    subject.birthLat ?? null, subject.birthLon ?? null,
    subject.birthPlaceName ?? null, subject.deathDate ?? null,
    JSON.stringify(subject.occupations), subject.domain,
  );
}

export async function insertSubjects(subjects: PipelineSubject[]): Promise<void> {
  const d = await getDb();
  const insert = d.prepare(`
    INSERT OR REPLACE INTO pipeline_subjects
    (id, label, birth_date, birth_lat, birth_lon, birth_place_name, death_date, occupations, domain)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const tx = d.transaction((items: PipelineSubject[]) => {
    for (const s of items) {
      insert.run(s.id, s.label, s.birthDate, s.birthLat ?? null, s.birthLon ?? null,
        s.birthPlaceName ?? null, s.deathDate ?? null, JSON.stringify(s.occupations), s.domain);
    }
  });
  tx(subjects);
}

export async function getSubjectsByDomain(domain: string): Promise<PipelineSubject[]> {
  const d = await getDb();
  const rows = d.prepare("SELECT * FROM pipeline_subjects WHERE domain = ?").all(domain);
  return rows.map((r: any) => ({
    id: r.id, label: r.label, birthDate: r.birth_date,
    birthLat: r.birth_lat, birthLon: r.birth_lon,
    birthPlaceName: r.birth_place_name, deathDate: r.death_date,
    occupations: JSON.parse(r.occupations || "[]"),
    domain: r.domain,
  }));
}

export async function getSubjectById(id: string): Promise<PipelineSubject | undefined> {
  const d = await getDb();
  const r = d.prepare("SELECT * FROM pipeline_subjects WHERE id = ?").get(id);
  if (!r) return undefined;
  return {
    id: r.id, label: r.label, birthDate: r.birth_date,
    birthLat: r.birth_lat, birthLon: r.birth_lon,
    birthPlaceName: r.birth_place_name, deathDate: r.death_date,
    occupations: JSON.parse(r.occupations || "[]"),
    domain: r.domain,
  };
}

export async function getSubjectCount(): Promise<number> {
  const d = await getDb();
  const r = d.prepare("SELECT COUNT(*) as c FROM pipeline_subjects").get();
  return r?.c || 0;
}

export async function insertActivationRecord(subjectId: string, date: string, dateType: string,
  saturnConf: string, saturnScore: number, marsConf: string, marsScore: number,
  house8Active: boolean, packetJson?: string): Promise<void> {
  const d = await getDb();
  d.prepare(`
    INSERT INTO pipeline_activation_records
    (subject_id, target_date, date_type, saturn_confidence, saturn_score,
     mars_confidence, mars_score, house_8_active, packet_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(subjectId, date, dateType, saturnConf, saturnScore, marsConf, marsScore,
    house8Active ? 1 : 0, packetJson ?? null);
}

export async function closeDb(): Promise<void> {
  if (db && typeof db.close === "function") {
    db.close();
  }
}
