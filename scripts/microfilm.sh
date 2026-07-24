#!/bin/bash
# Microfilm Benchmark D — Generated PIL Microfilm
# Usage: ./scripts/microfilm.sh <slug>
set -Eeuo pipefail

SLUG="${1:-microfilm-d1}"
API="https://platinum-factory.tradesprior.workers.dev"
ESSAY=$(cat scripts/expansion-essay33.md | head -30)

echo "=== MICROFILM BENCHMARK D: $SLUG ==="
echo ""

# 1. Create job
echo "[1/9] Creating job..."
JOB=$(jq -n --arg slug "$SLUG" --arg essay "$ESSAY" '{slug: $slug, essay_text: $essay}' | \
  curl -s -X POST "$API/jobs" -H "Content-Type: application/json" --data-binary @-)
RETURNED=$(echo "$JOB" | jq -er '.slug // empty' 2>/dev/null || echo "")
if [ "$RETURNED" != "$SLUG" ]; then
  echo "FAIL: Job creation returned '$RETURNED', expected '$SLUG'"
  echo "$JOB"
  exit 1
fi
echo "  ✅ Job $SLUG created"

# 2-10. Run creative stages
for stage in pack_setup gold_study rhetorical_map visual_thesis motif_manufacturability storyboard storyboard_review pack_composition code_review; do
  echo -n "  $stage... "
  R=$(curl -s --max-time 120 -X POST "$API/advance" -H "Content-Type: application/json" -d "{\"slug\":\"$SLUG\"}")
  STATUS=$(echo "$R" | jq -r '.result // "parse_error"' 2>/dev/null)
  if [ "$STATUS" != "passed" ]; then
    ERR=$(echo "$R" | jq -r '.errors // .error // "unknown"' 2>/dev/null)
    echo "FAIL: $ERR"
    exit 1
  fi
  echo "✅"
done

# 11. Run execution stages
for stage in draft_render visual_qc final_render; do
  echo -n "  $stage... "
  R=$(curl -s --max-time 30 -X POST "$API/advance" -H "Content-Type: application/json" -d "{\"slug\":\"$SLUG\"}")
  STATUS=$(echo "$R" | jq -r '.result // "error"' 2>/dev/null)
  TASK=$(echo "$R" | jq -r '.task_id // ""' 2>/dev/null)
  if [ "$STATUS" = "dispatched" ] && [ -n "$TASK" ]; then
    echo "✅ (task: ${TASK:0:30}...)"
  elif [ "$STATUS" = "passed" ]; then
    echo "✅"
  else
    echo "FAIL"
    exit 1
  fi
done

echo ""
echo "=== COMPLETE ==="
echo "Video: $API/video/$SLUG"
