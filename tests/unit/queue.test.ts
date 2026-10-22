import { describe, expect, it } from "vitest";
import { enqueue, flush, pending } from "@/src/offline/queue";

const fakeStore = () => {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) };
};
const answer = (...statuses: (number | "throw")[]) => {
  const calls: string[] = [];
  const f = (async (_u: string, init: RequestInit) => {
    calls.push(JSON.parse(init.body as string).n);
    const s = statuses.shift()!;
    if (s === "throw") throw new Error("offline");
    return new Response("{}", { status: s });
  }) as unknown as typeof fetch;
  return { f, calls };
};
const job = (id: string) => ({ id, url: "/api/x", body: { n: id } });

describe("outbox", () => {
  it("keeps jobs while offline and sends them once, oldest first", async () => {
    const s = fakeStore();
    enqueue(s, job("a")); enqueue(s, job("b")); enqueue(s, job("a"));
    expect(pending(s)).toBe(2);
    expect(await flush(s, answer("throw").f)).toEqual({ sent: 0, dropped: 0, left: 2 });
    const up = answer(201, 201);
    expect(await flush(s, up.f)).toEqual({ sent: 2, dropped: 0, left: 0 });
    expect(up.calls).toEqual(["a", "b"]);
    expect(await flush(s, answer().f)).toEqual({ sent: 0, dropped: 0, left: 0 });
  });

  it("stops on a server error or rate limit, counts 409 as sent, drops other 4xx", async () => {
    const s = fakeStore();
    for (const id of ["a", "b", "c", "d"]) enqueue(s, job(id));
    expect(await flush(s, answer(409, 403, 503).f)).toEqual({ sent: 1, dropped: 1, left: 2 });
    expect(await flush(s, answer(429).f)).toEqual({ sent: 0, dropped: 0, left: 2 });
  });
});
