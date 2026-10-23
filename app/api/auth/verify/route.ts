import { NextResponse } from "next/server";
import { cookieOptions } from "@/src/auth/current";
import { COOKIE, signSession } from "@/src/auth/session";
import { getDb } from "@/src/db";
import { consumeLink } from "@/src/services/auth";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token") ?? "";
  const ownerId = token ? await consumeLink(await getDb(), token) : null;
  if (!ownerId) return NextResponse.redirect(new URL("/owner?signin=expired", url));
  const res = NextResponse.redirect(new URL("/o", url));
  res.cookies.set(COOKIE, signSession(ownerId), cookieOptions());
  return res;
}
