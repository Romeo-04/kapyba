import { NextResponse } from "next/server";
import { currentOwner } from "@/src/auth/current";
import { getDb } from "@/src/db";
import { archiveDish, setNaubos, setPaborito, setPublished, setSale, updateDish } from "@/src/services/stalls";

export async function PATCH(req: Request, ctx: RouteContext<"/api/dishes/[id]">) {
  const owner = await currentOwner();
  if (!owner) return NextResponse.json({ error: "sign in" }, { status: 401 });
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const db = await getDb();
  if (typeof body?.published === "boolean" && !(await setPublished(db, owner, id, body.published))) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (typeof body?.paborito === "boolean" && !(await setPaborito(db, owner, id, body.paborito))) {
    return NextResponse.json({ error: "not found or three picks already" }, { status: 409 });
  }
  if (typeof body?.soldOut === "boolean" && !(await setNaubos(db, owner, id, body.soldOut))) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (body?.salePrice !== undefined && !(await setSale(db, owner, id, body.salePrice === null ? null : Number(body.salePrice)))) {
    return NextResponse.json({ error: "not found or the sale price must be a whole peso below the usual price" }, { status: 400 });
  }
  const fields = { name: body?.name, icon: body?.icon, price: body?.price, baseServings: body?.baseServings, main: body?.main, ingredients: body?.ingredients, allergens: body?.allergens };
  const edits = Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined));
  if (Object.keys(edits).length && !(await updateDish(db, owner, id, edits))) {
    return NextResponse.json({ error: "not found or invalid" }, { status: 400 });
  }
  if (body?.archived === true && !(await archiveDish(db, owner, id))) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
