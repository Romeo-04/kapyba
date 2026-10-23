import { beforeAll, describe, expect, it } from "vitest";
import type { Db } from "@/src/db";
import { signScan } from "@/src/auth/qr";
import { dishKey, neighbourhood } from "@/src/domain/kumpara";
import { ownerSummary } from "@/src/services/aggregates";
import { consumeLink, requestLink } from "@/src/services/auth";
import { submitRating } from "@/src/services/ratings";
import { addDish, createStall, setPublished } from "@/src/services/stalls";
import { testDb } from "./helpers/testdb";

beforeAll(() => {
  process.env.AUTH_SECRET = "test-secret-at-least-16-chars";
  process.env.QR_SIGNING_SECRET = "qr-secret-at-least-16-chars";
});

const NOW = new Date("2026-10-22T04:00:00Z");
const shares = { salt: 0.2, plate: 0, flame: 0, coin: 0, leaf: 0, alert: 0, chili: 0, clock: 0 };

describe("neighbourhood average", () => {
  it("stays hidden under 3 stalls and averages each stall once", () => {
    expect(neighbourhood([{ score: 4, tagShares: shares }, { score: 5, tagShares: shares }])).toBeNull();
    const k = neighbourhood([{ score: 4, tagShares: shares }, { score: 5, tagShares: shares }, { score: 3, tagShares: shares }])!;
    expect(k.stalls).toBe(3);
    expect(k.score).toBe(4);
    expect(k.tagShares.salt).toBeCloseTo(0.2);
  });
  it("matches dish names ignoring case, spaces and accents", () => {
    expect(dishKey("  Adobo ")).toBe(dishKey("adobo"));
    expect(dishKey("Pinakbét")).toBe(dishKey("pinakbet"));
  });
});

describe("Kumpara in the owner summary", () => {
  let db: Db;
  async function stallWithAdobo(email: string, area: string, ratingsN: number, score: number, publish = true) {
    const owner = (await consumeLink(db, (await requestLink(db, email))!))!;
    const s = (await createStall(db, owner, { name: email, area }))!;
    const dish = (await addDish(db, owner, s.id, { name: "Adobo", icon: "adobo", price: 70 }))!.id;
    if (publish) await setPublished(db, owner, dish, true);
    for (let i = 0; i < ratingsN; i++) {
      await submitRating(db, { stallCode: s.code, deviceToken: `${email}-${i}`, dishId: dish, score, tags: [], idempotencyKey: `${email}-${i}-key`, scanToken: signScan(s.code, `${email}-${i}`, NOW.getTime()) }, NOW);
    }
    return { owner, stallId: s.id };
  }

  it("shows only once 3 other published stalls in the same area qualify", async () => {
    db = await testDb();
    const me = await stallWithAdobo("me@x.co", "UST", 2, 4);
    await stallWithAdobo("a@x.co", "UST", 10, 5);
    await stallWithAdobo("b@x.co", "UST", 10, 3);
    expect((await ownerSummary(db, me.owner, me.stallId, NOW))![0].kumpara).toBeNull();

    await stallWithAdobo("c@x.co", "UST", 10, 4);
    await stallWithAdobo("far@x.co", "FEU", 10, 1); // other area: ignored
    await stallWithAdobo("shy@x.co", "UST", 10, 1, false); // not published: ignored
    await stallWithAdobo("thin@x.co", "UST", 4, 1); // under the gate: ignored
    const k = (await ownerSummary(db, me.owner, me.stallId, NOW))![0].kumpara!;
    expect(k.stalls).toBe(3);
    expect(k.score).toBe(4);
  });
});
