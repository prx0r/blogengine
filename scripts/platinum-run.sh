#!/bin/bash
# Platinum Factory — Full Run Log
# Usage: ./scripts/platinum-run.sh <slug> <essay-path>
# Logs everything to factory/runs/<slug>-<timestamp>.log

set -e

SLUG="${1:-run-$(date +%s)}"
ESSAY="${2:-scripts/expansion-essay33.md}"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
LOGDIR="factory/runs"
LOGFILE="$LOGDIR/$SLUG-$TIMESTAMP.log"
CONTROLLER="python3 factory/controllers/platinum_controller.py"

mkdir -p "$LOGDIR"

# ── Log Header ────────────────────────────────────
{
  echo "============================================"
  echo " Platinum Factory Run Log"
  echo "============================================"
  echo " Slug:      $SLUG"
  echo " Essay:     $ESSAY"
  echo " Started:   $(date -u '+%Y-%m-%dT%H:%M:%SZ')"
  echo " Controller: $CONTROLLER"
  echo " Stages:    13"
  echo "============================================"
  echo ""
} | tee "$LOGFILE"

# ── Create Job ────────────────────────────────────
echo ">>> STAGE 0: Create Job" | tee -a "$LOGFILE"
START=$(date +%s)
$CONTROLLER new --slug "$SLUG" --essay "$ESSAY" --output "content/publishing/renders/$SLUG/v1" 2>&1 | tee -a "$LOGFILE"
echo "Duration: $(($(date +%s)-START))s" | tee -a "$LOGFILE"
echo "" | tee -a "$LOGFILE"

# ── Stage List ────────────────────────────────────
STAGES=("pack_setup" "gold_study" "rhetorical_map" "visual_thesis"
        "motif_manufacturability" "storyboard" "storyboard_review"
        "pack_composition" "render_plan" "code_review"
        "draft_render" "visual_qc" "final_render")

TOTAL_START=$(date +%s)
STAGE_NUM=1

for STAGE in "${STAGES[@]}"; do
  echo ">>> STAGE $STAGE_NUM/13: $STAGE" | tee -a "$LOGFILE"
  STAGE_START=$(date +%s)
  
  # Run the stage
  $CONTROLLER advance --slug "$SLUG" 2>&1 | tee -a "$LOGFILE"
  
  STAGE_DUR=$(($(date +%s)-STAGE_START))
  echo "Duration: ${STAGE_DUR}s" | tee -a "$LOGFILE"
  echo "" | tee -a "$LOGFILE"
  
  STAGE_NUM=$((STAGE_NUM + 1))
done

# ── Summary ───────────────────────────────────────
TOTAL_DUR=$(($(date +%s)-TOTAL_START))
{
  echo "============================================"
  echo " Run Complete"
  echo " Finished:  $(date -u '+%Y-%m-%dT%H:%M:%SZ')"
  echo " Total time: ${TOTAL_DUR}s ($(($TOTAL_DUR/60))m $(($TOTAL_DUR%60))s)"
  echo " Log:       $LOGFILE"
  echo " Output:    content/publishing/renders/$SLUG/v1/"
  echo "============================================"
} | tee -a "$LOGFILE"

echo ""
echo "📋 Log saved to: $LOGFILE"
