import { and, desc, eq, gte, inArray, lte } from "drizzle-orm";
import type { Db } from "@/src/db";
import { dishes, events, owners, ratings, reports, stalls } from "@/src/db/schema";
import { ownedStall } from "./stalls";

// Ulat limits are our calls (IDEA.md leaves the numbers open); tune them in the pilot.
export const MAX_WINDOW_HOURS = 3; // a burst, not a month of ratings
export const MAX_AGE_DAYS = 14;
export const MAX_REPORTS_PER_WEEK = 3; // per stall, rolling 7 days
const HOUR = 3_600_000;
const DAY = 24 * HOUR;

export type FileResult =
  | { report: { id: string; flagged: number } }
  | { error: "invalid" | "not-found" | "window" | "limit" | "already-open" | "empty" };

/**
 * The owner reports a burst of ratings on one dish. Ratings in the window that are still `ok` become
 * `flagged`: the owner still sees them, the public score does not count them while the report is open.
 */
export async function fileReport(
  db: Db, ownerId: string,
  input: { dishId: unknown; windowStart: unknown; windowEnd: unknown; reason?: unknown },
  now = new Date(),
): Promise<FileResult> {
  if (typeof input.dishId !== "string" || typeof input.windowStart !== "string" || typeof input.windowEnd !== "string") return { error: "invalid" };
  const start = new Date(input.windowStart), end = new Date(input.windowEnd);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return { error: "invalid" };
  if (end <= start || end > now || end.getTime() - start.getTime() > MAX_WINDOW_HOURS * HOUR || now.getTime() - start.getTime() > MAX_AGE_DAYS * DAY) return { error: "window" };
  const reason = typeof input.reason === "string" ? input.reason.trim().slice(0, 300) : null;

  const [dish] = await db.select().from(dishes).where(eq(dishes.id, input.dishId));
  if (!dish || !(await ownedStall(db, ownerId, dish.stallId))) return { error: "not-found" };

  const recent = await db.select({ id: reports.id }).from(reports)
    .where(and(eq(reports.stallId, dish.stallId), gte(reports.createdAt, new Date(now.getTime() - 7 * DAY))));
  if (recent.length >= MAX_REPORTS_PER_WEEK) return { error: "limit" };
  const open = await db.select({ id: reports.id }).from(reports).where(and(eq(reports.dishId, dish.id), eq(reports.status, "open")));
  if (open.length > 0) return { error: "already-open" };

  const hit = await db.select({ id: ratings.id }).from(ratings)
    .where(and(eq(ratings.dishId, dish.id), eq(ratings.status, "ok"), gte(ratings.createdAt, start), lte(ratings.createdAt, end)));
  if (hit.length === 0) return { error: "empty" };

  const [row] = await db.insert(reports).values({ stallId: dish.stallId, dishId: dish.id, windowStart: start, windowEnd: end, reason }).returning();
  await db.update(ratings).set({ status: "flagged" }).where(inArray(ratings.id, hit.map((r) => r.id)));
  await db.insert(events).values({ stallId: dish.stallId, actor: ownerId, kind: "report_filed", detail: `${row.id} flagged ${hit.length}` });
  return { report: { id: row.id, flagged: hit.length } };
}

/** Reviewers are the owners whose email is in REVIEWER_EMAILS (comma separated); the team during the pilot. */
export async function isReviewer(db: Db, ownerId: string): Promise<boolean> {
  const list = (process.env.REVIEWER_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  if (list.length === 0) return false;
  const [o] = await db.select({ email: owners.email }).from(owners).where(eq(owners.id, ownerId));
  return !!o && list.includes(o.email.toLowerCase());
}

/** Open reports for the reviewer, oldest first so the 24 hour promise is easy to keep. */
export async function openReports(db: Db, reviewerId: string) {
  if (!(await isReviewer(db, reviewerId))) return null;
  const rows = await db
    .select({ id: reports.id, dishName: dishes.name, stallName: stalls.name, windowStart: reports.windowStart, windowEnd: reports.windowEnd, reason: reports.reason, createdAt: reports.createdAt })
    .from(reports)
    .innerJoin(dishes, eq(dishes.id, reports.dishId))
    .innerJoin(stalls, eq(stalls.id, reports.stallId))
    .where(eq(reports.status, "open"))
    .orderBy(reports.createdAt);
  return rows;
}

/** Upheld: the flagged ratings are removed for good. Rejected: they count again. Either way the decision is logged. */
export async function reviewReport(db: Db, reviewerId: string, reportId: string, decision: unknown, note?: unknown): Promise<"ok" | "forbidden" | "not-found" | "invalid"> {
  if (!(await isReviewer(db, reviewerId))) return "forbidden";
  if (decision !== "upheld" && decision !== "rejected") return "invalid";
  if (!/^[0-9a-f-]{36}$/i.test(reportId)) return "not-found";
  const [r] = await db.select().from(reports).where(and(eq(reports.id, reportId), eq(reports.status, "open")));
  if (!r) return "not-found";
  const text = typeof note === "string" ? note.trim().slice(0, 300) : null;

  const claimed = await db.update(reports).set({ status: decision, reviewerNote: text }).where(and(eq(reports.id, reportId), eq(reports.status, "open"))).returning({ id: reports.id });
  if (claimed.length === 0) return "not-found"; // another reviewer got there first
  await db.update(ratings).set({ status: decision === "upheld" ? "removed" : "ok" })
    .where(and(eq(ratings.dishId, r.dishId), eq(ratings.status, "flagged"), gte(ratings.createdAt, r.windowStart), lte(ratings.createdAt, r.windowEnd)));
  await db.insert(events).values({ stallId: r.stallId, actor: reviewerId, kind: `report_${decision}`, detail: `${reportId}${text ? ` ${text}` : ""}` });
  return "ok";
}

export async function listReports(db: Db, ownerId: string, stallId: string) {
  if (!(await ownedStall(db, ownerId, stallId))) return null;
  return db.select({ id: reports.id, dishId: reports.dishId, status: reports.status, createdAt: reports.createdAt, reviewerNote: reports.reviewerNote })
    .from(reports).where(eq(reports.stallId, stallId)).orderBy(desc(reports.createdAt));
}
