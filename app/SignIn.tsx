"use client";
import { useState } from "react";

export function SignIn() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    const res = await fetch("/api/auth/request", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    setState(res.ok ? "sent" : "error");
  }

  if (state === "sent") {
    return (
      <div className="card stack" role="status">
        <h2>Check your email</h2>
        <p className="mute">We sent a sign-in link to {email}. It works once and expires in 15 minutes.</p>
      </div>
    );
  }
  return (
    <form className="card stack" onSubmit={submit}>
      <div>
        <label htmlFor="email">Owner sign-in</label>
        <input id="email" type="email" autoComplete="email" inputMode="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
      </div>
      {state === "error" && <p className="err" role="alert">That email did not work. Try again.</p>}
      <button className="btn block" disabled={state === "sending"}>Send link</button>
    </form>
  );
}
