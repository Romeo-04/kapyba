"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/src/ui/Icon";
import type { IconName } from "@/src/ui/icons";
import { Face } from "@/src/ui/Face";
import { Kapy } from "@/src/ui/Kapy";
import { ago } from "@/src/ui/ago";
import { tone } from "@/src/domain/scoring";
import { iconFor } from "../s/[code]/Rate";
import { Ulat } from "./Ulat";
import type { Summary } from "./Owner";

export const ROWS: { tag: string; icon: IconName; label: string }[] = [
  { tag: "salt", icon: "salt", label: "Too salty or bland" },
  { tag: "plate", icon: "plate", label: "Small serving" },
  { tag: "flame", icon: "flame", label: "Served cold" },
  { tag: "coin", icon: "coin", label: "Too expensive" },
  { tag: "leaf", icon: "leaf", label: "Not fresh" },
  { tag: "alert", icon: "alert", label: "Tough or overcooked" },
  { tag: "chili", icon: "chili", label: "Too spicy" },
  { tag: "clock", icon: "clock", label: "Slow service" },
];
const TONE_WORD = { happy: "Tasty", neutral: "Okay", sad: "Not tasty" } as const;

/** What customers said about one dish: the average, complaint shares, guidance, and the latest comments. */
export function ReviewsSheet({ dishes, id, onSwitch, onClose, onFiled }: { dishes: Summary[]; id: string; onSwitch: (id: string) => void; onClose: () => void; onFiled: () => void }) {
  const d = dishes.find((x) => x.id === id) ?? dishes[0];
  const closeRef = useRef<HTMLButtonElement>(null);
  const [now] = useState(() => Date.now());

  useEffect(() => {
    closeRef.current?.focus();
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [onClose]);

  const nearby = d.kumpara?.tagShares ?? null;
  const score = d.private.score;
  // In the body, like the dish sheet: the page's entrance animation would otherwise trap a fixed overlay.
  return createPortal(
    <div className="sheet-back" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={`Customer reviews for ${d.name}`} data-testid="tagbars" onClick={(e) => e.stopPropagation()}>
        <div className="pop-head">
          <div className="grow"><h2>Customer reviews</h2><p className="mute">{d.name}</p></div>
          <button ref={closeRef} type="button" className="btn soft round" aria-label="Close" onClick={onClose}><Icon name="x" /></button>
        </div>
        <div className="stack pop-body">
          {dishes.length > 1 && (
            <div className="row"><label htmlFor="switch-dish" className="mute">Switch dish</label>
              <select id="switch-dish" className="grow" value={d.id} onChange={(e) => onSwitch(e.target.value)}>{dishes.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select>
            </div>
          )}

          <div className="panel avg">
            <span className="eyebrow">Average customer rating</span>
            {score === null
              ? <strong className="none">No ratings yet</strong>
              : <div className="bigscore"><Face tone={tone(score)} size={44} /><strong>{score.toFixed(1)}</strong><span>/5.0</span></div>}
            <p className="mute">{d.private.count} {d.private.count === 1 ? "rating" : "ratings"} · {d.private.buyers} {d.private.buyers === 1 ? "customer" : "customers"}</p>
          </div>

          <div className="panel" data-testid="taste">
            <h3>Customer taste feedback</h3>
            <Trend values={d.private.trend} />
            {ROWS.map((r) => {
              const pct = Math.round((d.private.tagShares[r.tag] ?? 0) * 100);
              const peer = nearby ? Math.round((nearby[r.tag] ?? 0) * 100) : null;
              return (
                <div key={r.tag}>
                  <div className="row"><Icon name={r.icon} /><span className="grow">{r.label}</span><strong>{pct}%{peer !== null && <span className="mute"> · nearby {peer}%</span>}</strong></div>
                  <div role="meter" aria-label={r.label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} className="meter">
                    <div style={{ width: `${pct}%` }} />
                    {peer !== null && <span aria-hidden style={{ left: `${peer}%` }} />}
                  </div>
                </div>
              );
            })}
            {nearby && <p className="mute small">The tick marks the average of nearby karinderyas.</p>}
          </div>

          <div className="panel guide">
            <Kapy pose="wave" size={56} anim="bob" />
            <div className="grow">
              <strong>Taste guidance</strong>
              {d.recs.length === 0
                ? <p className="mute">A few more ratings are needed to generate taste balance guidance.</p>
                : <div className="row" style={{ flexWrap: "wrap", marginTop: 6 }}>{d.recs.map((r) => <span key={r.word} className="pill"><Icon name={iconFor(r.icon)} /><Icon name={r.dir} />{r.word}</span>)}</div>}
            </div>
          </div>

          <div className="panel">
            <div className="row between"><h3>Top reviews</h3><span className="mute small">Private to you</span></div>
            {d.comments.length === 0 && <p className="mute">No comments yet.</p>}
            {d.comments.length > 0 && (
              <div data-testid="owner-comments" className="stack" style={{ gap: 8 }}>
                {d.comments.map((c, i) => {
                  const t = tone(c.score);
                  return (
                    <div key={i} className="review">
                      <div className="row between"><span className="row" style={{ gap: 8 }}><Face tone={t} size={28} /><strong>{TONE_WORD[t]}</strong></span><span className="mute small">{ago(c.at, now)}</span></div>
                      <p>&ldquo;{c.text}&rdquo;</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <Ulat dishes={[{ id: d.id, name: d.name }]} onFiled={onFiled} />
        </div>
      </div>
    </div>,
    document.body,
  );
}

// Average score of each of the last four weeks, as a small line. A week with no ratings leaves a gap.
function Trend({ values }: { values: (number | null)[] }) {
  const pts = values.map((v, i) => (v === null ? null : `${10 + i * 60},${50 - ((v - 1) / 4) * 44}`));
  const line = pts.filter(Boolean).join(" ");
  const label = values.map((v) => (v === null ? "no ratings" : v.toFixed(1))).join(", ");
  return (
    <div data-testid="trend">
      <div className="row"><span className="grow mute">Last 4 weeks</span><span className="mute small">{values.filter((v) => v !== null).length < 2 ? "Not enough data yet" : ""}</span></div>
      <svg viewBox="0 0 190 56" width="100%" height="56" role="img" aria-label={`Average score by week, oldest first: ${label}`}>
        {line && <polyline points={line} fill="none" stroke="var(--brand)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}
        {pts.map((p, i) => p && <circle key={i} cx={p.split(",")[0]} cy={p.split(",")[1]} r="4" fill="var(--brand)" />)}
      </svg>
    </div>
  );
}
