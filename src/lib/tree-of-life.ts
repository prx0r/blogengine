export interface Sephirah {
  number: number;
  name: string;
  hebrew: string;
  meaning: string;
  symbol: string;
  x: number;
  y: number;
  pillar: "middle" | "right" | "left";
  plane: string;
  color: string;
  divineName: string;
  archangel: string;
  angelicOrder: string;
  planet: string;
  magicalImage: string;
  description: string;
  tag: string;
}

export interface Path {
  from: number;
  to: number;
  letter: string;
  letterName: string;
  tarot: string;
  element: string;
  description: string;
}

export const SEPHIROTH: Sephirah[] = [
  {
    number: 1,
    name: "Kether",
    hebrew: "כתר",
    meaning: "Crown",
    symbol: "⊙",
    x: 200, y: 40,
    pillar: "middle",
    plane: "Atziluth (Emanation)",
    color: "#ffffff",
    divineName: "Eheieh",
    archangel: "Metatron",
    angelicOrder: "Chayoth Ha-Qadesh (Holy Living Creatures)",
    planet: "Primum Mobile",
    magicalImage: "An ancient bearded king seen in profile",
    description: "The first and highest sephirah, representing the pure divine will, the unmanifest source of all creation. It is the point of beginning, the crown above the head of the cosmos.",
    tag: "tree-of-life/kether",
  },
  {
    number: 2,
    name: "Chokmah",
    hebrew: "חכמה",
    meaning: "Wisdom",
    symbol: "✡",
    x: 285, y: 130,
    pillar: "right",
    plane: "Briah (Creation)",
    color: "#808080",
    divineName: "Yah",
    archangel: "Ratziel",
    angelicOrder: "Auphanim (Wheels)",
    planet: "The Zodiac / Mazloth",
    magicalImage: "A bearded male figure",
    description: "The second sephirah, representing divine wisdom, the active outpouring force of creation. It is the primal masculine energy, the yod of the Tetragrammaton.",
    tag: "tree-of-life/chokmah",
  },
  {
    number: 3,
    name: "Binah",
    hebrew: "בינה",
    meaning: "Understanding",
    symbol: "♄",
    x: 115, y: 130,
    pillar: "left",
    plane: "Briah (Creation)",
    color: "#000000",
    divineName: "YHVH Elohim",
    archangel: "Tzaphkiel",
    angelicOrder: "Aralim (Thrones)",
    planet: "Shabbathai (Saturn)",
    magicalImage: "An elderly female figure, a dark barren mother",
    description: "The third sephirah, representing understanding and receptive intelligence. It is the primal feminine energy, the great mother who gives form to the force of Chokmah.",
    tag: "tree-of-life/binah",
  },
  {
    number: 4,
    name: "Chesed",
    hebrew: "חסד",
    meaning: "Mercy",
    symbol: "♃",
    x: 285, y: 250,
    pillar: "right",
    plane: "Yetzirah (Formation)",
    color: "#0044ff",
    divineName: "El",
    archangel: "Tzadkiel",
    angelicOrder: "Chasmalim (Brilliant Ones)",
    planet: "Tzedek (Jupiter)",
    magicalImage: "A mighty crowned king",
    description: "The fourth sephirah, representing mercy, love, and graciousness. It is the expansive, building force of the cosmos, the love that creates and sustains.",
    tag: "tree-of-life/chesed",
  },
  {
    number: 5,
    name: "Geburah",
    hebrew: "גבורה",
    meaning: "Severity",
    symbol: "♂",
    x: 115, y: 250,
    pillar: "left",
    plane: "Yetzirah (Formation)",
    color: "#ff4400",
    divineName: "Elohim Gibor",
    archangel: "Kamael",
    angelicOrder: "Seraphim (Fiery Serpents)",
    planet: "Madim (Mars)",
    magicalImage: "A mighty warrior in a chariot",
    description: "The fifth sephirah, representing judgment, strength, and severity. It is the restrictive, contracting force that balances the expansive force of Chesed.",
    tag: "tree-of-life/geburah",
  },
  {
    number: 6,
    name: "Tiphareth",
    hebrew: "תפארת",
    meaning: "Beauty",
    symbol: "☉",
    x: 200, y: 360,
    pillar: "middle",
    plane: "Yetzirah (Formation)",
    color: "#ffcc00",
    divineName: "YHVH Eloah Va-Da'ath",
    archangel: "Michael",
    angelicOrder: "Malachim (Kings / Angels)",
    planet: "Shemesh (Sun)",
    magicalImage: "A majestic king, a child, a sacrificed god",
    description: "The sixth sephirah, representing beauty, harmony, and balance. It is the central point of the Tree, the reconciling principle between mercy and severity, the heart of the microcosm.",
    tag: "tree-of-life/tiphareth",
  },
  {
    number: 7,
    name: "Netzach",
    hebrew: "נצח",
    meaning: "Victory",
    symbol: "♀",
    x: 285, y: 465,
    pillar: "right",
    plane: "Yetzirah (Formation)",
    color: "#44cc44",
    divineName: "YHVH Tzabaoth",
    archangel: "Haniel",
    angelicOrder: "Elohim (Gods / Spirits of the Elements)",
    planet: "Nogah (Venus)",
    magicalImage: "A beautiful naked woman",
    description: "The seventh sephirah, representing victory, endurance, and natural instinct. It is the sphere of feeling, emotion, and the natural passions.",
    tag: "tree-of-life/netzach",
  },
  {
    number: 8,
    name: "Hod",
    hebrew: "הוד",
    meaning: "Splendor",
    symbol: "☿",
    x: 115, y: 465,
    pillar: "left",
    plane: "Yetzirah (Formation)",
    color: "#ff8800",
    divineName: "Elohim Tzabaoth",
    archangel: "Raphael",
    angelicOrder: "Beni Elohim (Sons of God)",
    planet: "Kokab (Mercury)",
    magicalImage: "A hermaphrodite",
    description: "The eighth sephirah, representing splendor, intellect, and communication. It is the sphere of reason, science, and analytical thought.",
    tag: "tree-of-life/hod",
  },
  {
    number: 9,
    name: "Yesod",
    hebrew: "יסוד",
    meaning: "Foundation",
    symbol: "☽",
    x: 200, y: 555,
    pillar: "middle",
    plane: "Yetzirah (Formation)",
    color: "#aa88ff",
    divineName: "Shaddai El Chai",
    archangel: "Gabriel",
    angelicOrder: "Cherubim (Strong Ones)",
    planet: "Levanah (Moon)",
    magicalImage: "A beautiful naked man, an altar",
    description: "The ninth sephirah, representing the foundation, the astral plane, and the subconscious. It is the receiver of all forces, the treasury of images, the gateway between the upper and lower worlds.",
    tag: "tree-of-life/yesod",
  },
  {
    number: 10,
    name: "Malkuth",
    hebrew: "מלכות",
    meaning: "Kingdom",
    symbol: "🜨",
    x: 200, y: 635,
    pillar: "middle",
    plane: "Assiah (Action)",
    color: "#44aa44",
    divineName: "Adonai Melekh / Adonai Ha-Aretz",
    archangel: "Sandalphon",
    angelicOrder: "Ishim (Souls of Man / Holy Ones)",
    planet: "Cholem Yesodoth (Elements / Earth)",
    magicalImage: "A young woman crowned and throned",
    description: "The tenth sephirah, representing the kingdom, the material world, and the physical plane. It is the culmination of all the forces above, the final manifestation of the divine in matter.",
    tag: "tree-of-life/malkuth",
  },
];

export const DAATH: Sephirah = {
  number: 0,
  name: "Da'ath",
  hebrew: "דעת",
  meaning: "Knowledge",
  symbol: "◌",
  x: 200, y: 130,
  pillar: "middle",
  plane: "Briah (Creation)",
  color: "#888888",
  divineName: "-",
  archangel: "-",
  angelicOrder: "-",
  planet: "-",
  magicalImage: "An invisible point, a veil",
  description: "The hidden sephirah, representing knowledge. It is not truly a sephirah but the abyss where the higher and lower faces of the Tree meet. It marks the veil between the supernal triad and the remaining sephiroth.",
  tag: "tree-of-life/daath",
};

export const PATHS: Path[] = [
  { from: 1, to: 2, letter: "א", letterName: "Aleph", tarot: "The Fool", element: "Air", description: "The path of the primal breath, the unmanifest becoming manifest." },
  { from: 1, to: 3, letter: "ב", letterName: "Beth", tarot: "The Magician", element: "Mercury", description: "The path of conscious will and creative power." },
  { from: 1, to: 6, letter: "ג", letterName: "Gimel", tarot: "The High Priestess", element: "Moon", description: "The path through the veil, the hidden wisdom of the subconscious." },
  { from: 2, to: 3, letter: "ד", letterName: "Daleth", tarot: "The Empress", element: "Venus", description: "The path of love, beauty, and fertility." },
  { from: 2, to: 4, letter: "ה", letterName: "Heh", tarot: "The Emperor", element: "Aries", description: "The path of authority, structure, and the assertion of will." },
  { from: 2, to: 6, letter: "ו", letterName: "Vau", tarot: "The Hierophant", element: "Taurus", description: "The path of spiritual teaching and tradition." },
  { from: 3, to: 5, letter: "ז", letterName: "Zayin", tarot: "The Lovers", element: "Gemini", description: "The path of choice, duality, and union." },
  { from: 3, to: 6, letter: "ח", letterName: "Cheth", tarot: "The Chariot", element: "Cancer", description: "The path of triumph through directed force." },
  { from: 4, to: 5, letter: "ט", letterName: "Teth", tarot: "Strength", element: "Leo", description: "The path of courage, inner strength, and mastery of the self." },
  { from: 4, to: 6, letter: "י", letterName: "Yod", tarot: "The Hermit", element: "Virgo", description: "The path of solitude, wisdom, and the inner search." },
  { from: 4, to: 7, letter: "כ", letterName: "Kaph", tarot: "Wheel of Fortune", element: "Jupiter", description: "The path of cycles, destiny, and the turning of the great wheel." },
  { from: 5, to: 6, letter: "ל", letterName: "Lamed", tarot: "Justice", element: "Libra", description: "The path of balance, truth, and karmic reckoning." },
  { from: 5, to: 8, letter: "מ", letterName: "Mem", tarot: "The Hanged Man", element: "Water", description: "The path of surrender, sacrifice, and seeing from a new perspective." },
  { from: 6, to: 7, letter: "נ", letterName: "Nun", tarot: "Death", element: "Scorpio", description: "The path of transformation, endings, and rebirth." },
  { from: 6, to: 8, letter: "ס", letterName: "Samekh", tarot: "Temperance", element: "Sagittarius", description: "The path of alchemy, balance, and the blending of opposites." },
  { from: 6, to: 9, letter: "ע", letterName: "Ayin", tarot: "The Devil", element: "Capricorn", description: "The path of material bondage and the shadow self." },
  { from: 7, to: 8, letter: "פ", letterName: "Peh", tarot: "The Tower", element: "Mars", description: "The path of sudden revelation, upheaval, and the breaking of false structures." },
  { from: 7, to: 9, letter: "צ", letterName: "Tzaddi", tarot: "The Star", element: "Aquarius", description: "The path of hope, inspiration, and cosmic consciousness." },
  { from: 7, to: 10, letter: "ק", letterName: "Qoph", tarot: "The Moon", element: "Pisces", description: "The path of dreams, illusion, and the twilight world." },
  { from: 8, to: 9, letter: "ר", letterName: "Resh", tarot: "The Sun", element: "Sun", description: "The path of enlightenment, vitality, and the joy of being." },
  { from: 8, to: 10, letter: "ש", letterName: "Shin", tarot: "The Last Judgement", element: "Fire", description: "The path of resurrection, awakening, and the final call." },
  { from: 9, to: 10, letter: "ת", letterName: "Tau", tarot: "The Universe", element: "Saturn", description: "The path of completion, manifestation, and the synthesis of all." },
];

export function getSephirahByNumber(n: number): Sephirah | undefined {
  return SEPHIROTH.find((s) => s.number === n);
}

export function getPathsForSephirah(n: number): Path[] {
  return PATHS.filter((p) => p.from === n || p.to === n);
}

export function getConnectedSephirahNumbers(n: number): number[] {
  const connected = new Set<number>();
  for (const p of PATHS) {
    if (p.from === n) connected.add(p.to);
    if (p.to === n) connected.add(p.from);
  }
  return [...connected];
}
