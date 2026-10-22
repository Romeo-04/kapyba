"use client";
import { useEffect, useState } from "react";
import { DrilldownSheet } from "@/src/ui/DrilldownSheet";
import { Icon } from "@/src/ui/Icon";
import { Mascot } from "@/src/ui/Mascot";
import { TouchStepper } from "@/src/ui/TouchStepper";

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
  const [limit, setLimit] = useState<number | string>(10);
  const [minutes, setMinutes] = useState(60);

  useEffect(() => {
    fetch(`/api/stalls/${stallId}/alok`).then(async (r) => {
      if (r.ok) setDeals((await r.json()).deals);
    });
  }, [stallId, tick]);

  const name = (id: string) => dishes.find((d) => d.id === id)?.name ?? "Dish";

  return (
    <DrilldownSheet
      isOpen={true}
      onClose={onClose}
      title="Alok Deals"
      ariaLabel="Alok Deals"
      left={
        <button type="button" className="simula-back" onClick={onClose} aria-label="Isara">
          <Icon name="back" />
        </button>
      }
    >
      {/* Intro notice */}
      <div className="coach-card" style={{ padding: "12px 14px", gap: 10 }}>
        <Mascot mood="happy" size={44} />
        <p className="mute" style={{ fontSize: 13, margin: 0 }}>
          Espesyal na alok o promo ng iyong stall. <strong>Hindi ito kapalit ng rating</strong> at hindi nagbabago ang ranking sa board.
        </p>
      </div>

      {/* Active Deals List */}
      {deals.filter((d) => d.active).length > 0 && (
        <div className="card stack" style={{ background: "#fff" }}>
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
        style={{ background: "#fff" }}
        onSubmit={async (e) => {
          e.preventDefault();
          const body: Record<string, unknown> = {
            dishId: selectedDishId,
            kind,
            limit: Number(limit) || 10,
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
                <div className="tile-ico"><Icon name={k.icon} /></div>
                <span className="tile-name" style={{ fontSize: 12, fontWeight: 700 }}>{k.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Limit Stepper */}
        <div>
          <label htmlFor="alimit" style={{ fontSize: 13, marginBottom: 4 }}>Dami ng Servings / Claim Limit</label>
          <TouchStepper
            id="alimit"
            name="limit"
            ariaLabel="Limit"
            value={limit}
            onChange={setLimit}
            min={1}
            max={500}
          />
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
    </DrilldownSheet>
  );
}
