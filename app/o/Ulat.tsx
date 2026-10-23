"use client";
import { useState } from "react";
import { Icon } from "@/src/ui/Icon";

type Dish = { id: string; name: string };
const ERRORS: Record<string, string> = {
  window: "Pick a window of up to 3 hours, in the past.",
  empty: "No ratings in that window.",
  limit: "You have used this week's reports (3).",
  "already-open": "This dish already has a report under review.",
};

/** Report a burst of suspicious ratings. Flagged ratings leave the public score until the team has reviewed them. */
export function Ulat({ dishes, onFiled }: { dishes: Dish[]; onFiled: () => void }) {
  const [msg, setMsg] = useState("");
  return (
    <details className="report">
    <summary className="btn soft block"><Icon name="alert" />Report suspicious ratings</summary>
    <form className="card stack" onSubmit={async (e) => {
      e.preventDefault();
      const form = e.currentTarget;
      const f = new FormData(form);
      const now = Date.now();
      const from = Number(f.get("from")), to = Number(f.get("to"));
      const r = await fetch("/api/reports", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dishId: f.get("dish"), reason: f.get("reason"),
          windowStart: new Date(now - from * 60_000).toISOString(), windowEnd: new Date(now - to * 60_000).toISOString(),
        }),
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok) { setMsg(`Reported. ${j.report.flagged} ratings are under review; the team replies within 24 hours.`); form.reset(); onFiled(); }
      else setMsg(ERRORS[j.error] ?? "Could not send the report.");
    }}>
      <p className="mute">Many odd ratings in a short time? Report them. They stay visible to you but leave the public score until reviewed. Reports are limited and every decision is logged.</p>
      <div><label htmlFor="udish">Dish</label><select id="udish" name="dish">{dishes.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
      <div className="row">
        <div className="grow"><label htmlFor="ufrom">From (minutes ago)</label><input id="ufrom" name="from" type="number" inputMode="numeric" min={1} max={20160} defaultValue={60} /></div>
        <div className="grow"><label htmlFor="uto">To (minutes ago)</label><input id="uto" name="to" type="number" inputMode="numeric" min={0} max={20160} defaultValue={0} /></div>
      </div>
      <div><label htmlFor="ureason">What looked wrong?</label><input id="ureason" name="reason" maxLength={300} placeholder="Many sad faces within minutes" /></div>
      {msg && <p role="status" className="mute">{msg}</p>}
      <button className="btn block">Send report</button>
    </form>
    </details>
  );
}
