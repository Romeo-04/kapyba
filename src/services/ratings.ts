import { and, count, eq, isNull } from "drizzle-orm";
import type { Db } from "@/src/db";
import { dishes, devices, ratings, stalls } from "@/src/db/schema";
import { deviceHash, verifyScan } from "@/src/auth/qr";
import { TAGS, type Tag } from "@/src/domain/scoring";

export const MAX_RATINGS_PER_DEVICE_PER_DAY = 30;

/** The calendar day in the Philippines (UTC+8), because "one rating per day" means the buyer's day. */
export const manilaDay = (now: Date) => new Date(now.getTime() + 8 * 3_600_000).toISOString().slice(0, 10);

export async function deviceFor(db: Db, deviceToken: string): Promise<string> {
  const tokenHash = deviceHash(deviceToken);
  await db.insert(devices).values({ tokenHash }).onConflictDoNothing();
  const [d] = await db.select({ id: devices.id }).from(devices).where(eq(devices.tokenHash, tokenHash));
  return d.id;
}

/** What a buyer sees after scanning: the stall and its current dishes (no scores here). */
export async function stallForScan(db: Db, code: string) {
  const [stall] = await db.select({ id: stalls.id, name: stalls.name, area: stalls.area }).from(stalls).where(eq(stalls.code, code));
  if (!stall) return null;
  const list = await db
    .select({ id: dishes.id, name: dishes.name, icon: dishes.icon, price: dishes.price })
    .from(dishes)
    .where(and(eq(dishes.stallId, stall.id), isNull(dishes.archivedAt)));
  return { stall, dishes: list };
}

export type RatingInput = {
  stallCode: string;
  scanToken: string;
  deviceToken: string;
  dishId: string;
  score: unknown;
  tags?: unknown;
  idempotencyKey: unknown;
};

export type RatingResult = "ok" | "replay" | "already" | "invalid" | "forbidden" | "limit";

export async function submitRating(db: Db, input: RatingInput, now = new Date()): Promise<RatingResult> {
  const { score, tags, idempotencyKey } = input;
  if (typeof score !== "number" || !Number.isInteger(score) || score < 1 || score > 5) return "invalid";
  if (typeof idempotencyKey !== "string" || idempotencyKey.length < 8 || idempotencyKey.length > 100) return "invalid";
  const tagList = tags === undefined ? [] : tags;
  if (!Array.isArray(tagList) || tagList.some((t) => typeof t !== "string" || !(t in TAGS))) return "invalid";
  const mask = (tagList as Tag[]).reduce((m, t) => m | TAGS[t], 0);

  if (!verifyScan(input.scanToken, input.stallCode, input.deviceToken, now.getTime())) return "forbidden";

  const [row] = await db
    .select({ id: dishes.id })
    .from(dishes)
    .innerJoin(stalls, eq(stalls.id, dishes.stallId))
    .where(and(eq(dishes.id, input.dishId), eq(stalls.code, input.stallCode), isNull(dishes.archivedAt)));
  if (!row) return "invalid";

  const deviceId = await deviceFor(db, input.deviceToken);
  const day = manilaDay(now);

  // A replay of the same submission (for example an offline retry) is a success, never a second count.
  const [prior] = await db
    .select({ deviceId: ratings.deviceId })
    .from(ratings)
    .where(eq(ratings.idempotencyKey, idempotencyKey));
  if (prior) return prior.deviceId === deviceId ? "replay" : "invalid";

  const [{ n }] = await db
    .select({ n: count() })
    .from(ratings)
    .where(and(eq(ratings.deviceId, deviceId), eq(ratings.day, day)));
  if (n >= MAX_RATINGS_PER_DEVICE_PER_DAY) return "limit";

  // The unique index on (dish, device, day) is the real guard; a conflict inserts nothing.
  const inserted = await db
    .insert(ratings)
    .values({ dishId: input.dishId, deviceId, score, tags: mask, day, idempotencyKey })
    .onConflictDoNothing()
    .returning({ id: ratings.id });
  return inserted.length === 1 ? "ok" : "already";
}
