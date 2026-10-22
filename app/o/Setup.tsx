"use client";
import { useState } from "react";
import { Capybara } from "@/src/ui/Capybara";
import { Icon } from "@/src/ui/Icon";
import type { IconName } from "@/src/ui/icons";

type Stall = { id: string; name: string; area: string; code: string };
type Dish = { id: string; name: string; icon: string };
type Pick = { name: string; icon: IconName; price: number; plates: number };

// Common Filipino dishes. Prices are never guessed: the owner sets her own.
const COMMON: { name: string; icon: IconName }[] = [
  { name: "Adobo", icon: "meat" }, { name: "Sinigang", icon: "bowl" }, { name: "Tinola", icon: "bowl" },
  { name: "Pritong isda", icon: "fish" }, { name: "Pinakbet", icon: "leaf" }, { name: "Kare-kare", icon: "meat" },
  { name: "Menudo", icon: "meat" }, { name: "Lechon kawali", icon: "meat" }, { name: "Ginataang gulay", icon: "leaf" },
  { name: "Tortang talong", icon: "leaf" }, { name: "Sisig", icon: "meat" }, { name: "Nilaga", icon: "bowl" },
  { name: "Afritada", icon: "meat" }, { name: "Pancit", icon: "plate" }, { name: "Lugaw", icon: "bowl" },
  { name: "Dinuguan", icon: "meat" }, { name: "Laing", icon: "leaf" }, { name: "Paksiw na isda", icon: "fish" },
];
const STEPS = 6;
export const setupKey = (stallId: string) => `kb_setup_${stallId}`;

const post = (url: string, body: unknown, method = "POST") =>
  fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

// Simula: six short steps from nothing to a printable QR. Laktaw (skip) is always there; Ngayon has everything too.
// Once the dishes are saved the step is remembered on this phone, so a refresh resumes at Paborito or the QR.
export function Setup({ stall, dishes, step: startStep, onStall, onDone }: {
  stall: Stall | null; dishes: Dish[]; step: number; onStall: () => void; onDone: () => void;
}) {
  const [step, setStep] = useState(startStep);
  const [picked, setPicked] = useState<Pick[]>([]);
  const [custom, setCustom] = useState("");
  const [fav, setFav] = useState<string[]>([]);
  const [msg, setMsg] = useState("");

  const go = (n: number) => {
    setMsg("");
    setStep(n);
    if (stall && n >= 5) localStorage.setItem(setupKey(stall.id), String(n));
  };
  const finish = () => { if (stall) localStorage.removeItem(setupKey(stall.id)); onDone(); };
  const update = (name: string, patch: Partial<Pick>) => setPicked((cur) => cur.map((p) => (p.name === name ? { ...p, ...patch } : p)));
  const toggle = (c: { name: string; icon: IconName }) =>
    setPicked((cur) => (cur.some((p) => p.name === c.name) ? cur.filter((p) => p.name !== c.name) : [...cur, { ...c, price: 0, plates: 0 }]));
  const shown = [...COMMON, ...picked.filter((p) => !COMMON.some((c) => c.name === p.name))];

  return (
    <div className="stack" style={{ paddingTop: 12, paddingBottom: 24 }}>
      <div className="row" style={{ alignItems: "center" }}>
        {step > 1 && step < 5 ? <button className="btn soft" aria-label="Back" onClick={() => go(step - 1)}>←</button> : <span style={{ width: 48 }} />}
        <div className="row grow" role="img" aria-label={`Step ${step} of ${STEPS}`} style={{ justifyContent: "center", gap: 8 }}>
          {Array.from({ length: STEPS }, (_, i) => (
            <span key={i} style={{ width: 10, height: 10, borderRadius: 99, background: i < step ? "var(--cocoa)" : "var(--ring)" }} />
          ))}
        </div>
        {stall && step < 6 ? <button className="btn soft" onClick={finish}>Laktaw</button> : <span style={{ width: 48 }} />}
      </div>

      {step === 1 && (
        <form className="stack" onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          const r = await post("/api/stalls", { name: f.get("name"), area: f.get("area") });
          if (r.ok) { setMsg(""); onStall(); setStep(2); } else setMsg("Add a name and an area.");
        }}>
          <div className="hero"><Capybara mood="happy" size={72} /><div><h1>Simula</h1><p>Anong pangalan ng tindahan mo? Takes about two minutes.</p></div></div>
          <div><label htmlFor="name">Stall name</label><input id="name" name="name" required maxLength={80} placeholder="Karinderya ni Aling Rosa" /></div>
          <div><label htmlFor="area">Area or school nearby</label><input id="area" name="area" required maxLength={80} placeholder="UST" /></div>
          <p className="mute">Puwedeng baguhin mamaya.</p>
          {msg && <p className="err" role="alert">{msg}</p>}
          <button className="btn block">Next</button>
        </form>
      )}

      {step === 2 && (
        <div className="stack">
          <div className="row"><h1 className="grow">Ulam</h1><span className="pill g">{picked.length} napili</span></div>
          <p className="mute">Ano ang madalas mong lutuin? Tap the dishes you cook.</p>
          <div className="chips" style={{ flexWrap: "wrap" }}>
            {shown.map((p) => (
              <button key={p.name} type="button" className="chip" aria-pressed={picked.some((c) => c.name === p.name)} onClick={() => toggle(p)}>{p.name}</button>
            ))}
          </div>
          <div className="row">
            <input aria-label="Another dish" className="grow" value={custom} maxLength={80} placeholder="Sariling ulam" onChange={(e) => setCustom(e.target.value)} />
            <button type="button" className="btn soft" onClick={() => {
              const name = custom.trim();
              if (name && !picked.some((c) => c.name.toLowerCase() === name.toLowerCase())) setPicked((cur) => [...cur, { name, icon: "plate", price: 0, plates: 0 }]);
              setCustom("");
            }}><Icon name="plus" />Add</button>
          </div>
          <button className="btn block" disabled={picked.length === 0} onClick={() => go(3)}>Next</button>
        </div>
      )}

      {step === 3 && (
        <div className="stack">
          <div className="row"><h1 className="grow">Presyo</h1><span className="mute">3/6</span></div>
          <p className="mute">Magkano bawat plato? Set the price you charge. You can change it later.</p>
          {picked.map((p) => (
            <div key={p.name} className="card row" style={{ alignItems: "center" }}>
              <span className="grow"><strong>{p.name}</strong></span>
              <button className="btn soft" aria-label={`Lower the price of ${p.name}`} onClick={() => update(p.name, { price: Math.max(0, p.price - 5) })}>−</button>
              <input aria-label={`Price of ${p.name} (₱)`} style={{ width: 84, textAlign: "center" }} type="number" inputMode="numeric" min={0} max={10000} value={p.price || ""} placeholder="₱" onChange={(e) => update(p.name, { price: Math.min(10000, Math.max(0, Math.floor(Number(e.target.value)) || 0)) })} />
              <button className="btn soft" aria-label={`Raise the price of ${p.name}`} onClick={() => update(p.name, { price: Math.min(10000, p.price + 5) })}>+</button>
            </div>
          ))}
          {msg && <p className="err" role="alert">{msg}</p>}
          <button className="btn block" onClick={() => {
            if (picked.some((p) => p.price < 1)) { setMsg("Set a price for every dish."); return; }
            go(4);
          }}>Next</button>
        </div>
      )}

      {step === 4 && stall && picked.length > 0 && dishes.length === 0 && (
        <div className="stack">
          <div className="row"><h1 className="grow">Karaniwan</h1><span className="mute">4/6</span></div>
          <p className="mute">Ilang plato ang benta mo sa isang araw? Roughly how many plates you sell a day.</p>
          {picked.map((p) => (
            <div key={p.name} className="card stack">
              <div className="row"><strong className="grow">{p.name}</strong><span className="mute">{p.plates} plato / araw</span></div>
              <input type="range" aria-label={`Plates of ${p.name} a day`} min={0} max={100} step={5} value={p.plates} onChange={(e) => update(p.name, { plates: Number(e.target.value) })} />
            </div>
          ))}
          {msg && <p className="err" role="alert">{msg}</p>}
          <button className="btn block" onClick={async () => {
            for (const p of picked) {
              const r = await post(`/api/stalls/${stall.id}/dishes`, { name: p.name, icon: p.icon, price: p.price, baseServings: p.plates });
              if (!r.ok) { setMsg(`Could not save ${p.name}. Check it and try again.`); return; }
            }
            setPicked([]);
            onStall(); // reload, so the dishes appear for Paborito
            go(5);
          }}>Next</button>
        </div>
      )}

      {step === 5 && stall && (
        <div className="stack">
          <div className="row"><h1 className="grow">Paborito</h1><span className="pill g">{fav.length}/3</span></div>
          <p className="mute">Alin ang top 3 mong luto? Pick up to three. Paborito mo, hindi customer rating.</p>
          {dishes.map((d) => (
            <button key={d.id} type="button" className="card row" aria-pressed={fav.includes(d.id)} style={{ alignItems: "center", textAlign: "left", background: fav.includes(d.id) ? "var(--cream)" : undefined }} onClick={() => {
              if (fav.includes(d.id)) { setFav(fav.filter((x) => x !== d.id)); setMsg(""); }
              else if (fav.length >= 3) setMsg("Three is the most. Tap a heart to take it off first.");
              else { setFav([...fav, d.id]); setMsg(""); }
            }}>
              <span className="grow"><strong>{d.name}</strong></span>
              <Icon name="heart" />
            </button>
          ))}
          {msg && <p className="err" role="alert">{msg}</p>}
          <button className="btn block" onClick={async () => {
            await Promise.all(fav.map((id) => post(`/api/dishes/${id}`, { paborito: true }, "PATCH")));
            go(6);
          }}>Next</button>
        </div>
      )}

      {step === 6 && stall && (
        <div className="stack">
          <div className="card stack center qr-print" style={{ alignItems: "center" }}>
            <Capybara mood="happy" size={72} />
            <h1>{stall.name}</h1>
            <p className="mute">{stall.area}</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/api/stalls/${stall.id}/qr`} alt="Stall QR code" width={220} height={220} />
            <p><strong>Scan to rate our ulam</strong></p>
          </div>
          <div className="card stack">
            <strong>Para sa customer</strong>
            <p className="mute">Scan → Pili ng ulam → Rate. Walang install, walang login.</p>
            <p className="mute">Private muna ang feedback. Ikaw lang ang may kontrol kung ipapakita.</p>
          </div>
          <div className="row">
            <button className="btn soft" onClick={() => window.print()}>Print</button>
            <a className="btn soft" href={`/api/stalls/${stall.id}/qr`} download={`kapyba-${stall.code}.svg`}>Download</a>
            <button className="btn grow" onClick={finish}>Tapos</button>
          </div>
        </div>
      )}
      <p className="mute center">Naka-save · Ituloy mamaya</p>
    </div>
  );
}
