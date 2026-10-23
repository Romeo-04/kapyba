"use client";
import { useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { Kapy } from "./Kapy";

const KEY = "kb_splash_seen";
const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => { listeners.add(cb); return () => void listeners.delete(cb); };
const seen = () => sessionStorage.getItem(KEY) === "1";

/** Kapy and the wordmark for a moment when the app opens, once per visit. Never on the rating page, where the buyer has one job. */
export function Splash() {
  const path = usePathname();
  const rating = path.startsWith("/s/");
  // The server renders the splash so there is no flash of the page first; the phone then hides it if it was already shown.
  const done = useSyncExternalStore(subscribe, seen, () => false);
  useEffect(() => {
    if (rating || done) return;
    const t = setTimeout(() => { sessionStorage.setItem(KEY, "1"); listeners.forEach((l) => l()); }, 1900);
    return () => clearTimeout(t);
  }, [rating, done]);
  if (rating || done) return null;
  return (
    <div className="splash" aria-hidden="true" data-testid="splash">
      <Kapy pose="wave" size={220} anim="bob" />
      <strong>KapyBa</strong>
      <span>Know what sells. Cook just enough.</span>
    </div>
  );
}
