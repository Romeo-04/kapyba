"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Kapy } from "./Kapy";
import { Icon } from "./Icon";
import type { IconName } from "./icons";

/** Light top bar with Kapy and the wordmark. */
export function TopBar() {
  return (
    <header className="topbar">
      <Link href="/" className="brand" aria-label="KapyBa home">
        <Kapy pose="wave" size={40} anim="none" />
        <span>KapyBa</span>
      </Link>
      <Link href="/ulam" className="locpill">
        <Icon name="pin" />
        <span>Ulam near you</span>
      </Link>
    </header>
  );
}

const TABS: { href: string; icon: IconName; label: string; match: (p: string) => boolean }[] = [
  { href: "/", icon: "board", label: "Ulam", match: (p) => p === "/" || p.startsWith("/ulam") },
  { href: "/o", icon: "store", label: "My stall", match: (p) => p === "/o" || p.startsWith("/o/") || p.startsWith("/review") },
  { href: "/owner", icon: "home", label: "Owner", match: (p) => p === "/owner" },
];

/** Bottom tab bar. Hidden on the rating page, where the buyer has one job. */
export function BottomNav() {
  const path = usePathname();
  if (path.startsWith("/s/")) return null;
  return (
    <nav className="bottomnav" aria-label="Main">
      {TABS.map((t) => (
        <Link key={t.href} href={t.href} aria-current={t.match(path) ? "page" : undefined}>
          <Icon name={t.icon} />
          <span>{t.href === "/owner" && path.startsWith("/ulam/stall") ? "Home" : t.label}</span>
        </Link>
      ))}
    </nav>
  );
}
