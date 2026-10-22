import { describe, expect, it } from "vitest";
import { devices, loginTokens, rateHits, ratings } from "@/src/db/schema";
import { consumeLink, requestLink } from "@/src/services/auth";
import { addDish, createStall } from "@/src/services/stalls";
import { purgeExpired } from "@/src/services/retention";
import { testDb } from "./helpers/testdb";

const NOW = new Date("2026-10-22T04:00:00Z");
const ago = (days: number) => new Date(NOW.getTime() - days * 86_400_000);

describe("retention", () => {
  it("deletes ratings, idle devices and stale logs past their limits and keeps the rest", async () => {
    const db = await testDb();
    const owner = (await consumeLink(db, (await requestLink(db, "a@x.co"))!))!;
    const stall = (await createStall(db, owner, { name: "Rosa", area: "UST" }))!;
    const dish = (await addDish(db, owner, stall.id, { name: "Adobo", icon: "bowl", price: 70 }))!;
    const [oldDev, activeDev, newDev] = await db.insert(devices).values([
      { tokenHash: "a", firstSeenAt: ago(400) }, { tokenHash: "b", firstSeenAt: ago(400) }, { tokenHash: "c", firstSeenAt: ago(5) },
    ]).returning();
    await db.insert(ratings).values([
      { dishId: dish.id, deviceId: oldDev.id, score: 4, day: "2025-08-01", idempotencyKey: "k1", createdAt: ago(380) },
      { dishId: dish.id, deviceId: activeDev.id, score: 5, day: "2026-10-20", idempotencyKey: "k2", createdAt: ago(2) },
    ]);
    await db.insert(rateHits).values([{ key: "x", at: ago(3) }, { key: "x", at: ago(0) }]);
    await db.insert(loginTokens).values({ email: "z@x.co", tokenHash: "t", expiresAt: ago(3) });

    expect(await purgeExpired(db, NOW)).toEqual({ ratings: 1, devices: 1, loginTokens: 1, rateHits: 1 });
    expect((await db.select().from(ratings)).map((r) => r.idempotencyKey)).toEqual(["k2"]);
    expect((await db.select().from(devices)).map((d) => d.tokenHash).sort()).toEqual(["b", "c"]);
    expect(newDev.id).toBeTruthy();
    expect(await purgeExpired(db, NOW)).toEqual({ ratings: 0, devices: 0, loginTokens: 0, rateHits: 0 });
  });
});
