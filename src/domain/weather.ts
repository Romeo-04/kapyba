// Weather factor for Bukas. Both sizes are our assumptions, to be tuned in the pilot.
export const RAIN_CHANCE_LIMIT = 70; // percent; at or above this tomorrow counts as a rainy day
export const RAIN_FACTOR = 0.85;
export const BAGYO_FACTOR = 0.6; // the owner's switch beats the forecast

export type Weather = { rainChance: number | null; bagyo: boolean; factor: number };

/** The owner's Bagyo switch wins; otherwise a high rain chance trims the plan; an unknown forecast changes nothing. */
export function weatherFactor(rainChance: number | null, bagyo: boolean): Weather {
  const factor = bagyo ? BAGYO_FACTOR : rainChance !== null && rainChance >= RAIN_CHANCE_LIMIT ? RAIN_FACTOR : 1;
  return { rainChance, bagyo, factor };
}
