import { SignIn } from "./SignIn";

export default function Home() {
  return (
    <main className="wrap stack" style={{ paddingTop: 48 }}>
      <h1>KapyBa</h1>
      <p>Alamin kung aling ulam ang bumebenta. Know which dishes customers love, and cook what sells.</p>
      <SignIn />
      <p><a href="/ulam">Browse the Ulam board</a></p>
      <p className="mute">Customer? Scan the QR at the stall to rate a dish. No account needed.</p>
    </main>
  );
}
