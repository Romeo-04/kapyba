import { and, eq, gt, isNull } from "drizzle-orm";
import type { Db } from "@/src/db";
import { loginTokens, owners } from "@/src/db/schema";
import { LINK_MINUTES, hashToken, newLinkToken } from "@/src/auth/session";

export const normalizeEmail = (e: string) => e.trim().toLowerCase();
export const isEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && e.length <= 254;

/** Create a single-use login token. The caller emails the link; the raw token is returned only here. */
export async function requestLink(db: Db, emailRaw: string, now = new Date()): Promise<string | null> {
  const email = normalizeEmail(emailRaw);
  if (!isEmail(email)) return null;
  const token = newLinkToken();
  await db.insert(loginTokens).values({
    email,
    tokenHash: hashToken(token),
    expiresAt: new Date(now.getTime() + LINK_MINUTES * 60_000),
  });
  return token;
}

/** Spend a token. Returns the owner id (creating the owner on first sign-in), or null if invalid, used or expired. */
export async function consumeLink(db: Db, token: string, now = new Date()): Promise<string | null> {
  const hash = hashToken(token);
  // One atomic update so a token can be spent only once even under concurrent requests.
  const spent = await db
    .update(loginTokens)
    .set({ usedAt: now })
    .where(and(eq(loginTokens.tokenHash, hash), isNull(loginTokens.usedAt), gt(loginTokens.expiresAt, now)))
    .returning({ email: loginTokens.email });
  if (spent.length === 0) return null;
  const email = spent[0].email;
  await db.insert(owners).values({ email }).onConflictDoNothing();
  const [owner] = await db.select({ id: owners.id }).from(owners).where(eq(owners.email, email));
  return owner.id;
}
