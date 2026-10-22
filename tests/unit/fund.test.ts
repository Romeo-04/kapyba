import { describe, expect, it } from "vitest";
import { FUND_SHARE, simulatedFund } from "@/src/domain/weather";
import { consumeLink, requestLink } from "@/src/services/auth";
import { fundSimulation, saveDay } from "@/src/services/logs";
import { addDish, createStall } from "@/src/services/stalls";
import { testDb } from "./helpers/testdb";

const NOW = new Date("2026-10-22T04:00:00Z");

describe("simulated Bagyo Fund", () => {
  it("is a share of average daily sales, and null with nothing logged", () => {
    expect(FUND_SHARE).toBe(0.5);
    expect(simulatedFund([])).toBeNull();
    expect(simulatedFund([0, 0])).toBeNull();
    expect(simulatedFund([600, 800, 0])).toBe(350);
  });

  it("is built from this stall's logged sales only", async () => {
    const db = await testDb();
    const owner = (await consumeLink(db, (await requestLink(db, "a@x.co"))!))!;
    const other = (await consumeLink(db, (await requestLink(db, "b@x.co"))!))!;
    const stall = (await createStall(db, owner, { name: "Rosa", area: "UST" }))!;
    const dish = (await addDish(db, owner, stall.id, { name: "Adobo", icon: "bowl", price: 70 }))!;
    expect(await fundSimulation(db, owner, stall.id, NOW)).toEqual({ pesos: null, days: 0 });
    await saveDay(db, owner, stall.id, [{ dishId: dish.id, cooked: 12, sold: 10 }], NOW);
    expect(await fundSimulation(db, owner, stall.id, NOW)).toEqual({ pesos: 350, days: 1 });
    expect(await fundSimulation(db, other, stall.id, NOW)).toBeNull();
  });
});
