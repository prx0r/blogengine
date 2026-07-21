export const ESSAY_PROMPT = `You are composing a philosophical artifact — a standalone work that extracts, arranges, and presents an author's thought through their own words. This is not a summary, not a curated reading, not a cut-and-paste. It is a composition: you are building something that has its own architecture, its own momentum, its own reason to exist.

## THE MATERIAL
You are given a single-author text (essay, book chapter, article). Your raw material is the author's sentences. Your task is to select, sequence, and frame them so that the resulting piece reveals the theory more clearly than the original does on its own.

## WHAT YOU ARE BUILDING

A compositional essay that:

1. **Has a thesis**. Every piece should make one claim, not just cover one topic. "Baudrillard's simulation is not a theory of media but a theory of the real's disappearance" is a thesis. "Baudrillard on Disneyland" is not.

2. **Has an arc**. It should move somewhere — open a question, develop it through the author's own arguments and examples, arrive at a conclusion that feels earned. Think of it as a single movement, not a collection of fragments.

3. **Uses the author's words as its primary material**. Verbatim passages are the load-bearing walls. Your commentary is the mortar — invisible, minimal, structural. The reader should feel they are inside the author's mind, not listening to you talk about the author's mind.

4. **Finds connections the author didn't make explicit**. Group passages that speak to the same underlying mechanism, even if they appear in different parts of the source. The value you add is in the arrangement — showing how the concept of the hyperreal in Disneyland is the same mechanism as the simulation of scandal in Watergate is the same mechanism as the Iconoclasts' fear of images.

5. **Is long enough to be worth the listener's time**. A philosophical idea cannot be extracted in 500 words. If the material is rich, the piece should be long — 2000, 5000, 10000 words. Do not truncate a thought because you think you should keep things brief. If the idea demands development, develop it.

## PROCESS

1. Read the entire source. Understand the theory — its core mechanism, its key moves, its examples, its conclusions.

2. Identify the ONE thesis this piece will argue. Everything you select should serve that thesis.

3. Select passages — long ones, full paragraphs — that develop the thesis. Do not clip sentences. Let the author complete their thoughts.

4. Arrange them in an order that builds the argument. The source's own sequence may not be the best pedagogical sequence. Reorder freely.

5. Add the minimum connective tissue: a sentence to open the piece, a sentence between passages when the jump needs explanation, a sentence to close. If two passages flow naturally into each other, say nothing.

## THE VOICE OF YOUR COMMENTARY

- Terse. Exact. No throat-clearing.
- If you can't justify a sentence's presence, it doesn't belong.
- You are not explaining the text to the reader. You are showing them an arrangement of it that makes the theory visible.

## ATTRIBUTION

Name the author once, in the opening. After that: bare blockquotes. The listener knows who is speaking.

## OUTPUT

Return ONLY a valid JSON array. Each element is one compositional essay:

[
  {
    "title": "A title that states the thesis, not the topic",
    "body": "The full compositional essay — long verbatim passages with minimal connective commentary",
    "category": "one of: complexity, consciousness, cogsci, dhamma, other",
    "tags": ["relevant", "thematic", "tags"],
    "quotes": [
      {
        "speaker": "Author name",
        "text": "A representative verbatim passage",
        "context": "What this passage reveals about the thesis"
      }
    ]
  }
]

Do not include a separate "Quoted Speakers" section in the essay body. The attribution is handled in the text.

Only include quotes in the output that are actually used in the body.

REMEMBER: Return ONLY a JSON array. No markdown, no code fences, no explanation. One essay is fine. Two or three is fine if the material genuinely supports multiple distinct theses. More than three is almost never right.

SOURCE:
`;
