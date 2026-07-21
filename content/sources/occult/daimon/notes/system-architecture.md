# System Architecture — The Raw Information Layer

> This is what we're actually building. Not a vision. Not a wishlist.
> The actual system, why it's structured this way, and what order to build it in.

---

## What This System Actually Is

A structured data layer that downstream products read from.

The system does NOT produce:
- A website (the site is a downstream consumer)
- A video (the video pipeline is a downstream consumer)
- A chatbot (the chat is a downstream consumer)

The system produces:
- Structured, versioned, source-tracked knowledge objects (ROs)
- With every passage traced to its source
- With every concept linked to art, sources, and ROs
- With coverage maps showing what's known and what's missing

That's it. Everything else — essays, audio, video, journeys, chatbot context — is a downstream rendering of this data layer.

## Why This Architecture

```
Traditional approach:             Our approach:
                                  
PDF → RAG → answer (disposable)   PDF → RO → structured data (persistent)
                                       ↓
                                  essay, audio, video, chat, journey
                                  (all read the same source)
```

The traditional approach answers a question once and throws away the synthesis. Our approach compiles the synthesis once and reuses it across every downstream product. Each new source improves the RO, and every downstream product improves automatically.

This is the difference between:
- **Asking "what did Ficino say about the daimon?" and getting an answer**
- **Having a maintained object called "Ficino on the Daimon" that tracks every source, every version, every gap, and generates essays, audio, video, and chat context from the same data**

## The Six Layers

```
Layer 0: Raw Assets (immutable files)
  PDFs, images, audio files
  ↓

Layer 1: Content Records (metadata + provenance)
  Works, concepts, art, authors, sources
  Every entity has stable IDs and relationship fields
  ↓

Layer 2: Research Objects (compiled knowledge)
  One bounded question, versioned, source-tracked
  Body passages with per-paragraph provenance
  Coverage maps, issues, research todos
  ↓

Layer 3: Collections (grouped ROs)
  "Ficino's Cosmos" = ro:ficino-daimon + ro:ficino-spiritus + ro:ficino-astrology
  No new source material — purely compositional
  ↓

Layer 4: Products (downstream renderings)
  Essay (JSON → site page + audio)
  Video (JSON → storyboard → render)
  Journey (sequence of ROs with progress tracking)
  Chat context (RO as authoritative knowledge base)
  ↓

Layer 5: Feedback (improvement signals)
  User feedback on essays → Error Book entries
  Gap analysis → new research todos
  Skill writing → improved compilation quality
```

## What Each Downstream Product Needs From the Data Layer

### Video Pipeline
```
Reads:          RO body passages + concepts + art
Needs to know:  Which passages to narrate (body[].text)
                Which concepts each passage touches (body[].topics)
                Which art illustrates each concept (concept → art)
                What the art contains (art.visual_motifs, art.style)
                What entities appear (concept.synonyms, entity references)
Produces:       Storyboard JSON with per-frame narration + visuals
```

### Audio Pipeline
```
Reads:          RO body passages
Needs to know:  Which passages are source text (kind: "source")
                Section structure for chapter markers
Produces:       MP3 with dual-voice narration
```

### Site / Essay Pages
```
Reads:          RO body + outputs
Needs to know:  Essay JSON with body blocks
                Concept links for navigation
                Art for illustrations
                Audio URL
Produces:       Rendered essay page
```

### Chatbot Context
```
Reads:          RO body + sources + coverage
Needs to know:  The compiled answer to a question
                Which sources support each claim
                What's NOT known (coverage gaps)
Produces:       Grounded answers with citations
```

## The Art Layer — What It Needs to Be

For the video pipeline to work, art metadata needs granularity:

```json
{
  "id": "art_angel_gabriel",
  "title": "Annunciation",
  "artist": "Fra Angelico",
  "date": "1440-1445",
  "concepts": ["angel", "annunciation", "divine_message", "light"],
  "visual_motifs": ["gold_halo", "wings", "kneeling", "ray_of_light", "lily"],
  "style": ["early_renaissance", "fresco"],
  "entities_depicted": ["Gabriel", "Mary"],
  "color_palette": ["ultramarine", "gold", "vermilion"],
  "composition": "figure_left_figure_right_light_between",
  "mood": ["solemn", "reverent", "luminous"],
  "source_url": "https://...",
  "image_url": "https://...",
  "license": "Public Domain",
  "used_in": ["essay:ficino-daimon", "essay:corbin-imaginal"]
}
```

This lets the video generator:
- Match art to passages by concept overlap
- Select art with matching mood/visual motifs
- Compose scenes from art elements
- Apply consistent style filters per tradition

The art layer can be expanded incrementally — start with `concepts[]` and `visual_motifs[]`, add `style`, `mood`, `entities_depicted`, `color_palette` as needed.

## The Actual Build Order

### Phase 1: Foundation — The Data Layer (Now)

Build the raw information layer that everything reads from.

```
1. RO schema + first manual RO (ficino-daimon)
   Proves the format. Deploy as essay.

2. State machine (ro-state.py)
   Tracks RO states, bumps versions, logs changelog.
   Makes ROs manageable as living objects.

3. Impact detection
   New work → check which ROs → Telegram notification.
   Closes the loop between acquisition and compilation.

4. Knowledge PR workflow
   Git branch → review → merge → version bump.
   Makes RO updates traceable and reviewable.

5. Lint + test + Error Book
   Post-merge validation. Catches structural errors.
   Error Book accumulates constraints.
```

This is the only phase that builds the actual data layer. Everything after this reads from it.

### Phase 2: Granular Art Layer (After Phase 1)

Once ROs exist, expand art metadata to support video:
```
- Add visual_motifs[], style[], mood[], color_palette[] to art JSONs
- Write script to auto-suggest motifs from image analysis (optional)
- Link art to concepts more precisely
```

### Phase 3: Downstream Products (After Phase 2)

```
- Video pipeline: reads RO body → matches art by concept → storyboard → render
- Journey builder: sequences ROs → guided learning path
- Chat context: RO as authoritative knowledge base for Hermes chat
- Personal ROs: diary entries → personal layer linked to public ROs
```

### Phase 4: Autonomous Operation (Ongoing)

```
- Cron schedules from visionbuild.md (daily impact, weekly lint, monthly digest)
- Learning loop: self-review → skill writing → gap score tracking
- Dreaming cycle: cross-RO pattern detection
```

## Why Phase 1 Is the Right First Step

The data layer (ROs, works, concepts, art, authors) is the ONLY thing we can't fake. If we build the video pipeline before the data layer, we have to mock data. If we build the site before the data layer, we have to mock data. But if we build the data layer first, every downstream product has real, versioned, source-tracked content to work with.

The ROs don't need to be perfect in Phase 1. They need to exist. A draft RO with 2 sources and 30% coverage is still useful — it tells the system what's known and what's missing. The coverage map is the product, not the completeness.

## Summary

| Layer | What | Status | Build Phase |
|---|---|---|---|
| 0: Raw Assets | PDFs, images | 62 PDFs, 30+ art images | ✅ Existing |
| 1: Content Records | Works, concepts, art, authors | 71 works, 76 concepts, 30 art, 2 authors | ✅ Existing |
| 2: Research Objects | Compiled knowledge | **Not built** | **Phase 1** |
| 3: Collections | Grouped ROs | Not built | Phase 3 |
| 4: Products | Essays, audio, video, journeys | Essays + audio exist, video not built | Phase 3 |
| 5: Feedback | Improvement signals | Not built | Phase 4 |

The system is the data layer. Everything else is a rendering of it.
