import { Suspense } from "react";
import { StallProfile } from "../../StallProfile";

async function Stall({ params }: { params: PageProps<"/ulam/stall/[id]">["params"] }) {
  const { id } = await params;
  return <StallProfile id={id} />;
}

export default function StallPage(props: PageProps<"/ulam/stall/[id]">) {
  return (
    <main id="main" className="wrap">
      <Suspense fallback={<p className="mute center" style={{ paddingTop: 48 }}>Sandali...</p>}>
        <Stall params={props.params} />
      </Suspense>
    </main>
  );
}
