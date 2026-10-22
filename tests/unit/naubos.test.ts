import { beforeEach, describe, expect, it } from "vitest";
import type { Db } from "@/src/db";
import { ownerSummary, publicBoard } from "@/src/services/aggregates";
import { consumeLink, requestLink } from "@/src/services/auth";
import { addDish, createStall, setPaborito, setPublished, setNaubos, setSale } from "@/src/services/stalls";
import { testDb } from "./helpers/testdb";

const NOW = new Date("2026-10-22T04:00:00Z"); // noon in Manila
const TOMORROW = new Date("2026-10-23T04:00:00Z");

describe("Naubos and Sale", () => {
  let db: Db, owner: string, other: string, stallId: string, dishId: string;

  beforeEach(async () => {
    db = await testDb();
    owner = (await consumeLink(db, (await requestLink(db, "a@x.co"))!))!;
    other = (await consumeLink(db, (await requestLink(db, "b@x.co"))!))!;
    stallId = (await createStall(db, owner, { name: "Rosa", area: "UST" }))!.id;
    dishId = (await addDish(db, owner, stallId, { name: "Adobo", icon: "bowl", price: 70 }))!.id;
    await setPublished(db, owner, dishId, true);
    await setPaborito(db, owner, dishId, true);
  });

  it("sold out and sale show on the board today and clear by themselves tomorrow", async () => {
    expect(await setNaubos(db, owner, dishId, true, NOW)).toBe(true);
    expect(await setSale(db, owner, dishId, 50, NOW)).toBe(true);
    const [today] = await publicBoard(db, {}, NOW);
    expect(today).toMatchObject({ soldOut: true, salePrice: 50, price: 70 });
    const [next] = await publicBoard(db, {}, TOMORROW);
    expect(next).toMatchObject({ soldOut: false, salePrice: null });
    const [mine] = (await ownerSummary(db, owner, stallId, NOW))!;
    expect(mine).toMatchObject({ soldOut: true, salePrice: 50 });
  });

  it("the sale price must be a whole peso below the usual price, and can be ended", async () => {
    for (const bad of [0, 70, 90, 12.5]) expect(await setSale(db, owner, dishId, bad, NOW)).toBe(false);
    expect(await setSale(db, owner, dishId, 60, NOW)).toBe(true);
    expect(await setSale(db, owner, dishId, null, NOW)).toBe(true);
    expect((await publicBoard(db, {}, NOW))[0].salePrice).toBeNull();
    expect(await setNaubos(db, owner, dishId, false, NOW)).toBe(true);
  });

  it("another owner cannot touch the dish", async () => {
    expect(await setNaubos(db, other, dishId, true, NOW)).toBe(false);
    expect(await setSale(db, other, dishId, 50, NOW)).toBe(false);
  });
});
