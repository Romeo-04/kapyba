import { sql } from "drizzle-orm";
import { getDb } from "./index";

// null = no database configured (local dev, CI); true = reachable; false = configured but failing.
export async function checkDb(): Promise<boolean | null> {
  if (!process.env.DATABASE_URL) return null;
  try {
    await (await getDb()).execute(sql`select 1`);
    return true;
  } catch {
    return false;
  }
}
