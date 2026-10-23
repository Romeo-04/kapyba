import { sql } from "drizzle-orm";
import {
  boolean, check, date, index, integer, pgTable, smallint, text, timestamp, uniqueIndex, uuid,
} from "drizzle-orm/pg-core";

const id = () => uuid("id").primaryKey().default(sql`gen_random_uuid()`);
const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

export const owners = pgTable("owners", {
  id: id(),
  email: text("email").notNull().unique(),
  notifiedAt: timestamp("notified_at", { withTimezone: true }), // ratings newer than this are unread in the owner's inbox
  createdAt: createdAt(),
});

export const stalls = pgTable("stalls", {
  id: id(),
  ownerId: uuid("owner_id").notNull().references(() => owners.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  code: text("code").notNull().unique(), // short, unguessable; goes in the QR
  area: text("area").notNull(),
  lat: text("lat"), // rounded on write
  lng: text("lng"),
  bagyoUntil: timestamp("bagyo_until", { withTimezone: true }), // owner's Bagyo switch, lapses on its own
  createdAt: createdAt(),
}, (t) => [index("stalls_area_idx").on(t.area)]);

export const dishes = pgTable("dishes", {
  id: id(),
  stallId: uuid("stall_id").notNull().references(() => stalls.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  price: integer("price").notNull(), // whole pesos
  baseServings: integer("base_servings").notNull().default(0),
  category: text("category"),
  published: boolean("published").notNull().default(false), // owner opt-in
  paborito: boolean("paborito").notNull().default(false),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
  // Naubos and Sale last for one Manila day, so a forgotten tap never lingers into tomorrow.
  soldOutDay: date("sold_out_day"),
  saleDay: date("sale_day"),
  salePrice: integer("sale_price"),
  main: text("main"), // main ingredient tag, one of MAINS (src/domain/mains.ts)
  ingredients: text("ingredients"), // the owner's own list, comma separated
  allergens: text("allergens"), // declared allergens, comma separated ids from ALLERGENS
}, (t) => [index("dishes_stall_idx").on(t.stallId)]);

// One small photo per dish, already shrunk by the owner's phone. Base64 text keeps it in the same database, with no file store to set up.
export const dishImages = pgTable("dish_images", {
  dishId: uuid("dish_id").primaryKey().references(() => dishes.id, { onDelete: "cascade" }),
  mime: text("mime").notNull(),
  data: text("data").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const devices = pgTable("devices", {
  id: id(),
  tokenHash: text("token_hash").notNull().unique(),
  firstSeenAt: createdAt(),
});

export const ratings = pgTable("ratings", {
  id: id(),
  dishId: uuid("dish_id").notNull().references(() => dishes.id, { onDelete: "cascade" }),
  deviceId: uuid("device_id").notNull().references(() => devices.id, { onDelete: "cascade" }),
  score: smallint("score").notNull(),
  tags: smallint("tags").notNull().default(0), // bitmask, see TAGS in src/domain/scoring.ts
  comment: text("comment"), // optional, 140 characters at most; only a happy, clean rating can ever be shown as a testimony
  day: date("day").notNull(),
  idempotencyKey: text("idempotency_key").notNull(),
  status: text("status").notNull().default("ok"), // ok | flagged | removed
  createdAt: createdAt(),
}, (t) => [
  uniqueIndex("ratings_one_per_day").on(t.dishId, t.deviceId, t.day),
  uniqueIndex("ratings_idem").on(t.idempotencyKey),
  index("ratings_dish_day_idx").on(t.dishId, t.day),
  check("ratings_score_range", sql`${t.score} between 1 and 5`),
  check("ratings_status_valid", sql`${t.status} in ('ok','flagged','removed')`),
]);

export const dailyLogs = pgTable("daily_logs", {
  id: id(),
  stallId: uuid("stall_id").notNull().references(() => stalls.id, { onDelete: "cascade" }),
  dishId: uuid("dish_id").notNull().references(() => dishes.id, { onDelete: "cascade" }),
  day: date("day").notNull(),
  cooked: integer("cooked").notNull().default(0),
  sold: integer("sold").notNull().default(0),
  leftover: integer("leftover").notNull().default(0),
}, (t) => [uniqueIndex("daily_logs_dish_day").on(t.dishId, t.day)]);

export const alok = pgTable("alok", {
  id: id(),
  stallId: uuid("stall_id").notNull().references(() => stalls.id, { onDelete: "cascade" }),
  dishId: uuid("dish_id").notNull().references(() => dishes.id, { onDelete: "cascade" }),
  kind: text("kind").notNull(), // combo | suki | oras
  limit: integer("limit").notNull(),
  claimed: integer("claimed").notNull().default(0),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull().defaultNow(),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  closedAt: timestamp("closed_at", { withTimezone: true }),
}, (t) => [
  index("alok_stall_idx").on(t.stallId),
  check("alok_kind_valid", sql`${t.kind} in ('combo','suki','oras')`),
  check("alok_limit_positive", sql`${t.limit} > 0`),
]);

export const alokClaims = pgTable("alok_claims", {
  id: id(),
  alokId: uuid("alok_id").notNull().references(() => alok.id, { onDelete: "cascade" }),
  deviceId: uuid("device_id").notNull().references(() => devices.id, { onDelete: "cascade" }),
  createdAt: createdAt(),
}, (t) => [uniqueIndex("alok_claims_one_per_device").on(t.alokId, t.deviceId)]);

export const reports = pgTable("reports", {
  id: id(),
  stallId: uuid("stall_id").notNull().references(() => stalls.id, { onDelete: "cascade" }),
  dishId: uuid("dish_id").notNull().references(() => dishes.id, { onDelete: "cascade" }),
  windowStart: timestamp("window_start", { withTimezone: true }).notNull(),
  windowEnd: timestamp("window_end", { withTimezone: true }).notNull(),
  reason: text("reason"),
  status: text("status").notNull().default("open"), // open | upheld | rejected
  reviewerNote: text("reviewer_note"),
  createdAt: createdAt(),
});

export const events = pgTable("events", {
  id: id(),
  stallId: uuid("stall_id").references(() => stalls.id, { onDelete: "set null" }),
  actor: text("actor").notNull(), // owner id, reviewer, or system
  kind: text("kind").notNull(),
  detail: text("detail"),
  createdAt: createdAt(),
});

export const loginTokens = pgTable("login_tokens", {
  id: id(),
  email: text("email").notNull(),
  tokenHash: text("token_hash").notNull().unique(), // sha256 of the emailed token; the raw token is never stored
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: createdAt(),
}, (t) => [index("login_tokens_email_idx").on(t.email)]);

// Recent hits per limiter key (for example "auth-ip:1.2.3.4"). Lives in the database because
// serverless instances share no memory. Old rows are deleted as new hits arrive.
export const rateHits = pgTable("rate_hits", {
  id: id(),
  key: text("key").notNull(),
  at: timestamp("at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("rate_hits_key_at_idx").on(t.key, t.at)]);
