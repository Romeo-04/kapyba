import { NextResponse } from "next/server";
import { currentOwner } from "@/src/auth/current";
import { getDb } from "@/src/db";
import { markSeen } from "@/src/services/notifications";

export async function POST() {
  const owner = await currentOwner();
  if (!owner) return NextResponse.json({ error: "sign in" }, { status: 401 });
  await markSeen(await getDb(), owner);
  return NextResponse.json({ ok: true });
}
