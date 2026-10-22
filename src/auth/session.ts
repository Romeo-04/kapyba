import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const SESSION_DAYS = 30;
export const LINK_MINUTES = 15;
export const COOKIE = "kb_session";

const secret = () => {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16) throw new Error("AUTH_SECRET must be set (16+ characters)");
  return s;
};

const mac = (data: string) => createHmac("sha256", secret()).update(data).digest("base64url");

/** Random single-use token for the emailed link. Only its hash is stored. */
export const newLinkToken = () => randomBytes(32).toString("base64url");
export const hashToken = (t: string) => createHash("sha256").update(t).digest("hex");

/** Signed session value: ownerId.expiryMs.signature */
export function signSession(ownerId: string, now = Date.now()): string {
  const exp = now + SESSION_DAYS * 86_400_000;
  const body = `${ownerId}.${exp}`;
  return `${body}.${mac(body)}`;
}

export function readSession(value: string | undefined, now = Date.now()): string | null {
  if (!value) return null;
  const i = value.lastIndexOf(".");
  if (i < 0) return null;
  const body = value.slice(0, i);
  const sig = value.slice(i + 1);
  const expected = mac(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  const [ownerId, exp] = body.split(".");
  if (!ownerId || !exp || Number(exp) < now) return null;
  return ownerId;
}
