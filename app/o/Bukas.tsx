"use client";
import { useEffect, useState } from "react";

type Row = { dishId: string; name: string; plan: { servings: number; yesterday: number | null; reasons: string[] } | null };
const WHY: Record<string, string> = {
  history: "from what sold", usual: "your usual", "sold-out": "sold out often", "high-rated": "rated high", "low-rated": "rated low", weather: "weather",
};

/** Tomorrow's suggested servings. A dish with no log and no usual servings shows Kulang pa, never a made-up number. */
export function Bukas({ stallId, refresh }: { stallId: string; refresh: number }) {
  const [rows, setRows] = useState<Row[]>([]);
  useEffect(() => {
    fetch(`/api/stalls/${stallId}/bukas`).then(async (r) => {
      if (r.ok) setRows((await r.json()).dishes);
    });
  }, [stallId, refresh]);

  return (
    <div className="card stack">
      <h2>Bukas</h2>
      {rows.map((r) => (
        <div key={r.dishId} className="row" data-testid="bukas-row">
          <strong className="grow">{r.name}</strong>
          {r.plan ? (
            <span>
              {r.plan.yesterday !== null && <span className="mute">{r.plan.yesterday} → </span>}
              <strong>{r.plan.servings}</strong> <span className="mute">{r.plan.reasons.map((x) => WHY[x]).join(", ")}</span>
            </span>
          ) : <span className="mute">Kulang pa</span>}
        </div>
      ))}
    </div>
  );
}
