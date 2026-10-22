"use client";
import { useState } from "react";
import { Icon } from "@/src/ui/Icon";
import type { IconName } from "@/src/ui/icons";
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
  const [name, setName] = useState("");
  const [icon, setIcon] = useState<IconName>("meat");
  const [price, setPrice] = useState("70");
  const [servings, setServings] = useState("20");
  const [msg, setMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setMsg("Kailangan ang pangalan ng ulam.");
      return;
    }
    const numPrice = Number(price);
    if (!numPrice || numPrice <= 0) {
      setMsg("Kailangan ng wastong presyo.");
      return;
    }

    setIsSubmitting(true);
    setMsg("");
    try {
      const res = await fetch(`/api/stalls/${stallId}/dishes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          icon,
          price: numPrice,
          baseServings: Number(servings) || 0,
        }),
      });

      if (res.ok) {
        onAdded();
        onClose();
      } else {
        const data = await res.json().catch(() => ({}));
        setMsg(data.error || "Hindi ma-save ang ulam. Pakisuri ang impormasyon.");
      }
    } catch {
      setMsg("May naganap na problema. Subukan muli.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-dish-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form className="modal-card stack" onSubmit={handleSubmit} style={{ gap: 14 }}>
        <div className="modal-hdr">
          <h2 id="add-dish-modal-title" style={{ fontSize: 20, margin: 0 }}>
            Magdagdag ng ulam
          </h2>
          <button
            type="button"
            className="modal-close"
            aria-label="Isara"
            onClick={onClose}
          >
            <Icon name="x" />
          </button>
        </div>

        {/* Dish Name Field */}
        <div className="simula-field">
          <label htmlFor="dish-name">Pangalan ng Ulam</label>
          <div className="field-box">
            <span className="field-ico" aria-hidden="true">
              <Icon name={icon} />
            </span>
            <input
              id="dish-name"
              type="text"
              maxLength={80}
              required
              placeholder="Hal. Igado o Dinuguan"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        {/* Category Chips */}
        <div>
          <label>Kategorya</label>
          <div className="chips" role="group" aria-label="Kategorya ng ulam">
            {DISH_CATEGORIES.map(({ icon: catIcon, label }) => (
              <button
                key={catIcon}
                type="button"
                className={`chip ${icon === catIcon ? "on" : ""}`}
                aria-label={label}
                aria-pressed={icon === catIcon}
                onClick={() => setIcon(catIcon)}
              >
                <Icon name={catIcon} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Price & Servings Fields */}
        <div className="row" style={{ gap: 10 }}>
          <div className="simula-field grow">
            <label htmlFor="dish-price">Presyo (₱)</label>
            <div className="field-box">
              <span className="field-ico" aria-hidden="true" style={{ fontSize: 18 }}>
                ₱
              </span>
              <input
                id="dish-price"
                type="number"
                inputMode="numeric"
                min={1}
                max={10000}
                required
                placeholder="70"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          </div>

          <div className="simula-field grow">
            <label htmlFor="dish-servings">Servings</label>
            <div className="field-box">
              <span className="field-ico" aria-hidden="true">
                <Icon name="plate" />
              </span>
              <input
                id="dish-servings"
                type="number"
                inputMode="numeric"
                min={0}
                max={1000}
                placeholder="20"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
              />
            </div>
          </div>
        </div>

        {msg && (
          <p className="err center" role="alert" style={{ margin: "2px 0 0" }}>
            {msg}
          </p>
        )}

        <div className="row" style={{ marginTop: 6, gap: 10 }}>
          <button
            type="button"
            className="btn soft grow"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Kanselahin
          </button>
          <button
            type="submit"
            className="btn grow primary-cta"
            disabled={isSubmitting}
          >
            <Icon name="plus" /> Idagdag
          </button>
        </div>
      </form>
    </div>
  );
}
