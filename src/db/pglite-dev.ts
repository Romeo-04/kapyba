import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Db } from "./index";
import * as schema from "./schema";

export async function openPglite(): Promise<Db> {
  const db = drizzle(new PGlite(), { schema });
  await migrate(db, { migrationsFolder: join(process.cwd(), "src/db/migrations") });
  // DEMO_DATA=1 npm run dev fills the throwaway database with the sample karinderyas (src/demo/seed.ts).
  if (process.env.DEMO_DATA === "1") {
    const { seedDemo } = await import("../demo/seed");
    const dir = join(process.cwd(), "src/demo/photos");
    const photo = (slug: string) => { const p = join(dir, `${slug}.jpg`); return existsSync(p) ? new Uint8Array(readFileSync(p)) : null; };
    await seedDemo(db as unknown as Db, { ownerEmail: process.env.DEMO_OWNER_EMAIL || "owner@demo.kapyba.invalid", photo });
  }
  return db as unknown as Db;
}
