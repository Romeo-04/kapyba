// Sample data for demos: made-up karinderyas in real areas, with ratings, comments, daily logs and real dish photos.
// Every demo row can be found again and removed: stall codes start with "demo" (a real code never has an "o"),
// device hashes start with "demo:" (real ones are hex) and the extra owners use the reserved .invalid domain.
// Relative imports with .ts on purpose, so `node scripts/demo.ts` runs this file without a bundler.
import { eq, like } from "drizzle-orm";
import type { Db } from "../db/index.ts";
import { dailyLogs, devices, dishImages, dishes, owners, ratings, stalls } from "../db/schema.ts";

export const DEMO_CODE_PREFIX = "demo";
export const DEMO_OWNER_DOMAIN = "demo.kapyba.invalid";
const DAY = 86_400_000;
const ABOUT = "Sample karinderya for the KapyBa demo. Not a real stall, and its ratings are made up.";
const HOURS = "Mon to Sat, 6am to 3pm";

type Issue = "salt" | "plate" | "flame" | "coin";
type DishSeed = {
  name: string; photo: string; price: number; main: string; allergens: string[]; ingredients: string;
  mean: number; ratings: number; issue?: Issue; published?: boolean; paborito?: boolean; servings: number;
};
type StallSeed = { key: string; name: string; area: string; lat: number; lng: number; mine?: boolean; dishes: DishSeed[] };

const d = (name: string, photo: string, price: number, main: string, allergens: string[], ingredients: string, mean: number, ratings: number, servings: number, more: Partial<DishSeed> = {}): DishSeed =>
  ({ name, photo, price, main, allergens, ingredients, mean, ratings, servings, ...more });

const ADOBO = (price: number, mean: number, n: number, more: Partial<DishSeed> = {}) =>
  d("Chicken adobo", "adobo", price, "chicken", ["soy"], "chicken, soy sauce, vinegar, garlic, bay leaf", mean, n, 30, more);
const SINIGANG = (price: number, mean: number, n: number, more: Partial<DishSeed> = {}) =>
  d("Sinigang na baboy", "sinigang", price, "pork", ["fish"], "pork, tamarind, radish, kangkong, sitaw, patis", mean, n, 25, more);

/** The made-up stalls. Coordinates sit on public streets near each campus and are rounded like any stall's. */
export const DEMO_STALLS: StallSeed[] = [
  { key: "kapy", name: "Kusina ni Kapy (sample)", area: "UST", lat: 14.611, lng: 120.990, mine: true, dishes: [
    ADOBO(85, 4.3, 34),
    SINIGANG(95, 3.5, 26, { issue: "salt" }),
    d("Tortang talong", "tortang-talong", 60, "vegetables", ["egg"], "eggplant, egg, garlic", 4.6, 22, 20, { paborito: true }),
    d("Kare-kare", "kare-kare", 120, "beef", ["peanut", "shellfish"], "oxtail, peanut sauce, pechay, sitaw, bagoong", 3.2, 18, 15, { issue: "coin" }),
    d("Pinakbet", "pinakbet", 70, "vegetables", ["shellfish"], "squash, okra, eggplant, ampalaya, bagoong", 4.0, 7, 15, { published: false }),
  ] },
  { key: "pacing", name: "Lutong Bahay ni Aling Pacing (sample)", area: "UST", lat: 14.609, lng: 120.992, dishes: [
    ADOBO(80, 4.5, 30), SINIGANG(90, 4.3, 24),
    d("Pork menudo", "menudo", 85, "pork", [], "pork, liver, potato, carrot, tomato sauce", 4.0, 19, 20),
    d("Ginataang kalabasa", "ginataang-kalabasa", 65, "vegetables", ["shellfish"], "squash, sitaw, coconut milk, shrimp", 4.4, 16, 15),
  ] },
  { key: "dapitan", name: "Tapsihan sa Dapitan (sample)", area: "UST", lat: 14.612, lng: 120.988, dishes: [
    ADOBO(75, 3.9, 27), SINIGANG(85, 3.6, 21, { issue: "plate" }),
    d("Bistek Tagalog", "bistek", 95, "beef", ["soy"], "beef, soy sauce, calamansi, onion", 4.3, 20, 15),
    d("Tokwa't baboy", "tokwat-baboy", 70, "pork", ["soy"], "tofu, pork, vinegar, soy sauce, onion", 4.1, 14, 15),
  ] },
  { key: "hermanas", name: "Carinderia Dos Hermanas (sample)", area: "UST", lat: 14.608, lng: 120.989, dishes: [
    ADOBO(85, 4.0, 25), SINIGANG(95, 4.4, 23),
    d("Lechon kawali", "lechon-kawali", 110, "pork", [], "pork belly, garlic, salt, liver sauce", 4.7, 31, 20),
    d("Tinolang manok", "tinola", 80, "chicken", ["fish"], "chicken, green papaya, malunggay, ginger, patis", 3.8, 15, 15, { issue: "flame" }),
  ] },
  { key: "morayta", name: "Kainan sa Morayta (sample)", area: "FEU", lat: 14.604, lng: 120.987, dishes: [
    d("Pork sisig", "sisig", 95, "pork", ["egg"], "pork, onion, chili, calamansi, egg", 4.6, 33, 25),
    d("Pritong bangus", "bangus", 90, "fish", ["fish"], "milkfish, garlic, vinegar", 4.2, 21, 20),
    d("Chicken afritada", "afritada", 85, "chicken", [], "chicken, potato, carrot, bell pepper, tomato sauce", 3.7, 17, 20, { issue: "plate" }),
    d("Laing", "laing", 70, "vegetables", ["shellfish"], "taro leaves, coconut milk, chili, shrimp paste", 4.5, 13, 10),
  ] },
  { key: "berto", name: "Turo-turo ni Mang Berto (sample)", area: "FEU", lat: 14.603, lng: 120.985, dishes: [
    ADOBO(80, 4.1, 22),
    d("Pinakbet", "pinakbet", 65, "vegetables", ["shellfish"], "squash, okra, eggplant, ampalaya, bagoong", 4.3, 15, 15),
    d("Pork menudo", "menudo", 80, "pork", [], "pork, potato, carrot, raisins, tomato sauce", 3.4, 16, 20, { issue: "salt" }),
    d("Tortang talong", "tortang-talong", 55, "vegetables", ["egg"], "eggplant, egg, onion", 4.0, 12, 15),
  ] },
];

const HAPPY = [
  "Sulit! Ang dami ng serving.", "Parang luto ni Lola.", "Malambot ang karne, babalik ako.", "Tamang-tama ang timpla.",
  "Best ulam near campus.", "Mainit pa nung binili ko, sarap.", "Ang bait pa ni ate, sulit ang bayad.", "Perfect sa maraming kanin.",
  "Hindi nakakasawa, araw-araw ko na ito.", "Fresh and not oily.", "Panalo ang sabaw.", "Worth it for a student budget.",
];
const UNHAPPY: Record<Issue | "any", string[]> = {
  salt: ["Medyo maalat today.", "Too salty for me.", "Sobrang alat ng sabaw."],
  plate: ["Ang konti ng serving.", "Small portion for the price.", "Kulang sa laman."],
  flame: ["Malamig na nung binili ko.", "Lukewarm when served.", "Sana mainit pa."],
  coin: ["Medyo mahal para sa serving.", "A bit pricey.", "Sana mas mura ng kaunti."],
  any: ["Okay lang, walang espesyal.", "Hindi kasing sarap ng dati.", "Medyo matabang."],
};
const TAG_BIT: Record<Issue, number> = { salt: 1, plate: 2, flame: 4, coin: 8 }; // TAGS in src/domain/scoring.ts

/** Small seeded generator, so a re-seed makes the same story. */
function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const manilaDay = (t: number) => new Date(t + 8 * 3_600_000).toISOString().slice(0, 10);
/** Manila lunch time (11:00 to 13:59) on the day `ago` days before now, never in the future. */
const lunchOn = (now: number, ago: number, r: () => number) => {
  const day = manilaDay(now - ago * DAY);
  const at = Date.parse(`${day}T${String(11 + Math.floor(r() * 3)).padStart(2, "0")}:${String(Math.floor(r() * 60)).padStart(2, "0")}:00+08:00`);
  return Math.min(at, now - 60_000);
};

export type SeedResult = { stalls: number; dishes: number; ratings: number; logs: number; photos: number };

/**
 * Adds the sample stalls. `ownerEmail` owns the stall marked `mine`, so that person can sign in and see the owner side;
 * the other stalls belong to owners nobody can sign in as. Runs `removeDemo` first, so it can be repeated to refresh the dates.
 */
export async function seedDemo(db: Db, opts: { ownerEmail: string; photo: (slug: string) => Uint8Array | null; now?: Date }): Promise<SeedResult> {
  await removeDemo(db);
  const now = (opts.now ?? new Date()).getTime();
  const r = rng(20261031);
  const out: SeedResult = { stalls: 0, dishes: 0, ratings: 0, logs: 0, photos: 0 };

  const deviceRows = await db.insert(devices).values(Array.from({ length: 90 }, (_, i) => ({ tokenHash: `demo:${i}`, firstSeenAt: new Date(now - 40 * DAY) }))).returning({ id: devices.id });
  const deviceIds = deviceRows.map((x) => x.id);

  const email = opts.ownerEmail.trim().toLowerCase();
  await db.insert(owners).values({ email }).onConflictDoNothing();
  const [me] = await db.select({ id: owners.id }).from(owners).where(eq(owners.email, email));

  for (const s of DEMO_STALLS) {
    let ownerId = me.id;
    if (!s.mine) {
      const [o] = await db.insert(owners).values({ email: `${s.key}@${DEMO_OWNER_DOMAIN}` }).returning({ id: owners.id });
      ownerId = o.id;
    }
    const [stall] = await db.insert(stalls).values({
      ownerId, name: s.name, area: s.area, code: `${DEMO_CODE_PREFIX}${s.key}`, lat: String(s.lat), lng: String(s.lng), about: ABOUT, hours: HOURS,
      createdAt: new Date(now - 45 * DAY),
    }).returning({ id: stalls.id });
    out.stalls++;

    for (const ds of s.dishes) {
      const [dish] = await db.insert(dishes).values({
        stallId: stall.id, name: ds.name, icon: ds.main === "fish" ? "fish" : ds.main === "vegetables" ? "leaf" : /sinigang|tinola/i.test(ds.name) ? "bowl" : "meat",
        price: ds.price, baseServings: ds.servings, published: ds.published ?? true, paborito: ds.paborito ?? false,
        main: ds.main, ingredients: ds.ingredients, allergens: ds.allergens.join(",") || null,
      }).returning({ id: dishes.id });
      out.dishes++;

      const bytes = opts.photo(ds.photo);
      if (bytes) {
        await db.insert(dishImages).values({ dishId: dish.id, mime: "image/jpeg", data: Buffer.from(bytes).toString("base64"), updatedAt: new Date(now - 30 * DAY) });
        out.photos++;
      }

      // Ratings over the last four weeks, one per device per day, scores scattered around the dish's mean.
      const taken = new Set<string>();
      const rows: (typeof ratings.$inferInsert)[] = [];
      for (let tries = 0; rows.length < ds.ratings && tries < ds.ratings * 20; tries++) {
        const ago = Math.floor(r() * 28);
        const deviceId = deviceIds[Math.floor(r() * deviceIds.length)];
        const at = lunchOn(now, ago, r);
        const day = manilaDay(at);
        if (taken.has(`${deviceId}|${day}`)) continue;
        taken.add(`${deviceId}|${day}`);
        // A dish that improved lately: newer ratings lean a little higher, which the owner sees as a rising trend.
        const drift = ds.mean < 4 ? (14 - ago) / 40 : 0;
        const noise = (r() + r() + r() - 1.5) * 1.6;
        const score = Math.max(1, Math.min(5, Math.round(ds.mean + drift + noise)));
        let tags = 0;
        if (score <= 3 && ds.issue && r() < 0.75) tags |= TAG_BIT[ds.issue];
        if (score <= 2 && r() < 0.3) tags |= TAG_BIT[(["salt", "plate", "flame", "coin"] as const)[Math.floor(r() * 4)]];
        let comment: string | null = null;
        if (r() < 0.4) {
          const bank = score >= 4 ? HAPPY : UNHAPPY[ds.issue && score <= 3 ? ds.issue : "any"];
          comment = bank[Math.floor(r() * bank.length)];
        }
        rows.push({ dishId: dish.id, deviceId, score, tags, comment, day, idempotencyKey: `demo:${crypto.randomUUID()}`, createdAt: new Date(at) });
      }
      if (rows.length) await db.insert(ratings).values(rows);
      out.ratings += rows.length;

      // Cooked and sold for the last two weeks (closed on Sundays): good dishes sell out more often, and leftovers
      // shrink over the fortnight, as they would once an owner cooks to the plan.
      const logs: (typeof dailyLogs.$inferInsert)[] = [];
      for (let ago = 1; ago <= 14; ago++) {
        const t = now - ago * DAY;
        const day = manilaDay(t);
        if (new Date(`${day}T12:00:00+08:00`).getUTCDay() === 0) continue;
        const cooked = Math.max(5, Math.round(ds.servings * (0.85 + r() * 0.3)));
        const rate = Math.min(1, 0.74 + (ds.mean - 3) * 0.12 + (14 - ago) * 0.008 + (r() - 0.5) * 0.1);
        const sold = Math.min(cooked, Math.max(0, Math.round(cooked * rate)));
        logs.push({ stallId: stall.id, dishId: dish.id, day, cooked, sold, leftover: cooked - sold });
      }
      if (logs.length) await db.insert(dailyLogs).values(logs);
      out.logs += logs.length;
    }
  }
  return out;
}

/** Deletes every demo row and nothing else. Dishes, photos, ratings and logs go with their stall. */
export async function removeDemo(db: Db) {
  const gone = await db.delete(stalls).where(like(stalls.code, `${DEMO_CODE_PREFIX}%`)).returning({ id: stalls.id });
  await db.delete(devices).where(like(devices.tokenHash, "demo:%"));
  await db.delete(owners).where(like(owners.email, `%@${DEMO_OWNER_DOMAIN}`));
  return { stalls: gone.length };
}
