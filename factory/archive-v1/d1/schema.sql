CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  essay_id TEXT NOT NULL,
  title TEXT,
  channel TEXT DEFAULT 'Tantra Files',
  status TEXT DEFAULT 'draft',
  version INTEGER DEFAULT 1,
  mp4_key TEXT,
  duration_seconds REAL DEFAULT 0,
  essay_path TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS shots (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  label TEXT NOT NULL,
  rhetorical_function TEXT,
  visual_treatment TEXT,
  duration_seconds REAL DEFAULT 0,
  mp4_key TEXT,
  status TEXT DEFAULT 'pending',
  narration_text TEXT,
  feedback_count INTEGER DEFAULT 0,
  FOREIGN KEY (job_id) REFERENCES jobs(id)
);

CREATE TABLE IF NOT EXISTS feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id TEXT NOT NULL,
  shot_id TEXT,
  author TEXT DEFAULT 'Thomas',
  rating INTEGER,
  dimension TEXT,
  comment TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (job_id) REFERENCES jobs(id)
);

CREATE TABLE IF NOT EXISTS gold_standards (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  source_job_id TEXT,
  shot_count INTEGER,
  avg_shot_duration REAL,
  bpm REAL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS scenes (
  id TEXT PRIMARY KEY,
  pack TEXT,
  title TEXT,
  rhetorical_functions TEXT,
  visual_treatment TEXT,
  duration_seconds REAL,
  concepts TEXT,
  primitives TEXT,
  render_capabilities TEXT,
  status TEXT DEFAULT 'unreviewed',
  thumbnail_key TEXT
);
