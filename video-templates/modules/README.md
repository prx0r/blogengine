# Video Modules

Reusable visual components. Each module has a JSON spec in this directory.
Selection is deterministic — a module is chosen by matching the trigger rules
against the segment's label and narration text.

## Module Index

| Module JSON | Trigger | Duration | Output |
|-------------|---------|----------|--------|
| `quote-card.json` | narration has `"..."` or role is `quote` | 8-20s | Generated dark image with quote |
| `quote-image.json` | quotes + matching art exists | 10-18s | Art with overlaid quote text |
| `text-on-black.json` | hook/closing/reversal/synthesis | 6-12s | Key claim on dark background |
| `full-bleed-art.json` | default (fallback) | 8-25s | Art + Ken Burns, no text |
| `portrait-focus.json` | label: portrait/figure/guru/master | 10-18s | Tight face crop, gentle zoom |
| `detail-zoom.json` | label: detail/close/object/artifact | 8-15s | Extreme close-up, push zoom |
| `lower-third.json` | first mention of proper noun | 6-10s | Name overlay on V2 |
| `map-diagram.json` | label: map/geography/lineage/diagram | 12-20s | Wide art with left-right pan |
| `side-by-side.json` | label: compare/contrast/versus | 12-20s | Two images, 50/50 split |
| `timeline.json` | label: timeline/sequence/chronology | 15-25s | Generated timeline graphic |

## Selection Logic

Applied in this order per sub-beat:

```
if narration has "..." and matching art exists  → quote-image
if narration has "..."                          → quote-card
if segment_role in (hook, closing, reversal)    → text-on-black
if label matches portrait trigger               → portrait-focus
if label matches detail trigger                 → detail-zoom
if label matches map trigger                    → map-diagram
if label matches compare trigger                → side-by-side
if label matches timeline trigger               → timeline
if first mention of proper noun                 → lower-third (V2 overlay)
otherwise                                       → full-bleed-art
```

## Animation Pool

10 Ken Burns styles, cycle with 3-clip memory (no repeat within 3 consecutive):

| # | Style | Scale | Pan | Use |
|---|-------|-------|-----|-----|
| 1 | Zoom In Slow | 1.0→1.10 | 0 | Landscapes, establishing |
| 2 | Pan Right | 1.0→1.12 | +15px | Portraits facing left |
| 3 | Pan Left | 1.0→1.12 | -15px | Portraits facing right |
| 4 | Zoom Out | 1.12→1.0 | 0 | Reveal shots, context |
| 5 | Zoom Out + Up | 1.12→1.0 | -8px | Manuscripts, lower detail |
| 6 | Diagonal Drift | 1.05→1.12 | -10→+5 | Dynamic content |
| 7 | Gentle Float | 1.02→1.06 | ±5px | Contemplative, quiet |
| 8 | Push In Fast | 1.0→1.20 | 0 | Emphasis, revelations |
| 9 | Static | 1.0→1.0 | 0 | Quote cards, text only |
| 10 | Pan Across | 1.08→1.08 | -30→+30 | Wide paintings, maps |

## Global Rules

- Crossfade between clips: 0.5s
- Crossfade between segments: 1.0s
- Duration floor: 8s (except text-only cards: 6s)
- Duration ceiling: 25s
- No back-to-back Ken Burns style repeats (3-clip memory)
- Quote cards → always static (style 9)
- Channel filter applied to all art clips

## What's Needed

For this module system to work reliably, the art library needs:
1. **Concept labels** per image (what deities, figures, symbols are depicted)
2. **Mood tags** (serene, fierce, contemplative, dynamic)
3. **Composition tags** (portrait, landscape, close-up, full-body, group, diagram)
4. **Dominant colors** for color-grading matching
