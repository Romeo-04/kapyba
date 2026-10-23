import { and, eq, inArray } from "drizzle-orm";
import type { Db } from "@/src/db";
import { dishImages, dishes, stalls } from "@/src/db/schema";

export const MAX_PHOTO_BYTES = 250_000; // the phone shrinks to about 50 KB; this only stops abuse

/** Which image type these bytes really are, from the file's first bytes; the sent Content-Type is not trusted. */
export function sniffImage(b: Uint8Array): "image/jpeg" | "image/png" | "image/webp" | null {
  if (b.length > 12 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b.length > 12 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  if (b.length > 12 && String.fromCharCode(...b.slice(0, 4)) === "RIFF" && String.fromCharCode(...b.slice(8, 12)) === "WEBP") return "image/webp";
  return null;
}

async function owns(db: Db, ownerId: string, dishId: string): Promise<boolean> {
  const [row] = await db.select({ id: dishes.id }).from(dishes).innerJoin(stalls, eq(stalls.id, dishes.stallId)).where(and(eq(dishes.id, dishId), eq(stalls.ownerId, ownerId)));
  return !!row;
}

export type SaveResult = "ok" | "not-found" | "too-big" | "not-an-image";

export async function saveImage(db: Db, ownerId: string, dishId: string, bytes: Uint8Array, now = new Date()): Promise<SaveResult> {
  if (!(await owns(db, ownerId, dishId))) return "not-found";
  if (bytes.length > MAX_PHOTO_BYTES) return "too-big";
  const mime = sniffImage(bytes);
  if (!mime) return "not-an-image";
  const data = Buffer.from(bytes).toString("base64");
  await db.insert(dishImages).values({ dishId, mime, data, updatedAt: now }).onConflictDoUpdate({ target: dishImages.dishId, set: { mime, data, updatedAt: now } });
  return "ok";
}

export async function removeImage(db: Db, ownerId: string, dishId: string): Promise<boolean> {
  if (!(await owns(db, ownerId, dishId))) return false;
  await db.delete(dishImages).where(eq(dishImages.dishId, dishId));
  return true;
}

export async function getImage(db: Db, dishId: string): Promise<{ mime: string; bytes: Buffer } | null> {
  const [row] = await db.select({ mime: dishImages.mime, data: dishImages.data }).from(dishImages).where(eq(dishImages.dishId, dishId));
  return row ? { mime: row.mime, bytes: Buffer.from(row.data, "base64") } : null;
}

/** Version stamp (ms) per dish that has a photo, so a changed photo gets a new URL. The image bytes are not read. */
export async function imageVersions(db: Db, dishIds: string[]): Promise<Map<string, number>> {
  if (dishIds.length === 0) return new Map();
  const rows = await db.select({ id: dishImages.dishId, at: dishImages.updatedAt }).from(dishImages).where(inArray(dishImages.dishId, dishIds));
  return new Map(rows.map((r) => [r.id, r.at.getTime()]));
}
