import { Suspense } from "react";
import { redirect } from "next/navigation";
import { currentOwner } from "@/src/auth/current";
import { Owner } from "./Owner";
import { MarkOwner } from "../RoleSwitch";

// The session cookie is read at request time, so it sits inside Suspense (cacheComponents is on).
async function Gate() {
  if (!(await currentOwner())) redirect("/owner");
  return <><MarkOwner /><Owner /></>;
}

export default function OwnerPage() {
  return (
    <main id="main" className="wrap">
      <Suspense fallback={<p className="mute center" style={{ paddingTop: 48 }}>Sandali...</p>}>
        <Gate />
      </Suspense>
    </main>
  );
}
