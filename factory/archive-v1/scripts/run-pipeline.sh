#!/bin/bash
# Factory Pipeline: Generate voiceover → render scenes → assemble MP4 → upload to R2 → update job
# Usage: bash factory/scripts/run-pipeline.sh <job-id>
# Example: bash factory/scripts/run-pipeline.sh test-prod-001

set -e
JOB_ID="${1:-test-prod-001}"
WORKER="https://factory-worker.tradesprior.workers.dev"
RENDER_DIR="/root/projects/blog/content/publishing/renders/$JOB_ID"
VO_DIR="/root/projects/blog/content/publishing/voiceover/$JOB_ID"
SCRIPT_DIR="/root/projects/blog"
FACTORY_DIR="/root/projects/blog/factory"

echo "=== Pipeline: $JOB_ID ==="
echo ""

# Source credentials
export CLOUDFLARE_API_TOKEN="CF_API_TOKEN_PLACEHOLDER"
export AWS_ACCESS_KEY_ID="87335c47538971cc698270f84559ed7d"
export AWS_SECRET_ACCESS_KEY="efd1968d867661f0cd09ce47bee4af8c6ad3e1f8b0f1e434b8a084bdcec7c4f0"
export R2_ENDPOINT="https://954612afb5a97bb15dddcdc70176813d.r2.cloudflarestorage.com"

# Step 1: Get job details from factory worker
echo "1. Fetching job details..."
JOB_JSON=$(curl -s "$WORKER/api/factory/jobs/$JOB_ID")
TITLE=$(echo "$JOB_JSON" | python3 -c "import json,sys; print(json.load(sys.stdin).get('title','Untitled'))")
echo "   Title: $TITLE"

# Step 2: Generate voiceover
echo ""
echo "2. Generating voiceover..."
mkdir -p "$VO_DIR"
python3 "$FACTORY_DIR/../scripts/generate-voiceover.mjs" --storyboard "$JOB_ID" 2>/dev/null || {
    echo "   Voiceover script not found, using inline generation..."
    # Use the existing generate.py for expansion-essay1
    if [ -f "$SCRIPT_DIR/content/publishing/voiceover/$JOB_ID/generate.py" ]; then
        python3 "$SCRIPT_DIR/content/publishing/voiceover/$JOB_ID/generate.py"
    fi
}
VO_COUNT=$(ls "$VO_DIR"/*.mp3 2>/dev/null | wc -l)
echo "   $VO_COUNT voiceover segments"

# Step 3: Render PIL scenes
echo ""
echo "3. Rendering scenes..."
if [ -f "$RENDER_DIR/build-video.py" ]; then
    python3 "$RENDER_DIR/build-video.py" render
elif [ "$JOB_ID" == "expansion-essay1" ] || [ "$JOB_ID" == "test-prod-001" ]; then
    # Use existing expansion-essay1 renderer
    python3 "$SCRIPT_DIR/content/publishing/renders/expansion-essay1/build-video.py" render
    # Copy scenes to our job directory
    mkdir -p "$RENDER_DIR"
    cp -r "$SCRIPT_DIR/content/publishing/renders/expansion-essay1/scene-0"* "$RENDER_DIR/" 2>/dev/null || true
fi
echo "   Scenes rendered"

# Step 4: Assemble MP4
echo ""
echo "4. Assembling video..."
if [ -f "$RENDER_DIR/build-video.py" ]; then
    python3 "$RENDER_DIR/build-video.py" assemble
elif [ "$JOB_ID" == "expansion-essay1" ] || [ "$JOB_ID" == "test-prod-001" ]; then
    # Assemble from expansion-essay1 renders
    R_DIR="$SCRIPT_DIR/content/publishing/renders/expansion-essay1"
    VO_DIR="$SCRIPT_DIR/content/publishing/voiceover/expansion-essay1"

    # Render each scene to MP4
    for s in scene-01 scene-02 scene-03 scene-04 scene-05 scene-06 scene-07 scene-08 scene-09; do
        dur=$(echo $s | sed 's/scene-0//')
        case $s in
            scene-01) d=11.5 ;; scene-02) d=16.0 ;; scene-03) d=19.5 ;;
            scene-04) d=16.0 ;; scene-05) d=14.0 ;; scene-06) d=16.0 ;;
            scene-07) d=17.0 ;; scene-08) d=16.0 ;; scene-09) d=11.0 ;;
        esac
        ffmpeg -y -framerate 2 -i "${R_DIR}/${s}/frame_%05d.png" \
          -c:v libx264 -pix_fmt yuv420p -preset ultrafast -crf 28 \
          -t $d "${R_DIR}/${s}.mp4" 2>/dev/null
    done

    # Concat videos
    > /tmp/vlist.txt
    for s in scene-01 scene-02 scene-03 scene-04 scene-05 scene-06 scene-07 scene-08 scene-09; do
        echo "file '${R_DIR}/${s}.mp4'" >> /tmp/vlist.txt
    done
    ffmpeg -y -f concat -safe 0 -i /tmp/vlist.txt -c copy /tmp/combined-video.mp4 2>/dev/null

    # Concat audio
    ffmpeg -y -i "concat:${VO_DIR}/seg-01-hook.mp3|${VO_DIR}/seg-02-wheel.mp3|${VO_DIR}/seg-03-six-names.mp3|${VO_DIR}/seg-04-mantra.mp3|${VO_DIR}/seg-05-resonance.mp3|${VO_DIR}/seg-06-belly.mp3|${VO_DIR}/seg-07-chain.mp3|${VO_DIR}/seg-08-pulse.mp3|${VO_DIR}/seg-09-close.mp3" \
      -c copy /tmp/combined-audio.mp3 2>/dev/null

    # Final assembly
    ffmpeg -y -i /tmp/combined-video.mp4 -i /tmp/combined-audio.mp3 \
      -c:v copy -c:a aac -map 0:v:0 -map 1:a:0 -shortest \
      "${R_DIR}/final.mp4" 2>/dev/null
    cp "${R_DIR}/final.mp4" "${RENDER_DIR}/final.mp4"
fi

# Check result
FINAL_MP4="${RENDER_DIR}/final.mp4"
if [ ! -f "$FINAL_MP4" ]; then
    echo "   ERROR: No final MP4 produced"
    exit 1
fi
FINAL_SIZE=$(ls -lh "$FINAL_MP4" | awk '{print $5}')
echo "   Final MP4: $FINAL_SIZE"

# Step 5: Upload to R2
echo ""
echo "5. Uploading to R2..."
R2_KEY="${JOB_ID}/v1/final.mp4"
python3 -c "
import boto3, os
from botocore.config import Config

s3 = boto3.client('s3',
    endpoint_url=os.environ['R2_ENDPOINT'],
    aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
    aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    config=Config(signature_version='s3v4')
)

key = '$R2_KEY'
with open('$FINAL_MP4', 'rb') as f:
    s3.put_object(Bucket='factory-assets', Key=key, Body=f, ContentType='video/mp4')
print(f'   Uploaded to factory-assets/{key}')
"

# Step 6: Update job status via callback
echo ""
echo "6. Updating job status..."
DURATION=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$FINAL_MP4" 2>/dev/null || echo 0)
curl -s -X POST "$WORKER/api/factory/render/callback" \
  -H "Content-Type: application/json" \
  -d "{\"jobId\":\"$JOB_ID\",\"status\":\"done\",\"mp4Key\":\"$R2_KEY\",\"duration\":$DURATION}" \
  | python3 -c "import json,sys; d=json.load(sys.stdin); print(f'   Callback: {d.get(\"ok\")}')"

echo ""
echo "=== Pipeline Complete ==="
echo "Job: $JOB_ID"
echo "MP4: factory-assets/$R2_KEY"
echo "Duration: ${DURATION}s"
echo "View: $WORKER/api/factory/jobs/$JOB_ID"
