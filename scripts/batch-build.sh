#!/bin/bash
# batch-build.sh — Assemble all 10 videos rapidly
# Uses: Manim scenes as background, FFmpeg text overlays, existing voiceover

set -e
ROOT="/root/projects/blog"
SCRIPTS="$ROOT/content/publishing/scripts"
VO="$ROOT/content/publishing/voiceover"
VIDEOS="$ROOT/content/publishing/videos"
MANIM="/tmp/manim_scenes"
mkdir -p "$VIDEOS"

# Scene assignment per video
declare -A SCENES
SCENES[01-k4]="TetrahedronBuild.mp4"
SCENES[02-upayas]="TetrahedronBuild.mp4"
SCENES[03-daimon]="RotatingTetrahedron.mp4"
SCENES[04-tattvas]="NestedTetrahedra.mp4"
SCENES[05-matrka]="RotatingTetrahedron.mp4"
SCENES[06-light]="RotatingTetrahedron.mp4"
SCENES[07-fep]="RotatingTetrahedron.mp4"
SCENES[08-tukdam]="RotatingTetrahedron.mp4"
SCENES[09-green-core]="RotatingTetrahedron.mp4"
SCENES[10-hellenistic-tantra]="TimelineFour.mp4"

build_one() {
  local id="$1"
  local scene="${SCENES[$id]}"
  local dir="$SCRIPTS/$id"
  local narration="$VO/$id/narration.mp3"
  local output="$VIDEOS/${id}.mp4"
  local script="$dir/script.md"
  
  if [ ! -f "$narration" ]; then echo "  SKIP $id: no voiceover"; return; fi
  if [ ! -f "$dir/script.md" ]; then echo "  SKIP $id: no script"; return; fi
  
  local dur=$(ffprobe -v quiet -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$narration")
  local dur_int=${dur%.*}
  
  echo -n "  $id: ${dur_int}s... "
  
  local title=$(head -5 "$script" | grep "^# Script" | head -1 | sed 's/^# Script [0-9]*: //' | tr -d "'\"" | cut -c1-80)
  [ -z "$title" ] && title="Distillery"
  
  # Build: fade through 3 Manim scenes + intro/outro text cards
  local total=$dur_int
  local third=$((total / 3))
  local intro_end=4
  local seg1_end=$((intro_end + third))
  local seg2_end=$((seg1_end + third))
  local seg3_end=$((total - 4))
  
  # Create intro card (4s)
  local intro="/tmp/vid_intro_${id}.mp4"
  ffmpeg -hide_banner -loglevel error -y \
    -f lavfi -i "color=c=#0D1117:s=1920x1080:d=4:r=24" \
    -vf "drawtext=text='${title}':font='Times New Roman':fontsize=44:fontcolor=#D4A574:x=(w-text_w)/2:y=(h-text_h)/2-30,drawtext=text='Distillery':font='Times New Roman':fontsize=24:fontcolor=#8B7355:x=(w-text_w)/2:y=(h-text_h)/2+40,fade=in:st=0:d=1" \
    -c:v libx264 -preset ultrafast -pix_fmt yuv420p "$intro" 2>/dev/null
  
  # Create outro card (4s)
  local outro="/tmp/vid_outro_${id}.mp4"
  ffmpeg -hide_banner -loglevel error -y \
    -f lavfi -i "color=c=#0D1117:s=1920x1080:d=4:r=24" \
    -vf "drawtext=text='${title}':font='Times New Roman':fontsize=30:fontcolor=#8B7355:x=(w-text_w)/2:y=(h-text_h)/2-20,drawtext=text='Distillery':font='Times New Roman':fontsize=20:fontcolor=#A855F7:x=(w-text_w)/2:y=(h-text_h)/2+30,fade=out:st=2:d=2" \
    -c:v libx264 -preset ultrafast -pix_fmt yuv420p "$outro" 2>/dev/null
  
  # Loop Manim scene for the body, with drawtext beat labels extracted from beat-map.md
  local beatmap="$dir/beat-map.md"
  local label_filter=""
  if [ -f "$beatmap" ]; then
    # Extract beat labels and timings
    local labels=$(python3 -c "
import re
bm = open('$beatmap').read()
beats = re.findall(r'(?:BEAT|B)\s*\d+\s*\[(\d+):(\d+)[-–]+\d*:?(\d+)\]', bm)
if not beats:
    beats = re.findall(r'(?:###\s*)?B\d+\s*\[(\d+):(\d+)[-–]+\d*:?(\d+)\]', bm)
for b in beats[:12]:
    start = int(b[0])*60 + int(b[1])
    end = int(b[2]) if b[2] else start+15
    # Also get the label line after each beat
    m2 = re.search(r'\[%s:%s[^\]]*\].*?\n.*?\*\*VISUAL:\*\*\s*(.+?)(?:\n|$)' % (b[0], b[1]), bm, re.DOTALL)
    if not m2:
        m2 = re.search(r'\[%s:%s[^\]]*\].*?\n.*?VISUAL:\s*(.+?)(?:\n|$)' % (b[0], b[1]), bm, re.DOTALL)
    label = m2.group(1).strip()[:50] if m2 else f'Beat at {int(b[0])}m{int(b[1])}s'
    # Escape for ffmpeg drawtext
    label = label.replace(':', '-').replace(\"'\", '').replace('\"', '').replace('%', '%%')
    print(f'{start}|{end}|{label}')
" 2>/dev/null)
    
    # Build drawtext filters from parsed labels
    while IFS='|' read -r b_start b_end b_label; do
      [ -z "$b_start" ] && continue
      label_filter="${label_filter}drawtext=text='${b_label}':font='Sans':fontsize=16:fontcolor=#E6E1DC:x=20:y=h-60:alpha='if(gt(t,${b_start}),if(lt(t,$((b_end-2))),1,if(lt(t,${b_end}),(${b_end}-t)/2,0)),0)':enable='between(t,${b_start},${b_end})',"
    done <<< "$labels"
  fi
  
  # Body: loop Manim scene with changing labels  
  local body="/tmp/vid_body_${id}.mp4"
  local body_dur=$((total - 8))
  local scene_path="$MANIM/$scene"
  
  if [ -f "$scene_path" ]; then
    ffmpeg -hide_banner -loglevel error -y \
      -stream_loop -1 -i "$scene_path" \
      -t "$body_dur" \
      -vf "${label_filter}fade=in:st=0:d=1,fade=out:st=$((body_dur-2)):d=2" \
      -c:v libx264 -preset ultrafast -pix_fmt yuv420p \
      "$body" 2>/dev/null
  else
    # Fallback: dark void with only labels
    ffmpeg -hide_banner -loglevel error -y \
      -f lavfi -i "color=c=#0D1117:s=1920x1080:d=$body_dur:r=24" \
      -vf "${label_filter}fade=in:st=0:d=1,fade=out:st=$((body_dur-2)):d=2" \
      -c:v libx264 -preset ultrafast -pix_fmt yuv420p \
      "$body" 2>/dev/null
  fi
  
  # Concat: intro + body + outro
  local concat_txt="/tmp/concat_${id}.txt"
  echo "file '$intro'" > "$concat_txt"
  echo "file '$body'" >> "$concat_txt"
  echo "file '$outro'" >> "$concat_txt"
  
  local video_nosound="/tmp/vid_nosound_${id}.mp4"
  ffmpeg -hide_banner -loglevel error -y \
    -f concat -safe 0 -i "$concat_txt" \
    -c:v copy "$video_nosound" 2>/dev/null
  
  # Mux with voiceover
  ffmpeg -hide_banner -loglevel error -y \
    -i "$video_nosound" -i "$narration" \
    -c:v copy -c:a aac -b:a 128k \
    -shortest -map 0:v:0 -map 1:a:0 \
    "$output" 2>/dev/null
  
  # Cleanup
  rm -f "$intro" "$outro" "$body" "$concat_txt" "$video_nosound"
  
  if [ -f "$output" ]; then
    local size=$(ls -lh "$output" | awk '{print $5}')
    echo "OK ($size)"
    return 0
  else
    echo "FAILED"
    return 1
  fi
}

echo "Building all 10 videos..."
for id in 01-k4 02-upayas 03-daimon 04-tattvas 05-matrka 06-light 07-fep 08-tukdam 09-green-core 10-hellenistic-tantra; do
  build_one "$id"
done

echo ""
echo "=== Results ==="
ls -lhS "$VIDEOS"/*.mp4 2>/dev/null | awk '{print $5, $NF}' | while read size file; do
  id=$(basename "$file" .mp4)
  dur=$(ffprobe -v quiet -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$file" 2>/dev/null)
  echo "$id: $size | ${dur}s"
done