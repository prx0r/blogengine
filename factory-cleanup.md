# Factory Cleanup — What's Left to Wire

## The Raw Infra (What Makes the Factory Repeatable)

The factory is seven things. Nothing more:

```
1. OBJECT TYPES    — RO, CO, SO, Essay, Concept (defined in factory-manual.md)
2. SCHEMAS         — JSON structures for each type (work.schema.json, ro-schema-spec.md)
3. VALIDATION      — binary gates (factory-spec.md, validate-essay-pass.py, factory-audit.py)
4. REGISTRY        — tracks what links to what (essay-registry.json, link-silos.py)
5. QUEUE           — decides what to process next (ro-queue.json, monitor-ros.py)
6. SKILLS          — Hermes instructions (factory-pipeline, write, publish-video-fablecut)
7. EXECUTION       — cron (video-pipeline every 6h)
```

To replicate for a new domain (e.g. neuroscience):
1. Copy the seven things above
2. Change acquisition sources (PubMed instead of blueprints/)
3. Change concept taxonomy (consciousness instead of tantra)
4. Everything else stays the same

## Current Gaps (Need Cleaning)

### Gap 1: Concept → RO links (69 of 76 concepts unlinked)
```bash
python3 hypothetical-integrated/scripts/link-silos.py  # run for real
```
This populates `concept.research_objects[]` by matching RO topics. Safe to run.

### Gap 2: Concept → Art links (61 of 76 concepts unlinked)
Art entries already have `concepts[]` fields (371 of 904 populated). But concepts don't have `art[]` backlinks. The `link-silos.py` doesn't handle this yet.

**Fix:** A one-time script that reads each art entry's `concepts[]`, finds the matching concept JSON, and adds the art ID to `concept.art[]`.

### Gap 3: Art → Essay links (0 of 904 art entries have `used_in`)
Essays can embed art blocks (`kind: "art"`, `art_id: "..."`) but don't register in the art entry. The `used_in` field on art is never populated.

**Fix:** Scan all essays for `kind: "art"` blocks, add `art_id` to essay body, add `essay_id` to art.used_in[].

### Gap 4: Essay → RO traceability (0% of source blocks have ro_passage_id)
The biggest gap. Without this, we can't track which passages from which ROs get used in which essays.

**Fix:** Update the write skill to require `ro_passage_id` on every `kind: "source"` block. The validate-essay-pass.py script already has this — it just needs to be enforced in the skill instructions with the same blocking behavior as the 3-pass gates.

### Gap 5: CX-Train vs Blog path
Hermes defaults to `/root/projects/CX-Train` as project root instead of `/root/projects/blog`.

**Fix:** The cron job already has `--workdir /root/projects/blog` set. The CLI `--skills write` doesn't inherit workdir. Running via cron is the reliable path.

## The Feedback Loop (How Concepts Inspire New ROs)

```
YouTube Analytics
  ↓
Which topics retained viewers? Which lost them?
  ↓
Map topic → concept in glossary
  ↓
concept.performance_score updated (mock: based on related video retention)
  ↓
Factory queue reprioritized:
  - High-performing concepts → fast-track related ROs
  - Low-performing concepts → audit RO quality
  - Untouched concepts with high demand → create new RO
  ↓
Hermes sees: "concept:daimon has high demand, no RO → create ro:daimon-modern"
  ↓
New RO enters pipeline → essay → video → analytics → loop continues
```

## How the Feedback Loop Works (Technical)

```python
# Pseudocode for the feedback loop
def update_concept_priority(analytics_data):
    for concept in all_concepts:
        # Find all videos related to this concept
        related_videos = find_videos_by_concept(concept.id)
        if not related_videos:
            continue
        # Average retention across those videos
        concept.performance_score = avg_retention(related_videos)
        concept.video_count = len(related_videos)
        # If high-performing and under-produced → boost in queue
        if concept.performance_score > 0.7 and concept.video_count < 3:
            fast_track_ros_for_concept(concept.id)
```

## Cleaning Order (What to Do Next)

```
Step 1: Run link-silos.py for real
  → populates concept → RO links
  → populates work → RO links
  → takes ~30 seconds

Step 2: Populate concept → art links
  → one-time script: for each art entry, read concepts[], add art_id to concept JSON
  → takes ~10 seconds

Step 3: Add E09/E10 enforcement to write skill
  → "every source block must have ro_passage_id"
  → already documented, just needs blocking instruction

Step 4: Run the cron and let it process one full RO→essay→video cycle
  → proves the loop is closed

After that: the factory is repeatable. Copy the 7 infra pieces, point at new content.
```
