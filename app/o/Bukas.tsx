"use client";
import { useEffect, useState } from "react";
import { Icon } from "@/src/ui/Icon";

type Weather = { rainChance: number | null; bagyo: boolean; factor: number };
type Row = { dishId: string; name: string; plan: { servings: number; yesterday: number | null; reasons: string[] } | null };
const WHY: Record<string, string> = {
  history: "from what sold", usual: "your usual", "sold-out": "sold out often", "high-rated": "rated high", "low-rated": "rated low", weather: "weather",
};

/** Tomorrow's suggested servings. A dish with no log and no usual servings shows Kulang pa, never a made-up number. */
export function Bukas({ stallId, refresh }: { stallId: string; refresh: number }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [fund, setFund] = useState<{ pesos: number | null; days: number } | null>(null);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    fetch(`/api/stalls/${stallId}/bukas`).then(async (r) => {
      if (!r.ok) return;
      const j = await r.json();
      setRows(j.dishes);
      setWeather(j.weather);
      setFund(j.fund);
    });
  }, [stallId, refresh, tick]);

  async function toggleBagyo() {
    await fetch(`/api/stalls/${stallId}/bagyo`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ on: !weather?.bagyo }) });
    setTick((t) => t + 1);
  }

  return (
    <div className="card stack">
      <h2>Bukas</h2>
      {weather && (
        <div className="row" data-testid="weather-pill">
          <span className="grow mute">
            {weather.bagyo
              ? "Bagyo mode is on: tomorrow's plan is trimmed to 60%. It switches off by itself after 24 hours."
              : weather.rainChance === null
                ? "Forecast not available."
                : `Tomorrow: ${weather.rainChance}% chance of rain${weather.factor < 1 ? ", plan trimmed to 85%" : ""}.`}
          </span>
          <button type="button" className="btn soft" aria-pressed={weather.bagyo} onClick={toggleBagyo}>
            {weather.bagyo ? "Turn off Bagyo" : "Bagyo mode"}
          </button>
        </div>
      )}
      {fund && (
        <div className="card row" style={{ background: "#dbe9f6", alignItems: "center" }} data-testid="fund-card">
          <span style={{ color: "#2b5d8a" }}><Icon name="shield" className="lg" /></span>
          <div className="grow">
            <span className="pill" style={{ background: "#fff", color: "#2b5d8a" }}>Simulasyon</span>
            {fund.pesos !== null
              ? <p><strong>₱{fund.pesos}</strong> <span className="mute">is half of your average daily sales over {fund.days} logged {fund.days === 1 ? "day" : "days"}. Just an example of what a storm-day fund could look like. No money is held or paid out. The half is our assumption.</span></p>
              : <p className="mute">Log a day of sales in Natira to see an example. No money is held or paid out.</p>}
          </div>
        </div>
      )}
      {rows.map((r) => (
        <div key={r.dishId} className="row" data-testid="bukas-row">
          <strong className="grow">{r.name}</strong>
          {r.plan ? (
            <span>
              {r.plan.yesterday !== null && <span className="mute">{r.plan.yesterday} → </span>}
              <strong>{r.plan.servings}</strong> <span className="mute">{r.plan.reasons.map((x) => WHY[x]).join(", ")}</span>
            </span>
          ) : <span className="mute">Kulang pa</span>}
        </div>
      ))}
    </div>
  );
}
