import type { PlanetId, DaimonicHouseTag, HouseData, PlanetConditionPacket } from "./types";

const DAIMONIC_HOUSE_MAP: Record<number, { tag: DaimonicHouseTag; meaning: string }> = {
  5: { tag: "good_fortune", meaning: "Good Fortune (Agathe Tyche) — pleasure, children, creative expression" },
  6: { tag: "bad_fortune", meaning: "Bad Fortune (Kake Tyche) — illness, servitude, necessary labor" },
  11: { tag: "good_daimon", meaning: "Good Daimon (Agathos Daimon) — friends, allies, hopes, guidance" },
  12: { tag: "bad_daimon", meaning: "Bad Daimon (Kakos Daimon) — enemies, suffering, hidden limitation" },
};

export function tagDaimonicHouses(houses: HouseData[]): HouseData[] {
  return houses.map(h => {
    if (DAIMONIC_HOUSE_MAP[h.number]) {
      return { ...h, daimonic_tag: DAIMONIC_HOUSE_MAP[h.number].tag, topics: [...h.topics, DAIMONIC_HOUSE_MAP[h.number].tag] };
    }
    return h;
  });
}

export function getDaimonicTag(houseNumber: number): DaimonicHouseTag | undefined {
  return DAIMONIC_HOUSE_MAP[houseNumber]?.tag;
}

export function getDaimonicMeaning(houseNumber: number): string | undefined {
  return DAIMONIC_HOUSE_MAP[houseNumber]?.meaning;
}

export function classifyDaimonicHouses(conditions: PlanetConditionPacket[]): {
  good_fortune: { house: number; planets: PlanetId[] };
  bad_fortune: { house: number; planets: PlanetId[] };
  good_daimon: { house: number; planets: PlanetId[] };
  bad_daimon: { house: number; planets: PlanetId[] };
} {
  return {
    good_fortune: {
      house: 5,
      planets: conditions.filter(c => c.house === 5).map(c => c.planet),
    },
    bad_fortune: {
      house: 6,
      planets: conditions.filter(c => c.house === 6).map(c => c.planet),
    },
    good_daimon: {
      house: 11,
      planets: conditions.filter(c => c.house === 11).map(c => c.planet),
    },
    bad_daimon: {
      house: 12,
      planets: conditions.filter(c => c.house === 12).map(c => c.planet),
    },
  };
}
