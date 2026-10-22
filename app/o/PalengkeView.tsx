"use client";
import { useEffect, useState } from "react";
import { DrilldownSheet } from "@/src/ui/DrilldownSheet";
import { Icon } from "@/src/ui/Icon";

type List = {
  items: { key: string; label: string; kg: number; low: number; high: number }[];
  total: { low: number; high: number };
  noRecipe: string[];
  priceSource: string;
};

export function PalengkeView({
  stallId,
  refresh,
  onClose,
}: {
  stallId: string;
  refresh: number;
  onClose: () => void;
}) {
  const [list, setList] = useState<List | null>(null);
  const [got, setGot] = useState<Set<string>>(new Set());
  const [shopDark, setShopDark] = useState(false);

  useEffect(() => {
    fetch(`/api/stalls/${stallId}/palengke`).then(async (r) => {
      if (r.ok) setList(await r.json());
    });
  }, [stallId, refresh]);

  const lowTotal = list?.total.low ?? 0;
  const highTotal = list?.total.high ?? 0;
  const midTotal = Math.round((lowTotal + highTotal) / 2);
  const totalItems = list?.items.length ?? 0;
  const boughtCount = list?.items.filter((i) => got.has(i.key)).length ?? 0;

  return (
    <DrilldownSheet
      isOpen={true}
      onClose={onClose}
      title="Palengke"
      ariaLabel="Palengke"
      className={shopDark ? "shop-dark" : ""}
      left={
        <button type="button" className="simula-back" onClick={onClose} aria-label="Bumalik">
          <Icon name="back" />
        </button>
      }
      right={
        <button
          type="button"
          className={`chip ${shopDark ? "on" : ""}`}
          onClick={() => setShopDark(!shopDark)}
          aria-label="Toggle Umaga dark mode"
          style={{ minHeight: 36, padding: "0 10px" }}
        >
          {shopDark ? "☀️ Araw" : "🌙 Umaga"}
        </button>
      }
    >
      {!list ? (
        <div className="card stack center" style={{ padding: 40, background: "#fff" }}>
          <p className="mute">Kinakarga ang listahan sa palengke...</p>
        </div>
      ) : list.items.length === 0 ? (
        <div className="card stack center" style={{ padding: 36, background: "#fff" }}>
          <p className="mute">
            Kulang pa. Mag-log muna sa Natira o maglagay ng karaniwang servings para makabuo ng listahan sa palengke.
          </p>
          <button type="button" className="btn soft" onClick={onClose}>
            Bumalik sa Bukas
          </button>
        </div>
      ) : (
        <>
          {/* Likely Total Card (UX.md O5 & 4.5) */}
          <div className="card stack palengke-total-card" style={{ background: "#fff" }}>
            <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <span className="mute" style={{ fontSize: 13, textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.04em" }}>
                  Tantyang Gastos
                </span>
                <p data-testid="palengke-total" style={{ margin: "2px 0 0", fontSize: 26, fontFamily: "var(--font-heading)" }}>
                  <strong>₱{lowTotal}–₱{highTotal}</strong>{" "}
                  <span className="mute" style={{ fontSize: 14, fontFamily: "var(--font-sans)" }}>likely total</span>
                </p>
              </div>
              <span className="pill" style={{ background: "var(--cream)", color: "var(--cocoa)", fontWeight: 700 }}>
                {boughtCount}/{totalItems} nabili
              </span>
            </div>

            {/* Range Band Gauge */}
            <div className="range-gauge-wrap">
              <div className="range-gauge-track">
                <div className="range-gauge-fill" />
                <span className="range-gauge-marker" style={{ left: "50%" }} title={`Malamang ₱${midTotal}`} />
              </div>
              <div className="row" style={{ justifyContent: "space-between", fontSize: 12, color: "var(--mute)", marginTop: 4 }}>
                <span>Mababa: ₱{lowTotal}</span>
                <span>Malamang: ₱{midTotal}</span>
                <span>Mataas: ₱{highTotal}</span>
              </div>
            </div>
          </div>

          {/* Ingredient Checklist */}
          <div className="card stack" style={{ background: "#fff" }}>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <h2 style={{ fontSize: 17 }}>Mga Sangkap</h2>
              <span className="mute" style={{ fontSize: 12 }}>I-check pag nabili na</span>
            </div>

            <div className="stack" style={{ gap: 8 }}>
              {list.items.map((i) => {
                const checked = got.has(i.key);
                return (
                  <label
                    key={i.key}
                    className={`palengke-item-row ${checked ? "is-bought" : ""}`}
                    style={{
                      opacity: checked ? 0.45 : 1,
                      textDecoration: checked ? "line-through" : "none",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setGot((s) => {
                          const n = new Set(s);
                          if (n.has(i.key)) n.delete(i.key);
                          else n.add(i.key);
                          return n;
                        })
                      }
                      style={{ width: 22, height: 22, flex: "none", cursor: "pointer" }}
                    />
                    <span className="grow">
                      <strong>{i.label}</strong> · {i.kg} kg
                    </span>
                    <span className="price mute" style={{ fontSize: 14 }}>
                      ₱{i.low}–₱{i.high}
                    </span>
                  </label>
                );
              })}
            </div>

            {list.noRecipe.length > 0 && (
              <p className="mute" style={{ fontSize: 12.5, borderTop: "1px dashed var(--ring)", paddingTop: 8 }}>
                Wala pang recipe para sa: {list.noRecipe.join(", ")}.
              </p>
            )}

            <p className="mute" role="note" style={{ fontSize: 12 }}>
              Prices are a {list.priceSource}. Treat them as a rough guide only.
            </p>
          </div>
        </>
      )}
    </DrilldownSheet>
  );
}
