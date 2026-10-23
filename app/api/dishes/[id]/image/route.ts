import { NextResponse } from "next/server";
import { currentOwner } from "@/src/auth/current";
import { getDb } from "@/src/db";
import { MAX_PHOTO_BYTES, getImage, removeImage, saveImage } from "@/src/services/photos";

// Public: the Ulam board shows the photo. The URL carries ?v=<updated stamp>, so a new photo is a new URL and the old one can be cached for good.
export async function GET(_req: Request, ctx: RouteContext<"/api/dishes/[id]/image">) {
  const { id } = await ctx.params;
  const img = await getImage(await getDb(), id);
  if (!img) return new NextResponse(null, { status: 404 });
  return new NextResponse(new Uint8Array(img.bytes), {
    headers: { "Content-Type": img.mime, "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" },
  });
}

export async function PUT(req: Request, ctx: RouteContext<"/api/dishes/[id]/image">) {
  const owner = await currentOwner();
  if (!owner) return NextResponse.json({ error: "sign in" }, { status: 401 });
  const { id } = await ctx.params;
  if (Number(req.headers.get("content-length") ?? 0) > MAX_PHOTO_BYTES) return NextResponse.json({ error: "photo is too big" }, { status: 413 });
  const result = await saveImage(await getDb(), owner, id, new Uint8Array(await req.arrayBuffer()));
  if (result === "ok") return NextResponse.json({ ok: true });
  if (result === "not-found") return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ error: result === "too-big" ? "photo is too big" : "that file is not a photo" }, { status: result === "too-big" ? 413 : 415 });
}

export async function DELETE(_req: Request, ctx: RouteContext<"/api/dishes/[id]/image">) {
  const owner = await currentOwner();
  if (!owner) return NextResponse.json({ error: "sign in" }, { status: 401 });
  const { id } = await ctx.params;
  if (!(await removeImage(await getDb(), owner, id))) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
