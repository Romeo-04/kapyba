"use client";
import { useState } from "react";
import { Icon } from "./Icon";

const MAX_SIDE = 720;

/** Shrink a camera photo to a small JPEG on the phone, so the upload is about 50 KB even on a weak connection. */
async function shrink(file: File): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const k = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * k);
  canvas.height = Math.round(bmp.height * k);
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  bmp.close();
  return new Promise((ok, fail) => canvas.toBlob((b) => (b ? ok(b) : fail(new Error("no image"))), "image/jpeg", 0.8));
}

export const photoUrl = (dishId: string, v: number) => `/api/dishes/${dishId}/image?v=${v}`;

/** Add, change or remove the photo of one dish. Optional everywhere it appears. */
export function PhotoPick({ dishId, dishName, imageV, onDone }: { dishId: string; dishName: string; imageV: number | null; onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [has, setHas] = useState(imageV !== null);

  const upload = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setErr("");
    try {
      const r = await fetch(`/api/dishes/${dishId}/image`, { method: "PUT", headers: { "Content-Type": "image/jpeg" }, body: await shrink(file) });
      if (r.ok) { setHas(true); onDone(); } else setErr((await r.json().catch(() => ({}))).error ?? "Could not save the photo.");
    } catch {
      setErr("That file could not be read as a photo.");
    }
    setBusy(false);
  };

  return (
    <>
      <label className={`btn soft${busy ? " busy" : ""}`}>
        <Icon name="camera" />{busy ? "Saving..." : has ? "Change photo" : "Add photo"}
        <input type="file" accept="image/*" className="sr-only" aria-label={`Photo of ${dishName}`} disabled={busy} onChange={(e) => { void upload(e.target.files?.[0]); e.target.value = ""; }} />
      </label>
      {has && (
        <button type="button" className="btn soft" disabled={busy} onClick={async () => { setBusy(true); await fetch(`/api/dishes/${dishId}/image`, { method: "DELETE" }); setHas(false); setBusy(false); onDone(); }}>
          <Icon name="bin" />Remove photo
        </button>
      )}
      {err && <p className="err" role="alert" style={{ gridColumn: "1 / -1" }}>{err}</p>}
    </>
  );
}
