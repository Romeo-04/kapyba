"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Kapy } from "@/src/ui/Kapy";
import { Icon } from "@/src/ui/Icon";
import type { IconName } from "@/src/ui/icons";
import { photoUrl } from "@/src/ui/PhotoPick";
import { iconFor } from "../s/[code]/Rate";
import type { Notice } from "@/src/services/notifications";
import { Alok } from "./Alok";
import { AllergenPick } from "./AllergenPick";
import { Balita } from "./Balita";
import { Bukas } from "./Bukas";
import { Profile } from "./Profile";
import { Palengke } from "./Palengke";
import { MAINS } from "@/src/domain/mains";
import { Setup, setupKey } from "./Setup";
import { ManageSheet } from "./ManageSheet";
import { ReviewsSheet } from "./ReviewsSheet";

type Stall = { id: string; name: string; area: string; code: string; about: string | null; hours: string | null; lat: string | null };
export type Summary = {
  id: string; name: string; icon: string; price: number; baseServings: number; soldOut: boolean; salePrice: number | null; published: boolean; paborito: boolean; imageV: number | null; main: string | null; ingredients: string | null; allergens: string[]; comments: { score: number; text: string; at: string }[];
  private: { count: number; buyers: number; score: number | null; improving: boolean; tagShares: Record<string, number>; trend: (number | null)[] };
  gate: { state: "public" } | { state: "kulang"; have: number; need: number };
  kumpara: { stalls: number; score: number; tagShares: Record<string, number> } | null;
  flagged: number; pansin: number; recs: { icon: string; dir: "up" | "down"; word: string }[];
};

type Tab = "ngayon" | "bukas" | "more" | "balita"; // Balita is opened from the bell, not the tab bar
const TABS: { id: Tab; label: string }[] = [{ id: "ngayon", label: "Now" }, { id: "bukas", label: "Tomorrow" }, { id: "more", label: "Others" }];
const TITLE: Record<Tab, string> = { ngayon: "Now", bukas: "Tomorrow", more: "Others", balita: "Balita" };
const POLL_MS = 20_000;
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
  const [reviewId, setReviewId] = useState<string | null>(null);

  const [tick, setTick] = useState(0);
  const [bukasTick, setBukasTick] = useState(0);
  const reload = () => setTick((t) => t + 1);

  // Balita: a quiet poll while the page is open. A new rating raises the bell, refreshes the numbers and, if allowed, pings the phone.
  const [notes, setNotes] = useState<{ unread: number; items: Notice[] }>({ unread: 0, items: [] });
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  const [ring, setRing] = useState(0);
  const [canAlert, setCanAlert] = useState(false);
  const [clock, setClock] = useState(0);
  const topSeen = useRef<string | null | undefined>(undefined);

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

  const ready = stalls !== null && stalls.length > 0;
  useEffect(() => {
    if (!ready) return;
    const check = async () => {
      const r = await fetch("/api/notifications");
      if (!r.ok) return;
      const next: { unread: number; items: Notice[] } = await r.json();
      const top = next.items[0]?.id ?? null;
      if (topSeen.current !== undefined && top !== topSeen.current && next.unread > 0) {
        setRing((n) => n + 1);
        reload();
        if (typeof Notification !== "undefined" && Notification.permission === "granted" && document.hidden) {
          new Notification(`${next.items[0].dish} was rated`, { body: "Open KapyBa to see how it went.", tag: "kb-rated" });
        }
      }
      topSeen.current = top;
      setNotes(next);
      setClock(Date.now());
      setCanAlert(typeof Notification !== "undefined" && Notification.permission === "default");
    };
    void check();
    const id = setInterval(check, POLL_MS);
    return () => clearInterval(id);
  }, [ready]);

  const openBalita = () => {
    if (tab === "balita") { setTab("ngayon"); return; }
    setFresh(new Set(notes.items.slice(0, notes.unread).map((n) => n.id)));
    setTab("balita");
    if (notes.unread > 0) {
      setNotes({ ...notes, unread: 0 });
      void fetch("/api/notifications/seen", { method: "POST" });
    }
  };

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
          <h1>{tab === "more" ? stall.name : TITLE[tab]}</h1>
          <p>{tab === "more" ? stall.area : `${stall.name} · ${stall.area}`}</p>
        </div>
        <button type="button" key={ring} className={`bell${ring ? " ring" : ""}`} aria-pressed={tab === "balita"} aria-label={notes.unread > 0 ? `Balita, ${notes.unread} new` : "Balita"} onClick={openBalita}>
          <Icon name="bell" />{notes.unread > 0 && <span className="badge" data-testid="bell-count">{notes.unread > 9 ? "9+" : notes.unread}</span>}
        </button>
      </div>
      <div className="tabs" role="tablist" aria-label="My stall">
        {TABS.map((t) => (
          <button key={t.id} type="button" role="tab" id={`tab-${t.id}`} aria-selected={tab === t.id} aria-controls="owner-panel" onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>
      <div className="stack" id="owner-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} key={tab}>
      {tab === "ngayon" && <>
      {dishes.length > 0 && (
        <div className="stats two">
          <div className="stat"><strong>{dishes.reduce((s, d) => s + d.private.count, 0)}</strong><span>ratings</span></div>
          <div className="stat"><strong>{dishes.filter((d) => d.gate.state === "public").length}/{dishes.length}</strong><span>dishes scored</span></div>
        </div>
      )}

      {dishes.length === 0 && <p className="mute">Add your first dish below.</p>}
      {dishes.length > 0 && dishes.every((d) => d.private.count === 0) && (
        <div className="card stack center" data-testid="waiting" style={{ alignItems: "center" }}>
          <Kapy pose="sleepy" size={110} anim="sway" />
          <strong>Waiting for the first rating</strong>
          <p className="mute">Print your QR (see Others) and put it where customers pay. The first rating shows up here, privately, within seconds.</p>
        </div>
      )}
      {dishes.map((d) => (
        <div key={d.id} className="card dishcard">
          {d.imageV !== null
            // eslint-disable-next-line @next/next/no-img-element
            ? <img className="thumb dish-photo" src={photoUrl(d.id, d.imageV)} alt={d.name} width={400} height={250} />
            : <div className="dish-photo blank"><Icon name={iconFor(d.icon)} className="lg" /></div>}
          <div className="dish-body stack">
            <div className="dish-head">
              <div className="grow">
                <strong>{d.name}</strong>
                <span className="price">₱{d.price}</span>
              </div>
              <div className="score" aria-label={d.private.score === null ? "No score yet" : `Score ${d.private.score.toFixed(1)} out of 5`}>
                <strong>{d.private.score === null ? "–" : d.private.score.toFixed(1)}</strong><span>/5.0</span>
              </div>
            </div>
            <p className="mute dish-stats">{d.private.count} {d.private.count === 1 ? "rating" : "ratings"} · {d.private.buyers} {d.private.buyers === 1 ? "customer" : "customers"}</p>
            {d.gate.state === "kulang" && d.private.count > 0 && <div className="mute small">{Math.min(d.gate.have, d.gate.need)} of {d.gate.need} ratings to go public</div>}
            {d.kumpara && (
              <p className="mute" data-testid="kumpara">
                Nearby, the same dish at {d.kumpara.stalls} other stalls averages {d.kumpara.score.toFixed(1)}.
                {d.private.score !== null && <> Yours is {d.private.score >= d.kumpara.score ? "at or above" : "below"} that.</>}
              </p>
            )}
            <div className="row" style={{ flexWrap: "wrap" }}>
              {d.paborito && <span className="pill r"><Icon name="heart" />Favorite</span>}
              {d.private.improving && <span className="pill g"><Icon name="trend" />Improving</span>}
              {d.pansin !== 0 && <span className={`pill ${d.pansin < 0 ? "a" : "g"}`}><Icon name={d.pansin < 0 ? "alert" : "up"} />{d.pansin < 0 ? "Needs attention" : "Standout"}</span>}
              {d.flagged > 0 && <span className="pill r"><Icon name="alert" />{d.flagged} under review</span>}
              {d.recs.map((r) => (
                <span key={r.word} className="pill"><Icon name={iconFor(r.icon)} /><Icon name={r.dir} />{r.word}</span>
              ))}
            </div>
            <div className="row dish-actions">
              <button className="btn soft grow" aria-haspopup="dialog" onClick={() => setManageId(d.id)}>Manage</button>
              {d.private.count > 0 && <button className="btn soft rev grow" aria-haspopup="dialog" onClick={() => setReviewId(d.id)}>View Reviews</button>}
            </div>
          </div>
        </div>
      ))}
      {msg && <p className="err" role="alert">{msg}</p>}
      {manageId && dishes.find((x) => x.id === manageId) && (
        <ManageSheet d={dishes.find((x) => x.id === manageId)!} stallId={stall.id} onClose={() => setManageId(null)} onChange={reload}
          onLeftover={() => setBukasTick((t) => t + 1)} onReviews={() => { setReviewId(manageId); setManageId(null); }} />
      )}
      {reviewId && dishes.length > 0 && <ReviewsSheet dishes={dishes} id={reviewId} onSwitch={setReviewId} onClose={() => setReviewId(null)} onFiled={reload} />}

      </>}
      {tab === "balita" && <Balita items={notes.items} fresh={fresh} now={clock} canAlert={canAlert} onAlert={async () => { await Notification.requestPermission(); setCanAlert(Notification.permission === "default"); }} />}
      {tab === "bukas" && dishes.length > 0 && <>
        <Bukas stallId={stall.id} refresh={bukasTick} />
        <Palengke stallId={stall.id} refresh={bukasTick} />
      </>}
      {tab === "bukas" && dishes.length === 0 && <p className="mute">Add a dish first.</p>}
      {tab === "more" && <>
        <Profile
          stall={stall} stalls={stalls}
          stats={{ dishes: dishes.length, ratings: dishes.reduce((n, d) => n + d.private.count, 0), avg: (() => { const n = dishes.reduce((c, d) => c + (d.private.score === null ? 0 : d.private.count), 0); return n ? dishes.reduce((s, d) => s + (d.private.score ?? 0) * (d.private.score === null ? 0 : d.private.count), 0) / n : null; })() }}
          onSwitch={(id) => { setActiveId(id); setInSetup(null); setDishes([]); }}
          onAdd={() => setAdding(true)}
          onSaved={() => setTick((t) => t + 1)}
        />
        {dishes.length > 0 && <Alok stallId={stall.id} dishes={dishes} />}
      <form className="card stack" onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const f = new FormData(form);
        const r = await post(`/api/stalls/${stall.id}/dishes`, { name: f.get("name"), icon: f.get("icon"), price: Number(f.get("price")), baseServings: Number(f.get("servings") || 0), main: f.get("main") || undefined, ingredients: f.get("ingredients") || undefined, allergens: f.getAll("allergens") });
        if (r.ok) { form.reset(); setMsg(""); reload(); } else setMsg("Check the dish name and price.");
      }}>
        <h2>Add a dish</h2>
        <div><label htmlFor="dname">Dish</label><input id="dname" name="name" required maxLength={80} placeholder="Adobo" /></div>
        <div className="row">
          <div className="grow"><label htmlFor="dprice">Price (₱)</label><input id="dprice" name="price" type="number" inputMode="numeric" min={1} max={10000} required /></div>
          <div className="grow"><label htmlFor="dserv">Servings a day</label><input id="dserv" name="servings" type="number" inputMode="numeric" min={0} max={1000} /></div>
        </div>
        <div><label htmlFor="dmain">Main ingredient (optional)</label>
          <select id="dmain" name="main"><option value="">None</option>{MAINS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}</select>
        </div>
        <div><label htmlFor="dingr">Ingredients (optional)</label><input id="dingr" name="ingredients" maxLength={200} placeholder="Chicken, soy sauce, vinegar, garlic" /></div>
        <AllergenPick prefix="dall" />
        <div><label htmlFor="dicon">Icon</label>
          <select id="dicon" name="icon">{DISH_ICONS.map((i) => <option key={i} value={i}>{i}</option>)}</select>
        </div>
        <button className="btn block"><Icon name="plus" />Add</button>
      </form>

      <div id="stall-qr" className="card stack center" style={{ alignItems: "center", scrollMarginTop: 16 }}>
        <h2>Your QR</h2>
        <p className="mute">Print this and put it at the stall. Customers scan it to rate.</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/api/stalls/${stall.id}/qr`} alt="Stall QR code" width={220} height={220} />
        <a className="btn soft" href={`/api/stalls/${stall.id}/qr`} download={`kapyba-${stall.code}.svg`}>Download</a>
      </div>
      <button className="btn soft block" onClick={async () => { await fetch("/api/auth/signout", { method: "POST" }); router.replace("/owner"); router.refresh(); }}>Sign out</button>
      </>}
      </div>
    </div>
  );
}
