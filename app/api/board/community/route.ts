import { NextResponse } from "next/server";
import { getDb } from "@/src/db";
import { communityFeed } from "@/src/services/aggregates";

export async function GET() {
  return NextResponse.json({ posts: await communityFeed(await getDb()) });
}
