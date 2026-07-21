---
name: art
description: Search museum APIs for art matching essay concepts and add to the glossary
version: 1.0.0
author: Thomas Prior
metadata:
  hermes:
    tags: [essay, art, museums, research]
    requires_tools: [web_search, web_extract]
---

# Fetch Art for Essays

Search museum and gallery APIs for public-domain artworks matching essay concepts, then add them to the art glossary.

## When to Use
- "Find art for {concept}"
- An essay references a concept or artist that needs visual accompaniment
- The art library is missing entries for a specific tradition or period

## Procedure

### 1. Search Museum APIs
Use `web_search` to query open museum APIs for the concept:

- Rijksmuseum API: `https://www.rijksmuseum.nl/api/en/collection?q={concept}`
- Metropolitan Museum of Art: `https://collectionapi.metmuseum.org/public/collection/v1/search?q={concept}`
- Wikidata SPARQL: `https://query.wikidata.org/sparql?format=json&query=...`
- WikiArt: search via `https://www.wikiart.org/en/search/{concept}`

### 2. Extract and Format
For each promising result, extract:
- `id`: unique slug (e.g., "bosch-garden-of-earthly-delights")
- `title`: artwork title
- `artist`: creator name
- `date`: creation year
- `image`: direct image URL (public domain only)
- `source`: museum/source name
- `concepts`: matching concept slugs

Format as JSON in `content/glossary/art/`:
```json
{
  "id": "artist-work-title",
  "title": "Work Title",
  "artist": "Artist Name",
  "year": 1500,
  "source": "Museum Name",
  "image": "https://...",
  "concepts": ["concept-slug"],
  "tags": ["renaissance", "allegory"]
}
```

### 3. Update Essay References
Check which essays reference the concept. Update their body blocks to include:
```json
"art_id": "artist-work-title"
```

### 4. Regenerate and Deploy
```bash
node scripts/generate-graph-json.mjs
npm run cf:build
npm run cf:deploy
```

## Pitfalls
- Only use public domain images (pre-1923 or CC0)
- Verify the image URL is still valid
- Don't add art that doesn't genuinely match the concept
- If no matching art is found after 3 searches, skip

## Verification
- Art JSON is valid
- Image URL loads (check with `curl -I`)
- At least one essay references the new art
