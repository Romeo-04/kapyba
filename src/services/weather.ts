import { eq } from "drizzle-orm";
import type { Db } from "@/src/db";
import { stalls } from "@/src/db/schema";
import { weatherFactor, type Weather } from "@/src/domain/weather";
import { ownedStall } from "./stalls";

const MANILA = { lat: "14.5995", lng: "120.9842" }; // used when a stall has no coordinates
const BAGYO_HOURS = 24;

/** Tomorrow's highest rain chance (percent) from Open-Meteo, or null if it cannot be read in 3 seconds. */
export async function rainChanceTomorrow(lat: string, lng: string, doFetch: typeof fetch = fetch): Promise<number | null> {
  if (process.env.E2E_NO_WEATHER) return null; // keeps browser tests independent of the real forecast
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=precipitation_probability_max&timezone=Asia%2FManila&forecast_days=2`;
    const res = await doFetch(url, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return null;
    const v = (await res.json())?.daily?.precipitation_probability_max?.[1];
    return typeof v === "number" && v >= 0 && v <= 100 ? v : null;
  } catch {
    return null;
  }
}

/** The owner's Bagyo switch holds for 24 hours, then lapses on its own so it cannot be forgotten. */
export async function setBagyo(db: Db, ownerId: string, stallId: string, on: boolean, now = new Date()) {
  const stall = await ownedStall(db, ownerId, stallId);
  if (!stall) return null;
  const until = on ? new Date(now.getTime() + BAGYO_HOURS * 3_600_000) : null;
  await db.update(stalls).set({ bagyoUntil: until }).where(eq(stalls.id, stallId));
  return { bagyo: on };
}

export async function stallWeather(db: Db, ownerId: string, stallId: string, now = new Date(), doFetch: typeof fetch = fetch): Promise<Weather | null> {
  const stall = await ownedStall(db, ownerId, stallId);
  if (!stall) return null;
  const bagyo = !!stall.bagyoUntil && stall.bagyoUntil > now;
  const rain = await rainChanceTomorrow(stall.lat ?? MANILA.lat, stall.lng ?? MANILA.lng, doFetch);
  return weatherFactor(rain, bagyo);
}
