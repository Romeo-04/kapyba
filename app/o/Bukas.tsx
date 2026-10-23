"use client";
import { useEffect, useState } from "react";
import { Icon } from "@/src/ui/Icon";

type Weather = { rainChance: number | null; bagyo: boolean; factor: number };
type Row = { dishId: string; name: string; plan: { servings: number; yesterday: number | null; reasons: string[] } | null };
const WHY: Record<string, string> = {
  history: "from what sold", usual: "your usual", "sold-out": "sold out often", "high-rated": "rated high", "low-rated": "rated low", weather: "weather",
};

/** Tomorrow's suggested servings. A dish with no log and no usual servings shows Not enough data, never a made-up number. */
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

  const msg = !weather ? null
    : weather.bagyo ? <>Bagyo mode is on: tomorrow&apos;s plan is trimmed to 60%. It switches off by itself after 24 hours.</>
    : weather.rainChance === null ? <>Forecast not available.</>
    : weather.factor < 1 ? <>There&apos;s a <strong className="hot">{weather.rainChance}%</strong> chance of rain. Plan trimmed to 85%. Turn on Bagyo mode to trim more.</>
    : <>You&apos;re all set! Only a {weather.rainChance}% chance of rain tomorrow.</>;

  return (
    <section className="stack">
      <h2 className="sec">Weather</h2>
      <div className="card stack">
        {weather && (
          <div className="row" data-testid="weather-pill">
            <p className="grow mute lead">{msg}</p>
            <button type="button" className="round-ico" aria-pressed={weather.bagyo} aria-label={weather.bagyo ? "Turn off Bagyo" : "Bagyo mode"} onClick={toggleBagyo}>
              <Icon name="shield" />
            </button>
          </div>
        )}
        {fund && (
          <div className="row fund" data-testid="fund-card">
            <span style={{ color: "#2b5d8a" }}><Icon name="shield" className="lg" /></span>
            <div className="grow">
              <span className="pill" style={{ background: "#fff", color: "#2b5d8a" }}>Simulasyon</span>
              {fund.pesos !== null
                ? <p><strong>₱{fund.pesos}</strong> <span className="mute">is half of your average daily sales over {fund.days} logged {fund.days === 1 ? "day" : "days"}. Just an example of what a storm-day fund could look like. No money is held or paid out. The half is our assumption.</span></p>
                : <p className="mute">Log a day of sales in Leftovers to see an example. No money is held or paid out.</p>}
            </div>
          </div>
        )}
        <hr className="rule" />
        <div className="eyebrow">Recommended serving</div>
        {rows.length === 0 && <p className="mute">Add a dish to see tomorrow&apos;s servings.</p>}
        {rows.map((r) => (
          <div key={r.dishId} className="row between" data-testid="bukas-row">
            <span>{r.name}</span>
            {r.plan ? (
              <span>
                {r.plan.yesterday !== null && <span className="mute">{r.plan.yesterday} → </span>}
                <strong>{r.plan.servings}</strong> <span className="mute small">{r.plan.reasons.map((x) => WHY[x]).join(", ")}</span>
              </span>
            ) : <span className="mute">Not enough data</span>}
          </div>
        ))}
      </div>
    </section>
  );
}
