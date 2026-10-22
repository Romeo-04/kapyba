import { arc, tone, type Tone } from "@/src/domain/scoring";
import { Face, TONE_COLOR } from "./Face";

/** Score ring: arc is score / 5, colour and face follow the tone. A locked dish shows a muted empty ring. */
export function Ring({ score, size = 56, locked = false }: { score: number | null; size?: number; locked?: boolean }) {
  const r = 22;
  const c = 2 * Math.PI * r;
  const t: Tone | null = score === null ? null : tone(score);
  const frac = locked || score === null ? 0 : arc(score);
  return (
    <div style={{ position: "relative", width: size, height: size, flex: "none" }}>
      <svg width={size} height={size} viewBox="0 0 56 56" style={{ transform: "rotate(-90deg)" }} aria-hidden>
        <circle cx="28" cy="28" r={r} fill="none" stroke="var(--cream)" strokeWidth="6" />
        <circle cx="28" cy="28" r={r} fill="none" stroke={t && !locked ? TONE_COLOR[t] : "var(--tan)"} strokeWidth="6" strokeLinecap="round" strokeDasharray={`${c * frac} ${c}`} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "var(--mute)" }}>
        {t && !locked ? <Face tone={t} size={size * 0.5} /> : <svg className="i" viewBox="0 0 24 24" aria-hidden><rect x="5" y="11" width="14" height="9" rx="2.5" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>}
      </div>
    </div>
  );
}
