import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { Db } from "@/src/db";
import { signScan } from "@/src/auth/qr";
import { ownerSummary, publicBoard } from "@/src/services/aggregates";
import { consumeLink, requestLink } from "@/src/services/auth";
import { inbox, markSeen } from "@/src/services/notifications";
import { MAX_PHOTO_BYTES, getImage, imageVersions, removeImage, saveImage, sniffImage } from "@/src/services/photos";
import { submitRating } from "@/src/services/ratings";
import { addDish, createStall, setPaborito, setPublished } from "@/src/services/stalls";
import { testDb } from "./helpers/testdb";

beforeAll(() => {
  process.env.AUTH_SECRET = "test-secret-at-least-16-chars";
  process.env.QR_SIGNING_SECRET = "qr-secret-at-least-16-chars";
});

const NOW = new Date("2026-10-22T04:00:00Z");
const jpeg = (n = 64) => Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, ...Array(n).fill(7)]);

describe("dish photos", () => {
  let db: Db, owner: string, other: string, stallId: string, dishId: string;

  beforeEach(async () => {
    db = await testDb();
    owner = (await consumeLink(db, (await requestLink(db, "a@x.co"))!))!;
    other = (await consumeLink(db, (await requestLink(db, "b@x.co"))!))!;
    stallId = (await createStall(db, owner, { name: "Rosa", area: "UST" }))!.id;
    dishId = (await addDish(db, owner, stallId, { name: "Adobo", icon: "bowl", price: 70 }))!.id;
  });

  it("recognises photos by their bytes, not by what the sender claims", () => {
    expect(sniffImage(jpeg())).toBe("image/jpeg");
    expect(sniffImage(Uint8Array.from([0x89, 0x50, 0x4e, 0x47, ...Array(20).fill(0)]))).toBe("image/png");
    expect(sniffImage(new TextEncoder().encode("<svg onload=alert(1)></svg>"))).toBeNull();
    expect(sniffImage(new TextEncoder().encode("RIFFxxxxWEBPVP8 aaaa"))).toBe("image/webp");
  });

  it("the owner saves, replaces and removes a photo, and it shows on the board and in the owner view", async () => {
    await setPublished(db, owner, dishId, true);
    await setPaborito(db, owner, dishId, true);
    expect((await ownerSummary(db, owner, stallId, NOW))![0].imageV).toBeNull();
    expect(await saveImage(db, owner, dishId, jpeg(), NOW)).toBe("ok");
    const first = (await ownerSummary(db, owner, stallId, NOW))![0].imageV;
    expect(first).toBe(NOW.getTime());
    expect((await publicBoard(db, {}, NOW))[0].imageV).toBe(NOW.getTime());
    expect((await getImage(db, dishId))!.mime).toBe("image/jpeg");
    expect(await saveImage(db, owner, dishId, jpeg(80), new Date(NOW.getTime() + 5_000))).toBe("ok");
    expect([...(await imageVersions(db, [dishId])).values()]).toEqual([NOW.getTime() + 5_000]);
    expect(await removeImage(db, owner, dishId)).toBe(true);
    expect(await getImage(db, dishId)).toBeNull();
  });

  it("refuses another owner, non-images and oversized files", async () => {
    expect(await saveImage(db, other, dishId, jpeg())).toBe("not-found");
    expect(await removeImage(db, other, dishId)).toBe(false);
    expect(await saveImage(db, owner, dishId, new TextEncoder().encode("not a photo at all, just text"))).toBe("not-an-image");
    expect(await saveImage(db, owner, dishId, jpeg(MAX_PHOTO_BYTES))).toBe("too-big");
    expect(await getImage(db, dishId)).toBeNull();
  });
});

describe("owner notifications", () => {
  let db: Db, owner: string, other: string, stallId: string, dishId: string, code: string;
  const rate = async (device: string, score: number, at: Date) =>
    submitRating(db, { stallCode: code, scanToken: signScan(code, device, at.getTime()), deviceToken: device, dishId, score, idempotencyKey: `${device}-${at.getTime()}` }, at);

  beforeEach(async () => {
    db = await testDb();
    owner = (await consumeLink(db, (await requestLink(db, "a@x.co"))!))!;
    other = (await consumeLink(db, (await requestLink(db, "b@x.co"))!))!;
    const stall = (await createStall(db, owner, { name: "Rosa", area: "UST" }))!;
    stallId = stall.id;
    code = stall.code;
    dishId = (await addDish(db, owner, stallId, { name: "Adobo", icon: "bowl", price: 70 }))!.id;
  });

  it("tells the owner a dish was rated, newest first, and counts what is unread", async () => {
    expect(await inbox(db, owner, NOW)).toEqual({ unread: 0, items: [] });
    await rate("dev-one-aaaa", 5, new Date(NOW.getTime() - 60_000));
    await rate("dev-two-bbbb", 1, NOW);
    const { unread, items } = await inbox(db, owner, NOW);
    expect(unread).toBe(2);
    expect(items.map((i) => [i.dish, i.score])).toEqual([["Adobo", 1], ["Adobo", 5]]);
    expect(Object.keys(items[0]).sort()).toEqual(["at", "dish", "id", "score", "stall"]); // nothing that identifies the rater
  });

  it("opening the inbox clears the unread count until the next rating", async () => {
    await rate("dev-one-aaaa", 5, NOW);
    await markSeen(db, owner, new Date(NOW.getTime() + 1_000));
    expect((await inbox(db, owner, NOW)).unread).toBe(0);
    await rate("dev-two-bbbb", 3, new Date(NOW.getTime() + 5_000));
    expect((await inbox(db, owner, new Date(NOW.getTime() + 6_000))).unread).toBe(1);
  });

  it("is private to the owner of the dish and ignores ratings older than two weeks", async () => {
    await rate("dev-one-aaaa", 5, NOW);
    expect((await inbox(db, other, NOW)).items).toEqual([]);
    expect((await inbox(db, owner, new Date(NOW.getTime() + 15 * 86_400_000))).items).toEqual([]);
  });
});
