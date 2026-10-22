"use client";
import { useEffect, useState } from "react";
import { Icon } from "@/src/ui/Icon";
import type { IconName } from "@/src/ui/icons";
import { Mascot } from "@/src/ui/Mascot";
import { Ring } from "@/src/ui/Ring";
import { iconFor } from "../s/[code]/Rate";
import { Alok } from "./Alok";
import { Bukas } from "./Bukas";
import { Natira } from "./Natira";
import { Palengke } from "./Palengke";
import { loadSimulaState, Simula } from "./Simula";
import { Ulat } from "./Ulat";

type Stall = { id: string; name: string; area: string; code: string };
type Summary = {
  id: string; name: string; icon: string; price: number; published: boolean; paborito: boolean;
  private: { count: number; buyers: number; score: number | null; improving: boolean };
  gate: { state: "public" } | { state: "kulang"; have: number; need: number };
  flagged: number; pansin: number; recs: { icon: string; dir: "up" | "down"; word: string }[];
};

const DISH_ICONS: IconName[] = ["bowl", "meat", "fish", "leaf", "plate"];
const post = (url: string, body: unknown, method = "POST") =>
  fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

export function Owner() {
  const [stalls, setStalls] = useState<Stall[] | null>(null);
  const [dishes, setDishes] = useState<Summary[]>([]);
  const [msg, setMsg] = useState("");
  const [showSimula, setShowSimula] = useState<boolean | null>(null);

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
      if (r.ok) setDishes((await r.json()).dishes);
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

  return (
    <div className="stack">
      <div className="row">
        <Mascot mood={hasWeakDish ? "worry" : "calm"} size={56} />
        <div className="grow">
          <h1>Ngayon</h1>
          <p className="mute">{stall.name} · {stall.area}</p>
        </div>
        <button
          type="button"
          className="btn soft"
          onClick={() => setShowSimula(true)}
        >
          Simula
        </button>
      </div>

      {dishes.length === 0 && <p className="mute">Add your first dish below.</p>}
      {dishes.map((d) => (
        <div key={d.id} className="card stack">
          <div className="row">
            <Ring score={d.private.score} locked={d.private.score === null} />
            <div className="grow">
              <strong>{d.name}</strong> <span className="price">₱{d.price}</span>
              <div className="mute">
                {d.private.count} ratings · {d.private.buyers} buyers
                {d.gate.state === "kulang" && d.private.count > 0 && <> · Kulang pa {Math.min(d.gate.have, d.gate.need)}/{d.gate.need}</>}
              </div>
            </div>
            <span className="ico" style={{ color: "var(--cocoa)" }}><Icon name={iconFor(d.icon)} className="lg" /></span>
          </div>
          <div className="row" style={{ flexWrap: "wrap" }}>
            {d.private.improving && <span className="pill g"><Icon name="trend" />Gumaganda</span>}
            {d.pansin !== 0 && <span className={`pill ${d.pansin < 0 ? "a" : "g"}`}><Icon name={d.pansin < 0 ? "alert" : "up"} />Pansin</span>}
            {d.flagged > 0 && <span className="pill r"><Icon name="alert" />{d.flagged} under review</span>}
            {d.recs.map((r) => (
              <span key={r.word} className="pill"><Icon name={iconFor(r.icon)} /><Icon name={r.dir} />{r.word}</span>
            ))}
          </div>
          <div className="row">
            <button className="btn soft" aria-pressed={d.published} onClick={async () => { await post(`/api/dishes/${d.id}`, { published: !d.published }, "PATCH"); reload(); }}>
              <Icon name={d.published ? "eye" : "eyeoff"} />{d.published ? "Public" : "Private"}
            </button>
            <button className="btn soft" aria-pressed={d.paborito} onClick={async () => {
              const r = await post(`/api/dishes/${d.id}`, { paborito: !d.paborito }, "PATCH");
              setMsg(r.ok ? "" : "You can pick up to three Paborito dishes.");
              reload();
            }}><Icon name="heart" />Paborito</button>
          </div>
        </div>
      ))}
      {msg && <p className="err" role="alert">{msg}</p>}

      {dishes.length > 0 && <Natira stallId={stall.id} dishes={dishes} onSaved={() => setBukasTick((t) => t + 1)} />}
      {dishes.length > 0 && <Bukas stallId={stall.id} refresh={bukasTick} />}
      {dishes.length > 0 && <Alok stallId={stall.id} dishes={dishes} />}
      {dishes.length > 0 && <Ulat dishes={dishes} onFiled={reload} />}
      {dishes.length > 0 && <Palengke stallId={stall.id} refresh={bukasTick} />}

      <form className="card stack" onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const f = new FormData(form);
        const r = await post(`/api/stalls/${stall.id}/dishes`, { name: f.get("name"), icon: f.get("icon"), price: Number(f.get("price")), baseServings: Number(f.get("servings") || 0) });
        if (r.ok) { form.reset(); setMsg(""); reload(); } else setMsg("Check the dish name and price.");
      }}>
        <h2>Add a dish</h2>
        <div><label htmlFor="dname">Dish</label><input id="dname" name="name" required maxLength={80} placeholder="Adobo" /></div>
        <div className="row">
          <div className="grow"><label htmlFor="dprice">Price (₱)</label><input id="dprice" name="price" type="number" inputMode="numeric" min={1} max={10000} required /></div>
          <div className="grow"><label htmlFor="dserv">Servings a day</label><input id="dserv" name="servings" type="number" inputMode="numeric" min={0} max={1000} /></div>
        </div>
        <div><label htmlFor="dicon">Icon</label>
          <select id="dicon" name="icon">{DISH_ICONS.map((i) => <option key={i} value={i}>{i}</option>)}</select>
        </div>
        <button className="btn block"><Icon name="plus" />Add</button>
      </form>

      <div className="card stack center" style={{ alignItems: "center" }}>
        <h2>Your QR</h2>
        <p className="mute">Print this and put it at the stall. Customers scan it to rate.</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/api/stalls/${stall.id}/qr`} alt="Stall QR code" width={220} height={220} />
        <a className="btn soft" href={`/api/stalls/${stall.id}/qr`} download={`kapyba-${stall.code}.svg`}>Download</a>
      </div>
    </div>
  );
}
