# Platinum Feedback 2 — Architecture & Timing Diagnosis

> *"Hermes is good at designing a film's governing world, but poor at converting prose duration into cinematic event density."*

## The Core Diagnosis

The essay-11 result has a **good film direction document and a bad editing plan**. Do not throw away the former because the latter failed.

**14 shots over 600 seconds = 43 seconds per shot.** Gold packs:
- *Stones Are Watching*: 106 shots / 698s = **6.6s per shot**
- *You Existed Before Earth*: 75 shots / 456s = **6.1s per shot**

For a 595-word essay (~4 min at 150 wpm), gold pacing gives ~37 shots (240s ÷ 6.5s). The correct range is ~30-48 shots, not 14.

## What To Keep

✓ Two-agent split (designer + renderer)
✓ Controller state machine
✓ Three competing visual worlds
✓ visual_audio_alignment field
✓ bad_first_visual + rejected_because
✓ Motif manufacturability scoring
✓ Adversarial review
✓ Canonical pack structure

## What To Change

### 1. Separate macro-design from micro-design

**Problem:** Hermes is asked to produce 75 fully reasoned shots in one response. Long generation invites: depth at beginning + filler at end, or repetition disguised as elaborate names.

**Fix:** Three design scales:

**Scale A — Film intelligence** (one Hermes call)
- Three visual worlds
- Selected world + palette + systems + chapters
- Opening/closing image + forbidden clichés

**Scale B — Visual beats** (deterministic/lightweight agent)
- Provisional cinematic beats from exact narration
- Identifies: spoken interval, rhetorical function, before/operation/after, continuity, ideal duration
- NO motif invention — purely editorial analysis

**Scale C — Shot invention** (Hermes in small batches)
- 8-12 adjacent beats per call
- Receives: film thesis, visual systems, previous batch ending, next batch opening
- Designs concrete shots for that batch only

### 2. Timing enforcement

Generate audio BEFORE storyboarding. Use actual duration:

```python
recommended_count = round(audio_duration / 6.5)
minimum_count = ceil(audio_duration / 9.0)
maximum_count = floor(audio_duration / 4.0)
```

Hard constraints:
- Median duration 5-8 seconds
- 90th percentile ≤11 seconds
- Absolute max 12 seconds (exceptional: 18)
- Shots over 20 seconds = automatic failure

### 3. Reduce expensive Hermes calls

13 controller states but only 4-6 LLM calls:
- Call 1: Rhetorical map + research
- Call 2: Film visual direction (worlds, thesis, systems)
- Machine: Audio segmentation + provisional beats (NO Hermes)
- Calls 3A-N: Batched shot design (8-12 per call)
- Call 4: Global storyboard critic
- Call 5: Zeus render planning

### 4. Add shot-expansion stage

Insert CHAPTER BEAT EXPANSION between thesis and shot list.

Each chapter needs:
- Starting visual state
- New operation entering
- System role change
- Failure/limitation
- Irreversible transformation
- Object/motion crossing to next chapter

Then each rhetorical paragraph expands: establish → perturb → reveal limitation → reorganise → resolve → handoff

This turns 14 scenes into 35-60 shots without filler.

### 5. Scene-event originality over motif count

Track: object diversity, transformation diversity, composition diversity, material-state diversity.

A good film might have: 6 systems, 15 objects, 25 verbs, 10 compositions, 40 events.

### 6. Two-layer motif naming

```json
{
  "motif_id": "interior_flame",
  "display_name": "Flame within the uncut gem",
  "philosophical_role": "self-manifest activity prior to differentiated perspectives"
}
```

Short function names: `scene_017_interior_flame`

### 7. Three review layers

1. **Hero storyboard** — 16 selected frames (art direction)
2. **Contact sheet** — one frame per shot (repetition QC)
3. **Motion strips** — 4 frames per shot at t=0.08, 0.36, 0.68, 0.94 (animation QC)

### 8. Shot necessity field

Add `new_shot_justification`: why this should be a new shot rather than part of previous. Reject for: "to maintain pacing", "to add variety", "new sentence begins". Valid: new subject, new logical operation, reversal, scale change, resolution, continuity handoff.

### 9. Hold vs cut decision

Classify each beat: CUT (new shot), PHASE (internal phase), HOLD (deliberate hold), OVERLAP (next begins while prior persists).

### 10. Production modes

```json
{
  "production_mode": "film_pack",
  "target_shot_duration": 6.5
}
```

vs animation_pack with target 9.0 and minimum 3 phases per shot.

### 11. The crystal/flame hybrid fix

Assign hierarchically: crystal = spatial structure, flame = self-presence/activity, gold thread = continuity. The hybrid has philosophical necessity, not just aesthetic blend.

### 12. Architecture first, prompts second, expectations third

The smallest reliable system:

1. Exact narration + audio generation
2. Deterministic 5-10s semantic segmentation
3. Hermes film-level visual thesis
4. Hermes chapter-batched shot design
5. Hard storyboard validator
6. Zeus adversarial review
7. Low-resolution render
8. Contact-sheet + motion-strip QC
9. Local shot repair
10. Final render

## Immediate Changes

1. Add `production_mode` to job config
2. Generate reference narration before storyboard timing
3. Add duration-derived shot-count bounds to controller
4. Split `storyboard` into `provisional_beats` and `designed_shots`
5. Make Hermes design shots in chapter batches
6. Add `new_shot_justification`
7. Add animation phase plans to storyboard template
8. Separate motif ID from display name
9. Define crystal/flame hierarchy explicitly
10. Generate motion strips in addition to contact sheets
11. Make Zeus review only after structural timing validation passes
12. Keep 13 states but reduce Hermes calls to ~5
