import { cookies } from "next/headers";
import { COOKIE, SESSION_DAYS, readSession } from "./session";

/** The signed-in owner id from the session cookie, or null. */
export async function currentOwner(): Promise<string | null> {
  return readSession((await cookies()).get(COOKIE)?.value);
}

export const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_DAYS * 86_400,
});
