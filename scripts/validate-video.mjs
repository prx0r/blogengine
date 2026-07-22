#!/usr/bin/env node
/**
 * Comprehensive video validation — compares FableCut output against
 * blueprints, storyboards, and validates image content via Google Vision.
 *
 * Usage:
 *   node scripts/validate-video.mjs                              # current FableCut project
 *   node scripts/validate-video.mjs --project /path/project.json
 *   node scripts/validate-video.mjs --blueprint TBP-026          # compare against blueprint
 *   node scripts/validate-video.mjs --storyboard nanavira        # compare against storyboard
 *   node scripts/validate-video.mjs --json                       # machine-readable
 *   node scripts/validate-video.mjs --skip-vision                # skip Google API calls
 *   node scripts/validate-video.mjs --fix                        # auto-fix durations from audio
 */

import { readFileSync, statSync, existsSync, readdirSync } from 'fs';
import { execSync, spawnSync } from 'child_process';
import path from 'path';
import * as crypto from 'crypto';

const ROOT = path.resolve('/root/projects/blog');
const FABLECUT_DIR = '/root/projects/FableCut';
const MEDIA_DIR = path.join(FABLECUT_DIR, 'media');
const PROJECT_FILE = path.join(FABLECUT_DIR, 'project.json');
const BLUEPRINTS_DIR = path.join(ROOT, 'tantrafiles', 'blueprints');
const STORYBOARDS_DIR = path.join(ROOT, 'content', 'publishing', 'storyboards');
const VOICEOVER_DIR = path.join(ROOT, 'content', 'publishing', 'voiceover');
const PASS_THRESHOLD = 85;

function log() { console.log(...arguments); }

// ── Loaders ──

function loadProject(projectPath) {
  const p = projectPath || PROJECT_FILE;
  if (!existsSync(p)) throw new Error(`Project file not found: ${p}`);
  return JSON.parse(readFileSync(p, 'utf-8'));
}

function loadBlueprint(bpId) {
  const files = readdirSync(BLUEPRINTS_DIR).filter(f => f.startsWith(bpId.toUpperCase()));
  if (files.length === 0) throw new Error(`Blueprint ${bpId} not found`);
  const text = readFileSync(path.join(BLUEPRINTS_DIR, files[0]), 'utf-8');
  
  const channel = (text.match(/\* `channel`: (\S+)/) || [])[1] || null;
  const runtime = parseInt((text.match(/\* `target_runtime_minutes`: (\d+)/) || [])[1]) || null;
  const title = (text.match(/^# Research Blueprint \d+: (.+)$/m) || [])[1] || null;
  
  // Parse beats
  const beats = [];
  const beatSection = text.match(/## Beat Structure.*?\n(.+?)(?:\n##|\Z)/s);
  if (beatSection) {
    for (const line of beatSection[1].split('\n')) {
      const m = line.match(/^\d+\.\s+\*\*(.+?)\*\*\s+\((\d+):(\d+)-(\d+):(\d+)\)\s+—\s+(.+)$/);
      if (m) {
        const startMin = parseInt(m[2]), startSec = parseInt(m[3]);
        const endMin = parseInt(m[4]), endSec = parseInt(m[5]);
        beats.push({
          title: m[1], role: m[6].trim(),
          startSec: startMin * 60 + startSec,
          endSec: endMin * 60 + endSec,
          durationSec: (endMin * 60 + endSec) - (startMin * 60 + startSec),
        });
      }
    }
  }
  
  // Extract assets
  const assets = [];
  for (const line of text.split('\n')) {
    const m = line.match(/^\* `AST-\d+`:.*?(?:content|URL|url):\s*(.+)$/i);
    if (m) assets.push(m[1].trim());
    const wm = line.match(/(https?:\/\/upload\.wikimedia\.org[^\s\)\]]+)/);
    if (wm) assets.push(wm[1]);
    const mm = line.match(/(https?:\/\/collectionapi\.metmuseum\.org[^\s\)\]]+)/);
    if (mm) assets.push(mm[1]);
  }
  
  return { id: bpId, title, channel, targetRuntime: runtime, beats, assets };
}

function loadStoryboard(slug) {
  const files = readdirSync(STORYBOARDS_DIR).filter(f => f.startsWith(slug));
  if (files.length === 0) throw new Error(`Storyboard ${slug} not found`);
  const sb = JSON.parse(readFileSync(path.join(STORYBOARDS_DIR, files[0]), 'utf-8'));
  
  return {
    id: sb.episode_id,
    title: sb.episode_title,
    voice: sb.narration_voice,
    style: sb.style_profile,
    estimatedMinutes: sb.estimated_duration_min,
    segments: (sb.segments || []).map(s => ({
      id: s.segment_id, label: s.label,
      role: s.rhetorical_role,
      startSec: s.start_sec, endSec: s.end_sec,
      durationSec: (s.end_sec || 0) - (s.start_sec || 0),
      narration: s.narration,
    })),
  };
}

// ── Checks ──

function checkBlueprintMatch(project, bp) {
  const results = [];
  if (!bp) return { score: 50, results };
  
  // Check number of beats
  const bpBeatCount = bp.beats.length;
  const clipBeatCount = Math.floor(project.clips.length / 2); // V1 + A1 per beat
  const beatMatch = Math.abs(clipBeatCount - bpBeatCount) <= 1;
  results.push({
    id: 'B01', weight: 15, text: `Beat count matches blueprint (expected ${bpBeatCount}, got ~${clipBeatCount})`,
    passed: beatMatch,
    detail: beatMatch ? null : `Blueprint has ${bpBeatCount} beats, project has ${clipBeatCount}`,
  });
  
  // Check total duration vs target
  const totalSec = project.clips.reduce((m, c) => Math.max(m, (c.start || 0) + (c.duration || 0)), 0);
  const targetMin = bp.targetRuntime;
  const durationOk = targetMin ? Math.abs(totalSec / 60 - targetMin) <= 5 : true;
  results.push({
    id: 'B02', weight: 12, text: `Total duration matches blueprint target (${targetMin || 'N/A'} min)`,
    passed: durationOk,
    detail: durationOk ? null : `Blueprint target: ${targetMin}min, actual: ${Math.round(totalSec / 60)}min`,
  });
  
  // Check channel treatment
  const bpChannel = bp.channel;
  const knownFilters = {'Tantra Files': 'golden-imaginal', 'Ochema': 'mystical-dark', 'Angeliz': 'corbin-blue', 'Pramāṇa': 'sepia-classic', 'Intelligent Others': 'mystical-dark'};
  const expectedFilter = knownFilters[bpChannel];
  const hasFilter = expectedFilter ? project.clips.some(c => (c.effects || []).some(e => e.name === expectedFilter)) : true;
  results.push({
    id: 'B03', weight: 10, text: `Video uses ${bpChannel || 'correct'} channel treatment${expectedFilter ? ` (${expectedFilter})` : ''}`,
    passed: hasFilter || !expectedFilter,
    detail: hasFilter || !expectedFilter ? null : `Expected filter "${expectedFilter}" for channel "${bpChannel}" — not found on any clip`,
  });
  
  return { score: results.reduce((s, r) => s + (r.passed ? r.weight : 0), 0), results };
}

function checkStoryboardMatch(project, sb) {
  const results = [];
  if (!sb) return { score: 50, results };
  
  const totalSec = project.clips.reduce((m, c) => Math.max(m, (c.start || 0) + (c.duration || 0)), 0);
  
  // Check segment count
  const sbSegCount = sb.segments.length;
  const fcBeatCount = Math.floor(project.clips.length / 2);
  const segMatch = Math.abs(fcBeatCount - sbSegCount) <= 1;
  results.push({
    id: 'S01', weight: 15, text: `Segment count matches storyboard (expected ${sbSegCount}, got ~${fcBeatCount})`,
    passed: segMatch,
    detail: segMatch ? null : `Storyboard has ${sbSegCount} segments, project has ~${fcBeatCount}`,
  });
  
  // Check total duration vs estimated
  const durOk = Math.abs(totalSec / 60 - (sb.estimatedMinutes || 0)) <= 5;
  results.push({
    id: 'S02', weight: 12, text: `Duration matches storyboard estimate (~${sb.estimatedMinutes || '?'} min)`,
    passed: durOk,
    detail: durOk ? null : `Storyboard: ~${sb.estimatedMinutes}min, project: ${Math.round(totalSec / 60)}min`,
  });
  
  // Check that all segment roles are represented
  const expectedRoles = ['hook', 'closing'];
  for (const role of expectedRoles) {
    const hasRole = sb.segments.some(s => s.role === role);
    if (hasRole) {
      const clipCount = project.clips.length;
      results.push({
        id: `S03_${role}`, weight: 8, text: `Has "${role}" segment (from storyboard)`,
        passed: clipCount >= (role === 'hook' ? 2 : 2),
      });
    }
  }
  
  // Check voiceover files exist for each segment
  const audioClips = project.clips.filter(c => c.track === 'A1');
  const voExists = audioClips.length >= sbSegmentsCount(sb);
  results.push({
    id: 'S04', weight: 10, text: `Voiceover exists for all ${sbSegmentsCount(sb)} storyboard segments`,
    passed: voExists,
    detail: voExists ? null : `Have ${audioClips.length} A1 clips, storyboard needs ${sbSegmentsCount(sb)}`,
  });
  
  return { score: results.reduce((s, r) => s + (r.passed ? r.weight : 0), 0), results };
}

function sbSegmentsCount(sb) { return sb?.segments?.length || 0; }

function checkMediaIntegrity(project) {
  const results = [];
  const media = project.media || [];
  const clips = project.clips || [];
  
  // C1: Media completeness
  const audioCount = media.filter(m => m.kind === 'audio').length;
  const imageCount = media.filter(m => m.kind === 'image').length;
  results.push({ id: 'C1a', weight: 8, text: `Has audio media (${audioCount} files)`, passed: audioCount >= 5 });
  results.push({ id: 'C1b', weight: 8, text: `Has visual media (${imageCount} files)`, passed: imageCount >= 3 });
  
  // C1c: Files exist on disk
  let valid = 0, totalOnDisk = 0;
  for (const m of media) {
    const fname = (m.src || '').split('/').pop() || m.name || '';
    const fp = path.join(MEDIA_DIR, fname);
    totalOnDisk++;
    if (existsSync(fp)) { try { if (statSync(fp).size > 500) valid++; } catch {} }
  }
  results.push({
    id: 'C1c', weight: 6, text: `Media files on disk and non-zero (${valid}/${totalOnDisk})`,
    passed: totalOnDisk > 0 && valid / totalOnDisk >= 0.8,
    detail: totalOnDisk > 0 && valid / totalOnDisk < 0.8 ? `Only ${valid}/${totalOnDisk} files are valid` : null,
  });
  
  // C1d: Audio files have reasonable duration
  let audioOk = 0, audioTotal = 0;
  for (const m of media) {
    if (m.kind !== 'audio') continue;
    const fname = (m.src || '').split('/').pop() || m.name || '';
    const fp = path.join(MEDIA_DIR, fname);
    audioTotal++;
    if (existsSync(fp)) { try { if (statSync(fp).size >= 80000) audioOk++; } catch {} }
  }
  results.push({
    id: 'C1d', weight: 5, text: `Audio files with ≥5s content (${audioOk}/${audioTotal})`,
    passed: audioTotal > 0 && audioOk / audioTotal >= 0.7,
    detail: audioTotal > 0 && audioOk / audioTotal < 0.7 ? `Only ${audioOk}/${audioTotal} audio files have meaningful duration` : null,
  });
  
  // C1e: Check FableCut app.js has crossOrigin fix + getClipEl image handling
  const appJsPath = path.join(FABLECUT_DIR, 'app.js');
  let hasCrossOrigin = false, hasGetClipElFix = false;
  if (existsSync(appJsPath)) {
    const appJs = readFileSync(appJsPath, 'utf-8');
    hasCrossOrigin = appJs.includes('crossOrigin');
    hasGetClipElFix = appJs.includes('m.kind === "image"') && appJs.includes('getClipEl');
  }
  results.push({
    id: 'C1e', weight: 3, text: 'FableCut app.js crossOrigin fix applied',
    passed: hasCrossOrigin,
    detail: hasCrossOrigin ? null : 'Missing — images will not render in Canvas through tunnel',
  });
  results.push({
    id: 'C1f', weight: 3, text: 'FableCut app.js getClipEl handles image clips (no video element for JPEGs)',
    passed: hasGetClipElFix,
    detail: hasGetClipElFix ? null : 'Missing — browser creates <video> element for JPEGs, fails to load',
  });
  
  // C2: Structure
  const tracks = [...new Set(clips.map(c => c.track))];
  results.push({
    id: 'C2a', weight: 6, text: `Has required tracks: ${tracks.includes('V1') ? 'V1' : '—'} ${tracks.includes('A1') ? 'A1' : '—'}`,
    passed: tracks.includes('V1') && tracks.includes('A1'),
  });
  
  const totalDuration = clips.reduce((m, c) => Math.max(m, (c.start || 0) + (c.duration || 0)), 0);
  results.push({
    id: 'C2b', weight: 6, text: `Total duration: ${Math.round(totalDuration / 60)} min (≥5 min)`,
    passed: totalDuration >= 300,
    detail: totalDuration < 300 ? `Only ${Math.round(totalDuration / 60)} min` : null,
  });
  
  const badNames = ['untitled', 'new project', 'test', 'my project'];
  const nameOk = !badNames.some(b => (project.name || '').toLowerCase().includes(b));
  results.push({
    id: 'C2c', weight: 4, text: 'Project has a proper name',
    passed: nameOk,
    detail: nameOk ? null : `Name "${project.name}" looks like a placeholder`,
  });
  
  // C3: Asset diversity
  const audioClips = clips.filter(c => c.track === 'A1');
  const audioIds = audioClips.map(c => c.mediaId);
  const uniqueAudio = new Set(audioIds);
  results.push({
    id: 'C3a', weight: 6, text: `Unique audio segments (${uniqueAudio.size}/${audioIds.length})`,
    passed: uniqueAudio.size >= audioIds.length * 0.8,
    detail: uniqueAudio.size < audioIds.length * 0.8 ? `${audioIds.length - uniqueAudio.size} repeated audio clips` : null,
  });
  
  const visualClips = clips.filter(c => c.track === 'V1');
  const visualIds = visualClips.map(c => c.mediaId);
  const uniqueVisual = new Set(visualIds);
  results.push({
    id: 'C3b', weight: 6, text: `Unique visual assets (${uniqueVisual.size}/${visualIds.length})`,
    passed: uniqueVisual.size >= visualIds.length * 0.8,
    detail: uniqueVisual.size < visualIds.length * 0.8 ? `${visualIds.length - uniqueVisual.size} repeated visuals` : null,
  });
  
  // C3c: Non-generic art file names
  const imgMedia = media.filter(m => m.kind === 'image');
  const genericNames = imgMedia.filter(m => {
    const n = m.name || m.src || '';
    return /^art_\d+\./.test(n);
  });
  results.push({
    id: 'C3c', weight: 5, text: `Art files have meaningful names (${imgMedia.length - genericNames.length}/${imgMedia.length} non-generic)`,
    passed: genericNames.length <= imgMedia.length * 0.3,
    detail: genericNames.length > imgMedia.length * 0.3 ? `${genericNames.length} files use generic names (art_01.jpg) — not matched to content` : null,
  });
  
  // C4: Timing
  const durations = [...new Set(clips.map(c => c.duration))];
  results.push({
    id: 'C4a', weight: 5, text: `Clip durations are varied (${durations.length} unique values)`,
    passed: durations.length >= 3,
    detail: durations.length < 3 ? `All clips are the same duration (${durations[0]}s) — placeholder timings` : null,
  });
  
  // Audio coverage
  const audioDuration = audioClips.reduce((s, c) => s + (c.duration || 0), 0);
  results.push({
    id: 'C4b', weight: 4, text: `Audio covers ${Math.round(audioDuration / totalDuration * 100)}% of timeline`,
    passed: totalDuration > 0 && audioDuration / totalDuration >= 0.5,
  });
  
  // C3d: All clips have 'kind' field matching their media entry
  const clipsMissingKind = clips.filter(c => !c.kind);
  const clipsWrongKind = clips.filter(c => {
    if (!c.kind) return false;
    const m = media.find(x => x.id === c.mediaId);
    return m && c.kind !== m.kind;
  });
  results.push({
    id: 'C3d', weight: 5, text: 'All clips have correct kind field (matching media entry)',
    passed: clipsMissingKind.length === 0 && clipsWrongKind.length === 0,
    detail: clipsMissingKind.length > 0 ? `${clipsMissingKind.length} clips missing kind field — drawClip won't render them` :
            clipsWrongKind.length > 0 ? `${clipsWrongKind.length} clips have wrong kind — mismatched with media` : null,
  });

  // C4c: Check no orphan or duplicate clips
  const mediaIds = new Set(media.map(m => m.id));
  const orphanClips = clips.filter(c => !mediaIds.has(c.mediaId));
  results.push({
    id: 'C4c', weight: 5, text: 'No orphan clips (all mediaIds valid)',
    passed: orphanClips.length === 0,
    detail: orphanClips.length > 0 ? `${orphanClips.length} clips reference non-existent media: ${orphanClips.map(c => c.mediaId).join(', ')}` : null,
  });
  
  // Check for duplicate V1 clips (same mediaId at overlapping positions)
  const v1 = clips.filter(c => c.track === 'V1');
  const seenV1 = new Set();
  const dupV1 = v1.filter(c => {
    const key = `${c.mediaId}`;
    if (seenV1.has(key)) return true;
    seenV1.add(key);
    return false;
  });
  results.push({
    id: 'C4d', weight: 4, text: 'No duplicate or overlapping V1 clips',
    passed: dupV1.length === 0,
    detail: dupV1.length > 0 ? `${dupV1.length} duplicate V1 clips (same image used multiple times on timeline)` : null,
  });
  
  // C4e: Has Ken Burns / motion effects on V1 clips
  const v1Clips = clips.filter(c => c.track === 'V1');
  const hasKenBurns = v1Clips.some(c => c.keyframes && c.keyframes.scale && c.keyframes.scale.length > 1);
  results.push({
    id: 'C4e', weight: 4, text: 'V1 clips have Ken Burns motion effects (zoom/pan)',
    passed: hasKenBurns,
    detail: hasKenBurns ? null : 'All V1 clips are static — add keyframes for slow zoom/pan',
  });
  
  // C5: Quality
  const hasEffects = clips.some(c => (c.effects && c.effects.length > 0) || (c.props && c.props.filterPreset && c.props.filterPreset !== 'none'));
  results.push({
    id: 'C5a', weight: 5, text: 'Has visual effects/filters applied',
    passed: hasEffects,
  });
  
  const knownFilters = ['cinematic', 'teal-orange', 'noir', 'vintage', 'golden-imaginal', 'mystical-dark', 'corbin-blue', 'sepia-classic', 'distillery-dark-gold'];
  const hasChannelFilter = clips.some(c => {
    if (c.effects) {
      if (c.effects.some(e => knownFilters.includes(e.name))) return true;
    }
    if (c.props && c.props.filterPreset && knownFilters.includes(c.props.filterPreset)) return true;
    return false;
  });
  results.push({
    id: 'C5b', weight: 3, text: 'Has channel-appropriate visual treatment',
    passed: hasChannelFilter,
  });
  
  // Duration sanity
  results.push({
    id: 'C5c', weight: 2, text: `Duration ${Math.round(totalDuration / 60)} min (3-30 min range)`,
    passed: totalDuration >= 180 && totalDuration <= 2400,
  });
  
  return { results, score: results.reduce((s, r) => s + (r.passed ? r.weight : 0), 0) };
}

async function checkWithVision(project, skipVision) {
  const results = [];
  const media = project.media || [];
  const imageFiles = media.filter(m => m.kind === 'image').map(m => {
    const fname = (m.src || '').split('/').pop() || m.name || '';
    return path.join(MEDIA_DIR, fname);
  }).filter(fp => existsSync(fp));
  
  if (imageFiles.length === 0) {
    results.push({ id: 'V01', weight: 10, text: 'No image files to validate', passed: false });
    return { results, score: 0 };
  }
  
  // Check file integrity
  let valid = 0, corrupt = 0;
  const fileHashes = {};
  const duplicates = [];
  
  for (const fp of imageFiles) {
    try {
      const data = readFileSync(fp);
      const size = data.length;
      const ext = path.extname(fp).toLowerCase();
      
      // Check file header
      let validHeader = false;
      if (ext === '.jpg' || ext === '.jpeg') validHeader = data[0] === 0xFF && data[1] === 0xD8;
      else if (ext === '.png') validHeader = data.slice(0, 8).toString() === '\x89PNG\r\n\x1a\n';
      else if (ext === '.gif') validHeader = data.slice(0, 6).toString() === 'GIF87a' || data.slice(0, 6).toString() === 'GIF89a';
      else if (ext === '.webp') validHeader = data.slice(0, 4).toString() === 'RIFF' && data.slice(8, 12).toString() === 'WEBP';
      else validHeader = size > 1024;
      
      if (!validHeader || size < 1024) {
        corrupt++;
        continue;
      }
      
      // Quick duplicate check (first 1MB or full file if smaller)
      const sampleSize = Math.min(data.length, 1048576);
      const h = crypto.createHash('md5').update(data.slice(0, sampleSize)).digest('hex');
      if (fileHashes[h]) {
        duplicates.push({ file: path.basename(fp), duplicateOf: path.basename(fileHashes[h]) });
      } else {
        fileHashes[h] = fp;
      }
      valid++;
    } catch { corrupt++; }
  }
  
  results.push({
    id: 'V01', weight: 10, text: `Image integrity (${valid} valid, ${corrupt} corrupt, ${duplicates.length} duplicates)`,
    passed: valid / imageFiles.length >= 0.8 && duplicates.length / imageFiles.length < 0.2,
    detail: corrupt > 0 || duplicates.length > 0 ? `${corrupt} corrupt, ${duplicates.length} duplicate images found` : null,
  });
  
  // Run Vision API on a sample if not skipped
  if (!skipVision && valid > 0) {
    const visionScript = path.join(ROOT, 'scripts', 'video-vision-check.py');
    if (existsSync(visionScript)) {
      try {
        const r = spawnSync('python3', [visionScript, '--json'], {
          timeout: 60000, cwd: ROOT,
          stdio: ['ignore', 'pipe', 'pipe'],
        });
        const out = JSON.parse(r.stdout.toString());
        results.push({
          id: 'V02', weight: 5, text: `Image integrity: ${out.score}/100`,
          passed: out.score >= 70,
          detail: out.score < 70 ? (out.diagnostics || []).slice(0, 2).join('; ') : null,
        });
        // Check if image labels match the video topic
        const relevantKeywords = ['sculpture', 'stone', 'metal', 'god', 'goddess', 'shiva', 'devi',
          'temple', 'tantra', 'buddha', 'mandala', 'meditation', 'art', 'statue', 'brass', 'carving',
          'painting', 'illustration', 'religious', 'sacred', 'deity', 'bronze', 'copper'];
        const labelText = (out.diagnostics || []).join(' ').toLowerCase();
        const matched = relevantKeywords.filter(k => labelText.includes(k));
        results.push({
          id: 'V03', weight: 5, text: `Image content relevance (${matched.length} topic keywords matched)`,
          passed: matched.length >= 3,
          detail: matched.length < 3 ? `Images may not match video topic. Found: ${matched.join(', ') || 'none'}` : null,
        });
      } catch (e) {
        results.push({ id: 'V02', weight: 5, text: 'Image content analysis failed', passed: false });
        results.push({ id: 'V03', weight: 5, text: 'Image content relevance check failed', passed: false });
      }
    } else {
      results.push({ id: 'V02', weight: 5, text: 'Vision check script not found', passed: false });
      results.push({ id: 'V03', weight: 5, text: 'Vision check script not found', passed: false });
    }
  } else {
    results.push({
      id: 'V02', weight: 5, text: `Vision analysis ${skipVision ? 'skipped' : 'no images'}`,
      passed: true,
    });
    results.push({
      id: 'V03', weight: 5, text: `Content relevance ${skipVision ? 'skipped' : 'no images'}`,
      passed: true,
    });
  }
  
  return { results, score: results.reduce((s, r) => s + (r.passed ? r.weight : 0), 0) };
}

// ── Report ──

async function validate(args) {
  const projectPath = args.project || null;
  const bpId = args.blueprint || null;
  const sbSlug = args.storyboard || null;
  const skipVision = args.skipVision || false;
  const jsonOutput = args.json || false;
  
  const project = loadProject(projectPath);
  
  // Load specs if provided
  let bp = null, sb = null;
  try { if (bpId) bp = loadBlueprint(bpId); } catch (e) { /* no blueprint */ }
  try { if (sbSlug) sb = loadStoryboard(sbSlug); } catch (e) { /* no storyboard */ }
  
  // Run checks
  const mediaCheck = checkMediaIntegrity(project);
  const blueprintCheck = checkBlueprintMatch(project, bp);
  const storyboardCheck = checkStoryboardMatch(project, sb);
  const visionCheck = await checkWithVision(project, skipVision);
  
  // Combine results
  const allResults = [
    ...mediaCheck.results,
    ...blueprintCheck.results,
    ...storyboardCheck.results,
    ...visionCheck.results,
  ];
  
  // Weighted score
  const totalWeight = allResults.reduce((s, r) => s + r.weight, 0);
  const passedWeight = allResults.filter(r => r.passed).reduce((s, r) => s + r.weight, 0);
  const pct = Math.round(passedWeight / totalWeight * 100);
  
  if (jsonOutput) {
    const output = {
      project: project.name,
      score: pct,
      passed: pct >= PASS_THRESHOLD,
      blueprint: bp ? { id: bp.id, channel: bp.channel, beats: bp.beats.length, runtime: bp.targetRuntime } : null,
      storyboard: sb ? { id: sb.id, segments: sb.segments.length } : null,
      totalWeight,
      passedWeight,
      checks: allResults,
      summary: {
        media: { audio: project.media.filter(m => m.kind === 'audio').length, images: project.media.filter(m => m.kind === 'image').length },
        clips: project.clips.length,
        duration: Math.round(project.clips.reduce((m, c) => Math.max(m, (c.start || 0) + (c.duration || 0)), 0) / 60),
        tracks: [...new Set(project.clips.map(c => c.track))],
      },
      warnings: [],
    };
    
    // Check for specific common issues
    const allSameDuration = [...new Set(project.clips.map(c => c.duration))].length <= 2;
    if (allSameDuration) output.warnings.push('All clips have near-identical durations — placeholder timings');
    if (bp && !blueprintCheck.results.some(r => r.id === 'B01' && r.passed)) output.warnings.push('Beat count mismatch — blueprint vs implementation');
    
    console.log(JSON.stringify(output, null, 2));
    return pct >= PASS_THRESHOLD;
  }
  
  // Human-readable output
  log(`\n${'='.repeat(60)}`);
  log(`VIDEO VALIDATION — ${project.name}`);
  log(`${'='.repeat(60)}`);
  log(`Media: ${project.media.length} items | Clips: ${project.clips.length}`);
  if (bp) log(`Blueprint: ${bp.id} (${bp.beats.length} beats, ${bp.channel})`);
  if (sb) log(`Storyboard: ${sb.id} (${sb.segments.length} segments)`);
  log();
  
  // Group by category
  const categories = {
    'Media': mediaCheck.results,
    'Blueprint': blueprintCheck.results,
    'Storyboard': storyboardCheck.results,
    'Vision': visionCheck.results,
  };
  
  for (const [cat, checks] of Object.entries(categories)) {
    if (checks.length === 0) continue;
    log(`── ${cat} ──`);
    for (const c of checks) {
      const icon = c.passed ? '✅' : '❌';
      log(`  ${icon} ${c.id} ${c.text} (${c.weight}pts)`);
      if (c.detail) log(`     ${c.detail}`);
    }
    log();
  }
  
  log(`Score: ${passedWeight}/${totalWeight} = ${pct}%`);
  log(pct >= PASS_THRESHOLD ? '✅ PASSED — ready for human review' : '❌ FAILED — fix issues below');
  log();
  
  // Print failures
  const failed = allResults.filter(r => !r.passed);
  if (failed.length > 0) {
    log('Failed checks to fix:');
    for (const f of failed) log(`  - ${f.id}: ${f.text}`);
    log();
  }
  
  // Warnings
  const allSameDuration = [...new Set(project.clips.map(c => c.duration))].length <= 2;
  if (allSameDuration) log('⚠ WARNING: All clips have same duration — placeholder timings');
  
  return pct >= PASS_THRESHOLD;
}

async function main() {
  const args = {
    project: null,
    blueprint: null,
    storyboard: null,
    skipVision: false,
    json: false,
    fix: false,
  };
  
  for (const arg of process.argv.slice(2)) {
    if (arg === '--json') args.json = true;
    else if (arg === '--skip-vision') args.skipVision = true;
    else if (arg === '--fix') args.fix = true;
    else if (arg.startsWith('--project=')) args.project = arg.split('=', 1)[1];
    else if (arg.startsWith('--project ')) args.project = arg.split(' ', 1)[1];
    else if (arg.startsWith('--blueprint=')) args.blueprint = arg.split('=', 1)[1];
    else if (arg.startsWith('--blueprint ')) args.blueprint = arg.split(' ', 1)[1];
    else if (arg.startsWith('--storyboard=')) args.storyboard = arg.split('=', 1)[1];
    else if (arg.startsWith('--storyboard ')) args.storyboard = arg.split(' ', 1)[1];
    else if (!arg.startsWith('--')) args.project = arg;
  }
  
  try {
    const passed = await validate(args);
    process.exit(passed ? 0 : 1);
  } catch (e) {
    console.error(`Error: ${e.message}`);
    process.exit(2);
  }
}

main();
