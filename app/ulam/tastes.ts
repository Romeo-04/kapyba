"use client";
import { useMemo, useSyncExternalStore } from "react";

// What a buyer likes to eat, kept on this phone only (never sent anywhere). Ids come from src/domain/mains.ts.
const KEY = "kb_tastes";
const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => { listeners.add(cb); return () => void listeners.delete(cb); };
const raw = () => localStorage.getItem(KEY) ?? "";

export function useTastes(): string[] {
  const text = useSyncExternalStore(subscribe, raw, () => "");
  return useMemo(() => text.split(",").filter(Boolean), [text]);
}

export function toggleTaste(id: string) {
  const now = raw().split(",").filter(Boolean);
  const next = now.includes(id) ? now.filter((x) => x !== id) : [...now, id];
  localStorage.setItem(KEY, next.join(","));
  listeners.forEach((l) => l());
}
