import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { hashToken } from "./session";

export const SCAN_HOURS = 12;
export const DEVICE_COOKIE = "kb_device";

const secret = () => {
  const s = process.env.QR_SIGNING_SECRET;
  if (!s || s.length < 16) throw new Error("QR_SIGNING_SECRET must be set (16+ characters)");
  return s;
};

const mac = (data: string) => createHmac("sha256", secret()).update(data).digest("base64url");

export const newDeviceToken = () => randomBytes(24).toString("base64url");
export const deviceHash = hashToken;

/**
 * Scan token: proves this device opened this stall's QR page in the last 12 hours.
 * A link pasted into a group chat gives other phones no token until they open it themselves,
 * and a token cannot be moved to another stall or device.
 */
export function signScan(stallCode: string, deviceToken: string, now = Date.now()): string {
  const exp = now + SCAN_HOURS * 3_600_000;
  const body = `${exp}`;
  return `${body}.${mac(`${stallCode}|${deviceToken}|${body}`)}`;
}

export function verifyScan(token: string, stallCode: string, deviceToken: string, now = Date.now()): boolean {
  const i = token.indexOf(".");
  if (i < 0) return false;
  const exp = token.slice(0, i);
  if (!/^\d+$/.test(exp) || Number(exp) < now) return false;
  const a = Buffer.from(token.slice(i + 1));
  const b = Buffer.from(mac(`${stallCode}|${deviceToken}|${exp}`));
  return a.length === b.length && timingSafeEqual(a, b);
}
