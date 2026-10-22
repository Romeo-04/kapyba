import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { join } from "node:path";
import type { Db } from "@/src/db";
import * as schema from "@/src/db/schema";

/** A fresh in-process Postgres with every migration applied. */
export async function testDb(): Promise<Db> {
  const db = drizzle(new PGlite(), { schema });
  await migrate(db, { migrationsFolder: join(__dirname, "../../../src/db/migrations") });
  return db as unknown as Db;
}
