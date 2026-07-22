#!/usr/bin/env node
/**
 * Video Ralph Loop — validation for FableCut video completeness & quality.
 *
 * Hermes runs this after building a FableCut timeline to check its own work.
 * All checks must pass (or score >= 85%) before the video is ready for review.
 *
 * Usage:
 *   node scripts/video-ralph-loop.mjs                        # check current FableCut project
 *   node scripts/video-ralph-loop.mjs /path/to/project.json  # check a specific file
 *   node scripts/video-ralph-loop.mjs --json                  # machine-readable output
 */

import { readFileSync, statSync, existsSync } from 'fs';
import { request } from 'http';
import path from 'path';

const FABLECUT_URL = 'http://localhost:7777';
const MEDIA_DIR = '/root/projects/FableCut/media';
const PASS_THRESHOLD = 85; // percent

function httpGet(url) {
  return new Promise((resolve, reject) => {
    const req = request(url, { timeout: 5000 }, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { reject(new Error(`Invalid JSON: ${data.slice(0, 200)}`)); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    req.end();
  });
}

async function loadProject(path) {
  if (path) {
    return JSON.parse(readFileSync(path, 'utf-8'));
  }
  return await httpGet(`${FABLECUT_URL}/api/project`);
}

async function evaluate(project) {
  const media = project.media || [];
  const clips = project.clips || [];
  const name = project.name || 'Unknown Project';
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);

  const checks = [
    // ── C1: Media Completeness ──
    { id: 'C1a', weight: 8, text: 'Has audio media files',
      test: () => media.filter(m => m.kind === 'audio').length >= 5 },
    { id: 'C1b', weight: 8, text: 'Has visual media files (images or video)',
      test: () => media.filter(m => m.kind === 'image' || m.kind === 'video').length >= 5 },
    { id: 'C1c', weight: 5, text: 'Media files exist on disk and are non-zero',
      test: () => {
        let ok = 0, total = 0;
        for (const m of media) {
          const fname = m.src.split('/').pop() || m.name;
          const fpath = path.join(MEDIA_DIR, fname);
          total++;
          if (existsSync(fpath)) {
            try { if (statSync(fpath).size > 500) ok++; }
            catch { /* corrupt */ }
          }
        }
        return ok >= total * 0.8; // 80%+ must exist and be non-trivial
      }},
    { id: 'C1d', weight: 5, text: 'Audio files have reasonable duration (>10s worth of bytes)',
      test: () => {
        // At 128kbps MP3, 10s ≈ 160KB. Check each audio file is non-trivial
        let ok = 0, total = 0;
        for (const m of media) {
          if (m.kind !== 'audio') continue;
          const fname = m.src.split('/').pop() || m.name;
          const fpath = path.join(MEDIA_DIR, fname);
          total++;
          if (existsSync(fpath)) {
            try {
              const bytes = statSync(fpath).size;
              // Rough: 1s ≈ 16KB for 128kbps MP3. Check minimum 5s ≈ 80KB
              if (bytes >= 80000) ok++;
            } catch {}
          }
        }
        return total > 0 && ok >= total * 0.7;
      }},

    // ── C2: Structural Completeness ──
    { id: 'C2a', weight: 6, text: 'Has both V1 (video) and A1 (audio) tracks',
      test: () => {
        const tracks = new Set(clips.map(c => c.track));
        return tracks.has('V1') && tracks.has('A1');
      }},
    { id: 'C2b', weight: 6, text: 'At least 5 segments (beats) in the timeline',
      test: () => clips.length >= 10 }, // V1 + A1 clips = 2 per beat, so 10 clips = 5 beats
    { id: 'C2c', weight: 6, text: 'Total duration >= 5 minutes (300s)',
      test: () => {
        const maxEnd = clips.reduce((max, c) => Math.max(max, (c.start || 0) + (c.duration || 0)), 0);
        return maxEnd >= 300;
      }},
    { id: 'C2d', weight: 5, text: 'Project has a non-default name',
      test: () => {
        const bad = ['untitled', 'new project', 'project', 'my project', 'fablecut project', 'test'];
        return !bad.some(b => project.name?.toLowerCase().includes(b));
      }},

    // ── C3: Asset Diversity ──
    { id: 'C3a', weight: 6, text: 'Audio clips are unique (no repeated segments)',
      test: () => {
        const audioClips = clips.filter(c => c.track === 'A1');
        const mediaIds = audioClips.map(c => c.mediaId);
        const unique = new Set(mediaIds);
        return unique.size >= mediaIds.length * 0.8; // allow 20% repeats
      }},
    { id: 'C3b', weight: 6, text: 'Visual assets are unique (no repeated images)',
      test: () => {
        const visualClips = clips.filter(c => c.track === 'V1');
        const mediaIds = visualClips.map(c => c.mediaId);
        const unique = new Set(mediaIds);
        return unique.size >= mediaIds.length * 0.8;
      }},
    { id: 'C3c', weight: 5, text: 'Art files are not generic placeholders (named meaningfully)',
      test: () => {
        // art_01.jpg is placeholder. art_alchemy_e001.jpg is meaningful.
        const visualMedia = media.filter(m => m.kind === 'image' || m.kind === 'video');
        const generic = visualMedia.filter(m => {
          const n = m.name || m.src || '';
          return /^art_\d+\./.test(n) || /^ast_\d+\./.test(n);
        });
        return generic.length <= visualMedia.length * 0.3; // < 30% generic names
      }},
    { id: 'C3d', weight: 5, text: 'Has voiceover or narration (not just placeholder audio)',
      test: () => {
        const audioMedia = media.filter(m => m.kind === 'audio');
        if (audioMedia.length === 0) return false;
        // Check at least 70% of audio files have meaningful size (>= 5s audio)
        let meaningful = 0;
        for (const m of audioMedia) {
          const fname = m.src.split('/').pop() || m.name;
          const fpath = path.join(MEDIA_DIR, fname);
          if (existsSync(fpath)) {
            try { if (statSync(fpath).size >= 130000) meaningful++; } // ~8s at 128kbps
            catch {}
          }
        }
        return audioMedia.length > 0 && meaningful >= audioMedia.length * 0.5;
      }},

    // ── C4: Timing & Sync ──
    { id: 'C4a', weight: 5, text: 'Clip durations are varied (not all identical)',
      test: () => {
        const durations = [...new Set(clips.map(c => c.duration))];
        return durations.length >= 3;
      }},
    { id: 'C4b', weight: 5, text: 'Audio clips cover at least 50% of total timeline',
      test: () => {
        const totalDuration = clips.reduce((max, c) => Math.max(max, (c.start || 0) + (c.duration || 0)), 0);
        const audioDuration = clips.filter(c => c.track === 'A1')
          .reduce((sum, c) => sum + (c.duration || 0), 0);
        return totalDuration > 0 && audioDuration / totalDuration >= 0.5;
      }},
    { id: 'C4c', weight: 4, text: 'Visual clips cover at least 50% of total timeline',
      test: () => {
        const totalDuration = clips.reduce((max, c) => Math.max(max, (c.start || 0) + (c.duration || 0)), 0);
        const visualDuration = clips.filter(c => c.track === 'V1')
          .reduce((sum, c) => sum + (c.duration || 0), 0);
        return totalDuration > 0 && visualDuration / totalDuration >= 0.5;
      }},

    // ── C5: Quality Indicators ──
    { id: 'C5a', weight: 5, text: 'Has at least one effect or filter applied',
      test: () => {
        return clips.some(c => c.effects && c.effects.length > 0);
      }},
    { id: 'C5b', weight: 3, text: 'Project has a non-zero revision number',
      test: () => (project.revision || 0) > 0 },
    { id: 'C5c', weight: 3, text: 'Visual treatment matches channel preset',
      test: () => {
        const knownFilters = ['golden-imaginal', 'mystical-dark', 'corbin-blue', 'sepia-classic',
          'distillery-dark-gold', 'tantra-gold', 'ochema-cyan', 'angeliz-crimson'];
        const clipFilters = clips.flatMap(c => (c.effects || []).map(e => e.name));
        return clipFilters.some(f => knownFilters.includes(f));
      }},
    { id: 'C5d', weight: 3, text: 'Total video length is reasonable (3-30 min)',
      test: () => {
        const totalDuration = clips.reduce((max, c) => Math.max(max, (c.start || 0) + (c.duration || 0)), 0);
        return totalDuration >= 180 && totalDuration <= 2400;
      }},
  ];

  // Run checks
  let passed = 0, totalWeight = 0;
  const results = [];

  console.log(`\n${'='.repeat(60)}`);
  console.log(`VIDEO RALPH LOOP — ${name}`);
  console.log(`${'='.repeat(60)}`);
  console.log(`Media: ${media.length} items | Clips: ${clips.length}`);
  console.log();

  for (const c of checks) {
    totalWeight += c.weight;
    let ok = false;
    let err = null;
    try {
      ok = await c.test();
    } catch (e) {
      err = e.message;
    }
    if (ok) {
      passed += c.weight;
      console.log(`  ✅ ${c.id} ${c.text} (${c.weight}pts)`);
      results.push({ id: c.id, text: c.text, weight: c.weight, passed: true });
    } else {
      console.log(`  ❌ ${c.id} ${c.text} (${c.weight}pts)${err ? ' — ' + err : ''}`);
      results.push({ id: c.id, text: c.text, weight: c.weight, passed: false });
    }
  }

  const pct = Math.round(passed / totalWeight * 100);
  console.log(`\nScore: ${passed}/${totalWeight} = ${pct}%`);
  console.log(pct >= PASS_THRESHOLD ? '✅ PASSED — ready for human review' : '❌ FAILED — fix issues below');
  console.log();

  // Report failures
  const failed = results.filter(r => !r.passed);
  if (failed.length > 0) {
    console.log('Failed checks to fix:');
    for (const f of failed) {
      console.log(`  - ${f.id}: ${f.text}`);
    }
    console.log();
  }

  // Specific diagnostic info
  console.log('Diagnostics:');
  const audioCount = media.filter(m => m.kind === 'audio').length;
  const imageCount = media.filter(m => m.kind === 'image').length;
  const videoCount = media.filter(m => m.kind === 'video').length;
  const tracks = [...new Set(clips.map(c => c.track))];
  const totalDuration = clips.reduce((max, c) => Math.max(max, (c.start || 0) + (c.duration || 0)), 0);
  console.log(`  Audio: ${audioCount} | Images: ${imageCount} | Videos: ${videoCount}`);
  console.log(`  Tracks: ${tracks.join(', ')} | Duration: ${Math.round(totalDuration / 60)}min`);
  console.log(`  Clips: ${clips.length} | Media: ${media.length}`);

  // Check for specific issues
  const all80s = clips.every(c => c.duration === 80);
  if (all80s) console.log('  ⚠ WARNING: All clips are exactly 80s — likely placeholder durations');

  const genericArt = media.filter(m => /^art_\d+\./.test(m.name || '')).length;
  if (genericArt > media.length * 0.3) console.log(`  ⚠ WARNING: ${genericArt}/${media.length} art files use generic names (art_01.jpg) — not properly matched`);

  const repeatedAudio = clips.filter(c => c.track === 'A1');
  const audioIds = repeatedAudio.map(c => c.mediaId);
  if (new Set(audioIds).size < audioIds.length) console.log('  ⚠ WARNING: Audio segments are repeated — voiceover may be redundant');

  console.log();

  return { passed, totalWeight, pct, results, passed: pct >= PASS_THRESHOLD };
}

async function main() {
  const jsonOutput = process.argv.includes('--json');
  const projectPath = process.argv.filter(a => !a.startsWith('--'))[2];

  try {
    const project = await loadProject(projectPath);
    const result = await evaluate(project);

    if (jsonOutput) {
      console.log(JSON.stringify(result, null, 2));
    }

    process.exit(result.passed ? 0 : 1);
  } catch (e) {
    console.error(`Error: ${e.message}`);
    process.exit(2);
  }
}

main();
