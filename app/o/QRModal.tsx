"use client";
import { useState } from "react";
import { Icon } from "@/src/ui/Icon";
import { Mascot } from "@/src/ui/Mascot";

export function QRModal({
  stall,
  onClose,
}: {
  stall: { id: string; name: string; area: string; code: string };
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const stallUrl = typeof window !== "undefined" ? `${window.location.origin}/s/${stall.code}` : `/s/${stall.code}`;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="QR Code">
      <div className="modal-card qr-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="detail-hdr">
          <button type="button" className="simula-back" onClick={onClose} aria-label="Isara">
            <Icon name="x" />
          </button>
          <div className="detail-title-wrap">
            <h2 style={{ margin: 0, fontSize: 18 }}>QR ng Stall</h2>
          </div>
          <span style={{ width: 44 }} />
        </div>

        {/* QR Card */}
        <div className="card stack center qr-display-card" style={{ alignItems: "center", padding: "20px 16px" }}>
          <div style={{ textAlign: "center", marginBottom: 4 }}>
            <h1 style={{ fontSize: 22, margin: 0 }}>{stall.name}</h1>
            <p className="mute" style={{ fontSize: 13, margin: "2px 0 0" }}>{stall.area}</p>
          </div>

          <div className="qr-frame" style={{ position: "relative", display: "grid", placeItems: "center", margin: "10px 0" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/stalls/${stall.id}/qr`}
              alt="Stall QR code"
              width={220}
              height={220}
              className="qr-img"
              style={{ display: "block", borderRadius: 16 }}
            />
            <div className="qr-mascot-badge" style={{ position: "absolute", width: 48, height: 48, borderRadius: 12, background: "#fff", display: "grid", placeItems: "center", boxShadow: "0 0 0 3px #fff" }}>
              <Mascot mood="calm" size={36} />
            </div>
          </div>

          <p className="qr-code-text" style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.05em", color: "var(--cocoa)" }}>
            kapyba-{stall.code}
          </p>
          <p className="mute" style={{ fontSize: 13, margin: 0 }}>
            I-print at ilagay sa counter. I-scan ng suki para mag-rate sa dalawang tap.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="stack" style={{ gap: 8, marginTop: 12 }}>
          <div className="row">
            <a
              className="btn soft grow"
              href={`/api/stalls/${stall.id}/qr`}
              download={`kapyba-${stall.code}.svg`}
              style={{ minHeight: 46, fontSize: 14 }}
            >
              <Icon name="download" /> I-download ang SVG
            </a>
            <button
              type="button"
              className="btn soft grow"
              onClick={() => window.print()}
              style={{ minHeight: 46, fontSize: 14 }}
            >
              <Icon name="printer" /> I-print
            </button>
          </div>

          <button
            type="button"
            className="btn block"
            onClick={async () => {
              if (navigator.clipboard) {
                await navigator.clipboard.writeText(stallUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }
            }}
            style={{ minHeight: 46, fontSize: 14 }}
          >
            <Icon name="check" /> {copied ? "Na-kopyang link!" : "Kopyahin ang link ng stall"}
          </button>
        </div>
      </div>
    </div>
  );
}
