import { beforeEach, describe, expect, it } from "vitest";
import type { Db } from "@/src/db";
import { consumeLink, requestLink } from "@/src/services/auth";
import { claimAlok, closeAlok, listAlok, postAlok } from "@/src/services/alok";
import { publicBoard } from "@/src/services/aggregates";
import { addDish, createStall, setPaborito } from "@/src/services/stalls";
import { testDb } from "./helpers/testdb";

const NOW = new Date("2026-10-22T04:00:00Z");
const LATER = new Date("2026-10-22T06:00:00Z");

describe("alok", () => {
  let db: Db, owner: string, other: string, stallId: string, adobo: string;
  const post = async (body: Record<string, unknown>, who = owner) => postAlok(db, who, stallId, { dishId: adobo, kind: "combo", limit: 2, ...body }, NOW);
  const alokId = async () => (await listAlok(db, owner, stallId, NOW))![0].id;

  beforeEach(async () => {
    db = await testDb();
    owner = (await consumeLink(db, (await requestLink(db, "a@x.co"))!))!;
    other = (await consumeLink(db, (await requestLink(db, "b@x.co"))!))!;
    stallId = (await createStall(db, owner, { name: "Rosa", area: "UST" }))!.id;
    adobo = (await addDish(db, owner, stallId, { name: "Adobo", icon: "adobo", price: 70 }))!.id;
  });

  it("posts a deal and lists it with the remaining count", async () => {
    expect("alok" in (await post({}))).toBe(true);
    expect(await listAlok(db, owner, stallId, NOW)).toMatchObject([{ kind: "combo", limit: 2, remaining: 2, active: true }]);
  });

  it("rejects rating-linked, invalid, expired, foreign and over-limit deals", async () => {
    expect(await post({ rating: 5 })).toEqual({ error: "deal cannot reference a rating" });
    expect(await post({ limit: 0 })).toHaveProperty("error");
    expect(await post({ kind: "oras", endsAt: "2026-10-22T03:00:00Z" })).toEqual({ error: "end time is in the past" });
    expect(await post({}, other)).toEqual({ error: "not found" });
    for (let i = 0; i < 5; i++) await post({});
    expect(await post({})).toEqual({ error: "too many active deals" });
  });

  it("lets each device claim once and stops at the limit", async () => {
    await post({ limit: 2 });
    const id = await alokId();
    expect(await claimAlok(db, "dev-1", id, NOW)).toBe("ok");
    expect(await claimAlok(db, "dev-1", id, NOW)).toBe("already");
    expect(await claimAlok(db, "dev-2", id, NOW)).toBe("ok");
    expect(await claimAlok(db, "dev-3", id, NOW)).toBe("gone");
    expect((await listAlok(db, owner, stallId, NOW))![0]).toMatchObject({ claimed: 2, remaining: 0, active: false });
  });

  it("never lets concurrent claims pass the limit", async () => {
    await post({ limit: 3 });
    const id = await alokId();
    const results = await Promise.all(Array.from({ length: 10 }, (_, i) => claimAlok(db, `dev-${i}`, id, NOW)));
    expect(results.filter((r) => r === "ok")).toHaveLength(3);
    expect((await listAlok(db, owner, stallId, NOW))![0].claimed).toBe(3);
  });

  it("expires an Oras deal on time and honours close", async () => {
    await post({ kind: "oras", endsAt: "2026-10-22T05:00:00Z" });
    const id = await alokId();
    expect(await claimAlok(db, "dev-1", id, LATER)).toBe("gone");
    await post({ kind: "combo" });
    const [, second] = (await listAlok(db, owner, stallId, NOW))!;
    expect(await closeAlok(db, other, second.id, NOW)).toBe(false);
    expect(await closeAlok(db, owner, second.id, NOW)).toBe(true);
    expect(await claimAlok(db, "dev-2", second.id, NOW)).toBe("gone");
  });

  it("rejects a missing device or an unknown deal", async () => {
    expect(await claimAlok(db, "", "00000000-0000-0000-0000-000000000000", NOW)).toBe("invalid");
    expect(await claimAlok(db, "dev-1", "00000000-0000-0000-0000-000000000000", NOW)).toBe("invalid");
    expect(await claimAlok(db, "dev-1", "not-a-uuid", NOW)).toBe("invalid");
  });

  it("adds a ribbon to the board without changing its position", async () => {
    const tinola = (await addDish(db, owner, stallId, { name: "Tinola", icon: "tinola", price: 65 }))!.id;
    await setPaborito(db, owner, adobo, true);
    await setPaborito(db, owner, tinola, true);
    const before = (await publicBoard(db, {}, NOW)).map((i) => i.dishId);
    await post({ dishId: tinola, limit: 4 });
    const after = await publicBoard(db, {}, NOW);
    expect(after.map((i) => i.dishId)).toEqual(before);
    expect(after.find((i) => i.dishId === tinola)!.alok).toMatchObject({ kind: "combo", remaining: 4 });
    expect(after.find((i) => i.dishId === adobo)!.alok).toBeNull();
  });
});
