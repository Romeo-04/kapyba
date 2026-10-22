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

// Simulasyon only. KapyBa holds no money and carries no risk (RA 10607); this just shows what a storm day could look like.
// The share is our assumption, to be tuned with a licensed partner if one ever exists.
export const FUND_SHARE = 0.5;

/** Whole pesos: the share of average daily sales over the days that have a log. Null with no sales logged. */
export function simulatedFund(salesPerLoggedDay: number[]): number | null {
  const days = salesPerLoggedDay.filter((s) => s > 0);
  if (days.length === 0) return null;
  return Math.round((days.reduce((s, x) => s + x, 0) / days.length) * FUND_SHARE);
}
