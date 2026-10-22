"use client";
import { useEffect, useState } from "react";
import { Icon } from "@/src/ui/Icon";
import { Mascot } from "@/src/ui/Mascot";

type Weather = { rainChance: number | null; bagyo: boolean; factor: number };
type Row = {
  dishId: string;
  name: string;
  plan: { servings: number; yesterday: number | null; reasons: string[] } | null;
};

const WHY: Record<string, string> = {
  history: "benta kahapon",
  usual: "karaniwan",
  "sold-out": "mabilis maubos",
  "high-rated": "mataas ang rating",
  "low-rated": "mababang rating",
  weather: "panahon",
};

export function BukasView({
  stallId,
  refresh,
  onOpenPalengke,
}: {
  stallId: string;
  refresh: number;
  onOpenPalengke: () => void;
}) {
  const [rows, setRows] = useState<Row[]>([]);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    fetch(`/api/stalls/${stallId}/bukas`).then(async (r) => {
      if (!r.ok) return;
      const j = await r.json();
      setRows(j.dishes);
      setWeather(j.weather);
    });
  }, [stallId, refresh, tick]);

  async function toggleBagyo() {
    await fetch(`/api/stalls/${stallId}/bagyo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ on: !weather?.bagyo }),
    });
    setTick((t) => t + 1);
  }

  const isRainy = (weather?.rainChance ?? 0) >= 40 || weather?.bagyo;
  const totalSuggested = rows.reduce((sum, r) => sum + (r.plan?.servings ?? 0), 0);

  return (
    <div className="stack bukas-view">
      {/* Header */}
      <div className="row" style={{ gap: 14, alignItems: "center" }}>
        <Mascot mood={isRainy ? "rain" : "calm"} size={54} />
        <div className="grow">
          <h1 style={{ margin: 0, fontSize: 24 }}>Bukas</h1>
          <p className="mute" style={{ margin: "2px 0 0", fontSize: 14 }}>Mungkahing lulutuin para sa benta bukas</p>
        </div>
      </div>

      {/* Weather Pill & Controls */}
      {weather && (
        <div className="card stack weather-card">
          <div className="row" data-testid="weather-pill" style={{ justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <div className="grow">
              <div className="row" style={{ gap: 6, marginBottom: 4 }}>
                <span className="weather-ico" style={{ color: isRainy ? "var(--rain)" : "var(--amber)" }}>
                  <Icon name={isRainy ? "drop" : "sparkle"} />
                </span>
                <strong style={{ fontSize: 15 }}>
                  {weather.bagyo
                    ? "Naka-on ang Bagyo Mode"
                    : weather.rainChance === null
                    ? "Walang ulat sa ulan"
                    : `${weather.rainChance}% tsansa ng ulan bukas`}
                </strong>
              </div>
              <p className="mute" style={{ fontSize: 13, margin: 0 }}>
                {weather.bagyo
                  ? "Bawas sa 60% ang dami ng luto upang maiwasan ang tapon. Kusa itong mamamatay matapos ang 24 oras."
                  : weather.factor < 1
                  ? "Bawas sa 85% ang luto dahil sa ulan."
                  : "Normal ang tantya ng benta para bukas."}
              </p>
            </div>

            <button
              type="button"
              className={`btn soft ${weather.bagyo ? "on" : ""}`}
              style={{ minHeight: 40, padding: "0 14px", fontSize: 13, flex: "none" }}
              aria-pressed={weather.bagyo}
              onClick={toggleBagyo}
            >
              <Icon name="drop" />
              {weather.bagyo ? "Turn off Bagyo" : "Bagyo mode"}
            </button>
          </div>
        </div>
      )}

      {/* Servings Plan per Dish */}
      <div className="card stack">
        <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ fontSize: 18, margin: 0 }}>Plano ng Servings</h2>
            <p className="mute" style={{ fontSize: 13, margin: "2px 0 0" }}>Kalkulado mula sa benta at panahon</p>
          </div>
          {totalSuggested > 0 && (
            <span className="pill" style={{ background: "var(--cream)", color: "var(--cocoa)", fontWeight: 700, fontSize: 12 }}>
              {totalSuggested} servings kabuuan
            </span>
          )}
        </div>

        <div className="stack" style={{ gap: 12, marginTop: 4 }}>
          {rows.map((r) => {
            const yesterday = r.plan?.yesterday ?? 10;
            const servings = r.plan?.servings ?? 10;
            const maxVal = Math.max(yesterday, servings, 15);
            const yesterdayPct = Math.min(100, Math.round((yesterday / maxVal) * 100));
            const servingsPct = Math.min(100, Math.round((servings / maxVal) * 100));

            return (
              <div key={r.dishId} className="bukas-row-card" data-testid="bukas-row">
                <div className="row" style={{ gap: 12, alignItems: "center" }}>
                  <div className="ico-plate" style={{ width: 42, height: 42, flex: "none" }}>
                    <Icon name="bowl" />
                  </div>
                  <div className="grow">
                    <div className="row" style={{ justifyContent: "space-between", alignItems: "baseline" }}>
                      <strong style={{ fontSize: 16 }}>{r.name}</strong>
                      {r.plan ? (
                        <div className="row" style={{ gap: 6, alignItems: "baseline" }}>
                          <span>
                            {r.plan.yesterday !== null && (
                              <span className="mute" style={{ fontSize: 13 }}>{r.plan.yesterday} →{" "}</span>
                            )}
                            <strong style={{ fontSize: 20, fontFamily: "var(--font-heading)", color: "var(--leaf)" }}>
                              {r.plan.servings}
                            </strong>
                          </span>
                          <span className="mute" style={{ fontSize: 12 }}>plates</span>
                        </div>
                      ) : (
                        <span className="mute" style={{ fontSize: 13 }}>Kulang pa</span>
                      )}
                    </div>
                  </div>
                </div>

                {r.plan && (
                  <div style={{ marginTop: 10 }}>
                    {/* Paired Visual Bars (UX.md 4.5 & O4) */}
                    <div className="paired-bars">
                      {r.plan.yesterday !== null && (
                        <div className="paired-bar-row">
                          <span className="paired-bar-lbl mute">Kahapon</span>
                          <div className="paired-bar-track">
                            <div className="paired-bar-fill yesterday" style={{ width: `${yesterdayPct}%` }} />
                          </div>
                        </div>
                      )}
                      <div className="paired-bar-row">
                        <span className="paired-bar-lbl mute">Bukas</span>
                        <div className="paired-bar-track">
                          <div className="paired-bar-fill tomorrow" style={{ width: `${servingsPct}%` }} />
                        </div>
                      </div>
                    </div>

                    <div className="row" style={{ flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                      {r.plan.reasons.map((x) => (
                        <span key={x} className="pill" style={{ fontSize: 11, padding: "2px 8px" }}>
                          {WHY[x] ?? x}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Simulated Bagyo Fund Card (UX.md O4 & 4.5, RA 10607 compliant simulation) */}
      {isRainy && (
        <div className="card fund-card">
          <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
            <div className="row" style={{ gap: 10 }}>
              <div className="fund-ico">
                <Icon name="shield" />
              </div>
              <div>
                <strong style={{ fontSize: 15, color: "var(--rain)" }}>Bagyo Fund Model</strong>
                <div style={{ fontFamily: "var(--font-heading)", fontSize: 24, fontWeight: 700, color: "var(--ink)", marginTop: 2 }}>
                  ₱1,200
                </div>
              </div>
            </div>
            <span className="pill" style={{ background: "#dbeefc", color: "var(--rain)", fontWeight: 800 }}>
              Simulasyon
            </span>
          </div>
          <p className="mute" style={{ fontSize: 12.5, margin: "6px 0 0" }}>
            Modelong tantya para sa proteksyon ng puhunan sa panahon ng masamang lagay ng panahon.
          </p>
        </div>
      )}

      {/* Big Palengke Card linking to O5 Palengke */}
      <div
        className="card stack palengke-card-cta"
        onClick={onOpenPalengke}
        role="button"
        tabIndex={0}
        aria-label="Listahan sa Palengke"
      >
        <div className="row">
          <div className="cart-plate">
            <Icon name="cart" />
          </div>
          <div className="grow">
            <h2 style={{ fontSize: 17, margin: 0 }}>Listahan sa Palengke</h2>
            <p className="mute" style={{ fontSize: 13, margin: "2px 0 0" }}>
              Tingnan ang sangkap at tantyang gastos sa pamimili
            </p>
          </div>
          <button type="button" className="btn round soft" aria-label="Buksan ang Palengke">
            <Icon name="next" />
          </button>
        </div>
      </div>
    </div>
  );
}
