"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Kapy } from "@/src/ui/Kapy";
import { Icon } from "@/src/ui/Icon";
import type { IconName } from "@/src/ui/icons";
import { MAINS } from "@/src/domain/mains";
import { ALLERGENS } from "@/src/domain/allergens";
import { setPref, toggleAvoid, toggleTaste, useAvoid, usePref, useTastes } from "./tastes";

type Step = "role" | "eat" | "budget" | "avoid" | "where" | "done" | "owner";
const BUYER: Step[] = ["eat", "budget", "avoid", "where", "done"];
const QUICK = ["50", "75", "100"];
const HOW: { icon: IconName; head: string; body: string }[] = [
  { icon: "board", head: "Browse the board", body: "Dishes are ranked by how worth their price they are." },
  { icon: "tag", head: "Spot the deals", body: "Tap Deals for dishes on sale or with limited spots." },
  { icon: "qr", head: "Ate something? Rate it", body: "Scan the stall's QR code for a two-tap rating. No account." },
];
const OWNER: { icon: IconName; head: string; body: string }[] = [
  { icon: "user", head: "Sign in with your email", body: "No password. We send you a link." },
  { icon: "plate", head: "Add the dishes you cook", body: "Name, price and a photo if you have one." },
  { icon: "qr", head: "Print your QR code", body: "Put it where customers pay. Ratings come back to you, privately." },
];

/**
 * The first screen on a new phone: owner or customer, then a few questions that shape the board. Answers stay on the phone.
 * Never shown on the rating page; the Board renders it. `start="eat"` reopens the customer questions from My preferences.
 */
export function Welcome({ start, onClose }: { start?: "eat"; onClose?: () => void }) {
  const role = usePref("kb_role", "?");
  const [step, setStep] = useState<Step>(start ?? "role");
  const head = useRef<HTMLHeadingElement>(null);
  useEffect(() => { head.current?.focus(); }, [step]);

  if (!start && role !== "") return null; // "?" on the server and first render, a saved role after that

  const finish = (as: "buyer" | "owner") => { setPref("kb_role", as); onClose?.(); };
  const i = BUYER.indexOf(step);
  const next = () => setStep(BUYER[i + 1]);
  const back = () => setStep(step === "owner" || i === 0 ? "role" : BUYER[i - 1]);

  return createPortal(
    <div className="welcome" role="dialog" aria-modal="true" aria-labelledby="wl-h" data-testid="welcome" onKeyDown={(e) => { if (e.key === "Escape") finish("buyer"); }}>
      <div className="welcome-in">
        <div className="row between">
          {step !== "role" && !(start && i === 0) ? <button type="button" className="btn soft round" aria-label="Back" onClick={back}><Icon name="back" /></button> : <span />}
          {i >= 0 && <span className="mute small">Step {i + 1} of {BUYER.length}</span>}
          {step === "done" ? <span className="wl-skip" aria-hidden /> : <button type="button" className="wl-skip" onClick={() => finish(step === "owner" ? "owner" : "buyer")}>Skip</button>}
        </div>

        {step === "role" && <Role head={head} pick={(r) => setStep(r === "owner" ? "owner" : "eat")} />}
        {step === "eat" && <Eat head={head} />}
        {step === "budget" && <Budget head={head} />}
        {step === "avoid" && <Avoid head={head} />}
        {step === "where" && <Where head={head} />}
        {step === "done" && <Done head={head} />}
        {step === "owner" && <Owner head={head} />}

        <div className="welcome-foot">
          {step === "owner" && <>
            <Link className="btn block" href="/owner" onClick={() => finish("owner")}>Set up my karinderya</Link>
            <button type="button" className="btn soft block" onClick={() => setStep("eat")}>I am here to eat too</button>
          </>}
          {i >= 0 && step !== "done" && <button type="button" className="btn block" onClick={next}>Next</button>}
          {step === "done" && <button type="button" className="btn block" onClick={() => finish("buyer")}>Show my ulam</button>}
        </div>
      </div>
    </div>,
    document.body,
  );
}

type H = { head: React.RefObject<HTMLHeadingElement | null> };
const Title = ({ head, children, sub }: H & { children: React.ReactNode; sub: string }) => (
  <div className="stack" style={{ gap: 4 }}>
    <h2 id="wl-h" ref={head} tabIndex={-1}>{children}</h2>
    <p className="mute">{sub}</p>
  </div>
);

function Role({ head, pick }: H & { pick: (r: "buyer" | "owner") => void }) {
  return (
    <>
      <Kapy pose="wave" size={120} anim="bob" className="wl-kapy" />
      <Title head={head} sub="Pick one so we show you the right things. You can switch any time.">Welcome to KapyBa. Which one is you?</Title>
      <div className="wl-roles">
        <button type="button" className="wl-role" onClick={() => pick("buyer")}>
          <Kapy pose="eat" size={72} anim="none" />
          <span><strong>I eat at karinderyas</strong><span className="mute">Find ulam worth your money near you.</span></span>
        </button>
        <button type="button" className="wl-role" onClick={() => pick("owner")}>
          <Kapy pose="cook" size={72} anim="none" />
          <span><strong>I run a karinderya</strong><span className="mute">See what customers think of each dish, privately.</span></span>
        </button>
      </div>
    </>
  );
}

function Eat({ head }: H) {
  const tastes = useTastes();
  return (
    <>
      <Title head={head} sub="Pick any. Those dishes come first on your board.">What do you usually eat?</Title>
      <div className="chips-wrap" role="group" aria-label="Foods you like">
        {MAINS.map((m) => <button key={m.id} type="button" className="chip" aria-pressed={tastes.includes(m.id)} onClick={() => toggleTaste(m.id)}>{m.label}</button>)}
      </div>
    </>
  );
}

function Budget({ head }: H) {
  const budget = usePref("kb_budget");
  return (
    <>
      <Title head={head} sub="Your board starts at this price. Leave it empty for any price. You can change it on the board.">How much do you usually spend on one ulam?</Title>
      <label className="wl-money">
        <span aria-hidden="true">₱</span>
        <input className="wl-input" type="number" inputMode="numeric" min={1} max={1000} placeholder="Like 75" aria-label="Most you spend on one ulam, in pesos" value={budget}
          onChange={(e) => { const n = Math.min(1000, Math.max(0, Math.round(Number(e.target.value) || 0))); setPref("kb_budget", n ? String(n) : ""); }} />
      </label>
      <div className="chips-wrap" role="group" aria-label="Quick amounts">
        {QUICK.map((v) => <button key={v} type="button" className="chip" aria-pressed={budget === v} onClick={() => setPref("kb_budget", v)}>₱{v}</button>)}
        <button type="button" className="chip" aria-pressed={budget === ""} onClick={() => setPref("kb_budget", "")}>Any price</button>
      </div>
    </>
  );
}

function Avoid({ head }: H) {
  const avoid = useAvoid();
  return (
    <>
      <Title head={head} sub="Dishes the stall says contain these are listed last and marked. Always ask the stall if you have an allergy.">Anything you avoid?</Title>
      <div className="chips-wrap" role="group" aria-label="Foods you avoid">
        {ALLERGENS.map((a) => <button key={a.id} type="button" className="chip" aria-pressed={avoid.includes(a.id)} onClick={() => toggleAvoid(a.id)}>{a.label}</button>)}
      </div>
    </>
  );
}

function Where({ head }: H) {
  const near = usePref("kb_near");
  const area = usePref("kb_area");
  const [msg, setMsg] = useState("");
  const ask = () => {
    if (!navigator.geolocation) { setMsg("This phone cannot share its location. Type your area instead."); return; }
    navigator.geolocation.getCurrentPosition(
      () => { setPref("kb_near", "1"); setMsg(""); },
      () => setMsg("Location is off. You can type your area or school instead."),
      { timeout: 10000 },
    );
  };
  return (
    <>
      <Title head={head} sub="We sort the board by distance. Your position is used once each visit and never saved.">Where do you usually eat?</Title>
      <button type="button" className="btn soft block" aria-pressed={near === "1"} onClick={() => (near ? setPref("kb_near", "") : ask())}>
        <Icon name="pin" />{near ? "Nearest first is on" : "Use my location"}
      </button>
      {msg && <p className="err" role="status">{msg}</p>}
      <label className="stack" style={{ gap: 6 }}>
        <span className="mute small">Or type an area or school</span>
        <input className="wl-input" value={area} onChange={(e) => setPref("kb_area", e.target.value.slice(0, 80))} placeholder="Like UST or Sampaloc" maxLength={80} />
      </label>
    </>
  );
}

function Done({ head }: H) {
  return (
    <>
      <Kapy pose="cheer" size={120} anim="bob" className="wl-kapy" />
      <Title head={head} sub="Change these any time from My preferences on the board.">Your board is ready</Title>
      <ol className="intro-steps">
        {HOW.map((s) => (
          <li key={s.head}><span className="intro-ic" aria-hidden><Icon name={s.icon} /></span><div><strong>{s.head}</strong><p className="mute">{s.body}</p></div></li>
        ))}
      </ol>
    </>
  );
}

function Owner({ head }: H) {
  return (
    <>
      <Kapy pose="cook" size={120} anim="bob" className="wl-kapy" />
      <Title head={head} sub="Free to start. Ratings are anonymous; you see what was said, not who said it.">Set up your karinderya in three steps</Title>
      <ol className="intro-steps">
        {OWNER.map((s) => (
          <li key={s.head}><span className="intro-ic" aria-hidden><Icon name={s.icon} /></span><div><strong>{s.head}</strong><p className="mute">{s.body}</p></div></li>
        ))}
      </ol>
    </>
  );
}
