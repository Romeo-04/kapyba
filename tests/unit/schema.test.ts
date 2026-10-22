import { PGlite } from "@electric-sql/pglite";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";

const dir = join(__dirname, "../../src/db/migrations");
let db: PGlite;
let dish: string, device: string;

beforeAll(async () => {
  db = new PGlite();
  for (const f of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
    for (const stmt of readFileSync(join(dir, f), "utf8").split("--> statement-breakpoint")) {
      await db.exec(stmt);
    }
  }
  const o = await db.query<{ id: string }>("insert into owners(email) values ('a@b.c') returning id");
  const s = await db.query<{ id: string }>(
    "insert into stalls(owner_id,name,code,area) values ($1,'Rosa','abc123','UST') returning id", [o.rows[0].id]);
  const d = await db.query<{ id: string }>(
    "insert into dishes(stall_id,name,icon,price) values ($1,'Adobo','adobo',70) returning id", [s.rows[0].id]);
  const v = await db.query<{ id: string }>("insert into devices(token_hash) values ('h1') returning id");
  dish = d.rows[0].id;
  device = v.rows[0].id;
});

const rate = (key: string, day: string, score = 4) =>
  db.query("insert into ratings(dish_id,device_id,score,day,idempotency_key) values ($1,$2,$3,$4,$5)",
    [dish, device, score, day, key]);

describe("ratings constraints", () => {
  it("accepts a first rating", async () => {
    await expect(rate("k1", "2026-10-22")).resolves.toBeTruthy();
  });
  it("rejects a second rating for the same dish, device and day", async () => {
    await expect(rate("k2", "2026-10-22")).rejects.toThrow();
  });
  it("allows the same device to rate the dish the next day", async () => {
    await expect(rate("k3", "2026-10-23")).resolves.toBeTruthy();
  });
  it("rejects a replayed idempotency key", async () => {
    await expect(rate("k3", "2026-10-24")).rejects.toThrow();
  });
  it("rejects scores outside 1 to 5", async () => {
    await expect(rate("k4", "2026-10-25", 6)).rejects.toThrow();
    await expect(rate("k5", "2026-10-25", 0)).rejects.toThrow();
  });
});

describe("alok constraints", () => {
  it("rejects an unknown kind and a non-positive limit", async () => {
    const s = (await db.query<{ id: string }>("select id from stalls")).rows[0].id;
    await expect(db.query("insert into alok(stall_id,dish_id,kind,\"limit\") values ($1,$2,'discount',5)", [s, dish])).rejects.toThrow();
    await expect(db.query("insert into alok(stall_id,dish_id,kind,\"limit\") values ($1,$2,'combo',0)", [s, dish])).rejects.toThrow();
  });
});
