import { beforeEach, describe, expect, it } from "vitest";
import type { Db } from "@/src/db";
import { consumeLink, requestLink } from "@/src/services/auth";
import { addDish, archiveDish, createStall, listDishes, updateDish } from "@/src/services/stalls";
import { testDb } from "./helpers/testdb";

describe("editing and removing a dish", () => {
  let db: Db, owner: string, other: string, stallId: string, dishId: string;

  beforeEach(async () => {
    db = await testDb();
    owner = (await consumeLink(db, (await requestLink(db, "a@x.co"))!))!;
    other = (await consumeLink(db, (await requestLink(db, "b@x.co"))!))!;
    stallId = (await createStall(db, owner, { name: "Rosa", area: "UST" }))!.id;
    dishId = (await addDish(db, owner, stallId, { name: "Adobo", icon: "bowl", price: 70 }))!.id;
  });

  it("changes only the fields given and validates them", async () => {
    expect(await updateDish(db, owner, dishId, { price: 75 })).toBe(true);
    const [d] = (await listDishes(db, owner, stallId))!;
    expect(d).toMatchObject({ name: "Adobo", price: 75 });
    expect(await updateDish(db, owner, dishId, { price: 0 })).toBe(false);
    expect(await updateDish(db, owner, dishId, { name: "  " })).toBe(false);
    expect((await listDishes(db, owner, stallId))![0].price).toBe(75);
  });

  it("refuses another owner", async () => {
    expect(await updateDish(db, other, dishId, { price: 1 })).toBe(false);
    expect(await archiveDish(db, other, dishId)).toBe(false);
    expect((await listDishes(db, owner, stallId))!).toHaveLength(1);
  });

  it("removing hides the dish and cannot be repeated", async () => {
    expect(await archiveDish(db, owner, dishId)).toBe(true);
    expect((await listDishes(db, owner, stallId))!).toHaveLength(0);
    expect(await archiveDish(db, owner, dishId)).toBe(false);
    expect(await updateDish(db, owner, dishId, { price: 80 })).toBe(false);
  });
});
