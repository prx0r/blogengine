# How to Write a Perfect Condensed Essay

## The Method

### 1. Extract the source text

```bash
pdftotext content/glossary/sources/essays/mundus_imaginalis.pdf source.txt
```

Read the whole thing. Not skimming. You need to know:
- What is the author's own stated structure? (Look for "first... second... third..." or "I will examine...")
- What are the 2-3 key ideas that everything else supports?
- Where does the author repeat himself?
- What is the emotional payoff at the end?

### 2. Decide the structure by following the author's plan, not yours

Corbin says at the end of his introduction: "we will examine [1] the order of reality I call mundus imaginalis, [2] the organ that perceives it, [3] examples." That is your outline. You do not need a better one. Copy it.

Bad essay writers impose their own architecture. Good ones follow the author's. The author already organized the material. Your job is to see that organization and preserve it, not replace it.

### 3. Write the body blocks directly as JSON

Do not use an AI API. Do not generate anything. Write the JSON file by hand using a Python script (or any text editor). The format:

```json
{
  "id": "essay_slug",
  "title": "Title — Subtitle",
  "type": "condensed_source",
  "source_ids": ["source_id"],
  "author": "Author Name",
  "concepts": ["Concept1", "Concept2", "Concept3"],
  "prerequisites": [],
  "body": []
}
```

Each body block has two fields:
- `"kind"`: one of `"source"`, `"ai"`, `"summary"`
- `"text"`: the content

### 4. The block rules

**Source blocks** are the author's own words. Keep them long and intact. The reader came for Corbin, not for you. Each source block should be a complete thought — one paragraph or several that form a unit. Do not chop them into tiny pieces. A source block of 400-900 characters is normal.

**AI blocks** explain why the source passage matters. They answer the question "so what?" that the reader is silently asking. They should:
- Translate the author's claim into plain terms
- Connect it to the larger argument
- Flag when something is the most important idea
- Be shorter than the source blocks they introduce (200-600 chars)

Never use AI blocks to repeat what the source just said. Use them to say why the source matters.

**Summary blocks** compress low-signal material: repeated points, historical background, footnotes, bibliography, transitional material that connects sections. They are the cutting room floor. Use them sparingly (1-3 per essay).

### 5. The rhythm

The natural rhythm is:

```
AI: sets up context, explains why reader should care
Source: author speaks (long passage)
AI: clarifies what the source just said
Source: author continues
Summary: compress a low-signal section
Source: author returns to a strong passage
AI: flags the key takeaway
Source: author concludes
```

This gives the reader a guide who walks them through the text without overpowering it. The ratio should be roughly 1:1 source to AI blocks, but the source blocks should be longer.

### 6. Avoid these mistakes (from experience)

**Redundancy:** If two quotes make the same point, cut one. The reader gets it the first time. The second quote is not reinforcing — it is wasting their attention.

**Unsupported claims:** If you say "the geography is consistent across visions, not private fantasy," that is a major claim. Either back it with a source quote or frame it as implication rather than fact.

**Labels without explanation:** If you name "eighth climate" in the intro, you must explain what it means later. Dropping a term and never returning to it confuses the reader. Every named concept needs a payoff.

**Proportionality:** The Swedenborg section is a supporting example, not the main argument. It should get one quote, not two. The three-universes section is the philosophical spine. It should get the most space.

**Flat transitions:** Do not write "Corbin now moves from geography to epistemology." That is a table of contents, not a transition. Instead, connect the sections: "Having placed the imaginal world beyond Qaf, Corbin now asks what organ could possibly see it." The transition should flow from the logic of the previous section.

### 7. Choosing concepts

Pick 3. Never more. The concepts should be:
1. The central entity (Imaginal World / Mundus Imaginalis)
2. The faculty that perceives it (Active Imagination)
3. The specific term that anchors it geographically (Eighth Climate or Na-koja-Abad)

These three cover the what, the how, and the where. Every essay about a specific source should give you a natural triad like this.

### 8. The final pass

Read through the essay as if you know nothing about the subject. Ask:
- Can I follow the argument without getting lost?
- Do the AI blocks actually help, or are they padding?
- Is there a quote that says the same thing as the one before it?
- Does the ending feel earned, or does it just stop?

If you find a block that does not pull its weight, cut it. Better to have 18 tight blocks than 22 where 4 are filler.

### 9. Saving and deploying

```bash
python3 build_essay.py            # writes the JSON
node scripts/generate-graph-json.mjs  # regenerates lookup data
npm run cf:deploy                 # deploys to Cloudflare
```

The essay slug becomes the URL. You can preview it at `/essay/<slug>` after deploy.
