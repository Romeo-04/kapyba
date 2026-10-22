"use client";
import { useState } from "react";
import { Icon } from "@/src/ui/Icon";
import { DrilldownSheet } from "@/src/ui/DrilldownSheet";
import { DISH_CATEGORIES } from "./Simula";

export function AddDishModal({
  stallId,
  onClose,
  onAdded,
}: {
  stallId: string;
  onClose: () => void;
  onAdded: () => void;
}) {
  const [msg, setMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <DrilldownSheet
      title="Magdagdag ng Ulam"
      subtitle="Bagong lutuin sa menu"
      onClose={onClose}
      ariaLabel="Add Dish"
    >
      <form
        className="card stack"
        onSubmit={async (e) => {
          e.preventDefault();
          setIsSubmitting(true);
          const form = e.currentTarget;
          const f = new FormData(form);
          const r = await fetch(`/api/stalls/${stallId}/dishes`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: f.get("name"),
              icon: f.get("icon"),
              price: Number(f.get("price")),
              baseServings: Number(f.get("servings") || 0),
            }),
          });
          setIsSubmitting(false);
          if (r.ok) {
            form.reset();
            setMsg("");
            onAdded();
            onClose();
          } else {
            setMsg("Pakisuri ang pangalan at presyo ng ulam.");
          }
        }}
      >
        <div>
          <label htmlFor="dname" style={{ fontSize: 13, marginBottom: 4 }}>Pangalan ng Ulam</label>
          <input id="dname" name="name" required maxLength={80} placeholder="Hal. Adobo" />
        </div>

        <div className="row">
          <div className="grow">
            <label htmlFor="dprice" style={{ fontSize: 13, marginBottom: 4 }}>Presyo (₱)</label>
            <input
              id="dprice"
              name="price"
              type="number"
              inputMode="numeric"
              min={1}
              max={10000}
              placeholder="70"
              required
            />
          </div>
          <div className="grow">
            <label htmlFor="dserv" style={{ fontSize: 13, marginBottom: 4 }}>Karaniwang Servings</label>
            <input
              id="dserv"
              name="servings"
              type="number"
              inputMode="numeric"
              min={0}
              max={1000}
              placeholder="10"
            />
          </div>
        </div>

        <div>
          <label htmlFor="dicon" style={{ fontSize: 13, marginBottom: 4 }}>Kategorya</label>
          <select id="dicon" name="icon">
            {DISH_CATEGORIES.map((c) => (
              <option key={c.icon} value={c.icon}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {msg && <p className="err center" style={{ fontSize: 13 }}>{msg}</p>}

        <button type="submit" className="btn block primary-cta" disabled={isSubmitting} style={{ marginTop: 8 }}>
          <Icon name="plus" /> {isSubmitting ? "Idinadagdag..." : "Idagdag"}
        </button>
      </form>
    </DrilldownSheet>
  );
}
