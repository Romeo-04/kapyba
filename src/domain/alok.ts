// Alok (owner-only deals) rules from IDEA.md section 7. Never conditional on a rating; cannot buy rank.
export const KINDS = ["combo", "suki", "oras"] as const;
export type AlokKind = (typeof KINDS)[number];

export type AlokInput = { dishId: string; kind: string; limit: number; endsAt?: string | null };

const FORBIDDEN_KEYS = ["rating", "ratings", "score", "review", "stars", "tag", "tags"];

export type Validation = { ok: true; value: { dishId: string; kind: AlokKind; limit: number; endsAt: string | null } } | { ok: false; error: string };

/** Validate an untrusted Alok payload. Rejects any field that links a deal to a rating. */
export function validateAlok(body: unknown): Validation {
  if (typeof body !== "object" || body === null) return { ok: false, error: "invalid body" };
  const b = body as Record<string, unknown>;
  for (const k of Object.keys(b)) {
    if (FORBIDDEN_KEYS.some((f) => k.toLowerCase().includes(f))) return { ok: false, error: "deal cannot reference a rating" };
  }
  const { dishId, kind, limit, endsAt } = b;
  if (typeof dishId !== "string" || dishId === "") return { ok: false, error: "dishId required" };
  if (typeof kind !== "string" || !(KINDS as readonly string[]).includes(kind)) return { ok: false, error: "unknown kind" };
  if (typeof limit !== "number" || !Number.isInteger(limit) || limit < 1 || limit > 500) return { ok: false, error: "limit must be 1 to 500" };
  if (kind === "oras" && typeof endsAt !== "string") return { ok: false, error: "oras needs an end time" };
  if (endsAt != null && Number.isNaN(Date.parse(String(endsAt)))) return { ok: false, error: "bad endsAt" };
  return { ok: true, value: { dishId, kind: kind as AlokKind, limit, endsAt: endsAt ? String(endsAt) : null } };
}

export type AlokState = { limit: number; claimed: number; endsAt: Date | null; closedAt: Date | null };

export const remaining = (a: AlokState) => Math.max(0, a.limit - a.claimed);
export const isActive = (a: AlokState, now: Date) =>
  a.closedAt === null && remaining(a) > 0 && (a.endsAt === null || a.endsAt > now);
