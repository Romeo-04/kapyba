import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { log } from "@/src/log";

// Defence in depth on top of SameSite=Lax cookies: a write to the API must come from this site.
// Requests with no Origin header (curl, server to server) pass; a browser always sends one on a cross-site write.
export function proxy(req: NextRequest) {
  if (req.method === "GET" || req.method === "HEAD") return NextResponse.next();
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
