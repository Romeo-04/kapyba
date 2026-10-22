"use client";
import { useEffect, useState } from "react";
import { Icon } from "@/src/ui/Icon";
import { Mascot } from "@/src/ui/Mascot";
import { iconFor } from "../s/[code]/Rate";

type Day = { day: string; pesos: number; leftover: number; cooked: number };
type Dish = { id: string; name: string; price?: number; icon?: string };

export function NatiraView({
  stallId,
  dishes,
  onSaved,
  onGoToBukas,
}: {
  stallId: string;
  dishes: Dish[];
  onSaved?: () => void;
  onGoToBukas?: () => void;
}) {
  const [days, setDays] = useState<Day[]>([]);
  const [msg, setMsg] = useState("");
  const [tick, setTick] = useState(0);

  // Linis checklist states (UX.md O3)
  const [linisTable, setLinisTable] = useState(false);
  const [linisCover, setLinisCover] = useState(false);
  const [linisWash, setLinisWash] = useState(false);

  useEffect(() => {
    fetch(`/api/stalls/${stallId}/log`).then(async (r) => {
      if (r.ok) setDays((await r.json()).days);
    });
  }, [stallId, tick]);

  const today = days[days.length - 1];
  const allLinisDone = linisTable && linisCover && linisWash;

  return (
    <div className="stack natira-view">
      {/* Header */}
      <div className="row">
        <Mascot mood={allLinisDone ? "happy" : "calm"} size={54} />
        <div className="grow">
          <h1>Natira</h1>
          <p className="mute">I-log ang niluto at naibenta ngayong araw</p>
        </div>
      </div>

      {/* Big Number Summary Card (UX.md 4.5 & O3) */}
      <div className="card stack natira-stat-card">
        <div className="row" style={{ alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <span className="mute" style={{ fontSize: 13, textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>
              Natira Kahapon / Huling Log
            </span>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: 32, fontWeight: 700, color: "var(--ink)", marginTop: 2 }}>
              ₱{today?.pesos ?? 0}
            </div>
          </div>
          <div className="stat-badge-ico" style={{ background: "var(--cream)", color: "var(--cocoa)", width: 44, height: 44, borderRadius: 14, display: "grid", placeItems: "center" }}>
            <Icon name="bin" />
          </div>
        </div>

        {today ? (
          <p className="mute" data-testid="natira-summary" style={{ fontSize: 13.5 }}>
            Last log {today.day}: {today.leftover} left over, about ₱{today.pesos}
          </p>
        ) : (
          <p className="mute" data-testid="natira-summary" style={{ fontSize: 13.5 }}>
            Wala pang log ngayon. Ilagay ang niluto at naibenta sa ibaba.
          </p>
        )}
      </div>

      {/* Dish Portions Logging Form */}
      <form
        className="card stack"
        onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          const entries = dishes
            .filter((d) => f.get(`cooked-${d.id}`) !== "")
            .map((d) => ({
              dishId: d.id,
              cooked: Number(f.get(`cooked-${d.id}`)),
              sold: Number(f.get(`sold-${d.id}`) || 0),
            }));
          if (entries.length === 0) return setMsg("Maglagay ng kahit isang ulam.");
          const r = await fetch(`/api/stalls/${stallId}/log`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ entries }),
          });
          setMsg(r.ok ? "Na-save na ang araw na ito!" : "Hindi pwedeng mas marami ang benta sa niluto.");
          if (r.ok) {
            setTick((t) => t + 1);
            onSaved?.();
          }
        }}
      >
        <div className="row" style={{ justifyContent: "space-between" }}>
          <h2 style={{ fontSize: 18 }}>Portions bawat Ulam</h2>
          <span className="mute" style={{ fontSize: 13 }}>Cooked / Sold</span>
        </div>

        <div className="stack" style={{ gap: 10 }}>
          {dishes.map((d) => (
            <div key={d.id} className="natira-dish-row">
              <div className="row grow" style={{ minWidth: 120 }}>
                <div className="ico-plate" style={{ width: 38, height: 38 }}>
                  <Icon name={iconFor(d.icon ?? "bowl")} />
                </div>
                <div>
                  <strong style={{ fontSize: 15, display: "block" }}>{d.name}</strong>
                  {d.price && <span className="mute" style={{ fontSize: 12 }}>₱{d.price} bawat serving</span>}
                </div>
              </div>

              <div className="row" style={{ gap: 8 }}>
                <div>
                  <label htmlFor={`cooked-${d.id}`} style={{ fontSize: 11, marginBottom: 2, color: "var(--mute)" }}>
                    Luto
                  </label>
                  <input
                    id={`cooked-${d.id}`}
                    name={`cooked-${d.id}`}
                    aria-label={`${d.name} cooked`}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={10000}
                    placeholder="0"
                    style={{ width: 78, textAlign: "center" }}
                  />
                </div>

                <div>
                  <label htmlFor={`sold-${d.id}`} style={{ fontSize: 11, marginBottom: 2, color: "var(--mute)" }}>
                    Benta
                  </label>
                  <input
                    id={`sold-${d.id}`}
                    name={`sold-${d.id}`}
                    aria-label={`${d.name} sold`}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={10000}
                    placeholder="0"
                    style={{ width: 78, textAlign: "center" }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Linis Row (UX.md O3 & 4.5) */}
        <div className="card linis-box" style={{ background: "var(--cream)", border: "1px solid var(--ring)", borderRadius: 16, padding: "14px" }}>
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--cocoa)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Linis Check-in
            </span>
            {allLinisDone && <span className="pill g"><Icon name="check" /> Linis</span>}
          </div>

          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              className={`chip ${linisTable ? "on" : ""}`}
              onClick={() => setLinisTable(!linisTable)}
              aria-pressed={linisTable}
            >
              <Icon name="sparkle" /> Lamesa
            </button>
            <button
              type="button"
              className={`chip ${linisCover ? "on" : ""}`}
              onClick={() => setLinisCover(!linisCover)}
              aria-pressed={linisCover}
            >
              <Icon name="dome" /> Takip
            </button>
            <button
              type="button"
              className={`chip ${linisWash ? "on" : ""}`}
              onClick={() => setLinisWash(!linisWash)}
              aria-pressed={linisWash}
            >
              <Icon name="drop" /> Hugasan
            </button>
          </div>
        </div>

        {msg && <p role="status" className="mute center" style={{ fontWeight: 600 }}>{msg}</p>}

        <button type="submit" className="btn block primary-cta">
          <Icon name="check" /> Save today
        </button>

        {onGoToBukas && (
          <button type="button" className="btn soft block" onClick={onGoToBukas}>
            Tingnan ang Plano sa Bukas <Icon name="next" />
          </button>
        )}
      </form>
    </div>
  );
}
