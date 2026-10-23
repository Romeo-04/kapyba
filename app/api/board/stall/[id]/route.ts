import { NextResponse } from "next/server";
import { getDb } from "@/src/db";
import { stallProfile } from "@/src/services/aggregates";

export async function GET(_req: Request, ctx: RouteContext<"/api/board/stall/[id]">) {
  const { id } = await ctx.params;
  const profile = await stallProfile(await getDb(), id);
  if (!profile) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(profile);
}
