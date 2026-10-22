"use client";
import { useEffect, useState } from "react";

type Deal = { id: string; dishId: string; kind: string; limit: number; claimed: number; remaining: number; active: boolean; endsAt: string | null };
type Dish = { id: string; name: string };
const KINDS = [["combo", "Combo"], ["suki", "Suki"], ["oras", "Oras (timed)"]] as const;

/** Owner-only deals. A deal is never tied to a rating and never changes a dish's rank. */
export function Alok({ stallId, dishes }: { stallId: string; dishes: Dish[] }) {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [tick, setTick] = useState(0);
  const [msg, setMsg] = useState("");
  const [kind, setKind] = useState("combo");

  useEffect(() => {
    fetch(`/api/stalls/${stallId}/alok`).then(async (r) => {
      if (r.ok) setDeals((await r.json()).deals);
    });
  }, [stallId, tick]);

  const name = (id: string) => dishes.find((d) => d.id === id)?.name ?? "Dish";

  return (
    <div className="card stack">
      <h2>Alok</h2>
      <p className="mute">A deal only your stall has. It is never given in exchange for a rating, and it does not change where a dish ranks.</p>
      {deals.filter((d) => d.active).map((d) => (
        <div key={d.id} className="row" data-testid="alok-row">
          <span className="grow"><strong>{name(d.dishId)}</strong> · {d.kind} · {d.remaining} of {d.limit} left</span>
          <button className="btn soft" onClick={async () => { await fetch(`/api/alok/${d.id}/close`, { method: "POST" }); setTick((t) => t + 1); }}>Close</button>
        </div>
      ))}
      <form className="stack" onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const f = new FormData(form);
        const minutes = Number(f.get("minutes") || 0);
        const body: Record<string, unknown> = { dishId: f.get("dish"), kind, limit: Number(f.get("limit")) };
        if (kind === "oras") body.endsAt = new Date(Date.now() + minutes * 60_000).toISOString();
        const r = await fetch(`/api/stalls/${stallId}/alok`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        setMsg(r.ok ? "" : "Check the dish, the limit and the end time.");
        if (r.ok) { form.reset(); setTick((t) => t + 1); }
      }}>
        <div><label htmlFor="adish">Dish</label><select id="adish" name="dish">{dishes.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
        <div><label htmlFor="akind">Kind</label><select id="akind" value={kind} onChange={(e) => setKind(e.target.value)}>{KINDS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
        <div className="row">
          <div className="grow"><label htmlFor="alimit">Limit</label><input id="alimit" name="limit" type="number" inputMode="numeric" min={1} max={500} required defaultValue={10} /></div>
          {kind === "oras" && <div className="grow"><label htmlFor="amin">Ends in (minutes)</label><input id="amin" name="minutes" type="number" inputMode="numeric" min={5} max={720} defaultValue={60} /></div>}
        </div>
        {msg && <p className="err" role="alert">{msg}</p>}
        <button className="btn block">Post deal</button>
      </form>
    </div>
  );
}
