import { NextResponse } from "next/server";
import { currentOwner } from "@/src/auth/current";
import { getDb } from "@/src/db";
import { closeAlok } from "@/src/services/alok";

export async function POST(_req: Request, ctx: RouteContext<"/api/alok/[id]/close">) {
  const owner = await currentOwner();
  if (!owner) return NextResponse.json({ error: "sign in" }, { status: 401 });
  const { id } = await ctx.params;
  const ok = await closeAlok(await getDb(), owner, id);
  return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "not found" }, { status: 404 });
}
