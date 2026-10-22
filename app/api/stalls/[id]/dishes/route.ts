import { NextResponse } from "next/server";
import { currentOwner } from "@/src/auth/current";
import { getDb } from "@/src/db";
import { addDish, listDishes } from "@/src/services/stalls";

export async function GET(_req: Request, ctx: RouteContext<"/api/stalls/[id]/dishes">) {
  const owner = await currentOwner();
  if (!owner) return NextResponse.json({ error: "sign in" }, { status: 401 });
  const { id } = await ctx.params;
  const dishes = await listDishes(getDb(), owner, id);
  if (!dishes) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ dishes });
}

export async function POST(req: Request, ctx: RouteContext<"/api/stalls/[id]/dishes">) {
  const owner = await currentOwner();
  if (!owner) return NextResponse.json({ error: "sign in" }, { status: 401 });
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const dish = await addDish(getDb(), owner, id, body ?? {});
  // Not owned and invalid input both return null from the service; the UI validates first, so 404 here means a bad stall id.
  if (!dish) return NextResponse.json({ error: "not found or invalid dish" }, { status: 404 });
  return NextResponse.json({ dish }, { status: 201 });
}
