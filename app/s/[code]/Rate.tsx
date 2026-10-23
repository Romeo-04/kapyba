"use client";
import { useEffect, useState } from "react";
import { Kapy } from "@/src/ui/Kapy";
import { Face } from "@/src/ui/Face";
import { Icon } from "@/src/ui/Icon";
import { ICONS, type IconName } from "@/src/ui/icons";
import type { Tag, Tone } from "@/src/domain/scoring";
import { PrivacyNote } from "@/src/ui/PrivacyNote";
import { enqueue } from "@/src/offline/queue";
import { useOutbox } from "@/src/offline/useOutbox";

type Dish = { id: string; name: string; icon: string; price: number };
type Scan = { stall: { name: string; area: string }; dishes: Dish[]; scanToken: string };

const SCORE: Record<Tone, number> = { sad: 1, neutral: 3, happy: 5 };
const TAGS: { tag: Tag; icon: IconName; label: string }[] = [
  { tag: "salt", icon: "salt", label: "Maalat o matabang" },
  { tag: "plate", icon: "plate", label: "Maliit ang serving" },
  { tag: "flame", icon: "flame", label: "Malamig" },
  { tag: "coin", icon: "coin", label: "Mahal" },
];

export const iconFor = (name: string): IconName => (name in ICONS ? (name as IconName) : "bowl");

export function Rate({ code }: { code: string }) {
  const [scan, setScan] = useState<Scan | "missing" | null>(null);
  const [dish, setDish] = useState<Dish | null>(null);
  const [tone, setTone] = useState<Tone | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [key, setKey] = useState("");
  const [result, setResult] = useState<"sending" | "done" | "already" | "queued" | "error" | "expired" | null>(null);
  const outbox = useOutbox();

  useEffect(() => {
    fetch(`/api/s/${code}`)
      .then(async (r) => setScan(r.ok ? await r.json() : "missing"))
      .catch(() => setScan("missing"));
  }, [code]);

  function reset() {
    setDish(null);
    setTone(null);
    setTags([]);
    setResult(null);
  }

  async function send(t: Tone) {
    if (!scan || scan === "missing" || !dish) return;
    // A page kept open (or cached offline) past the 12-hour scan window would be refused and the tap lost, so say so now.
    if (Number(scan.scanToken.split(".")[0]) < Date.now()) { setResult("expired"); return; }
    setResult("sending");
    // The same key is reused on a retry, so a slow network never counts a rating twice.
    const k = key || crypto.randomUUID();
    setKey(k);
    const body = { code, scanToken: scan.scanToken, dishId: dish.id, score: SCORE[t], tags: t === "happy" ? [] : tags, idempotencyKey: k };
    try {
      const res = await fetch("/api/ratings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      setResult(res.status === 409 ? "already" : res.ok ? "done" : "error");
      if (res.ok || res.status === 409) setKey("");
    } catch {
      // No signal: keep the tap and send it when the phone is back online.
      enqueue(localStorage, { id: k, url: "/api/ratings", body });
      outbox.refresh();
      setKey("");
      setResult("queued");
    }
  }

  if (scan === null) return <div className="wait" role="status"><Kapy pose="walk" size={110} anim="walk" /><p className="mute">Sandali...</p></div>;
  if (scan === "missing") return <p className="err center" style={{ paddingTop: 48 }} role="alert">Hindi mahanap ang stall na ito.</p>;

  if (result === "expired") {
    return (
      <div className="stack center" style={{ paddingTop: 64, alignItems: "center" }}>
        <Kapy pose="sleepy" size={130} anim="sway" />
        <h1>Lumipas na ang scan</h1>
        <p className="mute" role="alert">This page is too old to send a rating. Scan the QR at the stall again.</p>
      </div>
    );
  }

  if (result === "done" || result === "already" || result === "queued") {
    return (
      <div className="stack center" style={{ paddingTop: 64, alignItems: "center" }} role="status">
        <div className="stage">{result === "already" ? <Kapy pose="think" size={140} anim="pop" /> : <><Kapy pose="cheer" size={150} anim="pop" />{["h1", "h2", "h3", "h4"].map((h) => <svg key={h} className={`heart ${h}`} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.3-9.2C1.5 8.4 3.4 5 6.6 5c2 0 3.5 1.1 5.4 3.2C13.9 6.1 15.4 5 17.4 5c3.2 0 5.1 3.400 3.900 6.800C19.500 16.400 12 21 12 21z" /></svg>)}</>}</div>
        <h1>{result === "done" ? "Salamat!" : result === "queued" ? "Naka-save ang rating mo" : "Nai-rate mo na ito ngayong araw"}</h1>
        <p className="mute">
          {result === "done" ? "Your rating helps the owner cook better." : result === "queued" ? "No signal right now. We will send it when you are back online." : "One rating per dish per day. Try another dish or come back tomorrow."}
        </p>
        <button className="btn block" onClick={reset}>Rate another dish</button>
      </div>
    );
  }

  if (!dish) {
    return (
      <div className="stack">
        <div>
          <h1>{scan.stall.name}</h1>
          <p className="mute">{scan.stall.area}</p>
        </div>
        <PrivacyNote />
        <h2>Alin ang kinain mo?</h2>
        {scan.dishes.length === 0 && <p className="mute">This stall has no dishes yet.</p>}
        {scan.dishes.map((d) => (
          <button key={d.id} className="dish" onClick={() => setDish(d)}>
            <span className="ico"><Icon name={iconFor(d.icon)} className="lg" /></span>
            <span className="grow"><strong>{d.name}</strong></span>
            <span className="price">₱{d.price}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="stack">
      <button className="btn soft round" onClick={reset} aria-label="Balik"><Icon name="back" /></button>
      <h1>{dish.name}</h1>
      <div className="faces" role="group" aria-label="Rating">
        {(["sad", "neutral", "happy"] as Tone[]).map((t) => (
          <button
            key={t}
            className="face-btn"
            aria-pressed={tone === t}
            aria-label={t === "sad" ? "Hindi masarap" : t === "neutral" ? "Okay lang" : "Masarap"}
            onClick={() => { setTone(t); if (t === "happy") send(t); }}
          >
            <Face tone={t} size={64} />
          </button>
        ))}
      </div>
      {tone && tone !== "happy" && (
        <>
          <p className="mute">Ano ang problema? (optional)</p>
          <div className="tags">
            {TAGS.map((t) => (
              <button
                key={t.tag}
                className="tag"
                aria-pressed={tags.includes(t.tag)}
                aria-label={t.label}
                onClick={() => setTags((cur) => (cur.includes(t.tag) ? cur.filter((x) => x !== t.tag) : [...cur, t.tag]))}
              >
                <Icon name={t.icon} className="lg" />
              </button>
            ))}
          </div>
          <button className="btn block" disabled={result === "sending"} onClick={() => send(tone)}><Icon name="check" /> Send</button>
        </>
      )}
      {result === "sending" && <p className="mute center" role="status">Sandali...</p>}
      {result === "error" && <p className="err center" role="alert">Hindi na-send. Check your signal and try again.</p>}
    </div>
  );
}
