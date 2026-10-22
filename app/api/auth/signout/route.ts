import { NextResponse } from "next/server";
import { cookieOptions } from "@/src/auth/current";
import { COOKIE } from "@/src/auth/session";

// Sessions are signed cookies, so signing out clears the cookie on this device.
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, "", { ...cookieOptions(), maxAge: 0 });
  return res;
}
