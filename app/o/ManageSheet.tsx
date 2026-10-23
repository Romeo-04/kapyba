"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/src/ui/Icon";
import { PhotoPick, photoUrl } from "@/src/ui/PhotoPick";
import { iconFor } from "../s/[code]/Rate";
import { DishEdit } from "./DishEdit";
import { DishNatira } from "./DishNatira";
import type { Summary } from "./Owner";

const patch = (id: string, body: unknown) =>
  fetch(`/api/dishes/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

/** Everything an owner does to one dish, as a sheet from the bottom: status toggles, edit, delete, photo, leftovers. */
export function ManageSheet({ d, stallId, onClose, onChange, onReviews, onLeftover }: {
  d: Summary; stallId: string; onClose: () => void; onChange: () => void; onReviews: () => void; onLeftover: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [editing, setEditing] = useState(false);
  const [sale, setSale] = useState(false);
  const [sure, setSure] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    closeRef.current?.focus();
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [onClose]);

  const toggle = async (body: unknown, fail = "") => {
    const r = await patch(d.id, body);
    setMsg(r.ok ? "" : fail);
    onChange();
  };

  // In the body, like the dish sheet: the page's entrance animation would otherwise trap a fixed overlay.
  return createPortal(
    <div className="sheet-back" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={`Manage ${d.name}`} onClick={(e) => e.stopPropagation()}>
        <div className="pop-head">
          <span className="eyebrow grow">Manage meal</span>
          <button ref={closeRef} type="button" className="btn soft round" aria-label="Close" onClick={onClose}><Icon name="x" /></button>
        </div>
        <div className="stack pop-body">
          <div className="mpic">
            {d.imageV !== null
              // eslint-disable-next-line @next/next/no-img-element
              ? <img className="thumb" src={photoUrl(d.id, d.imageV)} alt={d.name} width={400} height={250} />
              : <div className="blank"><Icon name={iconFor(d.icon)} className="lg" /></div>}
            <button type="button" className="hidebtn" aria-pressed={!d.published} onClick={() => toggle({ published: !d.published })}>
              <Icon name={d.published ? "eyeoff" : "eye"} />{d.published ? "Hide" : "Show"}
            </button>
          </div>
          <div className="row mhead">
            <div className="grow"><h2>{d.name}</h2><p className="mute">{d.baseServings} {d.baseServings === 1 ? "serving" : "servings"} a day{d.published ? "" : " · hidden from the Ulam board"}</p></div>
            <strong className="mprice">₱{d.price}</strong>
          </div>
          <div className="row photo-actions"><PhotoPick dishId={d.id} dishName={d.name} imageV={d.imageV} onDone={onChange} /></div>

          <span className="eyebrow">Quick status toggles</span>
          <div className="tiles">
            <button type="button" className="tilebtn" aria-pressed={d.soldOut} onClick={() => toggle({ soldOut: !d.soldOut })}><Icon name="alert" />Mark sold out</button>
            {d.salePrice !== null
              ? <button type="button" className="tilebtn" aria-pressed onClick={() => toggle({ salePrice: null })}><Icon name="tag" />Sale ₱{d.salePrice} · end</button>
              : <button type="button" className="tilebtn" aria-expanded={sale} onClick={() => setSale(!sale)}><Icon name="tag" />Put on sale</button>}
            <button type="button" className="tilebtn" aria-pressed={d.paborito} onClick={() => toggle({ paborito: !d.paborito }, "You can pick up to three Favorite dishes.")}><Icon name="heart" />Set favorite</button>
          </div>
          {sale && d.salePrice === null && (
            <SaleForm id={d.id} price={d.price} onDone={() => { setSale(false); onChange(); }} onCancel={() => setSale(false)} />
          )}
          {msg && <p className="err" role="alert">{msg}</p>}

          {editing ? (
            <DishEdit id={d.id} name={d.name} price={d.price} servings={d.baseServings} main={d.main} ingredients={d.ingredients} allergens={d.allergens}
              onDone={() => { setEditing(false); onChange(); }} onCancel={() => setEditing(false)} />
          ) : (
            <div className="row mactions">
              <button type="button" className="btn soft grow" onClick={() => setEditing(true)}><Icon name="edit" />Edit meal</button>
              <button type="button" className="btn soft grow danger" onClick={async () => {
                if (!sure) { setSure(true); return; }
                await patch(d.id, { archived: true });
                onChange();
                onClose();
              }}><Icon name="bin" />{sure ? "Tap again to delete" : "Delete meal"}</button>
            </div>
          )}

          <DishNatira stallId={stallId} dishId={d.id} dishName={d.name} onSaved={onLeftover} />

          <button type="button" className="textlink" onClick={onReviews}>See customer score, taste feedback &amp; reviews →</button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// Sale (huling plato): a lower price for today only. It ends by itself at midnight.
function SaleForm({ id, price, onDone, onCancel }: { id: string; price: number; onDone: () => void; onCancel: () => void }) {
  const [err, setErr] = useState("");
  return (
    <form className="row" onSubmit={async (e) => {
      e.preventDefault();
      const r = await patch(id, { salePrice: Number(new FormData(e.currentTarget).get("sale")) });
      if (r.ok) onDone(); else setErr(`Use a whole peso below ₱${price}.`);
    }}>
      <input aria-label="Sale price today (₱)" name="sale" type="number" inputMode="numeric" min={1} max={price - 1} required placeholder="Sale ₱" className="grow" />
      <button className="btn">Start</button>
      <button type="button" className="btn soft" onClick={onCancel}>Cancel</button>
      {err && <p className="err" role="alert">{err}</p>}
    </form>
  );
}
