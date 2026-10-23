import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { Db } from "@/src/db";
import { signScan } from "@/src/auth/qr";
import { commentProblem } from "@/src/domain/comment";
import { recsFor } from "@/src/domain/recommend";
import { packTags, tagShares, unpackTags } from "@/src/domain/scoring";
import { ownerSummary, publicBoard, testimonies } from "@/src/services/aggregates";
import { claimAlok, myClaims, postAlok } from "@/src/services/alok";
import { consumeLink, requestLink } from "@/src/services/auth";
import { attachComment, submitRating } from "@/src/services/ratings";
import { addDish, createStall, setPublished, setSale, updateDish } from "@/src/services/stalls";
import { testDb } from "./helpers/testdb";

beforeAll(() => {
  process.env.AUTH_SECRET = "test-secret-at-least-16-chars";
  process.env.QR_SIGNING_SECRET = "qr-secret-at-least-16-chars";
});

const NOW = new Date("2026-10-22T04:00:00Z");

describe("problem tags and comments", () => {
  it("packs the four new problems alongside the old ones", () => {
    const all = ["salt", "plate", "flame", "coin", "leaf", "alert", "chili", "clock"] as const;
    expect(unpackTags(packTags([...all]))).toEqual([...all]);
    expect(tagShares([{ tags: packTags(["chili"]) }, { tags: 0 }]).chili).toBe(0.5);
  });
  it("turns each new complaint into an action for the owner", () => {
    const view = (bad: "leaf" | "alert" | "chili" | "clock") => ({ score: 3, count: 20, baseServings: 5, bad, tagShares: { salt: 0, plate: 0, flame: 0, coin: 0, leaf: 0, alert: 0, chili: 0, clock: 0 } });
    expect(recsFor(view("leaf"))[0]).toMatchObject({ icon: "leaf", word: "Fresher" });
    expect(recsFor(view("chili"))[0]).toMatchObject({ icon: "chili", dir: "down" });
  });
  it("keeps links, handles and phone numbers out of comments", () => {
    expect(commentProblem("Ang sarap ng sabaw")).toBeNull();
    expect(commentProblem("visit www.example.com")).not.toBeNull();
    expect(commentProblem("text me 0917 123 4567")).not.toBeNull();
    expect(commentProblem("x".repeat(141))).not.toBeNull();
  });
});

describe("testimonies, deals and the board", () => {
  let db: Db, owner: string, stallId: string, code: string, adobo: string, tinola: string;
  const rate = (dishId: string, device: string, score: number, comment?: string, at = NOW, key = `${device}-${dishId}-${score}`) =>
    submitRating(db, { stallCode: code, deviceToken: device, dishId, score, comment, idempotencyKey: key, scanToken: signScan(code, device, at.getTime()) }, at);

  beforeEach(async () => {
    db = await testDb();
    owner = (await consumeLink(db, (await requestLink(db, "a@x.co"))!))!;
    const s = (await createStall(db, owner, { name: "Rosa", area: "UST" }))!;
    stallId = s.id; code = s.code;
    adobo = (await addDish(db, owner, stallId, { name: "Adobo", icon: "bowl", price: 70, main: "chicken", ingredients: "Chicken, soy sauce, vinegar", allergens: ["soy"] }))!.id;
    tinola = (await addDish(db, owner, stallId, { name: "Tinola", icon: "bowl", price: 65 }))!.id;
  });

  it("validates the main ingredient, ingredients and allergens, and lets the owner clear them", async () => {
    expect(await addDish(db, owner, stallId, { name: "X", icon: "bowl", price: 10, main: "unicorn" })).toBeNull();
    expect(await addDish(db, owner, stallId, { name: "X", icon: "bowl", price: 10, allergens: ["gold"] })).toBeNull();
    expect(await updateDish(db, owner, adobo, { allergens: ["egg", "peanut", "egg"], main: "" })).toBe(true);
    const d = (await ownerSummary(db, owner, stallId, NOW))!.find((x) => x.id === adobo)!;
    expect(d.allergens).toEqual(["egg", "peanut"]);
    expect(d.main).toBeNull();
    expect(d.ingredients).toBe("Chicken, soy sauce, vinegar");
  });

  it("stores a comment with a rating and refuses one with a link", async () => {
    expect(await rate(adobo, "dev-aaaa-1", 5, "Sarap ng sabaw!")).toBe("ok");
    expect(await rate(adobo, "dev-aaaa-2", 5, "see http://spam.example")).toBe("invalid");
  });

  it("adds a comment to your own fresh rating, once", async () => {
    await rate(adobo, "dev-aaaa-1", 5, undefined, NOW, "key-one-aaaa");
    expect(await attachComment(db, "dev-bbbb-2", "key-one-aaaa", "hi", NOW)).toBe("gone"); // not this phone's rating
    expect(await attachComment(db, "dev-aaaa-1", "key-one-aaaa", "Masarap!", NOW)).toBe("ok");
    expect(await attachComment(db, "dev-aaaa-1", "key-one-aaaa", "again", NOW)).toBe("gone");
    await rate(tinola, "dev-aaaa-1", 5, undefined, NOW, "key-two-aaaa");
    expect(await attachComment(db, "dev-aaaa-1", "key-two-aaaa", "late", new Date(NOW.getTime() + 31 * 60_000))).toBe("gone");
    expect(await attachComment(db, "dev-aaaa-1", "key-two-aaaa", "call 09171234567", NOW)).toBe("invalid");
  });

  it("shows only happy, clean comments, and only once the dish passes the public gate", async () => {
    await setPublished(db, owner, adobo, true);
    await rate(adobo, "dev-happy-0", 5, "Best adobo");
    expect(await testimonies(db, adobo, NOW)).toEqual([]); // 1 rating is not enough
    for (let i = 1; i < 9; i++) await rate(adobo, `dev-happy-${i}`, 5);
    await rate(adobo, "dev-sad-xx", 2, "Matabang");
    await rate(adobo, "dev-sad-yy", 4, "Ayos naman");
    const t = await testimonies(db, adobo, NOW);
    expect(t.map((x) => x.text).sort()).toEqual(["Ayos naman", "Best adobo"]);
    expect(Object.keys(t[0]).sort()).toEqual(["at", "score", "text"]); // nothing identifies the writer
    const own = (await ownerSummary(db, owner, stallId, NOW))!.find((x) => x.id === adobo)!;
    expect(own.comments.map((c) => c.text)).toContain("Matabang"); // the owner sees the unhappy one too
  });

  it("an unpublished dish shows no testimonies", async () => {
    for (let i = 0; i < 10; i++) await rate(adobo, `dev-happy-${i}`, 5, "ok na ok");
    expect(await testimonies(db, adobo, NOW)).toEqual([]);
  });

  it("puts dishes with a deal first, and shows reserved deals per phone", async () => {
    await setPublished(db, owner, adobo, true);
    await setPublished(db, owner, tinola, true);
    for (let i = 0; i < 10; i++) { await rate(adobo, `dev-aaaa-${i}`, 5); await rate(tinola, `dev-bbbb-${i}`, 3); }
    expect((await publicBoard(db, {}, NOW)).map((i) => i.name)).toEqual(["Adobo", "Tinola"]);
    await setSale(db, owner, tinola, 50, NOW);
    expect((await publicBoard(db, {}, NOW)).map((i) => i.name)).toEqual(["Tinola", "Adobo"]);
    const board = await publicBoard(db, {}, NOW);
    expect(board.find((i) => i.name === "Adobo")).toMatchObject({ main: "chicken", allergens: ["soy"] });

    const deal = await postAlok(db, owner, stallId, { dishId: adobo, kind: "combo", limit: 2 }, NOW);
    const id = (deal as { alok: { id: string } }).alok.id;
    expect(await myClaims(db, "dev-zzzz-1", NOW)).toEqual([]);
    await claimAlok(db, "dev-zzzz-1", id, NOW);
    expect(await myClaims(db, "dev-zzzz-1", NOW)).toEqual([{ alokId: id, dishId: adobo }]);
    expect(await myClaims(db, "dev-yyyy-1", NOW)).toEqual([]);
    expect((await publicBoard(db, {}, NOW)).map((i) => i.name)).toEqual(["Adobo", "Tinola"]); // both have deals; score order within
  });
});
