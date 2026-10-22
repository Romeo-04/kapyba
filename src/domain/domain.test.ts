import { describe, expect, it } from "vitest";
import { isActive, remaining, validateAlok } from "./alok";
import { mainComplaint, mismatch, recsFor, type DishView } from "./recommend";
import { arc, distinctBuyers, meanScore, packTags, tagShares, tone, unpackTags, weeklyTrend } from "./scoring";

describe("tone and arc", () => {
  it("switches at 4.0 and 3.4", () => {
    expect(tone(4.0)).toBe("happy");
    expect(tone(3.99)).toBe("neutral");
    expect(tone(3.4)).toBe("neutral");
    expect(tone(3.39)).toBe("sad");
  });
  it("arc is score over 5, clamped", () => {
    expect(arc(2.5)).toBe(0.5);
    expect(arc(7)).toBe(1);
    expect(arc(-1)).toBe(0);
  });
});

describe("tags and aggregates", () => {
  it("round-trips the bitmask", () => {
    expect(unpackTags(packTags(["salt", "coin"]))).toEqual(["salt", "coin"]);
    expect(packTags([])).toBe(0);
  });
  it("computes mean, shares and distinct buyers", () => {
    expect(meanScore([])).toBeNull();
    expect(meanScore([{ score: 4 }, { score: 5 }, { score: 4 }])).toBe(4.3);
    const rows = [{ tags: 1 }, { tags: 1 }, { tags: 0 }, { tags: 8 }];
    expect(tagShares(rows).salt).toBe(0.5);
    expect(tagShares([]).salt).toBe(0);
    expect(distinctBuyers([{ deviceId: "a" }, { deviceId: "a" }, { deviceId: "b" }])).toBe(2);
  });
});

const view = (o: Partial<DishView>): DishView => ({
  score: 4, count: 12, baseServings: 8, bad: null,
  tagShares: { salt: 0, plate: 0, flame: 0, coin: 0 }, ...o,
});

describe("mismatch and recommendations", () => {
  it("flags cooked a lot but rated low at exactly 10 servings and below 3.4", () => {
    expect(mismatch({ score: 3.3, count: 10, baseServings: 10 })).toBe(-1);
    expect(mismatch({ score: 3.4, count: 10, baseServings: 10 })).toBe(0);
    expect(mismatch({ score: 3.3, count: 10, baseServings: 9 })).toBe(0);
  });
  it("flags cooked little but rated high", () => {
    expect(mismatch({ score: 4.3, count: 10, baseServings: 9 })).toBe(1);
    expect(mismatch({ score: 4.2, count: 10, baseServings: 9 })).toBe(0);
  });
  it("gives no flag or advice below the minimum count", () => {
    expect(mismatch({ score: 1, count: 9, baseServings: 20 })).toBe(0);
    expect(recsFor(view({ count: 9, bad: "salt" }))).toEqual([]);
  });
  it("maps the main complaint to a card", () => {
    expect(recsFor(view({ bad: "salt" }))[0]).toEqual({ icon: "salt", dir: "down", word: "Bawasan" });
    expect(recsFor(view({ bad: "plate" }))[0].word).toBe("Dagdagan");
    expect(recsFor(view({ bad: "flame" }))[0].word).toBe("Painitin");
  });
  it("adds Konti, Dagdag and Taasan and caps at three", () => {
    expect(recsFor(view({ score: 3, baseServings: 12 })).map((r) => r.word)).toContain("Konti");
    expect(recsFor(view({ score: 4.5, baseServings: 5 })).map((r) => r.word)).toContain("Dagdag");
    const all = recsFor(view({ score: 4.5, baseServings: 5, bad: "salt", tagShares: { salt: 0.4, plate: 0, flame: 0, coin: 0.9 } }));
    expect(all.length).toBeLessThanOrEqual(3);
    expect(all.map((r) => r.word)).toContain("Taasan");
  });
  it("picks the strongest complaint above 30%", () => {
    expect(mainComplaint({ salt: 0.29, plate: 0.1, flame: 0, coin: 0 })).toBeNull();
    expect(mainComplaint({ salt: 0.4, plate: 0.5, flame: 0, coin: 0 })).toBe("plate");
  });
});

describe("alok validation", () => {
  const ok = { dishId: "d1", kind: "combo", limit: 10 };
  it("accepts a valid deal", () => {
    expect(validateAlok(ok).ok).toBe(true);
  });
  it("rejects any field that references a rating", () => {
    for (const k of ["rating", "minScore", "reviewRequired", "stars", "tags"]) {
      expect(validateAlok({ ...ok, [k]: 5 }).ok).toBe(false);
    }
  });
  it("rejects bad kind, limit, and oras without an end time", () => {
    expect(validateAlok({ ...ok, kind: "discount" }).ok).toBe(false);
    expect(validateAlok({ ...ok, limit: 0 }).ok).toBe(false);
    expect(validateAlok({ ...ok, limit: 501 }).ok).toBe(false);
    expect(validateAlok({ ...ok, kind: "oras" }).ok).toBe(false);
    expect(validateAlok({ ...ok, kind: "oras", endsAt: "2026-10-22T10:00:00Z" }).ok).toBe(true);
    expect(validateAlok(null).ok).toBe(false);
  });
  it("is active until the limit, expiry or close", () => {
    const now = new Date("2026-10-22T09:00:00Z");
    const base = { limit: 10, claimed: 9, endsAt: null, closedAt: null };
    expect(remaining(base)).toBe(1);
    expect(isActive(base, now)).toBe(true);
    expect(isActive({ ...base, claimed: 10 }, now)).toBe(false);
    expect(isActive({ ...base, endsAt: new Date("2026-10-22T08:59:00Z") }, now)).toBe(false);
    expect(isActive({ ...base, closedAt: now }, now)).toBe(false);
  });
});

import { improving } from "./scoring";

describe("improving (Gumaganda)", () => {
  const rows = (recent: number[], earlier: number[]) => [
    ...recent.map((score) => ({ score, day: "2026-10-20" })),
    ...earlier.map((score) => ({ score, day: "2026-10-01" })),
  ];
  it("is true when the recent half is 0.3 better", () => {
    expect(improving(rows([4, 4, 4], [3.7, 3.7, 3.7]), "2026-10-22")).toBe(true);
  });
  it("is false below 0.3, when worse, or with too few ratings per half", () => {
    expect(improving(rows([4, 4, 4], [3.8, 3.8, 3.8]), "2026-10-22")).toBe(false);
    expect(improving(rows([3, 3, 3], [4, 4, 4]), "2026-10-22")).toBe(false);
    expect(improving(rows([5, 5], [1, 1, 1]), "2026-10-22")).toBe(false);
  });
  it("ignores ratings outside the 30-day window", () => {
    expect(improving([...rows([4, 4, 4], []), ...[1, 1, 1].map((score) => ({ score, day: "2026-08-01" }))], "2026-10-22")).toBe(false);
  });
});

describe("weekly trend", () => {
  it("averages the last four weeks, oldest first, with null for an empty week", () => {
    const rows = [
      { score: 3, day: "2026-10-01" }, { score: 4, day: "2026-10-02" }, // 21 and 20 days ago: the two oldest weeks
      { score: 5, day: "2026-10-21" }, // 1 day ago: newest week
      { score: 1, day: "2026-08-01" }, // too old
    ];
    expect(weeklyTrend(rows, "2026-10-22")).toEqual([3, 4, null, 5]);
  });
});
