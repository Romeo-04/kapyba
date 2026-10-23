"use client";
import { useState } from "react";
import { Icon } from "@/src/ui/Icon";
import { MAX_ABOUT, MAX_HOURS, infoProblem } from "@/src/domain/stallinfo";

export type StallInfo = { id: string; name: string; area: string; code: string; about: string | null; hours: string | null; lat: string | null };

/** The owner's profile: the numbers at a glance, what customers read about the karinderya, and every branch. */
export function Profile({ stall, stalls, stats, onSwitch, onAdd, onSaved }: {
  stall: StallInfo; stalls: StallInfo[]; stats: { dishes: number; ratings: number; avg: number | null };
  onSwitch: (id: string) => void; onAdd: () => void; onSaved: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [msg, setMsg] = useState("");
  const [loc, setLoc] = useState("");
  const [about, setAbout] = useState("");
  const [hours, setHours] = useState("");

  const problem = infoProblem(about.trim(), MAX_ABOUT) ?? infoProblem(hours.trim(), MAX_HOURS);

  return (
    <div className="stack">
      <div className="strip" data-testid="profile-stats">
        <div><strong>{stats.dishes}</strong><span>Dishes</span></div>
        <div><strong>{stats.ratings}</strong><span>Ratings</span></div>
        <div><strong>{stats.avg === null ? "–" : stats.avg.toFixed(1)}</strong><span>Avg score</span></div>
      </div>

      {!editing ? (
        <div className="panel" data-testid="profile-card">
          <div><span className="eyebrow">Store name</span><p>{stall.name}</p></div>
          <div><span className="eyebrow">Location</span><p>{stall.area}</p></div>
          {stall.about && <div><span className="eyebrow">About</span><p>{stall.about}</p></div>}
          {stall.hours && <div><span className="eyebrow">Hours</span><p>{stall.hours}</p></div>}
          {!stall.about && !stall.hours && <p className="mute">Add what you cook and your hours. Customers see this on your karinderya page.</p>}
        </div>
      ) : (
        <form className="panel" onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          const r = await fetch(`/api/stalls/${stall.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: f.get("name"), area: f.get("area"), about: f.get("about"), hours: f.get("hours") }) });
          if (r.ok) { setEditing(false); setMsg(""); onSaved(); } else setMsg("Check the name and place, and leave out links and phone numbers.");
        }}>
          <div><label htmlFor="pname">Store name</label><input id="pname" name="name" required maxLength={80} defaultValue={stall.name} /></div>
          <div><label htmlFor="parea">Location</label><input id="parea" name="area" required maxLength={80} defaultValue={stall.area} /></div>
          <div><label htmlFor="pabout">About (optional)</label><textarea id="pabout" name="about" rows={3} maxLength={MAX_ABOUT} defaultValue={stall.about ?? ""} onChange={(e) => setAbout(e.target.value)} placeholder="Home-style Filipino dishes cooked fresh every morning." /></div>
          <div><label htmlFor="phours">Hours (optional)</label><input id="phours" name="hours" maxLength={MAX_HOURS} defaultValue={stall.hours ?? ""} onChange={(e) => setHours(e.target.value)} placeholder="Mon to Sat, 6am to 2pm" /></div>
          {problem && <p className="err" role="alert">{problem}</p>}
          {msg && <p className="err" role="alert">{msg}</p>}
          <div className="row"><button type="button" className="btn soft grow" onClick={() => { setEditing(false); setMsg(""); }}>Cancel</button><button className="btn grow" disabled={!!problem}>Save</button></div>
        </form>
      )}

      <div className="row">
        <a className="round-ico plain" href="#stall-qr" aria-label="Show my QR code"><Icon name="qr" /></a>
        <button type="button" className="btn soft grow" aria-pressed={editing} onClick={() => { setAbout(stall.about ?? ""); setHours(stall.hours ?? ""); setEditing(!editing); }}><Icon name="edit" />Edit Profile</button>
      </div>
      <button type="button" className="btn soft block" onClick={() => {
        if (!navigator.geolocation) { setLoc("This phone cannot share its location."); return; }
        navigator.geolocation.getCurrentPosition(async (p) => {
          const r = await fetch(`/api/stalls/${stall.id}/location`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lat: p.coords.latitude, lng: p.coords.longitude }) });
          setLoc(r.ok ? "Location saved. Nearby customers see you first." : "Could not save the location. Try again.");
          if (r.ok) onSaved();
        }, () => setLoc("Allow location to save where your karinderya is."), { timeout: 10000 });
      }}><Icon name="pin" />{stall.lat ? "Update my location" : "Set my location here"}</button>
      <p className="mute small" role="status">{loc || (stall.lat ? "Location is set. Saved to about 100 m." : "Stand at your stall and tap. It helps nearby customers find you, and your weather forecast uses this spot.")}</p>
      <a className="mute" href={`/ulam/stall/${stall.id}`}>See how customers view this page</a>

      <h2 className="sec">All Branches ({stalls.length})</h2>
      <div className="stack" style={{ gap: 10 }}>
        {stalls.map((s) => {
          const current = s.id === stall.id;
          return (
            <button key={s.id} type="button" className={`branch${current ? " current" : ""}`} aria-current={current ? "true" : undefined} onClick={() => !current && onSwitch(s.id)}>
              <span className="tile"><Icon name="store" /></span>
              <span className="grow"><strong>{s.name}</strong><span className="mute small" style={{ display: "block" }}>{s.area}</span></span>
              {current ? <span className="pill cur">Current</span> : <span className="mute small">Switch →</span>}
            </button>
          );
        })}
        <button type="button" className="btn soft block" onClick={onAdd}><Icon name="plus" />Add Another Branch</button>
      </div>
    </div>
  );
}
