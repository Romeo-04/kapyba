"use client";
import { useState } from "react";
import { Icon } from "@/src/ui/Icon";
import { Mascot } from "@/src/ui/Mascot";
import { DrilldownSheet } from "@/src/ui/DrilldownSheet";

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
    <DrilldownSheet
      title="QR ng Stall"
      subtitle={stall.name}
      onClose={onClose}
      ariaLabel="QR Code"
      footer={
        <button
          type="button"
          className="btn block primary-cta"
          onClick={async () => {
            if (navigator.clipboard) {
              await navigator.clipboard.writeText(stallUrl);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }
          }}
          style={{ minHeight: 48, fontSize: 14 }}
        >
          <Icon name="check" /> {copied ? "Na-kopyang link!" : "Kopyahin ang link ng stall"}
        </button>
      }
    >
      <div className="card stack center qr-display-card" style={{ alignItems: "center", padding: "24px 16px" }}>
        <div style={{ textAlign: "center", marginBottom: 4 }}>
          <h2 style={{ fontSize: 20, margin: 0 }}>{stall.name}</h2>
          <p className="mute" style={{ fontSize: 13, margin: "2px 0 0" }}>{stall.area}</p>
        </div>

        <div className="qr-frame" style={{ position: "relative", display: "grid", placeItems: "center", margin: "14px 0" }}>
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
        <p className="mute center" style={{ fontSize: 13, margin: 0, maxWidth: 300 }}>
          I-print at ilagay sa counter. I-scan ng suki para mag-rate sa dalawang tap.
        </p>
      </div>

      <div className="row" style={{ marginTop: 12, gap: 10 }}>
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
    </DrilldownSheet>
  );
}
