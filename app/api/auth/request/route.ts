import { NextResponse } from "next/server";
import { sendLoginLink } from "@/src/auth/mailer";
import { getDb } from "@/src/db";
import { requestLink } from "@/src/services/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email : "";
  const token = await requestLink(await getDb(), email);
  if (!token) return NextResponse.json({ ok: false, error: "invalid email" }, { status: 400 });
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;
  await sendLoginLink(email.trim().toLowerCase(), `${origin}/api/auth/verify?token=${encodeURIComponent(token)}`);
  // The same answer whether or not the email already has an account, so the endpoint cannot be used to look people up.
  return NextResponse.json({ ok: true });
}
