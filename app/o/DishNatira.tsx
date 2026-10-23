"use client";
import { useEffect, useState } from "react";
import { enqueue } from "@/src/offline/queue";
import { useOutbox } from "@/src/offline/useOutbox";

type Day = { day: string; cooked: number; sold: number; leftover: number; pesos: number };

/** Leftovers (Natira) for one dish, inside its Manage panel: the last week's leftovers and today's cooked and sold. */
export function DishNatira({ stallId, dishId, dishName, onSaved }: { stallId: string; dishId: string; dishName: string; onSaved?: () => void }) {
  const [days, setDays] = useState<Day[] | null>(null);
  const [msg, setMsg] = useState("");
  const [tick, setTick] = useState(0);
  const outbox = useOutbox(() => { setTick((t) => t + 1); onSaved?.(); });
  const url = `/api/stalls/${stallId}/log`;

  useEffect(() => {
    let live = true;
    fetch(`${url}?dishId=${dishId}`).then(async (r) => { if (live && r.ok) setDays((await r.json()).days); });
    return () => { live = false; };
  }, [url, dishId, tick]);

  const total = days?.reduce((s, d) => s + d.pesos, 0) ?? 0;

  return (
    <form className="stack" aria-label={`${dishName} leftovers`} onSubmit={async (e) => {
      e.preventDefault();
      const f = new FormData(e.currentTarget);
      if (f.get("cooked") === "") return setMsg("Enter how many you cooked.");
      const entries = [{ dishId, cooked: Number(f.get("cooked")), sold: Number(f.get("sold") || 0) }];
      const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila" }).format(new Date());
      try {
        const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ entries, day }) });
        setMsg(r.ok ? "Saved." : "Sold cannot be more than cooked.");
        if (r.ok) { setTick((t) => t + 1); onSaved?.(); }
      } catch {
        enqueue(localStorage, { id: `log-${stallId}-${dishId}-${day}`, url, body: { entries, day } });
        outbox.refresh();
        setMsg("No signal. Saved on this phone and will be sent when you are online.");
      }
    }}>
      <strong>Leftovers</strong>
      <div className="row">
        <input name="cooked" aria-label={`${dishName} cooked today`} type="number" inputMode="numeric" min={0} max={10000} placeholder="Cooked" style={{ width: 90 }} />
        <input name="sold" aria-label={`${dishName} sold today`} type="number" inputMode="numeric" min={0} max={10000} placeholder="Sold" style={{ width: 90 }} />
        <button className="btn soft">Save today</button>
      </div>
      {msg && <p role="status" className="mute">{msg}</p>}
      {days?.length === 0 && <p className="mute" data-testid="dish-natira-empty">No log yet. Save today to start.</p>}
      {days && days.length > 0 && (
        <>
          <ul className="mute" data-testid="dish-natira" style={{ margin: 0, paddingLeft: 18 }}>
            {days.map((d) => <li key={d.day}>{d.day}: cooked {d.cooked}, sold {d.sold}, {d.leftover} left (₱{d.pesos})</li>)}
          </ul>
          <p className="mute">Last 7 days: about ₱{total} left over.</p>
        </>
      )}
    </form>
  );
}
