-- Platinum Factory — D1 Schema
-- One migration to rule them all.

-- ── JOBS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS jobs (
    slug TEXT PRIMARY KEY,
    essay_path TEXT NOT NULL,
    output_dir TEXT NOT NULL,
    production_mode TEXT NOT NULL DEFAULT 'film_pack',
    target_shot_duration REAL NOT NULL DEFAULT 6.5,
    est_audio_duration REAL,
    recommended_shot_count INTEGER,
    minimum_shot_count INTEGER,
    maximum_shot_count INTEGER,
    current_stage TEXT NOT NULL DEFAULT 'pack_setup',
    status TEXT NOT NULL DEFAULT 'active',  -- active | complete | failed | paused
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ── STAGE HISTORY ──────────────────────────────────
CREATE TABLE IF NOT EXISTS stage_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_slug TEXT NOT NULL REFERENCES jobs(slug),
    stage TEXT NOT NULL,
    status TEXT NOT NULL,  -- passed | failed | skipped
    attempt INTEGER NOT NULL DEFAULT 1,
    notes TEXT,
    timestamp TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ── SHOTS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS shots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_slug TEXT NOT NULL REFERENCES jobs(slug),
    shot_id TEXT NOT NULL,
    chapter TEXT,
    duration_seconds REAL,
    spoken_passage TEXT,
    visual_mode TEXT,
    motif_id TEXT,
    display_name TEXT,
    evidence_role TEXT,
    primary_medium TEXT DEFAULT 'pil',
    secondary_medium TEXT,
    continuity_object TEXT,
    text_required INTEGER DEFAULT 0,
    no_narration_test TEXT,
    status TEXT DEFAULT 'designed',  -- designed | approved | rendered | failed
    render_attempts INTEGER DEFAULT 0,
    qc_notes TEXT,
    UNIQUE(job_slug, shot_id)
);

-- ── ASSETS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS assets (
    asset_id TEXT PRIMARY KEY,
    r2_key TEXT NOT NULL,
    title TEXT,
    creator TEXT,
    date_start INTEGER,
    date_end INTEGER,
    region TEXT,
    tradition TEXT,
    object_type TEXT,
    subjects_json TEXT,
    repository TEXT,
    source_url TEXT,
    license TEXT,
    provenance_status TEXT,
    width INTEGER,
    height INTEGER,
    quality_score REAL,
    embedding_id TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS asset_tags (
    asset_id TEXT REFERENCES assets(asset_id),
    tag TEXT NOT NULL,
    PRIMARY KEY (asset_id, tag)
);

-- ── GOLD PACK SIGNATURES ──────────────────────────
CREATE TABLE IF NOT EXISTS gold_signatures (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pack_name TEXT NOT NULL,
    pack_type TEXT NOT NULL,
    shot_count INTEGER,
    principles_json TEXT,
    techniques_json TEXT,
    forbidden_copy_json TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ── SHOT RENDER OUTPUTS ───────────────────────────
CREATE TABLE IF NOT EXISTS render_outputs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_slug TEXT NOT NULL REFERENCES jobs(slug),
    shot_id TEXT NOT NULL,
    r2_key TEXT,
    duration_seconds REAL,
    file_size_bytes INTEGER,
    checksum TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ── QC RESULTS ────────────────────────────────────
CREATE TABLE IF NOT EXISTS qc_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_slug TEXT NOT NULL REFERENCES jobs(slug),
    qc_type TEXT NOT NULL,  -- silent_motion | repetition | provenance | technical
    passed INTEGER NOT NULL,
    failures_json TEXT,
    summary TEXT,
    reviewed_by TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ── PRODUCTION RULES (self-improving) ─────────────
CREATE TABLE IF NOT EXISTS production_rules (
    rule_id TEXT PRIMARY KEY,
    trigger TEXT NOT NULL,
    failure TEXT NOT NULL,
    correction TEXT NOT NULL,
    confidence REAL DEFAULT 0.0,
    observed_in_jobs INTEGER DEFAULT 1,
    successful_repairs INTEGER DEFAULT 0,
    status TEXT DEFAULT 'observation',  -- observation | candidate | heuristic | approved
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ── INDEXES ───────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_shots_job ON shots(job_slug);
CREATE INDEX IF NOT EXISTS idx_shots_status ON shots(status);
CREATE INDEX IF NOT EXISTS idx_stage_history_job ON stage_history(job_slug);
CREATE INDEX IF NOT EXISTS idx_assets_tradition ON assets(tradition);
CREATE INDEX IF NOT EXISTS idx_assets_object_type ON assets(object_type);
CREATE INDEX IF NOT EXISTS idx_qc_job ON qc_results(job_slug);
CREATE INDEX IF NOT EXISTS idx_asset_tags_tag ON asset_tags(tag);

-- ── RENDER TASKS ────────────────────────────────
CREATE TABLE IF NOT EXISTS render_tasks (
    task_id TEXT PRIMARY KEY,
    job_slug TEXT NOT NULL,
    stage TEXT NOT NULL,
    task_type TEXT NOT NULL,  -- draft_render | visual_qc | final_render
    renderer TEXT NOT NULL DEFAULT 'pil-custom-v1',
    status TEXT NOT NULL DEFAULT 'pending',  -- pending | claimed | rendering | completed | failed
    attempt INTEGER NOT NULL DEFAULT 1,
    input_manifest_json TEXT,
    output_manifest_json TEXT,
    claimed_by TEXT,
    claimed_at TEXT,
    heartbeat_at TEXT,
    completed_at TEXT,
    error_message TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS render_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id TEXT NOT NULL REFERENCES render_tasks(task_id),
    attempt INTEGER NOT NULL,
    status TEXT NOT NULL,
    worker_id TEXT,
    started_at TEXT,
    completed_at TEXT,
    output_json TEXT,
    error_message TEXT,
    UNIQUE(task_id, attempt)
);
