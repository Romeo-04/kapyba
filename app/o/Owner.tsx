"use client";
import { useEffect, useState } from "react";
import { Icon } from "@/src/ui/Icon";
import { Mascot } from "@/src/ui/Mascot";
import { OwnerBottomNav } from "@/src/ui/OwnerBottomNav";
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
import { StoreProfileModal } from "./StoreProfileModal";
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
  const [showStoreProfile, setShowStoreProfile] = useState(false);
  const [showUlat, setShowUlat] = useState(false);
  const [showAddDish, setShowAddDish] = useState(false);
  const [ulatDishId, setUlatDishId] = useState<string | undefined>(undefined);
  const [logDays, setLogDays] = useState<{ day: string; pesos: number; leftover: number; cooked: number }[]>([]);

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
    fetch(`/api/stalls/${stallId}/log`).then(async (r) => {
      if (r.ok) {
        const data = await r.json();
        setLogDays(data.days ?? []);
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
  const latestLog = logDays[logDays.length - 1];
  const leftoversCount = latestLog ? latestLog.leftover : 0;

  const bestSellers = [...dishes].sort((a, b) => {
    const scoreA = a.private.score ?? 0;
    const scoreB = b.private.score ?? 0;
    if (scoreB !== scoreA) return scoreB - scoreA;
    return b.private.count - a.private.count;
  });

  // Sync selectedDish with updated dishes on tick
  const currentSelectedDish = selectedDish ? dishes.find((d) => d.id === selectedDish.id) ?? selectedDish : null;

  return (
    <div className="owner-container">
      {/* Tab Screen 1: Ngayon (Figma Node 90:1655) */}
      {activeTab === "ngayon" && (
        <div className="ngayon-screen">
          {/* Header */}
          <div className="ngayon-header">
            <div>
              <h1 className="ngayon-title">Ngayon</h1>
              <p className="ngayon-subtitle">{stall.name}</p>
            </div>
            <button
              type="button"
              className="store-profile-btn"
              onClick={() => setShowStoreProfile(true)}
              title="Profile ng Tindahan"
              aria-label="Profile ng Tindahan"
            >
              <Icon name="store" />
            </button>
          </div>

          {/* Metrics Hero Card (Figma Node 92:3484 - Overall Score) */}
          <div className="ngayon-hero-card">
            <div className="ngayon-hero-mascot-wrap">
              <img
                src={hasWeakDish ? "/mascot/kapyba-worried.png" : "/mascot/kapyba-celebrate.png"}
                alt="Capybara Mascot"
                className="ngayon-hero-mascot-img"
              />
            </div>
            <div className="ngayon-hero-score">
              <span className="ngayon-score-lbl">OVERALL SCORE</span>
              <div className="ngayon-score-val-wrap">
                <span className="ngayon-score-val">
                  {avgStallScore !== null ? avgStallScore.toFixed(1) : "—"}
                </span>
                <span className="ngayon-score-scale">/5.0</span>
              </div>
            </div>
          </div>

          {/* Daily Summary 2-Column Metrics */}
          <div className="ngayon-metrics-row">
            <div
              className="ngayon-metric-card"
              role="button"
              tabIndex={0}
              aria-label={`${totalRatings} reviews`}
            >
              <span className="ngayon-metric-val">{totalRatings}</span>
              <span className="ngayon-metric-lbl">REVIEWS</span>
            </div>
            <div
              className="ngayon-metric-card"
              role="button"
              tabIndex={0}
              onClick={() => setActiveTab("natira")}
              aria-label={`${leftoversCount} left-overs`}
            >
              <span className="ngayon-metric-val">{leftoversCount}</span>
              <span className="ngayon-metric-lbl">LEFT-OVERS</span>
            </div>
          </div>

          {/* Best Sellers Section */}
          <div className="ngayon-bestsellers-hdr">
            <h2 className="ngayon-bestsellers-title">Best sellers</h2>
            <button
              type="button"
              className="btn soft"
              style={{ minHeight: 32, padding: "0 10px", fontSize: 12, borderRadius: 999 }}
              onClick={() => setShowAddDish(true)}
            >
              <Icon name="plus" /> Magdagdag
            </button>
          </div>

          {msg && <p className="err center" role="alert">{msg}</p>}

          {dishes.length === 0 ? (
            <div className="card stack center" style={{ padding: 32 }}>
              <Mascot mood="sleepy" size={56} />
              <p className="mute">Wala pang nakalistang ulam. I-click ang Magdagdag upang simulan.</p>
              <button type="button" className="btn soft" onClick={() => setShowAddDish(true)}>
                <Icon name="plus" /> Magdagdag ng ulam
              </button>
            </div>
          ) : (
            <div className="ngayon-dish-grid">
              {bestSellers.map((d) => (
                <div
                  key={d.id}
                  className="ngayon-dish-card"
                  onClick={() => setSelectedDish(d)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Ulam: ${d.name}`}
                >
                  <img
                    src="/dish-placeholder.jpg"
                    alt={d.name}
                    className="ngayon-dish-photo"
                  />
                  <div className="ngayon-dish-details">
                    <div className="ngayon-dish-row1">
                      <span className="ngayon-dish-name" title={d.name}>
                        {d.name}
                      </span>
                      <div className="ngayon-dish-score-wrap">
                        {d.private.score !== null ? (
                          <>
                            <span className="ngayon-dish-score">
                              {d.private.score.toFixed(1)}
                            </span>
                            <span className="ngayon-dish-scale">/5.0</span>
                          </>
                        ) : (
                          <span className="ngayon-dish-new">Bago</span>
                        )}
                      </div>
                    </div>
                    <div className="ngayon-dish-row2">
                      <span className="ngayon-dish-ratings">
                        {d.private.count} {d.private.count === 1 ? "rating" : "ratings"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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

      {/* Bottom Navigation Bar: Ngayon · Natira · Bukas (Figma Nodes 87:1593, 87:1606, 87:1631) */}
      <OwnerBottomNav
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setShowPalengke(false);
        }}
      />

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

      {showStoreProfile && (
        <StoreProfileModal
          stall={stall}
          totalDishes={dishes.length}
          totalRatings={totalRatings}
          onClose={() => setShowStoreProfile(false)}
          onOpenQR={() => setShowQR(true)}
          onOpenAlok={() => setShowAlok(true)}
          onUpdated={(updated) => {
            setStalls((prev) =>
              prev ? prev.map((s) => (s.id === stall.id ? { ...s, ...updated } : s)) : prev
            );
            reload();
          }}
        />
      )}
    </div>
  );
}
