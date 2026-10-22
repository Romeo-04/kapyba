import { cookies } from "next/headers";
import { connection } from "next/server";
import { COOKIE, SESSION_DAYS, readSession } from "./session";

/** The signed-in owner id from the session cookie, or null. */
export async function currentOwner(): Promise<string | null> {
  await connection(); // the session expiry check reads the clock; keep it out of prerendering
  return readSession((await cookies()).get(COOKIE)?.value);
}

export const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_DAYS * 86_400,
});
