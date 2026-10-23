import { and, eq, gt, isNull, lt, or, sql } from "drizzle-orm";
import type { Db } from "@/src/db";
import { alok, alokClaims, dishes, events } from "@/src/db/schema";
import { isActive, remaining, validateAlok } from "@/src/domain/alok";
import { deviceFor } from "./ratings";
import { ownedStall } from "./stalls";

export const MAX_ACTIVE_PER_STALL = 5;

/** Owner posts a deal. Returns an error string for the UI, or the new deal. */
export async function postAlok(db: Db, ownerId: string, stallId: string, body: unknown, now = new Date()) {
  const v = validateAlok(body);
  if (!v.ok) return { error: v.error } as const;
  if (!(await ownedStall(db, ownerId, stallId))) return { error: "not found" } as const;
  const [dish] = await db.select({ id: dishes.id }).from(dishes).where(and(eq(dishes.id, v.value.dishId), eq(dishes.stallId, stallId)));
  if (!dish) return { error: "dish not in this stall" } as const;
  if (v.value.endsAt && new Date(v.value.endsAt) <= now) return { error: "end time is in the past" } as const;

  const live = await listAlok(db, ownerId, stallId, now);
  if (live && live.filter((a) => a.active).length >= MAX_ACTIVE_PER_STALL) return { error: "too many active deals" } as const;

  const [row] = await db.insert(alok).values({
    stallId, dishId: v.value.dishId, kind: v.value.kind, limit: v.value.limit, startsAt: now,
    endsAt: v.value.endsAt ? new Date(v.value.endsAt) : null,
  }).returning();
  await db.insert(events).values({ stallId, actor: ownerId, kind: "alok_posted", detail: `${row.kind} x${row.limit}` });
  return { alok: row } as const;
}

export async function listAlok(db: Db, ownerId: string, stallId: string, now = new Date()) {
  if (!(await ownedStall(db, ownerId, stallId))) return null;
  const rows = await db.select().from(alok).where(eq(alok.stallId, stallId));
  return rows.map((a) => ({ ...a, remaining: remaining(a), active: isActive(a, now) }));
}

export async function closeAlok(db: Db, ownerId: string, alokId: string, now = new Date()) {
  const [a] = await db.select().from(alok).where(eq(alok.id, alokId));
  if (!a || !(await ownedStall(db, ownerId, a.stallId))) return false;
  await db.update(alok).set({ closedAt: now }).where(and(eq(alok.id, alokId), isNull(alok.closedAt)));
  await db.insert(events).values({ stallId: a.stallId, actor: ownerId, kind: "alok_closed", detail: alokId });
  return true;
}

export type ClaimResult = "ok" | "already" | "gone" | "invalid";

/**
 * A buyer device reserves one spot. The unique index stops a device claiming twice; the guarded
 * update below is what makes the limit hold under concurrent claims: it only increments while
 * the deal is open, unexpired and under its limit. If it loses, the claim row is removed again.
 */
export async function claimAlok(db: Db, deviceToken: string, alokId: string, now = new Date()): Promise<ClaimResult> {
  if (!deviceToken || !/^[0-9a-f-]{36}$/i.test(alokId)) return "invalid";
  const [a] = await db.select({ id: alok.id }).from(alok).where(eq(alok.id, alokId));
  if (!a) return "invalid";
  const deviceId = await deviceFor(db, deviceToken);

  const inserted = await db.insert(alokClaims).values({ alokId, deviceId }).onConflictDoNothing().returning({ id: alokClaims.id });
  if (inserted.length === 0) return "already";

  const won = await db.update(alok).set({ claimed: sql`${alok.claimed} + 1` }).where(and(
    eq(alok.id, alokId), isNull(alok.closedAt), lt(alok.claimed, alok.limit), or(isNull(alok.endsAt), gt(alok.endsAt, now)),
  )).returning({ id: alok.id });
  if (won.length === 0) {
    await db.delete(alokClaims).where(eq(alokClaims.id, inserted[0].id));
    return "gone";
  }
  return "ok";
}

/** The active deals this phone has reserved, so the board can show a Reserved status that survives a refresh. */
export async function myClaims(db: Db, deviceToken: string, now = new Date()): Promise<{ alokId: string; dishId: string }[]> {
  if (!deviceToken) return [];
  const deviceId = await deviceFor(db, deviceToken);
  const rows = await db
    .select({ alokId: alok.id, dishId: alok.dishId })
    .from(alokClaims)
    .innerJoin(alok, eq(alok.id, alokClaims.alokId))
    .where(and(eq(alokClaims.deviceId, deviceId), isNull(alok.closedAt), or(isNull(alok.endsAt), gt(alok.endsAt, now))));
  return rows;
}

/** Active deals by dish id, for the board ribbon. */
export async function activeAlokByDish(db: Db, now = new Date()) {
  const rows = await db.select().from(alok).where(and(isNull(alok.closedAt), or(isNull(alok.endsAt), gt(alok.endsAt, now))));
  const out = new Map<string, { id: string; kind: string; remaining: number; endsAt: string | null }>();
  for (const a of rows) {
    if (remaining(a) > 0) out.set(a.dishId, { id: a.id, kind: a.kind, remaining: remaining(a), endsAt: a.endsAt ? a.endsAt.toISOString() : null });
  }
  return out;
}
