"use client";
import { useEffect, useState } from "react";

type List = {
  items: { key: string; label: string; kg: number; low: number; high: number }[];
  total: { low: number; high: number }; noRecipe: string[]; priceSource: string;
};

/** Tomorrow's shopping list with a price range and check-off. */
export function Palengke({ stallId, refresh }: { stallId: string; refresh: number }) {
  const [list, setList] = useState<List | null>(null);
  const [got, setGot] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch(`/api/stalls/${stallId}/palengke`).then(async (r) => {
      if (r.ok) setList(await r.json());
    });
  }, [stallId, refresh]);

  if (!list) return null;
  return (
    <div className="card stack">
      <h2>Palengke</h2>
      {list.items.length === 0 && <p className="mute">Kulang pa. Log a day in Natira, or add your usual servings, to get a list.</p>}
      {list.items.length > 0 && (
        <p data-testid="palengke-total"><strong>₱{list.total.low}–₱{list.total.high}</strong> <span className="mute">likely total</span></p>
      )}
      {list.items.map((i) => (
        <label key={i.key} className="row" style={{ opacity: got.has(i.key) ? 0.5 : 1 }}>
          <input type="checkbox" checked={got.has(i.key)} onChange={() => setGot((s) => { const n = new Set(s); if (n.has(i.key)) n.delete(i.key); else n.add(i.key); return n; })} style={{ width: 22, height: 22 }} />
          <span className="grow">{i.label} · {i.kg} kg</span>
          <span className="mute">₱{i.low}–₱{i.high}</span>
        </label>
      ))}
      {list.noRecipe.length > 0 && <p className="mute">No recipe yet for: {list.noRecipe.join(", ")}.</p>}
      <p className="mute" role="note">Prices are a {list.priceSource}. Treat them as a rough guide only.</p>
    </div>
  );
}
