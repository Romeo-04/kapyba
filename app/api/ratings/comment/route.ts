import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { DEVICE_COOKIE } from "@/src/auth/qr";
import { getDb } from "@/src/db";
import { LIMITS, allow } from "@/src/services/ratelimit";
import { attachComment } from "@/src/services/ratings";

const STATUS = { ok: 201, invalid: 400, gone: 409 } as const;

// Adds a comment to the rating this phone just made.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const device = (await cookies()).get(DEVICE_COOKIE)?.value;
  if (!body || !device) return NextResponse.json({ result: "forbidden" }, { status: 403 });
  const db = await getDb();
  if (!(await allow(db, LIMITS.ratingDevice, device))) return NextResponse.json({ result: "limit" }, { status: 429 });
  const result = await attachComment(db, device, body.idempotencyKey, body.comment);
  return NextResponse.json({ result }, { status: STATUS[result] });
}
