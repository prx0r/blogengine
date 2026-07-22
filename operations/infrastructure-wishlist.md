# Infrastructure Wishlist

Things that would make the video pipeline faster and more reliable, based on the Kapala build experience.

---

## 1. Labeled Art Library

The art gallery at `content/glossary/art/` has 1,146 metadata JSONs. But most lack the fields needed for deterministic module selection:

### Currently present
- `title`, `source`, `artist`, `date`
- `vision_labels` (from Google Vision API - noisy, generic)

### Currently missing (needed for module selection)
| Field | Example | Used By |
|-------|---------|---------|
| `composition` | `portrait`, `landscape`, `close-up`, `full-body`, `group`, `diagram` | portrait-focus, detail-zoom |
| `mood` | `serene`, `fierce`, `contemplative`, `dynamic`, `dark`, `ethereal` | filter preset selection |
| `entities_depicted` | `["Shiva", "Parvati", "Nandi"]` | quote-image matching, proper noun matching |
| `concepts` | `["creation", "destruction", "meditation", "tantra"]` | module selection, keyword matching |
| `dominant_colors` | `["#1a0a00", "#FFD700", "#8B0000"]` | color grading filter matching |
| `art_type` | `painting`, `sculpture`, `manuscript`, `photograph`, `diagram` | module selection, variety enforcement |

### Tagging pipeline needed
```bash
# Auto-tag all untagged art with CF Workers AI
python3 scripts/tag-art.py --all

# Then manual curation for entity names (AI is unreliable for Sanskrit names)
# Priority: art with vision_labels that include known entity names
```

---

## 2. Module Generation Scripts

Each module JSON is a spec. But to use them in FableCut, we need a generator:

```bash
# Generate a quote card PNG
python3 scripts/generate-quote-card.py \
  --text "The quote text" \
  --author "Author Name" \
  --module quote-card \
  --output /media/quote_card.png

# Generate a text-on-black PNG
python3 scripts/generate-text-card.py \
  --text "Key insight here" \
  --module text-on-black \
  --output /media/text_card.png

# Generate a timeline graphic
python3 scripts/generate-timeline.py \
  --events '["1896: Born", "1918: Marriage", "1933: Meeting Guru"]' \
  --module timeline \
  --output /media/timeline.png
```

Only `generate-quote-card.py` exists. Need `generate-text-card.py` and `generate-timeline.py`.

---

## 3. FableCut Project Builder

Currently the project.json is constructed manually in Python each time. A proper builder would:

```bash
node scripts/build-fablecut-project.mjs \
  --storyboard tbp-034 \
  --art-assignments visual-assignment.json \
  --gold-standard alan-watts-gold \
  --modules quote-card,full-bleed-art,portrait-focus \
  --output /root/projects/FableCut/project.json
```

This would:
- Read the storyboard
- Read the visual assignment (art per segment)
- Apply gold standard pacing
- Insert module clips at trigger points
- Generate text/quote cards automatically
- Build the complete timeline

---

## 4. More Art Assets

19 Met Museum images is enough for a 6.8 min video with cycling. For a 20 min video:
- Need 40-60 unique images (105 shots / 3-clip window → 35+ unique minimum)
- Currently have: 19
- Need: 20-40 more, ideally labeled

### Priority sources
| Source | Est. Available | Access |
|--------|---------------|--------|
| Met Museum API | ~100+ tantric objects | Working (used for Kapala) |
| British Museum API | ~50+ Tibetan/Hindu | Need to fix URL format |
| Wikimedia Commons | Unlimited | Via Tor SOCKS proxy |
| Art gallery (existing) | 1,146 metadata JSONs | Needs labeling |

---

## 5. Current Module Files

| File | Status |
|------|--------|
| `video-templates/modules/quote-card.json` | ✅ Exists, validated |
| `video-templates/modules/quote-image.json` | ✅ Created |
| `video-templates/modules/text-on-black.json` | ✅ Created |
| `video-templates/modules/full-bleed-art.json` | ✅ Created |
| `video-templates/modules/portrait-focus.json` | ✅ Created |
| `video-templates/modules/detail-zoom.json` | ✅ Created |
| `video-templates/modules/lower-third.json` | ✅ Created |
| `video-templates/modules/map-diagram.json` | ✅ Created |
| `video-templates/modules/side-by-side.json` | ✅ Created |
| `video-templates/modules/timeline.json` | ✅ Created |
| `video-templates/modules/README.md` | ✅ Updated |
