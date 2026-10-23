"use client";
import { useEffect, useState } from "react";
import { Kapy } from "@/src/ui/Kapy";
import { Icon } from "@/src/ui/Icon";
import { Ring } from "@/src/ui/Ring";
import { photoUrl } from "@/src/ui/PhotoPick";
import { mainLabel } from "@/src/domain/mains";
import { DishSheet } from "./DishSheet";
import { iconFor } from "../s/[code]/Rate";
import type { Item } from "./Board";

type Profile = { id: string; name: string; area: string; about: string | null; hours: string | null; items: Item[] };

/** A karinderya as a customer sees it: who they are, when they open, and the dishes that are public. */
export function StallProfile({ id }: { id: string }) {
  const [p, setP] = useState<Profile | "missing" | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const [mine, setMine] = useState<string[]>([]);

  useEffect(() => {
    let live = true;
    fetch(`/api/board/stall/${id}`).then(async (r) => { if (live) setP(r.ok ? await r.json() : "missing"); }).catch(() => { if (live) setP("missing"); });
    fetch("/api/alok/mine").then(async (r) => { if (live && r.ok) setMine((await r.json()).claims.map((c: { dishId: string }) => c.dishId)); });
    return () => { live = false; };
  }, [id, tick]);

  if (p === null) return <div className="wait" role="status"><Kapy pose="walk" size={100} anim="walk" /><p className="mute">Sandali...</p></div>;
  if (p === "missing") return <p className="err center" style={{ paddingTop: 48 }} role="alert">We could not find this karinderya.</p>;

  const sheet = p.items.find((d) => d.dishId === open) ?? null;
  const reserve = async (d: Item) => { await fetch(`/api/alok/${d.alok!.id}/claim`, { method: "POST" }); setTick((t) => t + 1); };

  return (
    <div className="stack">
      <a className="btn soft round backfloat" href="/ulam" aria-label="Back to the Ulam board"><Icon name="back" /></a>
      <div className="hero">
        <Kapy pose="wave" size={92} anim="bob" />
        <div><h1>{p.name}</h1><p>{p.area}</p></div>
      </div>
      {(p.about || p.hours) && (
        <div className="panel" data-testid="stall-about">
          {p.about && <div><span className="eyebrow">About</span><p>{p.about}</p></div>}
          {p.hours && <div><span className="eyebrow">Hours</span><p>{p.hours}</p></div>}
        </div>
      )}
      <h2 className="sec">Dishes ({p.items.length})</h2>
      {p.items.length === 0 && <p className="mute" data-testid="stall-empty">No public dishes yet. A dish shows here once enough customers have rated it.</p>}
      <div className="stack" style={{ gap: 10 }}>
        {p.items.map((d) => (
          <button key={d.dishId} type="button" className="branch" aria-haspopup="dialog" onClick={() => setOpen(d.dishId)} style={d.soldOut ? { opacity: 0.55 } : undefined}>
            {d.imageV !== null
              // eslint-disable-next-line @next/next/no-img-element
              ? <img className="thumb" src={photoUrl(d.dishId, d.imageV)} alt="" width={48} height={48} />
              : <span className="tile"><Icon name={iconFor(d.icon)} /></span>}
            <span className="grow">
              <strong>{d.name}</strong>
              <span className="mute small" style={{ display: "block" }}>₱{d.salePrice ?? d.price}{d.main ? ` · ${mainLabel(d.main)}` : ""}{d.soldOut ? " · Sold out" : ""}{d.alok && !d.soldOut ? " · Deal" : ""}</span>
            </span>
            <Ring score={d.kind === "scored" ? d.score ?? null : null} locked={d.kind !== "scored"} size={44} />
          </button>
        ))}
      </div>
      {sheet && <DishSheet fromStall d={sheet} reserved={mine.includes(sheet.dishId)} onReserve={() => reserve(sheet)} onClose={() => setOpen(null)} />}
    </div>
  );
}
