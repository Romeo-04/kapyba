import { NextResponse } from "next/server";
import { currentOwner } from "@/src/auth/current";
import { getDb } from "@/src/db";
import { fileReport } from "@/src/services/reports";

const STATUS = { invalid: 400, "not-found": 404, window: 400, limit: 429, "already-open": 409, empty: 400 } as const;

export async function POST(req: Request) {
  const owner = await currentOwner();
  if (!owner) return NextResponse.json({ error: "sign in" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const out = await fileReport(await getDb(), owner, body);
  if ("error" in out) return NextResponse.json({ error: out.error }, { status: STATUS[out.error] });
  return NextResponse.json(out, { status: 201 });
}
