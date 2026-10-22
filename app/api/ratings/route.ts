import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { DEVICE_COOKIE } from "@/src/auth/qr";
import { getDb } from "@/src/db";
import { submitRating } from "@/src/services/ratings";

const STATUS = { ok: 201, replay: 200, already: 409, invalid: 400, forbidden: 403, limit: 429 } as const;

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const device = (await cookies()).get(DEVICE_COOKIE)?.value;
  if (!body || !device) return NextResponse.json({ result: "forbidden" }, { status: 403 });
  const result = await submitRating(await getDb(), {
    stallCode: String(body.code ?? ""),
    scanToken: String(body.scanToken ?? ""),
    deviceToken: device,
    dishId: String(body.dishId ?? ""),
    score: body.score,
    tags: body.tags,
    idempotencyKey: body.idempotencyKey,
  });
  return NextResponse.json({ result }, { status: STATUS[result] });
}
