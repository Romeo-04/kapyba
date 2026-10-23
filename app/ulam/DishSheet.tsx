"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/src/ui/Icon";
import { Ring } from "@/src/ui/Ring";
import { Face } from "@/src/ui/Face";
import { ago } from "@/src/ui/ago";
import { photoUrl } from "@/src/ui/PhotoPick";
import { ALLERGENS } from "@/src/domain/allergens";
import { ingredientList, mainLabel } from "@/src/domain/mains";
import { iconFor } from "../s/[code]/Rate";
import type { Item } from "./Board";

type Testimony = { text: string; score: number; at: string };

/** The card that opens when an ulam is tapped: photo, what is in it, what customers said. */
export function DishSheet({ d, reserved, onReserve, onClose }: { d: Item; reserved: boolean; onReserve: () => void; onClose: () => void }) {
  const [notes, setNotes] = useState<Testimony[] | null>(null);
  const [now] = useState(() => Date.now());
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let live = true;
    fetch(`/api/dishes/${d.dishId}/testimonies`).then(async (r) => { if (live) setNotes(r.ok ? (await r.json()).testimonies : []); }).catch(() => { if (live) setNotes([]); });
    return () => { live = false; };
  }, [d.dishId]);

  useEffect(() => {
    closeRef.current?.focus();
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [onClose]);

  const parts = ingredientList(d.ingredients);
  const main = mainLabel(d.main);
  // In the body, not in the page flow: the page's entrance animation would otherwise keep the sheet under the bottom nav.
  return createPortal(
    <div className="sheet-back" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={d.name} onClick={(e) => e.stopPropagation()}>
        <div className="photo">
          {d.imageV !== null
            // eslint-disable-next-line @next/next/no-img-element
            ? <img className="cover" src={photoUrl(d.dishId, d.imageV)} alt={d.name} />
            : <Icon name={iconFor(d.icon)} />}
          <button ref={closeRef} type="button" className="btn soft round close" aria-label="Close" onClick={onClose}><Icon name="x" /></button>
        </div>
        <div className="stack sheet-body">
          <div className="row" style={{ alignItems: "center" }}>
            <div className="grow">
              <h2>{d.name}</h2>
              <div className="mute">{d.stallName} · {d.area}</div>
              <a href={`/ulam/stall/${d.stallId}`}>About this karinderya</a>
            </div>
            <span className="price">{d.salePrice !== null ? <><s className="mute">₱{d.price}</s> ₱{d.salePrice}</> : <>₱{d.price}</>}</span>
          </div>
          <div className="row" style={{ flexWrap: "wrap" }}>
            <Ring score={d.kind === "scored" ? d.score! : null} locked={d.kind !== "scored"} size={44} />
            <span className="mute">{d.kind === "scored" ? `${d.score!.toFixed(1)} · ${d.count} ratings` : "Not enough ratings for a score yet"}</span>
            {main && <span className="pill g">{main}</span>}
            {d.kind === "paborito" && <span className="pill a"><Icon name="heart" />Favorite</span>}
            {d.sulit && <span className="pill a">Sulit</span>}
          </div>
          <section aria-label="Ingredients">
            <strong>Ingredients</strong>
            {parts.length > 0
              ? <div className="row" style={{ flexWrap: "wrap", marginTop: 6 }}>{parts.map((p) => <span key={p} className="pill">{p}</span>)}</div>
              : <p className="mute">{main ? `Main ingredient: ${main}. The stall has not listed the rest yet.` : "The stall has not listed the ingredients yet."}</p>}
          </section>
          {d.allergens.length > 0 && (
            <section aria-label="Allergens">
              <strong>Allergens</strong>
              <div className="row" style={{ flexWrap: "wrap", marginTop: 6 }}>
                {d.allergens.map((a) => { const x = ALLERGENS.find((y) => y.id === a)!; return <span key={a} className="pill a"><Icon name="alert" />{x.label}</span>; })}
              </div>
              <p className="mute">Declared by the stall. If you have an allergy, ask the stall first.</p>
            </section>
          )}
          <section aria-label="What customers say">
            <strong>What customers say</strong>
            {notes === null && <p className="mute">Sandali...</p>}
            {notes?.length === 0 && <p className="mute" data-testid="no-testimonies">{d.kind === "scored" ? "No comments yet." : "Comments show after enough customers have rated."}</p>}
            {notes?.map((n, i) => (
              <div key={i} className="notice" data-testid="testimony" style={{ marginTop: 6 }}>
                <span className="face"><Face tone="happy" size={28} /></span>
                <div className="grow">&ldquo;{n.text}&rdquo;<div className="mute">{ago(n.at, now)}</div></div>
              </div>
            ))}
          </section>
          {d.alok && !reserved && <button className="btn block" onClick={onReserve}>Kunin ang deal · {d.alok.remaining} left</button>}
          {reserved && <p className="pill g" role="status" style={{ alignSelf: "flex-start" }}><Icon name="check" />Reserved · show this at the stall</p>}
        </div>
      </div>
    </div>,
    document.body,
  );
}
