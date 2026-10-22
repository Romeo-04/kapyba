import { and, eq } from "drizzle-orm";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { Db } from "@/src/db";
import { dishes, ratings } from "@/src/db/schema";
import { signScan } from "@/src/auth/qr";
import { ownerSummary, publicBoard } from "@/src/services/aggregates";
import { consumeLink, requestLink } from "@/src/services/auth";
import { submitRating } from "@/src/services/ratings";
import { addDish, createStall, setPaborito, setPublished } from "@/src/services/stalls";
import { testDb } from "./helpers/testdb";

beforeAll(() => {
  process.env.AUTH_SECRET = "test-secret-at-least-16-chars";
  process.env.QR_SIGNING_SECRET = "qr-secret-at-least-16-chars";
});

const NOW = new Date("2026-10-22T04:00:00Z");

describe("aggregates", () => {
  let db: Db, owner: string, other: string, stallId: string, code: string, adobo: string, tinola: string;

  const rate = (dishId: string, device: string, score: number, tags: string[] = []) =>
    submitRating(db, {
      stallCode: code, deviceToken: device, dishId, score, tags, idempotencyKey: `${device}-${dishId}-${score}-${Math.random()}`,
      scanToken: signScan(code, device, NOW.getTime()),
    }, NOW);
  const many = async (dishId: string, n: number, score: number, tags: string[] = []) => {
    for (let i = 0; i < n; i++) expect(await rate(dishId, `dev-${dishId.slice(0, 4)}-${i}`, score, tags)).toBe("ok");
  };

  beforeEach(async () => {
    db = await testDb();
    owner = (await consumeLink(db, (await requestLink(db, "a@x.co"))!))!;
    other = (await consumeLink(db, (await requestLink(db, "b@x.co"))!))!;
    const s = (await createStall(db, owner, { name: "Rosa", area: "UST" }))!;
    stallId = s.id; code = s.code;
    adobo = (await addDish(db, owner, stallId, { name: "Adobo", icon: "adobo", price: 70, baseServings: 12 }))!.id;
    tinola = (await addDish(db, owner, stallId, { name: "Tinola", icon: "tinola", price: 65, baseServings: 8 }))!.id;
  });

  it("owner sees private counts with no public score before the minimum", async () => {
    await many(adobo, 4, 5);
    const [d] = (await ownerSummary(db, owner, stallId, NOW))!.filter((x) => x.id === adobo);
    expect(d.private.count).toBe(4);
    expect(d.private.score).toBe(5);
    expect(d.private.tone).toBe("happy");
    expect(d.gate).toEqual({ state: "kulang", have: 4, need: 10 });
  });
  it("the gate opens at 10 ratings from 5 buyers once the owner publishes", async () => {
    await many(adobo, 10, 4);
    let d = (await ownerSummary(db, owner, stallId, NOW))!.find((x) => x.id === adobo)!;
    expect(d.gate.state).toBe("kulang"); // not published yet
    await setPublished(db, owner, adobo, true);
    d = (await ownerSummary(db, owner, stallId, NOW))!.find((x) => x.id === adobo)!;
    expect(d.gate.state).toBe("public");
  });
  it("another owner gets nothing", async () => {
    expect(await ownerSummary(db, other, stallId, NOW)).toBeNull();
  });
  it("tag shares and recommendations appear at the minimum", async () => {
    await many(tinola, 10, 3, ["salt"]);
    const d = (await ownerSummary(db, owner, stallId, NOW))!.find((x) => x.id === tinola)!;
    expect(d.private.tagShares.salt).toBe(1);
    expect(d.recs[0]).toEqual({ icon: "salt", dir: "down", word: "Bawasan" });
  });
  it("Pansin flags a dish cooked a lot but rated low", async () => {
    await many(adobo, 10, 3);
    const d = (await ownerSummary(db, owner, stallId, NOW))!.find((x) => x.id === adobo)!;
    expect(d.pansin).toBe(-1);
    expect(d.recs.map((r) => r.word)).toContain("Konti");
  });
  it("flagged ratings stay in the owner view but leave the public gate; removed ones vanish", async () => {
    await many(adobo, 10, 4);
    await setPublished(db, owner, adobo, true);
    const some = await db.select({ id: ratings.id }).from(ratings).where(eq(ratings.dishId, adobo)).limit(2);
    await db.update(ratings).set({ status: "flagged" }).where(eq(ratings.id, some[0].id));
    await db.update(ratings).set({ status: "removed" }).where(eq(ratings.id, some[1].id));
    const d = (await ownerSummary(db, owner, stallId, NOW))!.find((x) => x.id === adobo)!;
    expect(d.private.count).toBe(9); // removed is gone, flagged stays
    expect(d.flagged).toBe(1);
    expect(d.gate.state).toBe("kulang"); // only 8 clean ratings
  });
  it("ignores ratings older than 30 days", async () => {
    await many(adobo, 10, 4);
    const later = new Date(NOW.getTime() + 31 * 86_400_000);
    const d = (await ownerSummary(db, owner, stallId, later))!.find((x) => x.id === adobo)!;
    expect(d.private.count).toBe(0);
    expect(d.private.score).toBeNull();
  });

  it("public board lists only gated, published dishes plus Paborito picks without scores", async () => {
    await many(adobo, 10, 5);
    await many(tinola, 10, 3);
    await setPublished(db, owner, adobo, true); // tinola stays private
    await setPaborito(db, owner, tinola, true);
    const items = await publicBoard(db, {}, NOW);
    expect(items.map((i) => [i.kind, i.dishId])).toEqual([["scored", adobo], ["paborito", tinola]]);
    const first = items[0];
    expect(first.kind === "scored" && first.score).toBe(5);
    expect(JSON.stringify(items)).not.toContain("deviceId"); // no buyer data leaks
  });
  it("filters by budget and area", async () => {
    await many(adobo, 10, 5);
    await setPublished(db, owner, adobo, true);
    expect(await publicBoard(db, { maxPrice: 60 }, NOW)).toEqual([]);
    expect((await publicBoard(db, { maxPrice: 70 }, NOW)).length).toBe(1);
    expect(await publicBoard(db, { area: "Elsewhere" }, NOW)).toEqual([]);
  });
  it("hides an archived dish", async () => {
    await many(adobo, 10, 5);
    await setPublished(db, owner, adobo, true);
    await db.update(dishes).set({ archivedAt: NOW }).where(and(eq(dishes.id, adobo)));
    expect(await publicBoard(db, {}, NOW)).toEqual([]);
  });
});
