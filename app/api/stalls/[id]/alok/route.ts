import { NextResponse } from "next/server";
import { currentOwner } from "@/src/auth/current";
import { getDb } from "@/src/db";
import { listAlok, postAlok } from "@/src/services/alok";

export async function GET(_req: Request, ctx: RouteContext<"/api/stalls/[id]/alok">) {
  const owner = await currentOwner();
  if (!owner) return NextResponse.json({ error: "sign in" }, { status: 401 });
  const { id } = await ctx.params;
  const deals = await listAlok(await getDb(), owner, id);
  if (!deals) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ deals });
}

export async function POST(req: Request, ctx: RouteContext<"/api/stalls/[id]/alok">) {
  const owner = await currentOwner();
  if (!owner) return NextResponse.json({ error: "sign in" }, { status: 401 });
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  const out = await postAlok(await getDb(), owner, id, body);
  if ("error" in out) return NextResponse.json({ error: out.error }, { status: 400 });
  return NextResponse.json({ alok: out.alok }, { status: 201 });
}
