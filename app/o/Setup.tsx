"use client";
import { useState } from "react";
import { Capybara } from "@/src/ui/Capybara";
import { Icon } from "@/src/ui/Icon";
import type { IconName } from "@/src/ui/icons";

type Stall = { id: string; name: string; area: string; code: string };
type Created = { id: string; name: string; icon: string };
type Pick = { name: string; icon: IconName };

// Common Filipino dishes. Prices are not guessed: the owner types her own.
const COMMON: Pick[] = [
  { name: "Adobo", icon: "meat" }, { name: "Sinigang", icon: "bowl" }, { name: "Tinola", icon: "bowl" },
  { name: "Pritong isda", icon: "fish" }, { name: "Pinakbet", icon: "leaf" }, { name: "Kare-kare", icon: "meat" },
  { name: "Menudo", icon: "meat" }, { name: "Lechon kawali", icon: "meat" }, { name: "Ginataang gulay", icon: "leaf" },
  { name: "Tortang talong", icon: "leaf" }, { name: "Sisig", icon: "meat" }, { name: "Nilaga", icon: "bowl" },
  { name: "Afritada", icon: "meat" }, { name: "Pancit", icon: "plate" }, { name: "Lugaw", icon: "bowl" },
  { name: "Dinuguan", icon: "meat" }, { name: "Laing", icon: "leaf" }, { name: "Paksiw na isda", icon: "fish" },
];
const STEPS = 5;

const post = (url: string, body: unknown, method = "POST") =>
  fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

// Simula: five short steps from nothing to a printable QR. Skip is always allowed; Ngayon has everything again.
export function Setup({ stall, onStall, onDone }: { stall: Stall | null; onStall: () => void; onDone: () => void }) {
  const [step, setStep] = useState(stall ? 2 : 1);
  const [picked, setPicked] = useState<Pick[]>([]);
  const [custom, setCustom] = useState("");
  const [created, setCreated] = useState<Created[]>([]);
  const [fav, setFav] = useState<string[]>([]);
  const [msg, setMsg] = useState("");

  const toggle = (p: Pick) =>
    setPicked((cur) => (cur.some((c) => c.name === p.name) ? cur.filter((c) => c.name !== p.name) : [...cur, p]));

  return (
    <div className="stack" style={{ paddingTop: 16 }}>
      <div className="row" aria-label={`Step ${step} of ${STEPS}`} role="img" style={{ justifyContent: "center", gap: 8 }}>
        {Array.from({ length: STEPS }, (_, i) => (
          <span key={i} style={{ width: 10, height: 10, borderRadius: 99, background: i < step ? "var(--cocoa)" : "var(--ring)" }} />
        ))}
      </div>

      {step === 1 && (
        <form className="stack" onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          const r = await post("/api/stalls", { name: f.get("name"), area: f.get("area") });
          if (r.ok) { setMsg(""); onStall(); setStep(2); } else setMsg("Add a name and an area.");
        }}>
          <div className="hero"><Capybara mood="happy" size={72} /><div><h1>Simula</h1><p>Set up your stall. Takes about two minutes.</p></div></div>
          <div><label htmlFor="name">Stall name</label><input id="name" name="name" required maxLength={80} placeholder="Karinderya ni Aling Rosa" /></div>
          <div><label htmlFor="area">Area or school nearby</label><input id="area" name="area" required maxLength={80} placeholder="UST" /></div>
          {msg && <p className="err" role="alert">{msg}</p>}
          <button className="btn block">Next</button>
        </form>
      )}

      {step === 2 && (
        <div className="stack">
          <h1>Ulam</h1>
          <p className="mute">Tap the dishes you cook. You can add more later.</p>
          <div className="chips" style={{ flexWrap: "wrap" }}>
            {[...COMMON, ...picked.filter((p) => !COMMON.some((c) => c.name === p.name))].map((p) => (
              <button key={p.name} type="button" className="chip" aria-pressed={picked.some((c) => c.name === p.name)} onClick={() => toggle(p)}>{p.name}</button>
            ))}
          </div>
          <div className="row">
            <input aria-label="Another dish" className="grow" value={custom} maxLength={80} placeholder="Another dish" onChange={(e) => setCustom(e.target.value)} />
            <button type="button" className="btn soft" onClick={() => {
              const name = custom.trim();
              if (name && !picked.some((c) => c.name.toLowerCase() === name.toLowerCase())) setPicked((cur) => [...cur, { name, icon: "plate" }]);
              setCustom("");
            }}><Icon name="plus" />Add</button>
          </div>
          <button className="btn block" disabled={picked.length === 0} onClick={() => setStep(3)}>Next</button>
          <button className="btn soft block" onClick={onDone}>Skip for now</button>
        </div>
      )}

      {step === 3 && stall && (
        <form className="stack" onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          const made: Created[] = [];
          for (const [i, p] of picked.entries()) {
            const r = await post(`/api/stalls/${stall.id}/dishes`, { name: p.name, icon: p.icon, price: Number(f.get(`price${i}`)), baseServings: Number(f.get(`serv${i}`) || 0) });
            if (!r.ok) { setMsg(`Check the price for ${p.name}.`); setCreated(made); return; }
            const body = await r.json();
            made.push({ id: body.dish?.id ?? body.id, name: p.name, icon: p.icon });
          }
          setMsg(""); setCreated(made); setStep(4);
        }}>
          <h1>Presyo</h1>
          <p className="mute">Price and how many plates you usually sell in a day.</p>
          {picked.map((p, i) => (
            <div key={p.name} className="card stack">
              <strong>{p.name}</strong>
              <div className="row">
                <div className="grow"><label htmlFor={`price${i}`}>Price (₱)</label><input id={`price${i}`} name={`price${i}`} type="number" inputMode="numeric" min={1} max={10000} required /></div>
                <div className="grow"><label htmlFor={`serv${i}`}>Plates a day</label><input id={`serv${i}`} name={`serv${i}`} type="number" inputMode="numeric" min={0} max={1000} /></div>
              </div>
            </div>
          ))}
          {msg && <p className="err" role="alert">{msg}</p>}
          <button className="btn block">Next</button>
          <button type="button" className="btn soft block" onClick={() => setStep(2)}>Back</button>
        </form>
      )}

      {step === 4 && stall && (
        <div className="stack">
          <h1>Paborito</h1>
          <p className="mute">Pick up to three dishes you are proudest of.</p>
          <div className="chips" style={{ flexWrap: "wrap" }}>
            {created.map((d) => (
              <button key={d.id} type="button" className="chip" aria-pressed={fav.includes(d.id)} onClick={() =>
                setFav((cur) => (cur.includes(d.id) ? cur.filter((x) => x !== d.id) : cur.length < 3 ? [...cur, d.id] : cur))}>
                <Icon name="heart" />{d.name}
              </button>
            ))}
          </div>
          <button className="btn block" onClick={async () => {
            await Promise.all(fav.map((id) => post(`/api/dishes/${id}`, { paborito: true }, "PATCH")));
            setStep(5);
          }}>Next</button>
        </div>
      )}

      {step === 5 && stall && (
        <div className="card stack center" style={{ alignItems: "center" }}>
          <Capybara mood="happy" size={72} />
          <h1>Your QR</h1>
          <p className="mute">Print this and put it at the stall. Customers scan it to rate.</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/api/stalls/${stall.id}/qr`} alt="Stall QR code" width={220} height={220} />
          <a className="btn soft" href={`/api/stalls/${stall.id}/qr`} download={`kapyba-${stall.code}.svg`}>Download</a>
          <button className="btn block" onClick={onDone}>Tapos</button>
        </div>
      )}
    </div>
  );
}
