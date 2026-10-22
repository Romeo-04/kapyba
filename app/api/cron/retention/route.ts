import { connection, NextResponse } from "next/server";
import { getDb } from "@/src/db";
import { log } from "@/src/log";
import { purgeExpired } from "@/src/services/retention";

// Called daily by Vercel Cron, which sends `Authorization: Bearer $CRON_SECRET`. Without the secret set, it is off.
export async function GET(req: Request) {
  await connection();
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "not allowed" }, { status: 401 });
  }
  const purged = await purgeExpired(await getDb());
  log("info", "retention-purge", purged);
  return NextResponse.json({ ok: true, purged });
}
