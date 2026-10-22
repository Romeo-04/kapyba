import { Capybara } from "@/src/ui/Capybara";
import { PrivacyNote } from "@/src/ui/PrivacyNote";
import { SignIn } from "./SignIn";

export default function Home() {
  return (
    <main id="main" className="wrap stack" style={{ paddingTop: 16 }}>
      <div className="hero">
        <Capybara mood="happy" size={88} />
        <div>
          <h1>KapyBa</h1>
          <p>Alamin kung aling ulam ang bumebenta. Know which dishes customers love, and cook what sells.</p>
        </div>
      </div>
      <SignIn />
      <PrivacyNote />
      <p><a href="/ulam">Browse the Ulam board</a> · <a href="/privacy">Privacy</a></p>
      <p className="mute">Customer? Scan the QR at the stall to rate a dish. No account needed.</p>
    </main>
  );
}
