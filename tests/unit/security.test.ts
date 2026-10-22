import { beforeEach, describe, expect, it } from "vitest";
import type { Db } from "@/src/db";
import { ownerSummary } from "@/src/services/aggregates";
import { postAlok, listAlok, closeAlok } from "@/src/services/alok";
import { consumeLink, requestLink } from "@/src/services/auth";
import { bukasPlan, leftoverPesos, saveDay } from "@/src/services/logs";
import { LIMITS, allow, clientIp } from "@/src/services/ratelimit";
import { fileReport, listReports } from "@/src/services/reports";
import { addDish, listDishes, ownedStall, setPaborito, setPublished } from "@/src/services/stalls";
import { createStall } from "@/src/services/stalls";
import { setBagyo, stallWeather } from "@/src/services/weather";
import { testDb } from "./helpers/testdb";

const NOW = new Date("2026-10-22T04:00:00Z");

describe("another owner cannot reach this owner's stall", () => {
  let db: Db, intruder: string, stallId: string, dishId: string, alokId: string;

  beforeEach(async () => {
    db = await testDb();
    const owner = (await consumeLink(db, (await requestLink(db, "a@x.co"))!))!;
    intruder = (await consumeLink(db, (await requestLink(db, "b@x.co"))!))!;
    stallId = (await createStall(db, owner, { name: "Rosa", area: "UST" }))!.id;
    dishId = (await addDish(db, owner, stallId, { name: "Adobo", icon: "adobo", price: 70 }))!.id;
    const posted = await postAlok(db, owner, stallId, { dishId, kind: "combo", limit: 3 }, NOW);
    alokId = posted.alok?.id ?? "";
  });

  it("every read and write answers as if the stall did not exist", async () => {
    const entries = [{ dishId, cooked: 5, sold: 4 }];
    expect(await ownedStall(db, intruder, stallId)).toBeNull();
    expect(await listDishes(db, intruder, stallId)).toBeNull();
    expect(await addDish(db, intruder, stallId, { name: "Hack", icon: "bowl", price: 1 })).toBeNull();
    expect(await setPublished(db, intruder, dishId, true)).toBeFalsy();
    expect(await setPaborito(db, intruder, dishId, true)).toBeFalsy();
    expect(await ownerSummary(db, intruder, stallId, NOW)).toBeNull();
    expect(await saveDay(db, intruder, stallId, entries, NOW)).toBeNull();
    expect(await leftoverPesos(db, intruder, stallId, 7, NOW)).toBeNull();
    expect(await bukasPlan(db, intruder, stallId, NOW)).toBeNull();
    expect(await setBagyo(db, intruder, stallId, true, NOW)).toBeNull();
    expect(await stallWeather(db, intruder, stallId, NOW)).toBeNull();
    expect(await listAlok(db, intruder, stallId, NOW)).toBeNull();
    expect(await postAlok(db, intruder, stallId, { dishId, kind: "combo", limit: 3 }, NOW)).toHaveProperty("error");
    expect(await closeAlok(db, intruder, alokId, NOW)).toBe(false);
    expect(await listReports(db, intruder, stallId)).toBeNull();
    expect(await fileReport(db, intruder, { dishId, windowStart: "2026-10-22T02:00:00Z", windowEnd: "2026-10-22T03:00:00Z" }, NOW)).toEqual({ error: "not-found" });
  });
});

describe("rate limiter", () => {
  it("refuses past the limit, counts keys separately and recovers after the window", async () => {
    const db = await testDb();
    const l = { name: "t", limit: 3, windowSec: 60 };
    for (let i = 0; i < 3; i++) expect(await allow(db, l, "a", NOW)).toBe(true);
    expect(await allow(db, l, "a", NOW)).toBe(false);
    expect(await allow(db, l, "b", NOW)).toBe(true);
    expect(await allow(db, l, "a", new Date(NOW.getTime() + 61_000))).toBe(true);
  });

  it("limits a phone far below a shared address, so one school Wi-Fi does not lock out its buyers", () => {
    expect(LIMITS.ratingDevice.limit).toBeLessThan(LIMITS.ratingIp.limit / 10);
    expect(LIMITS.claimDevice.limit).toBeLessThan(LIMITS.claimIp.limit / 10);
  });

  it("does not store the raw subject", async () => {
    const db = await testDb();
    await allow(db, { name: "t", limit: 3, windowSec: 60 }, "rosa@example.com", NOW);
    const rows = await db.select().from((await import("@/src/db/schema")).rateHits);
    expect(rows[0].key).not.toContain("rosa");
  });

  it("has an hourly cap on sign-in links per address and per email", () => {
    expect(LIMITS.authIp.windowSec).toBe(3600);
    expect(LIMITS.authEmail.limit).toBeLessThan(LIMITS.authIp.limit);
  });

  it("reads the first forwarded address", () => {
    expect(clientIp(new Request("http://x", { headers: { "x-forwarded-for": "1.2.3.4, 10.0.0.1" } }))).toBe("1.2.3.4");
    expect(clientIp(new Request("http://x"))).toBe("unknown");
  });
});
