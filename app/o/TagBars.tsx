"use client";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/src/ui/Icon";
import type { IconName } from "@/src/ui/icons";

const ROWS: { tag: string; icon: IconName; label: string }[] = [
  { tag: "salt", icon: "salt", label: "Too salty or bland" },
  { tag: "plate", icon: "plate", label: "Small serving" },
  { tag: "flame", icon: "flame", label: "Served cold" },
  { tag: "coin", icon: "coin", label: "Too expensive" },
  { tag: "leaf", icon: "leaf", label: "Not fresh" },
  { tag: "alert", icon: "alert", label: "Tough or overcooked" },
  { tag: "chili", icon: "chili", label: "Too spicy" },
  { tag: "clock", icon: "clock", label: "Slow service" },
];

// How often buyers ticked each complaint. The tick marks the same share for this dish at nearby stalls, when there are enough.
export function TagBars({ dish, shares, nearby, trend, comments, onClose }: { dish: string; shares: Record<string, number>; nearby: Record<string, number> | null; trend: (number | null)[]; comments: { score: number; text: string; at: string }[]; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [onClose]);

  // In the body, like the dish sheet: the page's entrance animation would otherwise trap a fixed overlay.
  return createPortal(
    <div className="sheet-back mid" onClick={onClose}>
    <div className="sheet pop" role="dialog" aria-modal="true" aria-label={`What customers said about ${dish}`} data-testid="tagbars" onClick={(e) => e.stopPropagation()}>
      <div className="pop-head">
        <div className="grow"><span className="eyebrow">{dish}</span><h2>What customers said</h2></div>
        <button ref={closeRef} type="button" className="btn soft round" aria-label="Close" onClick={onClose}><Icon name="x" /></button>
      </div>
      <div className="stack pop-body">
        <Trend values={trend} />
        {comments.length > 0 && (
          <div data-testid="owner-comments">
            <strong>Comments</strong>
            {comments.map((c, i) => <p key={i} className="mute">&ldquo;{c.text}&rdquo; · {c.score >= 4 ? "Tasty" : c.score >= 3 ? "Okay" : "Not tasty"}</p>)}
          </div>
        )}
        {ROWS.map((r) => {
          const pct = Math.round((shares[r.tag] ?? 0) * 100);
          const peer = nearby ? Math.round((nearby[r.tag] ?? 0) * 100) : null;
          return (
            <div key={r.tag}>
              <div className="row"><Icon name={r.icon} /><span className="grow">{r.label}</span><span className="mute">{pct}%{peer !== null && ` · nearby ${peer}%`}</span></div>
              <div role="meter" aria-label={r.label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}
                style={{ position: "relative", height: 8, borderRadius: 99, background: "var(--cream)" }}>
                <div style={{ width: `${pct}%`, height: "100%", borderRadius: 99, background: "var(--cocoa)" }} />
                {peer !== null && <span aria-hidden style={{ position: "absolute", left: `${peer}%`, top: -3, width: 3, height: 14, background: "var(--ink)", borderRadius: 2 }} />}
              </div>
            </div>
          );
        })}
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
      <div className="row"><span className="grow">Last 4 weeks</span><span className="mute">{values.filter((v) => v !== null).length < 2 ? "Not enough data yet" : ""}</span></div>
      <svg viewBox="0 0 190 56" width="100%" height="56" role="img" aria-label={`Average score by week, oldest first: ${label}`}>
        {line && <polyline points={line} fill="none" stroke="var(--cocoa)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}
        {pts.map((p, i) => p && <circle key={i} cx={p.split(",")[0]} cy={p.split(",")[1]} r="4" fill="var(--cocoa)" />)}
      </svg>
    </div>
  );
}
