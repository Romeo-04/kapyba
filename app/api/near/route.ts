import { NextResponse } from "next/server";
import { getDb } from "@/src/db";
import { validCoord } from "@/src/domain/geo";
import { distancesFrom } from "@/src/services/near";

// The phone's position is only used for this one answer: not stored, not logged.
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const lat = Number(q.get("lat")), lng = Number(q.get("lng"));
  if (!q.get("lat") || !q.get("lng") || !validCoord(lat, lng)) return NextResponse.json({ error: "bad position" }, { status: 400 });
  return NextResponse.json({ distances: await distancesFrom(await getDb(), { lat, lng }) });
}
