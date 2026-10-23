"use client";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Kapy } from "./Kapy";

const LINES: { match: (p: string) => boolean; say: string[] }[] = [
  { match: (p) => p === "/", say: ["Kumusta! Ako si Kapy.", "Tara, tingnan natin ang ulam!"] },
  { match: (p) => p.startsWith("/ulam"), say: ["Ano'ng gusto mo ngayon?", "Hanapin natin ang sulit na ulam!"] },
  { match: (p) => p.startsWith("/o"), say: ["Handa na ba ang paninda?", "Kaya mo 'yan, ka-tindahan!"] },
  { match: () => true, say: ["Kapy dito!"] },
];

/** Kapy peeks over the tab bar on every page. Tap for a line and a hop; the peek replays on each route (key = path). */
export function KapyBuddy() {
  const path = usePathname();
  return <Buddy key={path} path={path} />;
}

function Buddy({ path }: { path: string }) {
  const [n, setN] = useState(0);
  const [open, setOpen] = useState(false);
  if (path.startsWith("/s/")) return null;
  const say = (LINES.find((l) => l.match(path)) ?? LINES[LINES.length - 1]).say;
  const tap = () => {
    setN((v) => v + 1);
    setOpen(true);
  };
  return (
    <button type="button" className={`buddy${n ? " hop" : ""}`} onClick={tap} aria-label="Kapy, tap for a tip">
      {open ? <span key={n} className="bubble" role="status">{say[n % say.length]}</span> : null}
      <Kapy pose="peek" size={72} anim="none" key={n} />
    </button>
  );
}
