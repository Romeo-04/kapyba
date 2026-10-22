// Score tone, ring arc and the tag bitmask. Thresholds from IDEA.md section 6 and the mock.
export type Tone = "happy" | "neutral" | "sad";
export const HAPPY_AT = 4.0;
export const NEUTRAL_AT = 3.4;

export const tone = (score: number): Tone =>
  score >= HAPPY_AT ? "happy" : score >= NEUTRAL_AT ? "neutral" : "sad";

/** Ring arc as a 0 to 1 fraction. */
export const arc = (score: number) => Math.max(0, Math.min(1, score / 5));

export const TAGS = { salt: 1, plate: 2, flame: 4, coin: 8 } as const;
export type Tag = keyof typeof TAGS;

export const packTags = (tags: Tag[]) => tags.reduce((m, t) => m | TAGS[t], 0);
export const unpackTags = (mask: number): Tag[] =>
  (Object.keys(TAGS) as Tag[]).filter((t) => (mask & TAGS[t]) !== 0);

export type RatingRow = { score: number; tags: number; deviceId: string };

/** Mean score, rounded to one decimal; null when there are no ratings. */
export function meanScore(rows: Pick<RatingRow, "score">[]): number | null {
  if (rows.length === 0) return null;
  return Math.round((rows.reduce((s, r) => s + r.score, 0) / rows.length) * 10) / 10;
}

/** Share of ratings carrying each tag, 0 to 1. */
export function tagShares(rows: Pick<RatingRow, "tags">[]): Record<Tag, number> {
  const out = { salt: 0, plate: 0, flame: 0, coin: 0 } as Record<Tag, number>;
  if (rows.length === 0) return out;
  for (const t of Object.keys(TAGS) as Tag[]) {
    out[t] = rows.filter((r) => (r.tags & TAGS[t]) !== 0).length / rows.length;
  }
  return out;
}

export const distinctBuyers = (rows: Pick<RatingRow, "deviceId">[]) =>
  new Set(rows.map((r) => r.deviceId)).size;

/** Gumaganda: the recent half of the window is clearly better than the earlier half. Needs 3+ ratings in each half. */
export const IMPROVING_BY = 0.3;
export const MIN_PER_HALF = 3;

export function improving(rows: { score: number; day: string }[], today: string, windowDays = 30): boolean {
  const t = Date.parse(today);
  const half = windowDays / 2;
  const recent: number[] = [];
  const earlier: number[] = [];
  for (const r of rows) {
    const age = (t - Date.parse(r.day)) / 86_400_000;
    if (age < 0 || age >= windowDays) continue;
    (age < half ? recent : earlier).push(r.score);
  }
  if (recent.length < MIN_PER_HALF || earlier.length < MIN_PER_HALF) return false;
  const avg = (a: number[]) => a.reduce((s, x) => s + x, 0) / a.length;
  return Math.round((avg(recent) - avg(earlier)) * 100) / 100 >= IMPROVING_BY; // rounded so 4.0 - 3.7 counts as 0.3
}
