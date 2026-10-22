"use client";
import { useState } from "react";
import { Icon } from "@/src/ui/Icon";

const patch = (id: string, body: unknown) =>
  fetch(`/api/dishes/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

// Sale (huling plato): a lower price for today only. It ends by itself at midnight.
export function SaleControl({ id, price, sale, onDone }: { id: string; price: number; sale: number | null; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState("");

  if (sale !== null) {
    return <button className="btn soft" aria-pressed onClick={async () => { await patch(id, { salePrice: null }); onDone(); }}><Icon name="tag" />Sale ₱{sale} · end</button>;
  }
  if (!open) return <button className="btn soft" onClick={() => setOpen(true)}><Icon name="tag" />Sale</button>;
  return (
    <form className="row" style={{ flexBasis: "100%" }} onSubmit={async (e) => {
      e.preventDefault();
      const v = Number(new FormData(e.currentTarget).get("sale"));
      const r = await patch(id, { salePrice: v });
      if (r.ok) { setOpen(false); setErr(""); onDone(); } else setErr(`Use a whole peso below ₱${price}.`);
    }}>
      <input aria-label="Sale price today (₱)" name="sale" type="number" inputMode="numeric" min={1} max={price - 1} required placeholder="Sale ₱" className="grow" />
      <button className="btn">Start</button>
      <button type="button" className="btn soft" onClick={() => setOpen(false)}>Cancel</button>
      {err && <p className="err" role="alert">{err}</p>}
    </form>
  );
}
