"use client";
import { useState } from "react";
import { MAINS } from "@/src/domain/mains";
import { AllergenPick } from "./AllergenPick";

const patch = (id: string, body: unknown) =>
  fetch(`/api/dishes/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

// Fix a name, price, servings, main ingredient, ingredients and allergens. Opened from the Manage sheet.
export function DishEdit({ id, name, price, servings, main, ingredients, allergens, onDone, onCancel }: { id: string; name: string; price: number; servings: number; main: string | null; ingredients: string | null; allergens: string[]; onDone: () => void; onCancel: () => void }) {
  const [err, setErr] = useState("");

  return (
    <form className="card stack" style={{ flexBasis: "100%" }} onSubmit={async (e) => {
      e.preventDefault();
      const f = new FormData(e.currentTarget);
      const r = await patch(id, { name: f.get("name"), price: Number(f.get("price")), baseServings: Number(f.get("servings") || 0), main: String(f.get("main") ?? ""), ingredients: String(f.get("ingredients") ?? "") || null, allergens: f.getAll("allergens") });
      if (r.ok) { setErr(""); onDone(); } else setErr("Check the name and price.");
    }}>
      <div><label htmlFor={`n-${id}`}>Dish</label><input id={`n-${id}`} name="name" defaultValue={name} required maxLength={80} /></div>
      <div className="row">
        <div className="grow"><label htmlFor={`p-${id}`}>Price (₱)</label><input id={`p-${id}`} name="price" type="number" inputMode="numeric" min={1} max={10000} defaultValue={price} required /></div>
        <div className="grow"><label htmlFor={`s-${id}`}>Servings a day</label><input id={`s-${id}`} name="servings" type="number" inputMode="numeric" min={0} max={1000} defaultValue={servings} /></div>
      </div>
      <div><label htmlFor={`m-${id}`}>Main ingredient</label>
        <select id={`m-${id}`} name="main" defaultValue={main ?? ""}><option value="">None</option>{MAINS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}</select>
      </div>
      <div><label htmlFor={`i-${id}`}>Ingredients (optional)</label><input id={`i-${id}`} name="ingredients" defaultValue={ingredients ?? ""} maxLength={200} placeholder="Chicken, soy sauce, vinegar, garlic" /></div>
      <AllergenPick prefix={`al-${id}`} value={allergens} />
      {err && <p className="err" role="alert">{err}</p>}
      <div className="row">
        <button className="btn">Save</button>
        <button type="button" className="btn soft" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
