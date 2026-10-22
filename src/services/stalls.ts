import { randomBytes } from "node:crypto";
import { and, eq, isNull } from "drizzle-orm";
import type { Db } from "@/src/db";
import { dishes, stalls } from "@/src/db/schema";
import { manilaDay } from "./ratings";

const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789"; // no look-alikes (i, l, o, 0, 1)

/** 10 random characters, about 50 bits: unguessable, short enough for a QR. */
export function newStallCode(): string {
  const bytes = randomBytes(10);
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

const clean = (s: unknown, max: number) => (typeof s === "string" ? s.trim().slice(0, max) : "");

export async function createStall(db: Db, ownerId: string, input: { name: unknown; area: unknown }) {
  const name = clean(input.name, 80);
  const area = clean(input.area, 80);
  if (!name || !area) return null;
  const [row] = await db.insert(stalls).values({ ownerId, name, area, code: newStallCode() }).returning();
  return row;
}

export async function listStalls(db: Db, ownerId: string) {
  return db.select().from(stalls).where(eq(stalls.ownerId, ownerId));
}

/** Returns the stall only if this owner owns it; the single place ownership is checked. */
export async function ownedStall(db: Db, ownerId: string, stallId: string) {
  const [row] = await db.select().from(stalls).where(and(eq(stalls.id, stallId), eq(stalls.ownerId, ownerId)));
  return row ?? null;
}

export type DishInput = { name: unknown; icon: unknown; price: unknown; baseServings?: unknown };

export async function addDish(db: Db, ownerId: string, stallId: string, input: DishInput) {
  if (!(await ownedStall(db, ownerId, stallId))) return null;
  const name = clean(input.name, 80);
  const icon = clean(input.icon, 32);
  const price = input.price;
  const base = input.baseServings ?? 0;
  if (!name || !icon) return null;
  if (typeof price !== "number" || !Number.isInteger(price) || price < 1 || price > 10_000) return null;
  if (typeof base !== "number" || !Number.isInteger(base) || base < 0 || base > 1000) return null;
  const [row] = await db.insert(dishes).values({ stallId, name, icon, price, baseServings: base }).returning();
  return row;
}

export async function listDishes(db: Db, ownerId: string, stallId: string) {
  if (!(await ownedStall(db, ownerId, stallId))) return null;
  return db.select().from(dishes).where(and(eq(dishes.stallId, stallId), isNull(dishes.archivedAt)));
}

/** Fix a typo or a new price. Only the fields given change; false if the dish is not this owner's or a value is invalid. */
export async function updateDish(db: Db, ownerId: string, dishId: string, input: Partial<DishInput>) {
  const [d] = await db.select().from(dishes).where(and(eq(dishes.id, dishId), isNull(dishes.archivedAt)));
  if (!d || !(await ownedStall(db, ownerId, d.stallId))) return false;
  const set: Partial<typeof dishes.$inferInsert> = {};
  if (input.name !== undefined) { const n = clean(input.name, 80); if (!n) return false; set.name = n; }
  if (input.icon !== undefined) { const i = clean(input.icon, 32); if (!i) return false; set.icon = i; }
  if (input.price !== undefined) {
    if (typeof input.price !== "number" || !Number.isInteger(input.price) || input.price < 1 || input.price > 10_000) return false;
    set.price = input.price;
  }
  if (input.baseServings !== undefined) {
    if (typeof input.baseServings !== "number" || !Number.isInteger(input.baseServings) || input.baseServings < 0 || input.baseServings > 1000) return false;
    set.baseServings = input.baseServings;
  }
  if (Object.keys(set).length) await db.update(dishes).set(set).where(eq(dishes.id, dishId));
  return true;
}

/** Retire a dish. Its ratings stay in the data; it leaves every list, the QR page and the Ulam board. */
export async function archiveDish(db: Db, ownerId: string, dishId: string, now = new Date()) {
  const [d] = await db.select().from(dishes).where(and(eq(dishes.id, dishId), isNull(dishes.archivedAt)));
  if (!d || !(await ownedStall(db, ownerId, d.stallId))) return false;
  await db.update(dishes).set({ archivedAt: now, published: false, paborito: false }).where(eq(dishes.id, dishId));
  return true;
}

/** Naubos: the dish is gone for today. It clears itself at midnight Manila time. */
export async function setNaubos(db: Db, ownerId: string, dishId: string, on: boolean, now = new Date()) {
  const [d] = await db.select().from(dishes).where(and(eq(dishes.id, dishId), isNull(dishes.archivedAt)));
  if (!d || !(await ownedStall(db, ownerId, d.stallId))) return false;
  await db.update(dishes).set({ soldOutDay: on ? manilaDay(now) : null }).where(eq(dishes.id, dishId));
  return true;
}

/** Sale (huling plato): a lower price for today only. Null ends it. The price must be a whole peso below the usual one. */
export async function setSale(db: Db, ownerId: string, dishId: string, price: number | null, now = new Date()) {
  const [d] = await db.select().from(dishes).where(and(eq(dishes.id, dishId), isNull(dishes.archivedAt)));
  if (!d || !(await ownedStall(db, ownerId, d.stallId))) return false;
  if (price !== null && (!Number.isInteger(price) || price < 1 || price >= d.price)) return false;
  await db.update(dishes).set(price === null ? { saleDay: null, salePrice: null } : { saleDay: manilaDay(now), salePrice: price }).where(eq(dishes.id, dishId));
  return true;
}

/** What is true of a dish today: sold out, and the sale price if one is running. */
export function todayState(d: { soldOutDay: string | null; saleDay: string | null; salePrice: number | null }, now = new Date()) {
  const today = manilaDay(now);
  return { soldOut: d.soldOutDay === today, salePrice: d.saleDay === today ? d.salePrice : null };
}

/** Owner opt-in publication per dish (D4). Returns false if the dish is not in one of this owner's stalls. */
export async function setPublished(db: Db, ownerId: string, dishId: string, published: boolean) {
  const [d] = await db.select().from(dishes).where(eq(dishes.id, dishId));
  if (!d || !(await ownedStall(db, ownerId, d.stallId))) return false;
  await db.update(dishes).set({ published }).where(eq(dishes.id, dishId));
  return true;
}

/** Paborito: at most three owner picks per stall. */
export async function setPaborito(db: Db, ownerId: string, dishId: string, on: boolean) {
  const [d] = await db.select().from(dishes).where(eq(dishes.id, dishId));
  if (!d || !(await ownedStall(db, ownerId, d.stallId))) return false;
  if (on) {
    const picks = await db.select({ id: dishes.id }).from(dishes).where(and(eq(dishes.stallId, d.stallId), eq(dishes.paborito, true)));
    if (!d.paborito && picks.length >= 3) return false;
  }
  await db.update(dishes).set({ paborito: on }).where(eq(dishes.id, dishId));
  return true;
}
