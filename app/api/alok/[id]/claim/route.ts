import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { DEVICE_COOKIE, newDeviceToken } from "@/src/auth/qr";
import { getDb } from "@/src/db";
import { claimAlok } from "@/src/services/alok";
import { LIMITS, allow, clientIp } from "@/src/services/ratelimit";

const STATUS = { ok: 201, already: 409, gone: 410, invalid: 400 } as const;

// A buyer reserves a spot. A visitor who has not scanned a QR yet gets a device cookie here.
export async function POST(req: Request, ctx: RouteContext<"/api/alok/[id]/claim">) {
  const { id } = await ctx.params;
  const jar = await cookies();
  let device = jar.get(DEVICE_COOKIE)?.value;
  const fresh = !device;
  if (!device) device = newDeviceToken();
  const db = await getDb();
  if (!(await allow(db, LIMITS.claimDevice, device)) || !(await allow(db, LIMITS.claimIp, clientIp(req)))) return NextResponse.json({ result: "limit" }, { status: 429 });
  const result = await claimAlok(db, device, id);
  const res = NextResponse.json({ result }, { status: STATUS[result] });
  if (fresh) {
    res.cookies.set(DEVICE_COOKIE, device, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 365 * 86_400 });
  }
  return res;
}
