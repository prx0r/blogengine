# Module Usage Guide

Quick reference for when to use each module, with examples from our gold standard analysis.

---

## Selection Priority (highest to lowest)

```
narration has "..." + matching art exists  → 05-quote-image
narration has "..." (any quote)            → 04-quote-card
segment_role is hook/closing/reversal      → 06-text-on-black
label matches portrait trigger             → 02-portrait-focus
label matches detail trigger               → 03-detail-zoom
label matches map trigger                  → 08-map-diagram
label matches compare trigger              → 09-side-by-side
label matches timeline trigger             → 10-timeline
first mention of proper noun               → 07-lower-third (V2 overlay)
no match                                   → 01-full-bleed-art
```

## Module Reference

### 01 — Full Bleed Art
**Use when:** Default. No special trigger matched.  
**Duration:** 8-25s  
**Animation:** Ken Burns from 10-style cycle, 3-clip memory  
**Example:** Alan Watts — 48% of gold standard shots are this type  
**Filter:** Channel preset (mystical-dark for Ochema, golden-imaginal for Tantra Files)

### 02 — Portrait Focus
**Use when:** Segment introduces or focuses on a specific person/figure  
**Trigger labels:** `portrait`, `figure`, `guru`, `master`, `sage`, `teacher`, `person`  
**Duration:** 10-18s  
**Animation:** Gentle Ken Burns zoom 1.0→1.06 (too much movement on faces is distracting)  
**Example:** Alan Watts — shot 9 (4.97s close-up of Watts speaking)

### 03 — Detail Zoom
**Use when:** Narrator describes an object, artifact, texture, or material  
**Trigger labels:** `detail`, `close`, `object`, `artifact`, `texture`, `material`, `manuscript`, `sculpture`  
**Duration:** 8-15s  
**Animation:** Push zoom 1.0→1.15  
**Example:** When describing a skull cup's silver lining, zoom into that area of the image

### 04 — Quote Card
**Use when:** Narration contains an attributed quotation `"..."`  
**Duration:** 8-20s  
**Animation:** Static (no Ken Burns). Typewriter text reveal.  
**Layout:** Quote in serif (#FFE8C8), attribution in gold (#FFD700) below, on #0D1117 background  
**Generation:** `python3 scripts/generate-quote-card.py --style centered_sparse`  
**Example:** "Sometimes, one who wishes to dance..." — Abhinavagupta

### 05 — Quote + Image
**Use when:** Quote is attributed AND related artwork exists with matching concepts  
**Duration:** 10-18s  
**Animation:** Gentle Float (1.02→1.06). Text fades in. Art dimmed to 35% brightness.  
**Layout:** Quote centered over dimmed art, attribution below  
**Note:** Prefer this over plain quote-card when art has direct conceptual match

### 06 — Text on Black
**Use when:** Segment makes a single declarative claim at hook/closing/reversal/synthesis  
**Duration:** 6-12s  
**Max per video:** 3 (spaced at least 60s apart)  
**Animation:** Fade in. No Ken Burns.  
**Layout:** Single claim centered on #0D1117, no attribution  
**Note:** Different from quote-card — no source, no attribution. Just the thesis.

### 07 — Lower Third
**Use when:** First mention of a proper noun (name, place, text title) in the narration  
**Duration:** 6-10s (can linger for the full segment)  
**Layer:** V2 overlay (not V1 — runs on top of existing art)  
**Animation:** Slide up in 0.5s, slide down in 0.3s  
**Layout:** Name in gold (#FFD700) uppercase, subtitle in cream (#FFE8C8) below  
**Rule:** Only show on first mention — not every time the name appears

### 08 — Map / Diagram
**Use when:** Segment discusses geography, lineage, conceptual relationships, or transmission  
**Trigger labels:** `map`, `geography`, `lineage`, `diagram`, `concept`, `transmission`  
**Duration:** 12-20s  
**Animation:** Pan Across (1.08 scale, -30→+30px pan, left to right)  
**Example:** Showing the Silk Route trade paths connecting India to the Mediterranean

### 09 — Side by Side
**Use when:** Segment compares two figures, objects, time periods, or traditions  
**Trigger labels:** `compare`, `contrast`, `versus`, `vs`, `before`, `after`, `difference`  
**Duration:** 12-20s  
**Layout:** 50/50 vertical split, gold divider line (2px, #FFD700)  
**Animation:** Gentle Float on both sides  
**Example:** Raw skull cup vs silver-lined skull cup — showing transformation

### 10 — Timeline
**Use when:** Segment lists chronological events, life stages, or historical sequence  
**Trigger labels:** `timeline`, `sequence`, `chronology`, `stages`, `development`  
**Duration:** 15-25s  
**Layout:** Horizontal timeline with dots, dates above, descriptions below  
**Animation:** Progressive reveal — each event appears in sync with narration  
**Generation:** Needs generate-timeline.py script (not yet built)

---

## Filter Presets (added to FableCut)

| Preset | Channel | Contrast | Saturation | Temperature | Vignette |
|--------|---------|----------|------------|-------------|----------|
| `mystical-dark` | Ochema | 115 | 85 | 95 | 15 |
| `golden-imaginal` | Tantra Files | 110 | 90 | 15 | 20 |
| `corbin-blue` | Angeliz | 105 | 80 | -20 | 18 |

These are now available in FableCut's filter preset dropdown.

---

## Gold Standard Pacing Reference

| Template | Shots | Avg Shot | Duration | BPM | Derived From |
|----------|-------|----------|----------|-----|-------------|
| `alan-watts-gold` | 105 | 7.1s | 12.4 min | 112 | The Bizarre Life of Alan Watts |
| `anandamayi-template` | 139 | 8.8s | 20.3 min | 152 | The Bizarre Life of Anandamayi Ma |
| (AOI pending) | 22-59 | 15-32s | 11-15 min | — | Academy of Ideas (needs capture) |

To capture a new gold standard from FableCut:
```bash
python3 scripts/gold-standard.py --capture --name my-new-template
```

---

## Module Files

All stored in `video-templates/modules/`:
```
quote-card.json        quote-image.json        text-on-black.json
full-bleed-art.json    portrait-focus.json     detail-zoom.json
lower-third.json       map-diagram.json        side-by-side.json
timeline.json          README.md               USAGE-GUIDE.md
```

Module examples generated to FableCut's media at `media/module-examples/`.
Preview at `media/module-examples/index.html`.
