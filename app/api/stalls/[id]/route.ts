import { NextResponse } from "next/server";
import { currentOwner } from "@/src/auth/current";
import { getDb } from "@/src/db";
import { ownedStall, updateStall } from "@/src/services/stalls";

export async function GET(_req: Request, ctx: RouteContext<"/api/stalls/[id]">) {
  const owner = await currentOwner();
  if (!owner) return NextResponse.json({ error: "sign in" }, { status: 401 });
  const { id } = await ctx.params;
  const stall = await ownedStall(await getDb(), owner, id);
  if (!stall) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ stall });
}

export async function PATCH(req: Request, ctx: RouteContext<"/api/stalls/[id]">) {
  const owner = await currentOwner();
  if (!owner) return NextResponse.json({ error: "sign in" }, { status: 401 });
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const stall = await updateStall(await getDb(), owner, id, body ?? {});
  if (!stall) return NextResponse.json({ error: "update failed" }, { status: 400 });
  return NextResponse.json({ stall });
}
