import { NextResponse } from "next/server";
import { currentOwner } from "@/src/auth/current";
import { getDb } from "@/src/db";
import { setStallLocation } from "@/src/services/stalls";

export async function PATCH(req: Request, ctx: RouteContext<"/api/stalls/[id]/location">) {
  const owner = await currentOwner();
  if (!owner) return NextResponse.json({ error: "sign in" }, { status: 401 });
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const ok = await setStallLocation(await getDb(), owner, id, body?.lat, body?.lng);
  if (!ok) return NextResponse.json({ error: "not found or invalid" }, { status: 400 });
  return NextResponse.json({ ok: true });
}
