// A tiny outbox for taps made without signal. Every job carries what the server needs to treat a
// replay as a no-op (ratings: an idempotency key; Natira: replaces the same dish and day), so a
// retry after a half-finished send never counts twice.
const KEY = "kb_outbox";

export type Job = { id: string; url: string; body: unknown };
export type FlushResult = { sent: number; dropped: number; left: number };

const read = (store: Pick<Storage, "getItem">): Job[] => {
  try {
    const v = JSON.parse(store.getItem(KEY) ?? "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
};
const write = (store: Pick<Storage, "setItem">, jobs: Job[]) => store.setItem(KEY, JSON.stringify(jobs));

export const pending = (store: Pick<Storage, "getItem">) => read(store).length;

export function enqueue(store: Pick<Storage, "getItem" | "setItem">, job: Job) {
  const jobs = read(store);
  if (!jobs.some((j) => j.id === job.id)) write(store, [...jobs, job]);
}

let flushing = false;

/**
 * Sends jobs oldest first. A network error, 5xx or 429 stops the flush and keeps the rest.
 * Any other answer removes the job: success, 409 (already counted) or a 4xx the server will never accept.
 */
export async function flush(store: Pick<Storage, "getItem" | "setItem">, doFetch: typeof fetch = fetch): Promise<FlushResult> {
  if (flushing) return { sent: 0, dropped: 0, left: pending(store) };
  flushing = true;
  let sent = 0, dropped = 0;
  try {
    for (const job of read(store)) {
      let res: Response;
      try {
        res = await doFetch(job.url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(job.body) });
      } catch {
        break;
      }
      if (res.status >= 500 || res.status === 429) break;
      write(store, read(store).filter((j) => j.id !== job.id));
      if (res.ok || res.status === 409) sent++;
      else dropped++;
    }
  } finally {
    flushing = false;
  }
  return { sent, dropped, left: pending(store) };
}
