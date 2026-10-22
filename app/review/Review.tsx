"use client";
import { useEffect, useState } from "react";

type Row = { id: string; dishName: string; stallName: string; windowStart: string; windowEnd: string; reason: string | null; createdAt: string };

/** Reviewer queue for Ulat reports, oldest first. Shown only to emails listed in REVIEWER_EMAILS. */
export function Review() {
  const [rows, setRows] = useState<Row[] | "denied" | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    fetch("/api/review").then(async (r) => setRows(r.ok ? (await r.json()).reports : "denied"));
  }, [tick]);

  if (rows === null) return <p className="mute center" style={{ paddingTop: 48 }}>Sandali...</p>;
  if (rows === "denied") return <p className="mute center" style={{ paddingTop: 48 }}>Hindi mahanap ang page na ito.</p>;

  return (
    <div className="stack">
      <h1>Ulat review</h1>
      <p className="mute">Decide within 24 hours. Upholding removes the flagged ratings for good. Rejecting restores them.</p>
      {rows.length === 0 && <p className="mute" data-testid="review-empty">No open reports.</p>}
      {rows.map((r) => (
        <form key={r.id} className="card stack" data-testid="review-row" onSubmit={(e) => e.preventDefault()}>
          <strong>{r.dishName} · {r.stallName}</strong>
          <span className="mute">{new Date(r.windowStart).toLocaleString()} to {new Date(r.windowEnd).toLocaleString()}</span>
          {r.reason && <span>{r.reason}</span>}
          <input name="note" aria-label="Reviewer note" maxLength={300} placeholder="Note (optional)" />
          <div className="row">
            {(["upheld", "rejected"] as const).map((decision) => (
              <button key={decision} type="button" className="btn soft" onClick={async (e) => {
                const note = (e.currentTarget.form!.elements.namedItem("note") as HTMLInputElement).value;
                await fetch(`/api/review/${r.id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ decision, note }) });
                setTick((t) => t + 1);
              }}>{decision === "upheld" ? "Uphold" : "Reject"}</button>
            ))}
          </div>
        </form>
      ))}
    </div>
  );
}
