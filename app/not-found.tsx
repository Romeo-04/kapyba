import Link from "next/link";
import { Kapy } from "@/src/ui/Kapy";

export default function NotFound() {
  return (
    <main id="main" className="wrap stack center" style={{ alignItems: "center", paddingTop: 48 }}>
      <Kapy pose="think" size={170} anim="sway" />
      <h1>Naligaw si Kapy</h1>
      <p className="mute">We could not find that page.</p>
      <Link className="btn" href="/">Balik sa simula</Link>
    </main>
  );
}
