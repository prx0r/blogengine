# StopSlop — Pattern Discipline for v3

## The Trap

I killed narrritivitis. I replaced it with negat-assert-itis. Same disease, different symptom.

Every essay has 8-11 instances of the "not X, but Y" pattern across ~1300 words of AI block text. The guide says 1 per 800-1000 words. I am at ~1 every 130 words.

The fragment form ("Not a metaphor. A place.") is the same move as the compound form ("not X but Y"). It just wears better clothes. The reader's ear still hears the same rhythm: negate, then assert.

## The Fix — Tool Chest (in order of preference)

**Tool 1: Flat assertion.** No negation anywhere in the sentence. No implied negation. Just state what it IS.

> "The active Imagination is a mirror."
> "The Burning Bush is both fire and theophany."
> "Three floors to this universe."

**Tool 2: "Forget X."** Leads with dismissal without the negation-assertion scaffold.

> "Forget wings. Forget the greeting-card version. Corbin's Angel is the most real thing a person will ever meet."
> "Forget the furnace. What he is actually describing is a soul learning to see through itself."

**Tool 3: Question-answer.** The question does the negating implicitly.

> "What organ sees it? The active Imagination." (Instead of: "Not the senses. Not the intellect. A third faculty.")
> "How do you know which eye is active? Watch the object."

**Tool 4: Fragment with momentum.** A noun fragment that carries the weight without needing a verb.

> "Theophanic visions. Dreams. Meditative states. Artistic inspiration. Romantic love."
> "A brushwood fire or a theophany. The choice is not in the object." (This one has a negation in the second sentence but the first sentence does the real work.)

**Tool 5: Concrete image that makes the point.** Show, don't negate.

> Instead of "Not a metaphor for a state of mind. A place, with its own weather." → keep this one, it earned its keep
> Instead of "X is not academic. It determines whether you study or live it." → "The distinction has a consequence: you either study the imaginal world or you live in it."

## The Frequency Rule

- 1 negation-assertion per 800 words MAXIMUM
- That means 1-2 across an entire essay
- If you catch yourself writing "Not X" at the start of a sentence, STOP. Use a different tool.
- If you have used any form of negation-assertion in the last 3 AI blocks, the next block gets ZERO negations.

## The Self-Check

After writing each AI block, read only the first 3 words. If they are:
- "Not X" → rewrite
- "It is not" → rewrite
- "This is not" → rewrite
- "The X is not" → rewrite

Before finishing the essay, scan for these strings:
- "not " (in the first 5 words of any paragraph)
- "— not " or ", not "
- "Not " (start of sentence)
- "neither" / "nor" / "nothing"

If you find more than 2 across the whole thing, you have drifted. Rewrite the excess.

## Per-Essay Pattern Counts (v2 baseline)

| Essay | Negation-assertion count | Target for v3 |
|-------|------------------------|---------------|
| mundus_handcrafted_v2 | ~10 | ≤2 |
| becoming_an_angel | ~14 (8 called out by user) | ≤2 |
| ibn_arabi_barzakh | ~8 | ≤2 |
| corbin_creative_imagination | ~11 | ≤2 |

Reduce by 80% across the board.

---

## Full Anti-Slop Audit — v3 Results

### mundus_handcrafted_v2 v3

| Rule | Status | Notes |
|------|--------|-------|
| Flat transitions | ✓ | None |
| Redundant quotes | ✓ | Source blocks well-chosen |
| Unsupported claims | ✓ | Opinion is clearly opinion |
| Labels with payoff | ✓ | Eighth climate / Na-koja-Abad explained |
| AI repeats source | ~ | Block 4 (utopia vs Na-koja-Abad) overlaps source content mildly |
| Summary blocks | ✓ | None |
| Robot curator | ✓ | Committed stance throughout |
| Vary rhetorical moves | ✓ | Mix of flat assertion, question-answer, contrast, demand |
| No narration of writing | ✓ | Clean |
| Three-item parallel lists | ~ | "unreal, made-up, the stuff of fantasy" — borderline, not grammatically parallel though |
| Concrete nouns per block | ✓ | geography, climate zones, mountain, map, mirror, landscape |
| Hedge words | ✓ | None |
| Vary sentence length | ✓ | Good mix |
| Stance | ✓ | Committed throughout |

**Prose quality:** The most naturally cadenced of the four. The geographical/spatial metaphor holds consistently. "The distance between two souls in the spiritual world is measured by difference in inner state. That is the measure." reads well. The closing lacks a concrete landing image.

**Remaining issues:**
- Line 52: "just a map of nothing sensory" — slightly awkward. "Just a map of a different kind of space" reads better.
- Block 4 overlaps with source content rather than extending it.

### becoming_an_angel v3

| Rule | Status | Notes |
|------|--------|-------|
| Flat transitions | ✓ | None |
| AI repeats source | ✓ | Frames rather than restates |
| Robot curator | ✓ | "Forget wings. Forget the greeting-card version." alive |
| Vary rhetorical moves | ✓ | Good mix |
| No narration of writing | ~ | "Iamblichus distinguished between..." is slightly academic-recap in an otherwise Memoo voice |
| Concrete nouns per block | ✓ | weather, furnace, floors, wings, brushwood, silence |
| Hedge words | ✓ | None |
| Vary sentence length | ✓ | Good |
| Stance | ✓ | "Integration costs something" — committed |

**Prose quality:** The strongest individual moments in any essay ("Put the book down and sit in silence for five minutes. That silence has weather."). The "Iamblichus distinguished between..." sentence is the weakest — it's a scholarly summary surrounded by direct address. Needs rewriting in the same voice.

**Remaining issues:**
- "Iamblichus distinguished between reasoning about the gods and participating in divine reality through theurgic practice" — reads like a note card, not a guide speaking.

### ibn_arabi_barzakh v3

| Rule | Status | Notes |
|------|--------|-------|
| Flat transitions | ✓ | None |
| AI repeats source | ~ | Bridge block before "After death, spirits are deposited" is borderline restatement |
| Robot curator | ✓ | "Ibn Arabi will not clarify anything" — direct |
| Vary rhetorical moves | ✓ | Definition, metaphor, mirror analogy, chameleon test, pun-explanation |
| No narration of writing | ✓ | Clean |
| Concrete nouns per block | ✓ | shadow, sunlight, seas, mirror, chameleon, horn, light |
| Hedge words | ✓ | None |
| Stance | ✓ | "Ibn Arabi is adamant about this" — committed |
| Negation-assertion count | 0 | Clean |

**Prose quality:** Cleanest against the rules. The mirror analogy and chameleon test are genuinely good concrete anchors. "The pun is the whole theology compressed into a single word" is strong. Weakest moment is "Now the twist" which is a slightly formulaic transition.

**Remaining issues:**
- "Now the twist" is a flat transition opener (minor)
- The essay's voice is the most instructional — it explains well but rarely surprises

### corbin_creative_imagination v3

| Rule | Status | Notes |
|------|--------|-------|
| Flat transitions | ✓ | None |
| AI repeats source | ~ | Blocks on allegory/symbol, prayer, three stages sit very close to source content |
| Robot curator | ✓ | "That organ is what we have been told to distrust our whole lives" — commits |
| Vary rhetorical moves | ~ | Several blocks start "Ibn Arabi [verb]..." — mild repetition |
| No narration of writing | ~ | "Corbin gives Ibn Arabi's teaching a name..." is slightly narrative |
| Concrete nouns per block | ✓ | mirror, musical score, eyes, heart, metronome, brushwood, burning bush |
| Hedge words | ✓ | None |
| Stance | ✓ | Closing line lands |

**Prose quality:** The hardest source to write for (Corbin on Ibn Arabi — double density). The AI blocks sit closest to the source because the source is already so rich. "The organ that perceives what the fire actually is — theophany, Voice, presence — is the active Imagination. Without it, brushwood and wind. With it, the Burning Bush." is the best rewrite. "Each time through you go deeper" is weaker than the original "A cycle you repeat."

**Remaining issues:**
- Opening is flat: "The imagination Corbin discusses is something else" lacks the punch of the v2 opening (even though v2 used negation)
- Several AI blocks are informative but not alive — they explain correctly but don't sing
- "because it is the key" is a meta-judgment, not a demonstration

---

## v3 → v4: What Needs the Next Pass

### Across all four essays:

**1. The flat-assertion replacement is correct but sometimes flat.**
When you remove the negation, what's left is often a neutral statement. The v3 fix solved the pattern but in some blocks it solved it by draining drama. A flat assertion needs to be genuinely interesting, not just technically non-negated.

Example — corbin_creative_imagination line 18:
- v2: "The imagination Corbin is about to discuss is not the imagination you think you know. Not fantasy. Not daydreaming."
- v3: "The imagination Corbin discusses is something else."

v3 is rule-correct but boring. The v2 had energy even though it used negation. The fix should have been:
- Better: "Forget the imagination you think you know. Corbin means something else entirely."

**2. The "Ibn Arabi [verb]..." opener repeats across essays.**
Multiple blocks across corbin_creative_imagination start "Ibn Arabi describes...", "Ibn Arabi develops...", "Ibn Arabi [verb]." This is the same narration tic in milder form. Vary the subject: lead with the concept, not the author.

**3. The bridging AI blocks still sit too close to source content.**
When the AI explains what the source is about to say (rather than why it matters), it's restating in different words. The test: if you could remove the AI block and the source block still makes sense, the AI block is doing framing work but not depth work.

**4. Strong openings and closings are inconsistent.**
mundus opens strong ("The word 'imaginary' is a wreck") but closes without a concrete image. becoming_an_angel opens strong and now closes strong. ibn_arabi_barzakh and corbin_creative_imagination open and close adequately but not memorably.

## Cumulative Tic Catalog (from CLAUDE4.md)

Across 5 rewrite rounds, 8 tics have been identified. Fixing one reveals the next.

| # | Tic | Pattern | Fix |
|---|-----|---------|-----|
| 1 | Narrritivitis | "X opens with / introduces / turns to" | Zero tolerance. Deliver the idea. |
| 2 | Negat-assert-itis | "Not X, but Y" — every claim corrects first | Assert without negating. Max 1/essay. "Forget X" is same pattern. |
| 3 | Self-narration disguised | "The paper opens with..." | Same fix as #1 — never narrate structure. |
| 4 | Paraphrase-itis | AI block restates source in different words | Every block must add what source doesn't say. |
| 5 | Museum-guide neutrality | Uniform sentence length, no pulse | Vary length. Fragments. Read aloud test. |
| 6 | The ending problem | Last paragraph is always weakest, closest to source | Rewrite ending FIRST, not last. Never end on source's words. |
| 7 | Three-item lists | Exactly three parallel items | Two or four. Never three. |
| 8 | Performance-itis | Jovial introductions, fake energy | Trust the material. Alive comes from precision, not effort. |

### Specific fixes for v4 if you revisit:

**mundus_handcrafted_v2:**
- Replace "just a map of nothing sensory" with "just a map of a different kind of space"
- Add a concrete closing image (the soul's true country is already in the last source block, so the AI doesn't need to add more — it can end silently)

**becoming_an_angel:**
- Rewrite "Iamblichus distinguished between reasoning about the gods and participating in divine reality through theurgic practice" → "For Iamblichus, you could either reason about the gods or you could participate in them through theurgic practice. One is study. The other is theurgy."

**corbin_creative_imagination:**
- Rewrite opening: "Forget the imagination you think you know. Corbin means something else entirely."
- Vary the "Ibn Arabi [verb]" openers — lead with the concept instead
- "because it is the key" → "because the difference between allegory and symbol is the difference between studying a map and walking the territory"

---

## Prose Quality — Honest Assessment

### What's genuinely working:

Lines where the voice is unmistakably a person talking, not a rule-following system:

> "Put the book down and sit in silence for five minutes. That silence has weather. Corbin gave it a name."

> "Forget wings. Forget the greeting-card version. Corbin's Angel is the most real thing a person will ever meet."

> "Without it, brushwood and wind. With it, the Burning Bush."

> "That organ is what we have been told to distrust our whole lives."

> "The pun is the whole theology compressed into a single word."

These work because they take a risk. They don't explain — they show or they commit.

### What's still a student exercise:

- "Iamblichus distinguished between reasoning about the gods and participating in divine reality through theurgic practice" — this is a sentence written by someone who knows the material and wants you to know they know it. It's competent and dead.
- "Ibn Arabi develops a science of the Imagination through prayer. Prayer as dialogue..." — correct but flat. The source says "science of the Imagination" and so does the AI. Copying the source's headline is not Memoo.
- Several blocks in corbin_creative_imagination are "AI as competent explainer" rather than "AI as guide with stakes"

### The guiding question for future work:

**Could someone who knows nothing about this subject read this and feel something, or just understand something?** If they only feel like they understood it, the prose passed the test but failed the point. The imaginal is felt, not understood.
