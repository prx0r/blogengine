-- Re-Rendering Atlas — D1 Database Schema
-- Run: wrangler d1 execute atlas-db --file=src/atlas/db/schema.sql

-- ── Users ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL DEFAULT '',
  google_id TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'editor', 'admin')),
  settings JSON NOT NULL DEFAULT '{
    "atlasModeDefault": "atlas",
    "allowGlobalLearningFromChats": false,
    "allowGlobalLearningFromPrivateNotes": false,
    "allowFineTuneUse": false
  }',
  profile JSON NOT NULL DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS idx_users_google ON users(google_id);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL
);
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);

-- ── Chat sessions ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mode TEXT NOT NULL DEFAULT 'atlas' CHECK (mode IN ('atlas', 'guide')),
  title TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  visibility TEXT NOT NULL DEFAULT 'private'
);
CREATE INDEX idx_chat_sessions_user ON chat_sessions(user_id);

CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool')),
  content TEXT NOT NULL,
  tool_calls TEXT,
  tool_call_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  graph_packet_id TEXT,
  qa_record_id TEXT,
  privacy_class TEXT NOT NULL DEFAULT 'ordinary'
    CHECK (privacy_class IN ('ordinary', 'personal_practice', 'private_journal', 'sensitive', 'excluded_from_training'))
);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at);
CREATE INDEX idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_user ON chat_messages(user_id);

-- ── Q&A knowledge base ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS qa_records (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  normalized_claim TEXT,
  answer TEXT NOT NULL,
  mode TEXT NOT NULL DEFAULT 'atlas' CHECK (mode IN ('atlas', 'guide')),
  graph_path JSON DEFAULT '[]',
  source_cards JSON DEFAULT '[]',
  evidence_tier TEXT,
  risks JSON DEFAULT '[]',
  correctives JSON DEFAULT '[]',
  category_warnings JSON DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'generated'
    CHECK (status IN ('generated', 'user_liked', 'review_needed', 'approved', 'deprecated', 'contradicted')),
  feedback_score INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  approved_at TEXT,
  approved_by TEXT REFERENCES users(id)
);
CREATE INDEX idx_qa_status ON qa_records(status);
CREATE INDEX idx_qa_evidence_tier ON qa_records(evidence_tier);

CREATE TABLE IF NOT EXISTS qa_evaluations (
  id TEXT PRIMARY KEY,
  qa_record_id TEXT NOT NULL REFERENCES qa_records(id) ON DELETE CASCADE,
  correct_phase_placement INTEGER NOT NULL DEFAULT 0,
  relation_type_declared INTEGER NOT NULL DEFAULT 0,
  evidence_tier_declared INTEGER NOT NULL DEFAULT 0,
  no_fake_historical_influence INTEGER NOT NULL DEFAULT 0,
  risk_included INTEGER NOT NULL DEFAULT 0,
  corrective_included INTEGER NOT NULL DEFAULT 0,
  practice_included INTEGER NOT NULL DEFAULT 0,
  category_errors_avoided INTEGER NOT NULL DEFAULT 0,
  source_claims_supported INTEGER NOT NULL DEFAULT 0,
  speculative_claims_marked INTEGER NOT NULL DEFAULT 0,
  personal_privacy_respected INTEGER NOT NULL DEFAULT 0,
  overall TEXT NOT NULL CHECK (overall IN ('pass', 'needs_rewrite', 'human_review')),
  critique TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ── Journal / personal graph ─────────────────────────────────
CREATE TABLE IF NOT EXISTS journal_entries (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL DEFAULT 'journal_entry'
    CHECK (kind IN ('journal_entry', 'dream', 'practice_session', 'insight', 'question', 'symbol', 'risk_event', 'mood_pattern', 'book_note', 'ritual_note', 'guidance_hypothesis', 'progress_marker')),
  title TEXT,
  text TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT,
  visibility TEXT NOT NULL DEFAULT 'private'
);
CREATE INDEX idx_journal_user ON journal_entries(user_id);
CREATE INDEX idx_journal_kind ON journal_entries(kind);
CREATE INDEX idx_journal_created ON journal_entries(created_at);

CREATE TABLE IF NOT EXISTS personal_mappings (
  id TEXT PRIMARY KEY,
  journal_entry_id TEXT NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  global_phase TEXT,
  global_risk TEXT,
  global_practice TEXT,
  global_corrective TEXT,
  suggested_next_action TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  user_approved INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_mappings_entry ON personal_mappings(journal_entry_id);
CREATE INDEX idx_mappings_user ON personal_mappings(user_id);

-- ── Global learning candidates ───────────────────────────────
CREATE TABLE IF NOT EXISTS global_learning_candidates (
  id TEXT PRIMARY KEY,
  source_chat_message_ids JSON DEFAULT '[]',
  extracted_claim TEXT NOT NULL,
  normalized_claim TEXT,
  proposed_graph_path JSON DEFAULT '[]',
  proposed_source_cards JSON DEFAULT '[]',
  proposed_risks JSON DEFAULT '[]',
  proposed_correctives JSON DEFAULT '[]',
  anonymized_summary TEXT,
  raw_content_stored INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'generated'
    CHECK (status IN ('generated', 'review_needed', 'approved', 'rejected', 'deprecated')),
  approved_by TEXT REFERENCES users(id),
  approved_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_glc_status ON global_learning_candidates(status);

-- ── Fine-tuning examples ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS fine_tune_examples (
  id TEXT PRIMARY KEY,
  source_type TEXT NOT NULL CHECK (source_type IN ('approved_qa', 'approved_global_learning')),
  source_id TEXT NOT NULL,
  instruction TEXT NOT NULL,
  input_text TEXT NOT NULL,
  output_text TEXT NOT NULL,
  graph_path JSON DEFAULT '[]',
  evidence_tier TEXT,
  risks JSON DEFAULT '[]',
  correctives JSON DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'candidate'
    CHECK (status IN ('candidate', 'approved', 'exported', 'deprecated')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_fte_status ON fine_tune_examples(status);

-- ── Graph store (Kuzu-compatible abstraction over D1) ─────────
CREATE TABLE IF NOT EXISTS graph_nodes (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  label TEXT,
  properties JSON NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_graph_nodes_kind ON graph_nodes(kind);

CREATE TABLE IF NOT EXISTS graph_edges (
  id TEXT PRIMARY KEY,
  subject_id TEXT NOT NULL REFERENCES graph_nodes(id) ON DELETE CASCADE,
  predicate TEXT NOT NULL,
  object_id TEXT NOT NULL REFERENCES graph_nodes(id) ON DELETE CASCADE,
  properties JSON NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_graph_edges_subject ON graph_edges(subject_id);
CREATE INDEX idx_graph_edges_predicate ON graph_edges(predicate);
CREATE INDEX idx_graph_edges_object ON graph_edges(object_id);

-- ── Astrology daily snapshots ─────────────────────────────────
CREATE TABLE IF NOT EXISTS astrology_snapshots (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  date TEXT NOT NULL,
  packet_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_astro_snap_user ON astrology_snapshots(user_id);
CREATE INDEX idx_astro_snap_date ON astrology_snapshots(date);

-- ── Admin audit log ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  details JSON,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_audit_created ON audit_log(created_at);
CREATE INDEX idx_audit_user ON audit_log(user_id);
