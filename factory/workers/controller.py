"""
Platinum Factory Controller — Cloudflare Worker

Replaces the Python CLI controller with a Workers-backed API.
Job state in D1. LLM calls via AI Gateway / direct API.
Artifacts in R2.
"""

import json, os, math
from datetime import datetime
from typing import Optional

# ── STAGES ─────────────────────────────────────────

STAGES = [
    "pack_setup", "gold_study", "rhetorical_map", "visual_thesis",
    "motif_manufacturability", "storyboard", "storyboard_review",
    "pack_composition", "render_plan", "code_review",
    "draft_render", "visual_qc", "final_render",
]

STAGE_CONFIG = {
    "pack_setup": {"inputs": ["essay_path"], "outputs": ["pack_setup_report.json"], "max_retries": 1},
    "gold_study": {"inputs": ["essay_path"], "outputs": ["gold_signatures.json"], "max_retries": 2},
    "rhetorical_map": {"inputs": ["essay_path", "gold_signatures.json"], "outputs": ["rhetorical_map.json"], "max_retries": 2},
    "visual_thesis": {"inputs": ["rhetorical_map.json", "gold_signatures.json"], "outputs": ["visual_thesis.md", "visual_program.json"], "max_retries": 2},
    "motif_manufacturability": {"inputs": ["visual_program.json"], "outputs": ["motif_lint_report.json"], "max_retries": 3},
    "storyboard": {"inputs": ["rhetorical_map.json", "visual_thesis.md", "visual_program.json"], "outputs": ["storyboard.json"], "max_retries": 3},
    "storyboard_review": {"inputs": ["storyboard.json", "gold_signatures.json"], "outputs": ["storyboard_review.json"], "max_retries": 3},
    "pack_composition": {"inputs": ["storyboard.json", "storyboard_review.json", "visual_program.json"], "outputs": ["AGENT_KNOWLEDGE_DOSSIER.md", "STYLE_EVOLUTION.md", "PRODUCTION_BLUEPRINT.md"], "max_retries": 2},
    "render_plan": {"inputs": ["storyboard.json", "storyboard_review.json"], "outputs": ["render_plan.json"], "max_retries": 2},
    "code_review": {"inputs": ["render_plan.json"], "outputs": ["render_pack.py", "code_review.json"], "max_retries": 2},
    "draft_render": {"inputs": ["render_pack.py", "code_review.json"], "outputs": ["scenes/*.mp4"], "max_retries": 2},
    "visual_qc": {"inputs": ["scenes/*.mp4", "storyboard.json"], "outputs": ["visual_qc_report.json"], "max_retries": 3},
    "final_render": {"inputs": ["visual_qc_report.json"], "outputs": ["final.mp4", "alignment_report.json"], "max_retries": 1},
}

PROMPT_TEMPLATES = {
    "gold_study": "Study the gold/platinum packs and extract transferable principles.\nRead at least 4 packs (stones, kabbalah, malas, dvadasanta).\nOutput gold_signatures.json with: transferable_principles[], forbidden_to_copy[], techniques[].\nDo NOT include scene sequences, motif names, or shot counts.",
    "rhetorical_map": "Read the essay and extract transformations from each passage.\nFor each: passage_id, rhetorical_function, logical_relation, transformation {{subject, operator, object, through[]}}.\nKey question: what transformation does this passage assert?",
    "storyboard": "Build per-shot storyboard with CORRECT TIMING.\nEach shot must be 5-10 seconds. Average must be 5-8s.\nEvery shot needs: visual_audio_alignment.why_it_matches (>=2 sentences), concrete_motif with motif_id and drawable_parts, 3+ animation_phases.",
}


# ── VALIDATORS ─────────────────────────────────────

def validate_timing(shots: list, audio_dur: float, min_shots: int, max_shots: int) -> list:
    errors = []
    if len(shots) < min_shots:
        errors.append(f"Shot count {len(shots)} below min {min_shots}")
    if len(shots) > max_shots:
        errors.append(f"Shot count {len(shots)} exceeds max {max_shots}")
    durs = [s.get("duration_seconds", s.get("duration", 0)) for s in shots]
    durs = [d for d in durs if isinstance(d, (int, float)) and d > 0]
    if durs:
        avg = sum(durs) / len(durs)
        mx = max(durs)
        if avg > 11: errors.append(f"Average {avg:.1f}s > 11s max")
        if mx > 20: errors.append(f"Max {mx:.1f}s > 20s absolute max")
    return errors


def validate_storyboard_fields(shots: list) -> list:
    errors = []
    for s in shots:
        alignment = s.get("visual_audio_alignment", {})
        why = alignment.get("why_it_matches") or alignment.get("why_this_visual_matches") or ""
        if len(why) < 50:
            errors.append(f"Shot {s.get('shot_id','?')}: alignment too short")
        motif = s.get("concrete_motif", {})
        if isinstance(motif, dict):
            if len(motif.get("drawable_parts", [])) < 2:
                errors.append(f"Shot {s.get('shot_id','?')}: < 2 drawable parts")
    return errors


# ── HANDLER ────────────────────────────────────────

async def handle(request, env):
    path = request.path.rstrip("/")
    method = request.method

    cors = {"Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, OPTIONS"}

    if method == "OPTIONS":
        return Response("", status=204, headers=cors)

    # GET / — list stages
    if method == "GET" and path == "/":
        return Response(json.dumps({"service": "platinum-factory", "stages": STAGES}), headers={"Content-Type": "application/json", **cors})

    # POST /jobs — create job
    if method == "POST" and path == "/jobs":
        body = await request.json()
        slug = body["slug"]
        essay_path = body["essay_path"]

        # Estimate audio duration
        try:
            with open(essay_path) as f:
                wc = len(f.read().split())
        except:
            wc = 500
        audio_dur = (wc / 150) * 60
        min_shots = max(10, round(audio_dur / 9.0))
        max_shots = round(audio_dur / 4.0) + 10

        job = {
            "slug": slug,
            "essay_path": essay_path,
            "output_dir": f"content/publishing/renders/{slug}/v1",
            "production_mode": "film_pack",
            "est_audio_duration": round(audio_dur, 1),
            "recommended_shot_count": round(audio_dur / 6.5),
            "minimum_shot_count": min_shots,
            "maximum_shot_count": max_shots,
            "current_stage": "pack_setup",
            "status": "active",
            "created_at": datetime.utcnow().isoformat(),
        }

        # Save to D1
        await env.FACTORY_DB.prepare(
            "INSERT INTO jobs (slug, essay_path, output_dir, production_mode, est_audio_duration, recommended_shot_count, minimum_shot_count, maximum_shot_count, current_stage, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        ).bind(slug, essay_path, job["output_dir"], job["production_mode"], job["est_audio_duration"],
               job["recommended_shot_count"], job["minimum_shot_count"], job["maximum_shot_count"], "pack_setup", "active").run()

        return Response(json.dumps(job), headers={"Content-Type": "application/json", **cors})

    # GET /jobs — list all jobs
    if method == "GET" and path == "/jobs":
        rows = await env.FACTORY_DB.prepare("SELECT slug, current_stage, status, created_at FROM jobs ORDER BY created_at DESC").all()
        return Response(json.dumps({"jobs": [dict(r) for r in rows.results]}), headers={"Content-Type": "application/json", **cors})

    # GET /jobs/:slug — get job
    if path.startswith("/jobs/") and method == "GET":
        slug = path.split("/")[2]
        row = await env.FACTORY_DB.prepare("SELECT * FROM jobs WHERE slug = ?").bind(slug).first()
        if not row:
            return Response(json.dumps({"error": "not found"}), status=404, headers={"Content-Type": "application/json", **cors})
        return Response(json.dumps(dict(row)), headers={"Content-Type": "application/json", **cors})

    # POST /jobs/:slug/advance — advance stage
    if "/advance" in path and method == "POST":
        slug = path.split("/")[2]
        row = await env.FACTORY_DB.prepare("SELECT * FROM jobs WHERE slug = ?").bind(slug).first()
        if not row:
            return Response(json.dumps({"error": "not found"}), status=404, headers={"Content-Type": "application/json", **cors})

        job = dict(row)
        stage = job["current_stage"]
        
        if stage in ("complete", "failed"):
            return Response(json.dumps({"error": f"Job is {stage}"}), status=400, headers={"Content-Type": "application/json", **cors})

        # Record stage attempt
        await env.FACTORY_DB.prepare(
            "INSERT INTO stage_history (job_slug, stage, status, attempt) VALUES (?, ?, 'running', 1)"
        ).bind(slug, stage).run()

        # For now, return what stage would run
        return Response(json.dumps({
            "slug": slug,
            "current_stage": stage,
            "message": f"Stage {stage} ready. Use the Python controller or direct API to execute."
        }), headers={"Content-Type": "application/json", **cors})

    return Response(json.dumps({"error": "not found"}), status=404, headers={"Content-Type": "application/json", **cors})


# Wrangler entry point
async def on_fetch(request, env):
    return await handle(request, env)
