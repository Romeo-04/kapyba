import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import * as schema from "./schema";

// Services take this type so tests can pass an in-process Postgres (PGlite) and production passes Neon.
export type Db = PgDatabase<PgQueryResultHKT, typeof schema>;

let cached: Promise<Db> | undefined;

/**
 * DATABASE_URL is a Neon connection string. For local development and CI only, the value
 * "pglite:memory" runs a throwaway in-process Postgres with every migration applied.
 */
export function getDb(): Promise<Db> {
  cached ??= open();
  return cached;
}

async function open(): Promise<Db> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  if (url === "pglite:memory") {
    if (process.env.NODE_ENV === "production" && !process.env.ALLOW_PGLITE) {
      throw new Error("pglite:memory is for development and tests only");
    }
    const { openPglite } = await import("./pglite-dev");
    return openPglite();
  }
  return drizzle(neon(url), { schema }) as unknown as Db;
}

export { schema };
