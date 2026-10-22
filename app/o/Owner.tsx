"use client";
import { useEffect, useState } from "react";
import { Icon } from "@/src/ui/Icon";
import { Mascot } from "@/src/ui/Mascot";
import { Ring } from "@/src/ui/Ring";
import { iconFor } from "../s/[code]/Rate";
import { AddDishModal } from "./AddDishModal";
import { AlokModal } from "./AlokModal";
import { BukasView } from "./BukasView";
import { DishDetailModal } from "./DishDetailModal";
import { NatiraView } from "./NatiraView";
import { PalengkeView } from "./PalengkeView";
import { QRModal } from "./QRModal";
import { loadSimulaState, Simula } from "./Simula";
import { UlatModal } from "./UlatModal";
import type { OwnerDish } from "@/src/services/aggregates";

type Stall = { id: string; name: string; area: string; code: string };

const post = (url: string, body: unknown, method = "POST") =>
  fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

export function Owner() {
  const [stalls, setStalls] = useState<Stall[] | null>(null);
  const [dishes, setDishes] = useState<OwnerDish[]>([]);
  const [msg, setMsg] = useState("");
  const [showSimula, setShowSimula] = useState<boolean | null>(null);

  // Screen & Navigation States
  const [activeTab, setActiveTab] = useState<"ngayon" | "natira" | "bukas">("ngayon");
  const [selectedDish, setSelectedDish] = useState<OwnerDish | null>(null);
  const [showPalengke, setShowPalengke] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showAlok, setShowAlok] = useState(false);
  const [showUlat, setShowUlat] = useState(false);
  const [showAddDish, setShowAddDish] = useState(false);
  const [ulatDishId, setUlatDishId] = useState<string | undefined>(undefined);

  const [tick, setTick] = useState(0);
  const [bukasTick, setBukasTick] = useState(0);
  const reload = () => setTick((t) => t + 1);

  useEffect(() => {
    fetch("/api/stalls").then(async (r) => {
      const list: Stall[] = r.ok ? (await r.json()).stalls : [];
      setStalls(list);
      const first = list[0] ?? null;
      if (!first) {
        setShowSimula(true);
      } else {
        const persisted = loadSimulaState(first);
        const midOnboarding =
          persisted.stall?.id === first.id && !persisted.completed && !persisted.skipped;
        setShowSimula((prev) => (prev === null ? midOnboarding : prev));
      }
    });
  }, [tick]);

  const stall = stalls?.[0] ?? null;
  const stallId = stall?.id;
  useEffect(() => {
    if (!stallId) return;
    fetch(`/api/stalls/${stallId}/summary`).then(async (r) => {
      if (r.ok) {
        const data = await r.json();
        setDishes(data.dishes);
      }
    });
  }, [stallId, tick]);

  if (stalls === null || showSimula === null) {
    return <p className="mute center" style={{ paddingTop: 48 }}>Sandali...</p>;
  }

  if (!stall || showSimula) {
    return (
      <Simula
        existingStall={stall}
        existingDishes={dishes}
        onFinish={() => {
          setShowSimula(false);
          reload();
        }}
        onSkip={() => {
          setShowSimula(false);
          reload();
        }}
      />
    );
  }

  const hasWeakDish = dishes.some((d) => d.private.score !== null && d.private.score < 3.4);
  const ratedDishes = dishes.filter((d) => d.private.score !== null);
  const avgStallScore =
    ratedDishes.length > 0
      ? Math.round(
          (ratedDishes.reduce((acc, d) => acc + (d.private.score ?? 0), 0) / ratedDishes.length) * 10
        ) / 10
      : null;

  const totalRatings = dishes.reduce((sum, d) => sum + d.private.count, 0);

  // Sync selectedDish with updated dishes on tick
  const currentSelectedDish = selectedDish ? dishes.find((d) => d.id === selectedDish.id) ?? selectedDish : null;

  return (
    <div className="owner-container">
      {/* Tab Screen 1: Ngayon */}
      {activeTab === "ngayon" && (
        <div className="stack" style={{ gap: 16 }}>
          {/* Header */}
          <div className="row" style={{ alignItems: "center" }}>
            <Mascot mood={hasWeakDish ? "worry" : "calm"} size={54} />
            <div className="grow">
              <h1 style={{ fontSize: 26, margin: 0 }}>Ngayon</h1>
              <p className="mute" style={{ fontSize: 13, margin: "2px 0 0" }}>
                {stall.name} · {stall.area}
              </p>
            </div>
            <div className="row" style={{ gap: 6 }}>
              <button
                type="button"
                className="btn soft round"
                aria-label="Alok deals"
                onClick={() => setShowAlok(true)}
                title="Alok Deals"
              >
                <Icon name="megaphone" />
              </button>
              <button
                type="button"
                className="btn soft round"
                aria-label="Stall QR"
                onClick={() => setShowQR(true)}
                title="QR Code"
              >
                <Icon name="qr" />
              </button>
              <button
                type="button"
                className="btn soft round"
                onClick={() => setShowSimula(true)}
                title="Simula Setup"
                aria-label="Simula"
              >
                <Icon name="store" />
              </button>
            </div>
          </div>

          {/* 3 Stat Cards in a row (UX.md O1) */}
          <div className="stats-grid">
            <div className="stat-card">
              <Ring score={avgStallScore} size={48} locked={avgStallScore === null} />
              <div className="stat-card-val">
                {avgStallScore !== null ? avgStallScore.toFixed(1) : "—"}
              </div>
              <span className="stat-card-lbl">Score</span>
            </div>

            <div className="stat-card">
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--cream)", color: "var(--cocoa)", display: "grid", placeItems: "center" }}>
                <Icon name="user" />
              </div>
              <div className="stat-card-val">{totalRatings}</div>
              <span className="stat-card-lbl">Mga Boto</span>
            </div>

            <div className="stat-card">
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#e3f0e1", color: "var(--leaf)", display: "grid", placeItems: "center" }}>
                <Icon name="leaf" />
              </div>
              <div className="stat-card-val">{dishes.length}</div>
              <span className="stat-card-lbl">Ulam Handa</span>
            </div>
          </div>

          {/* Dishes List Section */}
          <div className="row" style={{ justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
            <div className="row" style={{ gap: 8 }}>
              <h2 style={{ fontSize: 18, margin: 0 }}>Mga Ulam</h2>
              <span className="ulam-count-pill" style={{ padding: "4px 10px", fontSize: 12 }}>
                {dishes.length}
              </span>
            </div>
            <button
              type="button"
              className="btn soft"
              onClick={() => setShowAddDish(true)}
              style={{ minHeight: 38, padding: "0 14px", fontSize: 13 }}
            >
              <Icon name="plus" /> Magdagdag
            </button>
          </div>

          {dishes.length === 0 && (
            <div className="card stack center" style={{ padding: 32 }}>
              <Mascot mood="sleepy" size={56} />
              <p className="mute">Wala pang nakalistang ulam. I-click ang Magdagdag upang simulan.</p>
              <button type="button" className="btn soft" onClick={() => setShowAddDish(true)}>
                <Icon name="plus" /> Magdagdag ng ulam
              </button>
            </div>
          )}

          {/* Dish Cards */}
          <div className="dish-grid">
            {dishes.map((d) => (
              <div
                key={d.id}
                className="owner-dish-card"
                onClick={() => setSelectedDish(d)}
                role="button"
                tabIndex={0}
                aria-label={`Ulam: ${d.name}`}
              >
                <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div className="row" style={{ gap: 12 }}>
                    <div className="ico-plate" style={{ width: 46, height: 46 }}>
                      <Icon name={iconFor(d.icon)} className="lg" />
                    </div>
                    <div>
                      <strong style={{ fontSize: 17, display: "block", color: "var(--ink)" }}>{d.name}</strong>
                      <div className="row" style={{ gap: 6, marginTop: 2 }}>
                        <span className="price" style={{ color: "var(--leaf)", fontSize: 15 }}>₱{d.price}</span>
                        <span className="mute" style={{ fontSize: 12 }}>· {d.baseServings} servings</span>
                      </div>
                    </div>
                  </div>

                  <Ring score={d.private.score} size={50} locked={d.private.score === null} />
                </div>

                {/* Rating & Buyer counts */}
                <div className="mute" style={{ fontSize: 13 }}>
                  <Icon name="user" style={{ verticalAlign: "-2px", marginRight: 4, width: 14, height: 14 }} />
                  {d.private.count} ratings · {d.private.buyers} buyers
                  {d.gate.state === "kulang" && d.private.count > 0 && (
                    <span style={{ color: "var(--chili)", fontWeight: 600 }}> · Kulang pa {Math.min(d.gate.have, d.gate.need)}/{d.gate.need}</span>
                  )}
                </div>

                {/* Badges Row */}
                <div className="dish-card-badges">
                  {d.private.improving && (
                    <span className="pill g"><Icon name="trend" /> Gumaganda</span>
                  )}
                  {d.pansin !== 0 && (
                    <span className={`pill ${d.pansin < 0 ? "a" : "g"}`}>
                      <Icon name={d.pansin < 0 ? "alert" : "up"} /> Pansin
                    </span>
                  )}
                  {d.flagged > 0 && (
                    <span className="pill r"><Icon name="alert" /> {d.flagged} under review</span>
                  )}
                  {d.recs.map((r) => (
                    <span key={r.word} className="pill">
                      <Icon name={iconFor(r.icon)} />
                      <Icon name={r.dir} />
                      {r.word}
                    </span>
                  ))}
                </div>

                {/* Card Quick Action Footer */}
                <div
                  className="dish-card-footer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    className="btn soft"
                    style={{ minHeight: 36, padding: "0 12px", fontSize: 12.5 }}
                    aria-pressed={d.published}
                    onClick={async () => {
                      await post(`/api/dishes/${d.id}`, { published: !d.published }, "PATCH");
                      reload();
                    }}
                  >
                    <Icon name={d.published ? "eye" : "eyeoff"} />
                    {d.published ? "Public" : "Private"}
                  </button>

                  <button
                    type="button"
                    className="btn soft"
                    style={{ minHeight: 36, padding: "0 12px", fontSize: 12.5 }}
                    aria-pressed={d.paborito}
                    onClick={async () => {
                      const r = await post(`/api/dishes/${d.id}`, { paborito: !d.paborito }, "PATCH");
                      setMsg(r.ok ? "" : "Hanggang tatlong Paborito dishes lamang ang maaaring piliin.");
                      reload();
                    }}
                  >
                    <Icon name="heart" style={{ color: d.paborito ? "var(--chili)" : "inherit" }} />
                    Paborito
                  </button>
                </div>
              </div>
            ))}
          </div>

          {msg && <p className="err center" role="alert">{msg}</p>}

          {/* Scannable QR Code Card (Always visible on Ngayon for printing and scanning) */}
          <div className="card stack center qr-display-card" style={{ alignItems: "center", padding: "18px 16px", marginTop: 8 }}>
            <h2 style={{ fontSize: 18, margin: 0 }}>Koda ng Stall</h2>
            <p className="mute" style={{ fontSize: 13, margin: "2px 0 8px" }}>
              I-print at idikit sa tindahan para makapag-rate ang mga suki.
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/stalls/${stall.id}/qr`}
              alt="Stall QR code"
              width={180}
              height={180}
              style={{ display: "block", borderRadius: 14 }}
            />
            <p className="mute" style={{ fontWeight: 700, fontSize: 13, color: "var(--cocoa)" }}>
              kapyba-{stall.code}
            </p>
            <div className="row" style={{ gap: 8, marginTop: 4 }}>
              <a className="btn soft" href={`/api/stalls/${stall.id}/qr`} download={`kapyba-${stall.code}.svg`}>
                <Icon name="download" /> Download
              </a>
              <button type="button" className="btn soft" onClick={() => setShowQR(true)}>
                <Icon name="qr" /> Palakihin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Screen 2: Natira */}
      {activeTab === "natira" && (
        <NatiraView
          stallId={stall.id}
          dishes={dishes}
          onSaved={() => {
            setBukasTick((t) => t + 1);
            reload();
          }}
          onGoToBukas={() => setActiveTab("bukas")}
        />
      )}

      {/* Tab Screen 3: Bukas */}
      {activeTab === "bukas" && (
        <>
          {showPalengke ? (
            <PalengkeView
              stallId={stall.id}
              refresh={bukasTick}
              onClose={() => setShowPalengke(false)}
            />
          ) : (
            <BukasView
              stallId={stall.id}
              refresh={bukasTick}
              onOpenPalengke={() => setShowPalengke(true)}
            />
          )}
        </>
      )}

      {/* Bottom Navigation Bar: Ngayon · Natira · Bukas (UX.md Section 2) */}
      <nav className="owner-nav" aria-label="Owner navigation">
        <button
          type="button"
          className={`owner-tab-btn ${activeTab === "ngayon" ? "on" : ""}`}
          onClick={() => {
            setActiveTab("ngayon");
            setShowPalengke(false);
          }}
          aria-label="Ngayon"
          aria-current={activeTab === "ngayon" ? "page" : undefined}
        >
          <Icon name="today" />
          <span>Ngayon</span>
        </button>

        <button
          type="button"
          className={`owner-tab-btn ${activeTab === "natira" ? "on" : ""}`}
          onClick={() => {
            setActiveTab("natira");
            setShowPalengke(false);
          }}
          aria-label="Natira"
          aria-current={activeTab === "natira" ? "page" : undefined}
        >
          <Icon name="plate" />
          <span>Natira</span>
        </button>

        <button
          type="button"
          className={`owner-tab-btn ${activeTab === "bukas" ? "on" : ""}`}
          onClick={() => {
            setActiveTab("bukas");
            setShowPalengke(false);
          }}
          aria-label="Bukas"
          aria-current={activeTab === "bukas" ? "page" : undefined}
        >
          <Icon name="cart" />
          <span>Bukas</span>
        </button>
      </nav>

      {/* Modal Overlays */}
      {currentSelectedDish && (
        <DishDetailModal
          dish={currentSelectedDish}
          onClose={() => setSelectedDish(null)}
          onTogglePublished={async () => {
            await post(`/api/dishes/${currentSelectedDish.id}`, { published: !currentSelectedDish.published }, "PATCH");
            reload();
          }}
          onTogglePaborito={async () => {
            const r = await post(`/api/dishes/${currentSelectedDish.id}`, { paborito: !currentSelectedDish.paborito }, "PATCH");
            setMsg(r.ok ? "" : "Hanggang tatlong Paborito dishes lamang ang maaaring piliin.");
            reload();
          }}
          onOpenUlat={() => {
            setUlatDishId(currentSelectedDish.id);
            setShowUlat(true);
          }}
        />
      )}

      {showQR && (
        <QRModal stall={stall} onClose={() => setShowQR(false)} />
      )}

      {showAlok && (
        <AlokModal stallId={stall.id} dishes={dishes} onClose={() => setShowAlok(false)} />
      )}

      {showUlat && (
        <UlatModal
          dishes={dishes}
          initialDishId={ulatDishId}
          onFiled={reload}
          onClose={() => setShowUlat(false)}
        />
      )}

      {showAddDish && (
        <AddDishModal
          stallId={stall.id}
          onClose={() => setShowAddDish(false)}
          onAdded={reload}
        />
      )}
    </div>
  );
}
