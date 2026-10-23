import { NextResponse } from "next/server";
import { getDb } from "@/src/db";
import { testimonies } from "@/src/services/aggregates";

export async function GET(_req: Request, ctx: RouteContext<"/api/dishes/[id]/testimonies">) {
  const { id } = await ctx.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ testimonies: [] });
  return NextResponse.json({ testimonies: await testimonies(await getDb(), id) });
}
