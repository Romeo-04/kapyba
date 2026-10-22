import { NextResponse } from "next/server";
import { currentOwner } from "@/src/auth/current";
import { getDb } from "@/src/db";
import { openReports } from "@/src/services/reports";

// Reviewer queue. A signed-in non-reviewer gets 404, so the page's existence is not advertised.
export async function GET() {
  const user = await currentOwner();
  if (!user) return NextResponse.json({ error: "sign in" }, { status: 401 });
  const rows = await openReports(await getDb(), user);
  if (!rows) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ reports: rows });
}
