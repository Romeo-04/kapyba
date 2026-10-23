import { and, desc, eq, gt, ne } from "drizzle-orm";
import type { Db } from "@/src/db";
import { dishes, owners, ratings, stalls } from "@/src/db/schema";

export const INBOX_DAYS = 14;
export const INBOX_LIMIT = 30;

export type Notice = { id: string; dish: string; stall: string; score: number; at: string };

/**
 * The owner's inbox: the latest ratings on their dishes, newest first. A notice says which dish was rated and
 * how it went. It never says who rated: devices are anonymous. Ratings the reviewer removed are left out.
 * Unread = newer than the last time the owner opened the inbox.
 */
export async function inbox(db: Db, ownerId: string, now = new Date()): Promise<{ unread: number; items: Notice[] }> {
  const since = new Date(now.getTime() - INBOX_DAYS * 86_400_000);
  const rows = await db
    .select({ id: ratings.id, dish: dishes.name, stall: stalls.name, score: ratings.score, at: ratings.createdAt })
    .from(ratings)
    .innerJoin(dishes, eq(dishes.id, ratings.dishId))
    .innerJoin(stalls, eq(stalls.id, dishes.stallId))
    .where(and(eq(stalls.ownerId, ownerId), ne(ratings.status, "removed"), gt(ratings.createdAt, since)))
    .orderBy(desc(ratings.createdAt))
    .limit(INBOX_LIMIT);
  const [o] = await db.select({ seen: owners.notifiedAt }).from(owners).where(eq(owners.id, ownerId));
  const seen = o?.seen?.getTime() ?? 0;
  const items = rows.map((r) => ({ id: r.id, dish: r.dish, stall: r.stall, score: r.score, at: r.at.toISOString() }));
  return { unread: items.filter((i) => new Date(i.at).getTime() > seen).length, items };
}

export async function markSeen(db: Db, ownerId: string, now = new Date()): Promise<void> {
  await db.update(owners).set({ notifiedAt: now }).where(eq(owners.id, ownerId));
}
