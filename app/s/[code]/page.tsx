import { Suspense } from "react";
import { Rate } from "./Rate";

async function Stall({ params }: { params: PageProps<"/s/[code]">["params"] }) {
  const { code } = await params;
  return <Rate code={code} />;
}

export default function StallPage(props: PageProps<"/s/[code]">) {
  return (
    <main className="wrap">
      <Suspense fallback={<p className="mute center" style={{ paddingTop: 48 }}>Sandali...</p>}>
        <Stall params={props.params} />
      </Suspense>
    </main>
  );
}
