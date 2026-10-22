import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import * as schema from "./schema";

// Services take this type so tests can pass an in-process Postgres (PGlite) and production passes Neon.
export type Db = PgDatabase<PgQueryResultHKT, typeof schema>;

let cached: Db | undefined;

export function getDb(): Db {
  if (cached) return cached;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  cached = drizzle(neon(url), { schema }) as unknown as Db;
  return cached;
}

export { schema };
