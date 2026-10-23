import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { DEVICE_COOKIE } from "@/src/auth/qr";
import { getDb } from "@/src/db";
import { myClaims } from "@/src/services/alok";

// Which deals this phone has reserved. A phone with no device cookie has reserved none.
export async function GET() {
  const device = (await cookies()).get(DEVICE_COOKIE)?.value;
  return NextResponse.json({ claims: device ? await myClaims(await getDb(), device) : [] });
}
