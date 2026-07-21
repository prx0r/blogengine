/**
 * Spellbook — structured practice data with query engine.
 * 
 * Connect to macro translation: when convergence detects a need,
 * query the spellbook for practices matching the active planets/signs.
 * 
 * Every entry uses shared entity IDs so the knowledge graph bridges them.
 */

import type { SpellEntry, SpellSource, SafetyClass, SpellbookQuery } from "./types";

// ─── Sample entries from source texts ───

export const SPELLBOOK: SpellEntry[] = [
  // ── Ficino ──
  {
    id: "ficino:solar:001", source: "Ficino", type: "meditation",
    purpose: ["vitality", "leadership", "clarity", "strength"],
    triggers: ["trigger:active:sun"], planets: ["planet:sun"],
    title: "Solar Attunement",
    summary: "Ficino recommends dawn practice facing east, gold or yellow garments, and singing Orphic hymns to the Sun to strengthen the spiritus and vital force.",
    procedure: [
      "At dawn, face east.",
      "Wear gold, yellow, or amber.",
      "Burn frankincense.",
      "Recite the Orphic Hymn to the Sun.",
      "Meditate on golden light filling the body.",
    ],
    timing: { planetaryDay: 0, moonPhase: "waxing" },
    materials: { incenses: ["frankincense"], colours: ["gold", "yellow"] },
    safety: "safe_symbolic",
    safeAdaptations: ["Can be done seated if unable to stand", "Use a gold candle instead of garments"],
  },
  {
    id: "ficino:saturn:001", source: "Ficino", type: "meditation",
    purpose: ["discipline", "structure", "endurance", "patience"],
    triggers: ["trigger:active:saturn", "trigger:year_lord:saturn"], planets: ["planet:saturn"],
    title: "Warming Saturn Practice",
    summary: "Ficino treats Saturn with caution, recommending warming, solar counterbalances, myrrh, slow deliberate practice, and avoidance of melancholy isolation.",
    procedure: [
      "Practice in the morning (Saturn hour on Saturday).",
      "Burn myrrh or cinnamon.",
      "Slow, deliberate movement — walking meditation.",
      "Wear dark blue or black with a touch of gold.",
      "Contemplate structure: what needs to be built?",
      "End with a brief solar visualization.",
    ],
    timing: { planetaryDay: 6, moonPhase: "waning" },
    materials: { incenses: ["myrrh", "cinnamon"], colours: ["dark blue", "black", "gold"] },
    safety: "safe_symbolic",
    safeAdaptations: ["No incense? Use visualization only", "Keep sessions short to avoid melancholy"],
  },
  {
    id: "ficino:mercury:001", source: "Ficino", type: "meditation",
    purpose: ["writing", "communication", "study", "eloquence"],
    triggers: ["trigger:active:mercury", "trigger:daimon:mercury"], planets: ["planet:mercury"],
    title: "Mercurial Study Practice",
    summary: "Ficino links Mercury to study, writing, and eloquence. Clear, moderate music and focused intellectual work in the morning hours.",
    procedure: [
      "Morning hours, Mercury day (Wednesday) or hour.",
      "Burn lavender or mint.",
      "Play clear, moderate-tempo instrumental music.",
      "Write or study for a timed period (25-30 minutes).",
      "Speak one clear intention aloud before beginning.",
      "After practice, pause and reflect — what became clear?",
    ],
    timing: { planetaryDay: 3 },
    materials: { incenses: ["lavender"], colours: ["yellow", "pale blue"] },
    incantation: "Hermes, guide my hand and mind toward clarity.",
    safety: "safe_symbolic",
    safeAdaptations: ["No music? Silence works", "No incense? Open a window for fresh air"],
  },
  {
    id: "ficino:venus:001", source: "Ficino", type: "meditation",
    purpose: ["love", "harmony", "beauty", "pleasure"],
    triggers: ["trigger:active:venus"], planets: ["planet:venus"],
    title: "Venusian Harmony",
    summary: "Ficino associates Venus with harmonious music, rose scents, green surroundings, and the cultivation of gracious love and aesthetic refinement.",
    procedure: [
      "Surround yourself with green and rose.",
      "Burn rose or sandalwood.",
      "Listen to consonant, harmonious music.",
      "Create or appreciate something beautiful.",
      "Cultivate gracious speech — speak kindly.",
    ],
    timing: { planetaryDay: 5 },
    materials: { incenses: ["rose", "sandalwood"], colours: ["green", "rose", "pink"] },
    safety: "safe_symbolic",
    safeAdaptations: ["A single rose in a vase is enough", "Listen to any music you find beautiful"],
  },

  // ── Orphic Hymns ──
  {
    id: "orphic:sun:001", source: "Orphic", type: "prayer",
    purpose: ["vitality", "illumination", "purification", "strength"],
    triggers: ["trigger:active:sun"], planets: ["planet:sun"],
    title: "Orphic Hymn to the Sun",
    summary: "Orphic Hymn 8 to the Sun invokes the 'everlasting eye' that governs the cosmos, calling for light, life, and purification.",
    procedure: ["Recite at dawn facing east.", "Offer a candle or lamp as symbolic light.", "Meditate on the sun's light filling your awareness."],
    incantation: "Hear, blessed one, whose eye sees all from afar, / Sun, fiery Titan, ever-living flame, / Who gives light to mortals, who brings the seasons, / Pure guardian of the world, come with your radiance.",
    materials: { other: ["candle or lamp"] },
    safety: "safe_symbolic",
    safeAdaptations: ["Recite silently if preferred", "A simple candle suffices"],
  },
  {
    id: "orphic:mercury:001", source: "Orphic", type: "prayer",
    purpose: ["eloquence", "guidance", "craft", "writing"],
    triggers: ["trigger:active:mercury", "trigger:daimon:mercury"], planets: ["planet:mercury"],
    title: "Orphic Hymn to Hermes",
    summary: "Orphic Hymn 28 to Hermes invokes the messenger of Zeus who guides souls, sharpens wit, and blesses speech.",
    procedure: ["Recite before writing or study.", "Offer frankincense.", "Speak a clear intention aloud."],
    incantation: "Hermes, messenger of Zeus, guide of souls, / Who turns the key of dreams, who brings light to words, / Sharpen my tongue, clarify my thought, / Let what I speak be true and what I write be clear.",
    materials: { incenses: ["frankincense"] },
    safety: "safe_symbolic",
    safeAdaptations: ["Recite mentally before important communication"],
  },

  // ── Picatrix (safe adaptations) ──
  {
    id: "picatrix:mercury:001", source: "Picatrix", type: "ritual",
    purpose: ["knowledge", "writing", "interpretation", "eloquence"],
    triggers: ["trigger:active:mercury"], planets: ["planet:mercury"],
    title: "Mercurial Knowledge Operation (Adapted)",
    summary: "Picatrix describes Mercurial operations for knowledge, speech, and subtle skill, performed when Mercury is well-placed and the Moon in appropriate signs.",
    procedure: [
      "Write a clear intention on clean paper.",
      "Recite a Mercury hymn or prayer.",
      "Perform a timed study or writing block (25 minutes).",
      "Use symbolic colours: yellow and pale blue.",
      "Burn lavender or mint if available.",
      "Conclude by speaking your intention aloud.",
    ],
    timing: { planetaryDay: 3, moonPhase: "waxing" },
    materials: { colours: ["yellow", "pale blue"] },
    safety: "historical_reference",
    safeAdaptations: ["Omit any hazardous or coercive elements", "Focus on study and writing, not spirit invocation"],
  },
  {
    id: "picatrix:mars:001", source: "Picatrix", type: "ritual",
    purpose: ["courage", "protection", "overcoming", "strength"],
    triggers: ["trigger:active:mars", "trigger:detriment:mars"], planets: ["planet:mars"],
    title: "Martial Courage Operation (Adapted)",
    summary: "Picatrix records Martial operations using iron, red stones, and specific suffumigations when Mars is in its dignities.",
    procedure: [
      "Hold a piece of iron or hematite.",
      "Visualize a red shield around you.",
      "Recite a prayer for courage (Orphic Hymn to Ares).",
      "Perform a physical practice — push-ups, walking, or martial form.",
      "Speak: 'I act with courage, not with anger.'",
    ],
    timing: { planetaryDay: 2 },
    materials: { metals: ["iron"], stones: ["hematite"] },
    safety: "historical_reference",
    safeAdaptations: ["No iron? Visualize red light", "Focus on courage, not aggression"],
  },
  {
    id: "picatrix:venus:001", source: "Picatrix", type: "ritual",
    purpose: ["love", "beauty", "harmony", "relationships"],
    triggers: ["trigger:active:venus"], planets: ["planet:venus"],
    title: "Venusian Beauty Operation (Adapted)",
    summary: "Picatrix details Venusian operations using rose, copper, green silk, and specific prayers for love and beauty.",
    procedure: [
      "Create a small space with green and rose elements.",
      "Hold a piece of copper or green stone.",
      "Burn rose or sandalwood.",
      "Recite a prayer for love and harmony.",
      "Meditate on what you wish to attract or harmonize.",
    ],
    timing: { planetaryDay: 5, moonPhase: "waxing" },
    materials: { metals: ["copper"], stones: ["emerald", "rose quartz"], incenses: ["rose", "sandalwood"] },
    safety: "historical_reference",
    safeAdaptations: ["No copper? A green ribbon works", "Focus on self-love and harmony, not manipulation of others"],
  },

  // ── Agrippa ──
  {
    id: "agrippa:jupiter:001", source: "Agrippa", type: "meditation",
    purpose: ["wisdom", "prosperity", "generosity", "expansion"],
    triggers: ["trigger:active:jupiter"], planets: ["planet:jupiter"],
    title: "Jupiterian Wisdom Practice",
    summary: "Agrippa correlates Jupiter with Chesed, sapphire, royal blue, and operations for gaining wisdom and favor. Adapted for safe practice.",
    procedure: [
      "Surround yourself with blue.",
      "Read a passage of philosophy or ethics.",
      "Contemplate: what is the generous action today?",
      "Perform one act of generosity.",
      "Recite a prayer for wisdom.",
    ],
    materials: { colours: ["blue", "royal purple"], stones: ["sapphire"] },
    safety: "historical_reference",
    safeAdaptations: ["Reading philosophy is the core practice", "Generosity can be small — a kind word counts"],
  },
  {
    id: "agrippa:saturn:001", source: "Agrippa", type: "meditation",
    purpose: ["discipline", "structure", "karma", "patience"],
    triggers: ["trigger:active:saturn"], planets: ["planet:saturn"],
    title: "Saturnian Structure Practice",
    summary: "Agrippa correlates Saturn with Binah, lead, black, contemplation of limits and time. Adapted for safe practice.",
    procedure: [
      "Sit in a quiet space with minimal distraction.",
      "Contemplate one area of life that needs structure.",
      "Write down one concrete step toward building that structure.",
      "Speak: 'I build with patience. I honor my limits.'",
      "Take one slow, deliberate action.",
    ],
    materials: { colours: ["black", "dark grey"] },
    safety: "historical_reference",
    safeAdaptations: ["Avoid any binding or coercive practices", "Focus on self-discipline, not control of others"],
  },

  // ── PGM (Greek Magical Papyri) ──
  {
    id: "pgm:mercury:001", source: "PGM", type: "ritual",
    purpose: ["oracular insight", "divine communication", "clarity"],
    triggers: ["trigger:active:mercury"], planets: ["planet:mercury"],
    title: "Mercurial Dream Oracle (Adapted)",
    summary: "The Greek Magical Papyri contain spells invoking Hermes for oracular dreams and communication with spirits. Adapted for safe symbolic practice.",
    procedure: [
      "Before sleep, recite a prayer to Hermes for clarity.",
      "Place a clear intention in mind: 'I wish to understand ___'",
      "Keep a journal by the bed.",
      "Upon waking, write down any dreams or insights immediately.",
    ],
    timing: { moonPhase: "new" },
    safety: "historical_reference",
    safeAdaptations: ["No invocation needed — journaling alone is the core practice", "Focus on self-knowledge, not spirit communication"],
  },
  {
    id: "pgm:moon:001", source: "PGM", type: "ritual",
    purpose: ["dream divination", "emotional healing", "intuition"],
    triggers: ["trigger:active:moon"], planets: ["planet:moon"],
    title: "Lunar Dream Practice (Adapted)",
    summary: "PGM lunar spells invoke Selene for dream oracles and emotional release. Adapted for safe practice.",
    procedure: [
      "Evening practice, preferably under moonlight.",
      "Burn sandalwood or jasmine.",
      "Write down one question or intention for the night.",
      "Recite a prayer to the Moon for insight.",
      "Keep a dream journal by the bed.",
    ],
    timing: { moonPhase: "full" },
    materials: { incenses: ["sandalwood", "jasmine"] },
    safety: "historical_reference",
    safeAdaptations: ["No moonlight? A silver candle works", "The core practice is intention + journaling"],
  },
  {
    id: "pgm:sun:001", source: "PGM", type: "prayer",
    purpose: ["divine connection", "protection", "illumination", "vitality"],
    triggers: ["trigger:active:sun"], planets: ["planet:sun"],
    title: "Apollonian Invocation (Adapted)",
    summary: "PGM I. 262-347 describes an invocation of Apollo (Helios) using laurel, a special lamp, and a recited power name to receive divine spirit and protection.",
    procedure: [
      "Take a sprig of laurel and hold it in your right hand.",
      "Set up a clean lamp with linen wick, using rose oil.",
      "Dress in white or prophetic garments.",
      "Recite the power name: 'ABERAMENTHOULERTHEXANAXETHRENLYOOTHNEMARAIBAI AEMINNAEBAROTHERRETHOBABEANIMEA' focusing on the flame.",
      "Meditate on golden light filling your awareness.",
      "Remain in silence, receptive to whatever arises.",
    ],
    incantation: "ABERAMENTHOULERTHEXANAXETHRENLYOOTHNEMARAIBAI AEMINNAEBAROTHERRETHOBABEANIMEA",
    timing: { moonPhase: "waxing" },
    materials: { herbs: ["laurel"], incenses: ["rose"], colours: ["white", "gold"], other: ["lamp", "linen cloth", "olive oil"] },
    safety: "historical_reference",
    safeAdaptations: ["Laurel can be dried or fresh — a sprig from a tree or a bay leaf works", "A simple white candle substitutes for the lamp", "The power name can be recited silently or aloud"],
    citation: "PGM I. 262-347",
  },
  {
    id: "pgm:sun:002", source: "PGM", type: "meditation",
    purpose: ["memory", "mental clarity", "focus", "learning"],
    triggers: ["trigger:active:mercury", "trigger:active:sun"], planets: ["planet:mercury", "planet:sun"],
    title: "Helios Memory Invocation (Adapted)",
    summary: "PGM spells invoke Helios while holding specific plants to grant memory and mental clarity. The practitioner prostrates and recites the power name three times.",
    procedure: [
      "Find a quiet space facing east or toward the sun.",
      "Hold a sprig of laurel or other solar herb.",
      "Prostrate or bow deeply, touching the ground.",
      "Recite three times: 'Enter into my heart, having granted memory to my soul, to my eyes.'",
      "Remain still for several minutes, receiving the clarity.",
      "Write down whatever comes to mind.",
    ],
    incantation: "Enter into my heart, having granted memory to my soul, to my eyes. SALBANACHAM...",
    safety: "historical_reference",
    safeAdaptations: ["Prostration can be replaced with seated bow", "The core is the threefold recitation with intent"],
    citation: "PGM III. 410-23 / PGM I. 232-47",
  },
  {
    id: "pgm:sun:003", source: "PGM", type: "talisman",
    purpose: ["protection", "courage", "invincibility", "strength"],
    triggers: ["trigger:active:sun", "trigger:active:mars"], planets: ["planet:sun", "planet:mars"],
    title: "Solar Protective Charm (Adapted)",
    summary: "PGM I. 262-347 includes a protective charm that the practitioner carries through the rite. The laurel sprig inscribed with seven characters makes the practitioner fearless.",
    procedure: [
      "Take a sprig of laurel with seven leaves.",
      "On each leaf, visualize or trace a protective symbol (a circle, a star, or a solar cross).",
      "Hold the sprig in your right hand as you state your intention for protection.",
      "Speak aloud: 'I fear nothing, for I am protected by the divine light.'",
      "Keep the sprig in a safe place as a protective token.",
    ],
    safety: "historical_reference",
    safeAdaptations: ["Use a single bay leaf if seven are unavailable", "The symbols can be drawn with a pen on paper instead of leaves", "Focus on inner courage rather than external protection"],
    citation: "PGM I. 262-347",
  },
  {
    id: "pgm:mars:001", source: "PGM", type: "ritual",
    purpose: ["anger release", "calm", "restraint", "self-control"],
    triggers: ["trigger:active:mars", "trigger:retrograde:mars"], planets: ["planet:mars"],
    title: "Charm to Restrain Anger (Adapted)",
    summary: "The PGM contains charms specifically designed to restrain anger and cool heated emotions. Adapted from the restraint charms in the magical handbooks.",
    procedure: [
      "Sit in a quiet space away from the source of anger.",
      "Take slow, deliberate breaths — breathing in through the nose, out through the mouth.",
      "Speak aloud: 'I am calm. My anger passes like smoke. I choose clarity.'",
      "Visualize a cooling blue light surrounding the chest and throat.",
      "Drink cold water slowly.",
      "Wait 15 minutes before speaking or acting on the emotion.",
    ],
    safety: "safe_symbolic",
    safeAdaptations: ["This is purely self-soothing — no external targets needed", "Combine with physical movement if anger is intense"],
    citation: "PGM restrain anger charm",
  },
  {
    id: "pgm:venus:001", source: "PGM", type: "ritual",
    purpose: ["love", "attraction", "self-love", "harmony"],
    triggers: ["trigger:active:venus"], planets: ["planet:venus"],
    title: "Aphrodite's Attraction (Adapted)",
    summary: "PGM love spells invoking Aphrodite use apple, rose, wine, and specific invocations to draw love. Adapted for self-love and harmonious relationships.",
    procedure: [
      "Create a small space with pink or green cloth.",
      "Hold a rose or apple in your hands.",
      "Recite a prayer to Aphrodite for love and harmony.",
      "Speak aloud what you wish to attract or harmonize in your relationships.",
      "Anoint a pink candle with rose oil and let it burn completely.",
    ],
    timing: { planetaryDay: 5, moonPhase: "waxing" },
    materials: { herbs: ["rose"], colours: ["pink", "green"], incenses: ["rose"], other: ["apple", "pink candle"] },
    safety: "historical_reference",
    safeAdaptations: ["Focus on self-love and attracting healthy relationships, not manipulation", "Apple can be eaten afterward as a symbolic act of self-nurture"],
    citation: "PGM Aphrodite spells",
  },
  {
    id: "pgm:saturn:001", source: "PGM", type: "ritual",
    purpose: ["restraint", "binding", "self-discipline", "protection"],
    triggers: ["trigger:active:saturn", "trigger:year_lord:saturn"], planets: ["planet:saturn"],
    title: "Restraining Seal (Adapted)",
    summary: "PGM binding spells and restraining seals limit harmful influences. Adapted for setting healthy boundaries and self-discipline rather than controlling others.",
    procedure: [
      "Write on a small piece of paper: what you wish to restrain or set a boundary around.",
      "Fold the paper three times, away from you.",
      "Place it under a black or dark blue stone (onyx or dark stone).",
      "Speak aloud: 'I set this boundary with firmness and clarity. This is contained.'",
      "Leave the stone in place for one day, then burn or bury the paper.",
    ],
    timing: { moonPhase: "waning" },
    materials: { stones: ["onyx"], colours: ["black", "dark blue"] },
    safety: "historical_reference",
    safeAdaptations: ["NEVER use to control others — only for personal boundaries", "Focus on self-discipline and protection, not binding others"],
    citation: "PGM restraining seal spells",
  },
  {
    id: "pgm:jupiter:001", source: "PGM", type: "prayer",
    purpose: ["success", "business acumen", "prosperity", "expansion"],
    triggers: ["trigger:active:jupiter"], planets: ["planet:jupiter"],
    title: "Zeus Prosperity Prayer (Adapted)",
    summary: "PGM business spells and charms for acquiring success invoke Zeus/Helios with specific offerings and prayers for favorable outcomes in ventures.",
    procedure: [
      "On a Thursday morning, burn frankincense or saffron.",
      "Write your business intention clearly on clean paper.",
      "Hold the paper facing east and recite: 'I call upon the expansive power of the sky. May my ventures succeed. May my work bear fruit.'",
      "Place the paper under a blue stone or in a prominent place.",
      "Take one concrete action toward your goal within the hour.",
    ],
    timing: { planetaryDay: 4, moonPhase: "waxing" },
    materials: { incenses: ["frankincense", "saffron"], colours: ["blue", "royal purple"], stones: ["sapphire"] },
    safety: "historical_reference",
    safeAdaptations: ["Focus on ethical success and fair dealings", "The prayer can be secular: state your intention clearly without invocation"],
    citation: "PGM business charm",
  },
  {
    id: "pgm:moon:002", source: "PGM", type: "prayer",
    purpose: ["divination", "clairvoyance", "vision", "foreknowledge"],
    triggers: ["trigger:active:moon", "trigger:active:mercury"], planets: ["planet:moon", "planet:mercury"],
    title: "Divination by Fire (Adapted)",
    summary: "PGM divination by fire uses a lamp flame to reveal visions. Adapted as a meditative scrying practice for insight and inner knowing.",
    procedure: [
      "Light a single candle or lamp in a dark room.",
      "Burn a lunar incense such as sandalwood or jasmine.",
      "Gaze softly into the flame without straining your eyes.",
      "Allow your question to rest in your mind without demanding an answer.",
      "Watch the flame for shapes, movements, or impressions.",
      "After 10-15 minutes, write down everything you observed or felt.",
    ],
    timing: { moonPhase: "full" },
    materials: { incenses: ["sandalwood", "jasmine"], other: ["candle or oil lamp"] },
    safety: "safe_symbolic",
    safeAdaptations: ["Safest form of scrying — candle flame is gentle", "Keep fire safety: never leave a lit candle unattended"],
    citation: "PGM divination by fire",
  },

  // ── Picatrix Planetary Ring Talismans (Liber Atratus, Book 2, Ch. 10-12) ──
  {
    id: "picatrix:saturn:001", source: "Picatrix", type: "talisman",
    purpose: ["spirit communication", "hidden knowledge", "secrecy", "depth"],
    triggers: ["trigger:active:saturn"], planets: ["planet:saturn"],
    title: "Ring of Saturn (Picatrix)",
    summary: "Picatrix describes a ring of turquoise and lead engraved with Saturn's image. Worn during Saturn's day and hour, Moon in Capricorn, it opens communication with spirits of shadow and reveals hidden secrets.",
    procedure: [
      "On the day and hour of Saturn, when the Moon is in Capricorn.",
      "Take a piece of turquoise and engrave it with the figure of an upright man seated on a dragon, holding a sword in his right hand and an egg-shaped stone in his left.",
      "Set the engraved turquoise in a ring of lead.",
      "Consecrate the ring with Saturnine suffumigation.",
      "Carry the ring on your person.",
    ],
    timing: { planetaryDay: 6, condition: "Moon in Capricorn" },
    materials: { stones: ["turquoise"], metals: ["lead"] },
    safety: "historical_reference",
    safeAdaptations: ["Visualize the image instead of engraving", "Use a dark stone set in a black ring as a symbolic substitute"],
    citation: "Picatrix Liber Atratus, Book 2 Ch.10",
  },
  {
    id: "picatrix:jupiter:001", source: "Picatrix", type: "talisman",
    purpose: ["authority", "service", "honor", "expansion"],
    triggers: ["trigger:active:jupiter"], planets: ["planet:jupiter"],
    title: "Ring of Jupiter (Picatrix)",
    summary: "Picatrix prescribes a ring of chalcedony and tin engraved with Jupiter enthroned on an eagle, made when the Moon is in Sagittarius, to win service from subordinates and success in honorable ventures.",
    procedure: [
      "On the day and hour of Jupiter, when the Moon is in Sagittarius.",
      "Engrave chalcedony with the figure of a man sitting on an eagle, wearing festive garments, holding a javelin in his right hand.",
      "Set the stone in a ring of tin.",
      "Consecrate with Jupiterine incense (cedar, saffron).",
      "The ring attracts service from men, eagles, vultures, and lions.",
    ],
    timing: { planetaryDay: 4, condition: "Moon in Sagittarius" },
    materials: { stones: ["chalcedony"], metals: ["tin"] },
    safety: "historical_reference",
    safeAdaptations: ["Use a blue stone set in a gold-colored ring symbolically", "Focus on attracting honorable opportunities rather than dominating others"],
    citation: "Picatrix Liber Atratus, Book 2 Ch.10",
  },
  {
    id: "picatrix:mars:001", source: "Picatrix", type: "talisman",
    purpose: ["courage", "victory", "strength", "warrior spirit"],
    triggers: ["trigger:active:mars", "trigger:detriment:mars"], planets: ["planet:mars"],
    title: "Martial Courage Operation (Adapted)",
    summary: "Picatrix records Martial operations using iron, red stones, and specific suffumigations when Mars is in its dignities.",
    procedure: [
      "Hold a piece of iron or hematite.",
      "Visualize a red shield around you.",
      "Recite a prayer for courage (Orphic Hymn to Ares).",
      "Perform a physical practice — push-ups, walking, or martial form.",
      "Speak: 'I act with courage, not with anger.'",
    ],
    timing: { planetaryDay: 2 },
    materials: { metals: ["iron"], stones: ["hematite"] },
    safety: "historical_reference",
    safeAdaptations: ["No iron? Visualize red light", "Focus on courage, not aggression"],
  },
  {
    id: "picatrix:mars:002", source: "Picatrix", type: "talisman",
    purpose: ["victory", "courage", "triumph", "strength"],
    triggers: ["trigger:active:mars"], planets: ["planet:mars"],
    title: "Ring of Mars (Picatrix)",
    summary: "Picatrix describes an iron ring engraved with an armored warrior bearing swords. Made on Mars' day and hour, it grants victory over adversaries and the service of strong beasts.",
    procedure: [
      "On the day and hour of Mars.",
      "Engrave iron with the figure of a man in armor covering his arms, one sword sheathed at his belt and another bare sword in his right hand, holding a man's head in his left.",
      "Set as a signet in an iron ring.",
      "Consecrate with Martial suffumigation (dragon's blood, sulfurous incense).",
    ],
    timing: { planetaryDay: 2 },
    materials: { metals: ["iron"] },
    safety: "historical_reference",
    safeAdaptations: ["Symbolic representation only — a red string or iron nail carried as token", "Focus on inner courage, not domination over others"],
    citation: "Picatrix Liber Atratus, Book 2 Ch.10",
  },
  {
    id: "picatrix:sun:001", source: "Picatrix", type: "talisman",
    purpose: ["nobility", "respect", "influence", "honor"],
    triggers: ["trigger:active:sun"], planets: ["planet:sun"],
    title: "Ring of the Sun (Picatrix)",
    summary: "Picatrix prescribes a diamond in a gold ring engraved with Sol driving a four-horse chariot. Made on Sunday at sunrise when the Moon is in Aries, it grants the wearer reverence and influence among nobles.",
    procedure: [
      "On Sunday, the first hour of the day, when the Moon is in Aries.",
      "Engrave a diamond with the figure of Sol driving a chariot drawn by four horses, holding a mirror in his right hand and a rod with knotted cords in his left, with a rooster's crest above his head.",
      "Set in a ring of gold.",
      "Consecrate with solar suffumigation (frankincense, cinnamon, amber).",
      "Refrain from eating white dove or lying with a white woman while wearing the ring.",
    ],
    timing: { planetaryDay: 0, condition: "Moon in Aries" },
    materials: { stones: ["diamond"], metals: ["gold"], incenses: ["frankincense", "cinnamon", "amber"] },
    safety: "historical_reference",
    safeAdaptations: ["Use a golden-colored stone instead of diamond", "Symbolic abstinence — focus on purity of intention", "The core practice is the solar consecration, not the dietary restriction"],
    citation: "Picatrix Liber Atratus, Book 2 Ch.10",
  },
  {
    id: "picatrix:venus:001", source: "Picatrix", type: "talisman",
    purpose: ["love", "beauty", "harmony", "relationships"],
    triggers: ["trigger:active:venus"], planets: ["planet:venus"],
    title: "Venusian Beauty Operation (Adapted)",
    summary: "Picatrix details Venusian operations using rose, copper, green silk, and specific prayers for love and beauty.",
    procedure: [
      "Create a small space with green and rose elements.",
      "Hold a piece of copper or green stone.",
      "Burn rose or sandalwood.",
      "Recite a prayer for love and harmony.",
      "Meditate on what you wish to attract or harmonize.",
    ],
    timing: { planetaryDay: 5, moonPhase: "waxing" },
    materials: { metals: ["copper"], stones: ["emerald", "rose quartz"], incenses: ["rose", "sandalwood"] },
    safety: "historical_reference",
    safeAdaptations: ["No copper? A green ribbon works", "Focus on self-love and harmony, not manipulation of others"],
  },
  {
    id: "picatrix:mercury:001", source: "Picatrix", type: "ritual",
    purpose: ["knowledge", "writing", "interpretation", "eloquence"],
    triggers: ["trigger:active:mercury"], planets: ["planet:mercury"],
    title: "Mercurial Knowledge Operation (Adapted)",
    summary: "Picatrix describes Mercurial operations for knowledge, speech, and subtle skill, performed when Mercury is well-placed and the Moon in appropriate signs.",
    procedure: [
      "Write a clear intention on clean paper.",
      "Recite a Mercury hymn or prayer.",
      "Perform a timed study or writing block (25 minutes).",
      "Use symbolic colours: yellow and pale blue.",
      "Burn lavender or mint if available.",
      "Conclude by speaking your intention aloud.",
    ],
    timing: { planetaryDay: 3, moonPhase: "waxing" },
    materials: { colours: ["yellow", "pale blue"] },
    safety: "historical_reference",
    safeAdaptations: ["Omit any hazardous or coercive elements", "Focus on study and writing, not spirit invocation"],
  },
  {
    id: "picatrix:mercury:002", source: "Picatrix", type: "talisman",
    purpose: ["knowledge", "wisdom", "learning", "deep understanding"],
    triggers: ["trigger:active:mercury", "trigger:daimon:mercury"], planets: ["planet:mercury"],
    title: "Ring of Mercury (Picatrix)",
    summary: "Picatrix prescribes a lodestone ring engraved with Mercury enthroned before students. Made when the Moon is in Virgo, it grants deep understanding, the service of waterways, and wisdom in all things.",
    procedure: [
      "On the day and hour of Mercury, when the Moon is in Virgo.",
      "Engrave a lodestone with the figure of a man sitting on a throne, holding a dish with a book before him, with people and students sitting at his feet listening.",
      "Set in a ring using quicksilver (symbolically).",
      "Consecrate with Mercurial suffumigation (lavender, galbanum, mastic).",
      "Refrain from eating fish while wearing the ring.",
    ],
    timing: { planetaryDay: 3, condition: "Moon in Virgo" },
    materials: { stones: ["lodestone"], metals: ["quicksilver"] },
    safety: "historical_reference",
    safeAdaptations: ["Use a grey or yellow stone instead of lodestone", "Symbolic abstinence only", "Focus on study and writing as the core practice"],
    citation: "Picatrix Liber Atratus, Book 2 Ch.10",
  },

  // ── Llewellyn Theurgic Practices (Book Three: Planetary Magic) ──
  {
    id: "llewellyn:mercury:001", source: "Orphic", type: "ritual",
    purpose: ["communication", "mental clarity", "writing", "eloquence", "devotion"],
    triggers: ["trigger:active:mercury", "trigger:daimon:mercury"], planets: ["planet:mercury"],
    title: "Mercury Theurgic Devotion (Llewellyn)",
    summary: "David Rankine's planetary devotion ritual from Llewellyn's Complete Book of Ceremonial Magick. A structured shrine practice with Orphic Hymn, purification bath, and planetary hour timing.",
    procedure: [
      "Set up a shrine with an orange cloth and a statue or image of Mercury at the center.",
      "Place 8 orange candles (4 on each side of the statue).",
      "In front of the statue, place a censer with charcoal for burning galbanum or frankincense.",
      "Place a piece of agate in front of the censer.",
      "Place a caduceus symbol to the left, a pen to the right of the censer, and a bottle of lavender essential oil nearby.",
      "Hang a Mercury sigil on the wall behind the shrine.",
      "Optionally post the Orphic Hymn to Hermes in large font on the wall for hands-free reading.",
      "Perform during a Mercurial planetary hour of the day.",
      "Take a purification bath with appropriate essential oils or herbs.",
      "Dry yourself and put on a simple white or black robe.",
      "Approach the shrine with joy and anticipation.",
      "Light the candles and charcoal, then recite the Orphic Hymn to Hermes while offering frankincense, censing the statue and shrine.",
      "Sit in front of the shrine cross-legged or on a chair.",
      "Meditate on the qualities of Mercury — communication, writing, eloquence, mental clarity.",
      "When finished, extinguish the candles and move away from the shrine walking backward.",
    ],
    incantation: "Hermes, draw near, and to my pray'r incline, angel of Jove, and Maia's son divine; Studious of contests, ruler of mankind, with heart almighty, and a prudent mind. Celestial messenger, of various skill, whose pow'rful arts could watchful Argus kill: With winged feet, 'tis thine thro' air to course, O friend of man, and prophet of discourse: Great life-supporter, to rejoice is thine, in arts gymnastic, and in fraud divine: With pow'r endu'd all language to explain, of care the loos'ner, and the source of gain. Whose hand contains of blameless peace the rod, Corucian, blessed, profitable God.",
    timing: { planetaryDay: 3, moonPhase: "waxing" },
    materials: { stones: ["agate", "citrine quartz"], incenses: ["galbanum", "frankincense", "lavender"], colours: ["orange"], other: ["orange candles", "statue of Mercury", "Mercury sigil", "caduceus symbol", "pen"] },
    safety: "historical_reference",
    safeAdaptations: ["A printed image of Mercury replaces the statue", "Any orange cloth works", "The Orphic Hymn can be read silently"],
    citation: "Llewellyn Complete Book of Ceremonial Magick, Book Three",
  },
];

// ─── Query engine ───

import { getGraph } from "../knowledge_graph";
import { CORRESPONDENCES } from "./correspondences";

export function querySpellbook(query: SpellbookQuery): SpellEntry[] {
  let results = [...SPELLBOOK];

  // Filter by triggers (primary — engine state → spell matching)
  if (query.triggers && query.triggers.length > 0) {
    results = results.filter(e =>
      e.triggers.some(t => query.triggers!.includes(t))
    );
  }

  // Filter by planets
  if (query.planets && query.planets.length > 0) {
    results = results.filter(e =>
      e.planets.some(p => query.planets!.includes(p))
    );
  }

  // Filter by purpose
  if (query.purposes && query.purposes.length > 0) {
    results = results.filter(e =>
      e.purpose.some(p => query.purposes!.some(q => p.includes(q) || q.includes(p)))
    );
  }

  // Filter by safety
  if (query.safety) {
    const safetyLevels: SafetyClass[] = ["safe_symbolic", "historical_reference", "restricted"];
    const maxIdx = safetyLevels.indexOf(query.safety);
    results = results.filter(e => safetyLevels.indexOf(e.safety) <= maxIdx);
  }

  // Filter by source
  if (query.sources && query.sources.length > 0) {
    results = results.filter(e => query.sources!.includes(e.source));
  }

  // Limit
  if (query.limit && query.limit > 0) {
    results = results.slice(0, query.limit);
  }

  return results;
}

/** Recommend practices from a macro translation's planet contexts */
export function recommendPractices(
  planets: Array<{ id: string; isDaimon: boolean; retrograde: boolean; dignity: string; isYearLord: boolean }>,
  dominantMode: string,
  limit: number = 4,
): SpellEntry[] {
  const triggers: string[] = [];
  
  for (const p of planets) {
    triggers.push(`trigger:active:${p.id.replace("planet:", "")}`);
    if (p.isDaimon) triggers.push(`trigger:daimon:${p.id.replace("planet:", "")}`);
    if (p.retrograde) triggers.push(`trigger:retrograde:${p.id.replace("planet:", "")}`);
    if (p.dignity.includes("detriment")) triggers.push(`trigger:detriment:${p.id.replace("planet:", "")}`);
    if (p.isYearLord) triggers.push(`trigger:year_lord:${p.id.replace("planet:", "")}`);
  }
  
  if (dominantMode === "spirit") triggers.push("trigger:mode:spirit");
  if (dominantMode === "fortune") triggers.push("trigger:mode:fortune");
  
  return querySpellbook({ triggers, safety: "historical_reference", limit });
}

/** Get practices for a set of activated planets */
export function practicesForPlanets(planets: string[], safety: SafetyClass = "historical_reference"): SpellEntry[] {
  return querySpellbook({ planets, safety, limit: 6 });
}

/** Register all spellbook entries in the knowledge graph */
export function registerSpellbookInGraph(): void {
  const graph = getGraph();
  
  // Register correspondences as graph nodes
  for (const corr of CORRESPONDENCES) {
    graph.registerNode(corr.id, "correspondence", corr.type, corr.label, { source: corr.source });
    for (const planet of corr.planets) {
      graph.registerEdge(corr.id, "corresponds_to", planet);
    }
  }
  
  // Register spells as graph nodes
  for (const spell of SPELLBOOK) {
    graph.registerNode(`spell:${spell.id}`, "practice", spell.type, spell.title, {
      source: spell.source,
      safety: spell.safety,
      purpose: spell.purpose,
    });
    for (const pid of spell.planets) {
      graph.registerEdge(`spell:${spell.id}`, "practice_for", pid);
    }
    // Link spell materials to correspondence nodes
    if (spell.materials) {
      for (const herb of spell.materials.herbs || []) {
        const corrId = `corr:herb:${herb.toLowerCase().replace(/[\s']/g, "_")}`;
        if (CORRESPONDENCES.find(c => c.id === corrId)) {
          graph.registerEdge(`spell:${spell.id}`, "uses_material", corrId);
        }
      }
      for (const metal of spell.materials.metals || []) {
        const corrId = `corr:metal:${metal.toLowerCase()}`;
        if (CORRESPONDENCES.find(c => c.id === corrId)) {
          graph.registerEdge(`spell:${spell.id}`, "uses_material", corrId);
        }
      }
      for (const colour of spell.materials.colours || []) {
        const corrId = `corr:colour:${colour.toLowerCase().replace(/[\s']/g, "_")}`;
        if (CORRESPONDENCES.find(c => c.id === corrId)) {
          graph.registerEdge(`spell:${spell.id}`, "uses_material", corrId);
        }
      }
    }
  }

  // Register PGM catalog spells (planetary ones) in the graph
  try {
    const pgmCatalog = require("../../../content/glossary/pgm-catalog.json");
    for (const spell of pgmCatalog.spells) {
      if (spell.planets.length === 0) continue;
      graph.registerNode(`pgm:${spell.ref.replace(/[\s.]/g, "_")}`, "practice", spell.type, spell.title, {
        source: "PGM",
        purpose: spell.purposes,
      });
      for (const pid of spell.planets) {
        graph.registerEdge(`pgm:${spell.ref.replace(/[\s.]/g, "_")}`, "practice_for", pid);
      }
    }
  } catch (e) {
    console.warn("PGM catalog not available:", e);
  }

  // Register Picatrix catalog operations in the graph
  try {
    const picatrixCatalog = require("../../../content/glossary/picatrix-catalog.json");
    for (const op of picatrixCatalog.operations) {
      graph.registerNode(`picatrix:${op.id}`, "practice", op.type, op.title || op.id.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()), {
        source: "Picatrix",
        purpose: op.purposes,
      });
      graph.registerEdge(`picatrix:${op.id}`, "practice_for", op.planet);
    }
  } catch (e) {
    console.warn("Picatrix catalog not available:", e);
  }

  // Register Cunningham's herbal correspondences in the graph
  try {
    const cunningham = require("../../../content/glossary/cunningham-catalog.json");
    for (const herb of cunningham.herbs) {
      if (!herb.planet && !herb.element) continue;
      // Only register herbs that have a planetary or elemental association
      const label = herb.name;
      const hId = `corr:herb:${herb.slug}`;
      graph.registerNode(hId, "correspondence", "herb", label, {
        source: "Cunningham",
        planet: herb.planet || null,
        element: herb.element || null,
        gender: herb.gender || null,
        deities: herb.deities || [],
        powers: herb.powers || [],
        safety: herb.safety,
      });
      if (herb.planet) {
        for (const p of herb.planet.split(",").map((s: string) => s.trim())) {
          graph.registerEdge(hId, "corresponds_to", `planet:${p}`);
        }
      }
      if (herb.element) {
        graph.registerEdge(hId, "associated_with", `element:${herb.element}`);
      }
      for (const power of herb.powers || []) {
        const pId = `power:${power.toLowerCase().replace(/[\s\-]+/g, "_")}`;
        if (!graph.getNode(pId)) {
          graph.registerNode(pId, "static", "power", power);
        }
        graph.registerEdge(hId, "has_power", pId);
      }
    }
    console.log(`Registered ${cunningham.herbs.filter((h: any) => h.planet || h.element).length} Cunningham herbs in graph`);
  } catch (e) {
    console.warn("Cunningham catalog not available:", e);
  }
}
