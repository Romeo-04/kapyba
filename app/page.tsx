import { Suspense } from "react";
import { currentOwner } from "@/src/auth/current";
import { Capybara } from "@/src/ui/Capybara";
import { PrivacyNote } from "@/src/ui/PrivacyNote";
import { SignIn } from "./SignIn";

// A signed-in owner gets a way back to the stall instead of the sign-in form.
async function OwnerEntry() {
  if (!(await currentOwner())) return <SignIn />;
  return (
    <div className="card stack">
      <h2>Welcome back</h2>
      <a className="btn block" href="/o">Open my stall</a>
    </div>
  );
}

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
      <Suspense fallback={null}>
        <OwnerEntry />
      </Suspense>
      <PrivacyNote />
      <p><a href="/ulam">Browse the Ulam board</a> · <a href="/privacy">Privacy</a></p>
      <p className="mute">Customer? Scan the QR at the stall to rate a dish. No account needed.</p>
    </main>
  );
}
