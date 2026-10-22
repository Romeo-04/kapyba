import QRCode from "qrcode";
import { NextResponse } from "next/server";
import { currentOwner } from "@/src/auth/current";
import { getDb } from "@/src/db";
import { ownedStall } from "@/src/services/stalls";

// The stall QR as an SVG, for the owner to print. It points at the buyer page for this stall.
export async function GET(req: Request, ctx: RouteContext<"/api/stalls/[id]/qr">) {
  const owner = await currentOwner();
  if (!owner) return NextResponse.json({ error: "sign in" }, { status: 401 });
  const { id } = await ctx.params;
  const stall = await ownedStall(await getDb(), owner, id);
  if (!stall) return NextResponse.json({ error: "not found" }, { status: 404 });
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;
  const svg = await QRCode.toString(`${origin}/s/${stall.code}`, { type: "svg", margin: 2, errorCorrectionLevel: "M" });
  return new NextResponse(svg, { headers: { "Content-Type": "image/svg+xml", "Cache-Control": "private, max-age=3600" } });
}
