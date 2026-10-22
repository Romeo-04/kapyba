"use client";
import Link from "next/link";
import { useSyncExternalStore } from "react";

const KEY = "kb_privacy_seen";
const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => { listeners.add(cb); return () => void listeners.delete(cb); };
const seen = () => localStorage.getItem(KEY) === "1";

/** One-line notice shown until it is dismissed on this phone (first sign-in, first rating). Never blocks the page. */
export function PrivacyNote() {
  const dismissed = useSyncExternalStore(subscribe, seen, () => true);
  if (dismissed) return null;
  return (
    <div className="card row" role="note" data-testid="privacy-note">
      <p className="mute grow">
        We keep a random code on this phone, never your name. <Link href="/privacy">How we use data</Link>
      </p>
      <button className="btn soft" onClick={() => { localStorage.setItem(KEY, "1"); listeners.forEach((l) => l()); }}>OK</button>
    </div>
  );
}
