"use client";
import { useSyncExternalStore } from "react";
import { Icon } from "@/src/ui/Icon";
import type { IconName } from "@/src/ui/icons";

const KEY = "kb_board_intro";
const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => { listeners.add(cb); return () => void listeners.delete(cb); };
const seen = () => localStorage.getItem(KEY) === "1";

const STEPS: { icon: IconName; head: string; body: string }[] = [
  { icon: "board", head: "Browse the board", body: "Dishes are ranked by how worth their price they are." },
  { icon: "tag", head: "Spot the deals", body: "Tap Deals for dishes on sale or with limited spots." },
  { icon: "qr", head: "Ate something? Rate it", body: "Scan the stall's QR code for a two-tap rating. No account." },
];

/** First-visit guide for buyers on the Ulam board. Shown until dismissed on this phone, never blocks the list. */
export function BoardIntro() {
  const dismissed = useSyncExternalStore(subscribe, seen, () => true);
  if (dismissed) return null;
  return (
    <section className="card intro" aria-labelledby="intro-h" data-testid="board-intro">
      <h2 id="intro-h">First time here?</h2>
      <ol className="intro-steps">
        {STEPS.map((s) => (
          <li key={s.head}>
            <span className="intro-ic" aria-hidden><Icon name={s.icon} /></span>
            <div><strong>{s.head}</strong><p className="mute">{s.body}</p></div>
          </li>
        ))}
      </ol>
      <button className="btn" onClick={() => { localStorage.setItem(KEY, "1"); listeners.forEach((l) => l()); }}>Got it</button>
    </section>
  );
}
