"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { setPref, usePref } from "./ulam/tastes";

/** Moves this phone between the customer view and the owner view, then opens that side's home. */
export function RoleSwitch({ to }: { to: "buyer" | "owner" }) {
  const router = useRouter();
  return (
    <button type="button" className="btn soft block" onClick={() => { setPref("kb_role", to); router.push(to === "owner" ? "/owner" : "/"); }}>
      {to === "owner" ? "Switch to owner view" : "Switch to customer view"}
    </button>
  );
}

/** On the front door, an owner-mode phone goes to the owner's Home instead of the Ulam board. */
export function OwnerGoesHome() {
  const role = usePref("kb_role");
  const router = useRouter();
  useEffect(() => { if (role === "owner") router.replace("/owner"); }, [role, router]);
  return null;
}

/** Opening the owner's own pages puts this phone in owner mode. */
export function MarkOwner() {
  useEffect(() => { setPref("kb_role", "owner"); }, []);
  return null;
}
