import { describe, expect, it } from "vitest";
import { suggest } from "./bukas";

const base = { baseServings: 0, logs: [], score: null, count: 0 };

describe("bukas", () => {
  it("has no number without a log or usual servings", () => {
    expect(suggest(base)).toBeNull();
  });

  it("falls back to the usual servings", () => {
    expect(suggest({ ...base, baseServings: 12 })).toEqual({ servings: 12, yesterday: null, reasons: ["usual"] });
  });

  it("uses the average sold, not what was cooked", () => {
    const p = suggest({ ...base, logs: [{ cooked: 12, sold: 8 }, { cooked: 12, sold: 10 }] })!;
    expect(p.servings).toBe(9);
    expect(p.yesterday).toBe(12);
  });

  it("adds a bump when it sold out on half the days or more", () => {
    const p = suggest({ ...base, logs: [{ cooked: 10, sold: 10 }, { cooked: 10, sold: 6 }] })!;
    expect(p.servings).toBe(Math.round(8 * 1.1));
    expect(p.reasons).toContain("sold-out");
    expect(suggest({ ...base, logs: [{ cooked: 10, sold: 10 }, { cooked: 10, sold: 6 }, { cooked: 10, sold: 6 }] })!.reasons).not.toContain("sold-out");
  });

  it("ignores ratings below 10 and applies them from 10", () => {
    const logs = [{ cooked: 10, sold: 10 }];
    expect(suggest({ ...base, logs, score: 4.9, count: 9 })!.reasons).not.toContain("high-rated");
    expect(suggest({ ...base, baseServings: 10, score: 4.3, count: 10 })!.servings).toBe(11);
    expect(suggest({ ...base, baseServings: 10, score: 3.39, count: 10 })!.servings).toBe(9);
    expect(suggest({ ...base, baseServings: 10, score: 3.4, count: 10 })!.servings).toBe(10);
  });

  it("applies the weather factor last and never goes negative", () => {
    expect(suggest({ ...base, baseServings: 10 }, 0.5)!.servings).toBe(5);
    expect(suggest({ ...base, baseServings: 10 }, 0)!.servings).toBe(0);
  });
});
