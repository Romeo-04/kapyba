import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { dishes, owners, ratings, stalls } from "@/src/db/schema";
import { commentProblem } from "@/src/domain/comment";
import { infoProblem, MAX_ABOUT, MAX_HOURS } from "@/src/domain/stallinfo";
import { communityFeed, ownerSummary, publicBoard } from "@/src/services/aggregates";
import { leftoverPesos } from "@/src/services/logs";
import { createStall } from "@/src/services/stalls";
import { DEMO_STALLS, removeDemo, seedDemo } from "@/src/demo/seed";
import credits from "@/src/demo/photos/credits.json";
import { testDb } from "./helpers/testdb";

const dir = join(__dirname, "../../src/demo/photos");
const photo = (slug: string) => new Uint8Array(readFileSync(join(dir, `${slug}.jpg`)));
const NOW = new Date("2026-10-31T06:00:00Z");

describe("demo data", () => {
  it("has a photo and a credit for every dish, and stall text that passes the stall rules", () => {
    const slugs = new Set(DEMO_STALLS.flatMap((s) => s.dishes.map((d) => d.photo)));
    for (const slug of slugs) {
      expect(existsSync(join(dir, `${slug}.jpg`)), slug).toBe(true);
      const c = credits.find((x) => x.slug === slug);
      expect(c?.author && c.license && c.source.startsWith("https://commons.wikimedia.org/"), slug).toBeTruthy();
    }
    for (const s of DEMO_STALLS) expect(s.name).toMatch(/\(sample\)$/);
  });

  it("fills the board, the community feed and one owner's analytics, all inside the app's rules", async () => {
    const db = await testDb();
    const res = await seedDemo(db, { ownerEmail: "Me@Example.com", photo, now: NOW });
    expect(res.photos).toBe(res.dishes);

    const board = await publicBoard(db, {}, NOW);
    expect(board.filter((i) => i.kind === "scored").length).toBeGreaterThan(15);
    expect(board.some((i) => i.name === "Pinakbet" && i.stallName.startsWith("Kusina ni Kapy"))).toBe(false); // unpublished stays private

    const feed = await communityFeed(db, NOW);
    expect(feed.length).toBeGreaterThan(10);
    for (const p of feed) expect(p.score).toBeGreaterThanOrEqual(4);

    for (const r of await db.select({ comment: ratings.comment }).from(ratings)) if (r.comment) expect(commentProblem(r.comment)).toBeNull();
    for (const s of await db.select().from(stalls)) {
      expect(infoProblem(s.about!, MAX_ABOUT)).toBeNull();
      expect(infoProblem(s.hours!, MAX_HOURS)).toBeNull();
    }

    const [me] = await db.select().from(owners).where(eq(owners.email, "me@example.com"));
    const [mine] = await db.select().from(stalls).where(eq(stalls.ownerId, me.id));
    const summary = (await ownerSummary(db, me.id, mine.id, NOW))!;
    const adobo = summary.find((d) => d.name === "Chicken adobo")!;
    expect(adobo.gate.state).toBe("public");
    expect(adobo.kumpara?.stalls).toBe(3); // three other UST stalls sell adobo
    expect(summary.find((d) => d.name === "Sinigang na baboy")!.private.tagShares.salt).toBeGreaterThan(0);
    expect((await leftoverPesos(db, me.id, mine.id, 7, NOW))!.length).toBeGreaterThanOrEqual(5);
  });

  it("re-seeds without duplicates and removes only demo rows", async () => {
    const db = await testDb();
    const [real] = await db.insert(owners).values({ email: "real@example.com" }).returning();
    const stall = (await createStall(db, real.id, { name: "Totoong Karinderya", area: "UST" }))!;
    await db.insert(dishes).values({ stallId: stall.id, name: "Adobo", icon: "meat", price: 80 });

    await seedDemo(db, { ownerEmail: "real@example.com", photo, now: NOW });
    await seedDemo(db, { ownerEmail: "real@example.com", photo, now: NOW });
    expect((await db.select().from(stalls)).length).toBe(DEMO_STALLS.length + 1);

    await removeDemo(db);
    const left = await db.select().from(stalls);
    expect(left.map((s) => s.name)).toEqual(["Totoong Karinderya"]);
    expect((await db.select().from(owners)).map((o) => o.email)).toEqual(["real@example.com"]);
    expect((await db.select().from(dishes)).length).toBe(1);
  });
});
