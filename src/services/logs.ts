import { and, eq, gte, inArray } from "drizzle-orm";
import type { Db } from "@/src/db";
import { dailyLogs, dishes } from "@/src/db/schema";
import { suggest } from "@/src/domain/bukas";
import { ownerSummary } from "./aggregates";
import { manilaDay } from "./ratings";
import { ownedStall } from "./stalls";

export type LogEntry = { dishId: unknown; cooked: unknown; sold: unknown };

const count = (n: unknown) => typeof n === "number" && Number.isInteger(n) && n >= 0 && n <= 10_000;

/**
 * Saves one day's cooked and sold portions per dish (Natira: leftover = cooked - sold).
 * Logging the same dish and day again replaces the earlier entry. Returns null if the stall is not
 * this owner's, an entry is invalid, sold exceeds cooked, or a dish is not in this stall.
 */
export async function saveDay(db: Db, ownerId: string, stallId: string, entries: LogEntry[], now = new Date()) {
  if (!(await ownedStall(db, ownerId, stallId))) return null;
  if (!Array.isArray(entries) || entries.length === 0 || entries.length > 100) return null;
  const rows: { dishId: string; cooked: number; sold: number }[] = [];
  for (const e of entries) {
    if (typeof e?.dishId !== "string" || !count(e.cooked) || !count(e.sold) || (e.sold as number) > (e.cooked as number)) return null;
    rows.push({ dishId: e.dishId, cooked: e.cooked as number, sold: e.sold as number });
  }
  const mine = await db.select({ id: dishes.id }).from(dishes).where(and(eq(dishes.stallId, stallId), inArray(dishes.id, rows.map((r) => r.dishId))));
  if (mine.length !== new Set(rows.map((r) => r.dishId)).size) return null;

  const day = manilaDay(now);
  for (const r of rows) {
    const values = { stallId, dishId: r.dishId, day, cooked: r.cooked, sold: r.sold, leftover: r.cooked - r.sold };
    await db.insert(dailyLogs).values(values).onConflictDoUpdate({
      target: [dailyLogs.dishId, dailyLogs.day],
      set: { cooked: values.cooked, sold: values.sold, leftover: values.leftover },
    });
  }
  return { day };
}

/** Leftover pesos per day for the last `days` days (the pilot's headline number), oldest first. */
export async function leftoverPesos(db: Db, ownerId: string, stallId: string, days = 7, now = new Date()) {
  if (!(await ownedStall(db, ownerId, stallId))) return null;
  const since = manilaDay(new Date(now.getTime() - (days - 1) * 86_400_000));
  const rows = await db
    .select({ day: dailyLogs.day, leftover: dailyLogs.leftover, price: dishes.price, cooked: dailyLogs.cooked })
    .from(dailyLogs)
    .innerJoin(dishes, eq(dishes.id, dailyLogs.dishId))
    .where(and(eq(dailyLogs.stallId, stallId), gte(dailyLogs.day, since)));
  const byDay = new Map<string, { pesos: number; leftover: number; cooked: number }>();
  for (const r of rows) {
    const d = byDay.get(r.day) ?? { pesos: 0, leftover: 0, cooked: 0 };
    d.pesos += r.leftover * r.price;
    d.leftover += r.leftover;
    d.cooked += r.cooked;
    byDay.set(r.day, d);
  }
  return [...byDay.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([day, v]) => ({ day, ...v }));
}

/** Tomorrow's suggested servings per dish from the last 7 logged days and the private ratings. */
export async function bukasPlan(db: Db, ownerId: string, stallId: string, now = new Date(), factor = 1) {
  const summary = await ownerSummary(db, ownerId, stallId, now);
  if (!summary) return null;
  const since = manilaDay(new Date(now.getTime() - 6 * 86_400_000));
  const logs = await db.select().from(dailyLogs).where(and(eq(dailyLogs.stallId, stallId), gte(dailyLogs.day, since)));
  return summary.map((d) => {
    const mine = logs.filter((l) => l.dishId === d.id).sort((a, b) => a.day.localeCompare(b.day));
    return {
      dishId: d.id, name: d.name, icon: d.icon, price: d.price,
      plan: suggest({ baseServings: d.baseServings, logs: mine, score: d.private.score, count: d.private.count }, factor),
    };
  });
}
