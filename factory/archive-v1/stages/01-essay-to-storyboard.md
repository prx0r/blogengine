# Stage 1: Essay → Storyboard

**Script:** `01-essay-to-storyboard.py` (symlink → `scripts/visual-director.py`)

## Purpose

Convert a raw expansion essay markdown file into a structured Edit Decision List (EDL) with rhetorical beats that map to visual treatments.

## Input

A markdown file from `scripts/expansion-essay*.md` — these are ~200-500 line expanded essays with sections, quotations, and philosophical exposition.

## Output

Two files in `content/publishing/storyboards/`:
- `{essay-name}.json` — machine-readable EDL
- `{essay-name}.md` — human-readable EDL

## How It Works

1. **Parse rhetorical structure** — identifies hook, establish, define, analogy, quotation, chain, climax, closing sections in the essay markdown
2. **Map to visual treatments** — uses `VISUAL_GRAMMAR` dict that maps each rhetorical function to:
   - `visual_treatment` (abstract_diagram, manuscript_quote, diagram_unfold, etc.)
   - `camera` (holds_on_center, slow_push, pan_across_diagram, etc.)
   - `art_requirement` (manuscript_or_portrait, paired_images, etc.)
   - `text_style` (emphasis_phrase, sanskrit_term, numbered_list, etc.)
   - `duration_range` (min/max seconds)
   - `transition_out` (fade_to_white, dissolve, cut_to_center, etc.)
   - `forbidden` (list of disallowed treatments)
3. **Output EDL** — JSON array of scene objects

## Example Output

```json
{
  "essay": "expansion-essay1.md",
  "total_scenes": 9,
  "total_duration_seconds": 137.0,
  "scenes": [
    {
      "scene_id": "scene-01",
      "rhetorical_function": "hook",
      "narration_excerpt": "# the engine of consciousness",
      "visual_treatment": "abstract_diagram",
      "camera": "holds_on_center",
      "duration_seconds": 11.5,
      "transition_out": "fade_to_white"
    }
  ]
}
```

## Usage

```bash
cd /root/projects/blog/factory

# Process a specific essay
python3 01-essay-to-storyboard.py ../scripts/expansion-essay1.md

# Process a different essay
python3 01-essay-to-storyboard.py ../scripts/expansion-essay5.md
```

## Visual Grammar Reference

| Rhetorical Function | Default Treatment | Typical Duration |
|--------------------|-------------------|-----------------|
| hook | abstract_diagram | 10-15s |
| establish | manuscript_quote | 12-20s |
| define | diagram_unfold | 15-25s |
| analogy | split_screen | 15-22s |
| quotation | text_on_manuscript | 12-20s |
| image_visceral | full_bleed_artwork | 10-18s |
| chain | geometric_reveal | 12-22s |
| climax | concentric_reveal | 15-25s |
| closing | return_to_center | 10-15s |

## What to Check

- Each segment has `rhetorical_function` and `duration_seconds`
- Total duration seems reasonable for the essay length
- Hook and closing scenes are present
- No duplicate scene IDs
