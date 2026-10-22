import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { Db } from "@/src/db";
import { readSession, signSession } from "@/src/auth/session";
import { consumeLink, requestLink } from "@/src/services/auth";
import { addDish, createStall, listDishes, newStallCode, setPaborito, setPublished } from "@/src/services/stalls";
import { testDb } from "./helpers/testdb";

beforeAll(() => {
  process.env.AUTH_SECRET = "test-secret-at-least-16-chars";
});

describe("session cookie", () => {
  it("round-trips and rejects tampering and expiry", () => {
    const v = signSession("owner-1", 1_000);
    expect(readSession(v, 2_000)).toBe("owner-1");
    expect(readSession(v.replace("owner-1", "owner-2"), 2_000)).toBeNull();
    expect(readSession(v + "x", 2_000)).toBeNull();
    expect(readSession(v, 1_000 + 31 * 86_400_000)).toBeNull();
    expect(readSession(undefined)).toBeNull();
    expect(readSession("garbage")).toBeNull();
  });
});

describe("magic link", () => {
  let db: Db;
  beforeEach(async () => { db = await testDb(); });

  it("rejects a bad email and signs a new owner in once", async () => {
    expect(await requestLink(db, "not-an-email")).toBeNull();
    const token = (await requestLink(db, "  Rosa@Example.com "))!;
    const id = await consumeLink(db, token);
    expect(id).toBeTruthy();
    expect(await consumeLink(db, token)).toBeNull(); // single use
    const again = (await requestLink(db, "rosa@example.com"))!;
    expect(await consumeLink(db, again)).toBe(id); // same owner, case-insensitive
  });
  it("rejects an expired token and an unknown token", async () => {
    const token = (await requestLink(db, "a@b.co", new Date("2026-10-22T00:00:00Z")))!;
    expect(await consumeLink(db, token, new Date("2026-10-22T00:16:00Z"))).toBeNull();
    expect(await consumeLink(db, "nope")).toBeNull();
  });
});

describe("stalls and dishes", () => {
  let db: Db;
  let a: string, b: string, stall: string;
  beforeEach(async () => {
    db = await testDb();
    a = (await consumeLink(db, (await requestLink(db, "a@x.co"))!))!;
    b = (await consumeLink(db, (await requestLink(db, "b@x.co"))!))!;
    stall = (await createStall(db, a, { name: "Rosa", area: "UST" }))!.id;
  });

  it("makes unguessable, distinct stall codes", async () => {
    const codes = new Set(Array.from({ length: 200 }, newStallCode));
    expect(codes.size).toBe(200);
    expect([...codes][0]).toMatch(/^[a-z2-9]{10}$/);
  });
  it("rejects a stall with no name or area", async () => {
    expect(await createStall(db, a, { name: " ", area: "UST" })).toBeNull();
    expect(await createStall(db, a, { name: "X", area: 5 })).toBeNull();
  });
  it("adds and lists dishes for the owner, unpublished by default", async () => {
    const d = (await addDish(db, a, stall, { name: "Adobo", icon: "adobo", price: 70, baseServings: 12 }))!;
    expect(d.published).toBe(false);
    expect((await listDishes(db, a, stall))!.map((x) => x.name)).toEqual(["Adobo"]);
  });
  it("validates dish input", async () => {
    expect(await addDish(db, a, stall, { name: "X", icon: "x", price: 0 })).toBeNull();
    expect(await addDish(db, a, stall, { name: "X", icon: "x", price: 5.5 })).toBeNull();
    expect(await addDish(db, a, stall, { name: "", icon: "x", price: 5 })).toBeNull();
    expect(await addDish(db, a, stall, { name: "X", icon: "x", price: 5, baseServings: -1 })).toBeNull();
  });
  it("blocks another owner from reading or changing the stall", async () => {
    const d = (await addDish(db, a, stall, { name: "Adobo", icon: "adobo", price: 70 }))!;
    expect(await addDish(db, b, stall, { name: "Hack", icon: "x", price: 1 })).toBeNull();
    expect(await listDishes(db, b, stall)).toBeNull();
    expect(await setPublished(db, b, d.id, true)).toBe(false);
    expect(await setPaborito(db, b, d.id, true)).toBe(false);
    expect(await setPublished(db, a, d.id, true)).toBe(true);
    expect((await listDishes(db, a, stall))![0].published).toBe(true);
  });
  it("allows at most three Paborito picks", async () => {
    const ids: string[] = [];
    for (const n of ["A", "B", "C", "D"]) ids.push((await addDish(db, a, stall, { name: n, icon: "x", price: 10 }))!.id);
    expect(await setPaborito(db, a, ids[0], true)).toBe(true);
    expect(await setPaborito(db, a, ids[1], true)).toBe(true);
    expect(await setPaborito(db, a, ids[2], true)).toBe(true);
    expect(await setPaborito(db, a, ids[3], true)).toBe(false);
    expect(await setPaborito(db, a, ids[0], false)).toBe(true);
    expect(await setPaborito(db, a, ids[3], true)).toBe(true);
  });
});
