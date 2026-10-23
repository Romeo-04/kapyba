// Pansin flag and recommendation cards, ported from the mock (mismatch, recsFor).
import { MIN_RATINGS } from "./gate";
import type { Tag } from "./scoring";

export type DishView = {
  score: number;
  count: number;
  baseServings: number;
  tagShares: Record<Tag, number>;
  /** The dominant complaint tag, if any tag is strong enough to act on. */
  bad: Tag | null;
};

export const COMPLAINT_SHARE = 0.3; // a tag counts as the main complaint above this share

export function mainComplaint(shares: Record<Tag, number>): Tag | null {
  let best: Tag | null = null;
  for (const t of Object.keys(shares) as Tag[]) {
    if (shares[t] >= COMPLAINT_SHARE && (best === null || shares[t] > shares[best])) best = t;
  }
  return best;
}

/** -1: cooked a lot but rated low. +1: cooked little but rated high. 0: no flag. */
export function mismatch(d: Pick<DishView, "score" | "count" | "baseServings">): -1 | 0 | 1 {
  if (d.count < MIN_RATINGS) return 0;
  if (d.baseServings >= 10 && d.score < 3.4) return -1;
  if (d.baseServings <= 9 && d.score >= 4.3) return 1;
  return 0;
}

export type Rec = { icon: Tag; dir: "up" | "down"; word: string };

export function recsFor(d: DishView): Rec[] {
  if (d.count < MIN_RATINGS) return [];
  const r: Rec[] = [];
  if (d.bad === "salt") r.push({ icon: "salt", dir: "down", word: "Bawasan" });
  if (d.bad === "plate") r.push({ icon: "plate", dir: "up", word: "Dagdagan" });
  if (d.bad === "flame") r.push({ icon: "flame", dir: "up", word: "Painitin" });
  if (d.bad === "leaf") r.push({ icon: "leaf", dir: "up", word: "Sariwain" });
  if (d.bad === "alert") r.push({ icon: "alert", dir: "down", word: "Lambutin" });
  if (d.bad === "chili") r.push({ icon: "chili", dir: "down", word: "Bawasan" });
  if (d.bad === "clock") r.push({ icon: "clock", dir: "down", word: "Bilisan" });
  const m = mismatch(d);
  if (m < 0) r.push({ icon: "plate", dir: "down", word: "Konti" });
  if (m > 0) r.push({ icon: "plate", dir: "up", word: "Dagdag" });
  if (d.score >= 4.3 && d.tagShares.coin >= 0.8) r.push({ icon: "coin", dir: "up", word: "Taasan" });
  return r.slice(0, 3);
}
