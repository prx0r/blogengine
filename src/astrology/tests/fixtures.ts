import type { NormalizedChart, PlanetId } from "../types";

export const SYNTHETIC_CHART_DAY: NormalizedChart = {
  native_id: "test-day-chart",
  birth_data: {
    date: "1990-06-15",
    time: "12:00",
    timezone: "UTC",
    location: { name: "London", lat: 51.5, lon: -0.12 },
  },
  natal: {
    jdUt: 2448000,
    ascendant: { sign: "Leo", sign_index: 4, degree_absolute: 150, degree_in_sign: 0 },
    mc: { sign: "Taurus", sign_index: 1, degree_absolute: 45, degree_in_sign: 15 },
    planets: {
      sun: { sign: "Gemini", sign_index: 2, degree_absolute: 75, degree_in_sign: 15, speed: 1, retrograde: false, house: 10, dignities: [] },
      moon: { sign: "Pisces", sign_index: 11, degree_absolute: 345, degree_in_sign: 15, speed: 13, retrograde: false, house: 4, dignities: [] },
      mercury: { sign: "Gemini", sign_index: 2, degree_absolute: 80, degree_in_sign: 20, speed: 1.5, retrograde: false, house: 10, dignities: [] },
      venus: { sign: "Cancer", sign_index: 3, degree_absolute: 100, degree_in_sign: 10, speed: 1.2, retrograde: false, house: 11, dignities: [] },
      mars: { sign: "Aries", sign_index: 0, degree_absolute: 20, degree_in_sign: 20, speed: 0.8, retrograde: false, house: 8, dignities: [] },
      jupiter: { sign: "Libra", sign_index: 6, degree_absolute: 195, degree_in_sign: 15, speed: 0.2, retrograde: false, house: 3, dignities: [] },
      saturn: { sign: "Capricorn", sign_index: 9, degree_absolute: 285, degree_in_sign: 15, speed: 0.1, retrograde: false, house: 6, dignities: [] },
    },
    houses_whole_sign: [
      { number: 1, sign: "Leo", sign_index: 4, topics: ["life", "vitality", "body"] },
      { number: 2, sign: "Virgo", sign_index: 5, topics: ["wealth", "resources"] },
      { number: 3, sign: "Libra", sign_index: 6, topics: ["siblings", "communication"] },
      { number: 4, sign: "Scorpio", sign_index: 7, topics: ["home", "family"] },
      { number: 5, sign: "Sagittarius", sign_index: 8, topics: ["children", "creativity"] },
      { number: 6, sign: "Capricorn", sign_index: 9, topics: ["illness", "servitude"] },
      { number: 7, sign: "Aquarius", sign_index: 10, topics: ["marriage", "partnership"] },
      { number: 8, sign: "Pisces", sign_index: 11, topics: ["death", "inheritance"] },
      { number: 9, sign: "Aries", sign_index: 0, topics: ["religion", "divination"] },
      { number: 10, sign: "Taurus", sign_index: 1, topics: ["profession", "reputation"] },
      { number: 11, sign: "Gemini", sign_index: 2, topics: ["friends", "alliances"] },
      { number: 12, sign: "Cancer", sign_index: 3, topics: ["enemies", "suffering"] },
    ],
    aspects: [],
    lots: {
      fortune: { sign: "Sagittarius", sign_index: 8, degree_absolute: 270, degree_in_sign: 0, house: 5 },
      spirit: { sign: "Gemini", sign_index: 2, degree_absolute: 90, degree_in_sign: 0, house: 11 },
      eros: { sign: "Leo", sign_index: 4, degree_absolute: 150, degree_in_sign: 0, house: 1 },
      necessity: { sign: "Aquarius", sign_index: 10, degree_absolute: 330, degree_in_sign: 0, house: 7 },
      courage: { sign: "Libra", sign_index: 6, degree_absolute: 210, degree_in_sign: 0, house: 3 },
      victory: { sign: "Pisces", sign_index: 11, degree_absolute: 350, degree_in_sign: 0, house: 4 },
      nemesis: { sign: "Virgo", sign_index: 5, degree_absolute: 170, degree_in_sign: 0, house: 2 },
    },
    dignity_scores: {} as any,
    day_chart: true,
  },
};

export const SYNTHETIC_CHART_NIGHT: NormalizedChart = {
  ...SYNTHETIC_CHART_DAY,
  native_id: "test-night-chart",
  natal: {
    ...SYNTHETIC_CHART_DAY.natal,
    day_chart: false,
    ascendant: { sign: "Aquarius", sign_index: 10, degree_absolute: 330, degree_in_sign: 0 },
    mc: { sign: "Scorpio", sign_index: 7, degree_absolute: 225, degree_in_sign: 0 },
    planets: {
      ...SYNTHETIC_CHART_DAY.natal.planets,
      sun: { ...SYNTHETIC_CHART_DAY.natal.planets.sun, sign: "Capricorn", sign_index: 9, degree_absolute: 285, degree_in_sign: 15, house: 7 },
    },
    lots: {
      fortune: { sign: "Gemini", sign_index: 2, degree_absolute: 90, degree_in_sign: 0, house: 5 },
      spirit: { sign: "Sagittarius", sign_index: 8, degree_absolute: 270, degree_in_sign: 0, house: 11 },
      eros: { sign: "Aquarius", sign_index: 10, degree_absolute: 330, degree_in_sign: 0, house: 1 },
      necessity: { sign: "Leo", sign_index: 4, degree_absolute: 150, degree_in_sign: 0, house: 7 },
      courage: { sign: "Aries", sign_index: 0, degree_absolute: 30, degree_in_sign: 0, house: 3 },
      victory: { sign: "Cancer", sign_index: 3, degree_absolute: 110, degree_in_sign: 0, house: 4 },
      nemesis: { sign: "Scorpio", sign_index: 7, degree_absolute: 230, degree_in_sign: 0, house: 2 },
    },
  },
};

export const CURRENT_SKY_MERCURY_MARS: Record<PlanetId, { lon: number; sign_index: number }> = {
  sun: { lon: 80, sign_index: 2 },
  moon: { lon: 200, sign_index: 6 },
  mercury: { lon: 85, sign_index: 2 },
  venus: { lon: 150, sign_index: 4 },
  mars: { lon: 25, sign_index: 0 },
  jupiter: { lon: 200, sign_index: 6 },
  saturn: { lon: 290, sign_index: 9 },
};
