import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { log } from "@/src/log";

// Defence in depth on top of SameSite=Lax cookies: a write to the API must come from this site.
// Requests with no Origin header (curl, server to server) pass; a browser always sends one on a cross-site write.
// Public data a shared cache may keep; every other API answer depends on who is asking.
const SHARED = [/^\/api\/s\//, /^\/api\/board/, /^\/api\/health/];

export function proxy(req: NextRequest) {
  if (req.method === "GET" || req.method === "HEAD") {
    const res = NextResponse.next();
    // Owner answers are per person: never let a CDN or proxy hand one owner's data to another device.
    if (!SHARED.some((r) => r.test(req.nextUrl.pathname))) res.headers.set("Cache-Control", "private, no-store");
    return res;
  }
  const origin = req.headers.get("origin");
  // Compare with the Host the browser used: req.nextUrl can report a different hostname than the one typed.
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const originHost = (() => { try { return new URL(origin ?? "").host; } catch { return null; } })();
  if (origin && (!host || originHost !== host)) {
    log("warn", "cross-site-refused", { path: req.nextUrl.pathname });
    return NextResponse.json({ error: "cross-site request refused" }, { status: 403 });
  }
  return NextResponse.next();
}

export const config = { matcher: "/api/:path*" };
