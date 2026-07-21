-- farm-template/src/d1/schema.sql
-- Agnostic farm database. No niche-specific tables.

CREATE TABLE IF NOT EXISTS channels (
  channel_id TEXT PRIMARY KEY,
  farm_id TEXT NOT NULL,
  name TEXT NOT NULL,
  subscriber_count INTEGER DEFAULT 0,
  video_count INTEGER DEFAULT 0,
  country TEXT,
  language TEXT DEFAULT 'en',
  competitor_type TEXT DEFAULT 'direct',
  region_visibility TEXT,
  added_date TEXT NOT NULL DEFAULT (datetime('now')),
  last_scanned TEXT
);

CREATE TABLE IF NOT EXISTS videos (
  video_id TEXT NOT NULL,
  farm_id TEXT NOT NULL,
  channel_id TEXT,
  snapshot_date TEXT NOT NULL,
  published_at TEXT,
  title TEXT,
  duration_seconds INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  breakout_score REAL,
  title_length INTEGER,
  has_question INTEGER DEFAULT 0,
  has_colon INTEGER DEFAULT 0,
  power_word_count INTEGER DEFAULT 0,
  thumbnail_composition TEXT,
  thumbnail_warmth TEXT,
  thumbnail_has_face INTEGER DEFAULT 0,
  thumbnail_expression TEXT,
  hook_type TEXT,
  gap_score REAL,
  PRIMARY KEY (video_id, snapshot_date)
);

CREATE TABLE IF NOT EXISTS gap_map (
  query TEXT NOT NULL,
  farm_id TEXT NOT NULL,
  topic_cluster TEXT,
  snapshot_date TEXT NOT NULL,
  gap_score REAL,
  in_channel_count INTEGER DEFAULT 0,
  us_channel_count INTEGER DEFAULT 0,
  uk_channel_count INTEGER DEFAULT 0,
  opportunity_score REAL,
  PRIMARY KEY (query, snapshot_date)
);

CREATE TABLE IF NOT EXISTS hypothesis_objects (
  ho_id TEXT PRIMARY KEY,
  farm_id TEXT NOT NULL,
  hypothesis TEXT NOT NULL,
  status TEXT DEFAULT 'proposed',
  n_tests INTEGER DEFAULT 0,
  n_supporting INTEGER DEFAULT 0,
  n_against INTEGER DEFAULT 0,
  evidence_direction TEXT,
  content_spec JSON DEFAULT '{}',
  published_date TEXT,
  performance JSON,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS pipeline_stages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  farm_id TEXT NOT NULL,
  workflow_id TEXT,
  stage TEXT NOT NULL,
  item_summary TEXT,
  status TEXT DEFAULT 'running',
  started_at TEXT,
  completed_at TEXT,
  error TEXT
);

CREATE TABLE IF NOT EXISTS fact_checks (
  check_id TEXT PRIMARY KEY,
  farm_id TEXT NOT NULL,
  claim TEXT NOT NULL,
  source TEXT,
  certainty TEXT,
  status TEXT DEFAULT 'pending',
  checked_date TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS api_usage (
  date TEXT NOT NULL,
  farm_id TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  calls INTEGER DEFAULT 0,
  bucket TEXT,
  PRIMARY KEY (date, endpoint)
);

CREATE INDEX IF NOT EXISTS idx_videos_channel ON videos(channel_id);
CREATE INDEX IF NOT EXISTS idx_gap_date ON gap_map(snapshot_date);
CREATE INDEX IF NOT EXISTS idx_hypothesis_status ON hypothesis_objects(status);
CREATE INDEX IF NOT EXISTS idx_pipeline_farm ON pipeline_stages(farm_id);
