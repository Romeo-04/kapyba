"use client";
import { Face } from "@/src/ui/Face";
import { ago } from "@/src/ui/ago";
import type { Notice } from "@/src/services/notifications";

const tone = (n: number) => (n >= 4 ? "happy" : n >= 3 ? "neutral" : "sad") as "happy" | "neutral" | "sad";
const word = (n: number) => (n >= 4 ? "Masarap" : n >= 3 ? "Okay lang" : "Hindi masarap");

/** Balita: who-cares-who-rated is never shown, only which dish was rated and how it went. */
export function Balita({ items, fresh, now, canAlert, onAlert }: { items: Notice[]; fresh: Set<string>; now: number; canAlert: boolean; onAlert: () => void }) {
  return (
    <div className="stack">
      {canAlert && (
        <div className="card stack">
          <strong>Get alerts on this phone</strong>
          <p className="mute">We can ping you when a dish is rated while this page is open in the background.</p>
          <button className="btn soft" onClick={onAlert}>Turn on alerts</button>
        </div>
      )}
      {items.length === 0 && <p className="mute" data-testid="balita-empty">No ratings yet. When a customer rates a dish, it shows here.</p>}
      {items.map((n) => (
        <div key={n.id} className={`notice${fresh.has(n.id) ? " fresh" : ""}`} data-testid="notice">
          <span className="face"><Face tone={tone(n.score)} size={28} /></span>
          <div className="grow">
            <strong>{n.dish} was rated</strong>
            <div className="mute">{word(n.score)} · {ago(n.at, now)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
