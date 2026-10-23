import { Suspense } from "react";
import { redirect } from "next/navigation";
import { currentOwner } from "@/src/auth/current";
import { Review } from "./Review";

async function Gate() {
  if (!(await currentOwner())) redirect("/owner");
  return <Review />;
}

export default function ReviewPage() {
  return (
    <main id="main" className="wrap">
      <Suspense fallback={<p className="mute center" style={{ paddingTop: 48 }}>Sandali...</p>}>
        <Gate />
      </Suspense>
    </main>
  );
}
