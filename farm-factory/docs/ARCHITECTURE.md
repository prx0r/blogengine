# Farm Factory — Complete Cloudflare Content System

## Architecture

```
Hermes Conductor (cognitive controller)
  │  chooses topics, approves production, updates strategy
  │  runs as Worker + CLI interface
  ▼
┌──────────────────────────────┐
│      Farm Instance           │  ← One per niche/channel
│                              │
│  D1: ro_store, po_store,     │
│      ho_store, work_store,   │
│      essay_store, gap_map,   │
│      feature_store           │
│                              │
│  R2: sources, assets,        │
│      outputs, art, audio     │
│                              │
│  Cron: daily_research,       │
│        weekly_gap,           │
│        monthly_rebuild       │
│                              │
│  Workflows: produce_video,   │
│             backfill_ros,    │
│             validate_all     │
│                              │
│  Queues: pipeline_ingest,    │
│          render_jobs         │
└──────────────────────────────┘
```

## Object Model

| Object | Storage | Purpose |
|--------|---------|---------|
| **Work** | D1 + R2 (PDF text) | Raw source converted to structured metadata |
| **RO** (Research Object) | D1 + R2 (passages) | Compiled knowledge around one question |
| **PO** (Philosopher Object) | D1 + R2 (art, quotes) | Philosopher as reusable content asset |
| **HO** (Hypothesis Object) | D1 | Testable claim from signal system |
| **Essay** | D1 + R2 (body) | Voice-tagged consumer-facing document |
| **Storyboard** | D1 | Timed video segments |
| **Video** | D1 + R2 (assets) | Published video metadata + assets |

## Farm Template

A farm is one Workers project with D1, R2, Queue, Cron, and AI bindings. Parameterized by `FARM_ID`. Clone for any niche.
