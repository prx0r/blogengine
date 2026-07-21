# LTX-2.3 Official Prompting Guide

Directly from the LTX team. Key changes from 2.0 to 2.3.

## 1. Be More Specific. The Engine Can Handle It.

LTX-2.3 has a larger text connector — it interprets complex prompts accurately. **Specificity wins.**

Instead of:
```
A woman in a café
```

Try:
```
A woman in her 30s sits by the window of a small Parisian café. Rain runs down the glass behind her. Warm tungsten interior lighting. She slowly stirs her coffee while glancing at her phone. Background softly out of focus.
```

**Our mistake:** We were writing the first kind (vague, generic). LTX-2.3 rewards the second kind.

## 2. Direct the Scene, Don't Just Describe It

Be explicit about spatial layout:
- Left vs right
- Foreground vs background
- Facing toward vs away
- Distance between subjects

Instead of:
```
Two people talking outside
```

Try:
```
Two people stand facing each other on a quiet suburban sidewalk. The taller man stands on the left, hands in pockets. The woman stands on the right, holding a bicycle. Houses blurred in the background.
```

Block the scene like a director.

## 3. Describe Texture and Material

The rebuilt VAE handles fine detail better. So describe:
- Fabric types (wool, linen, silk)
- Hair texture (fine, curly, windblown)
- Surface finish (polished, rough, weathered)
- Environmental wear (cracked, mossy, aged)
- Edge detail (sharp, soft, frayed)

## 4. For Image-to-Video, Use Verbs

Motion still needs clarity. Specify:
- Who moves
- What moves
- How they move
- What the camera does

Avoid: `The scene comes alive`
Instead: `The camera slowly pushes forward as the subject turns their head and begins walking toward the street. Cars pass.`

**This is why our still scenes were static.** We weren't describing motion, we were describing photos.

## 5. Avoid Static, Photo-Like Prompts

If the prompt reads like a still image, the output behaves like one.

Instead of:
```
A dramatic portrait of a man standing
```

Try:
```
A man stands on a windy rooftop. His coat flaps in the wind. He adjusts his collar and steps forward as the camera tracks right.
```

Action reduces static outputs. **Every prompt needs a verb sequence.**

## 6. Audio is Better Now

New vocoder. Describe audio specifically:
- Environmental audio (rain, wind, footsteps)
- Tone and intensity (soft, pulsing, urgent)
- Dialogue clarity (whispered, distant, clear)

Example:
```
A low, pulsing energy hum radiates from the glowing orb. A sharp, intermittent alarm blares in the background.
```

We've been silencing audio. We should experiment with ambient audio now.

## 7. LTX-2.3 Rewards Direction

Earlier versions rewarded simplicity. **2.3 rewards direction.**
- Layer multiple actions in one shot
- Combine detailed environments with character moments
- Direct camera movement alongside subject motion
- The engine holds structure under complexity

---

## What This Means For Our Prompts

| Our old approach (wrong) | New approach (right) |
|--------------------------|----------------------|
| "A small geometric clay figure sits in darkness" | "A person sits cross-legged on a worn wooden floor, hands resting on knees, soft window light from the left illuminating their hands, they breathe slowly, eyes closed, the light gradually warms and softens" |
| "Warm parchment tones, clay-textured" | "The surface has visible grain and slight weathering, warm amber light catches the texture" |
| "Static camera, 24fps" | "The camera slowly pushes in as the light shifts, dust particles float through the beam" |
| "Silence, no audio, complete quiet" | "Soft ambient room tone, distant rain against glass, the subtle crackle of a nearby fireplace" |

**The core lesson:** LTX-2.3 can handle richness. We were starving it.
