"use client";
import { useEffect, useState } from "react";
import { Icon } from "@/src/ui/Icon";
import { Mascot } from "@/src/ui/Mascot";

type Deal = {
  id: string;
  dishId: string;
  kind: string;
  limit: number;
  claimed: number;
  remaining: number;
  active: boolean;
  endsAt: string | null;
};
type Dish = { id: string; name: string };
const KINDS = [
  { id: "combo", label: "Combo", icon: "combo" as const },
  { id: "suki", label: "Suki", icon: "star" as const },
  { id: "oras", label: "Oras (timed)", icon: "clock" as const },
];

export function AlokModal({
  stallId,
  dishes,
  onClose,
}: {
  stallId: string;
  dishes: Dish[];
  onClose: () => void;
}) {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [tick, setTick] = useState(0);
  const [msg, setMsg] = useState("");
  const [selectedDishId, setSelectedDishId] = useState(dishes[0]?.id ?? "");
  const [kind, setKind] = useState("combo");
  const [limit, setLimit] = useState(10);
  const [minutes, setMinutes] = useState(60);

  useEffect(() => {
    fetch(`/api/stalls/${stallId}/alok`).then(async (r) => {
      if (r.ok) setDeals((await r.json()).deals);
    });
  }, [stallId, tick]);

  const name = (id: string) => dishes.find((d) => d.id === id)?.name ?? "Dish";

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Alok Deals">
      <div className="modal-card alok-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="detail-hdr">
          <button type="button" className="simula-back" onClick={onClose} aria-label="Isara">
            <Icon name="x" />
          </button>
          <div className="detail-title-wrap">
            <div className="ico-plate" style={{ width: 36, height: 36 }}>
              <Icon name="megaphone" />
            </div>
            <h2 style={{ margin: 0, fontSize: 18 }}>Alok Deals</h2>
          </div>
          <span style={{ width: 44 }} />
        </div>

        <div className="detail-scroll">
          {/* Intro notice */}
          <div className="coach-card" style={{ padding: "12px 14px", gap: 10 }}>
            <Mascot mood="happy" size={44} />
            <p className="mute" style={{ fontSize: 13, margin: 0 }}>
              Espesyal na alok o promo ng iyong stall. <strong>Hindi ito kapalit ng rating</strong> at hindi nagbabago ang ranking sa board.
            </p>
          </div>

          {/* Active Deals List */}
          {deals.filter((d) => d.active).length > 0 && (
            <div className="card stack">
              <h2 style={{ fontSize: 16 }}>Mga Umiiral na Deal</h2>
              <div className="stack" style={{ gap: 8 }}>
                {deals
                  .filter((d) => d.active)
                  .map((d) => (
                    <div key={d.id} className="row alok-active-row" data-testid="alok-row" style={{ justifyContent: "space-between" }}>
                      <div className="row" style={{ gap: 8 }}>
                        <span className="pill" style={{ background: "var(--cream)", color: "var(--cocoa)", fontWeight: 700 }}>
                          {d.kind}
                        </span>
                        <div>
                          <strong>{name(d.dishId)}</strong>
                          <div className="mute" style={{ fontSize: 12 }}>
                            {d.remaining} of {d.limit} left
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn soft"
                        style={{ minHeight: 36, padding: "0 12px", fontSize: 13 }}
                        onClick={async () => {
                          await fetch(`/api/alok/${d.id}/close`, { method: "POST" });
                          setTick((t) => t + 1);
                        }}
                      >
                        Close
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* New Deal Form */}
          <form
            className="card stack"
            onSubmit={async (e) => {
              e.preventDefault();
              const body: Record<string, unknown> = {
                dishId: selectedDishId,
                kind,
                limit: Number(limit),
              };
              if (kind === "oras") {
                body.endsAt = new Date(Date.now() + minutes * 60_000).toISOString();
              }
              const r = await fetch(`/api/stalls/${stallId}/alok`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
              });
              setMsg(r.ok ? "Na-post na ang alok!" : "Tingnan ang ulam, limit at oras.");
              if (r.ok) {
                setTick((t) => t + 1);
              }
            }}
          >
            <h2 style={{ fontSize: 16 }}>Mag-post ng Bagong Alok</h2>

            {/* Dish selector */}
            <div>
              <label htmlFor="alok-dish" style={{ fontSize: 13, marginBottom: 4 }}>Ulam</label>
              <select
                id="alok-dish"
                value={selectedDishId}
                onChange={(e) => setSelectedDishId(e.target.value)}
              >
                {dishes.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Deal kind selection */}
            <div>
              <label style={{ fontSize: 13, marginBottom: 6 }}>Uri ng Deal</label>
              <div className="grid3" style={{ gap: 8 }}>
                {KINDS.map((k) => (
                  <button
                    key={k.id}
                    type="button"
                    className={`tile ${kind === k.id ? "on" : ""}`}
                    onClick={() => setKind(k.id)}
                    style={{ minHeight: 68, padding: "10px 4px" }}
                  >
                    <Icon name={k.icon} />
                    <span style={{ fontSize: 12, fontWeight: 700 }}>{k.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Limit Stepper */}
            <div>
              <label htmlFor="alimit" style={{ fontSize: 13, marginBottom: 4 }}>Dami ng Servings / Claim Limit</label>
              <div className="stepper" style={{ justifyContent: "center" }}>
                <button
                  type="button"
                  onClick={() => setLimit((l) => Math.max(1, l - 1))}
                  aria-label="Bawasan"
                >
                  <Icon name="minus" />
                </button>
                <input
                  id="alimit"
                  name="limit"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={500}
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  aria-label="Limit"
                  style={{ width: 90, textAlign: "center", fontSize: 20 }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setLimit((l) => l + 1)}
                  aria-label="Dagdagan"
                >
                  <Icon name="plus" />
                </button>
              </div>
            </div>

            {/* Oras expiry input */}
            {kind === "oras" && (
              <div>
                <label htmlFor="amin" style={{ fontSize: 13, marginBottom: 4 }}>Magtatapos sa (minuto)</label>
                <input
                  id="amin"
                  name="minutes"
                  type="number"
                  inputMode="numeric"
                  min={5}
                  max={720}
                  value={minutes}
                  onChange={(e) => setMinutes(Number(e.target.value))}
                  style={{ textAlign: "center" }}
                />
              </div>
            )}

            {msg && <p className={msg.includes("Na-post") ? "mute center" : "err center"}>{msg}</p>}

            <button type="submit" className="btn block primary-cta" style={{ minHeight: 48, fontSize: 15 }}>
              <Icon name="check" /> Post deal
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
