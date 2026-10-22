"use client";
import { useState } from "react";
import { Icon } from "@/src/ui/Icon";
import { Mascot } from "@/src/ui/Mascot";
import { Ring } from "@/src/ui/Ring";
import { iconFor } from "../s/[code]/Rate";
import type { OwnerDish } from "@/src/services/aggregates";

const TAG_LABELS: Record<string, { label: string; icon: "salt" | "plate" | "flame" | "coin" }> = {
  salt: { label: "Alat", icon: "salt" },
  plate: { label: "Dami", icon: "plate" },
  flame: { label: "Init", icon: "flame" },
  coin: { label: "Sulit", icon: "coin" },
};

export function DishDetailModal({
  dish,
  onClose,
  onTogglePublished,
  onTogglePaborito,
  onOpenUlat,
}: {
  dish: OwnerDish;
  onClose: () => void;
  onTogglePublished: () => Promise<void>;
  onTogglePaborito: () => Promise<void>;
  onOpenUlat: () => void;
}) {
  const [isSoldOut, setIsSoldOut] = useState(false);
  const [isOnSale, setIsOnSale] = useState(false);
  const [togglingPub, setTogglingPub] = useState(false);
  const [togglingPab, setTogglingPab] = useState(false);

  const hasScore = dish.private.score !== null;
  const score = dish.private.score ?? 0;
  const isWeak = hasScore && score < 3.4;
  const isHappy = hasScore && score >= 4.0;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label={`Detail: ${dish.name}`}>
      <div className="modal-card detail-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="detail-hdr">
          <button type="button" className="simula-back" onClick={onClose} aria-label="Bumalik">
            <Icon name="back" />
          </button>
          <div className="detail-title-wrap">
            <div className="ico-plate" style={{ width: 36, height: 36 }}>
              <Icon name={iconFor(dish.icon)} />
            </div>
            <h2 style={{ margin: 0 }}>{dish.name}</h2>
          </div>
          <span className="price" style={{ fontSize: 18, color: "var(--leaf)" }}>₱{dish.price}</span>
        </div>

        <div className="detail-scroll">
          {/* Main Score Ring & Summary */}
          <div className="card stack center" style={{ alignItems: "center", padding: "20px 16px" }}>
            <Ring score={dish.private.score} size={110} locked={!hasScore} />
            <div style={{ marginTop: 8 }}>
              {hasScore ? (
                <div style={{ fontFamily: "var(--font-heading)", fontSize: 26, fontWeight: 700, color: "var(--ink)" }}>
                  {dish.private.score?.toFixed(1)} <span className="mute" style={{ fontSize: 16 }}>/ 5.0</span>
                </div>
              ) : (
                <div className="mute" style={{ fontWeight: 600 }}>
                  Kulang pa {dish.gate.state === "kulang" ? `${dish.gate.have}/${dish.gate.need}` : "ratings"}
                </div>
              )}
            </div>

            <div className="row" style={{ flexWrap: "wrap", justifyContent: "center", gap: 6, marginTop: 4 }}>
              {dish.private.improving && <span className="pill g"><Icon name="trend" /> Gumaganda</span>}
              {dish.pansin !== 0 && (
                <span className={`pill ${dish.pansin < 0 ? "a" : "g"}`}>
                  <Icon name={dish.pansin < 0 ? "alert" : "up"} /> Pansin
                </span>
              )}
              {dish.flagged > 0 && <span className="pill r"><Icon name="alert" /> {dish.flagged} under review</span>}
              {dish.paborito && <span className="pill" style={{ background: "#fdebe5", color: "var(--chili)" }}><Icon name="heart" /> Paborito</span>}
              {dish.published && <span className="pill g"><Icon name="eye" /> Publiko</span>}
            </div>

            <p className="mute" style={{ marginTop: 6, fontSize: 13 }}>
              <Icon name="user" style={{ verticalAlign: "-2px", marginRight: 4 }} />
              {dish.private.count} ratings · {dish.private.buyers} distinct buyers
            </p>
          </div>

          {/* 3 Quick Action Buttons (Naubos, Sale, Publiko) + Paborito */}
          <div className="detail-actions-grid">
            <button
              type="button"
              className={`action-sq-btn ${isSoldOut ? "on-naubos" : ""}`}
              onClick={() => setIsSoldOut(!isSoldOut)}
              aria-pressed={isSoldOut}
            >
              <span className="action-sq-ico"><Icon name={isSoldOut ? "check" : "bin"} /></span>
              <span className="action-sq-label">{isSoldOut ? "Naubos na" : "Naubos"}</span>
            </button>

            <button
              type="button"
              className={`action-sq-btn ${isOnSale ? "on-sale" : ""}`}
              onClick={() => setIsOnSale(!isOnSale)}
              aria-pressed={isOnSale}
            >
              <span className="action-sq-ico"><Icon name="tag" /></span>
              <span className="action-sq-label">{isOnSale ? "Naka-Sale" : "Sale"}</span>
            </button>

            <button
              type="button"
              className={`action-sq-btn ${dish.published ? "on-pub" : ""}`}
              disabled={togglingPub}
              onClick={async () => {
                setTogglingPub(true);
                await onTogglePublished();
                setTogglingPub(false);
              }}
              aria-pressed={dish.published}
            >
              <span className="action-sq-ico"><Icon name={dish.published ? "eye" : "eyeoff"} /></span>
              <span className="action-sq-label">{dish.published ? "Publiko" : "Pribado"}</span>
            </button>

            <button
              type="button"
              className={`action-sq-btn ${dish.paborito ? "on-pab" : ""}`}
              disabled={togglingPab}
              onClick={async () => {
                setTogglingPab(true);
                await onTogglePaborito();
                setTogglingPab(false);
              }}
              aria-pressed={dish.paborito}
            >
              <span className="action-sq-ico" style={{ color: dish.paborito ? "var(--chili)" : "inherit" }}>
                <Icon name="heart" />
              </span>
              <span className="action-sq-label">{dish.paborito ? "Paborito" : "Pick (0/3)"}</span>
            </button>
          </div>

          {/* Taste Dimension Tag Bars */}
          <div className="card stack">
            <div className="row" style={{ justifyContent: "space-between" }}>
              <h2 style={{ fontSize: 16 }}>Lasang Sinabi ng Suki</h2>
              <span className="mute" style={{ fontSize: 12 }}>30 araw</span>
            </div>

            <div className="tag-bars-list">
              {(["salt", "plate", "flame", "coin"] as const).map((tagKey) => {
                const info = TAG_LABELS[tagKey];
                const share = dish.private.tagShares?.[tagKey] ?? 0;
                const pct = Math.round(share * 100);
                const isComplaint = share >= 0.3;
                return (
                  <div key={tagKey} className="tag-bar-row">
                    <div className="tag-bar-meta">
                      <span className="tag-bar-icon-wrap" style={{ color: isComplaint ? "var(--chili)" : "var(--cocoa)" }}>
                        <Icon name={info.icon} />
                      </span>
                      <span className="tag-bar-name">{info.label}</span>
                      <span className="tag-bar-val price">{pct}%</span>
                    </div>
                    <div className="tag-bar-track">
                      <div
                        className="tag-bar-fill"
                        style={{
                          width: `${pct}%`,
                          background: isComplaint ? "var(--chili)" : "var(--tan)",
                        }}
                      />
                      {/* Benchmark tick marker */}
                      <span className="tag-bar-benchmark" title="Kapitbahay average" style={{ left: "25%" }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="row" style={{ fontSize: 12, color: "var(--mute)", gap: 6, marginTop: 4 }}>
              <Icon name="pin" style={{ width: 14, height: 14 }} />
              <span>Guhit = average ng mga karinderya sa paligid mo</span>
            </div>
          </div>

          {/* Coach Card with Capybara */}
          <div className="coach-card">
            <Mascot mood={isWeak ? "worry" : isHappy ? "happy" : "calm"} size={58} />
            <div className="coach-content">
              <strong style={{ fontSize: 15, color: "var(--ink)" }}>Mungkahing Gabay</strong>
              <p style={{ margin: "2px 0 0", fontSize: 13, color: "var(--mute)", lineHeight: 1.35 }}>
                {dish.recs.length > 0
                  ? `Napansin ng mga suki ang ${dish.recs.map((r) => r.word.toLowerCase()).join(" at ")}. Madaling i-adjust sa susunod na luto!`
                  : isHappy
                  ? "Bongga! Patuloy ang sarap at sulit ng timpla mo."
                  : !hasScore
                  ? "Kailangan pa ng ilang ratings para mabuo ang gabay ng timpla."
                  : "Steady ang takbo ng ulam na ito sa mga suki."}
              </p>
            </div>
          </div>

          {/* Recommendation Action Cards */}
          {dish.recs.length > 0 && (
            <div className="stack" style={{ gap: 8 }}>
              <label style={{ margin: 0 }}>Gawin bukas:</label>
              <div className="recs-row">
                {dish.recs.map((r) => (
                  <div key={r.word} className="rec-card">
                    <span className="rec-ico"><Icon name={iconFor(r.icon)} /></span>
                    <span className={`rec-dir ${r.dir === "up" ? "up" : "down"}`}>
                      <Icon name={r.dir} />
                    </span>
                    <strong className="rec-word">{r.word}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Report Button (Ulat) */}
          <div style={{ paddingTop: 8 }}>
            <button
              type="button"
              className="btn soft block"
              onClick={() => {
                onClose();
                onOpenUlat();
              }}
              style={{ minHeight: 46, fontSize: 14 }}
            >
              <Icon name="alert" /> I-ulat ang kahina-hinalang rating (Ulat)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
