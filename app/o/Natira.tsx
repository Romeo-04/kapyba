"use client";
import { useEffect, useState } from "react";

type Day = { day: string; pesos: number; leftover: number; cooked: number };
type Dish = { id: string; name: string };

/** End-of-day log: portions cooked and sold per dish. Leftover pesos is the number the pilot is measured on. */
export function Natira({ stallId, dishes }: { stallId: string; dishes: Dish[] }) {
  const [days, setDays] = useState<Day[]>([]);
  const [msg, setMsg] = useState("");
  const [tick, setTick] = useState(0);

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
      const r = await fetch(`/api/stalls/${stallId}/log`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ entries }) });
      setMsg(r.ok ? "Saved." : "Sold cannot be more than cooked.");
      if (r.ok) setTick((t) => t + 1);
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
      <button className="btn block">Save today</button>
      {today && (
        <p className="mute" data-testid="natira-summary">
          Last log {today.day}: {today.leftover} left over, about ₱{today.pesos}
        </p>
      )}
    </form>
  );
}
