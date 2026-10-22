import { NextResponse } from "next/server";
import { currentOwner } from "@/src/auth/current";
import { getDb } from "@/src/db";
import { leftoverPesos, saveDay } from "@/src/services/logs";

export async function GET(_req: Request, ctx: RouteContext<"/api/stalls/[id]/log">) {
  const owner = await currentOwner();
  if (!owner) return NextResponse.json({ error: "sign in" }, { status: 401 });
  const { id } = await ctx.params;
  const days = await leftoverPesos(await getDb(), owner, id);
  if (!days) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ days });
}

export async function POST(req: Request, ctx: RouteContext<"/api/stalls/[id]/log">) {
  const owner = await currentOwner();
  if (!owner) return NextResponse.json({ error: "sign in" }, { status: 401 });
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const saved = await saveDay(await getDb(), owner, id, body?.entries, new Date(), body?.day);
  if (!saved) return NextResponse.json({ error: "invalid log, or stall not found" }, { status: 400 });
  return NextResponse.json(saved, { status: 201 });
}
