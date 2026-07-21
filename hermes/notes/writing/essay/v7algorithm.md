# Algorithm V7 — Long-Form Commentary Protocol

V6 eliminates the patterns that make AI prose dead. V7 adds the patterns that make human prose alive.

V6 is the filter. V7 is the engine.

This algorithm is derived from reverse-engineering Angela Voss's PhD thesis *"Magic, Astrology and Music: the background to Marsilio Ficino's astrological music therapy and his role as a Renaissance magus"* (1992) — a work of sustained scholarly commentary whose prose is alive, committed, and rigorous across 20,000 lines.

The Rumi Engine (rumiengine.md) showed that patterns which are violations in AI prose become virtues when chosen deliberately. Voss proves this at thesis scale. Every technique below is something Voss does, analysed for why it works and how to reproduce it.

---

## Preamble: Long-Form is Not Short-Form Extended

V6 was designed for a specific format: alternating source/AI blocks of 100-400 chars. The 7 patterns it detects (NARR, NEG, 3LIST, PARA, FLAT, CLICHÉ, SAME-ENDING) are the signals of automated generation in that format. They are the baseline. Pass V6 first.

V7 addresses what V6 cannot: how to sustain alive prose across 3,000-8,000 words of continuous commentary. Where V6 says "eliminate," V7 says "choose deliberately." The same sentence structure that is a crutch in 200 characters becomes a structural device in 5,000 words — but only if you know why you're using it.

The axiom: **a pattern is not a violation when you choose it. It is a violation when it chooses you.**

---

## Axiom 1: The Personal Stake

**What it is:** The writer appears in the text as someone with a personal history with the subject. Not as a narrator of process ("in this section I will...") but as someone whose life has been touched by the material.

**Why it works:** Voss opens her thesis: "The writing of this thesis has, in many ways, been a personal journey of deepening experience and psychological integration. Over the past seven years (a cycle of Saturn) Marsilio Ficino has assumed the role of a daimon, leading me to confront the most difficult and complex issues in my life and somehow asking to be put to rest."

This is not self-indulgence. It is a methodological claim about the kind of knowing required to understand Ficino — participatory, symbolic, embodied. The personal stake becomes evidence for the argument. She cannot write about Ficino's daimon without meeting her own.

**Why AI fails it:** AI produces fake vulnerability ("I feel deeply connected to this subject") that is generic and replaceable. The stake must be specific, earned, and tied to the argument.

**Examples from Voss:**
- "As a practising astrologer I had always felt very strongly that Ficino's attitude towards astrology had been, on the whole, misrepresented by scholars."
- "Over the past seven years (a cycle of Saturn) Marsilio Ficino has assumed the role of a daimon."
- "In Jung's writings I have found a constant source of inspiration, clarifying and illuminating — in psychological terms — Ficino's alchemical quest."

**The test:** Read the personal stake sentence. If it could be inserted into any essay about any subject, delete it. If it is specific to this author, this subject, and this argument, keep it.

**The rule:** One personal stake moment per essay. Exactly one. It must do argumentative work — if you can remove it without the argument weakening, it is decoration.

---

## Axiom 2: The Scholarly Interlocutor

**What it is:** The writer engages a named secondary source with a specific claim, agrees or disagrees with evidence, and positions their own argument in relation to that source.

**Why it works:** Voss spends pages engaging Carol Kaske, D.P. Walker, and Eugenio Garin by name. She quotes their specific claims, then shows why they misread Ficino. This gives her argument stakes — she is not floating in a void but entering an existing conversation.

**Examples from Voss:**
- "Carol Kaske, who in her Introduction to the translation of Ficino's *Liber de vita*, mistranslates the very title of the *Disputatio* as *Disputation against judicial astrology*..."
- "D.P. Walker admits at the outset of his paper 'I am remarkably ill qualified to speak on astrology. I know nothing of the details of astrological procedures...'"
- "She sadly misrepresents Ficino's innovative, personal attitude by an insistence on restricting 'astrology' into a small pigeon-hole of determinism."

**Why AI fails it:** AI produces "some scholars argue" or "many have claimed" — a vague straw man with no specific target. This is the weak NEG that V6 rightly flags. The fix is not "remove the negation" but "name the source and their specific claim."

**The test:** For every disagreement in the essay, ask: is the opposing position attributed to a named scholar with a specific quotation? If not, it is a straw man.

**The rule:** Each essay needs at least one named scholarly interlocutor. Engage their actual words, not a paraphrase of their position. This is what transforms vague NEG into genuine argument.

---

## Axiom 3: The Source Embed

**What it is:** Primary source material is not dropped in as a block quote and left alone. It is embedded in running commentary — introduced, quoted, analysed, and woven into the writer's own argument. The source breathes inside the prose.

**Why it works:** Voss never dumps a quote without preparation. When she quotes Plato's *Timaeus*, she introduces it with a framing claim ("This passage encapsulates concisely the very theme of this thesis"), quotes at length, then spends multiple paragraphs drawing out its implications for Ficino, for astrology, for music therapy, for her own argument.

The structural pattern is:
1. **Set up**: what the reader needs to know before the quote
2. **Quote**: the source passage (as long as needed — Voss quotes up to 20 lines)
3. **Analysis**: what the passage means, why it matters for the argument
4. **Extension**: how it connects to other sources or to the thesis's larger claim

**Examples from Voss:**
- Plato *Timaeus* quote (17 lines) → "Plato understood that the arts of astrology and music..." (15 lines of analysis) → "In this chapter I shall be exploring..." (connects to chapter project)
- Ficino's letter to Canigiani → "Ficino cites Pythagoras and Empedocles as examples..." → "We shall find ample evidence that he modelled his own practice..."

**Why AI fails it:** AI produces short quotes (1-2 sentences) followed by paraphrase that says the same thing. This is V6's PARA pattern. The fix is not "shorter quotes" but "longer analysis per quote."

**The rule:** For every line of source quote, provide at least two lines of analysis that adds something the source doesn't say. If the analysis only restates the quote, delete the analysis and let the quote stand alone.

---

## Axiom 4: The Register Shift

**What it is:** The prose moves between different registers within a single section or even paragraph — from academic analysis to vivid metaphor, from historical exposition to present-day relevance, from dense argument to personal reflection. The shift itself communicates meaning.

**Why it works:** Voss moves fluidly between:
- Dense scholarly analysis: "Ficino's conviction that a thread of truth could be discerned, to a greater or lesser extent, at all periods of history, woven through religion and philosophy..."
- Vivid metaphor: "he sought to achieve this through a ritual, symbolic use of both astrology and music"
- Personal testimony: "Over the past seven years (a cycle of Saturn) Marsilio Ficino has assumed the role of a daimon"
- Contemporary relevance: Jung as "the greatest twentieth-century spokesman for the very union of mind and soul to which Ficino dedicated his life"

The Rumi Engine (rumiengine.md, §8) makes the same observation: "The shift from aggressive imperatives to a passive, flowing image IS the teaching." For Voss, the register shift IS the argument — the reader experiences the connection between past and present, between scholarship and life.

**Examples from Voss:**
- "Ficino recognised the need to fertilise the traditional, orthodox religious values of his time with the water of the soul — a conjunction of Saturn and Jupiter..." — shifts from historical analysis to astrological metaphor in one sentence
- "It must not be forgotten that Ficino was both a priest and a physician, and that his wide range of activities included interaction and communication with the ordinary Florentine citizen, whether in Church or at their bedside." — shifts from abstract to concrete, from historical figure to embodied person

**The test:** Read a paragraph aloud. If the register is uniform throughout the entire essay, the prose is dead. The reader should feel the texture change.

**The rule:** Every 500 words, shift register at least once. Options:
- From analysis to image
- From historical to present
- From abstract to concrete
- From third-person to first-person
- From claim to question
- From argument to metaphor

The shift should feel necessary, not decorative. If the reader asks "why did the register change there?", you forced it.

---

## Axiom 5: The Extended Metaphor

**What it is:** A concrete image drawn from the source material that carries the argument across multiple paragraphs or pages. Not a decorative simile but a structural device: the metaphor's logic becomes the argument's logic.

**Why it works:** The Rumi Engine (rumiengine.md, §7) shows that Rumi's most powerful poems are built around a single physical object whose properties map onto spiritual meanings. Voss does the same at thesis scale. Her controlling metaphors — the three musics (*mundana, humana, instrumentalis*), the alchemical conjunction, the Orphic descent — come FROM the source material and structure her argument.

**Examples from Voss:**
- "The water of the soul — a conjunction of Saturn and Jupiter" — the astrological conjunction becomes the image for Ficino's synthesis of tradition and revelation
- "Apollo's four-string lyre which resounds in the ordering of the seasons which is itself imitated in the healthy balance of humours in the body" — the lyre as structural model for cosmic-human correspondence
- "The theme of the three musics is a constant unifying motif throughout my work" — a controlling metaphor that structures the entire thesis

**Why AI fails it:** AI applies generic metaphors from a list (fire, sculpture, architecture) that have no specific connection to the source. The metaphor is imposed, not discovered.

**The rule:** Before writing, find one physical image in the source material that can carry the essay's argument. It must come from the source, not from a list. List its properties. Map each property to a dimension of the argument. Use the metaphor's logic as the essay's logic.

The Rumi Engine test: "If the source doesn't offer one, your voice target isn't concrete enough."

---

## Axiom 6: The Argument Arc

**What it is:** Each section of the essay has a clear internal movement: open with a claim, build evidence through source engagement, address a counter-position or complication, resolve into a synthesis that advances the larger argument. The reader always knows where they are.

**Why it works:** Voss's chapters are not blocks of information. They are movements. Each has:
1. **Orientation**: where we are and what we're doing ("In this chapter I shall be exploring the common sources and roots of such a hypothesis...")
2. **Evidence**: primary source engagement with analysis
3. **Complication**: engagement with a counter-view or difficulty
4. **Synthesis**: resolution that advances the larger thesis

**Examples from Voss:**
- The Kaske critique (Introduction): opens with the problem (Ficino misrepresented), builds evidence (specific misreadings), addresses the complication (why Kaske misses the point), resolves (the need for a different mode of perception)
- The daimon section (§2.4): opens with Platonic hierarchy of spirits, quotes *Symposium*, contrasts Plotinus's view, resolves into Ficino's synthesis

**The rule:** Every major section (500+ words) must have this shape:
1. Open: here is the claim I am making
2. Build: here is the evidence from the source
3. Turn: here is a complication or counter-view
4. Close: here is what this means for the larger argument

If a section lacks any of these four moves, it is not an argument — it is a note.

---

## Axiom 7: The Temporal Weave

**What it is:** The prose moves between historical periods to show the living continuity of an idea. The 15th-century source, the 20th-century interpreter, and the present-day writer are woven together as participants in the same tradition.

**Why it works:** Voss moves constantly between Ficino's 15th century, Jung's 20th century, and her own present. This is not name-dropping. It is a claim about tradition: these thinkers are engaged in the same project across time. The temporal weave becomes evidence for the perennial philosophy thesis.

**Examples from Voss:**
- "In Jung's writings I have found a constant source of inspiration, clarifying and illuminating — in psychological terms — Ficino's alchemical quest." — Jung as modern interpreter of the same tradition
- "It must not be forgotten that Ficino was both a priest and a physician..." — sudden present-tense address that collapses historical distance
- The entire introduction weaves Ficino's 15th-century astrology, 20th-century academic debates (Kaske, Walker), and the author's own practice as an astrologer

**The rule:** At least once per essay, make a connection between the historical source and a modern thinker, practice, or experience. The connection must feel natural — if the reader asks "why are we talking about Jung now?", it is forced.

---

## Axiom 8: The Opening that Commits

**What it is:** The first sentence of the essay makes a claim about existence, not about the essay. It is tethered to a concrete image. It commits to a register immediately.

**Why it works:** The Rumi Engine (rumiengine.md, §11) analyses Rumi's openings: "The first line establishes the entire poem's register, metaphor, and claim in 5-10 words." Voss's introduction opens with Ficino's own voice — the *Prooemium* passage — and uses it to set up the thesis before the reader knows they are being set up.

**Examples from Voss:**
- "In the *Prooemium* to his great *Theologia Platonica*, Ficino tells the reader how he has felt called upon to explain his synthesis of Platonism and Christianity to those who 'separate the study of philosophy from holy religion.'" — opens with Ficino's own words, establishes the synthesising project, frames the entire thesis in one paragraph
- "This passage from Plato's *Timaeus* encapsulates concisely the very theme of this thesis..." — opens a chapter with a source passage that becomes the chapter's organising principle

**The test:** Read only the first 3 sentences of the essay. Can the reader infer the subject, the register, and the central tension? If not, the opening is not doing its job.

**The rule:** The opening must:
1. Make a claim about the subject (not about the essay)
2. Be tethered to a concrete image or source passage
3. Commit to a register immediately

If the first sentence could open any essay, rewrite it.

---

## Axiom 9: The Ending that Opens Outward

**What it is:** The ending does not summarize. It points to something beyond the essay's scope — an implication, a question, a connection yet to be made. The reader feels the essay continues after they stop reading.

**Why it works:** The Rumi Engine (rumiengine.md, §12) shows that Rumi's endings do not conclude: "They either stop mid-thought, shift register, give an image that keeps unfolding, or turn the poem back on the reader." Voss ends her introduction not with a summary but with a threshold — the reader is now prepared to see Ficino differently. The final clause of her thesis points outward: the dissertation ends, but the tradition continues.

**Examples from Voss:**
- Her introduction closes with the debate still alive — she has not "solved" Ficino but opened a better way of reading him
- Her chapter conclusions often point to the next chapter: "this will be considered further in chapter four"
- The thesis as a whole ends with Ficino's music — the practical application of everything argued — rather than a recapitulation

**The rule:** The final paragraph must:
1. Not summarize (the reader was paying attention)
2. Change register slightly — from analysis to implication, from evidence to invitation
3. End on an image, question, or opening rather than a conclusion

If the final paragraph begins with "In conclusion," rewrite it.

---

## Axiom 10: The Named Source Glide

**What it is:** The writer integrates multiple primary and secondary sources into a single flowing passage without breaking rhythm. Sources are not cited in parenthetical interruption but woven into the syntax.

**Why it works:** Voss moves fluidly between Plato, Plotinus, Ficino, Hankins, Jung, and her own analysis within a single paragraph. The sources are named as participants in a conversation, not as citations to be checked off.

**Examples from Voss:**
- "Pythagoras, the father of the concept of *musica mundana*, the harmony of the spheres, is a figure shrouded in legend..." — integrates the source name as the subject of the sentence, not a parenthetical
- "In the words of Hankins: 'For Ficino, Platonism, instead of being the nemesis of christendom, is part of God's providential design...'" — embeds the secondary source as a speaking voice
- "Ficino cites Pythagoras and Empedocles as examples of magi who used 'serious music' to quell unruly passions" — integrates the citation into the argument's syntax

**The rule:** Sources should be named as participants, not cited as authorities. A source named in the sentence ("Hankins has observed...") is alive. A source in a parenthetical ("(Hankins, 1991)") is dead. Use parentheticals only for page numbers.

---

## Phase 0: Source Immersion

Before writing, read the primary source until you can explain its structure in 3 sentences without looking. Extract:
- One controlling metaphor FROM the source (Axiom 5)
- One named scholarly interlocutor (Axiom 2)
- One personal connection to the material (Axiom 1)

If you cannot find all three, read deeper.

---

## Phase 1: Argument Mapping

Map the essay's arc before writing a single sentence:

```
OPENING: hook + register commitment + thesis         (Axiom 8)
SETUP: what the reader needs to know                  (Axiom 6, orientation)
EVIDENCE BLOCK 1: source embed → analysis → extension (Axiom 3)
EVIDENCE BLOCK 2: source embed → analysis → extension (Axiom 3)
COMPLICATION: named interlocutor → their view → your response (Axiom 2)
REGISTER SHIFT: metaphor or temporal weave             (Axiom 4, 7)
SYNTHESIS: resolution → wider opening                  (Axiom 6, 9)
```

Each evidence block: 1 part source quote, 2+ parts analysis that adds what the source doesn't say.

---

## Phase 2: Write (Accept Slop)

Write the full essay in one pass. Do not try to be good. Long-form writing needs the whole arc visible before refinement makes sense — otherwise you polish a paragraph that gets cut on structural grounds.

Apply the personal stake (Axiom 1) even if it feels raw. You can refine it later.

---

## Phase 3: Cold Read (Identify)

Read the essay as if someone else wrote it. Mark:

**V6 patterns** (these are still violations — V6 is the baseline):
- 3LIST: exactly three parallel items without development
- CLICHÉ: modern self-help language in premodern context
- PARA: paraphrase without analysis (test: if cut, nothing lost)
- SAME-ENDING: closing echoes the source's final words

**V7 patterns** (check for deliberate choice, not absence):
- Personal stake: does it serve the argument or is it decoration?
- Scholarly interlocutor: named source with specific claim engaged?
- Source embed: does every quote have ≥2:1 analysis-to-quote ratio?
- Register shift: is there at least one shift every 500 words?
- Extended metaphor: does it come from the source and carry through?
- Argument arc: does every section have claim → evidence → turn → close?
- Temporal weave: is the past connected to the present at least once?
- Opening: would the first sentence work for any other essay? If yes, rewrite.
- Ending: does it open outward or summarize?

---

## Phase 4: Repair (One Sentence at a Time)

Fix V6 pattern violations first (zero tolerance as in V6).

Then apply V7 repairs:

1. **Weak personal stake**: Is it specific enough? Would it work for any other essay? If yes, rewrite with a concrete detail from your own engagement with the material.

2. **Vague scholarly engagement**: If you wrote "some scholars argue," replace with a named scholar and their specific claim. If you cannot name one, your argument has no interlocutor.

3. **Orphaned quote**: If a source quote has less than 2:1 analysis surrounding it, either add analysis or cut the quote. A quote without analysis is a museum display.

4. **Flat register**: Read a paragraph aloud. If the register is uniform from start to finish, add one sentence that shifts it — from analysis to image, from past to present, from third-person to first-person.

5. **Forced metaphor**: If the metaphor appears only once, either extend it or cut it. A metaphor that appears once is a decoration, not a structure.

6. **Missing arc**: If a section lacks any of claim → evidence → turn → close, add the missing move. Most often the "turn" is missing — the engagement with a counter-view or complication.

7. **Dead opening**: Read the first 3 sentences. If they could open any essay in the series, rewrite. The opening must be essay-specific.

8. **Summarising ending**: If the final paragraph begins recapping what you just said, delete the entire paragraph and write a new one that opens outward.

---

## Phase 5: Texture

V6's texture pass applies directly. Additionally:

- **Metaphor consistency**: Does the controlling metaphor from Phase 0 appear in at least 3 places across the essay? If not, strengthen it.

- **Named source frequency**: Count sentences that begin with the subject's name (e.g., "Ficino"). If more than 40% of paragraphs start this way, vary the opening — lead with the concept, the metaphor, or the claim instead.

- **The temporal check**: Is there at least one connection between the historical source and a modern thinker, practice, or experience? If not, add one. The reader needs to feel the tradition is alive.

- **The Rumi sprinkle** (from rumiengine.md): Replace one abstract noun per page with a physical tether from the source material. Add one fragment per page where the prose is too uniform. Read aloud.

---

## Phase 6: Verification

| Check | Target |
|-------|--------|
| V6 baseline passed (all patterns clean) | Yes |
| Personal stake moment | 1, serves argument |
| Named scholarly interlocutor | ≥1, with specific claim engaged |
| Source-to-analysis ratio | ≥2:1 analysis per quote |
| Register shifts | ≥1 per 500 words |
| Extended metaphor from source | Carries through ≥3 sections |
| Temporal weave (past ↔ present) | ≥1 connection |
| Opening would not work for any other essay | Yes |
| Ending opens outward (no summary) | Yes |
| "Ficino" (or subject name) starts ≤40% of paragraphs | Yes |
| Read aloud — predictable anywhere? | 0 |
| Lines genuinely alive | ≥3 |

---

## Summary: V6 vs V7

| Dimension | V6 | V7 |
|-----------|----|----|
| Job | Eliminate AI slop patterns | Build alive long-form prose |
| NARR | Zero tolerance | Orienting narration permitted (≤1 per 500 words) |
| NEG | Zero tolerance | Permitted with named target + evidence + positive claim |
| 3LIST | Zero tolerance | Accumulation lists permitted (must build, not enumerate) |
| PARA | Zero tolerance | Permitted if ≥2:1 analysis-to-source ratio |
| Personal stake | Forbidden | Required (1 paragraph, must serve argument) |
| Scholarly dialogue | Absent | Required (≥1 named source with specific claim) |
| Extended metaphor | From a list | From the source material (must discover, not impose) |
| Register | Uniform per block | Shift every 500 words |
| Opening | Any | Must commit — specific to this essay only |
| Ending | No echo source | Opens outward, does not summarise |
| Source quotes | 300-900 chars | Up to 20 lines with embedded analysis |
| The test | Pattern count | Read aloud + would it work for any other essay? |
