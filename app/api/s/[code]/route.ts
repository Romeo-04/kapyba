import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { DEVICE_COOKIE, newDeviceToken, signScan } from "@/src/auth/qr";
import { getDb } from "@/src/db";
import { stallForScan } from "@/src/services/ratings";

// Opened when a buyer scans the stall QR. Gives the device its token and a 12-hour scan token.
export async function GET(_req: Request, ctx: RouteContext<"/api/s/[code]">) {
  const { code } = await ctx.params;
  const data = await stallForScan(await getDb(), code);
  if (!data) return NextResponse.json({ error: "not found" }, { status: 404 });
  const jar = await cookies();
  let device = jar.get(DEVICE_COOKIE)?.value;
  const fresh = !device;
  if (!device) device = newDeviceToken();
  const res = NextResponse.json({ ...data, scanToken: signScan(code, device) });
  if (fresh) {
    res.cookies.set(DEVICE_COOKIE, device, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 365 * 86_400,
    });
  }
  return res;
}
