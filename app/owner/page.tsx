import { Suspense } from "react";
import { currentOwner } from "@/src/auth/current";
import { Kapy } from "@/src/ui/Kapy";
import { PrivacyNote } from "@/src/ui/PrivacyNote";
import { SignIn } from "../SignIn";
import { HomeDash } from "../HomeDash";
import { MarkOwner, RoleSwitch } from "../RoleSwitch";

// A signed-in owner gets a way back to the stall instead of the sign-in form.
async function OwnerEntry() {
  if (!(await currentOwner())) return <SignIn />;
  return (
    <div className="stack">
      <MarkOwner />
      <HomeDash />
      <a className="btn block" href="/o">Open my stall</a>
    </div>
  );
}

export default function OwnerHome() {
  return (
    <main id="main" className="wrap stack" style={{ paddingTop: 16 }}>
      <div className="hero">
        <Kapy pose="wave" size={108} anim="bob" />
        <div>
          <h1>KapyBa</h1>
          <p>Know what sells. Cook just enough.</p>
        </div>
      </div>
      <Suspense fallback={null}>
        <OwnerEntry />
      </Suspense>
      <PrivacyNote />
      <RoleSwitch to="buyer" />
      <p className="mute">Customer? Scan the QR at the stall to rate a dish. No account needed. <a href="/privacy">Privacy</a></p>
    </main>
  );
}
