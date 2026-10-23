import { beforeEach, describe, expect, it } from "vitest";
import type { Db } from "@/src/db";
import { consumeLink, requestLink } from "@/src/services/auth";
import { createStall, setStallLocation } from "@/src/services/stalls";
import { distancesFrom } from "@/src/services/near";
import { distanceKm, roundCoord, validCoord } from "@/src/domain/geo";
import { testDb } from "./helpers/testdb";

describe("distance and rounding", () => {
  it("measures km between two points and rounds to about 100 m", () => {
    expect(distanceKm({ lat: 14.5995, lng: 120.9842 }, { lat: 14.5995, lng: 120.9842 })).toBe(0);
    const km = distanceKm({ lat: 14.6091, lng: 120.9893 }, { lat: 14.5995, lng: 120.9842 }); // UST to Manila City Hall area
    expect(km).toBeGreaterThan(1);
    expect(km).toBeLessThan(2);
    expect(roundCoord(14.609123)).toBe(14.609);
  });
  it("refuses positions that are not on Earth", () => {
    expect(validCoord(91, 0)).toBe(false);
    expect(validCoord(0, 181)).toBe(false);
    expect(validCoord(Number.NaN, 0)).toBe(false);
    expect(validCoord("14", "120")).toBe(false);
    expect(validCoord(14.6, 120.9)).toBe(true);
  });
});

describe("stall location", () => {
  let db: Db; let a: string; let b: string; let near: string; let far: string; let none: string;
  beforeEach(async () => {
    db = await testDb();
    a = (await consumeLink(db, (await requestLink(db, "a@x.co"))!))!;
    b = (await consumeLink(db, (await requestLink(db, "b@x.co"))!))!;
    near = (await createStall(db, a, { name: "Near", area: "UST" }))!.id;
    far = (await createStall(db, a, { name: "Far", area: "Cebu" }))!.id;
    none = (await createStall(db, a, { name: "None", area: "UST" }))!.id;
  });
  it("only the owner can set it, and it is stored rounded", async () => {
    expect(await setStallLocation(db, b, near, 14.609, 120.989)).toBe(false);
    expect(await setStallLocation(db, a, near, 200, 120)).toBe(false);
    expect(await setStallLocation(db, a, near, 14.609123, 120.989456)).toBe(true);
    expect(await distancesFrom(db, { lat: 14.609, lng: 120.989 })).toEqual({ [near]: 0 });
  });
  it("answers distances only for stalls with a location, nearest measured from the phone", async () => {
    await setStallLocation(db, a, near, 14.609, 120.989);
    await setStallLocation(db, a, far, 10.3157, 123.8854);
    const d = await distancesFrom(db, { lat: 14.61, lng: 120.99 });
    expect(Object.keys(d).sort()).toEqual([near, far].sort());
    expect(d[near]).toBeLessThan(1);
    expect(d[far]).toBeGreaterThan(500);
    expect(d[none]).toBeUndefined();
  });
});
