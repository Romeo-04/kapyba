"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Kapy } from "@/src/ui/Kapy";
import { Icon } from "@/src/ui/Icon";
import type { IconName } from "@/src/ui/icons";
import { Ring } from "@/src/ui/Ring";
import { iconFor } from "../s/[code]/Rate";
import { Alok } from "./Alok";
import { DishEdit } from "./DishEdit";
import { SaleControl } from "./SaleControl";
import { Bukas } from "./Bukas";
import { Natira } from "./Natira";
import { Palengke } from "./Palengke";
import { Setup, setupKey } from "./Setup";
import { TagBars } from "./TagBars";
import { Ulat } from "./Ulat";

type Stall = { id: string; name: string; area: string; code: string };
type Summary = {
  id: string; name: string; icon: string; price: number; baseServings: number; soldOut: boolean; salePrice: number | null; published: boolean; paborito: boolean;
  private: { count: number; buyers: number; score: number | null; improving: boolean; tagShares: Record<string, number>; trend: (number | null)[] };
  gate: { state: "public" } | { state: "kulang"; have: number; need: number };
  kumpara: { stalls: number; score: number; tagShares: Record<string, number> } | null;
  flagged: number; pansin: number; recs: { icon: string; dir: "up" | "down"; word: string }[];
};

type Tab = "ngayon" | "natira" | "bukas" | "more";
const TABS: { id: Tab; label: string }[] = [{ id: "ngayon", label: "Ngayon" }, { id: "natira", label: "Natira" }, { id: "bukas", label: "Bukas" }, { id: "more", label: "Higit pa" }];
const DISH_ICONS: IconName[] = ["bowl", "meat", "fish", "leaf", "plate"];
const post = (url: string, body: unknown, method = "POST") =>
  fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

export function Owner() {
  const router = useRouter();
  const [stalls, setStalls] = useState<Stall[] | null>(null);
  const [dishes, setDishes] = useState<Summary[]>([]);
  const [inSetup, setInSetup] = useState<boolean | null>(null); // decided once, when the first dish list arrives
  const [msg, setMsg] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [tab, setTab] = useState<Tab>("ngayon");
  const [manageId, setManageId] = useState<string | null>(null);

  const [tick, setTick] = useState(0);
  const [bukasTick, setBukasTick] = useState(0);
  const reload = () => setTick((t) => t + 1);

  useEffect(() => {
    fetch("/api/stalls").then(async (r) => setStalls(r.ok ? (await r.json()).stalls : []));
  }, [tick]);

  const stall = stalls?.find((s) => s.id === activeId) ?? stalls?.[0];
  const stallId = stall?.id;
  useEffect(() => {
    if (!stallId) return;
    fetch(`/api/stalls/${stallId}/summary`).then(async (r) => {
      if (!r.ok) return;
      const list: Summary[] = (await r.json()).dishes;
      setDishes(list);
      setInSetup((cur) => cur ?? (list.length === 0 || localStorage.getItem(setupKey(stallId)) !== null));
    });
  }, [stallId, tick]);

  if (stalls === null) return <div className="wait" role="status"><Kapy pose="walk" size={100} anim="walk" /><p className="mute">Sandali...</p></div>;

  // A new owner, or one who left before adding any dish, is walked through Simula.
  // inSetup is set at once so the same Setup stays mounted while the stall and dishes reload (a slow network would otherwise reset the picks).
  if (!stall) return <Setup stall={null} dishes={[]} step={1} onStall={(id) => { setActiveId(id ?? null); setInSetup(true); reload(); }} onDone={reload} />;
  if (adding) {
    return (
      <div className="stack">
        <Setup stall={null} dishes={[]} step={1} onStall={(id) => { setAdding(false); setActiveId(id ?? null); setInSetup(true); setDishes([]); reload(); }} onDone={reload} />
        <button className="btn soft block" onClick={() => setAdding(false)}>Cancel</button>
      </div>
    );
  }
  if (inSetup === null) return <div className="wait" role="status"><Kapy pose="walk" size={100} anim="walk" /><p className="mute">Sandali...</p></div>;
  if (inSetup) return <Setup stall={stall} dishes={dishes} step={Math.max(2, Number(localStorage.getItem(setupKey(stall.id))) || 2)} onStall={reload} onDone={() => { setInSetup(false); reload(); }} />;

  return (
    <div className="stack">
      <div className="hero">
        <Kapy pose={dishes.some((d) => d.pansin < 0 || d.private.score !== null && d.private.score < 3.4) ? "worry" : "wave"} size={92} anim="bob" />
        <div>
          <h1>{TABS.find((t) => t.id === tab)!.label}</h1>
          <p>{stall.name} · {stall.area}</p>
        </div>
      </div>
      <div className="tabs" role="tablist" aria-label="My stall">
        {TABS.map((t) => (
          <button key={t.id} type="button" role="tab" id={`tab-${t.id}`} aria-selected={tab === t.id} aria-controls="owner-panel" onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>
      <div className="stack" id="owner-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} key={tab}>
      {tab === "ngayon" && <>
      <div className="chips" aria-label="Your stalls">
        {stalls.map((s) => (
          <button key={s.id} className="chip" aria-pressed={s.id === stall.id} onClick={() => { if (s.id === stall.id) return; setActiveId(s.id); setInSetup(null); setDishes([]); }}>{s.name}</button>
        ))}
        <button className="chip" onClick={() => setAdding(true)}><Icon name="plus" />Another stall</button>
      </div>
      {dishes.length > 0 && (
        <div className="stats">
          <div className="stat"><strong>{dishes.reduce((s, d) => s + d.private.count, 0)}</strong><span>ratings</span></div>
          <div className="stat"><strong>{dishes.filter((d) => d.gate.state === "public").length}/{dishes.length}</strong><span>dishes scored</span></div>
          <div className="stat"><strong>{dishes.reduce((s, d) => s + d.flagged, 0)}</strong><span>under review</span></div>
        </div>
      )}

      {dishes.length === 0 && <p className="mute">Add your first dish below.</p>}
      {dishes.length > 0 && dishes.every((d) => d.private.count === 0) && (
        <div className="card stack center" data-testid="waiting" style={{ alignItems: "center" }}>
          <Kapy pose="sleepy" size={110} anim="sway" />
          <strong>Naghihintay ng unang rating</strong>
          <p className="mute">Print your QR (see Higit pa) and put it where customers pay. The first rating shows up here, privately, within seconds.</p>
        </div>
      )}
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
          {d.kumpara && (
            <p className="mute" data-testid="kumpara">
              Nearby, the same dish at {d.kumpara.stalls} other stalls averages {d.kumpara.score.toFixed(1)}.
              {d.private.score !== null && <> Yours is {d.private.score >= d.kumpara.score ? "at or above" : "below"} that.</>}
            </p>
          )}
          {d.private.count > 0 && <TagBars shares={d.private.tagShares} nearby={d.kumpara?.tagShares ?? null} trend={d.private.trend} />}
          <div className="row" style={{ flexWrap: "wrap" }}>
            {d.paborito && <span className="pill r"><Icon name="heart" />Paborito</span>}
            {d.private.improving && <span className="pill g"><Icon name="trend" />Gumaganda</span>}
            {d.pansin !== 0 && <span className={`pill ${d.pansin < 0 ? "a" : "g"}`}><Icon name={d.pansin < 0 ? "alert" : "up"} />Pansin</span>}
            {d.flagged > 0 && <span className="pill r"><Icon name="alert" />{d.flagged} under review</span>}
            {d.recs.map((r) => (
              <span key={r.word} className="pill"><Icon name={iconFor(r.icon)} /><Icon name={r.dir} />{r.word}</span>
            ))}
          </div>
          <button className="btn soft" aria-expanded={manageId === d.id} onClick={() => setManageId(manageId === d.id ? null : d.id)}>{manageId === d.id ? "Close" : "Manage"}</button>
          {manageId === d.id && <div className="manage">
            <button className="btn soft" aria-pressed={d.published} onClick={async () => { await post(`/api/dishes/${d.id}`, { published: !d.published }, "PATCH"); reload(); }}>
              <Icon name={d.published ? "eye" : "eyeoff"} />{d.published ? "Public" : "Private"}
            </button>
            <button className="btn soft" aria-pressed={d.paborito} onClick={async () => {
              const r = await post(`/api/dishes/${d.id}`, { paborito: !d.paborito }, "PATCH");
              setMsg(r.ok ? "" : "You can pick up to three Paborito dishes.");
              reload();
            }}><Icon name="heart" />Paborito</button>
            <button className="btn soft" aria-pressed={d.soldOut} onClick={async () => { await post(`/api/dishes/${d.id}`, { soldOut: !d.soldOut }, "PATCH"); reload(); }}>
              <Icon name="alert" />Naubos
            </button>
            <SaleControl id={d.id} price={d.price} sale={d.salePrice} onDone={reload} />
            <DishEdit id={d.id} name={d.name} price={d.price} servings={d.baseServings} onDone={reload} />
          </div>}
        </div>
      ))}
      {msg && <p className="err" role="alert">{msg}</p>}

      </>}
      {tab === "natira" && (dishes.length > 0 ? <Natira stallId={stall.id} dishes={dishes} onSaved={() => setBukasTick((t) => t + 1)} /> : <p className="mute">Add a dish first.</p>)}
      {tab === "bukas" && dishes.length > 0 && <>
        <Bukas stallId={stall.id} refresh={bukasTick} />
        <Palengke stallId={stall.id} refresh={bukasTick} />
      </>}
      {tab === "bukas" && dishes.length === 0 && <p className="mute">Add a dish first.</p>}
      {tab === "more" && <>
        {dishes.length > 0 && <Alok stallId={stall.id} dishes={dishes} />}
        {dishes.length > 0 && <Ulat dishes={dishes} onFiled={reload} />}
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
      <button className="btn soft block" onClick={async () => { await fetch("/api/auth/signout", { method: "POST" }); router.replace("/"); router.refresh(); }}>Sign out</button>
      </>}
      </div>
    </div>
  );
}
