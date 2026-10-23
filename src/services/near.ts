import { isNotNull } from "drizzle-orm";
import type { Db } from "@/src/db";
import { stalls } from "@/src/db/schema";
import { distanceKm } from "@/src/domain/geo";

/** Distance in km (one decimal) from a phone to every stall that has a location. Coordinates never leave the server. */
export async function distancesFrom(db: Db, here: { lat: number; lng: number }): Promise<Record<string, number>> {
  const rows = await db.select({ id: stalls.id, lat: stalls.lat, lng: stalls.lng }).from(stalls).where(isNotNull(stalls.lat));
  const out: Record<string, number> = {};
  for (const r of rows) {
    const lat = Number(r.lat), lng = Number(r.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    out[r.id] = Math.round(distanceKm(here, { lat, lng }) * 10) / 10;
  }
  return out;
}
