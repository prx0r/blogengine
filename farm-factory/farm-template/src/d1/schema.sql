-- Farm Factory D1 Schema
-- All tables required for one farm instance.
-- Prefixed with farm_id to allow multi-tenant in single DB if needed,
-- but best practice is one D1 database per farm.

-- ============================================================
-- WORKS (raw sources converted to structured metadata)
-- ============================================================
CREATE TABLE IF NOT EXISTS works (
  work_id TEXT PRIMARY KEY,
  farm_id TEXT NOT NULL,
  title TEXT NOT NULL,
  authors JSON DEFAULT '[]',
  publication_year INTEGER,
  publication_type TEXT,
  language TEXT DEFAULT 'en',
  tier INTEGER DEFAULT 2,
  topics JSON DEFAULT '[]',
  tradition JSON DEFAULT '[]',
  abstract TEXT DEFAULT '',
  body_clean TEXT DEFAULT '',
  pdf_path TEXT,
  source_url TEXT,
  quality_score REAL DEFAULT 0.0,
  commentary_on JSON DEFAULT '{}',
  scholarly_contribution JSON DEFAULT '{}',
  concepts JSON DEFAULT '[]',
  relevance_to_ros JSON DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- RESEARCH OBJECTS (compiled knowledge around one question)
-- ============================================================
CREATE TABLE IF NOT EXISTS research_objects (
  ro_id TEXT PRIMARY KEY,
  farm_id TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  family TEXT NOT NULL,
  status TEXT DEFAULT 'idea',
  version TEXT DEFAULT '0.1.0',
  schema_version INTEGER DEFAULT 2,
  one_line TEXT,
  scope TEXT,
  traditions JSON DEFAULT '[]',
  passage_count INTEGER DEFAULT 0,
  coverage JSON DEFAULT '{}',
  dependencies JSON DEFAULT '[]',
  issues JSON DEFAULT '[]',
  outputs JSON DEFAULT '[]',
  sources JSON DEFAULT '[]',
  timeline JSON DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- PASSAGES (stored in R2 as ros/{ro_id}/passages.json)
-- This table indexes passage metadata for search
-- ============================================================
CREATE TABLE IF NOT EXISTS passages (
  passage_id TEXT PRIMARY KEY,
  ro_id TEXT NOT NULL,
  farm_id TEXT NOT NULL,
  section TEXT,
  subsection TEXT,
  kind TEXT DEFAULT 'source',
  source_id TEXT,
  page_ref TEXT,
  topics JSON DEFAULT '[]',
  word_count INTEGER DEFAULT 0,
  FOREIGN KEY (ro_id) REFERENCES research_objects(ro_id)
);

-- ============================================================
-- PHILOSOPHER OBJECTS (philosopher as content asset)
-- ============================================================
CREATE TABLE IF NOT EXISTS philosopher_objects (
  po_id TEXT PRIMARY KEY,
  farm_id TEXT NOT NULL,
  name TEXT NOT NULL,
  era TEXT,
  tradition TEXT,
  traditions JSON DEFAULT '[]',
  metaphysics_summary TEXT,
  key_terms JSON DEFAULT '[]',
  core_claim TEXT,
  signature_ideas JSON DEFAULT '[]',
  art_ids JSON DEFAULT '[]',
  quote_ids JSON DEFAULT '[]',
  primary_sources JSON DEFAULT '[]',
  affinities JSON DEFAULT '[]',
  scenarios JSON DEFAULT '[]',
  pipeline_ready INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- HYPOTHESIS OBJECTS (testable content claims)
-- ============================================================
CREATE TABLE IF NOT EXISTS hypothesis_objects (
  ho_id TEXT PRIMARY KEY,
  farm_id TEXT NOT NULL,
  created TEXT NOT NULL,
  signal_source TEXT,
  signal_confidence REAL DEFAULT 0.0,
  hypothesis TEXT NOT NULL,
  reasoning JSON DEFAULT '[]',
  content_spec JSON DEFAULT '{}',
  status TEXT DEFAULT 'proposed',
  published_date TEXT,
  performance JSON,
  validated INTEGER,
  implications JSON DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- ESSAYS (consumer-facing documents)
-- ============================================================
CREATE TABLE IF NOT EXISTS essays (
  essay_id TEXT PRIMARY KEY,
  farm_id TEXT NOT NULL,
  title TEXT NOT NULL,
  ro_id TEXT,
  status TEXT DEFAULT 'draft',
  body_key TEXT,
  word_count INTEGER DEFAULT 0,
  source_ratio REAL DEFAULT 0.0,
  audio_urls JSON DEFAULT '[]',
  validation_gates JSON DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (ro_id) REFERENCES research_objects(ro_id)
);

-- ============================================================
-- STORYBOARDS (timed video segments)
-- ============================================================
CREATE TABLE IF NOT EXISTS storyboards (
  storyboard_id TEXT PRIMARY KEY,
  farm_id TEXT NOT NULL,
  essay_id TEXT,
  segments JSON DEFAULT '[]',
  total_duration_s INTEGER DEFAULT 0,
  validation_gates JSON DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (essay_id) REFERENCES essays(essay_id)
);

-- ============================================================
-- VIDEO OBJECTS (published videos)
-- ============================================================
CREATE TABLE IF NOT EXISTS video_objects (
  video_id TEXT PRIMARY KEY,
  farm_id TEXT NOT NULL,
  youtube_id TEXT,
  title TEXT NOT NULL,
  storyboard_id TEXT,
  thumbnail_urls JSON DEFAULT '[]',
  r2_assets JSON DEFAULT '{}',
  market_data JSON DEFAULT '{}',
  hypothesis_ids JSON DEFAULT '[]',
  published_at TEXT,
  metrics JSON DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (storyboard_id) REFERENCES storyboards(storyboard_id)
);

-- ============================================================
-- CHANNELS (YouTube channels tracked by research)
-- ============================================================
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

-- ============================================================
-- GAP MAP (search query gap analysis)
-- ============================================================
CREATE TABLE IF NOT EXISTS gap_map (
  query TEXT NOT NULL,
  farm_id TEXT NOT NULL,
  topic_cluster TEXT,
  snapshot_date TEXT NOT NULL,
  gap_score REAL,
  language_lag_score REAL,
  in_channel_count INTEGER DEFAULT 0,
  us_channel_count INTEGER DEFAULT 0,
  uk_channel_count INTEGER DEFAULT 0,
  opportunity_score REAL,
  PRIMARY KEY (query, snapshot_date)
);

-- ============================================================
-- FEATURE STORE (per-video features for ML)
-- ============================================================
CREATE TABLE IF NOT EXISTS feature_store (
  video_id TEXT NOT NULL,
  farm_id TEXT NOT NULL,
  snapshot_date TEXT NOT NULL,
  channel_id TEXT,
  published_at TEXT,
  breakout_score REAL,
  is_breakout INTEGER,
  title_length INTEGER,
  has_question INTEGER DEFAULT 0,
  has_colon INTEGER DEFAULT 0,
  starts_with_number INTEGER DEFAULT 0,
  power_word_count INTEGER DEFAULT 0,
  has_direct_address INTEGER DEFAULT 0,
  has_curiosity_gap INTEGER DEFAULT 0,
  thumbnail_composition TEXT,
  thumbnail_warmth TEXT,
  thumbnail_has_face INTEGER DEFAULT 0,
  thumbnail_expression TEXT,
  thumbnail_style TEXT,
  thumbnail_brightness TEXT,
  hook_type TEXT,
  gap_score REAL,
  language_lag_score REAL,
  duration_seconds INTEGER DEFAULT 0,
  channel_subs INTEGER DEFAULT 0,
  competitor_type TEXT,
  topic_cluster TEXT,
  PRIMARY KEY (video_id, snapshot_date)
);

-- ============================================================
-- HYPOTHESIS RESULTS (testing against historical corpus)
-- ============================================================
CREATE TABLE IF NOT EXISTS hypothesis_results (
  hypothesis TEXT NOT NULL,
  farm_id TEXT NOT NULL,
  test_source TEXT NOT NULL,  -- historical_corpus or own_production
  n_tests INTEGER DEFAULT 0,
  n_supporting INTEGER DEFAULT 0,
  n_against INTEGER DEFAULT 0,
  effect_size REAL,
  p_value REAL,
  status TEXT DEFAULT 'pending',  -- pending, confirmed, rejected
  evidence_direction TEXT,  -- which side the evidence favors
  last_tested TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (hypothesis, test_source)
);

-- ============================================================
-- API USAGE LOG
-- ============================================================
CREATE TABLE IF NOT EXISTS api_usage (
  date TEXT NOT NULL,
  farm_id TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  calls INTEGER DEFAULT 0,
  bucket TEXT,
  daily_limit INTEGER,
  remaining INTEGER,
  PRIMARY KEY (date, endpoint)
);

-- ============================================================
-- FACT CHECK LOG
-- ============================================================
CREATE TABLE IF NOT EXISTS fact_checks (
  check_id TEXT PRIMARY KEY,
  farm_id TEXT NOT NULL,
  claim TEXT NOT NULL,
  source TEXT,
  certainty TEXT,  -- confirmed, scholarly_consensus, traditional_account, disputed
  checked_by TEXT,
  checked_date TEXT NOT NULL DEFAULT (datetime('now')),
  status TEXT DEFAULT 'pending',  -- pending, verified, unverified, disputed
  notes TEXT
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_ro_farm ON research_objects(farm_id);
CREATE INDEX IF NOT EXISTS idx_essay_ro ON essays(ro_id);
CREATE INDEX IF NOT EXISTS idx_storyboard_essay ON storyboards(essay_id);
CREATE INDEX IF NOT EXISTS idx_video_storyboard ON video_objects(storyboard_id);
CREATE INDEX IF NOT EXISTS idx_gap_date ON gap_map(snapshot_date);
CREATE INDEX IF NOT EXISTS idx_feature_date ON feature_store(snapshot_date);
CREATE INDEX IF NOT EXISTS idx_hypothesis_status ON hypothesis_objects(status);
CREATE INDEX IF NOT EXISTS idx_passages_ro ON passages(ro_id);
