# TTS Style Guide — Fluidity for AI Voice

These essays are read aloud by synthetic voice (Aria, female US). The ear processes differently than the eye. What looks good on the page can sound choppy, abrupt, or exhausting when spoken for 10+ minutes.

## Core Principle

**The ear prefers momentum over correctness.** A period is a full stop — the voice resets, the breath restarts. Too many periods in succession and the reading becomes a series of jolts. The listener feels the rhythm before they register the content.

## Sentence Architecture

### 1. Favor flowing sentences over staccato fragments

**Avoid:**
> Not power, not necessity, not administrative decree. Love. The world exists because God loves to be known.

Short fragments demand hard full stops. The AI reads each as a separate unit, creating a percussive, almost aggressive rhythm.

**Prefer:**
> Love is the motive — not power, not necessity, not administrative decree. The world exists because God loves to be known.

The dash carries the same emphasis as a fragment but keeps the sentence alive. The period lands later, more naturally.

### 2. Use em-dashes as breath pauses, not full stops

Em-dashes are gentler than periods. They signal a pivot, a qualification, an afterthought — without resetting the entire rhythm. The voice can glide through them.

**Aim for:** 1-2 em-dashes per 3-4 sentences, especially at syntactic pivots.

**Pattern:** `[Assertion] — [qualification or inversion]`

> The soul is the center of everything — not the geometric center, the functional center.

### 3. Chain clauses with commas and conjunctions

Replace period + new sentence with `, and`, `, for`, `, because`, ` — `, `;` where possible.

**Avoid:**
> The mirror is what you are. A reflection cannot exist apart from it.

**Prefer:**
> The mirror is what you are, and a reflection cannot exist apart from it.

### 4. Vary sentence length — but avoid clusters of very short sentences

The 20-60-20 distribution from the v6 algorithm still applies:
- ~20% short (under 30 chars / ~8 words) — for emphasis, not everywhere
- ~60% medium (30-100 chars) — the body
- ~20% long (over 100 chars) — cascading clauses, dashes

But cluster short sentences together rarely. One short sentence surrounded by longer ones reads as emphasis. Three short sentences in a row reads as choppy.

## Rhythm for Audio

### 5. The breath pattern

Write for the pattern: **breathe in — phrase — breathe in — phrase**. Each sentence should be speakable in one breath (roughly 120-150 chars / 20-25 words). Longer sentences need internal breathing points (commas, dashes, clause breaks).

### 6. Openings that hook the ear

The first sentence sets the register for the entire essay. For audio, prefer openings that:
- Begin with a concrete image or question
- Avoid throat-clearing ("This essay explores...")
- Use rhythm that draws you forward

**Good:** "There is a pulse happening in you right now that is not your heartbeat."
**Not good:** "The concept of Spanda is a fundamental principle of Kashmir Shaivism."

### 7. Endings that land softly

The last 2-3 sentences should feel like a completion, not a cutoff. Avoid:
- Taglines that sum up
- Abrupt declarations
- Echoing the opening too literally

**Good:** "Let Abhinavagupta have the last word..."
**Not good:** "Thus, Spanda is the key to understanding consciousness."

## NEG Patterns in Audio

NEG patterns are worse in audio than in text. A listener cannot skim past the "not" — they have to wait through the entire correction before reaching the positive. This creates a sense that the essay is constantly disagreeing with someone, which is exhausting at speaking pace.

**Fix for audio:** Lead with the positive assertion. If you must make a distinction, use a comma or dash rather than a "not...but" structure.

## Concrete Language for Audio

Abstract nouns land poorly in speech. The ear needs images to anchor meaning. Replace:
- "transformation" → "ripening, burning, unfolding"
- "perception" → "sight, touch, the eye"
- "connection" → "thread, bridge, hinge"

Every paragraph should have at least one concrete image that the voice can land on.

## Punctuation for TTS

| Symbol | Audio Effect | Use |
|--------|-------------|-----|
| `.` | Full stop, breath reset | End of complete thought |
| `,` | Brief pause | Same breath, continuing thought |
| `—` | Pivot pause | Emphasis without full stop |
| `:` | Anticipation | "Here comes the explanation" |
| `;` | Linking pause | Two balanced halves |
| `?` | Rising intonation | Direct address, rare (0-1 per essay) |

Hard full stops (`.`) should be the rarest. Aim for 1-2 periods per 3-4 sentences, with the rest handled by softer punctuation.
