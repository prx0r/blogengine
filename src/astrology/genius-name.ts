const GENIUS_LETTERS = [
  "a","b","g","d","h","v","z","x","u","y","k","l","m","n","c","i","p","j","q","r","s","t",
  "a","b","g","d","h","v","z","x","u","y","k","l","m","n","c","i","p","j","q","r","s","t",
  "a","b","g","d","h","v","z","x","u","y","k","l","m","n","c","i","p","j","q","r","s","t",
  "a","b","g","d","h","v","z","x","u","y","k","l","m","n","c","i","p","j","q","r","s","t",
  "a","b","g","d","h","v","z","x","u","y","k","l","m","n","c","i","p","j","q","r","s","t",
  "a","b","g","d","h","v","z","x","u","y","k","l","m","n","c","i","p","j","q","r","s","t",
  "a","b","g","d","h","v","z","x","u","y","k","l","m","n","c","i","p","j","q","r","s","t",
  "a","b","g","d","h","v","z","x","u","y","k","l","m","n","c","i","p","j","q","r","s","t",
  "a","b","g","d","h","v","z","x","u","y","k","l","m","n","c","i","p","j","q","r","s","t",
  "a","b","g","d","h","v","z","x","u","y","k","l","m","n","c","i","p","j","q","r","s","t",
  "a","b","g","d","h","v","z","x","u","y","k","l","m","n","c","i","p","j","q","r","s","t",
  "a","b","g","d","h","v","z","x","u","y","k","l","m","n","c","i","p","j","q","r","s","t",
  "a","b","g","d","h","v","z","x","u","y","k","l","m","n","c","i","p","j","q","r","s","t",
  "a","b","g","d","h","v","z","x","u","y","k","l","m","n","c","i","p","j","q","r","s","t",
  "a","b","g","d","h","v","z","x","u","y","k","l","m","n","c","i","p","j","q","r","s","t",
  "a","b","g","d","h","v","z","x","u","y","k","l","m","n","c","i","p","j","q","r","s","t",
];

const DEMON_LETTERS = [
  "d","g","b","a","t","s","r","q","j","p","i","c","n","m","l","k","y","u","x","z","v","h",
  "d","g","b","a","t","s","r","q","j","p","i","c","n","m","l","k","y","u","x","z","v","h",
  "d","g","b","a","t","s","r","q","j","p","i","c","n","m","l","k","y","u","x","z","v","h",
  "d","g","b","a","t","s","r","q","j","p","i","c","n","m","l","k","y","u","x","z","v","h",
  "d","g","b","a","t","s","r","q","j","p","i","c","n","m","l","k","y","u","x","z","v","h",
  "d","g","b","a","t","s","r","q","j","p","i","c","n","m","l","k","y","u","x","z","v","h",
  "d","g","b","a","t","s","r","q","j","p","i","c","n","m","l","k","y","u","x","z","v","h",
  "d","g","b","a","t","s","r","q","j","p","i","c","n","m","l","k","y","u","x","z","v","h",
  "d","g","b","a","t","s","r","q","j","p","i","c","n","m","l","k","y","u","x","z","v","h",
  "d","g","b","a","t","s","r","q","j","p","i","c","n","m","l","k","y","u","x","z","v","h",
  "d","g","b","a","t","s","r","q","j","p","i","c","n","m","l","k","y","u","x","z","v","h",
  "d","g","b","a","t","s","r","q","j","p","i","c","n","m","l","k","y","u","x","z","v","h",
  "d","g","b","a","t","s","r","q","j","p","i","c","n","m","l","k","y","u","x","z","v","h",
  "d","g","b","a","t","s","r","q","j","p","i","c","n","m","l","k","y","u","x","z","v","h",
  "d","g","b","a","t","s","r","q","j","p","i","c","n","m","l","k","y","u","x","z","v","h",
  "d","g","b","a","t","s","r","q","j","p","i","c","n","m","l","k","y","u","x","z","v","h",
];

const HEBREW_LETTER_NAMES: Record<string, string> = {
  a: "Aleph", b: "Beth", g: "Gimel", d: "Daleth", h: "He",
  v: "Waw", z: "Zayin", x: "Heth", u: "Teth", y: "Yod",
  k: "Kaph", l: "Lamed", m: "Mem", n: "Nun", c: "Samekh",
  i: "Ayin", p: "Pe", j: "Sadhe", q: "Qoph", r: "Resh",
  s: "Shin", t: "Tav",
};

const HEBREW_VALUES: Record<string, number> = {
  a:1,b:2,g:3,d:4,h:5,v:6,z:7,x:8,u:9,y:10,
  k:20,l:30,m:40,n:50,c:60,i:70,p:80,j:90,q:100,
  r:200,s:300,t:400,
};

function degreeToLetter(deg: number, useDemon: boolean): string {
  // Use Math.floor to match Excel VLOOKUP (approximate match = floor)
  const idx = ((Math.floor(deg) % 360) + 360) % 360;
  return (useDemon ? DEMON_LETTERS : GENIUS_LETTERS)[idx];
}

export interface DaimonNameResult {
  geniusName: string;
  geniusNameSuffixed: string;
  geniusLetters: string[];
  geniusValue: number;
  demonName: string;
  demonLetters: string[];
  demonValue: number;
  isDayBirth: boolean;
  breakdown: {
    label: string;
    deg: number;
    letter: string;
    name: string;
    value: number;
  }[];
}

export interface GeniusInput {
  isDayBirth: boolean;
  sunDeg: number;
  moonDeg: number;
  ascDeg: number;
  fortuneDeg: number;
  syzygyDeg: number | null;
}

export function computeDaimonName(input: GeniusInput): DaimonNameResult {
  const places: { label: string; deg: number }[] = [];

  if (input.isDayBirth) {
    places.push({ label: "Sun", deg: input.sunDeg });
    places.push({ label: "Moon", deg: input.moonDeg });
  } else {
    places.push({ label: "Moon", deg: input.moonDeg });
    places.push({ label: "Sun", deg: input.sunDeg });
  }
  places.push({ label: "Ascendant", deg: input.ascDeg });
  places.push({ label: "Fortune", deg: input.fortuneDeg });
  if (input.syzygyDeg !== null) {
    places.push({ label: "Syzygy", deg: input.syzygyDeg });
  }

  const geniusLetters: string[] = [];
  const demonLetters: string[] = [];
  const breakdown: DaimonNameResult["breakdown"] = [];
  let geniusValue = 0;
  let demonValue = 0;

  for (const p of places) {
    const gLetter = degreeToLetter(p.deg, false);
    const dLetter = degreeToLetter(p.deg, true);
    geniusLetters.push(gLetter);
    demonLetters.push(dLetter);
    geniusValue += HEBREW_VALUES[gLetter] || 0;
    demonValue += HEBREW_VALUES[dLetter] || 0;
    breakdown.push({
      label: p.label,
      deg: p.deg,
      letter: gLetter,
      name: HEBREW_LETTER_NAMES[gLetter] || "",
      value: HEBREW_VALUES[gLetter] || 0,
    });
  }

  const rawName = geniusLetters.filter(Boolean).join("");
  // Agrippa says append a divine monosyllable like El (l, Aleph-Lamed=1) or Iah (h, He=5)
  const suffixedName = rawName + "l";

  return {
    geniusName: rawName,
    geniusNameSuffixed: suffixedName,
    geniusLetters,
    geniusValue,
    demonName: demonLetters.filter(Boolean).join(""),
    demonLetters,
    demonValue,
    isDayBirth: input.isDayBirth,
    breakdown,
  };
}
