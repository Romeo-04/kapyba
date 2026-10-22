"use client";
import { useState } from "react";
import { DrilldownSheet } from "@/src/ui/DrilldownSheet";
import { Icon } from "@/src/ui/Icon";
import { Mascot } from "@/src/ui/Mascot";

const LANDMARKS = ["UST", "FEU Tech", "FEU", "NU", "UE"] as const;

export type StoreProfileModalProps = {
  stall: {
    id: string;
    name: string;
    area: string;
    code: string;
  };
  totalDishes: number;
  totalRatings: number;
  onClose: () => void;
  onUpdated: (updated: { name: string; area: string }) => void;
};

export function StoreProfileModal({
  stall,
  totalDishes,
  totalRatings,
  onClose,
  onUpdated,
}: StoreProfileModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(stall.name);
  const [area, setArea] = useState(stall.area);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLandmarkClick = (lm: string) => {
    if (area.includes(lm)) {
      setArea(area.replace(new RegExp(`,?\\s*${lm}`, "g"), "").trim());
    } else {
      setArea(area ? `${area}, ${lm}` : lm);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !area.trim()) {
      setErrorMsg("Kailangan ang pangalan at lokasyon ng tindahan.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch(`/api/stalls/${stall.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), area: area.trim() }),
      });

      if (!res.ok) {
        setErrorMsg("Hindi na-save ang pagbabago. Pakisubukan muli.");
        return;
      }

      const data = await res.json();
      onUpdated({ name: data.stall.name, area: data.stall.area });
      setIsEditing(false);
    } catch {
      setErrorMsg("Nagka-error sa network. Pakisubukan muli.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DrilldownSheet
      onClose={onClose}
      title={isEditing ? "I-edit ang Profile" : "Profile ng Tindahan"}
      subtitle={stall.code ? `Code: ${stall.code}` : undefined}
      ariaLabel="Store Profile"
    >
      <div className="stack" style={{ gap: 16 }}>
        {/* Mascot Header Card (matching Simula styling) */}
        <div className="mascot-card">
          <Mascot mood="calm" size={72} />
          <div className="mascot-copy">
            <div className="mascot-brand">{name}</div>
            <div className="mascot-sub">{area}</div>
          </div>
        </div>

        {/* Quick Stats Summary */}
        <div className="stats-panel" style={{ padding: "10px 4px" }}>
          <div className="stats-panel-col">
            <span className="stats-panel-val">{totalDishes}</span>
            <span className="stats-panel-lbl">Ulam Handa</span>
          </div>
          <div className="stats-panel-col">
            <span className="stats-panel-val">{totalRatings}</span>
            <span className="stats-panel-lbl">Mga Boto</span>
          </div>
          <div className="stats-panel-col">
            <span className="stats-panel-val" style={{ fontSize: 16, color: "var(--chili)" }}>
              {stall.code}
            </span>
            <span className="stats-panel-lbl">QR Code</span>
          </div>
        </div>

        {!isEditing ? (
          /* View Mode */
          <div className="stack" style={{ gap: 14 }}>
            <div className="card stack" style={{ gap: 10 }}>
              <div>
                <span className="mute" style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>
                  Pangalan ng Karinderya
                </span>
                <p style={{ fontSize: 16, fontWeight: 600, color: "var(--ink)", margin: "4px 0 0" }}>
                  {name}
                </p>
              </div>

              <div style={{ borderTop: "1px solid var(--ring)", paddingTop: 10 }}>
                <span className="mute" style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>
                  Lokasyon o Katabing Paaralan
                </span>
                <p style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", margin: "4px 0 0" }}>
                  {area}
                </p>
              </div>
            </div>

            <button
              type="button"
              className="btn block primary-cta"
              onClick={() => setIsEditing(true)}
              style={{ marginTop: 8 }}
            >
              <Icon name="store" />
              <span>I-edit ang Profile</span>
            </button>
          </div>
        ) : (
          /* Edit Mode Form */
          <form className="stack" style={{ gap: 14 }} onSubmit={handleSave}>
            <div className="simula-field">
              <label htmlFor="store-name">Pangalan ng Karinderya</label>
              <div className="field-box">
                <span className="field-ico" aria-hidden="true">
                  <Icon name="store" />
                </span>
                <input
                  id="store-name"
                  type="text"
                  maxLength={80}
                  required
                  placeholder="Hal. Aling Rosa’s Karinderya"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="simula-field">
              <label htmlFor="store-area">Lokasyon o Katabing Paaralan</label>
              <div className="field-box">
                <span className="field-ico" aria-hidden="true">
                  <Icon name="pin" />
                </span>
                <input
                  id="store-area"
                  type="text"
                  maxLength={80}
                  required
                  placeholder="Hal. UST, Sampaloc"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                />
              </div>

              {/* Landmark quick-select chips from Simula */}
              <div className="chips location-chips" role="group" aria-label="Nearby landmarks" style={{ marginTop: 8 }}>
                {LANDMARKS.map((lm) => {
                  const selected = area.includes(lm);
                  return (
                    <button
                      key={lm}
                      type="button"
                      aria-pressed={selected}
                      className={`chip chip-sm ${selected ? "on" : ""}`}
                      onClick={() => handleLandmarkClick(lm)}
                    >
                      {lm}
                    </button>
                  );
                })}
              </div>
            </div>

            {errorMsg && (
              <p className="err" role="alert">
                {errorMsg}
              </p>
            )}

            <div className="row" style={{ marginTop: 10 }}>
              <button
                type="button"
                className="btn soft grow"
                onClick={() => {
                  setName(stall.name);
                  setArea(stall.area);
                  setIsEditing(false);
                  setErrorMsg("");
                }}
                disabled={isSubmitting}
              >
                Kanselahin
              </button>
              <button
                type="submit"
                className="btn grow primary-cta"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sinisave..." : "I-save ang Pagbabago"}
              </button>
            </div>
          </form>
        )}
      </div>
    </DrilldownSheet>
  );
}
