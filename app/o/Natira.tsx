"use client";
import { useEffect, useState } from "react";
import { enqueue } from "@/src/offline/queue";
import { useOutbox } from "@/src/offline/useOutbox";

type Day = { day: string; pesos: number; leftover: number; cooked: number };
type Dish = { id: string; name: string };

/** End-of-day log: portions cooked and sold per dish. Leftover pesos is the number the pilot is measured on. */
export function Natira({ stallId, dishes, onSaved }: { stallId: string; dishes: Dish[]; onSaved?: () => void }) {
  const [days, setDays] = useState<Day[]>([]);
  const [msg, setMsg] = useState("");
  const [tick, setTick] = useState(0);
  const outbox = useOutbox(() => { setTick((t) => t + 1); onSaved?.(); });

  useEffect(() => {
    fetch(`/api/stalls/${stallId}/log`).then(async (r) => {
      if (r.ok) setDays((await r.json()).days);
    });
  }, [stallId, tick]);

  const today = days[days.length - 1];

  return (
    <form className="card stack" onSubmit={async (e) => {
      e.preventDefault();
      const f = new FormData(e.currentTarget);
      const entries = dishes
        .filter((d) => f.get(`cooked-${d.id}`) !== "")
        .map((d) => ({ dishId: d.id, cooked: Number(f.get(`cooked-${d.id}`)), sold: Number(f.get(`sold-${d.id}`) || 0) }));
      if (entries.length === 0) return setMsg("Enter at least one dish.");
      // The day is fixed now, so a log sent after midnight still lands on the day it describes.
      const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila" }).format(new Date());
      const url = `/api/stalls/${stallId}/log`;
      try {
        const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ entries, day }) });
        setMsg(r.ok ? "Saved." : "Sold cannot be more than cooked.");
        if (r.ok) { setTick((t) => t + 1); onSaved?.(); }
      } catch {
        enqueue(localStorage, { id: `log-${stallId}-${day}`, url, body: { entries, day } });
        outbox.refresh();
        setMsg("No signal. Saved on this phone and will be sent when you are online.");
      }
    }}>
      <h2>Natira</h2>
      <p className="mute">End of day: how many portions did you cook and sell?</p>
      {dishes.map((d) => (
        <div key={d.id} className="row">
          <strong className="grow">{d.name}</strong>
          <input name={`cooked-${d.id}`} aria-label={`${d.name} cooked`} type="number" inputMode="numeric" min={0} max={10000} placeholder="Cooked" style={{ width: 90 }} />
          <input name={`sold-${d.id}`} aria-label={`${d.name} sold`} type="number" inputMode="numeric" min={0} max={10000} placeholder="Sold" style={{ width: 90 }} />
        </div>
      ))}
      {msg && <p role="status" className="mute">{msg}</p>}
      {outbox.waiting > 0 && <p className="mute" data-testid="outbox-waiting">{outbox.waiting} waiting to send</p>}
      <button className="btn block">Save today</button>
      {today && (
        <p className="mute" data-testid="natira-summary">
          Last log {today.day}: {today.leftover} left over, about ₱{today.pesos}
        </p>
      )}
    </form>
  );
}
