import { NextResponse } from "next/server";
import { currentOwner } from "@/src/auth/current";
import { getDb } from "@/src/db";
import { listReports } from "@/src/services/reports";

export async function GET(_req: Request, ctx: RouteContext<"/api/stalls/[id]/reports">) {
  const owner = await currentOwner();
  if (!owner) return NextResponse.json({ error: "sign in" }, { status: 401 });
  const { id } = await ctx.params;
  const rows = await listReports(await getDb(), owner, id);
  if (!rows) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ reports: rows });
}
