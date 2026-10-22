import { Icon } from "@/src/ui/Icon";
import type { IconName } from "@/src/ui/icons";

const ROWS: { tag: string; icon: IconName; label: string }[] = [
  { tag: "salt", icon: "salt", label: "Maalat o matabang" },
  { tag: "plate", icon: "plate", label: "Maliit ang serving" },
  { tag: "flame", icon: "flame", label: "Malamig" },
  { tag: "coin", icon: "coin", label: "Mahal" },
];

// How often buyers ticked each complaint. The tick marks the same share for this dish at nearby stalls, when there are enough.
export function TagBars({ shares, nearby, trend }: { shares: Record<string, number>; nearby: Record<string, number> | null; trend: (number | null)[] }) {
  return (
    <details data-testid="tagbars">
      <summary style={{ cursor: "pointer", fontWeight: 700 }}>Ano ang sinabi ng customers</summary>
      <div className="stack" style={{ paddingTop: 8 }}>
        <Trend values={trend} />
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
    </details>
  );
}

// Average score of each of the last four weeks, as a small line. A week with no ratings leaves a gap.
function Trend({ values }: { values: (number | null)[] }) {
  const pts = values.map((v, i) => (v === null ? null : `${10 + i * 60},${50 - ((v - 1) / 4) * 44}`));
  const line = pts.filter(Boolean).join(" ");
  const label = values.map((v) => (v === null ? "no ratings" : v.toFixed(1))).join(", ");
  return (
    <div data-testid="trend">
      <div className="row"><span className="grow">Huling 4 na linggo</span><span className="mute">{values.filter((v) => v !== null).length < 2 ? "Kulang pa ang datos" : ""}</span></div>
      <svg viewBox="0 0 190 56" width="100%" height="56" role="img" aria-label={`Average score by week, oldest first: ${label}`}>
        {line && <polyline points={line} fill="none" stroke="var(--cocoa)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}
        {pts.map((p, i) => p && <circle key={i} cx={p.split(",")[0]} cy={p.split(",")[1]} r="4" fill="var(--cocoa)" />)}
      </svg>
    </div>
  );
}
