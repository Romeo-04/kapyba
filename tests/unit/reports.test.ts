import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import type { Db } from "@/src/db";
import { devices, events, ratings } from "@/src/db/schema";
import { ownerSummary } from "@/src/services/aggregates";
import { consumeLink, requestLink } from "@/src/services/auth";
import { fileReport, listReports, openReports, reviewReport } from "@/src/services/reports";
import { addDish, createStall, setPublished } from "@/src/services/stalls";
import { testDb } from "./helpers/testdb";

const NOW = new Date("2026-10-22T04:00:00Z");
const at = (minutesAgo: number) => new Date(NOW.getTime() - minutesAgo * 60_000);

describe("ulat", () => {
  let db: Db, owner: string, other: string, reviewer: string, stallId: string, dishId: string;

  const seed = async (n: number, minutesAgo: number, tag: string) => {
    for (let i = 0; i < n; i++) {
      const [d] = await db.insert(devices).values({ tokenHash: `${tag}-${i}` }).returning();
      await db.insert(ratings).values({ dishId, deviceId: d.id, score: 1, day: "2026-10-22", idempotencyKey: `${tag}-${i}`, createdAt: at(minutesAgo) });
    }
  };
  const file = (over: Record<string, unknown> = {}, who = owner) =>
    fileReport(db, who, { dishId, windowStart: at(60).toISOString(), windowEnd: at(30).toISOString(), reason: "same phone farm", ...over }, NOW);
  const statuses = async () => (await db.select({ s: ratings.status }).from(ratings)).map((r) => r.s);
  const publicState = async () => (await ownerSummary(db, owner, stallId, NOW))![0].gate.state;

  beforeEach(async () => {
    process.env.REVIEWER_EMAILS = "team@kapyba.test, Other@Team.test";
    db = await testDb();
    owner = (await consumeLink(db, (await requestLink(db, "a@x.co"))!))!;
    other = (await consumeLink(db, (await requestLink(db, "b@x.co"))!))!;
    reviewer = (await consumeLink(db, (await requestLink(db, "team@kapyba.test"))!))!;
    stallId = (await createStall(db, owner, { name: "Rosa", area: "UST" }))!.id;
    dishId = (await addDish(db, owner, stallId, { name: "Adobo", icon: "adobo", price: 70 }))!.id;
    await setPublished(db, owner, dishId, true);
  });

  it("flags only ratings inside the window and takes them out of the public gate", async () => {
    await seed(10, 45, "burst");
    await seed(2, 300, "earlier");
    expect(await publicState()).toBe("public");
    const out = await file();
    expect("report" in out && out.report.flagged).toBe(10);
    expect((await statuses()).filter((s) => s === "flagged")).toHaveLength(10);
    expect(await publicState()).toBe("kulang");
    // The owner still sees them.
    expect((await ownerSummary(db, owner, stallId, NOW))![0].private.count).toBe(12);
  });

  it("restores the ratings when the review rejects the report", async () => {
    await seed(10, 45, "burst");
    const id = ((await file()) as { report: { id: string } }).report.id;
    expect(await reviewReport(db, reviewer, id, "rejected", "looks genuine")).toBe("ok");
    expect(new Set(await statuses())).toEqual(new Set(["ok"]));
    expect(await publicState()).toBe("public");
  });

  it("removes the ratings for good when the review upholds the report", async () => {
    await seed(10, 45, "burst");
    const id = ((await file()) as { report: { id: string } }).report.id;
    expect(await reviewReport(db, reviewer, id, "upheld")).toBe("ok");
    expect(new Set(await statuses())).toEqual(new Set(["removed"]));
    expect((await ownerSummary(db, owner, stallId, NOW))![0].private.count).toBe(0);
  });

  it("logs the filing and the decision, and a report can only be decided once", async () => {
    await seed(3, 45, "burst");
    const id = ((await file()) as { report: { id: string } }).report.id;
    await reviewReport(db, reviewer, id, "upheld", "same device pattern");
    expect(await reviewReport(db, reviewer, id, "rejected")).toBe("not-found");
    const log = await db.select().from(events).where(eq(events.stallId, stallId));
    expect(log.map((e) => e.kind)).toEqual(expect.arrayContaining(["report_filed", "report_upheld"]));
    expect(log.find((e) => e.kind === "report_upheld")).toMatchObject({ actor: reviewer });
    expect((await listReports(db, owner, stallId))![0]).toMatchObject({ status: "upheld", reviewerNote: "same device pattern" });
  });

  it("only reviewers can see or decide reports", async () => {
    await seed(3, 45, "burst");
    const id = ((await file()) as { report: { id: string } }).report.id;
    expect(await openReports(db, owner)).toBeNull();
    expect(await reviewReport(db, owner, id, "upheld")).toBe("forbidden");
    expect(await openReports(db, reviewer)).toHaveLength(1);
    expect(await reviewReport(db, reviewer, id, "maybe")).toBe("invalid");
  });

  it("rejects bad windows, empty windows and other owners", async () => {
    await seed(3, 45, "burst");
    expect(await file({ windowStart: at(300).toISOString(), windowEnd: at(30).toISOString() })).toEqual({ error: "window" }); // over 3 hours
    expect(await file({ windowStart: at(30).toISOString(), windowEnd: at(60).toISOString() })).toEqual({ error: "window" }); // backwards
    expect(await file({ windowEnd: new Date(NOW.getTime() + 60_000).toISOString() })).toEqual({ error: "window" }); // future
    expect(await file({ windowStart: "nope" })).toEqual({ error: "invalid" });
    expect(await file({ windowStart: at(200).toISOString(), windowEnd: at(190).toISOString() })).toEqual({ error: "empty" });
    expect(await file({}, other)).toEqual({ error: "not-found" });
  });

  it("allows one open report per dish and three per stall per week", async () => {
    await seed(3, 45, "a");
    const first = ((await file()) as { report: { id: string } }).report.id;
    expect(await file()).toEqual({ error: "already-open" });
    await reviewReport(db, reviewer, first, "rejected");

    for (let i = 0; i < 2; i++) {
      await seed(2, 45, `again-${i}`);
      const r = (await file()) as { report: { id: string } };
      await reviewReport(db, reviewer, r.report.id, "rejected");
    }
    await seed(2, 45, "fourth");
    expect(await file()).toEqual({ error: "limit" });
  });
});
