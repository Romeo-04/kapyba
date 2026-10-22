import { describe, expect, it } from "vitest";
import { publicGate } from "./gate";

describe("publicGate", () => {
  it("is public at exactly 10 ratings from 5 buyers when published", () => {
    expect(publicGate(10, 5, true)).toEqual({ state: "public" });
  });
  it("is locked one rating short", () => {
    expect(publicGate(9, 5, true)).toEqual({ state: "kulang", have: 9, need: 10 });
  });
  it("is locked with 10 ratings from 4 buyers", () => {
    expect(publicGate(10, 4, true).state).toBe("kulang");
  });
  it("is locked when the owner has not published", () => {
    expect(publicGate(50, 20, false).state).toBe("kulang");
  });
});
