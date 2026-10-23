// Kumpara: how a dish compares with the same dish at other stalls in the same area. Pure; no framework imports.
import { TAGS, type Tag } from "./scoring";

/** An average of fewer stalls could point at one neighbour, so it stays hidden below this (PLAN U11). */
export const MIN_PEER_STALLS = 3;

export type Peer = { score: number; tagShares: Record<Tag, number> };
export type Kumpara = { stalls: number; score: number; tagShares: Record<Tag, number> };

/** Dish names match ignoring case, spaces and accents ("Adobo " and "adobo" are the same dish). */
export const dishKey = (name: string) =>
  name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, " ").trim();

/** Mean across stalls (each stall counts once, whatever its rating volume); null until enough stalls qualify. */
export function neighbourhood(peers: Peer[]): Kumpara | null {
  if (peers.length < MIN_PEER_STALLS) return null;
  const n = peers.length;
  const tagShares = Object.fromEntries((Object.keys(TAGS) as Tag[]).map((t) => [t, 0])) as Record<Tag, number>;
  for (const t of Object.keys(tagShares) as Tag[]) tagShares[t] = peers.reduce((s, p) => s + p.tagShares[t], 0) / n;
  return { stalls: n, score: Math.round((peers.reduce((s, p) => s + p.score, 0) / n) * 10) / 10, tagShares };
}
