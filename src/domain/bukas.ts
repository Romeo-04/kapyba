// Bukas: suggested servings for tomorrow. All adjustment sizes are our assumptions, to be tuned in the pilot.
import { MIN_RATINGS } from "./gate";

export type DayLog = { cooked: number; sold: number };
export type BukasInput = { baseServings: number; logs: DayLog[]; score: number | null; count: number };
export type BukasReason = "history" | "usual" | "sold-out" | "high-rated" | "low-rated" | "weather";
export type BukasPlan = { servings: number; yesterday: number | null; reasons: BukasReason[] } | null;

export const SOLD_OUT_BUMP = 1.1; // sold out on at least half the logged days: demand was cut off
export const RATING_BUMP = 1.1;
export const RATING_CUT = 0.9;
export const HIGH_SCORE = 4.3;
export const LOW_SCORE = 3.4;

/**
 * Starts from what really sold (average sold over the logged days), or the owner's usual servings
 * when there is no log yet. Returns null when there is neither: the screen then says Kulang pa
 * instead of inventing a number. `factor` is the weather multiplier (1 = clear).
 */
export function suggest(d: BukasInput, factor = 1): BukasPlan {
  const reasons: BukasReason[] = [];
  let n: number;
  if (d.logs.length > 0) {
    n = d.logs.reduce((s, l) => s + l.sold, 0) / d.logs.length;
    reasons.push("history");
    const soldOut = d.logs.filter((l) => l.cooked > 0 && l.sold >= l.cooked).length;
    if (soldOut * 2 >= d.logs.length) { n *= SOLD_OUT_BUMP; reasons.push("sold-out"); }
  } else if (d.baseServings > 0) {
    n = d.baseServings;
    reasons.push("usual");
  } else {
    return null;
  }
  if (d.score !== null && d.count >= MIN_RATINGS) {
    if (d.score >= HIGH_SCORE) { n *= RATING_BUMP; reasons.push("high-rated"); }
    else if (d.score < LOW_SCORE) { n *= RATING_CUT; reasons.push("low-rated"); }
  }
  if (factor !== 1) { n *= factor; reasons.push("weather"); }
  const last = d.logs.length ? d.logs[d.logs.length - 1].cooked : null;
  return { servings: Math.max(0, Math.round(n)), yesterday: last, reasons };
}
