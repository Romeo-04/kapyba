"use client";
import { useMemo, useSyncExternalStore } from "react";

// What a buyer told us in the welcome steps, kept on this phone only (never sent anywhere).
// kb_role: "buyer" | "owner". kb_tastes and kb_avoid: comma separated ids from src/domain/mains.ts and allergens.ts.
// kb_budget: pesos per meal, "" for any. kb_area: an area or school. kb_near: "1" when the buyer wants nearest first.
// kb_stall: the owner's stall id last opened in My stall, so Home shows the same one.
const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => { listeners.add(cb); return () => void listeners.delete(cb); };

/** One saved answer, "" when there is none. The server and the first render see `server`, so nothing flashes before the phone is read. */
export function usePref(key: string, server = ""): string {
  return useSyncExternalStore(subscribe, () => localStorage.getItem(key) ?? "", () => server);
}

export function setPref(key: string, value: string) {
  if (value) localStorage.setItem(key, value); else localStorage.removeItem(key);
  listeners.forEach((l) => l());
}

const useList = (key: string) => {
  const text = usePref(key);
  return useMemo(() => text.split(",").filter(Boolean), [text]);
};
const toggle = (key: string, id: string) => {
  const now = (localStorage.getItem(key) ?? "").split(",").filter(Boolean);
  setPref(key, (now.includes(id) ? now.filter((x) => x !== id) : [...now, id]).join(","));
};

export const useTastes = () => useList("kb_tastes");
export const toggleTaste = (id: string) => toggle("kb_tastes", id);
export const useAvoid = () => useList("kb_avoid");
export const toggleAvoid = (id: string) => toggle("kb_avoid", id);
