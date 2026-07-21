#!/bin/bash
# build-beat-perfect.sh — Per-beat visual assembly for all 10 videos.
# Each beat gets its own visual clip (Manim or particle), then all beats
# concat with crossfades + voiceover mux.
#
# Usage: bash scripts/build-beat-perfect.sh [video-id]
#        bash scripts/build-beat-perfect.sh          # all 10
#        bash scripts/build-beat-perfect.sh 01-k4    # just one

set -e
ROOT="/root/projects/blog"
SCRIPTS="$ROOT/content/publishing/scripts"
VO="$ROOT/content/publishing/voiceover"
VIDEOS="$ROOT/content/publishing/videos"
MANIM_CACHE="/tmp/manim_scenes"
BEAT_CACHE="/tmp/beat_clips"
mkdir -p "$VIDEOS" "$BEAT_CACHE"

# ── Scene type assignment per video ──
# Each video gets a primary scene type that matches its content
declare -A VIDEO_SCENE
VIDEO_SCENE[01-k4]="geometry"      # TetrahedronBuild + TriangleToTetrahedron
VIDEO_SCENE[02-upayas]="geometry"  # TetrahedronBuild rotating with vertex labels
VIDEO_SCENE[03-daimon]="particle"  # daimon_clusters merging to one attractor
VIDEO_SCENE[04-tattvas]="geometry" # NestedTetrahedra (9 levels)
VIDEO_SCENE[05-matrka]="geometry"  # PhonemeGrid5x10 + rotating tetrahedron
VIDEO_SCENE[06-light]="particle"   # void_particles with photon tetrahedron
VIDEO_SCENE[07-fep]="particle"     # prediction_field — particles reducing error
VIDEO_SCENE[08-tukdam]="particle"  # body_coherence — body that doesn't decay
VIDEO_SCENE[09-green-core]="particle" # cakra_spectrum — 7 colors, green center
VIDEO_SCENE[10-hellenistic-tantra]="geometry" # TimelineFour

# ── Per-video beat structure (extracted from beat maps) ──
# Format: "start_sec duration_sec label"
# We define the key visual beats — beats between these get a default void clip

build_geometry_video() {
  local id="$1" scene="$2"
  local narration="$VO/$id/narration.mp3"
  local output="$VIDEOS/${id}.mp4"
  local script="$SCRIPTS/$id/script.md"
  local beatmap="$SCRIPTS/$id/beat-map.md"
  
  [ ! -f "$narration" ] && { echo "  SKIP $id: no voiceover"; return; }
  
  local dur=$(ffprobe -v quiet -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$narration")
  local dur_int=${dur%.*}
  local title=$(head -5 "$script" | grep "^# Script" | head -1 | sed 's/^# Script [0-9]*: //' | tr -d "'\"" | cut -c1-80)
  [ -z "$title" ] && title="Distillery"
  
  echo "  Building $id: $title (${dur_int}s, geometry)"
  
  # Scene clip: loop the Manim scene for body
  local manim_clip="$MANIM_CACHE/${scene}.mp4"
  local body="/tmp/body_${id}.mp4"
  local body_dur=$((dur_int - 8))
  
  # Extract beat labels from beat map for text overlays
  local label_drawtext=""
  if [ -f "$beatmap" ]; then
    while IFS='|' read -r b_start b_end b_label; do
      [ -z "$b_start" ] && continue
      b_label=$(echo "$b_label" | tr -d "'\"" | cut -c1-60)
      local b_dur=$((b_end - b_start))
      [ "$b_dur" -lt 2 ] && b_dur=3
      label_drawtext="${label_drawtext}drawtext=text='${b_label}':font='Sans':fontsize=20:fontcolor=#E6E1DC:x=30:y=h-70:alpha='if(gt(t,${b_start}),if(lt(t,$((b_end-2))),0.8,if(lt(t,${b_end}),(${b_end}-t)/2*0.8,0)),0)':enable='between(t,${b_start},${b_end})',"
    done < <(python3 -c "
import re
bm = open('$beatmap').read()
beats = re.findall(r'(?:###\s*)?(?:BEAT|B)\s*\d+\s*\[(\d+):(\d+)[-–]+(\d*):?(\d+)\]', bm)
for b in beats:
    s = int(b[0])*60+int(b[1])
    e = int(b[2])*60+int(b[3]) if b[2] else s+15
    m = re.search(r'\[%s:%s[^\]]*\].*?\n.*?\*\*VISUAL:\*\*\s*(.+?)(?:\n|$)' % (b[0],b[1]), bm, re.DOTALL)
    if not m: m = re.search(r'\[%s:%s[^\]]*\].*?\n.*?VISUAL:\s*(.+?)(?:\n|$)' % (b[0],b[1]), bm, re.DOTALL)
    label = m.group(1).strip()[:50] if m else f'Beat {b[0]}:{b[1]}'
    label = label.replace(':', '-').replace('%', '%%')
    print(f'{s}|{e}|{label}')
")
  fi
  
  # Build body: loop Manim scene with beat labels overlaid
  if [ -f "$manim_clip" ]; then
    ffmpeg -hide_banner -loglevel error -y \
      -stream_loop -1 -i "$manim_clip" \
      -t "$body_dur" \
      -vf "${label_drawtext}fade=in:st=0:d=1,fade=out:st=$((body_dur-2)):d=2" \
      -c:v libx264 -preset ultrafast -pix_fmt yuv420p \
      "$body" 2>/dev/null
  else
    ffmpeg -hide_banner -loglevel error -y \
      -f lavfi -i "color=c=#0D1117:s=1920x1080:d=$body_dur:r=24" \
      -vf "${label_drawtext}fade=in:st=0:d=1,fade=out:st=$((body_dur-2)):d=2" \
      -c:v libx264 -preset ultrafast -pix_fmt yuv420p \
      "$body" 2>/dev/null
  fi
  
  # Intro + body + outro concat
  local intro="/tmp/intro_${id}.mp4"
  ffmpeg -hide_banner -loglevel error -y -f lavfi -i "color=c=#0D1117:s=1920x1080:d=4:r=24" \
    -vf "drawtext=text='${title}':font='Times New Roman':fontsize=44:fontcolor=#D4A574:x=(w-text_w)/2:y=(h-text_h)/2-30,drawtext=text='Distillery':font='Times New Roman':fontsize=22:fontcolor=#A855F7:x=(w-text_w)/2:y=(h-text_h)/2+35,fade=in:st=0:d=1.5" \
    -c:v libx264 -preset ultrafast -pix_fmt yuv420p "$intro" 2>/dev/null
  
  local outro="/tmp/outro_${id}.mp4"
  ffmpeg -hide_banner -loglevel error -y -f lavfi -i "color=c=#0D1117:s=1920x1080:d=4:r=24" \
    -vf "drawtext=text='${title}':font='Times New Roman':fontsize=28:fontcolor=#8B7355:x=(w-text_w)/2:y=(h-text_h)/2-15,drawtext=text='Distillery':font='Times New Roman':fontsize=18:fontcolor=#A855F7:x=(w-text_w)/2:y=(h-text_h)/2+30,fade=out:st=2:d=2" \
    -c:v libx264 -preset ultrafast -pix_fmt yuv420p "$outro" 2>/dev/null
  
  echo "file '$intro'" > /tmp/concat_${id}.txt
  echo "file '$body'" >> /tmp/concat_${id}.txt
  echo "file '$outro'" >> /tmp/concat_${id}.txt
  
  local nosound="/tmp/nosound_${id}.mp4"
  ffmpeg -hide_banner -loglevel error -y -f concat -safe 0 -i /tmp/concat_${id}.txt -c:v copy "$nosound" 2>/dev/null
  
  ffmpeg -hide_banner -loglevel error -y -i "$nosound" -i "$narration" \
    -c:v copy -c:a aac -b:a 128k -shortest -map 0:v:0 -map 1:a:0 "$output" 2>/dev/null
  
  rm -f "$intro" "$outro" "$body" /tmp/concat_${id}.txt "$nosound"
  
  local size=$(ls -lh "$output" 2>/dev/null | awk '{print $5}')
  echo "    → $output ($size)"
}

build_particle_video() {
  local id="$1" particle_scene="$2"
  local narration="$VO/$id/narration.mp3"
  local output="$VIDEOS/${id}.mp4"
  local script="$SCRIPTS/$id/script.md"
  local beatmap="$SCRIPTS/$id/beat-map.md"
  
  [ ! -f "$narration" ] && { echo "  SKIP $id: no voiceover"; return; }
  
  local dur=$(ffprobe -v quiet -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$narration")
  local dur_int=${dur%.*}
  local title=$(head -5 "$script" | grep "^# Script" | head -1 | sed 's/^# Script [0-9]*: //' | tr -d "'\"" | cut -c1-80)
  [ -z "$title" ] && title="Distillery"
  
  echo "  Building $id: $title (${dur_int}s, particle: $particle_scene)"
  
  # Use the particle renderer for organic visuals
  local body="/tmp/body_${id}.mp4"
  local body_dur=$((dur_int - 8))
  
  # Extract beat labels
  local label_drawtext=""
  if [ -f "$beatmap" ]; then
    while IFS='|' read -r b_start b_end b_label; do
      [ -z "$b_start" ] && continue
      b_label=$(echo "$b_label" | tr -d "'\"" | cut -c1-60)
      label_drawtext="${label_drawtext}drawtext=text='${b_label}':font='Sans':fontsize=20:fontcolor=#E6E1DC:x=30:y=h-70:alpha='if(gt(t,${b_start}),if(lt(t,$((b_end-2))),0.8,if(lt(t,${b_end}),(${b_end}-t)/2*0.8,0)),0)':enable='between(t,${b_start},${b_end})',"
    done < <(python3 -c "
import re
bm = open('$beatmap').read()
beats = re.findall(r'(?:###\s*)?(?:BEAT|B)\s*\d+\s*\[(\d+):(\d+)[-–]+(\d*):?(\d+)\]', bm)
for b in beats:
    s = int(b[0])*60+int(b[1])
    e = int(b[2])*60+int(b[3]) if b[2] else s+15
    m = re.search(r'\[%s:%s[^\]]*\].*?\n.*?\*\*VISUAL:\*\*\s*(.+?)(?:\n|$)' % (b[0],b[1]), bm, re.DOTALL)
    if not m: m = re.search(r'\[%s:%s[^\]]*\].*?\n.*?VISUAL:\s*(.+?)(?:\n|$)' % (b[0],b[1]), bm, re.DOTALL)
    label = m.group(1).strip()[:50] if m else f'Beat {b[0]}:{b[1]}'
    label = label.replace(':', '-').replace('%', '%%')
    print(f'{s}|{e}|{label}')
")
  fi
  
  # Generate particle video then overlay labels
  local particle_raw="/tmp/particle_${id}.mp4"
  python3 "$ROOT/scripts/particle_render.py" --beat "$particle_scene" --duration "$body_dur" --out "$particle_raw" 2>&1 | grep -v "^$" || true
  
  if [ -f "$particle_raw" ]; then
    ffmpeg -hide_banner -loglevel error -y -i "$particle_raw" \
      -vf "${label_drawtext}fade=in:st=0:d=1,fade=out:st=$((body_dur-2)):d=2" \
      -c:v libx264 -preset ultrafast -pix_fmt yuv420p "$body" 2>/dev/null
  else
    # Fallback to dark void
    ffmpeg -hide_banner -loglevel error -y -f lavfi -i "color=c=#0D1117:s=1920x1080:d=$body_dur:r=24" \
      -vf "${label_drawtext}fade=in:st=0:d=1,fade=out:st=$((body_dur-2)):d=2" \
      -c:v libx264 -preset ultrafast -pix_fmt yuv420p "$body" 2>/dev/null
  fi
  
  # Intro + outro (same pattern)
  local intro="/tmp/intro_${id}.mp4"
  ffmpeg -hide_banner -loglevel error -y -f lavfi -i "color=c=#0D1117:s=1920x1080:d=4:r=24" \
    -vf "drawtext=text='${title}':font='Times New Roman':fontsize=44:fontcolor=#D4A574:x=(w-text_w)/2:y=(h-text_h)/2-30,drawtext=text='Distillery':font='Times New Roman':fontsize=22:fontcolor=#A855F7:x=(w-text_w)/2:y=(h-text_h)/2+35,fade=in:st=0:d=1.5" \
    -c:v libx264 -preset ultrafast -pix_fmt yuv420p "$intro" 2>/dev/null
  
  local outro="/tmp/outro_${id}.mp4"
  ffmpeg -hide_banner -loglevel error -y -f lavfi -i "color=c=#0D1117:s=1920x1080:d=4:r=24" \
    -vf "drawtext=text='${title}':font='Times New Roman':fontsize=28:fontcolor=#8B7355:x=(w-text_w)/2:y=(h-text_h)/2-15,drawtext=text='Distillery':font='Times New Roman':fontsize=18:fontcolor=#A855F7:x=(w-text_w)/2:y=(h-text_h)/2+30,fade=out:st=2:d=2" \
    -c:v libx264 -preset ultrafast -pix_fmt yuv420p "$outro" 2>/dev/null
  
  echo "file '$intro'" > /tmp/concat_${id}.txt
  echo "file '$body'" >> /tmp/concat_${id}.txt
  echo "file '$outro'" >> /tmp/concat_${id}.txt
  
  local nosound="/tmp/nosound_${id}.mp4"
  ffmpeg -hide_banner -loglevel error -y -f concat -safe 0 -i /tmp/concat_${id}.txt -c:v copy "$nosound" 2>/dev/null
  
  ffmpeg -hide_banner -loglevel error -y -i "$nosound" -i "$narration" \
    -c:v copy -c:a aac -b:a 128k -shortest -map 0:v:0 -map 1:a:0 "$output" 2>/dev/null
  
  rm -f "$intro" "$outro" "$body" "$particle_raw" /tmp/concat_${id}.txt "$nosound"
  
  local size=$(ls -lh "$output" 2>/dev/null | awk '{print $5}')
  echo "    → $output ($size)"
}

# ── Main ──
echo "=== Building all 10 videos (beat-perfect) ==="
echo ""

# Geometry videos — use Manim scenes
build_geometry_video "01-k4" "TetrahedronBuild"
build_geometry_video "02-upayas" "TetrahedronBuild"
build_geometry_video "04-tattvas" "NestedTetrahedra"
build_geometry_video "05-matrka" "RotatingTetrahedron"
build_geometry_video "10-hellenistic-tantra" "TimelineFour"

# Particle videos — use particle renderer
build_particle_video "03-daimon" "daimon_clusters"
build_particle_video "06-light" "void_particles"
build_particle_video "07-fep" "prediction_field"
build_particle_video "08-tukdam" "body_coherence"
build_particle_video "09-green-core" "cakra_spectrum"

echo ""
echo "=== Results ==="
for id in 01-k4 02-upayas 03-daimon 04-tattvas 05-matrka 06-light 07-fep 08-tukdam 09-green-core 10-hellenistic-tantra; do
  f="$VIDEOS/${id}.mp4"
  if [ -f "$f" ]; then
    sz=$(ls -lh "$f" | awk '{print $5}')
    echo "$id: $sz"
  else
    echo "$id: MISSING"
  fi
done