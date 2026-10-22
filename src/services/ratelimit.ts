import { log } from "@/src/log";
import { and, count, eq, gt, lte } from "drizzle-orm";
import type { Db } from "@/src/db";
import { rateHits } from "@/src/db/schema";

/** One named limit: at most `limit` hits per key in a rolling window. All sizes are our assumptions. */
export type Limit = { name: string; limit: number; windowSec: number };

export const LIMITS = {
  authIp: { name: "auth-ip", limit: 10, windowSec: 3600 },
  authEmail: { name: "auth-email", limit: 5, windowSec: 3600 },
  ratingIp: { name: "rating-ip", limit: 120, windowSec: 3600 },
  claimIp: { name: "claim-ip", limit: 30, windowSec: 3600 },
} satisfies Record<string, Limit>;

/**
 * Counts a hit and returns true while the key is under its limit; a refused hit is not counted.
 * Two requests racing at the very edge can both pass; the limits are a brake, not an exact meter.
 */
export async function allow(db: Db, l: Limit, subject: string, now = new Date()): Promise<boolean> {
  const key = `${l.name}:${subject}`;
  const since = new Date(now.getTime() - l.windowSec * 1000);
  await db.delete(rateHits).where(and(eq(rateHits.key, key), lte(rateHits.at, since)));
  const [{ n }] = await db.select({ n: count() }).from(rateHits).where(and(eq(rateHits.key, key), gt(rateHits.at, since)));
  if (n >= l.limit) {
    log("warn", "rate-limited", { limit: l.name });
    return false;
  }
  await db.insert(rateHits).values({ key, at: now });
  return true;
}

/** The caller's address from the proxy headers; "unknown" shares one bucket, which is the safe side. */
export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return fwd || req.headers.get("x-real-ip") || "unknown";
}
