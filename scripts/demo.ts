// Adds or removes the sample karinderyas (src/demo/seed.ts) in the database DATABASE_URL points at.
//   DATABASE_URL=... DEMO_OWNER_EMAIL=you@example.com node scripts/demo.ts seed
//   DATABASE_URL=... node scripts/demo.ts remove
// Seeding again refreshes the dates; scores only show for ratings from the last 30 days.
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Db } from "../src/db/index.ts";
import * as schema from "../src/db/schema.ts";
import { removeDemo, seedDemo } from "../src/demo/seed.ts";

const cmd = process.argv[2];
const url = process.env.DATABASE_URL;
if (!url || url.startsWith("pglite")) throw new Error("Set DATABASE_URL to a Postgres connection string (pglite seeds itself with DEMO_DATA=1).");
const db = drizzle(neon(url), { schema }) as unknown as Db;

if (cmd === "seed") {
  const ownerEmail = process.env.DEMO_OWNER_EMAIL;
  if (!ownerEmail?.includes("@")) throw new Error("Set DEMO_OWNER_EMAIL to the address that should own the sample stall.");
  const dir = join(import.meta.dirname, "../src/demo/photos");
  const photo = (slug: string) => { const p = join(dir, `${slug}.jpg`); return existsSync(p) ? new Uint8Array(readFileSync(p)) : null; };
  console.log("seeded", await seedDemo(db, { ownerEmail, photo }));
} else if (cmd === "remove") {
  console.log("removed", await removeDemo(db));
} else {
  console.log("usage: node scripts/demo.ts seed|remove");
  process.exitCode = 1;
}
