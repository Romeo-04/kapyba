"use client";
import { useSyncExternalStore } from "react";
import { Icon } from "@/src/ui/Icon";
import type { IconName } from "@/src/ui/icons";
import { MAINS } from "@/src/domain/mains";
import { toggleTaste, useTastes } from "./tastes";

const KEY = "kb_board_intro";
const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => { listeners.add(cb); return () => void listeners.delete(cb); };
const seen = () => localStorage.getItem(KEY) === "1";

const STEPS: { icon: IconName; head: string; body: string }[] = [
  { icon: "board", head: "Browse the board", body: "Dishes are ranked by how worth their price they are." },
  { icon: "tag", head: "Spot the deals", body: "Tap Deals for dishes on sale or with limited spots." },
  { icon: "qr", head: "Ate something? Rate it", body: "Scan the stall's QR code for a two-tap rating. No account." },
];

/** First-visit guide for buyers on the Ulam board, with a pick of the foods they like. Shown until dismissed on this phone, never blocks the list. */
export function BoardIntro({ forced = false, onClose }: { forced?: boolean; onClose?: () => void }) {
  const dismissed = useSyncExternalStore(subscribe, seen, () => true);
  const tastes = useTastes();
  if (dismissed && !forced) return null;
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
      <div role="group" aria-labelledby="tastes-h">
        <strong id="tastes-h">What do you like to eat?</strong>
        <p className="mute small">Pick any. We show those dishes first. This stays on your phone.</p>
        <div className="chips-wrap">
          {MAINS.map((m) => (
            <button key={m.id} type="button" className="chip" aria-pressed={tastes.includes(m.id)} onClick={() => toggleTaste(m.id)}>{m.label}</button>
          ))}
        </div>
      </div>
      <button className="btn" onClick={() => { localStorage.setItem(KEY, "1"); listeners.forEach((l) => l()); onClose?.(); }}>{tastes.length > 0 ? "Save" : "Got it"}</button>
    </section>
  );
}
