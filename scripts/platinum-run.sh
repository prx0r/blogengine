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
API="https://platinum-factory.tradesprior.workers.dev"
# Uses Cloudflare Worker API (correct system), not Python controller

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

# ── Create Job via Worker API ─────────────────────
echo ">>> STAGE 0: Create Job" | tee -a "$LOGFILE"
START=$(date +%s)
ESSAY_TEXT=$(cat "$ESSAY" 2>/dev/null || echo "Essay text not found")
curl -s -X POST "$API/jobs" \
  -H "Content-Type: application/json" \
  -d "$(python3 -c "import json; print(json.dumps({'slug':'$SLUG','essay_text':'''$ESSAY_TEXT'''}))")" 2>&1 | tee -a "$LOGFILE"
echo "Duration: $(($(date +%s)-START))s" | tee -a "$LOGFILE"
echo "" | tee -a "$LOGFILE"

# ── Stage List ────────────────────────────────────
STAGES=("pack_setup" "gold_study" "rhetorical_map" "visual_thesis"
        "motif_manufacturability" "storyboard" "storyboard_review"
        "pack_composition" "code_review"
        "draft_render" "visual_qc" "final_render")

TOTAL_START=$(date +%s)
STAGE_NUM=1

for STAGE in "${STAGES[@]}"; do
  echo ">>> STAGE $STAGE_NUM/12: $STAGE" | tee -a "$LOGFILE"
  STAGE_START=$(date +%s)

  # Run the stage via Worker API
  RESPONSE=$(curl -s -X POST "$API/advance" \
    -H "Content-Type: application/json" \
    -d "{\"slug\":\"$SLUG\"}" 2>&1)
  
  echo "$RESPONSE" | tee -a "$LOGFILE"
  
  # Check result
  STATUS=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('result','ERROR'))" 2>/dev/null)
  
  STAGE_DUR=$(($(date +%s)-STAGE_START))
  echo "Duration: ${STAGE_DUR}s | Result: $STATUS" | tee -a "$LOGFILE"
  echo "" | tee -a "$LOGFILE"
  
  if [ "$STATUS" != "passed" ]; then
    echo "✗ Stage $STAGE failed. Aborting." | tee -a "$LOGFILE"
    break
  fi
  
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
