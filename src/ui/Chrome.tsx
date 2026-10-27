"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Kapy } from "./Kapy";
import { Icon } from "./Icon";
import type { IconName } from "./icons";
import { usePref } from "@/app/ulam/tastes";

/** Light top bar with Kapy and the wordmark. Owner mode shows Kapy cooking and "for owners", and no ulam search. */
export function TopBar() {
  const owner = usePref("kb_role") === "owner";
  return (
    <header className="topbar">
      <Link href={owner ? "/owner" : "/"} className="brand" aria-label="KapyBa home">
        <Kapy pose={owner ? "cook" : "wave"} size={40} anim="none" />
        <span>KapyBa{owner && <small className="brand-role">for owners</small>}</span>
      </Link>
      {!owner && (
        <Link href="/#near" className="locpill">
          <Icon name="pin" />
          <span>Ulam near you</span>
        </Link>
      )}
    </header>
  );
}

type Tab = { href: string; icon: IconName; label: string; match: (p: string) => boolean };
const COMMUNITY: Tab = { href: "/community", icon: "megaphone", label: "Community", match: (p) => p.startsWith("/community") };
// Customers find food; owners run their stall. Each side only sees its own tabs.
const BUYER_TABS: Tab[] = [
  { href: "/", icon: "board", label: "Ulam", match: (p) => p === "/" || p.startsWith("/ulam") },
  COMMUNITY,
];
const OWNER_TABS: Tab[] = [
  { href: "/owner", icon: "home", label: "Home", match: (p) => p === "/owner" },
  { href: "/o", icon: "store", label: "My stall", match: (p) => p === "/o" || p.startsWith("/o/") || p.startsWith("/review") },
  COMMUNITY,
];

/** Bottom tab bar. Hidden on the rating page, where the buyer has one job. */
export function BottomNav() {
  const path = usePathname();
  const owner = usePref("kb_role") === "owner";
  if (path.startsWith("/s/")) return null;
  return (
    <nav className="bottomnav" aria-label="Main">
      {(owner ? OWNER_TABS : BUYER_TABS).map((t) => (
        <Link key={t.href} href={t.href} aria-current={t.match(path) ? "page" : undefined}>
          <Icon name={t.icon} />
          <span>{t.label}</span>
        </Link>
      ))}
    </nav>
  );
}
