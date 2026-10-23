"use client";
import { useEffect, useState } from "react";
import { Kapy } from "@/src/ui/Kapy";
import { Icon } from "@/src/ui/Icon";
import { Ring } from "@/src/ui/Ring";
import { photoUrl } from "@/src/ui/PhotoPick";
import { MAINS, mainLabel } from "@/src/domain/mains";
import { ALLERGENS } from "@/src/domain/allergens";
import { DishSheet } from "./DishSheet";
import { iconFor } from "../s/[code]/Rate";

export type Item = {
  kind: "scored" | "paborito"; dishId: string; stallId: string; stallName: string; area: string; name: string; icon: string; price: number;
  score?: number; count?: number; sulit?: boolean; improving?: boolean;
  alok: { id: string; kind: string; remaining: number; endsAt: string | null } | null;
  soldOut: boolean; salePrice: number | null; imageV: number | null; main: string | null; ingredients: string | null; allergens: string[];
};

const BUDGETS = [0, 50, 75, 100];
const isDeal = (d: Item) => !d.soldOut && (d.alok !== null || d.salePrice !== null);

export function Board() {
  const [items, setItems] = useState<Item[] | null>(null);
  const [max, setMax] = useState(0);
  const [area, setArea] = useState("");
  const [claims, setClaims] = useState<Record<string, string>>({});
  const [main, setMain] = useState("");
  const [dealsOnly, setDealsOnly] = useState(false);
  const [mine, setMine] = useState<string[]>([]); // dishes whose deal this phone has reserved, even if that was the last spot
  const [open, setOpen] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const q = new URLSearchParams();
    if (max) q.set("max", String(max));
    if (area.trim()) q.set("area", area.trim());
    let live = true;
    fetch(`/api/board?${q}`).then(async (r) => {
      if (live && r.ok) setItems((await r.json()).items);
    });
    fetch("/api/alok/mine").then(async (r) => { if (live && r.ok) setMine((await r.json()).claims.map((c: { dishId: string }) => c.dishId)); });
    return () => { live = false; };
  }, [max, area, tick]);

  const reserve = async (d: Item) => {
    const r = await fetch(`/api/alok/${d.alok!.id}/claim`, { method: "POST" });
    setClaims((c) => ({ ...c, [d.dishId]: r.ok || r.status === 409 ? "Reserved. Show this at the stall." : "Sorry, this deal is gone." }));
    setTick((t) => t + 1);
  };
  const dealCount = items?.filter(isDeal).length ?? 0;
  const mains = MAINS.filter((m) => items?.some((d) => d.main === m.id));
  const shown = items?.filter((d) => (!dealsOnly || isDeal(d)) && (!main || d.main === main));
  const sheet = items?.find((d) => d.dishId === open) ?? null;

  return (
    <div className="stack">
      <div className="hero">
        <Kapy pose="point" size={104} anim="bob" />
        <div>
          <h1>Ulam</h1>
          <p>Worth your money, ranked.</p>
        </div>
      </div>
      <div className="search">
        <Icon name="pin" />
        <input id="area" aria-label="Area or school" value={area} onChange={(e) => setArea(e.target.value)} placeholder="Area or school, like UST" maxLength={80} />
      </div>
      <div className="chips" role="group" aria-label="For you">
        <button className="chip" aria-pressed={dealsOnly} onClick={() => setDealsOnly(!dealsOnly)}><Icon name="tag" />Deals for you{dealCount > 0 && ` · ${dealCount}`}</button>
      </div>
      <div className="filters">
        <div><label htmlFor="budget">Price</label>
          <select id="budget" value={max} onChange={(e) => setMax(Number(e.target.value))}>
            {BUDGETS.map((b) => <option key={b} value={b}>{b ? `₱${b} or less` : "Any"}</option>)}
          </select>
        </div>
        <div><label htmlFor="kind">Main ingredient</label>
          <select id="kind" value={main} onChange={(e) => setMain(e.target.value)}>
            <option value="">All</option>
            {mains.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
        </div>
      </div>

      {items === null && <div className="wait" role="status"><Kapy pose="walk" size={100} anim="walk" /><p className="mute">Sandali...</p></div>}
      {shown?.length === 0 && (
        <div className="stack center" style={{ alignItems: "center", padding: "24px 0" }}>
          <Kapy pose="sleepy" size={120} anim="sway" />
          <p className="mute" data-testid="board-empty">{dealsOnly || main ? "No dishes match these filters." : "No dishes to show yet. Scan a stall QR and rate what you eat."}</p>
        </div>
      )}
      <div className="grid">
      {shown?.map((d) => {
        const reserved = mine.includes(d.dishId);
        return (
        <div key={d.dishId} className="vcard" data-testid="board-card" style={d.soldOut ? { opacity: 0.55 } : undefined}>
          <button type="button" className="open" aria-haspopup="dialog" onClick={() => setOpen(d.dishId)}>
          <span className="photo">
            {d.imageV !== null
              // eslint-disable-next-line @next/next/no-img-element
              ? <img className="cover" src={photoUrl(d.dishId, d.imageV)} alt={d.name} loading="lazy" />
              : <Icon name={iconFor(d.icon)} />}
            {d.sulit && <span className="ribbon">Sulit</span>}
            <span className="rating"><Ring score={d.kind === "scored" ? d.score! : null} locked={d.kind !== "scored"} size={44} /></span>
          </span>
          <span className="body">
            <span className="title"><strong>{d.name}</strong><span className="price">{d.salePrice !== null ? <><s className="mute">₱{d.price}</s> ₱{d.salePrice}</> : <>₱{d.price}</>}</span></span>
            <span className="mute" style={{ display: "block" }}>{d.stallName} · {d.area}</span>
          </span>
          </button>
          <div className="body" style={{ paddingTop: 0 }}>
            <div className="row" style={{ flexWrap: "wrap", marginTop: 2 }}>
              <a className="pill" href={`/ulam/stall/${d.stallId}`}><Icon name="store" />Karinderya</a>
              {d.main && <span className="pill g">{mainLabel(d.main)}</span>}
              {d.allergens.length > 0 && <span className="pill a" data-testid="allergens"><Icon name="alert" />Allergen: {d.allergens.map((a) => ALLERGENS.find((x) => x.id === a)?.label).join(", ")}</span>}
              {reserved && <span className="pill g"><Icon name="check" />Reserved</span>}
              {d.soldOut && <span className="pill r"><Icon name="alert" />Sold out</span>}
              {d.salePrice !== null && !d.soldOut && <span className="pill a"><Icon name="tag" />Sale · huling plato</span>}
              {d.kind === "paborito" && <span className="pill a"><Icon name="heart" />Favorite</span>}
              {d.improving && <span className="pill g"><Icon name="trend" />Improving</span>}
              {d.alok && <span className="pill" style={{ background: "#dbe9f6", color: "#2b5d8a" }}><Icon name="tag" />Alok · {d.alok.remaining} left</span>}
            </div>
            {(d.alok || claims[d.dishId]) && (
              <div className="row" style={{ marginTop: 6 }}>
                {d.alok && !claims[d.dishId] && !reserved && <button className="btn soft" onClick={() => reserve(d)}>Kunin ang deal</button>}
                {claims[d.dishId] && <span className="mute" role="status">{claims[d.dishId]}</span>}
              </div>
            )}
          </div>
        </div>
        );
      })}
      </div>
      {sheet && <DishSheet d={sheet} reserved={mine.includes(sheet.dishId)} onReserve={() => reserve(sheet)} onClose={() => setOpen(null)} />}
    </div>
  );
}
