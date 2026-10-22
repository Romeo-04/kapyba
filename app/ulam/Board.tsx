"use client";
import { useEffect, useState } from "react";
import { Capybara } from "@/src/ui/Capybara";
import { Icon } from "@/src/ui/Icon";
import { Ring } from "@/src/ui/Ring";
import { iconFor } from "../s/[code]/Rate";

type Item = {
  kind: "scored" | "paborito"; dishId: string; stallName: string; area: string; name: string; icon: string; price: number;
  score?: number; count?: number; sulit?: boolean; improving?: boolean;
  alok: { id: string; kind: string; remaining: number; endsAt: string | null } | null;
};

const BUDGETS = [0, 60, 80, 100];

export function Board() {
  const [items, setItems] = useState<Item[] | null>(null);
  const [max, setMax] = useState(0);
  const [area, setArea] = useState("");
  const [claims, setClaims] = useState<Record<string, string>>({});
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const q = new URLSearchParams();
    if (max) q.set("max", String(max));
    if (area.trim()) q.set("area", area.trim());
    let live = true;
    fetch(`/api/board?${q}`).then(async (r) => {
      if (live && r.ok) setItems((await r.json()).items);
    });
    return () => { live = false; };
  }, [max, area, tick]);

  return (
    <div className="stack">
      <div>
        <h1>Ulam</h1>
        <p className="mute">Which dishes are worth your money. Scores show only after enough customers have rated.</p>
      </div>
      <div className="search">
        <Icon name="pin" />
        <input id="area" aria-label="Area or school" value={area} onChange={(e) => setArea(e.target.value)} placeholder="Area or school, like UST" maxLength={80} />
      </div>
      <div className="chips" role="group" aria-label="Budget">
        {BUDGETS.map((b) => (
          <button key={b} className="chip" aria-pressed={max === b} onClick={() => setMax(b)}>{b ? `₱${b} pababa` : "Any"}</button>
        ))}
      </div>

      {items === null && <p className="mute center">Sandali...</p>}
      {items?.length === 0 && (
        <div className="stack center" style={{ alignItems: "center", padding: "24px 0" }}>
          <Capybara mood="sleepy" size={96} />
          <p className="mute" data-testid="board-empty">No dishes to show yet. Scan a stall QR and rate what you eat.</p>
        </div>
      )}
      <div className="grid">
      {items?.map((d) => (
        <div key={d.dishId} className="vcard" data-testid="board-card">
          <div className="photo">
            <Icon name={iconFor(d.icon)} />
            {d.sulit && <span className="ribbon">Sulit</span>}
            <span className="rating"><Ring score={d.kind === "scored" ? d.score! : null} locked={d.kind !== "scored"} size={44} /></span>
          </div>
          <div className="body">
            <div className="title"><strong>{d.name}</strong><span className="price">₱{d.price}</span></div>
            <div className="mute">{d.stallName} · {d.area}</div>
            <div className="row" style={{ flexWrap: "wrap", marginTop: 2 }}>
              {d.kind === "paborito" && <span className="pill a"><Icon name="heart" />Paborito</span>}
              {d.improving && <span className="pill g"><Icon name="trend" />Gumaganda</span>}
              {d.alok && <span className="pill" style={{ background: "#dbe9f6", color: "#2b5d8a" }}><Icon name="tag" />Alok · {d.alok.remaining} left</span>}
            </div>
            {(d.alok || claims[d.dishId]) && (
              <div className="row" style={{ marginTop: 6 }}>
                {d.alok && !claims[d.dishId] && (
                  <button className="btn soft" onClick={async () => {
                    const r = await fetch(`/api/alok/${d.alok!.id}/claim`, { method: "POST" });
                    setClaims((c) => ({ ...c, [d.dishId]: r.ok || r.status === 409 ? "Reserved. Show this at the stall." : "Sorry, this deal is gone." }));
                    setTick((t) => t + 1);
                  }}>Kunin ang deal</button>
                )}
                {claims[d.dishId] && <span className="mute" role="status">{claims[d.dishId]}</span>}
              </div>
            )}
          </div>
        </div>
      ))}
      </div>
    </div>
  );
}
