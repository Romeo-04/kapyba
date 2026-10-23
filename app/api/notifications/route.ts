import { NextResponse } from "next/server";
import { currentOwner } from "@/src/auth/current";
import { getDb } from "@/src/db";
import { inbox } from "@/src/services/notifications";

export async function GET() {
  const owner = await currentOwner();
  if (!owner) return NextResponse.json({ error: "sign in" }, { status: 401 });
  return NextResponse.json(await inbox(await getDb(), owner));
}
