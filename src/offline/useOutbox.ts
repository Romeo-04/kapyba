"use client";
import { useEffect, useRef, useState } from "react";
import { flush, pending } from "./queue";

/** Flushes the outbox on load and whenever the phone comes back online; returns how many jobs wait. */
export function useOutbox(onSent?: () => void) {
  const [waiting, setWaiting] = useState(0);
  const onSentRef = useRef(onSent);
  useEffect(() => {
    onSentRef.current = onSent;
  });

  useEffect(() => {
    let live = true;
    const go = () => {
      flush(localStorage).then((r) => {
        if (!live) return;
        setWaiting(r.left);
        if (r.sent > 0) onSentRef.current?.();
      });
    };
    go();
    window.addEventListener("online", go);
    return () => {
      live = false;
      window.removeEventListener("online", go);
    };
  }, []);

  return { waiting, refresh: () => setWaiting(pending(localStorage)) };
}
