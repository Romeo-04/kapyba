import { and, eq, gte, lt, notExists, sql } from "drizzle-orm";
import type { Db } from "@/src/db";
import { alokClaims, devices, loginTokens, rateHits, ratings } from "@/src/db/schema";

const DAY = 86_400_000;
/** docs/PRIVACY.md: ratings and logs up to 12 months, device tokens after 12 months without use. */
export const RETENTION_DAYS = 365;

/** Deletes what the privacy page promises to delete. Safe to run daily and more than once. */
export async function purgeExpired(db: Db, now = new Date()) {
  const cutoff = new Date(now.getTime() - RETENTION_DAYS * DAY);

  const oldRatings = await db.delete(ratings).where(lt(ratings.createdAt, cutoff)).returning({ id: ratings.id });
  // A device is unused when it was first seen before the cutoff and nothing recent hangs off it.
  const idleDevices = await db.delete(devices).where(and(
    lt(devices.firstSeenAt, cutoff),
    notExists(db.select({ one: sql`1` }).from(ratings).where(eq(ratings.deviceId, devices.id))),
    notExists(db.select({ one: sql`1` }).from(alokClaims).where(and(eq(alokClaims.deviceId, devices.id), gte(alokClaims.createdAt, cutoff)))),
  )).returning({ id: devices.id });
  // Sign-in links and rate counters hold emails and addresses; keep them no longer than they are useful.
  const links = await db.delete(loginTokens).where(lt(loginTokens.expiresAt, new Date(now.getTime() - DAY))).returning({ id: loginTokens.id });
  const hits = await db.delete(rateHits).where(lt(rateHits.at, new Date(now.getTime() - DAY))).returning({ id: rateHits.id });

  return { ratings: oldRatings.length, devices: idleDevices.length, loginTokens: links.length, rateHits: hits.length };
}
