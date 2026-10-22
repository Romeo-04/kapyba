import { connection, NextResponse } from "next/server";
import { checkDb } from "@/src/db/client";

export async function GET() {
  await connection(); // read the database at request time; without this the route is prerendered at build
  const db = await checkDb();
  const ok = db !== false;
  return NextResponse.json(
    { ok, db, version: process.env.VERCEL_GIT_COMMIT_SHA ?? "dev" },
    { status: ok ? 200 : 503 },
  );
}
