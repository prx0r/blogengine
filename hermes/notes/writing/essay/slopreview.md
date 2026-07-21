# SlopReview — Three-Pass Conscious Editing Protocol

## The Hard Truth

You cannot produce beautiful prose in a single pass. Your default output contains 8+ identifiable patterns that make it read like an AI. You cannot see these patterns while you are generating them — the detection and generation circuits are the same, and they don't talk to each other.

The only way to produce good work is to **write → detect → repair → texture** in four separate passes. Each pass has a single job. Do not combine them.

**The essay version history proves this.** Version 1 had narrritivitis. Version 2 swapped it for negat-assert-itis. Version 3 swapped that for museum-guide neutrality. Version 4 made one cosmetic change that made things worse. Version 5 (first real change) fixed narration and the ending but introduced rule-dodging four-item lists and a disguised "correct the wrong idea" staging move. Each version looks different to the generator but identical to a reader who knows the patterns.

Stop trying to rewrite the whole essay. You can't. **Edit individual phrases, one at a time.**

---

## Pass 1: Identify — Read the Essay Cold

Read the essay as if you've never seen it. Do not edit. Just mark.

For every sentence, ask: **"Is this a pattern I've seen before?"**

Mark each sentence with one of:
- `[NARR]` — narrates what the text or author does ("The paper opens with...", "X introduces...")
- `[NEG]` — "not X, but Y" structure or any negate-then-assert move
- `[3LIST]` — exactly three grammatically parallel items
- `[PARA]` — paraphrases the source without adding
- `[FLAT]` — uniform sentence length, no pulse, no fragments
- `[CLICHÉ]` — self-help language, greeting-card profundity, fake punch
- `[SAME-ENDING]` — final paragraph shares wording with the source's final paragraph

Write the marked-up version to a working file. Do not touch the original yet.

---

## Pass 2: Repair — One Phrase at a Time

For each marked sentence, open the working file and change ONLY that sentence. Then close the file. Re-read the surrounding context. Make sure the fix doesn't create a new pattern.

### Pattern Catalog

#### 1. Narrritivitis [NARR]
*"The paper opens with alchemy..." / "Voss opens with..." / "X introduces..."*

→ **Remove the structural narration entirely.** Just say what the thing is.
- BAD: "The paper opens with alchemy, and the choice is deliberate because alchemy provides the controlling metaphor..."
- GOOD: "Alchemy is the controlling metaphor because..."

Test: If you can delete the first clause and the sentence still works, delete it.

#### 2. Negat-assert-itis [NEG]
*"Not conceptual analysis" / "not projections of the psyche but presences" / "not a creative one" / "not a distinction between two different faculties but between two different orientations" / "not decoration... but a form of spiritual transmission" / "not just understanding" / "not easy"*

All of these are the same move: clear the ground → build. The reader intuits "here comes a correction" before they reach the content.

→ **Replace with:** flat assertion, question-answer, "forget X" sparingly, or a fragment.
- BAD: "not a creative one"
- GOOD: "a spiritual discipline, which is a different category entirely"

Count every instance. If >2 across the whole essay, you have negat-assert-itis regardless of how different each instance looks.

#### 3. Three-Item Lists [3LIST]
*"gods, angels, and daimons" / "a journey to the underworld, a fight with the dragon, a nigredo"*

→ **Add a fourth item or reduce to two.** The pattern is visible even when the content differs.
- BAD: "gods, angels, and daimons"
- GOOD: "gods, angels, daimons, and other presences"

⚠ **Watch out: four-item lists are the same problem.** Adding a fourth item to dodge the rule leaves you with evenly-spaced enumeration where no single item carries weight. "Descent, combat, dissolution, reformation" avoids the letter of the three-list rule but keeps the exact same cadence: four items, same grammatical form, no emphasis on any one. Fix: pick one item from each list and spend a sentence on it. Let the others fall away or get absorbed into the sentence structure. The goal is WEIGHT, not count.

⚠ **Watch out: flat lineage chains.** "From Plotinus through Iamblichus to Jung and Hillman" or "from A through B to C and D" — this is the same enumeration problem phrased as a chain instead of a list. Same flatness. Same lack of weight. Fix: drop at least one name, or pick the connection that matters and name only it. A lineage chain says "these are connected." A focused reference says "this connection is the one that matters."

#### 4. Paraphrase-itis [PARA]
*AI block restates the source in different words, same structure, same claims, same order.*

→ **Before writing, identify what the source block doesn't say. Write that.**
- BAD: "Ta'wil refers to the process of interiorisation, of restoring the true meaning..."
- GOOD: "Ta'wil is the method that makes integration possible because it trains the soul to see through surfaces."

Test: If you can remove the AI block and the reader still understands everything, delete it.

#### 5. Museum-Guide Neutrality [FLAT]
*Every sentence 20-35 words. No fragments. No short sentences. No rhythmic variety.*

→ **Read aloud. Add one sentence under 8 words. Add one fragment. Then check again.**
- BAD: "The distinction between Aristotelian and Platonic modes of knowing is essential here because Corbin's project depends on the Platonic conviction that one must participate in a reality in order to know it."
- GOOD: Add: "Corbin never seriously entertained the first." (short sentence break)

#### 6. Cliché Infiltration [CLICHÉ]
*Self-help language dropped in without irony: "the power of now," "living your truth," "being present," etc.*

→ **If you wrote it, delete it. If it's in the source, footnote it or rewrite around it.** Never drop a modern self-help phrase into a premodern context without flagging the mismatch.

#### 7. The Dead Ending [SAME-ENDING]
*The last AI block nearly identical to the source's last block. Same key words. Same structure. Same closing phrase.*

→ **Rewrite the ending FIRST, not last. Close the file. Re-open and rewrite only the ending. Repeat three times.** The ending needs more passes than any other paragraph. It will resist change. Keep going.

---

## Pass 3: Verify — Fresh Eyes Review

Read the edited essay as if you've never seen it. Use the checklist below. For each item, state the count.

### Final Checklist

| Check | Target | Actual |
|-------|--------|--------|
| Sentences starting with "Not" | 0 | ___ |
| "not X, but Y" constructions | ≤2 | ___ |
| Structural narration ("paper opens", "X introduces") | 0 | ___ |
| Three-item lists | 0 | ___ |
| Sentences all same length (±5 words of each other) | 0 (mark how many) | ___ |
| Phrases from self-help culture | 0 | ___ |
| Final paragraph shares key words with source's final paragraph | 0 | ___ |
| AI block that can be removed without loss | 0 | ___ |
| One line that's genuinely alive | ≥1 | ___ |

### The Smuggle Test

After verifying, read the essay one more time looking for **disguised versions of the same patterns**.

The Negat-assert pattern can wear many faces:
- "Not X. Y." → fragment form
- "X, not Y" → clause form
- "Forget X. Y." → imperative form
- "Without X, Y." → condition form
- "X is what Y is not" → inverted form
- "Instead of X, Y" → substitution form
- "What X lacks is Y" → lack form
- "X alone cannot Y" → insufficiency form

All of these are the same move. If you find any, you still have negat-assert-itis.

The Negat-assert pattern can also wear these disguises:
- "Name the wrong idea, then assert the right one" → staging form. Example: "The modern assumption that imagination produces fictions misses the point entirely. Imagination produces perceptions." The first sentence names the wrong idea ("misses the point"), the second asserts the right one. Same corrective DNA as "not X, but Y," just stretched across two sentences instead of one. Fix: lead with the correct claim and never mention the wrong idea at all. If you catch yourself staging a wrong idea to knock it down, skip the knockdown and just state what is true.

The Narration pattern can wear these faces:
- "The paper opens with..." → self-narration
- "Voss introduces..." → author-narration
- "This section examines..." → section-narration
- "We now turn to..." → collective-narration
- "What follows is..." → preview-narration

All of these are the same move. Zero tolerance.

---

## Pass 4: Voice — Tinker with Imagery, Fix Overcorrections, Sprinkle Joy

**This pass is about texture, not correctness.** The first three passes eliminate pattern violations. Pass 4 adds what eliminates cannot produce: interesting word choices, imaginal language, and the kind of specific, unexpected phrase that gives prose pulse.

Do NOT open a new paragraph. Do NOT rewrite. Open the already-edited file and change individual words or short phrases, one at a time.

### What to look for

**1. Abstract nouns that could be concrete.**
- BAD: "the world has lost the capacity to see beyond surfaces"
- GOOD: "the world has forgotten how to look beyond the skin of things"
- BAD: "presences encountered in an intermediate realm"
- GOOD: "presences that thrum in the space between worlds"

**2. Overcorrections from earlier passes.**
The pattern elimination passes sometimes drain the life out of a sentence. If a sentence feels correct but dead — it follows all the rules but has no texture — this is an overcorrection. Restore some texture: add a concrete noun, a vivid verb, or an unexpected modifier.

- BAD (after NEG removal): "The observer is entangled with what is observed — participation is the condition of perception."
- BETTER (add texture): "The observer is entangled with what he beholds — participation is the condition of perception."

**3. One unexpected word per block.**
Every AI block should contain at least one word that feels slightly out of register — a word from poetry, craft, or the sensory world that the reader didn't expect in an academic context. Examples: thrum, whet, flint, salt, gravid, lattice, silt, tendril, sheen, incandescent, striate.

- BAD: "A brushwood fire to the senses — a theophany to the imagination."
- BETTER: "A brushwood fire to the senses — a theophany that sears through to the imagination."

**4. Flat nouns that could carry more weight.**
Replace generic nouns with more specific ones:
- "things" → "substances, textures, presences"
- "work" → "craft, discipline, art"
- "world" → "terrain, landscape, domain"

Test: read the sentence aloud. If it sounds like it could appear in a university lecture, replace at least one noun with something that doesn't belong there.

### Checklist for Pass 4

| Check | Target | Actual |
|-------|--------|--------|
| Overcorrections (correct but dead) | 0 | ___ |
| Blocks with zero texture | 0 | ___ |
| One unexpected word per block | ≥1 | ___ |
| Concrete nouns replace abstract ones | ≥2 | ___ |
| The essay sounds like a person wrote it, not a committee | yes | ___ |

---

## Deployment

After all four passes, **create a new file with a new ID**. Do not overwrite.

```bash
cp content/glossary/essays/essay_previous.json content/glossary/essays/essay_v{NEW}.json
# Edit the id and title in the new file
node scripts/generate-graph-json.mjs
npm run cf:deploy
```

The new URL will be: `https://re-rendering-atlas.tradesprior.workers.dev/essay/{new_id}`

---

## The History That Proves This Is Necessary

| Version | Change | New problem introduced |
|---------|--------|----------------------|
| v1 (original) | — | Narrritivitis (every block narrates the author) |
| v2 (memoo) | Fixed narration | Negat-assert-itis (every claim corrects first) |
| v3 (beautiful) | Fixed negation | Paraphrase-itis (repeats source, no pulse) |
| v4 (beautiful v2) | Added interpretive claims | Self-narration disguised ("The paper opens with...") |
| v5 (beautiful v3) | Fixed paraphrase | Cliché infiltration ("power of now") |
| v6 (beautiful v4) | One cosmetic change | Ending still unrevived for 5 versions |
| v7 (v5) | First real change: narration fixed, ending rewritten, rhythm added | Rule-dodging four-item lists, disguised "correct the wrong idea" staging, flat lineage chain |
| v8 (v6) | Fixed enumeration, staging, lineage; Pass 4 texture added | TBD |
