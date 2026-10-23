"use client";
import { useEffect, useState } from "react";
import { Kapy } from "@/src/ui/Kapy";
import { Face } from "@/src/ui/Face";
import { ago } from "@/src/ui/ago";
import { tone } from "@/src/domain/scoring";
import { ROWS } from "../o/ReviewsSheet";
import { Icon } from "@/src/ui/Icon";
import type { Summary } from "../o/Owner";

type Stall = { id: string; name: string };
type Dish = Summary;
type Post = { text: string; score: number; at: string; dish: string; stallId: string; stallName: string; area: string };

// One concrete thing to try for each complaint, in plain words.
const TRY: Record<string, string> = {
  salt: "Taste the pot just before serving and adjust the seasoning.",
  plate: "Check the portion against the price, or add a small side.",
  flame: "Keep dishes lidded and hot until they are served.",
  coin: "Review the price, or run a small deal to win people back.",
  leaf: "Check freshness at the palengke and cook the older stock first.",
  alert: "Watch the cooking time; take it off the heat a little sooner.",
  chili: "Cook it milder and put the spice on the side.",
  clock: "Prep earlier before the rush so plates go out faster.",
};

/** Customer comments and taste feedback turned into a short to-do list for the owner. */
export function Community() {
  const [view, setView] = useState<"load" | "out" | "ok">("load");
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [stall, setStall] = useState<Stall | null>(null);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [now, setNow] = useState(0); // set after load: reading the clock during prerender is not allowed

  useEffect(() => {
    let live = true;
    (async () => {
      const f = await fetch("/api/board/community");
      if (live && f.ok) { setNow(Date.now()); setPosts((await f.json()).posts); }
      const r = await fetch("/api/stalls");
      if (!r.ok) { if (live) setView("out"); return; }
      const first: Stall | undefined = (await r.json()).stalls?.[0];
      if (!first) { if (live) setView("out"); return; }
      const s = await fetch(`/api/stalls/${first.id}/summary`);
      if (!live) return;
      if (!s.ok) { setView("out"); return; }
      setNow(Date.now());
      setStall(first);
      setDishes((await s.json()).dishes);
      setView("ok");
    })();
    return () => { live = false; };
  }, []);

  const feed = (
    <section className="stack" data-testid="community-feed">
      <h2 className="sec">Recommended by customers</h2>
      {posts === null ? <p className="mute">Sandali...</p> : posts.length === 0 ? (
        <div className="card stack" style={{ alignItems: "center" }}>
          <Kapy pose="sleepy" size={96} anim="sway" />
          <strong>No recommendations yet</strong>
          <p className="mute">Rate a dish and leave a short note. Happy ones show here with the place.</p>
        </div>
      ) : posts.map((c, i) => (
        <article key={i} className="review">
          <div className="row between"><span className="row" style={{ gap: 8 }}><Face tone={tone(c.score)} size={28} /><strong>{c.dish}</strong></span><span className="mute small">{ago(c.at, now)}</span></div>
          <p>&ldquo;{c.text}&rdquo;</p>
          <a className="row mute small" style={{ gap: 6 }} href={`/ulam/stall/${c.stallId}`}><Icon name="pin" />{c.stallName} · {c.area}</a>
        </article>
      ))}
    </section>
  );

  if (view === "load" && posts === null) return <div className="wait" role="status"><Kapy pose="walk" size={100} anim="walk" /><p className="mute">Sandali...</p></div>;
  const hero = <div className="hero"><Kapy pose="think" size={104} anim="bob" /><div><h1>Community</h1><p>What customers recommend, and where to find it.</p></div></div>;
  if (view !== "ok") {
    return (
      <div className="stack">
        {hero}
        {feed}
        {view === "out" && <div className="card stack"><strong>Own a karinderya?</strong><p className="mute">Sign in to also see private feedback from your own customers, with things to fix.</p><a className="btn block" href="/owner">Owner sign-in</a></div>}
      </div>
    );
  }

  const total = dishes.reduce((n, d) => n + d.private.count, 0);
  const comments = dishes.flatMap((d) => d.comments.map((c) => ({ ...c, dish: d.name }))).sort((a, b) => b.at.localeCompare(a.at));
  const praise = comments.filter((c) => c.score >= 4).slice(0, 5);
  const concerns = comments.filter((c) => c.score <= 2).slice(0, 5);
  const share = (get: (d: Dish) => number | undefined) => {
    const w = dishes.filter((d) => d.private.count > 0);
    const n = w.reduce((s, d) => s + d.private.count, 0);
    return n ? w.reduce((s, d) => s + (get(d) ?? 0) * d.private.count, 0) / n : 0;
  };
  const issues = ROWS.map((r) => ({ ...r, pct: Math.round(share((d) => d.private.tagShares[r.tag]) * 100) }))
    .filter((r) => r.pct > 0).sort((a, b) => b.pct - a.pct).slice(0, 3);
  const nearby = dishes.filter((d) => d.kumpara);
  const nearAvg = (tag: string) => (nearby.length ? Math.round((nearby.reduce((s, d) => s + (d.kumpara!.tagShares[tag] ?? 0), 0) / nearby.length) * 100) : null);
  const watch = dishes.filter((d) => d.private.score !== null && d.private.score < 3.4 && d.private.count >= 3);

  return (
    <div className="stack">
      {hero}
      {feed}
      <h2 className="sec">Only you can see this: {stall?.name}</h2>

      {total === 0 && (
        <div className="card stack" style={{ alignItems: "center" }}>
          <Kapy pose="sleepy" size={110} anim="sway" />
          <strong>No customer feedback yet</strong>
          <p className="mute">Print your QR and put it where customers pay. Comments and taste ratings show up here, privately.</p>
        </div>
      )}

      {issues.length > 0 && (
        <section className="panel" data-testid="fix-first">
          <h2 className="sec">Fix first</h2>
          {issues.map((r) => {
            const peer = nearAvg(r.tag);
            return (
              <div key={r.tag} className="stack" style={{ gap: 2 }}>
                <div className="row"><strong className="grow">{r.label}</strong><strong>{r.pct}%</strong></div>
                {peer !== null && r.pct > peer + 5 && <span className="mute small">Higher than nearby karinderyas ({peer}%)</span>}
                <p className="mute">{TRY[r.tag]}</p>
              </div>
            );
          })}
        </section>
      )}

      {watch.length > 0 && (
        <section className="panel">
          <h2 className="sec">Dishes to look at</h2>
          {watch.map((d) => <div key={d.id} className="row"><Face tone={tone(d.private.score!)} size={28} /><strong className="grow">{d.name}</strong><span className="mute">{d.private.score!.toFixed(1)}/5.0 · {d.private.count} ratings</span></div>)}
        </section>
      )}

      {concerns.length > 0 && (
        <section className="panel" data-testid="concerns">
          <h2 className="sec">What customers did not like</h2>
          {concerns.map((c, i) => (
            <div key={i} className="review"><div className="row between"><span className="row" style={{ gap: 8 }}><Face tone={tone(c.score)} size={28} /><strong>{c.dish}</strong></span><span className="mute small">{ago(c.at, now)}</span></div><p>&ldquo;{c.text}&rdquo;</p></div>
          ))}
        </section>
      )}

      {praise.length > 0 && (
        <section className="panel" data-testid="praise">
          <h2 className="sec">Keep doing this</h2>
          {praise.map((c, i) => (
            <div key={i} className="review"><div className="row between"><span className="row" style={{ gap: 8 }}><Face tone={tone(c.score)} size={28} /><strong>{c.dish}</strong></span><span className="mute small">{ago(c.at, now)}</span></div><p>&ldquo;{c.text}&rdquo;</p></div>
          ))}
        </section>
      )}
      <p className="mute small">Comments are anonymous. The public feed only shows clean 4 and 5 scores on a dish with enough ratings. Everything under your name above stays private.</p>
    </div>
  );
}
