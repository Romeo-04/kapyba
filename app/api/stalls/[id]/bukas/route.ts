import { NextResponse } from "next/server";
import { currentOwner } from "@/src/auth/current";
import { getDb } from "@/src/db";
import { bukasPlan } from "@/src/services/logs";

export async function GET(_req: Request, ctx: RouteContext<"/api/stalls/[id]/bukas">) {
  const owner = await currentOwner();
  if (!owner) return NextResponse.json({ error: "sign in" }, { status: 401 });
  const { id } = await ctx.params;
  const dishes = await bukasPlan(await getDb(), owner, id);
  if (!dishes) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ dishes });
}
