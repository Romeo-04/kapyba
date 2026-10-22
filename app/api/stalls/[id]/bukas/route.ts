import { NextResponse } from "next/server";
import { currentOwner } from "@/src/auth/current";
import { getDb } from "@/src/db";
import { bukasPlan } from "@/src/services/logs";
import { stallWeather } from "@/src/services/weather";

export async function GET(_req: Request, ctx: RouteContext<"/api/stalls/[id]/bukas">) {
  const owner = await currentOwner();
  if (!owner) return NextResponse.json({ error: "sign in" }, { status: 401 });
  const { id } = await ctx.params;
  const db = await getDb();
  const weather = await stallWeather(db, owner, id);
  if (!weather) return NextResponse.json({ error: "not found" }, { status: 404 });
  const dishes = await bukasPlan(db, owner, id, new Date(), weather.factor);
  if (!dishes) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ dishes, weather });
}
