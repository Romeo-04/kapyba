import { NextResponse } from "next/server";
import { sendLoginLink } from "@/src/auth/mailer";
import { getDb } from "@/src/db";
import { requestLink } from "@/src/services/auth";
import { LIMITS, allow, clientIp } from "@/src/services/ratelimit";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email : "";
  const db = await getDb();
  const tooMany = NextResponse.json({ ok: false, error: "too many tries, wait a while" }, { status: 429, headers: { "Retry-After": "3600" } });
  if (!(await allow(db, LIMITS.authIp, clientIp(req)))) return tooMany;
  if (email && !(await allow(db, LIMITS.authEmail, email.trim().toLowerCase()))) return tooMany;
  const token = await requestLink(db, email);
  if (!token) return NextResponse.json({ ok: false, error: "invalid email" }, { status: 400 });
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;
  await sendLoginLink(email.trim().toLowerCase(), `${origin}/api/auth/verify?token=${encodeURIComponent(token)}`);
  // The same answer whether or not the email already has an account, so the endpoint cannot be used to look people up.
  return NextResponse.json({ ok: true });
}
