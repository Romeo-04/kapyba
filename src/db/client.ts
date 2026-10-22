import { neon } from "@neondatabase/serverless";

// null = no database configured (local dev, CI); true = reachable; false = configured but failing.
export async function checkDb(): Promise<boolean | null> {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  try {
    await neon(url)`select 1`;
    return true;
  } catch {
    return false;
  }
}
