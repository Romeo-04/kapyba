import { beforeEach, describe, expect, it } from "vitest";
import type { Db } from "@/src/db";
import { BAGYO_FACTOR, RAIN_FACTOR, weatherFactor } from "@/src/domain/weather";
import { consumeLink, requestLink } from "@/src/services/auth";
import { addDish, createStall } from "@/src/services/stalls";
import { bukasPlan } from "@/src/services/logs";
import { rainChanceTomorrow, setBagyo, stallWeather } from "@/src/services/weather";
import { testDb } from "./helpers/testdb";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const NOW = new Date("2026-10-22T04:00:00Z");
const forecast = (p: unknown): typeof fetch => (async () => new Response(JSON.stringify({ daily: { precipitation_probability_max: [10, p] } }))) as typeof fetch;

describe("weather factor", () => {
  it("trims on a high rain chance, more on Bagyo, never when unknown", () => {
    expect(weatherFactor(30, false).factor).toBe(1);
    expect(weatherFactor(70, false).factor).toBe(RAIN_FACTOR);
    expect(weatherFactor(null, false).factor).toBe(1);
    expect(weatherFactor(10, true).factor).toBe(BAGYO_FACTOR);
  });
});

describe("Open-Meteo reader", () => {
  it("reads tomorrow, and returns null for a bad answer or a failure", async () => {
    expect(await rainChanceTomorrow("1", "2", forecast(80))).toBe(80);
    expect(await rainChanceTomorrow("1", "2", forecast("x"))).toBeNull();
    expect(await rainChanceTomorrow("1", "2", (async () => { throw new Error("offline"); }) as typeof fetch)).toBeNull();
    expect(await rainChanceTomorrow("1", "2", (async () => new Response("no", { status: 500 })) as typeof fetch)).toBeNull();
  });
});

describe("Bagyo switch", () => {
  let db: Db, owner: string, other: string, stallId: string;
  beforeEach(async () => {
    db = await testDb();
    owner = (await consumeLink(db, (await requestLink(db, "a@x.co"))!))!;
    other = (await consumeLink(db, (await requestLink(db, "b@x.co"))!))!;
    stallId = (await createStall(db, owner, { name: "Rosa", area: "UST" }))!.id;
    await addDish(db, owner, stallId, { name: "Adobo", icon: "adobo", price: 70, baseServings: 10 });
  });

  it("holds for 24 hours, then lapses; only the owner can set it", async () => {
    expect(await setBagyo(db, other, stallId, true, NOW)).toBeNull();
    await setBagyo(db, owner, stallId, true, NOW);
    expect((await stallWeather(db, owner, stallId, new Date(NOW.getTime() + 3_600_000), forecast(0)))?.bagyo).toBe(true);
    expect((await stallWeather(db, owner, stallId, new Date(NOW.getTime() + 25 * 3_600_000), forecast(0)))?.bagyo).toBe(false);
    await setBagyo(db, owner, stallId, true, NOW);
    await setBagyo(db, owner, stallId, false, NOW);
    expect((await stallWeather(db, owner, stallId, NOW, forecast(0)))?.bagyo).toBe(false);
  });

  it("shrinks tomorrow's plan", async () => {
    const w = (await stallWeather(db, owner, stallId, NOW, forecast(90)))!;
    const plan = await bukasPlan(db, owner, stallId, NOW, w.factor);
    expect(plan![0].plan?.servings).toBe(9); // 10 usual × 0.85 = 8.5, rounds to 9
    expect(plan![0].plan?.reasons).toContain("weather");
  });
});

describe("Bagyo wording (RA 10607)", () => {
  const banned = /\b(insurance|insured|covered|guaranteed)\b/i;
  const walk = (dir: string): string[] =>
    readdirSync(dir).flatMap((f) => {
      const p = join(dir, f);
      return statSync(p).isDirectory() ? walk(p) : /\.(tsx?)$/.test(f) && !/\.test\./.test(f) ? [p] : [];
    });

  it("no shipped screen or domain string says insurance, covered or guaranteed", () => {
    const hits = [...walk("app"), ...walk("src")].filter((f) => banned.test(readFileSync(f, "utf8")));
    expect(hits).toEqual([]);
  });
});
