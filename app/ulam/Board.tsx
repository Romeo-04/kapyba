"use client";
import { useEffect, useState } from "react";
import { Icon } from "@/src/ui/Icon";
import { Ring } from "@/src/ui/Ring";
import { iconFor } from "../s/[code]/Rate";

type Item = {
  kind: "scored" | "paborito"; dishId: string; stallName: string; area: string; name: string; icon: string; price: number;
  score?: number; count?: number; sulit?: boolean; improving?: boolean;
};

const BUDGETS = [0, 60, 80, 100];

export function Board() {
  const [items, setItems] = useState<Item[] | null>(null);
  const [max, setMax] = useState(0);
  const [area, setArea] = useState("");

  useEffect(() => {
    const q = new URLSearchParams();
    if (max) q.set("max", String(max));
    if (area.trim()) q.set("area", area.trim());
    let live = true;
    fetch(`/api/board?${q}`).then(async (r) => {
      if (live && r.ok) setItems((await r.json()).items);
    });
    return () => { live = false; };
  }, [max, area]);

  return (
    <div className="stack">
      <div>
        <h1>Ulam</h1>
        <p className="mute">Which dishes are worth your money. Scores show only after enough customers have rated.</p>
      </div>
      <div><label htmlFor="area">Area or school</label><input id="area" value={area} onChange={(e) => setArea(e.target.value)} placeholder="UST" maxLength={80} /></div>
      <div className="row" style={{ flexWrap: "wrap" }} role="group" aria-label="Budget">
        {BUDGETS.map((b) => (
          <button key={b} className="btn soft" aria-pressed={max === b} onClick={() => setMax(b)}>{b ? `₱${b} pababa` : "Any"}</button>
        ))}
      </div>

      {items === null && <p className="mute center">Sandali...</p>}
      {items?.length === 0 && <p className="mute center" data-testid="board-empty">No dishes to show yet. Scan a stall QR and rate what you eat.</p>}
      {items?.map((d) => (
        <div key={d.dishId} className="card row" data-testid="board-card">
          <Ring score={d.kind === "scored" ? d.score! : null} locked={d.kind !== "scored"} />
          <div className="grow">
            <strong>{d.name}</strong> <span className="price">₱{d.price}</span>
            <div className="mute">{d.stallName} · {d.area}</div>
            <div className="row" style={{ flexWrap: "wrap", marginTop: 4 }}>
              {d.sulit && <span className="pill g">Sulit</span>}
              {d.kind === "paborito" && <span className="pill a"><Icon name="heart" />Paborito</span>}
              {d.improving && <span className="pill g"><Icon name="trend" />Gumaganda</span>}
            </div>
          </div>
          <span className="ico" style={{ color: "var(--cocoa)" }}><Icon name={iconFor(d.icon)} className="lg" /></span>
        </div>
      ))}
    </div>
  );
}
