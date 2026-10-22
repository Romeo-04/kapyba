import { NextResponse } from "next/server";
import { currentOwner } from "@/src/auth/current";
import { getDb } from "@/src/db";
import { setBagyo } from "@/src/services/weather";

export async function POST(req: Request, ctx: RouteContext<"/api/stalls/[id]/bagyo">) {
  const owner = await currentOwner();
  if (!owner) return NextResponse.json({ error: "sign in" }, { status: 401 });
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  if (typeof body?.on !== "boolean") return NextResponse.json({ error: "on must be true or false" }, { status: 400 });
  const res = await setBagyo(await getDb(), owner, id, body.on);
  if (!res) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(res);
}
