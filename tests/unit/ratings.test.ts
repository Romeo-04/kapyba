import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { Db } from "@/src/db";
import { signScan, verifyScan } from "@/src/auth/qr";
import { consumeLink, requestLink } from "@/src/services/auth";
import { MAX_RATINGS_PER_DEVICE_PER_DAY, manilaDay, stallForScan, submitRating } from "@/src/services/ratings";
import { addDish, createStall } from "@/src/services/stalls";
import { testDb } from "./helpers/testdb";

beforeAll(() => {
  process.env.AUTH_SECRET = "test-secret-at-least-16-chars";
  process.env.QR_SIGNING_SECRET = "qr-secret-at-least-16-chars";
});

const NOW = new Date("2026-10-22T04:00:00Z"); // noon in Manila

describe("manilaDay", () => {
  it("uses the Philippine calendar day", () => {
    expect(manilaDay(new Date("2026-10-22T15:59:00Z"))).toBe("2026-10-22");
    expect(manilaDay(new Date("2026-10-22T16:00:00Z"))).toBe("2026-10-23");
  });
});

describe("scan token", () => {
  it("is bound to the stall, the device and the expiry", () => {
    const t = signScan("stall1", "dev1", 1_000);
    expect(verifyScan(t, "stall1", "dev1", 2_000)).toBe(true);
    expect(verifyScan(t, "stall2", "dev1", 2_000)).toBe(false);
    expect(verifyScan(t, "stall1", "dev2", 2_000)).toBe(false);
    expect(verifyScan(t, "stall1", "dev1", 1_000 + 13 * 3_600_000)).toBe(false);
    expect(verifyScan("junk", "stall1", "dev1")).toBe(false);
  });
});

describe("submitRating", () => {
  let db: Db, code: string, dish: string, other: string;
  const input = (o: Partial<Parameters<typeof submitRating>[1]> = {}) => {
    const deviceToken = o.deviceToken ?? "device-a";
    return {
      stallCode: code, deviceToken, dishId: dish, score: 4, tags: [], idempotencyKey: "key-" + Math.random(),
      scanToken: signScan(o.stallCode ?? code, deviceToken, NOW.getTime()), ...o,
    };
  };

  beforeEach(async () => {
    db = await testDb();
    const owner = (await consumeLink(db, (await requestLink(db, "a@x.co"))!))!;
    const stall = (await createStall(db, owner, { name: "Rosa", area: "UST" }))!;
    code = stall.code;
    dish = (await addDish(db, owner, stall.id, { name: "Adobo", icon: "adobo", price: 70 }))!.id;
    const s2 = (await createStall(db, owner, { name: "Other", area: "UST" }))!;
    other = (await addDish(db, owner, s2.id, { name: "Tinola", icon: "tinola", price: 60 }))!.id;
  });

  it("saves a rating and lists the stall dishes for a scan", async () => {
    expect(await submitRating(db, input(), NOW)).toBe("ok");
    const scan = await stallForScan(db, code);
    expect(scan!.dishes.map((d) => d.name)).toEqual(["Adobo"]);
    expect(await stallForScan(db, "nope")).toBeNull();
  });
  it("accepts only one rating per dish per device per day", async () => {
    expect(await submitRating(db, input(), NOW)).toBe("ok");
    expect(await submitRating(db, input(), NOW)).toBe("already");
    expect(await submitRating(db, input({ deviceToken: "device-b" }), NOW)).toBe("ok");
    const next = new Date(NOW.getTime() + 24 * 3_600_000);
    const t = signScan(code, "device-a", next.getTime());
    expect(await submitRating(db, input({ scanToken: t }), next)).toBe("ok");
  });
  it("treats a replay of the same submission as success without a second row", async () => {
    const i = input({ idempotencyKey: "same-key-1" });
    expect(await submitRating(db, i, NOW)).toBe("ok");
    expect(await submitRating(db, i, NOW)).toBe("replay");
    expect(await submitRating(db, input({ idempotencyKey: "other-key-1" }), NOW)).toBe("already");
  });
  it("refuses a missing, wrong-stall or expired scan token", async () => {
    expect(await submitRating(db, input({ scanToken: "" }), NOW)).toBe("forbidden");
    expect(await submitRating(db, input({ scanToken: signScan("other-code", "device-a", NOW.getTime()) }), NOW)).toBe("forbidden");
    const late = new Date(NOW.getTime() + 13 * 3_600_000);
    expect(await submitRating(db, input(), late)).toBe("forbidden");
  });
  it("refuses a dish from a different stall", async () => {
    expect(await submitRating(db, input({ dishId: other }), NOW)).toBe("invalid");
  });
  it("validates score, tags and key", async () => {
    expect(await submitRating(db, input({ score: 0 }), NOW)).toBe("invalid");
    expect(await submitRating(db, input({ score: 6 }), NOW)).toBe("invalid");
    expect(await submitRating(db, input({ score: 3.5 }), NOW)).toBe("invalid");
    expect(await submitRating(db, input({ tags: ["spicy"] }), NOW)).toBe("invalid");
    expect(await submitRating(db, input({ tags: "salt" }), NOW)).toBe("invalid");
    expect(await submitRating(db, input({ idempotencyKey: "x" }), NOW)).toBe("invalid");
    expect(await submitRating(db, input({ tags: ["salt", "coin"] }), NOW)).toBe("ok");
  });
  it("limits one device to a day's worth of ratings", async () => {
    expect(MAX_RATINGS_PER_DEVICE_PER_DAY).toBe(30);
    const owner = (await consumeLink(db, (await requestLink(db, "b@x.co"))!))!;
    const stall = (await createStall(db, owner, { name: "Big", area: "UST" }))!;
    let last = "ok";
    for (let n = 0; n < 31; n++) {
      const d = (await addDish(db, owner, stall.id, { name: "D" + n, icon: "x", price: 10 }))!.id;
      last = await submitRating(db, {
        stallCode: stall.code, deviceToken: "heavy", dishId: d, score: 4, idempotencyKey: "heavy-key-" + n,
        scanToken: signScan(stall.code, "heavy", NOW.getTime()),
      }, NOW);
    }
    expect(last).toBe("limit");
  });
});
