"use client";
import { useEffect } from "react";

/** Registers the service worker in production only, so dev reloads are never served from a cache. */
export function RegisterSW() {
  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);
  return null;
}
