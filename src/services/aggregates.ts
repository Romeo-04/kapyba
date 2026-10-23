import { and, desc, eq, gte, inArray, isNotNull, isNull, ne } from "drizzle-orm";
import type { Db } from "@/src/db";
import { dishes, ratings, stalls } from "@/src/db/schema";
import { publicGate, type Gate } from "@/src/domain/gate";
import { mainComplaint, mismatch, recsFor, type Rec } from "@/src/domain/recommend";
import { distinctBuyers, improving, meanScore, tagShares, tone, weeklyTrend, type Tag, type Tone } from "@/src/domain/scoring";
import { allergenList, type Allergen } from "@/src/domain/allergens";
import { dishKey, neighbourhood, type Kumpara } from "@/src/domain/kumpara";
import { activeAlokByDish } from "./alok";
import { imageVersions } from "./photos";
import { manilaDay } from "./ratings";
import { todayState } from "./stalls";

export const WINDOW_DAYS = 30;

type Row = { dishId: string; deviceId: string; score: number; tags: number; day: string; status: string };

async function windowRows(db: Db, dishIds: string[], now: Date, statuses: string[]): Promise<Map<string, Row[]>> {
  const out = new Map<string, Row[]>();
  if (dishIds.length === 0) return out;
  const since = manilaDay(new Date(now.getTime() - WINDOW_DAYS * 86_400_000));
  const rows = await db
    .select({ dishId: ratings.dishId, deviceId: ratings.deviceId, score: ratings.score, tags: ratings.tags, day: ratings.day, status: ratings.status })
    .from(ratings)
    .where(and(inArray(ratings.dishId, dishIds), gte(ratings.day, since), inArray(ratings.status, statuses)));
  for (const r of rows) (out.get(r.dishId) ?? out.set(r.dishId, []).get(r.dishId)!).push(r);
  return out;
}

/**
 * Other stalls' published dishes in the same area that pass the public gate on clean ratings,
 * grouped by dish name. One entry per stall (its strongest matching dish), so a stall cannot count twice.
 */
async function peerDishes(db: Db, area: string, exceptStallId: string, now: Date) {
  const rows = await db
    .select({ id: dishes.id, name: dishes.name, stallId: dishes.stallId })
    .from(dishes)
    .innerJoin(stalls, eq(stalls.id, dishes.stallId))
    .where(and(eq(stalls.area, area), ne(stalls.id, exceptStallId), eq(dishes.published, true), isNull(dishes.archivedAt)));
  const byDish = await windowRows(db, rows.map((r) => r.id), now, ["ok"]);
  const best = new Map<string, { count: number; score: number; tagShares: ReturnType<typeof tagShares> }>(); // key: dish name + stall
  const out = new Map<string, { score: number; tagShares: ReturnType<typeof tagShares> }[]>();
  for (const r of rows) {
    const rs = byDish.get(r.id) ?? [];
    if (publicGate(rs.length, distinctBuyers(rs), true).state !== "public") continue;
    const k = `${dishKey(r.name)}|${r.stallId}`;
    if (best.has(k) && best.get(k)!.count >= rs.length) continue;
    best.set(k, { count: rs.length, score: meanScore(rs)!, tagShares: tagShares(rs) });
  }
  for (const [k, v] of best) {
    const name = k.slice(0, k.lastIndexOf("|"));
    (out.get(name) ?? out.set(name, []).get(name)!).push({ score: v.score, tagShares: v.tagShares });
  }
  return out;
}

export type OwnerDish = {
  id: string; name: string; icon: string; price: number; baseServings: number;
  published: boolean; paborito: boolean;
  main: string | null; ingredients: string | null; allergens: Allergen[];
  soldOut: boolean; salePrice: number | null;
  /** Version stamp of the dish photo (use in ?v=), or null when there is none. */
  imageV: number | null;
  /** Everything the owner can see, including ratings under review. */
  private: { count: number; buyers: number; score: number | null; tone: Tone | null; tagShares: Record<Tag, number>; improving: boolean; trend: (number | null)[] };
  /** The latest comments buyers left, any score, for the owner only. */
  comments: { score: number; text: string; at: string }[];
  /** What the public would see: removed and under-review ratings excluded. */
  gate: Gate;
  /** Same dish at 3+ other qualifying stalls in this area; null otherwise. */
  kumpara: Kumpara | null;
  flagged: number;
  pansin: -1 | 0 | 1;
  recs: Rec[];
};

/** The owner's private view of one stall (UX O1 and O2). Returns null if the stall is not theirs. */
export async function ownerSummary(db: Db, ownerId: string, stallId: string, now = new Date()): Promise<OwnerDish[] | null> {
  const [stall] = await db.select({ id: stalls.id, area: stalls.area }).from(stalls).where(and(eq(stalls.id, stallId), eq(stalls.ownerId, ownerId)));
  if (!stall) return null;
  const list = await db.select().from(dishes).where(and(eq(dishes.stallId, stallId), isNull(dishes.archivedAt)));
  const byDish = await windowRows(db, list.map((d) => d.id), now, ["ok", "flagged"]);
  const today = manilaDay(now);
  const peers = await peerDishes(db, stall.area, stallId, now);
  const photos = await imageVersions(db, list.map((d) => d.id));
  const notes = await ownerComments(db, list.map((d) => d.id));

  return list.map((d) => {
    const all = byDish.get(d.id) ?? [];
    const clean = all.filter((r) => r.status === "ok");
    const score = meanScore(all);
    const shares = tagShares(all);
    const view = { score: score ?? 0, count: all.length, baseServings: d.baseServings, tagShares: shares, bad: mainComplaint(shares) };
    return {
      id: d.id, name: d.name, icon: d.icon, price: d.price, baseServings: d.baseServings,
      published: d.published, paborito: d.paborito, main: d.main, ingredients: d.ingredients, allergens: allergenList(d.allergens), imageV: photos.get(d.id) ?? null, ...todayState(d, now),
      comments: notes.get(d.id) ?? [],
      private: { count: all.length, buyers: distinctBuyers(all), score, tone: score === null ? null : tone(score), tagShares: shares, improving: improving(all, today), trend: weeklyTrend(all, today) },
      gate: publicGate(clean.length, distinctBuyers(clean), d.published),
      kumpara: neighbourhood(peers.get(dishKey(d.name)) ?? []),
      flagged: all.length - clean.length,
      pansin: score === null ? 0 : mismatch(view),
      recs: score === null ? [] : recsFor(view),
    };
  });
}

export type AlokRibbon = { id: string; kind: string; remaining: number; endsAt: string | null };

export type BoardItem =
  | { kind: "scored"; dishId: string; stallName: string; area: string; name: string; icon: string; price: number; score: number; tone: Tone; count: number; sulit: boolean; improving: boolean; alok: AlokRibbon | null; soldOut: boolean; salePrice: number | null; imageV: number | null; main: string | null; ingredients: string | null; allergens: Allergen[] }
  | { kind: "paborito"; dishId: string; stallName: string; area: string; name: string; icon: string; price: number; alok: AlokRibbon | null; soldOut: boolean; salePrice: number | null; imageV: number | null; main: string | null; ingredients: string | null; allergens: Allergen[] };

/**
 * The public Ulam board. Only published dishes that pass the gate show a score; a Paborito
 * pick with no score yet shows as an owner's pick. Removed and under-review ratings never count.
 * Order (my call): score high to low, then price low to high. Sulit = a happy dish priced at or under the board median.
 */
export async function publicBoard(db: Db, opts: { area?: string; maxPrice?: number } = {}, now = new Date()): Promise<BoardItem[]> {
  const conds = [isNull(dishes.archivedAt)];
  if (opts.area) conds.push(eq(stalls.area, opts.area));
  const list = await db
    .select({ id: dishes.id, name: dishes.name, icon: dishes.icon, price: dishes.price, published: dishes.published, paborito: dishes.paborito, main: dishes.main, ingredients: dishes.ingredients, allergens: dishes.allergens, soldOutDay: dishes.soldOutDay, saleDay: dishes.saleDay, salePrice: dishes.salePrice, stallName: stalls.name, area: stalls.area })
    .from(dishes)
    .innerJoin(stalls, eq(stalls.id, dishes.stallId))
    .where(and(...conds));
  const byDish = await windowRows(db, list.map((d) => d.id), now, ["ok"]);
  const today = manilaDay(now);
  const deals = await activeAlokByDish(db, now);
  const photos = await imageVersions(db, list.map((d) => d.id));

  const scored: Extract<BoardItem, { kind: "scored" }>[] = [];
  const picks: Extract<BoardItem, { kind: "paborito" }>[] = [];
  for (const d of list) {
    if (opts.maxPrice !== undefined && d.price > opts.maxPrice) continue;
    const rows = byDish.get(d.id) ?? [];
    const gate = publicGate(rows.length, distinctBuyers(rows), d.published);
    if (gate.state === "public") {
      const score = meanScore(rows)!;
      scored.push({ kind: "scored", dishId: d.id, stallName: d.stallName, area: d.area, name: d.name, icon: d.icon, price: d.price, score, tone: tone(score), count: rows.length, sulit: false, improving: improving(rows, today), alok: deals.get(d.id) ?? null, imageV: photos.get(d.id) ?? null, main: d.main, ingredients: d.ingredients, allergens: allergenList(d.allergens), ...todayState(d, now) });
    } else if (d.paborito) {
      picks.push({ kind: "paborito", dishId: d.id, stallName: d.stallName, area: d.area, name: d.name, icon: d.icon, price: d.price, alok: deals.get(d.id) ?? null, imageV: photos.get(d.id) ?? null, main: d.main, ingredients: d.ingredients, allergens: allergenList(d.allergens), ...todayState(d, now) });
    }
  }
  const prices = scored.map((s) => s.price).sort((a, b) => a - b);
  const median = prices.length ? prices[Math.floor((prices.length - 1) / 2)] : 0;
  for (const s of scored) s.sulit = s.tone === "happy" && s.price <= median;
  scored.sort((a, b) => b.score - a.score || a.price - b.price);
  // Deals (an Alok or a sale, still available) come first, each group keeping its score order.
  const isDeal = (i: BoardItem) => !i.soldOut && (i.alok !== null || i.salePrice !== null);
  const all = [...scored, ...picks];
  return [...all.filter(isDeal), ...all.filter((i) => !isDeal(i))];
}

export const TESTIMONY_MIN_SCORE = 4;
export const TESTIMONY_LIMIT = 5;
export type Testimony = { text: string; score: number; at: string };

/**
 * Comments buyers may see on a dish. Only a published dish that passes the public gate shows any, and only clean,
 * happy ratings (4 or 5) count. Lower scores and their comments stay with the owner. Nothing says who wrote it.
 */
export async function testimonies(db: Db, dishId: string, now = new Date()): Promise<Testimony[]> {
  const [d] = await db.select({ published: dishes.published }).from(dishes).where(and(eq(dishes.id, dishId), isNull(dishes.archivedAt)));
  if (!d) return [];
  const rows = (await windowRows(db, [dishId], now, ["ok"])).get(dishId) ?? [];
  if (publicGate(rows.length, distinctBuyers(rows), d.published).state !== "public") return [];
  const found = await db
    .select({ text: ratings.comment, score: ratings.score, at: ratings.createdAt })
    .from(ratings)
    .where(and(eq(ratings.dishId, dishId), eq(ratings.status, "ok"), isNotNull(ratings.comment), gte(ratings.score, TESTIMONY_MIN_SCORE)))
    .orderBy(desc(ratings.createdAt))
    .limit(TESTIMONY_LIMIT);
  return found.map((r) => ({ text: r.text!, score: r.score, at: r.at.toISOString() }));
}

/** The owner's own view: the latest few comments per dish, any score, not removed. */
async function ownerComments(db: Db, dishIds: string[]) {
  const out = new Map<string, { score: number; text: string; at: string }[]>();
  if (dishIds.length === 0) return out;
  const rows = await db
    .select({ dishId: ratings.dishId, text: ratings.comment, score: ratings.score, at: ratings.createdAt })
    .from(ratings)
    .where(and(inArray(ratings.dishId, dishIds), ne(ratings.status, "removed"), isNotNull(ratings.comment)))
    .orderBy(desc(ratings.createdAt))
    .limit(200);
  for (const r of rows) {
    const list = out.get(r.dishId) ?? out.set(r.dishId, []).get(r.dishId)!;
    if (list.length < 5) list.push({ score: r.score, text: r.text!, at: r.at.toISOString() });
  }
  return out;
}
