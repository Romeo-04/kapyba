import { NextResponse } from "next/server";
import { currentOwner } from "@/src/auth/current";
import { getDb } from "@/src/db";
import { PRICE_SOURCE, shoppingList } from "@/src/domain/palengke";
import { bukasPlan } from "@/src/services/logs";

export async function GET(_req: Request, ctx: RouteContext<"/api/stalls/[id]/palengke">) {
  const owner = await currentOwner();
  if (!owner) return NextResponse.json({ error: "sign in" }, { status: 401 });
  const { id } = await ctx.params;
  const plan = await bukasPlan(await getDb(), owner, id);
  if (!plan) return NextResponse.json({ error: "not found" }, { status: 404 });
  const list = shoppingList(plan.map((p) => ({ name: p.name, servings: p.plan?.servings ?? null })));
  return NextResponse.json({ ...list, priceSource: PRICE_SOURCE });
}
