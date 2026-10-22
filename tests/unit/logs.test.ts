import { beforeEach, describe, expect, it } from "vitest";
import type { Db } from "@/src/db";
import { consumeLink, requestLink } from "@/src/services/auth";
import { leftoverPesos, saveDay } from "@/src/services/logs";
import { addDish, createStall } from "@/src/services/stalls";
import { testDb } from "./helpers/testdb";

const NOW = new Date("2026-10-22T04:00:00Z");
const DAY = new Date("2026-10-23T04:00:00Z");

describe("daily log", () => {
  let db: Db, owner: string, other: string, stallId: string, adobo: string, tinola: string;

  beforeEach(async () => {
    db = await testDb();
    owner = (await consumeLink(db, (await requestLink(db, "a@x.co"))!))!;
    other = (await consumeLink(db, (await requestLink(db, "b@x.co"))!))!;
    stallId = (await createStall(db, owner, { name: "Rosa", area: "UST" }))!.id;
    adobo = (await addDish(db, owner, stallId, { name: "Adobo", icon: "adobo", price: 70 }))!.id;
    tinola = (await addDish(db, owner, stallId, { name: "Tinola", icon: "tinola", price: 65 }))!.id;
  });

  it("turns cooked minus sold into leftover pesos", async () => {
    await saveDay(db, owner, stallId, [{ dishId: adobo, cooked: 12, sold: 9 }, { dishId: tinola, cooked: 8, sold: 8 }], NOW);
    expect(await leftoverPesos(db, owner, stallId, 7, NOW)).toEqual([{ day: "2026-10-22", pesos: 210, leftover: 3, cooked: 20 }]);
  });

  it("replaces an earlier entry for the same dish and day", async () => {
    await saveDay(db, owner, stallId, [{ dishId: adobo, cooked: 12, sold: 9 }], NOW);
    await saveDay(db, owner, stallId, [{ dishId: adobo, cooked: 12, sold: 12 }], NOW);
    expect((await leftoverPesos(db, owner, stallId, 7, NOW))![0].pesos).toBe(0);
  });

  it("lists days oldest first and ignores days outside the window", async () => {
    await saveDay(db, owner, stallId, [{ dishId: adobo, cooked: 10, sold: 5 }], NOW);
    await saveDay(db, owner, stallId, [{ dishId: adobo, cooked: 10, sold: 8 }], DAY);
    expect((await leftoverPesos(db, owner, stallId, 7, DAY))!.map((d) => d.day)).toEqual(["2026-10-22", "2026-10-23"]);
    expect((await leftoverPesos(db, owner, stallId, 1, DAY))!.map((d) => d.day)).toEqual(["2026-10-23"]);
  });

  it("rejects sold above cooked, negatives, fractions and empty logs", async () => {
    for (const bad of [{ cooked: 5, sold: 6 }, { cooked: -1, sold: 0 }, { cooked: 5.5, sold: 1 }, { cooked: "5", sold: 1 }]) {
      expect(await saveDay(db, owner, stallId, [{ dishId: adobo, ...bad }], NOW)).toBeNull();
    }
    expect(await saveDay(db, owner, stallId, [], NOW)).toBeNull();
    expect(await leftoverPesos(db, owner, stallId, 7, NOW)).toEqual([]);
  });

  it("is all or nothing: one bad entry saves none", async () => {
    expect(await saveDay(db, owner, stallId, [{ dishId: adobo, cooked: 5, sold: 1 }, { dishId: tinola, cooked: 1, sold: 2 }], NOW)).toBeNull();
    expect(await leftoverPesos(db, owner, stallId, 7, NOW)).toEqual([]);
  });

  it("refuses another owner's stall and dishes from another stall", async () => {
    expect(await saveDay(db, other, stallId, [{ dishId: adobo, cooked: 5, sold: 1 }], NOW)).toBeNull();
    expect(await leftoverPesos(db, other, stallId, 7, NOW)).toBeNull();
    const s2 = (await createStall(db, other, { name: "Ben", area: "UST" }))!.id;
    expect(await saveDay(db, other, s2, [{ dishId: adobo, cooked: 5, sold: 1 }], NOW)).toBeNull();
  });
});
