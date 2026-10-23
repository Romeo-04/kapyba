import { beforeEach, describe, expect, it } from "vitest";
import type { Db } from "@/src/db";
import { consumeLink, requestLink } from "@/src/services/auth";
import { createStall, updateStallInfo } from "@/src/services/stalls";
import { stallProfile } from "@/src/services/aggregates";
import { testDb } from "./helpers/testdb";

describe("karinderya info", () => {
  let db: Db;
  let a: string;
  let b: string;
  let stall: string;
  beforeEach(async () => {
    db = await testDb();
    a = (await consumeLink(db, (await requestLink(db, "a@x.co"))!))!;
    b = (await consumeLink(db, (await requestLink(db, "b@x.co"))!))!;
    stall = (await createStall(db, a, { name: "Rosa", area: "UST" }))!.id;
  });

  it("lets only the owner edit, and keeps name and area required", async () => {
    expect(await updateStallInfo(db, b, stall, { about: "hi" })).toBe(false);
    expect(await updateStallInfo(db, a, stall, { name: "  " })).toBe(false);
    expect(await updateStallInfo(db, a, stall, { name: "Rosa's", about: "  Fresh   ulam ", hours: "6am to 2pm" })).toBe(true);
    const p = await stallProfile(db, stall, new Date());
    expect(p).toMatchObject({ name: "Rosa's", about: "Fresh ulam", hours: "6am to 2pm", items: [] });
  });

  it("refuses links and phone numbers, and clears with an empty value", async () => {
    expect(await updateStallInfo(db, a, stall, { about: "visit https://x.co" })).toBe(false);
    expect(await updateStallInfo(db, a, stall, { hours: "call 09171234567" })).toBe(false);
    expect(await updateStallInfo(db, a, stall, { about: "x".repeat(241) })).toBe(false);
    await updateStallInfo(db, a, stall, { about: "hello" });
    expect(await updateStallInfo(db, a, stall, { about: "" })).toBe(true);
    expect((await stallProfile(db, stall, new Date()))!.about).toBeNull();
  });

  it("returns null for a bad or unknown id", async () => {
    expect(await stallProfile(db, "nope", new Date())).toBeNull();
    expect(await stallProfile(db, "00000000-0000-0000-0000-000000000000", new Date())).toBeNull();
  });
});
