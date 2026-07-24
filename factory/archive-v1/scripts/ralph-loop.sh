#!/bin/bash
# Ralph Loop — Autonomous video iteration until GOLD
# Usage: bash factory/scripts/ralph-loop.sh <slug> [max_iterations]
# Example: bash factory/scripts/ralph-loop.sh expansion-essay1 5

set -e
SLUG="${1:-expansion-essay1}"
MAX_ITER="${2:-5}"
WORKER="https://factory-worker.tradesprior.workers.dev"
RENDER_DIR="/root/projects/blog/content/publishing/renders/${SLUG}-platinum"
BUILD_SCRIPT="/root/projects/blog/content/publishing/scripts/${SLUG}/build-platinum.py"
FACTORY="/root/projects/blog/factory"
LOG_FILE="${FACTORY}/feedback/ralph-loop-${SLUG}.md"
ITERATION=1

# Source credentials
export CLOUDFLARE_API_TOKEN="CF_API_TOKEN_PLACEHOLDER"
export AWS_ACCESS_KEY_ID="87335c47538971cc698270f84559ed7d"
export AWS_SECRET_ACCESS_KEY="efd1968d867661f0cd09ce47bee4af8c6ad3e1f8b0f1e434b8a084bdcec7c4f0"
export R2_ENDPOINT="https://954612afb5a97bb15dddcdc70176813d.r2.cloudflarestorage.com"

mkdir -p "${FACTORY}/feedback"

echo "==========================================" > "$LOG_FILE"
echo "RALPH LOOP — ${SLUG}" >> "$LOG_FILE"
echo "Started: $(date)" >> "$LOG_FILE"
echo "Max iterations: ${MAX_ITER}" >> "$LOG_FILE"
echo "==========================================" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

while [ $ITERATION -le $MAX_ITER ]; do
    echo ""
    echo "=== RALPH LOOP: Iteration ${ITERATION}/${MAX_ITER} ==="
    echo ""
    
    echo "## Iteration ${ITERATION}" >> "$LOG_FILE"
    echo "Started: $(date)" >> "$LOG_FILE"
    echo "" >> "$LOG_FILE"
    
    # Step 1: Build
    echo "1. Building..."
    echo "### Build" >> "$LOG_FILE"
    if [ -f "$BUILD_SCRIPT" ]; then
        python3 "$BUILD_SCRIPT" render 2>&1 | tee -a "$LOG_FILE"
        python3 "$BUILD_SCRIPT" assemble 2>&1 | tee -a "$LOG_FILE"
    else
        echo "No build script at $BUILD_SCRIPT" | tee -a "$LOG_FILE"
        echo "Trying platinum-build.py..." >> "$LOG_FILE"
        python3 "/root/projects/blog/content/publishing/renders/${SLUG}/platinum-build.py" render 2>&1 | tee -a "$LOG_FILE"
        python3 "/root/projects/blog/content/publishing/renders/${SLUG}/platinum-build.py" assemble 2>&1 | tee -a "$LOG_FILE"
    fi
    echo "" >> "$LOG_FILE"
    
    # Step 2: Analyze
    echo "2. Analyzing..."
    echo "### Analysis" >> "$LOG_FILE"
    python3 "${FACTORY}/scripts/analyze-output.py" "$RENDER_DIR" 2>/dev/null | head -50 >> "$LOG_FILE"
    echo "" >> "$LOG_FILE"
    
    # Extract score and grade
    SCORE_LINE=$(grep -oP '"grade":\s*"[^"]*"' "$RENDER_DIR/analysis_report.json" 2>/dev/null | head -1 || echo '"grade": "UNKNOWN"')
    SCORE=$(echo "$SCORE_LINE" | grep -oP '"[^"]*"' | tail -1 | tr -d '"')
    TOTAL=$(grep -oP '"total_score":\s*\d+' "$RENDER_DIR/analysis_report.json" 2>/dev/null | head -1 | grep -oP '\d+' || echo "0")
    echo "Grade: ${SCORE} (${TOTAL}/100)" | tee -a "$LOG_FILE"
    echo "" >> "$LOG_FILE"
    
    # Step 3: Check if GOLD
    if [ "$SCORE" = "GOLD" ]; then
        echo "🎉 GOLD achieved! Publishing..." | tee -a "$LOG_FILE"
        
        # Upload to R2
        python3 -c "
import boto3
from botocore.config import Config
import os
s3 = boto3.client('s3',
    endpoint_url=os.environ['R2_ENDPOINT'],
    aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
    aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    config=Config(signature_version='s3v4'))
key = '${SLUG}-platinum/v${ITERATION}/final.mp4'
with open('${RENDER_DIR}/final.mp4', 'rb') as f:
    s3.put_object(Bucket='factory-assets', Key=key, Body=f, ContentType='video/mp4')
" 2>&1 | tee -a "$LOG_FILE"
        
        # Update job
        DUR=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$RENDER_DIR/final.mp4" 2>/dev/null || echo 0)
        curl -s -X PUT "$WORKER/api/factory/jobs/${SLUG}" \
          -H "Content-Type: application/json" \
          -d "{\"status\":\"final\",\"version\":${ITERATION},\"mp4_key\":\"${SLUG}-platinum/v${ITERATION}/final.mp4\",\"duration_seconds\":${DUR}}" \
          | python3 -c "import json,sys; print(f'Job finalized: {json.load(sys.stdin)}')" 2>&1 | tee -a "$LOG_FILE"
        
        echo "GOLD achieved at iteration ${ITERATION}" >> "$LOG_FILE"
        break
    fi
    
    # Step 4: Search resources for fixes
    echo "3. Searching resources for fixes..."
    echo "### Resource Search" >> "$LOG_FILE"
    python3 "${FACTORY}/scripts/search-resources.py" \
      "shot count" "runtime" "audio" "continuity" "fps" "palette" 2>&1 | python3 -c "
import json, sys
d = json.load(sys.stdin)
for item in d:
    print(f'Gap: {item[\"gap\"]}')
    for insight in item.get('insights',[]):
        print(f'  → {insight}')
" 2>&1 | tee -a "$LOG_FILE"
    echo "" >> "$LOG_FILE"
    
    # Step 5: Document findings and plan for next iteration
    echo "4. Planning next iteration..."
    echo "### Plan for v${ITERATION} → v$((ITERATION+1))" >> "$LOG_FILE"
    
    if [ "$TOTAL" -lt 45 ]; then
        echo "Priority: Increase shot count to 80+ by splitting each existing scene into 8 sub-shots" >> "$LOG_FILE"
        echo "Action: Modify build script to generate more granular shots" >> "$LOG_FILE"
    fi
    if [ "$TOTAL" -lt 65 ] && [ "$TOTAL" -ge 45 ]; then
        echo "Priority: Add per-shot audio + improve transitions with continuity objects" >> "$LOG_FILE"
        echo "Action: Generate WAVs for each shot, add bridge frames" >> "$LOG_FILE"
    fi
    if [ "$TOTAL" -ge 65 ]; then
        echo "Priority: Polish — increase FPS to 8, tighten palette, improve visual mode variety" >> "$LOG_FILE"
        echo "Action: Render at 8fps, add 3+ more visual modes" >> "$LOG_FILE"
    fi
    echo "" >> "$LOG_FILE"
    
    # Step 6: Store feedback
    curl -s -X POST "$WORKER/api/factory/jobs/${SLUG}/feedback" \
      -H "Content-Type: application/json" \
      -d "{\"author\":\"RalphLoop\",\"dimension\":\"quality\",\"rating\":$TOTAL,\"comment\":\"v${ITERATION}: ${SCORE} ${TOTAL}/100. Iterating to v$((ITERATION+1)).\"}" \
      2>&1 | python3 -c "import json,sys; print(f'Feedback stored: {json.load(sys.stdin)}')" | tee -a "$LOG_FILE"
    
    echo "---" >> "$LOG_FILE"
    echo "" >> "$LOG_FILE"
    
    ITERATION=$((ITERATION + 1))
    
    if [ $ITERATION -le $MAX_ITER ]; then
        echo "5. Looping to iteration ${ITERATION}..."
        sleep 2
    fi
done

echo ""
echo "=== Loop complete ==="
if [ "$SCORE" = "GOLD" ]; then
    echo "✅ GOLD achieved at iteration ${ITERATION}"
else
    echo "🟡 Max iterations (${MAX_ITER}) reached. Final grade: ${SCORE} (${TOTAL}/100)"
    echo "See ${LOG_FILE} for full log"
fi

echo ""
echo "Log: ${LOG_FILE}"