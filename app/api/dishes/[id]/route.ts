import { NextResponse } from "next/server";
import { currentOwner } from "@/src/auth/current";
import { getDb } from "@/src/db";
import { setPaborito, setPublished } from "@/src/services/stalls";

export async function PATCH(req: Request, ctx: RouteContext<"/api/dishes/[id]">) {
  const owner = await currentOwner();
  if (!owner) return NextResponse.json({ error: "sign in" }, { status: 401 });
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const db = await getDb();
  if (typeof body?.published === "boolean" && !(await setPublished(db, owner, id, body.published))) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (typeof body?.paborito === "boolean" && !(await setPaborito(db, owner, id, body.paborito))) {
    return NextResponse.json({ error: "not found or three picks already" }, { status: 409 });
  }
  return NextResponse.json({ ok: true });
}
