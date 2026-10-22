"use client";
import { useEffect, useState } from "react";
import { Face } from "@/src/ui/Face";
import { Icon } from "@/src/ui/Icon";
import { ICONS, type IconName } from "@/src/ui/icons";
import type { Tag, Tone } from "@/src/domain/scoring";

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
  const [result, setResult] = useState<"sending" | "done" | "already" | "error" | null>(null);

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
    setResult("sending");
    // The same key is reused on a retry, so a slow network never counts a rating twice.
    const k = key || crypto.randomUUID();
    setKey(k);
    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, scanToken: scan.scanToken, dishId: dish.id, score: SCORE[t], tags: t === "happy" ? [] : tags, idempotencyKey: k }),
      });
      setResult(res.status === 409 ? "already" : res.ok ? "done" : "error");
      if (res.ok || res.status === 409) setKey("");
    } catch {
      setResult("error");
    }
  }

  if (scan === null) return <p className="mute center" style={{ paddingTop: 48 }}>Sandali...</p>;
  if (scan === "missing") return <p className="err center" style={{ paddingTop: 48 }} role="alert">Hindi mahanap ang stall na ito.</p>;

  if (result === "done" || result === "already") {
    return (
      <div className="stack center" style={{ paddingTop: 64, alignItems: "center" }} role="status">
        <Face tone={result === "done" ? "happy" : "neutral"} size={96} />
        <h1>{result === "done" ? "Salamat!" : "Nai-rate mo na ito ngayong araw"}</h1>
        <p className="mute">{result === "done" ? "Your rating helps the owner cook better." : "One rating per dish per day. Try another dish or come back tomorrow."}</p>
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
