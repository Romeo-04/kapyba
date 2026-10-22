import { NextResponse } from "next/server";
import { getDb } from "@/src/db";
import { publicBoard } from "@/src/services/aggregates";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const max = Number(q.get("max"));
  const items = await publicBoard(await getDb(), {
    area: q.get("area") || undefined,
    maxPrice: Number.isFinite(max) && max > 0 ? max : undefined,
  });
  return NextResponse.json({ items, updatedAt: new Date().toISOString() });
}
