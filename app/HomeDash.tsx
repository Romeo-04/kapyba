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

const W = 300, H = 110, PAD = 28;
const px = (i: number) => PAD + (i * (W - 2 * PAD)) / 3;
const py = (v: number) => 14 + (1 - (v - 1) / 4) * (H - 34);

/** Average score over four weeks as a line; a week with no ratings is a gap, not a zero. */
function ScoreLine({ weeks }: { weeks: (number | null)[] }) {
  const pts = weeks.map((w, i) => (w === null ? null : { x: px(i), y: py(w), w }));
  // Consecutive weeks with ratings join into one line; a lone week is just a dot.
  const runs: { x: number; y: number }[][] = [];
  pts.forEach((p, i) => {
    if (!p) return;
    if (i > 0 && pts[i - 1]) runs[runs.length - 1].push(p); else runs.push([p]);
  });
  return (
    <svg className="line" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Average score by week: ${weeks.map((w) => (w === null ? "none" : w.toFixed(1))).join(", ")}`}>
      {[1, 3, 5].map((g) => <line key={g} className="grid" x1={PAD} x2={W - PAD} y1={py(g)} y2={py(g)} />)}
      {runs.filter((r) => r.length > 1).map((r, i) => <polyline key={i} className="path" points={r.map((p) => `${p.x},${p.y}`).join(" ")} pathLength={1} />)}
      {pts.map((p, i) => p && (
        <g key={i}>
          <circle className="dot" cx={p.x} cy={p.y} r={4.5} />
          <text className="num" x={p.x} y={p.y - 9} textAnchor="middle">{p.w.toFixed(1)}</text>
        </g>
      ))}
      {weeks.map((_, i) => <text key={i} className="lab" x={px(i)} y={H - 4} textAnchor="middle">{i === 3 ? "now" : `-${3 - i}w`}</text>)}
    </svg>
  );
}

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
  // Four weekly averages across the dishes, oldest first; a week with no ratings stays empty.
  const weeks = [0, 1, 2, 3].map((w) => {
    const v = dishes.map((d) => d.private.trend[w]).filter((x): x is number => x !== null && x !== undefined);
    return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
  });
  // Change since the week before: the latest week with ratings against the one before it. Under 0.05 counts as steady.
  const seen = weeks.filter((w): w is number => w !== null);
  const delta = seen.length >= 2 ? Math.round((seen[seen.length - 1] - seen[seen.length - 2]) * 10) / 10 : null;
  const maxPesos = Math.max(1, ...days.map((d) => d.pesos));
  const attention = dishes
    .filter((d) => d.private.count > 0 && ((d.private.score !== null && d.private.score < LOW) || d.pansin < 0 || d.flagged > 0))
    .sort((a, b) => (a.private.score ?? 5) - (b.private.score ?? 5))
    .slice(0, 3);

  return (
    <div className="stack" data-testid="home-dash">
      <div className="stats">
        <div className="stat"><strong>{total}</strong><span>ratings</span></div>
        <div className="stat" data-testid="home-avg">
          <div className="row" style={{ gap: 6 }}>
            <Ring score={avg} locked={avg === null} size={40} />
            <strong>{avg === null ? "–" : avg.toFixed(1)}</strong>
          </div>
          {delta !== null && delta !== 0 && (
            <em className={`delta ${delta > 0 ? "up" : "down"}`} data-testid="home-delta" aria-label={`${delta > 0 ? "Up" : "Down"} ${Math.abs(delta)} from last week`}>
              <Icon name={delta > 0 ? "up" : "down"} />{Math.abs(delta)}
            </em>
          )}
          <span>avg score</span>
        </div>
        <div className="stat"><strong>{dishes.length}</strong><span>dishes</span></div>
      </div>

      <div className="card stack">
        <div className="eyebrow">Score by week</div>
        <ScoreLine weeks={weeks} />
      </div>

      {days.length > 0 && (
        <div className="card stack">
          <div className="eyebrow">Leftover ₱ by day</div>
          <div className="cols" role="img" aria-label={`Leftover pesos by day: ${days.map((d) => `${d.day} ${d.pesos}`).join(", ")}`}>
            {days.map((d) => (
              <div key={d.day} className="col">
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
