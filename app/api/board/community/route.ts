import { NextResponse, connection } from "next/server";
import { getDb } from "@/src/db";
import { communityFeed } from "@/src/services/aggregates";

export async function GET() {
  await connection(); // always at request time: the build must not query the database (preview builds have none)
  return NextResponse.json({ posts: await communityFeed(await getDb()) });
}
