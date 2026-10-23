"use client";
import { useEffect, useState } from "react";
import { Icon } from "@/src/ui/Icon";
import { Ring } from "@/src/ui/Ring";
import { iconFor } from "./s/[code]/Rate";

type Dish = {
  id: string; name: string; pansin: number; flagged: number;
  private: { count: number; score: number | null; trend: (number | null)[] };
  recs: { icon: string; dir: "up" | "down"; word: string }[];
};
type Day = { day: string; pesos: number };
type Plan = { rainChance: number | null; bagyo: boolean; servings: number };

const LOW = 3.4;

/** Signed-in home: numbers and small charts the owner can act on, built only from the stall's own data. */
export function HomeDash() {
  const [dishes, setDishes] = useState<Dish[] | null>(null);
  const [days, setDays] = useState<Day[]>([]);
  const [plan, setPlan] = useState<Plan | null>(null);

  useEffect(() => {
    let live = true;
    (async () => {
      const s = await fetch("/api/stalls");
      if (!s.ok) return;
      const id = (await s.json()).stalls?.[0]?.id;
      if (!id) { if (live) setDishes([]); return; }
      const [sum, log, bukas] = await Promise.all([
        fetch(`/api/stalls/${id}/summary`), fetch(`/api/stalls/${id}/log`), fetch(`/api/stalls/${id}/bukas`),
      ]);
      if (!live) return;
      if (sum.ok) setDishes((await sum.json()).dishes);
      if (log.ok) setDays((await log.json()).days);
      if (bukas.ok) {
        const j = await bukas.json();
        setPlan({ rainChance: j.weather.rainChance, bagyo: j.weather.bagyo, servings: j.dishes.reduce((n: number, d: { plan: { servings: number } | null }) => n + (d.plan?.servings ?? 0), 0) });
      }
    })();
    return () => { live = false; };
  }, []);

  if (!dishes || dishes.length === 0) return null;

  const rated = dishes.filter((d) => d.private.score !== null);
  const total = dishes.reduce((n, d) => n + d.private.count, 0);
  const avg = rated.length ? rated.reduce((n, d) => n + d.private.score! * d.private.count, 0) / rated.reduce((n, d) => n + d.private.count, 0) : null;
  const last = days[days.length - 1];
  // Four weekly averages across the dishes, oldest first; a week with no ratings stays empty.
  const weeks = [0, 1, 2, 3].map((w) => {
    const v = dishes.map((d) => d.private.trend[w]).filter((x): x is number => x !== null && x !== undefined);
    return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
  });
  const maxPesos = Math.max(1, ...days.map((d) => d.pesos));
  const attention = dishes
    .filter((d) => d.private.count > 0 && ((d.private.score !== null && d.private.score < LOW) || d.pansin < 0 || d.flagged > 0))
    .sort((a, b) => (a.private.score ?? 5) - (b.private.score ?? 5))
    .slice(0, 3);

  return (
    <div className="stack" data-testid="home-dash">
      <div className="stats">
        <div className="stat"><strong>{total}</strong><span>ratings</span></div>
        <div className="stat"><strong>{avg === null ? "–" : avg.toFixed(1)}</strong><span>avg score</span></div>
        <div className="stat"><strong>{last ? `₱${last.pesos}` : "–"}</strong><span>left over</span></div>
      </div>

      <div className="card stack">
        <div className="eyebrow">Score by week</div>
        <div className="bars" role="img" aria-label={`Average score by week: ${weeks.map((w) => (w === null ? "none" : w.toFixed(1))).join(", ")}`}>
          {weeks.map((w, i) => (
            <div key={i} className="bar">
              <span className="num">{w === null ? "–" : w.toFixed(1)}</span>
              <span className="fill" style={{ height: `${w === null ? 4 : Math.max(8, (w / 5) * 100)}%`, background: w !== null && w < LOW ? "var(--chili)" : "var(--leaf)" }} />
              <span className="lab">{i === 3 ? "now" : `-${3 - i}w`}</span>
            </div>
          ))}
        </div>
      </div>

      {days.length > 0 && (
        <div className="card stack">
          <div className="eyebrow">Leftover ₱ by day</div>
          <div className="bars" role="img" aria-label={`Leftover pesos by day: ${days.map((d) => `${d.day} ${d.pesos}`).join(", ")}`}>
            {days.map((d) => (
              <div key={d.day} className="bar">
                <span className="num">₱{d.pesos}</span>
                <span className="fill" style={{ height: `${Math.max(6, (d.pesos / maxPesos) * 100)}%`, background: "var(--amber)" }} />
                <span className="lab">{d.day.slice(8)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {plan && (
        <div className="card row between" data-testid="home-tomorrow">
          <div>
            <div className="eyebrow">Tomorrow</div>
            <div className="big">{plan.servings}<span className="mute small"> servings</span></div>
          </div>
          <div className="right">
            <div className="eyebrow">Rain</div>
            <div className="big">{plan.bagyo ? "Bagyo" : plan.rainChance === null ? "–" : `${plan.rainChance}%`}</div>
          </div>
        </div>
      )}

      {attention.length > 0 && (
        <div className="card stack" data-testid="home-attention">
          <div className="eyebrow">Needs attention</div>
          {attention.map((d) => (
            <a key={d.id} className="row between attn" href="/o">
              <Ring score={d.private.score} locked={d.private.score === null} size={44} />
              <strong className="grow">{d.name}</strong>
              <span className="row" style={{ gap: 6 }}>
                {d.recs.slice(0, 2).map((r) => <span key={r.word} className="pill"><Icon name={iconFor(r.icon)} /><Icon name={r.dir} />{r.word}</span>)}
                {d.recs.length === 0 && d.flagged > 0 && <span className="pill r"><Icon name="alert" />{d.flagged}</span>}
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
