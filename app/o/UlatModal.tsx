"use client";
import { useState } from "react";
import { Icon } from "@/src/ui/Icon";
import { Mascot } from "@/src/ui/Mascot";

type Dish = { id: string; name: string };
const ERRORS: Record<string, string> = {
  window: "Pumili ng window hanggang 3 oras, sa nakaraan.",
  empty: "Walang ratings sa oras na pinili.",
  limit: "Naubos na ang 3 ulat para sa linggong ito.",
  "already-open": "May umiiral nang ulat na sinusuri para sa ulam na ito.",
};

export function UlatModal({
  dishes,
  initialDishId,
  onFiled,
  onClose,
}: {
  dishes: Dish[];
  initialDishId?: string;
  onFiled: () => void;
  onClose: () => void;
}) {
  const [selectedDishId, setSelectedDishId] = useState(initialDishId ?? dishes[0]?.id ?? "");
  const [msg, setMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Ulat Ratings">
      <div className="modal-card ulat-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="detail-hdr">
          <button type="button" className="simula-back" onClick={onClose} aria-label="Isara">
            <Icon name="x" />
          </button>
          <div className="detail-title-wrap">
            <div className="ico-plate" style={{ width: 36, height: 36 }}>
              <Icon name="alert" />
            </div>
            <h2 style={{ margin: 0, fontSize: 18 }}>Ulat ng Rating</h2>
          </div>
          <span style={{ width: 44 }} />
        </div>

        <div className="detail-scroll">
          <div className="coach-card" style={{ padding: "12px 14px", gap: 10 }}>
            <Mascot mood="worry" size={44} />
            <p className="mute" style={{ fontSize: 13, margin: 0 }}>
              Maraming kakaiba o sabay-sabay na bagsak na rating? I-report ito. Pansamantalang aalisin ang mga rating sa publikong score habang sinusuri ng reviewer.
            </p>
          </div>

          <form
            className="card stack"
            onSubmit={async (e) => {
              e.preventDefault();
              setIsSubmitting(true);
              const form = e.currentTarget;
              const f = new FormData(form);
              const now = Date.now();
              const from = Number(f.get("from"));
              const to = Number(f.get("to"));
              const r = await fetch("/api/reports", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  dishId: selectedDishId,
                  reason: f.get("reason"),
                  windowStart: new Date(now - from * 60_000).toISOString(),
                  windowEnd: new Date(now - to * 60_000).toISOString(),
                }),
              });
              const j = await r.json().catch(() => ({}));
              setIsSubmitting(false);
              if (r.ok) {
                setMsg(`Reported. ${j.report?.flagged ?? 1} under review.`);
                form.reset();
                onFiled();
              } else {
                setMsg(ERRORS[j.error] ?? "Hindi naipadala ang ulat.");
              }
            }}
          >
            <div>
              <label htmlFor="udish" style={{ fontSize: 13, marginBottom: 4 }}>Ulam</label>
              <select
                id="udish"
                name="dish"
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

            <div className="row">
              <div className="grow">
                <label htmlFor="ufrom" style={{ fontSize: 13, marginBottom: 4 }}>Mula (minuto nakalipas)</label>
                <input
                  id="ufrom"
                  name="from"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={20160}
                  defaultValue={60}
                />
              </div>
              <div className="grow">
                <label htmlFor="uto" style={{ fontSize: 13, marginBottom: 4 }}>Hanggang (minuto)</label>
                <input
                  id="uto"
                  name="to"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={20160}
                  defaultValue={0}
                />
              </div>
            </div>

            <div>
              <label htmlFor="ureason" style={{ fontSize: 13, marginBottom: 4 }}>Ano ang napansing mali?</label>
              <input
                id="ureason"
                name="reason"
                maxLength={300}
                placeholder="Many sad faces within minutes"
                aria-label="What looked wrong?"
                required
              />
            </div>

            {msg && <p role="status" className={msg.includes("Nai-ulat") ? "mute center" : "err center"}>{msg}</p>}

            <button type="submit" className="btn block primary-cta" disabled={isSubmitting}>
              <Icon name="check" /> {isSubmitting ? "Ipinapadala..." : "Send report"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
