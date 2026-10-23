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
    <section className="stack">
      <h2 className="sec">Palengke</h2>
      <div className="card stack">
        {list.items.length === 0 && <p className="mute">Not enough data yet. Log a day in Leftovers, or add your usual servings, to get a list.</p>}
        {list.items.length > 0 && (
          <>
            <div data-testid="palengke-total">
              <span className="mute small">Your estimated total is</span>
              <div className="total">₱{list.total.low}–₱{list.total.high}</div>
            </div>
            <hr className="rule" />
            <div className="eyebrow">Checklist</div>
          </>
        )}
        {list.items.map((i) => (
          <label key={i.key} className="row between check" style={{ opacity: got.has(i.key) ? 0.5 : 1 }}>
            <input type="checkbox" checked={got.has(i.key)} onChange={() => setGot((s) => { const n = new Set(s); if (n.has(i.key)) n.delete(i.key); else n.add(i.key); return n; })} />
            <span className="grow">{i.kg}kg of {i.label}</span>
            <strong>₱{i.low}–₱{i.high}</strong>
          </label>
        ))}
        {list.noRecipe.length > 0 && <p className="mute">No recipe yet for: {list.noRecipe.join(", ")}.</p>}
        <p className="mute small" role="note">Prices are a {list.priceSource}. Treat them as a rough guide only.</p>
      </div>
    </section>
  );
}
