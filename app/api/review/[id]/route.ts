import { NextResponse } from "next/server";
import { currentOwner } from "@/src/auth/current";
import { getDb } from "@/src/db";
import { reviewReport } from "@/src/services/reports";

const STATUS = { ok: 200, forbidden: 404, "not-found": 404, invalid: 400 } as const;

export async function POST(req: Request, ctx: RouteContext<"/api/review/[id]">) {
  const user = await currentOwner();
  if (!user) return NextResponse.json({ error: "sign in" }, { status: 401 });
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const result = await reviewReport(await getDb(), user, id, body?.decision, body?.note);
  return NextResponse.json({ result }, { status: STATUS[result] });
}
