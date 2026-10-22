import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { join } from "node:path";
import type { Db } from "./index";
import * as schema from "./schema";

export async function openPglite(): Promise<Db> {
  const db = drizzle(new PGlite(), { schema });
  await migrate(db, { migrationsFolder: join(process.cwd(), "src/db/migrations") });
  return db as unknown as Db;
}
