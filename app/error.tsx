"use client";
import { Kapy } from "@/src/ui/Kapy";

export default function ErrorPage({ unstable_retry }: { error: Error; unstable_retry: () => void }) {
  return (
    <main id="main" className="wrap stack center" style={{ alignItems: "center", paddingTop: 48 }}>
      <Kapy pose="worry" size={170} anim="sway" />
      <h1>Naku, may nagkamali</h1>
      <p className="mute">Something went wrong on our side. Try again.</p>
      <button className="btn" onClick={() => unstable_retry()}>Subukan ulit</button>
    </main>
  );
}
