import { NextResponse } from "next/server";
import { currentOwner } from "@/src/auth/current";
import { getDb } from "@/src/db";
import { createStall, listStalls } from "@/src/services/stalls";

export async function GET() {
  const owner = await currentOwner();
  if (!owner) return NextResponse.json({ error: "sign in" }, { status: 401 });
  return NextResponse.json({ stalls: await listStalls(await getDb(), owner) });
}

export async function POST(req: Request) {
  const owner = await currentOwner();
  if (!owner) return NextResponse.json({ error: "sign in" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const stall = await createStall(await getDb(), owner, body ?? {});
  if (!stall) return NextResponse.json({ error: "name and area required" }, { status: 400 });
  return NextResponse.json({ stall }, { status: 201 });
}
